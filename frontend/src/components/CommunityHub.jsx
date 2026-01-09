import React, { useState, useMemo, useCallback, createContext, useContext, useEffect, useRef } from 'react';
import {
  X, Users, BarChart3, MessageSquare, FileText, Shield, ShieldAlert, ShieldCheck,
  Eye, EyeOff, AlertTriangle, CheckCircle, Clock, Calendar,
  Heart, Star, Award, ChevronRight, ChevronDown, ChevronUp, Search, Filter,
  Info, User, Home, GraduationCap, Languages, Activity, Stethoscope, Wrench, Radio,
  Utensils, Target, TrendingUp, AlertCircle, Globe, UserCheck, Lock,
  Zap, Compass, Megaphone, ListChecks, BarChart2, Lightbulb, UserPlus,
  Send, Vote, ClipboardList, Bell, ArrowLeft, Copy, CheckCheck, ExternalLink,
  Briefcase, MapPin, SortAsc, SortDesc, XCircle, Plus, RefreshCw
} from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { toast } from 'sonner';
import {
  Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription
} from './ui/sheet';
import {
  SKILL_DOMAINS, CANONICAL_SKILLS, LANGUAGES, EDUCATION_LEVELS, ROLES, MOCK_CURRENT_USERS,
  getSkillLabel, getSkillDomain, getLanguageLabel,
  generateMockProfiles, generateAnalyticsSummary, generateCommsPreview,
  generateMockIncidents, generateMockScoreConfig, calculateMemberScores
} from '../mock/communityMockData';

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
  
  const privacy = profile.privacy || { showAge: false, showHeightWeight: false, showEducation: true };
  return {
    ...profile,
    _redacted: true,
    age: privacy.showAge ? profile.age : null,
    anthro: privacy.showHeightWeight ? profile.anthro : { heightIn: null, weightLb: null },
    educationLevel: privacy.showEducation !== false ? profile.educationLevel : null,
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

const OverviewTab = ({ profiles, analytics, incidents, commsPreview, memberScores, scoreConfig, onNavigate, onFilterDirectory }) => {
  const { isAdmin, currentUser, onUpdatePrivacy } = useRBAC();
  const [privacyModalOpen, setPrivacyModalOpen] = useState(false);
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [addressedRecs, setAddressedRecs] = useState(new Set());
  
  const openIncidents = incidents.filter(i => i.status !== 'Closed').length;
  const incidentsLast7d = incidents.filter(i => {
    const created = new Date(i.createdAt);
    return created > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  }).length;
  
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
      
      {/* Readiness Snapshot - 6 Domain Tiles */}
      <div className="glass rounded-xl p-4">
        <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
          <Target className="w-5 h-5 text-primary" />
          Readiness Snapshot
        </h2>
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
              <ChevronRight className="w-3 h-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity absolute top-2 right-2" />
            </button>
          ))}
        </div>
      </div>
      
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
      
      {/* Results Count */}
      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">
          Showing <span className="font-medium text-foreground">{filteredProfiles.length}</span> of {profiles.length} members
        </span>
        {hasActiveFilters && (
          <span className="text-xs text-primary">Filtered results</span>
        )}
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
    </div>
  );
};

