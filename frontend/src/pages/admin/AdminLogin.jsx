import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminLogin } from '../../api/admin';
import { Leaf, ShieldCheck } from 'lucide-react';

export default function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await adminLogin({ email, password });
      localStorage.setItem('adminToken', data.accessToken);
      localStorage.setItem('adminUser', JSON.stringify(data.admin));
      navigate('/admin/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed');
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-8">
        <div className="flex items-center gap-2 justify-center mb-8">
          <ShieldCheck className="text-primary-600" size={32} />
          <span className="text-2xl font-bold text-gray-800">Admin Panel</span>
        </div>
        {error && <div className="bg-red-50 text-red-700 rounded-lg px-4 py-3 mb-4 text-sm">{error}</div>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <input type="email" value={email} onChange={e => setEmail(e.target.value)} required
            className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm" placeholder="admin@traco2.local" />
          <input type="password" value={password} onChange={e => setPassword(e.target.value)} required
            className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm" placeholder="Password" />
          <button disabled={loading} className="w-full bg-gray-900 text-white rounded-lg py-2.5 font-medium hover:bg-gray-800 disabled:opacity-60">
            {loading ? 'Signing in...' : 'Admin Sign In'}
          </button>
        </form>
      </div>
    </div>
  );
}
