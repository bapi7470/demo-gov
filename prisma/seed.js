const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// ──────────────────────────────────────────────────────────────────────────────
// GOV ADMINS
// ──────────────────────────────────────────────────────────────────────────────
const GOV_ADMINS = [
  { username: 'wb_admin',  password: 'WB@2024', stateId: 'west-bengal',      stateName: 'West Bengal',       emoji: '🐯',  level: 'state' },
  { username: 'up_admin',  password: 'UP@2024', stateId: 'uttar-pradesh',    stateName: 'Uttar Pradesh',     emoji: '🕌',  level: 'state' },
  { username: 'mh_admin',  password: 'MH@2024', stateId: 'maharashtra',      stateName: 'Maharashtra',       emoji: '🌆',  level: 'state' },
  { username: 'ka_admin',  password: 'KA@2024', stateId: 'karnataka',        stateName: 'Karnataka',         emoji: '🏯',  level: 'state' },
  { username: 'dl_admin',  password: 'DL@2024', stateId: 'delhi',            stateName: 'Delhi (NCT)',       emoji: '🏛️', level: 'state' },
  { username: 'tn_admin',  password: 'TN@2024', stateId: 'tamil-nadu',       stateName: 'Tamil Nadu',        emoji: '🕌',  level: 'state' },
  { username: 'rj_admin',  password: 'RJ@2024', stateId: 'rajasthan',        stateName: 'Rajasthan',         emoji: '🏜️', level: 'state' },
  { username: 'br_admin',  password: 'BR@2024', stateId: 'bihar',            stateName: 'Bihar',             emoji: '🎓',  level: 'state' },
  { username: 'gj_admin',  password: 'GJ@2024', stateId: 'gujarat',          stateName: 'Gujarat',           emoji: '🦁',  level: 'state' },
  { username: 'kl_admin',  password: 'KL@2024', stateId: 'kerala',           stateName: 'Kerala',            emoji: '🌴',  level: 'state' },
  { username: 'pb_admin',  password: 'PB@2024', stateId: 'punjab',           stateName: 'Punjab',            emoji: '🌾',  level: 'state' },
  { username: 'mp_admin',  password: 'MP@2024', stateId: 'madhya-pradesh',   stateName: 'Madhya Pradesh',    emoji: '🐯',  level: 'state' },
  { username: 'ap_admin',  password: 'AP@2024', stateId: 'andhra-pradesh',   stateName: 'Andhra Pradesh',    emoji: '🏛️', level: 'state' },
  { username: 'as_admin',  password: 'AS@2024', stateId: 'assam',            stateName: 'Assam',             emoji: '🌿',  level: 'state' },
  { username: 'od_admin',  password: 'OD@2024', stateId: 'odisha',           stateName: 'Odisha',            emoji: '🕌',  level: 'state' },
  { username: 'hr_admin',  password: 'HR@2024', stateId: 'haryana',          stateName: 'Haryana',           emoji: '🌻',  level: 'state' },
  { username: 'jk_admin',  password: 'JK@2024', stateId: 'jammu-kashmir',    stateName: 'Jammu & Kashmir',   emoji: '❄️',  level: 'state' },
  { username: 'jh_admin',  password: 'JH@2024', stateId: 'jharkhand',        stateName: 'Jharkhand',         emoji: '🌲',  level: 'state' },
  { username: 'gov_admin', password: 'GOV@2024', stateId: 'central',         stateName: 'Central Government',emoji: '🇮🇳', level: 'central' },
];

// ──────────────────────────────────────────────────────────────────────────────
// DEMO USERS
// ──────────────────────────────────────────────────────────────────────────────
const DEMO_USERS = [
  { id: 'demo001', fullName: 'Rahul Kumar Das', dob: '1998-05-15', gender: 'Male',   mobile: '9800000001', password: 'demo123', email: 'rahul@example.com', aadhaar: '123456789012', pan: 'YUVSTH001A', category: 'General', education: 'Graduate',  address: '12 Park Street, Kolkata', state: 'West Bengal', district: 'Kolkata' },
  { id: 'demo002', fullName: 'Priya Sharma',    dob: '2005-03-20', gender: 'Female', mobile: '9800000002', password: 'demo456', email: 'priya@example.com', aadhaar: '234567890123', pan: 'PANKSH004D', category: 'SC',      education: 'Class 12', address: '45 Gandhi Road, Howrah',  state: 'West Bengal', district: 'Howrah'  },
];

// ──────────────────────────────────────────────────────────────────────────────
// DEFAULT BENEFICIARIES
// ──────────────────────────────────────────────────────────────────────────────
const DEFAULT_BENEFICIARIES = [
  { pan: 'YUVSTH001A', name: 'Rahul Kumar Das', mobile: '9800000001', schemes: [{ id: 'yuva-sathi', name: 'Jubo Shakti', stateId: 'west-bengal', benefit: '₹3,000/month' }], status: 'active', appliedOn: '2026-01-10' },
  { pan: 'YUVSTH002B', name: 'Priya Mondal',    mobile: '9800000002', schemes: [{ id: 'yuva-sathi', name: 'Jubo Shakti', stateId: 'west-bengal', benefit: '₹3,000/month' }, { id: 'annapurna-bhandar', name: 'Annapurna Bhandar', stateId: 'west-bengal', benefit: '₹3,000/month' }], status: 'active', appliedOn: '2026-02-05' },
  { pan: 'YUVSTH003C', name: 'Amit Sharma',     mobile: '9800000003', schemes: [{ id: 'yuva-sathi', name: 'Jubo Shakti', stateId: 'west-bengal', benefit: '₹3,000/month' }], status: 'active', appliedOn: '2026-01-20' },
  { pan: 'PANKSH004D', name: 'Sunita Devi',     mobile: '9800000004', schemes: [{ id: 'annapurna-bhandar', name: 'Annapurna Bhandar', stateId: 'west-bengal', benefit: '₹3,000/month' }, { id: 'kanyashree', name: 'Kanyashree Prakalpa', stateId: 'west-bengal', benefit: '₹1000/year + ₹25,000' }], status: 'active', appliedOn: '2026-03-01' },
];

