// ============================================================
// OMEGA Community Hub - Centralized Mock Data Module
// Structured for future API wiring
// ============================================================

// ============================================================
// CANONICAL SKILL TAGS WITH LABELS
// ============================================================

export const SKILL_DOMAINS = {
  Medical: { label: 'Medical', icon: 'Stethoscope', color: 'text-rose-400', bg: 'bg-rose-500/20' },
  Comms: { label: 'Communications', icon: 'Radio', color: 'text-cyan-400', bg: 'bg-cyan-500/20' },
  Security: { label: 'Security', icon: 'Shield', color: 'text-amber-400', bg: 'bg-amber-500/20' },
  FoodWater: { label: 'Food & Water', icon: 'Utensils', color: 'text-emerald-400', bg: 'bg-emerald-500/20' },
  Engineering: { label: 'Engineering', icon: 'Wrench', color: 'text-orange-400', bg: 'bg-orange-500/20' },
  Logistics: { label: 'Logistics', icon: 'Compass', color: 'text-violet-400', bg: 'bg-violet-500/20' },
};

export const CANONICAL_SKILLS = {
  // Medical
  'Medical.FirstAid': { label: 'First Aid', domain: 'Medical', critical: true },
  'Medical.CPR': { label: 'CPR', domain: 'Medical', critical: true },
  'Medical.Trauma': { label: 'Trauma Care', domain: 'Medical', critical: true },
  'Medical.Nursing': { label: 'Nursing', domain: 'Medical', critical: false },
  'Medical.EMT': { label: 'EMT', domain: 'Medical', critical: true },
  'Medical.Surgery': { label: 'Surgery', domain: 'Medical', critical: false },
  
  // Communications
  'Comms.HAM': { label: 'HAM Radio', domain: 'Comms', critical: true },
  'Comms.MorseCode': { label: 'Morse Code', domain: 'Comms', critical: false },
  'Comms.SignalProcessing': { label: 'Signal Processing', domain: 'Comms', critical: false },
  'Comms.Networking': { label: 'Networking', domain: 'Comms', critical: true },
  
  // Security
  'Security.Firearms': { label: 'Firearms', domain: 'Security', critical: false },
  'Security.SelfDefense': { label: 'Self Defense', domain: 'Security', critical: false },
  'Security.Perimeter': { label: 'Perimeter Defense', domain: 'Security', critical: true },
  'Security.Surveillance': { label: 'Surveillance', domain: 'Security', critical: false },
  
  // Food & Water
  'FoodWater.WaterPurification': { label: 'Water Purification', domain: 'FoodWater', critical: true },
  'FoodWater.FoodPreservation': { label: 'Food Preservation', domain: 'FoodWater', critical: true },
  'FoodWater.Farming': { label: 'Farming', domain: 'FoodWater', critical: false },
  'FoodWater.Gardening': { label: 'Gardening', domain: 'FoodWater', critical: false },
  'FoodWater.Hunting': { label: 'Hunting', domain: 'FoodWater', critical: false },
  'FoodWater.Foraging': { label: 'Foraging', domain: 'FoodWater', critical: false },
  
  // Engineering
  'Engineering.Electrical': { label: 'Electrical', domain: 'Engineering', critical: true },
  'Engineering.Plumbing': { label: 'Plumbing', domain: 'Engineering', critical: true },
  'Engineering.Carpentry': { label: 'Carpentry', domain: 'Engineering', critical: false },
  'Engineering.Welding': { label: 'Welding', domain: 'Engineering', critical: false },
  'Engineering.SolarSystems': { label: 'Solar Systems', domain: 'Engineering', critical: true },
  'Engineering.Electronics': { label: 'Electronics', domain: 'Engineering', critical: false },
  
  // Logistics
  'Logistics.Navigation': { label: 'Navigation', domain: 'Logistics', critical: true },
  'Logistics.SupplyChain': { label: 'Supply Chain', domain: 'Logistics', critical: false },
  'Logistics.Inventory': { label: 'Inventory Mgmt', domain: 'Logistics', critical: false },
  'Logistics.Transport': { label: 'Transport', domain: 'Logistics', critical: false },
};

