# OMEGA Dashboard - P0/P1/P2 Backlog
## Prioritized Feature List with Owners & Acceptance Tests

---

## P0 - Critical Path (Must Ship)

### P0-001: Live Endpoint Wiring - Health & Metrics
**Owner:** Core Team  
**Status:** 🔴 Not Started  
**Endpoints:** `/cgi-bin/health.py`, `/cgi-bin/metrics.py`

**Acceptance Tests:**
- [ ] Health endpoint called on app load
- [ ] Connection chip shows CONNECTED when health returns 200
- [ ] Connection chip shows NOT_CONNECTED after 3s timeout
- [ ] Device Info Tile displays live CPU/RAM/Disk from metrics
- [ ] LOGS page shows live metrics chart data
- [ ] Retry button triggers immediate re-fetch

---

### P0-002: Live Endpoint Wiring - Sensors
**Owner:** Core Team  
**Status:** 🔴 Not Started  
**Endpoint:** `/cgi-bin/sensors.py`

**Acceptance Tests:**
- [ ] Environment Tile displays live temp/humidity/pressure
- [ ] Shows "Sensor Unavailable" on timeout
- [ ] Updates every 30 seconds when connected
- [ ] Historical data populates chart if available

---

### P0-003: Live Endpoint Wiring - Security Endpoints
**Owner:** Core Team  
**Status:** 🔴 Not Started  
**Endpoints:** `/cgi-bin/keys.py`, `/cgi-bin/keysync.py`

**Acceptance Tests:**
- [ ] Security Tile shows key version from keys.py
- [ ] Security Tile shows last rotation time
- [ ] Security Tile shows sync status from keysync.py
- [ ] DEGRADED state if one endpoint fails, other succeeds

---

### P0-004: Live Endpoint Wiring - Admin Endpoints
**Owner:** Core Team  
**Status:** 🔴 Not Started  
**Endpoints:** `/cgi-bin/backup.py`, `/cgi-bin/dm.py`

**Acceptance Tests:**
- [ ] Admin Console lists backups from backup.py
- [ ] "Trigger Backup" button calls POST to backup.py
- [ ] Dead man switch status visible in Admin Console
- [ ] Admin-only: hidden for guest/member roles

---

### P0-005: Connection State Management
**Owner:** Core Team  
**Status:** 🟡 Partial (mock exists)

**Acceptance Tests:**
- [ ] CONNECTED: All critical endpoints (health, metrics) responding
- [ ] DEGRADED: Some endpoints failing, shows which
- [ ] NOT_CONNECTED: No endpoints responding
- [ ] EMPTY_STATE: Connected but empty dataset
- [ ] 3-second timeout before state change
- [ ] 30-second auto-retry when degraded
- [ ] Per-panel retry buttons functional
- [ ] Global retry in System Status functional

---

### P0-006: System Status Panel - Live Data
**Owner:** Core Team  
**Status:** 🟡 Partial (UI exists)

**Acceptance Tests:**
- [ ] BUILD INFO shows actual build version/timestamp
- [ ] CONNECTION STATUS shows live ping latency
- [ ] CONFIGURATION shows runtime config values
- [ ] ENDPOINT STATUS shows real-time status per endpoint
- [ ] Run Self Test actually pings all endpoints
- [ ] Copy Debug Info includes real endpoint results

---

### P0-007: Audit Panel - Accurate Status
**Owner:** Core Team  
**Status:** 🟡 Partial (UI exists)

**Acceptance Tests:**
- [ ] IMPLEMENTED = UI + working interactions + (wired OR validated mock)
- [ ] MOCKED = UI exists with mock data + MOCK badge
- [ ] MISSING = No UI route/component
- [ ] Endpoint Coverage shows actual test results
- [ ] Copy Report generates valid JSON per schema
- [ ] Feature counts match reality

---

## P1 - High Priority (Should Ship)

### P1-001: Entertainment Page - Top Level
**Owner:** Entertainment Team  
**Status:** 🔴 Not Started

