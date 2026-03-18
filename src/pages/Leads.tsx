import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { 
  Users, 
  Search, 
  Filter, 
  MoreVertical, 
  Mail, 
  Building2, 
  ExternalLink,
  Trash2,
  ChevronRight
} from 'lucide-react';
import { cn } from '../lib/utils';
import { supabase } from '../lib/supabase';
import { useStore } from '../store/useStore';

export const Leads = () => {
  const navigate = useNavigate();
  const { user } = useStore();
  const [leads, setLeads] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
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
      }
      setLoading(false);
    };

    fetchLeads();
  }, [user]);

  const filteredLeads = leads.filter(l => 
    l.name.toLowerCase().includes(search.toLowerCase()) || 
    l.email.toLowerCase().includes(search.toLowerCase()) ||
    l.company?.toLowerCase().includes(search.toLowerCase())
  );

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
          <h2 className="text-2xl md:text-3xl font-bold text-slate-800 tracking-tight">All Leads</h2>
          <p className="text-sm md:text-base text-slate-500 font-medium">Manage all your prospects across all campaigns.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="px-4 py-2 bg-primary/10 rounded-xl text-primary font-bold text-sm">
            {leads.length} Total Leads
          </div>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors" size={18} />
          <input 
            type="text" 
            placeholder="Search by name, email, or company..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-white border border-border/40 rounded-2xl focus:ring-2 focus:ring-primary/20 transition-all font-medium text-slate-800"
          />
        </div>
        <button className="px-6 py-3 bg-white border border-border/40 rounded-2xl font-bold text-slate-600 flex items-center justify-center gap-2 hover:bg-muted transition-all">
          <Filter size={18} /> Filter
        </button>
      </div>

      {/* Leads List */}
      <div className="glass rounded-[32px] md:rounded-[40px] border-border/40 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-border/40 bg-muted/30">
                <th className="px-6 py-4 text-[10px] md:text-xs font-bold text-slate-400 uppercase tracking-widest">Lead</th>
                <th className="px-6 py-4 text-[10px] md:text-xs font-bold text-slate-400 uppercase tracking-widest hidden sm:table-cell">Company</th>
                <th className="px-6 py-4 text-[10px] md:text-xs font-bold text-slate-400 uppercase tracking-widest hidden lg:table-cell">Campaign</th>
                <th className="px-6 py-4 text-[10px] md:text-xs font-bold text-slate-400 uppercase tracking-widest hidden xl:table-cell">Date Added</th>
                <th className="px-6 py-4 text-[10px] md:text-xs font-bold text-slate-400 uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40">
              {filteredLeads.map((lead) => (
                <motion.tr 
                  key={lead.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="hover:bg-muted/50 transition-colors group"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-bold text-sm shrink-0">
                        {lead.name.charAt(0)}
                      </div>
                      <div className="min-w-0">
                        <div className="font-bold text-slate-800 truncate text-sm md:text-base">{lead.name}</div>
                        <div className="text-[10px] md:text-xs text-slate-400 font-medium truncate flex items-center gap-1">
                          <Mail size={10} /> {lead.email}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 hidden sm:table-cell">
                    <div className="flex items-center gap-2 text-sm font-bold text-slate-600">
                      <Building2 size={14} className="text-slate-400" />
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
                    <div className="text-xs font-bold text-slate-400">
                      {new Date(lead.created_at).toLocaleDateString()}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button 
                        onClick={() => navigate(`/campaigns/${lead.campaign_id}`)}
                        className="p-2 text-slate-400 hover:text-primary transition-all rounded-lg hover:bg-primary/5"
                        title="View Campaign"
                      >
                        <ChevronRight size={18} />
                      </button>
                      <button className="p-2 text-slate-400 hover:text-destructive transition-all rounded-lg hover:bg-destructive/5">
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {filteredLeads.length === 0 && (
          <div className="p-12 text-center">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4 text-slate-300">
              <Users size={32} />
            </div>
            <h3 className="text-lg font-bold text-slate-800">No leads found</h3>
            <p className="text-sm text-slate-500 font-medium">Try adjusting your search or upload more leads.</p>
          </div>
        )}
      </div>
    </div>
  );
};
