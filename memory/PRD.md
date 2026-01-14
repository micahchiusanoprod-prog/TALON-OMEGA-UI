# OMEGA Dashboard - Product Requirements Document

## Overview
OMEGA Dashboard is a sophisticated Raspberry Pi dashboard application providing system monitoring, community features, entertainment integration, and administrative tools.

## Current State (2025-01-14)

### All Phases Complete ✅

| Phase | Status | Description |
|-------|--------|-------------|
| P0 | ✅ | Search Quality Validation (97% pass rate) |
| P1.1 | ✅ | Provenance + Trust + Progressive Disclosure on Tiles |
| P1.2 | ✅ | Search Quality Hardening |
| P1.3 | ✅ | Search Health Panel |
| P2.0 | ✅ | Data Health Dashboard |
| P2.1 | ✅ | Regression Pass (no issues found) |

## P2.1 Regression Report

### Tests Executed
| Test | Status | Notes |
|------|--------|-------|
| Empty/Focus state | ✅ | Quick Access with status badges |
| First character typed | ✅ | Immediate results |
| Mid-word 'wiki' | ✅ | Library results with badges |
| Typo 'wikpedia' | ✅ | "Did you mean: wikipedia?" visible |
| Backspace correction | ✅ | Results update correctly |
| No results query | ✅ | Fallback search suggestion |
| Multi-source 'medical' | ✅ | Kiwix + Community + Files |
| Scoped chips | ✅ | All 6 scopes visible and clickable |
| File suppression | ✅ | 1 file when high-signal sources exist |
| Desktop Dark | ✅ | Full functionality |
| Desktop Light | ✅ | Full functionality |
| Mobile Dark | ✅ | 2-row scope chips, full functionality |

### Regression Notes
**No regressions found.** All search UI functionality intact after Admin Console changes.

## Data Health Dashboard Summary

### Sources Monitored (8 total)
| Source | Endpoint | Category |
|--------|----------|----------|
| OMEGA Core API | /api/cgi-bin/health | Core |
| Kiwix Knowledge | talon.local:8090 | Search |
| Jellyfin Media | localhost:8096 | Search |
| BME688 Sensors | /api/cgi-bin/sensors | Hardware |
| GPS Location | /api/cgi-bin/gps | Hardware |
| Mesh Network | /api/cgi-bin/mesh | Network |
| WiFi Hotspot | /api/cgi-bin/hotspot | Network |
| Backup Service | /api/cgi-bin/backup | System |

### Features
- Status badges (LIVE/UNAVAILABLE/NOT_CONFIGURED)
- Trust badges (VERIFIED/UNKNOWN)
- Provenance strips (endpoint, last check, latency)
- 24-hour uptime visualization
- "How to fix" guidance
- "Check All" and "Export JSON" actions

## Technical Stack
- **Frontend**: React + Tailwind CSS + Shadcn/UI
- **Backend**: FastAPI (MOCKED in preview)
- **Database**: MongoDB (MOCKED)

## Next Phase: P3 - Pi Deployment Prep

### Build Commands
```bash
# Production build
cd /app/frontend
yarn build:pi

# The build output goes to /app/frontend/build
```

### Nginx Routes (Planned)
| Route | Target | Description |
|-------|--------|-------------|
| / | localhost:3000 | Dashboard SPA |
| /api/* | localhost:8093 | OMEGA API |
| :8090 | kiwix-serve | Kiwix Knowledge |

### Degraded Behavior Verified
- ✅ Kiwix unavailable: "Kiwix Search Unavailable" badge + Retry
- ✅ Jellyfin not configured: "NOT_CONFIGURED" badge + setup guide
- ✅ Commands stubbed: "PLANNED" badge + explanation
- ✅ All tiles show "SIMULATED" when offline

## Known Limitations
1. Kiwix API unavailable in preview - ready for Pi
2. Jellyfin requires JELLYFIN_API_KEY env var
3. Commands are stubs
4. Mock uptime data (not persisted)

## File Artifacts
- `/app/baseline_export/SEARCH_QUALITY_VALIDATION.md`
- `/app/baseline_export/SEARCH_QUALITY_REPORT.md`
- `/app/memory/PRD.md` (this file)
