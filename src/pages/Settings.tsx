import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  User, 
  Mail, 
  Shield, 
  CreditCard, 
  Globe, 
  LogOut, 
  CheckCircle2, 
  AlertCircle, 
  Loader2, 
  ChevronRight,
  Zap,
  Settings as SettingsIcon,
  Lock
} from 'lucide-react';
import { useStore } from '../store/useStore';
import { supabase } from '../lib/supabase';
import { api } from '../lib/api';
import { cn } from '../lib/utils';

const Toast = ({ message, type, onClose }: { message: string, type: 'success' | 'error', onClose: () => void }) => (
  <motion.div
    initial={{ opacity: 0, y: 50 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: 50 }}
    className={cn(
      "fixed bottom-8 right-8 px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3 z-50 font-bold",
      type === 'success' ? "bg-emerald-500 text-white" : "bg-destructive text-destructive-foreground"
    )}
  >
    {type === 'success' ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
    {message}
    <button onClick={onClose} className="ml-4 opacity-70 hover:opacity-100">×</button>
  </motion.div>
);

export const Settings = () => {
  const { user, signOut, fetchUser } = useStore();
  const [loading, setLoading] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string, type: 'success' | 'error' } | null>(null);
  
  // Preferences state
  const [fullName, setFullName] = useState(user?.full_name || '');
  const [avatarUrl, setAvatarUrl] = useState(user?.avatar_url || '');
  const [tone, setTone] = useState(user?.default_tone || 'Professional');
  const [goal, setGoal] = useState(user?.default_goal || 'Book a Meeting');
  
  // Security state
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  useEffect(() => {
    if (user) {
      setFullName(user.full_name || '');
      setAvatarUrl(user.avatar_url || '');
      setTone(user.default_tone || 'Professional');
      setGoal(user.default_goal || 'Book a Meeting');
    }
  }, [user]);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const [showConfirmCancel, setShowConfirmCancel] = useState(false);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);

  const handleUpdateProfile = async () => {
    if (!user) return;
    setLoading('profile');
    try {
      const { error } = await supabase
        .from('users')
        .update({ 
          full_name: fullName,
          avatar_url: avatarUrl
        })
        .eq('id', user.id);
      
      if (error) throw error;
      await fetchUser();
      showToast('Profile updated successfully!');
    } catch (err: any) {
      showToast(err.message, 'error');
    } finally {
      setLoading(null);
    }
  };

  const handleUpdatePreferences = async () => {
    if (!user) return;
    setLoading('preferences');
    try {
      const { error } = await supabase
        .from('users')
        .update({ default_tone: tone, default_goal: goal })
        .eq('id', user.id);
      
      if (error) throw error;
      await fetchUser();
      showToast('Preferences updated successfully!');
    } catch (err: any) {
      showToast(err.message, 'error');
    } finally {
      setLoading(null);
    }
  };

  const handleConnectGmail = async () => {
    if (!user) return;
    setLoading('gmail');
    try {
      const data = await api.get(`/auth/google/url?state=${user.id}`);
      
      // Use a more robust popup handling
      const width = 600;
      const height = 700;
      const left = window.screenX + (window.outerWidth - width) / 2;
      const top = window.screenY + (window.outerHeight - height) / 2;
      
      const popup = window.open(
        data.url,
        'google_auth',
        `width=${width},height=${height},left=${left},top=${top}`
      );

      if (!popup) {
        showToast('Please allow popups to connect Gmail', 'error');
        return;
      }

      const handleMessage = (event: MessageEvent) => {
        // Basic origin check for security
        if (event.origin !== window.location.origin) return;

        if (event.data?.type === 'GMAIL_AUTH_SUCCESS') {
          fetchUser();
          showToast(`Gmail connected: ${event.data.email}`);
          window.removeEventListener('message', handleMessage);
        }
      };

      window.addEventListener('message', handleMessage);
    } catch (err: any) {
      showToast(err.message, 'error');
    } finally {
      setLoading(null);
    }
  };

  const handleDisconnectGmail = async () => {
    if (!user) return;
    setLoading('gmail');
    try {
      await api.post('/auth/google/disconnect', { userId: user.id });
      await fetchUser();
      showToast('Gmail disconnected');
    } catch (err: any) {
      showToast(err.message, 'error');
    } finally {
      setLoading(null);
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      showToast('Passwords do not match', 'error');
      return;
    }
    setLoading('security');
    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) throw error;
      showToast('Password updated successfully!');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      showToast(err.message, 'error');
    } finally {
      setLoading(null);
    }
  };

  const handleCancelSubscription = async () => {
    if (!user) return;
    setShowConfirmCancel(false);
    setLoading('subscription');
    try {
      await api.post('/api/cancel-subscription', { userId: user.id });
      await fetchUser();
      showToast('Subscription canceled');
    } catch (err: any) {
      showToast(err.message, 'error');
    } finally {
      setLoading(null);
    }
  };

  const handleDeleteAccount = async () => {
    if (!user) return;
    setShowConfirmDelete(false);
    setLoading('delete');
    try {
      await api.post('/api/delete-account', { userId: user.id });
      await signOut();
      window.location.href = '/';
    } catch (err: any) {
      showToast(err.message, 'error');
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="max-w-4xl mx-auto pb-20 px-4 sm:px-6">
      <AnimatePresence>
        {toast && <Toast {...toast} onClose={() => setToast(null)} />}
        
        {/* Confirmation Modals */}
        {showConfirmCancel && (
          <div className="fixed inset-0 bg-background/60 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-card rounded-[32px] p-8 max-w-md w-full shadow-2xl space-y-6 border border-border"
            >
              <div className="w-16 h-16 bg-amber-500/10 rounded-2xl flex items-center justify-center text-amber-500 mx-auto">
                <AlertCircle size={32} />
              </div>
              <div className="text-center">
                <h3 className="text-2xl font-bold text-foreground">Cancel Subscription?</h3>
                <p className="text-muted-foreground mt-2">Your plan will remain active until the end of the current billing period.</p>
              </div>
              <div className="flex gap-4">
                <button 
                  onClick={() => setShowConfirmCancel(false)}
                  className="flex-1 px-6 py-3 rounded-xl bg-muted text-muted-foreground font-bold hover:bg-muted/80 transition-all"
                >
                  Keep Plan
                </button>
                <button 
                  onClick={handleCancelSubscription}
                  className="flex-1 px-6 py-3 rounded-xl bg-amber-500 text-white font-bold hover:bg-amber-600 transition-all shadow-lg shadow-amber-500/20"
                >
                  Yes, Cancel
                </button>
              </div>
            </motion.div>
          </div>
        )}

        {showConfirmDelete && (
          <div className="fixed inset-0 bg-background/60 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-card rounded-[32px] p-8 max-w-md w-full shadow-2xl space-y-6 border border-border"
            >
              <div className="w-16 h-16 bg-destructive/10 rounded-2xl flex items-center justify-center text-destructive mx-auto">
                <AlertCircle size={32} />
              </div>
              <div className="text-center">
                <h3 className="text-2xl font-bold text-foreground">Delete Account?</h3>
                <p className="text-muted-foreground mt-2">This action is permanent and will delete all your campaigns, leads, and data. This cannot be undone.</p>
              </div>
              <div className="flex gap-4">
                <button 
                  onClick={() => setShowConfirmDelete(false)}
                  className="flex-1 px-6 py-3 rounded-xl bg-muted text-muted-foreground font-bold hover:bg-muted/80 transition-all"
                >
                  Go Back
                </button>
                <button 
                  onClick={handleDeleteAccount}
                  className="flex-1 px-6 py-3 rounded-xl bg-destructive text-destructive-foreground font-bold hover:bg-destructive/90 transition-all shadow-lg shadow-destructive/20"
                >
                  Delete Forever
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <header className="mb-12">
        <h1 className="text-4xl font-black text-foreground tracking-tight mb-2">Settings</h1>
        <p className="text-muted-foreground font-medium">Manage your account, preferences, and billing.</p>
      </header>

      <div className="space-y-8">
        {/* 1. Account Settings */}
        <section className="bg-card rounded-[32px] border border-border shadow-sm overflow-hidden">
          <div className="p-8 border-b border-border flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary">
                <User size={24} />
              </div>
              <div>
                <h2 className="text-xl font-bold text-foreground">Account</h2>
                <p className="text-sm text-muted-foreground font-medium">Basic information about your profile.</p>
              </div>
            </div>
            <button 
              onClick={() => signOut()}
              className="px-6 py-2 rounded-xl bg-destructive/10 text-destructive font-bold text-sm hover:bg-destructive/20 transition-all flex items-center gap-2"
            >
              <LogOut size={16} /> Logout
            </button>
          </div>
          <div className="p-8 space-y-6">
            <div className="flex flex-col sm:flex-row items-center gap-6 mb-8">
              <div className="relative group">
                <div className="w-24 h-24 rounded-3xl bg-muted border-2 border-border overflow-hidden flex items-center justify-center text-muted-foreground">
                  {avatarUrl ? (
                    <img src={avatarUrl} alt="Profile" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  ) : (
                    <User size={40} />
                  )}
                </div>
              </div>
              <div className="flex-1 space-y-2">
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Avatar URL</label>
                <input 
                  type="text"
                  value={avatarUrl}
                  onChange={(e) => setAvatarUrl(e.target.value)}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full p-4 bg-muted rounded-2xl border border-border font-bold text-foreground focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Full Name</label>
                <input 
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Your Name"
                  className="w-full p-4 bg-muted rounded-2xl border border-border font-bold text-foreground focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Email Address</label>
                <div className="flex items-center gap-3 p-4 bg-muted rounded-2xl border border-border text-muted-foreground font-bold">
                  <Mail size={18} />
                  {user?.email}
                </div>
              </div>
            </div>
            <div className="flex justify-end">
              <button 
                onClick={handleUpdateProfile}
                disabled={loading === 'profile'}
                className="w-full sm:w-auto px-8 py-3 bg-primary text-primary-foreground rounded-xl font-bold text-sm shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all flex items-center justify-center gap-2"
              >
                {loading === 'profile' ? <Loader2 className="animate-spin" size={18} /> : 'Update Profile'}
              </button>
            </div>
          </div>
        </section>

        {/* 2. Gmail Connection */}
        <section className="bg-card rounded-[32px] border border-border shadow-sm overflow-hidden">
          <div className="p-8 border-b border-border">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary">
                <Globe size={24} />
              </div>
              <div>
                <h2 className="text-xl font-bold text-foreground">Gmail Integration</h2>
                <p className="text-sm text-muted-foreground font-medium">Connect your Gmail to send emails directly.</p>
              </div>
            </div>
          </div>
          <div className="p-8">
            {user?.gmailAccount?.connected ? (
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-6 bg-emerald-500/5 rounded-3xl border border-emerald-500/20">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-card rounded-xl flex items-center justify-center text-emerald-500 shadow-sm border border-emerald-500/20">
                    <CheckCircle2 size={20} />
                  </div>
                  <div>
                    <div className="font-bold text-foreground">{user.gmailAccount.email}</div>
                    <div className="text-xs text-muted-foreground font-medium">Connected and ready to send</div>
                  </div>
                </div>
                <button 
                  onClick={handleDisconnectGmail}
                  disabled={loading === 'gmail'}
                  className="w-full sm:w-auto px-6 py-2 bg-card text-destructive border border-destructive/20 rounded-xl font-bold text-sm hover:bg-destructive/10 transition-all disabled:opacity-50"
                >
                  {loading === 'gmail' ? <Loader2 className="animate-spin" size={18} /> : 'Disconnect'}
                </button>
              </div>
            ) : (
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-6 bg-muted rounded-3xl border border-border">
                <div>
                  <div className="font-bold text-foreground">Not Connected</div>
                  <div className="text-xs text-muted-foreground font-medium">Connect your account to enable one-click sending.</div>
                </div>
                <button 
                  onClick={handleConnectGmail}
                  disabled={loading === 'gmail'}
                  className="w-full sm:w-auto px-8 py-3 bg-primary text-primary-foreground rounded-xl font-bold text-sm shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all flex items-center justify-center gap-2"
                >
                  {loading === 'gmail' ? <Loader2 className="animate-spin" size={18} /> : <><Globe size={18} /> Connect Gmail</>}
                </button>
              </div>
            )}
          </div>
        </section>

        {/* 3. Subscription / Plan */}
        <section className="bg-card rounded-[32px] border border-border shadow-sm overflow-hidden">
          <div className="p-8 border-b border-border">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-amber-500/10 rounded-2xl flex items-center justify-center text-amber-500">
                <CreditCard size={24} />
              </div>
              <div>
                <h2 className="text-xl font-bold text-foreground">Subscription & Billing</h2>
                <p className="text-sm text-muted-foreground font-medium">Manage your plan and credits.</p>
              </div>
            </div>
          </div>
          <div className="p-8 space-y-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="p-6 bg-primary text-primary-foreground rounded-3xl relative overflow-hidden group">
                <Zap className="absolute -right-4 -bottom-4 w-32 h-32 text-white/5 group-hover:scale-110 transition-transform" />
                <div className="relative z-10">
                  <div className="text-xs font-bold text-primary-foreground/70 uppercase tracking-widest mb-1">Current Plan</div>
                  <div className="text-3xl font-black capitalize mb-4">{user?.subscription?.plan || 'Free'}</div>
                  <div className="flex items-center gap-2 text-sm font-bold text-primary-foreground/80">
                    Status: <span className={cn(
                      "px-2 py-0.5 rounded-md text-[10px] uppercase",
                      user?.subscription?.status === 'active' ? "bg-emerald-500 text-white" : "bg-amber-500 text-white"
                    )}>{user?.subscription?.status || 'Active'}</span>
                  </div>
                </div>
              </div>
              <div className="p-6 bg-primary/5 rounded-3xl border border-primary/10">
                <div className="text-xs font-bold text-primary/70 uppercase tracking-widest mb-1">Remaining Credits</div>
                <div className="text-3xl font-black text-primary mb-4">
                  {user?.credits ? (user.credits.total_credits - user.credits.used_credits) : 0}
                </div>
                <div className="text-xs text-primary/60 font-medium">Credits reset every month on your billing date.</div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <button 
                onClick={() => window.location.href = '/billing'}
                className="flex-1 px-8 py-4 bg-primary text-primary-foreground rounded-2xl font-bold shadow-xl shadow-primary/20 hover:bg-primary/90 transition-all flex items-center justify-center gap-2"
              >
                Upgrade Plan <ChevronRight size={18} />
              </button>
              {user?.subscription?.plan !== 'free' && user?.subscription?.status === 'active' && (
                <button 
                  onClick={() => setShowConfirmCancel(true)}
                  disabled={loading === 'subscription'}
                  className="flex-1 px-8 py-4 bg-card text-muted-foreground border border-border rounded-2xl font-bold hover:bg-muted transition-all"
                >
                  {loading === 'subscription' ? <Loader2 className="animate-spin mx-auto" size={18} /> : 'Cancel Subscription'}
                </button>
              )}
            </div>
          </div>
        </section>

        {/* 4. Email Preferences */}
        <section className="bg-card rounded-[32px] border border-border shadow-sm overflow-hidden">
          <div className="p-8 border-b border-border">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-emerald-500/10 rounded-2xl flex items-center justify-center text-emerald-500">
                <SettingsIcon size={24} />
              </div>
              <div>
                <h2 className="text-xl font-bold text-foreground">Email Preferences</h2>
                <p className="text-sm text-muted-foreground font-medium">Default settings for your AI email generation.</p>
              </div>
            </div>
          </div>
          <div className="p-8 space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Default Tone</label>
                <select 
                  value={tone}
                  onChange={(e) => setTone(e.target.value)}
                  className="w-full p-4 bg-muted rounded-2xl border border-border font-bold text-foreground focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                >
                  <option>Friendly</option>
                  <option>Professional</option>
                  <option>Casual</option>
                  <option>Direct</option>
                  <option>Witty</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Default Goal</label>
                <select 
                  value={goal}
                  onChange={(e) => setGoal(e.target.value)}
                  className="w-full p-4 bg-muted rounded-2xl border border-border font-bold text-foreground focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                >
                  <option>Book a Meeting</option>
                  <option>Get a Reply</option>
                  <option>Request a Demo</option>
                  <option>Feedback</option>
                </select>
              </div>
            </div>
            <div className="flex justify-end pt-4">
              <button 
                onClick={handleUpdatePreferences}
                disabled={loading === 'preferences'}
                className="w-full sm:w-auto px-10 py-4 bg-primary text-primary-foreground rounded-2xl font-bold shadow-xl shadow-primary/20 hover:bg-primary/90 transition-all flex items-center justify-center gap-2"
              >
                {loading === 'preferences' ? <Loader2 className="animate-spin" size={18} /> : 'Save Preferences'}
              </button>
            </div>
          </div>
        </section>

        {/* 5. Security */}
        <section className="bg-card rounded-[32px] border border-border shadow-sm overflow-hidden">
          <div className="p-8 border-b border-border">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-muted rounded-2xl flex items-center justify-center text-muted-foreground">
                <Lock size={24} />
              </div>
              <div>
                <h2 className="text-xl font-bold text-foreground">Security</h2>
                <p className="text-sm text-muted-foreground font-medium">Update your password and secure your account.</p>
              </div>
            </div>
          </div>
          <form onSubmit={handleUpdatePassword} className="p-8 space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest">New Password</label>
                <input 
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full p-4 bg-muted rounded-2xl border border-border font-bold text-foreground focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Confirm Password</label>
                <input 
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full p-4 bg-muted rounded-2xl border border-border font-bold text-foreground focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                />
              </div>
            </div>
            <div className="flex justify-end pt-4">
              <button 
                type="submit"
                disabled={loading === 'security' || !newPassword}
                className="w-full sm:w-auto px-10 py-4 bg-foreground text-background rounded-2xl font-bold shadow-xl shadow-foreground/10 hover:opacity-90 transition-all flex items-center justify-center gap-2"
              >
                {loading === 'security' ? <Loader2 className="animate-spin" size={18} /> : 'Update Password'}
              </button>
            </div>
          </form>
        </section>

        {/* 6. Danger Zone */}
        <section className="bg-destructive/5 rounded-[32px] border border-destructive/20 overflow-hidden">
          <div className="p-8 border-b border-destructive/20 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-destructive/10 rounded-2xl flex items-center justify-center text-destructive">
                <AlertCircle size={24} />
              </div>
              <div>
                <h2 className="text-xl font-bold text-foreground">Danger Zone</h2>
                <p className="text-sm text-muted-foreground font-medium">Irreversible actions for your account.</p>
              </div>
            </div>
          </div>
          <div className="p-8">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <h3 className="font-bold text-foreground">Delete Account</h3>
                <p className="text-sm text-muted-foreground font-medium">Once you delete your account, there is no going back. Please be certain.</p>
              </div>
              <button 
                onClick={() => setShowConfirmDelete(true)}
                disabled={loading === 'delete'}
                className="w-full sm:w-auto px-8 py-3 bg-destructive text-destructive-foreground rounded-xl font-bold text-sm shadow-lg shadow-destructive/20 hover:bg-destructive/90 transition-all"
              >
                {loading === 'delete' ? <Loader2 className="animate-spin mx-auto" size={18} /> : 'Delete Account'}
              </button>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};
