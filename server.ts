import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import cors from "cors";
import dotenv from "dotenv";
import { createClient } from "@supabase/supabase-js";
import OpenAI from "openai";
import Stripe from "stripe";
import { z } from "zod";
import Papa from "papaparse";
import { google } from "googleapis";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

// Clients
const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.warn("Supabase credentials missing in server.ts");
}

const supabase = createClient(
  supabaseUrl || "https://placeholder.supabase.co",
  supabaseServiceKey || "placeholder-key"
);

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || "placeholder-key",
});

const stripeSecret = process.env.STRIPE_SECRET_KEY;
if (!stripeSecret) {
  console.warn("Stripe secret key missing in server.ts");
}

const stripe = new Stripe(stripeSecret || "sk_test_placeholder", {
  apiVersion: "2026-02-25.clover",
});

// Google OAuth Configuration
const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  `${process.env.APP_URL}/api/auth/google/callback`
);

const GMAIL_SCOPES = [
  'https://www.googleapis.com/auth/gmail.send',
  'https://www.googleapis.com/auth/userinfo.email',
];

// Helper: Get Gmail Client for User
async function getGmailClient(userId: string) {
  const { data: account, error } = await supabase
    .from("gmail_accounts")
    .select("*")
    .eq("user_id", userId)
    .single();

  if (error || !account) {
    throw new Error("Gmail account not connected");
  }

  const client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    `${process.env.APP_URL}/api/auth/google/callback`
  );

  client.setCredentials({
    access_token: account.access_token,
    refresh_token: account.refresh_token,
    expiry_date: Number(account.expiry_date),
  });

  // Check if token is expired and refresh if needed
  if (Date.now() >= Number(account.expiry_date)) {
    const { credentials } = await client.refreshAccessToken();
    client.setCredentials(credentials);

    // Update DB with new tokens
    await supabase
      .from("gmail_accounts")
      .update({
        access_token: credentials.access_token,
        expiry_date: credentials.expiry_date,
        // refresh_token might not be returned on refresh
        ...(credentials.refresh_token ? { refresh_token: credentials.refresh_token } : {}),
      })
      .eq("user_id", userId);
  }

  return google.gmail({ version: 'v1', auth: client });
}

// Middleware
app.use(cors());

// Admin Middleware
const isAdmin = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  const userId = req.headers['x-user-id'] as string;
  
  if (!userId) {
    return res.status(401).json({ error: 'Unauthorized: No User ID provided' });
  }

  const { data: user, error } = await supabase
    .from('users')
    .select('role')
    .eq('id', userId)
    .single();

  if (error || !user || user.role !== 'admin') {
    return res.status(403).json({ error: 'Forbidden: Admin access required' });
  }

  next();
};

// Webhook needs raw body - must be before express.json()
app.post("/api/webhook", express.raw({ type: "application/json" }), async (req, res) => {
  const sig = req.headers["stripe-signature"] as string;
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!webhookSecret) {
    console.error("STRIPE_WEBHOOK_SECRET is not set");
    return res.status(400).send("Webhook Secret missing");
  }

  let event;
  try {
    event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
  } catch (err: any) {
    console.error(`Webhook Error: ${err.message}`);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  const session = event.data.object as any;

  try {
    switch (event.type) {
      case "checkout.session.completed":
      case "invoice.payment_succeeded": {
        const userId = session.metadata?.userId;
        const plan = session.metadata?.plan;
        const subscriptionId = session.subscription;

        if (userId && plan) {
          // Determine credits based on plan
          let credits = 10;
          if (plan.includes('pro')) credits = 1000;
          if (plan.includes('agency')) credits = 5000;

          // Update users table for plan/status
          const { error: userUpdateError } = await supabase
            .from("users")
            .update({
              plan: plan.split('_')[0], // pro or agency
              subscription_id: subscriptionId,
              status: "active"
            })
            .eq("id", userId);

          if (userUpdateError) console.error("Error updating user after payment:", userUpdateError);

          // Update credits table
          const { error: creditsUpdateError } = await supabase
            .from("credits")
            .update({
              total_credits: credits,
              used_credits: 0,
              updated_at: new Date().toISOString()
            })
            .eq("user_id", userId);

          if (creditsUpdateError) console.error("Error updating credits after payment:", creditsUpdateError);
          
          // Also update subscriptions table for tracking
          await supabase.from("subscriptions").upsert({
            user_id: userId,
            plan: plan.split('_')[0],
            status: "active",
            stripe_subscription_id: subscriptionId,
            stripe_customer_id: session.customer,
          });
        }
        break;
      }

      case "customer.subscription.updated": {
        const subscriptionId = session.id;
        const status = session.status === 'active' ? 'active' : 'canceled';
        
        await supabase
          .from("users")
          .update({ status })
          .eq("subscription_id", subscriptionId);
          
        await supabase
          .from("subscriptions")
          .update({ status })
          .eq("stripe_subscription_id", subscriptionId);
        break;
      }

      case "customer.subscription.deleted": {
        const subscriptionId = session.id;
        await supabase
          .from("users")
          .update({ status: "canceled", plan: "free" })
          .eq("subscription_id", subscriptionId);
          
        await supabase
          .from("subscriptions")
          .update({ status: "canceled" })
          .eq("stripe_subscription_id", subscriptionId);
        break;
      }
    }
  } catch (error) {
    console.error("Error processing webhook event:", error);
  }

  res.json({ received: true });
});

