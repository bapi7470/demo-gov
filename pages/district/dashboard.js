import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import DistrictRolesManager from '../../components/DistrictRolesManager';

const ROLE_CONFIG = {
  'co-admin': { label: 'Co-Admin', icon: '👑', color: 'from-purple-700 to-indigo-800' },
  'member':   { label: 'Member',   icon: '👤', color: 'from-blue-600 to-blue-800' },
  'elder':    { label: 'Elder',    icon: '🏅', color: 'from-green-600 to-emerald-800' },
};

const STATUS_CONFIG = {
  'Under Review':         { bg: 'bg-yellow-100', text: 'text-yellow-800', dot: 'bg-yellow-500' },
  'Application Received': { bg: 'bg-blue-100',   text: 'text-blue-800',   dot: 'bg-blue-500' },
  'Documents Pending':    { bg: 'bg-orange-100', text: 'text-orange-800', dot: 'bg-orange-500' },
  'Approved':             { bg: 'bg-green-100',  text: 'text-green-800',  dot: 'bg-green-500' },
  'Rejected':             { bg: 'bg-red-100',    text: 'text-red-800',    dot: 'bg-red-500' },
};

function StatusBadge({ status }) {
  const c = STATUS_CONFIG[status] || STATUS_CONFIG['Under Review'];
  return (
    <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full ${c.bg} ${c.text}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${c.dot}`} />{status}
    </span>
  );
}

export default function DistrictDashboard() {
  const router = useRouter();
  const [session, setSession] = useState(null);
  const [authChecked, setAuthChecked] = useState(false);

  const [tab, setTab]                   = useState('applications');
  const [applications, setApplications] = useState([]);
  const [loading, setLoading]           = useState(true);
  const [search, setSearch]             = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  const [filterScheme, setFilterScheme] = useState('all');
  const [expandedApp, setExpandedApp]   = useState(null);
  const [actionLoading, setActionLoading] = useState(null);
  const [rejectModal, setRejectModal]   = useState(null);
  const [rejectNote, setRejectNote]     = useState('');

  // Auth guard on client side
  useEffect(() => {
    let s = null;
    try {
      s = JSON.parse(localStorage.getItem('district_session'));
    } catch {}
    if (!s) {
      router.replace('/district-login');
      return;
    }
    setSession(s);
    setAuthChecked(true);
  }, []);

  // Fetch applications once session is available
  useEffect(() => {
    if (!authChecked || !session) return;
    const params = new URLSearchParams();
    if (session.district) params.set('district', session.district);
    if (session.stateId)  params.set('stateId', session.stateId);

    fetch(`/api/applications?${params.toString()}`)
      .then(r => r.ok ? r.json() : [])
      .then(data => {
        setApplications(data.sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt)));
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [authChecked, session]);

  const refresh = async () => {
    if (!session) return;
    const params = new URLSearchParams();
    if (session.district) params.set('district', session.district);
    if (session.stateId)  params.set('stateId', session.stateId);
    try {
      const res = await fetch(`/api/applications?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setApplications(data.sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt)));
      }
    } catch {}
  };

  const updateStatus = async (refNo, status, note) => {
    await fetch(`/api/applications/${refNo}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status, note }),
    });
  };

  const handleApprove = async (app) => {
    setActionLoading(app.refNo + '_approve');
    await updateStatus(app.refNo, 'Approved', `Verified & approved by ${session.role}: ${session.fullName} (${session.district})`);
    await refresh();
    setActionLoading(null);
  };

  const handleReject = async () => {
    if (!rejectModal) return;
    setActionLoading(rejectModal.refNo + '_reject');
    await updateStatus(rejectModal.refNo, 'Rejected', rejectNote || `Rejected by ${session.role}: ${session.fullName}`);
    setRejectModal(null);
    setRejectNote('');
    await refresh();
    setActionLoading(null);
  };

  const handleDocsPending = async (app) => {
    setActionLoading(app.refNo + '_docs');
    await updateStatus(app.refNo, 'Documents Pending', `Additional documents requested by ${session.role}: ${session.fullName}`);
    await refresh();
    setActionLoading(null);
  };

  const handleLogout = () => {
    localStorage.removeItem('district_session');
    router.replace('/login');
  };

  if (!authChecked || !session) {
    return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin text-4xl">⟳</div></div>;
  }

  const roleCfg   = ROLE_CONFIG[session.role] || ROLE_CONFIG.member;
  const isCoadmin = session.role === 'co-admin';

  const allSchemes = [...new Set(applications.map(a => a.schemeName))];
  const filtered   = applications.filter(a => {
    const matchSearch = !search ||
      a.applicantName?.toLowerCase().includes(search.toLowerCase()) ||
      a.refNo?.toLowerCase().includes(search.toLowerCase()) ||
      a.schemeName?.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === 'All' || a.status === filterStatus;
    const matchScheme = filterScheme === 'all' || a.schemeName === filterScheme;
    return matchSearch && matchStatus && matchScheme;
  });

  const pending  = applications.filter(a => a.status === 'Under Review' || a.status === 'Application Received').length;
  const approved = applications.filter(a => a.status === 'Approved').length;
  const rejected = applications.filter(a => a.status === 'Rejected').length;

  const tabs = [
    { id: 'applications', label: '📋 Applications', badge: pending > 0 ? pending : null },
    ...(isCoadmin ? [{ id: 'officials', label: '👥 Officials', badge: null }] : []),
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className={`bg-gradient-to-r ${roleCfg.color} text-white py-5 px-4 sm:px-6`}>
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 bg-white/20 rounded-xl flex items-center justify-center text-2xl">{roleCfg.icon}</div>
            <div>
              <h1 className="font-extrabold text-lg leading-tight">{session.fullName}</h1>
              <p className="text-white/70 text-xs">
                {roleCfg.label} · 📍 {session.district} · {session.stateName}
              </p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="bg-white/10 hover:bg-white/20 border border-white/20 text-white text-xs font-semibold px-3 py-2 rounded-lg transition-colors"
          >
            🔓 Logout
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white border-b border-gray-200 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto flex gap-1">
          {tabs.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={`relative px-4 py-3 text-sm font-semibold transition-all ${
                tab === t.id ? 'text-blue-700 border-b-2 border-blue-700' : 'text-gray-500 hover:text-gray-700'
              }`}>
              {t.label}
              {t.badge > 0 && (
                <span className="absolute -top-0.5 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                  {t.badge}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">

        {/* APPLICATIONS TAB */}
        {tab === 'applications' && (
          <>
            {/* Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
              {[
                { label: 'Total',    value: applications.length, color: 'bg-gray-50 border-gray-200' },
                { label: 'Pending',  value: pending,             color: 'bg-yellow-50 border-yellow-200' },
                { label: 'Approved', value: approved,            color: 'bg-green-50 border-green-200' },
                { label: 'Rejected', value: rejected,            color: 'bg-red-50 border-red-200' },
              ].map(s => (
                <div key={s.label} className={`${s.color} border rounded-xl p-3 text-center`}>
                  <p className="text-xl font-bold text-gray-800">{s.value}</p>
                  <p className="text-xs text-gray-500">{s.label}</p>
                </div>
              ))}
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-3 mb-4">
              <div className="flex-1 relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">🔍</span>
                <input value={search} onChange={e => setSearch(e.target.value)}
                  placeholder="Name, ref no., scheme..." className="form-input pl-9 text-sm w-full" />
              </div>
              <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="form-input text-sm sm:w-44">
                {['All','Under Review','Application Received','Documents Pending','Approved','Rejected'].map(s =>
                  <option key={s} value={s}>{s}</option>
                )}
              </select>
              <select value={filterScheme} onChange={e => setFilterScheme(e.target.value)} className="form-input text-sm sm:w-56">
                <option value="all">All Schemes</option>
                {allSchemes.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>

            {loading ? (
              <div className="text-center py-12 text-gray-400">
                <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                Loading applications...
              </div>
            ) : filtered.length === 0 ? (
              <div className="bg-white rounded-2xl border border-gray-100 p-10 text-center text-gray-400">
                <div className="text-4xl mb-2">📋</div>
                <p>{applications.length === 0 ? 'No applications in your district yet.' : 'No results found.'}</p>
              </div>
            ) : (
              <div className="space-y-3">
                {filtered.map(app => {
                  const isActing   = actionLoading?.startsWith(app.refNo);
                  const isExpanded = expandedApp === app.refNo;
                  return (
                    <div key={app.refNo} className={`bg-white rounded-xl border shadow-sm overflow-hidden ${
                      app.status === 'Approved' ? 'border-l-4 border-l-green-500 border-r border-t border-b border-gray-200' :
                      app.status === 'Rejected' ? 'border-l-4 border-l-red-400 border-r border-t border-b border-gray-200' :
                      'border-l-4 border-l-yellow-400 border-r border-t border-b border-gray-200'
                    }`}>
                      <div className="p-4">
                        <div className="flex items-start justify-between gap-3 flex-wrap">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap mb-1">
                              <p className="font-bold text-gray-800 text-sm">{app.applicantName}</p>
                              <StatusBadge status={app.status} />
                            </div>
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-x-4 gap-y-0.5 text-xs text-gray-500 mt-1">
                              <span>📋 {app.refNo}</span>
                              <span>📱 {app.mobile}</span>
                              <span>🏛️ {app.schemeName}</span>
                              <span>📍 {app.district}</span>
                              {app.city && app.city !== '—' && <span>🏙️ {app.city}</span>}
                              <span>📅 {new Date(app.submittedAt).toLocaleDateString('en-IN')}</span>
                            </div>
                          </div>
                          <div className="flex gap-2 flex-shrink-0 flex-wrap">
                            {app.status !== 'Approved' && app.status !== 'Rejected' && (
                              <>
                                <button onClick={() => handleApprove(app)} disabled={isActing}
                                  className="bg-green-600 hover:bg-green-700 text-white text-xs font-bold px-3 py-2 rounded-xl transition-colors disabled:opacity-50 flex items-center gap-1">
                                  {actionLoading === app.refNo + '_approve'
                                    ? <span className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    : '✅'} Verify
                                </button>
                                <button onClick={() => handleDocsPending(app)} disabled={isActing}
                                  className="bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold px-2 py-2 rounded-xl transition-colors disabled:opacity-50">
                                  📎
                                </button>
                                <button onClick={() => { setRejectModal(app); setRejectNote(''); }} disabled={isActing}
                                  className="bg-red-100 hover:bg-red-200 text-red-700 text-xs font-bold px-3 py-2 rounded-xl transition-colors">
                                  ❌
                                </button>
                              </>
                            )}
                            {(app.status === 'Approved' || app.status === 'Rejected') && (
                              <span className={`text-xs font-bold px-3 py-2 rounded-xl ${
                                app.status === 'Approved' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                              }`}>
                                {app.status === 'Approved' ? '✅ Approved' : '❌ Rejected'}
                              </span>
                            )}
                            <button onClick={() => setExpandedApp(isExpanded ? null : app.refNo)}
                              className="bg-gray-100 hover:bg-gray-200 text-gray-600 text-xs px-2.5 py-2 rounded-xl transition-colors">
                              {isExpanded ? '▲' : '▼'}
                            </button>
                          </div>
                        </div>

                        {isExpanded && app.statusHistory?.length > 0 && (
                          <div className="mt-3 pt-3 border-t border-gray-100">
                            <p className="text-xs font-bold text-gray-500 uppercase mb-2">Status History</p>
                            <div className="space-y-1.5">
                              {app.statusHistory.map((h, i) => (
                                <div key={i} className="flex gap-2 text-xs text-gray-500">
                                  <span className={`w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0 ${
                                    i === app.statusHistory.length - 1 ? 'bg-blue-500' : 'bg-green-400'
                                  }`} />
                                  <span><strong>{h.status}</strong> — {h.date}{h.note && ` — ${h.note}`}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}

        {/* OFFICIALS TAB (Co-Admin only) */}
        {tab === 'officials' && isCoadmin && (
          <DistrictRolesManager adminInfo={{ ...session, districtRole: 'co-admin' }} />
        )}
      </div>

      {/* Reject Modal */}
      {rejectModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6">
            <h3 className="font-bold text-gray-800 mb-1">Reject Application?</h3>
            <p className="text-sm text-gray-500 mb-4">
              <strong>{rejectModal.applicantName}</strong> — {rejectModal.schemeName}
            </p>
            <div className="mb-4">
              <label className="form-label">Reason <span className="text-gray-400 font-normal">(optional)</span></label>
              <textarea value={rejectNote} onChange={e => setRejectNote(e.target.value)}
                rows={2} placeholder="Reason for rejection..." className="form-input resize-none text-sm" />
            </div>
            <div className="flex gap-3">
              <button onClick={() => { setRejectModal(null); setRejectNote(''); }}
                className="flex-1 border border-gray-300 text-gray-700 py-2.5 rounded-xl text-sm font-semibold hover:bg-gray-50">
                Cancel
              </button>
              <button onClick={handleReject}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold py-2.5 rounded-xl text-sm transition-colors">
                ❌ Confirm Reject
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
