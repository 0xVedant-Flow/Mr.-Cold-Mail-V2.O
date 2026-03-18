import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Upload, 
  FileText, 
  X, 
  CheckCircle2, 
  AlertCircle, 
  ArrowRight, 
  Sparkles,
  Mail,
  Target,
  MessageSquare,
  Zap
} from 'lucide-react';
import { cn } from '../lib/utils';
import { useStore } from '../store/useStore';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { api } from '../lib/api';

export const CreateCampaign = () => {
  const navigate = useNavigate();
  const { user } = useStore();
  const [step, setStep] = React.useState(1);
  const [name, setName] = React.useState('');
  const [offer, setOffer] = React.useState('');
  const [tone, setTone] = React.useState('Professional');
  const [goal, setGoal] = React.useState('Book a Meeting');
  const [file, setFile] = React.useState<File | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [progress, setProgress] = React.useState(0);
  const [error, setError] = React.useState('');
  const [success, setSuccess] = React.useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      if (selectedFile.type !== 'text/csv' && !selectedFile.name.endsWith('.csv')) {
        setError('Please upload a valid CSV file.');
        return;
      }
      setFile(selectedFile);
      setError('');
    }
  };

  const handleCreateCampaign = async () => {
    if (!name || !offer || !file) {
      setError('Please fill in all fields and upload a CSV file.');
      return;
    }

    setLoading(true);
    setError('');
    setProgress(10);

    try {
      // 1. Create Campaign in DB
      setProgress(20);
      const { data: campaign, error: campaignError } = await supabase
        .from('campaigns')
        .insert({
          user_id: user?.id,
          name,
          status: 'generating'
        })
        .select()
        .single();

      if (campaignError) {
        console.error('Campaign Creation Error:', campaignError);
        if (campaignError.code === 'PGRST116' || campaignError.message.includes('schema cache')) {
          throw new Error("Database table 'campaigns' not found. Please ensure you have run the database migrations in the Supabase SQL Editor.");
        }
        throw campaignError;
      }

      setProgress(40);

      // 2. Read CSV
      const reader = new FileReader();
      const csvData = await new Promise<string>((resolve, reject) => {
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsText(file);
      });

      setProgress(60);

      // 3. Send to server for processing
      const response = await api.post('/upload-csv', {
        userId: user?.id,
        campaignId: campaign.id,
        csvData,
        offer,
        tone,
        goal
      });

      if (response.error) {
        throw new Error(response.error);
      }

      setProgress(90);
      setSuccess(true);

      // 4. Redirect after a short delay to show success
      setTimeout(() => {
        navigate(`/campaigns/${campaign.id}`);
      }, 1500);
    } catch (err: any) {
      console.error('Campaign Launch Error:', err);
      setError(err.message || 'An unexpected error occurred. Please try again.');
      setLoading(false);
      setProgress(0);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 md:space-y-10">
      {/* Stepper */}
      <div className="flex items-center justify-center gap-3 md:gap-4">
        {[1, 2].map((s) => (
          <React.Fragment key={s}>
            <div className={cn(
              "w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl flex items-center justify-center font-bold transition-all shadow-lg text-sm md:text-base",
              step >= s ? "bg-primary text-white shadow-primary/20" : "bg-muted text-slate-400"
            )}>
              {step > s ? <CheckCircle2 size={20} className="md:w-6 md:h-6" /> : s}
            </div>
            {s === 1 && <div className={cn("w-12 md:w-20 h-1 rounded-full", step > 1 ? "bg-primary" : "bg-muted")} />}
          </React.Fragment>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {step === 1 ? (
          <motion.div
            key="step1"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="glass p-6 md:p-10 rounded-[32px] md:rounded-[48px] border-border/40 space-y-8 md:space-y-10"
          >
            <div className="text-center space-y-2">
              <h2 className="text-2xl md:text-3xl font-bold text-slate-800 tracking-tight">Campaign Details</h2>
              <p className="text-slate-500 text-sm md:text-base font-medium">Tell us about what you're offering.</p>
            </div>

            <div className="space-y-6 md:space-y-8">
              <div className="space-y-3">
                <label className="text-[10px] md:text-xs font-bold uppercase tracking-widest text-slate-400 flex items-center gap-2">
                  <Target size={14} /> Campaign Name
                </label>
                <input 
                  type="text" 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Q1 SaaS Outreach"
                  className="w-full px-6 md:px-8 py-4 md:py-5 bg-muted rounded-2xl border-none focus:ring-2 focus:ring-primary/20 font-bold text-slate-800 transition-all text-sm md:text-base"
                />
              </div>

              <div className="space-y-3">
                <label className="text-[10px] md:text-xs font-bold uppercase tracking-widest text-slate-400 flex items-center gap-2">
                  <Sparkles size={14} /> Your Offer / Pitch
                </label>
                <textarea 
                  value={offer}
                  onChange={(e) => setOffer(e.target.value)}
                  placeholder="Describe your product, service, or specific offer..."
                  rows={4}
                  className="w-full px-6 md:px-8 py-4 md:py-5 bg-muted rounded-2xl border-none focus:ring-2 focus:ring-primary/20 font-bold text-slate-800 transition-all resize-none text-sm md:text-base"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
                <div className="space-y-3">
                  <label className="text-[10px] md:text-xs font-bold uppercase tracking-widest text-slate-400 flex items-center gap-2">
                    <MessageSquare size={14} /> Email Tone
                  </label>
                  <select 
                    value={tone}
                    onChange={(e) => setTone(e.target.value)}
                    className="w-full px-6 md:px-8 py-4 md:py-5 bg-muted rounded-2xl border-none focus:ring-2 focus:ring-primary/20 font-bold text-slate-800 transition-all appearance-none text-sm md:text-base"
                  >
                    <option>Professional</option>
                    <option>Casual</option>
                    <option>Witty</option>
                    <option>Direct</option>
                  </select>
                </div>
                <div className="space-y-3">
                  <label className="text-[10px] md:text-xs font-bold uppercase tracking-widest text-slate-400 flex items-center gap-2">
                    <Zap size={14} /> Campaign Goal
                  </label>
                  <select 
                    value={goal}
                    onChange={(e) => setGoal(e.target.value)}
                    className="w-full px-6 md:px-8 py-4 md:py-5 bg-muted rounded-2xl border-none focus:ring-2 focus:ring-primary/20 font-bold text-slate-800 transition-all appearance-none text-sm md:text-base"
                  >
                    <option>Book a Meeting</option>
                    <option>Get a Reply</option>
                    <option>Free Trial Sign-up</option>
                    <option>Feedback</option>
                  </select>
                </div>
              </div>

              <button 
                onClick={() => setStep(2)}
                disabled={!name || !offer}
                className="w-full bg-primary hover:bg-primary/90 text-white py-4 md:py-5 rounded-2xl font-bold shadow-xl shadow-primary/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50 text-sm md:text-base"
              >
                Next: Upload Leads <ArrowRight size={20} />
              </button>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="step2"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="glass p-6 md:p-10 rounded-[32px] md:rounded-[48px] border-border/40 space-y-8 md:space-y-10"
          >
            <div className="text-center space-y-2">
              <h2 className="text-2xl md:text-3xl font-bold text-slate-800 tracking-tight">Upload Leads</h2>
              <p className="text-slate-500 text-sm md:text-base font-medium">Upload your CSV file with lead information.</p>
            </div>

            <div className="space-y-6 md:space-y-8">
              <div className="relative">
                <input 
                  type="file" 
                  accept=".csv"
                  onChange={handleFileChange}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                />
                <div className={cn(
                  "border-4 border-dashed rounded-[32px] md:rounded-[40px] p-8 md:p-16 text-center transition-all",
                  file ? "border-primary bg-primary/5" : "border-border/60 hover:border-primary/40"
                )}>
                  {file ? (
                    <div className="space-y-4">
                      <div className="w-16 h-16 md:w-20 md:h-20 bg-primary rounded-2xl md:rounded-3xl flex items-center justify-center mx-auto text-white shadow-xl shadow-primary/20">
                        <FileText size={32} className="md:w-10 md:h-10" />
                      </div>
                      <div>
                        <p className="text-lg md:text-xl font-bold text-slate-800 truncate px-4">{file.name}</p>
                        <p className="text-slate-500 text-sm md:text-base font-medium">{(file.size / 1024).toFixed(2)} KB</p>
                      </div>
                      <button 
                        onClick={(e) => { e.stopPropagation(); setFile(null); }}
                        className="text-destructive text-sm font-bold hover:underline"
                      >
                        Remove File
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="w-16 h-16 md:w-20 md:h-20 bg-muted rounded-2xl md:rounded-3xl flex items-center justify-center mx-auto text-slate-400">
                        <Upload size={32} className="md:w-10 md:h-10" />
                      </div>
                      <div>
                        <p className="text-lg md:text-xl font-bold text-slate-800">Drop your CSV here</p>
                        <p className="text-slate-500 text-sm md:text-base font-medium">or click to browse files</p>
                      </div>
                      <div className="flex flex-wrap items-center justify-center gap-2 md:gap-4 text-[10px] md:text-xs font-bold text-slate-400 uppercase tracking-widest">
                        <span>Required: name, email</span>
                        <span className="hidden md:block w-1 h-1 bg-slate-300 rounded-full" />
                        <span>Optional: company, website</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {error && (
                <div className="p-4 bg-destructive/10 text-destructive text-xs md:text-sm font-bold rounded-xl flex items-center gap-3">
                  <AlertCircle size={18} className="shrink-0" />
                  {error}
                </div>
              )}

              {loading && !success && (
                <div className="space-y-2">
                  <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest text-slate-400">
                    <span>Processing Campaign</span>
                    <span>{progress}%</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${progress}%` }}
                      className="h-full bg-primary"
                    />
                  </div>
                </div>
              )}

              {success && (
                <div className="p-6 bg-emerald-500/10 text-emerald-600 rounded-[32px] text-center space-y-3">
                  <div className="w-12 h-12 bg-emerald-500 text-white rounded-2xl flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/20">
                    <CheckCircle2 size={24} />
                  </div>
                  <div className="font-bold text-lg">Campaign Launched!</div>
                  <p className="text-sm font-medium opacity-80">Redirecting you to the campaign dashboard...</p>
                </div>
              )}

              <div className="flex flex-col sm:flex-row gap-4">
                <button 
                  onClick={() => setStep(1)}
                  disabled={loading}
                  className="order-2 sm:order-1 flex-1 py-4 md:py-5 rounded-2xl font-bold text-slate-600 hover:bg-muted transition-all text-sm md:text-base disabled:opacity-50"
                >
                  Back
                </button>
                <button 
                  onClick={handleCreateCampaign}
                  disabled={!file || loading || success}
                  className="order-1 sm:order-2 flex-[2] bg-primary hover:bg-primary/90 text-white py-4 md:py-5 rounded-2xl font-bold shadow-xl shadow-primary/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50 text-sm md:text-base"
                >
                  {loading ? 'Launching...' : 'Launch Campaign'} <Sparkles size={20} />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
