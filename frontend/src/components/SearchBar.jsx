import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { 
  Search, Book, FileText, Users, Terminal, Command, Film, Music, 
  Clock, X, ChevronRight, ChevronDown, AlertTriangle, Info, HelpCircle,
  Sparkles, Filter, Trash2, ExternalLink, CheckCircle, XCircle, Wifi, WifiOff
} from 'lucide-react';
import config from '../config';
import { TrustBadge, getFreshness, FRESHNESS } from './ui/ProgressiveDisclosure';

// ============================================================
// SEARCH CONFIGURATION
// ============================================================

// Source priority order (1 = highest)
const SOURCE_PRIORITY = {
  kiwix: 1,
  jellyfin: 2,
  community: 3,
  commands: 4,
  files: 5
};

// Global top 15 caps per user spec
const GLOBAL_CAPS = {
  kiwix: 6,
  jellyfin: 6,
  community: 4,
  commands: 4, // Tools/Commands treated as one bucket
  files: 3     // Dynamic suppression to 0-2 when high-signal sources exist
};

// Kiwix API Configuration
const KIWIX_ENDPOINTS = {
  primary: 'http://talon.local:8090',
  fallback: 'http://127.0.0.1:8090'
};

// Pinned Kiwix sources (boosted in ranking)
const PINNED_KIWIX_SOURCES = [
  'wikipedia_en', 'wikipedia_simple', 'wikimed', 'wikimedical',
  'wiktionary_en', 'ifixit', 'wikem', 'archlinux', 'archwiki',
  'openstreetmap', 'devdocs', 'wikivoyage'
];

// File noise patterns to suppress in global mode
const FILE_NOISE_PATTERNS = [
  /\.bak$/i, /\.tmp$/i, /\.swp$/i, /\.old$/i, /~$/,
  /\.min\.js$/i, /\.min\.css$/i, /\.map$/i,
  /node_modules/i, /\.git/i, /__pycache__/i,
  /\.log$/i, /\.cache/i, /\.DS_Store/i
];

// Check if Jellyfin API key is configured (from env)
const JELLYFIN_API_KEY = process.env.REACT_APP_JELLYFIN_API_KEY || null;
const isJellyfinConfigured = () => !!JELLYFIN_API_KEY;

// Search scopes
const SEARCH_SCOPES = [
  { id: 'global', label: 'Global', icon: Search, description: 'Search all sources' },
  { id: 'kiwix', label: 'Knowledge', icon: Book, description: 'Wikipedia, guides, references' },
  { id: 'jellyfin', label: 'Media', icon: Film, description: 'Movies, TV, Music' },
  { id: 'community', label: 'Community', icon: Users, description: 'People, teams, skills' },
  { id: 'files', label: 'Files', icon: FileText, description: 'Documents, maps, shared files' },
  { id: 'commands', label: 'Tools', icon: Terminal, description: 'Commands and actions' },
];

// Source metadata
const SOURCE_META = {
  kiwix: {
    id: 'kiwix',
    label: 'Offline Knowledge',
    icon: Book,
    color: 'text-emerald-500',
    bgColor: 'bg-emerald-500/10',
    status: 'INDEXED',
    description: 'Wikipedia, medical guides, how-to articles'
  },
  jellyfin: {
    id: 'jellyfin',
    label: 'Media Library',
    icon: Film,
    color: 'text-violet-500',
    bgColor: 'bg-violet-500/10',
    status: 'NOT_INDEXED',
    statusNote: 'Jellyfin not indexed: missing API key',
    description: 'Movies, TV shows, music'
  },
  community: {
    id: 'community',
    label: 'Community',
    icon: Users,
    color: 'text-blue-500',
    bgColor: 'bg-blue-500/10',
    status: 'INDEXED',
    description: 'People, teams, skills directory'
  },
  commands: {
    id: 'commands',
    label: 'Commands & Actions',
    icon: Terminal,
    color: 'text-amber-500',
    bgColor: 'bg-amber-500/10',
    status: 'PLANNED',
    statusNote: 'Executable commands planned for future release',
    description: 'System commands and quick actions'
  },
  files: {
    id: 'files',
    label: 'Files & Documents',
    icon: FileText,
    color: 'text-cyan-500',
    bgColor: 'bg-cyan-500/10',
    status: 'INDEXED',
    description: 'Shared files, maps, documents'
  }
};

