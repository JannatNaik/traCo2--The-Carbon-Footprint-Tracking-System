import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { getReport, exportCsv } from '../api/reports';
import LoadingSpinner from '../components/LoadingSpinner';
import { Download } from 'lucide-react';

const PERIODS = ['daily', 'weekly', 'monthly', 'yearly'];
const COLORS = ['#f59e0b', '#3b82f6', '#22c55e', '#8b5cf6', '#06b6d4'];

export default function Reports() {
  const [period, setPeriod] = useState('monthly');

  const { data, isLoading } = useQuery({
    queryKey: ['reports', period],
    queryFn: () => getReport({ period }).then(r => r.data)
  });

  const handleExport = async () => {
    try {
      const res = await exportCsv({ period });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const a = document.createElement('a');
      a.href = url;
      a.download = `traco2_report_${period}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (_) {}
  };

  const barData = data ? Object.entries(data.by_category).map(([name, value]) => ({ name, value })) : [];
  const sourceData = data ? Object.entries(data.by_source).filter(([,v]) => v > 0).map(([name, value]) => ({ name, value })) : [];

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Reports</h1>
          <p className="text-gray-500 text-sm mt-1">Detailed breakdown of your emissions</p>
        </div>
        <button onClick={handleExport} className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700">
          <Download size={16} /> Export CSV
        </button>
      </div>

      <div className="flex gap-1 bg-gray-100 rounded-lg p-1 mb-8 w-fit">
        {PERIODS.map(p => (
          <button key={p} onClick={() => setPeriod(p)}
            className={`px-4 py-1.5 rounded-md text-sm font-medium capitalize transition-colors ${
              period === p ? 'bg-white shadow text-primary-700' : 'text-gray-600'
            }`}>{p}</button>
        ))}
      </div>

      {isLoading ? <LoadingSpinner /> : data && (
        <>
          <div className="grid grid-cols-3 gap-6 mb-8">
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <p className="text-sm text-gray-500">Total CO₂e</p>
              <p className="text-3xl font-bold mt-1">{data.total_co2e} <span className="text-sm font-normal text-gray-400">kg</span></p>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <p className="text-sm text-gray-500">Period</p>
              <p className="text-sm font-mono mt-2 text-gray-700">{data.start} → {data.end}</p>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <p className="text-sm text-gray-500">Records</p>
              <p className="text-3xl font-bold mt-1">{data.records.length}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="text-sm font-semibold text-gray-700 mb-4">Category Breakdown</h3>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={barData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip formatter={(v) => [`${v} kg`, 'CO₂e']} />
                  <Bar dataKey="value" radius={[4,4,0,0]}>
                    {barData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="text-sm font-semibold text-gray-700 mb-4">Manual vs Hardware</h3>
              {sourceData.length === 0 ? (
                <div className="flex items-center justify-center h-40 text-gray-400 text-sm">No data yet</div>
              ) : (
                <ResponsiveContainer width="100%" height={220}>
                  <PieChart>
                    <Pie data={sourceData} cx="50%" cy="50%" outerRadius={80} dataKey="value" label={({name, value}) => `${name}: ${value}kg`}>
                      {sourceData.map((_, i) => <Cell key={i} fill={['#22c55e','#3b82f6'][i]} />)}
                    </Pie>
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
