import { createContext, useContext } from 'react';
import { useSession, signIn, signOut } from 'next-auth/react';

const AuthContext = createContext(null);

function getAge(dob) {
  if (!dob) return 0;
  const today = new Date();
  const birthDate = new Date(dob);
  let age = today.getFullYear() - birthDate.getFullYear();
  const m = today.getMonth() - birthDate.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
}

const schemeEligibility = {
  'yuva-sathi': (p) => {
    if (!p) return { eligible: true };
    const age = getAge(p.dob);
    if (age < 18 || age > 35) return { eligible: false, reason: `Age limit is 18–35 years. Your age: ${age} years.` };
    return { eligible: true };
  },
  'kanyashree': (p) => {
    if (!p) return { eligible: true };
    if (p.gender !== 'Female') return { eligible: false, reason: 'Kanyashree is only for girl students.' };
    const age = getAge(p.dob);
    if (age < 13 || age > 18) return { eligible: false, reason: `Age limit is 13–18 years. Your age: ${age} years.` };
    return { eligible: true };
  },
  'lakshmir-bhandar': (p) => ({ eligible: true }),
  'annapurna-bhandar': (p) => {
    if (!p) return { eligible: true };
    if (p.gender !== 'Female') return { eligible: false, reason: 'Annapurna Bhandar is only for women.' };
    const age = getAge(p.dob);
    if (age < 25 || age > 60) return { eligible: false, reason: `Age limit is 25–60 years. Your age: ${age} years.` };
    return { eligible: true };
  },
  'rupashree': (p) => {
    if (!p) return { eligible: true };
    if (p.gender !== 'Female') return { eligible: false, reason: 'Rupashree Prakalpa is only for women.' };
    const age = getAge(p.dob);
    if (age < 18) return { eligible: false, reason: `Minimum age is 18 years. Your age: ${age} years.` };
    return { eligible: true };
  },
  'pm-kisan': () => ({ eligible: true }),
  'krishak-bandhu': () => ({ eligible: true }),
  'pm-ujjwala': (p) => {
    if (!p) return { eligible: true };
    if (p.gender !== 'Female') return { eligible: false, reason: 'PM Ujjwala is only for women applicants (18+).' };
    const age = getAge(p.dob);
    if (age < 18) return { eligible: false, reason: `Minimum age is 18 years. Your age: ${age} years.` };
    return { eligible: true };
  },
  'beti-bachao': () => ({ eligible: true }),
  'ayushman-bharat': () => ({ eligible: true }),
  'swasthya-sathi': () => ({ eligible: true }),
  'pm-awas-yojana': () => ({ eligible: true }),
};

export function AuthProvider({ children }) {
  const { data: session, update } = useSession();

  const user = session?.user ?? null;

  async function login(mobile, password) {
    const result = await signIn('credentials', {
      redirect: false,
      mobile,
      password,
    });
    return result;
  }

  async function logout() {
    await signOut({ redirect: false });
  }

  async function register(profileData) {
    const res = await fetch('/api/users/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(profileData),
    });

    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.message || 'Registration failed');
    }

    const result = await signIn('credentials', {
      redirect: false,
      mobile: profileData.mobile,
      password: profileData.password,
    });

    return result;
  }

  async function updateProfile(updates) {
    const res = await fetch('/api/users/profile', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });

    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.message || 'Profile update failed');
    }

    const updatedUser = await res.json();
    await update({ user: updatedUser });
    return updatedUser;
  }

  function checkEligibility(schemeId) {
    const checker = schemeEligibility[schemeId];
    if (!checker) return { eligible: true };
    return checker(user);
  }

  function getAutoFill() {
    if (!user) return {};
    return {
      fullName: user.fullName || '',
      mobile: user.mobile || '',
      email: user.email || '',
      dob: user.dob || '',
      gender: user.gender || '',
      address: user.address || '',
      district: user.district || '',
      state: user.state || '',
      aadhaar: user.aadhaar || '',
      pan: user.pan || '',
      category: user.category || '',
      education: user.education || '',
      bankAccount: user.bankAccount || '',
      ifsc: user.ifsc || '',
    };
  }

  const value = {
    user,
    login,
    logout,
    register,
    updateProfile,
    checkEligibility,
    getAutoFill,
    getAge,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export default AuthContext;