// ──────────────────────────────────────────────────────────────────────────────
// SCHEMES — Central
// ──────────────────────────────────────────────────────────────────────────────
const CENTRAL_SCHEMES = [
  {
    id: 'pm-awas-yojana', stateId: 'central',
    name: 'PM Awas Yojana', nameHindi: 'प्रधानमंत्री आवास योजना',
    ministry: 'Ministry of Housing', category: 'Housing',
    benefit: '₹1.2 Lakh - ₹2.5 Lakh assistance',
    eligibility: 'BPL families, EWS, LIG',
    icon: '🏠',
    description: 'Housing for All scheme providing financial assistance to eligible beneficiaries for construction of pucca houses.',
    documents: ['Aadhaar Card', 'Income Certificate', 'Land Document', 'BPL Card'],
    formFields: [
      { name: 'fullName', label: 'Full Name', type: 'text', required: true },
      { name: 'dob', label: 'Date of Birth', type: 'date', required: true },
      { name: 'gender', label: 'Gender', type: 'select', options: ['Male', 'Female', 'Other'], required: true },
      { name: 'aadhaar', label: 'Aadhaar Number', type: 'text', placeholder: 'XXXX XXXX XXXX', required: true },
      { name: 'mobile', label: 'Mobile Number', type: 'tel', required: true },
      { name: 'income', label: 'Annual Family Income (₹)', type: 'number', required: true },
      { name: 'address', label: 'Full Address', type: 'textarea', required: true },
      { name: 'district', label: 'District', type: 'text', required: true },
      { name: 'state', label: 'State', type: 'text', required: true },
      { name: 'category', label: 'Category', type: 'select', options: ['EWS', 'LIG', 'MIG-I', 'MIG-II'], required: true },
      { name: 'bankAccount', label: 'Bank Account Number', type: 'text', required: true },
      { name: 'ifsc', label: 'IFSC Code', type: 'text', required: true },
    ],
  },
  {
    id: 'pm-kisan', stateId: 'central',
    name: 'PM Kisan Samman Nidhi', nameHindi: 'पीएम किसान सम्मान निधि',
    ministry: 'Ministry of Agriculture', category: 'Agriculture',
    benefit: '₹6,000/year (3 installments)',
    eligibility: 'Small & Marginal Farmers',
    icon: '🌾',
    description: 'Direct income support of ₹6000 per year to eligible farmer families to supplement their financial needs.',
    documents: ['Aadhaar Card', 'Land Record (Khatauni)', 'Bank Passbook'],
    formFields: [
      { name: 'fullName', label: "Farmer's Full Name", type: 'text', required: true },
      { name: 'dob', label: 'Date of Birth', type: 'date', required: true },
      { name: 'gender', label: 'Gender', type: 'select', options: ['Male', 'Female', 'Other'], required: true },
      { name: 'aadhaar', label: 'Aadhaar Number', type: 'text', required: true },
      { name: 'mobile', label: 'Mobile Number', type: 'tel', required: true },
      { name: 'landArea', label: 'Total Land Area (in Acres)', type: 'number', required: true },
      { name: 'khasraNo', label: 'Khasra/Survey Number', type: 'text', required: true },
      { name: 'district', label: 'District', type: 'text', required: true },
      { name: 'village', label: 'Village', type: 'text', required: true },
      { name: 'bankAccount', label: 'Bank Account Number', type: 'text', required: true },
      { name: 'ifsc', label: 'IFSC Code', type: 'text', required: true },
    ],
  },
  {
    id: 'ayushman-bharat', stateId: 'central',
    name: 'Ayushman Bharat', nameHindi: 'आयुष्मान भारत',
    ministry: 'Ministry of Health', category: 'Health',
    benefit: '₹5 Lakh/year health cover',
    eligibility: 'SECC listed families',
    icon: '🏥',
    description: 'Health insurance scheme providing cover up to ₹5 lakh per family per year for secondary and tertiary hospitalization.',
    documents: ['Aadhaar Card', 'SECC Data verification', 'Ration Card'],
    formFields: [
      { name: 'fullName', label: 'Full Name', type: 'text', required: true },
      { name: 'dob', label: 'Date of Birth', type: 'date', required: true },
      { name: 'gender', label: 'Gender', type: 'select', options: ['Male', 'Female', 'Other'], required: true },
      { name: 'aadhaar', label: 'Aadhaar Number', type: 'text', required: true },
      { name: 'mobile', label: 'Mobile Number', type: 'tel', required: true },
      { name: 'rationCard', label: 'Ration Card Number', type: 'text', required: false },
      { name: 'familyMembers', label: 'Number of Family Members', type: 'number', required: true },
      { name: 'district', label: 'District', type: 'text', required: true },
      { name: 'state', label: 'State', type: 'text', required: true },
    ],
  },
  {
    id: 'pm-ujjwala', stateId: 'central',
    name: 'PM Ujjwala Yojana', nameHindi: 'प्रधानमंत्री उज्ज्वला योजना',
    ministry: 'Ministry of Petroleum', category: 'Energy',
    benefit: 'Free LPG connection + ₹1600',
    eligibility: 'BPL Women (18+ yrs)',
    icon: '🔥',
    description: 'Provide clean cooking fuel (LPG) to women from Below Poverty Line households to protect health.',
    documents: ['Aadhaar Card', 'BPL Card', 'Bank Account'],
    formFields: [
      { name: 'fullName', label: 'Full Name (Women Applicant)', type: 'text', required: true },
      { name: 'dob', label: 'Date of Birth', type: 'date', required: true },
      { name: 'aadhaar', label: 'Aadhaar Number', type: 'text', required: true },
      { name: 'mobile', label: 'Mobile Number', type: 'tel', required: true },
      { name: 'address', label: 'Full Address', type: 'textarea', required: true },
      { name: 'district', label: 'District', type: 'text', required: true },
      { name: 'bplCard', label: 'BPL Card Number', type: 'text', required: true },
      { name: 'bankAccount', label: 'Bank Account Number', type: 'text', required: true },
      { name: 'ifsc', label: 'IFSC Code', type: 'text', required: true },
    ],
  },
  {
    id: 'beti-bachao', stateId: 'central',
    name: 'Beti Bachao Beti Padhao', nameHindi: 'बेटी बचाओ बेटी पढ़ाओ',
    ministry: 'Ministry of WCD', category: 'Women & Child',
    benefit: 'Educational support & incentives',
    eligibility: 'Girl Child (0-18 yrs)',
    icon: '👧',
    description: 'Scheme to address declining child sex ratio and promote welfare of girl child through education.',
    documents: ['Birth Certificate', 'Aadhaar of Parents', 'School Enrollment Proof'],
    formFields: [
      { name: 'childName', label: "Girl Child's Name", type: 'text', required: true },
      { name: 'dob', label: 'Date of Birth (Child)', type: 'date', required: true },
      { name: 'fatherName', label: "Father's Name", type: 'text', required: true },
      { name: 'motherName', label: "Mother's Name", type: 'text', required: true },
      { name: 'aadhaarParent', label: "Parent's Aadhaar Number", type: 'text', required: true },
      { name: 'mobile', label: 'Mobile Number', type: 'tel', required: true },
      { name: 'address', label: 'Full Address', type: 'textarea', required: true },
      { name: 'district', label: 'District', type: 'text', required: true },
    ],
  },
  {
    id: 'pm-mudra', stateId: 'central',
    name: 'PM Mudra Yojana', nameHindi: 'प्रधानमंत्री मुद्रा योजना',
    ministry: 'Ministry of Finance', category: 'Business Loan',
    benefit: 'Loan up to ₹10 Lakh',
    eligibility: 'Small business owners',
    icon: '💼',
    description: 'Provides loans up to ₹10 lakh to non-corporate, non-farm small/micro enterprises.',
    documents: ['Aadhaar Card', 'PAN Card', 'Business Plan', 'Bank Statements'],
    formFields: [
      { name: 'fullName', label: 'Applicant Name', type: 'text', required: true },
      { name: 'dob', label: 'Date of Birth', type: 'date', required: true },
      { name: 'aadhaar', label: 'Aadhaar Number', type: 'text', required: true },
      { name: 'pan', label: 'PAN Card Number', type: 'text', required: true },
      { name: 'mobile', label: 'Mobile Number', type: 'tel', required: true },
      { name: 'businessType', label: 'Type of Business', type: 'text', required: true },
      { name: 'loanType', label: 'Loan Category', type: 'select', options: ['Shishu (up to ₹50,000)', 'Kishore (₹50,001 - ₹5 Lakh)', 'Tarun (₹5 Lakh - ₹10 Lakh)'], required: true },
      { name: 'loanAmount', label: 'Loan Amount Required (₹)', type: 'number', required: true },
      { name: 'bankAccount', label: 'Bank Account Number', type: 'text', required: true },
      { name: 'ifsc', label: 'IFSC Code', type: 'text', required: true },
    ],
  },
];

