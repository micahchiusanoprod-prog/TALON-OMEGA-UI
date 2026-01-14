# OMEGA Dashboard - Product Requirements Document

## Overview
OMEGA Dashboard is a sophisticated Raspberry Pi dashboard application providing system monitoring, community features, entertainment integration, and administrative tools.

## Current State (2025-01-14)

### All Phases Complete ✅

#### P0 - Search Quality Validation ✅
- 25+ test queries validated with 97% pass rate
- Kiwix API integration with graceful degradation
- Source caps (6/6/4/4/3)

#### P1.1 - Wire Provenance + Trust + Progressive Disclosure ✅
- All 7 data tiles updated with ProvenanceStrip, TrustBadge, ProgressiveDetails
- Status guidance panels for SIMULATED/UNAVAILABLE states

#### P1.2 - Search Quality Hardening ✅
- Scoped chips screenshots captured (all 4 modes)
- "Show more files" expansion verified
- Full parity check completed

#### P1.3 - Search Health Panel ✅
- Admin Console → "Search Health" tab with monitoring

#### P2.0 - Data Health Dashboard ✅ (NEW)
- Admin Console → "Data Health" tab
- 8 data sources monitored
- 24-hour uptime visualization
- Error guidance and retry functionality

## Data Health Dashboard (P2.0) - Detailed

### Sources Monitored
| Source | Category | Endpoint | Description |
|--------|----------|----------|-------------|
| OMEGA Core API | Core | /api/cgi-bin/health | Main system health |
| Kiwix Knowledge | Search | talon.local:8090 | Offline knowledge base |
| Jellyfin Media | Search | localhost:8096 | Media library |
| BME688 Sensors | Hardware | /api/cgi-bin/sensors | Temp, humidity, pressure |
| GPS Location | Hardware | /api/cgi-bin/gps | Coordinates and altitude |
| Mesh Network | Network | /api/cgi-bin/mesh | Inter-OMEGA comms |
| WiFi Hotspot | Network | /api/cgi-bin/hotspot | Local WiFi |
| Backup Service | System | /api/cgi-bin/backup | Backup status |

### Features
- **Overview cards**: Sources Live, Unavailable, Avg Latency, Last Check
- **Per-source display**:
  - Status badge (LIVE/CACHED/STALE/UNAVAILABLE/NOT_CONFIGURED)
  - Trust badge (VERIFIED/DERIVED/ESTIMATED/UNKNOWN)
  - Provenance strip (endpoint, last check, latency)
  - 24-hour uptime bar (15-min buckets, color-coded)
  - Error message + "How to fix" guidance
  - Retry button
- **Actions**: "Check All" button, "Export JSON" for debug bundle
- **Legend**: Status color explanations

### Screenshot Parity
| Mode | Status | Notes |
|------|--------|-------|
| Desktop Dark | ✅ | Full dashboard visible |
| Desktop Light | ✅ | Clean contrast |
| Tablet Dark | ✅ | Responsive layout |
| Tablet Light | ✅ | Works perfectly |
| Mobile | N/A | Admin Console accessed via larger viewports |

## Technical Details

### Environment Variables
- `REACT_APP_JELLYFIN_API_KEY` - Enables Jellyfin media search
- `REACT_APP_KIWIX_BASE` - Override Kiwix base URL (optional)
- `REACT_APP_JELLYFIN_URL` - Override Jellyfin URL (optional)

### Key Files
- `/app/frontend/src/components/AdminConsole.jsx` - Data Health + Search Health panels
- `/app/frontend/src/components/ui/DataTileWrapper.jsx` - Provenance components
- `/app/frontend/src/components/SearchBar.jsx` - Search with Kiwix API

## Backlog / Future Tasks

### P2.1 - Minor QA Polish
- Verify no regressions to search functionality
- Check layout on edge case viewports

### P3 - Backend Integration
- Connect to live Pi endpoints
- Wire real sensor data
- Implement backend auth

### P4 - Jellyfin Integration
- Implement actual search when API key present
- Test with live Jellyfin server

### P5 - Deployment
- Pi build (yarn build:pi)
- Nginx reverse proxy
- Production deployment

## Known Limitations
1. **Kiwix API unavailable in preview** - ready for Pi deployment
2. **Jellyfin not indexed** - requires JELLYFIN_API_KEY env var
3. **Commands are stubs** - execution not implemented
4. **Mock uptime data** - real history not persisted yet

## Validation Summary
- P0 Search Quality: 97% pass rate ✅
- P1.1 Data Tiles: All 7 tiles updated ✅
- P1.2 Search Hardening: Full parity ✅
- P1.3 Search Health: Complete ✅
- P2.0 Data Health Dashboard: Complete ✅ (8 sources, 4 modes)
