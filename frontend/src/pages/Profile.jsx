import { useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { getProfile, updateProfile, uploadAvatar } from '../api/user';
import { useAuth } from '../context/AuthContext';
import { useToast, ToastContainer } from '../components/Toast';
import LoadingSpinner from '../components/LoadingSpinner';
import { Camera } from 'lucide-react';

export default function Profile() {
  const { updateUser } = useAuth();
  const toast = useToast();
  const qc = useQueryClient();
  const fileRef = useRef();

  const { data: profileData, isLoading } = useQuery({
    queryKey: ['profile'],
    queryFn: () => getProfile().then(r => r.data)
  });

  const { register, handleSubmit, reset } = useForm();

  useEffect(() => {
    if (profileData) {
      reset({
        name: profileData.name,
        vehicle_type: profileData.profile?.vehicle_type || '',
        fuel_type: profileData.profile?.fuel_type || '',
        vehicle_mileage_kmpl: profileData.profile?.vehicle_mileage_kmpl || '',
        electricity_meter_type: profileData.profile?.electricity_meter_type || '',
        kwh_per_unit: profileData.profile?.kwh_per_unit || 1,
        diet_type: profileData.profile?.diet_type || '',
        location: profileData.profile?.location || '',
      });
    }
  }, [profileData, reset]);

  const [saving, setSaving] = useState(false);
  const onSubmit = async (data) => {
    setSaving(true);
    try {
      const res = await updateProfile(data);
      updateUser({ name: res.data.name, profile_pic_url: res.data.profile_pic_url });
      qc.invalidateQueries(['profile']);
      toast.show('Profile updated!');
    } catch (err) {
      toast.show(err.response?.data?.error || 'Update failed', 'error');
    } finally { setSaving(false); }
  };

  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const fd = new FormData();
    fd.append('avatar', file);
    try {
      const res = await uploadAvatar(fd);
      updateUser({ profile_pic_url: res.data.profile_pic_url });
      qc.invalidateQueries(['profile']);
      toast.show('Avatar updated!');
    } catch (err) {
      toast.show('Avatar upload failed', 'error');
    }
  };

  if (isLoading) return <LoadingSpinner />;

  const avatarUrl = profileData?.profile_pic_url ? `http://localhost:5000${profileData.profile_pic_url}` : null;

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-8">Profile & Settings</h1>
      <div className="max-w-xl">
        {/* Avatar */}
        <div className="flex items-center gap-6 mb-8">
          <div className="relative">
            {avatarUrl ? (
              <img src={avatarUrl} className="w-20 h-20 rounded-full object-cover border-4 border-primary-100" alt="avatar" />
            ) : (
              <div className="w-20 h-20 rounded-full bg-primary-100 flex items-center justify-center border-4 border-primary-200">
                <span className="text-3xl font-bold text-primary-600">{profileData?.name?.charAt(0)}</span>
              </div>
            )}
            <button onClick={() => fileRef.current.click()}
              className="absolute bottom-0 right-0 p-1.5 bg-primary-600 rounded-full text-white hover:bg-primary-700">
              <Camera size={12} />
            </button>
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
          </div>
          <div>
            <p className="font-semibold text-gray-900">{profileData?.name}</p>
            <p className="text-sm text-gray-500">{profileData?.email}</p>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
            <h3 className="font-semibold text-gray-700 text-sm">Personal Info</h3>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
              <input {...register('name')} className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
              <input {...register('location')} className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm" placeholder="City, State" />
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
            <h3 className="font-semibold text-gray-700 text-sm">Vehicle & Fuel</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Vehicle Type</label>
                <select {...register('vehicle_type')} className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm">
                  <option value="">Select</option>
                  <option>Car</option><option>Bike</option><option>Bus</option><option>Auto</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Fuel Type</label>
                <select {...register('fuel_type')} className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm">
                  <option value="">Select</option>
                  <option value="petrol">Petrol</option><option value="diesel">Diesel</option>
                  <option value="cng">CNG</option><option value="electric">Electric</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Mileage (km/L)</label>
              <input type="number" step="0.1" {...register('vehicle_mileage_kmpl')} className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm" />
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
            <h3 className="font-semibold text-gray-700 text-sm">Electricity & Diet</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Meter Type</label>
                <select {...register('electricity_meter_type')} className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm">
                  <option value="">Select</option>
                  <option value="smart">Smart Meter</option>
                  <option value="analog">Analog Meter</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">kWh per unit</label>
                <input type="number" step="0.01" {...register('kwh_per_unit')} className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Diet Type</label>
              <select {...register('diet_type')} className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm">
                <option value="">Select</option>
                <option value="vegan">Vegan</option><option value="vegetarian">Vegetarian</option>
                <option value="mixed">Mixed</option><option value="non-vegetarian">Non-Vegetarian</option>
              </select>
            </div>
          </div>

          <button type="submit" disabled={saving}
            className="w-full bg-primary-600 text-white rounded-lg py-2.5 font-medium hover:bg-primary-700 disabled:opacity-60">
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </form>
      </div>
      <ToastContainer toasts={toast.toasts} />
    </div>
  );
}
