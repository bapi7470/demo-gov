import { useState } from 'react';
import { useRouter } from 'next/router';
import { signIn } from 'next-auth/react';

const STATES_LIST = ['Andhra Pradesh','Arunachal Pradesh','Assam','Bihar','Chhattisgarh','Goa','Gujarat','Haryana','Himachal Pradesh','Jharkhand','Karnataka','Kerala','Madhya Pradesh','Maharashtra','Manipur','Meghalaya','Mizoram','Nagaland','Odisha','Punjab','Rajasthan','Sikkim','Tamil Nadu','Telangana','Tripura','Uttar Pradesh','Uttarakhand','West Bengal','Delhi','Jammu & Kashmir'];

const STEPS = ['Personal Info', 'Identity', 'Address & Bank', 'Confirm'];

export default function RegisterPage() {
  const router = useRouter();
  const from = (router.query.from) || '/home';

  const [step, setStep] = useState(1);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [regErrors, setRegErrors] = useState({});

  const [reg, setReg] = useState({
    fullName: '', dob: '', gender: '', mobile: '', email: '', password: '',
    aadhaar: '', pan: '', category: '', education: '',
    address: '', state: '', district: '',
    bankAccount: '', ifsc: '', rationCard: '',
  });

  const validateStep1 = () => {
    const errs = {};
    if (!reg.fullName) errs.fullName = 'Full name is required';
    if (!reg.dob) errs.dob = 'Date of birth is required';
    if (!reg.gender) errs.gender = 'Please select gender';
    if (!reg.mobile || reg.mobile.length !== 10) errs.mobile = 'Enter a valid 10-digit mobile number';
    if (!reg.password || reg.password.length < 6) errs.password = 'Password must be at least 6 characters';
    if (!reg.email) errs.email = 'Email is required';
    return errs;
  };
  const validateStep2 = () => {
    const errs = {};
    if (!reg.aadhaar || reg.aadhaar.length !== 12) errs.aadhaar = 'Enter a valid 12-digit Aadhaar number';
    if (!reg.category) errs.category = 'Please select a category';
    if (!reg.education) errs.education = 'Please select education level';
    return errs;
  };
  const validateStep3 = () => {
    const errs = {};
    if (!reg.address) errs.address = 'Address is required';
    if (!reg.state) errs.state = 'Please select a state';
    if (!reg.district) errs.district = 'District is required';
    return errs;
  };

  const nextStep = () => {
    let errs = {};
    if (step === 1) errs = validateStep1();
    if (step === 2) errs = validateStep2();
    if (step === 3) errs = validateStep3();
    if (Object.keys(errs).length > 0) { setRegErrors(errs); return; }
    setRegErrors({});
    setStep(s => s + 1);
  };

  const handleRegister = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/users/register', {
        method: 'POST',
        body: JSON.stringify(reg),
        headers: { 'Content-Type': 'application/json' },
      });
      const data = await res.json();
      if (res.ok && data.success) {
        const signInRes = await signIn('credentials', {
          mobile: reg.mobile,
          password: reg.password,
          redirect: false,
        });
        if (signInRes && signInRes.ok) {
          router.replace(from);
        } else {
          setError(signInRes?.error || 'Registration succeeded but login failed. Please login manually.');
        }
      } else {
        setError(data.error || 'Registration failed. Please try again.');
      }
    } catch {
      setError('Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const validateOnChange = (name, value) => {
    if (name === 'mobile')   return value.length > 0 && value.length !== 10 ? 'Enter a valid 10-digit mobile number' : '';
    if (name === 'aadhaar')  return value.length > 0 && value.length !== 12 ? 'Enter a valid 12-digit Aadhaar number' : '';
    if (name === 'password') return value.length > 0 && value.length < 6    ? 'Password must be at least 6 characters' : '';
    return '';
  };

  const field = (name, label, type = 'text', opts = {}) => (
    <div className={opts.full ? 'sm:col-span-2' : ''}>
      <label className="form-label">{label} {!opts.optional && <span className="text-red-500">*</span>}</label>
      {opts.options ? (
        <select value={reg[name]}
          onChange={e => { setReg(p => ({ ...p, [name]: e.target.value })); setRegErrors(p => ({ ...p, [name]: '' })); }}
          className={`form-input ${regErrors[name] ? 'border-red-400' : ''}`}>
          <option value="">-- Select --</option>
          {opts.options.map(o => <option key={o} value={o}>{o}</option>)}
        </select>
      ) : (
        <input type={type} value={reg[name]} placeholder={opts.placeholder}
          onChange={e => {
            const val = e.target.value;
            setReg(p => ({ ...p, [name]: val }));
            setRegErrors(p => ({ ...p, [name]: validateOnChange(name, val) }));
          }}
          className={`form-input ${regErrors[name] ? 'border-red-400' : ''}`} />
      )}
      {regErrors[name] && <p className="text-red-500 text-xs mt-1">⚠ {regErrors[name]}</p>}
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50 flex flex-col items-center justify-center px-4 py-10">
      <div className="w-full max-w-2xl">

        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-green-600 to-emerald-700 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-lg">
            <span className="text-3xl">📝</span>
          </div>
          <h1 className="text-2xl font-extrabold text-gray-800">New Registration</h1>
          <p className="text-gray-500 text-sm mt-1">Create your citizen profile once — auto-fill all forms</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100">
          <div className="bg-gradient-to-r from-green-600 to-emerald-700 px-6 py-4">
            <p className="font-bold text-white text-base">🆓 Free Registration</p>
            <p className="text-green-100 text-xs mt-0.5">Step {step} of {STEPS.length}: {STEPS[step - 1]}</p>
          </div>

          <div className="p-6">
            {/* Step indicator */}
            <div className="flex items-center justify-center gap-2 mb-6">
              {STEPS.map((s, i) => (
                <div key={i} className="flex items-center gap-1">
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                    i + 1 < step ? 'bg-green-500 text-white'
                    : i + 1 === step ? 'bg-green-600 text-white'
                    : 'bg-gray-200 text-gray-400'
                  }`}>
                    {i + 1 < step ? '✓' : i + 1}
                  </div>
                  {i < STEPS.length - 1 && (
                    <div className={`w-8 h-0.5 ${i + 1 < step ? 'bg-green-400' : 'bg-gray-200'}`} />
                  )}
                </div>
              ))}
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-red-700 text-sm mb-4">
                ❌ {error}
              </div>
            )}

            {step === 1 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {field('fullName', 'Full Name', 'text', { full: true, placeholder: 'e.g. Rahul Kumar Das' })}
                {field('dob', 'Date of Birth', 'date')}
                {field('gender', 'Gender', 'select', { options: ['Male', 'Female', 'Transgender'] })}
                {field('mobile', 'Mobile Number', 'tel', { placeholder: '9XXXXXXXXX' })}
                {field('email', 'Email Address', 'email', { placeholder: 'example@email.com' })}
                {field('password', 'Password (min 6 chars)', 'password', { placeholder: '••••••••' })}
              </div>
            )}

            {step === 2 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {field('aadhaar', 'Aadhaar Number (12 digits)', 'text', { placeholder: 'XXXXXXXXXXXX' })}
                {field('pan', 'PAN Card Number', 'text', { placeholder: 'ABCDE1234F', optional: true })}
                {field('category', 'Category', 'select', { options: ['General', 'OBC', 'OBC-A', 'OBC-B', 'SC', 'ST', 'EWS', 'Minority'] })}
                {field('education', 'Highest Education', 'select', { options: ['Class 8', 'Class 10', 'Class 12', 'Diploma', 'Graduate', 'Post Graduate', 'PhD'] })}
                {field('rationCard', 'Ration Card Number', 'text', { optional: true, placeholder: 'Optional' })}
              </div>
            )}

            {step === 3 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {field('address', 'Full Address', 'text', { full: true, placeholder: 'Village/Area, Post Office...' })}
                {field('state', 'State', 'select', { options: STATES_LIST })}
                {field('district', 'District', 'text', { placeholder: 'District name' })}
                {field('bankAccount', 'Bank Account Number', 'text', { optional: true, placeholder: 'Optional' })}
                {field('ifsc', 'IFSC Code', 'text', { optional: true, placeholder: 'Optional' })}
              </div>
            )}

            {step === 4 && (
              <div className="space-y-4">
                <div className="bg-green-50 border border-green-200 rounded-2xl p-5">
                  <h3 className="font-bold text-green-800 mb-3">✅ Please verify your details</h3>
                  <div className="grid grid-cols-2 gap-x-4 gap-y-1.5">
                    {[
                      ['Full Name', reg.fullName], ['Date of Birth', reg.dob],
                      ['Gender', reg.gender], ['Mobile', reg.mobile],
                      ['Email', reg.email],
                      ['Aadhaar', reg.aadhaar ? reg.aadhaar.slice(0,4) + ' **** ' + reg.aadhaar.slice(-4) : '—'],
                      ['Category', reg.category], ['Education', reg.education],
                      ['State', reg.state], ['District', reg.district],
                    ].map(([k, v]) => (
                      <div key={k} className="flex justify-between py-1.5 border-b border-green-100">
                        <span className="text-gray-500 text-xs">{k}</span>
                        <span className="font-semibold text-gray-700 text-xs text-right max-w-32 truncate">{v || '—'}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="bg-blue-50 border border-blue-100 rounded-xl p-3 text-xs text-blue-700 space-y-1">
                  <p>✓ Your profile will <strong>auto-fill</strong> all scheme & exam application forms.</p>
                  <p>✓ Scheme <strong>eligibility</strong> will be automatically checked from your profile.</p>
                </div>
              </div>
            )}

            {/* Navigation buttons */}
            <div className="flex gap-3 mt-6">
              {step > 1 && (
                <button onClick={() => setStep(s => s - 1)}
                  className="flex-1 border-2 border-gray-300 text-gray-700 py-2.5 rounded-xl font-semibold hover:bg-gray-50 transition-colors">
                  ← Back
                </button>
              )}
              {step < 4 ? (
                <button onClick={nextStep}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold py-2.5 rounded-xl transition-colors">
                  Next →
                </button>
              ) : (
                <button onClick={handleRegister} disabled={loading}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold py-2.5 rounded-xl transition-colors flex items-center justify-center gap-2 disabled:opacity-60">
                  {loading
                    ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Registering...</>
                    : '✅ Complete Registration'}
                </button>
              )}
            </div>

            <p className="text-center text-sm text-gray-500 mt-4">
              Already have an account?{' '}
              <button onClick={() => router.push('/login/public')}
                className="text-orange-600 font-semibold hover:underline">
                Login here →
              </button>
            </p>
          </div>
        </div>

        <button onClick={() => router.push('/login')}
          className="mt-5 w-full text-center text-sm text-gray-500 hover:text-gray-700 transition-colors">
          ← Back to Portal Selection
        </button>
      </div>
    </div>
  );
}
