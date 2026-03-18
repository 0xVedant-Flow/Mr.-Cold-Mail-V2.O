import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  User, 
  Lock, 
  Bell, 
  Globe, 
  Shield, 
  CreditCard, 
  LogOut, 
  Camera, 
  CheckCircle2, 
  Save,
  Mail,
  Building,
  Briefcase,
  Key,
  AlertTriangle
} from 'lucide-react';
import { cn } from '../lib/utils';
import { useStore } from '../store/useStore';
import { supabase } from '../lib/supabase';

const tabs = [
  { id: 'profile', label: 'Profile', icon: User },
  { id: 'security', label: 'Security', icon: Shield },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'api', label: 'API Keys', icon: Key },
];

export const Settings = () => {
  const { user, signOut } = useStore();
  const [activeTab, setActiveTab] = useState('profile');
  const [loading, setLoading] = useState(false);
  const [fullName, setFullName] = useState(user?.full_name || '');
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      const { error } = await supabase
        .from('users')
        .update({ full_name: fullName })
        .eq('id', user?.id);

      if (error) throw error;
      setMessage({ type: 'success', text: 'Profile updated successfully!' });
      setTimeout(() => setMessage(null), 3000);
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-slate-800 tracking-tight">Settings</h2>
          <p className="text-slate-500 font-medium">Manage your account preferences and security.</p>
        </div>
        <button 
          onClick={() => signOut()}
          className="px-6 py-3 rounded-xl glass text-rose-500 font-bold flex items-center gap-2 hover:bg-rose-50 transition-all"
        >
          <LogOut size={18} /> Sign Out
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Navigation */}
        <div className="space-y-2">
          {tabs.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={cn(
                "w-full flex items-center gap-3 px-6 py-4 rounded-2xl font-bold text-sm transition-all",
                activeTab === item.id ? "bg-primary text-white shadow-lg shadow-primary/20" : "text-slate-600 hover:bg-muted"
              )}
            >
              <item.icon size={18} />
              {item.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="md:col-span-2 space-y-8">
          {activeTab === 'profile' && (
            <motion.div 
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              className="glass p-8 rounded-[40px] border-border/40 space-y-8"
            >
              <div className="flex items-center gap-6">
                <div className="relative group">
                  <div className="w-24 h-24 bg-primary/10 rounded-[32px] flex items-center justify-center text-primary text-3xl font-bold">
                    {user?.full_name?.charAt(0) || user?.email?.charAt(0)}
                  </div>
                  <button className="absolute -bottom-2 -right-2 p-2 bg-white rounded-xl shadow-lg border border-border/40 text-slate-600 hover:text-primary transition-all opacity-0 group-hover:opacity-100">
                    <Camera size={16} />
                  </button>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-800">Profile Information</h3>
                  <p className="text-sm text-slate-500 font-medium">Update your personal details.</p>
                </div>
              </div>

              <form onSubmit={handleUpdateProfile} className="space-y-6">
                {message && (
                  <div className={cn(
                    "p-4 rounded-2xl text-sm font-bold flex items-center gap-2",
                    message.type === 'success' ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600"
                  )}>
                    {message.type === 'success' ? <CheckCircle2 size={18} /> : <AlertTriangle size={18} />}
                    {message.text}
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-widest text-slate-400">Full Name</label>
                    <div className="relative">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                      <input 
                        type="text" 
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        className="w-full pl-12 pr-4 py-4 bg-muted rounded-2xl border-none focus:ring-2 focus:ring-primary/20 font-bold text-slate-800 transition-all"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-widest text-slate-400">Email Address</label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                      <input 
                        type="email" 
                        value={user?.email || ''}
                        disabled
                        className="w-full pl-12 pr-4 py-4 bg-muted rounded-2xl border-none font-bold text-slate-400 cursor-not-allowed"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex justify-end">
                  <button 
                    type="submit"
                    disabled={loading}
                    className="bg-primary text-white px-10 py-4 rounded-2xl font-bold flex items-center gap-2 shadow-xl shadow-primary/20 hover:bg-primary/90 transition-all disabled:opacity-50"
                  >
                    <Save size={20} /> {loading ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </form>
            </motion.div>
          )}

          {activeTab === 'notifications' && (
            <motion.div
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-8"
            >
              <h3 className="text-xl font-bold text-slate-800">Notification Preferences</h3>
              <div className="space-y-6">
                {[
                  { label: 'Campaign Completed', desc: 'Notify me when a campaign finishes generating emails', enabled: true },
                  { label: 'New Reply Received', desc: 'Notify me when a lead replies to an email', enabled: true },
                  { label: 'Usage Alerts', desc: 'Notify me when I reach 80% of my monthly lead quota', enabled: false },
                  { label: 'Product Updates', desc: 'Receive emails about new features and improvements', enabled: true },
                ].map((item, i) => (
                  <div key={i} className="flex items-center justify-between p-4 glass rounded-2xl border-border/40">
                    <div>
                      <div className="font-bold text-slate-800">{item.label}</div>
                      <div className="text-xs text-slate-500 font-medium">{item.desc}</div>
                    </div>
                    <button className={cn(
                      "w-12 h-6 rounded-full transition-all relative",
                      item.enabled ? "bg-primary" : "bg-muted"
                    )}>
                      <div className={cn(
                        "absolute top-1 w-4 h-4 rounded-full bg-white transition-all shadow-sm",
                        item.enabled ? "right-1" : "left-1"
                      )} />
                    </button>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {activeTab === 'profile' && (
            <div className="glass p-8 rounded-[40px] border-rose-100 bg-rose-50/30 space-y-6 mt-8">
              <div>
                <h3 className="text-xl font-bold text-slate-800">Danger Zone</h3>
                <p className="text-sm text-slate-500 font-medium">Irreversible actions for your account.</p>
              </div>
              <div className="flex items-center justify-between p-6 bg-white rounded-3xl border border-rose-100">
                <div>
                  <div className="font-bold text-slate-800">Delete Account</div>
                  <p className="text-xs text-slate-500 font-medium">Permanently delete your account and all data.</p>
                </div>
                <button className="px-6 py-3 rounded-xl border border-rose-200 text-rose-500 font-bold hover:bg-rose-500 hover:text-white transition-all">
                  Delete
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
