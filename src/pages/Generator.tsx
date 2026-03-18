import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Sparkles, 
  Send, 
  Copy, 
  Check, 
  RefreshCw, 
  User, 
  Building2, 
  Globe, 
  Target, 
  MessageSquare,
  AlertCircle,
  Zap
} from 'lucide-react';
import { useStore } from '../store/useStore';
import { supabase } from '../lib/supabase';
import { cn } from '../lib/utils';

interface EmailVariation {
  subject: string;
  body: string;
}

export const Generator = () => {
  const { user, fetchUser } = useStore();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [variations, setVariations] = useState<EmailVariation[]>([]);
  const [history, setHistory] = useState<any[]>([]);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const [formData, setFormData] = useState({
    leadName: '',
    company: '',
    website: '',
    offer: '',
    tone: 'Professional',
    goal: 'Book a Meeting'
  });

  const fetchHistory = async () => {
    if (!user) return;
    const { data, error } = await supabase
      .from('generated_emails')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(5);
    
    if (!error && data) {
      setHistory(data);
    }
  };

  React.useEffect(() => {
    fetchHistory();
  }, [user]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleGenerate = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    
    if (!formData.leadName || !formData.company || !formData.offer) {
      setError('Please fill in all required fields.');
      return;
    }

    if (user?.credits && user.credits.used_credits >= user.credits.total_credits) {
      setError('You have reached your free limit. Please upgrade to continue.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/generate-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user?.id,
          ...formData
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate email');
      }

      setVariations(data.variations);
      fetchUser(); // Refresh credits
      fetchHistory(); // Refresh history
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const tones = ['Professional', 'Friendly', 'Casual', 'Direct', 'Witty', 'Urgent'];
  const goals = ['Book a Meeting', 'Get a Reply', 'Free Demo', 'Close Deal', 'Feedback'];

  const creditsRemaining = (user?.credits?.total_credits || 0) - (user?.credits?.used_credits || 0);

  return (
    <div className="max-w-6xl mx-auto space-y-6 md:space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900 flex items-center gap-3">
            <Sparkles className="text-primary" size={28} />
            AI Email Generator
          </h1>
          <p className="text-sm md:text-base text-slate-500 mt-1">Create high-converting, personalized cold emails in seconds.</p>
        </div>

        <div className="glass px-4 py-2 rounded-xl flex items-center gap-3 border-primary/10 self-start md:self-auto">
          <Zap className="text-amber-500" size={18} />
          <div className="text-sm">
            <span className="font-bold text-slate-800">{creditsRemaining}</span>
            <span className="text-slate-500 ml-1">Credits Remaining</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-8">
        {/* Form Section */}
        <div className="lg:col-span-5 space-y-6">
          <form onSubmit={handleGenerate} className="glass p-5 md:p-8 rounded-2xl border-white/20 space-y-6 shadow-xl shadow-slate-200/50">
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                    <User size={14} /> Lead Name
                  </label>
                  <input
                    type="text"
                    name="leadName"
                    value={formData.leadName}
                    onChange={handleInputChange}
                    placeholder="e.g. John Doe"
                    className="w-full px-4 py-3 bg-white/50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                    <Building2 size={14} /> Company
                  </label>
                  <input
                    type="text"
                    name="company"
                    value={formData.company}
                    onChange={handleInputChange}
                    placeholder="e.g. Acme Inc"
                    className="w-full px-4 py-3 bg-white/50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                  <Globe size={14} /> Website (Optional)
                </label>
                <input
                  type="url"
                  name="website"
                  value={formData.website}
                  onChange={handleInputChange}
                  placeholder="https://example.com"
                  className="w-full px-4 py-3 bg-white/50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                  <Target size={14} /> Your Offer
                </label>
                <textarea
                  name="offer"
                  value={formData.offer}
                  onChange={handleInputChange}
                  placeholder="What are you selling? Be specific about the benefit."
                  rows={3}
                  className="w-full px-4 py-3 bg-white/50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all resize-none"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                    <Sparkles size={14} /> Tone
                  </label>
                  <select
                    name="tone"
                    value={formData.tone}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-white/50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                  >
                    {tones.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                    <MessageSquare size={14} /> Goal
                  </label>
                  <select
                    name="goal"
                    value={formData.goal}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-white/50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                  >
                    {goals.map(g => <option key={g} value={g}>{g}</option>)}
                  </select>
                </div>
              </div>
            </div>

            {error && (
              <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-xl flex items-start gap-3 text-destructive text-sm">
                <AlertCircle size={18} className="shrink-0 mt-0.5" />
                <p>{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className={cn(
                "w-full py-4 rounded-xl font-bold text-white flex items-center justify-center gap-2 shadow-lg transition-all",
                loading ? "bg-slate-400 cursor-not-allowed" : "bg-primary hover:bg-primary/90 shadow-primary/20"
              )}
            >
              {loading ? (
                <>
                  <RefreshCw size={20} className="animate-spin" />
                  Generating Magic...
                </>
              ) : (
                <>
                  <Sparkles size={20} />
                  Generate 3 Variations
                </>
              )}
            </button>
          </form>
        </div>

        {/* Output Section */}
        <div className="lg:col-span-7 space-y-6">
          <AnimatePresence mode="wait">
            {variations.length > 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-6"
              >
                {variations.map((v, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="glass p-5 md:p-6 rounded-2xl border-white/20 shadow-lg group relative overflow-hidden"
                  >
                    <div className="absolute top-0 left-0 w-1 h-full bg-primary/40 group-hover:bg-primary transition-colors" />
                    
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center">
                          {i + 1}
                        </span>
                        <h3 className="font-bold text-slate-800">Variation {i + 1}</h3>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => copyToClipboard(`${v.subject}\n\n${v.body}`, i)}
                          className="p-2 text-slate-400 hover:text-primary hover:bg-primary/5 rounded-lg transition-all"
                          title="Copy to clipboard"
                        >
                          {copiedIndex === i ? <Check size={18} className="text-emerald-500" /> : <Copy size={18} />}
                        </button>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <div className="text-[10px] uppercase tracking-wider font-bold text-slate-400 mb-1">Subject Line</div>
                        <div className="text-sm font-semibold text-slate-800 bg-slate-50 p-3 rounded-lg border border-slate-100">
                          {v.subject}
                        </div>
                      </div>
                      <div>
                        <div className="text-[10px] uppercase tracking-wider font-bold text-slate-400 mb-1">Email Body</div>
                        <div className="text-sm text-slate-600 leading-relaxed whitespace-pre-wrap bg-slate-50 p-4 rounded-lg border border-slate-100 italic">
                          {v.body}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}

                <button
                  onClick={() => handleGenerate()}
                  disabled={loading}
                  className="w-full py-4 border-2 border-dashed border-slate-200 rounded-2xl text-slate-400 font-semibold hover:border-primary hover:text-primary transition-all flex items-center justify-center gap-2"
                >
                  <RefreshCw size={18} className={cn(loading && "animate-spin")} />
                  Not happy? Regenerate All
                </button>
              </motion.div>
            ) : (
              <div className="h-full min-h-[300px] md:min-h-[400px] flex flex-col items-center justify-center text-center p-6 space-y-4 glass rounded-2xl border-dashed border-2 border-slate-200">
                <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center text-slate-300">
                  <Sparkles size={32} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-800">Ready to generate?</h3>
                  <p className="text-sm md:text-base text-slate-500 max-w-xs mx-auto">Fill in the lead details on the left to create your personalized emails.</p>
                </div>
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* History Section */}
      {history.length > 0 && (
        <div className="space-y-4 pt-8 border-t border-slate-200">
          <div className="flex items-center justify-between">
            <h2 className="text-lg md:text-xl font-bold text-slate-800 flex items-center gap-2">
              <RefreshCw size={20} className="text-slate-400" />
              Recent Generations
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {history.map((item, i) => (
              <div key={item.id} className="glass p-4 rounded-xl border-white/20 shadow-sm hover:shadow-md transition-all group">
                <div className="flex items-center justify-between mb-2">
                  <div className="text-[10px] font-bold text-primary uppercase tracking-wider truncate max-w-[120px]">{item.company}</div>
                  <div className="text-[10px] text-slate-400">{new Date(item.created_at).toLocaleDateString()}</div>
                </div>
                <h4 className="text-sm font-bold text-slate-800 mb-1 truncate">{item.subject}</h4>
                <p className="text-xs text-slate-500 line-clamp-2 mb-3">{item.email_body}</p>
                <button 
                  onClick={() => {
                    setVariations([{ subject: item.subject, body: item.email_body }]);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="text-xs font-bold text-primary hover:underline flex items-center gap-1"
                >
                  View Details
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
