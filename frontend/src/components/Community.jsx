import React, { useState, useMemo } from 'react';
import {
  X,
  MessageSquare,
  Users,
  BarChart3,
  Send,
  Paperclip,
  Lock,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Eye,
  EyeOff,
  UserPlus,
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
  VolumeX,
  FileText,
  Plus,
  Edit,
  Info,
  HelpCircle,
  User,
  Baby,
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
  Ban
} from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { toast } from 'sonner';

// ============================================================
// MOCK DATA
// ============================================================

const ROLE_TAGS = [
  { id: 'medic', name: 'Medic', icon: Stethoscope, color: 'text-red-400', bg: 'bg-red-500/20' },
  { id: 'comms', name: 'Comms', icon: Radio, color: 'text-emerald-400', bg: 'bg-emerald-500/20' },
  { id: 'builder', name: 'Builder', icon: Wrench, color: 'text-amber-400', bg: 'bg-amber-500/20' },
  { id: 'security', name: 'Security', icon: Shield, color: 'text-blue-400', bg: 'bg-blue-500/20' },
  { id: 'logistics', name: 'Logistics', icon: Car, color: 'text-purple-400', bg: 'bg-purple-500/20' },
  { id: 'food', name: 'Food/Water', icon: Utensils, color: 'text-orange-400', bg: 'bg-orange-500/20' },
  { id: 'childcare', name: 'Childcare', icon: Baby, color: 'text-pink-400', bg: 'bg-pink-500/20' },
  { id: 'scout', name: 'Scout', icon: Tent, color: 'text-green-400', bg: 'bg-green-500/20' },
  { id: 'tech', name: 'Tech', icon: Cpu, color: 'text-cyan-400', bg: 'bg-cyan-500/20' },
];

const SKILLS_LIST = [
  'First Aid', 'CPR Certified', 'Trauma Care', 'Nursing', 'Surgery Assist',
  'Ham Radio', 'Morse Code', 'Signal Processing', 'Antenna Building',
  'Carpentry', 'Plumbing', 'Electrical', 'Welding', 'Masonry',
  'Firearms Safety', 'Self Defense', 'Perimeter Security', 'Conflict Resolution',
  'Vehicle Repair', 'Navigation', 'Supply Chain', 'Inventory Management',
  'Cooking', 'Food Preservation', 'Water Purification', 'Gardening', 'Hunting',
  'Child Education', 'First Aid for Children', 'Child Psychology',
  'Tracking', 'Foraging', 'Shelter Building', 'Fire Starting',
  'Programming', 'Electronics Repair', 'Solar Systems', 'Network Setup'
];

const LANGUAGES = ['English', 'Spanish', 'French', 'German', 'Mandarin', 'Arabic', 'Portuguese', 'Russian', 'Japanese', 'Korean'];
const EDUCATION_LEVELS = ['High School', 'Some College', 'Associate', 'Bachelor', 'Master', 'Doctorate', 'Trade/Vocational', 'Self-Taught'];
const AGE_BANDS = ['18-25', '26-35', '36-45', '46-55', '56-65', '65+'];

