import { useQuery } from '@tanstack/react-query';
import { getAdminDevices } from '../../api/admin';
import AdminLayout from './AdminLayout';
import AdminRoute from '../../components/AdminRoute';
import LoadingSpinner from '../../components/LoadingSpinner';

export default function Devices() {
  const { data: devices = [], isLoading } = useQuery({ queryKey: ['admin-devices'], queryFn: () => getAdminDevices().then(r => r.data) });
  return (
    <AdminRoute><AdminLayout>
      <h1 className="text-2xl font-bold text-gray-900 mb-8">Device Management</h1>
      {isLoading ? <LoadingSpinner /> : (
        <div className="bg-white rounded-xl border overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>{['Code','Type','Status','User','Last Seen'].map(h => <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">{h}</th>)}</tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {devices.map(d => (
                <tr key={d.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-mono text-sm">{d.device_code}</td>
                  <td className="px-4 py-3 capitalize">{d.type}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                      d.status === 'active' ? 'bg-green-100 text-green-700' :
                      d.status === 'inactive' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'
                    }`}>{d.status}</span>
                  </td>
                  <td className="px-4 py-3 text-gray-500">{d.user_name || '—'}</td>
                  <td className="px-4 py-3 text-gray-400 text-xs">{d.last_seen_at ? new Date(d.last_seen_at).toLocaleString() : 'Never'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </AdminLayout></AdminRoute>
  );
}
