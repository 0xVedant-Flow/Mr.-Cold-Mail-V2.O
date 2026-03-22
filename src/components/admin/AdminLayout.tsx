import React from 'react';
import { Link, useLocation, Outlet, Navigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  CreditCard, 
  Package, 
  Mail, 
  FileText, 
  Settings, 
  History,
  LogOut,
  ChevronRight
} from 'lucide-react';
import { useStore } from '../../store/useStore';
import { clsx } from 'clsx';

const AdminLayout: React.FC = () => {
  const { user, signOut } = useStore();
  const location = useLocation();

  if (!user || user.role !== 'admin') {
    return <Navigate to="/" replace />;
  }

  const menuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/admin' },
    { icon: Users, label: 'Users', path: '/admin/users' },
    { icon: CreditCard, label: 'Subscriptions', path: '/admin/subscriptions' },
    { icon: Package, label: 'Plans', path: '/admin/plans' },
    { icon: Mail, label: 'Email Usage', path: '/admin/usage' },
    { icon: FileText, label: 'Templates', path: '/admin/templates' },
    { icon: History, label: 'Logs', path: '/admin/logs' },
    { icon: Settings, label: 'Settings', path: '/admin/settings' },
  ];

  return (
    <div className="flex h-screen bg-[#F5F5F4] font-sans">
      {/* Sidebar */}
      <aside className="w-64 bg-[#0A0A0A] text-white flex flex-col">
        <div className="p-6">
          <Link to="/admin" className="text-xl font-bold tracking-tighter flex items-center gap-2">
            <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
              <span className="text-black font-black">M</span>
            </div>
            MR. COLD MAIL
          </Link>
          <div className="mt-2 text-[10px] uppercase tracking-widest text-white/40 font-semibold">
            Admin Panel
          </div>
        </div>

        <nav className="flex-1 px-4 py-4 space-y-1">
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={clsx(
                  "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group",
                  isActive 
                    ? "bg-white text-black" 
                    : "text-white/60 hover:text-white hover:bg-white/5"
                )}
              >
                <item.icon className={clsx("w-5 h-5", isActive ? "text-black" : "text-white/40 group-hover:text-white")} />
                <span className="font-medium">{item.label}</span>
                {isActive && <ChevronRight className="w-4 h-4 ml-auto" />}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-white/10">
          <button
            onClick={() => signOut()}
            className="flex items-center gap-3 px-4 py-3 w-full rounded-xl text-white/60 hover:text-white hover:bg-white/5 transition-all"
          >
            <LogOut className="w-5 h-5 text-white/40" />
            <span className="font-medium">Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        <header className="h-16 bg-white border-b border-black/5 flex items-center justify-between px-8 sticky top-0 z-10">
          <h1 className="text-lg font-semibold text-black">
            {menuItems.find(item => item.path === location.pathname)?.label || 'Admin'}
          </h1>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm font-medium text-black">{user.full_name || user.email}</p>
              <p className="text-[10px] text-black/40 uppercase tracking-wider font-bold">Super Admin</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-black/5 border border-black/10 flex items-center justify-center font-bold text-black">
              {user.email?.[0].toUpperCase()}
            </div>
          </div>
        </header>

        <div className="p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;
