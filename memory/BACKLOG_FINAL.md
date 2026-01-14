# OMEGA Dashboard v2.0 - Final Backlog
## All Items Confirmed - Ready for Implementation

---

## Summary

| Priority | Count | Status |
|----------|-------|--------|
| P0 | 9 | 🔴 Critical - Blocks Release |
| P1 | 10 | 🟡 High - Should Ship |
| P2 | 7 | 🔵 Scaffolds Only |

**Total: 26 Items**

---

## P0 - Critical Path (Live Wiring + State Handling)

### P0-001: Wire health.py
**Status:** 🔴 Not Started  
**Consumer:** System Status Panel, Header Connection Chip  
**Endpoint:** `http://talon.local:8093/cgi-bin/health.py`  
**Response:** `{status:"ok", uptime:..., version:...}`

**Acceptance:**
- [ ] Header chip shows green "Connected" when 200 OK
- [ ] Header chip shows red "Not Connected" after 3s timeout
- [ ] System Status shows last ping time and latency
- [ ] Polls every 30 seconds

---

### P0-002: Wire metrics.py
**Status:** 🔴 Not Started  
**Consumer:** Device Info Tile, LOGS Analytics  
**Endpoint:** `http://talon.local:8093/cgi-bin/metrics.py`  
**Response:** `{cpu:..., mem:..., disk:..., backup:..., mesh:...}`

**Acceptance:**
- [ ] Device Info Tile shows live CPU/RAM/Disk percentages
- [ ] LOGS Analytics charts populated with real data
- [ ] Polls every 30 seconds
- [ ] Shows loading skeleton during fetch

---

### P0-003: Wire backup.py
**Status:** 🔴 Not Started  
**Consumer:** Admin Console  
**Endpoint:** `http://talon.local:8093/cgi-bin/backup.py`  
**Response:** `{list:[], count:0}` (currently empty)

**Acceptance:**
- [ ] Admin Console shows backup list (or empty state)
- [ ] Empty state shows "No backups yet" message
- [ ] "Trigger Backup" button calls POST (if supported)
- [ ] Fetches on panel open

---

### P0-004: Wire keys.py
**Status:** 🔴 Not Started  
**Consumer:** Security Tile  
**Endpoint:** `http://talon.local:8093/cgi-bin/keys.py`  
**Response:** `{ok:true, id:"anon", has:false}`

**Acceptance:**
- [ ] Security Tile shows key ID
- [ ] Shows "No keys configured" if has:false
- [ ] Polls every 60 seconds

---

### P0-005: Wire keysync.py
**Status:** 🔴 Not Started  
**Consumer:** Security Tile  
**Endpoint:** `http://talon.local:8093/cgi-bin/keysync.py`  
**Response:** `{pending:0, last_export:"never", status:"ok"}`

**Acceptance:**
- [ ] Security Tile shows sync status
- [ ] Shows pending count
- [ ] Shows last export time
- [ ] Polls every 60 seconds

---

### P0-006: Forbidden State for dm.py
**Status:** 🔴 Not Started  
**Consumer:** Admin Console (Dead Man Switch section)  
**Endpoint:** `http://talon.local:8093/cgi-bin/dm.py`  
**Response:** `Status: 403` + `{ok:false, err:"forbidden"}`

**Acceptance:**
- [ ] Shows "Admin Access Required" badge
- [ ] No action button (locked state)
- [ ] Does not show error toast (expected state)
- [ ] Gray/red lock icon indicator

---

### P0-007: Degraded State for sensors.py
**Status:** 🔴 Not Started  
**Consumer:** Environment Tile  
**Endpoint:** `http://talon.local:8093/cgi-bin/sensors.py`  
**Response:** `{status:"error"}` (I2C bus /dev/i2c-3 not found)

**Acceptance:**
- [ ] Shows "I2C bus configuration required" message
- [ ] Shows "Sensor bus not detected" description
- [ ] Shows inline troubleshooting steps:
  - Verify BME680 sensor connection
  - Check: `ls /dev/i2c-*`
  - Current detected: `/dev/i2c-90`
  - Scan: `i2cdetect -y 90`
  - Backend expects `/dev/i2c-3`
