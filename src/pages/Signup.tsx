import React from 'react';
import { motion } from 'motion/react';
import { Mail, Sparkles, Lock, User, CheckCircle2, ArrowRight } from 'lucide-react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { Link } from 'react-router-dom';

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

      if (signupError) throw signupError;

      if (data.user && data.session) {
        window.location.href = '/dashboard';
      } else {
        setSuccess(true);
      }
    } catch (err: any) {
      setError(err.message === 'Failed to fetch' ? 'Connection error. Please check your internet or Supabase configuration.' : err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 md:p-8 relative overflow-hidden font-sans">
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
          className="absolute top-[-10%] right-[-10%] w-[60%] h-[60%] bg-primary/20 rounded-full blur-[120px]" 
        />
        <motion.div 
          animate={{ 
            scale: [1.2, 1, 1.2],
            opacity: [0.2, 0.4, 0.2],
            x: [0, -50, 0],
            y: [0, 50, 0]
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute bottom-[-10%] left-[-10%] w-[60%] h-[60%] bg-indigo-500/10 rounded-full blur-[120px]" 
        />
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />
      </div>

      <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-12 items-center relative z-10">
        {/* Storytelling Side */}
        <motion.div 
          initial={{ opacity: 0, x: -50 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          className="hidden lg:block space-y-8"
        >
          <div className="space-y-4">
            <motion.div 
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="w-12 h-12 bg-primary/20 border border-primary/30 rounded-xl flex items-center justify-center text-primary mb-6"
            >
              <Sparkles size={24} />
            </motion.div>
            <h1 className="text-5xl font-bold text-foreground leading-tight tracking-tight">
              The Future of <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-indigo-400 to-emerald-400">Cold Outreach</span> is Here.
            </h1>
            <p className="text-muted-foreground text-lg max-w-md leading-relaxed">
              Join 5,000+ top-performing sales teams who use Mr. Cold Mail to turn cold leads into warm conversations.
            </p>
          </div>

          <div className="space-y-6">
            {[
              { title: "AI-Powered Personalization", desc: "Our AI researches every lead to write emails that actually get replies." },
              { title: "10x Faster Workflow", desc: "Generate a week's worth of high-quality outreach in under 5 minutes." },
              { title: "High-Conversion Templates", desc: "Access the same frameworks used by world-class sales agencies." }
            ].map((item, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + i * 0.1 }}
                className="flex gap-4 items-start"
              >
                <div className="mt-1 bg-emerald-500/10 p-1 rounded-full text-emerald-400">
                  <CheckCircle2 size={18} />
                </div>
                <div>
                  <h3 className="text-foreground font-bold">{item.title}</h3>
                  <p className="text-muted-foreground text-sm">{item.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="pt-8 border-t border-border">
            <p className="text-muted-foreground text-sm italic">"Mr. Cold Mail doubled our meeting rate in the first month. It's a game changer."</p>
            <div className="flex items-center gap-3 mt-4">
              <img src="https://i.pravatar.cc/150?u=sarah" alt="User" className="w-10 h-10 rounded-full border border-border" />
              <div>
                <p className="text-foreground text-sm font-bold">Sarah Jenkins</p>
                <p className="text-muted-foreground text-xs uppercase tracking-widest font-bold">Head of Sales, TechFlow</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Form Side */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95, rotateY: -5 }}
          whileInView={{ opacity: 1, scale: 1, rotateY: 0 }}
          viewport={{ once: true }}
          style={{ perspective: 1000 }}
          className="w-full max-w-md mx-auto"
        >
          <div className="glass p-8 md:p-12 rounded-[32px] md:rounded-[48px] border-white/10 shadow-2xl bg-white/5 backdrop-blur-xl relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            
            <div className="text-center mb-8 relative z-10">
              <div className="lg:hidden w-12 h-12 bg-primary rounded-xl flex items-center justify-center shadow-lg shadow-primary/20 mx-auto mb-4">
                <span className="text-white text-xl font-bold">❄</span>
              </div>
              <h2 className="text-2xl md:text-3xl font-bold text-foreground tracking-tight">Create Account</h2>
              <p className="text-muted-foreground text-sm font-medium mt-2">Start your 14-day free trial today</p>
            </div>

            <form onSubmit={handleSignup} className="space-y-4 md:space-y-6 relative z-10">
              {error && <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-400 text-xs md:text-sm font-bold rounded-xl">{error}</div>}
              {success && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-6 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl space-y-3"
                >
                  <div className="flex items-center gap-2 text-emerald-400 font-bold">
                    <Sparkles size={18} /> Check your email!
                  </div>
                  <p className="text-xs md:text-sm text-muted-foreground font-medium leading-relaxed">
                    We've sent a confirmation link to <span className="font-bold text-foreground">{email}</span>. 
                  </p>
                  <div className="p-3 bg-primary/10 rounded-xl text-[10px] text-primary font-bold uppercase tracking-widest">
                    Tip: Check your spam folder if it doesn't arrive in 2 minutes.
                  </div>
                </motion.div>
              )}
              
              {!success && (
                <>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 flex items-center gap-2 ml-1">
                      <User size={12} /> Full Name
                    </label>
                    <input 
                      type="text" 
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="John Doe"
                      required
                      className="w-full px-6 py-4 bg-muted border border-border rounded-2xl focus:ring-2 focus:ring-primary/50 focus:bg-muted/80 outline-none font-medium text-foreground transition-all placeholder:text-muted-foreground/50"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 flex items-center gap-2 ml-1">
                      <Mail size={12} /> Email Address
                    </label>
                    <input 
                      type="email" 
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="name@company.com"
                      required
                      className="w-full px-6 py-4 bg-muted border border-border rounded-2xl focus:ring-2 focus:ring-primary/50 focus:bg-muted/80 outline-none font-medium text-foreground transition-all placeholder:text-muted-foreground/50"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 flex items-center gap-2 ml-1">
                      <Lock size={12} /> Password
                    </label>
                    <input 
                      type="password" 
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      required
                      className="w-full px-6 py-4 bg-muted border border-border rounded-2xl focus:ring-2 focus:ring-primary/50 focus:bg-muted/80 outline-none font-medium text-foreground transition-all placeholder:text-muted-foreground/50"
                    />
                  </div>
                  <motion.button 
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    disabled={loading}
                    className="w-full bg-primary hover:bg-primary/90 text-white py-5 rounded-2xl font-bold shadow-xl shadow-primary/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50 text-base"
                  >
                    {loading ? 'Creating Account...' : 'Get Started Free'} <ArrowRight size={20} />
                  </motion.button>
                </>
              )}
            </form>

            <div className="mt-8 text-center relative z-10">
              <p className="text-sm text-muted-foreground font-medium">
                Already have an account? <Link to="/login" className="text-primary font-bold hover:text-primary/80 transition-colors">Log In</Link>
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};
