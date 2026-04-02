import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Activity, BarChart3, Users, Calendar, LogOut, User } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Navigation() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    toast.success('Logged out');
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path ? 'bg-cyan-600 text-white' : 'text-slate-600 hover:bg-slate-100';

  const navItems = [
    { path: '/dashboard', label: 'Dashboard', icon: BarChart3, color: 'text-cyan-500' },
    { path: '/appointments', label: 'Appointments', icon: Calendar, color: 'text-purple-500' },
    { path: '/queue', label: 'Live Queue', icon: Users, color: 'text-amber-500' },
    { path: '/profile', label: 'Profile', icon: User, color: 'text-green-500' },
  ];

  return (
    <nav className="bg-white border-b border-slate-200 shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate('/dashboard')}>
            <div className="w-8 h-8 bg-cyan-500 rounded-lg flex items-center justify-center">
              <Activity size={18} className="text-white"/>
            </div>
            <div className="hidden sm:block">
              <span className="font-bold text-slate-800 text-lg">MediQueue</span>
              <span className="text-xs bg-cyan-100 text-cyan-700 px-2 py-0.5 rounded-full ml-2">Live</span>
            </div>
          </div>

          {/* Nav Links */}
          <div className="hidden md:flex items-center gap-1">
            {navItems.map(({ path, label, icon: Icon }) => (
              <button
                key={path}
                onClick={() => navigate(path)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${isActive(path)}`}
              >
                <Icon size={16}/>
                {label}
              </button>
            ))}
          </div>

          {/* User Menu */}
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 text-sm">
              <div className="w-8 h-8 bg-slate-200 rounded-full flex items-center justify-center">
                <span className="font-semibold text-slate-700">{user?.name?.[0]?.toUpperCase()}</span>
              </div>
              <div>
                <p className="font-semibold text-slate-800">{user?.name}</p>
                <p className="text-xs text-slate-500">{user?.role}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium bg-red-50 text-red-600 hover:bg-red-100 transition-colors"
            >
              <LogOut size={16}/>
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>

          {/* Mobile Menu Toggle */}
          <div className="md:hidden">
            <details className="dropdown">
              <summary className="btn btn-sm btn-ghost">☰</summary>
              <ul className="dropdown-content z-50 menu p-2 shadow bg-base-100 rounded-box w-52">
                {navItems.map(({ path, label, icon: Icon }) => (
                  <li key={path}>
                    <button type="button" onClick={() => navigate(path)} className={isActive(path)}>
                      <Icon size={16}/> {label}
                    </button>
                  </li>
                ))}
              </ul>
            </details>
          </div>
        </div>
      </div>
    </nav>
  );
}
