import React, { useState, useMemo } from 'react';
import {
  Users, Shield, Radio, Wrench, Compass, Utensils, Stethoscope,
  AlertTriangle, AlertCircle, Info, CheckCircle, Clock, Calendar,
  ChevronRight, ChevronDown, Eye, Paperclip, Image, FileText,
  Bell, Star, Pin, X, Plus, Filter, Search, Megaphone, Building2
} from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { toast } from 'sonner';
import {
  Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription
} from './ui/sheet';
import {
  OFFICIAL_TEAMS, BULLETIN_SEVERITY, generateTeamBulletins, SKILL_DOMAINS
} from '../mock/communityMockData';
import { DataSourceBadge } from './DataStateIndicators';

// ============================================================
// ICON MAP
// ============================================================

const ICON_MAP = {
  Stethoscope, Shield, Radio, Wrench, Compass, Utensils,
  AlertTriangle, AlertCircle, Info, CheckCircle
};

const getDomainIcon = (iconName) => ICON_MAP[iconName] || Users;
const getSeverityIcon = (severity) => ICON_MAP[BULLETIN_SEVERITY[severity]?.icon] || Info;

// ============================================================
// COLOR HELPERS
// ============================================================

const getTeamColors = (color) => {
  const colorMap = {
    rose: { bg: 'bg-rose-500/20', text: 'text-rose-400', border: 'border-rose-500/30' },
    amber: { bg: 'bg-amber-500/20', text: 'text-amber-400', border: 'border-amber-500/30' },
    cyan: { bg: 'bg-cyan-500/20', text: 'text-cyan-400', border: 'border-cyan-500/30' },
    orange: { bg: 'bg-orange-500/20', text: 'text-orange-400', border: 'border-orange-500/30' },
    violet: { bg: 'bg-violet-500/20', text: 'text-violet-400', border: 'border-violet-500/30' },
    emerald: { bg: 'bg-emerald-500/20', text: 'text-emerald-400', border: 'border-emerald-500/30' },
  };
  return colorMap[color] || colorMap.cyan;
};

// ============================================================
// SEVERITY BADGE
// ============================================================

const SeverityBadge = ({ severity, size = 'sm' }) => {
  const config = BULLETIN_SEVERITY[severity] || BULLETIN_SEVERITY.info;
  const Icon = getSeverityIcon(severity);
  const sizeClasses = size === 'sm' 
    ? 'text-[10px] px-1.5 py-0.5' 
    : 'text-xs px-2 py-1';
  
  return (
    <span className={`inline-flex items-center gap-1 rounded font-bold ${sizeClasses} ${config.bg} text-${config.color}`}>
      <Icon className="w-3 h-3" />
      {config.label}
    </span>
  );
};

// ============================================================
// NEW BADGE
// ============================================================

const NewBadge = () => (
  <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-primary text-primary-foreground animate-pulse">
    NEW
  </span>
);

// ============================================================
// TIME AGO HELPER
// ============================================================

const getTimeAgo = (timestamp) => {
  const now = new Date();
  const then = new Date(timestamp);
  const diffMs = now - then;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);
  
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return then.toLocaleDateString();
};

// ============================================================
// TEAM CARD
// ============================================================

const TeamCard = ({ team, profiles, bulletins, onClick }) => {
  const colors = getTeamColors(team.color);
  const Icon = getDomainIcon(team.icon);
  const lead = profiles.find(p => p.userId === team.lead);
  const memberProfiles = team.members.map(id => profiles.find(p => p.userId === id)).filter(Boolean);
  const onlineCount = memberProfiles.filter(p => p.stats?.online).length;
  const teamBulletins = bulletins.filter(b => b.teamId === team.id);
  const newBulletins = teamBulletins.filter(b => b.isNew).length;
  
  return (
    <button
      onClick={() => onClick(team)}
      className={`w-full p-4 rounded-xl glass border ${colors.border} hover:bg-white/5 transition-all text-left group`}
      data-testid={`team-card-${team.id}`}
    >
      <div className="flex items-start gap-3">
        <div className={`p-2.5 rounded-lg ${colors.bg}`}>
          <Icon className={`w-5 h-5 ${colors.text}`} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h4 className="font-semibold text-sm truncate">{team.name}</h4>
            {newBulletins > 0 && (
              <span className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-primary/20 text-primary text-[10px] font-bold">
                <Bell className="w-3 h-3" />
                {newBulletins}
              </span>
            )}
          </div>
          <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{team.description}</p>
          <div className="flex items-center gap-3 mt-2">
            <span className="text-xs text-muted-foreground">
              <span className="font-medium text-foreground">{team.members.length}</span> members
            </span>
            <span className="text-xs">
              <span className="text-success font-medium">{onlineCount}</span> online
            </span>
            {lead && (
              <span className="text-xs text-muted-foreground">
                Lead: <span className="text-foreground">{lead.displayName.split(' ')[0]}</span>
              </span>
            )}
          </div>
        </div>
        <ChevronRight className={`w-4 h-4 text-muted-foreground group-hover:${colors.text} transition-colors`} />
      </div>
    </button>
  );
};

