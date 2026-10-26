import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getSensorData } from '../../api/admin';
import AdminLayout from './AdminLayout';
import AdminRoute from '../../components/AdminRoute';
import LoadingSpinner from '../../components/LoadingSpinner';

export default function SensorData() {
  const [page, setPage] = useState(1);
  const { data, isLoading } = useQuery({ queryKey: ['sensor-data', page], queryFn: () => getSensorData(page).then(r => r.data) });
  return (
    <AdminRoute><AdminLayout>
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Sensor Data Monitor</h1>
      <p className="text-gray-500 text-sm mb-8">Raw hardware-sourced emission records (will be empty until ESP32 v2 ships)</p>
      {isLoading ? <LoadingSpinner /> : (
        <>
          <div className="bg-white rounded-xl border overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b">
                <tr>{['Date','User','Category','Value','Unit','CO₂e'].map(h => <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">{h}</th>)}</tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {data?.records?.length === 0 ? (
                  <tr><td colSpan={6} className="px-4 py-8 text-center text-gray-400">No hardware data yet — waiting for ESP32 v2</td></tr>
                ) : data?.records?.map(r => (
                  <tr key={r.id}>
                    <td className="px-4 py-3 text-xs text-gray-500">{new Date(r.recorded_at).toLocaleString()}</td>
                    <td className="px-4 py-3">{r.user_name}</td>
                    <td className="px-4 py-3 capitalize">{r.category}</td>
                    <td className="px-4 py-3">{r.value}</td>
                    <td className="px-4 py-3">{r.unit}</td>
                    <td className="px-4 py-3 font-medium">{r.co2e_kg} kg</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {data?.total > data?.limit && (
            <div className="flex gap-2 mt-4">
              <button onClick={() => setPage(p => Math.max(1, p-1))} disabled={page === 1} className="px-3 py-1 bg-white border rounded text-sm disabled:opacity-40">Prev</button>
              <span className="px-3 py-1 text-sm text-gray-500">Page {page}</span>
              <button onClick={() => setPage(p => p+1)} disabled={data.records?.length < data.limit} className="px-3 py-1 bg-white border rounded text-sm disabled:opacity-40">Next</button>
            </div>
          )}
        </>
      )}
    </AdminLayout></AdminRoute>
  );
}
