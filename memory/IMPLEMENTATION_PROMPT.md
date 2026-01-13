# OMEGA Dashboard - Consolidated Implementation Prompt
## Version 2.0 - Entertainment Expansion + Full Polish + Live Wiring

---

## EXECUTIVE SUMMARY

Build the complete OMEGA Dashboard with:
- **React build artifact** deployed via symlink swap to `/var/www/html/`
- **HashRouter** for static file compatibility
- **Dark-first theme** with Light parity
- **Live backend integration** for all available endpoints
- **Full Entertainment expansion** with Jellyfin/Kiwix wrappers
- **Subtle animations** (micro-interactions, hover/focus, drawer transitions)

**Priority Order:** Live wiring (1) → Visual polish (2) → Performance (3) → New features (4)

---

## 1. TECH STACK & DEPLOYMENT

### Build Configuration
```
Framework: React (create-react-app with craco)
Routing: HashRouter (/#/route)
Styling: Tailwind CSS
Components: Shadcn/UI from /app/frontend/src/components/ui/
Bundle target: <10MB gzipped
Offline: Required (service worker + local storage)
```

### Deployment Path
```
Web root: /var/www/html/
Symlink: index.html → releases/<version>/www/index.html
Method: Symlink swap with versioned rollback
```

### Runtime Configuration
```javascript
// /var/www/html/config.js (editable without rebuild)
window.OMEGA_CONFIG = {
  API_BASE: 'http://127.0.0.1:8093',
  KIWIX_BASE: 'http://127.0.0.1:8090',
  JELLYFIN_BASE: 'http://127.0.0.1:8096',
  USE_MOCK_DATA: false,
};
```

---

## 2. VISUAL DESIGN SYSTEM

### Theme
- **Primary:** Dark-first
- **Parity:** Maintain full Light theme support
- **Source of truth:** Screenshot packs (allow polish upgrades, no structural changes)

### Typography
- Keep current scale (codify as CSS variables)
- Do not refactor globally

### Animation
- **Level:** Subtle only
- **Allowed:** Micro-interactions, hover/focus states, drawer transitions
- **Forbidden:** Heavy cinematic motion, page-level animations

### Colors (CSS Variables)
```css
:root {
  /* Dark theme primary */
  --background: 222.2 84% 4.9%;
  --foreground: 210 40% 98%;
  --primary: 217.2 91.2% 59.8%;
  --accent: 262.1 83.3% 57.8%;
  /* Status colors */
  --success: 142.1 76.2% 36.3%;
  --warning: 45.4 93.4% 47.5%;
  --destructive: 0 72.2% 50.6%;
}
```

---

## 3. FEATURE SCOPE

### FULL Implementation (Complete UI + Logic + Wiring)

| Feature | Description | Acceptance |
|---------|-------------|------------|
| **Entertainment Page** | Top-level nav item in header | Opens full entertainment hub |
| **Movies/TV Carousels** | Continue Watching, Newly Added, Unwatched, by Genre | Scrollable carousels with posters |
| **Movie Night Mode** | Hotspot QR + Jellyfin deep links | Single button triggers hotspot + displays QR |
| **Music Tab** | Full player with playlists, lyrics, queue | Play/pause/skip, lyrics sync, queue management |
| **Global Search** | Federated search: people/files/knowledge/commands | Single search bar, categorized results |
| **OMEGA Wrappers** | Kiwix embedded, Jellyfin fullscreen+overlay | Consistent nav experience |

### SCAFFOLD Implementation (UI Shell + Mock Data)

| Feature | Description | Scaffold Requirements |
|---------|-------------|----------------------|
| **Games Tab** | Offline games hub | Grid layout, placeholder game cards, "Coming Soon" |
| **Multiplayer Hub** | Trivia/tournaments/party mode | Tab structure, mock tournament list |
| **Creator Tools** | Beat maker/drawing/recording | Tool selector, placeholder canvases |
| **Debate Arena** | Topic generator/timers/voting | Timer UI, topic cards, vote buttons (non-functional) |
| **Photos Hub** | Upload/download/share | Gallery grid, upload button (mock), share modal |
| **Personal Vault** | Per-user folders + locks | Folder tree, lock icon, PIN modal (mock) |
| **New User Setup** | First-boot wizard | Step wizard UI, form fields (no persistence) |