// ──────────────────────────────────────────────────────────────────────────────
// SCHEMES — State
// ──────────────────────────────────────────────────────────────────────────────
const STATE_SCHEMES = [
  // West Bengal
  {
    id: 'yuva-sathi', stateId: 'west-bengal',
    name: 'Jubo Shakti', nameHindi: 'যুব সাথী (যুব শক্তি)',
    ministry: 'Labour Department, Govt. of West Bengal', category: 'Youth Employment',
    benefit: '₹3,000/month',
    eligibility: 'Unemployed WB Youth (18-45 yrs), family income < ₹2L/year',
    icon: '👨‍💼',
    description: "West Bengal government's flagship scheme providing monthly financial assistance to unemployed youth. Benefits automatically deactivate when the beneficiary secures a job (PAN-linked verification) and resume when employment ends.",
    documents: ['Aadhaar Card', 'PAN Card', 'Voter ID / Domicile Certificate', 'Educational Certificate', 'Bank Passbook', 'Income Certificate', 'Unemployment Certificate from Employment Exchange'],
    formFields: [
      { name: 'fullName', label: 'Full Name', type: 'text', required: true },
      { name: 'dob', label: 'Date of Birth', type: 'date', required: true },
      { name: 'gender', label: 'Gender', type: 'select', required: true, options: ['Male', 'Female', 'Other'] },
      { name: 'aadhaar', label: 'Aadhaar Number', type: 'text', required: true },
      { name: 'pan', label: 'PAN Card Number', type: 'text', required: true, placeholder: 'ABCDE1234F' },
      { name: 'mobile', label: 'Mobile Number', type: 'tel', required: true },
      { name: 'email', label: 'Email Address', type: 'email', required: false },
      { name: 'education', label: 'Highest Qualification', type: 'select', required: true, options: ['Class 8', 'Class 10', 'Class 12', 'Diploma', 'Graduate', 'Post Graduate'] },
      { name: 'address', label: 'Full Address', type: 'textarea', required: true },
      { name: 'district', label: 'District', type: 'select', required: true, options: ['Kolkata','Howrah','Hooghly','North 24 Parganas','South 24 Parganas','Nadia','Murshidabad','Bardhaman','Birbhum','Bankura','Purulia','Midnapore East','Midnapore West','Jhargram','Jalpaiguri','Darjeeling','Alipurduar','Cooch Behar','Malda','Dinajpur North','Dinajpur South'] },
      { name: 'annualIncome', label: 'Annual Family Income (₹)', type: 'number', required: true },
      { name: 'unemployedSince', label: 'Unemployed Since (Month/Year)', type: 'month', required: true },
      { name: 'bankAccount', label: 'Bank Account Number', type: 'text', required: true },
      { name: 'ifsc', label: 'IFSC Code', type: 'text', required: true },
      { name: 'declaration', label: 'I declare that I am currently unemployed and have no government / PSU / private sector job', type: 'checkbox', required: true },
    ],
  },
  {
    id: 'kanyashree', stateId: 'west-bengal',
    name: 'Kanyashree Prakalpa', nameHindi: 'কন্যাশ্রী প্রকল্প',
    category: 'Girl Education',
    benefit: '₹1000/year + ₹25,000 at 18',
    eligibility: 'Girls (13-18 yrs), SC/ST/OBC/Minority/BPL',
    icon: '🎓',
    description: 'Annual scholarship and one-time grant to girl students to continue education and prevent child marriage.',
    documents: ['Birth Certificate', 'School Certificate', 'Aadhaar', 'Bank Account'],
    formFields: [
      { name: 'studentName', label: "Student's Full Name", type: 'text', required: true },
      { name: 'dob', label: 'Date of Birth', type: 'date', required: true },
      { name: 'schoolName', label: 'School Name', type: 'text', required: true },
      { name: 'class', label: 'Current Class', type: 'select', options: ['Class 8', 'Class 9', 'Class 10', 'Class 11', 'Class 12'], required: true },
      { name: 'aadhaar', label: 'Aadhaar Number', type: 'text', required: true },
      { name: 'mobile', label: 'Mobile Number', type: 'tel', required: true },
      { name: 'category', label: 'Category', type: 'select', options: ['SC', 'ST', 'OBC-A', 'OBC-B', 'Minority', 'General-BPL'], required: true },
      { name: 'bankAccount', label: 'Bank Account Number', type: 'text', required: true },
      { name: 'ifsc', label: 'IFSC Code', type: 'text', required: true },
      { name: 'guardianName', label: "Guardian's Name", type: 'text', required: true },
      { name: 'annualIncome', label: 'Family Annual Income (₹)', type: 'number', required: true },
    ],
  },
  {
    id: 'annapurna-bhandar', stateId: 'west-bengal',
    name: 'Annapurna Bhandar', nameHindi: 'অন্নপূর্ণা ভান্ডার',
    ministry: 'Government of West Bengal', category: 'Women Welfare',
    benefit: '₹3,000/month (via DBT)',
    eligibility: 'Women (25-60 yrs), WB resident, non-IT payer, not Govt employee',
    icon: '🌾',
    description: 'Upgraded replacement for the Lakshmir Bhandar Scheme. Provides ₹3,000/month directly to Aadhaar-linked bank accounts of eligible women (25-60 yrs) in West Bengal. Around 2 crore women to benefit.',
    documents: ['Aadhaar Card', 'Voter ID', 'Domicile / Nativity Certificate', 'Aadhaar-linked Bank Passbook', 'Income Certificate (non-IT payer)', 'Swasthya Sathi Card (if any)'],
    formFields: [
      { name: 'fullName', label: 'Full Name (as per Aadhaar)', type: 'text', required: true },
      { name: 'dob', label: 'Date of Birth', type: 'date', required: true },
      { name: 'aadhaar', label: 'Aadhaar Number', type: 'text', required: true, placeholder: 'XXXX XXXX XXXX' },
      { name: 'voterId', label: 'Voter ID (EPIC No.)', type: 'text', required: false },
      { name: 'mobile', label: 'Mobile Number (Aadhaar-linked)', type: 'tel', required: true },
      { name: 'category', label: 'Category', type: 'select', required: true, options: ['SC', 'ST', 'OBC-A', 'OBC-B', 'General', 'Minority'] },
      { name: 'occupation', label: 'Current Occupation', type: 'select', required: true, options: ['Homemaker', 'Self Employed', 'Daily Wage Worker', 'Unemployed', 'Other (Non-Govt)'] },
      { name: 'isGovtEmployee', label: 'Are you a Government Employee or receiving Govt Pension?', type: 'select', required: true, options: ['No', 'Yes (Permanent)', 'Yes (Retired/Pension)'] },
      { name: 'isITpayer', label: 'Are you an Income Tax payer?', type: 'select', required: true, options: ['No', 'Yes'] },
      { name: 'address', label: 'Full Residential Address', type: 'textarea', required: true },
      { name: 'district', label: 'District', type: 'select', required: true, options: ['Kolkata','Howrah','Hooghly','North 24 Parganas','South 24 Parganas','Nadia','Murshidabad','Bardhaman','Birbhum','Bankura','Purulia','Midnapore East','Midnapore West','Jhargram','Jalpaiguri','Darjeeling','Alipurduar','Cooch Behar','Malda','Dinajpur North','Dinajpur South'] },
      { name: 'bankAccount', label: 'Bank Account Number (Aadhaar-linked)', type: 'text', required: true },
      { name: 'ifsc', label: 'IFSC Code', type: 'text', required: true },
      { name: 'declaration', label: 'I declare I am a permanent WB resident (25-60 yrs), not a Govt employee, not an IT payer, and the above information is true', type: 'checkbox', required: true },
    ],
  },
  {
    id: 'swasthya-sathi', stateId: 'west-bengal',
    name: 'Swasthya Sathi', nameHindi: 'স্বাস্থ্য সাথী',
    category: 'Health Insurance',
    benefit: '₹5 Lakh health cover/family',
    eligibility: 'All WB residents',
    icon: '🏥',
    description: 'Universal health coverage scheme for all West Bengal residents providing cashless treatment up to ₹5 lakh.',
    documents: ['Aadhaar Card', 'Ration Card', 'Address Proof'],
    formFields: [
      { name: 'fullName', label: "Family Head's Name", type: 'text', required: true },
      { name: 'dob', label: 'Date of Birth', type: 'date', required: true },
      { name: 'aadhaar', label: 'Aadhaar Number', type: 'text', required: true },
      { name: 'mobile', label: 'Mobile Number', type: 'tel', required: true },
      { name: 'familyMembers', label: 'Number of Family Members', type: 'number', required: true },
      { name: 'address', label: 'Full Address', type: 'textarea', required: true },
      { name: 'district', label: 'District', type: 'select', options: ['Kolkata', 'Howrah', 'Hooghly', 'North 24 Parganas', 'South 24 Parganas', 'Nadia', 'Murshidabad', 'Bardhaman', 'Birbhum', 'Bankura', 'Purulia', 'Midnapore East', 'Midnapore West', 'Jalpaiguri', 'Darjeeling'], required: true },
      { name: 'rationCard', label: 'Ration Card Number', type: 'text', required: false },
    ],
  },
  {
    id: 'rupashree', stateId: 'west-bengal',
    name: 'Rupashree Prakalpa', nameHindi: 'রূপশ্রী প্রকল্প',
    category: 'Marriage Assistance',
    benefit: '₹25,000 one-time grant',
    eligibility: 'Girls (18+ yrs), Family income < ₹1.5L',
    icon: '👰',
    description: 'One-time financial assistance to economically distressed families for their daughter\'s marriage.',
    documents: ['Age Proof', 'Income Certificate', 'Marriage Invitation', 'Bank Account'],
    formFields: [
      { name: 'brideName', label: "Bride's Full Name", type: 'text', required: true },
      { name: 'dob', label: "Bride's Date of Birth", type: 'date', required: true },
      { name: 'fatherName', label: "Father's Name", type: 'text', required: true },
      { name: 'aadhaar', label: "Bride's Aadhaar Number", type: 'text', required: true },
      { name: 'mobile', label: 'Mobile Number', type: 'tel', required: true },
      { name: 'annualIncome', label: 'Family Annual Income (₹)', type: 'number', required: true },
      { name: 'marriageDate', label: 'Proposed Marriage Date', type: 'date', required: true },
      { name: 'address', label: 'Full Address', type: 'textarea', required: true },
      { name: 'district', label: 'District', type: 'text', required: true },
      { name: 'bankAccount', label: 'Bank Account Number', type: 'text', required: true },
      { name: 'ifsc', label: 'IFSC Code', type: 'text', required: true },
    ],
  },
  {
    id: 'krishak-bandhu', stateId: 'west-bengal',
    name: 'Krishak Bandhu', nameHindi: 'কৃষক বন্ধু',
    category: 'Farmer Support',
    benefit: '₹10,000/year + ₹2L death benefit',
    eligibility: 'Farmers with land in WB',
    icon: '🌾',
    description: 'Financial support to farmers and crop insurance + life insurance benefit to farmer families.',
    documents: ['Land Records', 'Aadhaar Card', 'Bank Account'],
    formFields: [
      { name: 'fullName', label: "Farmer's Full Name", type: 'text', required: true },
      { name: 'dob', label: 'Date of Birth', type: 'date', required: true },
      { name: 'aadhaar', label: 'Aadhaar Number', type: 'text', required: true },
      { name: 'mobile', label: 'Mobile Number', type: 'tel', required: true },
      { name: 'landArea', label: 'Total Land (in Bighas)', type: 'number', required: true },
      { name: 'khatianNo', label: 'Khatian Number', type: 'text', required: true },
      { name: 'plotNo', label: 'Plot Number', type: 'text', required: true },
      { name: 'mouza', label: 'Mouza Name', type: 'text', required: true },
      { name: 'district', label: 'District', type: 'text', required: true },
      { name: 'bankAccount', label: 'Bank Account Number', type: 'text', required: true },
      { name: 'ifsc', label: 'IFSC Code', type: 'text', required: true },
    ],
  },
  // Maharashtra
  {
    id: 'mahatma-jyotirao-phule', stateId: 'maharashtra',
    name: 'Mahatma Jyotirao Phule Jan Arogya Yojana',
    category: 'Health',
    benefit: '₹1.5 Lakh health cover',
    eligibility: 'Yellow/Orange ration card holders',
    icon: '🏥',
    description: 'Health insurance scheme for economically weaker sections of Maharashtra.',
    documents: ['Ration Card', 'Aadhaar Card', 'Income Certificate'],
    formFields: [
      { name: 'fullName', label: 'Full Name', type: 'text', required: true },
      { name: 'dob', label: 'Date of Birth', type: 'date', required: true },
      { name: 'aadhaar', label: 'Aadhaar Number', type: 'text', required: true },
      { name: 'mobile', label: 'Mobile Number', type: 'tel', required: true },
      { name: 'rationCard', label: 'Ration Card Type', type: 'select', options: ['Yellow', 'Orange'], required: true },
      { name: 'district', label: 'District', type: 'text', required: true },
    ],
  },
  {
    id: 'ladki-bahin', stateId: 'maharashtra',
    name: 'Mukhyamantri Ladki Bahin Yojana',
    category: 'Women Welfare',
    benefit: '₹1,500/month',
    eligibility: 'Women (21-65 yrs), income < ₹2.5L',
    icon: '👩',
    description: 'Financial assistance to women to promote economic independence and family welfare.',
    documents: ['Aadhaar Card', 'Income Certificate', 'Bank Account'],
    formFields: [
      { name: 'fullName', label: 'Full Name', type: 'text', required: true },
      { name: 'dob', label: 'Date of Birth', type: 'date', required: true },
      { name: 'aadhaar', label: 'Aadhaar Number', type: 'text', required: true },
      { name: 'mobile', label: 'Mobile Number', type: 'tel', required: true },
      { name: 'annualIncome', label: 'Annual Income (₹)', type: 'number', required: true },
      { name: 'district', label: 'District', type: 'text', required: true },
      { name: 'bankAccount', label: 'Bank Account Number', type: 'text', required: true },
      { name: 'ifsc', label: 'IFSC Code', type: 'text', required: true },
    ],
  },
  // Uttar Pradesh
  {
    id: 'kanya-sumangala', stateId: 'uttar-pradesh',
    name: 'Kanya Sumangala Yojana',
    category: 'Girl Child',
    benefit: '₹15,000 in stages',
    eligibility: 'Girl child, family income < ₹3L',
    icon: '👧',
    description: 'Financial assistance to girl child in 6 stages from birth to graduation to promote girl education.',
    documents: ['Birth Certificate', 'Aadhaar of Parents', 'Income Certificate'],
    formFields: [
      { name: 'childName', label: "Girl Child's Name", type: 'text', required: true },
      { name: 'dob', label: 'Date of Birth (Child)', type: 'date', required: true },
      { name: 'fatherName', label: "Father's Name", type: 'text', required: true },
      { name: 'aadhaarParent', label: "Parent's Aadhaar", type: 'text', required: true },
      { name: 'mobile', label: 'Mobile Number', type: 'tel', required: true },
      { name: 'annualIncome', label: 'Annual Income (₹)', type: 'number', required: true },
      { name: 'district', label: 'District', type: 'text', required: true },
      { name: 'bankAccount', label: 'Bank Account Number', type: 'text', required: true },
      { name: 'ifsc', label: 'IFSC Code', type: 'text', required: true },
    ],
  },
  {
    id: 'up-free-laptop', stateId: 'uttar-pradesh',
    name: 'UP Free Laptop Yojana',
    category: 'Education',
    benefit: 'Free Laptop',
    eligibility: 'Class 10/12 toppers (>65% marks)',
    icon: '💻',
    description: 'Free laptops to meritorious students who scored above 65% in class 10 or class 12 board exams.',
    documents: ['Marksheet', 'Aadhaar Card', 'School Certificate'],
    formFields: [
      { name: 'fullName', label: "Student's Full Name", type: 'text', required: true },
      { name: 'dob', label: 'Date of Birth', type: 'date', required: true },
      { name: 'aadhaar', label: 'Aadhaar Number', type: 'text', required: true },
      { name: 'mobile', label: 'Mobile Number', type: 'tel', required: true },
      { name: 'examClass', label: 'Exam Class', type: 'select', options: ['Class 10', 'Class 12'], required: true },
      { name: 'percentage', label: 'Marks Percentage (%)', type: 'number', required: true },
      { name: 'rollNo', label: 'Board Roll Number', type: 'text', required: true },
      { name: 'school', label: 'School/College Name', type: 'text', required: true },
      { name: 'district', label: 'District', type: 'text', required: true },
    ],
  },
  // Karnataka
  {
    id: 'gruha-jyothi', stateId: 'karnataka',
    name: 'Gruha Jyothi',
    category: 'Electricity',
    benefit: '200 units free electricity/month',
    eligibility: 'All domestic consumers',
    icon: '💡',
    description: 'Free electricity up to 200 units per month for domestic consumers in Karnataka.',
    documents: ['Electricity Bill', 'Aadhaar Card'],
    formFields: [
      { name: 'fullName', label: 'Consumer Name', type: 'text', required: true },
      { name: 'aadhaar', label: 'Aadhaar Number', type: 'text', required: true },
      { name: 'mobile', label: 'Mobile Number', type: 'tel', required: true },
      { name: 'electricityNo', label: 'Electricity Consumer Number', type: 'text', required: true },
      { name: 'district', label: 'District', type: 'text', required: true },
    ],
  },
  {
    id: 'anna-bhagya', stateId: 'karnataka',
    name: 'Anna Bhagya',
    category: 'Food Security',
    benefit: '10 kg rice/person/month free',
    eligibility: 'BPL families',
    icon: '🍚',
    description: 'Free rice distribution to BPL families - 10 kg per person per month.',
    documents: ['Ration Card', 'Aadhaar Card'],
    formFields: [
      { name: 'fullName', label: 'Family Head Name', type: 'text', required: true },
      { name: 'aadhaar', label: 'Aadhaar Number', type: 'text', required: true },
      { name: 'mobile', label: 'Mobile Number', type: 'tel', required: true },
      { name: 'rationCard', label: 'Ration Card Number', type: 'text', required: true },
      { name: 'familyMembers', label: 'Number of Family Members', type: 'number', required: true },
      { name: 'district', label: 'District', type: 'text', required: true },
    ],
  },
  // Delhi
  {
    id: 'delhi-free-electricity', stateId: 'delhi',
    name: 'Mukhyamantri Free Bijli',
    category: 'Electricity',
    benefit: '200 units free/month',
    eligibility: 'Delhi domestic consumers',
    icon: '⚡',
    description: 'Free electricity up to 200 units and 50% subsidy for 201-400 units for Delhi residents.',
    documents: ['Electricity Bill', 'Aadhaar'],
    formFields: [
      { name: 'fullName', label: 'Consumer Name', type: 'text', required: true },
      { name: 'aadhaar', label: 'Aadhaar Number', type: 'text', required: true },
      { name: 'mobile', label: 'Mobile Number', type: 'tel', required: true },
      { name: 'electricityNo', label: 'BSES/TATA Power Account Number', type: 'text', required: true },
    ],
  },
];

