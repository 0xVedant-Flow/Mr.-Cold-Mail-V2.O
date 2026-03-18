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

const plans = [
  {
    name: 'Starter',
    price: '$19',
    credits: '500',
    features: [
      '500 AI Personalizations / mo',
      'Unlimited Campaigns',
      'CSV Lead Import',
      'Standard Support',
      'Basic Analytics'
    ],
    color: 'bg-slate-800',
    priceId: 'price_starter_id'
  },
  {
    name: 'Pro',
    price: '$29',
    credits: '2,000',
    features: [
      '2,000 AI Personalizations / mo',
      'Priority AI Generation',
      'Advanced Personalization',
      'Priority Support',
      'Detailed Analytics'
    ],
    color: 'bg-primary',
    popular: true,
    priceId: 'price_pro_id'
  },
  {
    name: 'Agency',
    price: '$69',
    credits: 'Unlimited',
    features: [
      'Unlimited Personalizations',
      'Team Collaboration (5 seats)',
      'White-label Reports',
      'Dedicated Account Manager',
      'Custom AI Training'
    ],
    color: 'bg-purple-600',
    priceId: 'price_agency_id'
  }
];

export const Billing = () => {
  const { user } = useStore();
  const [loading, setLoading] = React.useState<string | null>(null);

  const handleUpgrade = async (planName: string, priceId: string) => {
    setLoading(priceId);
    try {
      const response = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          userId: user?.id,
          plan: planName.toLowerCase(),
          priceId 
        })
      });
      
      const { url } = await response.json();
      if (url) window.location.href = url;
    } catch (err) {
      console.error('Checkout error:', err);
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="space-y-12">
      {/* Header */}
      <div className="text-center space-y-4 max-w-2xl mx-auto">
        <h2 className="text-4xl font-bold text-slate-800 tracking-tight">Simple, Transparent Pricing</h2>
        <p className="text-slate-500 font-medium text-lg">Choose the plan that's right for your business growth.</p>
      </div>

      {/* Current Plan Card */}
      <div className="glass p-8 rounded-[40px] border-primary/20 flex flex-col md:flex-row items-center justify-between gap-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        
        <div className="flex items-center gap-6 relative z-10">
          <div className="w-20 h-20 bg-primary rounded-3xl flex items-center justify-center text-white shadow-2xl shadow-primary/20">
            <Zap size={40} fill="currentColor" />
          </div>
          <div>
            <div className="text-xs font-bold text-primary uppercase tracking-widest mb-1">Current Plan</div>
            <h3 className="text-3xl font-bold text-slate-800">{user?.subscription?.plan || 'Free Tier'}</h3>
            <p className="text-slate-500 font-medium">Your plan will renew on {user?.subscription?.current_period_end ? new Date(user.subscription.current_period_end).toLocaleDateString() : 'N/A'}</p>
          </div>
        </div>

        <div className="flex items-center gap-12 relative z-10">
          <div className="text-center">
            <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Credits Used</div>
            <div className="text-2xl font-bold text-slate-800">{user?.credits?.used_credits || 0} / {user?.credits?.total_credits || 10}</div>
          </div>
          <div className="h-12 w-px bg-border/60 hidden md:block" />
          <button className="px-8 py-4 glass rounded-2xl font-bold text-slate-600 hover:bg-white transition-all">
            Manage Subscription
          </button>
        </div>
      </div>

      {/* Pricing Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {plans.map((plan, i) => (
          <motion.div
            key={plan.name}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className={cn(
              "glass p-10 rounded-[48px] border-border/40 relative flex flex-col",
              plan.popular && "border-primary/40 shadow-2xl shadow-primary/5 scale-105 z-10"
            )}
          >
            {plan.popular && (
              <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-primary text-white px-4 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest flex items-center gap-1 shadow-lg shadow-primary/20">
                <Sparkles size={12} /> Most Popular
              </div>
            )}

            <div className="mb-8">
              <h4 className="text-xl font-bold text-slate-800 mb-2">{plan.name}</h4>
              <div className="flex items-baseline gap-1">
                <span className="text-4xl font-bold text-slate-800">{plan.price}</span>
                <span className="text-slate-500 font-medium">/mo</span>
              </div>
            </div>

            <div className="space-y-4 mb-10 flex-1">
              {plan.features.map((feature, j) => (
                <div key={j} className="flex items-start gap-3 text-sm font-medium text-slate-600">
                  <CheckCircle2 size={18} className="text-emerald-500 mt-0.5 shrink-0" />
                  {feature}
                </div>
              ))}
            </div>

            <button 
              onClick={() => handleUpgrade(plan.name, plan.priceId)}
              disabled={loading !== null || user?.subscription?.plan?.toLowerCase() === plan.name.toLowerCase()}
              className={cn(
                "w-full py-5 rounded-2xl font-bold transition-all flex items-center justify-center gap-2 shadow-xl",
                plan.popular ? "bg-primary text-white shadow-primary/20 hover:bg-primary/90" : "bg-slate-800 text-white shadow-slate-200 hover:bg-slate-900",
                user?.subscription?.plan?.toLowerCase() === plan.name.toLowerCase() && "opacity-50 cursor-not-allowed"
              )}
            >
              {loading === plan.priceId ? 'Processing...' : user?.subscription?.plan?.toLowerCase() === plan.name.toLowerCase() ? 'Current Plan' : 'Upgrade Now'} 
              {loading !== plan.priceId && <ArrowRight size={20} />}
            </button>
          </motion.div>
        ))}
      </div>

      {/* FAQ / Security */}
      <div className="grid md:grid-cols-3 gap-8 pt-12">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-emerald-500/10 rounded-2xl flex items-center justify-center text-emerald-500 shrink-0">
            <ShieldCheck size={24} />
          </div>
          <div>
            <h5 className="font-bold text-slate-800 mb-1">Secure Payments</h5>
            <p className="text-sm text-slate-500 font-medium">All transactions are secured by Stripe with 256-bit encryption.</p>
          </div>
        </div>
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary shrink-0">
            <Clock size={24} />
          </div>
          <div>
            <h5 className="font-bold text-slate-800 mb-1">Cancel Anytime</h5>
            <p className="text-sm text-slate-500 font-medium">No long-term contracts. Pause or cancel your subscription at any time.</p>
          </div>
        </div>
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-purple-500/10 rounded-2xl flex items-center justify-center text-purple-500 shrink-0">
            <AlertCircle size={24} />
          </div>
          <div>
            <h5 className="font-bold text-slate-800 mb-1">Money Back Guarantee</h5>
            <p className="text-sm text-slate-500 font-medium">Not satisfied? We offer a 7-day money-back guarantee on all plans.</p>
          </div>
        </div>
      </div>
    </div>
  );
};
