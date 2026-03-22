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
import { api } from '../../lib/api';
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
      const data = await api.get('/admin/users', { headers: { 'x-user-id': adminUser?.id } });
      setUsers(data);
    } catch (error) {
      console.error('Failed to fetch users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (userId: string, status: string) => {
    try {
      await api.put(`/admin/users/${userId}`, { status }, { headers: { 'x-user-id': adminUser?.id } });
      fetchUsers();
    } catch (error) {
      console.error('Failed to update status:', error);
    }
  };

  const handleAddCredits = async (userId: string, amount: number) => {
    try {
      await api.post(`/admin/users/${userId}/credits`, { amount, action: 'add' }, { headers: { 'x-user-id': adminUser?.id } });
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
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-black/20" />
          <input 
            type="text" 
            placeholder="Search users by name or email..." 
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
          <button className="flex items-center gap-2 px-6 py-3 bg-black text-white rounded-xl text-sm font-bold hover:bg-black/90 transition-all">
            <Plus className="w-4 h-4" />
            Add User
          </button>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-2xl border border-black/5 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-black/[0.02] border-b border-black/5">
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-wider text-black/40">User</th>
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-wider text-black/40">Plan</th>
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-wider text-black/40">Status</th>
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-wider text-black/40">Emails Used</th>
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-wider text-black/40">Joined</th>
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-wider text-black/40 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/5">
              {filteredUsers.map((u) => (
                <tr key={u.id} className="hover:bg-black/[0.01] transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-black/5 flex items-center justify-center font-bold text-black border border-black/10">
                        {u.email?.[0].toUpperCase()}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-black">{u.full_name || 'No Name'}</p>
                        <p className="text-xs text-black/40 font-medium">{u.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className={clsx(
                      "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider",
                      u.plan === 'pro' ? "bg-indigo-500/10 text-indigo-600" : 
                      u.plan === 'agency' ? "bg-amber-500/10 text-amber-600" : 
                      "bg-black/5 text-black/60"
                    )}>
                      {u.plan}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className={clsx(
                      "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider",
                      u.status === 'active' ? "bg-emerald-500/10 text-emerald-600" : "bg-rose-500/10 text-rose-600"
                    )}>
                      {u.status === 'active' ? <CheckCircle className="w-3 h-3" /> : <Ban className="w-3 h-3" />}
                      {u.status}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-1.5 bg-black/5 rounded-full overflow-hidden max-w-[100px]">
                        <div 
                          className="h-full bg-indigo-500 rounded-full" 
                          style={{ width: `${Math.min((u.credits?.[0]?.used_credits / u.credits?.[0]?.total_credits) * 100, 100)}%` }}
                        />
                      </div>
                      <span className="text-xs font-bold text-black">
                        {u.credits?.[0]?.used_credits || 0}/{u.credits?.[0]?.total_credits || 10}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1.5 text-xs font-medium text-black/40">
                      <Calendar className="w-3.5 h-3.5" />
                      {new Date(u.created_at).toLocaleDateString()}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => handleAddCredits(u.id, 100)}
                        className="p-2 hover:bg-black/5 rounded-lg text-black/40 hover:text-indigo-500 transition-colors"
                        title="Add 100 Credits"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleUpdateStatus(u.id, u.status === 'active' ? 'suspended' : 'active')}
                        className={clsx(
                          "p-2 hover:bg-black/5 rounded-lg transition-colors",
                          u.status === 'active' ? "text-black/40 hover:text-rose-500" : "text-black/40 hover:text-emerald-500"
                        )}
                        title={u.status === 'active' ? 'Suspend' : 'Activate'}
                      >
                        {u.status === 'active' ? <Ban className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
                      </button>
                      <button className="p-2 hover:bg-black/5 rounded-lg text-black/40 hover:text-black transition-colors" title="Edit">
                        <Edit className="w-4 h-4" />
                      </button>
                      <button className="p-2 hover:bg-black/5 rounded-lg text-black/40 hover:text-black transition-colors" title="Impersonate">
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
        <div className="p-6 border-t border-black/5 flex items-center justify-between">
          <p className="text-xs font-medium text-black/40">
            Showing <span className="text-black">1</span> to <span className="text-black">{filteredUsers.length}</span> of <span className="text-black">{users.length}</span> users
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

export default AdminUsers;

const clsx = (...args: any[]) => args.filter(Boolean).join(' ');
