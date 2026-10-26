import { useState } from 'react';
import { Link } from 'react-router-dom';
import { forgotPassword } from '../../api/auth';
import { Leaf } from 'lucide-react';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await forgotPassword(email);
      setResult(data);
    } catch (err) {
      setResult({ error: err.response?.data?.error || 'Failed' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-green-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-8">
        <div className="flex items-center gap-2 justify-center mb-8">
          <Leaf className="text-primary-600" size={32} />
          <span className="text-2xl font-bold text-primary-700">traCO2</span>
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Reset Password</h1>
        {!result ? (
          <form onSubmit={handleSubmit} className="space-y-4 mt-6">
            <input
              type="email" value={email} onChange={e => setEmail(e.target.value)} required
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm"
              placeholder="your@email.com"
            />
            <button disabled={loading} className="w-full bg-primary-600 text-white rounded-lg py-2.5 font-medium hover:bg-primary-700 disabled:opacity-60">
              {loading ? 'Sending...' : 'Generate Reset Token'}
            </button>
          </form>
        ) : (
          <div className="mt-4">
            {result.error ? (
              <div className="bg-red-50 text-red-700 rounded-lg p-4 text-sm">{result.error}</div>
            ) : (
              <div className="bg-green-50 rounded-lg p-4 text-sm">
                <p className="font-medium text-green-800 mb-2">{result.message}</p>
                {result.reset_token && (
                  <><p className="text-gray-600 mb-1">Reset token (MVP — no email):</p><code className="block bg-gray-100 rounded p-2 text-xs break-all">{result.reset_token}</code></>
                )}
              </div>
            )}
          </div>
        )}
        <p className="text-center text-sm text-gray-500 mt-6">
          <Link to="/login" className="text-primary-600 hover:underline">← Back to login</Link>
        </p>
      </div>
    </div>
  );
}
