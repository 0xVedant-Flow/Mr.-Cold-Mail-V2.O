import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Users, 
  Search, 
  Filter, 
  MoreVertical, 
  Mail, 
  Building2, 
  ExternalLink,
  Trash2,
  ChevronRight,
  Sparkles,
  RefreshCw,
  AlertCircle,
  X,
  Target,
  MessageSquare,
  Zap,
  Upload,
  FileText,
  Check
} from 'lucide-react';
import { cn } from '../lib/utils';
import { supabase } from '../lib/supabase';
import { useStore } from '../store/useStore';

export const Leads = () => {
  const navigate = useNavigate();
  const { user, fetchUser } = useStore();
  const [leads, setLeads] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [bulkLoading, setBulkLoading] = useState(false);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [bulkError, setBulkError] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [bulkSuccess, setBulkSuccess] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const [bulkData, setBulkData] = useState({
    offer: '',
    tone: 'Professional',
    goal: 'Book a Meeting',
    campaignId: ''
  });

  const [uploadData, setUploadData] = useState({
    campaignId: ''
  });

  const fetchLeads = async () => {
    if (!user) return;
    
    const { data, error } = await supabase
      .from('leads')
      .select(`
        *,
        campaign:campaigns(id, name)
      `)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching leads:', error);
    } else {
      setLeads(data || []);
      if (data && data.length > 0) {
        setBulkData(prev => ({ ...prev, campaignId: data[0].campaign_id }));
        setUploadData(prev => ({ ...prev, campaignId: data[0].campaign_id }));
      }
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchLeads();
  }, [user]);

  const handleBulkGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !bulkData.campaignId || !bulkData.offer) return;

    setBulkLoading(true);
    setBulkError(null);
    setBulkSuccess(null);

    try {
      const response = await fetch('/api/bulk-generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          ...bulkData
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to generate emails');

      const successCount = data.results.filter((r: any) => r.success).length;
      setBulkSuccess(`Successfully generated ${successCount} emails!`);
      fetchUser(); // Refresh credits
      setTimeout(() => setShowBulkModal(false), 3000);
    } catch (err: any) {
      setBulkError(err.message);
    } finally {
      setBulkLoading(false);
    }
  };

  const handleCsvUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !uploadData.campaignId || !selectedFile) return;

    setUploadLoading(true);
    setUploadError(null);
    setUploadSuccess(null);

    try {
      const reader = new FileReader();
      reader.onload = async (event) => {
        const csvData = event.target?.result as string;
        
        try {
          const response = await fetch('/api/upload-csv', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              userId: user.id,
              campaignId: uploadData.campaignId,
              csvData
            }),
          });

          const data = await response.json();
          if (!response.ok) throw new Error(data.error || 'Failed to upload leads');

          setUploadSuccess(data.message);
          fetchLeads();
          setTimeout(() => {
            setShowUploadModal(false);
            setSelectedFile(null);
            setUploadSuccess(null);
          }, 2000);
        } catch (err: any) {
          setUploadError(err.message);
        } finally {
          setUploadLoading(false);
        }
      };
      reader.readAsText(selectedFile);
    } catch (err: any) {
      setUploadError(err.message);
      setUploadLoading(false);
    }
  };

  const filteredLeads = leads.filter(l => 
    l.name.toLowerCase().includes(search.toLowerCase()) || 
    l.email.toLowerCase().includes(search.toLowerCase()) ||
    l.company?.toLowerCase().includes(search.toLowerCase())
  );

  const campaigns = Array.from(new Set(leads.map(l => JSON.stringify(l.campaign)))).map(s => JSON.parse(s as string));

  if (loading) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6 md:space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold text-foreground tracking-tight">All Leads</h2>
          <p className="text-sm md:text-base text-muted-foreground font-medium">Manage all your prospects across all campaigns.</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setShowUploadModal(true)}
            className="px-6 py-3 bg-card border border-border text-muted-foreground rounded-2xl font-bold text-sm flex items-center gap-2 hover:bg-muted transition-all"
          >
            <Upload size={18} />
            Import CSV
          </button>
          <button 
            onClick={() => setShowBulkModal(true)}
            className="px-6 py-3 bg-primary text-primary-foreground rounded-2xl font-bold text-sm flex items-center gap-2 shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all"
          >
            <Sparkles size={18} />
            Bulk Generate
          </button>
          <div className="px-4 py-2 bg-primary/10 rounded-xl text-primary font-bold text-sm">
            {leads.length} Total Leads
          </div>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" size={18} />
          <input 
            type="text" 
            placeholder="Search by name, email, or company..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-card border border-border rounded-2xl focus:ring-2 focus:ring-primary/20 transition-all font-medium text-foreground"
          />
        </div>
        <button className="px-6 py-3 bg-card border border-border rounded-2xl font-bold text-muted-foreground flex items-center justify-center gap-2 hover:bg-muted transition-all">
          <Filter size={18} /> Filter
        </button>
      </div>

      {/* Leads List */}
      <div className="bg-card rounded-[32px] md:rounded-[40px] border border-border/40 overflow-hidden shadow-xl shadow-foreground/5">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-border/40 bg-muted/30">
                <th className="px-6 py-4 text-[10px] md:text-xs font-bold text-muted-foreground uppercase tracking-widest">Lead</th>
                <th className="px-6 py-4 text-[10px] md:text-xs font-bold text-muted-foreground uppercase tracking-widest hidden sm:table-cell">Company</th>
                <th className="px-6 py-4 text-[10px] md:text-xs font-bold text-muted-foreground uppercase tracking-widest hidden lg:table-cell">Campaign</th>
                <th className="px-6 py-4 text-[10px] md:text-xs font-bold text-muted-foreground uppercase tracking-widest hidden xl:table-cell">Date Added</th>
                <th className="px-6 py-4 text-[10px] md:text-xs font-bold text-muted-foreground uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40">
              <AnimatePresence mode="popLayout">
                {filteredLeads.map((lead, index) => (
                  <motion.tr 
                    key={lead.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ delay: Math.min(index * 0.05, 0.5) }}
                    className="hover:bg-muted/50 transition-colors group"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-bold text-sm shrink-0">
                          {lead.name.charAt(0)}
                        </div>
                        <div className="min-w-0">
                          <div className="font-bold text-foreground truncate text-sm md:text-base">{lead.name}</div>
                          <div className="text-[10px] md:text-xs text-muted-foreground font-medium truncate flex items-center gap-1">
                            <Mail size={10} /> {lead.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 hidden sm:table-cell">
                      <div className="flex items-center gap-2 text-sm font-bold text-muted-foreground">
                        <Building2 size={14} className="text-muted-foreground/80" />
                        {lead.company || '—'}
                      </div>
                    </td>
                    <td className="px-6 py-4 hidden lg:table-cell">
                      <button 
                        onClick={() => navigate(`/campaigns/${lead.campaign_id}`)}
                        className="inline-flex items-center gap-1.5 px-3 py-1 bg-primary/5 text-primary rounded-lg text-xs font-bold hover:bg-primary/10 transition-all"
                      >
                        {lead.campaign?.name}
                        <ExternalLink size={12} />
                      </button>
                    </td>
                    <td className="px-6 py-4 hidden xl:table-cell">
                      <div className="text-xs font-bold text-muted-foreground">
                        {new Date(lead.created_at).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button 
                          onClick={() => navigate(`/campaigns/${lead.campaign_id}`)}
                          className="p-2 text-muted-foreground hover:text-primary transition-all rounded-lg hover:bg-primary/5"
                          title="View Campaign"
                        >
                          <ChevronRight size={18} />
                        </button>
                        <button className="p-2 text-muted-foreground hover:text-destructive transition-all rounded-lg hover:bg-destructive/5">
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
        
        {filteredLeads.length === 0 && (
          <div className="p-12 text-center">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4 text-muted-foreground/30">
              <Users size={32} />
            </div>
            <h3 className="text-lg font-bold text-foreground">No leads found</h3>
            <p className="text-sm text-muted-foreground font-medium">Try adjusting your search or upload more leads.</p>
          </div>
        )}
      </div>

      {/* Bulk Generate Modal */}
      <AnimatePresence>
        {showBulkModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-card w-full max-w-lg rounded-[32px] border border-border shadow-2xl overflow-hidden"
            >
              <div className="p-6 md:p-8 space-y-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                      <Sparkles size={20} />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-foreground">Bulk Generate</h3>
                      <p className="text-sm text-muted-foreground">Create emails for an entire campaign.</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => setShowBulkModal(false)}
                    className="p-2 text-muted-foreground hover:text-foreground rounded-lg transition-all"
                  >
                    <X size={20} />
                  </button>
                </div>

                <form onSubmit={handleBulkGenerate} className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-foreground/80">Select Campaign</label>
                    <select 
                      value={bulkData.campaignId}
                      onChange={(e) => setBulkData(prev => ({ ...prev, campaignId: e.target.value }))}
                      className="w-full px-4 py-3 bg-muted/50 border border-border rounded-xl focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                      required
                    >
                      <option value="">Select a campaign</option>
                      {campaigns.map(c => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-foreground/80 flex items-center gap-2">
                      <Target size={14} className="text-primary" /> Your Offer
                    </label>
                    <textarea
                      value={bulkData.offer}
                      onChange={(e) => setBulkData(prev => ({ ...prev, offer: e.target.value }))}
                      placeholder="What are you selling?"
                      rows={3}
                      className="w-full px-4 py-3 bg-muted/50 border border-border rounded-xl focus:ring-2 focus:ring-primary/20 outline-none transition-all resize-none"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-foreground/80 flex items-center gap-2">
                        <Sparkles size={14} className="text-primary" /> Tone
                      </label>
                      <select
                        value={bulkData.tone}
                        onChange={(e) => setBulkData(prev => ({ ...prev, tone: e.target.value }))}
                        className="w-full px-4 py-3 bg-muted/50 border border-border rounded-xl focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                      >
                        {['Professional', 'Friendly', 'Casual', 'Direct', 'Witty', 'Urgent'].map(t => <option key={t} value={t}>{t}</option>)}
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-foreground/80 flex items-center gap-2">
                        <MessageSquare size={14} className="text-primary" /> Goal
                      </label>
                      <select
                        value={bulkData.goal}
                        onChange={(e) => setBulkData(prev => ({ ...prev, goal: e.target.value }))}
                        className="w-full px-4 py-3 bg-muted/50 border border-border rounded-xl focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                      >
                        {['Book a Meeting', 'Get a Reply', 'Free Demo', 'Close Deal', 'Feedback'].map(g => <option key={g} value={g}>{g}</option>)}
                      </select>
                    </div>
                  </div>

                  {bulkError && (
                    <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-xl flex items-start gap-3 text-destructive text-sm">
                      <AlertCircle size={18} className="shrink-0 mt-0.5" />
                      <p className="font-bold">{bulkError}</p>
                    </div>
                  )}

                  {bulkSuccess && (
                    <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-start gap-3 text-emerald-500 text-sm">
                      <Check size={18} className="shrink-0 mt-0.5" />
                      <p className="font-bold">{bulkSuccess}</p>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={bulkLoading}
                    className={cn(
                      "w-full py-4 rounded-xl font-bold text-white flex items-center justify-center gap-2 shadow-lg transition-all",
                      bulkLoading ? "bg-muted-foreground/50 cursor-not-allowed" : "bg-primary hover:bg-primary/90 shadow-primary/20"
                    )}
                  >
                    {bulkLoading ? (
                      <>
                        <RefreshCw size={20} className="animate-spin" />
                        Generating for {leads.filter(l => l.campaign_id === bulkData.campaignId).length} leads...
                      </>
                    ) : (
                      <>
                        <Zap size={20} />
                        Generate Emails
                      </>
                    )}
                  </button>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Upload CSV Modal */}
      <AnimatePresence>
        {showUploadModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-card w-full max-w-lg rounded-[32px] border border-border shadow-2xl overflow-hidden"
            >
              <div className="p-6 md:p-8 space-y-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                      <Upload size={20} />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-foreground">Import Leads</h3>
                      <p className="text-sm text-muted-foreground">Upload a CSV file to add leads.</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => setShowUploadModal(false)}
                    className="p-2 text-muted-foreground hover:text-foreground rounded-lg transition-all"
                  >
                    <X size={20} />
                  </button>
                </div>

                <form onSubmit={handleCsvUpload} className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-foreground/80">Select Campaign</label>
                    <select 
                      value={uploadData.campaignId}
                      onChange={(e) => setUploadData(prev => ({ ...prev, campaignId: e.target.value }))}
                      className="w-full px-4 py-3 bg-muted/50 border border-border rounded-xl focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                      required
                    >
                      <option value="">Select a campaign</option>
                      {campaigns.map(c => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-foreground/80">CSV File</label>
                    <div 
                      className={cn(
                        "border-2 border-dashed rounded-2xl p-8 text-center transition-all cursor-pointer",
                        selectedFile ? "border-primary bg-primary/5" : "border-border hover:border-primary/50 hover:bg-muted/50"
                      )}
                      onClick={() => document.getElementById('csv-input')?.click()}
                    >
                      <input 
                        id="csv-input"
                        type="file" 
                        accept=".csv"
                        className="hidden"
                        onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                      />
                      {selectedFile ? (
                        <div className="flex flex-col items-center gap-2">
                          <FileText size={32} className="text-primary" />
                          <div className="font-bold text-foreground">{selectedFile.name}</div>
                          <div className="text-xs text-muted-foreground">{(selectedFile.size / 1024).toFixed(1)} KB</div>
                          <button 
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedFile(null);
                            }}
                            className="text-xs text-destructive font-bold hover:underline mt-2"
                          >
                            Remove
                          </button>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center gap-2">
                          <Upload size={32} className="text-muted-foreground/30" />
                          <div className="font-bold text-muted-foreground">Click to upload or drag and drop</div>
                          <div className="text-xs text-muted-foreground/60">CSV files only (Max 10MB)</div>
                        </div>
                      )}
                    </div>
                  </div>

                  {uploadError && (
                    <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-xl flex items-start gap-3 text-destructive text-sm">
                      <AlertCircle size={18} className="shrink-0 mt-0.5" />
                      <p className="font-bold">{uploadError}</p>
                    </div>
                  )}

                  {uploadSuccess && (
                    <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-start gap-3 text-emerald-500 text-sm">
                      <Check size={18} className="shrink-0 mt-0.5" />
                      <p className="font-bold">{uploadSuccess}</p>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={uploadLoading || !selectedFile}
                    className={cn(
                      "w-full py-4 rounded-xl font-bold text-white flex items-center justify-center gap-2 shadow-lg transition-all",
                      (uploadLoading || !selectedFile) ? "bg-muted-foreground/50 cursor-not-allowed" : "bg-primary hover:bg-primary/90 shadow-primary/20"
                    )}
                  >
                    {uploadLoading ? (
                      <>
                        <RefreshCw size={20} className="animate-spin" />
                        Uploading...
                      </>
                    ) : (
                      <>
                        <Upload size={20} />
                        Import Leads
                      </>
                    )}
                  </button>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
