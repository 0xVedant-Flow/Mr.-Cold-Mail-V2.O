import React from 'react';
import { motion } from 'motion/react';
import { 
  Plus, 
  Search, 
  MoreHorizontal, 
  Trash2, 
  Users, 
  Shield, 
  User, 
  Mail, 
  CheckCircle2, 
  XCircle, 
  ArrowRight, 
  PlusCircle
} from 'lucide-react';
import { cn } from '../lib/utils';
import { useStore } from '../store/useStore';

const members = [
  { id: 1, name: 'Swagotom', email: 'theswagotom@gmail.com', role: 'Admin', status: 'Active' },
  { id: 2, name: 'Sarah Johnson', email: 'sarah@techflow.com', role: 'Member', status: 'Active' },
  { id: 3, name: 'David Chen', email: 'david@lumina.ai', role: 'Member', status: 'Invited' },
];

export const Team = () => {
  const { user } = useStore();

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
        <div>
          <h2 className="text-3xl font-bold text-slate-800 tracking-tight">Team Members</h2>
          <p className="text-slate-500 text-sm mt-1">Manage your team and their permissions</p>
        </div>
        <button className="w-full sm:w-auto bg-primary hover:bg-primary/90 text-white px-6 py-3 rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-primary/20 transition-all">
          <PlusCircle size={20} />
          Invite Member
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { label: 'Total Members', value: '3', icon: Users, color: 'text-primary bg-primary/10' },
          { label: 'Admins', value: '1', icon: Shield, color: 'text-purple-500 bg-purple-500/10' },
          { label: 'Pending Invites', value: '1', icon: Mail, color: 'text-cyan-500 bg-cyan-500/10' },
        ].map((stat, i) => (
          <div key={i} className="glass p-6 rounded-2xl border-border/40 flex items-center gap-4">
            <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center", stat.color)}>
              <stat.icon size={24} />
            </div>
            <div>
              <div className="text-slate-500 text-xs font-bold uppercase tracking-widest">{stat.label}</div>
              <div className="text-2xl font-bold text-slate-800 tracking-tight">{stat.value}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Members Table */}
      <div className="glass rounded-[32px] border-border/40 overflow-hidden">
        <div className="p-8 border-b border-border/40 flex items-center justify-between">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Search members..." 
              className="w-full pl-12 pr-4 py-3 bg-muted rounded-2xl border-none focus:ring-2 focus:ring-primary/20 transition-all"
            />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-muted/50 text-slate-500 text-xs font-bold uppercase tracking-wider">
                <th className="px-8 py-4">Name</th>
                <th className="px-8 py-4">Role</th>
                <th className="px-8 py-4">Status</th>
                <th className="px-8 py-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40">
              {members.map((member) => (
                <tr key={member.id} className="hover:bg-muted/30 transition-colors">
                  <td className="px-8 py-4">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm overflow-hidden border border-primary/20">
                        <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${member.name}`} alt="avatar" />
                      </div>
                      <div>
                        <div className="text-sm font-bold text-slate-800">{member.name}</div>
                        <div className="text-xs text-slate-500 font-medium">{member.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-4">
                    <span className={cn(
                      "px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider",
                      member.role === 'Admin' ? "bg-purple-500/10 text-purple-600" : "bg-slate-500/10 text-slate-600"
                    )}>
                      {member.role}
                    </span>
                  </td>
                  <td className="px-8 py-4">
                    <span className={cn(
                      "flex items-center gap-1.5 text-xs font-bold",
                      member.status === 'Active' ? "text-emerald-600" : "text-primary"
                    )}>
                      {member.status === 'Active' ? <CheckCircle2 size={14} /> : <Mail size={14} />}
                      {member.status}
                    </span>
                  </td>
                  <td className="px-8 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button className="p-2 text-slate-400 hover:text-primary transition-colors">
                        <MoreHorizontal size={20} />
                      </button>
                      <button className="p-2 text-slate-400 hover:text-destructive transition-colors">
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Invite Modal Placeholder */}
      <div className="p-12 glass rounded-[48px] border-border/40 text-center space-y-6">
        <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center text-primary mx-auto">
          <Plus size={40} />
        </div>
        <div className="space-y-2">
          <h3 className="text-2xl font-bold text-slate-800">Invite your team</h3>
          <p className="text-slate-500 font-medium max-w-md mx-auto">
            Collaborate with your team members and scale your outreach together.
          </p>
        </div>
        <button className="bg-primary text-white px-10 py-4 rounded-2xl font-bold shadow-xl shadow-primary/20 hover:bg-primary/90 transition-all flex items-center justify-center gap-2 mx-auto">
          Send Invites <ArrowRight size={20} />
        </button>
      </div>
    </div>
  );
};
