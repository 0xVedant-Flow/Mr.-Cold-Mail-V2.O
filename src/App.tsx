import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/Layout';
import { LandingPage } from './pages/LandingPage';
import { Login } from './pages/Login';
import { Signup } from './pages/Signup';
import { AuthCallback } from './pages/AuthCallback';
import { Dashboard } from './pages/Dashboard';
import { Campaigns } from './pages/Campaigns';
import { CreateCampaign } from './pages/CreateCampaign';
import { EmailEditor } from './pages/EmailEditor';
import { Templates } from './pages/Templates';
import { Analytics } from './pages/Analytics';
import { Settings } from './pages/Settings';
import { Billing } from './pages/Billing';
import { Generator } from './pages/Generator';
import { Leads } from './pages/Leads';
import AdminLayout from './components/admin/AdminLayout';
import AdminDashboard from './pages/admin/Dashboard';
import AdminUsers from './pages/admin/Users';
import AdminLogs from './pages/admin/Logs';
import { 
  AdminSubscriptions, 
  AdminPlans, 
  AdminUsage, 
  AdminTemplates, 
  AdminSettings 
} from './pages/admin/Placeholders';
import { supabase } from './lib/supabase';
import { useStore } from './store/useStore';
import { FullPageLoading } from './components/LoadingSpinner';

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useStore();
  if (loading) return <FullPageLoading message="Verifying session..." />;
  if (!user) return <Navigate to="/login" replace />;
  return <>{children}</>;
};

const AdminRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useStore();
  if (loading) return <FullPageLoading message="Verifying admin session..." />;
  if (!user || user.role !== 'admin') return <Navigate to="/dashboard" replace />;
  return <>{children}</>;
};

