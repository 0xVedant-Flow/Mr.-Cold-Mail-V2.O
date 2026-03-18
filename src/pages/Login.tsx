import React from 'react';
import { motion } from 'motion/react';
import { Lock, User, ArrowRight, Sparkles } from 'lucide-react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { Link } from 'react-router-dom';

export const Login = () => {
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState('');

  React.useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const urlError = params.get('error');
    if (urlError) {
      setError(decodeURIComponent(urlError));
    }
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (!isSupabaseConfigured) {
      setError('Supabase credentials are not configured. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in the Secrets panel.');
      setLoading(false);
      return;
    }

    try {
      const { data, error: loginError } = await supabase.auth.signInWithPassword({ email, password });
      
      if (loginError) {
        if (loginError.message.includes('Email not confirmed')) {
          setError('Please confirm your email address before logging in.');
        } else {
          throw loginError;
        }
        return;
      }
    } catch (err: any) {
      setError(err.message === 'Failed to fetch' ? 'Connection error. Please check your internet or Supabase configuration.' : err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#020617] flex items-center justify-center p-4 md:p-8 relative overflow-hidden font-sans">
      {/* Background Atmosphere */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div 
          animate={{ 
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
            x: [0, 50, 0],
            y: [0, -50, 0]
          }}
          transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
          className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-primary/20 rounded-full blur-[120px]" 
        />
        <motion.div 
          animate={{ 
            scale: [1.2, 1, 1.2],
            opacity: [0.2, 0.4, 0.2],
            x: [0, -50, 0],
            y: [0, 50, 0]
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-indigo-500/10 rounded-full blur-[120px]" 
        />
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />
      </div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        style={{ perspective: 1000 }}
        className="w-full max-w-md relative z-10"
      >
        <div className="glass p-8 md:p-12 rounded-[32px] md:rounded-[48px] border-white/10 shadow-2xl bg-white/5 backdrop-blur-xl group">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          
          <div className="text-center mb-8 relative z-10">
            <motion.div 
              initial={{ rotate: -10 }}
              animate={{ rotate: 0 }}
              className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center shadow-lg shadow-primary/20 mx-auto mb-6"
            >
              <span className="text-white text-3xl font-bold">❄</span>
            </motion.div>
            <h2 className="text-2xl md:text-3xl font-bold text-white tracking-tight">Welcome Back</h2>
            <p className="text-slate-400 text-sm font-medium mt-2">Log in to your Mr. Cold Mail account</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4 md:space-y-6 relative z-10">
            {error && <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-400 text-xs md:text-sm font-bold rounded-xl">{error}</div>}
            
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 flex items-center gap-2 ml-1">
                <User size={12} /> Email Address
              </label>
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@company.com"
                required
                className="w-full px-6 py-4 bg-white/5 border border-white/10 rounded-2xl focus:ring-2 focus:ring-primary/50 focus:bg-white/10 outline-none font-medium text-white transition-all placeholder:text-slate-600"
              />
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between items-center ml-1">
                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 flex items-center gap-2">
                  <Lock size={12} /> Password
                </label>
                <button
                  type="button"
                  onClick={async () => {
                    if (!email) {
                      setError('Please enter your email address first.');
                      return;
                    }
                    const { error } = await supabase.auth.resetPasswordForEmail(email, {
                      redirectTo: `${window.location.origin}/login?error=Check your email for the link.`,
                    });
                    if (error) setError(error.message);
                    else setError('Password reset link sent to your email.');
                  }}
                  className="text-[10px] font-bold text-primary hover:underline uppercase tracking-widest"
                >
                  Forgot?
                </button>
              </div>
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full px-6 py-4 bg-white/5 border border-white/10 rounded-2xl focus:ring-2 focus:ring-primary/50 focus:bg-white/10 outline-none font-medium text-white transition-all placeholder:text-slate-600"
              />
            </div>

            <motion.button 
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={loading}
              className="w-full bg-primary hover:bg-primary/90 text-white py-5 rounded-2xl font-bold shadow-xl shadow-primary/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50 text-base"
            >
              {loading ? 'Logging in...' : 'Log In'} <ArrowRight size={20} />
            </motion.button>
          </form>

          <div className="mt-8 text-center relative z-10">
            <p className="text-sm text-slate-500 font-medium">
              Don't have an account? <Link to="/signup" className="text-primary font-bold hover:text-primary/80 transition-colors">Sign Up</Link>
            </p>
          </div>
        </div>

        {/* Floating Accents */}
        <motion.div 
          animate={{ y: [0, -10, 0] }}
          transition={{ duration: 4, repeat: Infinity }}
          className="absolute -top-6 -right-6 w-12 h-12 bg-emerald-500/20 rounded-xl blur-xl"
        />
        <motion.div 
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 5, repeat: Infinity }}
          className="absolute -bottom-6 -left-6 w-16 h-16 bg-primary/20 rounded-xl blur-xl"
        />
      </motion.div>
    </div>
  );
};