// ============================================================
// MOCK DATA GENERATORS (to be replaced with real API)
// ============================================================

const generateMockKiwixResults = (query) => {
  const q = query.toLowerCase();
  const results = [];
  
  // Wikipedia matches
  if (q.includes('wiki')) {
    results.push({
      id: 'kiwix-1',
      title: 'Wikipedia (English)',
      subtitle: 'The Free Encyclopedia - 6.7M articles',
      source: 'kiwix',
      sourceLabel: 'Wikipedia EN',
      matchType: 'exact',
      matchReason: 'Exact match for "wiki"',
      trustBadge: 'VERIFIED',
      freshness: Date.now() - 86400000, // 1 day ago
      isPinned: true,
      url: `${config.endpoints.kiwix}/wikipedia_en`
    });
    results.push({
      id: 'kiwix-2',
      title: 'Wikipedia Simple English',
      subtitle: 'Easy-to-read encyclopedia - 240K articles',
      source: 'kiwix',
      sourceLabel: 'Wikipedia Simple',
      matchType: 'prefix',
      matchReason: 'Prefix match for "wiki"',
      trustBadge: 'VERIFIED',
      freshness: Date.now() - 86400000,
      isPinned: true,
      url: `${config.endpoints.kiwix}/wikipedia_simple`
    });
  }
  
  if (q.includes('wikipedia')) {
    results.unshift({
      id: 'kiwix-exact',
      title: 'Wikipedia (English)',
      subtitle: 'The Free Encyclopedia - Full offline copy',
      source: 'kiwix',
      sourceLabel: 'Wikipedia EN',
      matchType: 'exact',
      matchReason: 'Exact match for "wikipedia"',
      trustBadge: 'VERIFIED',
      freshness: Date.now() - 3600000,
      isPinned: true,
      url: `${config.endpoints.kiwix}/wikipedia_en`
    });
  }
  
  if (q.includes('medical') || q.includes('health') || q.includes('emergency')) {
    results.push({
      id: 'kiwix-wikem',
      title: 'WikEM - Emergency Medicine',
      subtitle: 'Emergency medicine reference',
      source: 'kiwix',
      sourceLabel: 'WikEM',
      matchType: 'fts',
      matchReason: 'Full-text match in medical content',
      trustBadge: 'VERIFIED',
      freshness: Date.now() - 172800000,
      isPinned: true,
      url: `${config.endpoints.kiwix}/wikem`
    });
  }
  
  if (q.includes('fix') || q.includes('repair') || q.includes('how')) {
    results.push({
      id: 'kiwix-ifixit',
      title: 'iFixit Repair Guides',
      subtitle: 'Device repair manuals and guides',
      source: 'kiwix',
      sourceLabel: 'iFixit',
      matchType: 'fts',
      matchReason: 'Full-text match for repair content',
      trustBadge: 'VERIFIED',
      freshness: Date.now() - 259200000,
      isPinned: true,
      url: `${config.endpoints.kiwix}/ifixit`
    });
  }
  
  // Generic Kiwix results
  if (results.length === 0 && q.length > 2) {
    results.push({
      id: 'kiwix-search',
      title: `Search "${query}" in Knowledge Base`,
      subtitle: 'Search across all offline libraries',
      source: 'kiwix',
      sourceLabel: 'Kiwix Search',
      matchType: 'fts',
      matchReason: 'Full-text search available',
      trustBadge: 'DERIVED',
      freshness: Date.now(),
      url: `${config.endpoints.kiwix}/search?q=${encodeURIComponent(query)}`
    });
  }
  
  return results;
};

