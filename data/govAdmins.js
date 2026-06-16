// All government admin accounts
// Central admin: gov_admin — publishes to Central Schemes / Central Exams
// State admins: {stateCode}_admin — publishes only to their state's page

export const GOV_ADMINS = {
  // ── States ──
  'wb_admin': {
    username: 'wb_admin',
    password: 'WB@2024',
    stateId: 'west-bengal',
    stateName: 'West Bengal',
    emoji: '🐯',
    level: 'state',
  },
  'up_admin': {
    username: 'up_admin',
    password: 'UP@2024',
    stateId: 'uttar-pradesh',
    stateName: 'Uttar Pradesh',
    emoji: '🕌',
    level: 'state',
  },
  'mh_admin': {
    username: 'mh_admin',
    password: 'MH@2024',
    stateId: 'maharashtra',
    stateName: 'Maharashtra',
    emoji: '🌆',
    level: 'state',
  },
  'ka_admin': {
    username: 'ka_admin',
    password: 'KA@2024',
    stateId: 'karnataka',
    stateName: 'Karnataka',
    emoji: '🏯',
    level: 'state',
  },
  'dl_admin': {
    username: 'dl_admin',
    password: 'DL@2024',
    stateId: 'delhi',
    stateName: 'Delhi (NCT)',
    emoji: '🏛️',
    level: 'state',
  },
  'tn_admin': {
    username: 'tn_admin',
    password: 'TN@2024',
    stateId: 'tamil-nadu',
    stateName: 'Tamil Nadu',
    emoji: '🕌',
    level: 'state',
  },
  'rj_admin': {
    username: 'rj_admin',
    password: 'RJ@2024',
    stateId: 'rajasthan',
    stateName: 'Rajasthan',
    emoji: '🏜️',
    level: 'state',
  },
  'br_admin': {
    username: 'br_admin',
    password: 'BR@2024',
    stateId: 'bihar',
    stateName: 'Bihar',
    emoji: '🎓',
    level: 'state',
  },
  'gj_admin': {
    username: 'gj_admin',
    password: 'GJ@2024',
    stateId: 'gujarat',
    stateName: 'Gujarat',
    emoji: '🦁',
    level: 'state',
  },
  'kl_admin': {
    username: 'kl_admin',
    password: 'KL@2024',
    stateId: 'kerala',
    stateName: 'Kerala',
    emoji: '🌴',
    level: 'state',
  },
  'pb_admin': {
    username: 'pb_admin',
    password: 'PB@2024',
    stateId: 'punjab',
    stateName: 'Punjab',
    emoji: '🌾',
    level: 'state',
  },
  'mp_admin': {
    username: 'mp_admin',
    password: 'MP@2024',
    stateId: 'madhya-pradesh',
    stateName: 'Madhya Pradesh',
    emoji: '🐯',
    level: 'state',
  },
  'ap_admin': {
    username: 'ap_admin',
    password: 'AP@2024',
    stateId: 'andhra-pradesh',
    stateName: 'Andhra Pradesh',
    emoji: '🏛️',
    level: 'state',
  },
  'as_admin': {
    username: 'as_admin',
    password: 'AS@2024',
    stateId: 'assam',
    stateName: 'Assam',
    emoji: '🌿',
    level: 'state',
  },
  'od_admin': {
    username: 'od_admin',
    password: 'OD@2024',
    stateId: 'odisha',
    stateName: 'Odisha',
    emoji: '🕌',
    level: 'state',
  },
  'hr_admin': {
    username: 'hr_admin',
    password: 'HR@2024',
    stateId: 'haryana',
    stateName: 'Haryana',
    emoji: '🌻',
    level: 'state',
  },
  'jk_admin': {
    username: 'jk_admin',
    password: 'JK@2024',
    stateId: 'jammu-kashmir',
    stateName: 'Jammu & Kashmir',
    emoji: '❄️',
    level: 'state',
  },
  'jh_admin': {
    username: 'jh_admin',
    password: 'JH@2024',
    stateId: 'jharkhand',
    stateName: 'Jharkhand',
    emoji: '🌲',
    level: 'state',
  },
};

// Storage keys
export const SCHEME_STORAGE_KEY = 'gov_custom_schemes';
export const EXAM_STORAGE_KEY   = 'gov_custom_exams';

// Helper: get all custom schemes for a state (or central)
export const getCustomSchemesByState = (stateId) => {
  try {
    const all = JSON.parse(localStorage.getItem(SCHEME_STORAGE_KEY) || '[]');
    return all.filter(s => s.stateId === stateId);
  } catch { return []; }
};

// Helper: get all custom exams for a state (or central)
export const getCustomExamsByState = (stateId) => {
  try {
    const all = JSON.parse(localStorage.getItem(EXAM_STORAGE_KEY) || '[]');
    return all.filter(e => e.stateId === stateId);
  } catch { return []; }
};
