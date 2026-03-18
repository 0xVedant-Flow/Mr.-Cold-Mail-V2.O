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

          // Update users table
          const { error } = await supabase
            .from("users")
            .update({
              plan: plan.split('_')[0], // pro or agency
              credits: credits,
              subscription_id: subscriptionId,
              status: "active"
            })
            .eq("id", userId);

          if (error) console.error("Error updating user after payment:", error);
          
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
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// 1. Credits Check Middleware
const checkCredits = async (req: any, res: any, next: any) => {
  const { userId } = req.body;
  if (!userId) return res.status(401).json({ error: "Unauthorized" });

  const { data: user, error } = await supabase
    .from("users")
    .select("credits, plan, status")
    .eq("id", userId)
    .single();

  if (error || !user) return res.status(404).json({ error: "User not found" });

  if (user.plan === "agency" && user.status === "active") {
    return next();
  }

  if (user.credits <= 0) {
    return res.status(403).json({ error: "You’ve reached your credit limit. Upgrade to continue." });
  }

  next();
};

const generateEmailSchema = z.object({
  userId: z.string().uuid(),
  leadName: z.string().min(1),
  company: z.string().min(1),
  website: z.string().optional(),
  offer: z.string().min(10),
  tone: z.string().default('Professional'),
  goal: z.string().default('Book a Meeting'),
});

// 2. Generate Email
app.post("/api/generate-email", checkCredits, async (req, res) => {
  const validation = generateEmailSchema.safeParse(req.body);
  if (!validation.success) {
    return res.status(400).json({ error: "Invalid request data", details: validation.error.format() });
  }

  const { userId, leadName, company, website, offer, tone, goal } = validation.data;

  try {
    const prompt = `You are a world-class cold email copywriter. Write 3 highly personalized, human-like cold email variations for the following:

Lead Name: ${leadName}
Company: ${company}
Website: ${website || "N/A"}

User Offer: ${offer}
Tone: ${tone}
Goal: ${goal}

RULES:
- Max 120 words per email.
- No generic lines like "I hope you're doing well".
- No buzzwords.
- Personalized intro based on company/insight.
- Soft CTA at the end.
- Return 3 variations.
- For EACH variation, also provide a unique subject line.

Return the response as a JSON object with this structure:
{
  "variations": [
    { "subject": "...", "body": "..." },
    { "subject": "...", "body": "..." },
    { "subject": "...", "body": "..." }
  ]
}`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: "You are a helpful assistant that outputs JSON." },
        { role: "user", content: prompt }
      ],
      response_format: { type: "json_object" },
    });

    const content = JSON.parse(completion.choices[0].message.content || "{}");
    const variations = content.variations || [];

    if (variations.length === 0) {
      throw new Error("Failed to generate email variations");
    }

    // Save the first variation to the history table (generated_emails)
    // In a real app, maybe save all or let user pick. For now, let's save the first one as a record.
    const { error: emailError } = await supabase
      .from("generated_emails")
      .insert({
        user_id: userId,
        lead_name: leadName,
        company: company,
        subject: variations[0].subject,
        email_body: variations[0].body,
      });

    if (emailError) console.error("Error saving to history:", emailError);

    // Deduct credit
    await supabase.rpc("deduct_user_credits", { user_id_param: userId });

    res.json({ success: true, variations });
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ error: "OpenAI error: " + error.message });
  }
});

const uploadCsvSchema = z.object({
  userId: z.string().uuid(),
  campaignId: z.string().uuid(),
  csvData: z.string().min(1),
});

// 3. Upload CSV
app.post("/api/upload-csv", async (req, res) => {
  const validation = uploadCsvSchema.safeParse(req.body);
  if (!validation.success) {
    return res.status(400).json({ error: "Invalid request data", details: validation.error.format() });
  }

  const { userId, campaignId, csvData } = validation.data;

  try {
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
      name: ['name', 'fullname', 'contactname', 'leadname', 'first_name', 'firstname'],
      email: ['email', 'emailaddress', 'contactemail', 'mail'],
      company: ['company', 'companyname', 'organization', 'org', 'business'],
      website: ['website', 'url', 'site', 'companywebsite', 'link', 'domain']
    };

    const leads = results.data.map((row: any) => {
      const mappedLead: any = { campaign_id: campaignId };
      const rowKeys = Object.keys(row);

      // Map each target field to the best matching column in the row
      for (const [target, aliases] of Object.entries(mappings)) {
        const foundKey = rowKeys.find(key => aliases.includes(key));
        if (foundKey) {
          mappedLead[target] = row[foundKey];
        }
      }

      return mappedLead;
    }).filter((l: any) => {
      // Basic validation: must have at least an email
      return l.email && l.email.includes('@');
    });

    if (leads.length === 0) {
      return res.status(400).json({ 
        error: "No valid leads found. Ensure your CSV has at least an 'email' column with valid email addresses." 
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

    res.json({ 
      success: true, 
      count: data.length,
      message: `Successfully uploaded ${data.length} leads.`
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