**Acceptance Tests:**
- [ ] "Entertainment" nav item in header
- [ ] Route: `/#/entertainment`
- [ ] Sub-tabs: Movies, TV, Music, Games
- [ ] Responsive layout (mobile/desktop)
- [ ] Dark/Light theme support

---

### P1-002: Movies/TV Carousels
**Owner:** Entertainment Team  
**Status:** 🔴 Not Started

**Acceptance Tests:**
- [ ] "Continue Watching" carousel with progress bars
- [ ] "Newly Added" carousel (sorted by date)
- [ ] "Unwatched" carousel
- [ ] Genre-based carousels (Action, Comedy, etc.)
- [ ] Poster images from Jellyfin API
- [ ] Click poster → opens Jellyfin fullscreen
- [ ] Horizontal scroll with arrow buttons
- [ ] Touch swipe on mobile

---

### P1-003: Movie Night Mode
**Owner:** Entertainment Team  
**Status:** 🔴 Not Started

**Acceptance Tests:**
- [ ] "Movie Night" button in Entertainment header
- [ ] Clicking triggers hotspot enable (if available)
- [ ] Displays QR code for hotspot connection
- [ ] Shows Jellyfin access URL
- [ ] Deep link to specific movie if selected
- [ ] Works without backend (shows instructions)

---

### P1-004: Music Tab - Full Player
**Owner:** Entertainment Team  
**Status:** 🟡 Partial (basic player exists)

**Acceptance Tests:**
- [ ] Play/Pause/Skip/Previous controls
- [ ] Progress bar with seek
- [ ] Volume control
- [ ] Playlist view with queue management
- [ ] Lyrics display (synced if available)
- [ ] Album art display
- [ ] Shuffle/Repeat toggles
- [ ] Mini player when navigating away

---

### P1-005: Global Search Federation
**Owner:** Core Team  
**Status:** 🔴 Not Started

**Acceptance Tests:**
- [ ] Single search input in header
- [ ] Categories: People, Files, Knowledge, Commands
- [ ] People: searches community roster
- [ ] Files: searches local documents (if vault implemented)
- [ ] Knowledge: searches Kiwix content
- [ ] Commands: shows available actions
- [ ] Results grouped by category
- [ ] Keyboard shortcut (⌘/ or Ctrl+/)
- [ ] Recent searches stored locally

---

### P1-006: OMEGA Wrapper - Kiwix
**Owner:** Integration Team  
**Status:** 🔴 Not Started

**Acceptance Tests:**
- [ ] Opens Kiwix in embedded iframe
- [ ] OMEGA header persists above
- [ ] Navigation back to dashboard works
- [ ] Search results link to Kiwix content
- [ ] Fallback: new tab if iframe blocked
- [ ] Loading state while iframe loads

---

### P1-007: OMEGA Wrapper - Jellyfin
**Owner:** Integration Team  
**Status:** 🔴 Not Started

**Acceptance Tests:**
- [ ] Opens Jellyfin fullscreen
- [ ] "Back to OMEGA" overlay button (fixed position)
- [ ] Click overlay → returns to dashboard
- [ ] Deep links to specific content work
- [ ] Mobile: back gesture works

---

### P1-008: Services Launcher Page
**Owner:** Core Team  
**Status:** 🔴 Not Started

**Acceptance Tests:**
- [ ] Route: `/#/services`
- [ ] Grid of service cards
- [ ] Cards: Kiwix, Jellyfin, (future extensible)
- [ ] Each card shows: icon, name, status, description
- [ ] Click card → opens service wrapper
- [ ] Status badge: Online/Offline

---

### P1-009: Team Indicators on Profiles
**Owner:** Community Team  
**Status:** 🔴 Not Started

**Acceptance Tests:**
- [ ] Profile drawer shows team membership badges
- [ ] Badges link to team detail
- [ ] Profile cards show team indicators
- [ ] Multiple teams supported

---

### P1-010: Activity Tracker
**Owner:** Community Team  
**Status:** 🔴 Not Started

