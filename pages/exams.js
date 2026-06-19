import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import prisma from '../lib/prisma';
import SchemeCard from '../components/SchemeCard';

export async function getServerSideProps() {
  const [centralExams, statesWithExams, allStates] = await Promise.all([
    prisma.exam.findMany({ where: { scope: 'central' }, orderBy: { createdAt: 'asc' } }),
    prisma.exam.findMany({
      where: { scope: 'state' },
      select: { stateId: true },
      distinct: ['stateId'],
    }),
    prisma.state.findMany({ orderBy: { name: 'asc' } }),
  ]);
  const stateIdsWithExams = statesWithExams.map(e => e.stateId).filter(Boolean);
  const statesData = allStates.filter(s => stateIdsWithExams.includes(s.id));
  return {
    props: JSON.parse(JSON.stringify({
      centralExams,
      statesData,
      stateIdsWithExams,
      totalStateExams: await prisma.exam.count({ where: { scope: 'state' } }),
      allStates,
    })),
  };
}

export default function ExamsPage({ centralExams, statesData, stateIdsWithExams, totalStateExams, allStates }) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('central');
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [selectedState, setSelectedState] = useState(null);
  const [stateExams, setStateExams] = useState([]);
  const [loadingState, setLoadingState] = useState(false);

  useEffect(() => {
    if (!selectedState) { setStateExams([]); return; }
    setLoadingState(true);
    fetch(`/api/exams?stateId=${selectedState}`)
      .then(r => r.json())
      .then(data => { setStateExams(Array.isArray(data) ? data : []); setLoadingState(false); })
      .catch(() => setLoadingState(false));
  }, [selectedState]);

  const categories = ['All', ...new Set(centralExams.map((e) => e.category).filter(Boolean))];

  const filteredCentral = centralExams.filter((e) => {
    const matchSearch =
      e.name.toLowerCase().includes(search.toLowerCase()) ||
      (e.conductedBy || '').toLowerCase().includes(search.toLowerCase()) ||
      (e.category || '').toLowerCase().includes(search.toLowerCase());
    const matchCat = categoryFilter === 'All' || e.category === categoryFilter;
    return matchSearch && matchCat;
  });

  const filteredStateExams = stateExams.filter((e) =>
    e.name.toLowerCase().includes(search.toLowerCase()) ||
    (e.category || '').toLowerCase().includes(search.toLowerCase()) ||
    (e.conductedBy || '').toLowerCase().includes(search.toLowerCase())
  );

  const selectedStateData = selectedState
    ? allStates.find((s) => s.id === selectedState)
    : null;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-700 to-indigo-700 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl md:text-4xl font-extrabold mb-2">📝 Competitive Exams</h1>
          <p className="text-blue-100">Central & State-wise exams — UPSC, SSC, PSC, Police, Banking, Railway and more</p>

          <div className="flex gap-4 mt-6 flex-wrap">
            <div className="bg-white/20 rounded-xl px-4 py-2 text-center">
              <p className="text-xl font-bold">{centralExams.length}</p>
              <p className="text-xs text-blue-100">Central Exams</p>
            </div>
            <div className="bg-white/20 rounded-xl px-4 py-2 text-center">
              <p className="text-xl font-bold">{stateIdsWithExams.length}</p>
              <p className="text-xs text-blue-100">States with Exams</p>
            </div>
            <div className="bg-white/20 rounded-xl px-4 py-2 text-center">
              <p className="text-xl font-bold">{totalStateExams}</p>
              <p className="text-xs text-blue-100">State Exams</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tabs */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <div className="flex gap-1 bg-gray-200 rounded-xl p-1">
            <button
              onClick={() => { setActiveTab('central'); setSearch(''); setCategoryFilter('All'); setSelectedState(null); }}
              className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all flex items-center gap-2 ${
                activeTab === 'central' ? 'bg-white text-blue-700 shadow-sm' : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              🇮🇳 Central Exams
              <span className={`badge ${activeTab === 'central' ? 'bg-blue-100 text-blue-700' : 'bg-gray-300 text-gray-600'}`}>
                {centralExams.length}
              </span>
            </button>
            <button
              onClick={() => { setActiveTab('state'); setSearch(''); setCategoryFilter('All'); }}
              className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all flex items-center gap-2 ${
                activeTab === 'state' ? 'bg-white text-blue-700 shadow-sm' : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              🗺️ State Exams
              <span className={`badge ${activeTab === 'state' ? 'bg-blue-100 text-blue-700' : 'bg-gray-300 text-gray-600'}`}>
                {stateIdsWithExams.length} States
              </span>
            </button>
          </div>

          <div className="flex-1 relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">🔍</span>
            <input
              type="text"
              placeholder={activeTab === 'central' ? 'Search central exams...' : selectedState ? `Search ${selectedStateData?.name} exams...` : 'Search state exams...'}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="form-input pl-10"
            />
          </div>
        </div>

        {/* CENTRAL EXAMS TAB */}
        {activeTab === 'central' && (
          <>
            <div className="flex gap-2 flex-wrap mb-6">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setCategoryFilter(cat)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                    categoryFilter === cat
                      ? 'bg-blue-700 text-white shadow-sm'
                      : 'bg-white text-gray-600 border border-gray-200 hover:bg-blue-50 hover:text-blue-700'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {filteredCentral.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {filteredCentral.map((exam) => (
                  <SchemeCard key={exam.id} scheme={exam} stateId="central" type="exam" />
                ))}
              </div>
            ) : (
              <div className="text-center py-20 text-gray-400">
                <div className="text-5xl mb-4">🔍</div>
                <p className="font-medium">No exams found for &quot;{search}&quot;</p>
              </div>
            )}
          </>
        )}

        {/* STATE EXAMS TAB */}
        {activeTab === 'state' && (
          <>
            {!selectedState ? (
              <>
                <p className="text-sm text-gray-500 mb-5">
                  Select a state to view its competitive exams — PSC, Police, Teacher recruitment and more.
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                  {statesData.map((state) => (
                    <div
                      key={state.id}
                      onClick={() => setSelectedState(state.id)}
                      className="card-hover bg-white rounded-2xl overflow-hidden shadow-md border border-gray-100 cursor-pointer"
                    >
                      <div className={`bg-gradient-to-br ${state.color} h-24 flex flex-col items-center justify-center`}>
                        <span className="text-4xl">{state.emoji}</span>
                      </div>
                      <div className="p-3">
                        <h3 className="font-bold text-gray-800 text-sm leading-tight mb-0.5">{state.name}</h3>
                        <div className="flex items-center justify-between mt-2">
                          <div className="flex items-center gap-1">
                            <span className="w-2 h-2 bg-blue-500 rounded-full" />
                            <span className="text-xs text-gray-500">Exams</span>
                          </div>
                          <span className="text-blue-500 text-xs font-semibold">View →</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-8 bg-blue-50 border border-blue-100 rounded-2xl p-5">
                  <h3 className="font-bold text-blue-800 mb-2">📌 More States Coming Soon</h3>
                  <div className="flex flex-wrap gap-2">
                    {allStates
                      .filter((s) => !stateIdsWithExams.includes(s.id))
                      .map((s) => (
                        <span key={s.id} className="bg-white border border-blue-100 text-gray-500 text-xs px-2.5 py-1 rounded-full">
                          {s.emoji} {s.name}
                        </span>
                      ))}
                  </div>
                </div>
              </>
            ) : (
              <>
                <div className="flex items-center gap-3 mb-6">
                  <button
                    onClick={() => { setSelectedState(null); setSearch(''); }}
                    className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 px-4 py-2 rounded-lg transition-colors font-medium"
                  >
                    ← All States
                  </button>
                  {selectedStateData && (
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{selectedStateData.emoji}</span>
                      <div>
                        <h2 className="font-bold text-gray-800">{selectedStateData.name} Exams</h2>
                        <p className="text-xs text-gray-500">{filteredStateExams.length} exam(s) available</p>
                      </div>
                    </div>
                  )}
                </div>

                {loadingState ? (
                  <div className="text-center py-20">
                    <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto" />
                  </div>
                ) : filteredStateExams.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                    {filteredStateExams.map((exam) => (
                      <SchemeCard key={exam.id} scheme={exam} stateId={selectedState} type="exam" />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-20 text-gray-400">
                    <div className="text-5xl mb-4">🔍</div>
                    <p className="font-medium">
                      {search ? `No exams found for "${search}"` : 'No exams available yet for this state.'}
                    </p>
                  </div>
                )}

                <div className="mt-8 bg-amber-50 border border-amber-100 rounded-2xl p-4 flex gap-3">
                  <span className="text-xl">💡</span>
                  <div>
                    <p className="text-sm font-semibold text-amber-800">Also check State Schemes page</p>
                    <p className="text-xs text-amber-700 mt-0.5">
                      More {selectedStateData?.name} exams may also be listed under the State Schemes → State Exams tab.
                    </p>
                    <button
                      onClick={() => router.push(`/state/${selectedState}`)}
                      className="text-xs text-amber-700 underline mt-1 hover:text-amber-900"
                    >
                      Go to {selectedStateData?.name} page →
                    </button>
                  </div>
                </div>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}
