import { useState, useMemo, useEffect } from 'react';
import { useRouter } from 'next/router';
import { states, unionTerritories } from '../data/states';
import { privateOrgs, orgSectors } from '../data/privateOrgs';
import { govEmployees } from '../data/govData';
import { useAuth } from '../context/AuthContext';

// Check if a PAN is a registered government employee
function isGovEmployee(pan) {
  if (!pan) return false;
  const upperPan = pan.toUpperCase();
  return Object.values(govEmployees).flat().some(emp => emp.pan === upperPan);
}

// Build hierarchy including custom companies
function buildFullHierarchy(customCompanies) {
  const h = {};
  const all = [...privateOrgs, ...customCompanies];
  all.forEach(org => {
    if (!h[org.stateId]) h[org.stateId] = { stateName: org.stateName, districts: {} };
    const d = h[org.stateId].districts;
    if (!d[org.district]) d[org.district] = {};
    if (!d[org.district][org.city]) d[org.district][org.city] = [];
    d[org.district][org.city].push(org);
  });
  return h;
}

const COMPANY_SECTORS = ['IT / Software', 'Banking & Finance', 'Automobile / Manufacturing',
  'Engineering / Construction', 'E-Commerce / Retail', 'Food Tech / Delivery',
  'Electric Vehicles / Tech', 'FMCG / Conglomerate', 'Pharmaceuticals',
  'Education / Training', 'Healthcare', 'Real Estate', 'Logistics', 'Other'];

const STATE_LIST = ['Andhra Pradesh','Assam','Bihar','Chhattisgarh','Delhi','Goa','Gujarat',
  'Haryana','Himachal Pradesh','Jharkhand','Karnataka','Kerala','Madhya Pradesh',
  'Maharashtra','Odisha','Punjab','Rajasthan','Tamil Nadu','Telangana','Uttar Pradesh',
  'Uttarakhand','West Bengal'];

const allStates = [...states, ...unionTerritories];