app.use(express.json({ limit: "50mb" }));

// --- API Routes ---
app.get("/api/health", async (req, res) => {
  try {
    const { data, error } = await supabase.from("users").select("count").limit(1);
    if (error) throw error;
    res.json({ 
      status: "ok", 
      database: "connected",
      openai: !!process.env.OPENAI_API_KEY,
      supabase: !!process.env.VITE_SUPABASE_URL && !!process.env.SUPABASE_SERVICE_ROLE_KEY,
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    res.status(500).json({ 
      status: "error", 
      message: error.message,
      code: error.code,
      hint: "Database might not be initialized. Run the SQL setup in Supabase."
    });
  }
});

// 1. Credits Check Middleware
const checkCredits = async (req: any, res: any, next: any) => {
  const { userId } = req.body;
  
  // If no userId, allow as guest for now (as requested)
  if (!userId) {
    console.log("Guest generation requested");
    return next();
  }

  // Basic UUID validation to prevent DB errors
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (!uuidRegex.test(userId)) {
    console.warn(`Invalid userId format: ${userId}`);
    return res.status(400).json({ error: "Invalid user ID format" });
  }

  // Get user plan and status
  let { data: user, error: userError } = await supabase
    .from("users")
    .select("plan, status")
    .eq("id", userId)
    .single();

  // If user not found in public.users, they might be a new user who bypassed the trigger
  if (userError || !user) {
    // If it's a real error (not just "not found"), log it
    if (userError && userError.code !== 'PGRST116') {
      console.error("Error fetching user from public.users:", {
        message: userError.message,
        code: userError.code,
        details: userError.details,
        userId
      });
    }

    console.log(`User ${userId} not found in public.users, attempting to create...`);
    
    // Get user info from Auth using service role
    const { data: { user: authUser }, error: authError } = await supabase.auth.admin.getUserById(userId);
    
    if (authError) {
      if (authError.status === 404) {
        return res.status(404).json({ error: "User not found in Auth" });
      }
      console.error("Auth admin error:", {
        message: authError.message,
        status: authError.status,
        userId
      });
      return res.status(500).json({ error: "Authentication system error" });
    }

    if (!authUser) {
      return res.status(404).json({ error: "User not found in Auth system" });
    }

    // Create the user record using upsert to be safe
    const userEmail = authUser.email || `user-${userId}@placeholder.com`;
    console.log(`Upserting user ${userId} with email ${userEmail}...`);
    
    const userData = {
      id: userId,
      email: userEmail,
      full_name: authUser.user_metadata?.full_name || authUser.user_metadata?.name || '',
      avatar_url: authUser.user_metadata?.avatar_url || authUser.user_metadata?.picture || '',
      plan: 'free',
      status: 'active',
      role: 'user',
      updated_at: new Date().toISOString()
    };

    console.log(`Attempting upsert for user ${userId}...`);
    let { data: newUser, error: createError } = await supabase
      .from("users")
      .upsert(userData, { onConflict: 'id' })
      .select()
      .single();

    if (createError) {
      console.warn("Primary upsert failed, trying minimal upsert...", createError.message);
      // Minimal upsert in case of schema mismatch
      const { data: minimalUser, error: minimalError } = await supabase
        .from("users")
        .upsert({
          id: userId,
          email: userEmail,
          plan: 'free',
          status: 'active',
          role: 'user'
        }, { onConflict: 'id' })
        .select()
        .single();
        
      if (minimalError) {
        console.error("Minimal upsert also failed:", minimalError.message);
        createError = minimalError;
      } else {
        console.log("Minimal upsert successful.");
        newUser = minimalUser;
        createError = null;
      }
    }

    if (createError) {
      console.error("Detailed Error creating user record:", {
        message: createError.message,
        code: createError.code,
        details: createError.details,
        hint: createError.hint,
        userId,
        email: userEmail
      });
      
      // Fallback: Try to fetch again in case it was created by a trigger in the meantime
      const { data: fallbackUser, error: fallbackError } = await supabase
        .from("users")
        .select("plan, status")
        .eq("id", userId)
        .single();
        
      if (!fallbackError && fallbackUser) {
        console.log("Fallback: User record found after failed upsert.");
        user = fallbackUser;
      } else {
        return res.status(500).json({ 
          error: "Failed to initialize user profile",
          details: createError.message,
          code: createError.code,
          hint: "Ensure you have run the database setup SQL in the Supabase SQL Editor."
        });
      }
    } else {
      user = newUser;
    }

    // Also create/update credits record if we successfully have a user
    if (user) {
      const { error: creditsUpsertError } = await supabase.from("credits").upsert({
        user_id: userId,
        total_credits: 10,
        used_credits: 0,
        updated_at: new Date().toISOString()
      }, { onConflict: 'user_id' });

      if (creditsUpsertError) {
        console.error("Error creating credits record:", {
          message: creditsUpsertError.message,
          code: creditsUpsertError.code,
          details: creditsUpsertError.details,
          userId
        });
      }
    }
  }

  if (user && user.status !== 'active') {
    return res.status(403).json({ error: "Your account is currently inactive. Please contact support." });
  }

  // Get user credits
  const { data: credits, error: creditsError } = await supabase
    .from("credits")
    .select("total_credits, used_credits")
    .eq("user_id", userId)
    .single();

  if (creditsError || !credits) {
    // Create credits if missing
    await supabase.from("credits").upsert({
      user_id: userId,
      total_credits: 10,
      used_credits: 0
    });
    return next();
  }

  if (user && user.plan === "agency" && user.status === "active") {
    return next();
  }

  const remainingCredits = credits.total_credits - credits.used_credits;
  if (remainingCredits <= 0) {
    return res.status(403).json({ error: "You’ve reached your credit limit. Upgrade to continue." });
  }

  next();
};

const generateEmailSchema = z.object({
  userId: z.string().uuid().optional(),
  leadName: z.string().min(1),
  company: z.string().min(1),
  website: z.string().optional(),
  offer: z.string().min(10),
  tone: z.string().default('Professional'),
  goal: z.string().default('Book a Meeting'),
  leadId: z.string().uuid().optional(),
});

// 2. Generate Email
app.post("/api/generate-email", checkCredits, async (req, res) => {
  const validation = generateEmailSchema.safeParse(req.body);
  if (!validation.success) {
    return res.status(400).json({ error: "Invalid request data", details: validation.error.format() });
  }

  const { userId, leadName, company, website, offer, tone, goal, leadId } = validation.data;

  try {
    console.log(`Generating email for ${leadName} at ${company}...`);
    const prompt = `You are a world-class SaaS founder and senior AI engineer at "Mr. Cold Mail".
Your mission is to write a short, high-impact, hyper-personalized cold email that feels like a 1-to-1 message from a peer.

Recipient: ${leadName}
Company: ${company}
Website Context: ${website || "Not provided"}
Our Unique Offer: ${offer}

Goal: ${goal}
Tone: ${tone} (Conversational, authentic, and direct. NO corporate jargon.)

STRICT WRITING GUIDELINES:
1. THE HOOK: Start with a specific observation about their company or role. Avoid "I saw your website". Be more insightful.
2. NO ROBOTIC FILLERS: Absolutely NO "I hope this finds you well", "My name is...", or "I'm reaching out because...".
3. BREVITY IS KING: Keep it between 75-110 words. Every word must earn its place.
4. HUMAN RHYTHM: Use varied sentence structures. Some short. Some slightly longer. Use contractions (don't, we're) to sound natural.
5. THE CTA: Use a low-friction, open-ended question (e.g., "Worth a quick chat next week?" or "Open to seeing how this works?").
6. PERSONA: You are a busy but helpful expert. You aren't "selling"; you're offering a specific solution to a problem they likely have.
7. VARIATIONS: Each variation must have a distinct angle (e.g., one focused on speed, one on ROI, one on simplicity).

Output Format (JSON ONLY):
{
  "variations": [
    { "subject": "Specific, intriguing subject line", "body": "The email body..." },
    { "subject": "...", "body": "..." },
    { "subject": "...", "body": "..." }
  ]
}`;

    console.log("Calling OpenAI with model gpt-4o-mini...");
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: "You are a world-class cold email copywriter. You output ONLY valid JSON in the specified format." },
        { role: "user", content: prompt }
      ],
      response_format: { type: "json_object" },
    });

    const rawContent = completion.choices[0].message.content;
    console.log("OpenAI raw response received. Length:", rawContent?.length);
    
    if (!rawContent) {
      console.error("OpenAI returned an empty response.");
      throw new Error("OpenAI returned an empty response");
    }

    let content;
    try {
      content = JSON.parse(rawContent);
    } catch (parseError: any) {
      console.error("Error parsing OpenAI response:", parseError.message);
      console.error("Raw content that failed parsing:", rawContent);
      throw new Error("Failed to parse AI response: " + parseError.message);
    }
    
    console.log("Parsed variations from OpenAI content:", !!content.variations);
    if (content.variations) {
      console.log("Number of variations:", content.variations.length);
    }
    const variations = content.variations || [];

    if (variations.length === 0) {
      throw new Error("Failed to generate email variations");
    }

    // Save to history if user is logged in
    if (userId) {
      const { error: emailError } = await supabase
        .from("generated_emails")
        .insert({
          user_id: userId,
          lead_name: leadName,
          company: company,
          subject: variations[0].subject,
          email_body: variations[0].body,
          tone,
          goal,
          lead_id: leadId
        });

      if (emailError) console.error("Error saving to history:", emailError);

      // Also save to emails table if leadId is provided (for campaign updates)
      if (leadId) {
        await supabase.from("emails").insert({
          lead_id: leadId,
          subject: variations[0].subject,
          body: variations[0].body,
        });
      }

      // Deduct credit using the correct RPC name from schema
      await supabase.rpc("increment_used_credits", { user_id_param: userId });
    }

    res.json({ success: true, variations });
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ error: "OpenAI error: " + error.message });
  }
});