- [ ] Shows "Check Again" retry button
- [ ] Amber warning indicator

---

### P0-008: Not Configured State for GPS
**Status:** 🔴 Not Started  
**Consumer:** GPS/Map Section  
**Endpoint:** Unknown (not confirmed)

**Acceptance:**
- [ ] Shows "GPS Not Configured" message
- [ ] Shows setup instructions placeholder
- [ ] Gray info icon indicator
- [ ] No retry button (not a transient error)

---

### P0-009: Connection Timeout Handling
**Status:** 🔴 Not Started  
**Consumer:** All endpoint consumers

**Acceptance:**
- [ ] 3-second timeout before state change
- [ ] Shows "Connecting..." during fetch
- [ ] Transitions to Degraded if some endpoints fail
- [ ] Transitions to Not Connected if all fail
- [ ] 30-second auto-retry when degraded
- [ ] Per-panel retry buttons functional
- [ ] Global retry in System Status functional

---

## P1 - High Priority (Entertainment + Enhancements)

### P1-001: Entertainment Navigation
**Status:** 🔴 Not Started  
**Depends On:** Must not regress header layout

**Acceptance:**
- [ ] "Entertainment" nav item in header (after Help Center)
- [ ] OR keep tile-only if header spacing issues
- [ ] Route: `/#/entertainment`
- [ ] Responsive on mobile

---

### P1-002: Movies/TV Carousels
**Status:** 🔴 Not Started  
**Depends On:** P1-001, Jellyfin API

**Acceptance:**
- [ ] Continue Watching carousel (resumable items)
- [ ] Recently Added carousel
- [ ] Unwatched carousel
- [ ] Poster images from Jellyfin
- [ ] Horizontal scroll with arrows
- [ ] Touch swipe on mobile
- [ ] Click opens Jellyfin wrapper
- [ ] Empty state if no content

---

### P1-003: Movie Night Mode
**Status:** 🔴 Not Started  
**Depends On:** P1-002

**Acceptance:**
- [ ] "Movie Night" button in Entertainment
- [ ] Generates QR code: `http://talon.local:8096/web/`
- [ ] Shows connection instructions
- [ ] Works without backend (shows instructions)

---

### P1-004: Music Tab Enhancements
**Status:** 🟡 Partial (player exists)

**Acceptance:**
- [ ] Play/Pause/Skip controls work
- [ ] Progress bar with seek
- [ ] Volume control
- [ ] Playlist view
- [ ] Queue management
- [ ] Lyrics display
- [ ] Album art
- [ ] Shuffle/Repeat toggles

---

### P1-005: Kiwix Wrapper
**Status:** 🔴 Not Started  
**URL:** `http://talon.local:8090`

**Acceptance:**
- [ ] Embedded iframe mode
- [ ] OMEGA header persists
- [ ] "Kiwix - Offline Wiki" title
- [ ] Back navigation works
- [ ] Fallback to new tab if iframe blocked

---

### P1-006: Jellyfin Wrapper
**Status:** 🔴 Not Started  
**URL:** `http://talon.local:8096/web/`

**Acceptance:**
- [ ] Fullscreen mode
- [ ] "← Back to OMEGA" overlay (top-left)
- [ ] Overlay auto-hides after 3 seconds
- [ ] Click back returns to Entertainment
- [ ] Deep links work

---

### P1-007: Services Launcher Page
**Status:** 🔴 Not Started  
**Route:** `/#/services`

**Acceptance:**
- [ ] Grid of service cards
- [ ] Kiwix card (embedded wrapper)
- [ ] Jellyfin card (fullscreen wrapper)
- [ ] Status indicator per service (online/offline)
- [ ] Click opens appropriate wrapper

---

### P1-008: Global Search Federation
**Status:** 🟡 Partial (search UI exists)

