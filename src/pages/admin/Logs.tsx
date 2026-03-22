import React, { useEffect, useState } from 'react';
import { 
  History, 
  Search, 
  Filter, 
  User, 
  Shield, 
  Activity, 
  Clock,
  ChevronLeft,
  ChevronRight,
  ExternalLink
} from 'lucide-react';
import { api } from '../../lib/api';
import { useStore } from '../../store/useStore';

const AdminLogs: React.FC = () => {
  const { user: adminUser } = useStore();
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchLogs();
  }, [adminUser?.id]);

  const fetchLogs = async () => {
    try {
      const data = await api.get('/admin/logs', { headers: { 'x-user-id': adminUser?.id } });
      setLogs(data);
    } catch (error) {
      console.error('Failed to fetch admin logs:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredLogs = logs.filter(log => 
    log.action?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    log.admin?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.target?.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return <div>Loading...</div>;

  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-black/20" />
          <input 
            type="text" 
            placeholder="Search logs by action or user..." 
            className="w-full pl-12 pr-4 py-3 bg-white border border-black/5 rounded-xl text-sm font-medium text-black outline-none focus:border-indigo-500 transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-3 bg-white border border-black/5 rounded-xl text-sm font-bold text-black/60 hover:text-black transition-all">
            <Filter className="w-4 h-4" />
            Filter
          </button>
        </div>
      </div>

      {/* Logs Table */}
      <div className="bg-white rounded-2xl border border-black/5 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-black/[0.02] border-b border-black/5">
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-wider text-black/40">Admin</th>
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-wider text-black/40">Action</th>
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-wider text-black/40">Target User</th>
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-wider text-black/40">Details</th>
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-wider text-black/40">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/5">
              {filteredLogs.map((log) => (
                <tr key={log.id} className="hover:bg-black/[0.01] transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-indigo-500/10 flex items-center justify-center">
                        <Shield className="w-4 h-4 text-indigo-600" />
                      </div>
                      <span className="text-sm font-bold text-black">{log.admin?.email}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className={clsx(
                      "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider",
                      log.action.includes('credits') ? "bg-amber-500/10 text-amber-600" : 
                      log.action.includes('updated') ? "bg-indigo-500/10 text-indigo-600" : 
                      "bg-black/5 text-black/60"
                    )}>
                      {log.action.replace('_', ' ')}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {log.target ? (
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-black/20" />
                        <span className="text-sm font-medium text-black">{log.target.email}</span>
                      </div>
                    ) : (
                      <span className="text-xs text-black/20 font-medium italic">N/A</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="max-w-[200px] truncate text-xs font-mono text-black/40 bg-black/[0.02] px-2 py-1 rounded border border-black/5">
                      {JSON.stringify(log.details)}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1.5 text-xs font-medium text-black/40">
                      <Clock className="w-3.5 h-3.5" />
                      {new Date(log.created_at).toLocaleString()}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="p-6 border-t border-black/5 flex items-center justify-between">
          <p className="text-xs font-medium text-black/40">
            Showing <span className="text-black">1</span> to <span className="text-black">{filteredLogs.length}</span> of <span className="text-black">{logs.length}</span> logs
          </p>
          <div className="flex items-center gap-2">
            <button className="p-2 bg-black/5 rounded-lg text-black/40 hover:text-black disabled:opacity-50" disabled>
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button className="p-2 bg-black/5 rounded-lg text-black/40 hover:text-black disabled:opacity-50" disabled>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLogs;

const clsx = (...args: any[]) => args.filter(Boolean).join(' ');
