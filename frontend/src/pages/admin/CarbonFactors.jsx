import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getCarbonFactors, updateCarbonFactor, createCarbonFactor, deleteCarbonFactor } from '../../api/admin';
import AdminLayout from './AdminLayout';
import AdminRoute from '../../components/AdminRoute';
import LoadingSpinner from '../../components/LoadingSpinner';
import { Plus, Trash2, Save } from 'lucide-react';

export default function CarbonFactors() {
  const qc = useQueryClient();
  const { data: factors = [], isLoading } = useQuery({ queryKey: ['carbon-factors-admin'], queryFn: () => getCarbonFactors().then(r => r.data) });
  const [editing, setEditing] = useState({});
  const [newRow, setNewRow] = useState({ category: '', fuel_or_source_type: '', factor_value: '', unit: '' });
  const [showNew, setShowNew] = useState(false);

  const updateMutation = useMutation({
    mutationFn: ({ id, factor_value, unit }) => updateCarbonFactor(id, { factor_value, unit }),
    onSuccess: () => { qc.invalidateQueries(['carbon-factors-admin']); setEditing({}); }
  });
  const deleteMutation = useMutation({
    mutationFn: (id) => deleteCarbonFactor(id),
    onSuccess: () => qc.invalidateQueries(['carbon-factors-admin'])
  });
  const createMutation = useMutation({
    mutationFn: () => createCarbonFactor({ ...newRow, factor_value: parseFloat(newRow.factor_value) }),
    onSuccess: () => { qc.invalidateQueries(['carbon-factors-admin']); setNewRow({ category: '', fuel_or_source_type: '', factor_value: '', unit: '' }); setShowNew(false); }
  });

  return (
    <AdminRoute><AdminLayout>
      <div className="flex items-center justify-between mb-8">
        <div><h1 className="text-2xl font-bold text-gray-900">Carbon Factors</h1><p className="text-gray-500 text-sm">Update emission factors — changes apply to all future calculations immediately</p></div>
        <button onClick={() => setShowNew(true)} className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700"><Plus size={16} /> Add Factor</button>
      </div>
      {isLoading ? <LoadingSpinner /> : (
        <div className="bg-white rounded-xl border overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>{['Category','Source/Fuel Type','Factor Value','Unit',''].map(h => <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">{h}</th>)}</tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {showNew && (
                <tr className="bg-primary-50">
                  <td className="px-4 py-2"><input value={newRow.category} onChange={e => setNewRow(p => ({...p, category: e.target.value}))} placeholder="electricity" className="border border-gray-300 rounded px-2 py-1 text-xs w-full" /></td>
                  <td className="px-4 py-2"><input value={newRow.fuel_or_source_type} onChange={e => setNewRow(p => ({...p, fuel_or_source_type: e.target.value}))} placeholder="coal" className="border border-gray-300 rounded px-2 py-1 text-xs w-full" /></td>
                  <td className="px-4 py-2"><input type="number" step="0.001" value={newRow.factor_value} onChange={e => setNewRow(p => ({...p, factor_value: e.target.value}))} placeholder="0.82" className="border border-gray-300 rounded px-2 py-1 text-xs w-24" /></td>
                  <td className="px-4 py-2"><input value={newRow.unit} onChange={e => setNewRow(p => ({...p, unit: e.target.value}))} placeholder="kg CO2e/kWh" className="border border-gray-300 rounded px-2 py-1 text-xs w-full" /></td>
                  <td className="px-4 py-2 flex gap-2">
                    <button onClick={() => createMutation.mutate()} className="px-2 py-1 bg-primary-600 text-white rounded text-xs">Save</button>
                    <button onClick={() => setShowNew(false)} className="px-2 py-1 bg-gray-100 rounded text-xs">Cancel</button>
                  </td>
                </tr>
              )}
              {factors.map(f => (
                <tr key={f.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 capitalize">{f.category}</td>
                  <td className="px-4 py-3">{f.fuel_or_source_type}</td>
                  <td className="px-4 py-3">
                    {editing[f.id] !== undefined ? (
                      <input type="number" step="0.001" value={editing[f.id]} onChange={e => setEditing(p => ({...p, [f.id]: e.target.value}))}
                        className="border border-primary-300 rounded px-2 py-1 text-xs w-24" />
                    ) : (
                      <span className="font-mono cursor-pointer hover:text-primary-600" onClick={() => setEditing(p => ({...p, [f.id]: f.factor_value}))}>{f.factor_value}</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-gray-500 text-xs">{f.unit}</td>
                  <td className="px-4 py-3 flex gap-2">
                    {editing[f.id] !== undefined && (
                      <button onClick={() => updateMutation.mutate({ id: f.id, factor_value: parseFloat(editing[f.id]), unit: f.unit })} className="p-1.5 bg-primary-50 text-primary-600 rounded hover:bg-primary-100"><Save size={12} /></button>
                    )}
                    <button onClick={() => deleteMutation.mutate(f.id)} className="p-1.5 bg-red-50 text-red-500 rounded hover:bg-red-100"><Trash2 size={12} /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </AdminLayout></AdminRoute>
  );
}
