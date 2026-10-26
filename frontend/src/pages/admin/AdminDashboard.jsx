import { useQuery } from '@tanstack/react-query';
import { getAdminDashboard } from '../../api/admin';
import AdminLayout from './AdminLayout';
import AdminRoute from '../../components/AdminRoute';
import LoadingSpinner from '../../components/LoadingSpinner';
import { Users, Cpu, BarChart2, Zap } from 'lucide-react';

export default function AdminDashboard() {
  const { data, isLoading } = useQuery({ queryKey: ['admin-dashboard'], queryFn: () => getAdminDashboard().then(r => r.data) });

  return (
    <AdminRoute>
      <AdminLayout>
        <h1 className="text-2xl font-bold text-gray-900 mb-8">Admin Dashboard</h1>
        {isLoading ? <LoadingSpinner /> : data && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="bg-white rounded-xl border p-6"><p className="text-sm text-gray-500">Total Users</p><p className="text-3xl font-bold mt-1">{data.users.total}</p><p className="text-xs text-gray-400">{data.users.active} active</p></div>
            <div className="bg-white rounded-xl border p-6"><p className="text-sm text-gray-500">Devices</p><p className="text-3xl font-bold mt-1">{data.devices.total}</p><p className="text-xs text-gray-400">{data.devices.active} active</p></div>
            <div className="bg-white rounded-xl border p-6"><p className="text-sm text-gray-500">Total CO₂e Tracked</p><p className="text-3xl font-bold mt-1">{data.emissions.total_co2e}<span className="text-sm font-normal text-gray-400 ml-1">kg</span></p></div>
            <div className="bg-white rounded-xl border p-6"><p className="text-sm text-gray-500">Manual / Hardware</p><p className="text-lg font-bold mt-1">{data.emissions.manual_co2e} / {data.emissions.hardware_co2e}<span className="text-xs font-normal text-gray-400 ml-1">kg</span></p></div>
          </div>
        )}
      </AdminLayout>
    </AdminRoute>
  );
}
