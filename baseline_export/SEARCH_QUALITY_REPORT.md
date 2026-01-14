# OMEGA Dashboard Search Quality Report

Generated: 2025-01-14T04:40:00Z

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

### Dynamic Source Caps
When high-value sources (Kiwix, Jellyfin, Community) have results:
- Kiwix: max 6 in top 15
- Jellyfin: max 6 in top 15
- Community: max 4 in top 15
- Commands: max 3 in top 15
- Files: max 2 in top 15 (rest behind "Show more files")

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

## Source Status

| Source | Status | Notes |
|--------|--------|-------|
| Kiwix | INDEXED | Full offline library searchable |
| Jellyfin | NOT_INDEXED | Requires API key configuration |
| Community | INDEXED | Directory searchable |
| Commands | PLANNED | Stub only - execution not implemented |
| Files | INDEXED | File scan active |

## How to Interpret Results

1. **Results are grouped by source** - Each source section shows its label and status badge
2. **Match reason is shown** - Each result explains why it matched
3. **Trust badge indicates data reliability** - VERIFIED = direct, UNKNOWN = unverified
4. **Freshness shows data age** - LIVE = fresh, STALE = may be outdated
5. **"Explain results" link** - Shows ranking rules and query details

## Known Limitations

1. **Jellyfin not indexed** - Requires API key to be configured
2. **Commands are stubs** - Shown but not executable
3. **Article-level Kiwix search** - Currently library-level only (article search PLANNED)
4. **No backend search API** - All search is client-side mock data

## Test Queries

See Section 6 of the implementation spec for the 25-query validation matrix.
