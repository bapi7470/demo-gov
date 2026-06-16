import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useSession } from 'next-auth/react';
import { centralExams, stateExams } from '../../../data/exams';
import { states, unionTerritories } from '../../../data/states';
import SchemeForm from '../../../components/SchemeForm';

async function saveExamApplication(refNo, exam, stateId, stateData, formData) {
  try {
    const today = new Date().toISOString().split('T')[0];
    const application = {
      refNo, type: 'exam',
      schemeId:      exam.id,
      schemeName:    exam.name,
      stateId:       stateId === 'central' ? 'central' : stateId,
      stateName:     stateData?.name || 'Central',
      applicantName: formData.fullName || '—',
      mobile:        formData.mobile   || '—',
      aadhaar:       formData.aadhaar  || '—',
      district:      formData.district || '—',
      submittedAt: new Date().toISOString(),
      status: 'Application Received',
      statusHistory: [
        { status: 'Application Received', date: today, note: 'Application submitted successfully.' },
        { status: 'Pending Verification', date: today, note: 'Documents are being verified.' },
      ],
    };
    await fetch('/api/applications', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(application),
    });
  } catch (_) {}
}

async function findExam(examId) {
  const allStateExams = Object.values(stateExams).flat();

  // Check static data first
  const found = [...centralExams, ...allStateExams].find(e => e.id === examId);
  if (found) return found;

  // Fallback to API for custom exams
  try {
    const res = await fetch(`/api/schemes?examId=${encodeURIComponent(examId)}&type=custom_exams`);
    if (res.ok) {
      const data = await res.json();
      return data.exam || null;
    }
  } catch (_) {}
  return null;
}

export default function ExamFormPage() {
  const router = useRouter();
  const { stateId, examId } = router.query;
  const { data: session } = useSession();
  const user = session?.user ?? null;

  const [submitted, setSubmitted] = useState(false);
  const [submissionData, setSubmissionData] = useState(null);
  const [exam, setExam] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!examId) return;
    async function load() {
      setLoading(true);
      const found = await findExam(examId);
      setExam(found);
      setLoading(false);
    }
    load();
  }, [examId]);

  // Auth guard — redirect to login if not authenticated
  useEffect(() => {
    if (session === null) {
      router.push(`/login?redirect=${encodeURIComponent(router.asPath)}`);
    }
  }, [session]);

  const stateData = !stateId || stateId === 'central' ? null :
    [...states, ...unionTerritories].find(s => s.id === stateId);

  if (!stateId || session === undefined) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-500 font-medium">Loading exam...</p>
        </div>
      </div>
    );
  }

  if (!exam) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">😕</div>
          <h2 className="text-2xl font-bold text-gray-700 mb-2">Exam not found</h2>
          <p className="text-gray-500 text-sm mb-4">The exam may have been removed or the link is incorrect.</p>
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
          <p className="text-gray-500 mb-6">
            Your application for <strong>{exam.name}</strong> has been successfully submitted.
          </p>

          <div className="bg-gray-50 rounded-2xl p-5 mb-6 text-left space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Registration Number</span>
              <span className="font-bold text-blue-600">{submissionData.refNo}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Exam</span>
              <span className="font-semibold text-gray-700">{exam.shortName || exam.name}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Conducted By</span>
              <span className="font-semibold text-gray-700">{exam.conductedBy}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Exam Date</span>
              <span className="font-semibold text-gray-700">{exam.nextExam}</span>
            </div>
          </div>

          <div className="bg-blue-50 rounded-xl p-4 mb-6 text-left">
            <p className="text-sm text-blue-800 font-medium mb-1">📋 Next Steps</p>
            <ul className="text-xs text-blue-700 space-y-1">
              <li>• Admit card will be available 2 weeks before exam</li>
              <li>• Download admit card using registration number</li>
              <li>• Check official website for updates</li>
              <li>• Fee payment confirmation sent to your email</li>
            </ul>
          </div>

          <div className="flex gap-3">
            <button onClick={() => router.push('/')} className="flex-1 btn-primary justify-center">
              🏠 Go Home
            </button>
            <button onClick={() => router.push('/exams')} className="flex-1 btn-secondary justify-center">
              More Exams
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gradient-to-r from-blue-800 to-indigo-900 text-white py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <button
            onClick={() => router.back()}
            className="inline-flex items-center gap-2 text-white/70 hover:text-white text-sm mb-5 transition-colors"
          >
            ← Back
          </button>

          <div className="flex items-start gap-4">
            <div className="text-4xl">{exam.icon}</div>
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <span className={`badge ${exam.badgeColor}`}>{exam.category}</span>
                <span className={`badge ${exam.status === 'active' ? 'bg-green-500/80 text-white' : 'bg-yellow-500/80 text-white'}`}>
                  {exam.status === 'active' ? '🟢 Open' : '🟡 Upcoming'}
                </span>
                {stateData && <span className="badge bg-white/20 text-white">{stateData.emoji} {stateData.name}</span>}
              </div>
              <h1 className="text-2xl md:text-3xl font-extrabold">{exam.name}</h1>
              <p className="text-white/70 mt-1">{exam.conductedBy}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1 space-y-5">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
              <h3 className="font-bold text-gray-700 mb-3 text-sm uppercase tracking-wide">Exam Details</h3>
              <div className="space-y-3">
                <div>
                  <p className="text-xs text-gray-400">Posts</p>
                  <p className="text-sm text-gray-700">{exam.posts}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400">Eligibility</p>
                  <p className="text-sm text-gray-700">{exam.eligibility}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400">Application Fee</p>
                  <p className="font-semibold text-green-700 text-sm">{exam.applicationFee}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400">Next Exam</p>
                  <p className="font-semibold text-blue-700 text-sm">📅 {exam.nextExam}</p>
                </div>
                {exam.applicationDeadline && (
                  <div>
                    <p className="text-xs text-gray-400">Apply Before</p>
                    <p className="font-semibold text-red-600 text-sm">⏰ {exam.applicationDeadline}</p>
                  </div>
                )}
                <div>
                  <p className="text-xs text-gray-400">About</p>
                  <p className="text-xs text-gray-600 leading-relaxed">{exam.description}</p>
                </div>
              </div>
            </div>

            <div className="bg-blue-50 rounded-2xl border border-blue-100 p-5">
              <h3 className="font-bold text-blue-800 mb-2 text-sm">💡 Tips</h3>
              <ul className="text-xs text-blue-700 space-y-1.5">
                <li>• Use the same name as in 10th certificate</li>
                <li>• Photo: recent passport size (white bg)</li>
                <li>• Keep scanned signature ready</li>
                <li>• Aadhaar must match your name exactly</li>
              </ul>
            </div>
          </div>

          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8">
              <div className="mb-6 pb-5 border-b border-gray-100">
                <h2 className="text-xl font-bold text-gray-800">Online Application Form</h2>
                <p className="text-sm text-gray-500 mt-1">Fields marked with <span className="text-red-500">*</span> are mandatory</p>
              </div>
              <SchemeForm
                scheme={exam}
                user={user}
                onSuccess={async (data) => {
                  await saveExamApplication(data.refNo, exam, stateId, stateData, data.formData);
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
