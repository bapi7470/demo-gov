import { useState } from 'react';
import { useRouter } from 'next/router';
import { privateOrgs } from '../../data/privateOrgs';
import { useApp } from '../../context/AppContext';

const DESIGNATIONS = ['Software Engineer', 'Senior Engineer', 'Manager', 'Senior Manager', 'Director', 'VP', 'Analyst', 'Consultant', 'Executive', 'Associate', 'Team Lead', 'Project Manager', 'HR Executive', 'Finance Officer', 'Operations Manager'];
const DEPARTMENTS = ['Engineering', 'Product', 'Sales', 'Marketing', 'HR', 'Finance', 'Operations', 'Legal', 'Admin', 'Customer Support'];

export default function CompanyDashboard() {
  const router = useRouter();
  const { orgId } = router.query;
  const { getCompanyEmployees, addCompanyEmployee, removeCompanyEmployee, getBeneficiaryByPan } = useApp();

  const org = privateOrgs.find((o) => o.id === orgId);
  const employees = orgId ? getCompanyEmployees(orgId) : [];

  const [showAddForm, setShowAddForm] = useState(false);
  const [addForm, setAddForm] = useState({ pan: '', name: '', designation: '', department: '', salary: '', joiningDate: '', email: '', mobile: '' });
  const [addErrors, setAddErrors] = useState({});
  const [panCheckResult, setPanCheckResult] = useState(null);
  const [removeConfirm, setRemoveConfirm] = useState(null);
  const [actionLog, setActionLog] = useState([]);
  const [search, setSearch] = useState('');

  // While orgId is not yet available from router (SSR hydration)
  if (!orgId) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-4xl animate-spin">⏳</div>
      </div>
    );
  }

  if (!org) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">😕</div>
          <h2 className="text-2xl font-bold text-gray-700">Company not found</h2>
          <button onClick={() => router.push('/private-portal')} className="btn-primary mt-4">← Back</button>
        </div>
      </div>
    );
  }

  const handlePanCheck = (pan) => {
    if (pan.length < 10) { setPanCheckResult(null); return; }
    const beneficiary = getBeneficiaryByPan(pan.toUpperCase());
    if (beneficiary) {
      setPanCheckResult({
        found: true,
        name: beneficiary.name,
        schemes: beneficiary.schemes,
        status: beneficiary.status,
        note: `⚠️ This person is registered for ${beneficiary.schemes.length} government scheme(s). Adding them will auto-deactivate their benefits.`,
      });
    } else {
      setPanCheckResult({ found: false, note: '✅ No active government scheme benefits linked to this PAN.' });
    }
  };

  const validateAdd = () => {
    const errs = {};
    if (!addForm.pan || addForm.pan.length !== 10) errs.pan = 'Valid 10-digit PAN required';
    if (!addForm.name) errs.name = 'Name is required';
    if (!addForm.designation) errs.designation = 'Designation is required';
    if (!addForm.department) errs.department = 'Department is required';
    if (!addForm.salary || isNaN(addForm.salary)) errs.salary = 'Valid salary required';
    if (!addForm.joiningDate) errs.joiningDate = 'Joining date is required';
    return errs;
  };

  const handleAddEmployee = (e) => {
    e.preventDefault();
    const errs = validateAdd();
    if (Object.keys(errs).length > 0) { setAddErrors(errs); return; }

    addCompanyEmployee(orgId, org.name, { ...addForm, salary: parseInt(addForm.salary) });

    const deactivated = panCheckResult?.found ? panCheckResult.schemes.map((s) => s.name).join(', ') : null;
    setActionLog((prev) => [
      {
        time: new Date().toLocaleTimeString('en-IN'),
        action: 'ADD',
        name: addForm.name,
        pan: addForm.pan.toUpperCase(),
        detail: deactivated ? `Scheme benefits deactivated: ${deactivated}` : 'No scheme impact',
        color: 'text-green-700',
        bg: 'bg-green-50',
      },
      ...prev,
    ]);

    setAddForm({ pan: '', name: '', designation: '', department: '', salary: '', joiningDate: '', email: '', mobile: '' });
    setAddErrors({});
    setPanCheckResult(null);
    setShowAddForm(false);
  };

  const handleRemove = (emp) => {
    const beneficiary = getBeneficiaryByPan(emp.pan);
    removeCompanyEmployee(orgId, emp.pan);

    const reactivated = beneficiary?.schemes?.map((s) => s.name).join(', ');
    setActionLog((prev) => [
      {
        time: new Date().toLocaleTimeString('en-IN'),
        action: 'REMOVE',
        name: emp.name,
        pan: emp.pan,
        detail: reactivated ? `Scheme benefits reactivated: ${reactivated}` : 'No scheme impact',
        color: 'text-red-700',
        bg: 'bg-red-50',
      },
      ...prev,
    ]);
    setRemoveConfirm(null);
  };

  const filteredEmployees = employees.filter((e) =>
    e.name.toLowerCase().includes(search.toLowerCase()) ||
    e.designation.toLowerCase().includes(search.toLowerCase()) ||
    e.department.toLowerCase().includes(search.toLowerCase()) ||
    e.pan.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className={`bg-gradient-to-r ${org.color} text-white py-8`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <button onClick={() => router.push('/private-portal')} className="inline-flex items-center gap-2 text-white/70 hover:text-white text-sm mb-4 transition-colors">
            ← Back to Companies
          </button>
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center text-3xl">{org.icon}</div>
              <div>
                <h1 className="text-2xl font-extrabold">{org.name}</h1>
                <p className="text-white/70 text-sm">GST: {org.gst} · {org.city} · {org.sector}</p>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="bg-white/20 rounded-xl px-4 py-2 text-center">
                <p className="text-2xl font-bold">{employees.length}</p>
                <p className="text-xs text-white/70">Registered</p>
              </div>
              <div className="bg-white/20 rounded-xl px-4 py-2 text-center">
                <p className="text-2xl font-bold">{employees.filter((e) => getBeneficiaryByPan(e.pan)).length}</p>
                <p className="text-xs text-white/70">Scheme Impact</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Notice */}
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 mb-6 flex gap-3">
          <span className="text-xl">⚖️</span>
          <div>
            <p className="font-semibold text-amber-800 text-sm">Scheme Auto-Sync Policy</p>
            <p className="text-amber-700 text-xs mt-0.5">
              Adding an employee whose PAN is linked to government welfare schemes (e.g. Jubo Shakti) will <strong>automatically deactivate</strong> their benefits.
              Removing or revoking access will <strong>automatically reactivate</strong> eligible benefits per scheme terms &amp; conditions.
            </p>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Employee List */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <div className="relative flex-1 max-w-xs">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">🔍</span>
                <input
                  type="text"
                  placeholder="Search employees..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="form-input pl-9 py-2 text-sm"
                />
              </div>
              <button
                onClick={() => { setShowAddForm(true); setAddErrors({}); setPanCheckResult(null); }}
                className="btn-primary text-sm"
              >
                + Add Employee
              </button>
            </div>

            {/* Add Employee Form */}
            {showAddForm && (
              <div className="bg-white rounded-2xl border-2 border-blue-200 shadow-md p-6">
                <div className="flex justify-between items-center mb-5">
                  <h3 className="font-bold text-gray-800">Add New Employee</h3>
                  <button onClick={() => setShowAddForm(false)} className="text-gray-400 hover:text-gray-600 text-xl">✕</button>
                </div>

                <form onSubmit={handleAddEmployee}>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* PAN with live check */}
                    <div className="sm:col-span-2">
                      <label className="form-label">PAN Card Number * <span className="text-xs font-normal text-gray-400">(auto-checks scheme eligibility)</span></label>
                      <input
                        type="text"
                        value={addForm.pan}
                        onChange={(e) => {
                          const v = e.target.value.toUpperCase().slice(0, 10);
                          setAddForm((p) => ({ ...p, pan: v }));
                          setAddErrors((p) => ({ ...p, pan: '' }));
                          handlePanCheck(v);
                        }}
                        placeholder="ABCDE1234F"
                        className={`form-input font-mono uppercase ${addErrors.pan ? 'border-red-400' : ''}`}
                      />
                      {addErrors.pan && <p className="text-red-500 text-xs mt-1">⚠ {addErrors.pan}</p>}
                      {panCheckResult && (
                        <div className={`mt-2 rounded-lg p-3 text-xs ${panCheckResult.found ? 'bg-amber-50 border border-amber-200' : 'bg-green-50 border border-green-200'}`}>
                          <p className={`font-semibold ${panCheckResult.found ? 'text-amber-700' : 'text-green-700'}`}>{panCheckResult.note}</p>
                          {panCheckResult.found && (
                            <ul className="mt-1.5 space-y-0.5">
                              {panCheckResult.schemes.map((s) => (
                                <li key={s.id} className="text-amber-600">• {s.name} ({s.benefit}) — will be deactivated</li>
                              ))}
                            </ul>
                          )}
                        </div>
                      )}
                    </div>

                    <div>
                      <label className="form-label">Full Name *</label>
                      <input type="text" value={addForm.name} onChange={(e) => setAddForm((p) => ({ ...p, name: e.target.value }))} className={`form-input ${addErrors.name ? 'border-red-400' : ''}`} placeholder="Rahul Kumar" />
                      {addErrors.name && <p className="text-red-500 text-xs mt-1">⚠ {addErrors.name}</p>}
                    </div>

                    <div>
                      <label className="form-label">Designation *</label>
                      <select value={addForm.designation} onChange={(e) => setAddForm((p) => ({ ...p, designation: e.target.value }))} className={`form-input ${addErrors.designation ? 'border-red-400' : ''}`}>
                        <option value="">-- Select --</option>
                        {DESIGNATIONS.map((d) => <option key={d}>{d}</option>)}
                      </select>
                      {addErrors.designation && <p className="text-red-500 text-xs mt-1">⚠ {addErrors.designation}</p>}
                    </div>

                    <div>
                      <label className="form-label">Department *</label>
                      <select value={addForm.department} onChange={(e) => setAddForm((p) => ({ ...p, department: e.target.value }))} className={`form-input ${addErrors.department ? 'border-red-400' : ''}`}>
                        <option value="">-- Select --</option>
                        {DEPARTMENTS.map((d) => <option key={d}>{d}</option>)}
                      </select>
                      {addErrors.department && <p className="text-red-500 text-xs mt-1">⚠ {addErrors.department}</p>}
                    </div>

                    <div>
                      <label className="form-label">Monthly Salary (₹) *</label>
                      <input type="number" value={addForm.salary} onChange={(e) => setAddForm((p) => ({ ...p, salary: e.target.value }))} className={`form-input ${addErrors.salary ? 'border-red-400' : ''}`} placeholder="50000" />
                      {addErrors.salary && <p className="text-red-500 text-xs mt-1">⚠ {addErrors.salary}</p>}
                    </div>

                    <div>
                      <label className="form-label">Joining Date *</label>
                      <input type="date" value={addForm.joiningDate} onChange={(e) => setAddForm((p) => ({ ...p, joiningDate: e.target.value }))} className={`form-input ${addErrors.joiningDate ? 'border-red-400' : ''}`} />
                      {addErrors.joiningDate && <p className="text-red-500 text-xs mt-1">⚠ {addErrors.joiningDate}</p>}
                    </div>

                    <div>
                      <label className="form-label">Email</label>
                      <input type="email" value={addForm.email} onChange={(e) => setAddForm((p) => ({ ...p, email: e.target.value }))} className="form-input" placeholder="employee@company.com" />
                    </div>

                    <div>
                      <label className="form-label">Mobile</label>
                      <input type="tel" value={addForm.mobile} onChange={(e) => setAddForm((p) => ({ ...p, mobile: e.target.value }))} className="form-input" placeholder="9XXXXXXXXX" />
                    </div>
                  </div>

                  <div className="flex gap-3 mt-5 pt-4 border-t border-gray-100">
                    <button type="button" onClick={() => setShowAddForm(false)} className="flex-1 border border-gray-300 text-gray-700 py-2.5 rounded-xl font-semibold text-sm hover:bg-gray-50">Cancel</button>
                    <button type="submit" className="flex-1 bg-gray-800 hover:bg-gray-700 text-white py-2.5 rounded-xl font-bold text-sm transition-colors flex items-center justify-center gap-2">
                      ✅ Confirm Add Employee
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Employee Table */}
            {filteredEmployees.length === 0 ? (
              <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center text-gray-400">
                <div className="text-5xl mb-3">👥</div>
                <p className="font-medium">{employees.length === 0 ? 'No employees registered yet. Add your first employee.' : 'No results found.'}</p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredEmployees.map((emp) => {
                  const beneficiary = getBeneficiaryByPan(emp.pan);
                  return (
                    <div key={emp.pan} className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-gray-700 to-gray-900 rounded-full flex items-center justify-center text-white font-bold text-sm">
                            {emp.name.split(' ').map((n) => n[0]).slice(0, 2).join('')}
                          </div>
                          <div>
                            <p className="font-semibold text-gray-800 text-sm">{emp.name}</p>
                            <p className="text-xs text-gray-500">{emp.designation} · {emp.department}</p>
                            <p className="text-xs font-mono text-gray-400 mt-0.5">{emp.pan}</p>
                          </div>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <p className="font-bold text-green-700 text-sm">₹{parseInt(emp.salary).toLocaleString('en-IN')}/mo</p>
                          <p className="text-xs text-gray-400">Since {emp.joiningDate}</p>
                        </div>
                      </div>

                      {beneficiary && (
                        <div className="mt-2 bg-amber-50 border border-amber-100 rounded-lg p-2 flex items-start gap-2">
                          <span className="text-xs">⚠️</span>
                          <div className="text-xs text-amber-700">
                            <span className="font-semibold">Scheme impact: </span>
                            {beneficiary.schemes.map((s) => s.name).join(', ')} — <span className="font-semibold text-red-600">SUSPENDED</span>
                          </div>
                        </div>
                      )}

                      <div className="mt-3 flex justify-end">
                        <button
                          onClick={() => setRemoveConfirm(emp)}
                          className="text-xs text-red-600 hover:text-red-700 border border-red-200 hover:border-red-300 px-3 py-1 rounded-lg transition-colors font-medium"
                        >
                          🗑 Remove Employee
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Sidebar: Activity Log */}
          <div className="lg:col-span-1 space-y-4">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <h3 className="font-bold text-gray-700 mb-3 text-sm">📋 Activity Log</h3>
              {actionLog.length === 0 ? (
                <p className="text-xs text-gray-400 text-center py-6">No actions yet in this session.</p>
              ) : (
                <div className="space-y-2 max-h-80 overflow-y-auto">
                  {actionLog.map((log, i) => (
                    <div key={i} className={`${log.bg} rounded-lg p-2.5`}>
                      <div className="flex items-center justify-between mb-0.5">
                        <span className={`text-xs font-bold ${log.color}`}>{log.action === 'ADD' ? '+ Added' : '− Removed'}: {log.name}</span>
                        <span className="text-xs text-gray-400">{log.time}</span>
                      </div>
                      <p className="text-xs text-gray-500">PAN: {log.pan}</p>
                      <p className={`text-xs font-medium mt-0.5 ${log.color}`}>{log.detail}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4">
              <h3 className="font-bold text-blue-800 text-sm mb-2">🔄 How Scheme Sync Works</h3>
              <div className="space-y-2 text-xs text-blue-700">
                <div className="flex gap-2">
                  <span className="mt-0.5">1️⃣</span>
                  <p>Employee added → PAN matched against scheme database</p>
                </div>
                <div className="flex gap-2">
                  <span className="mt-0.5">2️⃣</span>
                  <p>Matching schemes (Jubo Shakti etc.) auto-deactivated</p>
                </div>
                <div className="flex gap-2">
                  <span className="mt-0.5">3️⃣</span>
                  <p>Employee removed → schemes auto-reactivated if eligible</p>
                </div>
                <div className="flex gap-2">
                  <span className="mt-0.5">4️⃣</span>
                  <p>All changes logged for government audit</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 p-4">
              <h3 className="font-bold text-gray-700 text-sm mb-2">📊 Summary</h3>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Total Employees</span>
                  <span className="font-bold">{employees.length}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">With Scheme Impact</span>
                  <span className="font-bold text-amber-600">{employees.filter((e) => getBeneficiaryByPan(e.pan)).length}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Monthly Payroll</span>
                  <span className="font-bold text-green-700">
                    ₹{employees.reduce((sum, e) => sum + parseInt(e.salary || 0), 0).toLocaleString('en-IN')}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Remove Confirm Modal */}
      {removeConfirm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6">
            <div className="text-center mb-4">
              <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-2xl">⚠️</span>
              </div>
              <h3 className="font-bold text-gray-800">Remove Employee?</h3>
              <p className="text-gray-500 text-sm mt-1">{removeConfirm.name} ({removeConfirm.pan})</p>
            </div>

            {getBeneficiaryByPan(removeConfirm.pan) && (
              <div className="bg-green-50 border border-green-200 rounded-xl p-3 mb-4 text-center">
                <p className="text-green-700 text-sm font-semibold">🔄 Scheme Auto-Reactivation</p>
                <p className="text-green-600 text-xs mt-1">
                  {getBeneficiaryByPan(removeConfirm.pan).schemes.map((s) => s.name).join(', ')} will be <strong>automatically reactivated</strong>.
                </p>
              </div>
            )}

            <div className="flex gap-3">
              <button onClick={() => setRemoveConfirm(null)} className="flex-1 border border-gray-300 text-gray-700 py-2.5 rounded-xl font-semibold text-sm hover:bg-gray-50">Cancel</button>
              <button onClick={() => handleRemove(removeConfirm)} className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2.5 rounded-xl font-bold text-sm transition-colors">
                Confirm Remove
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