// Generate mock users
const generateMockUsers = () => {
  const users = [
    {
      user_id: 'user-001',
      display_name: 'Sarah Chen',
      avatar_url: null,
      role_tags: ['medic', 'childcare'],
      skills: ['First Aid', 'CPR Certified', 'Trauma Care', 'Child Education', 'First Aid for Children'],
      languages: ['English', 'Mandarin'],
      education_level: 'Bachelor',
      age_band: '36-45',
      height: "5'6\"",
      weight: '140 lbs',
      bio: 'Former ER nurse with 12 years experience. Passionate about community health and child safety.',
      medical_allergies: 'Penicillin allergy. Type 2 diabetes (controlled with diet).',
      household: [{ name: 'Emma Chen', age: 8, notes: 'Asthma, carries inhaler' }],
      group_id: 'family-chen',
      group_label: 'Chen Family',
      ally_standing: 92,
      status: 'online',
      roles: ['verified', 'women'],
      joined: '2025-06-15'
    },
    {
      user_id: 'user-002',
      display_name: 'Marcus Johnson',
      avatar_url: null,
      role_tags: ['security', 'comms'],
      skills: ['Firearms Safety', 'Self Defense', 'Ham Radio', 'Perimeter Security'],
      languages: ['English', 'Spanish'],
      education_level: 'Trade/Vocational',
      age_band: '46-55',
      height: "6'1\"",
      weight: '195 lbs',
      bio: 'Retired Army sergeant. 20 years military experience. HAM radio operator (W5ABC).',
      medical_allergies: 'None known.',
      household: [],
      group_id: null,
      group_label: null,
      ally_standing: 88,
      status: 'online',
      roles: ['verified', 'adult', 'operator'],
      joined: '2025-05-20'
    },
    {
      user_id: 'user-003',
      display_name: 'Elena Rodriguez',
      avatar_url: null,
      role_tags: ['food', 'logistics'],
      skills: ['Cooking', 'Food Preservation', 'Gardening', 'Inventory Management', 'Supply Chain'],
      languages: ['English', 'Spanish', 'Portuguese'],
      education_level: 'Associate',
      age_band: '26-35',
      height: "5'4\"",
      weight: '135 lbs',
      bio: 'Restaurant manager turned prepper. Expert in large-scale food prep and storage.',
      medical_allergies: 'Shellfish allergy (severe - carries EpiPen).',
      household: [
        { name: 'Sofia Rodriguez', age: 5, notes: 'No known allergies' },
        { name: 'Diego Rodriguez', age: 3, notes: 'Peanut allergy' }
      ],
      group_id: 'family-rodriguez',
      group_label: 'Rodriguez Family',
      ally_standing: 95,
      status: 'away',
      roles: ['verified', 'women', 'adult'],
      joined: '2025-07-01'
    },
    {
      user_id: 'user-004',
      display_name: 'David Park',
      avatar_url: null,
      role_tags: ['tech', 'builder'],
      skills: ['Programming', 'Electronics Repair', 'Solar Systems', 'Network Setup', 'Electrical'],
      languages: ['English', 'Korean'],
      education_level: 'Master',
      age_band: '26-35',
      height: "5'9\"",
      weight: '165 lbs',
      bio: 'Software engineer specializing in embedded systems. Built our mesh network.',
      medical_allergies: 'Latex allergy.',
      household: [],
      group_id: null,
      group_label: null,
      ally_standing: 90,
      status: 'online',
      roles: ['verified', 'adult'],
      joined: '2025-06-10'
    },
    {
      user_id: 'user-005',
      display_name: 'Amanda Foster',
      avatar_url: null,
      role_tags: ['scout', 'security'],
      skills: ['Tracking', 'Foraging', 'Shelter Building', 'Fire Starting', 'Navigation'],
      languages: ['English'],
      education_level: 'Bachelor',
      age_band: '26-35',
      height: "5'8\"",
      weight: '145 lbs',
      bio: 'Former park ranger. Expert in wilderness survival and land navigation.',
      medical_allergies: 'Bee sting allergy (mild).',
      household: [],
      group_id: null,
      group_label: null,
      ally_standing: 87,
      status: 'offline',
      roles: ['verified', 'women', 'adult'],
      joined: '2025-08-05'
    },
    {
      user_id: 'user-006',
      display_name: 'Robert Thompson',
      avatar_url: null,
      role_tags: ['builder', 'logistics'],
      skills: ['Carpentry', 'Plumbing', 'Vehicle Repair', 'Welding'],
      languages: ['English', 'German'],
      education_level: 'Trade/Vocational',
      age_band: '56-65',
      height: "5'11\"",
      weight: '200 lbs',
      bio: 'Retired contractor. Can fix almost anything mechanical.',
      medical_allergies: 'Heart condition (on blood thinners). High blood pressure.',
      household: [{ name: 'Mary Thompson', age: 58, notes: 'Spouse, arthritis' }],
      group_id: 'family-thompson',
      group_label: 'Thompson Family',
      ally_standing: 78,
      status: 'online',
      roles: ['verified', 'adult'],
      joined: '2025-05-15'
    },
    {
      user_id: 'user-007',
      display_name: 'Lisa Wong',
      avatar_url: null,
      role_tags: ['medic'],
      skills: ['Nursing', 'CPR Certified', 'Trauma Care', 'Surgery Assist'],
      languages: ['English', 'Mandarin', 'Japanese'],
      education_level: 'Doctorate',
      age_band: '36-45',
      height: "5'3\"",
      weight: '120 lbs',
      bio: 'ER physician. 15 years experience in emergency medicine.',
      medical_allergies: 'None.',
      household: [],
      group_id: null,
      group_label: null,
      ally_standing: 98,
      status: 'online',
      roles: ['verified', 'women', 'adult', 'operator'],
      joined: '2025-04-01'
    },
    {
      user_id: 'user-008',
      display_name: 'James Miller',
      avatar_url: null,
      role_tags: ['comms', 'tech'],
      skills: ['Ham Radio', 'Morse Code', 'Antenna Building', 'Electronics Repair'],
      languages: ['English', 'French'],
      education_level: 'Bachelor',
      age_band: '46-55',
      height: "5'10\"",
      weight: '175 lbs',
      bio: 'HAM radio enthusiast for 30 years. Built the community radio network.',
      medical_allergies: 'Sulfa drugs.',
      household: [],
      group_id: null,
      group_label: null,
      ally_standing: 85,
      status: 'away',
      roles: ['verified', 'adult'],
      joined: '2025-06-20'
    },
    {
      user_id: 'user-009',
      display_name: 'Maria Santos',
      avatar_url: null,
      role_tags: ['childcare', 'food'],
      skills: ['Child Education', 'Child Psychology', 'Cooking', 'First Aid for Children'],
      languages: ['English', 'Spanish'],
      education_level: 'Bachelor',
      age_band: '26-35',
      height: "5'5\"",
      weight: '140 lbs',
      bio: 'Former elementary school teacher. Loves working with kids.',
      medical_allergies: 'Gluten intolerance.',
      household: [
        { name: 'Carlos Santos', age: 7, notes: 'ADHD, on medication' },
        { name: 'Isabella Santos', age: 4, notes: 'No issues' }
      ],
      group_id: 'family-santos',
      group_label: 'Santos Family',
      ally_standing: 91,
      status: 'online',
      roles: ['verified', 'women', 'adult'],
      joined: '2025-07-15'
    },
    {
      user_id: 'user-010',
      display_name: 'Kevin O\'Brien',
      avatar_url: null,
      role_tags: ['security'],
      skills: ['Firearms Safety', 'Conflict Resolution', 'Self Defense'],
      languages: ['English'],
      education_level: 'Some College',
      age_band: '18-25',
      height: "6'0\"",
      weight: '180 lbs',
      bio: 'Former security guard. Currently training in emergency response.',
      medical_allergies: 'None.',
      household: [],
      group_id: null,
      group_label: null,
      ally_standing: 65,
      status: 'offline',
      roles: ['verified'],
      joined: '2025-09-01'
    },
    {
      user_id: 'user-011',
      display_name: 'Jennifer Lee',
      avatar_url: null,
      role_tags: ['logistics'],
      skills: ['Supply Chain', 'Inventory Management', 'Navigation'],
      languages: ['English', 'Korean'],
      education_level: 'Master',
      age_band: '36-45',
      height: "5'6\"",
      weight: '130 lbs',
      bio: 'Supply chain manager. Expert in resource allocation and distribution.',
      medical_allergies: 'Codeine.',
      household: [],
      group_id: null,
      group_label: null,
      ally_standing: 89,
      status: 'online',
      roles: ['verified', 'women', 'adult'],
      joined: '2025-06-25'
    },
    {
      user_id: 'user-012',
      display_name: 'Michael Brown',
      avatar_url: null,
      role_tags: ['scout', 'food'],
      skills: ['Hunting', 'Tracking', 'Water Purification', 'Foraging'],
      languages: ['English'],
      education_level: 'High School',
      age_band: '36-45',
      height: "5'11\"",
      weight: '185 lbs',
      bio: 'Lifelong hunter and outdoorsman. Expert tracker.',
      medical_allergies: 'None.',
      household: [{ name: 'Tommy Brown', age: 12, notes: 'Learning to hunt' }],
      group_id: 'family-brown',
      group_label: 'Brown Family',
      ally_standing: 82,
      status: 'away',
      roles: ['verified', 'adult'],
      joined: '2025-08-10'
    },
  ];
  
  return users;
};