// ============================================================
// BULLETIN CARD - Compact preview
// ============================================================

const BulletinCard = ({ bulletin, team, profiles, onClick, onMarkRead }) => {
  const author = profiles.find(p => p.userId === bulletin.author);
  const colors = team ? getTeamColors(team.color) : getTeamColors('cyan');
  const Icon = team ? getDomainIcon(team.icon) : Megaphone;
  
  return (
    <button
      onClick={() => onClick(bulletin)}
      className={`w-full p-4 rounded-xl glass border ${bulletin.isPinned ? colors.border : 'border-border/50'} hover:bg-white/5 transition-all text-left group`}
      data-testid={`bulletin-${bulletin.id}`}
    >
      {/* Header */}
      <div className="flex items-start gap-3">
        <div className={`p-2 rounded-lg ${colors.bg} flex-shrink-0`}>
          <Icon className={`w-4 h-4 ${colors.text}`} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <SeverityBadge severity={bulletin.severity} />
            {bulletin.isNew && <NewBadge />}
            {bulletin.isPinned && <Pin className="w-3 h-3 text-amber-400" />}
          </div>
          <h4 className="font-semibold text-sm mt-1.5 line-clamp-1 group-hover:text-primary transition-colors">
            {bulletin.title}
          </h4>
          <p className="text-xs text-muted-foreground mt-1 line-clamp-2 leading-relaxed">
            {bulletin.content}
          </p>
        </div>
      </div>
      
      {/* Footer */}
      <div className="flex items-center justify-between mt-3 pt-2 border-t border-border/30">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded-full bg-gradient-to-br from-violet-500/50 to-fuchsia-500/50 flex items-center justify-center text-[8px] font-bold">
            {author?.displayName?.split(' ').map(n => n[0]).join('') || '?'}
          </div>
          <span className="text-xs text-muted-foreground">
            {author?.displayName || 'Unknown'} • {team?.name || 'Team'}
          </span>
        </div>
        <div className="flex items-center gap-2">
          {bulletin.attachments?.length > 0 && (
            <span className="flex items-center gap-1 text-xs text-muted-foreground">
              <Paperclip className="w-3 h-3" />
              {bulletin.attachments.length}
            </span>
          )}
          <span className="text-xs text-muted-foreground">
            {getTimeAgo(bulletin.createdAt)}
          </span>
        </div>
      </div>
    </button>
  );
};

// ============================================================
// BULLETIN DETAIL DRAWER
// ============================================================

