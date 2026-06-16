import { useState } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppContext';
import { states, unionTerritories } from '../data/states';

const STATUS_STYLES = {
  'Under Review':         { bg: 'bg-yellow-50 border-yellow-200', text: 'text-yellow-700', dot: 'bg-yellow-500' },
  'Pending Verification': { bg: 'bg-blue-50 border-blue-200',     text: 'text-blue-700',   dot: 'bg-blue-500' },
  'Application Received': { bg: 'bg-green-50 border-green-200',   text: 'text-green-700',  dot: 'bg-green-500' },
  'Approved':             { bg: 'bg-green-50 border-green-200',   text: 'text-green-700',  dot: 'bg-green-500' },
  'Documents Pending':    { bg: 'bg-orange-50 border-orange-200', text: 'text-orange-700', dot: 'bg-orange-500' },
  'Rejected':             { bg: 'bg-red-50 border-red-200',       text: 'text-red-700',    dot: 'bg-red-500' },
};

export default function SchemeCard({ scheme, stateId, type = 'scheme' }) {
  const router = useRouter();
  const { user, checkEligibility } = useAuth();
  const { getBeneficiaryByPan } = useApp();
  const [showModal, setShowModal] = useState(false);

  // ── State restriction — block other states' schemes ───────
  const allPlaces  = [...states, ...unionTerritories];
  const userStateId = user?.state
    ? allPlaces.find(s => s.name.toLowerCase() === user.state.toLowerCase())?.id
    : null;
  const isOtherState = stateId && stateId !== 'central' && userStateId && stateId !== userStateId;

  // ── Check previous application ─────────────────────────────
  const userApplication = user
    ? null // IndexedDB removed; application lookup handled server-side or via API
    : null;

  // Rejected → user can apply again
  const hasApplied = !!userApplication && userApplication.status !== 'Rejected';

  // ── PAN suspension check ───────────────────────────────────
  const beneficiary  = user?.pan ? getBeneficiaryByPan(user.pan) : null;
  const isSuspended  = beneficiary?.status === 'suspended' &&
    beneficiary?.schemes?.some(s => s.id === scheme.id);

  // ── General eligibility ────────────────────────────────────
  const eligibility = user ? checkEligibility(scheme.id) : { eligible: true };
  const isEligible  = eligibility.eligible && !isSuspended;

  // ── Upcoming check — applications not open yet ─────────────
  const isUpcoming = scheme.status === 'upcoming' ||
    (scheme.applicationDeadline === '' && type === 'exam' && scheme.status === 'upcoming');

  // ── Ineligibility reason ───────────────────────────────────
  let ineligibleReason = '';
  let ineligibleDetail = '';
  if (isSuspended) {
    ineligibleReason = 'Benefit Suspended — Employed';
    ineligibleDetail = `Your PAN is linked to active employment at ${beneficiary?.employer?.orgName || 'a registered organisation'}. Jubo Shakti / employment-linked benefits are automatically suspended while employed. Benefits will auto-resume when your employer removes your PAN.`;
  } else if (!eligibility.eligible) {
    ineligibleReason = 'Not Eligible';
    ineligibleDetail = eligibility.reason || 'You do not meet the eligibility criteria for this scheme.';
  }

  // ── App status style ───────────────────────────────────────
  const appStatus    = userApplication?.status || 'Under Review';
  const statusStyle  = STATUS_STYLES[appStatus] || STATUS_STYLES['Under Review'];

  // ── Handlers ───────────────────────────────────────────────
  const handleApply = (e) => {
    e.stopPropagation();
    if (type === 'exam') router.push(`/exam/${stateId || 'central'}/${scheme.id}`);
    else                 router.push(`/scheme/${stateId || 'central'}/${scheme.id}`);
  };

  const handleCardClick = () => {
    if (!hasApplied && !isUpcoming && isEligible && !isOtherState) {
      if (type === 'exam') router.push(`/exam/${stateId || 'central'}/${scheme.id}`);
      else                 router.push(`/scheme/${stateId || 'central'}/${scheme.id}`);
    }
  };

  return (
    <>
      <div
        onClick={handleCardClick}
        className={`bg-white rounded-xl border-2 ${scheme.color} p-5 shadow-sm transition-all duration-300 ${
          (!hasApplied && !isUpcoming && isEligible) ? 'card-hover cursor-pointer' : 'cursor-default'
        }`}
      >
        {/* ── Header ── */}
        <div className="flex items-start justify-between mb-3">
          <div className="text-3xl">{scheme.icon}</div>
          <div className="flex flex-wrap items-center gap-1.5 justify-end">
            {user && hasApplied && !isSuspended && appStatus === 'Approved' && (
              <span className="bg-green-200 text-green-800 text-xs font-bold px-2 py-0.5 rounded-full">
                🟢 Active
              </span>
            )}
            {user && userApplication?.status === 'Rejected' && (
              <span className="bg-red-100 text-red-700 text-xs font-bold px-2 py-0.5 rounded-full">
                ❌ Rejected — Can Re-apply
              </span>
            )}
            {user && hasApplied && !isSuspended && appStatus !== 'Approved' && appStatus !== 'Rejected' && (
              <span className="bg-yellow-100 text-yellow-700 text-xs font-bold px-2 py-0.5 rounded-full">
                ✅ Applied
              </span>
            )}
            {user && hasApplied && isSuspended && (
              <span className="bg-orange-100 text-orange-700 text-xs font-bold px-2 py-0.5 rounded-full">
                ⚠️ Deactivated
              </span>
            )}
            {user && !hasApplied && !isEligible && (
              <button
                onClick={e => { e.stopPropagation(); setShowModal(true); }}
                className="flex items-center gap-1 bg-red-100 text-red-700 text-xs font-semibold px-2 py-0.5 rounded-full hover:bg-red-200 transition-colors"
              >
                ❌ Not Eligible
                <span className="bg-red-200 hover:bg-red-300 rounded-full w-4 h-4 flex items-center justify-center text-xs font-bold">ℹ</span>
              </button>
            )}
            {user && !hasApplied && isUpcoming && (
              <span className="bg-yellow-100 text-yellow-700 text-xs font-semibold px-2 py-0.5 rounded-full">🟡 Upcoming</span>
            )}
            {user && !hasApplied && !isUpcoming && isEligible && (
              <span className="bg-green-100 text-green-700 text-xs font-semibold px-2 py-0.5 rounded-full">✅ Eligible</span>
            )}
            <span className={`badge ${scheme.badgeColor}`}>{scheme.category}</span>
          </div>
        </div>

        {/* ── Name ── */}
        <h3 className="font-bold text-gray-800 text-base mb-1 leading-tight">{scheme.name}</h3>
        {(scheme.nameHindi || scheme.nameBengali) && (
          <p className="text-xs text-gray-500 mb-2">{scheme.nameHindi || scheme.nameBengali}</p>
        )}
        {scheme.shortName && <p className="text-xs font-medium text-gray-500 mb-2">{scheme.conductedBy}</p>}

        {/* ── Details ── */}
        <div className="space-y-1.5 mt-3">
          <div className="flex items-center gap-2 text-sm">
            <span className="text-green-600 font-semibold">✓</span>
            <span className="text-gray-700 font-medium">{scheme.benefit || scheme.estimatedValue}</span>
          </div>
          <div className="flex items-start gap-2 text-xs text-gray-500">
            <span>👥</span><span>{scheme.eligibility}</span>
          </div>
          {scheme.nextExam && (
            <div className="flex items-center gap-2 text-xs text-blue-600">
              <span>📅</span><span>{scheme.nextExam}</span>
            </div>
          )}
          {scheme.bidDeadline && (
            <div className="flex items-center gap-2 text-xs text-red-500">
              <span>⏰</span><span>Deadline: {scheme.bidDeadline}</span>
            </div>
          )}
          {scheme.applicationDeadline && (
            <div className="flex items-center gap-2 text-xs text-red-500">
              <span>⏰</span><span>Apply by: {scheme.applicationDeadline}</span>
            </div>
          )}
        </div>

        {scheme.hasPanLogic && !hasApplied && (
          <div className="mt-3 bg-blue-50 rounded-lg p-2">
            <p className="text-xs text-blue-700 font-medium">🔒 PAN-linked auto verification</p>
          </div>
        )}

        {type === 'exam' && scheme.status && !hasApplied && (
          <div className="mt-3">
            <span className={`badge text-xs ${scheme.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
              {scheme.status === 'active' ? '🟢 Applications Open' : '🟡 Upcoming'}
            </span>
          </div>
        )}

        {/* ── STATUS SECTION (after apply) ── */}
        {hasApplied && (
          <div className="mt-4 space-y-2">

            {/* Deactivated — Employed */}
            {isSuspended && (
              <div className="bg-orange-50 border border-orange-200 rounded-xl p-3">
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="w-2 h-2 bg-orange-500 rounded-full animate-pulse" />
                  <p className="text-xs font-bold text-orange-800">⚠️ Benefit Deactivated</p>
                </div>
                <p className="text-xs text-orange-700">
                  You are currently employed at <strong>{beneficiary?.employer?.orgName || 'an organisation'}</strong>.
                  Benefits will auto-resume when employment ends.
                </p>
                <button
                  onClick={e => { e.stopPropagation(); setShowModal(true); }}
                  className="mt-1.5 text-xs text-orange-600 underline hover:text-orange-800"
                >
                  Learn more →
                </button>
              </div>
            )}

            {/* Active — Application Status */}
            {!isSuspended && (
              <div className={`border rounded-xl p-3 ${statusStyle.bg}`}>
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-1.5">
                    <span className={`w-2 h-2 rounded-full ${statusStyle.dot}`} />
                    <p className={`text-xs font-bold ${statusStyle.text}`}>Application Status</p>
                  </div>
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full bg-white/60 ${statusStyle.text}`}>
                    {appStatus}
                  </span>
                </div>
                <p className={`text-xs ${statusStyle.text} opacity-80`}>
                  Ref: <strong>{userApplication?.refNo}</strong>
                </p>
                {scheme.hasPanLogic && (
                  <p className="text-xs text-blue-600 mt-1 font-medium">
                    🔒 PAN-linked · Auto-deactivates if employed
                  </p>
                )}
              </div>
            )}
          </div>
        )}

        {/* ── Bottom Action ── */}
        <div className="mt-4">
          {/* Case 0: Other state scheme — blocked */}
          {isOtherState && (
            <div className="w-full bg-gray-100 border border-gray-200 rounded-xl p-3 text-center">
              <p className="text-xs font-bold text-gray-500">🔒 Not available in your state</p>
              <p className="text-xs text-gray-400 mt-0.5">Only {stateId?.replace(/-/g, ' ')} residents can apply</p>
            </div>
          )}

          {/* Case 1: Already applied */}
          {!isOtherState && hasApplied && (
            <div className="w-full text-center text-xs text-gray-400 py-1.5 bg-gray-50 rounded-lg font-medium border border-gray-200">
              🔒 Already applied — cannot apply again
            </div>
          )}

          {/* Case 2: Upcoming — not open yet */}
          {!isOtherState && !hasApplied && isUpcoming && (
            <div className="space-y-2">
              <div className="w-full bg-yellow-50 border border-yellow-200 rounded-xl p-3 text-center">
                <p className="text-xs font-bold text-yellow-700">🟡 Applications Not Open Yet</p>
                {scheme.nextExam && (
                  <p className="text-xs text-yellow-600 mt-0.5">Expected: {scheme.nextExam}</p>
                )}
                {scheme.applicationDeadline && (
                  <p className="text-xs text-yellow-600 mt-0.5">Opens: {scheme.applicationDeadline}</p>
                )}
              </div>
            </div>
          )}

          {/* Case 3: Not eligible */}
          {!isOtherState && !hasApplied && !isUpcoming && !isEligible && (
            <button
              onClick={e => { e.stopPropagation(); setShowModal(true); }}
              className="w-full flex items-center justify-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-600 font-semibold text-sm py-2 rounded-lg transition-colors"
            >
              ℹ️ Why am I not eligible?
            </button>
          )}

          {/* Case 4: Eligible + open — Apply (or Apply Again after rejection) */}
          {!isOtherState && !hasApplied && !isUpcoming && isEligible && (
            <button onClick={handleApply} className={`w-full justify-center text-sm py-2 flex items-center gap-2 font-bold rounded-lg transition-colors ${
              userApplication?.status === 'Rejected'
                ? 'bg-blue-600 hover:bg-blue-700 text-white'
                : 'btn-primary'
            }`}>
              {userApplication?.status === 'Rejected' ? '🔄 Apply Again' : 'Apply Now →'}
            </button>
          )}
        </div>
      </div>

      {/* ── Ineligibility / Suspension Modal ── */}
      {showModal && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setShowModal(false)}
        >
          <div
            className="bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden"
            onClick={e => e.stopPropagation()}
          >
            <div className={`p-5 flex items-start gap-3 ${isSuspended ? 'bg-orange-50 border-b border-orange-200' : 'bg-red-50 border-b border-red-200'}`}>
              <div className={`w-12 h-12 rounded-full flex items-center justify-center text-2xl flex-shrink-0 ${isSuspended ? 'bg-orange-100' : 'bg-red-100'}`}>
                {isSuspended ? '💼' : '❌'}
              </div>
              <div className="flex-1">
                <h3 className={`font-extrabold text-lg ${isSuspended ? 'text-orange-800' : 'text-red-800'}`}>
                  {isSuspended ? 'Benefit Deactivated' : 'Not Eligible'}
                </h3>
                <p className={`text-sm font-semibold ${isSuspended ? 'text-orange-600' : 'text-red-600'}`}>
                  {scheme.name}
                </p>
              </div>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600 text-xl">✕</button>
            </div>

            <div className="p-6 space-y-4">
              {/* Main reason */}
              <div className={`rounded-2xl p-4 ${isSuspended ? 'bg-orange-50 border border-orange-200' : 'bg-red-50 border border-red-200'}`}>
                <p className={`text-sm font-semibold mb-1.5 ${isSuspended ? 'text-orange-800' : 'text-red-800'}`}>
                  📋 Reason:
                </p>
                <p className={`text-sm leading-relaxed ${isSuspended ? 'text-orange-700' : 'text-red-700'}`}>
                  {ineligibleDetail}
                </p>
              </div>

              {/* Employer info — suspended */}
              {isSuspended && beneficiary?.employer && (
                <div className="bg-gray-50 rounded-xl p-4 space-y-2">
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-wide">Current Employment</p>
                  {[
                    ['Organisation', beneficiary.employer.orgName],
                    ['Type', beneficiary.employer.type],
                    ['Status', 'Active'],
                  ].map(([k, v]) => (
                    <div key={k} className="flex justify-between text-sm">
                      <span className="text-gray-500">{k}</span>
                      <span className={`font-semibold ${k === 'Status' ? 'text-red-600' : 'text-gray-800'}`}>{v}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Auto-resume info */}
              {isSuspended && (
                <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                  <p className="text-sm font-semibold text-green-800 mb-1">🔄 Auto-Resume</p>
                  <p className="text-xs text-green-700">
                    Your <strong>{scheme.name}</strong> benefit will <strong>automatically resume</strong> when your employer removes your PAN from their records. No action needed from your side.
                  </p>
                </div>
              )}

              {/* Tip for general ineligibility */}
              {!isSuspended && (
                <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
                  <p className="text-sm font-semibold text-blue-800 mb-1">💡 Tip</p>
                  <p className="text-xs text-blue-700">
                    Eligibility is automatically checked based on your profile. If you believe this is incorrect, update your profile and it will be re-checked.
                  </p>
                </div>
              )}

              <button
                onClick={() => setShowModal(false)}
                className="w-full bg-gray-800 hover:bg-gray-700 text-white font-bold py-3 rounded-xl transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
