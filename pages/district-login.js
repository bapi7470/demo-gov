import { useState } from 'react';
import { useRouter } from 'next/router';

const ROLE_CONFIG = {
  'co-admin': { label: 'Co-Admin', icon: '👑', color: 'bg-purple-600' },
  'member':   { label: 'Member',   icon: '👤', color: 'bg-blue-600' },
  'elder':    { label: 'Elder',    icon: '🏅', color: 'bg-green-600' },
};

export default function DistrictLoginPage() {
  const router = useRouter();
  const [creds, setCreds]   = useState({ username: '', password: '' });
  const [error, setError]   = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    if (!creds.username || !creds.password) {
      setError('Please fill in all fields.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/district-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: creds.username.trim(), password: creds.password }),
      });

      if (res.ok) {
        const found = await res.json();
        localStorage.setItem('district_session', JSON.stringify({
          id:        found.id,
          fullName:  found.fullName,
          username:  found.username,
          role:      found.role,
          district:  found.district,
          stateId:   found.stateId,
          stateName: found.stateName,
          createdBy: found.createdBy,
        }));
        router.replace('/district/dashboard');
      } else {
        setError('Invalid username or password. Please contact your Co-Admin or State Admin.');
      }
    } catch {
      setError('Login failed. Please try again.');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-blue-900 to-slate-900 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-18 h-18 bg-white/10 rounded-2xl flex items-center justify-center mx-auto mb-4 p-4 backdrop-blur">
            <span className="text-4xl">🏛️</span>
          </div>
          <h1 className="text-2xl font-extrabold text-white">District Official Login</h1>
          <p className="text-blue-200 text-sm mt-1">For Co-Admin, Members & Elders</p>
        </div>

        {/* Role badges */}
        <div className="flex justify-center gap-2 mb-6">
          {Object.entries(ROLE_CONFIG).map(([role, cfg]) => (
            <span key={role} className={`${cfg.color} text-white text-xs font-bold px-3 py-1 rounded-full`}>
              {cfg.icon} {cfg.label}
            </span>
          ))}
        </div>

        <div className="bg-white/10 backdrop-blur-md rounded-3xl border border-white/20 p-8">
          <div className="bg-amber-500/20 border border-amber-400/30 rounded-xl p-3 mb-5 flex gap-2">
            <span className="text-amber-300">⚠️</span>
            <p className="text-amber-200 text-xs">
              Access granted only to authorised district officials. Credentials are issued by your State Government Admin.
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-blue-200 mb-1.5">Username *</label>
              <input
                type="text"
                value={creds.username}
                onChange={e => { setCreds(p => ({ ...p, username: e.target.value })); setError(''); }}
                placeholder="e.g. kolkata_coadmin_01"
                className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-blue-400 font-mono text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-blue-200 mb-1.5">Password *</label>
              <input
                type="password"
                value={creds.password}
                onChange={e => { setCreds(p => ({ ...p, password: e.target.value })); setError(''); }}
                placeholder="••••••••"
                className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>

            {error && (
              <div className="bg-red-500/20 border border-red-400/30 rounded-xl p-3 text-red-300 text-sm">
                ❌ {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-xl transition-colors flex items-center justify-center gap-2"
            >
              {loading
                ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Verifying...</>
                : '🔐 Login'}
            </button>
          </form>

          <div className="mt-5 text-center">
            <button
              onClick={() => router.push('/login')}
              className="text-blue-300 hover:text-white text-sm transition-colors"
            >
              ← Back to Main Login
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