const bulkGenerateSchema = z.object({
  userId: z.string().uuid().optional(),
  campaignId: z.string().uuid(),
  offer: z.string().min(10),
  tone: z.string().default('Professional'),
  goal: z.string().default('Book a Meeting'),
});

// 2b. Bulk Generate Emails
app.post("/api/bulk-generate", checkCredits, async (req, res) => {
  const validation = bulkGenerateSchema.safeParse(req.body);
  if (!validation.success) {
    return res.status(400).json({ error: "Invalid request data", details: validation.error.format() });
  }

  const { userId, campaignId, offer, tone, goal } = validation.data;

  try {
    // We trigger it and return success immediately, or await it?
    // The frontend expects a success response.
    // Since it might take a while, we can run it in background or await if we want to show results.
    // The previous implementation awaited it.
    
    await generateEmailsForCampaign(userId, campaignId, offer, tone, goal);

    res.json({ success: true, message: "Bulk generation completed" });
  } catch (error: any) {
    console.error("Bulk Generate Error:", error);
    res.status(500).json({ error: error.message });
  }
});

const uploadCsvSchema = z.object({
  userId: z.string().uuid(),
  campaignId: z.string().uuid(),
  csvData: z.string().min(1),
  offer: z.string().optional(),
  tone: z.string().optional(),
  goal: z.string().optional(),
});

