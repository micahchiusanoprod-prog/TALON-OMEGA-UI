# OMEGA Dashboard - Product Requirements Document

## Overview
OMEGA Dashboard is a sophisticated Raspberry Pi dashboard application providing system monitoring, community features, entertainment integration, and administrative tools.

## Current State (2025-01-14)

### Phase Complete: Next-Phase UI Improvements v3.0
- **120 screenshots** captured with full parity
- All new UI components implemented and verified

## What's Been Implemented

### Step 0.5 - Baseline Parity (Complete)
- 110 screenshots with full parity across all 4 folders
- All Quick Tools, Entertainment tabs, Help Center, Community Hub tabs captured

### Next-Phase UI Improvements (Complete)

#### 1. Progressive Disclosure
- `ProgressivePanel` component with Summary + Details
- "Show Details" expansion pattern
- Help icons on every major tile

#### 2. Help Guides Everywhere
- `HelpTooltip` for acronyms/terms (12+ GLOSSARY entries)
- `PanelHelpIcon` with What/States/Actions format
- Help Center enhanced with diagnostics section

#### 3. Trust & Provenance
- `TrustBadge` types: VERIFIED, DERIVED, ESTIMATED, UNKNOWN
- `ProvenanceStrip` with Source, Last Updated, Freshness
- Freshness indicators: LIVE, CACHED, STALE, UNKNOWN

#### 4. Self-Test Runner
- Entry points: System Status Panel, Help Center
- Tests: Frontend, LocalStorage, API endpoints, GPS
- Results saved to localStorage
- Toast notifications for completion

#### 5. Debug Bundle
- "Copy JSON Bundle" - WIRED_LIVE
- ZIP Download - PLANNED
- Contents: BUILD_INFO, CONFIG_SNAPSHOT, self-test, network logs, errors

#### 6. Auth Gating (Role + PIN)
- Roles: guest, member, admin
- PIN unlock with 15-minute timeout
- `PinEntryModal`, `AdminGate` components
- Backend auth: PLANNED

#### 7. Profile System
- localStorage-backed persistence
- Fields: displayName, role
- Backend sync: PLANNED

#### 8. Evidence System
- Client Evidence (network log): WIRED_LIVE
- System Evidence (backend logs): PLANNED
- `ViewEvidencePanel` with two tabs

## New Files Created

### Contexts
- `/app/frontend/src/contexts/AuthContext.jsx` - Role + PIN auth system
- `/app/frontend/src/contexts/EvidenceContext.jsx` - Evidence & self-test management

### UI Components
- `/app/frontend/src/components/ui/ProgressiveDisclosure.jsx`
  - HelpTooltip, TrustBadge, ProvenanceStrip, PanelHelpIcon, ProgressivePanel, ViewEvidencePanel
- `/app/frontend/src/components/ui/SelfTestDebug.jsx`
  - SelfTestRunner, DebugBundlePanel, PinEntryModal, AdminGate

### Modified Files
- `/app/frontend/src/App.js` - Added AuthProvider, EvidenceProvider
- `/app/frontend/src/components/SystemStatusPanel.jsx` - Enhanced debug
- `/app/frontend/src/components/HelpCenter.jsx` - Added diagnostics section
- `/app/frontend/src/components/AdminConsole.jsx` - Added data-testid attributes
- `/app/frontend/src/components/Header.jsx` - Added overflow menu testids

## Feature Status Matrix

| Feature | Status | Notes |
|---------|--------|-------|
| Progressive Disclosure | WIRED_LIVE | Summary + Details pattern |
| Help Guides | WIRED_LIVE | Tooltips, icons, glossary |
| Trust Badges | WIRED_LIVE | 4 badge types |
| Provenance Strip | WIRED_LIVE | Source + freshness |
| Self-Test Runner | WIRED_LIVE | 7 subsystem checks |
| Debug Bundle (JSON) | WIRED_LIVE | Copy to clipboard |
| Debug Bundle (ZIP) | PLANNED | Not yet implemented |
| Auth Gating | WIRED_LIVE | Role + PIN |
| Profile System | WIRED_LIVE | localStorage |
| Backend Auth | PLANNED | Not implemented |
| System Evidence | PLANNED | Requires backend |
| Theme System | WIRED_LIVE | Dark/light |
| i18n | WIRED_LIVE | 8 languages |

## Backlog / Future Tasks

### P1 - Next Priorities
1. Wire progressive disclosure to actual data tiles
2. Add provenance strips to all data panels
3. Implement "View Evidence" links where data is derived

### P2 - Backend Integration
1. Connect to live Pi endpoints via /api proxy
2. Wire real data sources
3. Implement backend auth

### P3 - Deployment
1. Pi build (`yarn build:pi`)
2. Nginx reverse proxy configuration
3. Production deployment

## User Decisions (Implemented)
- Q1: Admin Gating = PIN + Role (both required)
- Q2: Profile Persistence = localStorage only
- Q3: Evidence Source = Hybrid (Client now, System PLANNED)
- Q4: Help Text = Hybrid (static + metadata badges)

## Baseline Artifacts
- **Latest ZIP**: `/baseline_visual_export.zip` (120 screenshots, 1.9MB)
- **Coverage**: 100%
- **Parity**: Full across all 4 folders
