import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { 
  LayoutDashboard, 
  Send, 
  FileText, 
  BarChart3, 
  Settings, 
  CreditCard, 
  Users, 
  Plus, 
  Bell, 
  Search,
  ChevronLeft,
  Menu,
  X,
  LogOut
} from 'lucide-react';
import { cn } from '../lib/utils';
import { useStore } from '../store/useStore';

const sidebarItems = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
  { icon: Send, label: 'Campaigns', path: '/campaigns' },
  { icon: FileText, label: 'Templates', path: '/templates' },
  { icon: BarChart3, label: 'Analytics', path: '/analytics' },
  { icon: Users, label: 'Team', path: '/team' },
  { icon: CreditCard, label: 'Billing', path: '/billing' },
  { icon: Settings, label: 'Settings', path: '/settings' },
];

export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useStore();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const activeItem = sidebarItems.find(item => location.pathname.startsWith(item.path)) || sidebarItems[0];

  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar */}
      <motion.aside
        initial={false}
        animate={{ width: isSidebarOpen ? 240 : 80 }}
        className="fixed left-0 top-0 bottom-0 z-50 bg-sidebar text-sidebar-foreground flex flex-col transition-all duration-300 ease-in-out"
      >
        <div className="p-6 flex items-center gap-3">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center shadow-lg shadow-primary/20">
            <span className="text-white font-bold">❄</span>
          </div>
          {isSidebarOpen && (
            <motion.span 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="font-bold text-lg tracking-tight"
            >
              Mr. Cold Mail
            </motion.span>
          )}
        </div>

        <nav className="flex-1 px-4 py-4 space-y-1">
          {sidebarItems.map((item) => {
            const isActive = location.pathname.startsWith(item.path);
            return (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "sidebar-link",
                  isActive && "sidebar-link-active",
                  !isSidebarOpen && "justify-center px-0"
                )}
              >
                <item.icon size={20} className={cn(isActive ? "text-primary" : "text-slate-400")} />
                {isSidebarOpen && <span>{item.label}</span>}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-white/5">
          <button 
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="w-full sidebar-link justify-center"
          >
            {isSidebarOpen ? <ChevronLeft size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </motion.aside>

      {/* Main Content Area */}
      <main 
        className={cn(
          "flex-1 flex flex-col transition-all duration-300 ease-in-out",
          isSidebarOpen ? "ml-[240px]" : "ml-[80px]"
        )}
      >
        {/* Topbar */}
        <header className="sticky top-0 z-40 h-16 glass flex items-center justify-between px-8 border-b border-border/40">
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-semibold text-slate-800">{activeItem.label}</h1>
          </div>

          <div className="flex items-center gap-6">
            <div className="relative hidden md:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input 
                type="text" 
                placeholder="Search..." 
                className="pl-10 pr-4 py-2 bg-muted rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 w-64 transition-all"
              />
            </div>

            <div className="flex items-center gap-4">
              <button className="p-2 text-slate-400 hover:text-primary transition-colors relative">
                <Bell size={20} />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-primary rounded-full border-2 border-white" />
              </button>
              
              <button 
                onClick={() => navigate('/campaigns/new')}
                className="bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 shadow-sm transition-all"
              >
                <Plus size={18} />
                New Campaign
              </button>

              <div className="h-8 w-px bg-border mx-2" />

              <div className="flex items-center gap-3">
                <div className="text-right hidden sm:block">
                  <div className="text-sm font-bold text-slate-800">{user?.full_name}</div>
                  <div className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">
                    {user?.subscription?.plan || 'Free'} Plan
                  </div>
                </div>
                <div className="w-10 h-10 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-bold overflow-hidden">
                  <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.full_name}`} alt="avatar" />
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="p-8 max-w-7xl mx-auto w-full">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
};
