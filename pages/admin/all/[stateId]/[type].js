import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import prisma from '../../../../lib/prisma';

export async function getServerSideProps({ params }) {
  const { stateId, type } = params;
  const isCentral = stateId === 'central';

  let staticItems = [];
  if (type === 'scheme') {
    staticItems = await prisma.scheme.findMany({
      where: isCentral ? { scope: 'central' } : { stateId },
      orderBy: { createdAt: 'asc' },
    });
  } else if (type === 'exam') {
    staticItems = await prisma.exam.findMany({
      where: isCentral ? { scope: 'central' } : { stateId },
      orderBy: { createdAt: 'asc' },
    });
  } else if (type === 'scholarship') {
    staticItems = await prisma.scholarship.findMany({
      where: isCentral ? { scope: 'central' } : { stateId },
      orderBy: { createdAt: 'asc' },
    });
  } else if (type === 'tender') {
    staticItems = await prisma.tender.findMany({
      where: isCentral ? { stateId: 'central' } : { stateId },
      orderBy: { createdAt: 'asc' },
    });
  }

  return {
    props: JSON.parse(JSON.stringify({ staticItemsData: staticItems })),
  };
}

const TYPE_CONFIG = {
  scheme:      { label: 'Schemes',      emoji: '🏛️', color: 'from-orange-600 to-orange-800' },
  exam:        { label: 'Exams',        emoji: '📝', color: 'from-blue-700 to-indigo-800' },
  scholarship: { label: 'Scholarships', emoji: '🎓', color: 'from-indigo-600 to-purple-800' },
  tender:      { label: 'Tenders',      emoji: '📋', color: 'from-amber-600 to-orange-700' },
};