export const getSkillLabel = (tagKey) => CANONICAL_SKILLS[tagKey]?.label || tagKey.split('.').pop();
export const getSkillDomain = (tagKey) => CANONICAL_SKILLS[tagKey]?.domain || 'Other';

// ============================================================
// LANGUAGE CODES (BCP-47)
// ============================================================

export const LANGUAGES = {
  'en': { label: 'English', flag: '🇺🇸' },
  'es': { label: 'Spanish', flag: '🇪🇸' },
  'zh': { label: 'Mandarin', flag: '🇨🇳' },
  'ko': { label: 'Korean', flag: '🇰🇷' },
  'ja': { label: 'Japanese', flag: '🇯🇵' },
  'de': { label: 'German', flag: '🇩🇪' },
  'fr': { label: 'French', flag: '🇫🇷' },
  'pt': { label: 'Portuguese', flag: '🇧🇷' },
  'ar': { label: 'Arabic', flag: '🇸🇦' },
  'ru': { label: 'Russian', flag: '🇷🇺' },
  'hi': { label: 'Hindi', flag: '🇮🇳' },
  'vi': { label: 'Vietnamese', flag: '🇻🇳' },
  'tl': { label: 'Tagalog', flag: '🇵🇭' },
};

export const getLanguageLabel = (code) => LANGUAGES[code]?.label || code;

// ============================================================
// EDUCATION LEVELS
// ============================================================

export const EDUCATION_LEVELS = {
  'None': { label: 'No formal education', order: 0 },
  'HS': { label: 'High School', order: 1 },
  'SomeCollege': { label: 'Some College', order: 2 },
  'Trade': { label: 'Trade/Vocational', order: 3 },
  'Bachelors': { label: "Bachelor's Degree", order: 4 },
  'Masters': { label: "Master's Degree", order: 5 },
  'Doctorate': { label: 'Doctorate', order: 6 },
  'Other': { label: 'Other', order: 7 },
};

// ============================================================
// MOCK PROFILES (15 members with varied data)
// ============================================================

