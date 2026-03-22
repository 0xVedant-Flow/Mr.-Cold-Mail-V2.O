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
  Zap,
  Mail,
  Edit3
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
  const [sending, setSending] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [variations, setVariations] = useState<EmailVariation[]>([]);
  const [history, setHistory] = useState<any[]>([]);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [gmailConnected, setGmailConnected] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  const [formData, setFormData] = useState({
    leadName: '',
    leadEmail: '',
    company: '',
    website: '',
    offer: '',
    tone: user?.default_tone || 'Professional',
    goal: user?.default_goal || 'Book a Meeting'
  });

  React.useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        tone: user.default_tone || prev.tone,
        goal: user.default_goal || prev.goal
      }));
    }
  }, [user]);

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

  const handleVariationChange = (index: number, field: keyof EmailVariation, value: string) => {
    const newVariations = [...variations];
    newVariations[index][field] = value;
    setVariations(newVariations);
  };

  const handleGenerate = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    
    if (!formData.leadName || !formData.company || !formData.offer) {
      setError('Please fill in all required fields.');
      return;
    }

    if (user?.credits !== undefined) {
      const remaining = user.credits.total_credits - user.credits.used_credits;
      if (remaining <= 0 && user.subscription?.plan === 'free') {
        setError('You have reached your free limit. Please upgrade to continue.');
        return;
      }
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

  const handleSendGmail = async (variation: EmailVariation, index: number) => {
    if (!user || !user.gmailAccount?.connected) return;

    setSending(index);
    try {
      const response = await fetch('/api/send-email-gmail', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          subject: variation.subject,
          body: variation.body,
          recipientEmail: formData.leadEmail || 'test@example.com',
          leadName: formData.leadName
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to send email');

      alert('Email sent successfully via Gmail!');
    } catch (err: any) {
      alert(`Error: ${err.message}`);
    } finally {
      setSending(null);
    }
  };

  const copyToClipboard = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const tones = ['Professional', 'Friendly', 'Casual', 'Direct', 'Witty', 'Urgent'];
  const goals = ['Book a Meeting', 'Get a Reply', 'Free Demo', 'Close Deal', 'Feedback'];

  const creditsRemaining = user?.credits ? (user.credits.total_credits - user.credits.used_credits) : 0;

  return (
    <div className="max-w-4xl mx-auto space-y-6 md:space-y-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-4xl font-black text-slate-900 flex items-center gap-3 tracking-tight">
            <Sparkles className="text-primary" size={32} />
            AI Email Generator
          </h1>
          <p className="text-sm md:text-lg text-slate-500 font-medium mt-1">Create high-converting, personalized cold emails in seconds.</p>
        </div>

        <div className="glass px-5 py-3 rounded-2xl flex items-center gap-3 border-primary/10 self-start md:self-auto shadow-sm">
          <Zap className="text-amber-500" size={20} fill="currentColor" />
          <div className="text-sm">
            <span className="font-black text-slate-900 text-lg">{creditsRemaining}</span>
            <span className="text-slate-500 ml-1.5 font-bold uppercase tracking-widest text-[10px]">Credits Left</span>
          </div>
        </div>
      </div>

      <div className="space-y-10">
        {/* Form Section */}
        <section className="bg-white rounded-[32px] border border-slate-100 shadow-xl shadow-slate-200/40 overflow-hidden">
          <div className="p-8 border-b border-slate-50 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary">
                <Edit3 size={24} />
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-900">Lead Details</h2>
                <p className="text-sm text-slate-500 font-medium">Tell us about your prospect.</p>
              </div>
            </div>
          </div>

          <form onSubmit={handleGenerate} className="p-8 space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Lead Name</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input
                    type="text"
                    name="leadName"
                    value={formData.leadName}
                    onChange={handleInputChange}
                    placeholder="John Doe"
                    className="w-full pl-12 pr-4 py-4 bg-slate-50 rounded-2xl border border-slate-100 font-bold text-slate-800 focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Lead Email (Optional)</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input
                    type="email"
                    name="leadEmail"
                    value={formData.leadEmail}
                    onChange={handleInputChange}
                    placeholder="john@example.com"
                    className="w-full pl-12 pr-4 py-4 bg-slate-50 rounded-2xl border border-slate-100 font-bold text-slate-800 focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Company</label>
                <div className="relative">
                  <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input
                    type="text"
                    name="company"
                    value={formData.company}
                    onChange={handleInputChange}
                    placeholder="Acme Inc"
                    className="w-full pl-12 pr-4 py-4 bg-slate-50 rounded-2xl border border-slate-100 font-bold text-slate-800 focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Website (Optional)</label>
                <div className="relative">
                  <Globe className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input
                    type="url"
                    name="website"
                    value={formData.website}
                    onChange={handleInputChange}
                    placeholder="https://acme.com"
                    className="w-full pl-12 pr-4 py-4 bg-slate-50 rounded-2xl border border-slate-100 font-bold text-slate-800 focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Your Offer / Value Prop</label>
              <textarea
                name="offer"
                value={formData.offer}
                onChange={handleInputChange}
                placeholder="What problem do you solve for them? Be specific."
                rows={4}
                className="w-full p-4 bg-slate-50 rounded-2xl border border-slate-100 font-bold text-slate-800 focus:ring-2 focus:ring-primary/20 outline-none transition-all resize-none"
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Tone of Voice</label>
                <select
                  name="tone"
                  value={formData.tone}
                  onChange={handleInputChange}
                  className="w-full p-4 bg-slate-50 rounded-2xl border border-slate-100 font-bold text-slate-800 focus:ring-2 focus:ring-primary/20 outline-none transition-all appearance-none cursor-pointer"
                >
                  {tones.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Primary Goal</label>
                <select
                  name="goal"
                  value={formData.goal}
                  onChange={handleInputChange}
                  className="w-full p-4 bg-slate-50 rounded-2xl border border-slate-100 font-bold text-slate-800 focus:ring-2 focus:ring-primary/20 outline-none transition-all appearance-none cursor-pointer"
                >
                  {goals.map(g => <option key={g} value={g}>{g}</option>)}
                </select>
              </div>
            </div>

            {error && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 bg-rose-50 border border-rose-100 rounded-2xl flex items-start gap-3 text-rose-600 text-sm"
              >
                <AlertCircle size={18} className="shrink-0 mt-0.5" />
                <p className="font-bold">{error}</p>
              </motion.div>
            )}

            <button
              type="submit"
              disabled={loading}
              className={cn(
                "w-full py-5 rounded-2xl font-black text-white flex items-center justify-center gap-3 shadow-2xl transition-all relative overflow-hidden",
                loading ? "bg-slate-400 cursor-not-allowed" : "bg-primary hover:bg-primary/90 shadow-primary/20 active:scale-[0.99]"
              )}
            >
              {loading ? (
                <>
                  <RefreshCw size={24} className="animate-spin" />
                  <span className="uppercase tracking-widest text-sm">Generating Magic...</span>
                </>
              ) : (
                <>
                  <Sparkles size={24} />
                  <span className="uppercase tracking-widest text-sm">Generate 3 Variations</span>
                </>
              )}
            </button>
          </form>
        </section>

        {/* Output Section */}
        <AnimatePresence mode="wait">
          {variations.length > 0 ? (
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-8"
            >
              <div className="flex items-center justify-between px-4">
                <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight">Generated Variations</h2>
                <button 
                  onClick={() => handleGenerate()}
                  className="text-primary font-bold text-sm flex items-center gap-2 hover:underline"
                >
                  <RefreshCw size={16} /> Regenerate All
                </button>
              </div>

              <div className="space-y-6">
                {variations.map((v, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="bg-white rounded-[32px] border border-slate-100 shadow-xl shadow-slate-200/40 overflow-hidden group"
                  >
                    <div className="p-6 border-b border-slate-50 flex items-center justify-between bg-slate-50/50">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl bg-primary text-white text-xs font-black flex items-center justify-center">
                          {i + 1}
                        </div>
                        <span className="font-black text-slate-900 uppercase tracking-widest text-xs">Variation {i + 1}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setEditingIndex(editingIndex === i ? null : i)}
                          className={cn(
                            "p-2.5 rounded-xl transition-all",
                            editingIndex === i ? "bg-primary text-white shadow-lg shadow-primary/20" : "text-slate-400 hover:bg-white hover:text-primary border border-transparent hover:border-slate-100"
                          )}
                          title="Edit email"
                        >
                          <Edit3 size={18} />
                        </button>
                        <button
                          onClick={() => copyToClipboard(`${v.subject}\n\n${v.body}`, i)}
                          className="p-2.5 text-slate-400 hover:bg-white hover:text-primary border border-transparent hover:border-slate-100 rounded-xl transition-all"
                          title="Copy to clipboard"
                        >
                          {copiedIndex === i ? <Check size={18} className="text-emerald-500" /> : <Copy size={18} />}
                        </button>
                        {user?.gmailAccount?.connected && (
                          <button
                            onClick={() => handleSendGmail(v, i)}
                            disabled={sending !== null}
                            className="p-2.5 text-slate-400 hover:bg-white hover:text-primary border border-transparent hover:border-slate-100 rounded-xl transition-all disabled:opacity-50"
                            title="Send with Gmail"
                          >
                            {sending === i ? <RefreshCw size={18} className="animate-spin" /> : <Send size={18} />}
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="p-8 space-y-6">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Subject Line</label>
                        {editingIndex === i ? (
                          <input
                            type="text"
                            value={v.subject}
                            onChange={(e) => handleVariationChange(i, 'subject', e.target.value)}
                            className="w-full p-4 bg-slate-50 rounded-2xl border border-primary/20 font-bold text-slate-800 focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                          />
                        ) : (
                          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 font-bold text-slate-800">
                            {v.subject}
                          </div>
                        )}
                      </div>

                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Email Body</label>
                        {editingIndex === i ? (
                          <textarea
                            value={v.body}
                            onChange={(e) => handleVariationChange(i, 'body', e.target.value)}
                            rows={8}
                            className="w-full p-6 bg-slate-50 rounded-2xl border border-primary/20 font-medium text-slate-700 leading-relaxed focus:ring-2 focus:ring-primary/20 outline-none transition-all resize-none"
                          />
                        ) : (
                          <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100 font-medium text-slate-700 leading-relaxed whitespace-pre-wrap italic">
                            {v.body}
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.section>
          ) : (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="py-20 flex flex-col items-center justify-center text-center space-y-6"
            >
              <div className="w-24 h-24 bg-slate-50 rounded-[32px] flex items-center justify-center text-slate-200 border-2 border-dashed border-slate-100">
                <Sparkles size={48} />
              </div>
              <div className="max-w-xs">
                <h3 className="text-xl font-bold text-slate-800">Ready to generate?</h3>
                <p className="text-slate-500 font-medium mt-2">Fill in the lead details above to create your high-converting emails.</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* History Section */}
        {history.length > 0 && (
          <section className="space-y-6 pt-10 border-t border-slate-100">
            <div className="flex items-center justify-between px-4">
              <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight">Recent Generations</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {history.map((item, i) => (
                <div 
                  key={item.id} 
                  onClick={() => {
                    setVariations([{ subject: item.subject, body: item.email_body }]);
                    window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
                  }}
                  className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-slate-200/40 transition-all cursor-pointer group"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="px-3 py-1 bg-primary/10 text-primary text-[10px] font-black uppercase tracking-widest rounded-full">
                      {item.company}
                    </div>
                    <div className="text-[10px] text-slate-400 font-bold">{new Date(item.created_at).toLocaleDateString()}</div>
                  </div>
                  <h4 className="font-bold text-slate-800 mb-2 truncate group-hover:text-primary transition-colors">{item.subject}</h4>
                  <p className="text-xs text-slate-500 font-medium line-clamp-2 leading-relaxed">{item.email_body}</p>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
};
