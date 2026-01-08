import React, { useState, useEffect, lazy, Suspense } from 'react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { 
  X, 
  MessageSquare, 
  RefreshCw, 
  Star,
  Cpu,
  HardDrive,
  Thermometer,
  Battery,
  MapPin,
  Wifi,
  Server,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  Activity,
  Wind,
  Droplets,
  Gauge,
  Radio,
  Globe,
  HelpCircle,
  Circle,
  Loader2,
  Navigation,
  ExternalLink,
  Copy,
  Maximize2,
  User,
  Shield,
  Heart,
  Wrench,
  Zap,
  Target,
  Brain,
  Flame,
  Compass,
  Swords,
  Cross,
  TreePine,
  Car,
  Radio as RadioIcon,
  Home,
  Utensils,
  Package,
  Eye,
  Ear,
  Hand,
  Footprints,
  Award,
  Briefcase,
  GraduationCap,
  Calendar,
  Ruler,
  Scale,
  Palette,
  ChevronDown,
  ChevronUp,
  Edit3,
  Save,
  Phone,
  Mail,
  Users
} from 'lucide-react';
import { toast } from 'sonner';
import allyApi from '../../services/allyApi';

// Lazy load the map component
const NodeMiniMap = lazy(() => import('./NodeMiniMap'));

// ============================================
// SKILL CLASS SYSTEM
// ============================================
const SKILL_CLASSES = {
  combat: { 
    name: 'Combat', 
    icon: Swords, 
    color: 'text-red-500', 
    bg: 'bg-red-500/20',
    skills: ['Firearms', 'Hand-to-Hand', 'Tactical', 'Archery', 'Knife Fighting', 'Security']
  },
  medical: { 
    name: 'Medical', 
    icon: Cross, 
    color: 'text-pink-500', 
    bg: 'bg-pink-500/20',
    skills: ['First Aid', 'Trauma Care', 'Surgery', 'Pharmacy', 'Mental Health', 'Veterinary']
  },
  survival: { 
    name: 'Survival', 
    icon: TreePine, 
    color: 'text-green-500', 
    bg: 'bg-green-500/20',
    skills: ['Foraging', 'Hunting', 'Trapping', 'Shelter Building', 'Fire Making', 'Water Purification']
  },
  technical: { 
    name: 'Technical', 
    icon: Wrench, 
    color: 'text-blue-500', 
    bg: 'bg-blue-500/20',
    skills: ['Electronics', 'Mechanical', 'Welding', 'Carpentry', 'Plumbing', 'Solar/Power']
  },
  communications: { 
    name: 'Comms', 
    icon: RadioIcon, 
    color: 'text-cyan-500', 
    bg: 'bg-cyan-500/20',
    skills: ['HAM Radio', 'Encryption', 'Signal Intelligence', 'Network Admin', 'Satellite Comms']
  },
  navigation: { 
    name: 'Navigation', 
    icon: Compass, 
    color: 'text-yellow-500', 
    bg: 'bg-yellow-500/20',
    skills: ['Land Nav', 'Maritime', 'Driving', 'Piloting', 'GPS/Maps', 'Tracking']
  },
  provisions: { 
    name: 'Provisions', 
    icon: Utensils, 
    color: 'text-orange-500', 
    bg: 'bg-orange-500/20',
    skills: ['Cooking', 'Food Preservation', 'Farming', 'Animal Husbandry', 'Brewing', 'Butchering']
  },
  leadership: { 
    name: 'Leadership', 
    icon: Users, 
    color: 'text-purple-500', 
    bg: 'bg-purple-500/20',
    skills: ['Command', 'Negotiation', 'Teaching', 'Morale', 'Planning', 'Conflict Resolution']
  },
};

