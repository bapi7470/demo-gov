import { useState } from 'react';
import prisma from '../lib/prisma';
import SchemeCard from '../components/SchemeCard';

export async function getServerSideProps() {
  const [official, custom, allStates] = await Promise.all([
    prisma.scholarship.findMany({ orderBy: { createdAt: 'asc' } }),
    prisma.customScholarship.findMany(),
    prisma.state.findMany({ orderBy: { name: 'asc' } }),
  ]);
  const customMapped = custom.map(s => ({
    ...s,
    name: s.title,
    benefit: s.amount,
    _stateId: s.stateId || 'central',
    isCustom: true,
  }));
  const allScholarships = [
    ...official.map(s => ({ ...s, _stateId: s.stateId || (s.scope === 'central' ? 'central' : null) })),
    ...customMapped,
  ];
  const centralCount = official.filter(s => s.scope === 'central').length;
  const stateCount = official.filter(s => s.scope === 'state').length + custom.length;
  // unique state IDs with scholarships (for dropdown)
  const stateIdsWithSchols = [...new Set(
    official.filter(s => s.stateId && s.scope === 'state').map(s => s.stateId)
  )];
  const statesWithSchols = allStates.filter(s => stateIdsWithSchols.includes(s.id));
  return {
    props: JSON.parse(JSON.stringify({
      allScholarships,
      centralCount,
      stateCount,
      statesWithSchols,
      allStates,
    })),
  };
}

export default function ScholarshipsPage({ allScholarships, centralCount, stateCount, statesWithSchols, allStates }) {
  const [search, setSearch]   = useState('');
  const [catFilter, setCat]   = useState('All');
  const [stateFilter, setStateFilter] = useState('All');

  const categories = ['All', ...new Set(allScholarships.map(s => s.subcategory || 'Central').filter(Boolean))];

  const filtered = allScholarships.filter(s => {
    const name = s.name || s.title || '';
    const eligibility = s.eligibility || '';
    const matchSearch = name.toLowerCase().includes(search.toLowerCase()) ||
      (s.nameLocal || '').includes(search) ||
      eligibility.toLowerCase().includes(search.toLowerCase());
    const matchCat   = catFilter === 'All' || (s.subcategory || 'Central') === catFilter;
    const matchState = stateFilter === 'All' ||
      (s._stateId === 'central' && stateFilter === 'central') ||
      s._stateId === stateFilter;
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
              <p className="text-xl font-bold">{centralCount}</p>
              <p className="text-xs text-blue-100">Central</p>
            </div>
            <div className="bg-white/20 rounded-xl px-4 py-2 text-center">
              <p className="text-xl font-bold">{stateCount}</p>
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
              <option value="central">Central</option>
              {statesWithSchols.map(s => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </div>
        </div>

        {filtered.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {filtered.map(s => (
              <SchemeCard key={s.id} scheme={s} stateId={s._stateId || 'central'} type="scheme" />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 text-gray-400">
            <div className="text-5xl mb-4">🔍</div>
            <p className="font-medium">No scholarships found for &quot;{search}&quot;</p>
          </div>
        )}
      </div>
    </div>
  );
}
