import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getDevices, registerDevice, deleteDevice } from '../api/device';
import { Cpu, Wifi, WifiOff, Trash2, Clock } from 'lucide-react';
import { useToast, ToastContainer } from '../components/Toast';
import LoadingSpinner from '../components/LoadingSpinner';

export default function MyDevice() {
  const [deviceCode, setDeviceCode] = useState('');
  const [deviceType, setDeviceType] = useState('electricity');
  const toast = useToast();
  const queryClient = useQueryClient();

  const { data: devices = [], isLoading } = useQuery({
    queryKey: ['devices'],
    queryFn: () => getDevices().then(r => r.data)
  });

  const registerMutation = useMutation({
    mutationFn: () => registerDevice({ device_code: deviceCode, type: deviceType }),
    onSuccess: () => {
      toast.show('Device registered!');
      setDeviceCode('');
      queryClient.invalidateQueries(['devices']);
    },
    onError: (err) => toast.show(err.response?.data?.error || 'Failed to register device', 'error')
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => deleteDevice(id),
    onSuccess: () => { toast.show('Device removed'); queryClient.invalidateQueries(['devices']); },
    onError: () => toast.show('Failed to remove device', 'error')
  });

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-2">My Device</h1>
      <p className="text-gray-500 text-sm mb-8">Manage your connected ESP32 hardware</p>

      {/* Future scope banner */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-6 mb-8">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-amber-100 rounded-lg">
            <Cpu className="text-amber-600" size={24} />
          </div>
          <div>
            <h3 className="font-semibold text-amber-900 mb-1">Hardware Live Data — Coming in v2</h3>
            <p className="text-sm text-amber-700">
              Auto-tracking via ESP32 LDR pulse sensor (electricity) and GPS module (vehicle distance) is planned for the next release.
              Live readings will stream directly to your dashboard once your device is active.
            </p>
            <div className="flex gap-4 mt-3 text-xs text-amber-600">
              <span>🔌 LDR Electricity Sensor</span>
              <span>📍 GPS Vehicle Tracker</span>
              <span>📡 WiFi Data Sync</span>
            </div>
          </div>
        </div>
      </div>

      {/* Register device */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6 max-w-md">
        <h3 className="font-semibold text-gray-800 mb-4">Register a Device</h3>
        <p className="text-xs text-gray-500 mb-4">Enter the 8-character device code shown on your ESP32 screen. Device metadata will be saved and ready for when v2 ships.</p>
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Device Code</label>
            <input
              value={deviceCode} onChange={e => setDeviceCode(e.target.value.toUpperCase())}
              maxLength={12} placeholder="e.g. ESP32-A1B2"
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm font-mono tracking-widest"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
            <select value={deviceType} onChange={e => setDeviceType(e.target.value)} className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm">
              <option value="electricity">Electricity (LDR Pulse)</option>
              <option value="gps">GPS (Vehicle)</option>
            </select>
          </div>
          <button
            onClick={() => registerMutation.mutate()}
            disabled={!deviceCode || registerMutation.isPending}
            className="w-full bg-primary-600 text-white rounded-lg py-2.5 font-medium hover:bg-primary-700 disabled:opacity-60 transition-colors"
          >
            {registerMutation.isPending ? 'Registering...' : 'Register Device'}
          </button>
        </div>
      </div>

      {/* Device list */}
      {isLoading ? <LoadingSpinner /> : devices.length === 0 ? (
        <div className="text-center py-12 text-gray-400">
          <Cpu size={40} className="mx-auto mb-3 opacity-30" />
          <p>No devices registered yet</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {devices.map(device => (
            <div key={device.id} className="bg-white rounded-xl border border-gray-200 p-5">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${device.status === 'active' ? 'bg-green-50' : 'bg-gray-100'}`}>
                    {device.status === 'active' ? <Wifi className="text-green-600" size={18} /> : <WifiOff className="text-gray-400" size={18} />}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800 font-mono text-sm">{device.device_code}</p>
                    <p className="text-xs text-gray-500 capitalize">{device.type} device</p>
                  </div>
                </div>
                <button onClick={() => deleteMutation.mutate(device.id)} className="p-1.5 hover:bg-red-50 rounded-lg text-gray-400 hover:text-red-500 transition-colors">
                  <Trash2 size={14} />
                </button>
              </div>
              <div className="flex items-center gap-2">
                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
                  device.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                }`}>
                  {device.status === 'active' ? '● Active' : '● Pending'}
                </span>
                {device.last_seen_at && (
                  <span className="flex items-center gap-1 text-xs text-gray-400">
                    <Clock size={11} />
                    {new Date(device.last_seen_at).toLocaleString()}
                  </span>
                )}
              </div>
              <div className="mt-3 p-3 bg-amber-50 rounded-lg">
                <p className="text-xs text-amber-700">📡 Live readings will appear here once hardware integration is active (v2)</p>
              </div>
            </div>
          ))}
        </div>
      )}
      <ToastContainer toasts={toast.toasts} />
    </div>
  );
}
