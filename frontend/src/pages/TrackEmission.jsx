import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Zap, Car, UtensilsCrossed, Trash2, Droplets, Upload, CheckCircle } from 'lucide-react';
import { logElectricity, uploadBill, logTransport, logFood, logWaste, logWater } from '../api/emissions';
import { getProfile } from '../api/user';
import { useToast, ToastContainer } from '../components/Toast';

const TABS = [
  { key: 'electricity', label: 'Electricity', icon: Zap },
  { key: 'transport', label: 'Transport', icon: Car },
  { key: 'food', label: 'Food', icon: UtensilsCrossed },
  { key: 'waste', label: 'Waste', icon: Trash2 },
  { key: 'water', label: 'Water', icon: Droplets },
];

function SubmitButton({ loading }) {
  return (
    <button type="submit" disabled={loading}
      className="w-full bg-primary-600 text-white rounded-lg py-2.5 font-medium hover:bg-primary-700 disabled:opacity-60 transition-colors">
      {loading ? 'Calculating & saving...' : 'Log Emission'}
    </button>
  );
}

function ResultBanner({ result }) {
  if (!result) return null;
  return (
    <div className="flex items-center gap-3 bg-green-50 border border-green-200 rounded-lg px-4 py-3 mb-4">
      <CheckCircle className="text-green-600" size={20} />
      <div>
        <p className="font-semibold text-green-800">Logged successfully!</p>
        <p className="text-sm text-green-700">CO₂e: <strong>{result.co2e_kg} kg</strong></p>
      </div>
    </div>
  );
}

function ElectricityForm({ profile, toast }) {
  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    defaultValues: { energy_source: 'grid', period_days: 30 }
  });
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [pdfFile, setPdfFile] = useState(null);
  const [usePdf, setUsePdf] = useState(false);

  const onSubmit = async (data) => {
    if (usePdf && !pdfFile) {
      toast.show('Choose an electricity-bill PDF to track its emission.', 'error');
      return;
    }
    setLoading(true);
    try {
      let res;
      if (usePdf && pdfFile) {
        const fd = new FormData();
        fd.append('bill', pdfFile);
        fd.append('energy_source', data.energy_source);
        res = await uploadBill(fd);
      } else {
        res = await logElectricity({ units: parseFloat(data.units), energy_source: data.energy_source, period_days: parseInt(data.period_days) || 30 });
      }
      setResult(res.data);
      toast.show('Electricity emission logged!');
      reset();
    } catch (err) {
      toast.show(err.response?.data?.error || 'Failed to log emission', 'error');
    } finally { setLoading(false); }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <ResultBanner result={result} />
      <div className="flex gap-4 mb-2">
        <label className="flex items-center gap-2 cursor-pointer">
          <input type="radio" checked={!usePdf} onChange={() => setUsePdf(false)} />
          <span className="text-sm">Enter manually</span>
        </label>
        <label className="flex items-center gap-2 cursor-pointer">
          <input type="radio" checked={usePdf} onChange={() => setUsePdf(true)} />
          <span className="text-sm">Upload PDF bill</span>
        </label>
      </div>
      {usePdf ? (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Electricity Bill PDF</label>
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
            <Upload className="mx-auto text-gray-400 mb-2" size={24} />
            <input type="file" accept=".pdf" onChange={e => setPdfFile(e.target.files[0])} className="hidden" id="pdf-upload" />
            <label htmlFor="pdf-upload" className="cursor-pointer text-primary-600 hover:underline text-sm">Choose PDF file</label>
            {pdfFile && <p className="text-xs text-gray-500 mt-2">{pdfFile.name}</p>}
          </div>
          <p className="text-xs text-gray-500 mt-2">We’ll extract the units consumed and log the resulting electricity emission.</p>
        </div>
      ) : (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Units Consumed (kWh)</label>
          <input type="number" step="0.01" {...register('units', { required: !usePdf })} className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm" placeholder="e.g. 150" />
        </div>
      )}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Energy Source</label>
        <select {...register('energy_source', { required: true })} className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm">
          <option value="">Select source</option>
          <option value="grid">Grid (India — 0.82 kg CO₂e/kWh)</option>
          <option value="coal">Coal (0.80)</option>
          <option value="natural_gas">Natural Gas (0.40)</option>
          <option value="renewable">Renewable (0.10)</option>
          <option value="solar">Solar (0.05)</option>
        </select>
        {errors.energy_source && <p className="text-red-500 text-xs mt-1">Required</p>}
      </div>
      {!usePdf && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Period (days)</label>
          <input type="number" {...register('period_days')} defaultValue={30} className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm" />
        </div>
      )}
      <button type="submit" disabled={loading}
        className="w-full bg-primary-600 text-white rounded-lg py-2.5 font-medium hover:bg-primary-700 disabled:opacity-60 transition-colors">
        {loading ? 'Extracting & tracking...' : usePdf ? 'Upload & Track Emission' : 'Log Emission'}
      </button>
    </form>
  );
}

