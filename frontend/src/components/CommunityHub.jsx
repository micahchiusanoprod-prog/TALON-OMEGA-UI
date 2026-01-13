import React, { useState, useMemo, useCallback, createContext, useContext, useEffect, useRef } from 'react';
import {
  X, Users, BarChart3, MessageSquare, FileText, Shield, ShieldAlert, ShieldCheck,
  Eye, EyeOff, AlertTriangle, CheckCircle, Clock, Calendar,
  Heart, Star, Award, ChevronRight, ChevronDown, ChevronUp, Search, Filter,
  Info, User, Home, GraduationCap, Languages, Activity, Stethoscope, Wrench, Radio,
  Utensils, Target, TrendingUp, AlertCircle, Globe, UserCheck, Lock,
  Zap, Compass, Megaphone, ListChecks, BarChart2, Lightbulb, UserPlus,
  Send, Vote, ClipboardList, Bell, ArrowLeft, Copy, CheckCheck, ExternalLink,
  Briefcase, MapPin, SortAsc, SortDesc, XCircle, Plus, RefreshCw,
  Sparkles, Wand2, Users2, CircleDot, Minus, ChevronLeft, RotateCcw,
  Crown, Flame, Bookmark, Share2, Download, Settings2, Layers, HelpCircle,
  Wifi, WifiOff, Signal
} from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { toast } from 'sonner';
import {
  Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription
} from './ui/sheet';
import {
  SKILL_DOMAINS, CANONICAL_SKILLS, LANGUAGES, EDUCATION_LEVELS, ROLES, MOCK_CURRENT_USERS,
  USER_STATUS, CONNECTION_TYPES, BLOOD_TYPES,
  getSkillLabel, getSkillDomain, getLanguageLabel,
  generateMockProfiles, generateAnalyticsSummary, generateCommsPreview,
  generateMockIncidents, generateMockScoreConfig, calculateMemberScores
} from '../mock/communityMockData';
import OfficialTeamsBulletins from './OfficialTeamsBulletins';
import HelpGuidePanel, { COMMON_LEGEND_ITEMS, COMMON_TROUBLESHOOTING } from './HelpGuidePanel';
import { DataSourceBadge } from './DataStateIndicators';

// ============================================================
// RBAC CONTEXT & HOOKS
// ============================================================

const RBACContext = createContext(null);

export const useRBAC = () => {
  const context = useContext(RBACContext);
  if (!context) throw new Error('useRBAC must be used within RBACProvider');
  return context;
};

const RBACProvider = ({ children, currentUser, onUpdatePrivacy }) => {
  const role = ROLES[currentUser?.role] || ROLES.guest;
  const can = useCallback((permission) => role.permissions[permission] === true, [role]);
  const isAdmin = currentUser?.role === 'admin';
  const isMember = currentUser?.role === 'member' || isAdmin;
  
  return (
    <RBACContext.Provider value={{ currentUser, role, can, isAdmin, isMember, onUpdatePrivacy }}>
      {children}
    </RBACContext.Provider>
  );
};

// ============================================================
// RBAC GUARD COMPONENT
// ============================================================

const RequireRole = ({ minRole, children, onAccessDenied, fallback }) => {
  const { currentUser } = useRBAC();
  const ROLE_HIERARCHY = { guest: 0, member: 1, admin: 2 };
  const userLevel = ROLE_HIERARCHY[currentUser?.role] || 0;
  const requiredLevel = ROLE_HIERARCHY[minRole] || 0;
  const hasAccess = userLevel >= requiredLevel;
  
  useEffect(() => {
    if (!hasAccess && onAccessDenied) onAccessDenied();
  }, [hasAccess, onAccessDenied]);
  
  if (!hasAccess) {
    return fallback || <AccessDeniedCard minRole={minRole} currentRole={currentUser?.role} />;
  }
  return children;
};

const AccessDeniedCard = ({ minRole, currentRole, onReturn }) => (
  <div className="flex flex-col items-center justify-center py-16 glass rounded-xl" data-testid="access-denied">
    <ShieldAlert className="w-16 h-16 text-destructive/50 mb-4" />
    <h3 className="text-lg font-semibold mb-2">Access Denied</h3>
    <p className="text-sm text-muted-foreground text-center max-w-md mb-4">
      This section requires <span className="font-semibold text-amber-400">{minRole}</span> role or higher.
      <br />Your current role: <span className="font-semibold">{currentRole || 'guest'}</span>
    </p>
    {onReturn && (
      <Button onClick={onReturn} variant="outline" size="sm" className="gap-2">
        <ArrowLeft className="w-4 h-4" />Return to Overview
      </Button>
    )}
  </div>
);

// ============================================================
// PRIVACY REDACTION SYSTEM
// ============================================================

const redactProfile = (profile, viewerRole) => {
  if (!profile) return null;
  if (viewerRole === 'admin') return { ...profile, _redacted: false };
  
  const privacy = profile.privacy || { 
    showAge: false, 
    showHeightWeight: false, 
    showEducation: true,
    showMedical: false,
    showLocation: false 
  };
  return {
    ...profile,
    _redacted: true,
    age: privacy.showAge ? profile.age : null,
    anthro: privacy.showHeightWeight ? profile.anthro : { heightIn: null, weightLb: null },
    educationLevel: privacy.showEducation !== false ? profile.educationLevel : null,
    physical: privacy.showHeightWeight ? profile.physical : null,
    medical: privacy.showMedical ? profile.medical : null,
    location: privacy.showLocation ? profile.location : null,
  };
};

const formatHeight = (inches) => {
  if (!inches) return null;
  return `${Math.floor(inches / 12)}'${inches % 12}"`;
};

const formatWeight = (lbs) => lbs ? `${lbs} lbs` : null;

// ============================================================
// UTILITY COMPONENTS
// ============================================================

const RoleBadge = ({ role }) => {
  const r = ROLES[role];
  if (!r) return null;
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium ${r.bg} ${r.color}`}>
      {role === 'admin' && <ShieldCheck className="w-3 h-3" />}
      {role === 'member' && <UserCheck className="w-3 h-3" />}
      {role === 'guest' && <User className="w-3 h-3" />}
      {r.name}
    </span>
  );
};

const StatusDot = ({ online }) => (
  <div className={`w-2.5 h-2.5 rounded-full ${online ? 'bg-success animate-pulse' : 'bg-muted-foreground'}`} />
);

const PriorityBadge = ({ priority }) => {
  const config = {
    P0: { bg: 'bg-destructive/20', color: 'text-destructive', label: 'P0' },
    P1: { bg: 'bg-orange-500/20', color: 'text-orange-400', label: 'P1' },
    P2: { bg: 'bg-warning/20', color: 'text-warning', label: 'P2' },
    WARN: { bg: 'bg-warning/20', color: 'text-warning', label: 'WARN' },
    OK: { bg: 'bg-success/20', color: 'text-success', label: 'OK' },
  };
  const c = config[priority] || config.OK;
  return <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${c.bg} ${c.color}`}>{c.label}</span>;
};

const DomainIcon = ({ domain, className = "w-4 h-4" }) => {
  const icons = {
    Medical: Stethoscope, Comms: Radio, Security: Shield,
    FoodWater: Utensils, Engineering: Wrench, Logistics: Compass,
  };
  const Icon = icons[domain] || Target;
  return <Icon className={className} />;
};

const SkillBadge = ({ tagKey, size = 'sm' }) => {
  const domain = getSkillDomain(tagKey);
  const domainConfig = SKILL_DOMAINS[domain];
  const sizeClasses = size === 'sm' ? 'text-[10px] px-1.5 py-0.5' : 'text-xs px-2 py-1';
  return (
    <span className={`inline-flex items-center gap-1 rounded ${sizeClasses} ${domainConfig?.bg || 'bg-secondary'} ${domainConfig?.color || 'text-foreground'}`}>
      {getSkillLabel(tagKey)}
    </span>
  );
};

const LanguageBadge = ({ code }) => {
  const lang = LANGUAGES[code];
  return (
    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-secondary text-[10px]">
      {lang?.flag} {lang?.label || code}
    </span>
  );
};

// ============================================================
// HELP TIP COMPONENT - Friendly explainer text
// ============================================================

const HelpTip = ({ title, children, variant = 'default' }) => {
  const [isOpen, setIsOpen] = useState(false);
  
  const variants = {
    default: 'border-primary/30 bg-primary/5',
    warning: 'border-warning/30 bg-warning/5',
    success: 'border-success/30 bg-success/5',
  };
  
  return (
    <div className="relative inline-block">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-5 h-5 rounded-full bg-primary/20 hover:bg-primary/30 flex items-center justify-center transition-colors"
        aria-label="Help"
      >
        <HelpCircle className="w-3 h-3 text-primary" />
      </button>
      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className={`absolute z-50 left-0 top-7 w-72 p-3 rounded-lg glass border ${variants[variant]} shadow-lg`}>
            {title && <p className="font-semibold text-sm mb-1">{title}</p>}
            <p className="text-xs text-muted-foreground leading-relaxed">{children}</p>
            <button 
              onClick={() => setIsOpen(false)}
              className="absolute top-2 right-2 text-muted-foreground hover:text-foreground"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        </>
      )}
    </div>
  );
};

// Section Header with built-in explainer
const SectionHeader = ({ icon: Icon, title, helpText, children, iconColor = 'text-primary' }) => (
  <div className="flex items-center justify-between mb-4">
    <div className="flex items-center gap-2">
      {Icon && <Icon className={`w-5 h-5 ${iconColor}`} />}
      <h2 className="text-lg font-bold">{title}</h2>
      {helpText && <HelpTip>{helpText}</HelpTip>}
    </div>
    {children}
  </div>
);

// Inline explainer for sections
const SectionExplainer = ({ children, className = '' }) => (
  <p className={`text-sm text-muted-foreground mb-4 leading-relaxed ${className}`}>
    {children}
  </p>
);

// ============================================================
// WELCOME MODAL - First-time user introduction
// ============================================================

const WelcomeModal = ({ isOpen, onClose, onStartTour }) => {
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="glass rounded-2xl p-6 max-w-lg w-full border border-primary/30 shadow-2xl">
        <div className="text-center mb-6">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-violet-500/30 to-fuchsia-500/30 flex items-center justify-center">
            <Users className="w-8 h-8 text-violet-400" />
          </div>
          <h2 className="text-2xl font-bold mb-2">Welcome to the Community Hub!</h2>
          <p className="text-muted-foreground">
            This is your family&apos;s coordination center. Here&apos;s what you can do:
          </p>
        </div>
        
        <div className="space-y-3 mb-6">
          <div className="flex items-start gap-3 p-3 rounded-lg bg-secondary/50">
            <Home className="w-5 h-5 text-primary mt-0.5" />
            <div>
              <p className="font-medium text-sm">Overview</p>
              <p className="text-xs text-muted-foreground">See who&apos;s online and check if we have enough people with important skills</p>
            </div>
          </div>
          <div className="flex items-start gap-3 p-3 rounded-lg bg-secondary/50">
            <Users className="w-5 h-5 text-primary mt-0.5" />
            <div>
              <p className="font-medium text-sm">Directory</p>
              <p className="text-xs text-muted-foreground">Find family members by name or skills. See who can help with what</p>
            </div>
          </div>
          <div className="flex items-start gap-3 p-3 rounded-lg bg-secondary/50">
            <Wand2 className="w-5 h-5 text-violet-400 mt-0.5" />
            <div>
              <p className="font-medium text-sm">Team Builder</p>
              <p className="text-xs text-muted-foreground">Quickly assemble the right people for emergencies or tasks</p>
            </div>
          </div>
        </div>
        
        <div className="flex gap-3">
          <Button variant="outline" className="flex-1" onClick={onClose}>
            Got it, thanks!
          </Button>
          <Button className="flex-1 gap-2" onClick={onStartTour}>
            <Zap className="w-4 h-4" />
            Try a Practice Drill
          </Button>
        </div>
        
        <p className="text-center text-xs text-muted-foreground mt-4">
          Tip: Look for the <span className="inline-flex items-center"><HelpCircle className="w-3 h-3 mx-1 text-primary" /></span> icons for helpful explanations
        </p>
      </div>
    </div>
  );
};

// ============================================================
// DRILL MODE - Emergency Simulation
// ============================================================

const DRILL_SCENARIOS = [
  {
    id: 'medical-emergency',
    name: 'Medical Emergency',
    icon: Stethoscope,
    color: 'text-rose-400',
    bg: 'bg-rose-500/20',
    description: 'Someone is injured and needs immediate medical attention!',
    urgency: 'CRITICAL',
    requiredSkills: ['Medical.FirstAid', 'Medical.CPR'],
    optionalSkills: ['Medical.Trauma', 'Medical.EMT'],
    targetTime: 30, // seconds
    targetTeamSize: 2,
  },
  {
    id: 'power-outage',
    name: 'Power Outage',
    icon: Zap,
    color: 'text-amber-400',
    bg: 'bg-amber-500/20',
    description: 'The power is out! We need to restore electricity.',
    urgency: 'HIGH',
    requiredSkills: ['Engineering.Electrical', 'Engineering.SolarSystems'],
    optionalSkills: ['Engineering.Electronics'],
    targetTime: 45,
    targetTeamSize: 2,
  },
  {
    id: 'water-contamination',
    name: 'Water Contamination',
    icon: Utensils,
    color: 'text-cyan-400',
    bg: 'bg-cyan-500/20',
    description: 'Our water supply may be unsafe. We need to purify it.',
    urgency: 'HIGH',
    requiredSkills: ['FoodWater.WaterPurification'],
    optionalSkills: ['FoodWater.FoodPreservation', 'Medical.FirstAid'],
    targetTime: 60,
    targetTeamSize: 2,
  },
  {
    id: 'security-breach',
    name: 'Perimeter Alert',
    icon: Shield,
    color: 'text-orange-400',
    bg: 'bg-orange-500/20',
    description: 'Unknown activity detected at the perimeter!',
    urgency: 'CRITICAL',
    requiredSkills: ['Security.Perimeter', 'Comms.HAM'],
    optionalSkills: ['Security.SelfDefense', 'Logistics.Navigation'],
    targetTime: 20,
    targetTeamSize: 3,
  },
  {
    id: 'comms-down',
    name: 'Communications Down',
    icon: Radio,
    color: 'text-cyan-400',
    bg: 'bg-cyan-500/20',
    description: 'We&apos;ve lost contact with the outside. Need to restore comms.',
    urgency: 'MEDIUM',
    requiredSkills: ['Comms.HAM', 'Comms.Networking'],
    optionalSkills: ['Engineering.Electronics'],
    targetTime: 90,
    targetTeamSize: 2,
  },
];

