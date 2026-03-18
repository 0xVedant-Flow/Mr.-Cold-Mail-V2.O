import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ArrowLeft, 
  Send, 
  Copy, 
  RefreshCw, 
  CheckCircle2, 
  Mail, 
  User, 
  Users,
  Building2, 
  Globe,
  Sparkles,
  Search,
  ChevronRight,
  MoreVertical,
  Zap,
  Check
} from 'lucide-react';
import { cn } from '../lib/utils';
import { useStore } from '../store/useStore';
import { supabase } from '../lib/supabase';
import { api } from '../lib/api';

export const EmailEditor = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { campaigns, user } = useStore();
  const [activeLeadId, setActiveLeadId] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [campaign, setCampaign] = React.useState<any>(null);
  const [leads, setLeads] = React.useState<any[]>([]);
  const [emails, setEmails] = React.useState<any[]>([]);
  const [search, setSearch] = React.useState('');
  const [isCopied, setIsCopied] = React.useState(false);

  useEffect(() => {
    const fetchCampaignData = async () => {
      if (!id) return;
      
      // Fetch campaign
      const { data: campaignData } = await supabase
        .from('campaigns')
        .select('*')
        .eq('id', id)
        .single();
      
      setCampaign(campaignData);

      // Fetch leads
      const { data: leadsData } = await supabase
        .from('leads')
        .select('*')
        .eq('campaign_id', id);
      
      setLeads(leadsData || []);

      // Fetch emails
      if (leadsData && leadsData.length > 0) {
        const { data: emailsData } = await supabase
          .from('emails')
          .select('*')
          .in('lead_id', leadsData.map(l => l.id));
        
        setEmails(emailsData || []);
        if (leadsData.length > 0) setActiveLeadId(leadsData[0].id);
      }

      setLoading(false);
    };

    fetchCampaignData();

    // Subscribe to email generation updates
    const channel = supabase
      .channel('email_updates')
      .on('postgres_changes', { 
        event: 'INSERT', 
        schema: 'public', 
        table: 'emails' 
      }, (payload) => {
        setEmails(prev => [...prev, payload.new]);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [id]);

  const [showLeadsList, setShowLeadsList] = React.useState(true);

  useEffect(() => {
    if (activeLeadId) {
      // On mobile, hide list when a lead is selected
      if (window.innerWidth < 1024) {
        setShowLeadsList(false);
      }
    }
  }, [activeLeadId]);

  const activeLead = leads.find(l => l.id === activeLeadId);
  const activeEmail = emails.find(e => e.lead_id === activeLeadId);

  const filteredLeads = leads.filter(l => 
    l.name.toLowerCase().includes(search.toLowerCase()) || 
    l.email.toLowerCase().includes(search.toLowerCase())
  );

  const [sending, setSending] = React.useState(false);
  const [sendSuccess, setSendSuccess] = React.useState(false);

  const handleSend = async () => {
    if (!activeEmail || !user) return;
    setSending(true);
    setSendSuccess(false);
    try {
      if (user.gmailAccount?.connected) {
        await api.post('/send-email-gmail', { 
          userId: user.id,
          leadId: activeLeadId,
          subject: activeEmail.subject,
          body: activeEmail.body,
          recipientEmail: activeLead?.email
        });
      } else {
        await api.post('/send-email', { emailId: activeEmail.id, userId: user.id });
      }
      setSendSuccess(true);
      setTimeout(() => setSendSuccess(false), 3000);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setSending(false);
    }
  };

  const handleCopy = () => {
    if (activeEmail) {
      navigator.clipboard.writeText(activeEmail.body);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-120px)] lg:h-[calc(100vh-180px)] flex flex-col lg:flex-row gap-6 lg:gap-8 overflow-hidden">
      {/* Sidebar: Leads List */}
      <div className={cn(
        "w-full lg:w-80 glass rounded-[32px] md:rounded-[40px] border-border/40 flex flex-col overflow-hidden transition-all duration-300",
        !showLeadsList && "hidden lg:flex"
      )}>
        <div className="p-4 md:p-6 border-b border-border/40 space-y-4">
          <button 
            onClick={() => navigate('/campaigns')}
            className="text-slate-400 hover:text-primary transition-colors flex items-center gap-2 text-[10px] md:text-xs font-bold uppercase tracking-widest"
          >
            <ArrowLeft size={14} /> Back to Campaigns
          </button>
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors" size={16} />
            <input 
              type="text" 
              placeholder="Search leads..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-muted rounded-xl border-none focus:ring-2 focus:ring-primary/20 text-sm font-bold text-slate-800 transition-all"
            />
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto p-3 md:p-4 space-y-2">
          {filteredLeads.map((lead) => {
            const hasEmail = emails.some(e => e.lead_id === lead.id);
            return (
              <button
                key={lead.id}
                onClick={() => {
                  setActiveLeadId(lead.id);
                  if (window.innerWidth < 1024) setShowLeadsList(false);
                }}
                className={cn(
                  "w-full p-3 md:p-4 rounded-2xl text-left transition-all flex items-center justify-between group",
                  activeLeadId === lead.id ? "bg-primary text-white shadow-lg shadow-primary/20" : "hover:bg-muted"
                )}
              >
                <div className="flex items-center gap-3">
                  <div className={cn(
                    "w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm shrink-0",
                    activeLeadId === lead.id ? "bg-white/20" : "bg-primary/10 text-primary"
                  )}>
                    {lead.name.charAt(0)}
                  </div>
                  <div className="overflow-hidden">
                    <div className="font-bold text-sm truncate w-32 md:w-40">{lead.name}</div>
                    <div className={cn(
                      "text-[10px] font-bold uppercase tracking-widest truncate",
                      activeLeadId === lead.id ? "text-white/60" : "text-slate-400"
                    )}>
                      {lead.company || 'No Company'}
                    </div>
                  </div>
                </div>
                {hasEmail ? (
                  <CheckCircle2 size={16} className={cn("shrink-0", activeLeadId === lead.id ? "text-white" : "text-emerald-500")} />
                ) : (
                  <Sparkles size={16} className={cn("animate-pulse shrink-0", activeLeadId === lead.id ? "text-white" : "text-primary")} />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main: Email Editor */}
      <div className={cn(
        "flex-1 glass rounded-[32px] md:rounded-[40px] border-border/40 flex flex-col overflow-hidden relative transition-all duration-300",
        showLeadsList && "hidden lg:flex"
      )}>
        <AnimatePresence mode="wait">
          {activeLead ? (
            <motion.div 
              key={activeLead.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex flex-col h-full"
            >
              {/* Header */}
              <div className="p-4 md:p-8 border-b border-border/40 flex items-center justify-between">
                <div className="flex items-center gap-3 md:gap-6 overflow-hidden">
                  <button 
                    onClick={() => setShowLeadsList(true)}
                    className="lg:hidden p-2 -ml-2 text-slate-400 hover:text-primary transition-colors"
                  >
                    <ArrowLeft size={20} />
                  </button>
                  <div className="w-12 h-12 md:w-16 md:h-16 bg-primary/10 rounded-2xl flex items-center justify-center text-primary shrink-0">
                    <User size={24} className="md:w-8 md:h-8" />
                  </div>
                  <div className="truncate">
                    <h3 className="text-lg md:text-2xl font-bold text-slate-800 truncate">{activeLead.name}</h3>
                    <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 mt-1">
                      <span className="flex items-center gap-1.5 text-[10px] md:text-sm font-bold text-slate-500 truncate">
                        <Mail size={12} className="text-primary" /> {activeLead.email}
                      </span>
                      {activeLead.company && (
                        <span className="flex items-center gap-1.5 text-[10px] md:text-sm font-bold text-slate-500 truncate">
                          <Building2 size={12} className="text-primary" /> {activeLead.company}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 md:gap-3 shrink-0">
                  <button className="p-2 md:p-4 rounded-2xl glass hover:bg-muted transition-all text-slate-600">
                    <RefreshCw size={18} className="md:w-5 md:h-5" />
                  </button>
                  <button className="p-2 md:p-4 rounded-2xl glass hover:bg-muted transition-all text-slate-600">
                    <MoreVertical size={18} className="md:w-5 md:h-5" />
                  </button>
                </div>
              </div>

              {/* Email Content */}
              <div className="flex-1 p-5 md:p-10 overflow-y-auto space-y-6 md:space-y-8">
                {activeEmail ? (
                  <div className="space-y-6 md:space-y-8">
                    <div className="space-y-2 md:space-y-3">
                      <label className="text-[10px] md:text-xs font-bold uppercase tracking-widest text-slate-400">Subject Line</label>
                      <div className="p-4 md:p-6 bg-muted rounded-2xl font-bold text-slate-800 text-base md:text-lg border-none">
                        {activeEmail.subject}
                      </div>
                    </div>
                    <div className="space-y-2 md:space-y-3">
                      <label className="text-[10px] md:text-xs font-bold uppercase tracking-widest text-slate-400">Personalized Message</label>
                      <div className="p-5 md:p-8 bg-muted rounded-[24px] md:rounded-[32px] font-medium text-slate-700 leading-relaxed text-base md:text-lg whitespace-pre-wrap italic">
                        {activeEmail.body}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-center space-y-6">
                    <div className="w-20 h-20 md:w-24 md:h-24 bg-primary/5 rounded-full flex items-center justify-center relative">
                      <div className="absolute inset-0 bg-primary/10 rounded-full animate-ping" />
                      <Sparkles size={32} className="text-primary animate-pulse md:w-12 md:h-12" />
                    </div>
                    <div className="max-w-sm px-4">
                      <h4 className="text-lg md:text-xl font-bold text-slate-800">Generating Magic...</h4>
                      <p className="text-sm md:text-base text-slate-500 font-medium mt-2">Our AI is crafting a perfectly personalized email for {activeLead.name}.</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Footer Actions */}
              <div className="p-4 md:p-8 border-t border-border/40 bg-muted/30 flex flex-col sm:flex-row items-center justify-between gap-4">
                <button 
                  onClick={handleCopy}
                  className="w-full sm:w-auto px-6 py-4 rounded-2xl glass hover:bg-white transition-all font-bold text-slate-600 flex items-center justify-center gap-2"
                >
                  {isCopied ? <Check size={20} className="text-emerald-500" /> : <Copy size={20} />} 
                  {isCopied ? 'Copied!' : 'Copy to Clipboard'}
                </button>
                <button 
                  onClick={handleSend}
                  disabled={!activeEmail || sending || sendSuccess}
                  className={cn(
                    "w-full sm:w-auto px-10 py-4 rounded-2xl font-bold flex items-center justify-center gap-2 shadow-xl transition-all disabled:opacity-50",
                    sendSuccess ? "bg-emerald-500 text-white shadow-emerald-500/20" : "bg-primary hover:bg-primary/90 text-white shadow-primary/20"
                  )}
                >
                  {sending ? 'Sending...' : sendSuccess ? 'Sent!' : user?.gmailAccount?.connected ? 'Send with Gmail' : 'Send Email'} 
                  {sendSuccess ? <Check size={20} /> : <Send size={20} />}
                </button>
              </div>
            </motion.div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-8 md:p-12 space-y-6">
              <div className="w-20 h-20 md:w-24 md:h-24 bg-muted rounded-full flex items-center justify-center text-slate-300">
                <Users size={40} className="md:w-12 md:h-12" />
              </div>
              <div className="max-w-xs">
                <h4 className="text-lg md:text-xl font-bold text-slate-800">Select a Lead</h4>
                <p className="text-sm md:text-base text-slate-500 font-medium mt-2">Choose a lead from the sidebar to view their personalized email.</p>
              </div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
