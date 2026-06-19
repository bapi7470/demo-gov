import { useState } from 'react';
import { useRouter } from 'next/router';

export default function GovLoginPage() {
  const router = useRouter();
  const [govLogin, setGovLogin] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!govLogin.username || !govLogin.password) { setError('Please fill in all fields.'); return; }
    setLoading(true);
    try {
      const res = await fetch('/api/gov-admin/login', {
        method: 'POST',
        body: JSON.stringify({ username: govLogin.username.trim(), password: govLogin.password }),
        headers: { 'Content-Type': 'application/json' },
      });
      const data = await res.json();
      if (res.ok && data.success) {
        localStorage.setItem('gov_admin_session', JSON.stringify(data.session));
        router.replace('/admin');
      } else {
        setError(data.error || 'Invalid credentials. Check username and password.');
      }
    } catch {
      setError('Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex flex-col items-center justify-center px-4 py-10">
      <div className="w-full max-w-md">

        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-700 to-indigo-800 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-lg">
            <span className="text-3xl">🏛️</span>
          </div>
          <h1 className="text-2xl font-extrabold text-gray-800">Government Portal</h1>
          <p className="text-gray-500 text-sm mt-1">Authorised officials & employees only</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100">
          <div className="bg-gradient-to-r from-blue-700 to-indigo-800 px-6 py-4">
            <p className="font-bold text-white text-base">🔒 Restricted Access</p>
            <p className="text-blue-200 text-xs mt-0.5">Government officials login</p>
          </div>

          <div className="p-6 space-y-4">
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 flex gap-2">
              <span>⚠️</span>
              <p className="text-amber-700 text-xs">This portal is restricted to authorised government officials only. Unauthorised access is prohibited under IT Act 2000.</p>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-red-700 text-sm">
                ❌ {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="form-label">Official Username *</label>
                <input type="text" value={govLogin.username}
                  onChange={e => setGovLogin(p => ({ ...p, username: e.target.value }))}
                  placeholder="e.g. wb_admin, up_admin..."
                  className="form-input" autoFocus />
              </div>
              <div>
                <label className="form-label">Password *</label>
                <input type="password" value={govLogin.password}
                  onChange={e => setGovLogin(p => ({ ...p, password: e.target.value }))}
                  placeholder="••••••••" className="form-input" />
              </div>
              <button type="submit" disabled={loading}
                className="w-full bg-blue-700 hover:bg-blue-800 text-white font-bold py-3 rounded-xl transition-colors flex items-center justify-center gap-2 disabled:opacity-60">
                {loading
                  ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Logging in...</>
                  : '🔐 Secure Government Login'}
              </button>
            </form>

            <div className="bg-gray-50 rounded-xl p-3 text-xs text-gray-500 space-y-1">
              <p className="font-semibold text-gray-600 mb-1.5">State Admin Accounts:</p>
              <div className="grid grid-cols-2 gap-x-4 gap-y-0.5">
                <span>🐯 <code>wb_admin</code> / <code>WB@2024</code></span>
                <span>🕌 <code>up_admin</code> / <code>UP@2024</code></span>
                <span>🌆 <code>mh_admin</code> / <code>MH@2024</code></span>
                <span>🏯 <code>ka_admin</code> / <code>KA@2024</code></span>
                <span>🏛️ <code>dl_admin</code> / <code>DL@2024</code></span>
                <span>🕌 <code>tn_admin</code> / <code>TN@2024</code></span>
              </div>
            </div>
          </div>
        </div>

        <button onClick={() => router.push('/login')}
          className="mt-5 w-full text-center text-sm text-gray-500 hover:text-gray-700 transition-colors">
          ← Back to Portal Selection
        </button>
      </div>
    </div>
  );
}