export const generateMockProfiles = () => [
  {
    userId: 'user-001',
    displayName: 'Sarah Chen',
    photoUrl: null,
    age: 38,
    anthro: { heightIn: 66, weightLb: 140 },
    educationLevel: 'Bachelors',
    languages: ['en', 'zh'],
    skills: ['Medical.FirstAid', 'Medical.CPR', 'Medical.Trauma', 'Medical.Nursing'],
    certifications: ['RN', 'BLS', 'ACLS'],
    privacy: { showAge: true, showHeightWeight: true, showEducation: true },
    stats: { online: true, lastSeen: new Date().toISOString() },
    class: 'Lead Medic',
    availability: 'available',
    profileCompletenessScore: 95,
    createdAt: '2025-06-15T10:00:00Z',
  },
  {
    userId: 'user-002',
    displayName: 'Marcus Johnson',
    photoUrl: null,
    age: 52,
    anthro: { heightIn: 73, weightLb: 195 },
    educationLevel: 'Trade',
    languages: ['en', 'es'],
    skills: ['Security.Firearms', 'Security.Perimeter', 'Comms.HAM', 'Security.SelfDefense'],
    certifications: ['HAM-Extra', 'CPL'],
    privacy: { showAge: true, showHeightWeight: true, showEducation: true },
    stats: { online: true, lastSeen: new Date().toISOString() },
    class: 'Security Lead',
    availability: 'available',
    profileCompletenessScore: 100,
    createdAt: '2025-05-20T08:00:00Z',
  },
  {
    userId: 'user-003',
    displayName: 'Elena Rodriguez',
    photoUrl: null,
    age: 31,
    anthro: { heightIn: 64, weightLb: 135 },
    educationLevel: 'SomeCollege',
    languages: ['en', 'es', 'pt'],
    skills: ['Logistics.SupplyChain', 'Logistics.Inventory', 'FoodWater.FoodPreservation', 'FoodWater.Farming'],
    certifications: ['ServSafe'],
    privacy: { showAge: true, showHeightWeight: false, showEducation: true },
    stats: { online: true, lastSeen: new Date().toISOString() },
    class: 'Logistics Coordinator',
    availability: 'busy',
    profileCompletenessScore: 85,
    createdAt: '2025-07-01T12:00:00Z',
  },
  {
    userId: 'user-004',
    displayName: 'David Park',
    photoUrl: null,
    age: 29,
    anthro: { heightIn: 69, weightLb: 165 },
    educationLevel: 'Masters',
    languages: ['en', 'ko'],
    skills: ['Engineering.Electronics', 'Engineering.SolarSystems', 'Comms.Networking', 'Engineering.Electrical'],
    certifications: ['CCNA', 'AWS-SA'],
    privacy: { showAge: true, showHeightWeight: true, showEducation: true },
    stats: { online: true, lastSeen: new Date().toISOString() },
    class: 'Tech Lead',
    availability: 'available',
    profileCompletenessScore: 100,
    createdAt: '2025-06-10T09:30:00Z',
  },
  {
    userId: 'user-005',
    displayName: 'Amanda Foster',
    photoUrl: null,
    age: 34,
    anthro: { heightIn: 68, weightLb: 145 },
    educationLevel: 'Bachelors',
    languages: ['en'],
    skills: ['Security.Perimeter', 'Logistics.Navigation', 'FoodWater.Hunting', 'Security.SelfDefense'],
    certifications: ['Wilderness First Responder'],
    privacy: { showAge: true, showHeightWeight: false, showEducation: true },
    stats: { online: false, lastSeen: '2025-12-08T14:30:00Z' },
    class: 'Scout',
    availability: 'away',
    profileCompletenessScore: 80,
    createdAt: '2025-08-05T14:00:00Z',
  },
  {
    userId: 'user-006',
    displayName: 'Robert Thompson',
    photoUrl: null,
    age: 61,
    anthro: { heightIn: 71, weightLb: 200 },
    educationLevel: 'Trade',
    languages: ['en', 'de'],
    skills: ['Engineering.Carpentry', 'Engineering.Plumbing', 'Engineering.Electrical', 'Engineering.Welding'],
    certifications: ['Master Electrician'],
    privacy: { showAge: true, showHeightWeight: true, showEducation: true },
    stats: { online: true, lastSeen: new Date().toISOString() },
    class: 'Builder',
    availability: 'available',
    profileCompletenessScore: 90,
    createdAt: '2025-05-15T07:00:00Z',
  },
  {
    userId: 'user-007',
    displayName: 'Lisa Wong',
    photoUrl: null,
    age: 42,
    anthro: { heightIn: 63, weightLb: 120 },
    educationLevel: 'Doctorate',
    languages: ['en', 'zh', 'ja'],
    skills: ['Medical.Trauma', 'Medical.Surgery', 'Medical.EMT', 'Medical.FirstAid', 'Medical.CPR'],
    certifications: ['MD', 'ACLS', 'ATLS', 'PALS'],
    privacy: { showAge: true, showHeightWeight: true, showEducation: true },
    stats: { online: true, lastSeen: new Date().toISOString() },
    class: 'Chief Medical Officer',
    availability: 'available',
    profileCompletenessScore: 100,
    createdAt: '2025-04-01T06:00:00Z',
  },
  {
    userId: 'user-008',
    displayName: 'James Miller',
    photoUrl: null,
    age: 48,
    anthro: { heightIn: 70, weightLb: 175 },
    educationLevel: 'Bachelors',
    languages: ['en', 'fr'],
    skills: ['Comms.HAM', 'Comms.MorseCode', 'Comms.SignalProcessing', 'Engineering.Electronics'],
    certifications: ['HAM-Amateur Extra'],
    privacy: { showAge: true, showHeightWeight: false, showEducation: true },
    stats: { online: false, lastSeen: '2025-12-08T10:00:00Z' },
    class: 'Comms Specialist',
    availability: 'busy',
    profileCompletenessScore: 75,
    createdAt: '2025-06-20T11:00:00Z',
  },
  {
    userId: 'user-009',
    displayName: 'Maria Santos',
    photoUrl: null,
    age: 28,
    anthro: { heightIn: 65, weightLb: 140 },
    educationLevel: 'Bachelors',
    languages: ['en', 'es', 'pt'],
    skills: ['Medical.FirstAid', 'FoodWater.FoodPreservation', 'FoodWater.Farming', 'FoodWater.Gardening'],
    certifications: ['First Aid', 'CPR'],
    privacy: { showAge: true, showHeightWeight: false, showEducation: false },
    stats: { online: true, lastSeen: new Date().toISOString() },
    class: null,
    availability: 'available',
    profileCompletenessScore: 65,
    createdAt: '2025-07-15T13:00:00Z',
  },
  {
    userId: 'user-010',
    displayName: "Kevin O'Brien",
    photoUrl: null,
    age: 24,
    anthro: { heightIn: 72, weightLb: 180 },
    educationLevel: 'SomeCollege',
    languages: ['en'],
    skills: ['Security.SelfDefense'],
    certifications: [],
    privacy: { showAge: true, showHeightWeight: true, showEducation: true },
    stats: { online: false, lastSeen: '2025-12-01T12:00:00Z' },
    class: null,
    availability: 'offline',
    profileCompletenessScore: 40,
    createdAt: '2025-09-01T16:00:00Z',
  },
  {
    userId: 'user-011',
    displayName: 'Jennifer Lee',
    photoUrl: null,
    age: 39,
    anthro: { heightIn: 66, weightLb: 130 },
    educationLevel: 'Masters',
    languages: ['en', 'ko'],
    skills: ['Logistics.SupplyChain', 'Logistics.Inventory', 'Logistics.Navigation', 'Logistics.Transport'],
    certifications: ['PMP', 'CSCP'],
    privacy: { showAge: true, showHeightWeight: false, showEducation: true },
    stats: { online: true, lastSeen: new Date().toISOString() },
    class: 'Supply Chain Manager',
    availability: 'available',
    profileCompletenessScore: 95,
    createdAt: '2025-06-25T10:30:00Z',
  },
  {
    userId: 'user-012',
    displayName: 'Michael Brown',
    photoUrl: null,
    age: 44,
    anthro: { heightIn: 71, weightLb: 185 },
    educationLevel: 'HS',
    languages: ['en'],
    skills: ['FoodWater.Hunting', 'FoodWater.Farming', 'FoodWater.WaterPurification', 'Logistics.Navigation'],
    certifications: ['Hunters Safety'],
    privacy: { showAge: true, showHeightWeight: true, showEducation: true },
    stats: { online: false, lastSeen: '2025-12-08T08:00:00Z' },
    class: 'Forager',
    availability: 'busy',
    profileCompletenessScore: 70,
    createdAt: '2025-08-10T08:00:00Z',
  },
  {
    userId: 'user-013',
    displayName: 'Aisha Patel',
    photoUrl: null,
    age: 33,
    anthro: { heightIn: 62, weightLb: 125 },
    educationLevel: 'Bachelors',
    languages: ['en', 'hi', 'ar'],
    skills: ['Medical.Nursing', 'Medical.FirstAid', 'FoodWater.FoodPreservation'],
    certifications: ['RN', 'BLS'],
    privacy: { showAge: false, showHeightWeight: false, showEducation: true },
    stats: { online: true, lastSeen: new Date().toISOString() },
    class: 'Medic',
    availability: 'available',
    profileCompletenessScore: 80,
    createdAt: '2025-07-20T09:00:00Z',
  },
  {
    userId: 'user-014',
    displayName: 'Tom Nguyen',
    photoUrl: null,
    age: 36,
    anthro: { heightIn: 67, weightLb: 155 },
    educationLevel: 'Bachelors',
    languages: ['en', 'vi'],
    skills: ['Engineering.SolarSystems', 'Engineering.Electrical', 'Engineering.Electronics'],
    certifications: ['Solar PV Installer'],
    privacy: { showAge: true, showHeightWeight: true, showEducation: true },
    stats: { online: true, lastSeen: new Date().toISOString() },
    class: 'Solar Tech',
    availability: 'available',
    profileCompletenessScore: 85,
    createdAt: '2025-08-15T11:00:00Z',
  },
  {
    userId: 'user-015',
    displayName: 'Rosa Martinez',
    photoUrl: null,
    age: 55,
    anthro: { heightIn: 60, weightLb: 150 },
    educationLevel: 'Trade',
    languages: ['en', 'es', 'tl'],
    skills: ['FoodWater.Farming', 'FoodWater.Gardening', 'FoodWater.FoodPreservation', 'FoodWater.Foraging'],
    certifications: ['Master Gardener'],
    privacy: { showAge: true, showHeightWeight: false, showEducation: true },
    stats: { online: false, lastSeen: '2025-12-07T18:00:00Z' },
    class: 'Agriculture Lead',
    availability: 'away',
    profileCompletenessScore: 90,
    createdAt: '2025-05-01T07:00:00Z',
  },
];