// Helper function for bulk generation
async function generateEmailsForCampaign(userId: string, campaignId: string, offer: string, tone: string, goal: string) {
  try {
    // 1. Get leads for this campaign
    const { data: leads, error: leadsError } = await supabase
      .from("leads")
      .select("*")
      .eq("campaign_id", campaignId);

    if (leadsError || !leads || leads.length === 0) {
      console.error("No leads found for campaign:", campaignId);
      return;
    }

    // 2. Check if user has enough credits
    const { data: credits, error: creditsError } = await supabase
      .from("credits")
      .select("total_credits, used_credits")
      .eq("user_id", userId)
      .single();

    if (creditsError || !credits) {
      console.error("Credits not found for user:", userId);
      return;
    }

    const remainingCredits = credits.total_credits - credits.used_credits;
    const leadsToProcess = Math.min(leads.length, remainingCredits);

    if (leadsToProcess <= 0) {
      console.error("Not enough credits for user:", userId);
      return;
    }

    // 3. Generate emails in parallel
    const batchSize = 5;
    for (let i = 0; i < leadsToProcess; i += batchSize) {
      const batch = leads.slice(i, i + batchSize);
      const batchPromises = batch.map(async (lead) => {
        try {
          const prompt = `Write a hyper-personalized, high-converting cold email.
Recipient: ${lead.name}
Company: ${lead.company}
Website: ${lead.website || "N/A"}
Our Offer: ${offer}
Goal: ${goal}
Tone: ${tone}

Rules:
- Start with a unique hook about ${lead.company}
- No "I hope you're well" or robotic intros
- Word count: 80-110 words
- Natural, conversational flow
- Low-friction CTA

Return JSON: { "subject": "...", "body": "..." }`;

          const completion = await openai.chat.completions.create({
            model: "gpt-4o",
            messages: [
              { role: "system", content: "You are a world-class cold email copywriter. Output JSON." },
              { role: "user", content: prompt }
            ],
            response_format: { type: "json_object" },
          });

          const content = JSON.parse(completion.choices[0].message.content || "{}");
          
          // Save to emails table (this is what the campaign page listens to)
          await supabase.from("emails").insert({
            lead_id: lead.id,
            subject: content.subject,
            body: content.body,
          });

          // Also save to generated_emails for history
          await supabase.from("generated_emails").insert({
            user_id: userId,
            lead_name: lead.name,
            company: lead.company,
            subject: content.subject,
            email_body: content.body,
            lead_id: lead.id,
            tone: tone,
            goal: goal
          });

          // Deduct credit
          await supabase.rpc("increment_used_credits", { user_id_param: userId });

        } catch (err) {
          console.error(`Error generating for lead ${lead.id}:`, err);
        }
      });

      await Promise.all(batchPromises);
    }
  } catch (error) {
    console.error("Background Generation Error:", error);
  }
}

