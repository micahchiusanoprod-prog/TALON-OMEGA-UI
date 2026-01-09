import React, { useState, useMemo, useCallback, createContext, useContext, useEffect } from 'react';
import {
  X,
  Users,
  BarChart3,
  MessageSquare,
  FileText,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Eye,
  EyeOff,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  Calendar,
  MapPin,
  Heart,
  Star,
  Award,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Search,
  Filter,
  MoreVertical,
  Pin,
  Trash2,
  Plus,
  Edit,
  Info,
  HelpCircle,
  User,
  Home,
  Briefcase,
  GraduationCap,
  Languages,
  Activity,
  Stethoscope,
  Wrench,
  Radio,
  Utensils,
  Car,
  Cpu,
  Tent,
  Target,
  TrendingUp,
  TrendingDown,
  AlertCircle,
  Globe,
  UserCheck,
  Ban,
  Lock,
  Unlock,
  Download,
  RefreshCw,
  Zap,
  Compass,
  Megaphone,
  ListChecks,
  BarChart2,
  PieChart,
  History,
  Lightbulb,
  UserPlus,
  Settings,
  Send,
  Vote,
  ClipboardList,
  Bell,
  ArrowLeft,
  Copy,
  CheckCheck
} from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { toast } from 'sonner';

// ============================================================
// PHASE 0: RBAC GUARD COMPONENT
// ============================================================

// Role hierarchy for comparison
const ROLE_HIERARCHY = { guest: 0, member: 1, admin: 2 };

// RequireRole Guard Component - Wraps content that requires minimum role
const RequireRole = ({ minRole, children, onAccessDenied, fallback }) => {
  const { currentUser, isAdmin, isMember } = useRBAC();
  const userRoleLevel = ROLE_HIERARCHY[currentUser?.role] || 0;
  const requiredLevel = ROLE_HIERARCHY[minRole] || 0;
  
  const hasAccess = userRoleLevel >= requiredLevel;
  
  useEffect(() => {
    if (!hasAccess && onAccessDenied) {
      onAccessDenied();
    }
  }, [hasAccess, onAccessDenied]);
  
  if (!hasAccess) {
    if (fallback) return fallback;
    return (
      <AccessDeniedCard 
        minRole={minRole} 
        currentRole={currentUser?.role} 
      />
    );
  }
  
  return children;
};

// Access Denied Card with return button
const AccessDeniedCard = ({ minRole, currentRole, onReturn }) => (
  <div className="flex flex-col items-center justify-center py-16 glass rounded-xl" data-testid="access-denied">
    <ShieldAlert className="w-16 h-16 text-destructive/50 mb-4" />
    <h3 className="text-lg font-semibold mb-2">Access Denied</h3>
    <p className="text-sm text-muted-foreground text-center max-w-md mb-4">
      This section requires <span className="font-semibold text-amber-400">{minRole}</span> role or higher.
      <br />
      Your current role: <span className="font-semibold">{currentRole || 'guest'}</span>
    </p>
    {onReturn && (
      <Button onClick={onReturn} variant="outline" size="sm" className="gap-2">
        <ArrowLeft className="w-4 h-4" />
        Return to Overview
      </Button>
    )}
  </div>
);

// ============================================================
// PHASE 0: RBAC + PRIVACY + DATA CONTRACTS
// ============================================================

// Role Definitions with Permissions
const ROLES = {
  guest: {
    id: 'guest',
    name: 'Guest',
    color: 'text-muted-foreground',
    bg: 'bg-muted/20',
    permissions: {
      viewOverview: true,
      viewAnalytics: false, // Limited aggregated only
      viewDirectory: true,  // No drill-down
      viewComms: false,
      viewIncidents: false,
      viewSensitiveFields: false,
      viewDetailedProfiles: false,
      createIncident: false,
      editIncident: false,
      resolveIncident: false,
      manageScoring: false,
      postAnnouncement: false,
      createPoll: true,
      createTask: false,
      downloadReports: false,
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
      viewSensitiveFields: false, // Only with opt-in
      viewDetailedProfiles: true,
      createIncident: false, // Can report to admin
      editIncident: false,
      resolveIncident: false,
      manageScoring: false,
      postAnnouncement: false,
      createPoll: true,
      createTask: true,
      downloadReports: true, // Redacted version
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
      viewDetailedProfiles: true,
      createIncident: true,
      editIncident: true,
      resolveIncident: true,
      manageScoring: true,
      postAnnouncement: true,
      createPoll: true,
      createTask: true,
      downloadReports: true, // Full version
    }
  }
};

// RBAC Context
const RBACContext = createContext(null);

export const useRBAC = () => {
  const context = useContext(RBACContext);
  if (!context) throw new Error('useRBAC must be used within RBACProvider');
  return context;
};

const RBACProvider = ({ children, currentUser }) => {
  const role = ROLES[currentUser?.role] || ROLES.guest;
  
  const can = useCallback((permission) => {
    return role.permissions[permission] === true;
  }, [role]);
  
  const isAdmin = currentUser?.role === 'admin';
  const isMember = currentUser?.role === 'member' || isAdmin;
  const isGuest = currentUser?.role === 'guest';
  
  return (
    <RBACContext.Provider value={{ currentUser, role, can, isAdmin, isMember, isGuest }}>
      {children}
    </RBACContext.Provider>
  );
};

// ============================================================
// PHASE 0: PRIVACY REDACTION SYSTEM
// ============================================================

/**
 * Privacy Redaction Helper
 * Redacts sensitive profile fields based on viewer role and opt-in settings
 * 
 * Rules:
 * - Admin: Always sees full profile (all fields)
 * - Member/Guest: Only sees fields where privacy opt-in is TRUE
 * - When hidden: Returns null (UI renders as "Hidden")
 * 
 * @param {Object} profile - The profile object to redact
 * @param {string} viewerRole - 'guest' | 'member' | 'admin'
 * @returns {Object} - Redacted profile with nulls for hidden fields
 */
const redactProfile = (profile, viewerRole) => {
  if (!profile) return null;
  
  // Admin sees everything
  if (viewerRole === 'admin') {
    return { ...profile, _redacted: false };
  }
  
  // Get privacy settings with defaults
  const privacy = profile.privacySettings || {
    showAge: false,
    showHeight: false,
    showWeight: false,
    showMedical: false,
    showEducation: true, // Default public
  };
  
  // Create redacted copy
  const redacted = {
    ...profile,
    _redacted: true,
    // Redact based on opt-in flags
    age: privacy.showAge ? profile.age : null,
    heightIn: privacy.showHeight ? profile.heightIn : null,
    weightLb: privacy.showWeight ? profile.weightLb : null,
    // Education is usually public unless explicitly hidden
    educationLevel: privacy.showEducation !== false ? profile.educationLevel : null,
    // Always hide admin-only fields from non-admins
    adminNotes: null,
    notes: null,
  };
  
  return redacted;
};

/**
 * Helper to check if a specific field is visible
 */
const isFieldVisible = (profile, fieldName, viewerRole) => {
  if (viewerRole === 'admin') return true;
  
  const privacy = profile?.privacySettings || {};
  const fieldToOptIn = {
    age: 'showAge',
    heightIn: 'showHeight',
    weightLb: 'showWeight',
    educationLevel: 'showEducation',
  };
  
  const optInKey = fieldToOptIn[fieldName];
  return optInKey ? privacy[optInKey] === true : true;
};

/**
 * Format height from inches to readable string
 */
const formatHeight = (inches) => {
  if (!inches) return null;
  const feet = Math.floor(inches / 12);
  const remainingInches = inches % 12;
  return `${feet}'${remainingInches}"`;
};

/**
 * Format weight in lbs
 */
const formatWeight = (lbs) => {
  if (!lbs) return null;
  return `${lbs} lbs`;
};

// ============================================================
// DATA CONTRACTS (Matching Future API)
// ============================================================