// ============================================================
// ANALYTICS SUMMARY (Pre-aggregated for Overview)
// ============================================================

export const generateAnalyticsSummary = (profiles) => {
  const onlineProfiles = profiles.filter(p => p.stats.online);
  const totalMembers = profiles.length;
  const onlineNow = onlineProfiles.length;
  
  // Calculate domain coverage
  const domainCoverage = {};
  Object.keys(SKILL_DOMAINS).forEach(domain => {
    const domainSkills = Object.entries(CANONICAL_SKILLS)
      .filter(([, s]) => s.domain === domain)
      .map(([key]) => key);
    
    const qualified = profiles.filter(p => 
      p.skills.some(s => domainSkills.includes(s))
    );
    const onlineQualified = qualified.filter(p => p.stats.online);
    
    domainCoverage[domain] = {
      qualifiedCount: qualified.length,
      onlineQualifiedCount: onlineQualified.length,
      redundancy: qualified.length >= 3 ? 'High' : qualified.length >= 2 ? 'Medium' : 'Low',
      status: qualified.length === 0 ? 'P0' : qualified.length === 1 ? 'WARN' : 'OK',
    };
  });
  
  // Single Points of Failure (skills with 0-1 holders)
  const singlePointsOfFailure = [];
  Object.entries(CANONICAL_SKILLS)
    .filter(([, s]) => s.critical)
    .forEach(([tagKey, skill]) => {
      const holders = profiles.filter(p => p.skills.includes(tagKey));
      const holdersOnline = holders.filter(p => p.stats.online);
      if (holders.length <= 1) {
        singlePointsOfFailure.push({
          tagKey,
          label: skill.label,
          domain: skill.domain,
          holdersTotal: holders.length,
          holdersOnline: holdersOnline.length,
          priority: holders.length === 0 ? 'P0' : 'P1',
        });
      }
    });
  
  // Top strengths (most common skills)
  const skillCounts = {};
  profiles.forEach(p => {
    p.skills.forEach(s => {
      skillCounts[s] = (skillCounts[s] || 0) + 1;
    });
  });
  const topStrengths = Object.entries(skillCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([tagKey, count]) => {
      const onlineCount = profiles.filter(p => p.stats.online && p.skills.includes(tagKey)).length;
      return { tagKey, label: getSkillLabel(tagKey), countTotal: count, countOnline: onlineCount };
    });
  
  // Top gaps (critical skills with lowest coverage)
  const topGaps = Object.entries(CANONICAL_SKILLS)
    .filter(([, s]) => s.critical)
    .map(([tagKey, skill]) => {
      const count = skillCounts[tagKey] || 0;
      const onlineCount = profiles.filter(p => p.stats.online && p.skills.includes(tagKey)).length;
      return { tagKey, label: skill.label, countTotal: count, countOnline: onlineCount };
    })
    .sort((a, b) => a.countTotal - b.countTotal)
    .slice(0, 5);
  
  // Language coverage
  const languageCounts = {};
  profiles.forEach(p => {
    p.languages.forEach(l => {
      languageCounts[l] = (languageCounts[l] || 0) + 1;
    });
  });
  const languages = Object.entries(languageCounts)
    .map(([code, count]) => ({ code, label: getLanguageLabel(code), count }))
    .sort((a, b) => b.count - a.count);
  
  // Profile completeness
  const avgCompleteness = Math.round(
    profiles.reduce((sum, p) => sum + p.profileCompletenessScore, 0) / totalMembers
  );
  const incompleteProfiles = profiles.filter(p => p.profileCompletenessScore < 80).length;
  const missingSkills = profiles.filter(p => p.skills.length === 0).length;
  const missingLanguages = profiles.filter(p => p.languages.length <= 1).length;
  
  // Recommendations
  const recommendations = [];
  singlePointsOfFailure.forEach(spof => {
    recommendations.push({
      id: `rec-spof-${spof.tagKey}`,
      priority: spof.priority,
      title: spof.holdersTotal === 0 
        ? `Critical: No ${spof.label} coverage`
        : `Warning: Only 1 person has ${spof.label}`,
      detail: spof.holdersTotal === 0
        ? `The network has no one with ${spof.label} skills. This is a critical gap.`
        : `${spof.label} is a single point of failure. Cross-train a backup.`,
      actions: ['Create Training Task', 'View Candidates', 'Start Discussion'],
      filterSkill: spof.tagKey,
    });
  });
  
  if (incompleteProfiles > 3) {
    recommendations.push({
      id: 'rec-incomplete-profiles',
      priority: 'P2',
      title: `${incompleteProfiles} members have incomplete profiles`,
      detail: 'Encourage members to complete their profiles for better skill matching.',
      actions: ['Send Reminder', 'View Incomplete'],
    });
  }
  
  return {
    population: {
      membersTotal: totalMembers,
      onlineNow,
      profilesCompletePct: avgCompleteness,
      lastSyncAt: new Date().toISOString(),
      newMembersWeek: 2,
    },
    coverage: { domains: domainCoverage },
    singlePointsOfFailure: singlePointsOfFailure.sort((a, b) => 
      a.priority === 'P0' ? -1 : b.priority === 'P0' ? 1 : 0
    ),
    topStrengths,
    topGaps,
    languages,
    recommendations: recommendations.slice(0, 6),
    dataQuality: {
      avgCompleteness,
      incompleteProfiles,
      missingSkills,
      missingLanguages,
    },
  };
};

