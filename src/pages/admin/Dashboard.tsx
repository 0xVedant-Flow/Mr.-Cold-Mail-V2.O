import React, { useEffect, useState } from 'react';
import { 
  Users, 
  CreditCard, 
  TrendingUp, 
  Mail, 
  ArrowUpRight, 
  ArrowDownRight,
  Activity,
  DollarSign
} from 'lucide-react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  AreaChart, 
  Area 
} from 'recharts';
import { api } from '../../lib/api';
import { useStore } from '../../store/useStore';

const AdminDashboard: React.FC = () => {
  const { user } = useStore();
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await api.get('/admin/stats', { headers: { 'x-user-id': user?.id } });
        setStats(data);
      } catch (error) {
        console.error('Failed to fetch admin stats:', error);
      } finally {
        setLoading(false);
      }
    };

    if (user?.id) fetchStats();
  }, [user?.id]);

  if (loading) return <div>Loading...</div>;

  const data = [
    { name: 'Mon', revenue: 4000, users: 2400, emails: 2400 },
    { name: 'Tue', revenue: 3000, users: 1398, emails: 2210 },
    { name: 'Wed', revenue: 2000, users: 9800, emails: 2290 },
    { name: 'Thu', revenue: 2780, users: 3908, emails: 2000 },
    { name: 'Fri', revenue: 1890, users: 4800, emails: 2181 },
    { name: 'Sat', revenue: 2390, users: 3800, emails: 2500 },
    { name: 'Sun', revenue: 3490, users: 4300, emails: 2100 },
  ];

  const StatCard = ({ icon: Icon, label, value, trend, trendValue, color }: any) => (
    <div className="bg-white p-6 rounded-2xl border border-black/5 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div className={clsx("p-3 rounded-xl", color)}>
          <Icon className="w-6 h-6 text-white" />
        </div>
        <div className={clsx(
          "flex items-center gap-1 text-sm font-bold",
          trend === 'up' ? "text-emerald-500" : "text-rose-500"
        )}>
          {trend === 'up' ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
          {trendValue}
        </div>
      </div>
      <div>
        <p className="text-sm font-medium text-black/40 uppercase tracking-wider mb-1">{label}</p>
        <h3 className="text-3xl font-bold text-black tracking-tight">{value}</h3>
      </div>
    </div>
  );

  return (
    <div className="space-y-8">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          icon={Users} 
          label="Total Users" 
          value={stats?.totalUsers || 0} 
          trend="up" 
          trendValue="+12%" 
          color="bg-indigo-500"
        />
        <StatCard 
          icon={CreditCard} 
          label="Active Subscriptions" 
          value={stats?.activeSubscriptions || 0} 
          trend="up" 
          trendValue="+5%" 
          color="bg-emerald-500"
        />
        <StatCard 
          icon={DollarSign} 
          label="Monthly Revenue" 
          value={`$${stats?.monthlyRevenue || 0}`} 
          trend="up" 
          trendValue="+18%" 
          color="bg-amber-500"
        />
        <StatCard 
          icon={Mail} 
          label="Emails Generated Today" 
          value={stats?.emailsGeneratedToday || 0} 
          trend="down" 
          trendValue="-2%" 
          color="bg-rose-500"
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-8 rounded-2xl border border-black/5 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-lg font-bold text-black flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-indigo-500" />
              User Growth
            </h3>
            <select className="bg-black/5 border-none rounded-lg text-sm font-medium px-3 py-1 text-black/60 outline-none">
              <option>Last 7 Days</option>
              <option>Last 30 Days</option>
            </select>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data}>
                <defs>
                  <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#00000005" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#00000040' }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#00000040' }} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#000', border: 'none', borderRadius: '12px', color: '#fff' }}
                  itemStyle={{ color: '#fff' }}
                />
                <Area type="monotone" dataKey="users" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#colorUsers)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-8 rounded-2xl border border-black/5 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-lg font-bold text-black flex items-center gap-2">
              <Activity className="w-5 h-5 text-emerald-500" />
              Email Usage
            </h3>
            <select className="bg-black/5 border-none rounded-lg text-sm font-medium px-3 py-1 text-black/60 outline-none">
              <option>Last 7 Days</option>
              <option>Last 30 Days</option>
            </select>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#00000005" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#00000040' }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#00000040' }} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#000', border: 'none', borderRadius: '12px', color: '#fff' }}
                  itemStyle={{ color: '#fff' }}
                />
                <Line type="monotone" dataKey="emails" stroke="#10b981" strokeWidth={3} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-2xl border border-black/5 shadow-sm overflow-hidden">
        <div className="p-8 border-b border-black/5 flex items-center justify-between">
          <h3 className="text-lg font-bold text-black">Recent Activity</h3>
          <button className="text-sm font-bold text-indigo-500 hover:text-indigo-600 transition-colors">View All</button>
        </div>
        <div className="divide-y divide-black/5">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="p-6 flex items-center justify-between hover:bg-black/[0.01] transition-colors">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-black/5 flex items-center justify-center font-bold text-black">
                  JD
                </div>
                <div>
                  <p className="text-sm font-bold text-black">John Doe signed up</p>
                  <p className="text-xs text-black/40 font-medium">john@example.com • 2 hours ago</p>
                </div>
              </div>
              <div className="bg-emerald-500/10 text-emerald-600 text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-md">
                Success
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;

const clsx = (...args: any[]) => args.filter(Boolean).join(' ');