export default function App() {
  const { user, loading, databaseError, fetchUser, fetchCampaigns } = useStore();

  useEffect(() => {
    // Initial fetch
    fetchUser();
    
    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('Auth event:', event, session?.user?.email);
      fetchUser();
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [fetchUser]);

  useEffect(() => {
    if (user) {
      fetchCampaigns();
    }
  }, [user, fetchCampaigns]);

  if (databaseError) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6">
        <div className="max-w-2xl w-full p-8 glass border-destructive/20 space-y-6">
          <div className="text-center space-y-2">
            <h3 className="text-2xl font-bold text-destructive">Database Setup Required</h3>
            <p className="text-slate-500 font-medium">
              Your Supabase project is connected, but the required tables are missing.
            </p>
          </div>

          <div className="space-y-4">
            <div className="p-4 bg-slate-900 rounded-xl overflow-hidden">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">SQL Schema</span>
                <button 
                  onClick={() => {
                    const sql = document.getElementById('sql-schema')?.innerText;
                    if (sql) navigator.clipboard.writeText(sql);
                  }}
                  className="text-[10px] font-bold text-primary hover:text-primary/80 uppercase tracking-widest"
                >
                  Copy SQL
                </button>
              </div>
              <pre id="sql-schema" className="text-[10px] text-slate-300 font-mono overflow-x-auto max-h-[300px] whitespace-pre-wrap">
{`-- 1. Create users table
CREATE TABLE IF NOT EXISTS public.users (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  plan TEXT DEFAULT 'free',
  credits INTEGER DEFAULT 10,
  subscription_id TEXT,
  subscription_status TEXT,
  default_tone TEXT DEFAULT 'Professional',
  default_goal TEXT DEFAULT 'Book a Meeting',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 2. Create campaigns table
CREATE TABLE IF NOT EXISTS public.campaigns (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  status TEXT DEFAULT 'draft' NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 3. Create leads table
CREATE TABLE IF NOT EXISTS public.leads (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  campaign_id UUID REFERENCES campaigns(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  company TEXT,
  website TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 4. Create emails table
CREATE TABLE IF NOT EXISTS public.emails (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  lead_id UUID REFERENCES leads(id) ON DELETE CASCADE NOT NULL,
  subject TEXT NOT NULL,
  body TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 5. Create credits table
CREATE TABLE IF NOT EXISTS public.credits (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE UNIQUE NOT NULL,
  total_credits INTEGER DEFAULT 10 NOT NULL,
  used_credits INTEGER DEFAULT 0 NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 6. Create generated_emails table
CREATE TABLE IF NOT EXISTS public.generated_emails (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  lead_name TEXT,
  lead_email TEXT,
  company TEXT,
  subject TEXT,
  body TEXT,
  tone TEXT,
  goal TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 7. Enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE emails ENABLE ROW LEVEL SECURITY;
ALTER TABLE credits ENABLE ROW LEVEL SECURITY;
ALTER TABLE generated_emails ENABLE ROW LEVEL SECURITY;

-- 8. RLS Policies
CREATE POLICY "Users can view their own profile" ON users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update their own profile" ON users FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can view their own campaigns" ON campaigns FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own campaigns" ON campaigns FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own campaigns" ON campaigns FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own campaigns" ON campaigns FOR DELETE USING (auth.uid() = user_id);
CREATE POLICY "Users can view leads of their campaigns" ON leads FOR SELECT USING (EXISTS (SELECT 1 FROM campaigns WHERE campaigns.id = leads.campaign_id AND campaigns.user_id = auth.uid()));
CREATE POLICY "Users can insert leads into their campaigns" ON leads FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM campaigns WHERE campaigns.id = leads.campaign_id AND campaigns.user_id = auth.uid()));
CREATE POLICY "Users can view emails of their leads" ON emails FOR SELECT USING (EXISTS (SELECT 1 FROM leads JOIN campaigns ON campaigns.id = leads.campaign_id WHERE leads.id = emails.lead_id AND campaigns.user_id = auth.uid()));
CREATE POLICY "Users can view their own credits" ON credits FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can view their own generated emails" ON generated_emails FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own generated emails" ON generated_emails FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 9. Trigger to create user profile and credits on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.users (id, email, full_name)
  VALUES (new.id, new.email, new.raw_user_meta_data->>'full_name')
  ON CONFLICT (id) DO NOTHING;
  
  INSERT INTO public.credits (user_id, total_credits, used_credits)
  VALUES (new.id, 10, 0)
  ON CONFLICT (user_id) DO NOTHING;
  
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();`}
              </pre>
            </div>

            <div className="space-y-2">
              <p className="text-sm font-bold text-slate-700">How to fix this:</p>
              <ol className="text-sm text-slate-500 space-y-2 list-decimal list-inside">
                <li>Go to your <b>Supabase Dashboard</b></li>
                <li>Open the <b>SQL Editor</b> in the left sidebar</li>
                <li>Click <b>New Query</b> and paste the SQL code above</li>
                <li>Click <b>Run</b></li>
                <li>Refresh this page</li>
              </ol>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const isPlaceholder = !supabaseUrl || supabaseUrl.includes('placeholder') || supabaseUrl === '';
    
    if (isPlaceholder) {
      return (
        <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-6">
          <div className="max-w-md p-6 glass border-destructive/20 text-center space-y-4">
            <h3 className="text-xl font-bold text-destructive">Supabase Credentials Missing</h3>
            <p className="text-slate-500 font-medium">
              Please set your <b>VITE_SUPABASE_URL</b> and <b>VITE_SUPABASE_ANON_KEY</b> in the Secrets panel to enable authentication and database features.
            </p>
            <p className="text-xs text-slate-400">
              Current URL: {supabaseUrl || 'undefined'}
            </p>
          </div>
        </div>
      );
    }
    return <FullPageLoading message="Launching Mr. Cold Mail..." />;
  }

  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={!user ? <LandingPage /> : <Navigate to="/dashboard" />} />
        <Route path="/login" element={!user ? <Login /> : <Navigate to="/dashboard" />} />
        <Route path="/signup" element={!user ? <Signup /> : <Navigate to="/dashboard" />} />
        <Route path="/auth/callback" element={<AuthCallback />} />
        <Route path="/dashboard" element={<ProtectedRoute><Layout><Dashboard /></Layout></ProtectedRoute>} />
        <Route path="/campaigns" element={<ProtectedRoute><Layout><Campaigns /></Layout></ProtectedRoute>} />
        <Route path="/campaigns/new" element={<ProtectedRoute><Layout><CreateCampaign /></Layout></ProtectedRoute>} />
        <Route path="/campaigns/:id" element={<ProtectedRoute><Layout><EmailEditor /></Layout></ProtectedRoute>} />
        <Route path="/templates" element={<ProtectedRoute><Layout><Templates /></Layout></ProtectedRoute>} />
        <Route path="/analytics" element={<ProtectedRoute><Layout><Analytics /></Layout></ProtectedRoute>} />
        <Route path="/billing" element={<ProtectedRoute><Layout><Billing /></Layout></ProtectedRoute>} />
        <Route path="/generator" element={<ProtectedRoute><Layout><Generator /></Layout></ProtectedRoute>} />
        <Route path="/leads" element={<ProtectedRoute><Layout><Leads /></Layout></ProtectedRoute>} />
        <Route path="/settings" element={<ProtectedRoute><Layout><Settings /></Layout></ProtectedRoute>} />

        {/* Admin Routes */}
        <Route path="/admin" element={<AdminRoute><AdminLayout /></AdminRoute>}>
          <Route index element={<AdminDashboard />} />
          <Route path="users" element={<AdminUsers />} />
          <Route path="subscriptions" element={<AdminSubscriptions />} />
          <Route path="plans" element={<AdminPlans />} />
          <Route path="usage" element={<AdminUsage />} />
          <Route path="templates" element={<AdminTemplates />} />
          <Route path="logs" element={<AdminLogs />} />
          <Route path="settings" element={<AdminSettings />} />
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Router>
  );
}