export default function CompanyDirectoryPage() {
  const router = useRouter();
  const { user } = useAuth();

  const [customCompanies, setCustomCompanies] = useState([]);
  useEffect(() => {
    fetch('/api/companies').then(r => r.json()).then(data => setCustomCompanies(Array.isArray(data) ? data : [])).catch(() => {});
  }, []);
  const hierarchy = useMemo(() => buildFullHierarchy(customCompanies), [customCompanies]);
  const statesWithOrgs = Object.keys(hierarchy);

  const [selectedState, setSelectedState] = useState(null);
  const [selectedDistrict, setSelectedDistrict] = useState(null);
  const [selectedCity, setSelectedCity] = useState(null);
  const [selectedOrg, setSelectedOrg] = useState(null);

  // Register Company Modal states
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [regStep, setRegStep] = useState('verify'); // 'verify' | 'form' | 'success'
  const [regNumber, setRegNumber] = useState('');
  const [regError, setRegError] = useState('');
  const [verifiedUser, setVerifiedUser] = useState(null);
  const [companyForm, setCompanyForm] = useState({
    name: '', shortName: '', gst: '', sector: '', stateId: '', stateName: '',
    district: '', city: '', adminPassword: '', description: '',
  });
  const [formErrors, setFormErrors] = useState({});
  const [regSuccess, setRegSuccess] = useState(null);

  const handleVerify = () => {
    setRegError('');
    const input = regNumber.trim();
    if (!input) { setRegError('Please enter your Registration Number.'); return; }

    // Find user by mobile (registration number = mobile)
    const found = db.find('users', u => u.mobile === input || u.id === input);
    if (!found) {
      setRegError('Registration Number not found. Please register first.');
      return;
    }

    // Check if govt employee
    if (found.pan && isGovEmployee(found.pan)) {
      setRegError(`❌ Blocked: "${found.fullName}" is registered as a Government Employee (PAN: ${found.pan?.slice(0,5)}*****). Government employees cannot create private companies.`);
      return;
    }

    if (found.occupation === 'Government Job') {
      setRegError(`❌ Blocked: Your occupation is listed as "Government Job". Government employees cannot register private companies.`);
      return;
    }

    setVerifiedUser(found);
    setRegStep('form');
  };

  const validateCompanyForm = () => {
    const e = {};
    if (!companyForm.name.trim()) e.name = 'Company name is required';
    if (!companyForm.gst.trim() || companyForm.gst.length < 15) e.gst = 'Valid 15-digit GST number required';
    if (!companyForm.sector) e.sector = 'Please select a sector';
    if (!companyForm.stateId) e.stateId = 'Please select a state';
    if (!companyForm.district.trim()) e.district = 'District is required';
    if (!companyForm.city.trim()) e.city = 'City is required';
    if (!companyForm.adminPassword || companyForm.adminPassword.length < 6) e.adminPassword = 'Admin password must be at least 6 characters';
    return e;
  };

  const handleCreateCompany = async () => {
    const errs = validateCompanyForm();
    if (Object.keys(errs).length > 0) { setFormErrors(errs); return; }

    const stateData = allStates.find(s => s.name === companyForm.stateId || s.id === companyForm.stateId);

    const newCompany = {
      id: `custom-company-${Date.now()}`,
      name: companyForm.name.trim(),
      shortName: companyForm.shortName.trim() || companyForm.name.trim().split(' ').map(w => w[0]).join(''),
      gst: companyForm.gst.trim().toUpperCase(),
      sector: companyForm.sector,
      stateId: stateData?.id || companyForm.stateId,
      stateName: stateData?.name || companyForm.stateId,
      district: companyForm.district.trim(),
      city: companyForm.city.trim(),
      adminPassword: companyForm.adminPassword,
      description: companyForm.description.trim() || `${companyForm.name} — registered private company.`,
      icon: '🏢',
      color: 'from-slate-500 to-slate-700',
      employees: 0,
      founded: new Date().getFullYear(),
      isCustom: true,
      registeredBy: verifiedUser?.id,
      registeredByName: verifiedUser?.fullName,
      createdAt: new Date().toISOString(),
    };

    // Save to IndexedDB
    await db.put('custom_companies', newCompany).catch(() => {});
    setCustomCompanies(prev => [...prev, newCompany]);
    setRegSuccess(newCompany);
    setRegStep('success');
  };

  const resetRegModal = () => {
    setShowRegisterModal(false);
    setRegStep('verify');
    setRegNumber('');
    setRegError('');
    setVerifiedUser(null);
    setCompanyForm({ name:'', shortName:'', gst:'', sector:'', stateId:'', stateName:'', district:'', city:'', adminPassword:'', description:'' });
    setFormErrors({});
    setRegSuccess(null);
  };

  const [search, setSearch] = useState('');
  const [loginModal, setLoginModal] = useState(null);
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');

  const stateData = selectedState ? allStates.find(s => s.id === selectedState) : null;
  const districts = selectedState ? Object.keys(hierarchy[selectedState]?.districts || {}) : [];
  const cities = selectedState && selectedDistrict
    ? Object.keys(hierarchy[selectedState]?.districts[selectedDistrict] || {}) : [];
  const orgsInCity = selectedState && selectedDistrict && selectedCity
    ? hierarchy[selectedState]?.districts[selectedDistrict]?.[selectedCity] || [] : [];

  const orgEmployees = selectedOrg
    ? (JSON.parse(typeof window !== 'undefined' ? localStorage.getItem('gov_portal_state') || '{}' : '{}')?.companyEmployees?.[selectedOrg.id] || [])
    : [];

  const level = !selectedState ? 'states' : !selectedDistrict ? 'districts' : !selectedCity ? 'cities' : !selectedOrg ? 'orgs' : 'employees';

  const handleAdminLogin = (e) => {
    e.preventDefault();
    if (loginPassword === loginModal.adminPassword) {
      setLoginError('');
      setLoginPassword('');
      const org = loginModal;
      setLoginModal(null);
      router.push(`/company/${org.id}`);
    } else {
      setLoginError('Incorrect admin password.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gradient-to-r from-gray-800 to-gray-900 text-white py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-start justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-extrabold mb-2">🏢 Private Organisation Directory</h1>
              <p className="text-gray-300 text-sm">State → District → City → Company → Employee List (salary hidden)</p>
              <div className="flex gap-4 mt-4 flex-wrap">
                <div className="bg-white/10 rounded-xl px-4 py-2 text-center">
                  <p className="text-xl font-bold">{statesWithOrgs.length}</p>
                  <p className="text-xs text-gray-300">States</p>
                </div>
                <div className="bg-white/10 rounded-xl px-4 py-2 text-center">
                  <p className="text-xl font-bold">{privateOrgs.length + customCompanies.length}</p>
                  <p className="text-xs text-gray-300">Companies</p>
                </div>
              </div>
            </div>

            {/* Register Company Button — only for logged-in public users */}
            {user && (
              <button
                onClick={() => { setShowRegisterModal(true); setRegStep('verify'); setRegError(''); setRegNumber(''); }}
                className="bg-green-500 hover:bg-green-400 text-white font-bold px-5 py-3 rounded-xl transition-colors flex items-center gap-2 self-start mt-2 shadow-lg"
              >
                🏭 Register Your Company
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm mb-5 flex-wrap">
          {[
            { label: '🗺️ All States', action: () => { setSelectedState(null); setSelectedDistrict(null); setSelectedCity(null); setSelectedOrg(null); }, active: level === 'states' },
            selectedState && stateData && { label: `${stateData.emoji} ${stateData.name}`, action: () => { setSelectedDistrict(null); setSelectedCity(null); setSelectedOrg(null); }, active: level === 'districts' },
            selectedDistrict && { label: `📍 ${selectedDistrict}`, action: () => { setSelectedCity(null); setSelectedOrg(null); }, active: level === 'cities' },
            selectedCity && { label: `🏙️ ${selectedCity}`, action: () => setSelectedOrg(null), active: level === 'orgs' },
            selectedOrg && { label: `${selectedOrg.icon} ${selectedOrg.shortName}`, action: null, active: true },
          ].filter(Boolean).map((item, i, arr) => (
            <span key={i} className="flex items-center gap-1">
              {i > 0 && <span className="text-gray-400">/</span>}
              <button
                onClick={item.action || undefined}
                disabled={!item.action || item.active}
                className={`font-semibold transition-colors ${item.active ? 'text-gray-800' : 'text-blue-600 hover:text-blue-800'}`}
              >
                {item.label}
              </button>
            </span>
          ))}
        </div>

        {/* LEVEL 1 — States */}
        {level === 'states' && (
          <>
            <h2 className="font-bold text-gray-700 mb-4 text-lg">Select a State</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 mb-8">
              {allStates.filter(s => statesWithOrgs.includes(s.id)).map(state => {
                const orgCount = Object.values(hierarchy[state.id]?.districts || {})
                  .flatMap(d => Object.values(d)).flat().length;
                const distCount = Object.keys(hierarchy[state.id]?.districts || {}).length;
                return (
                  <div key={state.id} onClick={() => setSelectedState(state.id)}
                    className="card-hover bg-white rounded-2xl overflow-hidden shadow-md border border-gray-100">
                    <div className={`bg-gradient-to-br ${state.color} h-20 flex items-center justify-center`}>
                      <span className="text-4xl">{state.emoji}</span>
                    </div>
                    <div className="p-3">
                      <h3 className="font-bold text-gray-800 text-sm">{state.name}</h3>
                      <div className="flex justify-between mt-1.5 text-xs text-gray-500">
                        <span>{distCount} District{distCount > 1 ? 's' : ''}</span>
                        <span className="font-semibold text-blue-600">{orgCount} Co.</span>
                      </div>
                      <div className="mt-2 pt-2 border-t border-gray-100 flex justify-between">
                        <span className="text-xs text-orange-600 font-semibold">View</span>
                        <span className="text-orange-500 text-xs">→</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}

        {/* LEVEL 2 — Districts */}
        {level === 'districts' && stateData && (
          <>
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-bold text-gray-700 text-lg">{stateData.emoji} {stateData.name} — Select District</h2>
              <span className="text-xs text-gray-400 bg-gray-100 px-3 py-1 rounded-full">{districts.length} district{districts.length > 1 ? 's' : ''}</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {districts.map(dist => {
                const cityCount = Object.keys(hierarchy[selectedState].districts[dist]).length;
                const orgCount = Object.values(hierarchy[selectedState].districts[dist]).flat().length;
                return (
                  <div key={dist} onClick={() => setSelectedDistrict(dist)}
                    className="card-hover bg-white rounded-xl border border-gray-100 shadow-sm p-5 cursor-pointer hover:border-orange-300">
                    <div className="text-3xl mb-2">📍</div>
                    <h3 className="font-bold text-gray-800 text-base">{dist}</h3>
                    <div className="mt-2 flex justify-between text-xs text-gray-500">
                      <span>{cityCount} city</span>
                      <span className="font-semibold text-blue-600">{orgCount} companies</span>
                    </div>
                    <div className="mt-3 pt-2 border-t border-gray-100 flex justify-between">
                      <span className="text-xs text-orange-600 font-semibold">View</span>
                      <span className="text-orange-500 text-xs">→</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}

        {/* LEVEL 3 — Cities */}
        {level === 'cities' && (
          <>
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-bold text-gray-700 text-lg">📍 {selectedDistrict} — Select City</h2>
              <span className="text-xs text-gray-400 bg-gray-100 px-3 py-1 rounded-full">{cities.length} city</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {cities.map(city => {
                const orgCount = (hierarchy[selectedState]?.districts[selectedDistrict]?.[city] || []).length;
                return (
                  <div key={city} onClick={() => setSelectedCity(city)}
                    className="card-hover bg-white rounded-xl border border-gray-100 shadow-sm p-5 cursor-pointer hover:border-orange-300">
                    <div className="text-3xl mb-2">🏙️</div>
                    <h3 className="font-bold text-gray-800 text-base">{city}</h3>
                    <div className="mt-2 text-xs text-blue-600 font-semibold">{orgCount} companies</div>
                    <div className="mt-3 pt-2 border-t border-gray-100 flex justify-between">
                      <span className="text-xs text-orange-600 font-semibold">View</span>
                      <span className="text-orange-500 text-xs">→</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}

        {/* LEVEL 4 — Company Cards */}
        {level === 'orgs' && (
          <>
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-bold text-gray-700 text-lg">🏙️ {selectedCity} — Companies</h2>
              <span className="text-xs text-gray-400 bg-gray-100 px-3 py-1 rounded-full">{orgsInCity.length} companies</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {orgsInCity.map(org => {
                const storedState = typeof window !== 'undefined'
                  ? JSON.parse(localStorage.getItem('gov_portal_state') || '{}')
                  : {};
                const empCount = (storedState.companyEmployees?.[org.id] || []).length;
                return (
                  <div key={org.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                    <div className={`bg-gradient-to-br ${org.color} h-24 flex items-center justify-center`}>
                      <span className="text-5xl">{org.icon}</span>
                    </div>
                    <div className="p-4">
                      <h3 className="font-bold text-gray-800 text-sm leading-tight mb-0.5">{org.shortName}</h3>
                      <p className="text-xs text-gray-400 mb-2 truncate">{org.name}</p>
                      <div className="space-y-1 mb-3 text-xs text-gray-500">
                        <div className="flex gap-1.5"><span>🏭</span><span>{org.sector}</span></div>
                        <div className="flex gap-1.5"><span>🔢</span><span className="font-mono">{org.gst}</span></div>
                        <div className="flex gap-1.5"><span>👥</span><span>{org.employees.toLocaleString('en-IN')} total employees</span></div>
                      </div>
                      {empCount > 0 && (
                        <div className="bg-blue-50 rounded-lg px-2 py-1 mb-2 flex items-center gap-1.5 text-xs text-blue-700">
                          <span className="w-1.5 h-1.5 bg-blue-500 rounded-full" />
                          {empCount} registered in portal
                        </div>
                      )}
                      <div className="flex gap-2">
                        <button onClick={() => setSelectedOrg(org)}
                          className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-semibold py-2 rounded-lg transition-colors">
                          👔 Employees
                        </button>
                        <button onClick={() => { setLoginModal(org); setLoginPassword(''); setLoginError(''); }}
                          className="flex-1 bg-gray-800 hover:bg-gray-700 text-white text-xs font-semibold py-2 rounded-lg transition-colors">
                          🔐 Admin
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}

        {/* LEVEL 5 — Employee List (salary masked) */}
        {level === 'employees' && selectedOrg && (
          <>
            <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
              <div className="flex items-center gap-3">
                <button onClick={() => setSelectedOrg(null)}
                  className="text-sm text-blue-600 hover:text-blue-800 bg-blue-50 px-3 py-1.5 rounded-lg font-medium">
                  ← Companies
                </button>
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{selectedOrg.icon}</span>
                  <div>
                    <h2 className="font-bold text-gray-800">{selectedOrg.name}</h2>
                    <p className="text-xs text-gray-500">{selectedOrg.city} · {orgEmployees.length} registered employees</p>
                  </div>
                </div>
              </div>
              <button onClick={() => { setLoginModal(selectedOrg); setLoginPassword(''); setLoginError(''); }}
                className="bg-gray-800 hover:bg-gray-700 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors flex items-center gap-2">
                🔐 Admin Login
              </button>
            </div>

            {orgEmployees.length === 0 ? (
              <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center text-gray-400">
                <div className="text-5xl mb-3">👥</div>
                <p className="font-medium">No employees registered yet.</p>
                <p className="text-xs mt-1">Login as admin to add employees.</p>
              </div>
            ) : (
              <>
                <div className="bg-amber-50 border border-amber-100 rounded-xl p-3 mb-4 flex gap-2 text-xs text-amber-700">
                  <span>🔒</span>
                  <span>Salary is hidden. Only the Company Admin can view salary details.</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {orgEmployees.map(emp => (
                    <div key={emp.pan} className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
                      <div className="flex items-center gap-3 mb-3">
                        <div className={`w-10 h-10 bg-gradient-to-br ${selectedOrg.color} rounded-full flex items-center justify-center text-white font-bold text-sm`}>
                          {emp.name.split(' ').map(n => n[0]).slice(0, 2).join('')}
                        </div>
                        <div>
                          <p className="font-bold text-gray-800 text-sm">{emp.name}</p>
                          <p className="text-xs text-gray-500">{emp.designation}</p>
                        </div>
                      </div>
                      <div className="space-y-1 text-xs text-gray-500">
                        <div className="flex gap-1.5"><span>🏢</span><span>{emp.department}</span></div>
                        <div className="flex gap-1.5"><span>📅</span><span>Joined {emp.joiningDate}</span></div>
                        <div className="flex gap-1.5"><span>🪪</span><span className="font-mono">{emp.pan?.slice(0, 5)}*****</span></div>
                      </div>
                      <div className="mt-3 pt-3 border-t border-gray-100 flex justify-between items-center">
                        <span className="text-sm font-bold text-gray-500">₹ **,***</span>
                        <span className="bg-green-100 text-green-700 text-xs px-2 py-0.5 rounded-full font-medium">Active</span>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </>
        )}
      </div>

      {/* Admin Login Modal */}
      {loginModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setLoginModal(null)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden" onClick={e => e.stopPropagation()}>
            <div className={`bg-gradient-to-r ${loginModal.color} p-6 text-white`}>
              <div className="flex items-center gap-3">
                <span className="text-3xl">{loginModal.icon}</span>
                <div>
                  <h2 className="text-xl font-bold">{loginModal.shortName}</h2>
                  <p className="text-white/70 text-sm">Admin Portal Access</p>
                </div>
              </div>
            </div>
            <form onSubmit={handleAdminLogin} className="p-6">
              <div className="mb-4">
                <label className="form-label">GST Number (readonly)</label>
                <input value={loginModal.gst} readOnly className="form-input bg-gray-50 text-gray-500 font-mono text-sm" />
              </div>
              <div className="mb-4">
                <label className="form-label">Admin Password *</label>
                <input type="password" value={loginPassword} onChange={e => setLoginPassword(e.target.value)}
                  placeholder="Enter admin password" className={`form-input ${loginError ? 'border-red-400' : ''}`} autoFocus />
                {loginError && <p className="text-red-500 text-xs mt-1">❌ {loginError}</p>}
              </div>
              <p className="text-xs text-gray-400 mb-4">Demo: <code className="bg-gray-100 px-1 rounded">{loginModal.adminPassword}</code></p>
              <div className="flex gap-3">
                <button type="button" onClick={() => setLoginModal(null)}
                  className="flex-1 border border-gray-300 text-gray-700 py-2.5 rounded-xl font-semibold text-sm hover:bg-gray-50">
                  Cancel
                </button>
                <button type="submit"
                  className="flex-1 bg-gray-800 hover:bg-gray-700 text-white py-2.5 rounded-xl font-bold text-sm transition-colors">
                  🔐 Login
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Register Company Modal */}
      {showRegisterModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden">

            {/* Header */}
            <div className="bg-gradient-to-r from-green-600 to-emerald-700 px-6 py-5 flex items-center justify-between text-white">
              <div className="flex items-center gap-3">
                <span className="text-2xl">🏭</span>
                <div>
                  <h2 className="text-lg font-extrabold">Register Your Company</h2>
                  <p className="text-green-100 text-xs">Verification required</p>
                </div>
              </div>
              <button onClick={resetRegModal} className="text-white/70 hover:text-white text-xl">✕</button>
            </div>

            <div className="p-6">

              {/* STEP 1 — Verify Registration Number */}
              {regStep === 'verify' && (
                <div className="space-y-4">
                  <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-sm text-blue-700">
                    <p className="font-semibold mb-1">📋 Eligibility Check</p>
                    <p>Enter your Registration Number (Mobile Number used during sign-up). The system will verify you are not a government employee before allowing company registration.</p>
                  </div>
                  <div>
                    <label className="form-label">Your Registration Number *</label>
                    <input
                      type="tel"
                      value={regNumber}
                      onChange={e => { setRegNumber(e.target.value); setRegError(''); }}
                      onKeyDown={e => e.key === 'Enter' && handleVerify()}
                      placeholder="Your registered Mobile Number"
                      className={`form-input text-lg font-mono ${regError ? 'border-red-400' : ''}`}
                      maxLength={12}
                      autoFocus
                    />
                  </div>
                  {regError && (
                    <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                      <p className="text-red-700 text-sm">{regError}</p>
                    </div>
                  )}
                  <button onClick={handleVerify}
                    className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-xl transition-colors flex items-center justify-center gap-2">
                    🔍 Verify &amp; Continue
                  </button>
                  <p className="text-xs text-gray-400 text-center">
                    Government employees are not eligible to register private companies.
                  </p>
                </div>
              )}

              {/* STEP 2 — Company Details Form */}
              {regStep === 'form' && verifiedUser && (
                <div className="space-y-4">
                  <div className="bg-green-50 border border-green-200 rounded-xl p-3 flex items-center gap-2">
                    <span className="text-green-600 text-xl">✅</span>
                    <div>
                      <p className="text-green-800 font-semibold text-sm">Verified: {verifiedUser.fullName}</p>
                      <p className="text-green-600 text-xs">Not a government employee — eligible to register</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="col-span-2">
                      <label className="form-label">Company Full Name *</label>
                      <input value={companyForm.name} onChange={e => setCompanyForm(p=>({...p,name:e.target.value}))}
                        placeholder="e.g. Sharma Technologies Pvt Ltd" className={`form-input ${formErrors.name?'border-red-400':''}`} />
                      {formErrors.name && <p className="text-red-500 text-xs mt-1">⚠ {formErrors.name}</p>}
                    </div>
                    <div>
                      <label className="form-label">Short Name / Abbr.</label>
                      <input value={companyForm.shortName} onChange={e => setCompanyForm(p=>({...p,shortName:e.target.value}))}
                        placeholder="e.g. STP" className="form-input" />
                    </div>
                    <div>
                      <label className="form-label">GST Number *</label>
                      <input value={companyForm.gst} onChange={e => setCompanyForm(p=>({...p,gst:e.target.value.toUpperCase()}))}
                        placeholder="27AAAAA0000A1Z5" maxLength={15}
                        className={`form-input font-mono ${formErrors.gst?'border-red-400':''}`} />
                      {formErrors.gst && <p className="text-red-500 text-xs mt-1">⚠ {formErrors.gst}</p>}
                    </div>
                    <div className="col-span-2">
                      <label className="form-label">Sector / Industry *</label>
                      <select value={companyForm.sector} onChange={e => setCompanyForm(p=>({...p,sector:e.target.value}))}
                        className={`form-input ${formErrors.sector?'border-red-400':''}`}>
                        <option value="">-- Select Sector --</option>
                        {COMPANY_SECTORS.map(s => <option key={s}>{s}</option>)}
                      </select>
                      {formErrors.sector && <p className="text-red-500 text-xs mt-1">⚠ {formErrors.sector}</p>}
                    </div>
                    <div>
                      <label className="form-label">State *</label>
                      <select value={companyForm.stateId} onChange={e => setCompanyForm(p=>({...p,stateId:e.target.value}))}
                        className={`form-input ${formErrors.stateId?'border-red-400':''}`}>
                        <option value="">-- Select State --</option>
                        {STATE_LIST.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                      {formErrors.stateId && <p className="text-red-500 text-xs mt-1">⚠ {formErrors.stateId}</p>}
                    </div>
                    <div>
                      <label className="form-label">District *</label>
                      <input value={companyForm.district} onChange={e => setCompanyForm(p=>({...p,district:e.target.value}))}
                        placeholder="District" className={`form-input ${formErrors.district?'border-red-400':''}`} />
                      {formErrors.district && <p className="text-red-500 text-xs mt-1">⚠ {formErrors.district}</p>}
                    </div>
                    <div>
                      <label className="form-label">City *</label>
                      <input value={companyForm.city} onChange={e => setCompanyForm(p=>({...p,city:e.target.value}))}
                        placeholder="City" className={`form-input ${formErrors.city?'border-red-400':''}`} />
                      {formErrors.city && <p className="text-red-500 text-xs mt-1">⚠ {formErrors.city}</p>}
                    </div>
                    <div>
                      <label className="form-label">Company Admin Password *</label>
                      <input type="password" value={companyForm.adminPassword} onChange={e => setCompanyForm(p=>({...p,adminPassword:e.target.value}))}
                        placeholder="Min 6 characters" className={`form-input ${formErrors.adminPassword?'border-red-400':''}`} />
                      {formErrors.adminPassword && <p className="text-red-500 text-xs mt-1">⚠ {formErrors.adminPassword}</p>}
                    </div>
                    <div className="col-span-2">
                      <label className="form-label">Description <span className="text-gray-400 font-normal">(optional)</span></label>
                      <textarea value={companyForm.description} onChange={e => setCompanyForm(p=>({...p,description:e.target.value}))}
                        rows={2} placeholder="Brief company description..." className="form-input resize-none" />
                    </div>
                  </div>

                  <div className="flex gap-3 pt-2">
                    <button onClick={() => setRegStep('verify')}
                      className="flex-1 border-2 border-gray-300 text-gray-700 py-2.5 rounded-xl font-semibold hover:bg-gray-50">
                      ← Back
                    </button>
                    <button onClick={handleCreateCompany}
                      className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold py-2.5 rounded-xl transition-colors">
                      🏭 Register Company
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 3 — Success */}
              {regStep === 'success' && regSuccess && (
                <div className="text-center py-4">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-3xl">🎉</span>
                  </div>
                  <h3 className="text-xl font-extrabold text-gray-800 mb-2">Company Registered!</h3>
                  <p className="text-gray-500 text-sm mb-5">
                    <strong>{regSuccess.name}</strong> has been successfully registered and is now listed in the directory.
                  </p>
                  <div className="bg-gray-50 rounded-xl p-4 text-left space-y-2 mb-5">
                    {[
                      ['Company Name', regSuccess.name],
                      ['GST Number', regSuccess.gst],
                      ['Sector', regSuccess.sector],
                      ['Location', `${regSuccess.city}, ${regSuccess.district}, ${regSuccess.stateName}`],
                      ['Admin Password', '••••••• (saved securely)'],
                    ].map(([k,v]) => (
                      <div key={k} className="flex justify-between text-sm">
                        <span className="text-gray-500">{k}</span>
                        <span className="font-semibold text-gray-700">{v}</span>
                      </div>
                    ))}
                  </div>
                  <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-700 mb-4">
                    💡 Use your Admin Password to login to the company dashboard and manage employees.
                  </div>
                  <button onClick={resetRegModal}
                    className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-xl transition-colors">
                    ✅ Done — View in Directory
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