// ──────────────────────────────────────────────────────────────────────────────
// EXAMS — Central
// ──────────────────────────────────────────────────────────────────────────────
const CENTRAL_EXAMS = [
  {
    id: 'upsc-cse', stateId: 'central',
    name: 'UPSC Civil Services Exam', shortName: 'UPSC CSE',
    conductedBy: 'UPSC', category: 'Civil Services',
    posts: 'IAS, IPS, IFS and other Central Services',
    applicationFee: '₹100 (Women/SC/ST/PH - Free)',
    eligibility: 'Graduate, Age 21-32 yrs (relaxation for reserved)',
    nextExam: 'Prelims: May 2026', applicationDeadline: 'Feb 2026',
    icon: '🏛️', status: 'upcoming',
    description: 'The most prestigious examination in India conducted by UPSC for recruitment to various civil services.',
    formFields: [
      { name: 'fullName', label: 'Full Name (as per Matriculation)', type: 'text', required: true },
      { name: 'dob', label: 'Date of Birth', type: 'date', required: true },
      { name: 'gender', label: 'Gender', type: 'select', options: ['Male', 'Female', 'Transgender'], required: true },
      { name: 'aadhaar', label: 'Aadhaar Number', type: 'text', required: true },
      { name: 'mobile', label: 'Mobile Number', type: 'tel', required: true },
      { name: 'email', label: 'Email Address', type: 'email', required: true },
      { name: 'category', label: 'Category', type: 'select', options: ['General', 'OBC', 'SC', 'ST', 'EWS', 'PH'], required: true },
      { name: 'education', label: 'Graduation Degree', type: 'text', required: true },
      { name: 'university', label: 'University/College', type: 'text', required: true },
      { name: 'attempt', label: 'Attempt Number', type: 'select', options: ['1st', '2nd', '3rd', '4th', '5th', '6th'], required: true },
      { name: 'examCenter', label: 'Preferred Exam Center', type: 'select', options: ['Delhi', 'Mumbai', 'Kolkata', 'Chennai', 'Bengaluru', 'Hyderabad', 'Lucknow', 'Patna', 'Jaipur', 'Bhopal'], required: true },
      { name: 'optionalSubject', label: 'Optional Subject', type: 'select', options: ['History', 'Geography', 'Political Science', 'Sociology', 'Psychology', 'Public Administration', 'Economics', 'Physics', 'Chemistry', 'Mathematics', 'Hindi Literature', 'Bengali Literature', 'Tamil Literature'], required: true },
    ],
  },
  {
    id: 'ssc-cgl', stateId: 'central',
    name: 'SSC Combined Graduate Level', shortName: 'SSC CGL',
    conductedBy: 'SSC', category: 'Staff Selection',
    posts: 'Inspector, Auditor, Clerk, Assistant',
    applicationFee: '₹100 (Women/SC/ST/Ex-SM - Free)',
    eligibility: 'Graduate, Age 18-32 yrs',
    nextExam: 'Tier-I: July-August 2026', applicationDeadline: 'April 2026',
    icon: '📋', status: 'active',
    description: 'Recruitment examination for various Group-B and Group-C posts in Central Government Ministries.',
    formFields: [
      { name: 'fullName', label: 'Full Name', type: 'text', required: true },
      { name: 'dob', label: 'Date of Birth', type: 'date', required: true },
      { name: 'gender', label: 'Gender', type: 'select', options: ['Male', 'Female', 'Transgender'], required: true },
      { name: 'aadhaar', label: 'Aadhaar Number', type: 'text', required: true },
      { name: 'mobile', label: 'Mobile Number', type: 'tel', required: true },
      { name: 'email', label: 'Email Address', type: 'email', required: true },
      { name: 'category', label: 'Category', type: 'select', options: ['General', 'OBC', 'SC', 'ST', 'EWS', 'ExSM', 'PH'], required: true },
      { name: 'education', label: 'Graduation Degree', type: 'text', required: true },
      { name: 'postPreference', label: 'Post Preference (Top 3)', type: 'textarea', required: true },
      { name: 'examRegion', label: 'Exam Region', type: 'select', options: ['Central Region', 'Eastern Region', 'KKR Region', 'MPR Region', 'NER Region', 'NR Region', 'NWR Region', 'SR Region', 'WR Region'], required: true },
    ],
  },
  {
    id: 'ibps-po', stateId: 'central',
    name: 'IBPS Probationary Officer', shortName: 'IBPS PO',
    conductedBy: 'IBPS', category: 'Banking',
    posts: 'Probationary Officer in Public Sector Banks',
    applicationFee: '₹175 (SC/ST/PH - ₹175)',
    eligibility: 'Graduate, Age 20-30 yrs',
    nextExam: 'Prelims: October 2026', applicationDeadline: 'August 2026',
    icon: '🏦', status: 'upcoming',
    description: 'Common recruitment process for Probationary Officers in participating public sector banks.',
    formFields: [
      { name: 'fullName', label: 'Full Name', type: 'text', required: true },
      { name: 'dob', label: 'Date of Birth', type: 'date', required: true },
      { name: 'gender', label: 'Gender', type: 'select', options: ['Male', 'Female', 'Transgender'], required: true },
      { name: 'aadhaar', label: 'Aadhaar Number', type: 'text', required: true },
      { name: 'mobile', label: 'Mobile Number', type: 'tel', required: true },
      { name: 'email', label: 'Email Address', type: 'email', required: true },
      { name: 'category', label: 'Category', type: 'select', options: ['General', 'OBC', 'SC', 'ST', 'EWS', 'PH', 'ExSM'], required: true },
      { name: 'education', label: 'Degree/University', type: 'text', required: true },
      { name: 'percentage', label: 'Graduation Percentage', type: 'number', required: true },
    ],
  },
  {
    id: 'rrb-ntpc', stateId: 'central',
    name: 'RRB Non-Technical Popular Categories', shortName: 'RRB NTPC',
    conductedBy: 'Railway Recruitment Board', category: 'Railway',
    posts: 'Junior Clerk, Ticket Collector, Commercial Apprentice',
    applicationFee: '₹500 (SC/ST/Ex-SM/PH - ₹250)',
    eligibility: 'Class 12/Graduate, Age 18-33 yrs',
    nextExam: 'CBT-1: September 2026', applicationDeadline: 'June 2026',
    icon: '🚂', status: 'active',
    description: 'Recruitment for non-technical posts in Indian Railways across various RRB zones.',
    formFields: [
      { name: 'fullName', label: 'Full Name', type: 'text', required: true },
      { name: 'dob', label: 'Date of Birth', type: 'date', required: true },
      { name: 'gender', label: 'Gender', type: 'select', options: ['Male', 'Female', 'Transgender'], required: true },
      { name: 'aadhaar', label: 'Aadhaar Number', type: 'text', required: true },
      { name: 'mobile', label: 'Mobile Number', type: 'tel', required: true },
      { name: 'email', label: 'Email Address', type: 'email', required: true },
      { name: 'category', label: 'Category', type: 'select', options: ['UR', 'OBC', 'SC', 'ST', 'EWS', 'PH', 'ExSM'], required: true },
      { name: 'postType', label: 'Post Type', type: 'select', options: ['Graduate Posts', 'Class 12 Posts', 'Both'], required: true },
      { name: 'rrbZone', label: 'RRB Zone', type: 'select', options: ['RRB Kolkata', 'RRB Mumbai', 'RRB Delhi', 'RRB Chennai', 'RRB Bengaluru', 'RRB Allahabad', 'RRB Bhopal', 'RRB Patna'], required: true },
    ],
  },
  {
    id: 'neet-ug', stateId: 'central',
    name: 'NEET Undergraduate', shortName: 'NEET UG',
    conductedBy: 'NTA', category: 'Medical',
    posts: 'MBBS, BDS, BAMS, BHMS',
    applicationFee: '₹1700 (SC/ST/PH - ₹1000)',
    eligibility: 'Class 12 with Physics, Chemistry, Biology',
    nextExam: 'May 2026', applicationDeadline: 'March 2026',
    icon: '⚕️', status: 'upcoming',
    description: 'National eligibility cum entrance test for admission to medical colleges across India.',
    formFields: [
      { name: 'fullName', label: "Candidate's Name", type: 'text', required: true },
      { name: 'dob', label: 'Date of Birth', type: 'date', required: true },
      { name: 'gender', label: 'Gender', type: 'select', options: ['Male', 'Female', 'Transgender'], required: true },
      { name: 'aadhaar', label: 'Aadhaar Number', type: 'text', required: true },
      { name: 'mobile', label: 'Mobile Number', type: 'tel', required: true },
      { name: 'email', label: 'Email Address', type: 'email', required: true },
      { name: 'category', label: 'Category', type: 'select', options: ['General', 'OBC', 'SC', 'ST', 'EWS', 'PH'], required: true },
      { name: 'class12Board', label: 'Class 12 Board', type: 'select', options: ['CBSE', 'ICSE', 'WBCHSE', 'State Board'], required: true },
      { name: 'class12Year', label: 'Class 12 Passing Year', type: 'select', options: ['2024', '2025', '2026 (Appearing)'], required: true },
      { name: 'examCity1', label: 'Exam City Preference 1', type: 'text', required: true },
      { name: 'examCity2', label: 'Exam City Preference 2', type: 'text', required: true },
    ],
  },
  {
    id: 'jee-main', stateId: 'central',
    name: 'JEE Main', shortName: 'JEE Main',
    conductedBy: 'NTA', category: 'Engineering',
    posts: 'Admission to NITs, IIITs, CFTIs',
    applicationFee: '₹1000 (Female/SC/ST - ₹800)',
    eligibility: 'Class 12 with Physics, Chemistry, Maths',
    nextExam: 'Session 1: Jan 2026 | Session 2: Apr 2026', applicationDeadline: 'Dec 2025 / Feb 2026',
    icon: '🔧', status: 'active',
    description: 'National level entrance exam for admission to NITs, IIITs and other centrally funded technical institutes.',
    formFields: [
      { name: 'fullName', label: "Candidate's Name", type: 'text', required: true },
      { name: 'dob', label: 'Date of Birth', type: 'date', required: true },
      { name: 'gender', label: 'Gender', type: 'select', options: ['Male', 'Female', 'Transgender'], required: true },
      { name: 'aadhaar', label: 'Aadhaar Number', type: 'text', required: true },
      { name: 'mobile', label: 'Mobile Number', type: 'tel', required: true },
      { name: 'email', label: 'Email Address', type: 'email', required: true },
      { name: 'category', label: 'Category', type: 'select', options: ['General', 'OBC-NCL', 'SC', 'ST', 'EWS', 'PH'], required: true },
      { name: 'paper', label: 'Paper', type: 'select', options: ['Paper 1 (B.E./B.Tech)', 'Paper 2A (B.Arch)', 'Paper 2B (B.Planning)', 'Both Paper 1 & 2'], required: true },
      { name: 'session', label: 'Session', type: 'select', options: ['Session 1 (January)', 'Session 2 (April)', 'Both Sessions'], required: true },
      { name: 'class12Year', label: 'Class 12 Passing Year', type: 'select', options: ['2024', '2025', '2026 (Appearing)'], required: true },
    ],
  },
];

