import { useState } from 'react';
import { useRouter } from 'next/router';
import prisma from '../lib/prisma';
import { useApp } from '../context/AppContext';

export async function getServerSideProps() {
  const privateOrgs = await prisma.privateOrg.findMany({ orderBy: { name: 'asc' } });
  const orgSectors = ['All Sectors', ...new Set(privateOrgs.map(o => o.sector).filter(Boolean))];
  return { props: JSON.parse(JSON.stringify({ privateOrgs, orgSectors })) };
}

export default function PrivatePortalPage({ privateOrgs, orgSectors }) {
  const router = useRouter();
  const { getCompanyEmployees } = useApp();
  const [search, setSearch] = useState('');
  const [sectorFilter, setSectorFilter] = useState('All Sectors');
  const [loginModal, setLoginModal] = useState(null);
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');

  const filtered = privateOrgs.filter((org) => {
    const matchSearch =
      org.name.toLowerCase().includes(search.toLowerCase()) ||
      org.gst.toLowerCase().includes(search.toLowerCase()) ||
      org.city.toLowerCase().includes(search.toLowerCase());
    const matchSector = sectorFilter === 'All Sectors' || org.sector === sectorFilter;
    return matchSearch && matchSector;
  });

  const handleAdminLogin = (e) => {
    e.preventDefault();
    if (loginPassword === loginModal.adminPassword) {
      setLoginError('');
      setLoginPassword('');
      setLoginModal(null);
      router.push(`/company/${loginModal.id}`);
    } else {
      setLoginError('Incorrect admin password.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gradient-to-r from-gray-800 to-gray-900 text-white py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl md:text-4xl font-extrabold mb-2">🏢 Private Organisations</h1>
          <p className="text-gray-300">GST-registered private companies — admin access required to manage employee records</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search & Filter */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 mb-8">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">🔍</span>
              <input
                type="text"
                placeholder="Search by company name, GST number, city..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="form-input pl-10"
              />
            </div>
            <div className="flex gap-2 flex-wrap">
              {orgSectors.slice(0, 5).map((s) => (
                <button
                  key={s}
                  onClick={() => setSectorFilter(s)}
                  className={`px-3 py-2 rounded-lg text-xs font-medium transition-all whitespace-nowrap ${
                    sectorFilter === s
                      ? 'bg-gray-800 text-white shadow-sm'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        </div>

        <p className="text-sm text-gray-500 mb-4">{filtered.length} companies listed</p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {filtered.map((org) => {
            const empCount = getCompanyEmployees(org.id).length;
            return (
              <div
                key={org.id}
                className="card-hover bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden"
              >
                <div className={`bg-gradient-to-br ${org.color} h-24 flex items-center justify-center relative`}>
                  <span className="text-5xl">{org.icon}</span>
                  <div className="absolute bottom-0 left-0 right-0 h-6 bg-gradient-to-t from-black/20 to-transparent" />
                </div>

                <div className="p-4">
                  <h3 className="font-bold text-gray-800 text-sm leading-tight mb-0.5">{org.shortName}</h3>
                  <p className="text-xs text-gray-400 mb-2 truncate">{org.name}</p>

                  <div className="space-y-1 mb-3">
                    <div className="flex items-center gap-1.5 text-xs text-gray-500">
                      <span>📍</span><span>{org.city}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-gray-500">
                      <span>🏭</span><span>{org.sector}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-gray-400">
                      <span>🔢</span><span className="font-mono">{org.gst}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-gray-500">
                      <span>👥</span><span>{org.employees.toLocaleString('en-IN')} employees (total)</span>
                    </div>
                  </div>

                  {empCount > 0 && (
                    <div className="bg-blue-50 rounded-lg px-2 py-1 mb-2 flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 bg-blue-500 rounded-full" />
                      <span className="text-xs text-blue-700 font-medium">{empCount} registered in portal</span>
                    </div>
                  )}

                  <button
                    onClick={() => { setLoginModal(org); setLoginPassword(''); setLoginError(''); }}
                    className="w-full bg-gray-800 hover:bg-gray-700 text-white text-sm font-semibold py-2 rounded-lg transition-colors flex items-center justify-center gap-2"
                  >
                    🔐 Admin Login
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-20 text-gray-400">
            <div className="text-5xl mb-4">🔍</div>
            <p className="font-medium">No companies found</p>
          </div>
        )}
      </div>

      {/* Admin Login Modal */}
      {loginModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setLoginModal(null)}>
          <div
            className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className={`bg-gradient-to-r ${loginModal.color} p-6 text-white`}>
              <div className="flex items-center gap-3">
                <span className="text-3xl">{loginModal.icon}</span>
                <div>
                  <h2 className="text-xl font-bold">{loginModal.shortName}</h2>
                  <p className="text-white/70 text-sm">Admin Portal Access</p>
                </div>
              </div>
            </div>

            <form onSubmit={handleAdminLogin} className="p-6">
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 mb-5 flex gap-2">
                <span>ℹ️</span>
                <p className="text-amber-700 text-xs">Access granted only to authorised HR/Admin personnel. All actions are logged.</p>
              </div>

              <div className="mb-4">
                <label className="form-label">GST Number (readonly)</label>
                <input value={loginModal.gst} readOnly className="form-input bg-gray-50 text-gray-500 font-mono text-sm" />
              </div>

              <div className="mb-4">
                <label className="form-label">Admin Password *</label>
                <input
                  type="password"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  placeholder="Enter company admin password"
                  className={`form-input ${loginError ? 'border-red-400' : ''}`}
                  autoFocus
                />
                {loginError && <p className="text-red-500 text-xs mt-1">❌ {loginError}</p>}
              </div>

              <p className="text-xs text-gray-400 mb-4">Demo password: <code className="bg-gray-100 px-1 rounded">{loginModal.adminPassword}</code></p>

              <div className="flex gap-3">
                <button type="button" onClick={() => setLoginModal(null)} className="flex-1 border border-gray-300 text-gray-700 py-2.5 rounded-xl font-semibold text-sm hover:bg-gray-50 transition-colors">
                  Cancel
                </button>
                <button type="submit" className="flex-1 bg-gray-800 hover:bg-gray-700 text-white py-2.5 rounded-xl font-bold text-sm transition-colors">
                  🔐 Login
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
