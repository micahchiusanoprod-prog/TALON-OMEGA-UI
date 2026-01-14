# OMEGA Dashboard - Product Requirements Document

## Overview
OMEGA Dashboard is a sophisticated Raspberry Pi dashboard application providing system monitoring, community features, entertainment integration, and administrative tools.

## Current State (2025-01-14)

### Phases Complete

#### Search Quality Validation Phase ✅
- **25+ test queries** validated with 97% pass rate
- **Kiwix API integration** implemented with graceful degradation
- **Source caps** updated per specification (6/6/4/4/3)
- **Autosuggest screenshots** captured across modes

#### P1.1 Wire Provenance + Trust + Progressive Disclosure ✅
- All data tiles now have ProvenanceStrip, TrustBadge, ProgressiveDisclosure
- Status guidance panels for SIMULATED/UNAVAILABLE/NOT_INDEXED/PLANNED states
- "How to fix" and "What to expect" guidance everywhere

#### P1.3 Search Health Panel ✅
- Admin Console now has "Search Health" tab
- Overview cards: Total Searches, Avg Latency, Error Rate, Last Hour
- Kiwix status with endpoint display, retry button, error guidance
- Jellyfin NOT_INDEXED with step-by-step configuration guide
- Commands PLANNED badge with explanation

## What's Been Implemented

### Master Global Search ✅
- **Autosuggest dropdown** with real-time results
- **Scope chips**: Global, Knowledge, Media, Community, Files, Tools
- **Source grouping** with labels and status badges
- **Trust badges** on all results (VERIFIED/DERIVED/ESTIMATED/UNKNOWN)
- **Freshness indicators** (LIVE/CACHED/STALE)
- **Dynamic caps** - files capped when high-value sources exist
- **Article vs Library** badges for Kiwix results
- **Kiwix Search Unavailable** badge with Retry button
- **"Did you mean"** typo correction
- **"Explain results"** panel with ranking rules

### Kiwix API Integration ✅
- Async search with article-level results
- Dual endpoint: `http://talon.local:8090` + `127.0.0.1:8090` fallback
- Availability check on component mount
- Graceful degradation to library-only

### Data Tiles with Provenance ✅
All tiles now include:
- **ProvenanceStrip**: Source, endpoint, freshness timestamp
- **TrustBadge**: VERIFIED/DERIVED/ESTIMATED/UNKNOWN with tooltip
- **ProgressiveDetails**: "Show Details" toggle for raw data
- **StatusGuidance**: Clear guidance for non-INDEXED states

Tiles updated:
- EnvironmentTile ✅
- PowerTile ✅
- DeviceInfoTile ✅
- HotspotTile ✅
- WeatherTile ✅
- SecurityTile ✅
- AllyCommunicationsHub ✅

### Admin Console Search Health Panel ✅
- **Overview metrics**: Total searches, avg latency, error rate, hourly count
- **Kiwix status**: Connection status, endpoints, retry button, error guidance
- **Jellyfin status**: NOT_INDEXED with configuration steps
- **Commands status**: PLANNED badge
- **Index statistics**: Kiwix Libraries, Community Members, Files, Commands counts
- **Recent errors**: List with timestamps and sources

## Technical Details

### Source Configuration
| Source | Status | Priority | Cap |
|--------|--------|----------|-----|
| Kiwix | INDEXED/UNAVAILABLE | 1 | 6 |
| Jellyfin | NOT_INDEXED (env var check) | 2 | 6 |
| Community | INDEXED | 3 | 4 |
| Commands | PLANNED (STUB) | 4 | 4 |
| Files | INDEXED | 5 | 3 (0-2 dynamic) |

### Environment Variables
- `REACT_APP_JELLYFIN_API_KEY` - Enables Jellyfin media search
- `REACT_APP_KIWIX_BASE` - Override Kiwix base URL (optional)

### Key Files Modified
- `/app/frontend/src/components/SearchBar.jsx` - Full async search
- `/app/frontend/src/components/ui/DataTileWrapper.jsx` - NEW: Provenance components
- `/app/frontend/src/components/AdminConsole.jsx` - Search Health panel
- All tile components (Environment, Power, Device, Hotspot, Weather, Security, Comms)

## Backlog / Future Tasks

### P1.2 - Search Quality Hardening (NEXT)
- Verify all autosuggest states across 4 modes
- Ensure "Explain results" is accessible and clear
- Capture scoped chips toggled screenshots
- Verify "Show more files" expansion

### P2 - Backend Integration
- Connect to live Pi endpoints
- Wire real sensor data
- Implement backend auth

### P3 - Jellyfin Integration
- Implement actual search when API key present
- Test with live Jellyfin server

### P4 - Deployment
- Pi build (yarn build:pi)
- Nginx reverse proxy
- Production deployment

## Known Limitations
1. **Kiwix API unavailable in preview** - ready for Pi deployment
2. **Jellyfin not indexed** - requires JELLYFIN_API_KEY env var
3. **Commands are stubs** - execution not implemented
4. **Mock data** - real backend not wired

## Validation Status
- P0 Search Quality: 97% pass rate (33/34 queries)
- P1.1 Data Tiles: All 7 tiles updated with provenance
- P1.3 Search Health: Complete with all required features