### DEFER (Not in this release)
- None explicitly deferred; all features at least scaffolded

---

## 4. BACKEND INTEGRATION

### Connection States
```
CONNECTED: All critical endpoints responding
DEGRADED: Some endpoints failing (show which)
NOT_CONNECTED: No endpoints responding
EMPTY_STATE: Connected but no data returned
```

### Timeout & Retry
- Loading timeout: **3 seconds**
- Retry buttons: **Yes** (per-panel + global in Status)
- Auto-retry interval: **30 seconds** when degraded

### Endpoints to Wire NOW

| Endpoint | Method | Response | UI Consumer |
|----------|--------|----------|-------------|
| `/cgi-bin/health.py` | GET | `{status, uptime, version}` | System Status, Header chip |
| `/cgi-bin/metrics.py` | GET | `{cpu, memory, disk, temp}` | Device Info Tile, LOGS |
| `/cgi-bin/backup.py` | GET/POST | `{backups[], lastBackup}` | Admin Console |
| `/cgi-bin/keys.py` | GET | `{keyVersion, lastRotation}` | Security Tile |
| `/cgi-bin/keysync.py` | GET | `{syncStatus, lastSync}` | Security Tile |
| `/cgi-bin/dm.py` | GET/POST | `{deadmanStatus, lastCheck}` | Admin Console |
| `/cgi-bin/sensors.py` | GET | `{temp, humidity, pressure}` | Environment Tile |

### GPS Endpoints
- **Status:** Not integrated until exact paths provided
- **Fallback:** Show "GPS: Not Configured" in UI

### Kiwix Integration
- **Base URL:** `http://127.0.0.1:8090`
- **Display:** Embedded iframe with OMEGA header wrapper
- **Search:** Include Kiwix results in Global Search

### Jellyfin Integration
- **Base URL:** `http://127.0.0.1:8096`
- **Display:** Fullscreen with "Back to OMEGA" overlay
- **API calls:** `/Items`, `/Users`, `/Sessions` for carousels

---

## 5. DATA MODEL & RBAC

### Roles
```
guest: Read-only, limited panels visible
member: Full read, limited write (own profile, preferences)
admin: Full access, audit bypass with logging
```

### Enforcement
- **Every page:** RBAC enforced
- **Exception:** Help Center readable by all

### Profile Schema
```typescript
interface Profile {
  id: string;
  name: string;          // Public
  callsign: string;      // Public
  ageRange?: string;     // Private by default
  skills: string[];      // Public
  medical?: MedicalInfo; // Private by default
  location?: Location;   // Private by default (no exact address)
  role: 'guest' | 'member' | 'admin';
  linkedRelationships: Relationship[];
}

interface Relationship {
  type: 'parent' | 'child' | 'spouse' | 'sibling';
  targetId: string;
  groupInPlans: true;      // Always grouped
  showInRosters: true;     // Always together
  inheritPermissions: false; // Explicit per-user
}
```

### Vault Security
```typescript
interface VaultLock {
  type: 'pin' | 'passphrase';
  hash: string;
  adminBypass: 'audit-logged'; // Always logged
  recoveryMethod: 'admin-reset-physical'; // Requires physical access
}
```

---

## 6. CONTENT & SAFETY

### Restrictions
- **Content filtering:** None (optional "house rules" toggles for future)
- **Sensitive data:**
  - Medical + precise location: Hidden unless opt-in
  - No exact street address fields
  - Vault contents: Never in global search for non-owner

---

## 7. CROSS-APP NAVIGATION

### Kiwix
- **Mode:** Embedded wrapper (OMEGA header persists)
- **Implementation:** iframe with `src={KIWIX_BASE}`
- **Fallback:** If iframe blocked, open new tab with "Return to OMEGA" toast

### Jellyfin
- **Mode:** Fullscreen + Back overlay
- **Implementation:** Navigate to `JELLYFIN_BASE` with overlay injection
- **Back button:** Fixed position "← Back to OMEGA" that returns to dashboard

### Services Launcher
- **Include:** Yes
- **Location:** Header nav or dedicated route `/#/services`
- **Contents:** Grid of service cards (Kiwix, Jellyfin, future services)