// Generate mock incidents
const generateMockIncidents = () => [
  {
    case_id: 'INC-2025-001',
    user_id: 'user-010',
    type: 'Rule Violation',
    summary: 'Unauthorized entry to restricted storage area',
    ts: '2025-10-15T14:30:00Z',
    location: 'Storage Building B',
    involved_parties: ['user-010'],
    witnesses: ['user-002'],
    evidence_notes: 'Security camera footage reviewed',
    severity: 'Medium',
    status: 'Resolved',
    outcome: 'Warning',
    score_delta: -10,
    notes: 'First offense. User acknowledged mistake and apologized.',
    approvals: [{ approver: 'user-007', ts: '2025-10-16T09:00:00Z' }]
  },
  {
    case_id: 'INC-2025-002',
    user_id: 'user-006',
    type: 'Safety Concern',
    summary: 'Improper tool storage leading to minor injury',
    ts: '2025-11-02T10:15:00Z',
    location: 'Workshop',
    involved_parties: ['user-006', 'user-004'],
    witnesses: ['user-008'],
    evidence_notes: 'Photos of unsafe storage, medical report',
    severity: 'Medium',
    status: 'Resolved',
    outcome: 'Coaching',
    score_delta: -5,
    notes: 'Tool safety refresher completed. Storage area reorganized.',
    approvals: [{ approver: 'user-002', ts: '2025-11-03T11:00:00Z' }]
  },
  {
    case_id: 'INC-2025-003',
    user_id: 'user-010',
    type: 'Conduct Issue',
    summary: 'Verbal altercation during resource distribution',
    ts: '2025-12-01T16:45:00Z',
    location: 'Community Center',
    involved_parties: ['user-010', 'user-012'],
    witnesses: ['user-003', 'user-009'],
    evidence_notes: 'Multiple witness statements collected',
    severity: 'Medium',
    status: 'Investigating',
    outcome: null,
    score_delta: 0,
    notes: 'Awaiting mediation session.',
    approvals: []
  },
  {
    case_id: 'INC-2025-004',
    user_id: 'user-005',
    type: 'Positive Recognition',
    summary: 'Exceptional service during emergency evacuation',
    ts: '2025-11-20T08:00:00Z',
    location: 'North Perimeter',
    involved_parties: ['user-005'],
    witnesses: ['user-002', 'user-007', 'user-001'],
    evidence_notes: 'Multiple commendations received',
    severity: 'Low',
    status: 'Resolved',
    outcome: 'Recognition',
    score_delta: 5,
    notes: 'Led evacuation of 15 people safely.',
    approvals: [{ approver: 'user-007', ts: '2025-11-21T10:00:00Z' }]
  },
];

// Generate mock chat messages
const generateMockMessages = (channel) => {
  const messages = {
    global: [
      { id: 1, user_id: 'user-001', user_name: 'Sarah Chen', text: 'Good morning everyone! Weather looks clear today.', ts: '2025-12-09T08:15:00Z', pinned: false },
      { id: 2, user_id: 'user-002', user_name: 'Marcus Johnson', text: 'Morning! Perimeter check complete. All clear.', ts: '2025-12-09T08:20:00Z', pinned: false },
      { id: 3, user_id: 'user-004', user_name: 'David Park', text: 'Mesh network is stable. Signal strength looking good across all nodes.', ts: '2025-12-09T08:45:00Z', pinned: true },
      { id: 4, user_id: 'user-003', user_name: 'Elena Rodriguez', text: 'Lunch will be ready at 12:30. We have plenty for everyone.', ts: '2025-12-09T11:30:00Z', pinned: false },
      { id: 5, user_id: 'user-007', user_name: 'Lisa Wong', text: 'Reminder: Health check station open 2-4pm today.', ts: '2025-12-09T13:00:00Z', pinned: true },
    ],
    women: [
      { id: 1, user_id: 'user-001', user_name: 'Sarah Chen', text: 'Welcome to the Women Only channel. This is a safe space for support and discussion.', ts: '2025-12-08T10:00:00Z', pinned: true },
      { id: 2, user_id: 'user-003', user_name: 'Elena Rodriguez', text: 'Thanks for creating this space. Really appreciate it.', ts: '2025-12-08T10:15:00Z', pinned: false },
      { id: 3, user_id: 'user-009', user_name: 'Maria Santos', text: 'Anyone have tips for keeping kids entertained during downtime?', ts: '2025-12-09T09:00:00Z', pinned: false },
    ],
    adults: [
      { id: 1, user_id: 'user-002', user_name: 'Marcus Johnson', text: 'This channel is for mature discussions. Please be respectful.', ts: '2025-12-07T14:00:00Z', pinned: true },
      { id: 2, user_id: 'user-006', user_name: 'Robert Thompson', text: 'Security protocol discussion: Should we increase night patrols?', ts: '2025-12-09T07:00:00Z', pinned: false },
    ],
  };
  return messages[channel] || [];
};

const MOCK_USERS = generateMockUsers();
const MOCK_INCIDENTS = generateMockIncidents();

// ============================================================
// UTILITY FUNCTIONS
// ============================================================

const getStandingColor = (score) => {
  if (score >= 90) return 'text-success';
  if (score >= 75) return 'text-primary';
  if (score >= 60) return 'text-warning';
  return 'text-destructive';
};

const getStandingBg = (score) => {
  if (score >= 90) return 'bg-success/20';
  if (score >= 75) return 'bg-primary/20';
  if (score >= 60) return 'bg-warning/20';
  return 'bg-destructive/20';
};

const getStatusColor = (status) => {
  if (status === 'online') return 'bg-success';
  if (status === 'away') return 'bg-warning';
  return 'bg-muted-foreground';
};

const formatTimeAgo = (ts) => {
  const diff = Date.now() - new Date(ts).getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  
  if (days > 0) return `${days}d ago`;
  if (hours > 0) return `${hours}h ago`;
  if (minutes > 0) return `${minutes}m ago`;
  return 'just now';
};

// ============================================================
// COMPONENTS
// ============================================================

// Tooltip Component
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

