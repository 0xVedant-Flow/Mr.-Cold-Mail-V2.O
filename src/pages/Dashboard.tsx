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
  Clock,
  BarChart3,
  LineChart as LineChartIcon
} from 'lucide-react';
import { cn } from '../lib/utils';
import { useStore } from '../store/useStore';
import { Link } from 'react-router-dom';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar
} from 'recharts';

const userGrowthData = [
  { name: 'Mon', users: 40 },
  { name: 'Tue', users: 65 },
  { name: 'Wed', users: 45 },
  { name: 'Thu', users: 90 },
  { name: 'Fri', users: 85 },
  { name: 'Sat', users: 110 },
  { name: 'Sun', users: 130 },
];

const emailUsageData = [
  { name: 'Mon', sent: 120 },
  { name: 'Tue', sent: 300 },
  { name: 'Wed', sent: 200 },
  { name: 'Thu', sent: 450 },
  { name: 'Fri', sent: 380 },
  { name: 'Sat', sent: 150 },
  { name: 'Sun', sent: 180 },
];

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
    <div className="space-y-6 md:space-y-10">
      {/* Welcome Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold text-foreground tracking-tight">
            Welcome back, {user?.full_name || 'User'}!
          </h2>
          <p className="text-sm md:text-base text-muted-foreground font-medium mt-1">Here's what's happening with your outreach today.</p>
        </div>
        <Link to="/campaigns/new" className="w-full md:w-auto">
          <button className="w-full md:w-auto bg-primary hover:bg-primary/90 text-white px-8 py-4 rounded-2xl font-bold flex items-center justify-center gap-2 shadow-xl shadow-primary/20 transition-all">
            <Plus size={20} />
            New Campaign
          </button>
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {stats.map((stat, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-card p-5 md:p-6 rounded-3xl border border-border/40 hover:border-primary/20 transition-all group"
          >
            <div className="flex items-center justify-between mb-4">
              <div className={cn("w-10 h-10 md:w-12 md:h-12 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110", stat.color)}>
                <stat.icon size={20} className="md:w-6 md:h-6" />
              </div>
              <div className="text-[10px] font-bold text-emerald-500 bg-emerald-500/10 px-2 py-1 rounded-full">+12%</div>
            </div>
            <div className="text-2xl md:text-3xl font-bold text-foreground tracking-tight mb-1">{stat.value}</div>
            <div className="text-xs md:text-sm font-bold text-muted-foreground/80 uppercase tracking-widest">{stat.label}</div>
          </motion.div>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-card p-6 md:p-8 rounded-[40px] border border-border/40 space-y-6"
        >
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
              <LineChartIcon size={20} className="text-primary" />
              User Growth
            </h3>
            <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Last 7 Days</div>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={userGrowthData}>
                <defs>
                  <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12, fontWeight: 600 }}
                  dy={10}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12, fontWeight: 600 }}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--card))', 
                    borderColor: 'hsl(var(--border))',
                    borderRadius: '16px',
                    fontSize: '12px',
                    fontWeight: 'bold',
                    color: 'hsl(var(--foreground))'
                  }}
                  itemStyle={{ color: 'hsl(var(--primary))' }}
                />
                <Area 
                  type="monotone" 
                  dataKey="users" 
                  stroke="hsl(var(--primary))" 
                  strokeWidth={3}
                  fillOpacity={1} 
                  fill="url(#colorUsers)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-card p-6 md:p-8 rounded-[40px] border border-border/40 space-y-6"
        >
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
              <BarChart3 size={20} className="text-purple-500" />
              Email Usage
            </h3>
            <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Last 7 Days</div>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={emailUsageData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12, fontWeight: 600 }}
                  dy={10}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12, fontWeight: 600 }}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--card))', 
                    borderColor: 'hsl(var(--border))',
                    borderRadius: '16px',
                    fontSize: '12px',
                    fontWeight: 'bold',
                    color: 'hsl(var(--foreground))'
                  }}
                  itemStyle={{ color: '#a855f7' }}
                />
                <Bar 
                  dataKey="sent" 
                  fill="#a855f7" 
                  radius={[6, 6, 0, 0]} 
                  barSize={30}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Campaigns */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg md:text-xl font-bold text-foreground">Recent Campaigns</h3>
            <Link to="/campaigns" className="text-primary font-bold text-sm hover:underline flex items-center gap-1">
              View all <ArrowRight size={16} />
            </Link>
          </div>
          
          <div className="space-y-4">
            {campaigns.length === 0 ? (
              <div className="bg-card p-8 md:p-12 rounded-[32px] border-dashed border-border/60 text-center space-y-4">
                <div className="w-12 h-12 md:w-16 md:h-16 bg-muted rounded-full flex items-center justify-center mx-auto text-muted-foreground/80">
                  <Mail size={24} className="md:w-8 md:h-8" />
                </div>
                <p className="text-sm md:text-base text-muted-foreground font-medium">No campaigns found. Start by creating your first one!</p>
                <Link to="/campaigns/new">
                  <button className="text-primary font-bold hover:underline">Create Campaign</button>
                </Link>
              </div>
            ) : (
              campaigns.slice(0, 3).map((campaign) => (
                <div key={campaign.id} className="bg-card p-4 md:p-6 rounded-[32px] border border-border/40 hover:border-primary/10 transition-all flex items-center justify-between group">
                  <div className="flex items-center gap-4 md:gap-6 overflow-hidden">
                    <div className={cn(
                      "w-12 h-12 md:w-14 md:h-14 rounded-2xl flex items-center justify-center text-xl shadow-inner shrink-0",
                      campaign.status === 'completed' ? "bg-emerald-500/10 text-emerald-500" : "bg-primary/10 text-primary"
                    )}>
                      {campaign.status === 'completed' ? <CheckCircle2 size={24} className="md:w-7 md:h-7" /> : <Sparkles size={24} className="animate-pulse md:w-7 md:h-7" />}
                    </div>
                    <div className="truncate">
                      <h4 className="font-bold text-foreground group-hover:text-primary transition-colors truncate">{campaign.name}</h4>
                      <div className="flex items-center gap-2 md:gap-3 mt-1">
                        <span className="text-[10px] md:text-xs font-bold text-muted-foreground/80 uppercase tracking-widest">{campaign.leadsCount} Leads</span>
                        <span className="w-1 h-1 bg-border rounded-full" />
                        <span className="text-[10px] md:text-xs font-bold text-muted-foreground/80 uppercase tracking-widest">
                          {new Date(campaign.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                  <Link to={`/campaigns/${campaign.id}`} className="shrink-0">
                    <button className="p-2 md:p-3 rounded-xl bg-muted hover:bg-primary hover:text-white transition-all">
                      <ArrowRight size={18} className="md:w-5 md:h-5" />
                    </button>
                  </Link>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Credit Usage Card */}
        <div className="space-y-6">
          <h3 className="text-lg md:text-xl font-bold text-foreground">Usage & Credits</h3>
          <div className="bg-card p-6 md:p-8 rounded-[40px] border border-primary/20 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
            <div className="relative z-10 space-y-6 md:space-y-8">
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 md:w-12 md:h-12 bg-primary rounded-2xl flex items-center justify-center text-primary-foreground shadow-lg shadow-primary/20">
                  <Zap size={20} className="md:w-6 md:h-6" fill="currentColor" />
                </div>
                <div className="text-right">
                  <div className="text-[10px] md:text-sm font-bold text-muted-foreground/80 uppercase tracking-widest">Remaining</div>
                  <div className="text-xl md:text-2xl font-bold text-foreground">
                    {user?.credits ? (user.credits.total_credits - user.credits.used_credits) : 0}
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between text-[10px] md:text-xs font-bold uppercase tracking-widest text-muted-foreground">
                  <span>Plan: {user?.subscription?.plan || 'Free'}</span>
                  <span>{user?.credits ? (user.credits.total_credits - user.credits.used_credits) : 0} Credits Left</span>
                </div>
                <div className="h-2.5 md:h-3 bg-muted rounded-full overflow-hidden p-0.5">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ 
                      width: user?.subscription?.plan === 'agency' 
                        ? '100%' 
                        : `${Math.min(100, (((user?.credits?.total_credits || 0) - (user?.credits?.used_credits || 0)) / (user?.credits?.total_credits || 1)) * 100)}%` 
                    }}
                    className="h-full bg-primary rounded-full shadow-lg shadow-primary/20"
                  />
                </div>
                <p className="text-[10px] text-muted-foreground/80 font-bold uppercase tracking-widest text-center">
                  {user?.subscription?.plan === 'agency' ? 'Unlimited Power' : 'Upgrade for more credits'}
                </p>
              </div>

              <Link to="/billing">
                <button className="w-full bg-foreground text-background hover:bg-foreground/90 py-3 md:py-4 rounded-2xl font-bold transition-all shadow-xl shadow-foreground/10">
                  Upgrade Plan
                </button>
              </Link>
            </div>
          </div>

          {/* Activity Feed */}
          <div className="bg-card p-6 md:p-8 rounded-[40px] border border-border/40 space-y-6">
            <h4 className="font-bold text-foreground flex items-center gap-2">
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
                    <p className="text-sm font-bold text-foreground/80">{activity.text}</p>
                    <p className="text-[10px] font-bold text-muted-foreground/80 uppercase tracking-widest">{activity.time}</p>
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