// 3. Upload CSV
app.post("/api/upload-csv", async (req, res) => {
  const validation = uploadCsvSchema.safeParse(req.body);
  if (!validation.success) {
    return res.status(400).json({ error: "Invalid request data", details: validation.error.format() });
  }

  const { userId, campaignId, csvData, offer, tone, goal } = validation.data;

  try {
    // Update campaign with offer, tone, goal if provided (wrap in try-catch in case columns are missing)
    try {
      if (offer || tone || goal) {
        await supabase.from("campaigns").update({
          offer,
          tone,
          goal
        }).eq("id", campaignId);
      }
    } catch (err) {
      console.warn("Failed to update campaign metadata (possibly missing columns):", err);
    }

    // Parse CSV with PapaParse
    const results = Papa.parse(csvData, { 
      header: true,
      skipEmptyLines: 'greedy',
      transformHeader: (header) => header.toLowerCase().trim().replace(/[\s_-]/g, '')
    });

    if (results.errors.length > 0) {
      return res.status(400).json({ error: "CSV Parsing Error", details: results.errors });
    }

    // Dynamic Column Mapping
    const mappings = {
      name: ['name', 'fullname', 'contactname', 'leadname', 'first_name', 'firstname', 'person'],
      email: ['email', 'emailaddress', 'contactemail', 'mail', 'e-mail'],
      company: ['company', 'companyname', 'organization', 'org', 'business', 'employer'],
      website: ['website', 'url', 'site', 'companywebsite', 'link', 'domain', 'web']
    };

    const leads = results.data.map((row: any) => {
      const mappedLead: any = { campaign_id: campaignId };
      const rowKeys = Object.keys(row).map(k => k.toLowerCase().trim().replace(/[\s_-]/g, ''));
      const originalKeys = Object.keys(row);

      // Map each target field to the best matching column in the row
      for (const [target, aliases] of Object.entries(mappings)) {
        const foundIndex = rowKeys.findIndex(key => aliases.includes(key));
        if (foundIndex !== -1) {
          mappedLead[target] = row[originalKeys[foundIndex]];
        }
      }

      return mappedLead;
    }).filter((l: any) => {
      // Basic validation: must have at least an email and a name
      return l.email && l.email.includes('@') && l.name;
    });

    if (leads.length === 0) {
      return res.status(400).json({ 
        error: "No valid leads found. Ensure your CSV has 'name' and 'email' columns with valid data." 
      });
    }

    // Batch insert leads
    const { data, error } = await supabase.from("leads").insert(leads).select();
    
    if (error) {
      console.error("Supabase Insert Error:", error);
      if (error.code === 'PGRST116' || error.message.includes('schema cache')) {
        return res.status(500).json({ 
          error: "Database table 'leads' not found. Please ensure you have run the database migrations.",
          code: "MISSING_TABLE"
        });
      }
      throw error;
    }

    // Trigger background generation
    if (offer && tone && goal) {
      generateEmailsForCampaign(userId, campaignId, offer, tone, goal);
    }

    res.json({ 
      success: true, 
      count: data.length,
      message: `Successfully uploaded ${data.length} leads. Email generation started in background.`
    });
  } catch (error: any) {
    console.error("Upload CSV Error:", error);
    res.status(500).json({ error: error.message });
  }
});