// Role Tag Badge
const RoleTagBadge = ({ roleId }) => {
  const role = ROLE_TAGS.find(r => r.id === roleId);
  if (!role) return null;
  const Icon = role.icon;
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium ${role.bg} ${role.color}`}>
      <Icon className="w-3 h-3" />
      {role.name}
    </span>
  );
};

// Visibility Badge
const VisibilityBadge = ({ level }) => {
  const config = {
    public: { icon: Globe, label: 'Public', color: 'text-success', bg: 'bg-success/20' },
    group: { icon: Users, label: 'Group', color: 'text-primary', bg: 'bg-primary/20' },
    operator: { icon: Shield, label: 'Operator Only', color: 'text-warning', bg: 'bg-warning/20' },
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

// Standing Score Display
const StandingScore = ({ score, showTooltip = true }) => {
  const content = (
    <div className={`flex items-center gap-1.5 px-2 py-1 rounded-lg ${getStandingBg(score)}`}>
      <Award className={`w-4 h-4 ${getStandingColor(score)}`} />
      <span className={`font-bold ${getStandingColor(score)}`}>{score}</span>
    </div>
  );
  
  if (!showTooltip) return content;
  
  return (
    <Tooltip content="Standing reflects verified case outcomes, not votes. Score changes only after incidents are resolved by moderators.">
      {content}
    </Tooltip>
  );
};

// User Avatar
const UserAvatar = ({ user, size = 'md' }) => {
  const sizeClasses = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-12 h-12 text-sm',
    lg: 'w-20 h-20 text-xl',
  };
  
  const initials = user.display_name.split(' ').map(n => n[0]).join('').slice(0, 2);
  
  return (
    <div className={`relative ${sizeClasses[size]} rounded-full bg-gradient-to-br from-primary/50 to-accent/50 flex items-center justify-center font-bold text-white`}>
      {user.avatar_url ? (
        <img src={user.avatar_url} alt={user.display_name} className="w-full h-full rounded-full object-cover" />
      ) : (
        initials
      )}
      <div className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full ${getStatusColor(user.status)} ring-2 ring-background`} />
    </div>
  );
};

// Channel Header
const ChannelHeader = ({ channel, onLock, isLocked, isOperator }) => {
  const channelInfo = {
    global: { name: 'Global Chat', icon: Globe, desc: 'Open to all community members. General announcements and discussions.' },
    women: { name: 'Women Only', icon: Heart, desc: 'Safe space for women. Role-gated: requires admin approval to join.' },
    adults: { name: 'Adults Only', icon: Shield, desc: 'Mature discussions. Requires 18+ confirmation and admin approval.' },
  };
  
  const info = channelInfo[channel];
  const Icon = info.icon;
  
  return (
    <div className="glass rounded-lg p-3 mb-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Icon className="w-5 h-5 text-primary" />
          <h3 className="font-semibold">{info.name}</h3>
          {channel !== 'global' && (
            <Lock className="w-3.5 h-3.5 text-muted-foreground" />
          )}
          {isLocked && (
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-destructive/20 text-destructive">Locked</span>
          )}
        </div>
        {isOperator && (
          <Button size="sm" variant="ghost" onClick={onLock} className="h-7">
            {isLocked ? 'Unlock' : 'Lock'}
          </Button>
        )}
      </div>
      <p className="text-xs text-muted-foreground mt-1">{info.desc}</p>
      {channel !== 'global' && (
        <p className="text-[10px] text-warning mt-2 flex items-center gap-1">
          <Info className="w-3 h-3" />
          Access is role-gated; admins approve requests.
        </p>
      )}
    </div>
  );
};