// Profile Schema
const PROFILE_SCHEMA = {
  id: 'string',
  displayName: 'string',
  profilePhotoUrl: 'string|null',
  age: 'number|null',
  heightIn: 'number|null', // Height in inches
  weightLb: 'number|null', // Weight in pounds
  educationLevel: 'enum:None|HS|SomeCollege|Bachelors|Masters|Doctorate|Trade|Other',
  languages: 'string[]',
  skillSets: 'string[]',
  certifications: 'string[]|null',
  availabilityStatus: 'enum:available|busy|away|offline',
  roleClass: 'string|null', // e.g., "Medic", "Security Lead"
  notes: 'string|null', // Private to admin
  adminNotes: 'string|null', // Admin-only field
  privacySettings: {
    showAge: 'boolean',
    showHeight: 'boolean',
    showWeight: 'boolean',
    showMedical: 'boolean',
  },
  createdAt: 'ISO8601',
  updatedAt: 'ISO8601',
};

// Incident Schema
const INCIDENT_SCHEMA = {
  id: 'string',
  userId: 'string',
  type: 'enum:GOOD|BAD',
  category: 'enum:safety|conduct|contribution|leadership|teamwork|violation|other',
  severity: 'number:1-5',
  points: 'number', // Signed integer
  summary: 'string',
  details: 'string|null',
  evidenceLinks: 'string[]|null',
  status: 'enum:Open|Closed|UnderReview|Appealed',
  resolutionNotes: 'string|null',
  tags: 'string[]',
  createdAt: 'ISO8601',
  createdByAdminId: 'string',
  updatedAt: 'ISO8601',
  updatedByAdminId: 'string|null',
  requiresTwoAdminApproval: 'boolean',
  approvals: [{ adminId: 'string', approvedAt: 'ISO8601' }],
  appealStatus: 'enum:None|Open|Reviewed|Closed',
  appealNotes: 'string|null',
};

// Audit Log Schema
const AUDIT_SCHEMA = {
  id: 'string',
  entityType: 'enum:incident|profile|scoring',
  entityId: 'string',
  action: 'enum:create|update|delete|approve|reject|appeal',
  changes: 'object', // { field: { old, new } }
  performedBy: 'string', // Admin ID
  performedAt: 'ISO8601',
  ipAddress: 'string|null',
  notes: 'string|null',
};

// Score Config Schema
const SCORE_CONFIG_SCHEMA = {
  baseScore: 'number:100',
  goodIncidentPoints: { 1: 1, 2: 2, 3: 4, 4: 7, 5: 10 },
  badIncidentPoints: { 1: -5, 2: -10, 3: -15, 4: -20, 5: -25 },
  decayHalfLifeDays: 90,
  thresholds: {
    monitor: 70,
    restricted: 50,
    intervention: 30,
  },
  requireTwoAdminForSeverity5: true,
};

// Analytics Summary Schema (Pre-aggregated)
const ANALYTICS_SUMMARY_SCHEMA = {
  totalMembers: 'number',
  onlineCount: 'number',
  offlineCount: 'number',
  newMembersThisWeek: 'number',
  announcementsCount: 'number',
  openIncidentsCount: 'number', // Admin only
  recentCommsActivity: 'number',
  skillsCoverage: { skillName: 'count' },
  skillGaps: [{ skill: 'string', count: 'number', priority: 'P0|P1|P2' }],
  languagesCoverage: { language: 'count' },
  educationBreakdown: { level: 'count' },
  ageDistribution: { range: 'count' },
  redundancyIndex: { criticalSkill: 'memberCount' },
  recommendations: [{ priority: 'P0|P1|P2', message: 'string', action: 'string' }],
  lastUpdated: 'ISO8601',
};

// ============================================================
// MOCK DATA GENERATION
// ============================================================

const SKILL_SETS = [
  'Medical', 'FirstAid', 'CPR', 'Trauma', 'Nursing', 'EMT',
  'Comms', 'HAM', 'MorseCode', 'SignalProcessing',
  'Security', 'Firearms', 'SelfDefense', 'Perimeter',
  'Logistics', 'SupplyChain', 'Inventory', 'Navigation',
  'Engineering', 'Electrical', 'Plumbing', 'Carpentry', 'Welding',
  'Farming', 'Gardening', 'FoodPreservation', 'WaterPurification', 'Hunting',
  'Tech', 'Programming', 'Networking', 'SolarSystems', 'Electronics',
];

const EDUCATION_LEVELS = ['None', 'HS', 'SomeCollege', 'Bachelors', 'Masters', 'Doctorate', 'Trade', 'Other'];

const INCIDENT_CATEGORIES = ['safety', 'conduct', 'contribution', 'leadership', 'teamwork', 'violation', 'other'];