const generateMockJellyfinResults = (query) => {
  // Jellyfin is NOT_INDEXED - show stub results
  const q = query.toLowerCase();
  const results = [];
  
  if (q.includes('movie') || q.includes('film') || q.includes('watch')) {
    results.push({
      id: 'jellyfin-stub-1',
      title: 'Media Library Search',
      subtitle: 'Jellyfin not indexed: missing API key',
      source: 'jellyfin',
      sourceLabel: 'Jellyfin',
      matchType: 'stub',
      matchReason: 'Media search available when Jellyfin is configured',
      trustBadge: 'UNKNOWN',
      freshness: null,
      isStub: true,
      stubMessage: 'Configure Jellyfin API key in Admin Console to enable media search'
    });
  }
  
  return results;
};

const generateMockCommunityResults = (query) => {
  const q = query.toLowerCase();
  const results = [];
  
  if (q.includes('john') || q.includes('admin') || q.includes('user')) {
    results.push({
      id: 'community-1',
      title: 'John Smith',
      subtitle: 'Admin • Medical Team • Available',
      source: 'community',
      sourceLabel: 'Directory',
      matchType: 'prefix',
      matchReason: 'Name match',
      trustBadge: 'VERIFIED',
      freshness: Date.now() - 300000
    });
  }
  
  if (q.includes('team') || q.includes('group') || q.includes('medical')) {
    results.push({
      id: 'community-2',
      title: 'Medical Response Team',
      subtitle: '5 members • Last active 2h ago',
      source: 'community',
      sourceLabel: 'Teams',
      matchType: 'fts',
      matchReason: 'Team name match',
      trustBadge: 'VERIFIED',
      freshness: Date.now() - 7200000
    });
  }
  
  return results;
};

const generateMockCommandResults = (query) => {
  const q = query.toLowerCase();
  const results = [];
  
  const commands = [
    { id: 'cmd-hotspot', trigger: 'hotspot', title: 'Toggle Hotspot', desc: 'Turn WiFi hotspot on/off' },
    { id: 'cmd-selftest', trigger: 'test', title: 'Run Self-Test', desc: 'Check all subsystems' },
    { id: 'cmd-backup', trigger: 'backup', title: 'Start Backup', desc: 'Backup system data' },
    { id: 'cmd-movie', trigger: 'movie', title: 'Start Movie Night', desc: 'Configure for movie viewing' },
    { id: 'cmd-sos', trigger: 'sos', title: 'SOS Beacon', desc: 'Activate emergency beacon' },
  ];
  
  commands.forEach(cmd => {
    if (q.includes(cmd.trigger) || cmd.title.toLowerCase().includes(q)) {
      results.push({
        id: cmd.id,
        title: cmd.title,
        subtitle: cmd.desc,
        source: 'commands',
        sourceLabel: 'Action',
        matchType: 'exact',
        matchReason: 'Command match',
        trustBadge: 'UNKNOWN',
        freshness: null,
        isStub: true,
        stubMessage: 'Command execution planned for future release'
      });
    }
  });
  
  return results;
};

const generateMockFileResults = (query, includeNoise = false) => {
  const q = query.toLowerCase();
  const results = [];
  
  // Simulated file results
  const files = [
    { name: 'omega_manual.pdf', path: '/docs/omega_manual.pdf', size: '2.4 MB', modified: Date.now() - 86400000 },
    { name: 'emergency_procedures.docx', path: '/docs/emergency_procedures.docx', size: '156 KB', modified: Date.now() - 172800000 },
    { name: 'team_roster.xlsx', path: '/shared/team_roster.xlsx', size: '45 KB', modified: Date.now() - 3600000 },
    { name: 'local_map.jpg', path: '/maps/local_map.jpg', size: '1.2 MB', modified: Date.now() - 604800000 },
    { name: 'config.json.bak', path: '/system/config.json.bak', size: '12 KB', modified: Date.now() - 259200000, isNoise: true },
    { name: 'omega.log', path: '/logs/omega.log', size: '45 MB', modified: Date.now() - 60000, isNoise: true },
    { name: '.DS_Store', path: '/shared/.DS_Store', size: '6 KB', modified: Date.now() - 86400000, isNoise: true },
    { name: 'bundle.min.js', path: '/assets/bundle.min.js', size: '892 KB', modified: Date.now() - 604800000, isNoise: true },
  ];
  
  files.forEach((file, i) => {
    if (file.name.toLowerCase().includes(q) || file.path.toLowerCase().includes(q)) {
      // Skip noise files unless explicitly included
      if (file.isNoise && !includeNoise) return;
      
      results.push({
        id: `file-${i}`,
        title: file.name,
        subtitle: `${file.path} • ${file.size}`,
        source: 'files',
        sourceLabel: 'File',
        matchType: file.name.toLowerCase().startsWith(q) ? 'prefix' : 'fts',
        matchReason: `Filename contains "${query}"`,
        trustBadge: 'VERIFIED',
        freshness: file.modified,
        isNoise: file.isNoise
      });
    }
  });
  
  return results;
};

