import { useRouter } from 'next/router';
import { useSession } from 'next-auth/react';
import { useEffect } from 'react';
import prisma from '../lib/prisma';
import SchemeCard from '../components/SchemeCard';
import { useApp } from '../context/AppContext';

const toJson = (arr) => arr.map(r => ({ ...r, createdAt: r.createdAt?.toISOString() ?? null }));

export async function getServerSideProps() {
  const [featuredSchemes, featuredExams] = await Promise.all([
    prisma.scheme.findMany({ where: { scope: 'central' }, orderBy: { createdAt: 'asc' }, take: 3 }),
    prisma.exam.findMany({ where: { scope: 'central' }, orderBy: { createdAt: 'asc' }, take: 3 }),
  ]);
  return { props: { featuredSchemes: toJson(featuredSchemes), featuredExams: toJson(featuredExams) } };
}

export default function Home({ featuredSchemes, featuredExams }) {
  const router = useRouter();
  const { data: session, status } = useSession();
  const { getAllBeneficiaries } = useApp();

  useEffect(() => {
    if (!session && status !== 'loading') {
      router.replace('/login');
    }
  }, [session, status, router]);

  if (!session && status !== 'loading') return null;

  const totalBeneficiaries = Object.keys(getAllBeneficiaries()).length;

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative bg-gradient-to-br from-orange-600 via-orange-500 to-green-700 text-white overflow-hidden">
        <div className="absolute inset-0 bg-black/10" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/4" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/4" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
          <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-1.5 text-sm font-medium mb-6">
            🇮🇳 Bharat Digital Seva Portal
          </div>
          <h1 className="text-4xl md:text-6xl font-extrabold mb-4 tracking-tight">
            India's One-Stop
            <span className="block text-yellow-300">Government Services</span>
          </h1>
          <p className="text-lg md:text-xl text-orange-100 max-w-2xl mx-auto mb-8">
            Apply for government schemes, exams, and welfare programs across all states — in one place.
          </p>

          <div className="flex flex-wrap justify-center gap-4">
            <button onClick={() => router.push('/states')} className="bg-white text-orange-600 hover:bg-orange-50 font-bold py-3 px-8 rounded-xl shadow-lg transition-all hover:shadow-xl hover:-translate-y-0.5 flex items-center gap-2">
              🗺️ Browse by State
            </button>
            <button onClick={() => router.push('/exams')} className="bg-orange-700/60 hover:bg-orange-700/80 backdrop-blur border border-white/30 text-white font-bold py-3 px-8 rounded-xl transition-all flex items-center gap-2">
              📝 All Exams
            </button>
            <button onClick={() => router.push('/central-schemes')} className="bg-green-700/60 hover:bg-green-700/80 backdrop-blur border border-white/30 text-white font-bold py-3 px-8 rounded-xl transition-all flex items-center gap-2">
              🏛️ Central Schemes
            </button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-14 max-w-3xl mx-auto">
            {[
              { label: 'States & UTs', value: '36', icon: '🗺️' },
              { label: 'Schemes', value: '200+', icon: '📋' },
              { label: 'Exams', value: '50+', icon: '📝' },
              { label: 'Beneficiaries', value: '50Cr+', icon: '👥' },
            ].map((stat) => (
              <div key={stat.label} className="bg-white/15 backdrop-blur rounded-xl p-4">
                <div className="text-2xl mb-1">{stat.icon}</div>
                <div className="text-2xl font-extrabold">{stat.value}</div>
                <div className="text-xs text-orange-100">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Quick Access */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-5">
          {[
            {
              icon: '📋',
              title: 'Register Now',
              desc: 'Create your account to apply for government schemes and benefits',
              color: 'from-orange-500 to-red-500',
              action: () => router.push('/login/registration'),
              cta: 'Register Now',
              badge: '✨ New',
            },
            {
              icon: '🗺️',
              title: 'State Schemes',
              desc: 'Browse welfare schemes from all 28 states and 8 UTs',
              color: 'from-orange-500 to-red-500',
              action: () => router.push('/states'),
              cta: 'View All States',
              badge: null,
            },
            {
              icon: '📝',
              title: 'Competitive Exams',
              desc: 'UPSC, SSC, State PSC, Banking, Railway and more',
              color: 'from-blue-500 to-indigo-600',
              action: () => router.push('/exams'),
              cta: 'View All Exams',
              badge: null,
            },
            {
              icon: '🏛️',
              title: 'Central Schemes',
              desc: 'PM Awas, PM Kisan, Jubo Shakti, Ayushman Bharat',
              color: 'from-green-500 to-emerald-600',
              action: () => router.push('/central-schemes'),
              cta: 'View All Schemes',
              badge: null,
            },
            {
              icon: '🏢',
              title: 'Govt Employee Directory',
              desc: 'State-wise & sector-wise government employee records with full salary details',
              color: 'from-blue-900 to-indigo-900',
              action: () => router.push('/admin'),
              cta: 'Access Portal',
              badge: '🔐 Restricted Access',
            },
            {
              icon: '🏗️',
              title: 'Private Organisations',
              desc: 'GST-registered companies — manage employee records & auto-sync scheme benefits',
              color: 'from-gray-700 to-gray-900',
              action: () => router.push('/private-portal'),
              cta: 'Browse Companies',
              badge: '🔑 Admin Login Required',
            },
            {
              icon: '👔',
              title: 'Job Directory',
              desc: 'State-wise → Sector-wise → Employee listing with salary & designation details',
              color: 'from-slate-600 to-slate-800',
              action: () => router.push('/job-directory'),
              cta: 'Browse Jobs',
              badge: null,
            },
            {
              icon: '🎓',
              title: 'Scholarships',
              desc: 'Central & State scholarships — merit-based, category-based, post-matric and more',
              color: 'from-blue-600 to-indigo-700',
              action: () => router.push('/scholarships'),
              cta: 'View Scholarships',
              badge: null,
            },
            {
              icon: '📋',
              title: 'Tenders',
              desc: 'Government tenders — road, building, water supply, electrical and more',
              color: 'from-amber-600 to-orange-700',
              action: () => router.push('/tenders'),
              cta: 'View Tenders',
              badge: null,
            },
          ].map((item) => (
            <div
              key={item.title}
              onClick={item.action}
              className="card-hover bg-white rounded-2xl overflow-hidden shadow-md border border-gray-100"
            >
              <div className={`bg-gradient-to-br ${item.color} p-6 text-white relative`}>
                {item.badge && (
                  <span className="absolute top-3 right-3 bg-white/20 text-white text-xs px-2 py-0.5 rounded-full">{item.badge}</span>
                )}
                <div className="text-4xl mb-2">{item.icon}</div>
                <h3 className="text-xl font-bold">{item.title}</h3>
                <p className="text-sm opacity-90 mt-1">{item.desc}</p>
              </div>
              <div className="p-4 flex justify-between items-center">
                <span className="text-sm font-semibold text-gray-700">{item.cta}</span>
                <span className="text-orange-500 font-bold">→</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Featured Schemes */}
      <section className="bg-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h2 className="section-title">🏛️ Popular Central Schemes</h2>
              <p className="text-gray-500 text-sm">Apply directly for central government welfare programs</p>
            </div>
            <button onClick={() => router.push('/central-schemes')} className="btn-outline text-sm">
              View All →
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {featuredSchemes.map((scheme) => (
              <SchemeCard key={scheme.id} scheme={scheme} stateId="central" type="scheme" />
            ))}
          </div>
        </div>
      </section>

      {/* Featured Exams */}
      <section className="bg-gray-50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h2 className="section-title">📝 Current Exams</h2>
              <p className="text-gray-500 text-sm">Apply for UPSC, SSC, Banking, Railway and more</p>
            </div>
            <button onClick={() => router.push('/exams')} className="btn-outline text-sm">
              View All →
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {featuredExams.map((exam) => (
              <SchemeCard key={exam.id} scheme={exam} stateId="central" type="exam" />
            ))}
          </div>
        </div>
      </section>

      {/* Jubo Shakti Highlight */}
      <section className="py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-3xl p-8 md:p-12 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-72 h-72 bg-white/5 rounded-full -translate-y-1/3 translate-x-1/4" />
          <div className="relative max-w-3xl">
            <div className="inline-flex items-center gap-2 bg-white/20 rounded-full px-3 py-1 text-sm mb-4">
              ✨ Featured Scheme
            </div>
            <h2 className="text-3xl font-extrabold mb-3">Jubo Shakti – ₹3,000/month</h2>
            <p className="text-blue-100 mb-6">
              Unemployed youth (18-35 yrs) can receive ₹3,000/month. Benefits automatically deactivate
              when you get a government/PSU job (PAN-linked verification) and resume when employment ends.
              Fair. Transparent. Automatic.
            </p>
            <div className="flex flex-wrap gap-3 mb-6">
              {['Auto-deactivates on employment', 'Resumes when job ends', 'PAN verification', 'Monthly transfer'].map((feat) => (
                <span key={feat} className="bg-white/20 text-sm px-3 py-1 rounded-full">✓ {feat}</span>
              ))}
            </div>
            <button
              onClick={() => router.push('/scheme/west-bengal/yuva-sathi')}
              className="bg-white text-blue-700 hover:bg-blue-50 font-bold py-3 px-8 rounded-xl transition-all hover:shadow-lg"
            >
              Apply for Jubo Shakti →
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="text-2xl mb-2">🇮🇳</div>
          <p className="font-semibold text-white">Government Services Portal — India</p>
          <p className="text-sm mt-2">This is a demonstration portal. For official services, visit india.gov.in</p>
          <div className="flex justify-center gap-6 mt-4 text-xs">
            <span>Privacy Policy</span>
            <span>Terms of Use</span>
            <span>Help & Support</span>
            <span>Accessibility</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