const generateMockProfiles = () => [
  {
    id: 'user-001',
    displayName: 'Sarah Chen',
    profilePhotoUrl: null,
    age: 38,
    heightIn: 66,
    weightLb: 140,
    educationLevel: 'Bachelors',
    languages: ['English', 'Mandarin'],
    skillSets: ['Medical', 'FirstAid', 'CPR', 'Trauma', 'Nursing'],
    certifications: ['RN', 'BLS', 'ACLS'],
    availabilityStatus: 'available',
    roleClass: 'Lead Medic',
    notes: null,
    adminNotes: 'Reliable, natural leader',
    privacySettings: { showAge: true, showHeight: true, showWeight: true, showMedical: false },
    createdAt: '2025-06-15T10:00:00Z',
    updatedAt: '2025-12-01T14:30:00Z',
  },
  {
    id: 'user-002',
    displayName: 'Marcus Johnson',
    profilePhotoUrl: null,
    age: 52,
    heightIn: 73,
    weightLb: 195,
    educationLevel: 'Trade',
    languages: ['English', 'Spanish'],
    skillSets: ['Security', 'Firearms', 'Comms', 'HAM', 'SelfDefense'],
    certifications: ['HAM-Extra', 'CPL'],
    availabilityStatus: 'available',
    roleClass: 'Security Lead',
    notes: null,
    adminNotes: 'Former military, 20 years',
    privacySettings: { showAge: true, showHeight: true, showWeight: true, showMedical: true },
    createdAt: '2025-05-20T08:00:00Z',
    updatedAt: '2025-11-28T09:15:00Z',
  },
  {
    id: 'user-003',
    displayName: 'Elena Rodriguez',
    profilePhotoUrl: null,
    age: 31,
    heightIn: 64,
    weightLb: 135,
    educationLevel: 'SomeCollege',
    languages: ['English', 'Spanish', 'Portuguese'],
    skillSets: ['Logistics', 'SupplyChain', 'Inventory', 'FoodPreservation', 'Farming'],
    certifications: ['ServSafe'],
    availabilityStatus: 'busy',
    roleClass: 'Logistics Coordinator',
    notes: 'Has two young children',
    adminNotes: null,
    privacySettings: { showAge: true, showHeight: false, showWeight: false, showMedical: false },
    createdAt: '2025-07-01T12:00:00Z',
    updatedAt: '2025-12-05T16:45:00Z',
  },
  {
    id: 'user-004',
    displayName: 'David Park',
    profilePhotoUrl: null,
    age: 29,
    heightIn: 69,
    weightLb: 165,
    educationLevel: 'Masters',
    languages: ['English', 'Korean'],
    skillSets: ['Tech', 'Programming', 'Networking', 'SolarSystems', 'Electronics', 'Engineering'],
    certifications: ['CCNA', 'AWS-SA'],
    availabilityStatus: 'available',
    roleClass: 'Tech Lead',
    notes: null,
    adminNotes: 'Built the mesh network',
    privacySettings: { showAge: true, showHeight: true, showWeight: true, showMedical: true },
    createdAt: '2025-06-10T09:30:00Z',
    updatedAt: '2025-12-08T11:00:00Z',
  },
  {
    id: 'user-005',
    displayName: 'Amanda Foster',
    profilePhotoUrl: null,
    age: 34,
    heightIn: 68,
    weightLb: 145,
    educationLevel: 'Bachelors',
    languages: ['English'],
    skillSets: ['Security', 'Navigation', 'Hunting', 'Farming', 'SelfDefense'],
    certifications: ['Wilderness First Responder'],
    availabilityStatus: 'away',
    roleClass: 'Scout',
    notes: null,
    adminNotes: 'Former park ranger',
    privacySettings: { showAge: true, showHeight: true, showWeight: false, showMedical: false },
    createdAt: '2025-08-05T14:00:00Z',
    updatedAt: '2025-11-20T08:30:00Z',
  },
  {
    id: 'user-006',
    displayName: 'Robert Thompson',
    profilePhotoUrl: null,
    age: 61,
    heightIn: 71,
    weightLb: 200,
    educationLevel: 'Trade',
    languages: ['English', 'German'],
    skillSets: ['Engineering', 'Carpentry', 'Plumbing', 'Electrical', 'Welding'],
    certifications: ['Master Electrician'],
    availabilityStatus: 'available',
    roleClass: 'Builder',
    notes: 'Heart condition',
    adminNotes: 'Monitor physical tasks',
    privacySettings: { showAge: true, showHeight: true, showWeight: true, showMedical: false },
    createdAt: '2025-05-15T07:00:00Z',
    updatedAt: '2025-12-02T10:20:00Z',
  },
  {
    id: 'user-007',
    displayName: 'Lisa Wong',
    profilePhotoUrl: null,
    age: 42,
    heightIn: 63,
    weightLb: 120,
    educationLevel: 'Doctorate',
    languages: ['English', 'Mandarin', 'Japanese'],
    skillSets: ['Medical', 'Trauma', 'Nursing', 'FirstAid', 'EMT'],
    certifications: ['MD', 'ACLS', 'ATLS', 'PALS'],
    availabilityStatus: 'available',
    roleClass: 'Chief Medical Officer',
    notes: null,
    adminNotes: 'ER physician, critical asset',
    privacySettings: { showAge: true, showHeight: true, showWeight: true, showMedical: true },
    createdAt: '2025-04-01T06:00:00Z',
    updatedAt: '2025-12-09T07:45:00Z',
  },
  {
    id: 'user-008',
    displayName: 'James Miller',
    profilePhotoUrl: null,
    age: 48,
    heightIn: 70,
    weightLb: 175,
    educationLevel: 'Bachelors',
    languages: ['English', 'French'],
    skillSets: ['Comms', 'HAM', 'MorseCode', 'SignalProcessing', 'Electronics'],
    certifications: ['HAM-Amateur Extra'],
    availabilityStatus: 'busy',
    roleClass: 'Comms Specialist',
    notes: null,
    adminNotes: 'Manages radio network',
    privacySettings: { showAge: true, showHeight: false, showWeight: false, showMedical: false },
    createdAt: '2025-06-20T11:00:00Z',
    updatedAt: '2025-11-25T15:30:00Z',
  },
  {
    id: 'user-009',
    displayName: 'Maria Santos',
    profilePhotoUrl: null,
    age: 28,
    heightIn: 65,
    weightLb: 140,
    educationLevel: 'Bachelors',
    languages: ['English', 'Spanish'],
    skillSets: ['FirstAid', 'FoodPreservation', 'Farming', 'Gardening'],
    certifications: ['First Aid', 'CPR'],
    availabilityStatus: 'available',
    roleClass: null,
    notes: 'Two children (7, 4)',
    adminNotes: null,
    privacySettings: { showAge: true, showHeight: false, showWeight: false, showMedical: false },
    createdAt: '2025-07-15T13:00:00Z',
    updatedAt: '2025-12-07T09:00:00Z',
  },
  {
    id: 'user-010',
    displayName: 'Kevin OBrien',
    profilePhotoUrl: null,
    age: 24,
    heightIn: 72,
    weightLb: 180,
    educationLevel: 'SomeCollege',
    languages: ['English'],
    skillSets: ['Security', 'SelfDefense'],
    certifications: [],
    availabilityStatus: 'offline',
    roleClass: null,
    notes: null,
    adminNotes: 'Under monitoring - 2 incidents',
    privacySettings: { showAge: true, showHeight: true, showWeight: true, showMedical: true },
    createdAt: '2025-09-01T16:00:00Z',
    updatedAt: '2025-12-01T12:00:00Z',
  },
  {
    id: 'user-011',
    displayName: 'Jennifer Lee',
    profilePhotoUrl: null,
    age: 39,
    heightIn: 66,
    weightLb: 130,
    educationLevel: 'Masters',
    languages: ['English', 'Korean'],
    skillSets: ['Logistics', 'SupplyChain', 'Inventory', 'Navigation'],
    certifications: ['PMP', 'CSCP'],
    availabilityStatus: 'available',
    roleClass: 'Supply Chain Manager',
    notes: null,
    adminNotes: null,
    privacySettings: { showAge: true, showHeight: false, showWeight: false, showMedical: false },
    createdAt: '2025-06-25T10:30:00Z',
    updatedAt: '2025-11-30T14:00:00Z',
  },
  {
    id: 'user-012',
    displayName: 'Michael Brown',
    profilePhotoUrl: null,
    age: 44,
    heightIn: 71,
    weightLb: 185,
    educationLevel: 'HS',
    languages: ['English'],
    skillSets: ['Hunting', 'Farming', 'WaterPurification', 'Navigation'],
    certifications: ['Hunters Safety'],
    availabilityStatus: 'busy',
    roleClass: 'Forager',
    notes: 'Son (12) learning skills',
    adminNotes: null,
    privacySettings: { showAge: true, showHeight: true, showWeight: true, showMedical: true },
    createdAt: '2025-08-10T08:00:00Z',
    updatedAt: '2025-12-04T11:30:00Z',
  },
];

const generateMockIncidents = () => [
  {
    id: 'INC-2025-001',
    userId: 'user-010',
    type: 'BAD',
    category: 'violation',
    severity: 3,
    points: -15,
    summary: 'Unauthorized entry to restricted storage area',
    details: 'Entered Building B storage without clearance. No items taken but protocol violated.',
    evidenceLinks: ['cam-footage-001.mp4'],
    status: 'Closed',
    resolutionNotes: 'First offense. Verbal warning issued. User acknowledged.',
    tags: ['security', 'protocol'],
    createdAt: '2025-10-15T14:30:00Z',
    createdByAdminId: 'user-002',
    updatedAt: '2025-10-16T09:00:00Z',
    updatedByAdminId: 'user-007',
    requiresTwoAdminApproval: false,
    approvals: [{ adminId: 'user-007', approvedAt: '2025-10-16T09:00:00Z' }],
    appealStatus: 'None',
    appealNotes: null,
  },
  {
    id: 'INC-2025-002',
    userId: 'user-006',
    type: 'BAD',
    category: 'safety',
    severity: 2,
    points: -10,
    summary: 'Improper tool storage leading to minor injury',
    details: 'Left power tools unsecured. Another member sustained minor cut.',
    evidenceLinks: ['photo-001.jpg', 'medical-report-002.pdf'],
    status: 'Closed',
    resolutionNotes: 'Safety refresher completed. Storage area reorganized.',
    tags: ['safety', 'workshop'],
    createdAt: '2025-11-02T10:15:00Z',
    createdByAdminId: 'user-002',
    updatedAt: '2025-11-03T11:00:00Z',
    updatedByAdminId: 'user-002',
    requiresTwoAdminApproval: false,
    approvals: [{ adminId: 'user-002', approvedAt: '2025-11-03T11:00:00Z' }],
    appealStatus: 'None',
    appealNotes: null,
  },
  {
    id: 'INC-2025-003',
    userId: 'user-010',
    type: 'BAD',
    category: 'conduct',
    severity: 3,
    points: 0, // Pending
    summary: 'Verbal altercation during resource distribution',
    details: 'Heated argument with user-012 over supply allocation. Multiple witnesses.',
    evidenceLinks: null,
    status: 'UnderReview',
    resolutionNotes: null,
    tags: ['conduct', 'conflict'],
    createdAt: '2025-12-01T16:45:00Z',
    createdByAdminId: 'user-007',
    updatedAt: '2025-12-01T16:45:00Z',
    updatedByAdminId: null,
    requiresTwoAdminApproval: false,
    approvals: [],
    appealStatus: 'None',
    appealNotes: null,
  },
  {
    id: 'INC-2025-004',
    userId: 'user-005',
    type: 'GOOD',
    category: 'leadership',
    severity: 4,
    points: 7,
    summary: 'Exceptional service during emergency evacuation',
    details: 'Led evacuation of 15 people during fire drill. Calm and effective leadership.',
    evidenceLinks: null,
    status: 'Closed',
    resolutionNotes: 'Commendation added to record.',
    tags: ['leadership', 'emergency'],
    createdAt: '2025-11-20T08:00:00Z',
    createdByAdminId: 'user-007',
    updatedAt: '2025-11-21T10:00:00Z',
    updatedByAdminId: 'user-007',
    requiresTwoAdminApproval: false,
    approvals: [{ adminId: 'user-007', approvedAt: '2025-11-21T10:00:00Z' }],
    appealStatus: 'None',
    appealNotes: null,
  },
  {
    id: 'INC-2025-005',
    userId: 'user-001',
    type: 'GOOD',
    category: 'contribution',
    severity: 5,
    points: 10,
    summary: 'Life-saving emergency medical response',
    details: 'Provided critical first aid to cardiac event victim. Patient stabilized.',
    evidenceLinks: ['medical-report-005.pdf'],
    status: 'Closed',
    resolutionNotes: 'Outstanding service. Community award recommended.',
    tags: ['medical', 'lifesaving'],
    createdAt: '2025-11-15T19:30:00Z',
    createdByAdminId: 'user-007',
    updatedAt: '2025-11-16T08:00:00Z',
    updatedByAdminId: 'user-002',
    requiresTwoAdminApproval: true,
    approvals: [
      { adminId: 'user-007', approvedAt: '2025-11-15T20:00:00Z' },
      { adminId: 'user-002', approvedAt: '2025-11-16T08:00:00Z' },
    ],
    appealStatus: 'None',
    appealNotes: null,
  },
];

