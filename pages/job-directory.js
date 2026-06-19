import { useState } from 'react';
import prisma from '../lib/prisma';

export async function getServerSideProps() {
  const [employees, allStates, sectors] = await Promise.all([
    prisma.govEmployee.findMany({ orderBy: { name: 'asc' } }),
    prisma.state.findMany({ orderBy: { name: 'asc' } }),
    prisma.govSector.findMany(),
  ]);

  // Group employees by stateId for client-side use
  const govEmployeesByState = {};
  for (const emp of employees) {
    if (!govEmployeesByState[emp.stateId]) govEmployeesByState[emp.stateId] = [];
    govEmployeesByState[emp.stateId].push(emp);
  }

  const sectorIcons = Object.fromEntries(sectors.map(s => [s.name, s.icon || '💼']));
  const sectorColors = Object.fromEntries(sectors.map(s => [s.name, s.color || 'from-gray-500 to-gray-700']));

  return {
    props: JSON.parse(JSON.stringify({
      govEmployeesByState,
      allStates,
      statesWithData: Object.keys(govEmployeesByState),
      totalEmployees: employees.length,
      totalSectors: [...new Set(employees.map(e => e.sector))].length,
      sectorIcons,
      sectorColors,
    })),
  };
}

export default function JobDirectoryPage({ govEmployeesByState, allStates, statesWithData, totalEmployees, totalSectors, sectorIcons, sectorColors }) {
  const [selectedState, setSelectedState] = useState(null);
  const [selectedSector, setSelectedSector] = useState(null);
  const [search, setSearch] = useState('');

  const stateData = selectedState ? allStates.find((s) => s.id === selectedState) : null;

  const getSectorsForState = (stateId) => {
    const emps = govEmployeesByState[stateId] || [];
    const sectorMap = {};
    emps.forEach((e) => {
      if (!sectorMap[e.sector]) sectorMap[e.sector] = [];
      sectorMap[e.sector].push(e);
    });
    return sectorMap;
  };

  const getEmployees = () => {
    if (!selectedState || !selectedSector) return [];
    return (govEmployeesByState[selectedState] || []).filter(
      (e) => e.sector === selectedSector
    );
  };

  const filteredStateEmployees = getEmployees().filter((e) =>
    e.name.toLowerCase().includes(search.toLowerCase()) ||
    e.designation.toLowerCase().includes(search.toLowerCase()) ||
    e.department.toLowerCase().includes(search.toLowerCase()) ||
    (e.district || '').toLowerCase().includes(search.toLowerCase())
  );

  const sectorsForState = selectedState ? getSectorsForState(selectedState) : {};

  const gradeColor = (grade) => {
    if (grade === 'Grade A') return 'bg-purple-100 text-purple-700';
    if (grade === 'Grade B') return 'bg-blue-100 text-blue-700';
    return 'bg-gray-100 text-gray-600';
  };

  const level = !selectedState ? 'states' : !selectedSector ? 'sectors' : 'employees';

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-800 to-slate-900 text-white py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl md:text-4xl font-extrabold mb-2">👔 Government Job Directory</h1>
          <p className="text-slate-300 text-sm">State-wise · Sector-wise · Employee listing</p>

          {/* Stats */}
          <div className="flex gap-4 mt-5 flex-wrap">
            <div className="bg-white/10 rounded-xl px-4 py-2 text-center">
              <p className="text-xl font-bold">{statesWithData.length}</p>
              <p className="text-xs text-slate-300">States Listed</p>
            </div>
            <div className="bg-white/10 rounded-xl px-4 py-2 text-center">
              <p className="text-xl font-bold">{totalEmployees}</p>
              <p className="text-xs text-slate-300">Employees</p>
            </div>
            <div className="bg-white/10 rounded-xl px-4 py-2 text-center">
              <p className="text-xl font-bold">{totalSectors}</p>
              <p className="text-xs text-slate-300">Sectors</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">

        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm mb-6 flex-wrap">
          <button
            onClick={() => { setSelectedState(null); setSelectedSector(null); setSearch(''); }}
            className={`font-semibold transition-colors ${
              level === 'states' ? 'text-slate-800' : 'text-blue-600 hover:text-blue-800'
            }`}
          >
            🗺️ All States
          </button>

          {selectedState && stateData && (
            <>
              <span className="text-gray-400">/</span>
              <button
                onClick={() => { setSelectedSector(null); setSearch(''); }}
                className={`font-semibold transition-colors ${
                  level === 'sectors' ? 'text-slate-800' : 'text-blue-600 hover:text-blue-800'
                }`}
              >
                {stateData.emoji} {stateData.name}
              </button>
            </>
          )}

          {selectedSector && (
            <>
              <span className="text-gray-400">/</span>
              <span className="font-semibold text-slate-800">
                {sectorIcons[selectedSector]} {selectedSector}
              </span>
            </>
          )}
        </div>

        {/* LEVEL 1 — State Cards */}
        {level === 'states' && (
          <>
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold text-gray-700">Select a State to view sectors</h2>
              <span className="text-xs text-gray-400 bg-gray-100 px-3 py-1 rounded-full">
                {statesWithData.length} states available
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 mb-8">
              {allStates.filter(s => statesWithData.includes(s.id)).map((state) => {
                const empCount = (govEmployeesByState[state.id] || []).length;
                const sectorCount = Object.keys(getSectorsForState(state.id)).length;
                return (
                  <div
                    key={state.id}
                    onClick={() => { setSelectedState(state.id); setSelectedSector(null); }}
                    className="card-hover bg-white rounded-2xl overflow-hidden shadow-md border border-gray-100"
                  >
                    <div className={`bg-gradient-to-br ${state.color} h-24 flex items-center justify-center`}>
                      <span className="text-4xl">{state.emoji}</span>
                    </div>
                    <div className="p-3">
                      <h3 className="font-bold text-gray-800 text-sm leading-tight">{state.name}</h3>
                      <div className="mt-2 space-y-0.5">
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-gray-500">{sectorCount} sectors</span>
                          <span className="text-xs font-semibold text-blue-600">{empCount} empl.</span>
                        </div>
                      </div>
                      <div className="mt-2 pt-2 border-t border-gray-100 flex justify-between items-center">
                        <span className="text-xs text-orange-600 font-semibold">View</span>
                        <span className="text-orange-500 text-xs">→</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Coming soon states */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5">
              <h3 className="font-bold text-slate-600 text-sm mb-3">📌 More States Coming Soon</h3>
              <div className="flex flex-wrap gap-2">
                {allStates.filter(s => !statesWithData.includes(s.id)).map((s) => (
                  <span key={s.id} className="bg-white border border-slate-200 text-slate-400 text-xs px-2.5 py-1 rounded-full">
                    {s.emoji} {s.name}
                  </span>
                ))}
              </div>
            </div>
          </>
        )}

        {/* LEVEL 2 — Sector Cards */}
        {level === 'sectors' && stateData && (
          <>
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => { setSelectedState(null); setSelectedSector(null); }}
                  className="text-sm text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg transition-colors font-medium flex items-center gap-1"
                >
                  ← States
                </button>
                <h2 className="text-lg font-bold text-gray-700">
                  {stateData.emoji} {stateData.name} — Sectors
                </h2>
              </div>
              <span className="text-xs text-gray-400 bg-gray-100 px-3 py-1 rounded-full">
                {Object.keys(sectorsForState).length} sectors · {(govEmployeesByState[selectedState] || []).length} employees
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {Object.entries(sectorsForState).map(([sector, emps]) => (
                <div
                  key={sector}
                  onClick={() => { setSelectedSector(sector); setSearch(''); }}
                  className="card-hover bg-white rounded-2xl overflow-hidden shadow-md border border-gray-100"
                >
                  <div className={`bg-gradient-to-br ${sectorColors[sector] || 'from-gray-500 to-gray-700'} h-20 flex items-center justify-center`}>
                    <span className="text-4xl">{sectorIcons[sector] || '💼'}</span>
                  </div>
                  <div className="p-4">
                    <h3 className="font-bold text-gray-800 text-sm leading-tight mb-2">{sector}</h3>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                        <span className="text-xs text-gray-600">{emps.length} employee{emps.length > 1 ? 's' : ''}</span>
                      </div>
                      <span className="text-orange-500 text-xs font-semibold">View →</span>
                    </div>
                    {/* Grade breakdown */}
                    <div className="mt-2 flex gap-1 flex-wrap">
                      {['Grade A', 'Grade B', 'Grade C'].map(g => {
                        const cnt = emps.filter(e => e.grade === g).length;
                        if (!cnt) return null;
                        return (
                          <span key={g} className={`text-xs px-1.5 py-0.5 rounded-full ${gradeColor(g)}`}>
                            {g.replace('Grade ', '')}: {cnt}
                          </span>
                        );
                      })}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* LEVEL 3 — Employee List */}
        {level === 'employees' && stateData && selectedSector && (
          <>
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-5">
              <div className="flex items-center gap-3 flex-wrap">
                <button
                  onClick={() => { setSelectedSector(null); setSearch(''); }}
                  className="text-sm text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg transition-colors font-medium"
                >
                  ← Sectors
                </button>
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{sectorIcons[selectedSector]}</span>
                  <div>
                    <h2 className="font-bold text-gray-800 text-base leading-tight">{selectedSector}</h2>
                    <p className="text-xs text-gray-500">{stateData.emoji} {stateData.name} · {filteredStateEmployees.length} employee{filteredStateEmployees.length !== 1 ? 's' : ''}</p>
                  </div>
                </div>
              </div>

              {/* Search */}
              <div className="relative w-full sm:w-64">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">🔍</span>
                <input
                  type="text"
                  placeholder="Search by name, designation..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="form-input pl-9 py-2 text-sm w-full"
                />
              </div>
            </div>

            {filteredStateEmployees.length === 0 ? (
              <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center text-gray-400">
                <div className="text-5xl mb-3">🔍</div>
                <p>{search ? `No results for "${search}"` : 'No employees found in this sector.'}</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {filteredStateEmployees.map((emp) => (
                  <div key={emp.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 hover:shadow-md transition-shadow">
                    {/* Avatar */}
                    <div className="flex items-start gap-3 mb-3">
                      <div className={`w-11 h-11 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0 bg-gradient-to-br ${sectorColors[emp.sector] || 'from-gray-500 to-gray-700'}`}>
                        {emp.name.split(' ').map(n => n[0]).slice(0, 2).join('')}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-gray-800 text-sm leading-tight truncate">{emp.name}</h3>
                        <p className="text-xs text-gray-500 truncate">{emp.designation}</p>
                      </div>
                    </div>

                    {/* Details */}
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2 text-xs text-gray-600">
                        <span>🏢</span>
                        <span className="truncate">{emp.department}</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-gray-600">
                        <span>📍</span>
                        <span>{emp.district}</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-gray-600">
                        <span>📅</span>
                        <span>Joined {emp.joiningDate ? new Date(emp.joiningDate).getFullYear() : 'N/A'}</span>
                      </div>
                    </div>

                    {/* Footer */}
                    <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-between">
                      <span className="font-bold text-green-700 text-sm">
                        ₹{(emp.salary / 1000).toFixed(0)}K/mo
                      </span>
                      <div className="flex items-center gap-1.5">
                        <span className={`badge text-xs ${gradeColor(emp.grade)}`}>{emp.grade}</span>
                        <span className="badge bg-slate-100 text-slate-600 text-xs">{emp.serviceType}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Salary summary */}
            {filteredStateEmployees.length > 0 && (
              <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-4">
                {[
                  { label: 'Total Employees', value: filteredStateEmployees.length, icon: '👥' },
                  { label: 'Avg. Salary', value: `₹${Math.round(filteredStateEmployees.reduce((s, e) => s + e.salary, 0) / filteredStateEmployees.length / 1000)}K`, icon: '💰' },
                  { label: 'Highest Salary', value: `₹${Math.max(...filteredStateEmployees.map(e => e.salary)).toLocaleString('en-IN')}`, icon: '📈' },
                  { label: 'Grade A Officers', value: filteredStateEmployees.filter(e => e.grade === 'Grade A').length, icon: '⭐' },
                ].map((stat) => (
                  <div key={stat.label} className="bg-white rounded-xl border border-gray-100 p-4 text-center shadow-sm">
                    <div className="text-2xl mb-1">{stat.icon}</div>
                    <div className="text-xl font-bold text-gray-800">{stat.value}</div>
                    <div className="text-xs text-gray-400 mt-0.5">{stat.label}</div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