---

## 8. TESTING & AUDIT

### Audit Panel Definitions
```
IMPLEMENTED = UI exists + interactions work + data model present + 
              (if endpoint exists) wired OR validated mock with clear wire path
MOCKED = UI exists but uses mock data (MOCK badge visible)
MISSING = No UI route/component for feature
```

### Required Tests
- ✅ UI smoke test (all routes render)
- ✅ Endpoint ping test (all wired endpoints)
- ✅ Accessibility (keyboard nav + focus states)

### Copy Report JSON Schema
```json
{
  "buildVersion": "string",
  "buildTime": "ISO8601",
  "runtimeConfig": {
    "API_BASE": "string",
    "KIWIX_BASE": "string",
    "JELLYFIN_BASE": "string",
    "USE_MOCK_DATA": "boolean"
  },
  "routeInventory": ["/#/", "/#/entertainment", ...],
  "componentInventory": [{
    "name": "string",
    "path": "string",
    "dataMode": "LIVE|MOCK|STATIC"
  }],
  "endpointChecks": [{
    "endpoint": "string",
    "status": "ok|error|timeout",
    "latency": "number",
    "lastSuccess": "ISO8601|null",
    "lastError": "string|null"
  }],
  "featureParity": [{
    "feature": "string",
    "status": "IMPLEMENTED|MOCKED|MISSING",
    "priority": "P0|P1|P2"
  }],
  "deviceInfo": {
    "browser": "string",
    "viewport": "string"
  },
  "notes": "string"
}
```

---

## 9. DEPLOYMENT WORKFLOW

### Release Process
```bash
# 1. Build
cd /app/frontend
yarn build:pi

# 2. Package creates: deploy/releases/<timestamp>/
#    Contains: www/, config.js, nginx.conf, install.sh, README.md

# 3. Deploy to Pi
scp -r deploy/releases/<timestamp> pi@omega:/var/www/releases/

# 4. Symlink swap
ssh pi@omega "ln -sfn /var/www/releases/<timestamp>/www /var/www/html/current"

# 5. Verify
curl http://omega.local/
```

### Rollback
```bash
# List releases
ls /var/www/releases/

# Rollback to previous
ln -sfn /var/www/releases/<previous>/www /var/www/html/current
```

### In-UI Version Display
- **Location:** System Status panel + footer
- **Show:** Build version, build timestamp, release notes link

---

## 10. ACCEPTANCE CRITERIA

### Definition of Done
**Feature parity with screenshots + additions:**
- All Pack 1 & Pack 2 features present
- Entertainment expansion complete (FULL items)
- Scaffolds in place for deferred items
- Live wiring for all specified endpoints
- Audit panel accurate

### Quality Gates
1. All routes render without error
2. All FULL features functional end-to-end
3. All SCAFFOLD features have UI shell + mock data
4. Endpoint ping tests pass (or graceful degradation)
5. Dark/Light themes both functional
6. Mobile responsive (375px - 1920px)
7. Offline mode works (service worker)
8. Build size < 10MB gzipped

---

## IMPLEMENTATION ORDER

### Phase 1: Live Wiring (Priority 1)
1. Update ConnectionContext for all endpoints
2. Wire health, metrics, sensors to existing tiles
3. Wire backup, keys, keysync, dm to Admin Console
4. Implement timeout + retry + degraded states
5. Test all endpoint integrations

### Phase 2: Visual Polish (Priority 2)
1. Codify typography as CSS variables
2. Standardize all hover/focus states
3. Add subtle drawer transitions
4. Ensure Dark/Light parity
5. Responsive fixes for all viewports

### Phase 3: Performance (Priority 3)
1. Lazy load Entertainment section
2. Implement service worker
3. Optimize bundle size
4. Add loading skeletons everywhere
5. Test offline mode

### Phase 4: New Features (Priority 4)
1. Entertainment page + carousels
2. Movie Night Mode
3. Music player enhancement
4. Global Search federation
5. OMEGA wrappers (Kiwix/Jellyfin)
6. Services launcher
7. Scaffolds for deferred features

---

*This prompt is the single source of truth for OMEGA Dashboard v2.0 implementation.*