// Fuzzy match / typo correction
const getDidYouMean = (query) => {
  const corrections = {
    'wikpedia': 'wikipedia',
    'wikipdia': 'wikipedia',
    'wikepedia': 'wikipedia',
    'kiwx': 'kiwix',
    'kiwixx': 'kiwix',
    'jllyfin': 'jellyfin',
    'jelyfin': 'jellyfin',
    'jelyfish': 'jellyfin',
    'sos becon': 'sos beacon',
    'emergncy': 'emergency',
    'medicl': 'medical',
  };
  
  const q = query.toLowerCase();
  for (const [typo, correction] of Object.entries(corrections)) {
    if (q.includes(typo)) {
      return query.replace(new RegExp(typo, 'gi'), correction);
    }
  }
  return null;
};

// ============================================================
// SEARCH LOGIC
// ============================================================

const performSearch = (query, scope = 'global') => {
  if (!query || query.length < 2) return { results: [], meta: {} };
  
  let allResults = [];
  const sourceCounts = {};
  
  // Gather results from all sources (or scoped source)
  const sources = scope === 'global' 
    ? ['kiwix', 'jellyfin', 'community', 'commands', 'files']
    : [scope];
  
  sources.forEach(src => {
    let results = [];
    switch (src) {
      case 'kiwix':
        results = generateMockKiwixResults(query);
        break;
      case 'jellyfin':
        results = generateMockJellyfinResults(query);
        break;
      case 'community':
        results = generateMockCommunityResults(query);
        break;
      case 'commands':
        results = generateMockCommandResults(query);
        break;
      case 'files':
        results = generateMockFileResults(query, scope === 'files');
        break;
    }
    sourceCounts[src] = results.length;
    allResults = allResults.concat(results);
  });
  
  // Sort by priority and match type
  const matchPriority = { exact: 0, prefix: 1, fts: 2, fuzzy: 3, stub: 4 };
  
  allResults.sort((a, b) => {
    // First by source priority
    const srcDiff = SOURCE_PRIORITY[a.source] - SOURCE_PRIORITY[b.source];
    if (srcDiff !== 0) return srcDiff;
    
    // Then by match type
    const matchDiff = matchPriority[a.matchType] - matchPriority[b.matchType];
    if (matchDiff !== 0) return matchDiff;
    
    // Then by pinned status
    if (a.isPinned && !b.isPinned) return -1;
    if (!a.isPinned && b.isPinned) return 1;
    
    return 0;
  });
  
  // Apply dynamic caps for global scope
  if (scope === 'global') {
    const hasHighValueResults = sourceCounts.kiwix > 0 || sourceCounts.jellyfin > 0 || sourceCounts.community > 0;
    
    const caps = hasHighValueResults ? {
      kiwix: 6,
      jellyfin: 6,
      community: 4,
      commands: 3,
      files: 2
    } : {
      files: 15 // No cap when files is only source
    };
    
    const cappedResults = [];
    const sourceUsed = {};
    const hiddenFiles = [];
    
    allResults.forEach(result => {
      const src = result.source;
      sourceUsed[src] = (sourceUsed[src] || 0);
      
      if (!caps[src] || sourceUsed[src] < caps[src]) {
        cappedResults.push(result);
        sourceUsed[src]++;
      } else if (src === 'files') {
        hiddenFiles.push(result);
      }
    });
    
    return {
      results: cappedResults,
      hiddenFiles,
      meta: {
        totalResults: allResults.length,
        shownResults: cappedResults.length,
        sourceCounts,
        didYouMean: getDidYouMean(query),
        caps,
        hasHighValueResults
      }
    };
  }
  
  return {
    results: allResults,
    hiddenFiles: [],
    meta: {
      totalResults: allResults.length,
      shownResults: allResults.length,
      sourceCounts,
      didYouMean: getDidYouMean(query)
    }
  };
};