// Profile Card Component
const ProfileCard = ({ profile, score, scoreConfig, onOpen, isAdmin }) => {
  const isRedacted = profile._redacted;
  
  return (
    <div
      className="glass rounded-xl p-4 hover:bg-white/5 transition-colors cursor-pointer group"
      onClick={onOpen}
      data-testid={`profile-card-${profile.userId}`}
    >
      {/* Header */}
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
          <h3 className="font-semibold truncate">{profile.displayName}</h3>
          <p className="text-xs text-muted-foreground truncate">{profile.class || 'Member'}</p>
        </div>
        {isAdmin && score && (
          <div className={`px-2 py-0.5 rounded text-xs font-bold ${
            score.flag === 'intervention' ? 'bg-destructive/20 text-destructive' :
            score.flag === 'restricted' ? 'bg-orange-500/20 text-orange-400' :
            score.flag === 'monitor' ? 'bg-warning/20 text-warning' :
            'bg-success/20 text-success'
          }`}>
            {score.score}
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

// Profile Drawer
const ProfileDrawer = ({ profile, isOpen, onClose, memberScores, scoreConfig }) => {
  const { isAdmin } = useRBAC();
  const score = memberScores?.[profile?.userId];
  
  if (!profile) return null;
  
  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
        <SheetHeader>
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-violet-500/50 to-fuchsia-500/50 flex items-center justify-center font-bold text-lg">
              {profile.displayName?.split(' ').map(n => n[0]).join('').slice(0, 2)}
            </div>
            <div>
              <SheetTitle className="flex items-center gap-2">
                {profile.displayName}
                <StatusDot online={profile.stats.online} />
              </SheetTitle>
              <SheetDescription>{profile.class || 'Community Member'}</SheetDescription>
            </div>
          </div>
        </SheetHeader>
        
        <div className="mt-6 space-y-6">
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
          
          {/* Personal Info */}
          <div>
            <h4 className="text-sm font-semibold mb-2">Personal Information</h4>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <InfoRow label="Age" value={profile.age !== null ? `${profile.age} years` : null} />
              <InfoRow label="Height" value={formatHeight(profile.anthro?.heightIn)} />
              <InfoRow label="Weight" value={formatWeight(profile.anthro?.weightLb)} />
              <InfoRow label="Education" value={profile.educationLevel !== null ? EDUCATION_LEVELS[profile.educationLevel]?.label : null} />
            </div>
          </div>
          
          {/* Skills */}
          <div>
            <h4 className="text-sm font-semibold mb-2">Skills ({profile.skills.length})</h4>
            <div className="flex flex-wrap gap-1">
              {profile.skills.map(skill => (
                <SkillBadge key={skill} tagKey={skill} size="md" />
              ))}
            </div>
          </div>
          
          {/* Languages */}
          <div>
            <h4 className="text-sm font-semibold mb-2">Languages</h4>
            <div className="flex flex-wrap gap-1">
              {profile.languages.map(lang => (
                <LanguageBadge key={lang} code={lang} />
              ))}
            </div>
          </div>
          
          {/* Certifications */}
          {profile.certifications?.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold mb-2">Certifications</h4>
              <div className="flex flex-wrap gap-1">
                {profile.certifications.map(cert => (
                  <span key={cert} className="px-2 py-1 rounded bg-primary/20 text-primary text-xs">
                    {cert}
                  </span>
                ))}
              </div>
            </div>
          )}
          
          {/* Actions */}
          <div className="flex gap-2">
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
  
  const [activeTab, setActiveTab] = useState('overview');
  const [directoryFilters, setDirectoryFilters] = useState({});
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
      { id: 'overview', name: 'Overview', icon: Home, visible: true },
      { id: 'analytics', name: 'Analytics', icon: BarChart3, visible: role.permissions.viewAnalytics },
      { id: 'directory', name: 'Directory', icon: Users, visible: role.permissions.viewDirectory },
      { id: 'comms', name: 'Comms', icon: MessageSquare, visible: role.permissions.viewComms },
      { id: 'incidents', name: 'Incident Reports', icon: FileText, visible: role.permissions.viewIncidents, adminOnly: true },
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
  
  // Parse URL params on open
  useEffect(() => {
    if (isOpen && typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const tab = params.get('tab');
      if (tab && tabs.some(t => t.id === tab)) {
        handleNavigate(tab);
      }
      
      // Directory filters from URL
      const q = params.get('q');
      const skills = params.get('skills')?.split(',').filter(Boolean);
      const languages = params.get('languages')?.split(',').filter(Boolean);
      const online = params.get('online') === 'true';
      
      if (q || skills?.length || languages?.length || online) {
        setDirectoryFilters({ q, skills, languages, online });
        if (tab !== 'directory') setActiveTab('directory');
      }
    }
  }, [isOpen]);
  
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
      </div>
    </RBACProvider>
  );
}