// 4. Send Email (Simulated)
app.post("/api/send-email", async (req, res) => {
  const { emailId, userId } = req.body;
  if (!emailId || !userId) return res.status(400).json({ error: "Missing emailId or userId" });

  try {
    // In a real app, you'd use Resend, SendGrid, etc. here.
    // For this demo, we'll just mark it as sent in the DB if we had a status field.
    // Since we don't have a status field in the emails table, we'll just return success.
    
    // Simulate delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    res.json({ success: true, message: "Email sent successfully!" });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// 4b. Send Email via Gmail
app.post("/api/send-email-gmail", async (req, res) => {
  const { userId, leadId, subject, body, recipientEmail } = req.body;

  if (!userId || !subject || !body || !recipientEmail) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
    const gmail = await getGmailClient(userId);

    // Construct raw email
    const utf8Subject = `=?utf-8?B?${Buffer.from(subject).toString('base64')}?=`;
    const messageParts = [
      `To: ${recipientEmail}`,
      'Content-Type: text/html; charset=utf-8',
      'MIME-Version: 1.0',
      `Subject: ${utf8Subject}`,
      '',
      body,
    ];
    const message = messageParts.join('\n');

    // The body needs to be base64url encoded.
    const encodedMessage = Buffer.from(message)
      .toString('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');

    await gmail.users.messages.send({
      userId: 'me',
      requestBody: {
        raw: encodedMessage,
      },
    });

    // Track sent email
    await supabase.from("sent_emails").insert({
      user_id: userId,
      lead_id: leadId,
      subject,
      body,
      recipient_email: recipientEmail,
      status: 'sent'
    });

    res.json({ success: true, message: "Email sent via Gmail!" });
  } catch (error: any) {
    console.error("Gmail Send Error:", error);
    
    // Track failed email
    await supabase.from("sent_emails").insert({
      user_id: userId,
      lead_id: leadId,
      subject,
      body,
      recipient_email: recipientEmail,
      status: 'failed',
      error_message: error.message
    });

    res.status(500).json({ error: error.message });
  }
});

// 4c. Google Auth Routes
app.post("/api/auth/google/disconnect", async (req, res) => {
  const { userId } = req.body;
  if (!userId) return res.status(400).json({ error: "Missing userId" });

  try {
    const { error } = await supabase
      .from("gmail_accounts")
      .delete()
      .eq("user_id", userId);

    if (error) throw error;
    res.json({ success: true, message: "Gmail disconnected" });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.get("/api/auth/google/url", (req, res) => {
  const { state } = req.query;
  const url = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: GMAIL_SCOPES,
    prompt: 'consent', // Force consent to ensure we get a refresh token
    state: state as string,
  });
  res.json({ url });
});

app.get("/api/auth/google/callback", async (req, res) => {
  const { code } = req.query;
  if (!code) return res.status(400).send("Missing code");

  try {
    const { tokens } = await oauth2Client.getToken(code as string);
    oauth2Client.setCredentials(tokens);

    // Get user's email
    const oauth2 = google.oauth2({ version: 'v2', auth: oauth2Client });
    const userInfo = await oauth2.userinfo.get();
    const gmailEmail = userInfo.data.email;

    // We need the userId to store this. 
    // In a real app, we'd have a session or state.
    // For this environment, we'll use a temporary state or ask the user to provide it.
    // However, since we are in a popup, we can't easily get the userId from the parent without state.
    // Let's assume the state parameter contains the userId.
    const userId = req.query.state as string;

    if (!userId || !gmailEmail || !tokens.access_token || !tokens.refresh_token || !tokens.expiry_date) {
      throw new Error("Missing required token data");
    }

    // Store in DB
    const { error } = await supabase
      .from("gmail_accounts")
      .upsert({
        user_id: userId,
        email: gmailEmail,
        access_token: tokens.access_token,
        refresh_token: tokens.refresh_token,
        expiry_date: tokens.expiry_date,
      }, { onConflict: 'user_id' });

    if (error) throw error;

    // Success response with postMessage script
    res.send(`
      <html>
        <body>
          <script>
            if (window.opener) {
              window.opener.postMessage({ type: 'GMAIL_AUTH_SUCCESS', email: '${gmailEmail}' }, '*');
              window.close();
            } else {
              window.location.href = '/dashboard';
            }
          </script>
          <p>Gmail connected successfully! You can close this window.</p>
        </body>
      </html>
    `);
  } catch (error: any) {
    console.error("Google Auth Callback Error:", error);
    res.status(500).send("Authentication failed: " + error.message);
  }
});

// 5. Create Checkout Session
app.post("/api/create-checkout-session", async (req, res) => {
  const { userId, planId } = req.body;

  if (!userId || !planId) {
    return res.status(400).json({ error: "Missing userId or planId" });
  }

  // Map planId to Price IDs from environment variables
  const priceMap: Record<string, string | undefined> = {
    'pro_monthly': process.env.STRIPE_PRO_MONTHLY_PRICE_ID,
    'pro_yearly': process.env.STRIPE_PRO_YEARLY_PRICE_ID,
    'agency_monthly': process.env.STRIPE_AGENCY_MONTHLY_PRICE_ID,
    'agency_yearly': process.env.STRIPE_AGENCY_YEARLY_PRICE_ID,
  };

  let priceId = priceMap[planId];

  if (!priceId) {
    return res.status(400).json({ error: `Invalid planId or Price ID not configured: ${planId}` });
  }

  try {
    // If the ID provided is a Product ID (starts with prod_), resolve its default price
    if (priceId.startsWith('prod_')) {
      console.log(`Resolving default price for product: ${priceId}`);
      const product = await stripe.products.retrieve(priceId);
      const defaultPriceId = typeof product.default_price === 'string' 
        ? product.default_price 
        : (product.default_price as any)?.id;
      
      if (!defaultPriceId) {
        return res.status(400).json({ error: `Product ${priceId} has no default price configured.` });
      }
      priceId = defaultPriceId;
    }

    const { data: user } = await supabase.from("users").select("email").eq("id", userId).single();

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [{ price: priceId, quantity: 1 }],
      mode: "subscription",
      customer_email: user?.email,
      success_url: `${process.env.APP_URL}/dashboard?success=true`,
      cancel_url: `${process.env.APP_URL}/billing?canceled=true`,
      metadata: { userId, plan: planId },
    });

    res.json({ url: session.url });
  } catch (error: any) {
    console.error("Stripe Checkout Error:", error);
    res.status(500).json({ error: error.message });
  }
});

// 6. Cancel Subscription
app.post("/api/cancel-subscription", async (req, res) => {
  const { userId } = req.body;
  if (!userId) return res.status(400).json({ error: "Missing userId" });

  try {
    const { data: user, error: userError } = await supabase
      .from("users")
      .select("subscription_id")
      .eq("id", userId)
      .single();

    if (userError || !user?.subscription_id) {
      return res.status(404).json({ error: "No active subscription found" });
    }

    // Cancel at period end
    await stripe.subscriptions.update(user.subscription_id, {
      cancel_at_period_end: true,
    });

    // Update DB
    await supabase
      .from("users")
      .update({ status: "canceled" })
      .eq("id", userId);

    res.json({ success: true, message: "Subscription will be canceled at the end of the period." });
  } catch (error: any) {
    console.error("Stripe Cancel Error:", error);
    res.status(500).json({ error: error.message });
  }
});

// 7. Delete Account
app.post("/api/delete-account", async (req, res) => {
  const { userId } = req.body;
  if (!userId) return res.status(400).json({ error: "Missing userId" });

  try {
    // 1. Cancel Stripe subscription if exists
    const { data: user } = await supabase
      .from("users")
      .select("subscription_id")
      .eq("id", userId)
      .single();

    if (user?.subscription_id) {
      try {
        await stripe.subscriptions.cancel(user.subscription_id);
      } catch (e) {
        console.warn("Could not cancel stripe subscription during account deletion:", e);
      }
    }

    // 2. Delete from Gmail accounts
    await supabase.from("gmail_accounts").delete().eq("user_id", userId);

    // 3. Delete from users table (cascading should handle other tables if set up, but let's be explicit if needed)
    // Assuming cascading deletes are set up in Supabase for campaigns, leads, etc.
    await supabase.from("users").delete().eq("id", userId);

    // 4. Delete from Supabase Auth (requires service role key)
    const { error: authError } = await supabase.auth.admin.deleteUser(userId);
    if (authError) throw authError;

    res.json({ success: true, message: "Account deleted successfully" });
  } catch (error: any) {
    console.error("Delete Account Error:", error);
    res.status(500).json({ error: error.message });
  }
});

// --- Admin API Routes ---

// Helper to log admin actions
const logAdminAction = async (adminId: string, action: string, targetUserId: string | null, details: any) => {
  await supabase.from('admin_logs').insert({
    admin_id: adminId,
    action,
    target_user_id: targetUserId,
    details
  });
};

// 1. Dashboard Stats
app.get("/api/admin/stats", isAdmin, async (req, res) => {
  try {
    const { data: totalUsers } = await supabase.from('users').select('id', { count: 'exact' });
    const { data: activeSubs } = await supabase.from('subscriptions').select('id', { count: 'exact' }).eq('status', 'active');
    
    // Monthly Revenue (sum of successful payments in last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const { data: recentPayments } = await supabase
      .from('subscriptions')
      .select('plan, created_at')
      .gte('created_at', thirtyDaysAgo.toISOString());

    // Mock revenue calculation based on plans (since we don't have a payments table yet, we use subscriptions)
    let revenue = 0;
    recentPayments?.forEach(p => {
      if (p.plan.includes('pro')) revenue += 29;
      if (p.plan.includes('agency')) revenue += 99;
    });

    // Emails generated today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const { count: emailsToday } = await supabase
      .from('generated_emails')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', today.toISOString());

    res.json({
      totalUsers: totalUsers?.length || 0,
      activeSubscriptions: activeSubs?.length || 0,
      monthlyRevenue: revenue,
      emailsGeneratedToday: emailsToday || 0
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// 2. User Management
app.get("/api/admin/users", isAdmin, async (req, res) => {
  try {
    const { data: users, error } = await supabase
      .from('users')
      .select('*, credits(total_credits, used_credits)')
      .order('created_at', { ascending: false });

    if (error) throw error;
    res.json(users);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.put("/api/admin/users/:id", isAdmin, async (req, res) => {
  const { id } = req.params;
  const updates = req.body;
  const adminId = req.headers['x-user-id'] as string;

  try {
    const { error } = await supabase.from('users').update(updates).eq('id', id);
    if (error) throw error;

    await logAdminAction(adminId, 'user_updated', id, updates);
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/admin/users/:id/credits", isAdmin, async (req, res) => {
  const { id } = req.params;
  const { amount, action } = req.body; // action: 'add', 'reset'
  const adminId = req.headers['x-user-id'] as string;

  try {
    if (action === 'reset') {
      await supabase.from('credits').update({ used_credits: 0 }).eq('user_id', id);
    } else {
      const { data: current } = await supabase.from('credits').select('total_credits').eq('user_id', id).single();
      await supabase.from('credits').update({ total_credits: (current?.total_credits || 0) + amount }).eq('user_id', id);
    }

    await logAdminAction(adminId, `credits_${action}`, id, { amount });
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// 3. Plans Management
app.get("/api/admin/plans", isAdmin, async (req, res) => {
  try {
    const { data, error } = await supabase.from('plans').select('*');
    if (error) throw error;
    res.json(data);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/admin/plans", isAdmin, async (req, res) => {
  const plan = req.body;
  const adminId = req.headers['x-user-id'] as string;
  try {
    const { data, error } = await supabase.from('plans').insert(plan).select().single();
    if (error) throw error;
    await logAdminAction(adminId, 'plan_created', null, plan);
    res.json(data);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// 4. Templates Management
app.get("/api/admin/templates", isAdmin, async (req, res) => {
  try {
    const { data, error } = await supabase.from('email_templates').select('*');
    if (error) throw error;
    res.json(data);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/admin/templates", isAdmin, async (req, res) => {
  const template = req.body;
  const adminId = req.headers['x-user-id'] as string;
  try {
    const { data, error } = await supabase.from('email_templates').insert(template).select().single();
    if (error) throw error;
    await logAdminAction(adminId, 'template_created', null, template);
    res.json(data);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// 5. Admin Logs
app.get("/api/admin/logs", isAdmin, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('admin_logs')
      .select('*, admin:users!admin_id(email), target:users!target_user_id(email)')
      .order('created_at', { ascending: false });
    if (error) throw error;
    res.json(data);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// --- Vite Integration ---

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
  }

  // SPA fallback
  app.get("*", (req, res, next) => {
    if (req.path.startsWith('/api')) return next();
    
    if (process.env.NODE_ENV === "production") {
      const distPath = path.join(process.cwd(), "dist");
      res.sendFile(path.join(distPath, "index.html"));
    } else {
      // In development, Vite's middlewareMode handles SPA fallback automatically
      // if it's reached this point, it means Vite didn't handle it, 
      // which usually shouldn't happen for SPA routes.
      next();
    }
  });

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