**Acceptance:**
- [ ] Searches: People, Commands, Knowledge, Entertainment, Help, Tools
- [ ] Results grouped by category
- [ ] Click action per result type
- [ ] Keyboard shortcut (⌘/ or Ctrl+/)
- [ ] Recent searches stored locally

---

### P1-009: Team Indicators on Profiles
**Status:** 🔴 Not Started

**Acceptance:**
- [ ] Profile drawer shows team badges
- [ ] Profile cards show team indicators
- [ ] Badges link to team detail
- [ ] Multiple teams supported

---

### P1-010: Activity Tracker
**Status:** 🔴 Not Started

**Acceptance:**
- [ ] Activity log in profile drawer
- [ ] Categories: Supply Run, Perimeter Check, etc.
- [ ] Timestamp per activity
- [ ] Optional notes field

---

## P2 - Scaffolds (UI Shell + Mock Data)

### P2-001: Games Tab Scaffold
**Status:** 🔴 Not Started

**Acceptance:**
- [ ] Tab visible in Entertainment
- [ ] Grid layout with 6 placeholder cards
- [ ] "Coming Soon" overlay on each card
- [ ] Category filters (non-functional)

---

### P2-002: Multiplayer Hub Scaffold
**Status:** 🔴 Not Started  
**Route:** `/#/multiplayer`

**Acceptance:**
- [ ] Tabs: Trivia, Tournaments, Party Mode
- [ ] Mock tournament list
- [ ] "Create Game" shows "Coming Soon"
- [ ] Leaderboard placeholder

---

### P2-003: Creator Tools Scaffold
**Status:** 🔴 Not Started  
**Route:** `/#/create`

**Acceptance:**
- [ ] Tool selector: Beat Maker, Drawing, Recording
- [ ] Each tool shows placeholder canvas
- [ ] "Save" shows "Coming Soon"

---

### P2-004: Debate Arena Scaffold
**Status:** 🔴 Not Started  
**Route:** `/#/debate`

**Acceptance:**
- [ ] Topic card with mock topic
- [ ] Timer UI (non-functional)
- [ ] Vote buttons (animation only)
- [ ] Score display

---

### P2-005: Photos Hub Scaffold
**Status:** 🔴 Not Started  
**Route:** `/#/photos`

**Acceptance:**
- [ ] Gallery grid with placeholder images
- [ ] Upload button shows "Coming Soon"
- [ ] Share modal (non-functional)

---

### P2-006: Personal Vault Scaffold
**Status:** 🔴 Not Started  
**Route:** `/#/vault`

**Acceptance:**
- [ ] Folder tree structure
- [ ] Lock icons on folders
- [ ] PIN entry modal (mock validation)
- [ ] "Admin Access" indicator

---

### P2-007: New User Setup Wizard Scaffold
**Status:** 🔴 Not Started  
**Route:** `/#/setup`

**Acceptance:**
- [ ] Multi-step wizard UI
- [ ] Steps: Welcome, Primary User, Household, Relationships
- [ ] Form fields (no persistence)
- [ ] Progress indicator
- [ ] Skip button

---

## Implementation Order

### Phase 1: P0 (Critical)
1. P0-009 (timeout handling) - foundational
2. P0-001 (health.py) - enables connection status
3. P0-002 (metrics.py) - enables Device Info
4. P0-003, P0-004, P0-005 (backup, keys, keysync) - parallel
5. P0-006, P0-007, P0-008 (forbidden, degraded, not-configured states)

### Phase 2: P1 (Entertainment)
1. P1-001 (nav item) - depends on P0 complete
2. P1-005, P1-006 (wrappers) - can be parallel
3. P1-002, P1-003 (carousels, movie night)
4. P1-007 (services launcher)
5. P1-008 (search federation)
6. P1-009, P1-010 (profile enhancements)
7. P1-004 (music enhancements)

### Phase 3: P2 (Scaffolds)
- All P2 items can be parallel
- No dependencies on backend

---

*Backlog Generated: January 14, 2026*
*Based on Confirmed User Requirements*
