import { Link, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Users, Cpu, Activity, Sliders, Award, LogOut, ShieldCheck } from 'lucide-react';

const navItems = [
  { to: '/admin/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/admin/users', icon: Users, label: 'Users' },
  { to: '/admin/devices', icon: Cpu, label: 'Devices' },
  { to: '/admin/sensor-data', icon: Activity, label: 'Sensor Data' },
  { to: '/admin/carbon-factors', icon: Sliders, label: 'Carbon Factors' },
  { to: '/admin/rewards', icon: Award, label: 'Rewards' },
];

export default function AdminLayout({ children }) {
  const location = useLocation();
  const navigate = useNavigate();
  const admin = JSON.parse(localStorage.getItem('adminUser') || '{}');

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUser');
    navigate('/admin/login');
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <aside className="w-60 bg-gray-900 text-white flex flex-col">
        <div className="flex items-center gap-2 px-5 py-5 border-b border-gray-700">
          <ShieldCheck size={20} className="text-primary-400" />
          <span className="font-bold text-sm">traCO2 Admin</span>
        </div>
        <nav className="flex-1 px-3 py-4 space-y-1">
          {navItems.map(({ to, icon: Icon, label }) => {
            const active = location.pathname.startsWith(to);
            return (
              <Link key={to} to={to}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  active ? 'bg-primary-600 text-white' : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                }`}>
                <Icon size={16} />{label}
              </Link>
            );
          })}
        </nav>
        <div className="px-4 py-4 border-t border-gray-700">
          <p className="text-xs text-gray-400 mb-2">{admin.name}</p>
          <button onClick={handleLogout} className="flex items-center gap-2 text-gray-400 hover:text-red-400 text-sm">
            <LogOut size={14} /> Logout
          </button>
        </div>
      </aside>
      <main className="flex-1 overflow-y-auto p-8">{children}</main>
    </div>
  );
}
