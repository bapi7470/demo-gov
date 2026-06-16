import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { states, unionTerritories } from '../../data/states';
import { getStateSchemesWithCentral } from '../../data/schemes';
import { stateExams } from '../../data/exams';
import { centralScholarships, stateScholarships } from '../../data/scholarships';
import { centralTenders, stateTenders } from '../../data/tenders';
import SchemeCard from '../../components/SchemeCard';

const STATUS_STYLES = {
  'Under Review':         { bg: 'bg-yellow-50 border-yellow-200', badge: 'bg-yellow-100 text-yellow-800', icon: '🔍' },
  'Documents Pending':    { bg: 'bg-orange-50 border-orange-200', badge: 'bg-orange-100 text-orange-800', icon: '📎' },
  'Pending Verification': { bg: 'bg-blue-50 border-blue-200',     badge: 'bg-blue-100 text-blue-800',     icon: '⏳' },
  'Application Received': { bg: 'bg-green-50 border-green-200',   badge: 'bg-green-100 text-green-800',   icon: '✅' },
  'Approved':             { bg: 'bg-green-50 border-green-200',   badge: 'bg-green-100 text-green-800',   icon: '✅' },
  'Rejected':             { bg: 'bg-red-50 border-red-200',       badge: 'bg-red-100 text-red-800',       icon: '❌' },
};

