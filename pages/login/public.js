import { useState } from 'react';
import { useRouter } from 'next/router';
import { signIn } from 'next-auth/react';

export default function PublicLoginPage() {
  const router = useRouter();
  const from = (router.query.from) || '/home';

  const [loginData, setLoginData] = useState({ mobile: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!loginData.mobile || !loginData.password) { setError('Please fill in all fields.'); return; }
    setLoading(true);
    await new Promise(r => setTimeout(r, 600));
    const res = await signIn('credentials', {
      mobile: loginData.mobile,
      password: loginData.password,
      redirect: false,
    });
    setLoading(false);
    if (res && res.ok) router.replace(from);
    else setError(res?.error || 'Invalid credentials. Please try again.');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-amber-50 flex flex-col items-center justify-center px-4 py-10">
      <div className="w-full max-w-md">

        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-orange-700 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-lg">
            <span className="text-3xl">👤</span>
          </div>
          <h1 className="text-2xl font-extrabold text-gray-800">Public Portal</h1>
          <p className="text-gray-500 text-sm mt-1">Citizens & Applicants</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100">
          <div className="bg-gradient-to-r from-orange-500 to-orange-700 px-6 py-4">
            <p className="font-bold text-white text-base">✅ Open to All</p>
            <p className="text-orange-100 text-xs mt-0.5">Apply for schemes, exams & more</p>
          </div>

          <div className="p-6 space-y-4">
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-red-700 text-sm">
                ❌ {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="form-label">Mobile Number *</label>
                <input type="tel" value={loginData.mobile}
                  onChange={e => setLoginData(p => ({ ...p, mobile: e.target.value }))}
                  placeholder="9XXXXXXXXX" className="form-input" maxLength={10} autoFocus />
              </div>
              <div>
                <label className="form-label">Password *</label>
                <input type="password" value={loginData.password}
                  onChange={e => setLoginData(p => ({ ...p, password: e.target.value }))}
                  placeholder="••••••••" className="form-input" />
              </div>
              <button type="submit" disabled={loading}
                className="w-full bg-orange-600 hover:bg-orange-700 text-white font-bold py-3 rounded-xl transition-colors flex items-center justify-center gap-2 disabled:opacity-60">
                {loading
                  ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Logging in...</>
                  : '🔐 Login'}
              </button>
            </form>

            <div className="bg-blue-50 rounded-xl p-3 text-xs text-blue-700">
              <p className="font-semibold mb-1">Demo accounts:</p>
              <p>Mobile: <code>9800000001</code> | Password: <code>demo123</code></p>
              <p>Mobile: <code>9800000002</code> | Password: <code>demo456</code></p>
            </div>

            <p className="text-center text-sm text-gray-500">
              Don't have an account?{' '}
              <button onClick={() => router.push('/login/registration')}
                className="text-orange-600 font-semibold hover:underline">
                Register here →
              </button>
            </p>
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
