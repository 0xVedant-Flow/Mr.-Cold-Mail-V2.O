import React from 'react';
import { motion } from 'motion/react';
import { 
  CheckCircle2, 
  Zap, 
  ShieldCheck, 
  Globe, 
  ArrowRight, 
  Sparkles,
  CreditCard,
  Clock,
  AlertCircle,
  Shield,
  Star
} from 'lucide-react';
import { cn } from '../lib/utils';
import { useStore } from '../store/useStore';
import { api } from '../lib/api';

export const Billing = () => {
  const { user } = useStore();
  const [loading, setLoading] = React.useState<string | null>(null);
  const [isYearly, setIsYearly] = React.useState(true);

  const plans = [
    {
      name: 'Pro',
      price: isYearly ? '$17' : '$29',
      credits: '1,000',
      features: [
        '1,000 AI Personalizations / mo',
        'Priority AI Generation',
        'Advanced Personalization',
        'Priority Support',
        'Detailed Analytics'
      ],
      color: 'bg-primary',
      popular: true,
      planId: isYearly ? 'pro_yearly' : 'pro_monthly'
    },
    {
      name: 'Agency',
      price: isYearly ? '$41' : '$69',
      credits: '5,000',
      features: [
        '5,000 AI Personalizations / mo',
        'Team Collaboration (5 seats)',
        'White-label Reports',
        'Dedicated Account Manager',
        'Custom AI Training'
      ],
      color: 'bg-indigo-600',
      planId: isYearly ? 'agency_yearly' : 'agency_monthly'
    }
  ];

  const handleUpgrade = async (planName: string, planId: string) => {
    setLoading(planId);
    try {
      const data = await api.post('/create-checkout-session', { 
        userId: user?.id,
        planId 
      });
      
      if (data.url) window.location.href = data.url;
    } catch (err) {
      console.error('Checkout error:', err);
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="space-y-8 md:space-y-12">
      {/* Header */}
      <div className="text-center space-y-4 md:space-y-6 max-w-2xl mx-auto">
        <h2 className="text-3xl md:text-4xl font-bold text-foreground tracking-tight">Simple, Transparent Pricing</h2>
        <div className="flex items-center justify-center gap-4">
          <span className={cn("text-sm font-bold", !isYearly ? "text-foreground" : "text-muted-foreground")}>Monthly</span>
          <button 
            onClick={() => setIsYearly(!isYearly)}
            className="w-14 h-8 bg-muted rounded-full p-1 transition-all relative"
          >
            <div className={cn(
              "w-6 h-6 bg-primary rounded-full transition-all shadow-sm",
              isYearly ? "translate-x-6" : "translate-x-0"
            )} />
          </button>
          <span className={cn("text-sm font-bold flex items-center gap-2", isYearly ? "text-foreground" : "text-muted-foreground")}>
            Yearly <span className="bg-emerald-500 text-white text-[10px] px-2 py-0.5 rounded-full">SAVE BIG</span>
          </span>
        </div>
      </div>

      {/* Current Plan Card */}
      <div className="bg-card p-6 md:p-8 rounded-[40px] border border-primary/20 flex flex-col md:flex-row items-center justify-between gap-6 md:gap-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        
        <div className="flex flex-col sm:flex-row items-center gap-4 md:gap-6 relative z-10 text-center sm:text-left">
          <div className="w-16 h-16 md:w-20 md:h-20 bg-primary rounded-3xl flex items-center justify-center text-primary-foreground shadow-2xl shadow-primary/20 shrink-0">
            <Zap size={32} className="md:w-10 md:h-10" fill="currentColor" />
          </div>
          <div>
            <div className="text-[10px] md:text-xs font-bold text-primary uppercase tracking-widest mb-1">Current Plan</div>
            <h3 className="text-2xl md:text-3xl font-bold text-foreground">{user?.subscription?.plan || 'Free Tier'}</h3>
            <p className="text-sm md:text-base text-muted-foreground font-medium">Your plan will renew on {user?.subscription?.current_period_end ? new Date(user.subscription.current_period_end).toLocaleDateString() : 'N/A'}</p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-6 md:gap-12 relative z-10 w-full md:w-auto">
          <div className="text-center">
            <div className="text-[10px] md:text-xs font-bold text-muted-foreground uppercase tracking-widest mb-1">Credits Remaining</div>
            <div className="text-xl md:text-2xl font-bold text-foreground">{user?.credits?.total_credits || 0}</div>
          </div>
          <div className="h-12 w-px bg-border/60 hidden md:block" />
          <button 
            onClick={() => window.open('https://billing.stripe.com/p/login/test_6oE7v95f4g5f', '_blank')}
            className="w-full sm:w-auto px-8 py-4 bg-muted text-muted-foreground rounded-2xl font-bold hover:bg-muted/80 transition-all"
          >
            Manage Subscription
          </button>
        </div>
      </div>

      {/* Pricing Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
        {plans.map((plan, i) => (
          <motion.div
            key={plan.name}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className={cn(
              "glass p-8 md:p-10 rounded-[48px] border-border/40 relative flex flex-col",
              plan.popular && "border-primary/40 shadow-2xl shadow-primary/5 md:scale-105 z-10"
            )}
          >
            {plan.popular && (
              <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-primary text-white px-4 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest flex items-center gap-1 shadow-lg shadow-primary/20">
                <Sparkles size={12} /> Most Popular
              </div>
            )}

            <div className="mb-6 md:mb-8 text-center md:text-left">
              <h4 className="text-lg md:text-xl font-bold text-foreground mb-2">{plan.name}</h4>
              <div className="flex items-baseline justify-center md:justify-start gap-1">
                <span className="text-3xl md:text-4xl font-bold text-foreground">{plan.price}</span>
                <span className="text-muted-foreground font-medium">/mo</span>
              </div>
            </div>

            <div className="space-y-4 mb-8 md:mb-10 flex-1">
              {plan.features.map((feature, j) => (
                <div key={j} className="flex items-start gap-3 text-sm font-medium text-muted-foreground">
                  <CheckCircle2 size={18} className="text-emerald-500 mt-0.5 shrink-0" />
                  {feature}
                </div>
              ))}
            </div>

            <button 
              onClick={() => handleUpgrade(plan.name, plan.planId)}
              disabled={loading !== null || user?.subscription?.plan?.toLowerCase() === plan.name.toLowerCase()}
              className={cn(
                "w-full py-4 md:py-5 rounded-2xl font-bold transition-all flex items-center justify-center gap-2 shadow-xl",
                plan.popular ? "bg-primary text-primary-foreground shadow-primary/20 hover:bg-primary/90" : "bg-foreground text-background shadow-foreground/10 hover:opacity-90",
                user?.subscription?.plan?.toLowerCase() === plan.name.toLowerCase() && "opacity-50 cursor-not-allowed"
              )}
            >
              {loading === plan.planId ? 'Processing...' : user?.subscription?.plan?.toLowerCase() === plan.name.toLowerCase() ? 'Current Plan' : 'Upgrade Now'} 
              {loading !== plan.planId && <ArrowRight size={20} />}
            </button>
          </motion.div>
        ))}
      </div>

      {/* FAQ / Security */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-8 md:pt-12">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-emerald-500/10 rounded-2xl flex items-center justify-center text-emerald-500 shrink-0">
            <ShieldCheck size={24} />
          </div>
          <div>
            <h5 className="font-bold text-foreground mb-1">Secure Payments</h5>
            <p className="text-sm text-muted-foreground font-medium">All transactions are secured by Stripe with 256-bit encryption.</p>
          </div>
        </div>
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary shrink-0">
            <Clock size={24} />
          </div>
          <div>
            <h5 className="font-bold text-foreground mb-1">Cancel Anytime</h5>
            <p className="text-sm text-muted-foreground font-medium">No long-term contracts. Pause or cancel your subscription at any time.</p>
          </div>
        </div>
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-indigo-500/10 rounded-2xl flex items-center justify-center text-indigo-500 shrink-0">
            <AlertCircle size={24} />
          </div>
          <div>
            <h5 className="font-bold text-foreground mb-1">Money Back Guarantee</h5>
            <p className="text-sm text-muted-foreground font-medium">Not satisfied? We offer a 7-day money-back guarantee on all plans.</p>
          </div>
        </div>
      </div>
    </div>
  );
};