// Mock profile data for each node
const getMockProfile = (nodeId) => {
  const profiles = {
    'omega-01': {
      fullName: 'Michael "Dad" Rodriguez',
      callsign: 'PAPA BEAR',
      age: 52,
      bloodType: 'O+',
      height: "6'1\"",
      weight: '195 lbs',
      hairColor: 'Salt & Pepper',
      eyeColor: 'Brown',
      distinguishingFeatures: 'Scar on left forearm, tribal tattoo right shoulder',
      medicalConditions: ['Mild hypertension (controlled)', 'Reading glasses required'],
      allergies: ['Penicillin'],
      primaryClass: 'leadership',
      secondaryClass: 'technical',
      skillLevels: {
        combat: { Firearms: 4, Tactical: 3, 'Hand-to-Hand': 2 },
        medical: { 'First Aid': 3, 'Trauma Care': 2 },
        survival: { Hunting: 3, 'Fire Making': 4, 'Water Purification': 3 },
        technical: { Mechanical: 5, Electronics: 4, 'Solar/Power': 4, Welding: 3 },
        communications: { 'HAM Radio': 5, 'Network Admin': 3 },
        navigation: { 'Land Nav': 4, Driving: 4, 'GPS/Maps': 5 },
        provisions: { Cooking: 3, 'Food Preservation': 2 },
        leadership: { Command: 5, Planning: 5, Teaching: 4, Negotiation: 3 },
      },
      pastJobs: [
        { title: 'Electrical Engineer', company: 'Pacific Gas & Electric', years: '2005-2020' },
        { title: 'Army Reserve - Staff Sergeant', company: 'US Army', years: '1995-2015' },
        { title: 'Volunteer Firefighter', company: 'Marin County FD', years: '2010-Present' },
      ],
      certifications: ['HAM Extra Class', 'CPR/AED Instructor', 'CERT Trained', 'NRA RSO'],
      equipment: ['Primary: AR-15', 'Sidearm: Glock 19', 'Handheld: Baofeng UV-5R', 'Solar: 200W Panel Kit'],
      notes: 'Group leader. Primary comms operator. Responsible for power systems and network infrastructure.',
      emergencyContact: { name: 'Sarah Rodriguez (Wife)', relation: 'Spouse', method: 'Node omega-02' },
    },
    'omega-02': {
      fullName: 'Sarah Rodriguez',
      callsign: 'MAMA BEAR',
      age: 49,
      bloodType: 'A+',
      height: "5'6\"",
      weight: '140 lbs',
      hairColor: 'Auburn',
      eyeColor: 'Green',
      distinguishingFeatures: 'Freckles, small birthmark on neck',
      medicalConditions: ['None'],
      allergies: ['Shellfish', 'Latex'],
      primaryClass: 'medical',
      secondaryClass: 'provisions',
      skillLevels: {
        combat: { Firearms: 2, 'Hand-to-Hand': 1 },
        medical: { 'First Aid': 5, 'Trauma Care': 4, Surgery: 3, Pharmacy: 4, 'Mental Health': 3 },
        survival: { Foraging: 4, 'Water Purification': 3 },
        technical: { Electronics: 2 },
        communications: { 'HAM Radio': 2 },
        navigation: { 'GPS/Maps': 3, Driving: 3 },
        provisions: { Cooking: 5, 'Food Preservation': 5, Farming: 4, 'Animal Husbandry': 3 },
        leadership: { Teaching: 4, Morale: 5, 'Conflict Resolution': 4 },
      },
      pastJobs: [
        { title: 'Registered Nurse (ER)', company: 'UCSF Medical Center', years: '2000-2022' },
        { title: 'School Nurse', company: 'Mill Valley Elementary', years: '2022-Present' },
      ],
      certifications: ['RN License', 'ACLS', 'PALS', 'Wilderness First Responder', 'Master Gardener'],
      equipment: ['Sidearm: S&W M&P Shield', 'Medical Kit: Full Trauma', 'Handheld: Baofeng UV-5R'],
      notes: 'Primary medical provider. Manages food stores and meal planning. Excellent at keeping group morale high.',
      emergencyContact: { name: 'Michael Rodriguez (Husband)', relation: 'Spouse', method: 'Node omega-01' },
    },
    'omega-03': {
      fullName: 'Emma & Jake Rodriguez',
      callsign: 'CUB PACK',
      age: '14 & 12',
      bloodType: 'O+ / A+',
      height: "5'4\" / 4'11\"",
      weight: '115 lbs / 95 lbs',
      hairColor: 'Brown / Brown',
      eyeColor: 'Green / Brown',
      distinguishingFeatures: 'Emma: braces. Jake: glasses',
      medicalConditions: ['Jake: Mild asthma (inhaler carried)'],
      allergies: ['None'],
      primaryClass: 'navigation',
      secondaryClass: 'communications',
      skillLevels: {
        combat: { 'Hand-to-Hand': 1 },
        medical: { 'First Aid': 2 },
        survival: { Foraging: 2, 'Fire Making': 2 },
        technical: { Electronics: 3 },
        communications: { 'HAM Radio': 2, 'Network Admin': 2 },
        navigation: { 'GPS/Maps': 4, 'Land Nav': 3 },
        provisions: { Cooking: 2 },
        leadership: { Morale: 3 },
      },
      pastJobs: [
        { title: 'Students', company: 'Mill Valley Middle School', years: 'Current' },
      ],
      certifications: ['HAM Technician Class (Emma)', 'Junior Lifeguard (Both)'],
      equipment: ['Handheld: Baofeng UV-5R (shared)', 'GPS: Garmin eTrex'],
      notes: 'Learning critical skills. Emma excels at radio operation. Jake is the map/GPS expert. Both trained in basic first aid.',
      emergencyContact: { name: 'Parents', relation: 'Parents', method: 'Nodes omega-01/02' },
    },
    'omega-04': {
      fullName: 'Robert "Bob" Chen',
      callsign: 'BACKUP',
      age: 45,
      bloodType: 'B+',
      height: "5'9\"",
      weight: '175 lbs',
      hairColor: 'Black',
      eyeColor: 'Brown',
      distinguishingFeatures: 'Tattoo of dragon on back, missing pinky finger (left hand)',
      medicalConditions: ['Type 2 Diabetes (managed with diet)'],
      allergies: ['None'],
      primaryClass: 'combat',
      secondaryClass: 'survival',
      skillLevels: {
        combat: { Firearms: 5, 'Hand-to-Hand': 5, Tactical: 5, 'Knife Fighting': 4, Security: 5 },
        medical: { 'First Aid': 3, 'Trauma Care': 3 },
        survival: { Hunting: 5, Trapping: 4, 'Shelter Building': 4, 'Fire Making': 4, Tracking: 5 },
        technical: { Mechanical: 3, Welding: 2 },
        communications: { 'HAM Radio': 2 },
        navigation: { 'Land Nav': 5, Tracking: 5, Driving: 4 },
        provisions: { Butchering: 4, Cooking: 2 },
        leadership: { Command: 3, Teaching: 3 },
      },
      pastJobs: [
        { title: 'Marine Corps - Gunnery Sergeant', company: 'USMC', years: '1998-2018' },
        { title: 'Security Consultant', company: 'Self-employed', years: '2018-Present' },
        { title: 'Hunting Guide', company: 'Sierra Outfitters', years: '2019-Present' },
      ],
      certifications: ['Combat Lifesaver', 'Close Protection Specialist', 'NRA Instructor', 'Tracking Certification'],
      equipment: ['Primary: M4 Carbine', 'Sidearm: Sig P320', 'Backup: Mossberg 500', 'Night Vision: PVS-14'],
      notes: 'Security specialist. Currently at backup location establishing perimeter. Primary hunter for protein acquisition.',
      emergencyContact: { name: 'Michael Rodriguez', relation: 'Friend/Team Lead', method: 'Node omega-01' },
    },
  };
  return profiles[nodeId] || profiles['omega-01'];
};

