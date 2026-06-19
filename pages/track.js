import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import prisma from '../lib/prisma';

export async function getServerSideProps() {
  const [states, unionTerritories] = await Promise.all([
    prisma.state.findMany({ where: { type: 'state' }, orderBy: { name: 'asc' } }),
    prisma.state.findMany({ where: { type: 'union_territory' }, orderBy: { name: 'asc' } }),
  ]);
  return { props: JSON.parse(JSON.stringify({ states, unionTerritories })) };
}

const STATUS_CONFIG = {
  'Under Review':         { bg: 'bg-yellow-50 border-yellow-300', badge: 'bg-yellow-100 text-yellow-800', dot: 'bg-yellow-500', icon: '🔍', msg: 'Your application is currently under review. Documents are being verified.' },
  'Application Received': { bg: 'bg-blue-50 border-blue-300',    badge: 'bg-blue-100 text-blue-800',    dot: 'bg-blue-500',   icon: '✅', msg: 'Your application has been received and is awaiting review.' },
  'Documents Pending':    { bg: 'bg-orange-50 border-orange-300', badge: 'bg-orange-100 text-orange-800', dot: 'bg-orange-500', icon: '📎', msg: 'Additional documents are required. Please submit them to proceed.' },
  'Approved':             { bg: 'bg-green-50 border-green-300',   badge: 'bg-green-100 text-green-800',  dot: 'bg-green-500',  icon: '🎉', msg: 'Congratulations! Your application has been approved. Benefits will be credited shortly.' },
  'Rejected':             { bg: 'bg-red-50 border-red-300',       badge: 'bg-red-100 text-red-800',     dot: 'bg-red-500',    icon: '❌', msg: 'Your application has been rejected.' },
};

