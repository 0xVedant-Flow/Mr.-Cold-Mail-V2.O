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
          <span className="font-bold text-lg md:text-xl tracking-tight text-foreground">Mr. Cold Mail</span>
        </div>
        
        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-8">
          <a href="#features" className="text-sm font-bold text-muted-foreground hover:text-primary transition-colors">Features</a>
          <a href="#how-it-works" className="text-sm font-bold text-muted-foreground hover:text-primary transition-colors">How it Works</a>
          <a href="#pricing" className="text-sm font-bold text-muted-foreground hover:text-primary transition-colors">Pricing</a>
        </div>

        <div className="flex items-center gap-3 md:gap-4">
          <Link to="/login" className="hidden sm:block text-sm font-bold text-muted-foreground hover:text-primary transition-colors">Log In</Link>
          <Link to="/signup" className="bg-primary hover:bg-primary/90 text-primary-foreground px-4 md:px-6 py-2 md:py-2.5 rounded-xl text-xs md:text-sm font-bold shadow-lg shadow-primary/20 transition-all">
            Start Free
          </Link>
          <button 
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden p-2 text-muted-foreground"
          >
            {isOpen ? <XCircle size={24} /> : <div className="space-y-1.5"><div className="w-6 h-0.5 bg-foreground rounded-full" /><div className="w-6 h-0.5 bg-foreground rounded-full" /><div className="w-6 h-0.5 bg-foreground rounded-full" /></div>}
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
            <a href="#features" onClick={() => setIsOpen(false)} className="block text-sm font-bold text-muted-foreground px-2">Features</a>
            <a href="#how-it-works" onClick={() => setIsOpen(false)} className="block text-sm font-bold text-muted-foreground px-2">How it Works</a>
            <a href="#pricing" onClick={() => setIsOpen(false)} className="block text-sm font-bold text-muted-foreground px-2">Pricing</a>
            <Link to="/login" onClick={() => setIsOpen(false)} className="block text-sm font-bold text-muted-foreground px-2">Log In</Link>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

