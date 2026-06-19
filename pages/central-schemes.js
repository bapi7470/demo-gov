import { useState } from 'react';
import prisma from '../lib/prisma';
import SchemeCard from '../components/SchemeCard';

export async function getServerSideProps() {
  const [official, custom] = await Promise.all([
    prisma.scheme.findMany({ where: { scope: 'central' }, orderBy: { createdAt: 'asc' } }),
    prisma.customScheme.findMany({ where: { stateId: 'central' } }),
  ]);
  const customMapped = custom.map(s => ({ ...s, name: s.title, isCustom: true }));
  const allSchemes = [...official, ...customMapped];
  return { props: JSON.parse(JSON.stringify({ allSchemes })) };
}

export default function CentralSchemesPage({ allSchemes }) {
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');

  const categories = ['All', ...new Set(allSchemes.map((s) => s.category).filter(Boolean))];

  const filtered = allSchemes.filter((s) => {
    const matchSearch =
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      (s.category || '').toLowerCase().includes(search.toLowerCase()) ||
      (s.nameLocal && s.nameLocal.includes(search));
    const matchCat = categoryFilter === 'All' || s.category === categoryFilter;
    return matchSearch && matchCat;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gradient-to-r from-orange-600 to-green-700 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl md:text-4xl font-extrabold mb-2">🏛️ Central Government Schemes</h1>
          <p className="text-orange-100">Pradhan Mantri and national welfare schemes for all Indian citizens</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 mb-8">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">🔍</span>
              <input
                type="text"
                placeholder="Search schemes..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="form-input pl-10"
              />
            </div>
            <div className="flex gap-2 flex-wrap">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setCategoryFilter(cat)}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                    categoryFilter === cat
                      ? 'bg-orange-600 text-white shadow-sm'
                      : 'bg-gray-100 text-gray-600 hover:bg-orange-50 hover:text-orange-700'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </div>

        {filtered.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {filtered.map((scheme) => (
              <SchemeCard key={scheme.id} scheme={scheme} stateId="central" type="scheme" />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 text-gray-500">
            <div className="text-5xl mb-4">🔍</div>
            <p className="font-medium">No schemes found for &quot;{search}&quot;</p>
          </div>
        )}
      </div>
    </div>
  );
}
