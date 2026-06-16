import { useState, useEffect } from 'react';
import { centralScholarships, stateScholarships } from '../data/scholarships';
import { states } from '../data/states';
import SchemeCard from '../components/SchemeCard';

const allStateSchols = Object.entries(stateScholarships).flatMap(([stateId, list]) =>
  list.map(s => ({ ...s, _stateId: stateId }))
);

export default function ScholarshipsPage() {
  const [search, setSearch]   = useState('');
  const [catFilter, setCat]   = useState('All');
  const [stateFilter, setStateFilter] = useState('All');
  const [customSchols, setCustomSchols] = useState([]);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch('/api/schemes?type=custom_scholarships');
        if (res.ok) {
          const data = await res.json();
          setCustomSchols((data.scholarships || []).map(s => ({ ...s, _stateId: s.stateId || 'central' })));
        }
      } catch (_) {}
    }
    load();
  }, []);

  const allScholarships = [
    ...centralScholarships.map(s => ({ ...s, _stateId: 'central' })),
    ...allStateSchols,
    ...customSchols,
  ];

  const categories = ['All', ...new Set(allScholarships.map(s => s.subcategory || 'Central'))];

  const filtered = allScholarships.filter(s => {
    const matchSearch = s.name.toLowerCase().includes(search.toLowerCase()) ||
      (s.nameBengali || '').includes(search) ||
      s.eligibility.toLowerCase().includes(search.toLowerCase());
    const matchCat   = catFilter === 'All' || (s.subcategory || 'Central') === catFilter;
    const matchState = stateFilter === 'All' ||
      (s._stateId === 'central' && stateFilter === 'Central') ||
      states.find(st => st.id === s._stateId)?.name === stateFilter;
    return matchSearch && matchCat && matchState;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gradient-to-r from-blue-700 to-indigo-800 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl md:text-4xl font-extrabold mb-2">🎓 Scholarships</h1>
          <p className="text-blue-100">Central & State scholarships — merit-based, need-based, category-based</p>
          <div className="flex gap-4 mt-5 flex-wrap">
            <div className="bg-white/20 rounded-xl px-4 py-2 text-center">
              <p className="text-xl font-bold">{centralScholarships.length}</p>
              <p className="text-xs text-blue-100">Central</p>
            </div>
            <div className="bg-white/20 rounded-xl px-4 py-2 text-center">
              <p className="text-xl font-bold">{allStateSchols.length}</p>
              <p className="text-xs text-blue-100">State</p>
            </div>
            <div className="bg-white/20 rounded-xl px-4 py-2 text-center">
              <p className="text-xl font-bold">{allScholarships.length}</p>
              <p className="text-xs text-blue-100">Total</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 mb-8">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">🔍</span>
              <input type="text" placeholder="Search scholarships..." value={search}
                onChange={e => setSearch(e.target.value)} className="form-input pl-10" />
            </div>
            <select value={catFilter} onChange={e => setCat(e.target.value)} className="form-input w-auto">
              {categories.map(c => <option key={c}>{c}</option>)}
            </select>
            <select value={stateFilter} onChange={e => setStateFilter(e.target.value)} className="form-input w-auto">
              <option value="All">All States</option>
              <option value="Central">Central</option>
              {Object.keys(stateScholarships).map(id => (
                <option key={id} value={states.find(s => s.id === id)?.name || id}>
                  {states.find(s => s.id === id)?.name || id}
                </option>
              ))}
            </select>
          </div>
        </div>

        {filtered.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {filtered.map(s => (
              <SchemeCard key={s.id} scheme={s} stateId={s._stateId} type="scheme" />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 text-gray-400">
            <div className="text-5xl mb-4">🔍</div>
            <p className="font-medium">No scholarships found for "{search}"</p>
          </div>
        )}
      </div>
    </div>
  );
}
