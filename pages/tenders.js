import { useState } from 'react';
import { useRouter } from 'next/router';
import prisma from '../lib/prisma';

export async function getServerSideProps() {
  const [official, custom] = await Promise.all([
    prisma.tender.findMany({ orderBy: { createdAt: 'asc' } }),
    prisma.customTender.findMany(),
  ]);
  const customMapped = custom.map(t => ({
    ...t,
    name: t.title,
    _stateId: t.stateId || 'central',
    isCustom: true,
  }));
  const allTenders = [
    ...official.map(t => ({ ...t, _stateId: t.stateId })),
    ...customMapped,
  ];
  return { props: JSON.parse(JSON.stringify({ allTenders })) };
}

export default function TendersPage({ allTenders }) {
  const router = useRouter();
  const [search, setSearch]   = useState('');
  const [catFilter, setCat]   = useState('All');
  const [statusFilter, setStatus] = useState('All');

  const subcategories = ['All', ...new Set(allTenders.map(t => t.subcategory).filter(Boolean))];

  const filtered = allTenders.filter(t => {
    const name = t.name || t.title || '';
    const dept = t.department || '';
    const matchSearch = name.toLowerCase().includes(search.toLowerCase()) ||
      dept.toLowerCase().includes(search.toLowerCase()) ||
      (t.tenderNo || '').toLowerCase().includes(search.toLowerCase());
    const matchCat    = catFilter === 'All' || t.subcategory === catFilter;
    const matchStatus = statusFilter === 'All' || t.status === statusFilter;
    return matchSearch && matchCat && matchStatus;
  });

  const statusStyle = { active: 'bg-green-100 text-green-700', upcoming: 'bg-yellow-100 text-yellow-700' };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gradient-to-r from-amber-600 to-orange-700 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl md:text-4xl font-extrabold mb-2">📋 Government Tenders</h1>
          <p className="text-orange-100">Bid for government contracts — infrastructure, construction, supply and more</p>
          <div className="flex gap-4 mt-5 flex-wrap">
            <div className="bg-white/20 rounded-xl px-4 py-2 text-center">
              <p className="text-xl font-bold">{allTenders.filter(t=>t.status==='active').length}</p>
              <p className="text-xs text-orange-100">🟢 Open Now</p>
            </div>
            <div className="bg-white/20 rounded-xl px-4 py-2 text-center">
              <p className="text-xl font-bold">{allTenders.filter(t=>t.status==='upcoming').length}</p>
              <p className="text-xs text-orange-100">🟡 Upcoming</p>
            </div>
            <div className="bg-white/20 rounded-xl px-4 py-2 text-center">
              <p className="text-xl font-bold">{allTenders.length}</p>
              <p className="text-xs text-orange-100">Total Tenders</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 mb-8">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">🔍</span>
              <input type="text" placeholder="Search by name, department, tender no..." value={search}
                onChange={e => setSearch(e.target.value)} className="form-input pl-10" />
            </div>
            <select value={catFilter} onChange={e => setCat(e.target.value)} className="form-input w-auto">
              {subcategories.map(c => <option key={c}>{c}</option>)}
            </select>
            <select value={statusFilter} onChange={e => setStatus(e.target.value)} className="form-input w-auto">
              <option value="All">All Status</option>
              <option value="active">🟢 Open Now</option>
              <option value="upcoming">🟡 Upcoming</option>
            </select>
          </div>
        </div>

        {filtered.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {filtered.map(tender => (
              <div key={tender.id}
                className={`bg-white rounded-2xl border-2 ${tender.color || 'border-gray-100'} shadow-sm overflow-hidden`}>
                <div className="p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <span className="text-3xl">{tender.icon || '📋'}</span>
                      <div>
                        <h3 className="font-bold text-gray-800 text-sm leading-tight">{tender.name || tender.title}</h3>
                        <p className="text-xs text-gray-500 mt-0.5">{tender.department}</p>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-1 flex-shrink-0 ml-2">
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${tender.badgeColor || 'bg-gray-100 text-gray-600'}`}>
                        {tender.subcategory}
                      </span>
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${statusStyle[tender.status] || 'bg-gray-100 text-gray-600'}`}>
                        {tender.status === 'active' ? '🟢 Open' : '🟡 Upcoming'}
                      </span>
                    </div>
                  </div>

                  <p className="text-xs text-gray-600 mb-3 leading-relaxed line-clamp-2">
                    {tender.workDescription}
                  </p>

                  <div className="grid grid-cols-2 gap-2 mb-3">
                    {[
                      ['💰 Est. Value', tender.estimatedValue],
                      ['⏰ Bid Deadline', tender.bidDeadline],
                      ['👥 Eligibility', tender.eligibility],
                      ['🔢 Tender No.', tender.tenderNo],
                    ].map(([k,v]) => (
                      <div key={k} className="bg-white/60 rounded-lg p-2">
                        <p className="text-xs text-gray-400">{k}</p>
                        <p className="text-xs font-semibold text-gray-700 truncate">{v}</p>
                      </div>
                    ))}
                  </div>

                  <button
                    onClick={() => router.push(`/scheme/${tender._stateId}/${tender.id}`)}
                    className="w-full bg-gray-800 hover:bg-gray-700 text-white text-sm font-bold py-2.5 rounded-xl transition-colors flex items-center justify-center gap-2"
                  >
                    📋 Submit Bid / Apply →
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 text-gray-400">
            <div className="text-5xl mb-4">🔍</div>
            <p className="font-medium">No tenders found</p>
          </div>
        )}
      </div>
    </div>
  );
}
