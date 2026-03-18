import React from 'react';
import { motion } from 'motion/react';
import { 
  Plus, 
  Search, 
  Filter, 
  MoreVertical, 
  Mail, 
  Users, 
  Calendar,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  Trash2,
  ExternalLink
} from 'lucide-react';
import { cn } from '../lib/utils';
import { useStore } from '../store/useStore';
import { Link } from 'react-router-dom';

export const Campaigns = () => {
  const { campaigns, deleteCampaign } = useStore();
  const [search, setSearch] = React.useState('');

  const filteredCampaigns = campaigns.filter(c => 
    c.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 md:space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold text-slate-800 tracking-tight">Campaigns</h2>
          <p className="text-sm md:text-base text-slate-500 font-medium mt-1">Manage and track your outreach performance.</p>
        </div>
        <Link to="/campaigns/new" className="w-full md:w-auto">
          <button className="w-full md:w-auto bg-primary hover:bg-primary/90 text-white px-8 py-4 rounded-2xl font-bold flex items-center justify-center gap-2 shadow-xl shadow-primary/20 transition-all">
            <Plus size={20} />
            New Campaign
          </button>
        </Link>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col md:flex-row items-center gap-4">
        <div className="relative flex-1 group w-full">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors" size={20} />
          <input 
            type="text" 
            placeholder="Search campaigns..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-14 pr-6 py-4 bg-white rounded-2xl border-none focus:ring-2 focus:ring-primary/20 font-bold text-slate-800 shadow-sm transition-all"
          />
        </div>
        <button className="w-full md:w-auto px-6 py-4 bg-white rounded-2xl font-bold text-slate-600 flex items-center justify-center gap-2 shadow-sm hover:bg-slate-50 transition-all">
          <Filter size={20} />
          Filters
        </button>
      </div>

      {/* Campaigns Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredCampaigns.length === 0 ? (
          <div className="col-span-full glass p-10 md:p-20 rounded-[48px] border-dashed border-border/60 text-center space-y-6">
            <div className="w-16 h-16 md:w-24 md:h-24 bg-muted rounded-full flex items-center justify-center mx-auto text-slate-300">
              <Mail size={32} className="md:w-12 md:h-12" />
            </div>
            <div className="max-w-xs mx-auto">
              <h3 className="text-lg md:text-xl font-bold text-slate-800">No campaigns found</h3>
              <p className="text-sm md:text-base text-slate-500 font-medium mt-2">Try adjusting your search or create a new campaign to get started.</p>
            </div>
            <Link to="/campaigns/new">
              <button className="bg-primary hover:bg-primary/90 text-white px-8 py-4 rounded-2xl font-bold shadow-xl shadow-primary/20 transition-all">
                Create First Campaign
              </button>
            </Link>
          </div>
        ) : (
          filteredCampaigns.map((campaign, i) => (
            <motion.div
              key={campaign.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="glass p-6 md:p-8 rounded-[40px] border-border/40 hover:border-primary/20 transition-all group relative overflow-hidden flex flex-col"
            >
              <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
              
              <div className="relative z-10 flex flex-col h-full">
                <div className="flex items-center justify-between mb-6 md:mb-8">
                  <div className={cn(
                    "w-12 h-12 md:w-14 md:h-14 rounded-2xl flex items-center justify-center text-xl shadow-inner",
                    campaign.status === 'completed' ? "bg-emerald-500/10 text-emerald-500" : "bg-primary/10 text-primary"
                  )}>
                    {campaign.status === 'completed' ? <CheckCircle2 size={24} className="md:w-7 md:h-7" /> : <Sparkles size={24} className="animate-pulse md:w-7 md:h-7" />}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={cn(
                      "px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest",
                      campaign.status === 'completed' ? "bg-emerald-500/10 text-emerald-600" : "bg-primary/10 text-primary"
                    )}>
                      {campaign.status}
                    </span>
                    <button className="p-2 text-slate-400 hover:text-slate-600 transition-colors">
                      <MoreVertical size={20} />
                    </button>
                  </div>
                </div>

                <h3 className="text-lg md:text-xl font-bold text-slate-800 group-hover:text-primary transition-colors mb-2 truncate">{campaign.name}</h3>
                <p className="text-slate-500 text-sm font-medium mb-6 md:mb-8 line-clamp-2">
                  Outreach campaign targeting {campaign.leadsCount} potential leads for your offer.
                </p>

                <div className="grid grid-cols-2 gap-4 mb-6 md:mb-8 mt-auto">
                  <div className="bg-muted/50 p-3 md:p-4 rounded-2xl">
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Leads</div>
                    <div className="text-base md:text-lg font-bold text-slate-800">{campaign.leadsCount}</div>
                  </div>
                  <div className="bg-muted/50 p-3 md:p-4 rounded-2xl">
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Created</div>
                    <div className="text-base md:text-lg font-bold text-slate-800">{new Date(campaign.createdAt).toLocaleDateString()}</div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Link to={`/campaigns/${campaign.id}`} className="flex-1">
                    <button className="w-full bg-slate-800 hover:bg-slate-900 text-white py-3 md:py-4 rounded-2xl font-bold transition-all flex items-center justify-center gap-2">
                      View Details <ArrowRight size={18} />
                    </button>
                  </Link>
                  <button 
                    onClick={() => deleteCampaign(campaign.id)}
                    className="p-3 md:p-4 rounded-2xl bg-destructive/10 text-destructive hover:bg-destructive hover:text-white transition-all"
                  >
                    <Trash2 size={20} />
                  </button>
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
};
