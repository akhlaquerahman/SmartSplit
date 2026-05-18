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
  Shield,
  Settings
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

  const sidebarWidth = collapsed ? 'md:w-16 w-56' : 'md:w-56 w-56';

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
          <div className="flex flex-col h-full justify-between py-6">
            <div>
              <div className="px-5 flex items-center justify-between mb-6">
                {!collapsed && (
                  <div className="flex items-center gap-2">
                    <div className="bg-primary-600 text-white p-1.5 rounded-xl shadow-md shadow-primary-500/10 flex items-center justify-center">
                      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                      </svg>
                    </div>
                    <span className="text-base font-black bg-gradient-to-r from-primary-600 to-indigo-600 bg-clip-text text-transparent tracking-tight">SmartSplit</span>
                  </div>
                )}
                <div className="flex items-center gap-1.5 ml-auto">
                  <button
                    onClick={() => setCollapsed(!collapsed)}
                    className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg hidden md:inline-flex text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    {collapsed ? <ChevronsRight size={16} /> : <ChevronsLeft size={16} />}
                  </button>
                  <button
                    onClick={() => setMobileOpen(false)}
                    className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg inline-flex md:hidden text-slate-400 hover:text-slate-650"
                  >
                    <X size={16} />
                  </button>
                </div>
              </div>

              <nav className="px-2.5 space-y-1">
                {menuItems.map((item) => (
                  <Link
                    key={item.path + item.name}
                    to={item.path}
                    className={cn(
                      "group flex items-center gap-2.5 p-2.5 rounded-xl transition-all duration-200 relative font-bold text-xs",
                      location.pathname === item.path 
                        ? "bg-blue-50 dark:bg-blue-900/10 text-primary-600 dark:text-blue-400 font-extrabold" 
                        : "text-slate-500 hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-slate-800/40 hover:text-slate-900 dark:hover:text-slate-100"
                    )}
                  >
                    <item.icon size={16} className={cn(
                      "transition-transform duration-200 shrink-0",
                      location.pathname === item.path ? "scale-105 text-primary-600 dark:text-blue-400" : "text-slate-400 group-hover:scale-105"
                    )} />
                    {!collapsed && <span className="tracking-wide text-xs">{item.name}</span>}
                    {location.pathname === item.path && !collapsed && (
                      <motion.div 
                        layoutId="sidebar-active-indicator"
                        className="absolute right-2.5 w-1 h-1 bg-primary-600 dark:bg-blue-400 rounded-full"
                      />
                    )}
                  </Link>
                ))}
              </nav>
            </div>

            {/* Get the mobile app card - Compact Widget */}
            {!collapsed && (
              <div className="mx-3.5 p-3 rounded-2xl bg-slate-50 dark:bg-slate-900/40 border border-slate-100 dark:border-slate-800/70 flex items-center justify-between gap-2">
                <div className="min-w-0">
                  <p className="text-[10px] font-black text-slate-700 dark:text-slate-350 leading-tight">Get Mobile App</p>
                  <p className="text-[8px] text-slate-400 font-bold leading-tight mt-0.5">iOS & Android</p>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <button className="p-1.5 bg-white hover:bg-slate-50 dark:bg-slate-950 dark:hover:bg-slate-850 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-650 dark:text-slate-300 transition-colors" title="Google Play Store">
                    <svg className="w-3 h-3" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M5,3.5C5,3.22 5.18,3 5.5,3c0.16,0 .31,0.08 .41,0.22l11.02,11.02L13.11,18L5,3.5 M18.5,14.65l-2.4,-1.4L13.88,15.47l2.22,2.22L18.5,14.65z" />
                    </svg>
                  </button>
                  <button className="p-1.5 bg-white hover:bg-slate-50 dark:bg-slate-950 dark:hover:bg-slate-850 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-650 dark:text-slate-300 transition-colors" title="Apple App Store">
                    <svg className="w-3 h-3" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M18.71,19.5C17.88,20.74 17,21.95 15.66,22C14.32,22.05 13.89,21.24 12.37,21.24C10.84,21.24 10.37,21.97 9.1,22C7.79,22.05 6.8,20.68 5.96,19.47C4.25,17 2.94,12.45 4.7,9.39C5.57,7.87 7.13,6.91 8.82,6.88C10.1,6.85 11.32,7.75 12.11,7.75C12.89,7.75 14.37,6.68 15.92,6.84C16.57,6.87 18.39,7.1 19.56,8.82C19.47,8.88 17.39,10.1 17.41,12.63C17.44,15.65 20.06,16.66 20.1,16.67C20.08,16.74 19.67,18.11 18.71,19.5 M15.97,4.17C16.63,3.37 17.07,2.28 16.95,1C16,1.04 14.9,1.6 14.24,2.38C13.68,3.04 13.19,4.14 13.34,5.4C14.39,5.48 15.39,4.88 15.97,4.17Z" />
                    </svg>
                  </button>
                </div>
              </div>
            )}
          </div>
        </aside>

        <div className="flex-1 flex flex-col min-h-0 overflow-hidden md:ml-0">
          <div className="sticky top-0 z-30 flex items-center justify-between p-2.5 md:p-4 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-3">
              <button onClick={() => setMobileOpen(true)} className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 md:hidden">
                <Menu size={18} />
              </button>
              <span className="text-base font-extrabold bg-gradient-to-r from-primary-600 to-indigo-600 bg-clip-text text-transparent md:hidden tracking-tight">SmartSplit</span>
              <div className="hidden md:block">
                 <h2 className="text-sm font-bold text-slate-500 uppercase tracking-wider">{location.pathname.split('/')[1] || 'Dashboard'}</h2>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <button
                onClick={handleToggleTheme}
                className="p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
              >
                {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
              </button>

              <div className="w-px h-5 bg-slate-200 dark:bg-slate-800 mx-0.5" />

              <Link to="/profile" className="flex items-center gap-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 p-1 rounded-xl transition-all">
                <img src={user?.avatar} alt={user?.name} className="w-7 h-7 rounded-full border border-slate-200 dark:border-slate-700 shadow-sm" />
                <div className="hidden sm:block text-left">
                  <p className="text-xs font-bold leading-tight">{user?.name?.split(' ')[0]}</p>
                  <p className="text-[10px] text-slate-500 leading-tight italic">Profile</p>
                </div>
              </Link>

              <button 
                onClick={handleLogout} 
                className="hidden md:flex items-center gap-2 p-2 px-3 rounded-xl bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400 text-xs font-black uppercase tracking-wider hover:bg-red-100 dark:hover:bg-red-500/20 transition-all active:scale-95"
              >
                <LogOut size={14} />
                <span>Logout</span>
              </button>
            </div>
          </div>

          <main className="flex-1 overflow-y-auto p-4 md:p-8 pb-28 md:pb-8">
            <div className="max-w-6xl mx-auto flex flex-col min-h-full justify-between gap-8">
              <div className="flex-1">
                {children}
              </div>
              <Footer />
            </div>
          </main>

          {/* Mobile Bottom Navigation - Native App feel */}
          <nav className="md:hidden fixed bottom-4 left-4 right-4 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-lg border border-slate-200/40 dark:border-slate-800/40 rounded-2xl flex items-center justify-around p-2 shadow-lg shadow-black/5">
            {menuItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "flex flex-col items-center gap-0.5 p-1 rounded-xl transition-all duration-200 relative",
                  location.pathname === item.path 
                    ? "text-primary-600 dark:text-blue-400 font-extrabold" 
                    : "text-slate-500 dark:text-slate-400"
                )}
              >
                {location.pathname === item.path && (
                  <motion.div 
                    layoutId="mobile-nav-active"
                    className="absolute inset-0 bg-primary-50 dark:bg-primary-500/5 rounded-xl -z-10"
                  />
                )}
                <item.icon size={16} className={cn(
                  "transition-transform duration-200",
                  location.pathname === item.path && "scale-105"
                )} />
                <span className="text-[8px] font-black uppercase tracking-wider">{item.name}</span>
              </Link>
            ))}
          </nav>
        </div>

        {mobileOpen && <div className="fixed inset-0 z-30 bg-black/40 md:hidden" onClick={() => setMobileOpen(false)} />}
      </div>
    </div>
  );
};

export default MainLayout;
