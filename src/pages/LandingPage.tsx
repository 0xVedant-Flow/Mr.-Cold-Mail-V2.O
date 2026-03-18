import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  CheckCircle2, 
  XCircle, 
  ArrowRight, 
  Sparkles, 
  Upload, 
  Send,
  Mail, 
  Zap, 
  ShieldCheck, 
  Star,
  Clock,
  ChevronRight,
  MessageSquare,
  Target,
  BarChart3
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { cn } from '../lib/utils';

const Nav = () => {
  const [isOpen, setIsOpen] = React.useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass border-b border-border/40 px-4 md:px-6 py-4">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center shadow-lg shadow-primary/20">
            <span className="text-white font-bold">❄</span>
          </div>
          <span className="font-bold text-lg md:text-xl tracking-tight text-slate-800">Mr. Cold Mail</span>
        </div>
        
        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-8">
          <a href="#features" className="text-sm font-bold text-slate-500 hover:text-primary transition-colors">Features</a>
          <a href="#how-it-works" className="text-sm font-bold text-slate-500 hover:text-primary transition-colors">How it Works</a>
          <a href="#pricing" className="text-sm font-bold text-slate-500 hover:text-primary transition-colors">Pricing</a>
        </div>

        <div className="flex items-center gap-3 md:gap-4">
          <Link to="/login" className="hidden sm:block text-sm font-bold text-slate-600 hover:text-primary transition-colors">Log In</Link>
          <Link to="/signup" className="bg-primary hover:bg-primary/90 text-white px-4 md:px-6 py-2 md:py-2.5 rounded-xl text-xs md:text-sm font-bold shadow-lg shadow-primary/20 transition-all">
            Start Free
          </Link>
          <button 
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden p-2 text-slate-600"
          >
            {isOpen ? <XCircle size={24} /> : <div className="space-y-1.5"><div className="w-6 h-0.5 bg-slate-600 rounded-full" /><div className="w-6 h-0.5 bg-slate-600 rounded-full" /><div className="w-6 h-0.5 bg-slate-600 rounded-full" /></div>}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden border-t border-border/40 mt-4 py-4 space-y-4 overflow-hidden"
          >
            <a href="#features" onClick={() => setIsOpen(false)} className="block text-sm font-bold text-slate-600 px-2">Features</a>
            <a href="#how-it-works" onClick={() => setIsOpen(false)} className="block text-sm font-bold text-slate-600 px-2">How it Works</a>
            <a href="#pricing" onClick={() => setIsOpen(false)} className="block text-sm font-bold text-slate-600 px-2">Pricing</a>
            <Link to="/login" onClick={() => setIsOpen(false)} className="block text-sm font-bold text-slate-600 px-2">Log In</Link>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

const Hero = () => (
  <section className="relative pt-24 md:pt-32 pb-12 md:pb-20 px-4 md:px-6 overflow-hidden">
    <div className="absolute top-0 right-0 w-[400px] md:w-[800px] h-[400px] md:h-[800px] bg-primary/5 rounded-full blur-[80px] md:blur-[120px] -translate-y-1/2 translate-x-1/2" />
    <div className="absolute bottom-0 left-0 w-[400px] md:w-[800px] h-[400px] md:h-[800px] bg-purple-500/5 rounded-full blur-[80px] md:blur-[120px] translate-y-1/2 -translate-x-1/2" />
    
    <div className="max-w-7xl mx-auto text-center relative z-10">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-[10px] md:text-xs font-bold uppercase tracking-widest mb-6 md:mb-8"
      >
        <Sparkles size={14} /> AI-Powered Personalization
      </motion.div>
      
      <motion.h1 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="text-3xl sm:text-4xl md:text-7xl font-bold text-slate-900 tracking-tight leading-[1.2] md:leading-[1.1] mb-6 md:mb-8"
      >
        Stop Sending Cold Emails <br className="hidden sm:block" />
        <span className="text-primary">That Get Ignored</span>
      </motion.h1>
      
      <motion.p 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="text-base md:text-xl text-slate-500 font-medium max-w-2xl mx-auto mb-8 md:mb-12 px-4"
      >
        Upload your leads and let AI write deeply personalized cold emails in seconds — so you can book more calls, close more deals, and grow faster.
      </motion.p>
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="flex flex-col items-center gap-4 px-4"
      >
        <Link 
          to="/signup" 
          className="w-full sm:w-auto bg-primary hover:bg-primary/90 text-white px-8 md:px-10 py-4 md:py-5 rounded-2xl text-base md:text-lg font-bold shadow-2xl shadow-primary/20 transition-all flex items-center justify-center gap-2 group"
        >
          🔥 Start Free — Get 10 Emails <ArrowRight className="group-hover:translate-x-1 transition-transform" />
        </Link>
        <p className="text-[10px] md:text-sm text-slate-400 font-bold uppercase tracking-widest">
          (No credit card required)
        </p>
      </motion.div>

      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="mt-12 md:mt-16 flex flex-col sm:flex-row items-center justify-center gap-3 md:gap-2 text-slate-500 font-bold text-sm"
      >
        <div className="flex -space-x-2">
          {[1, 2, 3, 4, 5].map(i => (
            <div key={i} className="w-8 h-8 rounded-full border-2 border-white bg-slate-200 overflow-hidden">
              <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${i}`} alt="user" />
            </div>
          ))}
        </div>
        <span className="text-center">⭐⭐⭐⭐⭐ Trusted by founders & agencies</span>
      </motion.div>
    </div>
  </section>
);

const Problem = () => (
  <section className="py-16 md:py-24 px-4 md:px-6 bg-slate-50">
    <div className="max-w-7xl mx-auto">
      <div className="text-center mb-12 md:mb-16">
        <h2 className="text-2xl md:text-4xl font-bold text-slate-900 tracking-tight mb-4">Cold Emails Don’t Work Anymore…</h2>
        <p className="text-slate-500 font-medium text-base md:text-lg">The old way is broken. Here's why you're struggling:</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
        {[
          { icon: XCircle, title: "Generic emails get ignored", desc: "People can spot a template from a mile away. If it's not personal, it's spam." },
          { icon: Clock, title: "Personalization takes too much time", desc: "Spending 20 minutes researching one lead? You'll never scale that way." },
          { icon: Zap, title: "Copy-paste templates feel robotic", desc: "Your prospects want to talk to a human, not a mail-merge script." }
        ].map((item, i) => (
          <div key={i} className="glass p-8 md:p-10 rounded-[32px] md:rounded-[40px] border-border/40 space-y-4">
            <div className="w-10 h-10 md:w-12 md:h-12 bg-destructive/10 rounded-xl md:rounded-2xl flex items-center justify-center text-destructive">
              <item.icon size={20} className="md:w-6 md:h-6" />
            </div>
            <h3 className="text-lg md:text-xl font-bold text-slate-800">{item.title}</h3>
            <p className="text-sm md:text-base text-slate-500 font-medium">{item.desc}</p>
          </div>
        ))}
      </div>

      <div className="mt-12 md:mt-16 p-6 md:p-8 bg-destructive/5 rounded-[24px] md:rounded-[32px] border border-destructive/10 text-center">
        <p className="text-lg md:text-xl font-bold text-slate-800">
          👉 Result? <span className="text-destructive">No replies. No deals. Wasted effort.</span>
        </p>
      </div>
    </div>
  </section>
);

const Solution = () => (
  <section id="features" className="py-16 md:py-24 px-4 md:px-6">
    <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-12 md:gap-16">
      <div className="flex-1 space-y-6 md:space-y-8 text-center lg:text-left">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 text-emerald-600 text-[10px] md:text-xs font-bold uppercase tracking-widest">
          <CheckCircle2 size={14} /> The Solution
        </div>
        <h2 className="text-3xl md:text-5xl font-bold text-slate-900 tracking-tight">
          Meet Mr. Cold Mail — <br className="hidden md:block" />
          <span className="text-primary">Your AI Sales Assistant</span>
        </h2>
        <p className="text-lg md:text-xl text-slate-500 font-medium">
          Generate highly personalized cold emails using AI that actually sound human and get responses.
        </p>
        <div className="space-y-4 text-left max-w-md mx-auto lg:mx-0">
          {[
            "Personalized intro for every lead",
            "Smart AI understands company context",
            "Ready-to-send emails in seconds",
            "No writing skills needed"
          ].map((benefit, i) => (
            <div key={i} className="flex items-center gap-3 text-base md:text-lg font-bold text-slate-700">
              <div className="w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center text-white shrink-0">
                <CheckCircle2 size={14} />
              </div>
              {benefit}
            </div>
          ))}
        </div>
      </div>
      <div className="flex-1 relative w-full max-w-lg lg:max-w-none">
        <div className="absolute inset-0 bg-primary/10 rounded-[32px] md:rounded-[48px] blur-3xl" />
        <div className="glass p-6 md:p-8 rounded-[32px] md:rounded-[48px] border-border/40 relative z-10 shadow-2xl">
          <div className="space-y-6">
            <div className="flex items-center gap-4 p-4 bg-white rounded-2xl shadow-sm">
              <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
                <Sparkles size={20} />
              </div>
              <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: '100%' }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="h-full bg-primary" 
                />
              </div>
            </div>
            <div className="space-y-3">
              <div className="h-4 bg-slate-100 rounded-full w-3/4" />
              <div className="h-4 bg-slate-100 rounded-full w-full" />
              <div className="h-4 bg-slate-100 rounded-full w-5/6" />
            </div>
            <div className="p-6 bg-primary/5 rounded-2xl border border-primary/10">
              <p className="text-sm font-medium text-slate-600 italic">
                "Hey John, noticed your company recently launched a new feature..."
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
);

const HowItWorks = () => (
  <section id="how-it-works" className="py-16 md:py-24 px-4 md:px-6 bg-slate-900 text-white overflow-hidden relative">
    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] md:w-[1000px] h-[600px] md:h-[1000px] bg-primary/10 rounded-full blur-[80px] md:blur-[120px]" />
    
    <div className="max-w-7xl mx-auto relative z-10">
      <div className="text-center mb-12 md:mb-20">
        <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">How It Works</h2>
        <p className="text-slate-400 font-medium text-base md:text-lg">Three simple steps to more replies.</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-12">
        {[
          { icon: Upload, title: "1. Upload Leads", desc: "Upload your CSV with prospects" },
          { icon: Sparkles, title: "2. AI Writes Emails", desc: "AI generates personalized emails for each lead" },
          { icon: Send, title: "3. Send & Get Replies", desc: "Export and start closing deals 🚀" }
        ].map((step, i) => (
          <div key={i} className="text-center space-y-4 md:space-y-6">
            <div className="w-16 h-16 md:w-20 md:h-20 bg-primary rounded-2xl md:rounded-3xl flex items-center justify-center mx-auto shadow-2xl shadow-primary/20">
              <step.icon size={28} className="md:w-8 md:h-8" />
            </div>
            <h3 className="text-xl md:text-2xl font-bold">{step.title}</h3>
            <p className="text-sm md:text-base text-slate-400 font-medium">{step.desc}</p>
          </div>
        ))}
      </div>
    </div>
  </section>
);

const BeforeAfter = () => (
  <section className="py-16 md:py-24 px-4 md:px-6">
    <div className="max-w-5xl mx-auto">
      <div className="text-center mb-12 md:mb-16">
        <h2 className="text-3xl md:text-4xl font-bold text-slate-900 tracking-tight">Before vs After</h2>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
        <div className="glass p-8 md:p-10 rounded-[32px] md:rounded-[40px] border-destructive/20 bg-destructive/5">
          <div className="flex items-center gap-2 text-destructive font-bold uppercase tracking-widest text-[10px] md:text-xs mb-6">
            <XCircle size={16} /> Before
          </div>
          <div className="p-5 md:p-6 bg-white rounded-2xl shadow-sm text-slate-400 font-medium italic text-sm md:text-base">
            “Hi, I’m reaching out to offer my service…”
          </div>
          <p className="mt-6 text-center font-bold text-slate-800">👉 Ignored.</p>
        </div>
        
        <div className="glass p-8 md:p-10 rounded-[32px] md:rounded-[40px] border-emerald-500/20 bg-emerald-500/5">
          <div className="flex items-center gap-2 text-emerald-600 font-bold uppercase tracking-widest text-[10px] md:text-xs mb-6">
            <CheckCircle2 size={16} /> After
          </div>
          <div className="p-5 md:p-6 bg-white rounded-2xl shadow-sm text-slate-800 font-bold italic text-sm md:text-base">
            “Hey John, noticed your company recently launched a new feature…”
          </div>
          <p className="mt-6 text-center font-bold text-slate-800">👉 Gets replies.</p>
        </div>
      </div>
    </div>
  </section>
);

const Pricing = () => {
  const [isYearly, setIsYearly] = React.useState(true);

  return (
    <section id="pricing" className="py-16 md:py-24 px-4 md:px-6 bg-slate-50">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12 md:mb-16 space-y-4">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 tracking-tight">Simple, Affordable Pricing</h2>
          <div className="flex items-center justify-center gap-4">
            <span className={cn("text-xs md:text-sm font-bold", !isYearly ? "text-slate-900" : "text-slate-400")}>Monthly</span>
            <button 
              onClick={() => setIsYearly(!isYearly)}
              className="w-12 md:w-14 h-7 md:h-8 bg-slate-200 rounded-full p-1 transition-all relative"
            >
              <div className={cn(
                "w-5 h-5 md:w-6 md:h-6 bg-primary rounded-full transition-all shadow-sm",
                isYearly ? "translate-x-5 md:translate-x-6" : "translate-x-0"
              )} />
            </button>
            <span className={cn("text-xs md:text-sm font-bold flex items-center gap-2", isYearly ? "text-slate-900" : "text-slate-400")}>
              Yearly <span className="bg-emerald-500 text-white text-[8px] md:text-[10px] px-2 py-0.5 rounded-full shrink-0">SAVE BIG</span>
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 max-w-4xl mx-auto">
          {/* Pro Plan */}
          <div className="glass p-8 md:p-12 rounded-[32px] md:rounded-[48px] border-border/40 flex flex-col">
            <div className="mb-8">
              <div className="text-[10px] md:text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Pro Plan</div>
              <h3 className="text-xl md:text-2xl font-bold text-slate-800 mb-4">💼 Mr. Cold Mail Pro</h3>
              <div className="flex items-baseline gap-1">
                <span className="text-4xl md:text-5xl font-bold text-slate-900">{isYearly ? '$17' : '$29'}</span>
                <span className="text-slate-500 font-medium text-sm md:text-base">/mo</span>
              </div>
              {isYearly && <p className="text-emerald-600 text-xs md:text-sm font-bold mt-2">🔥 Limited Offer</p>}
            </div>
            <div className="space-y-4 mb-10 flex-1">
              {['AI personalized emails', 'Bulk generation', 'Export emails', 'Basic analytics'].map((f, i) => (
                <div key={i} className="flex items-center gap-3 text-sm md:text-base text-slate-600 font-medium">
                  <CheckCircle2 size={18} className="text-emerald-500 shrink-0" /> {f}
                </div>
              ))}
            </div>
            <Link to="/signup" className="w-full py-4 md:py-5 rounded-2xl bg-slate-800 text-white font-bold text-center hover:bg-slate-900 transition-all text-sm md:text-base">
              Start Free → Upgrade Anytime
            </Link>
          </div>

          {/* Agency Plan */}
          <div className="glass p-8 md:p-12 rounded-[32px] md:rounded-[48px] border-primary/40 shadow-2xl shadow-primary/5 relative md:scale-105 z-10 flex flex-col mt-8 md:mt-0">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-primary text-white px-4 py-1 rounded-full text-[9px] md:text-[10px] font-bold uppercase tracking-widest flex items-center gap-1 shadow-lg shadow-primary/20 whitespace-nowrap">
              <Sparkles size={12} /> 🔥 Best Value
            </div>
            <div className="mb-8">
              <div className="text-[10px] md:text-xs font-bold text-primary uppercase tracking-widest mb-2">Agency Plan</div>
              <h3 className="text-xl md:text-2xl font-bold text-slate-800 mb-4">🚀 Agency</h3>
              <div className="flex items-baseline gap-1">
                <span className="text-4xl md:text-5xl font-bold text-slate-900">{isYearly ? '$41' : '$69'}</span>
                <span className="text-slate-500 font-medium text-sm md:text-base">/mo</span>
              </div>
              {isYearly && <p className="text-primary text-xs md:text-sm font-bold mt-2">⚡ LIMITED DEAL</p>}
            </div>
            <div className="space-y-4 mb-10 flex-1">
              {['Everything in Pro', 'Unlimited email generation', 'Team access', 'Advanced AI personalization', 'Priority support'].map((f, i) => (
                <div key={i} className="flex items-center gap-3 text-sm md:text-base text-slate-600 font-medium">
                  <CheckCircle2 size={18} className="text-primary shrink-0" /> {f}
                </div>
              ))}
            </div>
            <Link to="/signup" className="w-full py-4 md:py-5 rounded-2xl bg-primary text-white font-bold text-center hover:bg-primary/90 shadow-xl shadow-primary/20 transition-all text-sm md:text-base">
              🔥 Upgrade to Agency
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

const Testimonials = () => (
  <section className="py-16 md:py-24 px-4 md:px-6">
    <div className="max-w-7xl mx-auto">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
        {[
          { text: "Got 3 replies in 1 day after switching to Mr. Cold Mail. Insane.", author: "Founder @ TechFlow" },
          { text: "Saved me hours of writing. AI actually works.", author: "Freelance Designer" }
        ].map((t, i) => (
          <div key={i} className="glass p-8 md:p-10 rounded-[32px] md:rounded-[40px] border-border/40 relative">
            <div className="absolute -top-4 -left-4 w-10 h-10 md:w-12 md:h-12 bg-primary/10 rounded-xl md:rounded-2xl flex items-center justify-center text-primary">
              <MessageSquare size={20} className="md:w-6 md:h-6" />
            </div>
            <p className="text-lg md:text-xl font-bold text-slate-800 mb-6">“{t.text}”</p>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-slate-200 shrink-0" />
              <span className="font-bold text-slate-500 text-sm md:text-base">{t.author}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  </section>
);

const FinalCTA = () => (
  <section className="py-16 md:py-24 px-4 md:px-6 relative overflow-hidden">
    <div className="absolute inset-0 bg-primary/5" />
    <div className="max-w-4xl mx-auto text-center relative z-10 space-y-6 md:space-y-8">
      <h2 className="text-3xl md:text-5xl font-bold text-slate-900 tracking-tight">Ready to Get More Replies?</h2>
      <div className="flex flex-col items-center gap-4">
        <Link 
          to="/signup" 
          className="w-full sm:w-auto bg-primary hover:bg-primary/90 text-white px-8 md:px-12 py-5 md:py-6 rounded-2xl text-lg md:text-xl font-bold shadow-2xl shadow-primary/20 transition-all flex items-center justify-center gap-2 group"
        >
          🔥 Start Free — Get 10 Emails <ArrowRight className="group-hover:translate-x-1 transition-transform" />
        </Link>
        <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6 text-[10px] md:text-sm font-bold text-slate-400 uppercase tracking-widest">
          <span className="flex items-center gap-1.5"><ShieldCheck size={16} /> Money-back guarantee</span>
          <span className="hidden sm:block w-1.5 h-1.5 bg-slate-300 rounded-full" />
          <span className="flex items-center gap-1.5"><Star size={16} /> 4.9/5 Rating</span>
        </div>
      </div>
    </div>
  </section>
);

const Footer = () => (
  <footer className="py-12 px-4 md:px-6 border-t border-border/40">
    <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6 md:gap-8">
      <div className="flex items-center gap-2">
        <div className="w-6 h-6 bg-primary rounded flex items-center justify-center">
          <span className="text-white text-xs font-bold">❄</span>
        </div>
        <span className="font-bold text-slate-800">Mr. Cold Mail</span>
      </div>
      <p className="text-xs md:text-sm text-slate-400 font-medium text-center">© 2026 Mr. Cold Mail. All rights reserved.</p>
      <div className="flex items-center gap-6">
        <a href="#" className="text-xs md:text-sm font-bold text-slate-400 hover:text-primary transition-colors">Privacy</a>
        <a href="#" className="text-xs md:text-sm font-bold text-slate-400 hover:text-primary transition-colors">Terms</a>
      </div>
    </div>
  </footer>
);

const StickyCTA = () => {
  const [isVisible, setIsVisible] = React.useState(false);

  React.useEffect(() => {
    const handleScroll = () => {
      setIsVisible(window.scrollY > 800);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          className="fixed bottom-6 md:bottom-8 left-1/2 -translate-x-1/2 z-50 w-full max-w-md px-4 md:px-6"
        >
          <Link 
            to="/signup"
            className="w-full bg-primary text-white py-4 rounded-2xl font-bold shadow-2xl shadow-primary/40 flex items-center justify-center gap-2 hover:scale-105 transition-all text-sm md:text-base"
          >
            🔥 Start Free — Get 10 Emails <ArrowRight size={20} />
          </Link>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export const LandingPage = () => {
  return (
    <div className="min-h-screen bg-white">
      <Nav />
      <Hero />
      <Problem />
      <Solution />
      <HowItWorks />
      <BeforeAfter />
      
      {/* Free Offer Section */}
      <section className="py-16 md:py-24 px-4 md:px-6 bg-primary/5">
        <div className="max-w-4xl mx-auto glass p-8 md:p-12 rounded-[32px] md:rounded-[48px] border-primary/20 text-center space-y-6 md:space-y-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-48 md:w-64 h-48 md:h-64 bg-primary/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
          <h2 className="text-2xl md:text-4xl font-bold text-slate-900 tracking-tight px-4">Start Free — No Risk</h2>
          <div className="space-y-4 max-w-md mx-auto px-4">
            <p className="text-lg md:text-xl text-slate-600 font-medium">Sign up today and get:</p>
            <div className="space-y-3">
              {[
                "🔥 10 FREE AI-generated emails",
                "👉 No credit card needed",
                "👉 Try before you pay"
              ].map((item, i) => (
                <div key={i} className="p-4 bg-white rounded-2xl font-bold text-slate-800 shadow-sm text-sm md:text-base">
                  {item}
                </div>
              ))}
            </div>
          </div>
          <Link to="/signup" className="inline-flex w-full sm:w-auto bg-primary text-white px-10 py-4 md:py-5 rounded-2xl font-bold shadow-xl shadow-primary/20 hover:bg-primary/90 transition-all justify-center text-sm md:text-base">
            Get My 10 Free Emails
          </Link>
        </div>
      </section>

      <Pricing />
      <Testimonials />
      <FinalCTA />
      <Footer />
      <StickyCTA />
    </div>
  );
};
