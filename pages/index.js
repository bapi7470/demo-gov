import { useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';

export default function Home() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'loading') return;
    if (session) {
      router.replace('/home');
    } else {
      router.replace('/login');
    }
  }, [session, status, router]);

  return (
    <div className="min-h-screen bg-orange-50 flex items-center justify-center">
      <div className="text-center">
        <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-green-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
          <span className="text-3xl">🇮🇳</span>
        </div>
        <p className="text-gray-600 font-semibold">Bharat Digital Seva Portal</p>
        <p className="text-gray-400 text-sm mt-1">Loading...</p>
        <div className="mt-3 flex justify-center gap-1">
          {[0, 1, 2].map(i => (
            <div key={i} className="w-2 h-2 bg-orange-500 rounded-full animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
          ))}
        </div>
      </div>
    </div>
  );
}