const DrillMode = ({ isOpen, onClose, profiles, memberScores, onOpenTeamBuilder }) => {
  const [drillState, setDrillState] = useState('ready'); // ready, active, complete
  const [scenario, setScenario] = useState(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [selectedTeam, setSelectedTeam] = useState([]);
  const [drillHistory, setDrillHistory] = useState([]);
  const timerRef = useRef(null);
  
  const getRandomScenario = useCallback(() => {
    const idx = Math.floor(Math.random() * DRILL_SCENARIOS.length);
    return DRILL_SCENARIOS[idx];
  }, []);
  
  const startDrill = useCallback((selectedScenario) => {
    const scenarioToUse = selectedScenario || getRandomScenario();
    setScenario(scenarioToUse);
    setDrillState('active');
    setElapsedTime(0);
    setSelectedTeam([]);
    
    timerRef.current = setInterval(() => {
      setElapsedTime(prev => prev + 1);
    }, 1000);
  }, [getRandomScenario]);
  
  const completeDrill = useCallback(() => {
    clearInterval(timerRef.current);
    setDrillState('complete');
    
    // Calculate score
    const timeBonus = Math.max(0, scenario.targetTime - elapsedTime);
    const teamScore = selectedTeam.length >= scenario.targetTeamSize ? 50 : 25;
    const skillsCovered = scenario.requiredSkills.filter(skill =>
      selectedTeam.some(m => m.skills.includes(skill))
    ).length;
    const skillScore = (skillsCovered / scenario.requiredSkills.length) * 100;
    
    const totalScore = Math.round((timeBonus * 2) + teamScore + skillScore);
    
    setDrillHistory(prev => [...prev, {
      scenario: scenario.name,
      time: elapsedTime,
      score: totalScore,
      date: new Date().toISOString(),
    }]);
  }, [scenario, elapsedTime, selectedTeam]);
  
  const toggleTeamMember = useCallback((profile) => {
    setSelectedTeam(prev => {
      const exists = prev.find(m => m.userId === profile.userId);
      if (exists) return prev.filter(m => m.userId !== profile.userId);
      return [...prev, profile];
    });
  }, []);
  
  const resetDrill = useCallback(() => {
    clearInterval(timerRef.current);
    setDrillState('ready');
    setScenario(null);
    setElapsedTime(0);
    setSelectedTeam([]);
  }, []);
  
  useEffect(() => {
    return () => clearInterval(timerRef.current);
  }, []);
  
  if (!isOpen) return null;
  
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };
  
  const getGrade = (time, target) => {
    if (time <= target * 0.5) return { grade: 'A+', color: 'text-success', message: 'Outstanding! Lightning fast response!' };
    if (time <= target * 0.75) return { grade: 'A', color: 'text-success', message: 'Excellent! Well under target time.' };
    if (time <= target) return { grade: 'B', color: 'text-primary', message: 'Good job! You met the target.' };
    if (time <= target * 1.5) return { grade: 'C', color: 'text-warning', message: 'Okay, but could be faster.' };
    return { grade: 'D', color: 'text-destructive', message: 'Needs practice. Try again!' };
  };
  
  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="w-full sm:max-w-xl overflow-y-auto">
        <SheetHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-gradient-to-br from-orange-500/20 to-red-500/20">
              <Flame className="w-5 h-5 text-orange-400" />
            </div>
            <div>
              <SheetTitle className="flex items-center gap-2">
                Drill Mode
                <span className="text-xs px-2 py-0.5 rounded bg-orange-500/20 text-orange-400">PRACTICE</span>
              </SheetTitle>
              <SheetDescription>Practice assembling teams for emergency scenarios</SheetDescription>
            </div>
          </div>
        </SheetHeader>
        
        {/* Ready State - Choose Scenario */}
        {drillState === 'ready' && (
          <div className="mt-6 space-y-6">
            <SectionExplainer>
              Drill Mode helps you practice responding to emergencies. 
              Select a scenario and try to assemble the right team as quickly as possible!
            </SectionExplainer>
            
            <div className="space-y-3">
              <h3 className="font-semibold text-sm">Choose a Scenario:</h3>
              {DRILL_SCENARIOS.map(s => (
                <button
                  key={s.id}
                  onClick={() => startDrill(s)}
                  className="w-full p-4 rounded-xl glass hover:bg-white/5 transition-colors text-left group"
                >
                  <div className="flex items-start gap-3">
                    <div className={`p-2 rounded-lg ${s.bg}`}>
                      <s.icon className={`w-5 h-5 ${s.color}`} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium">{s.name}</h4>
                        <span className={`text-[10px] px-1.5 py-0.5 rounded ${
                          s.urgency === 'CRITICAL' ? 'bg-destructive/20 text-destructive' :
                          s.urgency === 'HIGH' ? 'bg-orange-500/20 text-orange-400' :
                          'bg-warning/20 text-warning'
                        }`}>{s.urgency}</span>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">{s.description}</p>
                      <p className="text-xs text-muted-foreground mt-2">
                        Target: {s.targetTime}s • Team size: {s.targetTeamSize}+
                      </p>
                    </div>
                    <ChevronRight className="w-5 h-5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </button>
              ))}
            </div>
            
            <Button variant="outline" className="w-full gap-2" onClick={() => startDrill(null)}>
              <Sparkles className="w-4 h-4" />
              Random Scenario
            </Button>
            
            {drillHistory.length > 0 && (
              <div className="pt-4 border-t border-border">
                <h4 className="text-sm font-medium text-muted-foreground mb-2">Recent Drills</h4>
                <div className="space-y-2">
                  {drillHistory.slice(-3).reverse().map((drill, i) => (
                    <div key={i} className="flex items-center justify-between p-2 rounded bg-secondary/50 text-sm">
                      <span>{drill.scenario}</span>
                      <span className="text-muted-foreground">{formatTime(drill.time)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
        
        {/* Active State - Build Team */}
        {drillState === 'active' && scenario && (
          <div className="mt-6 space-y-4">
            {/* Scenario Alert */}
            <div className={`p-4 rounded-xl ${scenario.bg} border ${scenario.bg.replace('/20', '/30')}`}>
              <div className="flex items-center gap-2 mb-2">
                <scenario.icon className={`w-5 h-5 ${scenario.color}`} />
                <span className={`font-bold ${scenario.color}`}>{scenario.urgency}!</span>
              </div>
              <h3 className="font-bold text-lg">{scenario.name}</h3>
              <p className="text-sm text-muted-foreground mt-1">{scenario.description}</p>
            </div>
            
            {/* Timer */}
            <div className="text-center py-4">
              <p className="text-5xl font-mono font-bold">{formatTime(elapsedTime)}</p>
              <p className="text-sm text-muted-foreground">Target: {scenario.targetTime}s</p>
            </div>
            
            {/* Required Skills */}
            <div className="p-3 rounded-lg bg-secondary/50">
              <p className="text-xs font-medium text-muted-foreground mb-2">We need people with:</p>
              <div className="flex flex-wrap gap-1">
                {scenario.requiredSkills.map(skill => {
                  const covered = selectedTeam.some(m => m.skills.includes(skill));
                  return (
                    <span key={skill} className={`px-2 py-1 rounded text-xs ${
                      covered ? 'bg-success/20 text-success' : 'bg-destructive/20 text-destructive'
                    }`}>
                      {covered && <CheckCircle className="w-3 h-3 inline mr-1" />}
                      {getSkillLabel(skill)}
                    </span>
                  );
                })}
              </div>
            </div>
            
            {/* Team Selection */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-medium">Select team members ({selectedTeam.length}/{scenario.targetTeamSize}+):</p>
              </div>
              <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto">
                {profiles.filter(p => p.stats.online).map(profile => {
                  const isSelected = selectedTeam.find(m => m.userId === profile.userId);
                  const hasRequiredSkill = scenario.requiredSkills.some(s => profile.skills.includes(s));
                  return (
                    <button
                      key={profile.userId}
                      onClick={() => toggleTeamMember(profile)}
                      className={`p-2 rounded-lg text-left transition-colors ${
                        isSelected ? 'bg-primary/20 border border-primary' : 
                        hasRequiredSkill ? 'bg-success/10 border border-success/30 hover:bg-success/20' :
                        'glass hover:bg-white/5'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-500/50 to-fuchsia-500/50 flex items-center justify-center text-xs font-bold">
                          {profile.displayName.split(' ').map(n => n[0]).join('')}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium truncate">{profile.displayName}</p>
                          {hasRequiredSkill && (
                            <p className="text-[10px] text-success">Has needed skills!</p>
                          )}
                        </div>
                        {isSelected && <CheckCircle className="w-4 h-4 text-primary" />}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
            
            <div className="flex gap-2">
              <Button variant="outline" onClick={resetDrill}>Cancel</Button>
              <Button 
                className="flex-1 gap-2" 
                onClick={completeDrill}
                disabled={selectedTeam.length === 0}
              >
                <CheckCircle className="w-4 h-4" />
                Team Assembled!
              </Button>
            </div>
          </div>
        )}
        
        {/* Complete State - Results */}
        {drillState === 'complete' && scenario && (
          <div className="mt-6 space-y-6">
            {(() => {
              const result = getGrade(elapsedTime, scenario.targetTime);
              const skillsCovered = scenario.requiredSkills.filter(skill =>
                selectedTeam.some(m => m.skills.includes(skill))
              ).length;
              const allSkillsCovered = skillsCovered === scenario.requiredSkills.length;
              
              return (
                <>
                  <div className="text-center py-6">
                    <div className={`text-6xl font-bold ${result.color}`}>{result.grade}</div>
                    <p className="text-lg mt-2">{result.message}</p>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-4 rounded-xl glass text-center">
                      <p className="text-3xl font-bold font-mono">{formatTime(elapsedTime)}</p>
                      <p className="text-xs text-muted-foreground">Your Time</p>
                      <p className="text-xs text-muted-foreground">(Target: {scenario.targetTime}s)</p>
                    </div>
                    <div className="p-4 rounded-xl glass text-center">
                      <p className="text-3xl font-bold">{selectedTeam.length}</p>
                      <p className="text-xs text-muted-foreground">Team Members</p>
                      <p className="text-xs text-muted-foreground">(Need: {scenario.targetTeamSize}+)</p>
                    </div>
                  </div>
                  
                  <div className={`p-4 rounded-xl ${allSkillsCovered ? 'bg-success/10 border border-success/30' : 'bg-warning/10 border border-warning/30'}`}>
                    <div className="flex items-center gap-2 mb-2">
                      {allSkillsCovered ? (
                        <CheckCircle className="w-5 h-5 text-success" />
                      ) : (
                        <AlertTriangle className="w-5 h-5 text-warning" />
                      )}
                      <span className="font-medium">
                        {allSkillsCovered ? 'All required skills covered!' : 'Some skills missing'}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {skillsCovered} of {scenario.requiredSkills.length} required skills covered
                    </p>
                  </div>
                  
                  <div className="p-4 rounded-xl bg-secondary/50">
                    <h4 className="font-medium mb-2">Your Team:</h4>
                    <div className="space-y-2">
                      {selectedTeam.map(member => (
                        <div key={member.userId} className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-gradient-to-br from-violet-500/50 to-fuchsia-500/50 flex items-center justify-center text-[10px] font-bold">
                            {member.displayName.split(' ').map(n => n[0]).join('')}
                          </div>
                          <span className="text-sm">{member.displayName}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button variant="outline" className="flex-1" onClick={resetDrill}>
                      Try Another
                    </Button>
                    <Button className="flex-1 gap-2" onClick={() => { resetDrill(); startDrill(scenario); }}>
                      <RotateCcw className="w-4 h-4" />
                      Retry Same
                    </Button>
                  </div>
                </>
              );
            })()}
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
};

// ============================================================
// COLLAPSIBLE PRIVACY BANNER
// ============================================================

const PrivacyBanner = () => {
  const [collapsed, setCollapsed] = useState(() => {
    if (typeof window !== 'undefined') {
      return sessionStorage.getItem('community-privacy-banner-collapsed') === 'true';
    }
    return false;
  });
  
  const toggle = () => {
    const newState = !collapsed;
    setCollapsed(newState);
    sessionStorage.setItem('community-privacy-banner-collapsed', String(newState));
  };
  
  return (
    <div className="glass rounded-xl border border-primary/30 mb-6 overflow-hidden">
      <button onClick={toggle} className="w-full flex items-center justify-between p-3 hover:bg-white/5 transition-colors">
        <div className="flex items-center gap-2">
          <Info className="w-4 h-4 text-primary" />
          <span className="font-semibold text-sm">Privacy & Data Use</span>
        </div>
        {collapsed ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
      </button>
      {!collapsed && (
        <div className="px-4 pb-4 text-xs text-muted-foreground">
          Analytics show aggregated data only. Height/weight and age are visible only with member opt-in.
          Incident tracking is admin-only with strict approval workflows. All actions are audited.
        </div>
      )}
    </div>
  );
};

// ============================================================
// OVERVIEW TAB - OPERATIONS HUB
// ============================================================

const OverviewTab = ({ profiles, analytics, incidents, commsPreview, memberScores, scoreConfig, onNavigate, onFilterDirectory, onOpenDrill }) => {
  const { isAdmin, currentUser, onUpdatePrivacy } = useRBAC();
  const [privacyModalOpen, setPrivacyModalOpen] = useState(false);
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [addressedRecs, setAddressedRecs] = useState(new Set());
  
  const openIncidents = incidents.filter(i => i.status !== 'Closed').length;
  const incidentsLast7d = useMemo(() => {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    return incidents.filter(i => new Date(i.createdAt) > sevenDaysAgo).length;
  }, [incidents]);
  
  // Members below thresholds
  const atRiskMembers = useMemo(() => {
    return Object.entries(memberScores)
      .filter(([, s]) => s.flag)
      .map(([userId, score]) => {
        const profile = profiles.find(p => p.userId === userId);
        return { ...profile, ...score };
      })
      .sort((a, b) => a.score - b.score)
      .slice(0, 3);
  }, [memberScores, profiles]);
  
  const thresholdCounts = useMemo(() => {
    const counts = { monitor: 0, restricted: 0, intervention: 0 };
    Object.values(memberScores).forEach(s => {
      if (s.flag) counts[s.flag]++;
    });
    return counts;
  }, [memberScores]);
  
  return (
    <div className="space-y-6">
      <PrivacyBanner />
      
      {/* Welcome Explainer for new users */}
      <div className="glass rounded-xl p-4 border border-violet-500/30 bg-gradient-to-r from-violet-500/5 to-fuchsia-500/5 mb-6">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-lg bg-violet-500/20 flex-shrink-0">
            <Users className="w-5 h-5 text-violet-400" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-sm">Welcome to the Community Hub</h3>
            <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
              This is your family&apos;s coordination center. Here you can see who&apos;s online, 
              check if we have enough people with important skills (like first aid or radio operation), 
              and quickly find the right people when you need help.
            </p>
          </div>
          <Button 
            size="sm" 
            variant="outline" 
            onClick={onOpenDrill}
            className="gap-1 border-orange-500/30 hover:border-orange-500/50 flex-shrink-0"
          >
            <Flame className="w-4 h-4 text-orange-400" />
            Practice Drill
          </Button>
        </div>
      </div>
      
      {/* Readiness Snapshot - 6 Domain Tiles */}
      <div className="glass rounded-xl p-4">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-lg font-bold flex items-center gap-2">
            <Target className="w-5 h-5 text-primary" />
            Readiness Snapshot
          </h2>
          <HelpTip title="What is this?">
            This shows how prepared we are in 6 key areas. Green &quot;OK&quot; means we have enough people. 
            Yellow &quot;WARN&quot; means we&apos;re low. Red &quot;P0&quot; means we have a critical gap that needs attention.
          </HelpTip>
        </div>
        <p className="text-sm text-muted-foreground mb-4">
          At a glance: do we have enough trained people in each critical area?
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {Object.entries(analytics.coverage.domains).map(([domain, data]) => (
            <button
              key={domain}
              onClick={() => onNavigate('analytics', { domain })}
              className="glass rounded-lg p-3 text-left hover:bg-white/5 transition-colors group"
              data-testid={`domain-tile-${domain}`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className={`p-1.5 rounded ${SKILL_DOMAINS[domain]?.bg}`}>
                  <DomainIcon domain={domain} className={`w-4 h-4 ${SKILL_DOMAINS[domain]?.color}`} />
                </div>
                <PriorityBadge priority={data.status} />
              </div>
              <h4 className="text-xs font-semibold truncate">{SKILL_DOMAINS[domain]?.label || domain}</h4>
              <p className="text-[10px] text-muted-foreground mt-1">
                Qualified: <span className="font-medium text-foreground">{data.qualifiedCount}</span>
                <span className="text-success"> ({data.onlineQualifiedCount} online)</span>
              </p>
              <p className="text-[10px] text-muted-foreground">
                Redundancy: <span className={data.redundancy === 'Low' ? 'text-warning' : 'text-foreground'}>{data.redundancy}</span>
              </p>
            </button>
          ))}
        </div>
      </div>
      
      {/* Skill Coverage Visualization */}
      <div className="glass rounded-xl p-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-semibold flex items-center gap-2">
            <Layers className="w-4 h-4 text-violet-400" />
            Skill Coverage Overview
          </h3>
          <HelpTip>
            The colored bars show how well-covered each area is. 
            Taller bars = more people with those skills. 
            We want all bars to be at least halfway full.
          </HelpTip>
        </div>
        <p className="text-sm text-muted-foreground mb-4">
          Visual view of how many people we have trained in each area.
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {Object.entries(analytics.coverage.domains).map(([domain, data]) => {
            const coveragePercent = Math.min(100, Math.round((data.qualifiedCount / Math.max(analytics.population.membersTotal * 0.3, 3)) * 100));
            return (
              <div key={domain} className="relative">
                <div className="glass rounded-lg p-3 overflow-hidden">
                  <div 
                    className={`absolute inset-0 ${SKILL_DOMAINS[domain]?.bg} opacity-30`}
                    style={{ 
                      clipPath: `inset(${100 - coveragePercent}% 0 0 0)`,
                      transition: 'clip-path 0.5s ease-out'
                    }}
                  />
                  <div className="relative z-10">
                    <DomainIcon domain={domain} className={`w-5 h-5 ${SKILL_DOMAINS[domain]?.color} mx-auto mb-1`} />
                    <p className="text-xs text-center font-medium">{domain}</p>
                    <p className={`text-lg font-bold text-center ${SKILL_DOMAINS[domain]?.color}`}>{data.qualifiedCount}</p>
                    <div className="h-1 bg-secondary rounded-full mt-2 overflow-hidden">
                      <div 
                        className={`h-full ${SKILL_DOMAINS[domain]?.bg?.replace('/20', '')}`}
                        style={{ width: `${coveragePercent}%`, transition: 'width 0.5s ease-out' }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
      
      {/* Official Teams & Bulletins Section */}
      <OfficialTeamsBulletins profiles={profiles} isAdmin={isAdmin} />
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-4">
          {/* Community Pulse */}
          <div className="glass rounded-xl p-4">
            <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
              <Activity className="w-5 h-5 text-primary" />
              Community Pulse
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="glass rounded-lg p-3 text-center">
                <div className="text-2xl font-bold text-success">{analytics.population.onlineNow}</div>
                <p className="text-xs text-muted-foreground">Online</p>
              </div>
              <div className="glass rounded-lg p-3 text-center">
                <div className="text-2xl font-bold">{analytics.population.membersTotal - analytics.population.onlineNow}</div>
                <p className="text-xs text-muted-foreground">Offline</p>
              </div>
              <div className="glass rounded-lg p-3 text-center">
                <div className="text-2xl font-bold text-primary">{analytics.population.newMembersWeek}</div>
                <p className="text-xs text-muted-foreground">New Members (7d)</p>
              </div>
              <div className="glass rounded-lg p-3 text-center">
                <div className="text-2xl font-bold text-cyan-400">{commsPreview.stats.messagesLast24h}</div>
                <p className="text-xs text-muted-foreground">Comms Activity (24h)</p>
              </div>
            </div>
            
            {/* Open Incidents Row */}
            <button
              onClick={() => {
                if (isAdmin) {
                  onNavigate('incidents');
                } else {
                  toast.error('Access denied', { description: 'Incident Reports are admin-only.' });
                }
              }}
              className={`mt-4 w-full p-3 rounded-lg flex items-center justify-between transition-colors ${
                isAdmin ? 'bg-amber-500/10 border border-amber-500/30 hover:bg-amber-500/20' : 'bg-muted/20 border border-border'
              }`}
              data-testid="open-incidents-row"
            >
              <span className="text-sm flex items-center gap-2">
                <AlertTriangle className={`w-4 h-4 ${isAdmin ? 'text-amber-400' : 'text-muted-foreground'}`} />
                Open Incidents
                {!isAdmin && <Lock className="w-3 h-3 text-muted-foreground" />}
              </span>
              <span className={`text-lg font-bold ${isAdmin ? 'text-amber-400' : 'text-muted-foreground'}`}>
                {isAdmin ? openIncidents : '—'}
              </span>
            </button>
          </div>
          
          {/* Single Point of Failure Panel */}
          {analytics.singlePointsOfFailure.length > 0 && (
            <div className="glass rounded-xl p-4 border border-destructive/30">
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-destructive" />
                Single Points of Failure
                <span className="text-xs text-muted-foreground ml-auto">Skills with 0-1 qualified members</span>
              </h3>
              <div className="space-y-2">
                {analytics.singlePointsOfFailure.slice(0, 4).map(spof => (
                  <div key={spof.tagKey} className="flex items-center justify-between p-2 rounded-lg bg-background/50">
                    <div className="flex items-center gap-2">
                      <PriorityBadge priority={spof.priority} />
                      <span className="text-sm font-medium">{spof.label}</span>
                      <span className="text-xs text-muted-foreground">
                        ({spof.holdersTotal} total, {spof.holdersOnline} online)
                      </span>
                    </div>
                    <div className="flex gap-1">
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-7 text-xs"
                        onClick={() => {
                          toast.success('Training task created', { description: `Task for ${spof.label} training added.` });
                        }}
                      >
                        <Plus className="w-3 h-3 mr-1" />Task
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-7 text-xs"
                        onClick={() => onFilterDirectory({ skills: [spof.tagKey] })}
                      >
                        Candidates
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {/* Strengths & Gaps */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="glass rounded-xl p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-success" />
                  Top Strengths
                </h3>
                <button
                  onClick={() => onNavigate('analytics')}
                  className="text-xs text-primary hover:underline flex items-center gap-1"
                >
                  Full breakdown <ChevronRight className="w-3 h-3" />
                </button>
              </div>
              <div className="space-y-2">
                {analytics.topStrengths.map(s => (
                  <button
                    key={s.tagKey}
                    onClick={() => onFilterDirectory({ skills: [s.tagKey] })}
                    className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-white/5 transition-colors"
                  >
                    <span className="text-sm">{s.label}</span>
                    <span className="text-xs">
                      <span className="font-medium">{s.countTotal}</span>
                      <span className="text-success"> / {s.countOnline} online</span>
                    </span>
                  </button>
                ))}
              </div>
            </div>
            
            <div className="glass rounded-xl p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-warning" />
                  Skill Gaps
                </h3>
                <button
                  onClick={() => onNavigate('analytics')}
                  className="text-xs text-primary hover:underline flex items-center gap-1"
                >
                  Full breakdown <ChevronRight className="w-3 h-3" />
                </button>
              </div>
              <div className="space-y-2">
                {analytics.topGaps.map(g => (
                  <button
                    key={g.tagKey}
                    onClick={() => onFilterDirectory({ skills: [g.tagKey] })}
                    className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-white/5 transition-colors"
                  >
                    <span className="text-sm">{g.label}</span>
                    <span className={`text-xs ${g.countTotal === 0 ? 'text-destructive' : g.countTotal === 1 ? 'text-warning' : ''}`}>
                      <span className="font-medium">{g.countTotal}</span>
                      <span className="text-success"> / {g.countOnline} online</span>
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>
          
          {/* System Recommendations */}
          <div className="glass rounded-xl p-4">
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <Lightbulb className="w-4 h-4 text-primary" />
              System Recommendations
            </h3>
            <div className="space-y-2">
              {analytics.recommendations.filter(r => !addressedRecs.has(r.id)).slice(0, 4).map(rec => (
                <div key={rec.id} className="p-3 rounded-lg bg-background/50 border border-border/50">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <PriorityBadge priority={rec.priority} />
                        <span className="text-sm font-medium">{rec.title}</span>
                      </div>
                      <p className="text-xs text-muted-foreground">{rec.detail}</p>
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-6 text-[10px]"
                      onClick={() => setAddressedRecs(prev => new Set([...prev, rec.id]))}
                    >
                      <CheckCheck className="w-3 h-3" />
                    </Button>
                  </div>
                  <div className="flex gap-1 mt-2">
                    {rec.actions?.includes('Create Training Task') && (
                      <Button size="sm" variant="outline" className="h-6 text-[10px]" onClick={() => toast.success('Task created')}>
                        <ClipboardList className="w-3 h-3 mr-1" />Task
                      </Button>
                    )}
                    {rec.actions?.includes('Start Discussion') && (
                      <Button size="sm" variant="outline" className="h-6 text-[10px]" onClick={() => toast.success('Discussion started')}>
                        <MessageSquare className="w-3 h-3 mr-1" />Discuss
                      </Button>
                    )}
                    {rec.filterSkill && (
                      <Button size="sm" variant="outline" className="h-6 text-[10px]" onClick={() => onFilterDirectory({ skills: [rec.filterSkill] })}>
                        <Users className="w-3 h-3 mr-1" />Members
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {/* Member Roster Preview */}
          <div className="glass rounded-xl p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold flex items-center gap-2">
                <Users className="w-4 h-4 text-primary" />
                Member Roster
              </h3>
              <Button size="sm" variant="ghost" onClick={() => onNavigate('directory')} className="text-xs">
                View All <ChevronRight className="w-3 h-3 ml-1" />
              </Button>
            </div>
            
            {/* Search field */}
            <div className="relative mb-3">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search members..."
                className="pl-9 h-9"
                onFocus={() => onNavigate('directory')}
                data-testid="roster-search"
              />
            </div>
            
            {/* Mini roster grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {profiles.slice(0, 8).map(profile => {
                const redacted = redactProfile(profile, currentUser?.role);
                return (
                  <button
                    key={profile.userId}
                    onClick={() => onFilterDirectory({ q: profile.displayName })}
                    className="glass rounded-lg p-2 text-left hover:bg-white/5 transition-colors"
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-500/50 to-fuchsia-500/50 flex items-center justify-center text-xs font-bold">
                        {profile.displayName.split(' ').map(n => n[0]).join('')}
                      </div>
                      <StatusDot online={profile.stats.online} />
                    </div>
                    <p className="text-xs font-medium truncate">{profile.displayName}</p>
                    <p className="text-[10px] text-muted-foreground truncate">{profile.class || 'Member'}</p>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
        
        {/* Right Column */}
        <div className="space-y-4">
          {/* Comms Preview */}
          <div className="glass rounded-xl p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold flex items-center gap-2">
                <Bell className="w-4 h-4 text-cyan-400" />
                Pinned Bulletins
              </h3>
              <Button size="sm" variant="ghost" onClick={() => onNavigate('comms')} className="text-xs">
                View all <ChevronRight className="w-3 h-3 ml-1" />
              </Button>
            </div>
            <div className="space-y-2">
              {commsPreview.pinnedBulletins.map(b => (
                <div key={b.id} className="p-2 rounded-lg bg-background/50 hover:bg-white/5 transition-colors cursor-pointer">
                  <div className="flex items-start gap-2">
                    <div className={`w-2 h-2 rounded-full mt-1.5 ${b.severity === 'warning' ? 'bg-warning' : 'bg-primary'}`} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{b.title}</p>
                      <p className="text-[10px] text-muted-foreground">{b.author} • {new Date(b.createdAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="mt-4 pt-3 border-t border-border/50">
              <h4 className="text-xs font-semibold text-muted-foreground mb-2">Recent Activity</h4>
              <div className="space-y-1">
                {commsPreview.recentActivity.slice(0, 3).map((a, i) => (
                  <p key={i} className="text-xs text-muted-foreground truncate">{a.label}</p>
                ))}
              </div>
            </div>
          </div>
          
          {/* Data Quality Card */}
          <div className="glass rounded-xl p-4">
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <BarChart2 className="w-4 h-4 text-violet-400" />
              Data Quality
            </h3>
            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-muted-foreground">Profile Completeness</span>
                  <span className="font-medium">{analytics.dataQuality.avgCompleteness}%</span>
                </div>
                <div className="h-2 bg-secondary rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-primary to-accent"
                    style={{ width: `${analytics.dataQuality.avgCompleteness}%` }}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-2 rounded bg-background/50">
                  <p className="text-muted-foreground">Incomplete</p>
                  <p className="font-bold text-warning">{analytics.dataQuality.incompleteProfiles}</p>
                </div>
                <div className="p-2 rounded bg-background/50">
                  <p className="text-muted-foreground">Missing Skills</p>
                  <p className="font-bold text-warning">{analytics.dataQuality.missingSkills}</p>
                </div>
              </div>
              <Button
                size="sm"
                variant="outline"
                className="w-full text-xs"
                onClick={() => setProfileModalOpen(true)}
              >
                <Send className="w-3 h-3 mr-1" />Ask members to complete profiles
              </Button>
            </div>
          </div>
          
          {/* Languages */}
          <div className="glass rounded-xl p-4">
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <Globe className="w-4 h-4 text-emerald-400" />
              Languages
            </h3>
            <div className="flex flex-wrap gap-1">
              {analytics.languages.slice(0, 8).map(l => (
                <button
                  key={l.code}
                  onClick={() => onFilterDirectory({ languages: [l.code] })}
                  className="px-2 py-1 rounded bg-secondary hover:bg-secondary/80 text-xs"
                >
                  {LANGUAGES[l.code]?.flag} {l.label} ({l.count})
                </button>
              ))}
            </div>
          </div>
          
          {/* Member Privacy Controls */}
          <div className="glass rounded-xl p-4">
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <Lock className="w-4 h-4 text-amber-400" />
              My Privacy Settings
            </h3>
            <Button
              size="sm"
              variant="outline"
              className="w-full"
              onClick={() => setPrivacyModalOpen(true)}
            >
              <Eye className="w-3 h-3 mr-1" />Manage my privacy
            </Button>
          </div>
          
          {/* Admin Governance Snapshot */}
          {isAdmin && (
            <div className="glass rounded-xl p-4 border border-amber-500/30">
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-amber-400" />
                Admin Governance
              </h3>
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="p-2 rounded bg-amber-500/10">
                    <p className="text-muted-foreground">Open Incidents</p>
                    <p className="font-bold text-amber-400">{openIncidents}</p>
                  </div>
                  <div className="p-2 rounded bg-amber-500/10">
                    <p className="text-muted-foreground">Last 7 Days</p>
                    <p className="font-bold text-amber-400">{incidentsLast7d}</p>
                  </div>
                </div>
                
                <div className="text-xs">
                  <p className="text-muted-foreground mb-1">Members Below Thresholds:</p>
                  <div className="flex gap-2">
                    <span className="px-2 py-0.5 rounded bg-warning/20 text-warning">Monitor: {thresholdCounts.monitor}</span>
                    <span className="px-2 py-0.5 rounded bg-orange-500/20 text-orange-400">Restricted: {thresholdCounts.restricted}</span>
                    <span className="px-2 py-0.5 rounded bg-destructive/20 text-destructive">Critical: {thresholdCounts.intervention}</span>
                  </div>
                </div>
                
                {atRiskMembers.length > 0 && (
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">At-Risk Members:</p>
                    <div className="space-y-1">
                      {atRiskMembers.map(m => (
                        <div key={m.userId} className="flex items-center justify-between p-2 rounded bg-background/50">
                          <span className="text-xs">{m.displayName}</span>
                          <div className="flex items-center gap-2">
                            <span className={`text-xs font-bold ${
                              m.flag === 'intervention' ? 'text-destructive' : 
                              m.flag === 'restricted' ? 'text-orange-400' : 'text-warning'
                            }`}>{m.score}</span>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-6 text-[10px]"
                              onClick={() => onNavigate('incidents')}
                            >
                              Review
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Privacy Modal */}
      <Sheet open={privacyModalOpen} onOpenChange={setPrivacyModalOpen}>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>Privacy Settings</SheetTitle>
            <SheetDescription>Control what information is visible to other members</SheetDescription>
          </SheetHeader>
          <PrivacySettingsPanel currentUser={currentUser} onUpdate={onUpdatePrivacy} onClose={() => setPrivacyModalOpen(false)} />
        </SheetContent>
      </Sheet>
      
      {/* Profile Reminder Modal */}
      <Sheet open={profileModalOpen} onOpenChange={setProfileModalOpen}>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>Profile Completion Reminder</SheetTitle>
            <SheetDescription>Copy this announcement to encourage profile updates</SheetDescription>
          </SheetHeader>
          <div className="mt-4 space-y-4">
            <div className="p-4 rounded-lg bg-secondary text-sm">
              <p className="font-medium mb-2">📋 Action Needed: Complete Your Profile</p>
              <p className="text-muted-foreground">
                Hey team! We noticed some profiles are missing key information. 
                Please take a moment to update your skills, languages, and availability status.
                Complete profiles help us coordinate better during emergencies.
              </p>
            </div>
            <Button
              className="w-full"
              onClick={() => {
                navigator.clipboard.writeText(
                  "📋 Action Needed: Complete Your Profile\n\nHey team! We noticed some profiles are missing key information. Please take a moment to update your skills, languages, and availability status. Complete profiles help us coordinate better during emergencies."
                );
                toast.success('Copied to clipboard');
              }}
            >
              <Copy className="w-4 h-4 mr-2" />Copy Announcement
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
};

// Privacy Settings Panel
const PrivacySettingsPanel = ({ currentUser, onUpdate, onClose }) => {
  const [privacy, setPrivacy] = useState(currentUser?.privacy || {
    showAge: false,
    showHeightWeight: false,
    showEducation: true,
  });
  
  const handleSave = () => {
    onUpdate?.(privacy);
    toast.success('Privacy settings updated');
    onClose();
  };
  
  return (
    <div className="mt-4 space-y-4">
      <div className="space-y-3">
        {[
          { key: 'showAge', label: 'Share my age', desc: 'Allow members to see your age' },
          { key: 'showHeightWeight', label: 'Share height & weight', desc: 'Allow members to see physical stats' },
          { key: 'showEducation', label: 'Share education level', desc: 'Allow members to see your education' },
        ].map(item => (
          <label key={item.key} className="flex items-start gap-3 p-3 rounded-lg hover:bg-secondary cursor-pointer">
            <input
              type="checkbox"
              checked={privacy[item.key]}
              onChange={(e) => setPrivacy({ ...privacy, [item.key]: e.target.checked })}
              className="mt-1"
            />
            <div>
              <p className="font-medium text-sm">{item.label}</p>
              <p className="text-xs text-muted-foreground">{item.desc}</p>
            </div>
          </label>
        ))}
      </div>
      <Button onClick={handleSave} className="w-full">Save Privacy Settings</Button>
    </div>
  );
};

// ============================================================
// DIRECTORY TAB - FULL ROSTER
// ============================================================

const DirectoryTab = ({ profiles, memberScores, scoreConfig, initialFilters, onOpenProfile }) => {
  const { currentUser, isAdmin } = useRBAC();
  const viewerRole = currentUser?.role || 'guest';
  
  // Search & filters
  const [searchQuery, setSearchQuery] = useState(initialFilters?.q || '');
  const [onlineOnly, setOnlineOnly] = useState(initialFilters?.online || false);
  const [selectedSkills, setSelectedSkills] = useState(initialFilters?.skills || []);
  const [selectedLanguages, setSelectedLanguages] = useState(initialFilters?.languages || []);
  const [selectedEducation, setSelectedEducation] = useState('');
  const [selectedClass, setSelectedClass] = useState('');
  const [sortBy, setSortBy] = useState('online'); // online, name, skills
  const [showFilters, setShowFilters] = useState(false);
  const [showTeamBuilder, setShowTeamBuilder] = useState(false);
  
  // Available options
  const allSkills = useMemo(() => Object.keys(CANONICAL_SKILLS), []);
  const allLanguages = useMemo(() => Object.keys(LANGUAGES), []);
  const allClasses = useMemo(() => [...new Set(profiles.map(p => p.class).filter(Boolean))], [profiles]);
  
  // Filter profiles
  const filteredProfiles = useMemo(() => {
    let result = profiles.map(p => redactProfile(p, viewerRole));
    
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(p =>
        p.displayName.toLowerCase().includes(q) ||
        p.skills.some(s => getSkillLabel(s).toLowerCase().includes(q)) ||
        p.languages.some(l => getLanguageLabel(l).toLowerCase().includes(q))
      );
    }
    
    if (onlineOnly) {
      result = result.filter(p => p.stats.online);
    }
    
    if (selectedSkills.length > 0) {
      result = result.filter(p => selectedSkills.some(s => p.skills.includes(s)));
    }
    
    if (selectedLanguages.length > 0) {
      result = result.filter(p => selectedLanguages.some(l => p.languages.includes(l)));
    }
    
    if (selectedEducation) {
      result = result.filter(p => p.educationLevel === selectedEducation);
    }
    
    if (selectedClass) {
      result = result.filter(p => p.class === selectedClass);
    }
    
    // Sort
    if (sortBy === 'online') {
      result.sort((a, b) => (b.stats.online ? 1 : 0) - (a.stats.online ? 1 : 0));
    } else if (sortBy === 'name') {
      result.sort((a, b) => a.displayName.localeCompare(b.displayName));
    } else if (sortBy === 'skills') {
      result.sort((a, b) => b.skills.length - a.skills.length);
    }
    
    return result;
  }, [profiles, viewerRole, searchQuery, onlineOnly, selectedSkills, selectedLanguages, selectedEducation, selectedClass, sortBy]);
  
  const clearFilters = () => {
    setSearchQuery('');
    setOnlineOnly(false);
    setSelectedSkills([]);
    setSelectedLanguages([]);
    setSelectedEducation('');
    setSelectedClass('');
  };
  
  const hasActiveFilters = searchQuery || onlineOnly || selectedSkills.length > 0 || selectedLanguages.length > 0 || selectedEducation || selectedClass;
  
  return (
    <div className="space-y-4">
      {/* Search & Filter Bar */}
      <div className="glass rounded-xl p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search name, skills, or languages..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
              data-testid="directory-search"
            />
          </div>
          <div className="flex gap-2">
            <Button
              variant={onlineOnly ? 'default' : 'outline'}
              size="sm"
              onClick={() => setOnlineOnly(!onlineOnly)}
              className="gap-1"
            >
              <StatusDot online={true} />
              Online Only
            </Button>
            <Button
              variant={showFilters ? 'default' : 'outline'}
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
              className="gap-1"
            >
              <Filter className="w-4 h-4" />
              Filters
              {hasActiveFilters && <span className="w-2 h-2 rounded-full bg-primary" />}
            </Button>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-secondary rounded-lg px-3 text-sm"
            >
              <option value="online">Online First</option>
              <option value="name">Name A-Z</option>
              <option value="skills">Most Skilled</option>
            </select>
          </div>
        </div>
        
        {/* Expanded Filters */}
        {showFilters && (
          <div className="mt-4 pt-4 border-t border-border space-y-3">
            {/* Skills Filter */}
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Skills</label>
              <div className="flex flex-wrap gap-1 max-h-24 overflow-y-auto">
                {allSkills.slice(0, 20).map(skill => (
                  <button
                    key={skill}
                    onClick={() => setSelectedSkills(prev => 
                      prev.includes(skill) ? prev.filter(s => s !== skill) : [...prev, skill]
                    )}
                    className={`px-2 py-1 rounded text-xs transition-colors ${
                      selectedSkills.includes(skill) ? 'bg-primary text-white' : 'bg-secondary hover:bg-secondary/80'
                    }`}
                  >
                    {getSkillLabel(skill)}
                  </button>
                ))}
              </div>
            </div>
            
            {/* Languages Filter */}
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Languages</label>
              <div className="flex flex-wrap gap-1">
                {allLanguages.map(lang => (
                  <button
                    key={lang}
                    onClick={() => setSelectedLanguages(prev =>
                      prev.includes(lang) ? prev.filter(l => l !== lang) : [...prev, lang]
                    )}
                    className={`px-2 py-1 rounded text-xs transition-colors ${
                      selectedLanguages.includes(lang) ? 'bg-primary text-white' : 'bg-secondary hover:bg-secondary/80'
                    }`}
                  >
                    {LANGUAGES[lang]?.flag} {LANGUAGES[lang]?.label}
                  </button>
                ))}
              </div>
            </div>
            
            {/* Education & Class */}
            <div className="flex gap-3">
              <div className="flex-1">
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Education</label>
                <select
                  value={selectedEducation}
                  onChange={(e) => setSelectedEducation(e.target.value)}
                  className="w-full bg-secondary rounded-lg px-3 py-2 text-sm"
                >
                  <option value="">Any</option>
                  {Object.entries(EDUCATION_LEVELS).map(([key, val]) => (
                    <option key={key} value={key}>{val.label}</option>
                  ))}
                </select>
              </div>
              <div className="flex-1">
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Role/Class</label>
                <select
                  value={selectedClass}
                  onChange={(e) => setSelectedClass(e.target.value)}
                  className="w-full bg-secondary rounded-lg px-3 py-2 text-sm"
                >
                  <option value="">Any</option>
                  {allClasses.map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
            </div>
            
            {hasActiveFilters && (
              <Button variant="ghost" size="sm" onClick={clearFilters} className="text-xs">
                <XCircle className="w-3 h-3 mr-1" />Clear all filters
              </Button>
            )}
          </div>
        )}
      </div>
      
      {/* Results Count + Team Builder */}
      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">
          Showing <span className="font-medium text-foreground">{filteredProfiles.length}</span> of {profiles.length} members
        </span>
        <div className="flex items-center gap-2">
          {hasActiveFilters && (
            <span className="text-xs text-primary">Filtered results</span>
          )}
          <Button
            size="sm"
            variant="outline"
            onClick={() => setShowTeamBuilder(true)}
            className="gap-1.5 bg-gradient-to-r from-violet-500/10 to-fuchsia-500/10 border-violet-500/30 hover:border-violet-500/50"
            data-testid="team-builder-btn"
          >
            <Wand2 className="w-4 h-4 text-violet-400" />
            Team Builder
            <Sparkles className="w-3 h-3 text-fuchsia-400" />
          </Button>
        </div>
      </div>
      
      {/* Profile Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filteredProfiles.map(profile => (
          <ProfileCard
            key={profile.userId}
            profile={profile}
            score={memberScores[profile.userId]}
            scoreConfig={scoreConfig}
            onOpen={() => onOpenProfile(profile)}
            isAdmin={isAdmin}
          />
        ))}
      </div>
      
      {filteredProfiles.length === 0 && (
        <div className="text-center py-12 glass rounded-xl">
          <Users className="w-12 h-12 mx-auto mb-3 text-muted-foreground/50" />
          <p className="text-muted-foreground">No members match your filters</p>
          <Button variant="link" onClick={clearFilters} className="mt-2">Clear filters</Button>
        </div>
      )}
      
      {/* Team Builder Drawer */}
      <TeamBuilderDrawer
        isOpen={showTeamBuilder}
        onClose={() => setShowTeamBuilder(false)}
        profiles={profiles}
        memberScores={memberScores}
      />
    </div>
  );
};

// ============================================================
// TEAM BUILDER - AI-Powered Team Composition Tool
// ============================================================

const TEAM_PRESETS = [
  {
    id: 'emergency-response',
    name: 'Emergency Response',
    icon: AlertTriangle,
    color: 'text-destructive',
    bg: 'bg-destructive/20',
    description: 'Quick deployment for urgent situations',
    requiredSkills: ['Medical.FirstAid', 'Medical.Trauma', 'Security.Perimeter', 'Comms.HAM'],
    optionalSkills: ['Medical.EMT', 'Logistics.Navigation'],
    minSize: 3,
    maxSize: 6,
  },
  {
    id: 'supply-run',
    name: 'Supply Run',
    icon: Compass,
    color: 'text-emerald-400',
    bg: 'bg-emerald-500/20',
    description: 'Procurement and logistics mission',
    requiredSkills: ['Logistics.Navigation', 'Security.SelfDefense', 'Logistics.Transport'],
    optionalSkills: ['Logistics.Inventory', 'FoodWater.Foraging'],
    minSize: 2,
    maxSize: 4,
  },
  {
    id: 'infrastructure',
    name: 'Infrastructure Repair',
    icon: Wrench,
    color: 'text-orange-400',
    bg: 'bg-orange-500/20',
    description: 'Building and maintenance tasks',
    requiredSkills: ['Engineering.Electrical', 'Engineering.Plumbing'],
    optionalSkills: ['Engineering.Carpentry', 'Engineering.Welding', 'Engineering.SolarSystems'],
    minSize: 2,
    maxSize: 5,
  },
  {
    id: 'medical-team',
    name: 'Medical Team',
    icon: Stethoscope,
    color: 'text-rose-400',
    bg: 'bg-rose-500/20',
    description: 'Healthcare and wellness support',
    requiredSkills: ['Medical.FirstAid', 'Medical.CPR'],
    optionalSkills: ['Medical.Trauma', 'Medical.Nursing', 'Medical.EMT'],
    minSize: 2,
    maxSize: 4,
  },
  {
    id: 'comms-setup',
    name: 'Communications Setup',
    icon: Radio,
    color: 'text-cyan-400',
    bg: 'bg-cyan-500/20',
    description: 'Establish or maintain comms network',
    requiredSkills: ['Comms.HAM', 'Comms.Networking'],
    optionalSkills: ['Engineering.Electronics', 'Comms.SignalProcessing'],
    minSize: 2,
    maxSize: 3,
  },
  {
    id: 'custom',
    name: 'Custom Team',
    icon: Settings2,
    color: 'text-violet-400',
    bg: 'bg-violet-500/20',
    description: 'Build your own team requirements',
    requiredSkills: [],
    optionalSkills: [],
    minSize: 1,
    maxSize: 10,
  },
];

const TeamBuilderDrawer = ({ isOpen, onClose, profiles, memberScores }) => {
  const [step, setStep] = useState(1); // 1: Select preset, 2: Customize, 3: Results
  const [selectedPreset, setSelectedPreset] = useState(null);
  const [requiredSkills, setRequiredSkills] = useState([]);
  const [optionalSkills, setOptionalSkills] = useState([]);
  const [preferOnline, setPreferOnline] = useState(true);
  const [teamSize, setTeamSize] = useState(4);
  const [generatedTeam, setGeneratedTeam] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [savedTeams, setSavedTeams] = useState([]);
  
  const allSkills = useMemo(() => Object.keys(CANONICAL_SKILLS), []);
  
  const handlePresetSelect = (preset) => {
    setSelectedPreset(preset);
    setRequiredSkills(preset.requiredSkills || []);
    setOptionalSkills(preset.optionalSkills || []);
    setTeamSize(Math.min(preset.maxSize, Math.max(preset.minSize, 4)));
    setStep(2);
  };
  
  const generateTeam = useCallback(() => {
    setIsGenerating(true);
    
    // Simulate AI processing delay
    setTimeout(() => {
      // Score each profile based on requirements
      const scoredProfiles = profiles.map(profile => {
        let score = 0;
        let matchedRequired = 0;
        let matchedOptional = 0;
        
        // Required skills (high weight)
        requiredSkills.forEach(skill => {
          if (profile.skills.includes(skill)) {
            score += 100;
            matchedRequired++;
          }
        });
        
        // Optional skills (medium weight)
        optionalSkills.forEach(skill => {
          if (profile.skills.includes(skill)) {
            score += 30;
            matchedOptional++;
          }
        });
        
        // Bonus for being online
        if (preferOnline && profile.stats.online) {
          score += 50;
        }
        
        // Bonus for additional relevant skills
        const allRequiredDomains = [...new Set([...requiredSkills, ...optionalSkills].map(getSkillDomain))];
        profile.skills.forEach(skill => {
          if (allRequiredDomains.includes(getSkillDomain(skill))) {
            score += 5;
          }
        });
        
        // Penalty for low community score (if admin)
        const memberScore = memberScores[profile.userId];
        if (memberScore?.flag === 'intervention') score -= 30;
        if (memberScore?.flag === 'restricted') score -= 15;
        
        return {
          ...profile,
          teamScore: score,
          matchedRequired,
          matchedOptional,
          requiredCoverage: requiredSkills.length > 0 ? matchedRequired / requiredSkills.length : 1,
        };
      });
      
      // Sort by score
      scoredProfiles.sort((a, b) => b.teamScore - a.teamScore);
      
      // Build team ensuring skill coverage
      const team = [];
      const coveredRequired = new Set();
      const coveredOptional = new Set();
      
      // First pass: prioritize covering required skills
      for (const profile of scoredProfiles) {
        if (team.length >= teamSize) break;
        
        const coversNewRequired = requiredSkills.some(s => 
          profile.skills.includes(s) && !coveredRequired.has(s)
        );
        
        if (coversNewRequired || coveredRequired.size >= requiredSkills.length) {
          team.push(profile);
          profile.skills.forEach(s => {
            if (requiredSkills.includes(s)) coveredRequired.add(s);
            if (optionalSkills.includes(s)) coveredOptional.add(s);
          });
        }
      }
      
      // Fill remaining slots with best remaining candidates
      for (const profile of scoredProfiles) {
        if (team.length >= teamSize) break;
        if (!team.find(t => t.userId === profile.userId)) {
          team.push(profile);
          profile.skills.forEach(s => {
            if (requiredSkills.includes(s)) coveredRequired.add(s);
            if (optionalSkills.includes(s)) coveredOptional.add(s);
          });
        }
      }
      
      // Calculate team stats
      const teamStats = {
        totalMembers: team.length,
        onlineMembers: team.filter(m => m.stats.online).length,
        requiredCoverage: requiredSkills.length > 0 
          ? Math.round((coveredRequired.size / requiredSkills.length) * 100) 
          : 100,
        optionalCoverage: optionalSkills.length > 0
          ? Math.round((coveredOptional.size / optionalSkills.length) * 100)
          : 100,
        missingRequired: requiredSkills.filter(s => !coveredRequired.has(s)),
        coveredOptional: [...coveredOptional],
        uniqueSkills: [...new Set(team.flatMap(m => m.skills))].length,
      };
      
      setGeneratedTeam({ members: team, stats: teamStats });
      setIsGenerating(false);
      setStep(3);
    }, 800);
  }, [profiles, memberScores, requiredSkills, optionalSkills, preferOnline, teamSize]);
  
  const saveTeam = () => {
    if (!generatedTeam) return;
    const teamName = `${selectedPreset?.name || 'Custom'} Team - ${new Date().toLocaleDateString()}`;
    setSavedTeams(prev => [...prev, { name: teamName, ...generatedTeam, savedAt: new Date().toISOString() }]);
    toast.success('Team saved!', { description: teamName });
  };
  
  const copyTeamList = () => {
    if (!generatedTeam) return;
    const text = generatedTeam.members.map(m => `${m.displayName} (${m.class || 'Member'})`).join('\n');
    navigator.clipboard.writeText(text);
    toast.success('Team list copied to clipboard');
  };
  
  const reset = () => {
    setStep(1);
    setSelectedPreset(null);
    setRequiredSkills([]);
    setOptionalSkills([]);
    setGeneratedTeam(null);
  };
  
  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="w-full sm:max-w-xl overflow-y-auto">
        <SheetHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-gradient-to-br from-violet-500/20 to-fuchsia-500/20">
              <Wand2 className="w-5 h-5 text-violet-400" />
            </div>
            <div>
              <SheetTitle className="flex items-center gap-2">
                Team Builder
                <Sparkles className="w-4 h-4 text-fuchsia-400" />
              </SheetTitle>
              <SheetDescription>Build optimal teams based on skill requirements</SheetDescription>
            </div>
          </div>
        </SheetHeader>
        
        {/* Progress Steps */}
        <div className="flex items-center justify-center gap-2 my-6">
          {[1, 2, 3].map(s => (
            <div key={s} className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors ${
                step >= s ? 'bg-primary text-white' : 'bg-secondary text-muted-foreground'
              }`}>
                {s}
              </div>
              {s < 3 && <div className={`w-8 h-0.5 ${step > s ? 'bg-primary' : 'bg-secondary'}`} />}
            </div>
          ))}
        </div>
        
        {/* Step 1: Select Preset */}
        {step === 1 && (
          <div className="space-y-4">
            <h3 className="font-semibold">Select Team Type</h3>
            <div className="grid grid-cols-2 gap-3">
              {TEAM_PRESETS.map(preset => (
                <button
                  key={preset.id}
                  onClick={() => handlePresetSelect(preset)}
                  className="p-4 rounded-xl glass hover:bg-white/5 transition-colors text-left group"
                >
                  <div className={`w-10 h-10 rounded-lg ${preset.bg} flex items-center justify-center mb-2`}>
                    <preset.icon className={`w-5 h-5 ${preset.color}`} />
                  </div>
                  <h4 className="font-medium text-sm">{preset.name}</h4>
                  <p className="text-xs text-muted-foreground mt-1">{preset.description}</p>
                  <ChevronRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity absolute top-4 right-4" />
                </button>
              ))}
            </div>
            
            {savedTeams.length > 0 && (
              <div className="mt-6">
                <h4 className="text-sm font-medium text-muted-foreground mb-2">Saved Teams</h4>
                <div className="space-y-2">
                  {savedTeams.slice(-3).map((team, i) => (
                    <div key={i} className="p-3 rounded-lg bg-secondary/50 flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium">{team.name}</p>
                        <p className="text-xs text-muted-foreground">{team.stats.totalMembers} members</p>
                      </div>
                      <Bookmark className="w-4 h-4 text-primary" />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
        
        {/* Step 2: Customize */}
        {step === 2 && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <Button variant="ghost" size="sm" onClick={() => setStep(1)} className="gap-1">
                <ChevronLeft className="w-4 h-4" />Back
              </Button>
              <h3 className="font-semibold">{selectedPreset?.name || 'Custom Team'}</h3>
              <div />
            </div>
            
            {/* Team Size */}
            <div>
              <label className="text-sm font-medium mb-2 block">Team Size: {teamSize}</label>
              <input
                type="range"
                min={selectedPreset?.minSize || 1}
                max={selectedPreset?.maxSize || 10}
                value={teamSize}
                onChange={(e) => setTeamSize(parseInt(e.target.value))}
                className="w-full accent-primary"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>{selectedPreset?.minSize || 1}</span>
                <span>{selectedPreset?.maxSize || 10}</span>
              </div>
            </div>
            
            {/* Prefer Online */}
            <label className="flex items-center gap-3 p-3 rounded-lg bg-secondary/50 cursor-pointer">
              <input
                type="checkbox"
                checked={preferOnline}
                onChange={(e) => setPreferOnline(e.target.checked)}
                className="accent-primary"
              />
              <div>
                <p className="text-sm font-medium">Prefer online members</p>
                <p className="text-xs text-muted-foreground">Prioritize members who are currently online</p>
              </div>
            </label>
            
            {/* Required Skills */}
            <div>
              <label className="text-sm font-medium mb-2 block flex items-center gap-2">
                <span className="text-destructive">*</span> Required Skills
              </label>
              <div className="flex flex-wrap gap-1 max-h-32 overflow-y-auto p-2 rounded-lg bg-secondary/30">
                {allSkills.map(skill => (
                  <button
                    key={skill}
                    onClick={() => setRequiredSkills(prev =>
                      prev.includes(skill) ? prev.filter(s => s !== skill) : [...prev, skill]
                    )}
                    className={`px-2 py-1 rounded text-xs transition-colors ${
                      requiredSkills.includes(skill) 
                        ? 'bg-destructive/20 text-destructive border border-destructive/30' 
                        : 'bg-secondary hover:bg-secondary/80'
                    }`}
                  >
                    {getSkillLabel(skill)}
                  </button>
                ))}
              </div>
              <p className="text-xs text-muted-foreground mt-1">{requiredSkills.length} required</p>
            </div>
            
            {/* Optional Skills */}
            <div>
              <label className="text-sm font-medium mb-2 block">Nice-to-have Skills</label>
              <div className="flex flex-wrap gap-1 max-h-32 overflow-y-auto p-2 rounded-lg bg-secondary/30">
                {allSkills.filter(s => !requiredSkills.includes(s)).map(skill => (
                  <button
                    key={skill}
                    onClick={() => setOptionalSkills(prev =>
                      prev.includes(skill) ? prev.filter(s => s !== skill) : [...prev, skill]
                    )}
                    className={`px-2 py-1 rounded text-xs transition-colors ${
                      optionalSkills.includes(skill) 
                        ? 'bg-primary/20 text-primary border border-primary/30' 
                        : 'bg-secondary hover:bg-secondary/80'
                    }`}
                  >
                    {getSkillLabel(skill)}
                  </button>
                ))}
              </div>
              <p className="text-xs text-muted-foreground mt-1">{optionalSkills.length} optional</p>
            </div>
            
            <Button
              className="w-full gap-2"
              onClick={generateTeam}
              disabled={requiredSkills.length === 0 && optionalSkills.length === 0}
            >
              <Sparkles className="w-4 h-4" />
              Generate Optimal Team
            </Button>
          </div>
        )}
        
        {/* Step 3: Results */}
        {step === 3 && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <Button variant="ghost" size="sm" onClick={() => setStep(2)} className="gap-1">
                <ChevronLeft className="w-4 h-4" />Adjust
              </Button>
              <h3 className="font-semibold">Generated Team</h3>
              <Button variant="ghost" size="sm" onClick={reset} className="gap-1">
                <RotateCcw className="w-4 h-4" />New
              </Button>
            </div>
            
            {isGenerating ? (
              <div className="py-12 text-center">
                <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-gradient-to-r from-violet-500 to-fuchsia-500 animate-spin flex items-center justify-center">
                  <Sparkles className="w-6 h-6 text-white" />
                </div>
                <p className="text-muted-foreground">Building optimal team...</p>
              </div>
            ) : generatedTeam && (
              <>
                {/* Team Stats */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 rounded-lg glass text-center">
                    <p className="text-2xl font-bold text-primary">{generatedTeam.stats.totalMembers}</p>
                    <p className="text-xs text-muted-foreground">Team Size</p>
                  </div>
                  <div className="p-3 rounded-lg glass text-center">
                    <p className="text-2xl font-bold text-success">{generatedTeam.stats.onlineMembers}</p>
                    <p className="text-xs text-muted-foreground">Online Now</p>
                  </div>
                  <div className="p-3 rounded-lg glass text-center">
                    <p className={`text-2xl font-bold ${
                      generatedTeam.stats.requiredCoverage === 100 ? 'text-success' : 'text-warning'
                    }`}>{generatedTeam.stats.requiredCoverage}%</p>
                    <p className="text-xs text-muted-foreground">Required Coverage</p>
                  </div>
                  <div className="p-3 rounded-lg glass text-center">
                    <p className="text-2xl font-bold">{generatedTeam.stats.uniqueSkills}</p>
                    <p className="text-xs text-muted-foreground">Unique Skills</p>
                  </div>
                </div>
                
                {/* Missing Skills Warning */}
                {generatedTeam.stats.missingRequired.length > 0 && (
                  <div className="p-3 rounded-lg bg-warning/10 border border-warning/30">
                    <div className="flex items-start gap-2">
                      <AlertTriangle className="w-4 h-4 text-warning mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-warning">Missing Required Skills</p>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {generatedTeam.stats.missingRequired.map(skill => (
                            <span key={skill} className="text-xs px-1.5 py-0.5 rounded bg-warning/20">
                              {getSkillLabel(skill)}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                
                {/* Team Members */}
                <div className="space-y-2">
                  <h4 className="text-sm font-medium">Team Members</h4>
                  {generatedTeam.members.map((member, idx) => (
                    <div key={member.userId} className="p-3 rounded-lg glass flex items-center gap-3">
                      <div className="relative">
                        {idx === 0 && (
                          <Crown className="w-4 h-4 text-amber-400 absolute -top-2 -right-1" />
                        )}
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-500/50 to-fuchsia-500/50 flex items-center justify-center text-sm font-bold">
                          {member.displayName.split(' ').map(n => n[0]).join('')}
                        </div>
                        <StatusDot online={member.stats.online} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">{member.displayName}</p>
                        <p className="text-xs text-muted-foreground">{member.class || 'Member'}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-muted-foreground">Match</p>
                        <p className={`text-sm font-bold ${
                          member.requiredCoverage >= 0.5 ? 'text-success' : 'text-warning'
                        }`}>{Math.round(member.requiredCoverage * 100)}%</p>
                      </div>
                    </div>
                  ))}
                </div>
                
                {/* Actions */}
                <div className="flex gap-2">
                  <Button variant="outline" className="flex-1 gap-1" onClick={copyTeamList}>
                    <Copy className="w-4 h-4" />Copy List
                  </Button>
                  <Button variant="outline" className="flex-1 gap-1" onClick={saveTeam}>
                    <Bookmark className="w-4 h-4" />Save Team
                  </Button>
                  <Button className="flex-1 gap-1" onClick={() => {
                    toast.success('Team notified!', { description: 'Members have been alerted of their assignment.' });
                  }}>
                    <Send className="w-4 h-4" />Notify
                  </Button>
                </div>
              </>
            )}
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
};

// Profile Card Component - Enhanced with Node Card Data
const ProfileCard = ({ profile, score, scoreConfig, onOpen, isAdmin }) => {
  const isRedacted = profile._redacted;
  const userStatusConfig = USER_STATUS[profile.userStatus] || USER_STATUS.OFFLINE;
  const connectionConfig = CONNECTION_TYPES[profile.connection?.type] || CONNECTION_TYPES.OFFLINE;
  
  return (
    <div
      className="glass rounded-xl p-4 hover:bg-white/5 transition-colors cursor-pointer group"
      onClick={onOpen}
      data-testid={`profile-card-${profile.userId}`}
    >
      {/* Header with Status Badge */}
      <div className="flex items-start gap-3 mb-3">
        <div className="relative">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-violet-500/50 to-fuchsia-500/50 flex items-center justify-center font-bold text-sm">
            {profile.displayName?.split(' ').map(n => n[0]).join('').slice(0, 2)}
          </div>
          <div className={`absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 border-background ${
            profile.stats.online ? 'bg-success' : 'bg-muted-foreground'
          }`} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <h3 className="font-semibold truncate">{profile.displayName}</h3>
            {profile.callsign && (
              <span className="text-[10px] text-primary/70 font-mono">&ldquo;{profile.callsign}&rdquo;</span>
            )}
          </div>
          <p className="text-xs text-muted-foreground truncate">{profile.class || 'Member'}</p>
        </div>
        {/* User Status Badge */}
        <div className={`px-2 py-0.5 rounded text-[10px] font-bold ${userStatusConfig.color}`}>
          {userStatusConfig.label}
        </div>
      </div>
      
      {/* Connection & Device Row */}
      <div className="flex items-center gap-3 mb-3 text-[10px]">
        <div className="flex items-center gap-1">
          <span className={connectionConfig.color}>●</span>
          <span className="text-muted-foreground">{connectionConfig.label}</span>
          {profile.connection?.strength > 0 && (
            <span className="text-foreground font-medium">{profile.connection.strength}%</span>
          )}
        </div>
        {profile.device?.battery > 0 && (
          <div className="flex items-center gap-1">
            <span className={profile.device.battery > 50 ? 'text-success' : profile.device.battery > 20 ? 'text-warning' : 'text-destructive'}>⚡</span>
            <span>{profile.device.battery}%</span>
          </div>
        )}
        {profile.medical?.bloodType && isAdmin && (
          <div className="flex items-center gap-1 text-rose-400">
            <span>🩸</span>
            <span>{profile.medical.bloodType}</span>
          </div>
        )}
      </div>
      
      {/* Skills */}
      <div className="flex flex-wrap gap-1 mb-3">
        {profile.skills.slice(0, 3).map(skill => (
          <SkillBadge key={skill} tagKey={skill} />
        ))}
        {profile.skills.length > 3 && (
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-secondary text-muted-foreground">
            +{profile.skills.length - 3}
          </span>
        )}
      </div>
      
      {/* Languages */}
      <div className="flex items-center gap-1 mb-3">
        <Globe className="w-3 h-3 text-muted-foreground" />
        <div className="flex gap-1 overflow-hidden">
          {profile.languages.slice(0, 3).map(lang => (
            <span key={lang} className="text-[10px]">{LANGUAGES[lang]?.flag}</span>
          ))}
          <span className="text-[10px] text-muted-foreground">
            {profile.languages.map(l => getLanguageLabel(l)).join(', ')}
          </span>
        </div>
      </div>
      
      {/* Equipment Count */}
      {profile.equipment?.length > 0 && (
        <div className="flex items-center gap-1 mb-3 text-[10px] text-muted-foreground">
          <span>🎒</span>
          <span>{profile.equipment.length} equipment items</span>
        </div>
      )}
      
      {/* Conditional Fields */}
      <div className="grid grid-cols-2 gap-2 text-[10px] border-t border-border/50 pt-3">
        <div>
          <span className="text-muted-foreground">Age: </span>
          {profile.age !== null ? (
            <span>{profile.age}y</span>
          ) : (
            <span className="text-amber-400 flex items-center gap-0.5 inline-flex">
              <EyeOff className="w-2.5 h-2.5" />Hidden
            </span>
          )}
        </div>
        <div>
          <span className="text-muted-foreground">Height: </span>
          {profile.anthro?.heightIn !== null ? (
            <span>{formatHeight(profile.anthro?.heightIn)}</span>
          ) : (
            <span className="text-amber-400 flex items-center gap-0.5 inline-flex">
              <EyeOff className="w-2.5 h-2.5" />Hidden
            </span>
          )}
        </div>
        <div>
          <span className="text-muted-foreground">Weight: </span>
          {profile.anthro?.weightLb !== null ? (
            <span>{formatWeight(profile.anthro?.weightLb)}</span>
          ) : (
            <span className="text-amber-400 flex items-center gap-0.5 inline-flex">
              <EyeOff className="w-2.5 h-2.5" />Hidden
            </span>
          )}
        </div>
        <div>
          <span className="text-muted-foreground">Edu: </span>
          {profile.educationLevel !== null ? (
            <span>{EDUCATION_LEVELS[profile.educationLevel]?.label || profile.educationLevel}</span>
          ) : (
            <span className="text-amber-400 flex items-center gap-0.5 inline-flex">
              <EyeOff className="w-2.5 h-2.5" />Hidden
            </span>
          )}
        </div>
      </div>
      
      {/* Admin Score Badge */}
      {isAdmin && score && (
        <div className={`mt-3 p-2 rounded-lg text-center ${
          score.flag === 'intervention' ? 'bg-destructive/20 text-destructive' :
          score.flag === 'restricted' ? 'bg-orange-500/20 text-orange-400' :
          score.flag === 'monitor' ? 'bg-warning/20 text-warning' :
          'bg-success/20 text-success'
        }`}>
          <span className="text-[10px]">Community Score: </span>
          <span className="font-bold">{score.score}</span>
        </div>
      )}
      
      {/* Footer */}
      <div className="flex items-center justify-between mt-3 pt-2 border-t border-border/50">
        {isRedacted && !isAdmin ? (
          <p className="text-[10px] text-muted-foreground flex items-center gap-1">
            <Lock className="w-3 h-3" />Some fields hidden
          </p>
        ) : isAdmin ? (
          <p className="text-[10px] text-amber-400 flex items-center gap-1">
            <ShieldCheck className="w-3 h-3" />Full profile
          </p>
        ) : (
          <div />
        )}
        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button size="sm" variant="ghost" className="h-6 text-[10px]" onClick={(e) => { e.stopPropagation(); onOpen(); }}>
            View
          </Button>
          <Button size="sm" variant="ghost" className="h-6 text-[10px]" onClick={(e) => { e.stopPropagation(); toast.info('DM feature coming soon'); }}>
            DM
          </Button>
        </div>
      </div>
    </div>
  );
};

// Profile Drawer - Enhanced with full Node Card data
const ProfileDrawer = ({ profile, isOpen, onClose, memberScores, scoreConfig }) => {
  const { isAdmin } = useRBAC();
  const score = memberScores?.[profile?.userId];
  const [activeTab, setActiveTab] = useState('profile');
  
  if (!profile) return null;
  
  const userStatusConfig = USER_STATUS[profile.userStatus] || USER_STATUS.OFFLINE;
  const connectionConfig = CONNECTION_TYPES[profile.connection?.type] || CONNECTION_TYPES.OFFLINE;
  
  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="w-full sm:max-w-xl overflow-y-auto">
        {/* Hero Header */}
        <div className="relative -mx-6 -mt-6 mb-6">
          <div className="h-24 bg-gradient-to-br from-violet-500/30 to-fuchsia-500/30" />
          <div className="absolute inset-x-0 bottom-0 translate-y-1/2 flex items-end px-6">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-violet-500/50 to-fuchsia-500/50 flex items-center justify-center font-bold text-2xl border-4 border-background shadow-xl">
              {profile.displayName?.split(' ').map(n => n[0]).join('').slice(0, 2)}
            </div>
            <div className="flex-1 ml-4 pb-2">
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold">{profile.displayName}</h2>
                <span className={`px-2 py-0.5 rounded text-xs font-bold ${userStatusConfig.color}`}>
                  {userStatusConfig.label}
                </span>
              </div>
              {profile.callsign && (
                <p className="text-primary font-mono font-bold">&ldquo;{profile.callsign}&rdquo;</p>
              )}
              <p className="text-xs text-muted-foreground">{profile.class || 'Community Member'}</p>
            </div>
          </div>
        </div>
        
        <div className="mt-14 space-y-6">
          {/* Connection & Device Status Bar */}
          <div className="flex items-center justify-between p-3 rounded-lg glass">
            <div className="flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full ${profile.stats.online ? 'bg-success animate-pulse' : 'bg-muted-foreground'}`} />
              <span className={connectionConfig.color}>{connectionConfig.label}</span>
              {profile.connection?.strength > 0 && (
                <span className="text-sm">{profile.connection.strength}% signal</span>
              )}
            </div>
            {profile.device?.battery > 0 && (
              <div className="flex items-center gap-2 text-sm">
                <span className={profile.device.battery > 50 ? 'text-success' : profile.device.battery > 20 ? 'text-warning' : 'text-destructive'}>
                  ⚡ {profile.device.battery}%
                </span>
              </div>
            )}
          </div>
          
          {/* Tab Navigation */}
          <div className="flex border-b border-border/50">
            {[
              { id: 'profile', label: 'Profile', icon: User },
              { id: 'medical', label: 'Medical', icon: Heart },
              { id: 'equipment', label: 'Equipment', icon: Briefcase },
              { id: 'device', label: 'Device', icon: Activity },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 py-2 text-xs font-medium transition-colors relative flex items-center justify-center gap-1 ${
                  activeTab === tab.id ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <tab.icon className="w-3 h-3" />
                {tab.label}
                {activeTab === tab.id && (
                  <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-primary rounded-full" />
                )}
              </button>
            ))}
          </div>
          
          {/* Profile Tab */}
          {activeTab === 'profile' && (
            <div className="space-y-4">
              {/* Admin Score */}
              {isAdmin && score && (
                <div className={`p-3 rounded-lg ${
                  score.flag === 'intervention' ? 'bg-destructive/10 border border-destructive/30' :
                  score.flag === 'restricted' ? 'bg-orange-500/10 border border-orange-500/30' :
                  score.flag === 'monitor' ? 'bg-warning/10 border border-warning/30' :
                  'bg-success/10 border border-success/30'
                }`}>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Community Score</span>
                    <span className={`text-2xl font-bold ${
                      score.flag === 'intervention' ? 'text-destructive' :
                      score.flag === 'restricted' ? 'text-orange-400' :
                      score.flag === 'monitor' ? 'text-warning' :
                      'text-success'
                    }`}>{score.score}</span>
                  </div>
                  {score.flag && (
                    <p className="text-xs text-muted-foreground mt-1">Status: {score.flag}</p>
                  )}
                </div>
              )}
              
              {/* Physical Description */}
              <div className="glass rounded-lg p-4">
                <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
                  <User className="w-4 h-4 text-primary" />
                  Physical Description
                </h4>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <InfoRow label="Age" value={profile.age !== null ? `${profile.age} years` : null} />
                  <InfoRow label="Height" value={formatHeight(profile.anthro?.heightIn)} />
                  <InfoRow label="Weight" value={formatWeight(profile.anthro?.weightLb)} />
                  <InfoRow label="Education" value={profile.educationLevel !== null ? EDUCATION_LEVELS[profile.educationLevel]?.label : null} />
                </div>
                {profile.physical && (
                  <div className="mt-3 pt-3 border-t border-border/50 grid grid-cols-2 gap-3 text-sm">
                    <InfoRow label="Hair" value={profile.physical.hairColor} />
                    <InfoRow label="Eyes" value={profile.physical.eyeColor} />
                    {profile.physical.distinguishingFeatures && profile.physical.distinguishingFeatures !== 'None' && (
                      <div className="col-span-2">
                        <InfoRow label="Features" value={profile.physical.distinguishingFeatures} />
                      </div>
                    )}
                  </div>
                )}
              </div>
              
              {/* Skills */}
              <div className="glass rounded-lg p-4">
                <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
                  <Award className="w-4 h-4 text-amber-400" />
                  Skills ({profile.skills.length})
                </h4>
                <div className="flex flex-wrap gap-1">
                  {profile.skills.map(skill => (
                    <SkillBadge key={skill} tagKey={skill} size="md" />
                  ))}
                </div>
              </div>
              
              {/* Languages */}
              <div className="glass rounded-lg p-4">
                <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
                  <Globe className="w-4 h-4 text-cyan-400" />
                  Languages
                </h4>
                <div className="flex flex-wrap gap-1">
                  {profile.languages.map(lang => (
                    <LanguageBadge key={lang} code={lang} />
                  ))}
                </div>
              </div>
              
              {/* Certifications */}
              {profile.certifications?.length > 0 && (
                <div className="glass rounded-lg p-4">
                  <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
                    <GraduationCap className="w-4 h-4 text-violet-400" />
                    Certifications
                  </h4>
                  <div className="flex flex-wrap gap-1">
                    {profile.certifications.map(cert => (
                      <span key={cert} className="px-2 py-1 rounded bg-primary/20 text-primary text-xs">
                        {cert}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Emergency Contact */}
              {profile.emergencyContact && (
                <div className="glass rounded-lg p-4 border border-destructive/30">
                  <h4 className="text-sm font-semibold mb-3 flex items-center gap-2 text-destructive">
                    <AlertCircle className="w-4 h-4" />
                    Emergency Contact
                  </h4>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div><span className="text-muted-foreground">Name: </span>{profile.emergencyContact.name}</div>
                    <div><span className="text-muted-foreground">Relation: </span>{profile.emergencyContact.relation}</div>
                    <div className="col-span-2"><span className="text-muted-foreground">Contact: </span>{profile.emergencyContact.method}</div>
                  </div>
                </div>
              )}
              
              {/* Notes */}
              {profile.notes && (
                <div className="glass rounded-lg p-4">
                  <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
                    <FileText className="w-4 h-4 text-muted-foreground" />
                    Notes
                  </h4>
                  <p className="text-sm text-muted-foreground">{profile.notes}</p>
                </div>
              )}
            </div>
          )}
          
          {/* Medical Tab */}
          {activeTab === 'medical' && (
            <div className="space-y-4">
              {profile.medical ? (
                <>
                  <div className="glass rounded-lg p-4 border border-rose-500/30">
                    <h4 className="text-sm font-semibold mb-3 flex items-center gap-2 text-rose-400">
                      <Heart className="w-4 h-4" />
                      Medical Information
                    </h4>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div className="p-2 rounded bg-rose-500/10">
                        <p className="text-xs text-muted-foreground">Blood Type</p>
                        <p className="font-bold text-rose-400 text-lg">{profile.medical.bloodType || 'Unknown'}</p>
                      </div>
                      <div className="p-2 rounded bg-secondary/50">
                        <p className="text-xs text-muted-foreground">Allergies</p>
                        <p className="font-medium">{profile.medical.allergies?.length > 0 ? profile.medical.allergies.join(', ') : 'None'}</p>
                      </div>
                    </div>
                    {profile.medical.conditions?.length > 0 && profile.medical.conditions[0] !== 'None' && (
                      <div className="mt-3">
                        <p className="text-xs text-muted-foreground mb-1">Conditions</p>
                        <div className="flex flex-wrap gap-1">
                          {profile.medical.conditions.map((condition, i) => (
                            <span key={i} className="px-2 py-1 rounded bg-amber-500/20 text-amber-400 text-xs">
                              {condition}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    {profile.medical.medications?.length > 0 && (
                      <div className="mt-3">
                        <p className="text-xs text-muted-foreground mb-1">Medications</p>
                        <div className="flex flex-wrap gap-1">
                          {profile.medical.medications.map((med, i) => (
                            <span key={i} className="px-2 py-1 rounded bg-blue-500/20 text-blue-400 text-xs">
                              {med}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <div className="glass rounded-lg p-8 text-center">
                  <EyeOff className="w-12 h-12 mx-auto mb-3 text-amber-400/50" />
                  <p className="text-amber-400 font-medium">Medical Information Hidden</p>
                  <p className="text-xs text-muted-foreground mt-1">This member has chosen not to share medical details</p>
                </div>
              )}
            </div>
          )}
          
          {/* Equipment Tab */}
          {activeTab === 'equipment' && (
            <div className="space-y-4">
              {profile.equipment?.length > 0 ? (
                <div className="glass rounded-lg p-4">
                  <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
                    <Briefcase className="w-4 h-4 text-orange-400" />
                    Equipment Loadout ({profile.equipment.length} items)
                  </h4>
                  <div className="space-y-2">
                    {profile.equipment.map((item, i) => (
                      <div key={i} className="flex items-center gap-3 p-2 rounded bg-secondary/50">
                        <div className={`w-8 h-8 rounded flex items-center justify-center ${
                          item.category === 'Medical' ? 'bg-rose-500/20' :
                          item.category === 'Security' ? 'bg-amber-500/20' :
                          item.category === 'Comms' ? 'bg-cyan-500/20' :
                          item.category === 'Power' ? 'bg-emerald-500/20' :
                          'bg-primary/20'
                        }`}>
                          {item.category === 'Medical' ? '🩺' :
                           item.category === 'Security' ? '🛡️' :
                           item.category === 'Comms' ? '📻' :
                           item.category === 'Power' ? '⚡' :
                           item.category === 'Navigation' ? '🧭' :
                           item.category === 'FoodWater' ? '🌾' :
                           '📦'}
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium">{item.name}</p>
                          <p className="text-xs text-muted-foreground">{item.category}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="glass rounded-lg p-8 text-center">
                  <Briefcase className="w-12 h-12 mx-auto mb-3 text-muted-foreground/50" />
                  <p className="text-muted-foreground">No equipment registered</p>
                </div>
              )}
            </div>
          )}
          
          {/* Device Tab */}
          {activeTab === 'device' && (
            <div className="space-y-4">
              {profile.device ? (
                <>
                  <div className="glass rounded-lg p-4">
                    <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
                      <Activity className="w-4 h-4 text-cyan-400" />
                      Device Status
                    </h4>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="p-3 rounded bg-secondary/50">
                        <p className="text-xs text-muted-foreground">Model</p>
                        <p className="font-medium">{profile.device.model || 'Unknown'}</p>
                      </div>
                      <div className="p-3 rounded bg-secondary/50">
                        <p className="text-xs text-muted-foreground">Battery</p>
                        <div className="flex items-center gap-2">
                          <div className="flex-1 h-2 bg-background rounded-full overflow-hidden">
                            <div 
                              className={`h-full ${profile.device.battery > 50 ? 'bg-success' : profile.device.battery > 20 ? 'bg-warning' : 'bg-destructive'}`}
                              style={{ width: `${profile.device.battery}%` }}
                            />
                          </div>
                          <span className="text-sm font-medium">{profile.device.battery}%</span>
                        </div>
                      </div>
                      <div className="p-3 rounded bg-secondary/50">
                        <p className="text-xs text-muted-foreground">CPU</p>
                        <div className="flex items-center gap-2">
                          <div className="flex-1 h-2 bg-background rounded-full overflow-hidden">
                            <div className="h-full bg-primary" style={{ width: `${profile.device.cpu}%` }} />
                          </div>
                          <span className="text-sm font-medium">{profile.device.cpu}%</span>
                        </div>
                      </div>
                      <div className="p-3 rounded bg-secondary/50">
                        <p className="text-xs text-muted-foreground">RAM</p>
                        <div className="flex items-center gap-2">
                          <div className="flex-1 h-2 bg-background rounded-full overflow-hidden">
                            <div className="h-full bg-violet-500" style={{ width: `${profile.device.ram}%` }} />
                          </div>
                          <span className="text-sm font-medium">{profile.device.ram}%</span>
                        </div>
                      </div>
                      <div className="p-3 rounded bg-secondary/50 col-span-2">
                        <p className="text-xs text-muted-foreground">Temperature</p>
                        <p className="font-medium">{profile.device.temp}°C / {Math.round(profile.device.temp * 9/5 + 32)}°F</p>
                      </div>
                    </div>
                  </div>
                  
                  {/* Location */}
                  {profile.location?.lat && (
                    <div className="glass rounded-lg p-4">
                      <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-emerald-400" />
                        Last Known Location
                      </h4>
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div><span className="text-muted-foreground">Lat: </span>{profile.location.lat.toFixed(6)}</div>
                        <div><span className="text-muted-foreground">Lon: </span>{profile.location.lon.toFixed(6)}</div>
                        <div><span className="text-muted-foreground">Grid: </span>{profile.location.grid}</div>
                        <div><span className="text-muted-foreground">Accuracy: </span>±{profile.location.accuracy}m</div>
                      </div>
                      <div className="mt-3 flex gap-2">
                        <Button size="sm" variant="outline" className="flex-1 text-xs" onClick={() => {
                          navigator.clipboard.writeText(`${profile.location.lat}, ${profile.location.lon}`);
                          toast.success('Coordinates copied!');
                        }}>
                          <Copy className="w-3 h-3 mr-1" />Copy
                        </Button>
                        <Button size="sm" variant="outline" className="flex-1 text-xs" onClick={() => {
                          window.open(`https://www.google.com/maps?q=${profile.location.lat},${profile.location.lon}`, '_blank');
                        }}>
                          <ExternalLink className="w-3 h-3 mr-1" />Open Maps
                        </Button>
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div className="glass rounded-lg p-8 text-center">
                  <Activity className="w-12 h-12 mx-auto mb-3 text-muted-foreground/50" />
                  <p className="text-muted-foreground">Device offline or not connected</p>
                </div>
              )}
            </div>
          )}
          
          {/* Actions */}
          <div className="flex gap-2 pt-4 border-t border-border">
            <Button className="flex-1" onClick={() => toast.info('DM feature coming soon')}>
              <Send className="w-4 h-4 mr-2" />Send Message
            </Button>
            <Button variant="outline" onClick={() => toast.info('Help request feature coming soon')}>
              Request Help
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

const InfoRow = ({ label, value }) => (
  <div className="p-2 rounded bg-secondary/50">
    <p className="text-xs text-muted-foreground">{label}</p>
    {value !== null ? (
      <p className="font-medium">{value}</p>
    ) : (
      <p className="text-amber-400 flex items-center gap-1 text-sm">
        <EyeOff className="w-3 h-3" />Hidden
      </p>
    )}
  </div>
);

// ============================================================
// ANALYTICS TAB (Placeholder with domain filter support)
// ============================================================

const AnalyticsTab = ({ filterDomain }) => {
  const { can, currentUser } = useRBAC();
  
  if (!can('viewAnalytics')) {
    return <AccessDeniedCard minRole="member" currentRole={currentUser?.role} />;
  }
  
  return (
    <div className="space-y-6">
      {filterDomain && (
        <div className="glass rounded-xl p-4 border border-primary/30">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-primary" />
            <span className="text-sm">Filtered by domain: <span className="font-semibold">{SKILL_DOMAINS[filterDomain]?.label || filterDomain}</span></span>
            <Button size="sm" variant="ghost" className="ml-auto text-xs">Clear filter</Button>
          </div>
        </div>
      )}
      
      <div className="glass rounded-xl p-8 text-center border-2 border-dashed border-border">
        <BarChart2 className="w-16 h-16 mx-auto mb-4 text-primary/50" />
        <h3 className="text-lg font-semibold mb-2">Analytics Dashboard</h3>
        <p className="text-sm text-muted-foreground mb-4">Coming in Phase 3</p>
        <ul className="text-sm text-muted-foreground space-y-1 text-left max-w-md mx-auto">
          <li>• Skills coverage matrix by domain</li>
          <li>• Gap analysis with recommendations</li>
          <li>• Member activity trends</li>
          <li>• Downloadable reports (redacted by role)</li>
        </ul>
      </div>
    </div>
  );
};

// ============================================================
// COMMS TAB (Shows pinned bulletins)
// ============================================================

const CommsTab = ({ commsPreview }) => {
  const { can, currentUser } = useRBAC();
  
  if (!can('viewComms')) {
    return <AccessDeniedCard minRole="member" currentRole={currentUser?.role} />;
  }
  
  return (
    <div className="space-y-6">
      {/* Pinned Bulletins */}
      <div className="glass rounded-xl p-4">
        <h3 className="font-semibold mb-4 flex items-center gap-2">
          <Bell className="w-4 h-4 text-cyan-400" />
          Pinned Bulletins
        </h3>
        <div className="space-y-3">
          {commsPreview.pinnedBulletins.map(b => (
            <div key={b.id} className="p-4 rounded-lg bg-background/50 hover:bg-white/5 transition-colors">
              <div className="flex items-start gap-3">
                <div className={`w-3 h-3 rounded-full mt-1 ${b.severity === 'warning' ? 'bg-warning' : 'bg-primary'}`} />
                <div className="flex-1">
                  <h4 className="font-medium">{b.title}</h4>
                  <p className="text-sm text-muted-foreground mt-1">
                    Posted by {b.author} on {new Date(b.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {/* Coming Soon */}
      <div className="glass rounded-xl p-8 text-center border-2 border-dashed border-border">
        <MessageSquare className="w-16 h-16 mx-auto mb-4 text-primary/50" />
        <h3 className="text-lg font-semibold mb-2">Full Communications Hub</h3>
        <p className="text-sm text-muted-foreground mb-4">Coming in Phase 5</p>
        <ul className="text-sm text-muted-foreground space-y-1 text-left max-w-md mx-auto">
          <li>• Announcements & broadcasts</li>
          <li>• Community polls</li>
          <li>• Task management</li>
          <li>• Role-gated channels</li>
        </ul>
      </div>
    </div>
  );
};

// ============================================================
// INCIDENTS TAB (Admin-only)
// ============================================================

const IncidentsTab = ({ onNavigate }) => {
  const { isAdmin, currentUser } = useRBAC();
  
  useEffect(() => {
    if (!isAdmin) {
      toast.error('Access denied: Admin-only section', { description: 'Redirecting to Overview...' });
      const timer = setTimeout(() => onNavigate('overview'), 100);
      return () => clearTimeout(timer);
    }
  }, [isAdmin, onNavigate]);
  
  return (
    <RequireRole
      minRole="admin"
      fallback={<AccessDeniedCard minRole="admin" currentRole={currentUser?.role} onReturn={() => onNavigate('overview')} />}
    >
      <div className="space-y-6">
        <div className="glass rounded-xl p-4 border border-amber-500/30 bg-amber-500/5">
          <div className="flex items-center gap-3">
            <ShieldCheck className="w-6 h-6 text-amber-400" />
            <div>
              <h4 className="font-semibold text-sm text-amber-400">Admin Access Verified</h4>
              <p className="text-xs text-muted-foreground">Full access to incident reports and scoring management.</p>
            </div>
          </div>
        </div>
        
        <div className="glass rounded-xl p-8 text-center border-2 border-dashed border-amber-500/30">
          <FileText className="w-16 h-16 mx-auto mb-4 text-amber-400/50" />
          <h3 className="text-lg font-semibold mb-2">Incident Reports Dashboard</h3>
          <p className="text-sm text-muted-foreground mb-4">Coming in Phase 6</p>
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
// QA CHECKLIST (Dev-only)
// ============================================================

const QAChecklist = ({ currentRole, onRoleChange }) => {
  const [expanded, setExpanded] = useState(false);
  const [checkedItems, setCheckedItems] = useState({});
  
  const items = [
    { id: 'admin-tab', test: 'Switch to admin: Incidents tab + Governance card visible', action: () => onRoleChange('admin') },
    { id: 'member-tab', test: 'Switch to member: Incidents tab hidden, Governance hidden', action: () => onRoleChange('member') },
    { id: 'guest-limited', test: 'Switch to guest: Only Overview + Directory tabs', action: () => onRoleChange('guest') },
    { id: 'direct-nav', test: 'Direct URL to incidents as member: redirect + toast', action: null },
    { id: 'privacy-modal', test: 'Privacy modal toggles update current user display', action: null },
    { id: 'redaction', test: 'Non-admin sees "Hidden" for non-opted fields in cards/drawer', action: null },
    { id: 'deep-link', test: 'Overview strength/gap clicks deep-link to Directory with filter', action: null },
  ];
  
  return (
    <div className="glass rounded-xl p-4 border border-cyan-500/30 bg-cyan-500/5" data-testid="qa-checklist">
      <button onClick={() => setExpanded(!expanded)} className="w-full flex items-center justify-between">
        <h4 className="font-semibold text-sm flex items-center gap-2 text-cyan-400">
          <ListChecks className="w-4 h-4" />QA Checklist (Dev Only)
        </h4>
        {expanded ? <ChevronUp className="w-4 h-4 text-cyan-400" /> : <ChevronDown className="w-4 h-4 text-cyan-400" />}
      </button>
      
      {expanded && (
        <div className="mt-4 space-y-2">
          <p className="text-xs text-muted-foreground">Current role: <span className="font-semibold text-primary">{currentRole}</span></p>
          {items.map(item => (
            <div key={item.id} className={`p-2 rounded-lg ${checkedItems[item.id] ? 'bg-success/10 border border-success/30' : 'bg-secondary/50'}`}>
              <div className="flex items-start gap-2">
                <button
                  onClick={() => setCheckedItems(prev => ({ ...prev, [item.id]: !prev[item.id] }))}
                  className={`w-5 h-5 rounded border flex-shrink-0 flex items-center justify-center ${
                    checkedItems[item.id] ? 'bg-success border-success text-white' : 'border-border hover:border-primary'
                  }`}
                >
                  {checkedItems[item.id] && <CheckCheck className="w-3 h-3" />}
                </button>
                <div className="flex-1">
                  <p className="text-xs">{item.test}</p>
                  {item.action && (
                    <Button size="sm" variant="ghost" onClick={item.action} className="h-6 text-[10px] mt-1 px-2">Run Test</Button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// ============================================================
// MAIN COMPONENT
// ============================================================

export default function CommunityHub({ isOpen, onClose }) {
  const [currentUserRole, setCurrentUserRole] = useState('admin');
  const [currentUserPrivacy, setCurrentUserPrivacy] = useState({ showAge: true, showHeightWeight: true, showEducation: true });
  const currentUser = { ...MOCK_CURRENT_USERS[currentUserRole], privacy: currentUserPrivacy };
  
  // Welcome modal & drill mode
  const [showWelcome, setShowWelcome] = useState(() => {
    if (typeof window !== 'undefined') {
      return sessionStorage.getItem('community-welcome-seen') !== 'true';
    }
    return true;
  });
  const [showDrill, setShowDrill] = useState(false);
  
  const dismissWelcome = () => {
    setShowWelcome(false);
    sessionStorage.setItem('community-welcome-seen', 'true');
  };
  
  const startDrillFromWelcome = () => {
    dismissWelcome();
    setShowDrill(true);
  };
  
  // Get initial values from URL params (lazy evaluation)
  const getInitialTab = () => {
    if (typeof window === 'undefined') return 'overview';
    const params = new URLSearchParams(window.location.search);
    const tab = params.get('tab');
    const validTabs = ['overview', 'analytics', 'directory', 'comms', 'incidents'];
    return validTabs.includes(tab) ? tab : 'overview';
  };
  
  const getInitialFilters = () => {
    if (typeof window === 'undefined') return {};
    const params = new URLSearchParams(window.location.search);
    const q = params.get('q');
    const skills = params.get('skills')?.split(',').filter(Boolean);
    const languages = params.get('languages')?.split(',').filter(Boolean);
    const online = params.get('online') === 'true';
    return { q, skills, languages, online };
  };

  const [activeTab, setActiveTab] = useState(getInitialTab);
  const [directoryFilters, setDirectoryFilters] = useState(getInitialFilters);
  const [analyticsFilter, setAnalyticsFilter] = useState(null);
  const [selectedProfile, setSelectedProfile] = useState(null);
  
  // Load mock data
  const [profiles] = useState(() => generateMockProfiles());
  const [incidents] = useState(() => generateMockIncidents());
  const [commsPreview] = useState(() => generateCommsPreview());
  const [scoreConfig] = useState(() => generateMockScoreConfig());
  
  // Computed data
  const analytics = useMemo(() => generateAnalyticsSummary(profiles), [profiles]);
  const memberScores = useMemo(() => calculateMemberScores(profiles, incidents, scoreConfig), [profiles, incidents, scoreConfig]);
  
  // Tab configuration with RBAC
  const tabs = useMemo(() => {
    const role = ROLES[currentUser.role];
    return [
      { id: 'overview', name: 'Overview', icon: Home, visible: true, desc: 'See who is online and check our readiness' },
      { id: 'analytics', name: 'Analytics', icon: BarChart3, visible: role.permissions.viewAnalytics, desc: 'View skill coverage charts and reports' },
      { id: 'directory', name: 'Directory', icon: Users, visible: role.permissions.viewDirectory, desc: 'Search and browse all family members' },
      { id: 'comms', name: 'Comms', icon: MessageSquare, visible: role.permissions.viewComms, desc: 'Announcements and messages' },
      { id: 'incidents', name: 'Incident Reports', icon: FileText, visible: role.permissions.viewIncidents, adminOnly: true, desc: 'Admin-only incident tracking' },
    ].filter(tab => tab.visible);
  }, [currentUser.role]);
  
  // Navigation handler with deep linking
  const handleNavigate = useCallback((tabId, params = {}) => {
    const role = ROLES[currentUser.role];
    
    if (tabId === 'incidents' && !role.permissions.viewIncidents) {
      toast.error('Access denied: Admin-only section');
      return;
    }
    
    if (tabId === 'directory' && params) {
      setDirectoryFilters(params);
    }
    
    if (tabId === 'analytics' && params?.domain) {
      setAnalyticsFilter(params.domain);
    }
    
    setActiveTab(tabId);
  }, [currentUser.role]);
  
  // Filter directory from Overview
  const handleFilterDirectory = useCallback((filters) => {
    setDirectoryFilters(filters);
    setActiveTab('directory');
  }, []);
  
  // Validate active tab on role change
  const validActiveTab = useMemo(() => {
    const valid = tabs.find(t => t.id === activeTab);
    return valid ? activeTab : 'overview';
  }, [tabs, activeTab]);
  
  // Redirect on invalid tab
  const prevTabRef = useRef(validActiveTab);
  useEffect(() => {
    if (prevTabRef.current !== validActiveTab && activeTab === 'incidents') {
      toast.error('Access denied', { description: 'Redirected due to role change.' });
    }
    prevTabRef.current = validActiveTab;
  }, [validActiveTab, activeTab]);
  
  // URL param sync
  useEffect(() => {
    if (isOpen && typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      url.searchParams.set('tab', validActiveTab);
      window.history.replaceState({}, '', url.toString());
    }
  }, [validActiveTab, isOpen]);
  
  // URL sync is handled by lazy initial state - no effect needed for parsing
  
  if (!isOpen) return null;
  
  return (
    <RBACProvider currentUser={currentUser} onUpdatePrivacy={setCurrentUserPrivacy}>
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
                  <p className="text-xs text-muted-foreground hidden sm:block">Operations • Roster • Comms • Governance</p>
                </div>
                
                {/* HUD Stats */}
                <div className="hidden md:flex items-center gap-3 ml-4 pl-4 border-l border-border">
                  <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
                    <span className="text-sm font-medium text-success">{analytics.population.onlineNow}</span>
                    <span className="text-xs text-muted-foreground">online</span>
                  </div>
                  <div className="text-xs text-muted-foreground">/</div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm font-medium">{analytics.population.membersTotal}</span>
                    <span className="text-xs text-muted-foreground">total</span>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                {/* Role Switcher */}
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
                
                <Button variant="outline" size="sm" onClick={onClose} className="gap-2" data-testid="community-close">
                  <X className="w-4 h-4" /><span className="hidden sm:inline">Back to Dashboard</span>
                </Button>
              </div>
            </div>
            
            {/* Tab Navigation */}
            <div className="flex gap-2 mt-3 overflow-x-auto pb-1">
              {tabs.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => handleNavigate(tab.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
                    validActiveTab === tab.id ? 'bg-primary text-white' : 'glass hover:bg-secondary'
                  } ${tab.adminOnly ? 'border border-amber-500/30' : ''}`}
                  data-testid={`tab-${tab.id}`}
                >
                  <tab.icon className={`w-4 h-4 ${tab.adminOnly && validActiveTab !== tab.id ? 'text-amber-400' : ''}`} />
                  {tab.name}
                  {tab.adminOnly && <ShieldCheck className="w-3 h-3 text-amber-400" />}
                </button>
              ))}
            </div>
          </div>
        </div>
        
        {/* Content */}
        <div className="container mx-auto px-4 py-6 pb-32 sm:pb-6">
          {validActiveTab === 'overview' && (
            <OverviewTab
              profiles={profiles}
              analytics={analytics}
              incidents={incidents}
              commsPreview={commsPreview}
              memberScores={memberScores}
              scoreConfig={scoreConfig}
              onNavigate={handleNavigate}
              onFilterDirectory={handleFilterDirectory}
              onOpenDrill={() => setShowDrill(true)}
            />
          )}
          {validActiveTab === 'analytics' && <AnalyticsTab filterDomain={analyticsFilter} />}
          {validActiveTab === 'directory' && (
            <DirectoryTab
              profiles={profiles}
              memberScores={memberScores}
              scoreConfig={scoreConfig}
              initialFilters={directoryFilters}
              onOpenProfile={setSelectedProfile}
            />
          )}
          {validActiveTab === 'comms' && <CommsTab commsPreview={commsPreview} />}
          {validActiveTab === 'incidents' && <IncidentsTab onNavigate={handleNavigate} />}
          
          {/* QA Checklist */}
          <div className="mt-8">
            <QAChecklist currentRole={currentUserRole} onRoleChange={setCurrentUserRole} />
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
        
        {/* Profile Drawer */}
        <ProfileDrawer
          profile={selectedProfile}
          isOpen={!!selectedProfile}
          onClose={() => setSelectedProfile(null)}
          memberScores={memberScores}
          scoreConfig={scoreConfig}
        />
        
        {/* Welcome Modal */}
        <WelcomeModal
          isOpen={showWelcome}
          onClose={dismissWelcome}
          onStartTour={startDrillFromWelcome}
        />
        
        {/* Drill Mode */}
        <DrillMode
          isOpen={showDrill}
          onClose={() => setShowDrill(false)}
          profiles={profiles}
          memberScores={memberScores}
        />
      </div>
    </RBACProvider>
  );
}
