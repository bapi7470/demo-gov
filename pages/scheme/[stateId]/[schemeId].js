import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useSession } from 'next-auth/react';
import { centralSchemes, stateSchemes } from '../../../data/schemes';
import { centralScholarships, stateScholarships } from '../../../data/scholarships';
import { centralTenders, stateTenders } from '../../../data/tenders';
import { states, unionTerritories } from '../../../data/states';
import SchemeForm from '../../../components/SchemeForm';

async function saveApplication(refNo, scheme, stateId, stateData, formData) {
  try {
    const today = new Date().toISOString().split('T')[0];
    const application = {
      refNo,
      type: 'scheme',
      schemeId:      scheme.id,
      schemeName:    scheme.name,
      stateId:       stateId === 'central' ? 'central' : (scheme.stateId || stateId),
      stateName:     stateData?.name || scheme.stateName || 'Central',
      applicantName: formData.fullName || formData.studentName || formData.brideName || formData.childName || '—',
      mobile:        formData.mobile    || '—',
      aadhaar:       formData.aadhaar   || '—',
      pan:           formData.pan       || '—',
      district:      formData.district  || '—',
      city:          formData.city      || formData.village || '—',
      pincode:       formData.pincode   || '—',
      address:       formData.address   || '—',
      submittedAt: new Date().toISOString(),
      status: 'Under Review',
      statusHistory: [
        { status: 'Application Received', date: today, note: 'Application submitted successfully.' },
        { status: 'Under Review',         date: today, note: 'Documents are being verified.' },
      ],
    };
    await fetch('/api/applications', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(application),
    });
  } catch (_) {}
}

async function findScheme(schemeId) {
  const allStateSchemes = Object.values(stateSchemes).flat();
  const allStateSchols  = Object.values(stateScholarships).flat();
  const allStateTenders = Object.values(stateTenders).flat();

  // Check static data first
  const found = [
    ...centralSchemes, ...allStateSchemes,
    ...centralScholarships, ...allStateSchols,
    ...centralTenders, ...allStateTenders,
  ].find(s => s.id === schemeId);
  if (found) return found;

  // Fallback to API for custom schemes
  try {
    const res = await fetch(`/api/schemes?schemeId=${encodeURIComponent(schemeId)}`);
    if (res.ok) {
      const data = await res.json();
      return data.scheme || null;
    }
  } catch (_) {}
  return null;
}

