import React from 'react';
import { motion } from 'motion/react';
import { Mail, Sparkles, Lock, User } from 'lucide-react';
import { supabase } from '../lib/supabase';

export const Signup = () => {
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [fullName, setFullName] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState('');

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName }
      }
    });
    if (error) setError(error.message);
    else {
      setError('Check your email for the confirmation link! You must confirm your email before you can log in.');
      alert('Check your email for the confirmation link!');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2" />
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-purple-500/5 rounded-full blur-[120px] translate-y-1/2 -translate-x-1/2" />
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md glass p-12 rounded-[48px] border-border/40 shadow-2xl shadow-primary/5 relative z-10"
      >
        <div className="text-center mb-12">
          <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center shadow-lg shadow-primary/20 mx-auto mb-6">
            <span className="text-white text-3xl font-bold">❄</span>
          </div>
          <h2 className="text-3xl font-bold text-slate-800 tracking-tight">Create Account</h2>
          <p className="text-slate-500 font-medium mt-2">Start your 14-day free trial today</p>
        </div>

        <form onSubmit={handleSignup} className="space-y-6">
          {error && <div className="p-4 bg-destructive/10 text-destructive text-sm font-bold rounded-xl">{error}</div>}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-widest text-slate-400 flex items-center gap-2">
              <User size={14} /> Full Name
            </label>
            <input 
              type="text" 
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="John Doe"
              required
              className="w-full px-6 py-4 bg-muted rounded-2xl border-none focus:ring-2 focus:ring-primary/20 font-bold text-slate-800 transition-all"
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-widest text-slate-400 flex items-center gap-2">
              <Mail size={14} /> Email Address
            </label>
            <input 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@company.com"
              required
              className="w-full px-6 py-4 bg-muted rounded-2xl border-none focus:ring-2 focus:ring-primary/20 font-bold text-slate-800 transition-all"
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-widest text-slate-400 flex items-center gap-2">
              <Lock size={14} /> Password
            </label>
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              className="w-full px-6 py-4 bg-muted rounded-2xl border-none focus:ring-2 focus:ring-primary/20 font-bold text-slate-800 transition-all"
            />
          </div>
          <button 
            type="submit"
            disabled={loading}
            className="w-full bg-primary hover:bg-primary/90 text-white py-5 rounded-2xl font-bold shadow-xl shadow-primary/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? 'Creating Account...' : 'Get Started'} <Sparkles size={20} />
          </button>
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
