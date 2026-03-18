-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create campaigns table
CREATE TABLE IF NOT EXISTS campaigns (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  status TEXT DEFAULT 'draft' NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create leads table
CREATE TABLE IF NOT EXISTS leads (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  campaign_id UUID REFERENCES campaigns(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  company TEXT,
  website TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create emails table
CREATE TABLE IF NOT EXISTS emails (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  lead_id UUID REFERENCES leads(id) ON DELETE CASCADE NOT NULL,
  subject TEXT NOT NULL,
  body TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create credits table
CREATE TABLE IF NOT EXISTS credits (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE UNIQUE NOT NULL,
  total_credits INTEGER DEFAULT 10 NOT NULL,
  used_credits INTEGER DEFAULT 0 NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create subscriptions table
CREATE TABLE IF NOT EXISTS subscriptions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  plan TEXT NOT NULL,
  status TEXT NOT NULL,
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  current_period_end TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE emails ENABLE ROW LEVEL SECURITY;
ALTER TABLE credits ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own profile" ON users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update their own profile" ON users FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can view their own campaigns" ON campaigns FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own campaigns" ON campaigns FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own campaigns" ON campaigns FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own campaigns" ON campaigns FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can view leads of their campaigns" ON leads FOR SELECT USING (
  EXISTS (SELECT 1 FROM campaigns WHERE campaigns.id = leads.campaign_id AND campaigns.user_id = auth.uid())
);
CREATE POLICY "Users can insert leads into their campaigns" ON leads FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM campaigns WHERE campaigns.id = leads.campaign_id AND campaigns.user_id = auth.uid())
);

CREATE POLICY "Users can view emails of their leads" ON emails FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM leads 
    JOIN campaigns ON campaigns.id = leads.campaign_id 
    WHERE leads.id = emails.lead_id AND campaigns.user_id = auth.uid()
  )
);
CREATE POLICY "Users can insert emails for their leads" ON emails FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM leads 
    JOIN campaigns ON campaigns.id = leads.campaign_id 
    WHERE leads.id = emails.lead_id AND campaigns.user_id = auth.uid()
  )
);

CREATE POLICY "Users can view their own credits" ON credits FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can view their own subscriptions" ON subscriptions FOR SELECT USING (auth.uid() = user_id);

-- RPC for incrementing credits
CREATE OR REPLACE FUNCTION increment_used_credits(user_id_param UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE credits
  SET used_credits = used_credits + 1,
      updated_at = NOW()
  WHERE user_id = user_id_param;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Enable Realtime for emails table
-- Note: This requires the publication to exist, which it usually does in Supabase.
-- If it doesn't, you can create it: CREATE PUBLICATION supabase_realtime FOR TABLE emails;
BEGIN;
  DO $$
  BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime') THEN
      CREATE PUBLICATION supabase_realtime;
    END IF;
  END $$;
  ALTER PUBLICATION supabase_realtime ADD TABLE emails;
COMMIT;

-- Create generated_emails table for the standalone generator
CREATE TABLE IF NOT EXISTS generated_emails (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  lead_name TEXT NOT NULL,
  company TEXT NOT NULL,
  subject TEXT NOT NULL,
  email_body TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Enable RLS for generated_emails
ALTER TABLE generated_emails ENABLE ROW LEVEL SECURITY;

-- RLS Policies for generated_emails
CREATE POLICY "Users can view their own generated emails" ON generated_emails FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own generated emails" ON generated_emails FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete their own generated emails" ON generated_emails FOR DELETE USING (auth.uid() = user_id);

-- Trigger to create user profile and credits on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.users (id, email, full_name)
  VALUES (new.id, new.email, new.raw_user_meta_data->>'full_name');

  INSERT INTO public.credits (user_id, total_credits, used_credits)
  VALUES (new.id, 10, 0);

  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