// ──────────────────────────────────────────────────────────────────────────────
// EXAMS — State (West Bengal)
// ──────────────────────────────────────────────────────────────────────────────
const STATE_EXAMS = [
  {
    id: 'wbcs', stateId: 'west-bengal',
    name: 'West Bengal Civil Service', shortName: 'WBCS',
    conductedBy: 'WBPSC', category: 'Civil Services',
    posts: 'WBCS (Exe), WBCS (Non-Exe), Various Group A/B/C',
    applicationFee: '₹210 (SC/ST - Free)',
    eligibility: 'Graduate, Age 21-36 yrs',
    nextExam: 'Prelims: April 2026', applicationDeadline: 'Jan 2026',
    icon: '🏛️', status: 'upcoming',
    description: 'State civil service exam for recruitment to West Bengal Civil Service and allied services.',
    formFields: [
      { name: 'fullName', label: 'Full Name', type: 'text', required: true },
      { name: 'dob', label: 'Date of Birth', type: 'date', required: true },
      { name: 'gender', label: 'Gender', type: 'select', options: ['Male', 'Female', 'Other'], required: true },
      { name: 'aadhaar', label: 'Aadhaar Number', type: 'text', required: true },
      { name: 'mobile', label: 'Mobile Number', type: 'tel', required: true },
      { name: 'email', label: 'Email Address', type: 'email', required: true },
      { name: 'category', label: 'Category', type: 'select', options: ['UR', 'OBC-A', 'OBC-B', 'SC', 'ST', 'PH', 'Ex-SM'], required: true },
      { name: 'education', label: 'Graduation Stream', type: 'text', required: true },
      { name: 'district', label: 'Preferred Exam District', type: 'select', options: ['Kolkata', 'Howrah', 'Hooghly', 'North 24 Parganas', 'Murshidabad', 'Bardhaman', 'Jalpaiguri', 'Darjeeling'], required: true },
    ],
  },
  {
    id: 'wb-primary-tet', stateId: 'west-bengal',
    name: 'WB Primary TET', shortName: 'WB Primary TET',
    conductedBy: 'WBBPE', category: 'Teaching',
    posts: 'Primary School Teacher (Class I-V)',
    applicationFee: '₹150 (SC/ST - ₹100)',
    eligibility: 'Class 12 + D.El.Ed or equivalent, Age 18-40 yrs',
    nextExam: 'August 2026', applicationDeadline: 'May 2026',
    icon: '📚', status: 'active',
    description: 'Teacher eligibility test for recruitment to primary schools in West Bengal.',
    formFields: [
      { name: 'fullName', label: 'Full Name', type: 'text', required: true },
      { name: 'dob', label: 'Date of Birth', type: 'date', required: true },
      { name: 'gender', label: 'Gender', type: 'select', options: ['Male', 'Female', 'Other'], required: true },
      { name: 'aadhaar', label: 'Aadhaar Number', type: 'text', required: true },
      { name: 'mobile', label: 'Mobile Number', type: 'tel', required: true },
      { name: 'email', label: 'Email Address', type: 'email', required: true },
      { name: 'category', label: 'Category', type: 'select', options: ['UR', 'OBC-A', 'OBC-B', 'SC', 'ST', 'PH'], required: true },
      { name: 'medium', label: 'Teaching Medium', type: 'select', options: ['Bengali', 'English', 'Hindi', 'Urdu', 'Nepali', 'Santhali', 'Olchiki'], required: true },
      { name: 'district', label: 'District', type: 'select', options: ['Kolkata', 'Howrah', 'Hooghly', 'North 24 Parganas', 'South 24 Parganas', 'Nadia', 'Murshidabad', 'Bardhaman'], required: true },
    ],
  },
];

