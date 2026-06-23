import { useRouter } from 'next/router';

const PORTAL_CARDS = [
  {
    id: 'registration',
    icon: '📝',
    title: 'Register',
    subtitle: 'New User Sign Up',
    desc: 'Create your profile once — auto-fill all government forms and check eligibility instantly.',
    color: 'from-green-600 to-emerald-700',
    badge: '🆓 Free Registration',
    badgeColor: 'bg-green-100 text-green-700',
    href: '/login/registration',
  },
  {
    id: 'public',
    icon: '👤',
    title: 'Public',
    subtitle: 'Citizens & Applicants',
    desc: 'Apply for government schemes, check eligibility, fill exam forms and more.',
    color: 'from-orange-500 to-orange-700',
    badge: '✅ Open to All',
    badgeColor: 'bg-orange-100 text-orange-700',
    href: '/login/public',
  },
  {
    id: 'district',
    icon: '👑',
    title: 'District',
    subtitle: 'Co-Admin / Member / Elder',
    desc: 'District-level officials login here to review and verify scheme applications.',
    color: 'from-indigo-700 to-purple-800',
    badge: '🔒 Official Access',
    badgeColor: 'bg-indigo-100 text-indigo-700',
    href: '/district-login',
  },
  {
    id: 'government',
    icon: '🏛️',
    title: 'Government',
    subtitle: 'Officials & Employees',
    desc: 'Authorised government personnel access for employee directory and admin functions.',
    color: 'from-blue-700 to-indigo-800',
    badge: '🔒 Restricted Access',
    badgeColor: 'bg-blue-100 text-blue-700',
    href: '/login/government',
  },
  {
    id: 'track',
    icon: '🔍',
    title: 'Application Track',
    subtitle: 'Check Application Status',
    desc: 'Check the status of your submitted scheme, exam or scholarship application using your Reference Number.',
    color: 'from-purple-600 to-violet-800',
    badge: '📋 No Login Required',
    badgeColor: 'bg-purple-100 text-purple-700',
    href: '/track',
  },
];

export default function LoginPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-green-50 flex flex-col items-center justify-center px-4 py-10">
      <div className="w-full max-w-3xl">

        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-green-600 rounded-full flex items-center justify-center mx-auto mb-3 shadow-lg">
            <span className="text-3xl">🇮🇳</span>
          </div>
          <h1 className="text-3xl font-extrabold text-gray-800">Bharat Digital Seva Portal</h1>
          <p className="text-gray-500 text-sm mt-1">India's one-stop government services platform</p>
        </div>

        {/* Portal Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
          {PORTAL_CARDS.map(card => (
            <div
              key={card.id}
              onClick={() => router.push(card.href)}
              className="cursor-pointer rounded-2xl border-2 border-gray-200 overflow-hidden transition-all duration-200 shadow-sm hover:shadow-lg hover:-translate-y-1 hover:border-gray-300 group"
            >
              <div className={`bg-gradient-to-br ${card.color} p-5 text-white`}>
                <div className="text-4xl mb-2">{card.icon}</div>
                <h3 className="text-lg font-extrabold leading-tight">{card.title}</h3>
                <p className="text-white/75 text-xs mt-0.5">{card.subtitle}</p>
              </div>
              <div className="p-4 bg-white group-hover:bg-gray-50 transition-colors">
                <p className="text-xs text-gray-600 leading-relaxed mb-3">{card.desc}</p>
                <div className="flex items-center justify-between">
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${card.badgeColor}`}>
                    {card.badge}
                  </span>
                  <span className="text-xs font-bold text-gray-400 group-hover:text-orange-600 transition-colors">
                    Enter →
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        <p className="text-center text-gray-400 text-sm mt-2">
          ↑ Select a portal above to continue
        </p>
      </div>
    </div>
  );
}