export default function GovAllItemsPage({ staticItemsData }) {
  const router = useRouter();
  const { stateId, type } = router.query;

  const [search, setSearch] = useState('');
  const [showFilter, setShowFilter] = useState('all'); // 'all' | 'builtin' | 'custom'
  const [customItems, setCustomItems] = useState([]);
  const [deletedIds, setDeletedIds] = useState(new Set());
  const [authChecked, setAuthChecked] = useState(false);

  // Gov admin auth guard
  useEffect(() => {
    try {
      const session = JSON.parse(localStorage.getItem('gov_admin_session'));
      if (!session) {
        router.replace('/login');
        return;
      }
    } catch {
      router.replace('/login');
      return;
    }
    setAuthChecked(true);
  }, []);

  // Fetch custom items from API once stateId and type are available
  useEffect(() => {
    if (!stateId || !type || !authChecked) return;

    const endpointMap = {
      scheme:      '/api/schemes',
      exam:        '/api/exams',
      scholarship: '/api/scholarships',
      tender:      '/api/tenders',
    };
    const endpoint = endpointMap[type];
    if (!endpoint) return;

    fetch(`${endpoint}?stateId=${stateId}`)
      .then(r => r.ok ? r.json() : [])
      .then(data => setCustomItems(data.map(item => ({ ...item, _isCustom: true }))))
      .catch(() => setCustomItems([]));
  }, [stateId, type, authChecked]);

  if (!authChecked || !stateId || !type) {
    return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin text-4xl">⟳</div></div>;
  }

  const cfg = TYPE_CONFIG[type] || TYPE_CONFIG.scheme;
  const isCentral = stateId === 'central';

  const handleDelete = async (item) => {
    if (!window.confirm('এই আইটেমটি ডিলিট করবেন? এটি পূর্বাবস্থায় ফেরানো যাবে না।')) return;
    const endpoint = type === 'scheme'      ? '/api/schemes'
                   : type === 'exam'        ? '/api/exams'
                   : type === 'scholarship' ? '/api/scholarships'
                   :                          '/api/tenders';
    await fetch(`${endpoint}?id=${item.id}`, { method: 'DELETE' });
    setDeletedIds(prev => new Set([...prev, item.id]));
  };

  const handleEdit = (item) => {
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('admin_edit_item', JSON.stringify({ editItem: item, editType: type }));
    }
    router.push('/admin');
  };

  // Static items from DB via getServerSideProps
  const staticItems = (staticItemsData || []).map(item => ({ ...item, _isCustom: false }));

  // Custom overrides same-ID built-in
  const customItemIds = new Set(customItems.map(i => i.id));
  const allItems = [
    ...staticItems.filter(i => !customItemIds.has(i.id)),
    ...customItems,
  ];

  // Filter
  const filtered = allItems.filter(item => {
    if (deletedIds.has(item.id)) return false;
    const matchSearch = !search ||
      item.name?.toLowerCase().includes(search.toLowerCase()) ||
      item.category?.toLowerCase().includes(search.toLowerCase()) ||
      item.eligibility?.toLowerCase().includes(search.toLowerCase());
    const matchFilter = showFilter === 'all'
      || (showFilter === 'builtin' && !item._isCustom)
      || (showFilter === 'custom' && item._isCustom);
    return matchSearch && matchFilter;
  });

  const builtinCount = allItems.filter(i => !i._isCustom).length;
  const customCount  = allItems.filter(i =>  i._isCustom).length;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className={`bg-gradient-to-r ${cfg.color} text-white py-8`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <button
            onClick={() => router.push('/admin')}
            className="inline-flex items-center gap-2 text-white/70 hover:text-white text-sm mb-4 transition-colors"
          >
            ← Back to Admin Portal
          </button>
          <h1 className="text-3xl font-extrabold mb-1">
            {cfg.emoji} All {cfg.label}
          </h1>
          <p className="text-white/70 text-sm">
            {stateId === 'central' ? 'Central Government' : stateId.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase())} · {allItems.length} total
          </p>
          <div className="flex gap-3 mt-4">
            <div className="bg-white/20 rounded-xl px-4 py-2 text-center">
              <p className="text-xl font-bold">{allItems.length}</p>
              <p className="text-xs text-white/70">Total</p>
            </div>
            <div className="bg-white/20 rounded-xl px-4 py-2 text-center">
              <p className="text-xl font-bold">{builtinCount}</p>
              <p className="text-xs text-white/70">Built-in</p>
            </div>
            <div className="bg-white/20 rounded-xl px-4 py-2 text-center">
              <p className="text-xl font-bold">{customCount}</p>
              <p className="text-xs text-white/70">Custom</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Search & Filter */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 mb-6 flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">🔍</span>
            <input
              type="text"
              placeholder={`Search ${cfg.label.toLowerCase()}...`}
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="form-input pl-9 py-2 text-sm w-full"
            />
          </div>
          <div className="flex gap-2">
            {[['all','All'],['builtin','Built-in'],['custom','Custom']].map(([val, label]) => (
              <button
                key={val}
                onClick={() => setShowFilter(val)}
                className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                  showFilter === val
                    ? 'bg-gray-800 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        <p className="text-sm text-gray-500 mb-4">{filtered.length} item{filtered.length !== 1 ? 's' : ''} found</p>

        {filtered.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center text-gray-400">
            <div className="text-5xl mb-3">{cfg.emoji}</div>
            <p className="font-medium">No {cfg.label.toLowerCase()} found</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filtered.map(item => (
              <div key={item.id} className={`bg-white rounded-2xl border-2 ${item.color || 'bg-gray-100 border-gray-200'} p-4 shadow-sm relative`}>
                <div className="absolute top-2 right-2">
                  {item._isCustom
                    ? <span className="bg-blue-100 text-blue-700 text-xs font-bold px-1.5 py-0.5 rounded-full">Custom</span>
                    : <span className="bg-gray-100 text-gray-500 text-xs font-bold px-1.5 py-0.5 rounded-full">Built-in</span>
                  }
                </div>

                <div className="flex items-start gap-2 mb-2">
                  <span className="text-2xl">{item.icon}</span>
                  <div className="min-w-0 pr-12">
                    <p className="font-bold text-gray-800 text-sm leading-tight">{item.name}</p>
                    {(item.nameBengali || item.nameHindi) && (
                      <p className="text-xs text-gray-400 truncate">{item.nameBengali || item.nameHindi}</p>
                    )}
                  </div>
                </div>

                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${item.badgeColor || 'bg-gray-100 text-gray-600'}`}>
                  {item.category || item.subcategory}
                </span>

                <div className="mt-2 space-y-0.5">
                  {item.benefit        && <p className="text-xs text-green-700 font-semibold">✓ {item.benefit}</p>}
                  {item.estimatedValue && <p className="text-xs text-green-700 font-semibold">💰 {item.estimatedValue}</p>}
                  {item.eligibility    && <p className="text-xs text-gray-500 line-clamp-2">👥 {item.eligibility}</p>}
                  {item.nextExam       && <p className="text-xs text-blue-600">📅 {item.nextExam}</p>}
                  {item.bidDeadline    && <p className="text-xs text-red-500">⏰ {item.bidDeadline}</p>}
                  <p className="text-xs text-gray-400">
                    {item.formFields?.length ? `📋 ${item.formFields.length} fields` : ''}
                    {item.ministry || item.conductedBy || item.department
                      ? ` · ${item.ministry || item.conductedBy || item.department}` : ''}
                  </p>
                </div>

                <div className="mt-3 flex gap-2">
                  <span className="flex-1 bg-green-100 text-green-700 text-xs text-center py-1.5 rounded-lg font-semibold">🟢 Live</span>
                  <button
                    onClick={() => handleEdit(item)}
                    className="flex-1 bg-blue-50 hover:bg-blue-100 text-blue-600 text-xs py-1.5 rounded-lg font-semibold transition-colors"
                  >
                    ✏️ Edit
                  </button>
                  <button
                    onClick={() => handleDelete(item)}
                    className="bg-red-50 hover:bg-red-100 text-red-600 text-xs px-2.5 py-1.5 rounded-lg font-semibold transition-colors"
                  >
                    🗑
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