// No auth required for this page
export default function TrackApplicationPage({ states, unionTerritories }) {
  const allStates = [...states, ...unionTerritories];
  const router = useRouter();
  const [step, setStep] = useState('states'); // states | schemes | input | result
  const [selectedState, setSelectedState] = useState(null);
  const [selectedScheme, setSelectedScheme] = useState(null);
  const [refInput, setRefInput] = useState('');
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [schemeList, setSchemeList] = useState([]);
  const [stateSearch, setStateSearch] = useState('');
  const [schemeSearch, setSchemeSearch] = useState('');
  const [loading, setLoading] = useState(false);

  const stateData = selectedState ? allStates.find(s => s.id === selectedState) : null;

  // Load schemes when state selected — fetch from DB via API
  useEffect(() => {
    if (!selectedState) return;
    setSchemeList([]);
    Promise.all([
      fetch(`/api/schemes?scope=state&stateId=${selectedState}`).then(r => r.json()),
      fetch(`/api/schemes?scope=central`).then(r => r.json()),
      fetch(`/api/exams?scope=state&stateId=${selectedState}`).then(r => r.json()),
      fetch(`/api/scholarships?scope=state&stateId=${selectedState}`).then(r => r.json()),
      fetch(`/api/tenders?stateId=${selectedState}`).then(r => r.json()),
    ]).then(([stateSchemes, centralSchemes, exams, schols, tenders]) => {
      const all = [...(stateSchemes||[]), ...(centralSchemes||[]), ...(exams||[]), ...(schols||[]), ...(tenders||[])];
      const seen = new Set();
      setSchemeList(all.filter(s => { if (seen.has(s.id)) return false; seen.add(s.id); return true; }));
    }).catch(() => setSchemeList([]));
  }, [selectedState]);

  const handleSearch = async () => {
    setError('');
    setResult(null);
    const ref = refInput.trim().toUpperCase();
    if (!ref) { setError('Please enter a Reference Number.'); return; }

    setLoading(true);
    try {
      const res = await fetch('/api/applications/' + ref);
      if (res.ok) {
        const found = await res.json();
        // If a scheme is selected, verify the application belongs to it
        if (selectedScheme && found.schemeId !== selectedScheme.id) {
          setError(`No application found for Reference No: ${ref} under "${selectedScheme.name}"`);
        } else {
          setResult(found);
          setStep('result');
        }
      } else {
        setError(`No application found for Reference No: ${ref}${selectedScheme ? ` under "${selectedScheme.name}"` : ''}`);
      }
    } catch {
      setError('Failed to look up application. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const filteredStates = allStates.filter(s =>
    s.name.toLowerCase().includes(stateSearch.toLowerCase()) ||
    s.capital?.toLowerCase().includes(stateSearch.toLowerCase())
  );

  const filteredSchemes = schemeList.filter(s =>
    s.name.toLowerCase().includes(schemeSearch.toLowerCase()) ||
    s.category?.toLowerCase().includes(schemeSearch.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-700 to-indigo-800 text-white py-8 px-4">
        <div className="max-w-4xl mx-auto">
          <button onClick={() => router.push('/login')}
            className="text-white/70 hover:text-white text-sm mb-4 flex items-center gap-1 transition-colors">
            ← Back to Login
          </button>
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center text-3xl">🔍</div>
            <div>
              <h1 className="text-2xl font-extrabold">Track Your Application</h1>
              <p className="text-blue-200 text-sm mt-0.5">Check the status of your government scheme or exam application</p>
            </div>
          </div>

          {/* Breadcrumb */}
          <div className="flex items-center gap-2 mt-5 text-sm flex-wrap">
            <button onClick={() => { setStep('states'); setSelectedState(null); setSelectedScheme(null); setResult(null); setError(''); }}
              className={`transition-colors font-semibold ${step === 'states' ? 'text-white' : 'text-white/60 hover:text-white'}`}>
              🗺️ Select State
            </button>
            {selectedState && stateData && (
              <>
                <span className="text-white/30">›</span>
                <button onClick={() => { setStep('schemes'); setSelectedScheme(null); setResult(null); setError(''); }}
                  className={`transition-colors font-semibold ${step === 'schemes' ? 'text-white' : 'text-white/60 hover:text-white'}`}>
                  {stateData.emoji} {stateData.name}
                </button>
              </>
            )}
            {selectedScheme && (
              <>
                <span className="text-white/30">›</span>
                <button onClick={() => { setStep('input'); setResult(null); setError(''); }}
                  className={`transition-colors font-semibold ${step === 'input' || step === 'result' ? 'text-white' : 'text-white/60 hover:text-white'}`}>
                  {selectedScheme.icon} {selectedScheme.name}
                </button>
              </>
            )}
            {step === 'result' && <><span className="text-white/30">›</span><span className="text-white font-semibold">Result</span></>}
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">

        {/* STEP 1 — State Selection */}
        {step === 'states' && (
          <>
            <div className="mb-5">
              <h2 className="text-lg font-bold text-gray-700 mb-3">Select your State / UT</h2>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">🔍</span>
                <input type="text" value={stateSearch} onChange={e => setStateSearch(e.target.value)}
                  placeholder="Search state or capital..." className="form-input pl-9 w-full" />
              </div>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {filteredStates.map(state => (
                <div key={state.id}
                  onClick={() => { setSelectedState(state.id); setStep('schemes'); setSchemeSearch(''); }}
                  className="card-hover bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 cursor-pointer">
                  <div className={`bg-gradient-to-br ${state.color} h-20 flex items-center justify-center`}>
                    <span className="text-4xl">{state.emoji}</span>
                  </div>
                  <div className="p-3">
                    <p className="font-bold text-gray-800 text-sm leading-tight">{state.name}</p>
                    <p className="text-xs text-orange-600 font-semibold mt-1">Select →</p>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* STEP 2 — Scheme Selection */}
        {step === 'schemes' && stateData && (
          <>
            <div className="flex items-center gap-3 mb-5 flex-wrap">
              <button onClick={() => { setStep('states'); setSelectedState(null); }}
                className="text-sm text-blue-600 hover:text-blue-800 bg-blue-50 px-3 py-1.5 rounded-lg font-medium transition-colors">
                ← States
              </button>
              <div className="flex items-center gap-2">
                <span className="text-2xl">{stateData.emoji}</span>
                <h2 className="text-lg font-bold text-gray-700">{stateData.name} — Select Scheme / Exam</h2>
              </div>
            </div>

            <div className="relative mb-4">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">🔍</span>
              <input type="text" value={schemeSearch} onChange={e => setSchemeSearch(e.target.value)}
                placeholder="Search scheme, exam, scholarship..." className="form-input pl-9 w-full" />
            </div>

            {schemeList.length === 0 ? (
              <div className="bg-white rounded-2xl p-10 text-center text-gray-400 border border-gray-100">
                <div className="text-4xl mb-2">⏳</div><p>Loading schemes...</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {filteredSchemes.map(scheme => (
                  <div key={scheme.id}
                    onClick={() => { setSelectedScheme(scheme); setStep('input'); setRefInput(''); setError(''); setResult(null); }}
                    className="card-hover bg-white rounded-xl border-2 border-gray-100 p-4 shadow-sm cursor-pointer">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xl">{scheme.icon}</span>
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${scheme.badgeColor || 'bg-gray-100 text-gray-600'}`}>
                        {scheme.category}
                      </span>
                    </div>
                    <p className="font-bold text-gray-800 text-sm leading-tight">{scheme.name}</p>
                    {(scheme.nameLocal || scheme.nameBengali || scheme.nameHindi) && (
                      <p className="text-xs text-gray-400 mt-0.5 truncate">{scheme.nameLocal || scheme.nameBengali || scheme.nameHindi}</p>
                    )}
                    <p className="text-xs text-green-700 font-semibold mt-1">{scheme.benefit || scheme.estimatedValue}</p>
                    <p className="text-xs text-blue-600 font-semibold mt-2">Check Status →</p>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {/* STEP 3 — Reference Number Input */}
        {step === 'input' && selectedScheme && stateData && (
          <div className="max-w-lg mx-auto">
            <div className="flex items-center gap-3 mb-6 flex-wrap">
              <button onClick={() => setStep('schemes')}
                className="text-sm text-blue-600 hover:text-blue-800 bg-blue-50 px-3 py-1.5 rounded-lg font-medium transition-colors">
                ← Schemes
              </button>
            </div>

            <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100">
              {/* Scheme info header */}
              <div className={`border-b-2 ${selectedScheme.color || 'bg-gray-50 border-gray-200'} p-5`}>
                <div className="flex items-center gap-3">
                  <span className="text-3xl">{selectedScheme.icon}</span>
                  <div>
                    <p className="font-extrabold text-gray-800">{selectedScheme.name}</p>
                    <p className="text-xs text-gray-500">{stateData.emoji} {stateData.name} · {selectedScheme.category}</p>
                  </div>
                </div>
              </div>

              <div className="p-6">
                <h3 className="font-bold text-gray-800 text-lg mb-1">Enter Reference Number</h3>
                <p className="text-gray-500 text-sm mb-5">
                  You received this reference number after submitting your application.
                </p>

                <div className="space-y-4">
                  <div>
                    <label className="form-label">Reference Number *</label>
                    <input
                      type="text"
                      value={refInput}
                      onChange={e => { setRefInput(e.target.value.toUpperCase()); setError(''); }}
                      onKeyDown={e => e.key === 'Enter' && handleSearch()}
                      placeholder="e.g. GOV58102263"
                      className={`form-input text-center text-xl font-mono tracking-widest uppercase ${error ? 'border-red-400' : ''}`}
                      maxLength={15}
                      autoFocus
                    />
                    {error && (
                      <div className="mt-2 bg-red-50 border border-red-200 rounded-xl p-3 text-red-700 text-sm text-center">
                        ❌ {error}
                      </div>
                    )}
                  </div>

                  <button onClick={handleSearch} disabled={loading}
                    className="w-full bg-blue-700 hover:bg-blue-800 disabled:opacity-60 text-white font-bold py-3.5 rounded-xl transition-colors flex items-center justify-center gap-2 text-base">
                    {loading ? '⏳ Checking...' : '🔍 Check Status'}
                  </button>

                  <div className="bg-blue-50 rounded-xl p-3 text-xs text-blue-700 text-center">
                    💡 Reference number starts with <strong>GOV</strong> followed by numbers (e.g. GOV58102263)
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* STEP 4 — Result */}
        {step === 'result' && result && (() => {
          const cfg = STATUS_CONFIG[result.status] || STATUS_CONFIG['Under Review'];
          return (
            <div className="max-w-lg mx-auto">
              <div className="flex items-center gap-3 mb-6">
                <button onClick={() => { setStep('input'); setResult(null); }}
                  className="text-sm text-blue-600 hover:text-blue-800 bg-blue-50 px-3 py-1.5 rounded-lg font-medium transition-colors">
                  ← Check Again
                </button>
              </div>

              <div className={`rounded-3xl border-2 ${cfg.bg} overflow-hidden shadow-xl`}>
                {/* Status header */}
                <div className="p-6 text-center border-b border-current/10">
                  <div className="text-5xl mb-3">{cfg.icon}</div>
                  <h2 className="text-2xl font-extrabold text-gray-800 mb-1">
                    Application {result.status}
                  </h2>
                  <span className={`inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm font-bold ${cfg.badge}`}>
                    <span className={`w-2 h-2 rounded-full ${cfg.dot}`} />
                    {result.status}
                  </span>
                  <p className="text-gray-600 text-sm mt-3 max-w-sm mx-auto">{cfg.msg}</p>
                  {result.status === 'Rejected' && (() => {
                    const rejEntry = [...(result.statusHistory || [])].reverse().find(h => h.status === 'Rejected');
                    return rejEntry?.note ? (
                      <div className="mt-3 bg-red-100 border border-red-200 rounded-xl px-4 py-3 max-w-sm mx-auto text-left">
                        <p className="text-xs font-bold text-red-600 mb-1">Rejection Reason</p>
                        <p className="text-sm text-red-800">{rejEntry.note}</p>
                      </div>
                    ) : null;
                  })()}
                </div>

                {/* Details */}
                <div className="p-5 space-y-2 bg-white/60">
                  {[
                    ['Reference Number', result.refNo],
                    ['Scheme / Exam',    result.schemeName],
                    ['Applicant',        result.applicantName],
                    ['Mobile',           result.mobile],
                    ['District',         result.district],
                    ['State',            result.stateName],
                    ['Submitted On',     new Date(result.submittedAt).toLocaleDateString('en-IN', {day:'numeric',month:'long',year:'numeric'})],
                  ].map(([k,v]) => v && v !== '—' && (
                    <div key={k} className="flex justify-between items-center py-1.5 border-b border-gray-100 last:border-0">
                      <span className="text-xs text-gray-500 font-medium">{k}</span>
                      <span className="text-sm font-semibold text-gray-800 text-right max-w-48 truncate">{v}</span>
                    </div>
                  ))}
                </div>

                {/* Timeline */}
                {result.statusHistory?.length > 0 && (
                  <div className="p-5 bg-white/40 border-t border-current/10">
                    <p className="text-xs font-bold text-gray-600 uppercase tracking-wide mb-3">Status Timeline</p>
                    <div className="space-y-3">
                      {result.statusHistory.map((h, i) => (
                        <div key={i} className="flex gap-3">
                          <div className="flex flex-col items-center">
                            <div className={`w-3 h-3 rounded-full mt-0.5 flex-shrink-0 ${i === result.statusHistory.length-1 ? cfg.dot : 'bg-green-500'}`} />
                            {i < result.statusHistory.length-1 && <div className="w-0.5 flex-1 bg-gray-200 mt-1 min-h-4" />}
                          </div>
                          <div className="pb-2">
                            <p className="text-sm font-semibold text-gray-800">{h.status}</p>
                            <p className="text-xs text-gray-500">{h.date}{h.note && ` — ${h.note}`}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="p-4 bg-white/40 text-center">
                  <p className="text-xs text-gray-500">
                    For queries, contact the concerned department with Ref. No. <strong>{result.refNo}</strong>
                  </p>
                  <button onClick={() => { setStep('states'); setSelectedState(null); setSelectedScheme(null); setResult(null); setRefInput(''); }}
                    className="mt-3 text-blue-600 hover:text-blue-800 text-sm font-semibold underline">
                    Track Another Application →
                  </button>
                </div>
              </div>
            </div>
          );
        })()}
      </div>
    </div>
  );
}