export default function StateSchemesPage() {
  const router = useRouter();
  const { stateId } = router.query;

  const [activeTab, setActiveTab] = useState('state');
  const [searchQuery, setSearchQuery] = useState('');
  const [trackRef, setTrackRef] = useState('');
  const [trackResult, setTrackResult] = useState(null);
  const [trackError, setTrackError] = useState('');
  const [customStateSchemes, setCustomStateSchemes] = useState([]);
  const [customStateExams, setCustomStateExams] = useState([]);

  useEffect(() => {
    if (!stateId) return;
    async function loadCustom() {
      try {
        const res = await fetch(`/api/schemes?stateId=${stateId}`);
        if (res.ok) {
          const data = await res.json();
          setCustomStateSchemes(data.schemes || []);
          setCustomStateExams(data.exams || []);
        }
      } catch (_) {}
    }
    loadCustom();
  }, [stateId]);

  if (!stateId) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const stateData = [...states, ...unionTerritories].find((s) => s.id === stateId);

  if (!stateData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">😕</div>
          <h2 className="text-2xl font-bold text-gray-700 mb-2">State not found</h2>
          <button onClick={() => router.push('/states')} className="btn-primary mt-4">← Back to States</button>
        </div>
      </div>
    );
  }

  const { central: centralSchemes, state: stateSpecificSchemes } = getStateSchemesWithCentral(stateId);

  // Custom overrides same-ID built-in items
  const customSchemeIds = new Set(customStateSchemes.map(s => s.id));
  const customExamIds   = new Set(customStateExams.map(e => e.id));
  const stateExamList   = [
    ...(stateExams[stateId] || []).filter(e => !customExamIds.has(e.id)),
    ...customStateExams,
  ];
  const scholarshipList = [...centralScholarships, ...(stateScholarships[stateId] || [])];
  const tenderList      = [...centralTenders, ...(stateTenders[stateId] || [])];

  const tabs = [
    { id: 'state',       label: '🏛️ State Schemes',    count: stateSpecificSchemes.length + customStateSchemes.length },
    { id: 'central',     label: '🇮🇳 Central Schemes',  count: centralSchemes.length },
    { id: 'exams',       label: '📝 State Exams',       count: stateExamList.length },
    { id: 'scholarship', label: '🎓 Scholarships',      count: scholarshipList.length },
    { id: 'tender',      label: '📋 Tenders',           count: tenderList.length },
    { id: 'track',       label: '🔍 Track Application', count: null },
  ];

  const handleTrack = async () => {
    setTrackError('');
    setTrackResult(null);
    const ref = trackRef.trim().toUpperCase();
    if (!ref) { setTrackError('Please enter a Reference Number.'); return; }
    try {
      const res = await fetch(`/api/applications?refNo=${encodeURIComponent(ref)}`);
      if (res.ok) {
        const data = await res.json();
        if (data.application) setTrackResult(data.application);
        else setTrackError(`No application found for Reference Number: ${ref}`);
      } else {
        setTrackError(`No application found for Reference Number: ${ref}`);
      }
    } catch { setTrackError('Error searching. Please try again.'); }
  };

  // Custom overrides same-ID static schemes
  const mergedStateSchemes = [
    ...stateSpecificSchemes.filter(s => !customSchemeIds.has(s.id)),
    ...customStateSchemes,
  ];

  const currentItems =
    activeTab === 'state'       ? mergedStateSchemes :
    activeTab === 'central'     ? centralSchemes :
    activeTab === 'exams'       ? stateExamList :
    activeTab === 'scholarship' ? scholarshipList :
    activeTab === 'tender'      ? tenderList :
    [];

  const filtered = currentItems.filter((s) =>
    s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className={`bg-gradient-to-br ${stateData.color} text-white py-12`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <button
            onClick={() => router.push('/states')}
            className="inline-flex items-center gap-2 text-white/80 hover:text-white text-sm mb-6 transition-colors"
          >
            ← Back to All States
          </button>

          <div className="flex items-center gap-5">
            <div className="text-6xl">{stateData.emoji}</div>
            <div>
              <h1 className="text-3xl md:text-4xl font-extrabold">{stateData.name}</h1>
              <p className="text-white/80 mt-1">Capital: {stateData.capital} · Region: {stateData.region}</p>
              <div className="flex gap-3 mt-3 flex-wrap">
                <span className="bg-white/20 backdrop-blur text-sm px-3 py-1 rounded-full">
                  {stateSpecificSchemes.length} State Schemes
                </span>
                <span className="bg-white/20 backdrop-blur text-sm px-3 py-1 rounded-full">
                  {centralSchemes.length} Central Schemes
                </span>
                <span className="bg-white/20 backdrop-blur text-sm px-3 py-1 rounded-full">
                  {stateExamList.length} State Exams
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tabs & Search */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <div className="flex gap-1 bg-gray-200 rounded-xl p-1 flex-wrap">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => { setActiveTab(tab.id); setSearchQuery(''); }}
                className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all flex items-center gap-1.5 ${
                  activeTab === tab.id ? 'bg-white text-orange-600 shadow-sm' : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                {tab.label}
                {tab.count !== null && (
                  <span className={`badge ${activeTab === tab.id ? 'bg-orange-100 text-orange-600' : 'bg-gray-300 text-gray-600'}`}>
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </div>

          {activeTab !== 'track' && (
            <div className="flex-1 relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">🔍</span>
              <input
                type="text"
                placeholder="Search schemes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="form-input pl-9 py-2 text-sm"
              />
            </div>
          )}
        </div>

        {activeTab === 'state' && stateSpecificSchemes.length === 0 && (
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-8 text-center mb-8">
            <div className="text-4xl mb-3">🔄</div>
            <h3 className="font-bold text-amber-800 mb-2">State-specific schemes coming soon</h3>
            <p className="text-amber-700 text-sm">
              Browse Central Government schemes available for {stateData.name} residents below.
            </p>
            <button onClick={() => setActiveTab('central')} className="btn-primary mt-4 text-sm">
              View Central Schemes →
            </button>
          </div>
        )}

        {activeTab !== 'track' && (
          filtered.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {filtered.map((item) => (
                <SchemeCard
                  key={item.id}
                  scheme={item}
                  stateId={activeTab === 'central' ? 'central' : stateId}
                  type={activeTab === 'exams' ? 'exam' : 'scheme'}
                />
              ))}
            </div>
          ) : searchQuery ? (
            <div className="text-center py-20 text-gray-500">
              <div className="text-5xl mb-4">🔍</div>
              <p className="font-medium">No results for "{searchQuery}"</p>
            </div>
          ) : null
        )}

        {/* Track Application Tab */}
        {activeTab === 'track' && (
          <div className="max-w-2xl mx-auto">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 md:p-8">
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-3xl">🔍</span>
                </div>
                <h2 className="text-xl font-extrabold text-gray-800">Track Your Application</h2>
                <p className="text-gray-500 text-sm mt-1">
                  Enter the Reference Number you received after submitting your application.
                </p>
              </div>

              <div className="flex gap-3 mb-2">
                <input
                  type="text"
                  value={trackRef}
                  onChange={e => { setTrackRef(e.target.value.toUpperCase()); setTrackError(''); setTrackResult(null); }}
                  onKeyDown={e => e.key === 'Enter' && handleTrack()}
                  placeholder="e.g. GOV58102263"
                  className="form-input flex-1 font-mono text-lg tracking-widest text-center uppercase"
                  maxLength={15}
                />
                <button
                  onClick={handleTrack}
                  className="bg-blue-700 hover:bg-blue-800 text-white font-bold px-6 py-2.5 rounded-xl transition-colors text-sm flex items-center gap-2"
                >
                  🔍 Search
                </button>
              </div>

              {trackError && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-3 mt-3 text-red-700 text-sm text-center">
                  ❌ {trackError}
                </div>
              )}

              {trackResult && (() => {
                const st = STATUS_STYLES[trackResult.status] || STATUS_STYLES['Under Review'];
                return (
                  <div className={`mt-5 rounded-2xl border-2 ${st.bg} p-5`}>
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <p className="text-xs text-gray-500 font-medium">Reference Number</p>
                        <p className="text-lg font-extrabold text-gray-800 font-mono">{trackResult.refNo}</p>
                      </div>
                      <span className={`${st.badge} text-sm font-bold px-3 py-1.5 rounded-full flex items-center gap-1.5`}>
                        {st.icon} {trackResult.status}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-3 mb-4">
                      {[
                        ['Scheme / Exam', trackResult.schemeName],
                        ['Applicant Name', trackResult.applicantName],
                        ['Mobile', trackResult.mobile],
                        ['Type', trackResult.type === 'exam' ? '📝 Exam Application' : '🏛️ Scheme Application'],
                        ['State', trackResult.stateName],
                        ['Submitted On', new Date(trackResult.submittedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })],
                      ].map(([k, v]) => (
                        <div key={k} className="bg-white/70 rounded-xl p-3">
                          <p className="text-xs text-gray-400">{k}</p>
                          <p className="text-sm font-semibold text-gray-800 mt-0.5">{v}</p>
                        </div>
                      ))}
                    </div>

                    <div className="bg-white/80 rounded-xl p-4">
                      <p className="text-xs font-bold text-gray-600 uppercase tracking-wide mb-3">Status Timeline</p>
                      <div className="space-y-3">
                        {trackResult.statusHistory?.map((h, i) => (
                          <div key={i} className="flex gap-3">
                            <div className="flex flex-col items-center">
                              <div className={`w-3 h-3 rounded-full mt-0.5 flex-shrink-0 ${i === trackResult.statusHistory.length - 1 ? 'bg-blue-600' : 'bg-green-500'}`} />
                              {i < trackResult.statusHistory.length - 1 && <div className="w-0.5 h-full bg-gray-200 mt-1" />}
                            </div>
                            <div className="pb-3">
                              <p className="text-sm font-semibold text-gray-800">{h.status}</p>
                              <p className="text-xs text-gray-500">{h.date} · {h.note}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="mt-4 bg-white/60 rounded-xl p-3 text-center">
                      <p className="text-xs text-gray-500">
                        💡 For queries, contact the concerned department with your Reference Number.
                      </p>
                    </div>
                  </div>
                );
              })()}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