// ============================================================
// COMMS PREVIEW DATA
// ============================================================

export const generateCommsPreview = () => ({
  pinnedBulletins: [
    {
      id: 'bulletin-001',
      title: 'Water System Maintenance - Dec 10',
      createdAt: '2025-12-08T09:00:00Z',
      author: 'Lisa Wong',
      severity: 'warning',
    },
    {
      id: 'bulletin-002', 
      title: 'Weekly Supply Run - Sign Up',
      createdAt: '2025-12-07T14:00:00Z',
      author: 'Elena Rodriguez',
      severity: 'info',
    },
    {
      id: 'bulletin-003',
      title: 'Radio Check Schedule Updated',
      createdAt: '2025-12-05T10:00:00Z',
      author: 'James Miller',
      severity: 'info',
    },
  ],
  recentActivity: [
    { type: 'message', label: 'New message in #general', createdAt: '2025-12-09T08:30:00Z' },
    { type: 'poll', label: 'Poll completed: Meeting time', createdAt: '2025-12-09T07:00:00Z' },
    { type: 'task', label: 'Task assigned: Perimeter check', createdAt: '2025-12-08T22:00:00Z' },
    { type: 'announcement', label: 'New announcement posted', createdAt: '2025-12-08T16:00:00Z' },
    { type: 'message', label: '5 new messages in #medical', createdAt: '2025-12-08T14:00:00Z' },
  ],
  stats: {
    messagesLast24h: 47,
    activePollsCount: 2,
    pendingTasksCount: 8,
  },
});

