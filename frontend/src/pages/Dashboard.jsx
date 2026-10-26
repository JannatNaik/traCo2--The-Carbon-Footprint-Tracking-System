import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { getDashboard } from '../api/dashboard';
import LoadingSpinner from '../components/LoadingSpinner';
import { Zap, Car, UtensilsCrossed, Trash2, Droplets, Activity } from 'lucide-react';

const PERIODS = ['today', 'week', 'month', 'year'];
const CATEGORY_COLORS = { electricity: '#f59e0b', transport: '#3b82f6', food: '#22c55e', waste: '#8b5cf6', water: '#06b6d4' };
const CATEGORY_ICONS = { electricity: Zap, transport: Car, food: UtensilsCrossed, waste: Trash2, water: Droplets };

function SustainabilityGauge({ score }) {
  const color = score >= 70 ? '#22c55e' : score >= 40 ? '#f59e0b' : '#ef4444';
  const circumference = 2 * Math.PI * 45;
  const strokeDashoffset = circumference - (score / 100) * circumference;
  return (
    <div className="flex flex-col items-center">
      <svg width="120" height="120" viewBox="0 0 120 120">
        <circle cx="60" cy="60" r="45" fill="none" stroke="#e5e7eb" strokeWidth="10" />
        <circle cx="60" cy="60" r="45" fill="none" stroke={color} strokeWidth="10"
          strokeDasharray={circumference} strokeDashoffset={strokeDashoffset}
          strokeLinecap="round" transform="rotate(-90 60 60)" style={{ transition: 'stroke-dashoffset 0.5s' }}
        />
        <text x="60" y="65" textAnchor="middle" fontSize="22" fontWeight="bold" fill="#111827">{score}</text>
      </svg>
      <p className="text-sm font-medium text-gray-600 mt-1">Sustainability Score</p>
    </div>
  );
}

export default function Dashboard() {
  const [period, setPeriod] = useState('month');
  const { data, isLoading, error } = useQuery({
    queryKey: ['dashboard', period],
    queryFn: () => getDashboard(period).then(r => r.data)
  });

  if (isLoading) return <LoadingSpinner />;
  if (error) return <div className="text-red-500 p-4">Failed to load dashboard. Make sure the backend is running.</div>;

  const pieData = Object.entries(data.by_category)
    .filter(([, v]) => v > 0)
    .map(([name, value]) => ({ name, value }));

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-500 text-sm mt-1">Your carbon footprint overview</p>
        </div>
        <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
          {PERIODS.map(p => (
            <button key={p} onClick={() => setPeriod(p)}
              className={`px-4 py-1.5 rounded-md text-sm font-medium capitalize transition-colors ${
                period === p ? 'bg-white shadow text-primary-700' : 'text-gray-600 hover:text-gray-900'
              }`}>{p}</button>
          ))}
        </div>
      </div>

      {/* Top stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <p className="text-sm text-gray-500 mb-1">Total CO₂e</p>
          <p className="text-4xl font-bold text-gray-900">{data.total_co2e}<span className="text-lg font-normal text-gray-500 ml-1">kg</span></p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-6 flex items-center justify-center">
          <SustainabilityGauge score={data.sustainability_score} />
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <p className="text-sm text-gray-500 mb-3">Badges Earned</p>
          <div className="flex flex-wrap gap-2">
            {data.badges.length === 0 ? <p className="text-gray-400 text-sm">No badges yet — keep tracking!</p> :
              data.badges.map(b => (
                <span key={b.id} title={b.name} className="text-2xl cursor-help" >{b.icon}</span>
              ))}
          </div>
        </div>
      </div>

      {/* Category breakdown */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
        {Object.entries(data.by_category).map(([cat, val]) => {
          const Icon = CATEGORY_ICONS[cat];
          return (
            <div key={cat} className="bg-white rounded-xl border border-gray-200 p-4">
              <div className="flex items-center gap-2 mb-2">
                <div className="p-1.5 rounded-lg" style={{ backgroundColor: CATEGORY_COLORS[cat] + '20' }}>
                  <Icon size={14} style={{ color: CATEGORY_COLORS[cat] }} />
                </div>
                <p className="text-xs font-medium text-gray-500 capitalize">{cat}</p>
              </div>
              <p className="text-xl font-bold text-gray-900">{val}<span className="text-xs font-normal text-gray-400 ml-1">kg</span></p>
            </div>
          );
        })}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-sm font-semibold text-gray-700 mb-4">CO₂e Trend</h3>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={data.trend}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="date" tick={{ fontSize: 11 }} tickFormatter={d => d.slice(5)} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip formatter={(v) => [`${v} kg CO₂e`, 'Emissions']} />
              <Line type="monotone" dataKey="co2e" stroke="#22c55e" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-sm font-semibold text-gray-700 mb-4">By Category</h3>
          {pieData.length === 0 ? (
            <div className="flex items-center justify-center h-40 text-gray-400 text-sm">No data yet</div>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={3} dataKey="value">
                  {pieData.map((entry) => <Cell key={entry.name} fill={CATEGORY_COLORS[entry.name]} />)}
                </Pie>
                <Tooltip formatter={(v) => `${v} kg`} />
                <Legend formatter={v => <span className="capitalize text-xs">{v}</span>} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Recent activity */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2"><Activity size={16} /> Recent Activity</h3>
        {data.recent_activity.length === 0 ? (
          <p className="text-gray-400 text-sm py-4 text-center">No activity yet. Start by logging an emission!</p>
        ) : (
          <div className="divide-y divide-gray-100">
            {data.recent_activity.map(r => {
              const Icon = CATEGORY_ICONS[r.category];
              return (
                <div key={r.id} className="flex items-center gap-4 py-3">
                  <div className="p-2 rounded-lg" style={{ backgroundColor: CATEGORY_COLORS[r.category] + '20' }}>
                    <Icon size={14} style={{ color: CATEGORY_COLORS[r.category] }} />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-800 capitalize">{r.category}</p>
                    <p className="text-xs text-gray-400">{new Date(r.recorded_at).toLocaleDateString()}</p>
                  </div>
                  <p className="text-sm font-semibold text-gray-700">{r.co2e_kg} kg CO₂e</p>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
