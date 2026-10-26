import { useQuery } from '@tanstack/react-query';
import client from '../api/client';
import LoadingSpinner from '../components/LoadingSpinner';
import { TrendingUp, TrendingDown, Lightbulb, Leaf } from 'lucide-react';

const CATEGORY_COLORS = { electricity: '#f59e0b', transport: '#3b82f6', food: '#22c55e', waste: '#8b5cf6', water: '#06b6d4' };
const CATEGORY_EMOJIS = { electricity: '⚡', transport: '🚗', food: '🥗', waste: '🗑️', water: '💧' };

export default function Recommendations() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['recommendations'],
    queryFn: () => client.get('/api/recommendations').then(r => r.data)
  });

  if (isLoading) return <LoadingSpinner />;

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Insights & Recommendations</h1>
      <p className="text-gray-500 text-sm mb-8">Based on your last 30 days vs previous 30 days</p>

      {error || !data || data.current_co2e === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <Leaf className="mx-auto text-primary-400 mb-4" size={48} />
          <h3 className="text-lg font-semibold text-gray-700 mb-2">Not enough data yet</h3>
          <p className="text-gray-400 text-sm">Log at least a few weeks of emissions to get personalized recommendations.</p>
        </div>
      ) : (
        <div className="space-y-6 max-w-2xl">
          {/* Top recommendation card */}
          <div className="bg-white rounded-xl border-2 border-primary-200 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 rounded-xl" style={{ backgroundColor: CATEGORY_COLORS[data.category] + '20' }}>
                <span className="text-2xl">{CATEGORY_EMOJIS[data.category]}</span>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide">Highest Increase</p>
                <h3 className="text-lg font-bold text-gray-900 capitalize">{data.category}</h3>
              </div>
              {data.delta > 0 ? (
                <div className="ml-auto flex items-center gap-1 text-red-600 bg-red-50 rounded-full px-3 py-1">
                  <TrendingUp size={14} />
                  <span className="text-sm font-semibold">+{data.delta} kg</span>
                </div>
              ) : (
                <div className="ml-auto flex items-center gap-1 text-green-600 bg-green-50 rounded-full px-3 py-1">
                  <TrendingDown size={14} />
                  <span className="text-sm font-semibold">{data.delta} kg</span>
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-xs text-gray-500">Current period</p>
                <p className="text-xl font-bold text-gray-900">{data.current_co2e} <span className="text-xs font-normal">kg CO₂e</span></p>
              </div>
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-xs text-gray-500">Previous period</p>
                <p className="text-xl font-bold text-gray-900">{data.previous_co2e} <span className="text-xs font-normal">kg CO₂e</span></p>
              </div>
            </div>

            <div className="bg-primary-50 border border-primary-100 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <Lightbulb className="text-primary-600 mt-0.5" size={18} />
                <div>
                  <p className="text-sm font-semibold text-primary-800 mb-1">Recommendation</p>
                  <p className="text-sm text-primary-700">{data.suggestion}</p>
                  {data.estimated_saving_kg > 0 && (
                    <p className="text-xs text-primary-600 mt-2 font-medium">💚 Estimated saving: {data.estimated_saving_kg} kg CO₂e</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