const generateMockAuditLog = () => [
  {
    id: 'AUD-001',
    entityType: 'incident',
    entityId: 'INC-2025-001',
    action: 'create',
    changes: { status: { old: null, new: 'Open' } },
    performedBy: 'user-002',
    performedAt: '2025-10-15T14:30:00Z',
    ipAddress: '192.168.1.10',
    notes: 'Initial report',
  },
  {
    id: 'AUD-002',
    entityType: 'incident',
    entityId: 'INC-2025-001',
    action: 'update',
    changes: { status: { old: 'Open', new: 'Closed' }, points: { old: 0, new: -15 } },
    performedBy: 'user-007',
    performedAt: '2025-10-16T09:00:00Z',
    ipAddress: '192.168.1.15',
    notes: 'Resolved with warning',
  },
  {
    id: 'AUD-003',
    entityType: 'scoring',
    entityId: 'config',
    action: 'update',
    changes: { 'thresholds.monitor': { old: 75, new: 70 } },
    performedBy: 'user-007',
    performedAt: '2025-11-01T10:00:00Z',
    ipAddress: '192.168.1.15',
    notes: 'Adjusted monitor threshold',
  },
];

const generateMockScoreConfig = () => ({
  baseScore: 100,
  goodIncidentPoints: { 1: 1, 2: 2, 3: 4, 4: 7, 5: 10 },
  badIncidentPoints: { 1: -5, 2: -10, 3: -15, 4: -20, 5: -25 },
  decayHalfLifeDays: 90,
  thresholds: {
    monitor: 70,
    restricted: 50,
    intervention: 30,
  },
  requireTwoAdminForSeverity5: true,
  lastUpdated: '2025-11-01T10:00:00Z',
  updatedBy: 'user-007',
});

const calculateMemberScores = (profiles, incidents, config) => {
  const scores = {};
  
  profiles.forEach(profile => {
    const userIncidents = incidents.filter(i => i.userId === profile.id && i.status === 'Closed');
    let score = config.baseScore;
    
    userIncidents.forEach(incident => {
      score += incident.points;
    });
    
    // Clamp between 0-100
    score = Math.max(0, Math.min(100, score));
    
    // Calculate trend (mock)
    const recentIncidents = userIncidents.filter(i => 
      new Date(i.createdAt) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
    );
    const trend = recentIncidents.reduce((sum, i) => sum + i.points, 0);
    
    // Flags
    const flags = [];
    if (score < config.thresholds.intervention) flags.push('intervention');
    else if (score < config.thresholds.restricted) flags.push('restricted');
    else if (score < config.thresholds.monitor) flags.push('monitor');
    
    const badIncidentsLast30d = recentIncidents.filter(i => i.type === 'BAD').length;
    if (badIncidentsLast30d >= 2) flags.push('repeated-issues');
    
    scores[profile.id] = {
      score,
      trend,
      recentIncidentsCount: recentIncidents.length,
      flags,
      lastUpdated: new Date().toISOString(),
    };
  });
  
  return scores;
};

const generateAnalyticsSummary = (profiles, incidents) => {
  const onlineCount = profiles.filter(p => p.availabilityStatus === 'available').length;
  const awayCount = profiles.filter(p => p.availabilityStatus === 'away' || p.availabilityStatus === 'busy').length;
  const offlineCount = profiles.filter(p => p.availabilityStatus === 'offline').length;
  
  // Skills coverage
  const skillsCoverage = {};
  SKILL_SETS.forEach(skill => {
    skillsCoverage[skill] = profiles.filter(p => p.skillSets.includes(skill)).length;
  });
  
  // Critical skills and gaps
  const criticalSkills = ['Medical', 'FirstAid', 'CPR', 'HAM', 'WaterPurification', 'Security', 'Engineering'];
  const skillGaps = criticalSkills
    .map(skill => ({ skill, count: skillsCoverage[skill] || 0 }))
    .filter(s => s.count < 2)
    .map(s => ({
      ...s,
      priority: s.count === 0 ? 'P0' : s.count === 1 ? 'P1' : 'P2'
    }))
    .sort((a, b) => a.count - b.count);
  
  // Languages
  const allLanguages = [...new Set(profiles.flatMap(p => p.languages))];
  const languagesCoverage = {};
  allLanguages.forEach(lang => {
    languagesCoverage[lang] = profiles.filter(p => p.languages.includes(lang)).length;
  });
  
  // Education
  const educationBreakdown = {};
  EDUCATION_LEVELS.forEach(level => {
    educationBreakdown[level] = profiles.filter(p => p.educationLevel === level).length;
  });
  
  // Age distribution
  const ageDistribution = {
    '18-25': profiles.filter(p => p.age >= 18 && p.age <= 25).length,
    '26-35': profiles.filter(p => p.age >= 26 && p.age <= 35).length,
    '36-45': profiles.filter(p => p.age >= 36 && p.age <= 45).length,
    '46-55': profiles.filter(p => p.age >= 46 && p.age <= 55).length,
    '56-65': profiles.filter(p => p.age >= 56 && p.age <= 65).length,
    '65+': profiles.filter(p => p.age > 65).length,
  };
  
  // Redundancy index
  const redundancyIndex = {};
  criticalSkills.forEach(skill => {
    redundancyIndex[skill] = skillsCoverage[skill] || 0;
  });
  
  // Recommendations
  const recommendations = [];
  skillGaps.forEach(gap => {
    if (gap.count === 0) {
      recommendations.push({
        priority: 'P0',
        message: `No one has ${gap.skill} skills - critical gap`,
        action: `Recruit or train members in ${gap.skill}`,
      });
    } else if (gap.count === 1) {
      recommendations.push({
        priority: 'P1',
        message: `Only 1 person has ${gap.skill} - single point of failure`,
        action: `Cross-train backup for ${gap.skill}`,
      });
    }
  });
  
  // Check for skill concentration
  const topSkillCount = Math.max(...Object.values(skillsCoverage));
  if (topSkillCount > profiles.length * 0.5) {
    recommendations.push({
      priority: 'P2',
      message: 'High concentration of similar skills detected',
      action: 'Diversify training across different skill areas',
    });
  }
  
  return {
    totalMembers: profiles.length,
    onlineCount,
    awayCount,
    offlineCount,
    newMembersThisWeek: 2, // Mock
    announcementsCount: 3, // Mock
    openIncidentsCount: incidents.filter(i => i.status !== 'Closed').length,
    recentCommsActivity: 47, // Mock messages
    skillsCoverage,
    skillGaps,
    languagesCoverage,
    educationBreakdown,
    ageDistribution,
    redundancyIndex,
    recommendations,
    lastUpdated: new Date().toISOString(),
  };
};

