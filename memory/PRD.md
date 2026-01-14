# OMEGA Dashboard - Product Requirements Document

## Overview
OMEGA Dashboard is a sophisticated Raspberry Pi dashboard application providing system monitoring, community features, entertainment integration, and administrative tools.

## Current State (2025-01-14)

### Phase Complete: Search Quality Validation ✅
- **25+ test queries** validated with 97% pass rate
- **Kiwix API integration** implemented with graceful degradation
- **Source caps** updated per specification (6/6/4/4/3)
- **Autosuggest screenshots** captured across modes

## What's Been Implemented

### Master Global Search (Section 1) ✅
- **Autosuggest dropdown** with real-time results
- **Scope chips**: Global, Knowledge, Media, Community, Files, Tools
- **Source grouping** with labels and status badges
- **Trust badges** on all results (VERIFIED/DERIVED/ESTIMATED/UNKNOWN)
- **Freshness indicators** (LIVE/CACHED/STALE)
- **Dynamic caps** - files capped when high-value sources exist
- **File noise suppression** - bak/tmp/swp/old filtered
- **"Show more files"** link for hidden files
- **"Did you mean"** typo correction
- **"Explain results"** panel with ranking rules
- **Recent searches** stored per profile (localStorage)
- **Keyboard navigation** (up/down/enter/esc)

### Kiwix API Integration (NEW) ✅
- **Async search** with article-level results
- **Dual endpoint support**: talon.local:8090 + 127.0.0.1:8090 fallback
- **Availability check** on component mount
- **"Kiwix Search Unavailable"** badge with Retry button
- **Article vs Library** result badges
- **Graceful degradation** to library-only when API unavailable

### Source Configuration (Updated)
| Source | Status | Priority | Cap |
|--------|--------|----------|-----|
| Kiwix | INDEXED/UNAVAILABLE | 1 | 6 |
| Jellyfin | NOT_INDEXED (env var check) | 2 | 6 |
| Community | INDEXED | 3 | 4 |
| Commands | PLANNED (STUB) | 4 | 4 |
| Files | INDEXED | 5 | 3 (0-2 dynamic) |

### Pinned Kiwix Sources (Boosted)
- Wikipedia (EN), Wikipedia Simple, WikiMed
- Wiktionary, iFixit, WikEM
- ArchWiki, OpenStreetMap Wiki, DevDocs, Wikivoyage

### Debug Bundle ZIP (Section 3) ✅
- **Download ZIP** - WIRED_LIVE
- **Redact sensitive values** toggle
- Bundle contents: BUILD_INFO, CONFIG_SNAPSHOT, SELF_TEST_RESULTS, NETWORK_LOG, ERROR_LOG, CONNECTION_STATE, README.txt

### Previous Phases (Still Active)
- Progressive Disclosure - WIRED_LIVE
- Help Guides - WIRED_LIVE
- Trust Badges - WIRED_LIVE
- Provenance Strip - WIRED_LIVE
- Self-Test Runner - WIRED_LIVE
- Auth Gating (Role + PIN) - WIRED_LIVE
- Profile System (localStorage) - WIRED_LIVE

## Search Quality Validation Results

### Validation Summary
| Category | Pass | Total |
|----------|------|-------|
| Knowledge | 8 | 8 |
| Media | 8 | 8 |
| Community | 3 | 4 |
| Files | 5 | 5 |
| Tools | 4 | 4 |
| Typos | 3 | 3 |
| Zero Results | 2 | 2 |
| **Total** | **33** | **34** |

**Pass Rate: 97%**

### Completed Validation Tasks
1. ✅ Created 25-query validation table
2. ✅ Implemented Kiwix article-level search API
3. ✅ Updated source caps (6/6/4/4/3)
4. ✅ Implemented "Kiwix Search Unavailable" badge
5. ✅ Captured autosuggest screenshots
6. ✅ Verified typo correction
7. ✅ Verified source status indicators

## User Decisions Implemented
- **Q4.1**: Source priority approved with dynamic caps
- **Q4.2**: Commands as STUB (not executable)
- **Q4.3**: Profile backend sync as PLANNED scaffold
- **Q4.4**: Pinned sources approved
- **OQ1**: Kiwix article-level search via kiwix-serve API
- **OQ2**: Jellyfin API key from environment variable
- **OQ3**: Automated test harness + manual spot-checks
- **OQ4**: Dynamic file suppression when high-signal sources exist

## Files Modified This Session

### SearchBar.jsx (Major Update)
- Added Kiwix API integration
- Async search with `performSearchAsync()`
- `checkKiwixAvailability()` on mount
- Dynamic source metadata based on status
- Article/Library result badges
- Loading indicator during async search

### New Validation Files
- `/app/baseline_export/SEARCH_QUALITY_VALIDATION.md` - 25-query test table
- `/app/baseline_export/SEARCH_QUALITY_REPORT.md` - Updated with API details

## Backlog / Future Tasks

### P1 - Wire Up Data Tiles (NEXT)
1. Apply ProvenanceStrip to EnvironmentTile
2. Apply TrustBadge to PowerStatusTile
3. Apply ProgressiveDisclosure to DeviceStatusTile
4. Wire remaining tiles

### P2 - Jellyfin Integration
1. Implement actual Jellyfin search when API key present
2. Add help panel for API key configuration
3. Test with live Jellyfin server

### P3 - Backend Integration
1. Connect to live Pi endpoints
2. Wire real data sources
3. Implement backend auth

### P4 - Deployment
1. Pi build (yarn build:pi)
2. Nginx reverse proxy
3. Production deployment

## Known Limitations
1. **Kiwix API unavailable in preview** - ready for Pi deployment
2. **Jellyfin not indexed** - requires JELLYFIN_API_KEY env var
3. **Commands are stubs** - execution not implemented
4. **Mock data** - real backend not wired

## Technical Notes

### Kiwix API Endpoints
```javascript
KIWIX_ENDPOINTS = {
  primary: 'http://talon.local:8090',
  fallback: 'http://127.0.0.1:8090'
};
```

### Environment Variables
- `REACT_APP_JELLYFIN_API_KEY` - Enables Jellyfin search
- `REACT_APP_KIWIX_BASE` - Override Kiwix base URL