// ──────────────────────────────────────────────────────────────────────────────
// SCHOLARSHIPS
// ──────────────────────────────────────────────────────────────────────────────
const ALL_SCHOLARSHIPS = [
  // Central
  {
    id: 'pm-scholarship-capf', stateId: 'central',
    name: 'PM Scholarship Scheme for CAPF', nameHindi: 'प्रधानमंत्री छात्रवृत्ति योजना',
    ministry: 'Ministry of Home Affairs', category: 'Scholarship', subcategory: 'Central',
    benefit: '₹2,500/month (Girls) | ₹2,250/month (Boys)',
    eligibility: 'Children of Ex-Servicemen / CAPF Personnel, min 60% in 10+2',
    icon: '🎓',
    description: 'Scholarship for wards of Ex-Servicemen and Ex-Coast Guard personnel for studying professional degree courses.',
    documents: ['Aadhaar Card', 'Marksheet (Class 12)', 'Ex-Serviceman Certificate', 'Bank Passbook', 'Bonafide Certificate'],
    formFields: [
      { name: 'studentName', label: 'Student Full Name', type: 'text', required: true },
      { name: 'dob', label: 'Date of Birth', type: 'date', required: true },
      { name: 'gender', label: 'Gender', type: 'select', required: true, options: ['Male', 'Female', 'Other'] },
      { name: 'aadhaar', label: 'Aadhaar Number', type: 'text', required: true },
      { name: 'mobile', label: 'Mobile Number', type: 'tel', required: true },
      { name: 'email', label: 'Email Address', type: 'email', required: true },
      { name: 'class12Marks', label: 'Class 12 Percentage (%)', type: 'number', required: true },
      { name: 'class12Board', label: 'Class 12 Board', type: 'select', required: true, options: ['CBSE', 'ICSE', 'WBCHSE', 'State Board', 'Other'] },
      { name: 'courseName', label: 'Current Course', type: 'text', required: true },
      { name: 'institution', label: 'Institution / College Name', type: 'text', required: true },
      { name: 'fatherService', label: 'Father/Guardian Service (CAPF/Ex-SM)', type: 'text', required: true },
      { name: 'exSmCertNo', label: 'Ex-Serviceman Certificate Number', type: 'text', required: true },
      { name: 'bankAccount', label: 'Bank Account Number', type: 'text', required: true },
      { name: 'ifsc', label: 'IFSC Code', type: 'text', required: true },
    ],
  },
  {
    id: 'national-merit-scholarship', stateId: 'central',
    name: 'National Merit-cum-Means Scholarship', nameHindi: 'राष्ट्रीय मेधा-सह-साधन छात्रवृत्ति',
    ministry: 'Ministry of Education', category: 'Scholarship', subcategory: 'Central',
    benefit: '₹12,000/year',
    eligibility: 'Class 8 passed, family income < ₹1.5L/year, min 55% in Class 7',
    icon: '📚',
    description: 'Scholarship for meritorious students from economically weaker sections to continue education from Class 9 onwards.',
    documents: ['Aadhaar Card', 'Class 7 Marksheet', 'Income Certificate', 'School Certificate', 'Bank Passbook'],
    formFields: [
      { name: 'studentName', label: 'Student Full Name', type: 'text', required: true },
      { name: 'dob', label: 'Date of Birth', type: 'date', required: true },
      { name: 'gender', label: 'Gender', type: 'select', required: true, options: ['Male', 'Female', 'Other'] },
      { name: 'aadhaar', label: 'Aadhaar Number', type: 'text', required: true },
      { name: 'mobile', label: 'Parent Mobile Number', type: 'tel', required: true },
      { name: 'class7Marks', label: 'Class 7 Percentage (%)', type: 'number', required: true },
      { name: 'currentClass', label: 'Currently in Class', type: 'select', required: true, options: ['Class 8', 'Class 9', 'Class 10', 'Class 11', 'Class 12'] },
      { name: 'school', label: 'School Name', type: 'text', required: true },
      { name: 'annualIncome', label: 'Family Annual Income (₹)', type: 'number', required: true },
      { name: 'category', label: 'Category', type: 'select', required: true, options: ['General', 'OBC', 'SC', 'ST', 'EWS'] },
      { name: 'district', label: 'District', type: 'text', required: true },
      { name: 'state', label: 'State', type: 'text', required: true },
      { name: 'bankAccount', label: 'Bank Account Number', type: 'text', required: true },
      { name: 'ifsc', label: 'IFSC Code', type: 'text', required: true },
    ],
  },
  {
    id: 'post-matric-sc-scholarship', stateId: 'central',
    name: 'Post Matric Scholarship for SC Students', nameHindi: 'अनुसूचित जाति के लिए पोस्ट मैट्रिक छात्रवृत्ति',
    ministry: 'Ministry of Social Justice', category: 'Scholarship', subcategory: 'Central',
    benefit: '₹1,200 – ₹9,200/year (based on course)',
    eligibility: 'SC category, studying Class 11 onwards, income < ₹2.5L/year',
    icon: '🏫',
    description: 'Financial assistance to SC students for pursuing post-matriculation and post-secondary education.',
    documents: ['Aadhaar Card', 'Caste Certificate (SC)', 'Marksheet', 'Income Certificate', 'Bank Passbook'],
    formFields: [
      { name: 'studentName', label: 'Student Full Name', type: 'text', required: true },
      { name: 'dob', label: 'Date of Birth', type: 'date', required: true },
      { name: 'gender', label: 'Gender', type: 'select', required: true, options: ['Male', 'Female', 'Other'] },
      { name: 'aadhaar', label: 'Aadhaar Number', type: 'text', required: true },
      { name: 'mobile', label: 'Mobile Number', type: 'tel', required: true },
      { name: 'casteCertNo', label: 'Caste Certificate Number', type: 'text', required: true },
      { name: 'course', label: 'Course / Class', type: 'text', required: true },
      { name: 'institution', label: 'School / College Name', type: 'text', required: true },
      { name: 'annualIncome', label: 'Family Annual Income (₹)', type: 'number', required: true },
      { name: 'district', label: 'District', type: 'text', required: true },
      { name: 'bankAccount', label: 'Bank Account Number', type: 'text', required: true },
      { name: 'ifsc', label: 'IFSC Code', type: 'text', required: true },
    ],
  },
  // West Bengal
  {
    id: 'svmcm-wb', stateId: 'west-bengal',
    name: 'Swami Vivekananda Merit-cum-Means Scholarship', nameHindi: 'স্বামী বিবেকানন্দ মেধা-কাম-মিন্স বৃত্তি',
    ministry: 'WB Higher Education Dept.', category: 'Scholarship', subcategory: 'State',
    benefit: '₹1,000 – ₹5,000/month (based on course)',
    eligibility: 'WB resident, min 75% in last board exam, income < ₹2.5L/year',
    icon: '🎓',
    description: 'Merit-based scholarship for students of West Bengal pursuing higher studies.',
    documents: ['Aadhaar Card', 'Marksheet', 'Income Certificate', 'Domicile Certificate', 'Bank Passbook'],
    formFields: [
      { name: 'studentName', label: 'Student Full Name', type: 'text', required: true },
      { name: 'dob', label: 'Date of Birth', type: 'date', required: true },
      { name: 'gender', label: 'Gender', type: 'select', required: true, options: ['Male', 'Female', 'Other'] },
      { name: 'aadhaar', label: 'Aadhaar Number', type: 'text', required: true },
      { name: 'mobile', label: 'Mobile Number', type: 'tel', required: true },
      { name: 'lastExamMarks', label: 'Last Board Exam % (min 75)', type: 'number', required: true },
      { name: 'lastBoard', label: 'Board', type: 'select', required: true, options: ['WBBSE', 'WBCHSE', 'CBSE', 'ICSE'] },
      { name: 'course', label: 'Current Course', type: 'text', required: true },
      { name: 'institution', label: 'College / University Name', type: 'text', required: true },
      { name: 'annualIncome', label: 'Family Annual Income (₹)', type: 'number', required: true },
      { name: 'category', label: 'Category', type: 'select', required: true, options: ['General', 'OBC-A', 'OBC-B', 'SC', 'ST', 'Minority', 'EWS'] },
      { name: 'district', label: 'District', type: 'select', required: true, options: ['Kolkata', 'Howrah', 'Hooghly', 'North 24 Parganas', 'South 24 Parganas', 'Nadia', 'Murshidabad', 'Bardhaman', 'Birbhum', 'Bankura', 'Purulia', 'Midnapore East', 'Midnapore West', 'Jalpaiguri', 'Darjeeling'] },
      { name: 'bankAccount', label: 'Bank Account Number', type: 'text', required: true },
      { name: 'ifsc', label: 'IFSC Code', type: 'text', required: true },
    ],
  },
  {
    id: 'oasis-wb', stateId: 'west-bengal',
    name: 'OASIS Scholarship (WB)', nameHindi: 'ওয়েসিস বৃত্তি',
    ministry: 'WB Backward Classes Welfare Dept.', category: 'Scholarship', subcategory: 'State',
    benefit: '₹1,000 – ₹2,000/year',
    eligibility: 'OBC-A / OBC-B, studying post-matric, income < ₹1L/year',
    icon: '📖',
    description: 'Online Application for Scholarship In State (OASIS) for OBC students of West Bengal.',
    documents: ['Aadhaar Card', 'Caste Certificate', 'Marksheet', 'Income Certificate', 'Bank Passbook'],
    formFields: [
      { name: 'studentName', label: 'Student Full Name', type: 'text', required: true },
      { name: 'dob', label: 'Date of Birth', type: 'date', required: true },
      { name: 'gender', label: 'Gender', type: 'select', required: true, options: ['Male', 'Female', 'Other'] },
      { name: 'aadhaar', label: 'Aadhaar Number', type: 'text', required: true },
      { name: 'mobile', label: 'Mobile Number', type: 'tel', required: true },
      { name: 'category', label: 'Category', type: 'select', required: true, options: ['OBC-A', 'OBC-B'] },
      { name: 'casteCertNo', label: 'Caste Certificate Number', type: 'text', required: true },
      { name: 'course', label: 'Current Class / Course', type: 'text', required: true },
      { name: 'institution', label: 'School / College Name', type: 'text', required: true },
      { name: 'annualIncome', label: 'Family Annual Income (₹)', type: 'number', required: true },
      { name: 'district', label: 'District', type: 'text', required: true },
      { name: 'bankAccount', label: 'Bank Account Number', type: 'text', required: true },
      { name: 'ifsc', label: 'IFSC Code', type: 'text', required: true },
    ],
  },
];

