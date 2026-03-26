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
import { cn } from '../../lib/utils';
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
      const response = await fetch('/api/admin/logs', { 
        headers: { 'x-user-id': adminUser?.id || '' } 
      });
      if (!response.ok) throw new Error('Failed to fetch logs');
      const data = await response.json();
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
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground/40" />
          <input 
            type="text" 
            placeholder="Search logs by action or user..." 
            className="w-full pl-12 pr-4 py-3 bg-card border border-border rounded-xl text-sm font-medium text-foreground outline-none focus:border-primary transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-3 bg-card border border-border rounded-xl text-sm font-bold text-muted-foreground hover:text-foreground transition-all">
            <Filter className="w-4 h-4" />
            Filter
          </button>
        </div>
      </div>

      {/* Logs Table */}
      <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-muted/50 border-b border-border">
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Admin</th>
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Action</th>
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Target User</th>
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Details</th>
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredLogs.map((log) => (
                <tr key={log.id} className="hover:bg-muted/30 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-indigo-500/10 flex items-center justify-center">
                        <Shield className="w-4 h-4 text-indigo-600" />
                      </div>
                      <span className="text-sm font-bold text-foreground">{log.admin?.email}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className={cn(
                      "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider",
                      log.action.includes('credits') ? "bg-amber-500/10 text-amber-600" : 
                      log.action.includes('updated') ? "bg-indigo-500/10 text-indigo-600" : 
                      "bg-muted text-muted-foreground"
                    )}>
                      {log.action.replace('_', ' ')}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {log.target ? (
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-muted-foreground/40" />
                        <span className="text-sm font-medium text-foreground">{log.target.email}</span>
                      </div>
                    ) : (
                      <span className="text-xs text-muted-foreground/40 font-medium italic">N/A</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="max-w-[200px] truncate text-xs font-mono text-muted-foreground/60 bg-muted px-2 py-1 rounded border border-border">
                      {JSON.stringify(log.details)}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
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
        <div className="p-6 border-t border-border flex items-center justify-between">
          <p className="text-xs font-medium text-muted-foreground">
            Showing <span className="text-foreground">1</span> to <span className="text-foreground">{filteredLogs.length}</span> of <span className="text-foreground">{logs.length}</span> logs
          </p>
          <div className="flex items-center gap-2">
            <button className="p-2 bg-muted rounded-lg text-muted-foreground hover:text-foreground disabled:opacity-50" disabled>
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button className="p-2 bg-muted rounded-lg text-muted-foreground hover:text-foreground disabled:opacity-50" disabled>
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
