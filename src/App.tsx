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
import { Team } from './pages/Team';
import { supabase } from './lib/supabase';
import { useStore } from './store/useStore';
import { FullPageLoading } from './components/LoadingSpinner';

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useStore();
  if (loading) return <FullPageLoading message="Verifying session..." />;
  if (!user) return <Navigate to="/login" replace />;
  return <>{children}</>;
};

export default function App() {
  const { user, loading, fetchUser, fetchCampaigns } = useStore();

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
        <Route path="/team" element={<ProtectedRoute><Layout><Team /></Layout></ProtectedRoute>} />
        <Route path="/billing" element={<ProtectedRoute><Layout><Billing /></Layout></ProtectedRoute>} />
        <Route path="/settings" element={<ProtectedRoute><Layout><Settings /></Layout></ProtectedRoute>} />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Router>
  );
}