// ──────────────────────────────────────────────────────────────────────────────
// TENDERS
// ──────────────────────────────────────────────────────────────────────────────
const ALL_TENDERS = [
  // Central
  {
    id: 'tender-nhidcl-road', stateId: 'central',
    name: 'NHIDCL — Highway Construction Tender', shortName: 'Road Construction',
    department: 'National Highways & Infrastructure Dev. Corp.',
    category: 'Tender', subcategory: 'Infrastructure',
    estimatedValue: '₹45 Crore', bidDeadline: 'July 30, 2026',
    workDescription: 'Construction of 4-lane highway (32 km) including bridges and culverts in Northeast India.',
    eligibility: 'Registered contractor, min turnover ₹15 Cr/year, 5+ yrs experience in highway construction',
    icon: '🛣️', status: 'active', tenderNo: 'NHIDCL/2026/HWY/045',
    documents: ['Company Registration', 'GST Certificate', 'PAN Card', 'Balance Sheet (3 yrs)', 'Previous Work Orders', 'EMD Receipt'],
    formFields: [
      { name: 'firmName', label: 'Firm / Company Name', type: 'text', required: true },
      { name: 'gstNo', label: 'GST Number', type: 'text', required: true },
      { name: 'pan', label: 'PAN Card Number', type: 'text', required: true },
      { name: 'registrationNo', label: 'Company Registration Number', type: 'text', required: true },
      { name: 'contactPerson', label: 'Authorised Contact Person', type: 'text', required: true },
      { name: 'mobile', label: 'Mobile Number', type: 'tel', required: true },
      { name: 'email', label: 'Email Address', type: 'email', required: true },
      { name: 'annualTurnover', label: 'Annual Turnover (₹ Crore)', type: 'number', required: true },
      { name: 'experience', label: 'Years of Experience in field', type: 'number', required: true },
      { name: 'bidAmount', label: 'Bid Amount (₹ Crore)', type: 'number', required: true },
      { name: 'emdAmount', label: 'EMD Deposit Amount (₹)', type: 'number', required: true },
      { name: 'bankAccount', label: 'Bank Account Number', type: 'text', required: true },
      { name: 'ifsc', label: 'IFSC Code', type: 'text', required: true },
      { name: 'prevProjects', label: 'Similar Projects Completed (brief)', type: 'textarea', required: true },
      { name: 'declaration', label: 'I declare that all information is true and the firm is not blacklisted by any government authority', type: 'checkbox', required: true },
    ],
  },
  {
    id: 'tender-railway-electrification', stateId: 'central',
    name: 'Railway Track Electrification — Zone A', shortName: 'Rail Electrification',
    department: 'Ministry of Railways / RailTel',
    category: 'Tender', subcategory: 'Electrical',
    estimatedValue: '₹120 Crore', bidDeadline: 'August 15, 2026',
    workDescription: 'Electrification of 85 km railway track including OHE installation, substations and signalling systems.',
    eligibility: 'Registered electrical contractor, min turnover ₹40 Cr, CPWD/Railway registered',
    icon: '⚡', status: 'upcoming', tenderNo: 'RLY/ELECT/2026/ZA/088',
    documents: ['Company Registration', 'CPWD/Railway Registration', 'GST', 'PAN', 'Electrical Contractor License', 'Balance Sheet'],
    formFields: [
      { name: 'firmName', label: 'Firm / Company Name', type: 'text', required: true },
      { name: 'gstNo', label: 'GST Number', type: 'text', required: true },
      { name: 'pan', label: 'PAN Card Number', type: 'text', required: true },
      { name: 'cpwdRegNo', label: 'CPWD / Railway Reg. Number', type: 'text', required: true },
      { name: 'contactPerson', label: 'Contact Person', type: 'text', required: true },
      { name: 'mobile', label: 'Mobile Number', type: 'tel', required: true },
      { name: 'email', label: 'Email Address', type: 'email', required: true },
      { name: 'annualTurnover', label: 'Annual Turnover (₹ Crore)', type: 'number', required: true },
      { name: 'bidAmount', label: 'Bid Amount (₹ Crore)', type: 'number', required: true },
      { name: 'emdAmount', label: 'EMD Deposit Amount (₹)', type: 'number', required: true },
      { name: 'bankAccount', label: 'Bank Account Number', type: 'text', required: true },
      { name: 'ifsc', label: 'IFSC Code', type: 'text', required: true },
      { name: 'declaration', label: 'I declare that the firm meets all eligibility criteria and is not debarred', type: 'checkbox', required: true },
    ],
  },
  // West Bengal
  {
    id: 'tender-wb-school-building', stateId: 'west-bengal',
    name: 'WB School Building Construction & Renovation', shortName: 'School Construction (WB)',
    department: 'WB School Education Dept. / MSSDS',
    category: 'Tender', subcategory: 'Civil Construction',
    estimatedValue: '₹2.8 Crore', bidDeadline: 'July 10, 2026',
    workDescription: 'Construction of 2 new classrooms + renovation of existing building in 15 Govt schools across Murshidabad district.',
    eligibility: 'WB registered contractor, Class-I / Class-II PWD, min turnover ₹1 Cr, 3+ yrs experience',
    icon: '🏫', status: 'active', tenderNo: 'MSSDS/WB/2026/SCH/017',
    documents: ['Company Reg.', 'PWD Enlistment Certificate', 'GST', 'PAN', 'Work Experience Certificate', 'EMD'],
    formFields: [
      { name: 'firmName', label: 'Contractor / Firm Name', type: 'text', required: true },
      { name: 'gstNo', label: 'GST Number', type: 'text', required: true },
      { name: 'pan', label: 'PAN Card Number', type: 'text', required: true },
      { name: 'pwdClass', label: 'PWD Class', type: 'select', required: true, options: ['Class-I', 'Class-II', 'Class-III'] },
      { name: 'pwdRegNo', label: 'PWD Enlistment Number', type: 'text', required: true },
      { name: 'contactPerson', label: 'Contact Person', type: 'text', required: true },
      { name: 'mobile', label: 'Mobile Number', type: 'tel', required: true },
      { name: 'email', label: 'Email Address', type: 'email', required: true },
      { name: 'annualTurnover', label: 'Annual Turnover (₹ Lakh)', type: 'number', required: true },
      { name: 'experience', label: 'Years of Experience', type: 'number', required: true },
      { name: 'bidAmount', label: 'Quoted Bid Amount (₹ Lakh)', type: 'number', required: true },
      { name: 'emdAmount', label: 'EMD Amount (₹)', type: 'number', required: true },
      { name: 'district', label: "Firm's District", type: 'text', required: true },
      { name: 'bankAccount', label: 'Bank Account Number', type: 'text', required: true },
      { name: 'ifsc', label: 'IFSC Code', type: 'text', required: true },
      { name: 'declaration', label: 'I declare the firm is eligible and not blacklisted', type: 'checkbox', required: true },
    ],
  },
  {
    id: 'tender-wb-water-supply', stateId: 'west-bengal',
    name: 'WB Jal Jeevan Mission — Water Supply Pipeline', shortName: 'Water Supply (JJM)',
    department: 'WB Public Health Engineering Dept.',
    category: 'Tender', subcategory: 'Water & Sanitation',
    estimatedValue: '₹8.5 Crore', bidDeadline: 'August 5, 2026',
    workDescription: 'Laying of drinking water supply pipelines in 8 villages under Jal Jeevan Mission, Bankura district.',
    eligibility: 'Registered contractor, PHED approved, min turnover ₹3 Cr, experience in pipeline works',
    icon: '💧', status: 'upcoming', tenderNo: 'PHED/WB/JJM/2026/BNK/023',
    documents: ['Company Reg.', 'PHED Approval', 'GST', 'PAN', 'Experience Certificate', 'EMD'],
    formFields: [
      { name: 'firmName', label: 'Firm / Company Name', type: 'text', required: true },
      { name: 'gstNo', label: 'GST Number', type: 'text', required: true },
      { name: 'pan', label: 'PAN Card Number', type: 'text', required: true },
      { name: 'phedApprovalNo', label: 'PHED Approval Number', type: 'text', required: true },
      { name: 'contactPerson', label: 'Contact Person', type: 'text', required: true },
      { name: 'mobile', label: 'Mobile Number', type: 'tel', required: true },
      { name: 'email', label: 'Email Address', type: 'email', required: true },
      { name: 'annualTurnover', label: 'Annual Turnover (₹ Crore)', type: 'number', required: true },
      { name: 'bidAmount', label: 'Quoted Bid Amount (₹ Crore)', type: 'number', required: true },
      { name: 'emdAmount', label: 'EMD Deposit (₹)', type: 'number', required: true },
      { name: 'bankAccount', label: 'Bank Account Number', type: 'text', required: true },
      { name: 'ifsc', label: 'IFSC Code', type: 'text', required: true },
      { name: 'declaration', label: 'I declare all information is correct and firm is not debarred', type: 'checkbox', required: true },
    ],
  },
];