// Current user options for testing RBAC
const MOCK_CURRENT_USERS = {
  admin: {
    id: 'user-007',
    displayName: 'Lisa Wong',
    role: 'admin',
    profilePhotoUrl: null,
  },
  member: {
    id: 'user-004',
    displayName: 'David Park',
    role: 'member',
    profilePhotoUrl: null,
  },
  guest: {
    id: 'guest-001',
    displayName: 'Guest User',
    role: 'guest',
    profilePhotoUrl: null,
  },
};

// ============================================================
// UTILITY COMPONENTS
// ============================================================

const Tooltip = ({ children, content }) => {
  const [show, setShow] = useState(false);
  return (
    <div className="relative inline-block">
      <div onMouseEnter={() => setShow(true)} onMouseLeave={() => setShow(false)}>
        {children}
      </div>
      {show && (
        <div className="absolute z-50 bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 text-xs bg-popover border border-border rounded-lg shadow-lg max-w-xs whitespace-normal">
          {content}
        </div>
      )}
    </div>
  );
};

const RoleBadge = ({ role }) => {
  const roleConfig = ROLES[role];
  if (!roleConfig) return null;
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium ${roleConfig.bg} ${roleConfig.color}`}>
      {role === 'admin' && <ShieldCheck className="w-3 h-3" />}
      {role === 'member' && <UserCheck className="w-3 h-3" />}
      {role === 'guest' && <User className="w-3 h-3" />}
      {roleConfig.name}
    </span>
  );
};

const PrivacyBadge = ({ level }) => {
  const config = {
    public: { icon: Globe, label: 'Public', color: 'text-success', bg: 'bg-success/20' },
    member: { icon: Users, label: 'Members', color: 'text-primary', bg: 'bg-primary/20' },
    admin: { icon: Shield, label: 'Admin Only', color: 'text-amber-400', bg: 'bg-amber-500/20' },
    sensitive: { icon: Lock, label: 'Sensitive', color: 'text-destructive', bg: 'bg-destructive/20' },
  };
  const c = config[level] || config.public;
  const Icon = c.icon;
  return (
    <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] ${c.bg} ${c.color}`}>
      <Icon className="w-2.5 h-2.5" />
      {c.label}
    </span>
  );
};

const StatusDot = ({ status }) => {
  const colors = {
    available: 'bg-success',
    busy: 'bg-warning',
    away: 'bg-orange-400',
    offline: 'bg-muted-foreground',
  };
  return <div className={`w-2.5 h-2.5 rounded-full ${colors[status] || colors.offline}`} />;
};

const ScoreBadge = ({ score, thresholds }) => {
  let color = 'text-success';
  let bg = 'bg-success/20';
  
  if (score < thresholds.intervention) {
    color = 'text-destructive';
    bg = 'bg-destructive/20';
  } else if (score < thresholds.restricted) {
    color = 'text-orange-400';
    bg = 'bg-orange-500/20';
  } else if (score < thresholds.monitor) {
    color = 'text-warning';
    bg = 'bg-warning/20';
  }
  
  return (
    <div className={`flex items-center gap-1.5 px-2 py-1 rounded-lg ${bg}`}>
      <Award className={`w-4 h-4 ${color}`} />
      <span className={`font-bold ${color}`}>{score}</span>
    </div>
  );
};

// Access Denied Component
const AccessDenied = ({ message = "You don't have permission to view this content" }) => (
  <div className="flex flex-col items-center justify-center py-16 glass rounded-xl">
    <ShieldAlert className="w-16 h-16 text-destructive/50 mb-4" />
    <h3 className="text-lg font-semibold mb-2">Access Denied</h3>
    <p className="text-sm text-muted-foreground text-center max-w-md">{message}</p>
  </div>
);

// Privacy Banner
const PrivacyBanner = () => (
  <div className="glass rounded-xl p-4 border border-primary/30 mb-6">
    <div className="flex items-start gap-3">
      <Info className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
      <div>
        <h4 className="font-semibold text-sm">Privacy & Data Use</h4>
        <p className="text-xs text-muted-foreground mt-1">
          Analytics show aggregated data only. Height/weight and medical info are visible only with member opt-in. 
          Incident tracking is admin-only and follows strict approval workflows. All actions are audited.
        </p>
      </div>
    </div>
  </div>
);

// ============================================================
// TAB COMPONENTS
// ============================================================