// Skill level badge component
const SkillBadge = ({ level }) => {
  const colors = [
    'bg-muted text-muted-foreground',
    'bg-slate-500/30 text-slate-300',
    'bg-blue-500/30 text-blue-300',
    'bg-purple-500/30 text-purple-300',
    'bg-yellow-500/30 text-yellow-300',
    'bg-gradient-to-r from-yellow-500/50 to-orange-500/50 text-white',
  ];
  const labels = ['None', 'Basic', 'Competent', 'Proficient', 'Expert', 'Master'];
  
  return (
    <span className={`px-2 py-0.5 rounded text-xs font-medium ${colors[level] || colors[0]}`}>
      {labels[level] || labels[0]}
    </span>
  );
};

// Profile Section Component
const ProfileSection = ({ title, icon: Icon, children, defaultOpen = true }) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  
  return (
    <div className="border border-border/50 rounded-xl overflow-hidden">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-4 py-3 flex items-center justify-between bg-secondary/30 hover:bg-secondary/50 transition-colors"
      >
        <div className="flex items-center gap-2">
          <Icon className="w-4 h-4 text-primary" />
          <span className="font-semibold text-sm">{title}</span>
        </div>
        {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
      </button>
      {isOpen && <div className="p-4">{children}</div>}
    </div>
  );
};