// ============================================================
// INCIDENTS & SCORING (Admin-only)
// ============================================================

export const generateMockIncidents = () => [
  {
    id: 'INC-2025-001',
    userId: 'user-010',
    type: 'BAD',
    category: 'violation',
    severity: 3,
    points: -15,
    summary: 'Unauthorized entry to restricted storage',
    status: 'Closed',
    createdAt: '2025-10-15T14:30:00Z',
  },
  {
    id: 'INC-2025-002',
    userId: 'user-006',
    type: 'BAD', 
    category: 'safety',
    severity: 2,
    points: -10,
    summary: 'Improper tool storage',
    status: 'Closed',
    createdAt: '2025-11-02T10:15:00Z',
  },
  {
    id: 'INC-2025-003',
    userId: 'user-010',
    type: 'BAD',
    category: 'conduct',
    severity: 3,
    points: 0,
    summary: 'Verbal altercation',
    status: 'UnderReview',
    createdAt: '2025-12-01T16:45:00Z',
  },
  {
    id: 'INC-2025-004',
    userId: 'user-005',
    type: 'GOOD',
    category: 'leadership',
    severity: 4,
    points: 7,
    summary: 'Exceptional evacuation leadership',
    status: 'Closed',
    createdAt: '2025-11-20T08:00:00Z',
  },
  {
    id: 'INC-2025-005',
    userId: 'user-001',
    type: 'GOOD',
    category: 'contribution',
    severity: 5,
    points: 10,
    summary: 'Life-saving medical response',
    status: 'Closed',
    createdAt: '2025-11-15T19:30:00Z',
  },
];