// ============================================================
// RECENT SEARCHES (localStorage)
// ============================================================

const RECENT_SEARCHES_KEY = 'omega-recent-searches';
const MAX_RECENT_SEARCHES = 10;

const getRecentSearches = () => {
  try {
    return JSON.parse(localStorage.getItem(RECENT_SEARCHES_KEY) || '[]');
  } catch {
    return [];
  }
};

const addRecentSearch = (query) => {
  if (!query || query.length < 2) return;
  const recent = getRecentSearches().filter(q => q !== query);
  recent.unshift(query);
  localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(recent.slice(0, MAX_RECENT_SEARCHES)));
};

const removeRecentSearch = (query) => {
  const recent = getRecentSearches().filter(q => q !== query);
  localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(recent));
};

const clearRecentSearches = () => {
  localStorage.removeItem(RECENT_SEARCHES_KEY);
};

// ============================================================
// SEARCH BAR COMPONENT
// ============================================================

export default function SearchBar() {
  const [query, setQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [scope, setScope] = useState('global');
  const [showExplain, setShowExplain] = useState(false);
  const [showMoreFiles, setShowMoreFiles] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [recentSearches, setRecentSearches] = useState(getRecentSearches);
  
  const inputRef = useRef(null);
  const dropdownRef = useRef(null);

  // Search results
  const searchData = useMemo(() => {
    return performSearch(query, scope);
  }, [query, scope]);

  const { results, hiddenFiles, meta } = searchData;

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!isFocused) {
        if (e.key === '/' && document.activeElement?.tagName !== 'INPUT') {
          e.preventDefault();
          inputRef.current?.focus();
        }
        return;
      }

      const totalItems = results.length + (showMoreFiles ? hiddenFiles.length : 0);

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setSelectedIndex(prev => Math.min(prev + 1, totalItems - 1));
          break;
        case 'ArrowUp':
          e.preventDefault();
          setSelectedIndex(prev => Math.max(prev - 1, -1));
          break;
        case 'Enter':
          e.preventDefault();
          if (selectedIndex >= 0 && selectedIndex < results.length) {
            handleResultClick(results[selectedIndex]);
          } else if (query.length > 0) {
            handleSearch();
          }
          break;
        case 'Escape':
          setIsFocused(false);
          inputRef.current?.blur();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isFocused, results, hiddenFiles, selectedIndex, showMoreFiles, query]);

  // Reset selection when results change
  useEffect(() => {
    setSelectedIndex(-1);
  }, [query, scope]);

  const handleSearch = useCallback(() => {
    if (!query.trim()) return;
    addRecentSearch(query);
    setRecentSearches(getRecentSearches());
    // In real implementation, this would navigate to full search results page
  }, [query]);

  const handleResultClick = useCallback((result) => {
    if (result.isStub) {
      // Show stub message - don't navigate
      return;
    }
    if (result.url) {
      window.open(result.url, '_blank');
    }
    addRecentSearch(query);
    setRecentSearches(getRecentSearches());
    setIsFocused(false);
  }, [query]);

  const handleClearRecent = useCallback((e, searchQuery) => {
    e.stopPropagation();
    removeRecentSearch(searchQuery);
    setRecentSearches(getRecentSearches());
  }, []);

  const handleClearAllRecent = useCallback(() => {
    clearRecentSearches();
    setRecentSearches([]);
  }, []);

  const handleScopeChange = useCallback((newScope) => {
    setScope(newScope);
    inputRef.current?.focus();
  }, []);

  // Show dropdown when focused
  const showDropdown = isFocused;

  return (
    <div className="relative max-w-3xl mx-auto px-1 sm:px-0" data-testid="search-bar-container">
      {/* Search Input */}
      <div className="relative">
        <div
          className={`rounded-xl sm:rounded-2xl transition-all duration-300 bg-card border ${
            isFocused 
              ? 'ring-2 ring-primary shadow-lg shadow-primary/20 border-primary' 
              : 'border-border shadow-md'
          }`}
        >
          <div className="flex items-center gap-2 sm:gap-3 px-3 sm:px-5 py-3 sm:py-4">
            <Search className={`w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0 transition-colors ${isFocused ? 'text-primary' : 'text-muted-foreground'}`} />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setTimeout(() => setIsFocused(false), 200)}
              placeholder={scope === 'global' ? "Search anything... (knowledge, media, people, files)" : `Search ${scope}...`}
              className="flex-1 bg-transparent border-none outline-none text-sm sm:text-base text-foreground placeholder:text-muted-foreground/70 min-w-0"
              data-testid="search-input"
              aria-label="Search"
              autoComplete="off"
            />
            {query && (
              <button 
                onClick={() => setQuery('')}
                className="p-1 hover:bg-secondary rounded-full transition-colors"
                data-testid="search-clear"
              >
                <X className="w-4 h-4 text-muted-foreground" />
              </button>
            )}
            <kbd className="hidden sm:inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-muted-foreground bg-secondary rounded-lg flex-shrink-0">
              <Command className="w-3 h-3" />
              /
            </kbd>
          </div>
        </div>

        {/* Search Tips (shown on focus with empty query) */}
        {isFocused && !query && (
          <div className="mt-2 text-xs text-muted-foreground flex items-center gap-2" data-testid="search-tips">
            <Sparkles className="w-3 h-3" />
            <span>Try: "wiki", "emergency", "medical", "john" • <a href="#" className="text-primary hover:underline">More tips</a></span>
          </div>
        )}
      </div>

      {/* Dropdown */}
      {showDropdown && (
        <div 
          ref={dropdownRef}
          className="absolute top-full mt-2 w-full bg-card border border-border rounded-xl sm:rounded-2xl shadow-xl z-50 animate-fade-in overflow-hidden max-h-[70vh] overflow-y-auto"
          data-testid="search-dropdown"
        >
          {/* Scope Chips */}
          <div className="p-2 border-b border-border bg-secondary/30" data-testid="search-scopes">
            <div className="flex flex-wrap gap-1.5">
              {SEARCH_SCOPES.map(s => (
                <button
                  key={s.id}
                  onClick={() => handleScopeChange(s.id)}
                  className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                    scope === s.id 
                      ? 'bg-primary text-primary-foreground' 
                      : 'bg-secondary hover:bg-secondary/80 text-foreground'
                  }`}
                  data-testid={`scope-${s.id}`}
                >
                  <s.icon className="w-3 h-3" />
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          {/* Empty State - Recent Searches */}
          {!query && (
            <div className="p-3" data-testid="search-empty-state">
              {recentSearches.length > 0 ? (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      Recent Searches
                    </span>
                    <button 
                      onClick={handleClearAllRecent}
                      className="text-xs text-muted-foreground hover:text-foreground"
                      data-testid="clear-all-recent"
                    >
                      Clear all
                    </button>
                  </div>
                  <div className="space-y-1">
                    {recentSearches.map((search, i) => (
                      <div 
                        key={i}
                        className="flex items-center justify-between p-2 rounded-lg hover:bg-secondary cursor-pointer group"
                        onClick={() => setQuery(search)}
                        data-testid={`recent-search-${i}`}
                      >
                        <span className="text-sm text-foreground">{search}</span>
                        <button 
                          onClick={(e) => handleClearRecent(e, search)}
                          className="opacity-0 group-hover:opacity-100 p-1 hover:bg-secondary rounded"
                        >
                          <X className="w-3 h-3 text-muted-foreground" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-center py-4">
                  <Search className="w-8 h-8 mx-auto mb-2 text-muted-foreground/50" />
                  <p className="text-sm text-muted-foreground">Start typing to search</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Search knowledge bases, media, people, and files
                  </p>
                </div>
              )}
              
              {/* Suggested Categories */}
              <div className="mt-4 pt-3 border-t border-border">
                <span className="text-xs font-medium text-muted-foreground">Quick Access</span>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  {Object.values(SOURCE_META).slice(0, 4).map(src => (
                    <button
                      key={src.id}
                      onClick={() => handleScopeChange(src.id)}
                      className={`flex items-center gap-2 p-2 rounded-lg ${src.bgColor} hover:opacity-80 transition-opacity`}
                      data-testid={`quick-access-${src.id}`}
                    >
                      <src.icon className={`w-4 h-4 ${src.color}`} />
                      <span className="text-xs font-medium text-foreground">{src.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Did You Mean */}
          {query && meta.didYouMean && (
            <div className="px-3 py-2 bg-amber-500/10 border-b border-amber-500/30" data-testid="did-you-mean">
              <span className="text-sm text-amber-600 dark:text-amber-400">
                Did you mean: <button 
                  onClick={() => setQuery(meta.didYouMean)}
                  className="font-medium underline hover:no-underline"
                >
                  {meta.didYouMean}
                </button>?
              </span>
            </div>
          )}

          {/* Search Results */}
          {query && results.length > 0 && (
            <div className="p-2" data-testid="search-results">
              {/* Group results by source */}
              {['kiwix', 'jellyfin', 'community', 'commands', 'files'].map(sourceId => {
                const sourceResults = results.filter(r => r.source === sourceId);
                if (sourceResults.length === 0) return null;
                
                const sourceMeta = SOURCE_META[sourceId];
                
                return (
                  <div key={sourceId} className="mb-3" data-testid={`results-group-${sourceId}`}>
                    <div className="flex items-center gap-2 px-2 py-1.5">
                      <sourceMeta.icon className={`w-3.5 h-3.5 ${sourceMeta.color}`} />
                      <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                        {sourceMeta.label}
                      </span>
                      {sourceMeta.status !== 'INDEXED' && (
                        <span className={`text-[10px] px-1.5 py-0.5 rounded ${
                          sourceMeta.status === 'PLANNED' ? 'bg-amber-500/20 text-amber-500' : 'bg-blue-500/20 text-blue-500'
                        }`}>
                          {sourceMeta.status}
                        </span>
                      )}
                    </div>
                    
                    <div className="space-y-1">
                      {sourceResults.map((result, i) => {
                        const globalIndex = results.indexOf(result);
                        const isSelected = selectedIndex === globalIndex;
                        
                        return (
                          <button
                            key={result.id}
                            onClick={() => handleResultClick(result)}
                            className={`w-full flex items-start gap-3 p-2.5 rounded-lg text-left transition-colors ${
                              isSelected ? 'bg-primary/20' : 'hover:bg-secondary'
                            } ${result.isStub ? 'opacity-70' : ''}`}
                            data-testid={`search-result-${result.id}`}
                          >
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${sourceMeta.bgColor}`}>
                              <sourceMeta.icon className={`w-4 h-4 ${sourceMeta.color}`} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-medium text-foreground truncate">
                                  {result.title}
                                </span>
                                <TrustBadge type={result.trustBadge} showLabel={false} />
                              </div>
                              <div className="text-xs text-muted-foreground truncate">
                                {result.subtitle}
                              </div>
                              {result.isStub && result.stubMessage && (
                                <div className="text-xs text-amber-500 mt-1 flex items-center gap-1">
                                  <AlertTriangle className="w-3 h-3" />
                                  {result.stubMessage}
                                </div>
                              )}
                              {!result.isStub && (
                                <div className="flex items-center gap-2 mt-1 text-[10px] text-muted-foreground">
                                  <span className="text-primary">{result.matchReason}</span>
                                  {result.freshness && (
                                    <>
                                      <span>•</span>
                                      <span className={getFreshness(result.freshness).color}>
                                        {getFreshness(result.freshness).label}
                                      </span>
                                    </>
                                  )}
                                </div>
                              )}
                            </div>
                            {!result.isStub && (
                              <ChevronRight className="w-4 h-4 text-muted-foreground flex-shrink-0 mt-1" />
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}

              {/* Show More Files */}
              {hiddenFiles.length > 0 && (
                <div className="mt-2 pt-2 border-t border-border" data-testid="show-more-files">
                  <button
                    onClick={() => setShowMoreFiles(!showMoreFiles)}
                    className="w-full flex items-center justify-center gap-2 p-2 rounded-lg hover:bg-secondary text-sm text-muted-foreground"
                  >
                    <FileText className="w-4 h-4" />
                    {showMoreFiles ? 'Hide' : 'Show'} {hiddenFiles.length} more files
                    <ChevronDown className={`w-4 h-4 transition-transform ${showMoreFiles ? 'rotate-180' : ''}`} />
                  </button>
                  
                  {showMoreFiles && (
                    <div className="mt-2 space-y-1">
                      {hiddenFiles.map(file => (
                        <button
                          key={file.id}
                          onClick={() => handleResultClick(file)}
                          className="w-full flex items-start gap-3 p-2.5 rounded-lg text-left hover:bg-secondary"
                        >
                          <FileText className="w-4 h-4 text-cyan-500 mt-0.5" />
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-medium text-foreground truncate">{file.title}</div>
                            <div className="text-xs text-muted-foreground truncate">{file.subtitle}</div>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Explain Results */}
              <div className="mt-3 pt-2 border-t border-border">
                <button
                  onClick={() => setShowExplain(!showExplain)}
                  className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground"
                  data-testid="explain-results-btn"
                >
                  <HelpCircle className="w-3 h-3" />
                  {showExplain ? 'Hide' : 'Explain'} results ranking
                </button>
                
                {showExplain && (
                  <div className="mt-2 p-3 bg-secondary/50 rounded-lg text-xs text-muted-foreground" data-testid="explain-results-panel">
                    <p className="font-medium text-foreground mb-2">How results are ranked:</p>
                    <ol className="list-decimal list-inside space-y-1">
                      <li><strong>Source priority:</strong> Knowledge → Media → Community → Commands → Files</li>
                      <li><strong>Match type:</strong> Exact match → Prefix → Full-text → Fuzzy</li>
                      <li><strong>Pinned sources:</strong> Wikipedia, WikEM, iFixit get a boost</li>
                      <li><strong>Files capped:</strong> Max 2 files shown when higher-value results exist</li>
                      <li><strong>Noise filtered:</strong> Backup files, logs, and artifacts hidden by default</li>
                    </ol>
                    <p className="mt-2 text-primary">
                      Query: "{query}" • Scope: {scope} • {meta.totalResults} total, {meta.shownResults} shown
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Zero Results */}
          {query && query.length >= 2 && results.length === 0 && (
            <div className="p-6 text-center" data-testid="zero-results">
              <XCircle className="w-10 h-10 mx-auto mb-3 text-muted-foreground/50" />
              <h4 className="font-medium text-foreground mb-1">No results for "{query}"</h4>
              <p className="text-sm text-muted-foreground mb-4">
                {scope === 'global' 
                  ? 'No matches found in any source.'
                  : `No matches found in ${SOURCE_META[scope]?.label || scope}.`
                }
              </p>
              <div className="space-y-2 text-sm">
                <p className="text-muted-foreground">Try:</p>
                <ul className="text-muted-foreground space-y-1">
                  <li>• Check spelling or try a different term</li>
                  <li>• Use broader keywords (e.g., "medical" instead of "emergency cardiology")</li>
                  {scope !== 'global' && (
                    <li>• <button onClick={() => setScope('global')} className="text-primary hover:underline">Search globally</button> instead</li>
                  )}
                </ul>
              </div>
              {meta.didYouMean && (
                <button 
                  onClick={() => setQuery(meta.didYouMean)}
                  className="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium"
                >
                  Search for "{meta.didYouMean}" instead
                </button>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