// Overview Tab
const OverviewTab = ({ profiles, analytics, incidents }) => {
  const { can, isAdmin } = useRBAC();
  
  // Top 5 strengths and gaps
  const topStrengths = Object.entries(analytics.skillsCoverage)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);
  
  return (
    <div className="space-y-6">
      <PrivacyBanner />
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Community Pulse */}
        <div className="lg:col-span-2 space-y-4">
          <div className="glass rounded-xl p-4">
            <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
              <Activity className="w-5 h-5 text-primary" />
              Community Pulse
            </h2>
            
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="glass rounded-lg p-3 text-center">
                <div className="text-2xl font-bold text-success">{analytics.onlineCount}</div>
                <p className="text-xs text-muted-foreground">Online</p>
              </div>
              <div className="glass rounded-lg p-3 text-center">
                <div className="text-2xl font-bold text-muted-foreground">{analytics.offlineCount}</div>
                <p className="text-xs text-muted-foreground">Offline</p>
              </div>
              <div className="glass rounded-lg p-3 text-center">
                <div className="text-2xl font-bold text-primary">{analytics.newMembersThisWeek}</div>
                <p className="text-xs text-muted-foreground">New This Week</p>
              </div>
              <div className="glass rounded-lg p-3 text-center">
                <div className="text-2xl font-bold text-cyan-400">{analytics.recentCommsActivity}</div>
                <p className="text-xs text-muted-foreground">Messages (24h)</p>
              </div>
            </div>
            
            {isAdmin && (
              <div className="mt-4 p-3 bg-amber-500/10 border border-amber-500/30 rounded-lg">
                <div className="flex items-center justify-between">
                  <span className="text-sm flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-amber-400" />
                    Open Incidents
                  </span>
                  <span className="text-lg font-bold text-amber-400">{analytics.openIncidentsCount}</span>
                </div>
              </div>
            )}
          </div>
          
          {/* Quick Actions */}
          <div className="glass rounded-xl p-4">
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <Zap className="w-4 h-4 text-primary" />
              Quick Actions
            </h3>
            <div className="flex flex-wrap gap-2">
              {can('postAnnouncement') && (
                <Button size="sm" variant="outline" className="gap-1.5">
                  <Megaphone className="w-3.5 h-3.5" />
                  Post Announcement
                </Button>
              )}
              {can('createPoll') && (
                <Button size="sm" variant="outline" className="gap-1.5">
                  <Vote className="w-3.5 h-3.5" />
                  Start Poll
                </Button>
              )}
              {can('createTask') && (
                <Button size="sm" variant="outline" className="gap-1.5">
                  <ClipboardList className="w-3.5 h-3.5" />
                  New Task
                </Button>
              )}
              <Button size="sm" variant="outline" className="gap-1.5">
                <Users className="w-3.5 h-3.5" />
                View Directory
              </Button>
            </div>
          </div>
        </div>
        
        {/* Right: Strengths & Gaps */}
        <div className="space-y-4">
          <div className="glass rounded-xl p-4">
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-success" />
              Top Strengths
            </h3>
            <div className="space-y-2">
              {topStrengths.map(([skill, count]) => (
                <div key={skill} className="flex items-center justify-between text-sm">
                  <span>{skill}</span>
                  <span className="text-success font-medium">{count}</span>
                </div>
              ))}
            </div>
          </div>
          
          <div className="glass rounded-xl p-4 border border-warning/30">
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <TrendingDown className="w-4 h-4 text-warning" />
              Skill Gaps
            </h3>
            {analytics.skillGaps.length > 0 ? (
              <div className="space-y-2">
                {analytics.skillGaps.slice(0, 5).map(gap => (
                  <div key={gap.skill} className="flex items-center justify-between text-sm">
                    <span>{gap.skill}</span>
                    <span className={`font-medium ${gap.count === 0 ? 'text-destructive' : 'text-warning'}`}>
                      {gap.count === 0 ? 'None' : gap.count}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-success">All critical skills covered!</p>
            )}
          </div>
          
          <div className="glass rounded-xl p-4">
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <Languages className="w-4 h-4 text-primary" />
              Languages
            </h3>
            <div className="flex flex-wrap gap-1.5">
              {Object.entries(analytics.languagesCoverage)
                .sort((a, b) => b[1] - a[1])
                .slice(0, 6)
                .map(([lang, count]) => (
                  <span key={lang} className="px-2 py-1 rounded-full bg-secondary text-xs">
                    {lang} ({count})
                  </span>
                ))}
            </div>
          </div>
        </div>
      </div>
      
      {/* Recommendations Panel */}
      {analytics.recommendations.length > 0 && (
        <div className="glass rounded-xl p-4">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <Lightbulb className="w-4 h-4 text-amber-400" />
            System Recommendations
          </h3>
          <div className="space-y-3">
            {analytics.recommendations.map((rec, idx) => (
              <div 
                key={idx} 
                className={`p-3 rounded-lg ${
                  rec.priority === 'P0' ? 'bg-destructive/10 border border-destructive/30' :
                  rec.priority === 'P1' ? 'bg-warning/10 border border-warning/30' :
                  'bg-primary/10 border border-primary/30'
                }`}
              >
                <div className="flex items-start gap-3">
                  <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                    rec.priority === 'P0' ? 'bg-destructive text-white' :
                    rec.priority === 'P1' ? 'bg-warning text-black' :
                    'bg-primary text-white'
                  }`}>
                    {rec.priority}
                  </span>
                  <div className="flex-1">
                    <p className="text-sm font-medium">{rec.message}</p>
                    <p className="text-xs text-muted-foreground mt-1">{rec.action}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// Placeholder tabs for Phase 2+
const AnalyticsTab = () => {
  const { can, currentUser } = useRBAC();
  if (!can('viewAnalytics')) {
    return (
      <AccessDeniedCard 
        minRole="member" 
        currentRole={currentUser?.role} 
      />
    );
  }
  
  return (
    <div className="space-y-6">
      {/* Placeholder Header */}
      <div className="glass rounded-xl p-8 text-center border-2 border-dashed border-border">
        <BarChart2 className="w-16 h-16 mx-auto mb-4 text-primary/50" />
        <h3 className="text-lg font-semibold mb-2">Analytics Dashboard</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Coming in Phase 3 - Comprehensive community analytics
        </p>
        <ul className="text-sm text-muted-foreground space-y-1 text-left max-w-md mx-auto">
          <li>• Skills coverage matrix</li>
          <li>• Gap analysis with recommendations</li>
          <li>• Member activity trends</li>
          <li>• Downloadable reports (redacted by role)</li>
        </ul>
      </div>
    </div>
  );
};

const DirectoryTab = ({ profiles, scoreConfig, memberScores, onTabChange }) => {
  const { can, currentUser, isAdmin } = useRBAC();
  
  if (!can('viewDirectory')) return <AccessDeniedCard minRole="guest" currentRole={currentUser?.role} />;
  
  // Get redacted profiles based on viewer role
  const viewerRole = currentUser?.role || 'guest';
  const redactedProfiles = useMemo(() => 
    profiles.map(p => redactProfile(p, viewerRole)),
    [profiles, viewerRole]
  );
  
  // Show only first 3 profiles as preview (per Phase 1 requirements)
  const previewProfiles = redactedProfiles.slice(0, 3);
  
  return (
    <div className="space-y-6">
      {/* Privacy Notice */}
      <div className="glass rounded-xl p-4 border border-primary/30">
        <div className="flex items-start gap-3">
          <Eye className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="font-semibold text-sm">Privacy Redaction Active</h4>
            <p className="text-xs text-muted-foreground mt-1">
              Sensitive fields (age, height, weight) are shown only when members opt-in.
              {isAdmin ? (
                <span className="text-amber-400 ml-1">As an admin, you see all fields.</span>
              ) : (
                <span className="text-muted-foreground ml-1">Fields marked "Hidden" are not shared by the member.</span>
              )}
            </p>
          </div>
        </div>
      </div>
      
      {/* Directory Preview Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold flex items-center gap-2">
          <Users className="w-5 h-5 text-primary" />
          Member Directory Preview
        </h2>
        <span className="text-xs text-muted-foreground">
          Showing {previewProfiles.length} of {profiles.length} members
        </span>
      </div>
      
      {/* Profile Cards Grid - Shows redaction behavior */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {previewProfiles.map(profile => (
          <ProfilePreviewCard 
            key={profile.id} 
            profile={profile} 
            viewerRole={viewerRole}
            score={memberScores[profile.id]}
            thresholds={scoreConfig.thresholds}
          />
        ))}
      </div>
      
      {/* Placeholder for full directory */}
      <div className="glass rounded-xl p-8 text-center border-2 border-dashed border-border">
        <Users className="w-12 h-12 mx-auto mb-4 text-primary/30" />
        <h3 className="font-semibold mb-2">Full Directory Coming in Phase 4</h3>
        <ul className="text-sm text-muted-foreground space-y-1">
          <li>• Advanced search & filtering</li>
          <li>• Skill-based member discovery</li>
          <li>• Team Builder tool</li>
          <li>• Bulk export (redacted for role)</li>
        </ul>
      </div>
    </div>
  );
};

// Profile Preview Card - Shows privacy redaction behavior
const ProfilePreviewCard = ({ profile, viewerRole, score, thresholds }) => {
  const { isAdmin } = useRBAC();
  const isRedacted = profile._redacted;
  
  // Helper to render field with redaction indicator
  const renderField = (label, value, icon) => {
    const Icon = icon;
    const isHidden = value === null;
    
    return (
      <div className="flex items-center justify-between py-1.5 border-b border-border/50 last:border-0">
        <span className="text-xs text-muted-foreground flex items-center gap-1.5">
          <Icon className="w-3 h-3" />
          {label}
        </span>
        {isHidden ? (
          <span className="text-xs text-amber-400/70 flex items-center gap-1" data-testid={`field-hidden-${label.toLowerCase()}`}>
            <EyeOff className="w-3 h-3" />
            Hidden
          </span>
        ) : (
          <span className="text-xs font-medium">{value}</span>
        )}
      </div>
    );
  };
  
  return (
    <div 
      className="glass rounded-xl p-4 hover:bg-white/5 transition-colors"
      data-testid={`profile-card-${profile.id}`}
    >
      {/* Header */}
      <div className="flex items-start gap-3 mb-4">
        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-violet-500/50 to-fuchsia-500/50 flex items-center justify-center font-bold text-white flex-shrink-0">
          {profile.displayName?.split(' ').map(n => n[0]).join('').slice(0, 2)}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <h3 className="font-semibold truncate">{profile.displayName}</h3>
            {score && (
              <ScoreBadge score={score.score} thresholds={thresholds} />
            )}
          </div>
          <div className="flex items-center gap-2 mt-1">
            <StatusDot status={profile.availabilityStatus} />
            <span className="text-xs text-muted-foreground capitalize">{profile.availabilityStatus}</span>
            {profile.roleClass && (
              <span className="text-xs px-1.5 py-0.5 rounded bg-primary/20 text-primary">
                {profile.roleClass}
              </span>
            )}
          </div>
        </div>
      </div>
      
      {/* Redacted Fields Display */}
      <div className="space-y-0 mb-4">
        {renderField('Age', profile.age ? `${profile.age} years` : null, Calendar)}
        {renderField('Height', formatHeight(profile.heightIn), Activity)}
        {renderField('Weight', formatWeight(profile.weightLb), Activity)}
        {renderField('Education', profile.educationLevel, GraduationCap)}
      </div>
      
      {/* Skills Preview */}
      <div className="flex flex-wrap gap-1 mb-3">
        {profile.skillSets?.slice(0, 3).map(skill => (
          <span key={skill} className="text-[10px] px-1.5 py-0.5 rounded bg-secondary">
            {skill}
          </span>
        ))}
        {profile.skillSets?.length > 3 && (
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-secondary text-muted-foreground">
            +{profile.skillSets.length - 3} more
          </span>
        )}
      </div>
      
      {/* Languages */}
      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <Languages className="w-3 h-3" />
        {profile.languages?.join(', ')}
      </div>
      
      {/* Redaction indicator for non-admins */}
      {isRedacted && !isAdmin && (
        <div className="mt-3 pt-3 border-t border-border/50">
          <p className="text-[10px] text-muted-foreground flex items-center gap-1">
            <Lock className="w-3 h-3" />
            Some fields hidden by member privacy settings
          </p>
        </div>
      )}
      
      {/* Admin badge */}
      {isAdmin && (
        <div className="mt-3 pt-3 border-t border-border/50">
          <p className="text-[10px] text-amber-400 flex items-center gap-1">
            <ShieldCheck className="w-3 h-3" />
            Full profile visible (admin)
          </p>
        </div>
      )}
    </div>
  );
};

const CommsTab = () => {
  const { can, currentUser } = useRBAC();
  if (!can('viewComms')) {
    return (
      <AccessDeniedCard 
        minRole="member" 
        currentRole={currentUser?.role} 
      />
    );
  }
  
  return (
    <div className="space-y-6">
      {/* Placeholder Content */}
      <div className="glass rounded-xl p-8 text-center border-2 border-dashed border-border">
        <MessageSquare className="w-16 h-16 mx-auto mb-4 text-primary/50" />
        <h3 className="text-lg font-semibold mb-2">Communications Hub</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Coming in Phase 5 - Unified community communications
        </p>
        <ul className="text-sm text-muted-foreground space-y-1 text-left max-w-md mx-auto">
          <li>• Announcements feed</li>
          <li>• Community polls</li>
          <li>• Task management</li>
          <li>• Role-gated channels</li>
        </ul>
      </div>
    </div>
  );
};

const IncidentReportsTab = ({ onTabChange }) => {
  const { can, isAdmin, currentUser } = useRBAC();
  
  // Route-level protection with redirect + toast
  useEffect(() => {
    if (!isAdmin) {
      toast.error('Access denied: Admin-only section', {
        description: 'Redirecting to Overview...',
        duration: 3000,
      });
      // Redirect after short delay to show toast
      const timer = setTimeout(() => {
        if (onTabChange) onTabChange('overview');
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [isAdmin, onTabChange]);
  
  // Strict admin-only check with RequireRole
  return (
    <RequireRole 
      minRole="admin" 
      onAccessDenied={() => {
        if (onTabChange) onTabChange('overview');
      }}
      fallback={
        <AccessDeniedCard 
          minRole="admin" 
          currentRole={currentUser?.role}
          onReturn={() => onTabChange && onTabChange('overview')}
        />
      }
    >
      <div className="space-y-6">
        {/* Admin Verification Banner */}
        <div className="glass rounded-xl p-4 border border-amber-500/30 bg-amber-500/5">
          <div className="flex items-center gap-3">
            <ShieldCheck className="w-6 h-6 text-amber-400" />
            <div>
              <h4 className="font-semibold text-sm text-amber-400">Admin Access Verified</h4>
              <p className="text-xs text-muted-foreground">
                You have full access to incident reports and scoring management.
              </p>
            </div>
          </div>
        </div>
        
        {/* Placeholder Content */}
        <div className="glass rounded-xl p-8 text-center border-2 border-dashed border-amber-500/30">
          <FileText className="w-16 h-16 mx-auto mb-4 text-amber-400/50" />
          <h3 className="text-lg font-semibold mb-2">Incident Reports Dashboard</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Coming in Phase 6 - Full incident management system
          </p>
          <ul className="text-sm text-muted-foreground space-y-1 text-left max-w-md mx-auto">
            <li>• Incident log with filters & search</li>
            <li>• Member scoreboard with trends</li>
            <li>• Scoring policy configuration</li>
            <li>• Two-admin approval workflows</li>
            <li>• Full audit trail access</li>
            <li>• Appeal management</li>
          </ul>
        </div>
      </div>
    </RequireRole>
  );
};

// ============================================================
// QA CHECKLIST COMPONENT (Dev-only)
// ============================================================

const QAChecklist = ({ currentRole, onRoleChange }) => {
  const [expanded, setExpanded] = useState(false);
  const [checkedItems, setCheckedItems] = useState({});
  
  const toggleCheck = (id) => {
    setCheckedItems(prev => ({ ...prev, [id]: !prev[id] }));
  };
  
  const checklistItems = [
    {
      id: 'admin-tab-visible',
      test: 'Switch role to admin: Incident Reports tab appears',
      action: () => onRoleChange('admin'),
      expect: 'Tab should be visible in navigation',
    },
    {
      id: 'member-tab-hidden',
      test: 'Switch role to member: Incident Reports tab disappears',
      action: () => onRoleChange('member'),
      expect: 'Tab should be hidden from navigation',
    },
    {
      id: 'guest-limited',
      test: 'Switch role to guest: Limited tab access',
      action: () => onRoleChange('guest'),
      expect: 'Only Overview and Directory tabs visible',
    },
    {
      id: 'direct-nav-redirect',
      test: 'Attempt direct nav to Incident Reports as member: redirect + banner',
      action: null,
      expect: 'Should redirect to Overview and show toast error',
    },
    {
      id: 'privacy-redaction',
      test: 'Privacy redaction: hidden fields show as "Hidden"',
      action: null,
      expect: 'In Directory tab, non-opted-in fields show "Hidden" for non-admins',
    },
    {
      id: 'admin-sees-all',
      test: 'Admin sees all profile fields',
      action: () => onRoleChange('admin'),
      expect: 'All fields visible in Directory for admin',
    },
  ];
  
  return (
    <div className="glass rounded-xl p-4 border border-cyan-500/30 bg-cyan-500/5" data-testid="qa-checklist">
      <button 
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between"
      >
        <h4 className="font-semibold text-sm flex items-center gap-2 text-cyan-400">
          <ListChecks className="w-4 h-4" />
          QA Checklist (Dev Only)
        </h4>
        {expanded ? <ChevronUp className="w-4 h-4 text-cyan-400" /> : <ChevronDown className="w-4 h-4 text-cyan-400" />}
      </button>
      
      {expanded && (
        <div className="mt-4 space-y-2">
          <p className="text-xs text-muted-foreground mb-3">
            Current role: <span className="font-semibold text-primary">{currentRole}</span>
          </p>
          
          {checklistItems.map(item => (
            <div 
              key={item.id}
              className={`p-2 rounded-lg transition-colors ${
                checkedItems[item.id] ? 'bg-success/10 border border-success/30' : 'bg-secondary/50'
              }`}
            >
              <div className="flex items-start gap-2">
                <button
                  onClick={() => toggleCheck(item.id)}
                  className={`w-5 h-5 rounded border flex-shrink-0 flex items-center justify-center mt-0.5 transition-colors ${
                    checkedItems[item.id] 
                      ? 'bg-success border-success text-white' 
                      : 'border-border hover:border-primary'
                  }`}
                >
                  {checkedItems[item.id] && <CheckCheck className="w-3 h-3" />}
                </button>
                <div className="flex-1">
                  <p className="text-xs font-medium">{item.test}</p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">Expected: {item.expect}</p>
                  {item.action && (
                    <Button 
                      size="sm" 
                      variant="ghost" 
                      onClick={item.action}
                      className="h-6 text-[10px] mt-1 px-2"
                    >
                      Run Test
                    </Button>
                  )}
                </div>
              </div>
            </div>
          ))}
          
          <div className="pt-2 border-t border-border/50 mt-3">
            <p className="text-[10px] text-muted-foreground">
              This panel is for development/QA purposes only and will not appear in production.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

// ============================================================
// MAIN COMPONENT
// ============================================================

export default function CommunityHub({ isOpen, onClose }) {
  // Role switching for testing (in production, this comes from auth)
  const [currentUserRole, setCurrentUserRole] = useState('admin');
  const currentUser = MOCK_CURRENT_USERS[currentUserRole];
  
  const [activeTab, setActiveTab] = useState('overview');
  
  // Load mock data
  const [profiles] = useState(() => generateMockProfiles());
  const [incidents] = useState(() => generateMockIncidents());
  const [auditLog] = useState(() => generateMockAuditLog());
  const [scoreConfig] = useState(() => generateMockScoreConfig());
  
  // Computed data
  const analytics = useMemo(() => generateAnalyticsSummary(profiles, incidents), [profiles, incidents]);
  const memberScores = useMemo(() => calculateMemberScores(profiles, incidents, scoreConfig), [profiles, incidents, scoreConfig]);
  
  // Tab configuration with RBAC
  const tabs = useMemo(() => {
    const role = ROLES[currentUser.role];
    const allTabs = [
      { id: 'overview', name: 'Overview', icon: Home, visible: true },
      { id: 'analytics', name: 'Analytics', icon: BarChart3, visible: role.permissions.viewAnalytics },
      { id: 'directory', name: 'Directory', icon: Users, visible: role.permissions.viewDirectory },
      { id: 'comms', name: 'Comms', icon: MessageSquare, visible: role.permissions.viewComms },
      { id: 'incidents', name: 'Incident Reports', icon: FileText, visible: role.permissions.viewIncidents, adminOnly: true },
    ];
    return allTabs.filter(tab => tab.visible);
  }, [currentUser.role]);
  
  // Handle tab change with RBAC check
  const handleTabChange = useCallback((tabId) => {
    const role = ROLES[currentUser.role];
    
    // Check if trying to access incidents without admin
    if (tabId === 'incidents' && !role.permissions.viewIncidents) {
      toast.error('Access denied: Admin-only section', {
        description: 'Incident Reports require administrator privileges.',
        duration: 3000,
      });
      return;
    }
    
    setActiveTab(tabId);
  }, [currentUser.role]);
  
  // Ensure active tab is valid for current role
  useEffect(() => {
    const validTab = tabs.find(t => t.id === activeTab);
    if (!validTab) {
      setActiveTab('overview');
      if (activeTab === 'incidents') {
        toast.error('Access denied', {
          description: 'You were redirected because your role changed.',
        });
      }
    }
  }, [tabs, activeTab]);
  
  // Query param sync for tabs (optional enhancement)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const tabParam = params.get('tab');
    if (tabParam && tabs.some(t => t.id === tabParam)) {
      handleTabChange(tabParam);
    }
  }, []);
  
  // Update URL when tab changes
  useEffect(() => {
    if (isOpen) {
      const url = new URL(window.location.href);
      url.searchParams.set('tab', activeTab);
      window.history.replaceState({}, '', url.toString());
    }
  }, [activeTab, isOpen]);
  
  if (!isOpen) return null;
  
  return (
    <RBACProvider currentUser={currentUser}>
      <div className="fixed inset-0 z-50 bg-background overflow-y-auto" data-testid="community-hub">
        {/* Header */}
        <div className="sticky top-0 z-10 glass border-b border-border">
          <div className="container mx-auto px-4 py-3">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-gradient-to-br from-violet-500/20 to-fuchsia-500/20">
                  <Users className="w-5 h-5 text-violet-400" />
                </div>
                <div>
                  <h1 className="text-lg font-bold">Community Hub</h1>
                  <p className="text-xs text-muted-foreground hidden sm:block">
                    Connect, coordinate, and collaborate
                  </p>
                </div>
                
                {/* HUD Stats - Online / Total */}
                <div className="hidden md:flex items-center gap-3 ml-4 pl-4 border-l border-border">
                  <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
                    <span className="text-sm font-medium text-success">{analytics.onlineCount}</span>
                    <span className="text-xs text-muted-foreground">online</span>
                  </div>
                  <div className="text-xs text-muted-foreground">/</div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm font-medium">{analytics.totalMembers}</span>
                    <span className="text-xs text-muted-foreground">total</span>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                {/* Role Switcher (Dev-only) */}
                <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 glass rounded-lg border border-cyan-500/30" data-testid="role-switcher">
                  <span className="text-[10px] text-cyan-400">DEV:</span>
                  <select
                    value={currentUserRole}
                    onChange={(e) => setCurrentUserRole(e.target.value)}
                    className="bg-transparent text-xs font-medium focus:outline-none cursor-pointer"
                    data-testid="role-select"
                  >
                    <option value="admin">Admin</option>
                    <option value="member">Member</option>
                    <option value="guest">Guest</option>
                  </select>
                  <RoleBadge role={currentUserRole} />
                </div>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onClose}
                  className="gap-2"
                  data-testid="community-close"
                >
                  <X className="w-4 h-4" />
                  <span className="hidden sm:inline">Back to Dashboard</span>
                </Button>
              </div>
            </div>
            
            {/* Sub-Navigation Tabs */}
            <div className="flex gap-2 mt-3 overflow-x-auto pb-1">
              {tabs.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => handleTabChange(tab.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
                    activeTab === tab.id 
                      ? 'bg-primary text-white' 
                      : 'glass hover:bg-secondary'
                  } ${tab.adminOnly ? 'border border-amber-500/30' : ''}`}
                  data-testid={`tab-${tab.id}`}
                >
                  <tab.icon className={`w-4 h-4 ${tab.adminOnly && activeTab !== tab.id ? 'text-amber-400' : ''}`} />
                  {tab.name}
                  {tab.adminOnly && (
                    <ShieldCheck className="w-3 h-3 text-amber-400" />
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
        
        {/* Content */}
        <div className="container mx-auto px-4 py-6 pb-32 sm:pb-6">
          {activeTab === 'overview' && (
            <OverviewTab profiles={profiles} analytics={analytics} incidents={incidents} />
          )}
          {activeTab === 'analytics' && <AnalyticsTab />}
          {activeTab === 'directory' && (
            <DirectoryTab 
              profiles={profiles} 
              scoreConfig={scoreConfig} 
              memberScores={memberScores}
              onTabChange={handleTabChange}
            />
          )}
          {activeTab === 'comms' && <CommsTab />}
          {activeTab === 'incidents' && (
            <IncidentReportsTab onTabChange={handleTabChange} />
          )}
          
          {/* QA Checklist (Dev-only) - Always visible at bottom */}
          <div className="mt-8">
            <QAChecklist 
              currentRole={currentUserRole} 
              onRoleChange={setCurrentUserRole}
            />
          </div>
        </div>
        
        {/* Mobile Role Switcher */}
        <div className="sm:hidden fixed bottom-4 left-4 right-4 z-20">
          <div className="glass rounded-xl p-3 flex items-center justify-between border border-cyan-500/30">
            <span className="text-xs text-cyan-400">DEV Role:</span>
            <div className="flex items-center gap-2">
              {['guest', 'member', 'admin'].map(role => (
                <button
                  key={role}
                  onClick={() => setCurrentUserRole(role)}
                  className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                    currentUserRole === role ? 'bg-primary text-white' : 'bg-secondary'
                  }`}
                  data-testid={`mobile-role-${role}`}
                >
                  {role}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </RBACProvider>
  );
}
