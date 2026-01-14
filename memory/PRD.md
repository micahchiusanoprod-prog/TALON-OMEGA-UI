# OMEGA Dashboard - Product Requirements Document

## Overview
OMEGA Dashboard is a sophisticated Raspberry Pi dashboard application providing system monitoring, community features, entertainment integration, and administrative tools.

## Current State (2025-01-14)

### P0 Baseline Completed
- **61 screenshots** captured across 4 configurations
- **Desktop Dark**: 23 screenshots (full coverage)
- **Desktop Light**: 16 screenshots
- **Mobile Dark**: 11 screenshots  
- **Mobile Light**: 11 screenshots

### Key Components Implemented
1. **Home Dashboard** - System metrics, quick tools, navigation
2. **LOGS Modal** - Device logs, incidents, all nodes tabs
3. **Community Hub** - Overview, analytics, directory, comms tabs
4. **Help Center** - Searchable help content
5. **Admin Console** - Fleet, roster, broadcast, audit sections
6. **Entertainment Page** - Movies, games, music, photos, vault, file drop
7. **Quick Tools** - Calculator, translator, SOS, currency, dictionary, notes

### Data-testid Coverage Added
- `admin-section-tabs`, `admin-section-fleet`, `admin-section-roster`, `admin-section-broadcast`, `admin-section-audit`
- `overflow-menu-dropdown`, `overflow-help-center`, `overflow-admin-console`, `overflow-metrics`

### Files Delivered
- `/app/frontend/public/baseline_visual_export.zip` (1MB)
- Contains: Screenshots + COVERAGE_REPORT.json + INTERACTION_GRAPH.json + FEATURE_MATRIX.json + CLICK_GUIDE.md + MANIFEST.md

## Feature Status Matrix

| Feature | Status |
|---------|--------|
| Theme System | WIRED_LIVE |
| Internationalization | WIRED_LIVE |
| Dashboard | WIRED_MOCK |
| LOGS Analytics | WIRED_MOCK |
| Community Hub | WIRED_MOCK |
| Help Center | STATIC |
| Admin Console | WIRED_MOCK |
| Entertainment | PLANNED |
| Authentication | PLANNED - NOT IMPLEMENTED |

## Upcoming Tasks (Post-Baseline Approval)

### P1 - Universal Navigation & Help
- Progressive disclosure patterns (Summary + "Show Details")
- Help guides and tooltips on every element
- Data provenance banners
- Trust badges (VERIFIED/DERIVED/ESTIMATED/UNKNOWN)
- Glossary page

### P1 - Self-Test & Debug
- Self-test runner for service reachability
- Debug bundle copy/download feature

### P2 - Backend Integration
- Connect to live Pi endpoints via /api proxy
- Wire real data sources

### P2 - Deployment
- Pi build and deployment
- Nginx reverse proxy configuration

## Open Questions (User Decisions Required)
1. **Auth Gating**: PIN + role-based for Admin Console
2. **Profile Persistence**: localStorage default, backend-ready
3. **Evidence Source**: UNKNOWN - implement placeholder pattern
4. **Help Text**: Hybrid static + metadata badges

## Technical Architecture
- **Frontend**: React + Tailwind CSS + shadcn/ui
- **Routing**: react-router-dom (HashRouter)
- **Backend Strategy**: Same-origin /api proxy via Nginx to talon.local:8093
- **Theme**: localStorage persistence as 'omega-theme'
