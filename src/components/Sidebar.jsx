import { NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Pill, ScanLine, Bell, LogOut, HeartPulse } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import toast from 'react-hot-toast';

const navItems = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/medicines', label: 'Medications', icon: Pill },
  { to: '/prescriptions', label: 'Scan Rx', icon: ScanLine },
  { to: '/notifications', label: 'Notifications', icon: Bell },
];

export default function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    toast.success('Signed out successfully');
    navigate('/login');
  };

  return (
    <aside className="hidden lg:flex flex-col w-64 bg-white border-r border-slate-200 h-screen sticky top-0">
      {/* Logo */}
      <div className="flex items-center gap-3 px-6 h-16 border-b border-slate-100">
        <div className="w-10 h-10 rounded-xl bg-brand-600 flex items-center justify-center shadow-sm">
          <HeartPulse className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="text-lg font-bold text-slate-900 leading-none">Medora</h1>
          <p className="text-[11px] text-slate-400 mt-0.5">Health Companion</p>
        </div>
      </div>

      {/* Nav links */}
      <nav className="flex-1 px-3 py-6 space-y-1">
        {navItems.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-base ${
                isActive
                  ? 'bg-brand-50 text-brand-700'
                  : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <Icon className={`w-5 h-5 ${isActive ? 'text-brand-600' : 'text-slate-400'}`} />
                {label}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* User card */}
      <div className="p-4 border-t border-slate-100">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-9 h-9 rounded-full bg-brand-100 text-brand-700 flex items-center justify-center text-sm font-semibold">
            {user?.name?.charAt(0)?.toUpperCase() || 'U'}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium text-slate-800 truncate">{user?.name || 'User'}</p>
            <p className="text-xs text-slate-400 truncate">{user?.email}</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-slate-500 hover:bg-red-50 hover:text-red-600 transition-base"
        >
          <LogOut className="w-4 h-4" />
          Sign out
        </button>
      </div>
    </aside>
  );
}