// ──────────────────────────────────────────────────────────────────────────────
// MAIN
// ──────────────────────────────────────────────────────────────────────────────
async function main() {
  console.log('🌱 Seeding database...\n');

  // Gov Admins
  console.log('📋 Seeding government admins...');
  for (const admin of GOV_ADMINS) {
    await prisma.govAdmin.upsert({
      where: { username: admin.username },
      update: { password: admin.password, stateName: admin.stateName, emoji: admin.emoji, level: admin.level },
      create: admin,
    });
    console.log(`   ✅ ${admin.emoji}  ${admin.username.padEnd(12)} → ${admin.stateName}`);
  }
  console.log(`   Total: ${GOV_ADMINS.length} admins\n`);

  // Demo Users
  console.log('👤 Seeding demo users...');
  for (const user of DEMO_USERS) {
    await prisma.user.upsert({
      where: { mobile: user.mobile },
      update: {},
      create: user,
    });
    console.log(`   ✅ ${user.fullName} (${user.mobile})`);
  }
  console.log('');

  // Default Beneficiaries
  console.log('🎯 Seeding default beneficiaries...');
  for (const b of DEFAULT_BENEFICIARIES) {
    await prisma.beneficiary.upsert({
      where: { pan: b.pan },
      update: {},
      create: b,
    });
    console.log(`   ✅ ${b.name} (PAN: ${b.pan})`);
  }
  console.log('');

  // Schemes
  console.log('🏛️  Seeding schemes...');
  const allSchemes = [...CENTRAL_SCHEMES, ...STATE_SCHEMES];
  for (const s of allSchemes) {
    await prisma.scheme.upsert({
      where: { id: s.id },
      update: { name: s.name, nameHindi: s.nameHindi, ministry: s.ministry, category: s.category, benefit: s.benefit, eligibility: s.eligibility, icon: s.icon, description: s.description, documents: s.documents, formFields: s.formFields },
      create: s,
    });
    console.log(`   ✅ [${s.stateId.padEnd(15)}] ${s.name}`);
  }
  console.log(`   Total: ${allSchemes.length} schemes\n`);

  // Exams
  console.log('📝 Seeding exams...');
  const allExams = [...CENTRAL_EXAMS, ...STATE_EXAMS];
  for (const e of allExams) {
    await prisma.exam.upsert({
      where: { id: e.id },
      update: { name: e.name, shortName: e.shortName, conductedBy: e.conductedBy, category: e.category, posts: e.posts, applicationFee: e.applicationFee, eligibility: e.eligibility, nextExam: e.nextExam, applicationDeadline: e.applicationDeadline, icon: e.icon, status: e.status, description: e.description, formFields: e.formFields },
      create: e,
    });
    console.log(`   ✅ [${e.stateId.padEnd(15)}] ${e.name}`);
  }
  console.log(`   Total: ${allExams.length} exams\n`);

  // Scholarships
  console.log('🎓 Seeding scholarships...');
  for (const s of ALL_SCHOLARSHIPS) {
    await prisma.scholarship.upsert({
      where: { id: s.id },
      update: { name: s.name, nameHindi: s.nameHindi, ministry: s.ministry, category: s.category, subcategory: s.subcategory, benefit: s.benefit, eligibility: s.eligibility, icon: s.icon, description: s.description, documents: s.documents, formFields: s.formFields },
      create: s,
    });
    console.log(`   ✅ [${s.stateId.padEnd(15)}] ${s.name}`);
  }
  console.log(`   Total: ${ALL_SCHOLARSHIPS.length} scholarships\n`);

  // Tenders
  console.log('📄 Seeding tenders...');
  for (const t of ALL_TENDERS) {
    await prisma.tender.upsert({
      where: { id: t.id },
      update: { name: t.name, shortName: t.shortName, department: t.department, category: t.category, subcategory: t.subcategory, estimatedValue: t.estimatedValue, bidDeadline: t.bidDeadline, workDescription: t.workDescription, eligibility: t.eligibility, icon: t.icon, status: t.status, tenderNo: t.tenderNo, documents: t.documents, formFields: t.formFields },
      create: t,
    });
    console.log(`   ✅ [${t.stateId.padEnd(15)}] ${t.name}`);
  }
  console.log(`   Total: ${ALL_TENDERS.length} tenders\n`);

  console.log('✅ Database seeding complete!');
  console.log(`\n📊 Summary:`);
  console.log(`   Gov Admins  : ${GOV_ADMINS.length}`);
  console.log(`   Demo Users  : ${DEMO_USERS.length}`);
  console.log(`   Beneficiaries: ${DEFAULT_BENEFICIARIES.length}`);
  console.log(`   Schemes     : ${allSchemes.length} (${CENTRAL_SCHEMES.length} central + ${STATE_SCHEMES.length} state)`);
  console.log(`   Exams       : ${allExams.length} (${CENTRAL_EXAMS.length} central + ${STATE_EXAMS.length} state)`);
  console.log(`   Scholarships: ${ALL_SCHOLARSHIPS.length}`);
  console.log(`   Tenders     : ${ALL_TENDERS.length}`);
}

main()
  .catch((e) => { console.error('❌ Seed failed:', e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
