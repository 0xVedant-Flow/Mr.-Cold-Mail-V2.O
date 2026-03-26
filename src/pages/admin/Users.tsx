import React, { useEffect, useState } from 'react';
import { 
  Search, 
  Filter, 
  MoreVertical, 
  Edit, 
  Trash2, 
  Ban, 
  CheckCircle, 
  LogIn, 
  Plus,
  ChevronLeft,
  ChevronRight,
  Mail,
  Calendar,
  Shield
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { useStore } from '../../store/useStore';

const AdminUsers: React.FC = () => {
  const { user: adminUser } = useStore();
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, [adminUser?.id]);

  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/admin/users', { 
        headers: { 'x-user-id': adminUser?.id || '' } 
      });
      if (!response.ok) throw new Error('Failed to fetch users');
      const data = await response.json();
      setUsers(data);
    } catch (error) {
      console.error('Failed to fetch users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (userId: string, status: string) => {
    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'x-user-id': adminUser?.id || '' 
        },
        body: JSON.stringify({ status })
      });
      if (!response.ok) throw new Error('Failed to update status');
      fetchUsers();
    } catch (error) {
      console.error('Failed to update status:', error);
    }
  };

  const handleAddCredits = async (userId: string, amount: number) => {
    try {
      const response = await fetch(`/api/admin/users/${userId}/credits`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'x-user-id': adminUser?.id || '' 
        },
        body: JSON.stringify({ amount, action: 'add' })
      });
      if (!response.ok) throw new Error('Failed to add credits');
      fetchUsers();
    } catch (error) {
      console.error('Failed to add credits:', error);
    }
  };

  const filteredUsers = users.filter(u => 
    u.email?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    u.full_name?.toLowerCase().includes(searchTerm.toLowerCase())
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
            placeholder="Search users by name or email..." 
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
          <button className="flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-xl text-sm font-bold hover:bg-primary/90 transition-all">
            <Plus className="w-4 h-4" />
            Add User
          </button>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-muted/50 border-b border-border">
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">User</th>
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Plan</th>
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Status</th>
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Emails Used</th>
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Joined</th>
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-wider text-muted-foreground text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredUsers.map((u) => (
                <tr key={u.id} className="hover:bg-muted/30 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center font-bold text-foreground border border-border">
                        {u.email?.[0].toUpperCase()}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-foreground">{u.full_name || 'No Name'}</p>
                        <p className="text-xs text-muted-foreground font-medium">{u.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className={cn(
                      "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider",
                      u.plan === 'pro' ? "bg-indigo-500/10 text-indigo-600" : 
                      u.plan === 'agency' ? "bg-amber-500/10 text-amber-600" : 
                      "bg-muted text-muted-foreground"
                    )}>
                      {u.plan}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className={cn(
                      "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider",
                      u.status === 'active' ? "bg-emerald-500/10 text-emerald-600" : "bg-destructive/10 text-destructive"
                    )}>
                      {u.status === 'active' ? <CheckCircle className="w-3 h-3" /> : <Ban className="w-3 h-3" />}
                      {u.status}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden max-w-[100px]">
                        <div 
                          className="h-full bg-primary rounded-full" 
                          style={{ width: `${Math.min((u.credits?.[0]?.used_credits / u.credits?.[0]?.total_credits) * 100, 100)}%` }}
                        />
                      </div>
                      <span className="text-xs font-bold text-foreground">
                        {u.credits?.[0]?.used_credits || 0}/{u.credits?.[0]?.total_credits || 10}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                      <Calendar className="w-3.5 h-3.5" />
                      {new Date(u.created_at).toLocaleDateString()}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => handleAddCredits(u.id, 100)}
                        className="p-2 hover:bg-muted rounded-lg text-muted-foreground hover:text-primary transition-colors"
                        title="Add 100 Credits"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleUpdateStatus(u.id, u.status === 'active' ? 'suspended' : 'active')}
                        className={cn(
                          "p-2 hover:bg-muted rounded-lg transition-colors",
                          u.status === 'active' ? "text-muted-foreground hover:text-destructive" : "text-muted-foreground hover:text-emerald-500"
                        )}
                        title={u.status === 'active' ? 'Suspend' : 'Activate'}
                      >
                        {u.status === 'active' ? <Ban className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
                      </button>
                      <button className="p-2 hover:bg-muted rounded-lg text-muted-foreground hover:text-foreground transition-colors" title="Edit">
                        <Edit className="w-4 h-4" />
                      </button>
                      <button className="p-2 hover:bg-muted rounded-lg text-muted-foreground hover:text-foreground transition-colors" title="Impersonate">
                        <LogIn className="w-4 h-4" />
                      </button>
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
            Showing <span className="text-foreground">1</span> to <span className="text-foreground">{filteredUsers.length}</span> of <span className="text-foreground">{users.length}</span> users
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

export default AdminUsers;

const clsx = (...args: any[]) => args.filter(Boolean).join(' ');
