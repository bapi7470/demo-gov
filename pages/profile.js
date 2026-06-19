import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useSession, signOut } from 'next-auth/react';
import prisma from '../lib/prisma';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';

export async function getServerSideProps() {
  const schemes = await prisma.scheme.findMany({
    orderBy: { name: 'asc' },
    select: { id: true, name: true, icon: true, benefit: true, category: true, badgeColor: true, scope: true, stateId: true },
  });
  return { props: JSON.parse(JSON.stringify({ initialSchemes: schemes })) };
}

const EDUCATION_OPTIONS = ['Class 8', 'Class 10', 'Class 12', 'Diploma', 'Graduate', 'Post Graduate', 'PhD', 'Other'];
const CATEGORY_OPTIONS  = ['General', 'OBC', 'SC', 'ST', 'EWS'];
const GENDER_OPTIONS    = ['Male', 'Female', 'Other'];

export default function ProfilePage({ initialSchemes = [] }) {
  const router = useRouter();
  const { data: session, status, update: updateSession } = useSession();
  const { getBeneficiaryByPan } = useApp();
  const { checkEligibility } = useAuth();

  const [isEditing, setIsEditing]   = useState(false);
  const [editData,  setEditData]    = useState({});
  const [saveMsg,   setSaveMsg]     = useState('');
  const [myApplications, setMyApplications] = useState([]);
  const [allSchemes] = useState(initialSchemes);

  useEffect(() => {
    if (!session && status !== 'loading') {
      router.replace('/login');
    }
  }, [session, status, router]);

  useEffect(() => {
    if (!session?.user) return;
    // Fetch applications for the logged-in user by mobile
    if (session.user.mobile) {
      fetch(`/api/applications?mobile=${session.user.mobile}`)
        .then(r => r.json())
        .then(data => setMyApplications(Array.isArray(data) ? data : []))
        .catch(() => setMyApplications([]));
    }
  }, [session]);

  if (!session && status !== 'loading') return null;
  if (status === 'loading') return null;

  const user = session?.user || {};

  const handleLogout = async () => {
    await signOut({ callbackUrl: '/login' });
  };

  const beneficiary = user.pan ? getBeneficiaryByPan(user.pan) : null;
  const isEmployed  = beneficiary?.status === 'suspended';
  const employer    = beneficiary?.employer;

  const getAge = (dob) => {
    if (!dob) return '—';
    const today = new Date(), birth = new Date(dob);
    let age = today.getFullYear() - birth.getFullYear();
    if (today.getMonth() - birth.getMonth() < 0 || (today.getMonth() === birth.getMonth() && today.getDate() < birth.getDate())) age--;
    return age;
  };

  const startEdit = () => {
    setEditData({
      fullName:    user.fullName || '',
      email:       user.email || '',
      education:   user.education || '',
      district:    user.district || '',
      category:    user.category || '',
      address:     user.address || '',
      bankAccount: user.bankAccount || '',
      ifsc:        user.ifsc || '',
    });
    setIsEditing(true);
    setSaveMsg('');
  };

  const handleSave = async () => {
    try {
      const res = await fetch('/api/users/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editData),
      });
      if (!res.ok) throw new Error('Failed to save');
      const updatedUser = await res.json();
      // Merge API response into the session token via trigger: "update"
      await updateSession({ user: { ...user, ...updatedUser } });
      setIsEditing(false);
      setSaveMsg('Profile updated successfully!');
      setTimeout(() => setSaveMsg(''), 3000);
    } catch {
      setSaveMsg('Failed to save. Please try again.');
      setTimeout(() => setSaveMsg(''), 3000);
    }
  };

  const field = (key) => ({
    value: editData[key] ?? '',
    onChange: (e) => setEditData(p => ({ ...p, [key]: e.target.value })),
  });

  const selectField = (key, options) => (
    <select className="form-input text-sm" {...field(key)}>
      {options.map(o => <option key={o}>{o}</option>)}
    </select>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-orange-600 to-green-700 text-white py-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center text-2xl font-bold">
                {user.fullName?.split(' ').map(n => n[0]).slice(0, 2).join('')}
              </div>
              <div>
                <h1 className="text-2xl font-extrabold">{user.fullName}</h1>
                <p className="text-orange-100 text-sm">{user.mobile} · {user.state}</p>
                <div className="flex gap-2 mt-1 flex-wrap">
                  <span className="bg-white/20 text-xs px-2 py-0.5 rounded-full">{user.category}</span>
                  <span className="bg-white/20 text-xs px-2 py-0.5 rounded-full">Age: {getAge(user.dob)} yrs</span>
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              {!isEditing && (
                <button onClick={startEdit}
                  className="bg-white/10 hover:bg-white/20 border border-white/30 text-white text-sm px-4 py-2 rounded-lg transition-colors font-medium">
                  ✏️ Edit Profile
                </button>
              )}
              <button onClick={handleLogout}
                className="bg-white/10 hover:bg-white/20 border border-white/30 text-white text-sm px-4 py-2 rounded-lg transition-colors font-medium">
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">

        {/* Save message */}
        {saveMsg && (
          <div className={`rounded-xl px-4 py-3 font-medium text-sm flex items-center gap-2 ${saveMsg.includes('Failed') ? 'bg-red-50 border border-red-200 text-red-700' : 'bg-green-50 border border-green-200 text-green-700'}`}>
            {saveMsg.includes('Failed') ? '❌' : '✅'} {saveMsg}
          </div>
        )}

        {/* Profile Details */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-gray-800 text-lg">👤 Profile Details</h2>
            {isEditing && (
              <div className="flex gap-2">
                <button onClick={() => setIsEditing(false)}
                  className="border border-gray-300 text-gray-600 text-sm px-4 py-1.5 rounded-lg hover:bg-gray-50 transition-colors">
                  Cancel
                </button>
                <button onClick={handleSave}
                  className="bg-blue-700 hover:bg-blue-800 text-white text-sm font-bold px-5 py-1.5 rounded-lg transition-colors">
                  💾 Save
                </button>
              </div>
            )}
          </div>

          {isEditing ? (
            <div className="space-y-5">
              {/* Locked fields notice */}
              <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 flex items-start gap-2">
                <span className="text-lg">🔒</span>
                <p className="text-xs text-amber-800">
                  <strong>Aadhaar</strong>, <strong>PAN</strong>, <strong>Date of Birth</strong>, <strong>Gender</strong> and <strong>State</strong> cannot be edited as they are verified identity details.
                </p>
              </div>

              {/* Locked fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="form-label flex items-center gap-1">🔒 Aadhaar Number</label>
                  <input type="text" readOnly
                    value={user.aadhaar ? user.aadhaar.slice(0,4) + ' **** ' + user.aadhaar.slice(-4) : '—'}
                    className="form-input text-sm bg-gray-100 cursor-not-allowed text-gray-500" />
                </div>
                <div>
                  <label className="form-label flex items-center gap-1">🔒 PAN Number</label>
                  <input type="text" readOnly
                    value={user.pan ? user.pan.slice(0,5) + 'XXXXX' : '—'}
                    className="form-input text-sm bg-gray-100 cursor-not-allowed text-gray-500" />
                </div>
                <div>
                  <label className="form-label flex items-center gap-1">🔒 Date of Birth</label>
                  <input type="text" readOnly
                    value={user.dob || '—'}
                    className="form-input text-sm bg-gray-100 cursor-not-allowed text-gray-500" />
                </div>
                <div>
                  <label className="form-label flex items-center gap-1">🔒 Gender</label>
                  <input type="text" readOnly
                    value={user.gender || '—'}
                    className="form-input text-sm bg-gray-100 cursor-not-allowed text-gray-500" />
                </div>
              </div>

              {/* Editable fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="form-label">Full Name *</label>
                  <input type="text" className="form-input text-sm" {...field('fullName')} />
                </div>
                <div>
                  <label className="form-label">Email</label>
                  <input type="email" className="form-input text-sm" {...field('email')} />
                </div>
                <div>
                  <label className="form-label">Education</label>
                  {selectField('education', EDUCATION_OPTIONS)}
                </div>
                <div>
                  <label className="form-label">Category</label>
                  {selectField('category', CATEGORY_OPTIONS)}
                </div>
                <div>
                  <label className="form-label flex items-center gap-1">🔒 State</label>
                  <input type="text" readOnly
                    value={user.state || '—'}
                    className="form-input text-sm bg-gray-100 cursor-not-allowed text-gray-500" />
                </div>
                <div>
                  <label className="form-label">District</label>
                  <input type="text" className="form-input text-sm" {...field('district')} />
                </div>
                <div>
                  <label className="form-label">Bank Account No.</label>
                  <input type="text" className="form-input text-sm" {...field('bankAccount')} />
                </div>
                <div>
                  <label className="form-label">IFSC Code</label>
                  <input type="text" className="form-input text-sm" {...field('ifsc')} />
                </div>
              </div>

              <div>
                <label className="form-label">Address</label>
                <textarea className="form-input text-sm resize-none" rows={2} {...field('address')} />
              </div>

              <div className="flex gap-3 pt-1">
                <button onClick={() => setIsEditing(false)}
                  className="flex-1 border-2 border-gray-300 text-gray-700 py-2.5 rounded-xl font-semibold text-sm hover:bg-gray-50">
                  Cancel
                </button>
                <button onClick={handleSave}
                  className="flex-1 bg-blue-700 hover:bg-blue-800 text-white font-bold py-2.5 rounded-xl text-sm transition-colors">
                  💾 Save Changes
                </button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {[
                ['Date of Birth', user.dob],
                ['Gender', user.gender],
                ['Email', user.email],
                ['Aadhaar 🔒', user.aadhaar ? user.aadhaar.slice(0,4) + ' **** ' + user.aadhaar.slice(-4) : '—'],
                ['PAN 🔒', user.pan ? user.pan.slice(0,5) + 'XXXXX' : '—'],
                ['Education', user.education],
                ['State', user.state],
                ['District', user.district],
                ['Category', user.category],
              ].map(([k, v]) => (
                <div key={k} className={`rounded-xl p-3 ${k.includes('🔒') ? 'bg-amber-50 border border-amber-100' : 'bg-gray-50'}`}>
                  <p className="text-xs text-gray-400 mb-0.5">{k}</p>
                  <p className="font-semibold text-gray-700 text-sm">{v || '—'}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Employment Status */}
        {!isEditing && (
          <div className={`rounded-2xl border shadow-sm p-5 ${isEmployed ? 'bg-orange-50 border-orange-200' : 'bg-green-50 border-green-100'}`}>
            <h2 className="font-bold text-lg mb-3 flex items-center gap-2">
              {isEmployed ? '💼 Currently Employed' : '✅ Employment Status'}
            </h2>
            {isEmployed && employer ? (
              <div className="space-y-3">
                <div className={`rounded-xl p-4 border ${isEmployed ? 'bg-orange-100 border-orange-200' : 'bg-green-100 border-green-200'}`}>
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center text-white text-lg">💼</div>
                    <div>
                      <p className="font-bold text-orange-900">{employer.orgName}</p>
                      <p className="text-xs text-orange-700 capitalize">Type: {employer.type} sector</p>
                    </div>
                  </div>
                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-xs text-amber-800">
                    <p className="font-semibold mb-1">⚠️ Scheme Impact</p>
                    <p>Employment-linked scheme benefits (e.g. Jubo Shakti) are <strong>automatically deactivated</strong> while you are employed.</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    ['Employer', employer.orgName],
                    ['Type', employer.type + ' sector'],
                    ['Status', 'Active Employee'],
                    ['Scheme Benefits', 'Suspended'],
                  ].map(([k,v]) => (
                    <div key={k} className="bg-white rounded-xl p-3 border border-orange-100">
                      <p className="text-xs text-gray-400">{k}</p>
                      <p className={`font-semibold text-sm mt-0.5 ${k==='Status'?'text-red-600':k==='Scheme Benefits'?'text-red-500':'text-gray-800'}`}>{v}</p>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <span className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center text-green-600 text-lg">✓</span>
                <div>
                  <p className="font-semibold text-green-800">Not currently employed</p>
                  <p className="text-xs text-green-600">You are eligible for employment-linked government schemes.</p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Rejection Notifications */}
        {!isEditing && (() => {
          const rejectedApps = myApplications.filter(a => a.status === 'Rejected');
          if (!rejectedApps.length) return null;
          return (
            <div className="bg-red-50 border border-red-200 rounded-2xl shadow-sm p-5">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-xl">🔔</span>
                <h2 className="font-bold text-red-800 text-lg">Notifications</h2>
                <span className="bg-red-600 text-white text-xs font-bold px-2 py-0.5 rounded-full">{rejectedApps.length}</span>
              </div>
              <div className="space-y-3">
                {rejectedApps.map(app => {
                  const rejectedEntry = [...(app.statusHistory || [])].reverse().find(h => h.status === 'Rejected');
                  const reason = rejectedEntry?.note;
                  return (
                    <div key={app.refNo} className="bg-white border border-red-200 rounded-xl p-4">
                      <div className="flex items-start justify-between gap-2 flex-wrap">
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-gray-800 text-sm">{app.schemeName}</p>
                          <p className="text-xs text-gray-400 mt-0.5">Ref: {app.refNo} · {new Date(app.submittedAt).toLocaleDateString('en-IN')}</p>
                        </div>
                        <span className="bg-red-100 text-red-700 text-xs font-bold px-2.5 py-1 rounded-full flex-shrink-0">❌ Rejected</span>
                      </div>
                      {reason && (
                        <div className="mt-3 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
                          <p className="text-xs font-semibold text-red-600 mb-0.5">Rejection Reason:</p>
                          <p className="text-sm text-red-800">{reason}</p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })()}

        {/* My Applications */}
        {!isEditing && myApplications.length > 0 && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <h2 className="font-bold text-gray-800 mb-1 text-lg">📋 My Applications</h2>
            <p className="text-gray-500 text-sm mb-4">All your submitted scheme & exam applications</p>
            <div className="space-y-2">
              {myApplications.map(app => {
                const statusColors = {
                  'Under Review':      'bg-yellow-100 text-yellow-800',
                  'Approved':          'bg-green-100 text-green-800',
                  'Rejected':          'bg-red-100 text-red-800',
                  'Documents Pending': 'bg-orange-100 text-orange-800',
                };
                const sc = statusColors[app.status] || statusColors['Under Review'];
                return (
                  <div key={app.refNo} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-100">
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm text-gray-800 truncate">{app.schemeName}</p>
                      <p className="text-xs text-gray-400">Ref: {app.refNo} · {new Date(app.submittedAt).toLocaleDateString('en-IN')}</p>
                    </div>
                    <span className={`ml-3 text-xs font-bold px-2.5 py-1 rounded-full flex-shrink-0 ${sc}`}>
                      {app.status === 'Approved' ? '✅' : app.status === 'Rejected' ? '❌' : '🔍'} {app.status}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Scheme Eligibility */}
        {!isEditing && allSchemes.length > 0 && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <h2 className="font-bold text-gray-800 mb-1 text-lg">📋 Scheme Eligibility</h2>
            <p className="text-gray-500 text-sm mb-4">Which schemes you can apply for based on your profile</p>
            <div className="space-y-2">
              {allSchemes.map(scheme => {
                const { eligible, reason } = checkEligibility(scheme.id);

                return (
                  <div key={scheme.id}
                    className={`flex items-start justify-between p-3 rounded-xl border ${eligible ? 'bg-green-50 border-green-100' : 'bg-red-50 border-red-100'}`}>
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-lg flex-shrink-0">{scheme.icon}</span>
                      <div className="min-w-0">
                        <p className="font-semibold text-sm text-gray-800 truncate">{scheme.name}</p>
                        <p className="text-xs text-gray-500">{eligible ? scheme.benefit : reason}</p>
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0 ml-3">
                      {eligible ? (
                        <span className="bg-green-100 text-green-700 text-xs font-semibold px-2 py-1 rounded-full whitespace-nowrap">✅ Eligible</span>
                      ) : (
                        <span className="bg-red-100 text-red-700 text-xs font-semibold px-2 py-1 rounded-full whitespace-nowrap">❌ Not Eligible</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
