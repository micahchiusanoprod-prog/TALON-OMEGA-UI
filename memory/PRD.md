# OMEGA Dashboard - Product Requirements Document

## Overview
OMEGA Dashboard is a sophisticated Raspberry Pi dashboard application providing system monitoring, community features, entertainment integration, and administrative tools.

## Current State (2026-01-14)

### All Phases Complete ✅

| Phase | Status | Description |
|-------|--------|-------------|
| P0 | ✅ | Search Quality Validation (97% pass rate) |
| P1.1 | ✅ | Provenance + Trust + Progressive Disclosure on Tiles |
| P1.2 | ✅ | Search Quality Hardening |
| P1.3 | ✅ | Search Health Panel |
| P2.0 | ✅ | Data Health Dashboard |
| P2.1 | ✅ | Regression Pass (no issues found) |
| P3 | ✅ | Pi Deployment Prep |
| P3-Evidence | ✅ | 4-Mode Screenshot Evidence (16 screenshots) |

## P3 - Pi Deployment Prep Summary

### Build Output
- **Release**: `2026-01-14_060220`
- **Location**: `/app/frontend/deploy/releases/2026-01-14_060220/`
- **Bundle Size**: ~418KB (gzipped main.js) + 23KB CSS
- **Build Command**: `yarn build:pi`

### Release Package Contents
| File | Purpose |
|------|---------|
| `www/` | Static dashboard files |
| `config.js` | Runtime configuration (API/Kiwix URLs) |
| `nginx.conf` | Production Nginx config |
| `install.sh` | One-command installer |
| `DEPLOYMENT_RUNBOOK.md` | Full deployment guide |
| `SELFTEST.md` | Verification checklist |
| `README.md` | Quick start |

### Nginx Routes
| Route | Target | Description |
|-------|--------|-------------|
| `/` | Static files | Dashboard SPA |
| `/api/*` | `127.0.0.1:8093` | OMEGA API proxy |
| `/cgi-bin/*` | `127.0.0.1:8093/cgi-bin/` | Legacy CGI |
| `/kiwix/*` | `127.0.0.1:8090` | Kiwix proxy |
| `/health` | Direct | Health endpoint |

### LAN Access
- Dashboard: `http://talon.local/`
- API: `http://talon.local/api/*`
- Kiwix: `http://talon.local/kiwix/*`

### Degraded Behavior Verification ✅

| Flow | All Up | Kiwix Down | Jellyfin Missing | API Down |
|------|--------|------------|------------------|----------|
| Home loads | ✅ | ✅ | ✅ | ✅ |
| Search works | ✅ | ✅ (library only + badge) | ✅ (NOT_INDEXED + guide) | ⚠️ (cached) |
| Admin→Data Health | ✅ | ✅ (UNAVAILABLE + how to fix) | ✅ (NOT_CONFIGURED + guide) | ⚠️ |
| Admin→Search Health | ✅ | ✅ (UNAVAILABLE + retry) | ✅ (NOT_CONFIGURED + guide) | ⚠️ |

### Deployment Commands

```bash
# Build
cd /app/frontend && yarn build:pi

# Transfer to Pi
scp -r deploy/releases/2026-01-14_060220 pi@talon.local:~/omega-release/

# Install on Pi
ssh pi@talon.local
cd ~/omega-release && ./install.sh

# Verify
curl http://talon.local/health
```

### Rollback Command
```bash
sudo rm -rf /var/www/omega-dashboard
sudo cp -r /var/www/omega-dashboard.backup.TIMESTAMP /var/www/omega-dashboard
sudo systemctl reload nginx
```

## Technical Stack
- **Frontend**: React + Tailwind CSS + Shadcn/UI
- **Backend**: FastAPI (ready for integration)
- **Build**: CRA + CRACO
- **Deployment**: Nginx + static files

## File Artifacts
- `/app/frontend/deploy/releases/2026-01-14_060220/` - Release package
- `/app/frontend/deploy/releases/2026-01-14_060220/P3_evidence/` - 4-mode screenshot evidence (16 files)
- `/app/baseline_export/SEARCH_QUALITY_VALIDATION.md` - Test queries
- `/app/baseline_export/SEARCH_QUALITY_REPORT.md` - Search implementation
- `/app/baseline_export/OMEGA_UI_FORENSIC_AUDIT.md` - Complete UI audit (NEW)
- `/app/memory/PRD.md` - This document

## P3 Screenshot Evidence Summary

**Total:** 16 screenshots (4 modes × 4 views)
**Location:** `/app/frontend/deploy/releases/2026-01-14_060220/P3_evidence/`

| Mode | Global Search | Data Health | Search Health | Degraded State |
|------|---------------|-------------|---------------|----------------|
| Desktop Dark | ✅ | ✅ | ✅ | ✅ |
| Desktop Light | ✅ | ✅ | ✅ | ✅ |
| Mobile Dark | ✅ | ✅ | ✅ | ✅ |
| Mobile Light | ✅ | ✅ | ✅ | ✅ |

**Degraded State:** Consistently using Option A (Kiwix down → "Kiwix Search Unavailable" banner)
**Search UX:** No changes during P3 - autosuggest typing-state screenshots NOT required

## Pi Deployment Package (Updated: 2026-01-28)

**Created:** 2026-01-21 (Updated: 2026-01-28)
**Location:** `/app/frontend/deploy/pi-build/OMEGA_PI_BUILD.zip`
**Size:** ~4.6 MB

### Package Contents
- `build/` - Production React build (zero external dependencies)
- `nginx.conf` - nginx reverse proxy configuration
- `README_PI_DEPLOY.md` - Deployment guide with copy/paste commands
- `INTEGRATION_CONTRACT.md` - Complete API specification
- `UI_ELEMENT_MANIFEST.json` - Full UI element inventory

### Key Features
- **Zero external CDN dependencies** - All CSS/JS bundled
- **Relative URLs** - `/api/*` and `/kiwix/*` via nginx proxy
- **WAN-independent health checks** - LOCAL_OK / LOCAL_DEGRADED / LOCAL_DOWN
- **Dead end elimination** - All unavailable states have actionable next steps
- **Quick Access Panel** - Minimal design with 1-word labels (Wiki, Status, WiFi, Comms)

### Latest Updates (2026-01-28)
1. **Header i18n Fix**: Fixed layout breaking when switching to Spanish
   - Increased compact mode threshold to 1200px
   - Added `whitespace-nowrap` and `flex-shrink-0` to nav buttons
   - Improved responsive breakpoints
2. **Quick Access Panel**: Made more minimal per user request
   - 1-word labels: Wiki, Status, WiFi, Comms
   - Smaller icons (w-5 h-5)
   - Removed sublabels and arrow indicators
   - Added aria-label for accessibility
3. **Emergent Badge**: Adjusted positioning for mobile views
4. **Quick Tools Bar**: Improved scroll handling and overflow indicators

## Next Steps (Future)
- P3.4: On-device Pi acceptance testing
- P3.5: Runbook hardening (copy/paste commands)
- P4: Backend integration with live Pi endpoints
- P5: Jellyfin search (when API key provided)
- P6: Production deployment to Pi hardware
