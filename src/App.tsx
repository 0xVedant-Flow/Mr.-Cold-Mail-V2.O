import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/Layout';
import { LandingPage } from './pages/LandingPage';
import { Login } from './pages/Login';
import { Signup } from './pages/Signup';
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
    const isPlaceholder = import.meta.env.VITE_SUPABASE_URL?.includes('placeholder');
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-6">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        {isPlaceholder && (
          <div className="max-w-md p-6 glass border-destructive/20 text-center space-y-4">
            <h3 className="text-xl font-bold text-destructive">Supabase Credentials Missing</h3>
            <p className="text-slate-500 font-medium">
              Please set your <b>VITE_SUPABASE_URL</b> and <b>VITE_SUPABASE_ANON_KEY</b> in the Secrets panel to enable authentication and database features.
            </p>
          </div>
        )}
      </div>
    );
  }

  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={!user ? <LandingPage /> : <Navigate to="/dashboard" />} />
        <Route path="/login" element={!user ? <Login /> : <Navigate to="/dashboard" />} />
        <Route path="/signup" element={!user ? <Signup /> : <Navigate to="/dashboard" />} />
        <Route path="/dashboard" element={user ? <Layout><Dashboard /></Layout> : <Navigate to="/login" />} />
        <Route path="/campaigns" element={user ? <Layout><Campaigns /></Layout> : <Navigate to="/login" />} />
        <Route path="/campaigns/new" element={user ? <Layout><CreateCampaign /></Layout> : <Navigate to="/login" />} />
        <Route path="/campaigns/:id" element={user ? <Layout><EmailEditor /></Layout> : <Navigate to="/login" />} />
        <Route path="/templates" element={user ? <Layout><Templates /></Layout> : <Navigate to="/login" />} />
        <Route path="/analytics" element={user ? <Layout><Analytics /></Layout> : <Navigate to="/login" />} />
        <Route path="/team" element={user ? <Layout><Team /></Layout> : <Navigate to="/login" />} />
        <Route path="/billing" element={user ? <Layout><Billing /></Layout> : <Navigate to="/login" />} />
        <Route path="/settings" element={user ? <Layout><Settings /></Layout> : <Navigate to="/login" />} />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Router>
  );
}
