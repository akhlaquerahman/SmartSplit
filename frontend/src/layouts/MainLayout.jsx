import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import useAuthStore from '../store/useAuthStore';
import Footer from '../components/Footer';
import { 
  LayoutDashboard, 
  Users, 
  LogOut, 
  Menu,
  X,
  ChevronsLeft,
  ChevronsRight,
  PieChart,
  User as UserIcon,
  Moon,
  Sun,
  Shield
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../utils/cn';

const MainLayout = ({ children }) => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'light');

  useEffect(() => {
    const appliedTheme = localStorage.getItem('theme') || theme;
    setTheme(appliedTheme);
    document.documentElement.classList.toggle('dark', appliedTheme === 'dark');
    document.body.classList.toggle('dark', appliedTheme === 'dark');
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
    document.body.classList.toggle('dark', theme === 'dark');
  }, [theme]);

  const handleToggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
    localStorage.setItem('theme', nextTheme);
    document.documentElement.classList.toggle('dark', nextTheme === 'dark');
    document.body.classList.toggle('dark', nextTheme === 'dark');
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const sidebarWidth = collapsed ? 'md:w-20 w-64' : 'md:w-64 w-64';

  const menuItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Groups', path: '/groups', icon: Users },
    { name: 'Friends', path: '/friends', icon: UserIcon },
    { name: 'Reports', path: '/reports', icon: PieChart },
    { name: 'Profile', path: '/profile', icon: UserIcon },
    ...(user?.role === 'admin' ? [{ name: 'Admin Panel', path: '/admin/dashboard', icon: Shield }] : []),
  ];

  return (
    <div className={cn(
      'min-h-screen flex flex-col transition-colors duration-500',
      theme === 'dark' ? 'bg-slate-950 text-slate-200' : 'bg-slate-50 text-slate-900'
    )}>
      <div className="flex flex-1 overflow-hidden">
        <aside className={cn(
          "fixed inset-y-0 left-0 z-40 flex min-h-screen flex-col justify-between border-r bg-white text-slate-900 dark:bg-slate-950 dark:text-slate-100 dark:border-slate-800 transition-all duration-300 shadow-xl md:static md:translate-x-0 md:shadow-none",
          sidebarWidth,
          mobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        )}>
          <div>
            <div className="p-6 flex items-center justify-between">
              {!collapsed && <span className="text-xl font-bold text-primary-600 dark:text-white">SmartSplit</span>}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCollapsed(!collapsed)}
                  className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded hidden md:inline-flex"
                >
                  {collapsed ? <ChevronsRight size={20} /> : <ChevronsLeft size={20} />}
                </button>
                <button
                  onClick={() => setMobileOpen(false)}
                  className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded inline-flex md:hidden"
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            <nav className="flex-1 px-4 py-4 space-y-2">
              {menuItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={cn(
                    "group flex items-center gap-3 p-4 rounded-2xl transition-all duration-300 relative",
                    location.pathname === item.path 
                      ? "bg-primary-600 text-white shadow-lg shadow-primary-500/30 font-bold" 
                      : "text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-slate-100"
                  )}
                >
                  <item.icon size={22} className={cn(
                    "transition-transform duration-300",
                    location.pathname === item.path ? "scale-110" : "group-hover:scale-110"
                  )} />
                  {!collapsed && <span className="tracking-wide">{item.name}</span>}
                  {location.pathname === item.path && !collapsed && (
                    <motion.div 
                      layoutId="sidebar-active-indicator"
                      className="absolute right-2 w-1.5 h-1.5 bg-white rounded-full"
                    />
                  )}
                </Link>
              ))}
            </nav>
          </div>
        </aside>

        <div className="flex-1 flex flex-col min-h-0 overflow-hidden md:ml-0">
          <div className="sticky top-0 z-30 flex items-center justify-between p-4 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-4">
              <button onClick={() => setMobileOpen(true)} className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 md:hidden">
                <Menu size={20} />
              </button>
              <span className="text-lg font-bold bg-gradient-to-r from-primary-600 to-indigo-600 bg-clip-text text-transparent md:hidden">SmartSplit</span>
              <div className="hidden md:block">
                 <h2 className="text-sm font-bold text-slate-500 uppercase tracking-wider">{location.pathname.split('/')[1] || 'Dashboard'}</h2>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <button
                onClick={handleToggleTheme}
                className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
              >
                {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
              </button>

              <div className="w-px h-6 bg-slate-200 dark:bg-slate-800 mx-1" />

              <Link to="/profile" className="flex items-center gap-2 hover:bg-slate-100 dark:hover:bg-slate-800 p-1.5 rounded-xl transition-all">
                <img src={user?.avatar} alt={user?.name} className="w-8 h-8 rounded-full border border-slate-200 dark:border-slate-700 shadow-sm" />
                <div className="hidden sm:block text-left">
                  <p className="text-xs font-bold leading-tight">{user?.name?.split(' ')[0]}</p>
                  <p className="text-[10px] text-slate-500 leading-tight italic">Profile</p>
                </div>
              </Link>

              <button 
                onClick={handleLogout} 
                className="flex items-center gap-2 p-2 px-3 rounded-xl bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400 text-sm font-bold hover:bg-red-100 dark:hover:bg-red-500/20 transition-all active:scale-95"
              >
                <LogOut size={18} />
                <span className="hidden lg:inline">Logout</span>
              </button>
            </div>
          </div>

          <main className="flex-1 overflow-y-auto p-4 md:p-8 pb-32 md:pb-8">
            <div className="max-w-6xl mx-auto">
              {children}
            </div>
          </main>

          {/* Mobile Bottom Navigation - Native App feel */}
          <nav className="md:hidden fixed bottom-6 left-4 right-4 z-40 bg-white/80 dark:bg-slate-900/80 backdrop-blur-lg border border-slate-200/50 dark:border-slate-800/50 rounded-3xl flex items-center justify-around p-3 shadow-2xl shadow-black/10">
            {menuItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "flex flex-col items-center gap-1 p-1.5 xs:p-2 xs:px-4 rounded-2xl transition-all duration-300 relative",
                  location.pathname === item.path 
                    ? "text-primary-600 font-bold" 
                    : "text-slate-500 dark:text-slate-400"
                )}
              >
                {location.pathname === item.path && (
                  <motion.div 
                    layoutId="mobile-nav-active"
                    className="absolute inset-0 bg-primary-50 dark:bg-primary-500/10 rounded-2xl -z-10"
                  />
                )}
                <item.icon size={18} className={cn(
                  "xs:size-[22px] transition-transform duration-300",
                  location.pathname === item.path && "scale-110 -translate-y-0.5"
                )} />
                <span className="text-[9px] xs:text-[10px] font-black uppercase tracking-tighter xs:tracking-widest">{item.name}</span>
              </Link>
            ))}
          </nav>
        </div>

        {mobileOpen && <div className="fixed inset-0 z-30 bg-black/40 md:hidden" onClick={() => setMobileOpen(false)} />}
      </div>

      <Footer />
    </div>
  );
};

export default MainLayout;