**Acceptance Tests:**
- [ ] Activity log section in profile drawer
- [ ] Categories: Supply Run, Perimeter Check, etc.
- [ ] Timestamp for each activity
- [ ] Notes field optional
- [ ] Admin can view any user's activities

---

## P2 - Nice to Have (Scaffold Now)

### P2-001: Games Tab Scaffold
**Owner:** Entertainment Team  
**Status:** 🔴 Not Started

**Acceptance Tests:**
- [ ] Tab visible in Entertainment
- [ ] Grid layout for game cards
- [ ] Placeholder cards with "Coming Soon"
- [ ] At least 6 placeholder slots
- [ ] Category filters (Puzzle, Action, etc.) non-functional

---

### P2-002: Multiplayer Hub Scaffold
**Owner:** Entertainment Team  
**Status:** 🔴 Not Started

**Acceptance Tests:**
- [ ] Route: `/#/multiplayer`
- [ ] Tabs: Trivia, Tournaments, Party Mode
- [ ] Mock tournament list
- [ ] "Create Game" button (shows "Coming Soon")
- [ ] Leaderboard placeholder

---

### P2-003: Creator Tools Scaffold
**Owner:** Entertainment Team  
**Status:** 🔴 Not Started

**Acceptance Tests:**
- [ ] Route: `/#/create`
- [ ] Tool selector: Beat Maker, Drawing, Recording
- [ ] Each tool shows placeholder canvas
- [ ] "Save" button (shows "Coming Soon")
- [ ] Basic UI for each tool type

---

### P2-004: Debate Arena Scaffold
**Owner:** Entertainment Team  
**Status:** 🔴 Not Started

**Acceptance Tests:**
- [ ] Route: `/#/debate`
- [ ] Topic generator button (returns mock topic)
- [ ] Timer UI (non-functional countdown)
- [ ] Vote buttons (show animation but don't persist)
- [ ] Score display

---

### P2-005: Photos Hub Scaffold
**Owner:** Media Team  
**Status:** 🔴 Not Started

**Acceptance Tests:**
- [ ] Route: `/#/photos`
- [ ] Gallery grid view
- [ ] Upload button (shows "Coming Soon")
- [ ] Share modal (non-functional)
- [ ] Album/folder organization UI

---

### P2-006: Personal Vault Scaffold
**Owner:** Security Team  
**Status:** 🔴 Not Started

**Acceptance Tests:**
- [ ] Route: `/#/vault`
- [ ] Folder tree structure
- [ ] Lock icon on folders
- [ ] PIN entry modal (mock validation)
- [ ] "Admin Access" indicator
- [ ] File list view

---

### P2-007: New User Setup Wizard Scaffold
**Owner:** Core Team  
**Status:** 🔴 Not Started

**Acceptance Tests:**
- [ ] Route: `/#/setup`
- [ ] Multi-step wizard UI
- [ ] Steps: Welcome, Primary User, Add Household, Relationships
- [ ] Form fields present (no persistence)
- [ ] Progress indicator
- [ ] Skip button

---

### P2-008: In-UI Release Notes
**Owner:** Core Team  
**Status:** 🔴 Not Started

**Acceptance Tests:**
- [ ] Accessible from System Status panel
- [ ] Shows version history
- [ ] Each version: date, changes, known issues
- [ ] Current version highlighted
- [ ] Markdown rendering

---

## Summary

| Priority | Count | Status |
|----------|-------|--------|
| P0 | 7 | Critical - blocks release |
| P1 | 10 | High - should ship |
| P2 | 8 | Scaffold - UI shell only |

**Total Items:** 25

---

## Owner Legend

| Owner | Responsibility |
|-------|----------------|
| Core Team | Infrastructure, wiring, system components |
| Entertainment Team | Entertainment page, media players |
| Integration Team | External service wrappers |
| Community Team | Profiles, teams, activities |
| Media Team | Photos, camera, gallery |
| Security Team | Vault, encryption, access control |
