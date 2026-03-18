import React from 'react';
import { motion } from 'motion/react';
import { Mail, Sparkles, Lock, User } from 'lucide-react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

export const Signup = () => {
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [fullName, setFullName] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState('');
  const [success, setSuccess] = React.useState(false);

  React.useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const urlError = params.get('error');
    if (urlError) {
      setError(decodeURIComponent(urlError));
    }
  }, []);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);

    console.log('Attempting signup for:', email);

    if (!isSupabaseConfigured) {
      setError('Supabase credentials are not configured. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in the Secrets panel.');
      setLoading(false);
      return;
    }

    try {
      const { data, error: signupError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (signupError) {
        console.error('Signup error:', signupError);
        throw signupError;
      }

      console.log('Signup successful:', data);

      if (data.user && data.session) {
        // User is signed in immediately (if email confirmation is disabled)
        console.log('User signed in immediately');
        window.location.href = '/dashboard';
      } else {
        // User needs to confirm email
        console.log('Email confirmation required');
        setSuccess(true);
      }
    } catch (err: any) {
      console.error('Signup catch block:', err);
      if (err.message === 'Failed to fetch') {
        setError('Connection error. Please check your internet or Supabase configuration.');
      } else {
        setError(err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2" />
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-purple-500/5 rounded-full blur-[120px] translate-y-1/2 -translate-x-1/2" />
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md glass p-8 md:p-12 rounded-[32px] md:rounded-[48px] border-border/40 shadow-2xl shadow-primary/5 relative z-10"
      >
        <div className="text-center mb-8 md:mb-12">
          <div className="w-14 h-14 md:w-16 md:h-16 bg-primary rounded-2xl flex items-center justify-center shadow-lg shadow-primary/20 mx-auto mb-4 md:mb-6">
            <span className="text-white text-2xl md:text-3xl font-bold">❄</span>
          </div>
          <h2 className="text-2xl md:text-3xl font-bold text-slate-800 tracking-tight">Create Account</h2>
          <p className="text-slate-500 text-sm md:text-base font-medium mt-2">Start your 14-day free trial today</p>
        </div>

        <form onSubmit={handleSignup} className="space-y-4 md:space-y-6">
          {error && <div className="p-4 bg-destructive/10 text-destructive text-xs md:text-sm font-bold rounded-xl">{error}</div>}
          {success && (
            <div className="p-5 md:p-6 bg-emerald-50 border border-emerald-100 rounded-2xl space-y-3">
              <div className="flex items-center gap-2 text-emerald-600 font-bold text-sm md:text-base">
                <Sparkles size={18} /> Check your email!
              </div>
              <p className="text-xs md:text-sm text-slate-600 font-medium leading-relaxed">
                We've sent a confirmation link to <span className="font-bold text-slate-800">{email}</span>. 
                Please click the link to activate your account.
              </p>
              <div className="p-3 bg-primary/5 rounded-xl text-[9px] md:text-[10px] text-primary font-bold uppercase tracking-widest leading-normal">
                Tip: Make sure you've added <span className="underline">{window.location.origin}</span> to your Supabase Redirect URLs in the dashboard.
              </div>
            </div>
          )}
          
          {!success && (
            <>
              <div className="space-y-2">
                <label className="text-[10px] md:text-xs font-bold uppercase tracking-widest text-slate-400 flex items-center gap-2">
                  <User size={14} /> Full Name
                </label>
                <input 
                  type="text" 
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="John Doe"
                  required
                  className="w-full px-6 py-3.5 md:py-4 bg-muted rounded-2xl border-none focus:ring-2 focus:ring-primary/20 font-bold text-slate-800 transition-all text-sm md:text-base"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] md:text-xs font-bold uppercase tracking-widest text-slate-400 flex items-center gap-2">
                  <Mail size={14} /> Email Address
                </label>
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@company.com"
                  required
                  className="w-full px-6 py-3.5 md:py-4 bg-muted rounded-2xl border-none focus:ring-2 focus:ring-primary/20 font-bold text-slate-800 transition-all text-sm md:text-base"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] md:text-xs font-bold uppercase tracking-widest text-slate-400 flex items-center gap-2">
                  <Lock size={14} /> Password
                </label>
                <input 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full px-6 py-3.5 md:py-4 bg-muted rounded-2xl border-none focus:ring-2 focus:ring-primary/20 font-bold text-slate-800 transition-all text-sm md:text-base"
                />
              </div>
              <button 
                type="submit"
                disabled={loading}
                className="w-full bg-primary hover:bg-primary/90 text-white py-4 md:py-5 rounded-2xl font-bold shadow-xl shadow-primary/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50 text-sm md:text-base"
              >
                {loading ? 'Creating Account...' : 'Get Started'} <Sparkles size={20} />
              </button>
            </>
          )}
        </form>

        <div className="mt-8 text-center">
          <p className="text-sm text-slate-500 font-medium">
            Already have an account? <a href="/login" className="text-primary font-bold hover:underline">Log In</a>
          </p>
        </div>
      </motion.div>
    </div>
  );
};
