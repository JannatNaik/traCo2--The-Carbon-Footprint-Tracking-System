import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getUsers, updateUserStatus } from '../../api/admin';
import AdminLayout from './AdminLayout';
import AdminRoute from '../../components/AdminRoute';
import LoadingSpinner from '../../components/LoadingSpinner';

export default function Users() {
  const qc = useQueryClient();
  const { data: users = [], isLoading } = useQuery({ queryKey: ['admin-users'], queryFn: () => getUsers().then(r => r.data) });
  const toggleMutation = useMutation({
    mutationFn: ({ id, is_active }) => updateUserStatus(id, is_active),
    onSuccess: () => qc.invalidateQueries(['admin-users'])
  });

  return (
    <AdminRoute>
      <AdminLayout>
        <h1 className="text-2xl font-bold text-gray-900 mb-8">User Management</h1>
        {isLoading ? <LoadingSpinner /> : (
          <div className="bg-white rounded-xl border overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b">
                <tr>{['Name','Email','Records','Total CO₂e','Status','Action'].map(h => <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">{h}</th>)}</tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {users.map(u => (
                  <tr key={u.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium">{u.name}</td>
                    <td className="px-4 py-3 text-gray-500">{u.email}</td>
                    <td className="px-4 py-3">{u.record_count}</td>
                    <td className="px-4 py-3">{parseFloat(u.total_co2e).toFixed(1)} kg</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${u.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {u.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => toggleMutation.mutate({ id: u.id, is_active: !u.is_active })}
                        className={`px-3 py-1 rounded text-xs font-medium ${u.is_active ? 'bg-red-50 text-red-600 hover:bg-red-100' : 'bg-green-50 text-green-600 hover:bg-green-100'}`}>
                        {u.is_active ? 'Deactivate' : 'Activate'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </AdminLayout>
    </AdminRoute>
  );
}
