import Link from 'next/link';
import { useRouter } from 'next/router';
import { useState } from 'react';
import { signOut, useSession } from 'next-auth/react';

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const router = useRouter();
  const { data: session } = useSession();
  const user = session?.user;

  const navLinks = [
    { to: '/home', label: 'Home' },
    { to: '/states', label: 'State Schemes' },
    { to: '/exams', label: 'Exams' },
    { to: '/central-schemes', label: 'Central Schemes' },
    { to: '/job-directory', label: 'Job Directory' },
    { to: '/company-directory', label: 'Companies' },
    { to: '/scholarships', label: '🎓 Scholarships' },
    { to: '/tenders', label: '📋 Tenders' },
  ];

  const isActive = (path) => router.pathname === path;

  const handleLogout = async () => {
    await signOut({ callbackUrl: '/login/public' });
  };

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="bg-gradient-to-r from-orange-600 via-white to-green-700 h-1" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-500 to-green-600 flex items-center justify-center text-white font-bold text-lg shadow-md">
              🇮🇳
            </div>
            <div>
              <div className="font-bold text-gray-800 text-sm leading-tight">Government Services</div>
              <div className="text-xs text-gray-500">India Digital Portal</div>
            </div>
          </Link>

          <div className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link key={link.to} href={link.to}
                className={`px-3 py-2 rounded-lg text-xs font-medium transition-all duration-200 ${
                  isActive(link.to) ? 'bg-orange-600 text-white shadow-sm' : 'text-gray-600 hover:bg-orange-50 hover:text-orange-700'
                }`}>
                {link.label}
              </Link>
            ))}
          </div>

          <div className="hidden lg:flex items-center gap-2">
            {user ? (
              <div className="flex items-center gap-2">
                <Link href="/profile"
                  className="flex items-center gap-2 bg-orange-50 hover:bg-orange-100 border border-orange-200 text-orange-700 text-xs font-semibold px-3 py-2 rounded-lg transition-colors">
                  <div className="w-6 h-6 bg-orange-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
                    {user.fullName?.split(' ').map(n => n[0]).slice(0, 1).join('')}
                  </div>
                  {user.fullName?.split(' ')[0]}
                </Link>
                <button onClick={handleLogout}
                  className="text-xs text-gray-500 hover:text-red-600 px-2 py-2 rounded-lg hover:bg-red-50 transition-colors font-medium">
                  Logout
                </button>
              </div>
            ) : (
              <Link href="/login"
                className="bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold px-4 py-2 rounded-lg transition-colors flex items-center gap-1.5">
                🔐 Login / Register
              </Link>
            )}
          </div>

          <button className="lg:hidden p-2 rounded-lg text-gray-600 hover:bg-gray-100" onClick={() => setMenuOpen(!menuOpen)}>
            <div className={`w-5 h-0.5 bg-current mb-1 transition-all ${menuOpen ? 'rotate-45 translate-y-1.5' : ''}`} />
            <div className={`w-5 h-0.5 bg-current mb-1 transition-all ${menuOpen ? 'opacity-0' : ''}`} />
            <div className={`w-5 h-0.5 bg-current transition-all ${menuOpen ? '-rotate-45 -translate-y-1.5' : ''}`} />
          </button>
        </div>

        {menuOpen && (
          <div className="lg:hidden pb-3 space-y-1">
            {navLinks.map((link) => (
              <Link key={link.to} href={link.to} onClick={() => setMenuOpen(false)}
                className={`block px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  isActive(link.to) ? 'bg-orange-600 text-white' : 'text-gray-700 hover:bg-orange-50'
                }`}>
                {link.label}
              </Link>
            ))}
            {user ? (
              <>
                <Link href="/profile" onClick={() => setMenuOpen(false)}
                  className="block px-4 py-2.5 rounded-lg text-sm font-medium text-orange-600 bg-orange-50">
                  👤 {user.fullName?.split(' ')[0]}
                </Link>
                <button
                  onClick={() => { setMenuOpen(false); handleLogout(); }}
                  className="block w-full text-left px-4 py-2.5 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50">
                  Logout
                </button>
              </>
            ) : (
              <Link href="/login" onClick={() => setMenuOpen(false)}
                className="block px-4 py-2.5 rounded-lg text-sm font-bold text-white bg-orange-600">
                🔐 Login / Register
              </Link>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}