export default function NodeDetailsDrawer({ node, onClose, onMessage }) {
  const [details, setDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('profile');
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    fetchDetails();
    // Load mock profile data
    setProfile(getMockProfile(node.node_id));
  }, [node.node_id]);

  const fetchDetails = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await allyApi.getNodeStatus(node.node_id);
      setDetails(data);
    } catch (err) {
      console.error('Failed to fetch node details:', err);
      setError('Failed to load node details. Using cached data.');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    try {
      await allyApi.refreshNode(node.node_id);
      toast.success('Refresh requested');
      setTimeout(fetchDetails, 2000);
    } catch (err) {
      toast.error('Refresh failed');
    }
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return 'N/A';
    try {
      return new Date(timestamp).toLocaleString();
    } catch {
      return 'N/A';
    }
  };

  const getStatusColor = () => {
    if (node.status === 'online') return 'bg-success text-white';
    if (node.status === 'degraded') return 'bg-warning text-black';
    return 'bg-destructive text-white';
  };

  const getUserStatusColor = (status) => {
    switch (status) {
      case 'good': return 'bg-success text-white';
      case 'okay': return 'bg-warning text-black';
      case 'need_help': return 'bg-destructive text-white';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const getUserStatusLabel = (status) => {
    switch (status) {
      case 'good': return 'GOOD';
      case 'okay': return 'OKAY';
      case 'need_help': return 'NEED HELP';
      default: return 'OFFLINE';
    }
  };

  // Get avatar color based on node ID
  const getAvatarColor = (id) => {
    const colors = [
      'from-blue-500 to-cyan-500',
      'from-purple-500 to-pink-500',
      'from-green-500 to-emerald-500',
      'from-orange-500 to-red-500',
    ];
    const hash = id.split('').reduce((a, b) => a + b.charCodeAt(0), 0);
    return colors[hash % colors.length];
  };

  const primaryClass = profile ? SKILL_CLASSES[profile.primaryClass] : null;
  const secondaryClass = profile ? SKILL_CLASSES[profile.secondaryClass] : null;

  return (
    <div 
      className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-end"
      onClick={(e) => e.target === e.currentTarget && onClose()}
      data-testid="node-details-drawer"
    >
      <div className="w-full max-w-2xl h-full bg-background shadow-2xl overflow-hidden flex flex-col animate-fade-in">
        {/* Hero Header with Profile Picture */}
        <div className="relative">
          {/* Background gradient */}
          <div className={`h-32 bg-gradient-to-br ${getAvatarColor(node.node_id)} opacity-30`} />
          
          {/* Profile content overlay */}
          <div className="absolute inset-0 flex items-end p-4">
            <div className="flex items-end gap-4 w-full">
              {/* Large Avatar */}
              <div className={`w-24 h-24 rounded-2xl bg-gradient-to-br ${getAvatarColor(node.node_id)} flex items-center justify-center text-white text-3xl font-bold shadow-xl border-4 border-background`}>
                {profile?.fullName?.charAt(0) || node.name?.charAt(0) || '?'}
              </div>
              
              {/* Name and Status */}
              <div className="flex-1 pb-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="text-xl font-bold">{profile?.fullName || node.name}</h2>
                  <span className={`px-2 py-0.5 rounded text-xs font-bold ${getUserStatusColor(node.user_status)}`}>
                    {getUserStatusLabel(node.user_status)}
                  </span>
                </div>
                {profile?.callsign && (
                  <p className="text-primary font-mono font-bold text-sm">"{profile.callsign}"</p>
                )}
                <p className="text-xs text-muted-foreground mt-1">Node: {node.node_id}</p>
              </div>
              
              {/* Close button */}
              <Button variant="ghost" size="sm" onClick={onClose} className="absolute top-2 right-2 text-white hover:bg-white/20">
                <X className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>

        {/* Class Badges */}
        {profile && (
          <div className="px-4 py-3 border-b border-border/50 flex items-center gap-3">
            {primaryClass && (
              <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full ${primaryClass.bg}`}>
                <primaryClass.icon className={`w-4 h-4 ${primaryClass.color}`} />
                <span className={`text-sm font-bold ${primaryClass.color}`}>{primaryClass.name}</span>
                <span className="text-xs text-muted-foreground">Primary</span>
              </div>
            )}
            {secondaryClass && (
              <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full ${secondaryClass.bg}`}>
                <secondaryClass.icon className={`w-4 h-4 ${secondaryClass.color}`} />
                <span className={`text-sm font-bold ${secondaryClass.color}`}>{secondaryClass.name}</span>
                <span className="text-xs text-muted-foreground">Secondary</span>
              </div>
            )}
          </div>
        )}

        {/* Tab Navigation */}
        <div className="flex border-b border-border/50">
          {[
            { id: 'profile', label: 'Profile', icon: User },
            { id: 'skills', label: 'Skills', icon: Award },
            { id: 'device', label: 'Device', icon: Cpu },
            { id: 'location', label: 'Location', icon: MapPin },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 py-3 text-sm font-medium transition-colors relative flex items-center justify-center gap-2 ${
                activeTab === tab.id ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
              {activeTab === tab.id && (
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-12 h-1 bg-primary rounded-full" />
              )}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin">
          {error && (
            <div className="bg-warning/20 border border-warning rounded-lg p-3 text-sm text-warning">
              <AlertTriangle className="w-4 h-4 inline mr-2" />
              {error}
            </div>
          )}

          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="skeleton h-32 rounded-xl" />
              ))}
            </div>
          ) : (
            <>
              {/* PROFILE TAB */}
              {activeTab === 'profile' && profile && (
                <div className="space-y-4">
                  {/* Physical Description */}
                  <ProfileSection title="Physical Description" icon={User}>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Age:</span>
                          <span className="font-medium">{profile.age}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Height:</span>
                          <span className="font-medium">{profile.height}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Weight:</span>
                          <span className="font-medium">{profile.weight}</span>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Hair:</span>
                          <span className="font-medium">{profile.hairColor}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Eyes:</span>
                          <span className="font-medium">{profile.eyeColor}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Blood Type:</span>
                          <span className="font-bold text-destructive">{profile.bloodType}</span>
                        </div>
                      </div>
                    </div>
                    {profile.distinguishingFeatures && (
                      <div className="mt-3 pt-3 border-t border-border/50">
                        <span className="text-xs text-muted-foreground">Distinguishing Features:</span>
                        <p className="text-sm mt-1">{profile.distinguishingFeatures}</p>
                      </div>
                    )}
                  </ProfileSection>

                  {/* Medical Info */}
                  <ProfileSection title="Medical Information" icon={Heart}>
                    <div className="space-y-3 text-sm">
                      <div>
                        <span className="text-xs text-muted-foreground uppercase tracking-wide">Conditions</span>
                        <div className="flex flex-wrap gap-2 mt-1">
                          {profile.medicalConditions?.length > 0 ? (
                            profile.medicalConditions.map((condition, i) => (
                              <span key={i} className="px-2 py-1 bg-warning/20 text-warning rounded text-xs">
                                {condition}
                              </span>
                            ))
                          ) : (
                            <span className="text-success text-xs">None reported</span>
                          )}
                        </div>
                      </div>
                      <div>
                        <span className="text-xs text-muted-foreground uppercase tracking-wide">Allergies</span>
                        <div className="flex flex-wrap gap-2 mt-1">
                          {profile.allergies?.length > 0 ? (
                            profile.allergies.map((allergy, i) => (
                              <span key={i} className="px-2 py-1 bg-destructive/20 text-destructive rounded text-xs font-medium">
                                ⚠️ {allergy}
                              </span>
                            ))
                          ) : (
                            <span className="text-success text-xs">No known allergies</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </ProfileSection>

                  {/* Work History */}
                  <ProfileSection title="Experience & Background" icon={Briefcase}>
                    <div className="space-y-3">
                      {profile.pastJobs?.map((job, i) => (
                        <div key={i} className="flex gap-3">
                          <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center flex-shrink-0">
                            <Briefcase className="w-5 h-5 text-muted-foreground" />
                          </div>
                          <div className="flex-1">
                            <p className="font-medium text-sm">{job.title}</p>
                            <p className="text-xs text-muted-foreground">{job.company}</p>
                            <p className="text-xs text-primary">{job.years}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </ProfileSection>

                  {/* Certifications */}
                  <ProfileSection title="Certifications & Training" icon={GraduationCap}>
                    <div className="flex flex-wrap gap-2">
                      {profile.certifications?.map((cert, i) => (
                        <span key={i} className="px-3 py-1.5 bg-primary/20 text-primary rounded-full text-xs font-medium">
                          ✓ {cert}
                        </span>
                      ))}
                    </div>
                  </ProfileSection>

                  {/* Equipment */}
                  <ProfileSection title="Equipment Loadout" icon={Package}>
                    <div className="space-y-2">
                      {profile.equipment?.map((item, i) => (
                        <div key={i} className="flex items-center gap-2 text-sm">
                          <div className="w-2 h-2 rounded-full bg-primary" />
                          {item}
                        </div>
                      ))}
                    </div>
                  </ProfileSection>

                  {/* Notes */}
                  {profile.notes && (
                    <ProfileSection title="Notes" icon={Edit3}>
                      <p className="text-sm text-muted-foreground">{profile.notes}</p>
                    </ProfileSection>
                  )}

                  {/* Emergency Contact */}
                  <ProfileSection title="Emergency Contact" icon={Phone}>
                    <div className="glass rounded-lg p-3">
                      <p className="font-medium text-sm">{profile.emergencyContact?.name}</p>
                      <p className="text-xs text-muted-foreground">{profile.emergencyContact?.relation}</p>
                      <p className="text-xs text-primary mt-1">{profile.emergencyContact?.method}</p>
                    </div>
                  </ProfileSection>
                </div>
              )}

              {/* SKILLS TAB */}
              {activeTab === 'skills' && profile && (
                <div className="space-y-4">
                  {Object.entries(SKILL_CLASSES).map(([classId, classInfo]) => {
                    const skills = profile.skillLevels?.[classId] || {};
                    const hasSkills = Object.keys(skills).length > 0;
                    if (!hasSkills) return null;
                    
                    return (
                      <ProfileSection 
                        key={classId} 
                        title={classInfo.name} 
                        icon={classInfo.icon}
                        defaultOpen={classId === profile.primaryClass || classId === profile.secondaryClass}
                      >
                        <div className="space-y-2">
                          {Object.entries(skills).map(([skill, level]) => (
                            <div key={skill} className="flex items-center justify-between">
                              <span className="text-sm">{skill}</span>
                              <div className="flex items-center gap-2">
                                <div className="flex gap-0.5">
                                  {[1, 2, 3, 4, 5].map(i => (
                                    <div 
                                      key={i} 
                                      className={`w-4 h-2 rounded-sm ${i <= level ? classInfo.bg.replace('/20', '') : 'bg-muted'}`}
                                    />
                                  ))}
                                </div>
                                <SkillBadge level={level} />
                              </div>
                            </div>
                          ))}
                        </div>
                      </ProfileSection>
                    );
                  })}
                </div>
              )}

              {/* DEVICE TAB */}
              {activeTab === 'device' && details && (
                <div className="space-y-4">
                  {/* Connection Info */}
                  <ProfileSection title="Connection" icon={Wifi}>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Status:</span>
                        <span className={node.status === 'online' ? 'text-success' : 'text-warning'}>
                          {node.status?.toUpperCase()}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Last Seen:</span>
                        <span>{formatDate(node.last_seen)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Link Type:</span>
                        <span>{node.link_type || 'N/A'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Signal:</span>
                        <span>{node.rssi ? `${node.rssi} dBm` : 'N/A'}</span>
                      </div>
                    </div>
                  </ProfileSection>

                  {/* System Health */}
                  <ProfileSection title="System Health" icon={Activity}>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">CPU:</span>
                        <span className={details.system?.cpu > 80 ? 'text-warning' : ''}>{details.system?.cpu}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">RAM:</span>
                        <span>{details.system?.ram}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Disk:</span>
                        <span>{details.system?.disk}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Temp:</span>
                        <span>{details.system?.temp}°C</span>
                      </div>
                    </div>
                  </ProfileSection>

                  {/* Power */}
                  <ProfileSection title="Power" icon={Battery}>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Battery:</span>
                        <span className={details.power?.battery_pct < 20 ? 'text-destructive' : 'text-success'}>
                          {details.power?.battery_pct}%
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">State:</span>
                        <span className="capitalize">{details.power?.charge_state}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Voltage:</span>
                        <span>{details.power?.volts}V</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Power:</span>
                        <span>{details.power?.watts}W</span>
                      </div>
                    </div>
                  </ProfileSection>
                </div>
              )}

              {/* LOCATION TAB */}
              {activeTab === 'location' && details?.gps && (
                <div className="space-y-4">
                  {/* GPS Info */}
                  <ProfileSection title="GPS Status" icon={Navigation}>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Fix:</span>
                        <span className={details.gps.fix === '3D' ? 'text-success' : 'text-warning'}>
                          {details.gps.fix || 'No Fix'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Satellites:</span>
                        <span>{details.gps.sats}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Latitude:</span>
                        <span>{details.gps.lat?.toFixed(6)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Longitude:</span>
                        <span>{details.gps.lon?.toFixed(6)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Accuracy:</span>
                        <span>±{Math.round(details.gps.acc * 3.28084)} ft</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Speed:</span>
                        <span>{Math.round(details.gps.speed * 0.621371)} mph</span>
                      </div>
                    </div>
                  </ProfileSection>

                  {/* Mini Map */}
                  {details.gps.lat && details.gps.lon && (
                    <div className="rounded-xl overflow-hidden border border-border">
                      <Suspense fallback={
                        <div className="h-64 glass flex items-center justify-center">
                          <Loader2 className="w-6 h-6 animate-spin text-primary" />
                        </div>
                      }>
                        <NodeMiniMap 
                          lat={details.gps.lat} 
                          lon={details.gps.lon}
                          nodeName={node.name}
                          nodeStatus={node.status}
                          userStatus={node.user_status}
                          accuracy={details.gps.acc}
                          fixStatus={details.gps.fix}
                        />
                      </Suspense>
                      <div className="bg-secondary/30 px-3 py-2 flex items-center justify-between text-xs">
                        <span className="text-muted-foreground">
                          {details.gps.fix} Fix • {details.gps.sats} Satellites
                        </span>
                        <div className="flex gap-1">
                          <Button 
                            size="sm" 
                            variant="ghost" 
                            className="h-7 px-2 text-xs"
                            onClick={() => {
                              navigator.clipboard.writeText(`${details.gps.lat}, ${details.gps.lon}`);
                              toast.success('Coordinates copied!');
                            }}
                          >
                            <Copy className="w-3 h-3 mr-1" />
                            Copy
                          </Button>
                          <Button 
                            size="sm" 
                            variant="ghost" 
                            className="h-7 px-2 text-xs"
                            onClick={() => window.open(`https://www.google.com/maps?q=${details.gps.lat},${details.gps.lon}`, '_blank')}
                          >
                            <ExternalLink className="w-3 h-3 mr-1" />
                            Maps
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer Actions */}
        <div className="glass-strong border-t border-border p-4 flex gap-2">
          <Button 
            onClick={() => onMessage(node.node_id)} 
            className="flex-1"
          >
            <MessageSquare className="w-4 h-4 mr-2" />
            Message
          </Button>
          <Button 
            variant="outline" 
            onClick={handleRefresh} 
            className="flex-1"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          <Button 
            variant="outline" 
            onClick={() => toast.success('Added to favorites')}
          >
            <Star className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
