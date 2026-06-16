import { useState, useEffect } from 'react';
import { getDistrictsByState } from '../data/districts';

const ROLE_CONFIG = {
  'co-admin': { label: 'Co-Admin',  color: 'bg-purple-100 text-purple-800', icon: '👑', desc: 'District head — can manage Members & Elders' },
  'member':   { label: 'Member',    color: 'bg-blue-100 text-blue-800',     icon: '👤', desc: 'Can verify and review applications' },
  'elder':    { label: 'Elder',     color: 'bg-green-100 text-green-800',   icon: '🏅', desc: 'Can verify and review applications' },
};

export default function DistrictRolesManager({ adminInfo }) {
  const stateId      = adminInfo?.stateId;
  const isCoadmin    = adminInfo?.districtRole === 'co-admin';
  const isStateAdmin = !isCoadmin;
  // Dynamic districts for this state
  const STATE_DISTRICTS = getDistrictsByState(stateId);

  const [roles, setRoles] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingRole, setEditingRole] = useState(null);
  const [form, setForm] = useState({ fullName:'', username:'', password:'', role:'member', district:'', mobile:'' });
  const [formErrors, setFormErrors] = useState({});
  const [search, setSearch] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [filterDistrict, setFilterDistrict] = useState('all');
  const [showResetModal, setShowResetModal] = useState(null);
  const [newPassword, setNewPassword] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    if (!stateId) return;
    fetch('/api/district-roles?stateId=' + stateId)
      .then(r => r.json())
      .then(data => {
        const all = Array.isArray(data) ? data : [];
        if (isCoadmin) {
          setRoles(all.filter(r => r.role !== 'co-admin' && r.district === adminInfo.district));
        } else {
          setRoles(all);
        }
      })
      .catch(() => setRoles([]));
  }, [stateId]);

  const refresh = () => {
    if (!stateId) return;
    fetch('/api/district-roles?stateId=' + stateId)
      .then(r => r.json())
      .then(data => {
        const all = Array.isArray(data) ? data : [];
        setRoles(isCoadmin ? all.filter(r => r.role !== 'co-admin' && r.district === adminInfo.district) : all);
      })
      .catch(() => {});
  };

  const validate = () => {
    const e = {};
    if (!form.fullName.trim())  e.fullName  = 'Full name required';
    if (!form.username.trim())  e.username  = 'Username required';
    if (!editingRole && !form.password) e.password = 'Password required (min 6 chars)';
    if (!editingRole && form.password.length < 6) e.password = 'Password min 6 characters';
    if (!form.role)             e.role      = 'Role required';
    if (!form.district)         e.district  = 'District required';
    // Check duplicate username
    const dup = roles.find(r => r.username === form.username.trim() && r.id !== editingRole?.id);
    if (dup) e.username = 'Username already exists';
    return e;
  };

  const handleSave = async () => {
    const errs = validate();
    if (Object.keys(errs).length) { setFormErrors(errs); return; }

    if (editingRole) {
      const updated = {
        ...editingRole,
        fullName: form.fullName.trim(),
        username: form.username.trim(),
        mobile:   form.mobile.trim(),
        role:     form.role,
        district: form.district,
        ...(form.password ? { password: form.password } : {}),
        updatedAt: new Date().toISOString().split('T')[0],
      };
      await fetch('/api/district-roles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...updated, stateId: adminInfo.stateId }),
      });
      setSuccessMsg(`✅ "${updated.fullName}" updated.`);
    } else {
      const newRole = {
        id:        `dist_${Date.now()}`,
        fullName:  form.fullName.trim(),
        username:  form.username.trim(),
        password:  form.password,
        mobile:    form.mobile.trim(),
        role:      form.role,
        district:  form.district,
        stateId,
        stateName: adminInfo?.stateName || '',
        createdBy: adminInfo?.username || 'state_admin',
        createdAt: new Date().toISOString().split('T')[0],
        isActive:  true,
      };
      await fetch('/api/district-roles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...newRole, stateId: adminInfo.stateId }),
      });
      setSuccessMsg(`✅ "${newRole.fullName}" (${newRole.role}) created for ${newRole.district}.`);
    }
    refresh();
    setShowForm(false); setEditingRole(null);
    setForm({ fullName:'', username:'', password:'', role:'member', district:'', mobile:'' });
    setFormErrors({});
    setTimeout(() => setSuccessMsg(''), 4000);
  };

  const handleEdit = (role) => {
    setEditingRole(role);
    setForm({ fullName: role.fullName, username: role.username, password: '', role: role.role, district: role.district, mobile: role.mobile || '' });
    setFormErrors({});
    setShowForm(true);
  };

  const handleDelete = async (role) => {
    if (!window.confirm(`Delete "${role.fullName}" (${role.role})? This cannot be undone.`)) return;
    await fetch('/api/district-roles?id=' + role.id, { method: 'DELETE' });
    refresh();
    setSuccessMsg(`Deleted: ${role.fullName}`);
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  const handleResetPassword = async () => {
    if (!showResetModal || !newPassword || newPassword.length < 6) return;
    const updated = { ...showResetModal, password: newPassword, updatedAt: new Date().toISOString().split('T')[0] };
    await fetch('/api/district-roles', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...updated, stateId: adminInfo.stateId }),
    });
    refresh();
    setShowResetModal(null); setNewPassword('');
    setSuccessMsg(`✅ Password reset for "${updated.fullName}"`);
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  // Can this admin delete this role?
  const canDelete = (role) => {
    if (isCoadmin) return role.role !== 'co-admin';
    return true; // state admin can delete all
  };

  // Can this admin edit this role?
  const canEdit = (role) => {
    if (isCoadmin) return role.role !== 'co-admin';
    return true;
  };

  // Available roles for creation
  const availableRoles = isCoadmin
    ? [{ value:'member', label:'Member' }, { value:'elder', label:'Elder' }]
    : Object.entries(ROLE_CONFIG).map(([v,c]) => ({ value:v, label:c.label }));

  const allDistricts = [...new Set(roles.map(r => r.district))];

  const filtered = roles.filter(r => {
    const matchSearch = !search ||
      r.fullName?.toLowerCase().includes(search.toLowerCase()) ||
      r.username?.toLowerCase().includes(search.toLowerCase()) ||
      r.district?.toLowerCase().includes(search.toLowerCase());
    const matchRole     = filterRole     === 'all' || r.role     === filterRole;
    const matchDistrict = filterDistrict === 'all' || r.district === filterDistrict;
    return matchSearch && matchRole && matchDistrict;
  });

  return (
    <div className="space-y-5">
      {successMsg && (
        <div className="bg-green-50 border border-green-300 rounded-xl p-3 text-green-800 text-sm font-semibold flex items-center gap-2">
          {successMsg}
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-xl font-extrabold text-gray-800">👥 District Officials</h2>
          <p className="text-sm text-gray-500">
            {isCoadmin ? `Manage Members & Elders in your district` : `Create & manage Co-Admin, Member and Elder credentials`}
          </p>
        </div>
        <button onClick={() => { setShowForm(true); setEditingRole(null); setForm({ fullName:'', username:'', password:'', role: isCoadmin?'member':'co-admin', district: isCoadmin ? adminInfo.district : '', mobile:'' }); setFormErrors({}); }}
          className="bg-blue-700 hover:bg-blue-800 text-white font-bold px-5 py-2 rounded-xl transition-colors flex items-center gap-2 text-sm">
          + Create New
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        {Object.entries(ROLE_CONFIG).map(([role, cfg]) => {
          const count = roles.filter(r => r.role === role).length;
          if (isCoadmin && role === 'co-admin') return null;
          return (
            <div key={role} className={`rounded-xl p-3 text-center ${cfg.color.replace('text-','border-').replace('bg-','border-')} border bg-white`}>
              <div className="text-xl mb-0.5">{cfg.icon}</div>
              <div className="text-2xl font-bold text-gray-800">{count}</div>
              <div className="text-xs font-medium text-gray-500">{cfg.label}s</div>
            </div>
          );
        })}
      </div>

      {/* Search & Filter */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1 relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">🔍</span>
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search by name, username, district..." className="form-input pl-9 text-sm w-full" />
        </div>
        <select value={filterRole} onChange={e => setFilterRole(e.target.value)} className="form-input text-sm sm:w-36">
          <option value="all">All Roles</option>
          {Object.entries(ROLE_CONFIG).map(([v,c]) => <option key={v} value={v}>{c.label}</option>)}
        </select>
        {allDistricts.length > 1 && (
          <select value={filterDistrict} onChange={e => setFilterDistrict(e.target.value)} className="form-input text-sm sm:w-44">
            <option value="all">All Districts</option>
            {allDistricts.map(d => <option key={d} value={d}>{d}</option>)}
          </select>
        )}
      </div>

      {/* Role List */}
      {filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-10 text-center text-gray-400">
          <div className="text-4xl mb-2">👥</div>
          <p className="font-medium">{roles.length === 0 ? 'No officials created yet.' : 'No results found.'}</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map(role => {
            const cfg = ROLE_CONFIG[role.role];
            return (
              <div key={role.id} className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm flex items-center justify-between gap-4 flex-wrap">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                    {role.fullName?.charAt(0)?.toUpperCase()}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-bold text-gray-800 text-sm">{role.fullName}</p>
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${cfg.color}`}>
                        {cfg.icon} {cfg.label}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 mt-0.5">
                      <span className="font-mono bg-gray-100 px-1.5 py-0.5 rounded">{role.username}</span>
                      {' · '} 📍 {role.district}
                      {role.mobile && ` · 📱 ${role.mobile}`}
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">Created: {role.createdAt} · By: {role.createdBy}</p>
                  </div>
                </div>
                <div className="flex gap-2 flex-shrink-0">
                  <button onClick={() => { setShowResetModal(role); setNewPassword(''); }}
                    className="bg-amber-50 hover:bg-amber-100 text-amber-700 text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors">
                    🔑 Reset
                  </button>
                  {canEdit(role) && (
                    <button onClick={() => handleEdit(role)}
                      className="bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors">
                      ✏️ Edit
                    </button>
                  )}
                  {canDelete(role) && (
                    <button onClick={() => handleDelete(role)}
                      className="bg-red-50 hover:bg-red-100 text-red-600 text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors">
                      🗑
                    </button>
                  )}
                  {!canDelete(role) && (
                    <span className="bg-gray-100 text-gray-400 text-xs px-3 py-1.5 rounded-lg cursor-not-allowed">🔒</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create / Edit Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden">
            <div className="bg-gradient-to-r from-blue-700 to-indigo-800 p-5 flex items-center justify-between text-white">
              <h3 className="font-extrabold text-lg">{editingRole ? '✏️ Edit Official' : '+ Create New Official'}</h3>
              <button onClick={() => { setShowForm(false); setEditingRole(null); setFormErrors({}); }} className="text-white/70 hover:text-white text-xl">✕</button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="form-label">Full Name *</label>
                  <input value={form.fullName} onChange={e => { setForm(p=>({...p,fullName:e.target.value})); setFormErrors(p=>({...p,fullName:''})); }}
                    placeholder="e.g. Rahul Das" className={`form-input ${formErrors.fullName?'border-red-400':''}`} />
                  {formErrors.fullName && <p className="text-red-500 text-xs mt-1">⚠ {formErrors.fullName}</p>}
                </div>
                <div>
                  <label className="form-label">Username *</label>
                  <input value={form.username} onChange={e => { setForm(p=>({...p,username:e.target.value.toLowerCase().replace(/\s+/g,'_')})); setFormErrors(p=>({...p,username:''})); }}
                    placeholder="e.g. kolkata_member_01" className={`form-input font-mono text-sm ${formErrors.username?'border-red-400':''}`} />
                  {formErrors.username && <p className="text-red-500 text-xs mt-1">⚠ {formErrors.username}</p>}
                </div>
                <div>
                  <label className="form-label">{editingRole ? 'New Password (leave blank = no change)' : 'Password *'}</label>
                  <input type="password" value={form.password} onChange={e => { setForm(p=>({...p,password:e.target.value})); setFormErrors(p=>({...p,password:''})); }}
                    placeholder="••••••" className={`form-input ${formErrors.password?'border-red-400':''}`} />
                  {formErrors.password && <p className="text-red-500 text-xs mt-1">⚠ {formErrors.password}</p>}
                </div>
                <div>
                  <label className="form-label">Role *</label>
                  <select value={form.role} onChange={e => { setForm(p=>({...p,role:e.target.value})); setFormErrors(p=>({...p,role:''})); }}
                    className={`form-input ${formErrors.role?'border-red-400':''}`}
                    disabled={isCoadmin}>
                    {availableRoles.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
                  </select>
                  {ROLE_CONFIG[form.role] && <p className="text-xs text-gray-400 mt-1">{ROLE_CONFIG[form.role].desc}</p>}
                </div>
                <div>
                  <label className="form-label">District *</label>
                  {isCoadmin ? (
                    <input value={form.district} readOnly className="form-input bg-gray-50" />
                  ) : (
                    <select value={form.district} onChange={e => { setForm(p=>({...p,district:e.target.value})); setFormErrors(p=>({...p,district:''})); }}
                      className={`form-input ${formErrors.district?'border-red-400':''}`}>
                      <option value="">-- Select District --</option>
                      {STATE_DISTRICTS.length > 0
                        ? STATE_DISTRICTS.map(d => <option key={d} value={d}>{d}</option>)
                        : <option disabled>No districts found for this state</option>
                      }
                    </select>
                  )}
                  {formErrors.district && <p className="text-red-500 text-xs mt-1">⚠ {formErrors.district}</p>}
                </div>
                <div className="col-span-2">
                  <label className="form-label">Mobile Number <span className="text-gray-400 font-normal">(optional)</span></label>
                  <input type="tel" value={form.mobile} onChange={e => setForm(p=>({...p,mobile:e.target.value}))}
                    placeholder="9XXXXXXXXX" className="form-input" maxLength={10} />
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button onClick={() => { setShowForm(false); setEditingRole(null); setFormErrors({}); }}
                  className="flex-1 border-2 border-gray-300 text-gray-700 py-2.5 rounded-xl font-semibold hover:bg-gray-50">Cancel</button>
                <button onClick={handleSave}
                  className="flex-1 bg-blue-700 hover:bg-blue-800 text-white font-bold py-2.5 rounded-xl transition-colors">
                  {editingRole ? '✅ Save Changes' : '✅ Create Official'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Reset Password Modal */}
      {showResetModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6">
            <h3 className="font-bold text-gray-800 mb-1">🔑 Reset Password</h3>
            <p className="text-sm text-gray-500 mb-4"><strong>{showResetModal.fullName}</strong> ({showResetModal.role})</p>
            <div className="mb-4">
              <label className="form-label">New Password *</label>
              <input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)}
                placeholder="Min 6 characters" className="form-input" autoFocus />
              {newPassword && newPassword.length < 6 && <p className="text-red-500 text-xs mt-1">Min 6 characters</p>}
            </div>
            <div className="flex gap-3">
              <button onClick={() => { setShowResetModal(null); setNewPassword(''); }}
                className="flex-1 border border-gray-300 text-gray-700 py-2.5 rounded-xl text-sm font-semibold hover:bg-gray-50">Cancel</button>
              <button onClick={handleResetPassword} disabled={!newPassword || newPassword.length < 6}
                className="flex-1 bg-amber-600 hover:bg-amber-700 text-white font-bold py-2.5 rounded-xl text-sm transition-colors disabled:opacity-50">
                🔑 Reset
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
