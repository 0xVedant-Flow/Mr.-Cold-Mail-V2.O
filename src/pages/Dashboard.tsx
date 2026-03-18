import React from 'react';
import { motion } from 'motion/react';
import { 
  Users, 
  Mail, 
  CheckCircle2, 
  TrendingUp, 
  Plus, 
  ArrowRight, 
  Sparkles,
  Zap,
  Clock
} from 'lucide-react';
import { cn } from '../lib/utils';
import { useStore } from '../store/useStore';
import { Link } from 'react-router-dom';

export const Dashboard = () => {
  const { campaigns, user } = useStore();

  const totalLeads = campaigns.reduce((acc, c) => acc + (c.leadsCount || 0), 0);
  const totalSent = campaigns.reduce((acc, c) => acc + (c.leads?.filter(l => l.status === 'ready').length || 0), 0);
  const activeCampaigns = campaigns.filter(c => c.status === 'generating').length;

  const stats = [
    { label: 'Total Leads', value: totalLeads.toLocaleString(), icon: Users, color: 'text-primary bg-primary/10' },
    { label: 'Emails Sent', value: totalSent.toLocaleString(), icon: Mail, color: 'text-purple-500 bg-purple-500/10' },
    { label: 'Active Now', value: activeCampaigns.toString(), icon: Zap, color: 'text-cyan-500 bg-cyan-500/10' },
    { label: 'Reply Rate', value: '12.4%', icon: TrendingUp, color: 'text-emerald-500 bg-emerald-500/10' },
  ];

  return (
    <div className="space-y-10">
      {/* Welcome Header */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-6">
        <div>
          <h2 className="text-3xl font-bold text-slate-800 tracking-tight">
            Welcome back, {user?.full_name || 'User'}!
          </h2>
          <p className="text-slate-500 font-medium mt-1">Here's what's happening with your outreach today.</p>
        </div>
        <Link to="/campaigns/new">
          <button className="w-full md:w-auto bg-primary hover:bg-primary/90 text-white px-8 py-4 rounded-2xl font-bold flex items-center justify-center gap-2 shadow-xl shadow-primary/20 transition-all">
            <Plus size={20} />
            New Campaign
          </button>
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="glass p-6 rounded-3xl border-border/40 hover:border-primary/20 transition-all group"
          >
            <div className="flex items-center justify-between mb-4">
              <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110", stat.color)}>
                <stat.icon size={24} />
              </div>
              <div className="text-[10px] font-bold text-emerald-500 bg-emerald-500/10 px-2 py-1 rounded-full">+12%</div>
            </div>
            <div className="text-3xl font-bold text-slate-800 tracking-tight mb-1">{stat.value}</div>
            <div className="text-sm font-bold text-slate-400 uppercase tracking-widest">{stat.label}</div>
          </motion.div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Recent Campaigns */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold text-slate-800">Recent Campaigns</h3>
            <Link to="/campaigns" className="text-primary font-bold text-sm hover:underline flex items-center gap-1">
              View all <ArrowRight size={16} />
            </Link>
          </div>
          
          <div className="space-y-4">
            {campaigns.length === 0 ? (
              <div className="glass p-12 rounded-[32px] border-dashed border-border/60 text-center space-y-4">
                <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto text-slate-400">
                  <Mail size={32} />
                </div>
                <p className="text-slate-500 font-medium">No campaigns found. Start by creating your first one!</p>
                <Link to="/campaigns/new">
                  <button className="text-primary font-bold hover:underline">Create Campaign</button>
                </Link>
              </div>
            ) : (
              campaigns.slice(0, 3).map((campaign) => (
                <div key={campaign.id} className="glass p-6 rounded-[32px] border-border/40 hover:border-primary/10 transition-all flex items-center justify-between group">
                  <div className="flex items-center gap-6">
                    <div className={cn(
                      "w-14 h-14 rounded-2xl flex items-center justify-center text-xl shadow-inner",
                      campaign.status === 'completed' ? "bg-emerald-500/10 text-emerald-500" : "bg-primary/10 text-primary"
                    )}>
                      {campaign.status === 'completed' ? <CheckCircle2 size={28} /> : <Sparkles size={28} className="animate-pulse" />}
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-800 group-hover:text-primary transition-colors">{campaign.name}</h4>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">{campaign.leadsCount} Leads</span>
                        <span className="w-1 h-1 bg-slate-300 rounded-full" />
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                          {new Date(campaign.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                  <Link to={`/campaigns/${campaign.id}`}>
                    <button className="p-3 rounded-xl glass hover:bg-primary hover:text-white transition-all">
                      <ArrowRight size={20} />
                    </button>
                  </Link>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Credit Usage Card */}
        <div className="space-y-6">
          <h3 className="text-xl font-bold text-slate-800">Usage & Credits</h3>
          <div className="glass p-8 rounded-[40px] border-primary/20 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
            <div className="relative z-10 space-y-8">
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 bg-primary rounded-2xl flex items-center justify-center text-white shadow-lg shadow-primary/20">
                  <Zap size={24} fill="currentColor" />
                </div>
                <div className="text-right">
                  <div className="text-sm font-bold text-slate-400 uppercase tracking-widest">Available</div>
                  <div className="text-2xl font-bold text-slate-800">
                    {user?.credits ? user.credits.total_credits - user.credits.used_credits : 0}
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs font-bold uppercase tracking-widest text-slate-500">
                  <span>Monthly Quota</span>
                  <span>{user?.credits?.used_credits || 0} / {user?.credits?.total_credits || 0}</span>
                </div>
                <div className="h-3 bg-muted rounded-full overflow-hidden p-0.5">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: user?.credits ? `${(user.credits.used_credits / user.credits.total_credits) * 100}%` : '0%' }}
                    className="h-full bg-primary rounded-full shadow-lg shadow-primary/20"
                  />
                </div>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest text-center">
                  Credits reset in 30 days
                </p>
              </div>

              <Link to="/billing">
                <button className="w-full bg-slate-800 hover:bg-slate-900 text-white py-4 rounded-2xl font-bold transition-all shadow-xl shadow-slate-200">
                  Upgrade Plan
                </button>
              </Link>
            </div>
          </div>

          {/* Activity Feed */}
          <div className="glass p-8 rounded-[40px] border-border/40 space-y-6">
            <h4 className="font-bold text-slate-800 flex items-center gap-2">
              <Clock size={18} className="text-primary" />
              Recent Activity
            </h4>
            <div className="space-y-6">
              {[
                { type: 'sent', text: 'Email sent to Sarah Johnson', time: '2m ago' },
                { type: 'gen', text: 'AI generated 45 drafts', time: '1h ago' },
                { type: 'sub', text: 'New lead added: David Chen', time: '3h ago' },
              ].map((activity, i) => (
                <div key={i} className="flex gap-4">
                  <div className="w-2 h-2 rounded-full bg-primary mt-1.5 shrink-0" />
                  <div>
                    <p className="text-sm font-bold text-slate-700">{activity.text}</p>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
