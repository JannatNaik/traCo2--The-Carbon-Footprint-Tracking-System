import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getAdminBadges, createBadge, deleteBadge, getAdminChallenges, createChallenge, deleteChallenge } from '../../api/admin';
import AdminLayout from './AdminLayout';
import AdminRoute from '../../components/AdminRoute';
import { Plus, Trash2 } from 'lucide-react';

export default function AdminRewards() {
  const qc = useQueryClient();
  const { data: badges = [] } = useQuery({ queryKey: ['admin-badges'], queryFn: () => getAdminBadges().then(r => r.data) });
  const { data: challenges = [] } = useQuery({ queryKey: ['admin-challenges'], queryFn: () => getAdminChallenges().then(r => r.data) });

  const [newBadge, setNewBadge] = useState({ name: '', description: '', icon: '', criteria_type: 'records_count', criteria_value: '' });
  const [newChallenge, setNewChallenge] = useState({ title: '', description: '', start_date: '', end_date: '', reward_credits: 50, target_co2e_kg: '' });

  const createBadgeMutation = useMutation({ mutationFn: () => createBadge({ ...newBadge, criteria_value: parseFloat(newBadge.criteria_value) }), onSuccess: () => { qc.invalidateQueries(['admin-badges']); setNewBadge({ name: '', description: '', icon: '', criteria_type: 'records_count', criteria_value: '' }); } });
  const deleteBadgeMutation = useMutation({ mutationFn: (id) => deleteBadge(id), onSuccess: () => qc.invalidateQueries(['admin-badges']) });
  const createChallengeMutation = useMutation({ mutationFn: () => createChallenge({ ...newChallenge, target_co2e_kg: parseFloat(newChallenge.target_co2e_kg) }), onSuccess: () => { qc.invalidateQueries(['admin-challenges']); setNewChallenge({ title: '', description: '', start_date: '', end_date: '', reward_credits: 50, target_co2e_kg: '' }); } });
  const deleteChallengeMutation = useMutation({ mutationFn: (id) => deleteChallenge(id), onSuccess: () => qc.invalidateQueries(['admin-challenges']) });

  const Input = ({ value, onChange, placeholder, type='text' }) => <input type={type} value={value} onChange={onChange} placeholder={placeholder} className="border border-gray-300 rounded-lg px-3 py-2 text-sm w-full" />;

  return (
    <AdminRoute><AdminLayout>
      <h1 className="text-2xl font-bold text-gray-900 mb-8">Rewards & Challenges</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Badges */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="font-semibold text-gray-800 mb-4">Badges</h2>
          <div className="space-y-3 mb-4">
            {badges.map(b => (
              <div key={b.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <span className="text-2xl">{b.icon || '🏅'}</span>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm">{b.name}</p>
                  <p className="text-xs text-gray-400">{b.criteria_type}: {b.criteria_value}</p>
                </div>
                <button onClick={() => deleteBadgeMutation.mutate(b.id)} className="p-1.5 text-red-400 hover:bg-red-50 rounded"><Trash2 size={12} /></button>
              </div>
            ))}
          </div>
          <div className="border-t pt-4 space-y-2">
            <p className="text-xs font-semibold text-gray-500 mb-2">New Badge</p>
            <Input value={newBadge.name} onChange={e => setNewBadge(p => ({...p, name: e.target.value}))} placeholder="Badge name" />
            <Input value={newBadge.icon} onChange={e => setNewBadge(p => ({...p, icon: e.target.value}))} placeholder="Emoji (🏆)" />
            <Input value={newBadge.description} onChange={e => setNewBadge(p => ({...p, description: e.target.value}))} placeholder="Description" />
            <select value={newBadge.criteria_type} onChange={e => setNewBadge(p => ({...p, criteria_type: e.target.value}))} className="border border-gray-300 rounded-lg px-3 py-2 text-sm w-full">
              <option value="records_count">Records Count</option>
              <option value="total_monthly_max">Total Monthly Max (kg)</option>
              <option value="transport_monthly_max">Transport Monthly Max</option>
              <option value="electricity_monthly_max">Electricity Monthly Max</option>
              <option value="waste_monthly_max">Waste Monthly Max</option>
            </select>
            <Input value={newBadge.criteria_value} onChange={e => setNewBadge(p => ({...p, criteria_value: e.target.value}))} placeholder="Criteria value" type="number" />
            <button onClick={() => createBadgeMutation.mutate()} className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700"><Plus size={14} /> Add Badge</button>
          </div>
        </div>

        {/* Challenges */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="font-semibold text-gray-800 mb-4">Challenges</h2>
          <div className="space-y-3 mb-4">
            {challenges.map(c => (
              <div key={c.id} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm">{c.title}</p>
                  <p className="text-xs text-gray-400">Target: {c.target_co2e_kg} kg | {c.reward_credits} credits</p>
                  <p className="text-xs text-gray-400">{c.start_date} → {c.end_date}</p>
                </div>
                <button onClick={() => deleteChallengeMutation.mutate(c.id)} className="p-1.5 text-red-400 hover:bg-red-50 rounded"><Trash2 size={12} /></button>
              </div>
            ))}
          </div>
          <div className="border-t pt-4 space-y-2">
            <p className="text-xs font-semibold text-gray-500 mb-2">New Challenge</p>
            <Input value={newChallenge.title} onChange={e => setNewChallenge(p => ({...p, title: e.target.value}))} placeholder="Challenge title" />
            <Input value={newChallenge.description} onChange={e => setNewChallenge(p => ({...p, description: e.target.value}))} placeholder="Description" />
            <div className="grid grid-cols-2 gap-2">
              <Input value={newChallenge.start_date} onChange={e => setNewChallenge(p => ({...p, start_date: e.target.value}))} placeholder="Start date" type="date" />
              <Input value={newChallenge.end_date} onChange={e => setNewChallenge(p => ({...p, end_date: e.target.value}))} placeholder="End date" type="date" />
            </div>
            <Input value={newChallenge.target_co2e_kg} onChange={e => setNewChallenge(p => ({...p, target_co2e_kg: e.target.value}))} placeholder="Target CO₂e (kg)" type="number" />
            <Input value={newChallenge.reward_credits} onChange={e => setNewChallenge(p => ({...p, reward_credits: parseInt(e.target.value)}))} placeholder="Reward credits" type="number" />
            <button onClick={() => createChallengeMutation.mutate()} className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700"><Plus size={14} /> Add Challenge</button>
          </div>
        </div>
      </div>
    </AdminLayout></AdminRoute>
  );
}
