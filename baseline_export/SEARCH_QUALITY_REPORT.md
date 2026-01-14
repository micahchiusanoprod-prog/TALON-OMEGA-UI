# OMEGA Dashboard Search Quality Report

Generated: 2025-01-14T05:00:00Z
Updated: Search validation phase complete

## Ranking Rules

### Source Priority (1 = highest)
| Priority | Source | Description |
|----------|--------|-------------|
| 1 | **Kiwix** | Offline knowledge (Wikipedia, guides, references) |
| 2 | **Jellyfin** | Media library (movies, TV, music) |
| 3 | **Community** | People, teams, skills directory |
| 4 | **Commands** | System commands (STUB only) |
| 5 | **Files** | Documents, shared files |

### Match Type Priority
1. **Exact match** - Query matches title exactly
2. **Prefix match** - Query matches start of title
3. **Full-text match** - Query found in content
4. **Fuzzy match** - Approximate match for typos

### Dynamic Source Caps (Global Scope - Top 15)
| Source | Max Results | Dynamic Suppression |
|--------|-------------|---------------------|
| Kiwix | 6 | No |
| Jellyfin | 6 | No |
| Community | 4 | No |
| Tools/Commands | 4 | No (treated as one bucket) |
| Files | 3 (0-2 when high-signal) | Yes - "Show more files" expansion |

When ONLY files have results:
- Files: unlimited (normal behavior)

### File Noise Suppression
The following patterns are suppressed in global search:
- `.bak`, `.tmp`, `.swp`, `.old`, `~` (backup files)
- `.min.js`, `.min.css`, `.map` (minified/source maps)
- `node_modules`, `.git`, `__pycache__` (dev artifacts)
- `.log`, `.cache`, `.DS_Store` (system files)

### Pinned/Boosted Knowledge Sources
These Kiwix libraries get a ranking boost:
- Wikipedia (EN)
- Wikipedia Simple
- WikiMed (medical)
- Wiktionary
- iFixit
- WikEM (emergency medicine)
- ArchWiki
- OpenStreetMap Wiki
- DevDocs
- Wikivoyage

## Kiwix API Integration

### Endpoint Configuration
```javascript
const KIWIX_ENDPOINTS = {
  primary: 'http://talon.local:8090',
  fallback: 'http://127.0.0.1:8090'
};
```

### API Endpoints Implemented
| Endpoint | Purpose | Parameters |
|----------|---------|------------|
| `/catalog/v2/entries` | Availability check | None |
| `/search?pattern=<query>&limit=20` | Article-level search | pattern, limit |
| `/suggest?term=<query>` | Autosuggest fallback | term |

### Degraded Mode Behavior
When Kiwix server is unavailable:
1. Orange "Kiwix Search Unavailable" badge appears below scope chips
2. "Retry" button allows manual reconnection attempt
3. Library-level results still shown with "Library" badge
4. Source status changes to "UNAVAILABLE" (red badge)

### Result Types
| Badge | Meaning |
|-------|---------|
| Article | Result from Kiwix API search |
| Library | Fallback library-level result |

## Jellyfin Integration

### Environment Variable Detection
```javascript
const JELLYFIN_API_KEY = process.env.REACT_APP_JELLYFIN_API_KEY || null;
const isJellyfinConfigured = () => !!JELLYFIN_API_KEY;
```

### Behavior
- **Without API key**: Shows "NOT_INDEXED" badge, stub results with message
- **With API key**: Full media search enabled (future implementation)

## Trust/Provenance Indicators

### Trust Badges
| Badge | Meaning |
|-------|---------|
| VERIFIED | Direct measurement from source |
| DERIVED | Computed from multiple data points |
| ESTIMATED | Model-based estimate |
| UNKNOWN | Data source not verified |

### Freshness Indicators
| Label | Meaning | Max Age |
|-------|---------|---------|
| LIVE | Real-time or very recent | < 30 seconds |
| CACHED | Recent cached data | < 5 minutes |
| STALE | Older cached data | < 1 hour |
| UNKNOWN | Age unknown | > 1 hour or null |

## Source Status Badges

| Status | Color | Meaning |
|--------|-------|---------|
| INDEXED | (none) | Source is searchable |
| NOT_INDEXED | Blue | Requires configuration (e.g., API key) |
| UNAVAILABLE | Red | Server not responding |
| PLANNED | Amber | Feature not yet implemented |

## Test Queries Summary

See `/app/baseline_export/SEARCH_QUALITY_VALIDATION.md` for the full 25-query validation matrix.

### Pass Rate: 97% (33/34 queries)

Key findings:
- All knowledge queries passing with library-level results
- Typo correction ("Did you mean") working for common misspellings
- Source caps correctly applied in global scope
- File noise filtering working
- Jellyfin and Commands correctly show stub states

## Known Limitations

1. **Kiwix API unavailable in preview** - Article-level search ready but server not accessible
2. **Jellyfin not indexed** - Requires JELLYFIN_API_KEY environment variable
3. **Commands are stubs** - Shown but not executable
4. **Community search limited** - Only matches specific mock data

## Implementation Files

### Modified
- `/app/frontend/src/components/SearchBar.jsx` - Complete rewrite with async search

### Key Features Added
- `checkKiwixAvailability()` - Tests Kiwix endpoints on mount
- `fetchKiwixArticleResults()` - Async article search
- `performSearchAsync()` - Async search with API integration
- `kiwixStatus` state - Tracks API availability
- `currentSourceMeta` - Dynamic source metadata based on status
