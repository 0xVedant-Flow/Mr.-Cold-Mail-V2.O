import React from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  AreaChart, 
  Area,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line
} from 'recharts';
import { 
  TrendingUp, 
  Users, 
  Mail, 
  MousePointer2, 
  MessageSquare,
  ArrowUpRight,
  ArrowDownRight,
  Calendar,
  Filter,
  ExternalLink,
  Target
} from 'lucide-react';
import { cn } from '../lib/utils';
import { motion } from 'motion/react';
import { useStore } from '../store/useStore';

const COLORS = ['#3B82F6', '#10B981', '#8B5CF6', '#F59E0B'];

const StatsCard = ({ label, value, change, trend, icon: Icon, color }: {
  label: string;
  value: string;
  change: string;
  trend: 'up' | 'down';
  icon: any;
  color: string;
  key?: any;
}) => (
  <div className="glass p-8 rounded-[32px] border-border/40 relative overflow-hidden group hover:scale-[1.02] transition-all duration-300">
    <div className={cn("absolute top-0 right-0 w-24 h-24 opacity-5 rounded-full -translate-y-1/2 translate-x-1/2 transition-transform group-hover:scale-150", color.replace('text', 'bg'))} />
    <div className="flex items-center justify-between mb-4">
      <div className={cn("p-3 rounded-2xl bg-muted", color)}>
        <Icon size={24} />
      </div>
      <div className={cn(
        "flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-lg",
        trend === 'up' ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600"
      )}>
        {trend === 'up' ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
        {change}
      </div>
    </div>
    <div className="text-3xl font-bold text-slate-800 mb-1">{value}</div>
    <div className="text-sm font-bold text-slate-400 uppercase tracking-widest">{label}</div>
  </div>
);

export const Analytics = () => {
  const { campaigns } = useStore();

  const totalLeads = campaigns.reduce((acc, c) => acc + (c.leadsCount || 0), 0);
  const totalSent = campaigns.reduce((acc, c) => acc + (c.leads?.filter(l => l.status === 'ready').length || 0), 0);
  
  // Mock rates for now as they aren't in the DB yet
  const openRate = totalSent > 0 ? 64.2 : 0;
  const replyRate = totalSent > 0 ? 8.4 : 0;

  const stats: { label: string; value: string; change: string; trend: 'up' | 'down'; icon: any; color: string; }[] = [
    { label: 'Total Sent', value: totalSent.toLocaleString(), change: '+12.5%', trend: 'up', icon: Mail, color: 'text-blue-500' },
    { label: 'Open Rate', value: `${openRate}%`, change: '+4.3%', trend: 'up', icon: TrendingUp, color: 'text-emerald-500' },
    { label: 'Reply Rate', value: `${replyRate}%`, change: '-1.2%', trend: 'down', icon: MessageSquare, color: 'text-purple-500' },
    { label: 'Total Leads', value: totalLeads.toLocaleString(), change: '+24.5%', trend: 'up', icon: Users, color: 'text-orange-500' },
  ];

  // Generate chart data from campaigns
  const chartData = campaigns.slice(0, 7).reverse().map(c => ({
    name: c.name.split(' ')[0],
    sent: c.leads?.filter(l => l.status === 'ready').length || 0,
    replies: Math.floor((c.leads?.filter(l => l.status === 'ready').length || 0) * 0.08) // Mock replies
  }));

  // Fallback data if no campaigns exist
  const fallbackData = [
    { name: 'Mon', sent: 0, replies: 0 },
    { name: 'Tue', sent: 0, replies: 0 },
    { name: 'Wed', sent: 0, replies: 0 },
    { name: 'Thu', sent: 0, replies: 0 },
    { name: 'Fri', sent: 0, replies: 0 },
    { name: 'Sat', sent: 0, replies: 0 },
    { name: 'Sun', sent: 0, replies: 0 },
  ];

  const displayData = chartData.length > 0 ? chartData : fallbackData;

  return (
    <div className="space-y-6 md:space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 md:gap-6">
        <div className="text-center sm:text-left">
          <h2 className="text-2xl md:text-3xl font-bold text-slate-800 tracking-tight">Analytics</h2>
          <p className="text-sm md:text-base text-slate-500 font-medium">Track your campaign performance and ROI.</p>
        </div>
        <div className="flex items-center gap-2 md:gap-3 w-full sm:w-auto">
          <button className="flex-1 sm:flex-none px-4 md:px-6 py-3 glass rounded-xl text-slate-600 font-bold flex items-center justify-center gap-2 hover:bg-muted transition-all text-sm">
            <Calendar size={18} /> <span className="hidden xs:inline">Last 30 Days</span><span className="xs:hidden">30 Days</span>
          </button>
          <button className="flex-1 sm:flex-none px-4 md:px-6 py-3 glass rounded-xl text-slate-600 font-bold flex items-center justify-center gap-2 hover:bg-muted transition-all text-sm">
            <Filter size={18} /> Filter
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {stats.map((stat, i) => (
          <StatsCard key={i} {...stat} />
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
        {/* Main Performance Chart */}
        <div className="lg:col-span-2 glass p-5 md:p-8 rounded-[32px] md:rounded-[40px] border-border/40 space-y-6 md:space-y-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <h3 className="text-lg md:text-xl font-bold text-slate-800">Campaign Performance</h3>
            <div className="flex items-center gap-4 md:gap-6">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 md:w-3 md:h-3 rounded-full bg-primary" />
                <span className="text-[10px] md:text-xs font-bold text-slate-500 uppercase tracking-widest">Sent</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 md:w-3 md:h-3 rounded-full bg-purple-500" />
                <span className="text-[10px] md:text-xs font-bold text-slate-500 uppercase tracking-widest">Replies</span>
              </div>
            </div>
          </div>
          <div className="h-[250px] md:h-[400px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={displayData}>
                <defs>
                  <linearGradient id="colorSent" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorReplies" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#94A3B8', fontSize: 10, fontWeight: 600 }}
                  dy={10}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#94A3B8', fontSize: 10, fontWeight: 600 }}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#FFFFFF', 
                    borderRadius: '12px', 
                    border: '1px solid #E2E8F0',
                    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                    fontWeight: 'bold',
                    fontSize: '12px'
                  }}
                />
                <Area 
                  type="monotone" 
                  dataKey="sent" 
                  stroke="#3B82F6" 
                  strokeWidth={2}
                  fillOpacity={1} 
                  fill="url(#colorSent)" 
                />
                <Area 
                  type="monotone" 
                  dataKey="replies" 
                  stroke="#8B5CF6" 
                  strokeWidth={2}
                  fillOpacity={1} 
                  fill="url(#colorReplies)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Distribution Chart */}
        <div className="glass p-5 md:p-8 rounded-[32px] md:rounded-[40px] border-border/40 space-y-6 md:space-y-8">
          <h3 className="text-lg md:text-xl font-bold text-slate-800">Lead Distribution</h3>
          <div className="h-[200px] md:h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={[
                    { name: 'Tech', value: 400 },
                    { name: 'SaaS', value: 300 },
                    { name: 'Agency', value: 300 },
                    { name: 'E-commerce', value: 200 },
                  ]}
                  cx="50%"
                  cy="50%"
                  innerRadius={40}
                  outerRadius={70}
                  paddingAngle={8}
                  dataKey="value"
                >
                  {[400, 300, 300, 200].map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-3 md:space-y-4">
            {['Tech', 'SaaS', 'Agency', 'E-commerce'].map((label, i) => (
              <div key={label} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-2.5 h-2.5 md:w-3 md:h-3 rounded-full" style={{ backgroundColor: COLORS[i] }} />
                  <span className="text-xs md:text-sm font-bold text-slate-600">{label}</span>
                </div>
                <span className="text-xs md:text-sm font-bold text-slate-800">{[40, 30, 20, 10][i]}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Campaign Performance Table */}
      <div className="glass rounded-[24px] md:rounded-[32px] border-border/40 overflow-hidden">
        <div className="p-5 md:p-8 border-b border-border/40 flex items-center justify-between">
          <h3 className="text-lg md:text-xl font-bold text-slate-800">Campaign Performance</h3>
          <button className="text-xs md:text-sm font-bold text-primary flex items-center gap-2">
            Export <span className="hidden sm:inline">Report</span> <ExternalLink size={16} />
          </button>
        </div>
        <div className="overflow-x-auto scrollbar-hide">
          <table className="w-full text-left min-w-[600px]">
            <thead>
              <tr className="bg-muted/50 text-slate-500 text-[10px] md:text-xs font-bold uppercase tracking-wider">
                <th className="px-5 md:px-8 py-4">Campaign Name</th>
                <th className="px-5 md:px-8 py-4">Sent</th>
                <th className="px-5 md:px-8 py-4">Opened</th>
                <th className="px-5 md:px-8 py-4">Replied</th>
                <th className="px-5 md:px-8 py-4">Reply Rate</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40">
              {campaigns.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-8 py-12 text-center text-slate-500 font-medium">
                    No campaigns found to analyze.
                  </td>
                </tr>
              ) : (
                campaigns.map((campaign, i) => {
                  const sent = campaign.leads?.filter(l => l.status === 'ready').length || 0;
                  const opened = Math.floor(sent * 0.68);
                  const replied = Math.floor(sent * 0.08);
                  const rate = sent > 0 ? ((replied / sent) * 100).toFixed(1) + '%' : '0%';

                  return (
                    <tr key={campaign.id} className="hover:bg-muted/30 transition-colors">
                      <td className="px-5 md:px-8 py-4 font-bold text-sm md:text-base text-slate-800">{campaign.name}</td>
                      <td className="px-5 md:px-8 py-4 text-xs md:text-sm text-slate-500 font-medium">{sent}</td>
                      <td className="px-5 md:px-8 py-4 text-xs md:text-sm text-slate-500 font-medium">{opened}</td>
                      <td className="px-5 md:px-8 py-4 text-xs md:text-sm text-slate-500 font-medium">{replied}</td>
                      <td className="px-5 md:px-8 py-4">
                        <div className="flex items-center gap-2">
                          <span className="text-emerald-600 font-bold text-xs md:text-sm">{rate}</span>
                          <div className="w-12 md:w-16 h-1.5 bg-muted rounded-full overflow-hidden">
                            <div className="h-full bg-emerald-500 rounded-full" style={{ width: rate }} />
                          </div>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
