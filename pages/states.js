import { useState } from 'react';
import { states, unionTerritories } from '../data/states';
import StateCard from '../components/StateCard';

export default function StatesPage() {
  const [search, setSearch] = useState('');
  const [regionFilter, setRegionFilter] = useState('All');
  const [tab, setTab] = useState('states');

  const regions = ['All', 'North', 'South', 'East', 'West', 'Central', 'Northeast'];

  const filterItems = (items) =>
    items.filter((s) => {
      const matchSearch = s.name.toLowerCase().includes(search.toLowerCase()) ||
        s.capital.toLowerCase().includes(search.toLowerCase());
      const matchRegion = regionFilter === 'All' || s.region === regionFilter;
      return matchSearch && matchRegion;
    });

  const filteredStates = filterItems(states);
  const filteredUTs = filterItems(unionTerritories);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-orange-600 to-orange-500 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl md:text-4xl font-extrabold mb-2">🗺️ States & Union Territories</h1>
          <p className="text-orange-100">Select your state to view all government schemes and programs</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search & Filter */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 mb-8">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">🔍</span>
              <input
                type="text"
                placeholder="Search state or capital..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="form-input pl-10"
              />
            </div>
            <div className="flex gap-2 flex-wrap">
              {regions.map((region) => (
                <button
                  key={region}
                  onClick={() => setRegionFilter(region)}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                    regionFilter === region
                      ? 'bg-orange-600 text-white shadow-sm'
                      : 'bg-gray-100 text-gray-600 hover:bg-orange-50 hover:text-orange-700'
                  }`}
                >
                  {region}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-gray-200 rounded-xl p-1 mb-8 w-fit">
          <button
            onClick={() => setTab('states')}
            className={`px-6 py-2 rounded-lg font-semibold text-sm transition-all ${
              tab === 'states' ? 'bg-white text-orange-600 shadow-sm' : 'text-gray-600'
            }`}
          >
            States ({filteredStates.length})
          </button>
          <button
            onClick={() => setTab('uts')}
            className={`px-6 py-2 rounded-lg font-semibold text-sm transition-all ${
              tab === 'uts' ? 'bg-white text-orange-600 shadow-sm' : 'text-gray-600'
            }`}
          >
            Union Territories ({filteredUTs.length})
          </button>
        </div>

        {tab === 'states' ? (
          filteredStates.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
              {filteredStates.map((state) => (
                <StateCard key={state.id} state={state} />
              ))}
            </div>
          ) : (
            <div className="text-center py-20 text-gray-500">
              <div className="text-5xl mb-4">🔍</div>
              <p className="text-lg font-medium">No states found for &quot;{search}&quot;</p>
            </div>
          )
        ) : (
          filteredUTs.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {filteredUTs.map((ut) => (
                <StateCard key={ut.id} state={ut} isUT />
              ))}
            </div>
          ) : (
            <div className="text-center py-20 text-gray-500">
              <div className="text-5xl mb-4">🔍</div>
              <p className="text-lg font-medium">No union territories found</p>
            </div>
          )
        )}
      </div>
    </div>
  );
}