function TransportForm({ profile, toast }) {
  const { register, handleSubmit, reset } = useForm({
    defaultValues: {
      vehicle_type: profile?.vehicle_type || 'Car',
      fuel_type: profile?.fuel_type || 'petrol',
      mileage_kmpl: profile?.vehicle_mileage_kmpl || 15,
    }
  });
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const res = await logTransport({ ...data, distance_km: parseFloat(data.distance_km), mileage_kmpl: parseFloat(data.mileage_kmpl) });
      setResult(res.data);
      toast.show('Transport emission logged!');
    } catch (err) {
      toast.show(err.response?.data?.error || 'Failed', 'error');
    } finally { setLoading(false); }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <ResultBanner result={result} />
      <p className="text-xs text-gray-500 bg-blue-50 rounded-lg px-3 py-2">Pre-filled from your profile. Edit per-trip as needed.</p>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Vehicle Type</label>
        <select {...register('vehicle_type')} className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm">
          <option>Car</option><option>Bike</option><option>Bus</option><option>Auto</option>
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Fuel Type</label>
        <select {...register('fuel_type', { required: true })} className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm">
          <option value="petrol">Petrol (2.31 kg CO₂e/L)</option>
          <option value="diesel">Diesel (2.68 kg CO₂e/L)</option>
          <option value="cng">CNG (1.96 kg CO₂e/L)</option>
          <option value="electric">Electric (0.00)</option>
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Distance (km)</label>
        <input type="number" step="0.1" {...register('distance_km', { required: true })} className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm" placeholder="e.g. 50" />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Mileage (km/L)</label>
        <input type="number" step="0.1" {...register('mileage_kmpl', { required: true })} className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm" />
      </div>
      <SubmitButton loading={loading} />
    </form>
  );
}

function FoodForm({ profile, toast }) {
  const { register, handleSubmit, reset } = useForm({
    defaultValues: { diet_type: profile?.diet_type || 'mixed', days: 30 }
  });
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const res = await logFood({ diet_type: data.diet_type, days: parseFloat(data.days) });
      setResult(res.data);
      toast.show('Food emission logged!');
    } catch (err) {
      toast.show(err.response?.data?.error || 'Failed', 'error');
    } finally { setLoading(false); }
  };
  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <ResultBanner result={result} />
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Diet Type</label>
        <select {...register('diet_type', { required: true })} className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm">
          <option value="vegan">Vegan (2.0 kg CO₂e/day)</option>
          <option value="vegetarian">Vegetarian (2.5 kg CO₂e/day)</option>
          <option value="mixed">Mixed (3.5 kg CO₂e/day)</option>
          <option value="non-vegetarian">Non-Vegetarian (5.0 kg CO₂e/day)</option>
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Number of Days</label>
        <input type="number" {...register('days', { required: true })} className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm" placeholder="30" />
      </div>
      <SubmitButton loading={loading} />
    </form>
  );
}

function WasteForm({ toast }) {
  const { register, handleSubmit, reset } = useForm();
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const res = await logWaste({ waste_type: data.waste_type, quantity_kg: parseFloat(data.quantity_kg) });
      setResult(res.data);
      toast.show('Waste emission logged!');
    } catch (err) {
      toast.show(err.response?.data?.error || 'Failed', 'error');
    } finally { setLoading(false); }
  };
  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <ResultBanner result={result} />
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Waste Type</label>
        <select {...register('waste_type', { required: true })} className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm">
          <option value="general">General Waste (2.5 kg CO₂e/kg)</option>
          <option value="organic">Organic (1.2 kg CO₂e/kg)</option>
          <option value="recyclable">Recyclable (0.5 kg CO₂e/kg)</option>
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Quantity (kg)</label>
        <input type="number" step="0.1" {...register('quantity_kg', { required: true })} className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm" placeholder="e.g. 10" />
      </div>
      <SubmitButton loading={loading} />
    </form>
  );
}

function WaterForm({ toast }) {
  const { register, handleSubmit, reset } = useForm();
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const res = await logWater({ liters: parseFloat(data.liters), water_type: data.water_type });
      setResult(res.data);
      toast.show('Water emission logged!');
    } catch (err) {
      toast.show(err.response?.data?.error || 'Failed', 'error');
    } finally { setLoading(false); }
  };
  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <ResultBanner result={result} />
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Water Type</label>
        <select {...register('water_type')} className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm">
          <option value="tap">Tap Water (0.000344 kg CO₂e/L)</option>
          <option value="bottled">Bottled Water (0.000544 kg CO₂e/L)</option>
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Consumption (litres)</label>
        <input type="number" step="1" {...register('liters', { required: true })} className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm" placeholder="e.g. 5000" />
      </div>
      <SubmitButton loading={loading} />
    </form>
  );
}

export default function TrackEmission() {
  const [activeTab, setActiveTab] = useState('electricity');
  const toast = useToast();
  const { data: profileData } = useQuery({ queryKey: ['profile'], queryFn: () => getProfile().then(r => r.data) });
  const profile = profileData?.profile;

  const renderForm = () => {
    switch (activeTab) {
      case 'electricity': return <ElectricityForm profile={profile} toast={toast} />;
      case 'transport': return <TransportForm profile={profile} toast={toast} />;
      case 'food': return <FoodForm profile={profile} toast={toast} />;
      case 'waste': return <WasteForm toast={toast} />;
      case 'water': return <WaterForm toast={toast} />;
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Track Emission</h1>
      <p className="text-gray-500 text-sm mb-8">Log your activity to calculate its CO₂ equivalent</p>
      <div className="max-w-xl">
        <div className="flex gap-1 bg-gray-100 rounded-lg p-1 mb-6">
          {TABS.map(({ key, label, icon: Icon }) => (
            <button key={key} onClick={() => setActiveTab(key)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-md text-xs font-medium transition-colors flex-1 justify-center ${
                activeTab === key ? 'bg-white shadow text-primary-700' : 'text-gray-600 hover:text-gray-900'
              }`}>
              <Icon size={14} />{label}
            </button>
          ))}
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-6">{renderForm()}</div>
      </div>
      <ToastContainer toasts={toast.toasts} />
    </div>
  );
}
