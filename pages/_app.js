import { SessionProvider, useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { AuthProvider } from "../context/AuthContext";
import { AppProvider } from "../context/AppContext";
import Navbar from "../components/Navbar";
import "../styles/globals.css";

// Pages that should NOT show the Navbar
const NO_NAVBAR_PATHS = [
  '/login', '/login/public', '/login/government', '/login/registration',
  '/track', '/district-login', '/district/dashboard',
  '/admin', '/admin/applications',
];

function AppContent({ Component, pageProps }) {
  const router = useRouter();
  const { data: session } = useSession();

  // Hide navbar on login/admin/district pages, show only when logged in
  const isNoNavbarPage = NO_NAVBAR_PATHS.some(p => router.pathname === p)
    || router.pathname.startsWith('/admin/');

  const showNavbar = session && !isNoNavbarPage;

  return (
    <div className="min-h-screen bg-gray-50">
      {showNavbar && <Navbar />}
      <Component {...pageProps} />
    </div>
  );
}

export default function App({ Component, pageProps: { session, ...pageProps } }) {
  return (
    <SessionProvider session={session}>
      <AuthProvider>
        <AppProvider>
          <AppContent Component={Component} pageProps={pageProps} />
        </AppProvider>
      </AuthProvider>
    </SessionProvider>
  );
}
