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
    { name: 'Reports', path: '/reports', icon: PieChart },
    { name: 'Profile', path: '/profile', icon: UserIcon },
    ...(user?.role === 'admin' ? [{ name: 'Admin Panel', path: '/admin/dashboard', icon: Shield }] : []),
  ];

  return (
    <div className={cn(
      'min-h-screen flex flex-col transition-colors duration-300',
      theme === 'dark' ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'
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
                  onClick={handleToggleTheme}
                  className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
                >
                  {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
                </button>
                <button
                  onClick={() => setCollapsed(!collapsed)}
                  className="p-1 hover:bg-slate-100 rounded hidden md:inline-flex"
                >
                  {collapsed ? <ChevronsRight size={20} /> : <ChevronsLeft size={20} />}
                </button>
                <button
                  onClick={() => setMobileOpen(false)}
                  className="p-1 hover:bg-slate-100 rounded inline-flex md:hidden"
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
                    "sidebar-item flex items-center gap-3 p-3 rounded-lg transition-colors",
                    location.pathname === item.path 
                      ? "sidebar-active bg-slate-100 text-slate-900 dark:bg-slate-800 dark:text-slate-100" 
                      : "text-slate-900 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800"
                  )}
                >
                  <item.icon size={22} />
                  {!collapsed && <span>{item.name}</span>}
                </Link>
              ))}
            </nav>
          </div>

          <div className="p-4 border-t">
            <Link to="/profile" className="sidebar-item flex items-center gap-3 mb-4 group cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800 p-2 rounded-xl transition-all">
              <img src={user?.avatar} alt={user?.name} className="w-10 h-10 rounded-full border shadow-sm group-hover:border-primary-500" />
              {!collapsed && (
                <div className="overflow-hidden">
                  <p className="font-semibold text-sm truncate group-hover:text-primary-600 dark:group-hover:text-primary-300 dark:text-slate-100">{user?.name}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 truncate">Settings</p>
                </div>
              )}
            </Link>
            <button 
              onClick={handleLogout}
              className="w-full flex items-center gap-3 p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
            >
              <LogOut size={20} />
              {!collapsed && <span>Logout</span>}
            </button>
          </div>
        </aside>

        <div className="flex-1 flex flex-col min-h-0 overflow-hidden md:ml-0">
          <div className="md:hidden sticky top-0 z-30 flex items-center justify-between p-4 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800">
            <button onClick={() => setMobileOpen(true)} className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800">
              <Menu size={20} />
            </button>
            <span className="text-lg font-bold bg-gradient-to-r from-primary-600 to-indigo-600 bg-clip-text text-transparent">SmartSplit</span>
            <div className="flex items-center gap-2">
              <button
                onClick={handleToggleTheme}
                className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
              >
                {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
              </button>
              <button onClick={handleLogout} className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 text-sm font-semibold">
                Logout
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
                  "flex flex-col items-center gap-1.5 p-2 px-6 rounded-2xl transition-all active:scale-90",
                  location.pathname === item.path 
                    ? "text-primary-600 bg-primary-50 dark:bg-primary-500/10" 
                    : "text-slate-400"
                )}
              >
                <item.icon size={22} className={cn(location.pathname === item.path && "scale-110")} />
                <span className="text-[10px] font-bold uppercase tracking-wider">{item.name}</span>
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
