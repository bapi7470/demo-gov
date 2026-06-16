import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';

const STATUS_CONFIG = {
  'Under Review':         { bg: 'bg-yellow-100', text: 'text-yellow-800', dot: 'bg-yellow-500' },
  'Application Received': { bg: 'bg-blue-100',   text: 'text-blue-800',   dot: 'bg-blue-500' },
  'Documents Pending':    { bg: 'bg-orange-100', text: 'text-orange-800', dot: 'bg-orange-500' },
  'Approved':             { bg: 'bg-green-100',  text: 'text-green-800',  dot: 'bg-green-500' },
  'Rejected':             { bg: 'bg-red-100',    text: 'text-red-800',    dot: 'bg-red-500' },
};

function StatusBadge({ status }) {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG['Under Review'];
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${cfg.bg} ${cfg.text}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
      {status}
    </span>
  );
}

export default function GovApplicationsPage() {
  const router = useRouter();
  const [applications, setApplications] = useState([]);
  const [adminInfo, setAdminInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState('scheme'); // 'scheme' | 'district'
  const [expandedScheme, setExpandedScheme] = useState(null);
  const [expandedDistrict, setExpandedDistrict] = useState(null);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  const [actionLoading, setActionLoading] = useState(null);
  const [rejectNote, setRejectNote] = useState('');
  const [showRejectModal, setShowRejectModal] = useState(null);
  const [detailModal, setDetailModal] = useState(null);

  // Gov admin auth guard + load data
  useEffect(() => {
    let info = null;
    try {
      info = JSON.parse(localStorage.getItem('gov_admin_session'));
    } catch {}
    if (!info) {
      router.replace('/login');
      return;
    }
    setAdminInfo(info);

    const stateId = info.stateId || 'central';
    const query = stateId !== 'central' ? `?stateId=${stateId}` : '';
    fetch(`/api/applications${query}`)
      .then(r => r.ok ? r.json() : [])
      .then(data => {
        setApplications(data.sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt)));
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const refreshApps = async () => {
    if (!adminInfo) return;
    const stateId = adminInfo.stateId || 'central';
    const query = stateId !== 'central' ? `?stateId=${stateId}` : '';
    try {
      const res = await fetch(`/api/applications${query}`);
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
    await updateStatus(app.refNo, 'Approved', 'Application verified and approved by state admin.');
    await refreshApps();
    setActionLoading(null);
  };

  const handleReject = async () => {
    if (!showRejectModal) return;
    setActionLoading(showRejectModal.refNo + '_reject');
    await updateStatus(showRejectModal.refNo, 'Rejected', rejectNote || 'Application rejected by state admin.');
    setShowRejectModal(null);
    setRejectNote('');
    await refreshApps();
    setActionLoading(null);
  };

  const handleDocPending = async (app) => {
    setActionLoading(app.refNo + '_docs');
    await updateStatus(app.refNo, 'Documents Pending', 'Additional documents required. Applicant notified.');
    await refreshApps();
    setActionLoading(null);
  };

  // Filter
  const filtered = applications.filter(a => {
    const matchSearch = !search ||
      a.applicantName?.toLowerCase().includes(search.toLowerCase()) ||
      a.schemeName?.toLowerCase().includes(search.toLowerCase()) ||
      a.refNo?.toLowerCase().includes(search.toLowerCase()) ||
      a.district?.toLowerCase().includes(search.toLowerCase()) ||
      a.mobile?.includes(search);
    const matchStatus = filterStatus === 'All' || a.status === filterStatus;
    return matchSearch && matchStatus;
  });

  // Group by scheme
  const byScheme = filtered.reduce((acc, app) => {
    const key = app.schemeName || 'Unknown';
    if (!acc[key]) acc[key] = { schemeName: key, schemeId: app.schemeId, items: [] };
    acc[key].items.push(app);
    return acc;
  }, {});

  // Group by district
  const byDistrict = filtered.reduce((acc, app) => {
    const key = app.district || '—';
    if (!acc[key]) acc[key] = { district: key, items: [] };
    acc[key].items.push(app);
    return acc;
  }, {});

  const statuses = ['All', 'Under Review', 'Application Received', 'Documents Pending', 'Approved', 'Rejected'];
  const pendingCount  = applications.filter(a => a.status === 'Under Review' || a.status === 'Application Received').length;
  const approvedCount = applications.filter(a => a.status === 'Approved').length;
  const rejectedCount = applications.filter(a => a.status === 'Rejected').length;

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin text-4xl">⟳</div></div>;
  }

  // Application Card (defined inside render so it can close over state setters)
  const AppCard = ({ app }) => {
    const isActing = actionLoading?.startsWith(app.refNo);
    return (
      <div className={`bg-white rounded-xl border border-gray-200 p-4 shadow-sm ${
        app.status === 'Approved'          ? 'border-l-4 border-l-green-500' :
        app.status === 'Rejected'          ? 'border-l-4 border-l-red-400' :
        app.status === 'Documents Pending' ? 'border-l-4 border-l-orange-400' :
        'border-l-4 border-l-yellow-400'
      }`}>
        <div className="flex items-start justify-between gap-3 flex-wrap">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <span className="font-bold text-gray-800 text-sm">{app.applicantName}</span>
              <StatusBadge status={app.status} />
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-x-4 gap-y-0.5 text-xs text-gray-500 mt-1">
              <span>📋 {app.refNo}</span>
              <span>📱 {app.mobile}</span>
              <span>📍 {app.district}</span>
              {app.city && app.city !== '—' && <span>🏙️ {app.city}</span>}
              {app.pincode && app.pincode !== '—' && <span>📮 {app.pincode}</span>}
              <span>📅 {new Date(app.submittedAt).toLocaleDateString('en-IN')}</span>
              {app.aadhaar && app.aadhaar !== '—' && <span>🆔 {app.aadhaar.slice(0,4)}****</span>}
            </div>
          </div>

          <div className="flex gap-2 flex-shrink-0 flex-wrap">
            <button
              onClick={() => setDetailModal(app)}
              className="bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold px-3 py-2 rounded-xl transition-colors flex items-center gap-1"
            >
              📄 Details
            </button>
            {app.status !== 'Approved' && app.status !== 'Rejected' && (
              <>
                <button
                  onClick={() => handleApprove(app)}
                  disabled={isActing}
                  className="bg-green-600 hover:bg-green-700 text-white text-xs font-bold px-4 py-2 rounded-xl transition-colors disabled:opacity-50 flex items-center gap-1"
                >
                  {actionLoading === app.refNo + '_approve'
                    ? <span className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    : '✅'} Approve
                </button>
                <button
                  onClick={() => handleDocPending(app)}
                  disabled={isActing}
                  className="bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold px-3 py-2 rounded-xl transition-colors disabled:opacity-50"
                >
                  📎 Docs
                </button>
                <button
                  onClick={() => setShowRejectModal(app)}
                  disabled={isActing}
                  className="bg-red-100 hover:bg-red-200 text-red-700 text-xs font-bold px-4 py-2 rounded-xl transition-colors disabled:opacity-50 flex items-center gap-1"
                >
                  ❌ Reject
                </button>
              </>
            )}
            {app.status === 'Approved' && (
              <span className="bg-green-100 text-green-700 text-xs font-bold px-4 py-2 rounded-xl">✅ Approved</span>
            )}
            {app.status === 'Rejected' && (
              <span className="bg-red-100 text-red-700 text-xs font-bold px-4 py-2 rounded-xl">❌ Rejected</span>
            )}
          </div>
        </div>

        {app.statusHistory?.length > 0 && (
          <div className="mt-3 pt-3 border-t border-gray-100">
            <p className="text-xs text-gray-400 mb-1.5 font-semibold">Status History</p>
            <div className="flex gap-3 flex-wrap">
              {app.statusHistory.map((h, i) => (
                <div key={i} className="flex items-center gap-1.5 text-xs text-gray-500">
                  <span className={`w-1.5 h-1.5 rounded-full ${i === app.statusHistory.length - 1 ? 'bg-blue-500' : 'bg-gray-300'}`} />
                  <span className="font-medium">{h.status}</span>
                  <span className="text-gray-400">{h.date}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-900 to-indigo-900 text-white py-7 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <button onClick={() => router.push('/admin')}
            className="text-white/70 hover:text-white text-sm mb-3 flex items-center gap-1 transition-colors">
            ← Admin Portal
          </button>
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-2xl font-extrabold">📋 Applications Manager</h1>
              <p className="text-blue-200 text-sm">
                {adminInfo?.emoji} {adminInfo?.stateName} · Approve or Reject scheme applications
              </p>
            </div>
            <div className="flex gap-3 flex-wrap">
              {[
                { label: 'Pending',  val: pendingCount,        color: 'bg-yellow-500/20' },
                { label: 'Approved', val: approvedCount,       color: 'bg-green-500/20' },
                { label: 'Rejected', val: rejectedCount,       color: 'bg-red-500/20' },
                { label: 'Total',    val: applications.length, color: 'bg-white/10' },
              ].map(s => (
                <div key={s.label} className={`${s.color} rounded-xl px-4 py-2 text-center`}>
                  <p className="text-xl font-bold">{s.val}</p>
                  <p className="text-xs text-blue-200">{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">

        {/* Search & Filter */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 mb-5 flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">🔍</span>
            <input type="text" placeholder="Search by name, ref no., district, mobile..."
              value={search} onChange={e => setSearch(e.target.value)}
              className="form-input pl-9 py-2 text-sm w-full" />
          </div>
          <div className="flex gap-1.5 flex-wrap">
            {statuses.map(s => (
              <button key={s} onClick={() => setFilterStatus(s)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap ${
                  filterStatus === s ? 'bg-blue-700 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}>
                {s}
              </button>
            ))}
          </div>
          <div className="flex gap-1.5 flex-wrap">
            <button onClick={() => setView('scheme')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold ${view === 'scheme' ? 'bg-gray-800 text-white' : 'bg-gray-100 text-gray-600'}`}>
              By Scheme
            </button>
            <button onClick={() => setView('district')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold ${view === 'district' ? 'bg-gray-800 text-white' : 'bg-gray-100 text-gray-600'}`}>
              By District
            </button>
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center text-gray-400">
            <div className="text-5xl mb-3">📋</div>
            <p className="font-medium">{applications.length === 0 ? 'No applications submitted yet.' : 'No results found.'}</p>
          </div>
        ) : view === 'scheme' ? (
          /* BY SCHEME VIEW */
          <div className="space-y-4">
            {Object.values(byScheme).map(({ schemeName, items }) => (
              <div key={schemeName} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <button
                  onClick={() => setExpandedScheme(expandedScheme === schemeName ? null : schemeName)}
                  className="w-full flex items-center justify-between p-5 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xl">🏛️</span>
                    <div className="text-left">
                      <p className="font-bold text-gray-800">{schemeName}</p>
                      <p className="text-xs text-gray-500">
                        {items.filter(i => i.status === 'Under Review' || i.status === 'Application Received').length} pending ·{' '}
                        {items.filter(i => i.status === 'Approved').length} approved ·{' '}
                        {items.filter(i => i.status === 'Rejected').length} rejected
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="bg-blue-100 text-blue-700 text-xs font-bold px-2.5 py-1 rounded-full">
                      {items.length} applications
                    </span>
                    <span className="text-gray-400">{expandedScheme === schemeName ? '▲' : '▼'}</span>
                  </div>
                </button>

                {expandedScheme === schemeName && (
                  <div className="border-t border-gray-100 p-4 space-y-3 bg-gray-50">
                    {Object.entries(
                      items.reduce((acc, a) => {
                        const d = a.district || '—';
                        if (!acc[d]) acc[d] = [];
                        acc[d].push(a);
                        return acc;
                      }, {})
                    ).map(([district, distApps]) => (
                      <div key={district}>
                        <button
                          onClick={() => setExpandedDistrict(expandedDistrict === schemeName + district ? null : schemeName + district)}
                          className="flex items-center gap-2 text-sm font-bold text-gray-700 hover:text-blue-700 mb-2 w-full text-left"
                        >
                          <span>📍 {district}</span>
                          <span className="bg-gray-200 text-gray-600 text-xs px-2 py-0.5 rounded-full">{distApps.length}</span>
                          <span className="text-gray-400 text-xs ml-auto">{expandedDistrict === schemeName + district ? '▲' : '▼'}</span>
                        </button>

                        {expandedDistrict === schemeName + district && (
                          <div className="space-y-2 pl-4">
                            {Object.entries(
                              distApps.reduce((acc, a) => {
                                const c = a.city || '—';
                                if (!acc[c]) acc[c] = [];
                                acc[c].push(a);
                                return acc;
                              }, {})
                            ).map(([city, cityApps]) => (
                              <div key={city}>
                                <p className="text-xs font-semibold text-gray-500 mb-1.5 flex items-center gap-1.5">
                                  🏙️ {city}
                                  {cityApps[0]?.pincode && cityApps[0].pincode !== '—' && (
                                    <span className="bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded text-xs">📮 {cityApps[0].pincode}</span>
                                  )}
                                </p>
                                <div className="space-y-2">
                                  {cityApps.map(app => <AppCard key={app.refNo} app={app} />)}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          /* BY DISTRICT VIEW */
          <div className="space-y-4">
            {Object.values(byDistrict).map(({ district, items }) => (
              <div key={district} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <button
                  onClick={() => setExpandedDistrict(expandedDistrict === district ? null : district)}
                  className="w-full flex items-center justify-between p-5 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xl">📍</span>
                    <div className="text-left">
                      <p className="font-bold text-gray-800">{district}</p>
                      <p className="text-xs text-gray-500">
                        {[...new Set(items.map(i => i.schemeName))].length} scheme(s)
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="bg-blue-100 text-blue-700 text-xs font-bold px-2.5 py-1 rounded-full">
                      {items.length} applications
                    </span>
                    <span className="text-gray-400">{expandedDistrict === district ? '▲' : '▼'}</span>
                  </div>
                </button>

                {expandedDistrict === district && (
                  <div className="border-t border-gray-100 p-4 space-y-2 bg-gray-50">
                    {items.map(app => <AppCard key={app.refNo} app={app} />)}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Details Modal */}
      {detailModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setDetailModal(null)}>
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className={`p-5 border-b border-gray-100 flex items-start justify-between ${
              detailModal.status === 'Approved' ? 'bg-green-50' :
              detailModal.status === 'Rejected' ? 'bg-red-50' : 'bg-blue-50'
            }`}>
              <div>
                <h3 className="font-bold text-gray-800 text-lg">Application Details</h3>
                <p className="text-sm text-gray-500 mt-0.5">{detailModal.schemeName}</p>
              </div>
              <button onClick={() => setDetailModal(null)} className="text-gray-400 hover:text-gray-600 text-2xl leading-none">×</button>
            </div>

            <div className="p-5 space-y-5">
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-2">Applicant Information</p>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    ['Full Name',   detailModal.applicantName],
                    ['Mobile',      detailModal.mobile],
                    ['Aadhaar',     detailModal.aadhaar && detailModal.aadhaar !== '—' ? detailModal.aadhaar.slice(0,4) + ' **** ' + detailModal.aadhaar.slice(-4) : '—'],
                    ['PAN',         detailModal.pan && detailModal.pan !== '—' ? detailModal.pan.slice(0,5) + 'XXXXX' : '—'],
                  ].map(([k, v]) => (
                    <div key={k} className="bg-gray-50 rounded-xl p-3">
                      <p className="text-xs text-gray-400 mb-0.5">{k}</p>
                      <p className="font-semibold text-gray-800 text-sm">{v || '—'}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-2">Address</p>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    ['District',     detailModal.district],
                    ['City/Village', detailModal.city],
                    ['Pincode',      detailModal.pincode],
                    ['State',        detailModal.stateName],
                  ].map(([k, v]) => (
                    <div key={k} className="bg-gray-50 rounded-xl p-3">
                      <p className="text-xs text-gray-400 mb-0.5">{k}</p>
                      <p className="font-semibold text-gray-800 text-sm">{v || '—'}</p>
                    </div>
                  ))}
                  {detailModal.address && detailModal.address !== '—' && (
                    <div className="col-span-2 bg-gray-50 rounded-xl p-3">
                      <p className="text-xs text-gray-400 mb-0.5">Full Address</p>
                      <p className="font-semibold text-gray-800 text-sm">{detailModal.address}</p>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-2">Application Info</p>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    ['Ref. Number',  detailModal.refNo],
                    ['Submitted On', new Date(detailModal.submittedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })],
                  ].map(([k, v]) => (
                    <div key={k} className="bg-gray-50 rounded-xl p-3">
                      <p className="text-xs text-gray-400 mb-0.5">{k}</p>
                      <p className="font-semibold text-gray-800 text-sm font-mono">{v}</p>
                    </div>
                  ))}
                </div>
              </div>

              {detailModal.statusHistory?.length > 0 && (
                <div>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-3">Status Timeline</p>
                  <div className="space-y-3">
                    {detailModal.statusHistory.map((h, i) => {
                      const isLast     = i === detailModal.statusHistory.length - 1;
                      const isRejected = h.status === 'Rejected';
                      return (
                        <div key={i} className="flex gap-3">
                          <div className="flex flex-col items-center">
                            <div className={`w-3 h-3 rounded-full mt-0.5 flex-shrink-0 ${
                              isRejected ? 'bg-red-500' : isLast ? 'bg-blue-500' : 'bg-green-500'
                            }`} />
                            {i < detailModal.statusHistory.length - 1 && (
                              <div className="w-0.5 flex-1 bg-gray-200 mt-1 min-h-4" />
                            )}
                          </div>
                          <div className={`pb-2 flex-1 ${isRejected ? 'bg-red-50 -mx-1 px-2 py-1 rounded-lg' : ''}`}>
                            <p className={`text-sm font-semibold ${isRejected ? 'text-red-700' : 'text-gray-800'}`}>{h.status}</p>
                            <p className="text-xs text-gray-500">{h.date}</p>
                            {h.note && <p className={`text-xs mt-0.5 ${isRejected ? 'text-red-600 font-medium' : 'text-gray-500'}`}>{h.note}</p>}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            <div className="px-5 pb-5">
              <button onClick={() => setDetailModal(null)}
                className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-2.5 rounded-xl transition-colors text-sm">
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6">
            <h3 className="font-bold text-gray-800 mb-1">Reject Application?</h3>
            <p className="text-sm text-gray-500 mb-4">
              <strong>{showRejectModal.applicantName}</strong> — {showRejectModal.schemeName}
            </p>
            <div className="mb-4">
              <label className="form-label">Reason for Rejection <span className="text-gray-400 font-normal">(optional)</span></label>
              <textarea
                value={rejectNote}
                onChange={e => setRejectNote(e.target.value)}
                rows={3}
                placeholder="e.g. Ineligible age, documents missing..."
                className="form-input resize-none text-sm"
              />
            </div>
            <div className="flex gap-3">
              <button onClick={() => { setShowRejectModal(null); setRejectNote(''); }}
                className="flex-1 border-2 border-gray-300 text-gray-700 py-2.5 rounded-xl font-semibold text-sm hover:bg-gray-50">
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