// Chat Message Component
const ChatMessage = ({ message, isOperator, onDelete, onPin, onMute }) => {
  const [showMenu, setShowMenu] = useState(false);
  
  return (
    <div className={`group flex gap-3 p-2 rounded-lg hover:bg-white/5 ${message.pinned ? 'bg-primary/10 border-l-2 border-primary' : ''}`}>
      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary/50 to-accent/50 flex items-center justify-center text-xs font-bold text-white flex-shrink-0">
        {message.user_name.split(' ').map(n => n[0]).join('').slice(0, 2)}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-sm">{message.user_name}</span>
          <span className="text-[10px] text-muted-foreground">{formatTimeAgo(message.ts)}</span>
          {message.pinned && <Pin className="w-3 h-3 text-primary" />}
        </div>
        <p className="text-sm mt-0.5">{message.text}</p>
      </div>
      {isOperator && (
        <div className="relative">
          <button 
            onClick={() => setShowMenu(!showMenu)}
            className="opacity-0 group-hover:opacity-100 p-1 hover:bg-secondary rounded transition-opacity"
          >
            <MoreVertical className="w-4 h-4" />
          </button>
          {showMenu && (
            <div className="absolute right-0 top-full mt-1 glass rounded-lg shadow-lg py-1 z-10 min-w-32">
              <button onClick={() => { onPin(message.id); setShowMenu(false); }} className="w-full px-3 py-1.5 text-xs text-left hover:bg-secondary flex items-center gap-2">
                <Pin className="w-3 h-3" /> {message.pinned ? 'Unpin' : 'Pin'}
              </button>
              <button onClick={() => { onDelete(message.id); setShowMenu(false); }} className="w-full px-3 py-1.5 text-xs text-left hover:bg-secondary flex items-center gap-2 text-destructive">
                <Trash2 className="w-3 h-3" /> Delete
              </button>
              <button onClick={() => { onMute(message.user_id); setShowMenu(false); }} className="w-full px-3 py-1.5 text-xs text-left hover:bg-secondary flex items-center gap-2">
                <VolumeX className="w-3 h-3" /> Mute User
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// Chats Tab
const ChatsTab = ({ currentUser }) => {
  const [activeChannel, setActiveChannel] = useState('global');
  const [messages, setMessages] = useState(() => generateMockMessages('global'));
  const [newMessage, setNewMessage] = useState('');
  const [lockedChannels, setLockedChannels] = useState([]);
  
  const isOperator = currentUser.roles.includes('operator');
  const canAccessWomen = currentUser.roles.includes('women') || isOperator;
  const canAccessAdults = currentUser.roles.includes('adult') || isOperator;
  
  const handleChannelChange = (channel) => {
    if (channel === 'women' && !canAccessWomen) {
      toast.error('You need the Women role to access this channel');
      return;
    }
    if (channel === 'adults' && !canAccessAdults) {
      toast.error('You need 18+ verification to access this channel');
      return;
    }
    setActiveChannel(channel);
    setMessages(generateMockMessages(channel));
  };
  
  const handleSend = () => {
    if (!newMessage.trim()) return;
    if (lockedChannels.includes(activeChannel)) {
      toast.error('This channel is currently locked');
      return;
    }
    setMessages(prev => [...prev, {
      id: Date.now(),
      user_id: currentUser.user_id,
      user_name: currentUser.display_name,
      text: newMessage,
      ts: new Date().toISOString(),
      pinned: false
    }]);
    setNewMessage('');
  };
  
  const handleDelete = (id) => {
    setMessages(prev => prev.filter(m => m.id !== id));
    toast.success('Message deleted');
  };
  
  const handlePin = (id) => {
    setMessages(prev => prev.map(m => m.id === id ? { ...m, pinned: !m.pinned } : m));
  };
  
  const handleMute = (userId) => {
    toast.success('User muted for 1 hour');
  };
  
  const toggleLock = () => {
    if (lockedChannels.includes(activeChannel)) {
      setLockedChannels(prev => prev.filter(c => c !== activeChannel));
      toast.success('Channel unlocked');
    } else {
      setLockedChannels(prev => [...prev, activeChannel]);
      toast.success('Channel locked');
    }
  };
  
  return (
    <div className="space-y-4">
      {/* Channel Tabs */}
      <div className="flex gap-2">
        {[
          { id: 'global', name: 'Global', icon: Globe, locked: false },
          { id: 'women', name: 'Women Only', icon: Heart, locked: !canAccessWomen },
          { id: 'adults', name: 'Adults Only', icon: Shield, locked: !canAccessAdults },
        ].map(ch => (
          <button
            key={ch.id}
            onClick={() => handleChannelChange(ch.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeChannel === ch.id ? 'bg-primary text-white' : 'glass hover:bg-secondary'
            } ${ch.locked ? 'opacity-50' : ''}`}
          >
            <ch.icon className="w-4 h-4" />
            {ch.name}
            {ch.locked && <Lock className="w-3 h-3" />}
          </button>
        ))}
      </div>
      
      {/* Channel Content */}
      <div className="glass rounded-xl p-4">
        <ChannelHeader 
          channel={activeChannel} 
          onLock={toggleLock}
          isLocked={lockedChannels.includes(activeChannel)}
          isOperator={isOperator}
        />
        
        {/* Messages */}
        <div className="h-96 overflow-y-auto space-y-1 mb-4">
          {messages.map(msg => (
            <ChatMessage 
              key={msg.id} 
              message={msg} 
              isOperator={isOperator}
              onDelete={handleDelete}
              onPin={handlePin}
              onMute={handleMute}
            />
          ))}
        </div>
        
        {/* Composer */}
        <div className="flex gap-2">
          <Button size="sm" variant="outline" className="h-10">
            <Paperclip className="w-4 h-4" />
          </Button>
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            placeholder={lockedChannels.includes(activeChannel) ? 'Channel is locked' : 'Type a message...'}
            disabled={lockedChannels.includes(activeChannel)}
            className="flex-1"
          />
          <Button onClick={handleSend} disabled={lockedChannels.includes(activeChannel)} className="h-10">
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

// User Card
const UserCard = ({ user, onClick }) => (
  <button
    onClick={onClick}
    className="glass rounded-xl p-4 text-left hover:bg-white/10 transition-all w-full"
    data-testid={`user-card-${user.user_id}`}
  >
    <div className="flex items-start gap-3">
      <UserAvatar user={user} size="md" />
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold truncate">{user.display_name}</h3>
          <StandingScore score={user.ally_standing} />
        </div>
        <div className="flex flex-wrap gap-1 mt-1">
          {user.role_tags.slice(0, 3).map(tag => (
            <RoleTagBadge key={tag} roleId={tag} />
          ))}
        </div>
        <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <Languages className="w-3 h-3" />
            {user.languages.slice(0, 2).join(', ')}
          </span>
          <span className="flex items-center gap-1">
            <GraduationCap className="w-3 h-3" />
            {user.education_level}
          </span>
        </div>
      </div>
      <ChevronRight className="w-5 h-5 text-muted-foreground" />
    </div>
  </button>
);

// Profile View
const ProfileView = ({ user, onBack, incidents, isOperator }) => {
  const [showMedical, setShowMedical] = useState(false);
  const [showIncidentForm, setShowIncidentForm] = useState(false);
  
  const userIncidents = incidents.filter(i => i.user_id === user.user_id);
  
  return (
    <div className="space-y-4">
      <Button variant="ghost" onClick={onBack} className="mb-2">
        ← Back to Allies
      </Button>
      
      {/* Header */}
      <div className="glass rounded-xl p-6">
        <div className="flex items-start gap-4">
          <UserAvatar user={user} size="lg" />
          <div className="flex-1">
            <div className="flex items-center gap-3">
              <h2 className="text-xl font-bold">{user.display_name}</h2>
              <StandingScore score={user.ally_standing} />
            </div>
            <div className="flex flex-wrap gap-1.5 mt-2">
              {user.role_tags.map(tag => (
                <RoleTagBadge key={tag} roleId={tag} />
              ))}
            </div>
            {user.group_label && (
              <div className="flex items-center gap-1.5 mt-2 text-sm text-muted-foreground">
                <Home className="w-4 h-4" />
                {user.group_label}
              </div>
            )}
            <p className="text-sm text-muted-foreground mt-3">{user.bio}</p>
          </div>
        </div>
      </div>
      
      {/* Overview */}
      <div className="glass rounded-xl p-4">
        <h3 className="font-semibold mb-3 flex items-center gap-2">
          <User className="w-4 h-4 text-primary" />
          Overview
          <VisibilityBadge level="public" />
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="glass rounded-lg p-2">
            <span className="text-[10px] text-muted-foreground">Languages</span>
            <p className="text-sm font-medium">{user.languages.join(', ')}</p>
          </div>
          <div className="glass rounded-lg p-2">
            <span className="text-[10px] text-muted-foreground">Education</span>
            <p className="text-sm font-medium">{user.education_level}</p>
          </div>
          <div className="glass rounded-lg p-2">
            <span className="text-[10px] text-muted-foreground">Age Band</span>
            <p className="text-sm font-medium">{user.age_band || 'Not specified'}</p>
          </div>
          <div className="glass rounded-lg p-2">
            <span className="text-[10px] text-muted-foreground">Joined</span>
            <p className="text-sm font-medium">{new Date(user.joined).toLocaleDateString()}</p>
          </div>
        </div>
      </div>
      
      {/* Skills */}
      <div className="glass rounded-xl p-4">
        <h3 className="font-semibold mb-3 flex items-center gap-2">
          <Briefcase className="w-4 h-4 text-primary" />
          Skills
          <VisibilityBadge level="public" />
        </h3>
        <div className="flex flex-wrap gap-1.5">
          {user.skills.map(skill => (
            <span key={skill} className="px-2 py-1 rounded-full bg-secondary text-xs">{skill}</span>
          ))}
        </div>
      </div>
      
      {/* Physical Stats */}
      <div className="glass rounded-xl p-4">
        <h3 className="font-semibold mb-3 flex items-center gap-2">
          <Activity className="w-4 h-4 text-primary" />
          Physical Stats
          <VisibilityBadge level="group" />
        </h3>
        <p className="text-xs text-muted-foreground mb-3">Optional information shared within the group for resource planning.</p>
        <div className="grid grid-cols-3 gap-3">
          <div className="glass rounded-lg p-2">
            <span className="text-[10px] text-muted-foreground">Height</span>
            <p className="text-sm font-medium">{user.height || 'Not specified'}</p>
          </div>
          <div className="glass rounded-lg p-2">
            <span className="text-[10px] text-muted-foreground">Weight</span>
            <p className="text-sm font-medium">{user.weight || 'Not specified'}</p>
          </div>
          <div className="glass rounded-lg p-2">
            <span className="text-[10px] text-muted-foreground">Age Band</span>
            <p className="text-sm font-medium">{user.age_band || 'Not specified'}</p>
          </div>
        </div>
      </div>
      
      {/* Medical & Allergies */}
      <div className="glass rounded-xl p-4 border border-destructive/30">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold flex items-center gap-2">
            <Stethoscope className="w-4 h-4 text-destructive" />
            Medical & Allergies
            <VisibilityBadge level="sensitive" />
          </h3>
          {isOperator && (
            <Button size="sm" variant="outline" onClick={() => setShowMedical(!showMedical)} className="h-7">
              {showMedical ? <EyeOff className="w-3 h-3 mr-1" /> : <Eye className="w-3 h-3 mr-1" />}
              {showMedical ? 'Hide' : 'Reveal'}
            </Button>
          )}
        </div>
        {showMedical ? (
          <p className="text-sm">{user.medical_allergies}</p>
        ) : (
          <p className="text-sm text-muted-foreground italic">
            Sensitive information hidden. {isOperator ? 'Click Reveal to view.' : 'Operator access required.'}
          </p>
        )}
      </div>
      
      {/* Household */}
      {user.household.length > 0 && (
        <div className="glass rounded-xl p-4">
          <h3 className="font-semibold mb-3 flex items-center gap-2">
            <Baby className="w-4 h-4 text-pink-400" />
            Household Members
            <VisibilityBadge level="group" />
          </h3>
          <div className="space-y-2">
            {user.household.map((member, idx) => (
              <div key={idx} className="glass rounded-lg p-3 flex items-center justify-between">
                <div>
                  <p className="font-medium text-sm">{member.name}</p>
                  <p className="text-xs text-muted-foreground">Age: {member.age}</p>
                </div>
                {member.notes && (
                  <span className="text-xs text-muted-foreground">{member.notes}</span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Incident Reports */}
      <div className="glass rounded-xl p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold flex items-center gap-2">
            <FileText className="w-4 h-4 text-primary" />
            Incident Reports ({userIncidents.length})
            <VisibilityBadge level="operator" />
          </h3>
          {isOperator && (
            <Button size="sm" onClick={() => setShowIncidentForm(true)} className="h-7">
              <Plus className="w-3 h-3 mr-1" /> Submit Report
            </Button>
          )}
        </div>
        
        {userIncidents.length > 0 ? (
          <div className="space-y-2">
            {userIncidents.map(incident => (
              <div key={incident.case_id} className={`glass rounded-lg p-3 ${incident.outcome === 'Recognition' ? 'border-l-2 border-success' : incident.status === 'Resolved' ? 'border-l-2 border-primary' : 'border-l-2 border-warning'}`}>
                <div className="flex items-center justify-between mb-1">
                  <span className="font-mono text-xs text-muted-foreground">{incident.case_id}</span>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full ${
                    incident.status === 'Resolved' ? 'bg-success/20 text-success' :
                    incident.status === 'Investigating' ? 'bg-warning/20 text-warning' :
                    'bg-secondary text-muted-foreground'
                  }`}>
                    {incident.status}
                  </span>
                </div>
                <p className="text-sm font-medium">{incident.type}: {incident.summary}</p>
                <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                  <span>{new Date(incident.ts).toLocaleDateString()}</span>
                  {incident.outcome && <span>Outcome: {incident.outcome}</span>}
                  {incident.score_delta !== 0 && (
                    <span className={incident.score_delta > 0 ? 'text-success' : 'text-destructive'}>
                      Standing: {incident.score_delta > 0 ? '+' : ''}{incident.score_delta}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground text-center py-4">No incident reports</p>
        )}
      </div>
      
      {/* Incident Form Modal would go here */}
      {showIncidentForm && (
        <IncidentReportForm user={user} onClose={() => setShowIncidentForm(false)} />
      )}
    </div>
  );
};

// Incident Report Form
const IncidentReportForm = ({ user, onClose }) => {
  const [formData, setFormData] = useState({
    type: 'Rule Violation',
    summary: '',
    location: '',
    severity: 'Low',
    evidence_notes: '',
  });
  
  const handleSubmit = () => {
    toast.success('Incident report submitted for review');
    onClose();
  };
  
  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div className="glass rounded-xl p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold">Submit Incident Report</h3>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </div>
        
        <p className="text-sm text-muted-foreground mb-4">
          Reporting for: <strong>{user.display_name}</strong>
        </p>
        
        <div className="space-y-4">
          <div>
            <label className="text-xs font-medium text-muted-foreground">Type</label>
            <select
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              className="w-full mt-1 bg-secondary rounded-lg px-3 py-2 text-sm"
            >
              <option>Rule Violation</option>
              <option>Safety Concern</option>
              <option>Conduct Issue</option>
              <option>Positive Recognition</option>
              <option>Other</option>
            </select>
          </div>
          
          <div>
            <label className="text-xs font-medium text-muted-foreground">Summary</label>
            <textarea
              value={formData.summary}
              onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
              className="w-full mt-1 bg-secondary rounded-lg px-3 py-2 text-sm h-20"
              placeholder="Brief description of the incident..."
            />
          </div>
          
          <div>
            <label className="text-xs font-medium text-muted-foreground">Location</label>
            <Input
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              placeholder="Where did this occur?"
              className="mt-1"
            />
          </div>
          
          <div>
            <label className="text-xs font-medium text-muted-foreground">Severity</label>
            <div className="flex gap-2 mt-1">
              {['Low', 'Medium', 'High'].map(sev => (
                <button
                  key={sev}
                  onClick={() => setFormData({ ...formData, severity: sev })}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    formData.severity === sev
                      ? sev === 'High' ? 'bg-destructive text-white' : sev === 'Medium' ? 'bg-warning text-black' : 'bg-primary text-white'
                      : 'glass'
                  }`}
                >
                  {sev}
                </button>
              ))}
            </div>
          </div>
          
          <div>
            <label className="text-xs font-medium text-muted-foreground">Evidence Notes</label>
            <textarea
              value={formData.evidence_notes}
              onChange={(e) => setFormData({ ...formData, evidence_notes: e.target.value })}
              className="w-full mt-1 bg-secondary rounded-lg px-3 py-2 text-sm h-20"
              placeholder="Witness names, photos, documents..."
            />
          </div>
        </div>
        
        <div className="flex gap-2 mt-6">
          <Button variant="outline" onClick={onClose} className="flex-1">Cancel</Button>
          <Button onClick={handleSubmit} className="flex-1">Submit Report</Button>
        </div>
      </div>
    </div>
  );
};

// Allies Tab
const AlliesTab = ({ users, incidents, currentUser }) => {
  const [selectedUser, setSelectedUser] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  
  const isOperator = currentUser.roles.includes('operator');
  
  const filteredUsers = useMemo(() => {
    return users.filter(u => {
      const matchesSearch = u.display_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.skills.some(s => s.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchesRole = filterRole === 'all' || u.role_tags.includes(filterRole);
      return matchesSearch && matchesRole;
    });
  }, [users, searchQuery, filterRole]);
  
  if (selectedUser) {
    return (
      <ProfileView 
        user={selectedUser} 
        onBack={() => setSelectedUser(null)} 
        incidents={incidents}
        isOperator={isOperator}
      />
    );
  }
  
  return (
    <div className="space-y-4">
      <div className="glass rounded-xl p-4">
        <h2 className="text-lg font-bold mb-1">Meet Your Allies</h2>
        <p className="text-sm text-muted-foreground">
          Get to know your community members, their skills, and how they can help.
        </p>
      </div>
      
      {/* Search & Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name or skill..."
            className="pl-10"
          />
        </div>
        <select
          value={filterRole}
          onChange={(e) => setFilterRole(e.target.value)}
          className="bg-secondary rounded-lg px-3 py-2 text-sm"
        >
          <option value="all">All Roles</option>
          {ROLE_TAGS.map(role => (
            <option key={role.id} value={role.id}>{role.name}</option>
          ))}
        </select>
      </div>
      
      {/* User Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {filteredUsers.map(user => (
          <UserCard key={user.user_id} user={user} onClick={() => setSelectedUser(user)} />
        ))}
      </div>
      
      {filteredUsers.length === 0 && (
        <div className="text-center py-12 glass rounded-xl">
          <Users className="w-12 h-12 mx-auto mb-3 text-muted-foreground/50" />
          <p className="text-muted-foreground">No allies match your search</p>
        </div>
      )}
    </div>
  );
};

// Analytics Tab
const AnalyticsTab = ({ users }) => {
  // Calculate analytics
  const analytics = useMemo(() => {
    // Status counts
    const statusCounts = {
      online: users.filter(u => u.status === 'online').length,
      away: users.filter(u => u.status === 'away').length,
      offline: users.filter(u => u.status === 'offline').length,
    };
    
    // Role distribution
    const roleDistribution = {};
    ROLE_TAGS.forEach(role => {
      roleDistribution[role.id] = users.filter(u => u.role_tags.includes(role.id)).length;
    });
    
    // Skills coverage
    const skillsCoverage = {};
    SKILLS_LIST.forEach(skill => {
      skillsCoverage[skill] = users.filter(u => u.skills.includes(skill)).length;
    });
    
    // Top skills (most covered)
    const topSkills = Object.entries(skillsCoverage)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10);
    
    // Gap skills (least covered, but important)
    const criticalSkills = ['CPR Certified', 'Trauma Care', 'Ham Radio', 'Water Purification', 'Vehicle Repair', 'Solar Systems'];
    const gapSkills = criticalSkills
      .map(skill => ({ skill, count: skillsCoverage[skill] || 0 }))
      .filter(s => s.count < 2)
      .sort((a, b) => a.count - b.count);
    
    // Demographics
    const ageBandCounts = {};
    AGE_BANDS.forEach(band => {
      ageBandCounts[band] = users.filter(u => u.age_band === band).length;
    });
    
    const languageCounts = {};
    LANGUAGES.forEach(lang => {
      languageCounts[lang] = users.filter(u => u.languages.includes(lang)).length;
    });
    
    const educationCounts = {};
    EDUCATION_LEVELS.forEach(edu => {
      educationCounts[edu] = users.filter(u => u.education_level === edu).length;
    });
    
    // Average standing
    const avgStanding = Math.round(users.reduce((a, u) => a + u.ally_standing, 0) / users.length);
    
    return {
      statusCounts,
      roleDistribution,
      topSkills,
      gapSkills,
      ageBandCounts,
      languageCounts,
      educationCounts,
      avgStanding,
      totalUsers: users.length,
    };
  }, [users]);
  
  return (
    <div className="space-y-6">
      {/* Group Overview */}
      <div className="glass rounded-xl p-4">
        <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-primary" />
          Group Overview
        </h2>
        
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="glass rounded-lg p-3 text-center">
            <div className="text-2xl font-bold text-primary">{analytics.totalUsers}</div>
            <p className="text-xs text-muted-foreground">Total Members</p>
          </div>
          <div className="glass rounded-lg p-3 text-center">
            <div className="text-2xl font-bold text-success">{analytics.statusCounts.online}</div>
            <p className="text-xs text-muted-foreground">Online Now</p>
          </div>
          <div className="glass rounded-lg p-3 text-center">
            <div className={`text-2xl font-bold ${getStandingColor(analytics.avgStanding)}`}>{analytics.avgStanding}</div>
            <p className="text-xs text-muted-foreground">Avg Standing</p>
          </div>
          <div className="glass rounded-lg p-3 text-center">
            <div className="text-2xl font-bold text-amber-400">{Object.values(analytics.roleDistribution).filter(v => v > 0).length}</div>
            <p className="text-xs text-muted-foreground">Role Types</p>
          </div>
        </div>
      </div>
      
      {/* Role Distribution */}
      <div className="glass rounded-xl p-4">
        <h3 className="font-semibold mb-4 flex items-center gap-2">
          <Shield className="w-4 h-4 text-primary" />
          Role Distribution
          <Tooltip content="Role tags are derived from self-reported skills, not physical attributes.">
            <HelpCircle className="w-3.5 h-3.5 text-muted-foreground cursor-help" />
          </Tooltip>
        </h3>
        
        <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
          {ROLE_TAGS.map(role => {
            const count = analytics.roleDistribution[role.id];
            const Icon = role.icon;
            return (
              <div key={role.id} className={`glass rounded-lg p-2 text-center ${count === 0 ? 'opacity-50' : ''}`}>
                <div className={`w-8 h-8 mx-auto rounded-full ${role.bg} flex items-center justify-center mb-1`}>
                  <Icon className={`w-4 h-4 ${role.color}`} />
                </div>
                <div className="text-lg font-bold">{count}</div>
                <p className="text-[10px] text-muted-foreground">{role.name}</p>
              </div>
            );
          })}
        </div>
      </div>
      
      {/* Strengths vs Gaps */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Strongest Coverage */}
        <div className="glass rounded-xl p-4">
          <h3 className="font-semibold mb-3 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-success" />
            Strongest Coverage
          </h3>
          <div className="space-y-2">
            {analytics.topSkills.slice(0, 6).map(([skill, count]) => (
              <div key={skill} className="flex items-center justify-between">
                <span className="text-sm">{skill}</span>
                <div className="flex items-center gap-2">
                  <div className="w-24 h-2 rounded-full bg-secondary overflow-hidden">
                    <div 
                      className="h-full bg-success rounded-full" 
                      style={{ width: `${(count / analytics.totalUsers) * 100}%` }}
                    />
                  </div>
                  <span className="text-xs text-muted-foreground w-8">{count}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {/* Skill Gaps */}
        <div className="glass rounded-xl p-4 border border-warning/30">
          <h3 className="font-semibold mb-3 flex items-center gap-2">
            <TrendingDown className="w-4 h-4 text-warning" />
            Skill Gaps (Critical)
          </h3>
          {analytics.gapSkills.length > 0 ? (
            <>
              <div className="space-y-2">
                {analytics.gapSkills.map(({ skill, count }) => (
                  <div key={skill} className="flex items-center justify-between p-2 bg-warning/10 rounded-lg">
                    <span className="text-sm">{skill}</span>
                    <span className={`text-xs font-medium ${count === 0 ? 'text-destructive' : 'text-warning'}`}>
                      {count === 0 ? 'No coverage' : `${count} member${count > 1 ? 's' : ''}`}
                    </span>
                  </div>
                ))}
              </div>
              <div className="mt-3 p-2 bg-primary/10 rounded-lg">
                <p className="text-xs">
                  <strong>Recommendation:</strong> Consider recruiting members with these critical skills or organizing training sessions.
                </p>
              </div>
            </>
          ) : (
            <p className="text-sm text-success">All critical skills covered!</p>
          )}
        </div>
      </div>
      
      {/* Demographics Summary */}
      <div className="glass rounded-xl p-4">
        <h3 className="font-semibold mb-4 flex items-center gap-2">
          <Users className="w-4 h-4 text-primary" />
          Demographics Summary
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-secondary text-muted-foreground">Aggregated only</span>
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Languages */}
          <div>
            <h4 className="text-sm font-medium mb-2 flex items-center gap-1">
              <Languages className="w-3.5 h-3.5" /> Languages Spoken
            </h4>
            <div className="space-y-1">
              {Object.entries(analytics.languageCounts)
                .filter(([_, count]) => count > 0)
                .sort((a, b) => b[1] - a[1])
                .slice(0, 5)
                .map(([lang, count]) => (
                  <div key={lang} className="flex items-center justify-between text-xs">
                    <span>{lang}</span>
                    <span className="text-muted-foreground">{count}</span>
                  </div>
                ))}
            </div>
          </div>
          
          {/* Education */}
          <div>
            <h4 className="text-sm font-medium mb-2 flex items-center gap-1">
              <GraduationCap className="w-3.5 h-3.5" /> Education Levels
            </h4>
            <div className="space-y-1">
              {Object.entries(analytics.educationCounts)
                .filter(([_, count]) => count > 0)
                .sort((a, b) => b[1] - a[1])
                .slice(0, 5)
                .map(([edu, count]) => (
                  <div key={edu} className="flex items-center justify-between text-xs">
                    <span>{edu}</span>
                    <span className="text-muted-foreground">{count}</span>
                  </div>
                ))}
            </div>
          </div>
          
          {/* Age Bands */}
          <div>
            <h4 className="text-sm font-medium mb-2 flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" /> Age Distribution
            </h4>
            <div className="space-y-1">
              {Object.entries(analytics.ageBandCounts)
                .filter(([_, count]) => count > 0)
                .map(([band, count]) => (
                  <div key={band} className="flex items-center justify-between text-xs">
                    <span>{band}</span>
                    <span className="text-muted-foreground">{count}</span>
                  </div>
                ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ============================================================
// MAIN COMPONENT
// ============================================================

export default function Community({ isOpen, onClose }) {
  const [activeTab, setActiveTab] = useState('chats');
  
  // Current user (would come from auth in real app)
  const currentUser = MOCK_USERS.find(u => u.user_id === 'user-002'); // Marcus Johnson (operator)
  
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 z-50 bg-background overflow-y-auto" data-testid="community-page">
      {/* Header */}
      <div className="sticky top-0 z-10 glass border-b border-border">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-primary/20">
                <Users className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h1 className="text-lg font-bold">Community</h1>
                <p className="text-xs text-muted-foreground hidden sm:block">Connect, collaborate, and coordinate</p>
              </div>
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
          
          {/* Tabs */}
          <div className="flex gap-2 mt-3">
            {[
              { id: 'chats', name: 'Chats', icon: MessageSquare },
              { id: 'allies', name: 'Allies', icon: Users },
              { id: 'analytics', name: 'Analytics', icon: BarChart3 },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === tab.id ? 'bg-primary text-white' : 'glass hover:bg-secondary'
                }`}
                data-testid={`tab-${tab.id}`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.name}
              </button>
            ))}
          </div>
        </div>
      </div>
      
      {/* Content */}
      <div className="container mx-auto px-4 py-6">
        {activeTab === 'chats' && <ChatsTab currentUser={currentUser} />}
        {activeTab === 'allies' && <AlliesTab users={MOCK_USERS} incidents={MOCK_INCIDENTS} currentUser={currentUser} />}
        {activeTab === 'analytics' && <AnalyticsTab users={MOCK_USERS} />}
      </div>
    </div>
  );
}
