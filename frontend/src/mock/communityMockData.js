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

// ============================================================
// STATUS & CONNECTION TYPES (From Ally Node Card)
// ============================================================

export const USER_STATUS = {
  GOOD: { label: 'GOOD', color: 'bg-success text-white', icon: 'CheckCircle' },
  OKAY: { label: 'OKAY', color: 'bg-warning text-black', icon: 'AlertTriangle' },
  NEED_HELP: { label: 'NEED HELP', color: 'bg-destructive text-white', icon: 'AlertCircle' },
  OFFLINE: { label: 'OFFLINE', color: 'bg-muted text-muted-foreground', icon: 'Circle' },
};

export const CONNECTION_TYPES = {
  WIFI: { label: 'Wi-Fi', icon: 'Wifi', color: 'text-primary' },
  MESH: { label: 'Mesh', icon: 'Radio', color: 'text-cyan-400' },
  LORA: { label: 'LoRa', icon: 'Radio', color: 'text-emerald-400' },
  CELLULAR: { label: 'Cellular', icon: 'Signal', color: 'text-amber-400' },
  OFFLINE: { label: 'Offline', icon: 'WifiOff', color: 'text-muted-foreground' },
};

export const BLOOD_TYPES = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

export const generateMockProfiles = () => [
  {
    userId: 'user-001',
    displayName: 'Sarah Chen',
    callsign: 'PHOENIX',
    photoUrl: null,
    age: 38,
    anthro: { heightIn: 66, weightLb: 140 },
    educationLevel: 'Bachelors',
    languages: ['en', 'zh'],
    skills: ['Medical.FirstAid', 'Medical.CPR', 'Medical.Trauma', 'Medical.Nursing'],
    certifications: ['RN', 'BLS', 'ACLS'],
    privacy: { showAge: true, showHeightWeight: true, showEducation: true, showMedical: true, showLocation: false },
    stats: { online: true, lastSeen: new Date().toISOString() },
    class: 'Lead Medic',
    availability: 'available',
    profileCompletenessScore: 95,
    createdAt: '2025-06-15T10:00:00Z',
    // NEW: Rich node card data
    userStatus: 'GOOD',
    connection: { type: 'WIFI', strength: 85 },
    physical: { hairColor: 'Black', eyeColor: 'Brown', distinguishingFeatures: 'Small scar on left wrist' },
    medical: { conditions: ['None'], allergies: ['Penicillin'], bloodType: 'O+', medications: [] },
    equipment: [
      { name: 'Medical Kit (Full Trauma)', category: 'Medical' },
      { name: 'Handheld Radio: Baofeng UV-5R', category: 'Comms' },
    ],
    device: { model: 'OMEGA Pi 4', cpu: 32, ram: 45, battery: 87, temp: 42 },
    location: { lat: 37.8044, lon: -122.2712, grid: 'CM87vq', accuracy: 5 },
    emergencyContact: { name: 'Marcus Johnson', relation: 'Partner', method: 'Node user-002' },
    notes: 'Primary medical responder. Excellent bedside manner. Cross-trained in emergency triage.',
  },
  {
    userId: 'user-002',
    displayName: 'Marcus Johnson',
    callsign: 'GUARDIAN',
    photoUrl: null,
    age: 52,
    anthro: { heightIn: 73, weightLb: 195 },
    educationLevel: 'Trade',
    languages: ['en', 'es'],
    skills: ['Security.Firearms', 'Security.Perimeter', 'Comms.HAM', 'Security.SelfDefense'],
    certifications: ['HAM-Extra', 'CPL', 'Security Specialist'],
    privacy: { showAge: true, showHeightWeight: true, showEducation: true, showMedical: true, showLocation: true },
    stats: { online: true, lastSeen: new Date().toISOString() },
    class: 'Security Lead',
    availability: 'available',
    profileCompletenessScore: 100,
    createdAt: '2025-05-20T08:00:00Z',
    userStatus: 'GOOD',
    connection: { type: 'MESH', strength: 72 },
    physical: { hairColor: 'Gray', eyeColor: 'Brown', distinguishingFeatures: 'Tattoo on right forearm' },
    medical: { conditions: ['Mild hypertension (controlled)'], allergies: [], bloodType: 'A+', medications: ['Lisinopril'] },
    equipment: [
      { name: 'Primary: AR-15', category: 'Security' },
      { name: 'Sidearm: Glock 19', category: 'Security' },
      { name: 'HAM Radio: Yaesu FT-70D', category: 'Comms' },
      { name: 'Night Vision Goggles', category: 'Security' },
    ],
    device: { model: 'OMEGA Pi 4', cpu: 28, ram: 52, battery: 92, temp: 38 },
    location: { lat: 37.8055, lon: -122.2735, grid: 'CM87vq', accuracy: 3 },
    emergencyContact: { name: 'Sarah Chen', relation: 'Partner', method: 'Node user-001' },
    notes: 'Group security lead. 20+ years military/security experience. Primary comms operator.',
  },
  {
    userId: 'user-003',
    displayName: 'Elena Rodriguez',
    callsign: 'SUPPLY',
    photoUrl: null,
    age: 31,
    anthro: { heightIn: 64, weightLb: 135 },
    educationLevel: 'SomeCollege',
    languages: ['en', 'es', 'pt'],
    skills: ['Logistics.SupplyChain', 'Logistics.Inventory', 'FoodWater.FoodPreservation', 'FoodWater.Farming'],
    certifications: ['ServSafe'],
    privacy: { showAge: true, showHeightWeight: false, showEducation: true, showMedical: false, showLocation: true },
    stats: { online: true, lastSeen: new Date().toISOString() },
    class: 'Logistics Coordinator',
    availability: 'busy',
    profileCompletenessScore: 85,
    createdAt: '2025-07-01T12:00:00Z',
    userStatus: 'OKAY',
    connection: { type: 'WIFI', strength: 90 },
    physical: { hairColor: 'Brown', eyeColor: 'Green', distinguishingFeatures: 'None' },
    medical: { conditions: [], allergies: ['Shellfish'], bloodType: 'B+', medications: [] },
    equipment: [
      { name: 'Inventory Scanner', category: 'Logistics' },
      { name: 'Handheld Radio: Baofeng UV-5R', category: 'Comms' },
    ],
    device: { model: 'OMEGA Pi 4', cpu: 45, ram: 61, battery: 78, temp: 44 },
    location: { lat: 37.8032, lon: -122.2698, grid: 'CM87vq', accuracy: 8 },
    emergencyContact: { name: 'Rosa Martinez', relation: 'Aunt', method: 'Node user-015' },
    notes: 'Manages all supply chain and inventory. Excellent organizational skills.',
  },
  {
    userId: 'user-004',
    displayName: 'David Park',
    callsign: 'SPARKS',
    photoUrl: null,
    age: 29,
    anthro: { heightIn: 69, weightLb: 165 },
    educationLevel: 'Masters',
    languages: ['en', 'ko'],
    skills: ['Engineering.Electronics', 'Engineering.SolarSystems', 'Comms.Networking', 'Engineering.Electrical'],
    certifications: ['CCNA', 'AWS-SA', 'Solar PV Installer'],
    privacy: { showAge: true, showHeightWeight: true, showEducation: true, showMedical: true, showLocation: true },
    stats: { online: true, lastSeen: new Date().toISOString() },
    class: 'Tech Lead',
    availability: 'available',
    profileCompletenessScore: 100,
    createdAt: '2025-06-10T09:30:00Z',
    userStatus: 'GOOD',
    connection: { type: 'WIFI', strength: 95 },
    physical: { hairColor: 'Black', eyeColor: 'Brown', distinguishingFeatures: 'Glasses' },
    medical: { conditions: [], allergies: [], bloodType: 'AB+', medications: [] },
    equipment: [
      { name: 'Solar Panel Kit: 400W', category: 'Power' },
      { name: 'Multimeter', category: 'Engineering' },
      { name: 'Laptop: Toughbook', category: 'Tech' },
      { name: 'Handheld Radio: Baofeng UV-5R', category: 'Comms' },
    ],
    device: { model: 'OMEGA Pi 5', cpu: 18, ram: 38, battery: 95, temp: 35 },
    location: { lat: 37.8048, lon: -122.2725, grid: 'CM87vq', accuracy: 2 },
    emergencyContact: { name: 'Jennifer Lee', relation: 'Sister', method: 'Node user-011' },
    notes: 'Primary tech support. Manages all power systems and network infrastructure.',
  },
  {
    userId: 'user-005',
    displayName: 'Amanda Foster',
    callsign: 'TRACKER',
    photoUrl: null,
    age: 34,
    anthro: { heightIn: 68, weightLb: 145 },
    educationLevel: 'Bachelors',
    languages: ['en'],
    skills: ['Security.Perimeter', 'Logistics.Navigation', 'FoodWater.Hunting', 'Security.SelfDefense'],
    certifications: ['Wilderness First Responder', 'Tracking Certification'],
    privacy: { showAge: true, showHeightWeight: false, showEducation: true, showMedical: false, showLocation: true },
    stats: { online: false, lastSeen: '2025-12-08T14:30:00Z' },
    class: 'Scout',
    availability: 'away',
    profileCompletenessScore: 80,
    createdAt: '2025-08-05T14:00:00Z',
    userStatus: 'OFFLINE',
    connection: { type: 'OFFLINE', strength: 0 },
    physical: { hairColor: 'Blonde', eyeColor: 'Blue', distinguishingFeatures: 'Athletic build' },
    medical: { conditions: [], allergies: ['Bee stings'], bloodType: 'O-', medications: ['Epi-pen (carried)'] },
    equipment: [
      { name: 'Hunting Rifle: Remington 700', category: 'Security' },
      { name: 'GPS: Garmin eTrex', category: 'Navigation' },
      { name: 'Satellite Messenger: Garmin inReach', category: 'Comms' },
    ],
    device: { model: 'OMEGA Pi 4', cpu: 0, ram: 0, battery: 0, temp: 0 },
    location: { lat: null, lon: null, grid: null, accuracy: null },
    emergencyContact: { name: 'Marcus Johnson', relation: 'Team Lead', method: 'Node user-002' },
    notes: 'Primary scout and tracker. Currently on reconnaissance mission.',
  },
  {
    userId: 'user-006',
    displayName: 'Robert Thompson',
    callsign: 'BUILDER',
    photoUrl: null,
    age: 61,
    anthro: { heightIn: 71, weightLb: 200 },
    educationLevel: 'Trade',
    languages: ['en', 'de'],
    skills: ['Engineering.Carpentry', 'Engineering.Plumbing', 'Engineering.Electrical', 'Engineering.Welding'],
    certifications: ['Master Electrician', 'Master Plumber'],
    privacy: { showAge: true, showHeightWeight: true, showEducation: true, showMedical: true, showLocation: true },
    stats: { online: true, lastSeen: new Date().toISOString() },
    class: 'Builder',
    availability: 'available',
    profileCompletenessScore: 90,
    createdAt: '2025-05-15T07:00:00Z',
    userStatus: 'GOOD',
    connection: { type: 'WIFI', strength: 78 },
    physical: { hairColor: 'Gray', eyeColor: 'Blue', distinguishingFeatures: 'Missing pinky finger on left hand' },
    medical: { conditions: ['Type 2 Diabetes (diet-controlled)', 'Arthritis'], allergies: [], bloodType: 'A-', medications: [] },
    equipment: [
      { name: 'Full Tool Kit', category: 'Engineering' },
      { name: 'Welding Gear', category: 'Engineering' },
      { name: 'Handheld Radio: Baofeng UV-5R', category: 'Comms' },
    ],
    device: { model: 'OMEGA Pi 4', cpu: 22, ram: 48, battery: 85, temp: 40 },
    location: { lat: 37.8038, lon: -122.2708, grid: 'CM87vq', accuracy: 6 },
    emergencyContact: { name: 'Lisa Wong', relation: 'Neighbor', method: 'Node user-007' },
    notes: 'Master builder with 35+ years experience. Can build or fix anything.',
  },
  {
    userId: 'user-007',
    displayName: 'Lisa Wong',
    callsign: 'DOC',
    photoUrl: null,
    age: 42,
    anthro: { heightIn: 63, weightLb: 120 },
    educationLevel: 'Doctorate',
    languages: ['en', 'zh', 'ja'],
    skills: ['Medical.Trauma', 'Medical.Surgery', 'Medical.EMT', 'Medical.FirstAid', 'Medical.CPR'],
    certifications: ['MD', 'ACLS', 'ATLS', 'PALS', 'Board Certified Emergency Medicine'],
    privacy: { showAge: true, showHeightWeight: true, showEducation: true, showMedical: true, showLocation: true },
    stats: { online: true, lastSeen: new Date().toISOString() },
    class: 'Chief Medical Officer',
    availability: 'available',
    profileCompletenessScore: 100,
    createdAt: '2025-04-01T06:00:00Z',
    userStatus: 'GOOD',
    connection: { type: 'WIFI', strength: 92 },
    physical: { hairColor: 'Black', eyeColor: 'Brown', distinguishingFeatures: 'None' },
    medical: { conditions: [], allergies: [], bloodType: 'B-', medications: [] },
    equipment: [
      { name: 'Full Surgical Kit', category: 'Medical' },
      { name: 'Trauma Bag', category: 'Medical' },
      { name: 'Portable Ultrasound', category: 'Medical' },
      { name: 'Handheld Radio: Baofeng UV-5R', category: 'Comms' },
    ],
    device: { model: 'OMEGA Pi 5', cpu: 15, ram: 42, battery: 98, temp: 36 },
    location: { lat: 37.8042, lon: -122.2718, grid: 'CM87vq', accuracy: 3 },
    emergencyContact: { name: 'David Park', relation: 'Friend', method: 'Node user-004' },
    notes: 'Chief Medical Officer. Former ER physician. Can perform field surgery if necessary.',
  },
  {
    userId: 'user-008',
    displayName: 'James Miller',
    callsign: 'RADIO',
    photoUrl: null,
    age: 48,
    anthro: { heightIn: 70, weightLb: 175 },
    educationLevel: 'Bachelors',
    languages: ['en', 'fr'],
    skills: ['Comms.HAM', 'Comms.MorseCode', 'Comms.SignalProcessing', 'Engineering.Electronics'],
    certifications: ['HAM-Amateur Extra', 'GROL'],
    privacy: { showAge: true, showHeightWeight: false, showEducation: true, showMedical: false, showLocation: false },
    stats: { online: false, lastSeen: '2025-12-08T10:00:00Z' },
    class: 'Comms Specialist',
    availability: 'busy',
    profileCompletenessScore: 75,
    createdAt: '2025-06-20T11:00:00Z',
    userStatus: 'OFFLINE',
    connection: { type: 'LORA', strength: 45 },
    physical: { hairColor: 'Brown', eyeColor: 'Hazel', distinguishingFeatures: 'Beard' },
    medical: { conditions: ['Tinnitus'], allergies: ['Sulfa drugs'], bloodType: 'O+', medications: [] },
    equipment: [
      { name: 'HAM Base Station: Icom IC-7300', category: 'Comms' },
      { name: 'Portable HAM: Yaesu FT-891', category: 'Comms' },
      { name: 'SDR: RTL-SDR Kit', category: 'Comms' },
      { name: 'Antenna Kit', category: 'Comms' },
    ],
    device: { model: 'OMEGA Pi 4', cpu: 0, ram: 0, battery: 12, temp: 0 },
    location: { lat: 37.8100, lon: -122.2800, grid: 'CM87vq', accuracy: 15 },
    emergencyContact: { name: 'Marcus Johnson', relation: 'Friend', method: 'Node user-002' },
    notes: 'Master radio operator. Can establish comms in any situation. Currently at backup comms site.',
  },
  {
    userId: 'user-009',
    displayName: 'Maria Santos',
    callsign: 'GARDEN',
    photoUrl: null,
    age: 28,
    anthro: { heightIn: 65, weightLb: 140 },
    educationLevel: 'Bachelors',
    languages: ['en', 'es', 'pt'],
    skills: ['Medical.FirstAid', 'FoodWater.FoodPreservation', 'FoodWater.Farming', 'FoodWater.Gardening'],
    certifications: ['First Aid', 'CPR', 'Master Gardener'],
    privacy: { showAge: true, showHeightWeight: false, showEducation: false, showMedical: false, showLocation: true },
    stats: { online: true, lastSeen: new Date().toISOString() },
    class: null,
    availability: 'available',
    profileCompletenessScore: 65,
    createdAt: '2025-07-15T13:00:00Z',
    userStatus: 'GOOD',
    connection: { type: 'WIFI', strength: 88 },
    physical: { hairColor: 'Black', eyeColor: 'Brown', distinguishingFeatures: 'None' },
    medical: { conditions: [], allergies: [], bloodType: 'A+', medications: [] },
    equipment: [
      { name: 'Garden Tools', category: 'FoodWater' },
      { name: 'Seed Bank', category: 'FoodWater' },
    ],
    device: { model: 'OMEGA Pi 4', cpu: 25, ram: 50, battery: 72, temp: 41 },
    location: { lat: 37.8035, lon: -122.2695, grid: 'CM87vq', accuracy: 10 },
    emergencyContact: { name: 'Elena Rodriguez', relation: 'Friend', method: 'Node user-003' },
    notes: 'Manages community garden. Expert in sustainable agriculture.',
  },
  {
    userId: 'user-010',
    displayName: "Kevin O'Brien",
    callsign: null,
    photoUrl: null,
    age: 24,
    anthro: { heightIn: 72, weightLb: 180 },
    educationLevel: 'SomeCollege',
    languages: ['en'],
    skills: ['Security.SelfDefense'],
    certifications: [],
    privacy: { showAge: true, showHeightWeight: true, showEducation: true, showMedical: true, showLocation: true },
    stats: { online: false, lastSeen: '2025-12-01T12:00:00Z' },
    class: null,
    availability: 'offline',
    profileCompletenessScore: 40,
    createdAt: '2025-09-01T16:00:00Z',
    userStatus: 'NEED_HELP',
    connection: { type: 'OFFLINE', strength: 0 },
    physical: { hairColor: 'Red', eyeColor: 'Green', distinguishingFeatures: 'Freckles' },
    medical: { conditions: ['Asthma'], allergies: ['Peanuts'], bloodType: 'B+', medications: ['Albuterol inhaler'] },
    equipment: [],
    device: { model: 'OMEGA Pi 4', cpu: 0, ram: 0, battery: 0, temp: 0 },
    location: { lat: null, lon: null, grid: null, accuracy: null },
    emergencyContact: { name: 'Marcus Johnson', relation: 'Group Lead', method: 'Node user-002' },
    notes: 'New member. Needs training. Last status was distress signal.',
  },
  {
    userId: 'user-011',
    displayName: 'Jennifer Lee',
    callsign: 'LOGISTICS',
    photoUrl: null,
    age: 39,
    anthro: { heightIn: 66, weightLb: 130 },
    educationLevel: 'Masters',
    languages: ['en', 'ko'],
    skills: ['Logistics.SupplyChain', 'Logistics.Inventory', 'Logistics.Navigation', 'Logistics.Transport'],
    certifications: ['PMP', 'CSCP', 'CDL Class A'],
    privacy: { showAge: true, showHeightWeight: false, showEducation: true, showMedical: true, showLocation: true },
    stats: { online: true, lastSeen: new Date().toISOString() },
    class: 'Supply Chain Manager',
    availability: 'available',
    profileCompletenessScore: 95,
    createdAt: '2025-06-25T10:30:00Z',
    userStatus: 'GOOD',
    connection: { type: 'MESH', strength: 68 },
    physical: { hairColor: 'Black', eyeColor: 'Brown', distinguishingFeatures: 'None' },
    medical: { conditions: [], allergies: [], bloodType: 'O+', medications: [] },
    equipment: [
      { name: 'Cargo Truck', category: 'Transport' },
      { name: 'GPS Navigator', category: 'Navigation' },
      { name: 'Handheld Radio: Baofeng UV-5R', category: 'Comms' },
    ],
    device: { model: 'OMEGA Pi 4', cpu: 30, ram: 55, battery: 82, temp: 39 },
    location: { lat: 37.8060, lon: -122.2740, grid: 'CM87vq', accuracy: 4 },
    emergencyContact: { name: 'David Park', relation: 'Brother', method: 'Node user-004' },
    notes: 'Manages all transport and logistics. Expert route planner.',
  },
  {
    userId: 'user-012',
    displayName: 'Michael Brown',
    callsign: 'HUNTER',
    photoUrl: null,
    age: 44,
    anthro: { heightIn: 71, weightLb: 185 },
    educationLevel: 'HS',
    languages: ['en'],
    skills: ['FoodWater.Hunting', 'FoodWater.Farming', 'FoodWater.WaterPurification', 'Logistics.Navigation'],
    certifications: ['Hunters Safety', 'Fishing License'],
    privacy: { showAge: true, showHeightWeight: true, showEducation: true, showMedical: true, showLocation: true },
    stats: { online: false, lastSeen: '2025-12-08T08:00:00Z' },
    class: 'Forager',
    availability: 'busy',
    profileCompletenessScore: 70,
    createdAt: '2025-08-10T08:00:00Z',
    userStatus: 'OKAY',
    connection: { type: 'LORA', strength: 32 },
    physical: { hairColor: 'Brown', eyeColor: 'Brown', distinguishingFeatures: 'Weathered skin, strong build' },
    medical: { conditions: [], allergies: [], bloodType: 'A+', medications: [] },
    equipment: [
      { name: 'Hunting Rifle: Winchester 30-06', category: 'Security' },
      { name: 'Fishing Gear', category: 'FoodWater' },
      { name: 'Water Purification System', category: 'FoodWater' },
      { name: 'LoRa Messenger', category: 'Comms' },
    ],
    device: { model: 'OMEGA Pi Zero', cpu: 55, ram: 70, battery: 45, temp: 48 },
    location: { lat: 37.8200, lon: -122.3000, grid: 'CM87vq', accuracy: 25 },
    emergencyContact: { name: 'Robert Thompson', relation: 'Friend', method: 'Node user-006' },
    notes: 'Expert hunter and forager. Currently on extended hunting trip.',
  },
  {
    userId: 'user-013',
    displayName: 'Aisha Patel',
    callsign: 'HEALER',
    photoUrl: null,
    age: 33,
    anthro: { heightIn: 62, weightLb: 125 },
    educationLevel: 'Bachelors',
    languages: ['en', 'hi', 'ar'],
    skills: ['Medical.Nursing', 'Medical.FirstAid', 'FoodWater.FoodPreservation'],
    certifications: ['RN', 'BLS', 'Herbal Medicine'],
    privacy: { showAge: false, showHeightWeight: false, showEducation: true, showMedical: false, showLocation: false },
    stats: { online: true, lastSeen: new Date().toISOString() },
    class: 'Medic',
    availability: 'available',
    profileCompletenessScore: 80,
    createdAt: '2025-07-20T09:00:00Z',
    userStatus: 'GOOD',
    connection: { type: 'WIFI', strength: 85 },
    physical: { hairColor: 'Black', eyeColor: 'Brown', distinguishingFeatures: 'None' },
    medical: { conditions: [], allergies: [], bloodType: 'AB+', medications: [] },
    equipment: [
      { name: 'Medical Kit', category: 'Medical' },
      { name: 'Herbal Medicine Kit', category: 'Medical' },
      { name: 'Handheld Radio: Baofeng UV-5R', category: 'Comms' },
    ],
    device: { model: 'OMEGA Pi 4', cpu: 20, ram: 45, battery: 90, temp: 37 },
    location: { lat: 37.8040, lon: -122.2710, grid: 'CM87vq', accuracy: 5 },
    emergencyContact: { name: 'Lisa Wong', relation: 'Supervisor', method: 'Node user-007' },
    notes: 'Nursing assistant with herbal medicine knowledge. Excellent patient care.',
  },
  {
    userId: 'user-014',
    displayName: 'Tom Nguyen',
    callsign: 'SOLAR',
    photoUrl: null,
    age: 36,
    anthro: { heightIn: 67, weightLb: 155 },
    educationLevel: 'Bachelors',
    languages: ['en', 'vi'],
    skills: ['Engineering.SolarSystems', 'Engineering.Electrical', 'Engineering.Electronics'],
    certifications: ['Solar PV Installer', 'Electrician Journeyman'],
    privacy: { showAge: true, showHeightWeight: true, showEducation: true, showMedical: true, showLocation: true },
    stats: { online: true, lastSeen: new Date().toISOString() },
    class: 'Solar Tech',
    availability: 'available',
    profileCompletenessScore: 85,
    createdAt: '2025-08-15T11:00:00Z',
    userStatus: 'GOOD',
    connection: { type: 'WIFI', strength: 91 },
    physical: { hairColor: 'Black', eyeColor: 'Brown', distinguishingFeatures: 'None' },
    medical: { conditions: [], allergies: [], bloodType: 'O-', medications: [] },
    equipment: [
      { name: 'Solar Panel Kit: 600W', category: 'Power' },
      { name: 'Battery Bank: 200Ah', category: 'Power' },
      { name: 'Electrical Tools', category: 'Engineering' },
      { name: 'Handheld Radio: Baofeng UV-5R', category: 'Comms' },
    ],
    device: { model: 'OMEGA Pi 4', cpu: 22, ram: 48, battery: 100, temp: 38 },
    location: { lat: 37.8045, lon: -122.2720, grid: 'CM87vq', accuracy: 3 },
    emergencyContact: { name: 'David Park', relation: 'Colleague', method: 'Node user-004' },
    notes: 'Solar power specialist. Manages all renewable energy systems.',
  },
  {
    userId: 'user-015',
    displayName: 'Rosa Martinez',
    callsign: 'MAMA ROSA',
    photoUrl: null,
    age: 55,
    anthro: { heightIn: 60, weightLb: 150 },
    educationLevel: 'Trade',
    languages: ['en', 'es', 'tl'],
    skills: ['FoodWater.Farming', 'FoodWater.Gardening', 'FoodWater.FoodPreservation', 'FoodWater.Foraging'],
    certifications: ['Master Gardener', 'Food Preservation Specialist'],
    privacy: { showAge: true, showHeightWeight: false, showEducation: true, showMedical: true, showLocation: true },
    stats: { online: false, lastSeen: '2025-12-07T18:00:00Z' },
    class: 'Agriculture Lead',
    availability: 'away',
    profileCompletenessScore: 90,
    createdAt: '2025-05-01T07:00:00Z',
    userStatus: 'OKAY',
    connection: { type: 'CELLULAR', strength: 55 },
    physical: { hairColor: 'Gray', eyeColor: 'Brown', distinguishingFeatures: 'Warm smile' },
    medical: { conditions: ['High blood pressure (controlled)'], allergies: [], bloodType: 'A+', medications: ['Amlodipine'] },
    equipment: [
      { name: 'Seed Library', category: 'FoodWater' },
      { name: 'Canning Supplies', category: 'FoodWater' },
      { name: 'Satellite Phone', category: 'Comms' },
    ],
    device: { model: 'OMEGA Pi 4', cpu: 35, ram: 58, battery: 65, temp: 43 },
    location: { lat: 37.7950, lon: -122.2650, grid: 'CM87vq', accuracy: 50 },
    emergencyContact: { name: 'Elena Rodriguez', relation: 'Niece', method: 'Node user-003' },
    notes: 'Master gardener and food preservation expert. Currently visiting off-site greenhouse.',
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

// ============================================================
// OFFICIAL TEAMS - Emergency Response Teams
// ============================================================

export const OFFICIAL_TEAMS = [
  {
    id: 'team-medical',
    name: 'Medical Response Team',
    icon: 'Stethoscope',
    color: 'rose',
    description: 'First responders for medical emergencies',
    lead: 'user-007', // Lisa Wong
    members: ['user-007', 'user-001', 'user-013'],
    domain: 'Medical',
    isActive: true,
  },
  {
    id: 'team-security',
    name: 'Security & Perimeter',
    icon: 'Shield',
    color: 'amber',
    description: 'Perimeter defense and security operations',
    lead: 'user-002', // Marcus Johnson
    members: ['user-002', 'user-005'],
    domain: 'Security',
    isActive: true,
  },
  {
    id: 'team-comms',
    name: 'Communications Team',
    icon: 'Radio',
    color: 'cyan',
    description: 'HAM radio, mesh network, and comms operations',
    lead: 'user-008', // James Miller
    members: ['user-008', 'user-002', 'user-004'],
    domain: 'Comms',
    isActive: true,
  },
  {
    id: 'team-engineering',
    name: 'Engineering & Power',
    icon: 'Wrench',
    color: 'orange',
    description: 'Infrastructure, electrical, and solar systems',
    lead: 'user-004', // David Park
    members: ['user-004', 'user-006', 'user-014'],
    domain: 'Engineering',
    isActive: true,
  },
  {
    id: 'team-supply',
    name: 'Supply & Logistics',
    icon: 'Compass',
    color: 'violet',
    description: 'Supply runs, inventory, and resource management',
    lead: 'user-011', // Jennifer Lee
    members: ['user-011', 'user-003', 'user-012'],
    domain: 'Logistics',
    isActive: true,
  },
  {
    id: 'team-nature',
    name: 'Nature & Foraging',
    icon: 'Utensils',
    color: 'emerald',
    description: 'Gardening, foraging, hunting, and food safety',
    lead: 'user-015', // Rosa Martinez
    members: ['user-015', 'user-009', 'user-012'],
    domain: 'FoodWater',
    isActive: true,
  },
];

// ============================================================
// TEAM BULLETINS - Official Team Updates
// ============================================================

export const BULLETIN_SEVERITY = {
  critical: { label: 'CRITICAL', color: 'destructive', bg: 'bg-destructive/20', icon: 'AlertTriangle' },
  warning: { label: 'WARNING', color: 'warning', bg: 'bg-warning/20', icon: 'AlertCircle' },
  info: { label: 'INFO', color: 'primary', bg: 'bg-primary/20', icon: 'Info' },
  success: { label: 'RESOLVED', color: 'success', bg: 'bg-success/20', icon: 'CheckCircle' },
};

export const generateTeamBulletins = () => [
  {
    id: 'bulletin-001',
    teamId: 'team-nature',
    title: 'Poison Oak Spotted - North Trail',
    content: 'Found poison oak patches along the north trail near marker 7. I\'ve flagged the area with orange tape. AVOID CONTACT. If exposed, wash immediately with cold water and soap. See attached photos for identification.',
    severity: 'warning',
    author: 'user-015', // Rosa Martinez
    createdAt: '2026-01-13T08:30:00Z',
    updatedAt: '2026-01-13T08:30:00Z',
    attachments: [
      { type: 'image', name: 'poison_oak_1.jpg', url: '/images/placeholder.jpg' },
      { type: 'image', name: 'poison_oak_2.jpg', url: '/images/placeholder.jpg' },
    ],
    tags: ['hazard', 'plants', 'north-trail'],
    readBy: ['user-001', 'user-002', 'user-004'],
    isNew: true,
    isPinned: true,
  },
  {
    id: 'bulletin-002',
    teamId: 'team-medical',
    title: 'Flu Season Advisory - Hygiene Protocols',
    content: 'We\'re seeing increased cold symptoms in the community. Please follow enhanced hygiene protocols: wash hands frequently, cover coughs, and report any fever above 100°F to medical immediately. We have limited Tylenol supplies.',
    severity: 'info',
    author: 'user-007', // Lisa Wong
    createdAt: '2026-01-12T14:00:00Z',
    updatedAt: '2026-01-12T14:00:00Z',
    attachments: [],
    tags: ['health', 'hygiene', 'flu'],
    readBy: ['user-001', 'user-002', 'user-003', 'user-004', 'user-005'],
    isNew: true,
    isPinned: true,
  },
  {
    id: 'bulletin-003',
    teamId: 'team-security',
    title: 'Perimeter Check Schedule Change',
    content: 'Effective immediately, perimeter checks will run every 4 hours instead of 6 hours due to recent wildlife activity. Night shift volunteers needed - contact Marcus if available.',
    severity: 'info',
    author: 'user-002', // Marcus Johnson
    createdAt: '2026-01-12T09:00:00Z',
    updatedAt: '2026-01-12T09:00:00Z',
    attachments: [],
    tags: ['schedule', 'perimeter', 'volunteers'],
    readBy: ['user-001', 'user-004', 'user-005', 'user-006', 'user-007'],
    isNew: false,
    isPinned: false,
  },
  {
    id: 'bulletin-004',
    teamId: 'team-engineering',
    title: 'Solar Panel Maintenance Complete',
    content: 'Completed maintenance on all 6 solar panels. Panel #3 had dirt buildup reducing efficiency by 15%. All panels now operating at full capacity. Next maintenance scheduled for Jan 20.',
    severity: 'success',
    author: 'user-014', // Tom Nguyen
    createdAt: '2026-01-11T16:30:00Z',
    updatedAt: '2026-01-11T16:30:00Z',
    attachments: [
      { type: 'document', name: 'maintenance_report.pdf', url: '/docs/placeholder.pdf' },
    ],
    tags: ['solar', 'maintenance', 'power'],
    readBy: ['user-001', 'user-002', 'user-003', 'user-004', 'user-005', 'user-006', 'user-007'],
    isNew: false,
    isPinned: false,
  },
  {
    id: 'bulletin-005',
    teamId: 'team-supply',
    title: 'Supply Run Results - Jan 10',
    content: 'Successful supply run to the cache at Grid CM87wq. Retrieved: 20 gallons water, 30 MREs, 2 propane tanks, batteries (AA x48, D x12). Inventory updated. Next run scheduled for Jan 15.',
    severity: 'info',
    author: 'user-011', // Jennifer Lee
    createdAt: '2026-01-10T18:00:00Z',
    updatedAt: '2026-01-10T18:00:00Z',
    attachments: [
      { type: 'document', name: 'inventory_update.xlsx', url: '/docs/placeholder.xlsx' },
    ],
    tags: ['supply-run', 'inventory', 'cache'],
    readBy: ['user-001', 'user-002', 'user-003', 'user-004', 'user-005', 'user-006', 'user-007', 'user-011'],
    isNew: false,
    isPinned: false,
  },
  {
    id: 'bulletin-006',
    teamId: 'team-comms',
    title: 'HAM Repeater Down - Emergency Frequencies Active',
    content: 'The main HAM repeater at hilltop is experiencing issues. Use backup frequency 146.520 MHz for emergency comms. Repair team dispatched - ETA 4 hours. Mesh network remains operational.',
    severity: 'critical',
    author: 'user-008', // James Miller
    createdAt: '2026-01-13T06:00:00Z',
    updatedAt: '2026-01-13T10:00:00Z',
    attachments: [],
    tags: ['ham', 'emergency', 'comms-down'],
    readBy: ['user-001', 'user-002', 'user-004'],
    isNew: true,
    isPinned: true,
  },
  {
    id: 'bulletin-007',
    teamId: 'team-nature',
    title: 'Berry Season Starting - Safe Foraging Guide',
    content: 'Blackberries and wild raspberries are starting to ripen in the southeast meadow. Remember: only harvest berries from MARKED SAFE ZONES. If unsure, bring a sample to Rosa or Maria for identification.',
    severity: 'info',
    author: 'user-009', // Maria Santos
    createdAt: '2026-01-09T11:00:00Z',
    updatedAt: '2026-01-09T11:00:00Z',
    attachments: [
      { type: 'image', name: 'safe_berries_guide.jpg', url: '/images/placeholder.jpg' },
    ],
    tags: ['foraging', 'berries', 'food'],
    readBy: ['user-001', 'user-003', 'user-009', 'user-011', 'user-015'],
    isNew: false,
    isPinned: false,
  },
];

// ============================================================
// ACTIVITY LOGS - Track member activities
// ============================================================

export const ACTIVITY_TYPES = {
  SUPPLY_RUN: { label: 'Supply Run', icon: 'Truck', color: 'violet' },
  PERIMETER_CHECK: { label: 'Perimeter Check', icon: 'Shield', color: 'amber' },
  MEDICAL_ASSIST: { label: 'Medical Assist', icon: 'Stethoscope', color: 'rose' },
  COMMS_CHECK: { label: 'Comms Check', icon: 'Radio', color: 'cyan' },
  MAINTENANCE: { label: 'Maintenance', icon: 'Wrench', color: 'orange' },
  GARDEN_WORK: { label: 'Garden Work', icon: 'Utensils', color: 'emerald' },
  TRAINING: { label: 'Training', icon: 'GraduationCap', color: 'primary' },
  MEETING: { label: 'Meeting', icon: 'Users', color: 'blue' },
};

export const generateActivityLogs = () => ({
  'user-001': [
    { id: 'act-001', type: 'MEDICAL_ASSIST', description: 'Treated minor cut for Kevin', timestamp: '2026-01-12T14:30:00Z' },
    { id: 'act-002', type: 'TRAINING', description: 'CPR refresher course', timestamp: '2026-01-10T09:00:00Z' },
  ],
  'user-002': [
    { id: 'act-003', type: 'PERIMETER_CHECK', description: 'Night shift patrol', timestamp: '2026-01-13T02:00:00Z' },
    { id: 'act-004', type: 'COMMS_CHECK', description: 'HAM radio check-in', timestamp: '2026-01-12T08:00:00Z' },
    { id: 'act-005', type: 'MEETING', description: 'Security team briefing', timestamp: '2026-01-11T16:00:00Z' },
  ],
  'user-003': [
    { id: 'act-006', type: 'SUPPLY_RUN', description: 'Cache retrieval at Grid CM87wq', timestamp: '2026-01-10T10:00:00Z' },
  ],
  'user-004': [
    { id: 'act-007', type: 'MAINTENANCE', description: 'Fixed mesh node #3', timestamp: '2026-01-12T11:00:00Z' },
    { id: 'act-008', type: 'TRAINING', description: 'Solar panel workshop', timestamp: '2026-01-09T14:00:00Z' },
  ],
  'user-011': [
    { id: 'act-009', type: 'SUPPLY_RUN', description: 'Led supply run to cache', timestamp: '2026-01-10T08:00:00Z' },
    { id: 'act-010', type: 'SUPPLY_RUN', description: 'Inventory audit', timestamp: '2026-01-08T09:00:00Z' },
  ],
  'user-015': [
    { id: 'act-011', type: 'GARDEN_WORK', description: 'Harvested winter greens', timestamp: '2026-01-12T10:00:00Z' },
    { id: 'act-012', type: 'TRAINING', description: 'Foraging identification class', timestamp: '2026-01-11T13:00:00Z' },
  ],
});