const Hero = () => (
  <section className="relative pt-32 md:pt-48 pb-20 md:pb-32 px-4 md:px-6 overflow-hidden bg-background">
    {/* Animated Background Elements */}
    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full overflow-hidden pointer-events-none">
      <motion.div 
        animate={{ 
          scale: [1, 1.2, 1],
          rotate: [0, 90, 0],
          opacity: [0.1, 0.2, 0.1]
        }}
        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        className="absolute -top-[20%] -right-[10%] w-[600px] h-[600px] bg-primary/30 rounded-full blur-[120px]" 
      />
      <motion.div 
        animate={{ 
          scale: [1.2, 1, 1.2],
          rotate: [0, -90, 0],
          opacity: [0.1, 0.15, 0.1]
        }}
        transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
        className="absolute -bottom-[20%] -left-[10%] w-[500px] h-[500px] bg-primary/20 rounded-full blur-[100px]" 
      />
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay" />
    </div>
    
    <div className="max-w-7xl mx-auto relative z-10">
      <div className="grid lg:grid-cols-2 gap-16 items-center">
        <div className="text-left space-y-8">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-primary text-[10px] md:text-xs font-bold uppercase tracking-widest backdrop-blur-md"
          >
            <Sparkles size={14} className="animate-pulse" /> The Future of Outreach is Here
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="text-4xl sm:text-5xl md:text-8xl font-bold text-white tracking-tighter leading-[0.9] md:leading-[0.85]"
          >
            Turn Cold Leads <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-indigo-400 to-primary bg-[length:200%_auto] animate-gradient">Into Warm Deals.</span>
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.8 }}
            className="text-lg md:text-2xl text-muted-foreground font-medium max-w-xl leading-relaxed"
          >
            Stop wasting hours on manual research. Our AI crafts deeply personalized, high-converting cold emails in seconds.
          </motion.p>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.8 }}
            className="flex flex-col sm:flex-row items-center gap-6"
          >
            <Link 
              to="/signup" 
              className="w-full sm:w-auto bg-primary hover:bg-primary/90 text-white px-10 py-6 rounded-2xl text-lg font-bold shadow-2xl shadow-primary/40 transition-all flex items-center justify-center gap-3 group relative overflow-hidden"
            >
              <span className="relative z-10 flex items-center gap-2">
                Get Started Free <ArrowRight className="group-hover:translate-x-1 transition-transform" />
              </span>
              <motion.div 
                className="absolute inset-0 bg-white/20"
                initial={{ x: '-100%' }}
                whileHover={{ x: '100%' }}
                transition={{ duration: 0.5 }}
              />
            </Link>
            <div className="flex flex-col items-start">
              <div className="flex -space-x-2 mb-2">
                {[1, 2, 3, 4].map(i => (
                  <img 
                    key={i}
                    src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${i + 10}`} 
                    className="w-8 h-8 rounded-full border-2 border-background bg-muted"
                    alt="user"
                  />
                ))}
              </div>
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
                Trusted by 500+ Founders
              </p>
            </div>
          </motion.div>
        </div>

        <motion.div 
          initial={{ opacity: 0, scale: 0.8, rotateY: 20 }}
          animate={{ opacity: 1, scale: 1, rotateY: 0 }}
          transition={{ delay: 0.3, duration: 1, ease: "easeOut" }}
          className="relative hidden lg:block perspective-1000"
        >
          <div className="relative z-10 transform-gpu hover:rotate-y-12 hover:rotate-x-12 transition-transform duration-500 ease-out">
            <div className="glass p-8 rounded-[40px] border-white/10 shadow-[0_0_50px_-12px_rgba(79,70,229,0.5)] bg-white/5 backdrop-blur-2xl">
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
                      <Sparkles className="text-white" size={20} />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-muted-foreground uppercase tracking-widest">AI Generator</div>
                      <div className="text-sm font-bold text-foreground">Crafting your message...</div>
                    </div>
                  </div>
                  <div className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-[10px] font-bold uppercase tracking-widest border border-emerald-500/20">
                    Active
                  </div>
                </div>
                
                <div className="space-y-3">
                  <motion.div 
                    animate={{ opacity: [0.3, 1, 0.3] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="h-3 bg-white/10 rounded-full w-3/4" 
                  />
                  <motion.div 
                    animate={{ opacity: [0.3, 1, 0.3] }}
                    transition={{ duration: 2, delay: 0.5, repeat: Infinity }}
                    className="h-3 bg-white/10 rounded-full w-full" 
                  />
                  <motion.div 
                    animate={{ opacity: [0.3, 1, 0.3] }}
                    transition={{ duration: 2, delay: 1, repeat: Infinity }}
                    className="h-3 bg-white/10 rounded-full w-5/6" 
                  />
                </div>

                <div className="p-6 bg-white/5 rounded-2xl border border-white/10">
                  <p className="text-sm text-muted-foreground font-medium leading-relaxed italic">
                    "Hey Sarah, I saw your recent post about scaling engineering teams. Your point about 'culture-first' hiring really resonated..."
                  </p>
                </div>

                <div className="flex gap-3">
                  <div className="flex-1 h-12 bg-primary/20 rounded-xl border border-primary/30 flex items-center justify-center text-primary font-bold text-sm">
                    Personalizing
                  </div>
                  <div className="w-12 h-12 bg-white/5 rounded-xl border border-white/10 flex items-center justify-center text-muted-foreground">
                    <Target size={20} />
                  </div>
                </div>
              </div>
            </div>

            {/* Floating Elements */}
            <motion.div 
              animate={{ y: [0, -20, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              className="absolute -top-10 -right-10 glass p-4 rounded-2xl border-white/10 shadow-2xl bg-white/10 backdrop-blur-xl"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center">
                  <CheckCircle2 className="text-white" size={16} />
                </div>
                <div className="text-xs font-bold text-foreground">Reply Rate +45%</div>
              </div>
            </motion.div>

            <motion.div 
              animate={{ y: [0, 20, 0] }}
              transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
              className="absolute -bottom-10 -left-10 glass p-4 rounded-2xl border-white/10 shadow-2xl bg-white/10 backdrop-blur-xl"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                  <Zap className="text-white" size={16} />
                </div>
                <div className="text-xs font-bold text-foreground">10x Faster</div>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </div>
  </section>
);

const Problem = () => (
  <section className="py-24 md:py-32 px-4 md:px-6 bg-white relative overflow-hidden">
    <div className="max-w-7xl mx-auto">
      <div className="grid lg:grid-cols-2 gap-16 items-center">
        <div className="space-y-8">
          <motion.div 
            whileInView={{ opacity: 1, x: 0 }}
            initial={{ opacity: 0, x: -20 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-red-500/10 text-red-600 text-xs font-bold uppercase tracking-widest"
          >
            <XCircle size={14} /> The Problem
          </motion.div>
          <h2 className="text-4xl md:text-6xl font-bold text-foreground tracking-tight leading-tight">
            The Old Way of <br />
            <span className="text-muted-foreground/60">Outreach is Dead.</span>
          </h2>
          <p className="text-xl text-muted-foreground font-medium leading-relaxed">
            Prospects are tired of generic templates. If your email looks like a mass-blast, it's going straight to the trash.
          </p>
          
          <div className="space-y-6">
            {[
              { title: "Low Response Rates", desc: "Generic emails get a <1% reply rate.", icon: BarChart3 },
              { title: "Manual Research Hell", desc: "Spending hours researching one lead is unscalable.", icon: Clock },
              { title: "Spam Folder Trap", desc: "Unpersonalized blasts trigger spam filters.", icon: ShieldCheck }
            ].map((item, i) => (
              <motion.div 
                key={i}
                whileInView={{ opacity: 1, y: 0 }}
                initial={{ opacity: 0, y: 20 }}
                transition={{ delay: i * 0.1 }}
                className="flex gap-4 p-6 rounded-3xl hover:bg-muted transition-colors group"
              >
                <div className="w-12 h-12 bg-muted rounded-2xl flex items-center justify-center text-muted-foreground group-hover:bg-red-500/10 group-hover:text-red-500 transition-colors">
                  <item.icon size={24} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-foreground">{item.title}</h3>
                  <p className="text-muted-foreground font-medium">{item.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
        
        <div className="relative">
          <div className="absolute inset-0 bg-red-500/5 rounded-[48px] blur-3xl" />
          <div className="relative glass p-10 rounded-[48px] border-border shadow-2xl bg-card">
            <div className="space-y-6">
              <div className="flex items-center justify-between border-b border-border pb-6">
                <div className="font-bold text-foreground">Outbox (Traditional)</div>
                <div className="text-red-500 font-bold text-sm">98% Unopened</div>
              </div>
              <div className="space-y-4">
                {[1, 2, 3].map(i => (
                  <div key={i} className="p-4 bg-muted rounded-2xl border border-border opacity-50">
                    <div className="h-2 bg-muted-foreground/20 rounded-full w-1/2 mb-2" />
                    <div className="h-2 bg-muted-foreground/20 rounded-full w-full" />
                  </div>
                ))}
                <div className="p-6 bg-red-50 rounded-2xl border border-red-100 text-center">
                  <p className="text-red-600 font-bold">"Just another template..."</p>
                  <p className="text-xs text-red-400 mt-1">Deleted in 2 seconds</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
);

const Solution = () => (
  <section id="features" className="py-24 md:py-32 px-4 md:px-6 bg-muted relative overflow-hidden">
    <div className="max-w-7xl mx-auto">
      <div className="text-center max-w-3xl mx-auto mb-20 space-y-6">
        <motion.div 
          whileInView={{ opacity: 1, scale: 1 }}
          initial={{ opacity: 0, scale: 0.9 }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-widest"
        >
          <Sparkles size={14} /> The Solution
        </motion.div>
        <h2 className="text-4xl md:text-6xl font-bold text-foreground tracking-tight">
          AI That Thinks Like a <br />
          <span className="text-primary">World-Class Salesperson.</span>
        </h2>
        <p className="text-xl text-muted-foreground font-medium">
          Mr. Cold Mail doesn't just write emails. It researches your leads, understands their business, and crafts a message they can't ignore.
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        {[
          { 
            title: "Smart Personalization", 
            desc: "AI analyzes lead data to write unique, relevant opening lines that build instant rapport.",
            icon: Target,
            color: "bg-primary"
          },
          { 
            title: "Contextual Awareness", 
            desc: "Our AI understands industry trends and company news to make your pitch feel timely and informed.",
            icon: Zap,
            color: "bg-amber-500"
          },
          { 
            title: "High-Conversion Copy", 
            desc: "Trained on thousands of successful campaigns to use psychological triggers that drive replies.",
            icon: Sparkles,
            color: "bg-primary"
          }
        ].map((feature, i) => (
          <motion.div 
            key={i}
            whileInView={{ opacity: 1, y: 0 }}
            initial={{ opacity: 0, y: 30 }}
            transition={{ delay: i * 0.1 }}
            whileHover={{ y: -10 }}
            className="glass p-10 rounded-[40px] border-border bg-card shadow-xl hover:shadow-2xl transition-all group"
          >
            <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center text-white mb-8 shadow-lg", feature.color)}>
              <feature.icon size={28} />
            </div>
            <h3 className="text-2xl font-bold text-foreground mb-4">{feature.title}</h3>
            <p className="text-muted-foreground font-medium leading-relaxed">{feature.desc}</p>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);

const HowItWorks = () => (
  <section id="how-it-works" className="py-24 md:py-32 px-4 md:px-6 bg-background text-foreground relative overflow-hidden">
    <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
      <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_50%,#4f46e5,transparent_70%)]" />
    </div>
    
    <div className="max-w-7xl mx-auto relative z-10">
      <div className="text-center mb-20 space-y-4">
        <h2 className="text-4xl md:text-6xl font-bold tracking-tight">How It Works</h2>
        <p className="text-muted-foreground text-xl font-medium">From lead list to booked calls in 3 simple steps.</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-16 relative">
        {/* Connection Lines (Desktop) */}
        <div className="hidden md:block absolute top-1/2 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-y-1/2" />
        
        {[
          { 
            icon: Upload, 
            title: "1. Upload Leads", 
            desc: "Drag and drop your CSV. We support all major formats and data points.",
            step: "01"
          },
          { 
            icon: Sparkles, 
            title: "2. AI Magic", 
            desc: "Our AI researches each lead and generates a custom-tailored email sequence.",
            step: "02"
          },
          { 
            icon: Send, 
            title: "3. Scale Outreach", 
            desc: "Export your personalized emails and watch the replies roll in.",
            step: "03"
          }
        ].map((step, i) => (
          <motion.div 
            key={i}
            whileInView={{ opacity: 1, scale: 1 }}
            initial={{ opacity: 0, scale: 0.9 }}
            transition={{ delay: i * 0.2 }}
            className="relative group"
          >
            <div className="text-8xl font-black text-foreground/5 absolute -top-10 -left-4 select-none group-hover:text-primary/10 transition-colors">
              {step.step}
            </div>
            <div className="space-y-6 relative z-10">
              <div className="w-20 h-20 bg-primary rounded-3xl flex items-center justify-center shadow-2xl shadow-primary/40 group-hover:scale-110 transition-transform text-white">
                <step.icon size={32} />
              </div>
              <h3 className="text-2xl font-bold">{step.title}</h3>
              <p className="text-muted-foreground text-lg leading-relaxed">{step.desc}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);

const BeforeAfter = () => (
  <section className="py-16 md:py-24 px-4 md:px-6 bg-background">
    <div className="max-w-5xl mx-auto">
      <div className="text-center mb-12 md:mb-16">
        <h2 className="text-3xl md:text-4xl font-bold text-foreground tracking-tight">Before vs After</h2>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
        <div className="glass p-8 md:p-10 rounded-[32px] md:rounded-[40px] border-destructive/20 bg-destructive/5">
          <div className="flex items-center gap-2 text-destructive font-bold uppercase tracking-widest text-[10px] md:text-xs mb-6">
            <XCircle size={16} /> Before
          </div>
          <div className="p-5 md:p-6 bg-card rounded-2xl shadow-sm text-muted-foreground font-medium italic text-sm md:text-base">
            “Hi, I’m reaching out to offer my service…”
          </div>
          <p className="mt-6 text-center font-bold text-foreground">👉 Ignored.</p>
        </div>
        
        <div className="glass p-8 md:p-10 rounded-[32px] md:rounded-[40px] border-emerald-500/20 bg-emerald-500/5">
          <div className="flex items-center gap-2 text-emerald-600 font-bold uppercase tracking-widest text-[10px] md:text-xs mb-6">
            <CheckCircle2 size={16} /> After
          </div>
          <div className="p-5 md:p-6 bg-card rounded-2xl shadow-sm text-foreground font-bold italic text-sm md:text-base">
            “Hey John, noticed your company recently launched a new feature…”
          </div>
          <p className="mt-6 text-center font-bold text-foreground">👉 Gets replies.</p>
        </div>
      </div>
    </div>
  </section>
);

const Pricing = () => {
  const [isYearly, setIsYearly] = React.useState(true);

  return (
    <section id="pricing" className="py-16 md:py-24 px-4 md:px-6 bg-muted">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12 md:mb-16 space-y-4">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground tracking-tight">Simple, Affordable Pricing</h2>
          <div className="flex items-center justify-center gap-4">
            <span className={cn("text-xs md:text-sm font-bold", !isYearly ? "text-foreground" : "text-muted-foreground")}>Monthly</span>
            <button 
              onClick={() => setIsYearly(!isYearly)}
              className="w-12 md:w-14 h-7 md:h-8 bg-muted-foreground/20 rounded-full p-1 transition-all relative"
            >
              <div className={cn(
                "w-5 h-5 md:w-6 md:h-6 bg-primary rounded-full transition-all shadow-sm",
                isYearly ? "translate-x-5 md:translate-x-6" : "translate-x-0"
              )} />
            </button>
            <span className={cn("text-xs md:text-sm font-bold flex items-center gap-2", isYearly ? "text-foreground" : "text-muted-foreground")}>
              Yearly <span className="bg-emerald-500 text-white text-[8px] md:text-[10px] px-2 py-0.5 rounded-full shrink-0">SAVE BIG</span>
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 max-w-4xl mx-auto">
          {/* Pro Plan */}
          <motion.div 
            whileHover={{ y: -10, rotateX: 2, rotateY: -2 }}
            className="glass p-8 md:p-12 rounded-[32px] md:rounded-[48px] border-border bg-card shadow-xl transition-all"
          >
            <div className="mb-8">
              <div className="text-[10px] md:text-xs font-bold text-muted-foreground uppercase tracking-widest mb-2">Pro Plan</div>
              <h3 className="text-xl md:text-2xl font-bold text-foreground mb-4">💼 Mr. Cold Mail Pro</h3>
              <div className="flex items-baseline gap-1">
                <span className="text-4xl md:text-5xl font-bold text-foreground">{isYearly ? '$17' : '$29'}</span>
                <span className="text-muted-foreground font-medium text-sm md:text-base">/mo</span>
              </div>
              {isYearly && <p className="text-emerald-600 text-xs md:text-sm font-bold mt-2">🔥 Limited Offer</p>}
            </div>
            <div className="space-y-4 mb-10 flex-1">
              {['AI personalized emails', 'Bulk generation', 'Export emails', 'Basic analytics'].map((f, i) => (
                <div key={i} className="flex items-center gap-3 text-sm md:text-base text-muted-foreground font-medium">
                  <CheckCircle2 size={18} className="text-emerald-500 shrink-0" /> {f}
                </div>
              ))}
            </div>
            <Link to="/signup" className="w-full py-4 md:py-5 rounded-2xl bg-foreground text-background font-bold text-center hover:bg-foreground/90 transition-all text-sm md:text-base">
              Start Free → Upgrade Anytime
            </Link>
          </motion.div>

          {/* Agency Plan */}
          <motion.div 
            whileHover={{ y: -10, rotateX: 2, rotateY: 2 }}
            className="glass p-8 md:p-12 rounded-[32px] md:rounded-[48px] border-primary/40 shadow-2xl shadow-primary/5 relative md:scale-105 z-10 flex flex-col bg-card transition-all"
          >
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-primary text-white px-4 py-1 rounded-full text-[9px] md:text-[10px] font-bold uppercase tracking-widest flex items-center gap-1 shadow-lg shadow-primary/20 whitespace-nowrap">
              <Sparkles size={12} /> 🔥 Best Value
            </div>
            <div className="mb-8">
              <div className="text-[10px] md:text-xs font-bold text-primary uppercase tracking-widest mb-2">Agency Plan</div>
              <h3 className="text-xl md:text-2xl font-bold text-foreground mb-4">🚀 Agency</h3>
              <div className="flex items-baseline gap-1">
                <span className="text-4xl md:text-5xl font-bold text-foreground">{isYearly ? '$41' : '$69'}</span>
                <span className="text-muted-foreground font-medium text-sm md:text-base">/mo</span>
              </div>
              {isYearly && <p className="text-primary text-xs md:text-sm font-bold mt-2">⚡ LIMITED DEAL</p>}
            </div>
            <div className="space-y-4 mb-10 flex-1">
              {['Everything in Pro', 'Unlimited email generation', 'Team access', 'Advanced AI personalization', 'Priority support'].map((f, i) => (
                <div key={i} className="flex items-center gap-3 text-sm md:text-base text-muted-foreground font-medium">
                  <CheckCircle2 size={18} className="text-primary shrink-0" /> {f}
                </div>
              ))}
            </div>
            <Link to="/signup" className="w-full py-4 md:py-5 rounded-2xl bg-primary text-white font-bold text-center hover:bg-primary/90 shadow-xl shadow-primary/20 transition-all text-sm md:text-base">
              🔥 Upgrade to Agency
            </Link>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

const Testimonials = () => (
  <section className="py-16 md:py-24 px-4 md:px-6 bg-background">
    <div className="max-w-7xl mx-auto">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
        {[
          { text: "Got 3 replies in 1 day after switching to Mr. Cold Mail. Insane.", author: "Founder @ TechFlow" },
          { text: "Saved me hours of writing. AI actually works.", author: "Freelance Designer" }
        ].map((t, i) => (
          <div key={i} className="glass p-8 md:p-10 rounded-[32px] md:rounded-[40px] border-border relative bg-card">
            <div className="absolute -top-4 -left-4 w-10 h-10 md:w-12 md:h-12 bg-primary/10 rounded-xl md:rounded-2xl flex items-center justify-center text-primary">
              <MessageSquare size={20} className="md:w-6 md:h-6" />
            </div>
            <p className="text-lg md:text-xl font-bold text-foreground mb-6">“{t.text}”</p>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-muted shrink-0" />
              <span className="font-bold text-muted-foreground text-sm md:text-base">{t.author}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  </section>
);

const FinalCTA = () => (
  <section className="py-24 md:py-32 px-4 md:px-6 relative overflow-hidden bg-background">
    <div className="absolute inset-0 pointer-events-none">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/20 rounded-full blur-[120px]" />
    </div>
    
    <div className="max-w-4xl mx-auto text-center relative z-10 space-y-10">
      <motion.h2 
        whileInView={{ opacity: 1, scale: 1 }}
        initial={{ opacity: 0, scale: 0.9 }}
        className="text-4xl md:text-7xl font-bold text-foreground tracking-tight leading-tight"
      >
        Ready to Scale Your <br />
        <span className="text-primary">Outreach to the Moon?</span>
      </motion.h2>
      
      <div className="flex flex-col items-center gap-6">
        <Link 
          to="/signup" 
          className="w-full sm:w-auto bg-primary hover:bg-primary/90 text-white px-12 py-6 rounded-2xl text-xl font-bold shadow-[0_0_50px_-12px_rgba(79,70,229,0.8)] transition-all flex items-center justify-center gap-3 group"
        >
          Start Your Free Trial <ArrowRight className="group-hover:translate-x-1 transition-transform" />
        </Link>
        <div className="flex flex-col sm:flex-row items-center gap-6 text-sm font-bold text-muted-foreground uppercase tracking-widest">
          <span className="flex items-center gap-2"><ShieldCheck size={18} className="text-emerald-500" /> No Credit Card Required</span>
          <span className="hidden sm:block w-1.5 h-1.5 bg-muted rounded-full" />
          <span className="flex items-center gap-2"><Star size={18} className="text-amber-500" /> 10 Free Emails Included</span>
        </div>
      </div>
    </div>
  </section>
);

const Footer = () => (
  <footer className="py-12 px-4 md:px-6 border-t border-border/40 bg-background">
    <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6 md:gap-8">
      <div className="flex items-center gap-2">
        <div className="w-6 h-6 bg-primary rounded flex items-center justify-center">
          <span className="text-white text-xs font-bold">❄</span>
        </div>
        <span className="font-bold text-foreground">Mr. Cold Mail</span>
      </div>
      <p className="text-xs md:text-sm text-muted-foreground font-medium text-center">© 2026 Mr. Cold Mail. All rights reserved.</p>
      <div className="flex items-center gap-6">
        <a href="#" className="text-xs md:text-sm font-bold text-muted-foreground hover:text-primary transition-colors">Privacy</a>
        <a href="#" className="text-xs md:text-sm font-bold text-muted-foreground hover:text-primary transition-colors">Terms</a>
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
    <div className="min-h-screen bg-background text-foreground">
      <Nav />
      <Hero />
      <Problem />
      <Solution />
      <HowItWorks />
      <BeforeAfter />
      
      {/* Free Offer Section */}
      <section className="py-16 md:py-24 px-4 md:px-6 bg-primary/5">
        <div className="max-w-4xl mx-auto glass p-8 md:p-12 rounded-[32px] md:rounded-[48px] border-primary/20 text-center space-y-6 md:space-y-8 relative overflow-hidden bg-card">
          <div className="absolute top-0 right-0 w-48 md:w-64 h-48 md:h-64 bg-primary/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
          <h2 className="text-2xl md:text-4xl font-bold text-foreground tracking-tight px-4">Start Free — No Risk</h2>
          <div className="space-y-4 max-w-md mx-auto px-4">
            <p className="text-lg md:text-xl text-muted-foreground font-medium">Sign up today and get:</p>
            <div className="space-y-3">
              {[
                "🔥 10 FREE AI-generated emails",
                "👉 No credit card needed",
                "👉 Try before you pay"
              ].map((item, i) => (
                <div key={i} className="p-4 bg-muted rounded-2xl font-bold text-foreground shadow-sm text-sm md:text-base">
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