const BulletinDrawer = ({ bulletin, team, profiles, isOpen, onClose }) => {
  const author = profiles.find(p => p.userId === bulletin?.author);
  const colors = team ? getTeamColors(team.color) : getTeamColors('cyan');
  const Icon = team ? getDomainIcon(team.icon) : Megaphone;
  
  if (!bulletin) return null;
  
  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
        <SheetHeader>
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-xl ${colors.bg}`}>
              <Icon className={`w-5 h-5 ${colors.text}`} />
            </div>
            <div>
              <SheetTitle className="flex items-center gap-2 flex-wrap">
                {team?.name || 'Team Bulletin'}
                <SeverityBadge severity={bulletin.severity} size="md" />
              </SheetTitle>
              <SheetDescription>{getTimeAgo(bulletin.createdAt)}</SheetDescription>
            </div>
          </div>
        </SheetHeader>
        
        <div className="mt-6 space-y-6">
          {/* Title */}
          <div>
            <h2 className="text-xl font-bold">{bulletin.title}</h2>
            <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
              <div className="w-6 h-6 rounded-full bg-gradient-to-br from-violet-500/50 to-fuchsia-500/50 flex items-center justify-center text-[10px] font-bold">
                {author?.displayName?.split(' ').map(n => n[0]).join('') || '?'}
              </div>
              <span>{author?.displayName || 'Unknown'}</span>
              <span>•</span>
              <span>{new Date(bulletin.createdAt).toLocaleString()}</span>
            </div>
          </div>
          
          {/* Content */}
          <div className="p-4 rounded-xl bg-secondary/50">
            <p className="text-sm leading-relaxed whitespace-pre-wrap">{bulletin.content}</p>
          </div>
          
          {/* Attachments */}
          {bulletin.attachments?.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
                <Paperclip className="w-4 h-4" />
                Attachments ({bulletin.attachments.length})
              </h4>
              <div className="space-y-2">
                {bulletin.attachments.map((att, i) => (
                  <div key={i} className="flex items-center gap-2 p-2 rounded-lg bg-secondary/30">
                    {att.type === 'image' ? (
                      <Image className="w-4 h-4 text-blue-400" />
                    ) : (
                      <FileText className="w-4 h-4 text-amber-400" />
                    )}
                    <span className="text-sm flex-1">{att.name}</span>
                    <Button size="sm" variant="ghost" className="h-7 text-xs">View</Button>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {/* Tags */}
          {bulletin.tags?.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {bulletin.tags.map(tag => (
                <span key={tag} className="px-2 py-0.5 rounded bg-secondary text-xs">
                  #{tag}
                </span>
              ))}
            </div>
          )}
          
          {/* Read by */}
          <div className="pt-4 border-t border-border">
            <p className="text-xs text-muted-foreground">
              <Eye className="w-3 h-3 inline mr-1" />
              Read by {bulletin.readBy?.length || 0} members
            </p>
          </div>
          
          {/* Actions */}
          <div className="flex gap-2">
            <Button variant="outline" className="flex-1" onClick={onClose}>
              Close
            </Button>
            <Button className="flex-1" onClick={() => toast.success('Acknowledged')}>
              <CheckCircle className="w-4 h-4 mr-2" />
              Acknowledge
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

// ============================================================
// TEAM DETAIL DRAWER
// ============================================================

const TeamDrawer = ({ team, profiles, bulletins, isOpen, onClose, onBulletinClick, isAdmin }) => {
  const colors = team ? getTeamColors(team.color) : getTeamColors('cyan');
  const Icon = team ? getDomainIcon(team.icon) : Users;
  const lead = profiles.find(p => p.userId === team?.lead);
  const memberProfiles = team?.members?.map(id => profiles.find(p => p.userId === id)).filter(Boolean) || [];
  const teamBulletins = bulletins.filter(b => b.teamId === team?.id).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  
  if (!team) return null;
  
  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
        <SheetHeader>
          <div className="flex items-center gap-3">
            <div className={`p-3 rounded-xl ${colors.bg}`}>
              <Icon className={`w-6 h-6 ${colors.text}`} />
            </div>
            <div>
              <SheetTitle>{team.name}</SheetTitle>
              <SheetDescription>{team.description}</SheetDescription>
            </div>
          </div>
        </SheetHeader>
        
        <div className="mt-6 space-y-6">
          {/* Team Lead */}
          {lead && (
            <div className={`p-3 rounded-xl ${colors.bg} border ${colors.border}`}>
              <p className="text-xs text-muted-foreground mb-1">Team Lead</p>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-500/50 to-fuchsia-500/50 flex items-center justify-center text-xs font-bold">
                  {lead.displayName.split(' ').map(n => n[0]).join('')}
                </div>
                <div>
                  <p className="font-medium text-sm">{lead.displayName}</p>
                  <p className="text-xs text-muted-foreground">{lead.callsign || lead.class}</p>
                </div>
                {lead.stats?.online && (
                  <span className="ml-auto px-2 py-0.5 rounded bg-success/20 text-success text-[10px] font-bold">ONLINE</span>
                )}
              </div>
            </div>
          )}
          
          {/* Members */}
          <div>
            <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
              <Users className="w-4 h-4" />
              Team Members ({memberProfiles.length})
            </h4>
            <div className="grid grid-cols-2 gap-2">
              {memberProfiles.map(member => (
                <div key={member.userId} className="flex items-center gap-2 p-2 rounded-lg bg-secondary/30">
                  <div className={`w-2 h-2 rounded-full ${member.stats?.online ? 'bg-success' : 'bg-muted-foreground'}`} />
                  <span className="text-sm truncate">{member.displayName}</span>
                  {member.userId === team.lead && (
                    <Star className="w-3 h-3 text-amber-400 ml-auto" />
                  )}
                </div>
              ))}
            </div>
          </div>
          
          {/* Recent Bulletins */}
          <div>
            <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
              <Megaphone className="w-4 h-4" />
              Recent Bulletins ({teamBulletins.length})
            </h4>
            {teamBulletins.length > 0 ? (
              <div className="space-y-2">
                {teamBulletins.slice(0, 3).map(bulletin => (
                  <button
                    key={bulletin.id}
                    onClick={() => onBulletinClick(bulletin)}
                    className="w-full p-3 rounded-lg bg-secondary/30 hover:bg-secondary/50 transition-colors text-left"
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <SeverityBadge severity={bulletin.severity} />
                      {bulletin.isNew && <NewBadge />}
                    </div>
                    <p className="text-sm font-medium line-clamp-1">{bulletin.title}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{getTimeAgo(bulletin.createdAt)}</p>
                  </button>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground p-3 rounded-lg bg-secondary/30">
                No bulletins from this team yet.
              </p>
            )}
          </div>
          
          {/* Admin Actions */}
          {isAdmin && (
            <div className="pt-4 border-t border-border">
              <Button className="w-full gap-2" onClick={() => toast.info('Create bulletin coming soon!')}>
                <Plus className="w-4 h-4" />
                Post New Bulletin
              </Button>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
};

// ============================================================
// MAIN COMPONENT
// ============================================================

export default function OfficialTeamsBulletins({ profiles, isAdmin = false }) {
  const [activeTab, setActiveTab] = useState('feed'); // 'feed' | 'teams' | 'archive'
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [selectedBulletin, setSelectedBulletin] = useState(null);
  const [teamDrawerOpen, setTeamDrawerOpen] = useState(false);
  const [bulletinDrawerOpen, setBulletinDrawerOpen] = useState(false);
  const [filterSeverity, setFilterSeverity] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  
  const bulletins = useMemo(() => generateTeamBulletins(), []);
  const teams = OFFICIAL_TEAMS;
  
  // Filter bulletins
  const filteredBulletins = useMemo(() => {
    let filtered = [...bulletins];
    
    if (filterSeverity !== 'all') {
      filtered = filtered.filter(b => b.severity === filterSeverity);
    }
    
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(b => 
        b.title.toLowerCase().includes(q) || 
        b.content.toLowerCase().includes(q) ||
        b.tags?.some(t => t.toLowerCase().includes(q))
      );
    }
    
    return filtered.sort((a, b) => {
      // Pinned first, then by date
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;
      return new Date(b.createdAt) - new Date(a.createdAt);
    });
  }, [bulletins, filterSeverity, searchQuery]);
  
  const newBulletinsCount = bulletins.filter(b => b.isNew).length;
  
  const handleTeamClick = (team) => {
    setSelectedTeam(team);
    setTeamDrawerOpen(true);
  };
  
  const handleBulletinClick = (bulletin) => {
    setSelectedBulletin(bulletin);
    setBulletinDrawerOpen(true);
  };
  
  return (
    <div className="glass rounded-xl p-4 border border-violet-500/30" data-testid="official-teams-bulletins">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-gradient-to-br from-violet-500/20 to-fuchsia-500/20">
            <Building2 className="w-5 h-5 text-violet-400" />
          </div>
          <div>
            <h3 className="font-bold text-lg flex items-center gap-2 flex-wrap">
              Official Teams & Updates
              <DataSourceBadge panelId="official-teams" />
              {newBulletinsCount > 0 && (
                <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-primary text-primary-foreground text-xs font-bold animate-pulse">
                  {newBulletinsCount} NEW
                </span>
              )}
            </h3>
            <p className="text-xs text-muted-foreground">Critical updates from official community teams</p>
          </div>
        </div>
        {isAdmin && (
          <Button size="sm" variant="outline" className="gap-1" onClick={() => toast.info('Create bulletin coming soon!')}>
            <Plus className="w-4 h-4" />
            Post
          </Button>
        )}
      </div>
      
      {/* Tabs */}
      <div className="flex gap-1 p-1 rounded-lg bg-secondary/50 mb-4">
        {[
          { id: 'feed', label: 'Latest Updates', icon: Bell },
          { id: 'teams', label: 'Teams', icon: Users },
          { id: 'archive', label: 'All Bulletins', icon: FileText },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === tab.id
                ? 'bg-primary text-primary-foreground'
                : 'hover:bg-secondary'
            }`}
            data-testid={`tab-${tab.id}`}
          >
            <tab.icon className="w-4 h-4" />
            <span className="hidden sm:inline">{tab.label}</span>
          </button>
        ))}
      </div>
      
      {/* Feed Tab - Latest bulletins */}
      {activeTab === 'feed' && (
        <div className="space-y-3">
          {filteredBulletins.filter(b => b.isPinned || b.isNew).slice(0, 4).map(bulletin => {
            const team = teams.find(t => t.id === bulletin.teamId);
            return (
              <BulletinCard
                key={bulletin.id}
                bulletin={bulletin}
                team={team}
                profiles={profiles}
                onClick={handleBulletinClick}
              />
            );
          })}
          {filteredBulletins.filter(b => b.isPinned || b.isNew).length === 0 && (
            <div className="p-6 text-center text-muted-foreground">
              <Bell className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No new updates. Check back later!</p>
            </div>
          )}
          <button
            onClick={() => setActiveTab('archive')}
            className="w-full p-3 rounded-lg bg-secondary/30 hover:bg-secondary/50 text-sm text-center text-muted-foreground hover:text-foreground transition-colors"
          >
            View all bulletins →
          </button>
        </div>
      )}
      
      {/* Teams Tab - Official teams grid */}
      {activeTab === 'teams' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {teams.map(team => (
            <TeamCard
              key={team.id}
              team={team}
              profiles={profiles}
              bulletins={bulletins}
              onClick={handleTeamClick}
            />
          ))}
        </div>
      )}
      
      {/* Archive Tab - All bulletins with filters */}
      {activeTab === 'archive' && (
        <div className="space-y-4">
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search bulletins..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <div className="flex gap-1 overflow-x-auto pb-1">
              {['all', 'critical', 'warning', 'info', 'success'].map(sev => (
                <button
                  key={sev}
                  onClick={() => setFilterSeverity(sev)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                    filterSeverity === sev
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-secondary/50 hover:bg-secondary'
                  }`}
                >
                  {sev === 'all' ? 'All' : BULLETIN_SEVERITY[sev]?.label}
                </button>
              ))}
            </div>
          </div>
          
          {/* Bulletins list */}
          <div className="space-y-2">
            {filteredBulletins.map(bulletin => {
              const team = teams.find(t => t.id === bulletin.teamId);
              return (
                <BulletinCard
                  key={bulletin.id}
                  bulletin={bulletin}
                  team={team}
                  profiles={profiles}
                  onClick={handleBulletinClick}
                />
              );
            })}
            {filteredBulletins.length === 0 && (
              <div className="p-6 text-center text-muted-foreground">
                <FileText className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No bulletins match your filters.</p>
              </div>
            )}
          </div>
        </div>
      )}
      
      {/* Drawers */}
      <TeamDrawer
        team={selectedTeam}
        profiles={profiles}
        bulletins={bulletins}
        isOpen={teamDrawerOpen}
        onClose={() => setTeamDrawerOpen(false)}
        onBulletinClick={(b) => { setTeamDrawerOpen(false); handleBulletinClick(b); }}
        isAdmin={isAdmin}
      />
      
      <BulletinDrawer
        bulletin={selectedBulletin}
        team={selectedBulletin ? teams.find(t => t.id === selectedBulletin.teamId) : null}
        profiles={profiles}
        isOpen={bulletinDrawerOpen}
        onClose={() => setBulletinDrawerOpen(false)}
      />
    </div>
  );
}