export const generateMockScoreConfig = () => ({
  baseScore: 100,
  thresholds: { monitor: 70, restricted: 50, intervention: 30 },
  lastUpdated: '2025-11-01T10:00:00Z',
});

export const calculateMemberScores = (profiles, incidents, config) => {
  const scores = {};
  
  profiles.forEach(profile => {
    const userIncidents = incidents.filter(i => i.userId === profile.userId && i.status === 'Closed');
    let score = config.baseScore + userIncidents.reduce((sum, i) => sum + i.points, 0);
    score = Math.max(0, Math.min(100, score));
    
    let flag = null;
    if (score < config.thresholds.intervention) flag = 'intervention';
    else if (score < config.thresholds.restricted) flag = 'restricted';
    else if (score < config.thresholds.monitor) flag = 'monitor';
    
    scores[profile.userId] = { score, flag };
  });
  
  return scores;
};

// ============================================================
// ROLE DEFINITIONS
// ============================================================

export const ROLES = {
  guest: {
    id: 'guest',
    name: 'Guest',
    color: 'text-muted-foreground',
    bg: 'bg-muted/20',
    permissions: {
      viewOverview: true,
      viewAnalytics: false,
      viewDirectory: true,
      viewComms: false,
      viewIncidents: false,
      viewSensitiveFields: false,
    }
  },
  member: {
    id: 'member',
    name: 'Member',
    color: 'text-primary',
    bg: 'bg-primary/20',
    permissions: {
      viewOverview: true,
      viewAnalytics: true,
      viewDirectory: true,
      viewComms: true,
      viewIncidents: false,
      viewSensitiveFields: false,
    }
  },
  admin: {
    id: 'admin',
    name: 'Admin',
    color: 'text-amber-400',
    bg: 'bg-amber-500/20',
    permissions: {
      viewOverview: true,
      viewAnalytics: true,
      viewDirectory: true,
      viewComms: true,
      viewIncidents: true,
      viewSensitiveFields: true,
    }
  }
};

// Mock current users for role testing
export const MOCK_CURRENT_USERS = {
  admin: { id: 'user-007', displayName: 'Lisa Wong', role: 'admin', privacy: { showAge: true, showHeightWeight: true, showEducation: true } },
  member: { id: 'user-004', displayName: 'David Park', role: 'member', privacy: { showAge: true, showHeightWeight: true, showEducation: true } },
  guest: { id: 'guest-001', displayName: 'Guest User', role: 'guest', privacy: { showAge: false, showHeightWeight: false, showEducation: false } },
};