export default function SchemeFormPage() {
  const router = useRouter();
  const { stateId, schemeId } = router.query;
  const { data: session } = useSession();
  const user = session?.user ?? null;

  const [submitted, setSubmitted] = useState(false);
  const [submissionData, setSubmissionData] = useState(null);
  const [scheme, setScheme] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!schemeId) return;
    async function load() {
      setLoading(true);
      const found = await findScheme(schemeId);
      setScheme(found);
      setLoading(false);
    }
    load();
  }, [schemeId]);

  // Auth guard — redirect to login if not authenticated
  useEffect(() => {
    if (session === null) {
      router.push(`/login?redirect=${encodeURIComponent(router.asPath)}`);
    }
  }, [session]);

  const allPlaces   = [...states, ...unionTerritories];
  const userStateId = user?.state
    ? allPlaces.find(s => s.name.toLowerCase() === user.state.toLowerCase())?.id
    : null;
  const isOtherState = stateId && stateId !== 'central' && userStateId && stateId !== userStateId;

  const stateData = !stateId || stateId === 'central' ? null :
    allPlaces.find(s => s.id === stateId);

  if (!stateId || session === undefined) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (isOtherState) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="bg-white rounded-3xl shadow-xl max-w-md w-full p-8 text-center border border-gray-100">
          <div className="text-5xl mb-4">🔒</div>
          <h2 className="text-xl font-extrabold text-gray-800 mb-2">Not Available in Your State</h2>
          <p className="text-gray-500 text-sm mb-6">
            This scheme is only for residents of <strong className="capitalize">{stateId.replace(/-/g, ' ')}</strong>.
            Your registered state is <strong>{user?.state}</strong>.
          </p>
          <div className="space-y-2">
            <button
              onClick={() => router.push(`/state/${userStateId}`)}
              className="w-full bg-blue-700 hover:bg-blue-800 text-white font-bold py-3 rounded-xl transition-colors"
            >
              View {user?.state} Schemes →
            </button>
            <button
              onClick={() => router.push('/central-schemes')}
              className="w-full border-2 border-gray-200 text-gray-600 font-semibold py-3 rounded-xl hover:bg-gray-50 transition-colors"
            >
              View Central Schemes →
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-500 font-medium">Loading scheme...</p>
        </div>
      </div>
    );
  }

  if (!scheme) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">😕</div>
          <h2 className="text-2xl font-bold text-gray-700 mb-2">Scheme not found</h2>
          <p className="text-gray-500 text-sm mb-4">The scheme may have been removed or the link is incorrect.</p>
          <button onClick={() => router.back()} className="btn-primary mt-2">← Go Back</button>
        </div>
      </div>
    );
  }

  if (submitted && submissionData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="bg-white rounded-3xl shadow-xl max-w-lg w-full p-8 text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-5">
            <span className="text-4xl">✅</span>
          </div>
          <h2 className="text-2xl font-extrabold text-gray-800 mb-2">Application Submitted!</h2>
          <p className="text-gray-500 mb-6">Your application for <strong>{scheme.name}</strong> has been successfully submitted.</p>

          <div className="bg-gray-50 rounded-2xl p-5 mb-6 text-left space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Reference Number</span>
              <span className="font-bold text-orange-600">{submissionData.refNo}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Scheme</span>
              <span className="font-semibold text-gray-700">{scheme.name}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Submitted</span>
              <span className="font-semibold text-gray-700">{new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Status</span>
              <span className="bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full text-xs font-semibold">Under Review</span>
            </div>
          </div>

          <div className="bg-blue-50 rounded-xl p-4 mb-6 text-left">
            <p className="text-sm text-blue-800 font-medium mb-1">📱 What's Next?</p>
            <ul className="text-xs text-blue-700 space-y-1">
              <li>• You'll receive an SMS on your registered mobile number</li>
              <li>• Documents will be verified within 7-14 working days</li>
              <li>• Benefits will be credited directly to your bank account</li>
              <li>• Track status using reference number: <strong>{submissionData.refNo}</strong></li>
            </ul>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => router.push('/')}
              className="flex-1 btn-primary justify-center"
            >
              🏠 Go Home
            </button>
            <button
              onClick={() => router.back()}
              className="flex-1 btn-secondary justify-center"
            >
              ← More Schemes
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-gray-800 to-gray-900 text-white py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <button
            onClick={() => router.back()}
            className="inline-flex items-center gap-2 text-white/70 hover:text-white text-sm mb-5 transition-colors"
          >
            ← Back
          </button>

          <div className="flex items-start gap-4">
            <div className="text-4xl">{scheme.icon}</div>
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <span className={`badge ${scheme.badgeColor}`}>{scheme.category}</span>
                {stateData && (
                  <span className="badge bg-white/20 text-white">{stateData.emoji} {stateData.name}</span>
                )}
                {stateId === 'central' && (
                  <span className="badge bg-orange-500/80 text-white">🇮🇳 Central Scheme</span>
                )}
              </div>
              <h1 className="text-2xl md:text-3xl font-extrabold">{scheme.name}</h1>
              {(scheme.nameHindi || scheme.nameBengali) && (
                <p className="text-white/70 mt-1">{scheme.nameHindi || scheme.nameBengali}</p>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-5">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
              <h3 className="font-bold text-gray-700 mb-3 text-sm uppercase tracking-wide">Scheme Details</h3>
              <div className="space-y-3">
                <div>
                  <p className="text-xs text-gray-400">Benefit</p>
                  <p className="font-semibold text-green-700">{scheme.benefit}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400">Eligibility</p>
                  <p className="text-sm text-gray-700">{scheme.eligibility}</p>
                </div>
                {scheme.ministry && (
                  <div>
                    <p className="text-xs text-gray-400">Ministry</p>
                    <p className="text-sm text-gray-700">{scheme.ministry}</p>
                  </div>
                )}
                <div>
                  <p className="text-xs text-gray-400">About</p>
                  <p className="text-xs text-gray-600 leading-relaxed">{scheme.description}</p>
                </div>
              </div>
            </div>

            {scheme.documents && (
              <div className="bg-amber-50 rounded-2xl border border-amber-200 p-5">
                <h3 className="font-bold text-amber-800 mb-3 text-sm flex items-center gap-1.5">
                  📎 Documents Required
                </h3>
                <ul className="space-y-2">
                  {scheme.documents.map((doc) => (
                    <li key={doc} className="flex items-center gap-2 text-sm text-amber-700">
                      <span className="w-1.5 h-1.5 bg-amber-500 rounded-full flex-shrink-0" />
                      {doc}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="bg-blue-50 rounded-2xl border border-blue-100 p-5">
              <h3 className="font-bold text-blue-800 mb-2 text-sm">💡 Tips</h3>
              <ul className="text-xs text-blue-700 space-y-1.5">
                <li>• Fill all fields marked with * carefully</li>
                <li>• Aadhaar must be linked with mobile</li>
                <li>• Bank account must be in applicant's name</li>
                <li>• Keep documents ready before applying</li>
              </ul>
            </div>
          </div>

          {/* Form */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8">
              <div className="mb-6 pb-5 border-b border-gray-100">
                <h2 className="text-xl font-bold text-gray-800">Application Form</h2>
                <p className="text-sm text-gray-500 mt-1">Fields marked with <span className="text-red-500">*</span> are mandatory</p>
              </div>

              <SchemeForm
                scheme={scheme}
                user={user}
                onSuccess={async (data) => {
                  await saveApplication(data.refNo, scheme, stateId, stateData, data.formData);
                  setSubmissionData(data);
                  setSubmitted(true);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
