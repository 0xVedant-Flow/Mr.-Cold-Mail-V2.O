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

// Middleware
app.use(cors());
app.use(express.json({ limit: "50mb" }));

// --- API Routes ---
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// 1. Credits Check Middleware
const checkCredits = async (req: any, res: any, next: any) => {
  const { userId } = req.body;
  if (!userId) return res.status(401).json({ error: "Unauthorized" });

  const { data: credits, error } = await supabase
    .from("credits")
    .select("*")
    .eq("user_id", userId)
    .single();

  if (error || !credits) return res.status(404).json({ error: "Credits not found" });

  // Check subscription for unlimited
  const { data: sub } = await supabase
    .from("subscriptions")
    .select("plan")
    .eq("user_id", userId)
    .eq("status", "active")
    .single();

  if (sub?.plan === "agency") {
    return next();
  }

  if (credits.used_credits >= credits.total_credits) {
    return res.status(403).json({ error: "You’ve reached your free limit. Upgrade to continue." });
  }

  next();
};

// 2. Generate Email
app.post("/api/generate-email", checkCredits, async (req, res) => {
  const { userId, lead, campaignId, offer, tone, goal } = req.body;

  try {
    const prompt = `Write a highly personalized cold email.

Lead Name: ${lead.name}
Company: ${lead.company}
Website: ${lead.website}

User Offer: ${offer}
Tone: ${tone}
Goal: ${goal}

Rules:
- Short (100-150 words)
- Personalized intro
- Clear CTA
- Natural human tone`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" },
    });

    // Expecting JSON from GPT if possible, or parse text
    // For simplicity in this demo, we'll ask GPT for JSON in the system prompt if we were being strict
    // But let's just assume it returns text and we wrap it
    const content = completion.choices[0].message.content || "";
    
    // Save to DB
    const { data: emailData, error: emailError } = await supabase
      .from("emails")
      .insert({
        lead_id: lead.id,
        subject: `Quick thought for ${lead.company}`,
        body: content,
      })
      .select()
      .single();

    if (emailError) throw emailError;

    // Deduct credit
    await supabase.rpc("increment_used_credits", { user_id_param: userId });

    res.json({ success: true, email: emailData });
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ error: "OpenAI error: " + error.message });
  }
});

// 3. Upload CSV
app.post("/api/upload-csv", async (req, res) => {
  const { userId, campaignId, csvData } = req.body;

  try {
    const results = Papa.parse(csvData, { header: true });
    const leads = results.data.map((row: any) => ({
      campaign_id: campaignId,
      name: row.name,
      email: row.email,
      company: row.company,
      website: row.website,
    })).filter((l: any) => l.email && l.name);

    if (leads.length === 0) return res.status(400).json({ error: "Invalid CSV" });

    const { data, error } = await supabase.from("leads").insert(leads).select();
    if (error) throw error;

    res.json({ success: true, count: data.length });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// 4. Stripe Checkout
app.post("/api/stripe/checkout", async (req, res) => {
  const { userId, plan } = req.body;

  const priceIds: Record<string, string> = {
    starter: process.env.STRIPE_STARTER_PRICE_ID!,
    pro: process.env.STRIPE_PRO_PRICE_ID!,
    agency: process.env.STRIPE_AGENCY_PRICE_ID!,
  };

  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [{ price: priceIds[plan], quantity: 1 }],
      mode: "subscription",
      success_url: `${process.env.APP_URL}/dashboard?success=true`,
      cancel_url: `${process.env.APP_URL}/billing?canceled=true`,
      metadata: { userId, plan },
    });

    res.json({ url: session.url });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// 5. Stripe Webhook
app.post("/api/stripe/webhook", express.raw({ type: "application/json" }), async (req, res) => {
  const sig = req.headers["stripe-signature"] as string;

  let event;
  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch (err: any) {
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  const session = event.data.object as any;

  switch (event.type) {
    case "checkout.session.completed":
    case "invoice.paid":
      const userId = session.metadata?.userId;
      const plan = session.metadata?.plan;
      const stripeSubscriptionId = session.subscription;
      const stripeCustomerId = session.customer;

      if (userId && plan) {
        // Update subscription
        await supabase.from("subscriptions").upsert({
          user_id: userId,
          plan,
          status: "active",
          stripe_customer_id: stripeCustomerId,
          stripe_subscription_id: stripeSubscriptionId,
          current_period_end: new Date(session.current_period_end * 1000).toISOString(),
        });

        // Update credits
        let totalCredits = 10;
        if (plan === "starter") totalCredits = 500;
        if (plan === "pro") totalCredits = 2000;
        if (plan === "agency") totalCredits = 999999; // Unlimited logic

        await supabase.from("credits").update({
          total_credits: totalCredits,
          used_credits: 0,
        }).eq("user_id", userId);
      }
      break;

    case "customer.subscription.deleted":
      await supabase.from("subscriptions")
        .update({ status: "canceled" })
        .eq("stripe_subscription_id", session.id);
      break;
  }

  res.json({ received: true });
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
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
