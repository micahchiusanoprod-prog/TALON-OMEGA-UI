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
- `/app/baseline_export/SEARCH_QUALITY_VALIDATION.md` - Test queries
- `/app/baseline_export/SEARCH_QUALITY_REPORT.md` - Search implementation
- `/app/memory/PRD.md` - This document

## Next Steps (Future)
- P4: Backend integration with live Pi endpoints
- P5: Jellyfin search (when API key provided)
- P6: Production deployment to Pi hardware
