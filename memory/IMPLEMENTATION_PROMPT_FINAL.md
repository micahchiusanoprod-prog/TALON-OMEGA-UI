# OMEGA Dashboard v2.0 - Final Implementation Prompt
## Status: CONFIRMED - Ready for Implementation

---

## CONFIRMED RUNTIME CONFIGURATION

```javascript
// /var/www/html/config.js (runtime-editable)
window.OMEGA_CONFIG = {
  // Canonical URLs (LAN-safe for mobile clients)
  API_BASE: 'http://talon.local:8093',
  KIWIX_BASE: 'http://talon.local:8090',
  JELLYFIN_BASE: 'http://talon.local:8096',
  JELLYFIN_WEB_PATH: '/web/',
  
  // QR codes always use talon.local variants
  QR_USE_LAN_URLS: true,
  
  // Data mode
  USE_MOCK_DATA: false,
};
```

---

## CONFIRMED FACTS

### Infrastructure
| Item | Value | Source |
|------|-------|--------|
| Dashboard URL | `http://talon.local/` | Confirmed |
| Kiwix URL | `http://talon.local:8090/` | Confirmed |
| Jellyfin URL | `http://talon.local:8096/web/` | Confirmed (302 redirect) |
| API URL | `http://talon.local:8093/cgi-bin/*` | Confirmed (direct port) |
| nginx try_files | ✅ Configured | HashRouter compatible |
| Desktop launcher | ✅ Exists | Chromium app mode |

### nginx Configuration
- `/etc/nginx/sites-enabled/talon-dashboard` serves dashboard with try_files fallback
- `/etc/nginx/conf.d/talon-server.conf` (kiwix.local) being removed/disabled
- No `/cgi-bin` proxy currently (direct port calls to :8093)

---

## ENDPOINT WIRING MATRIX

### ✅ WIRE NOW (200 OK Confirmed)

| Endpoint | Response | UI Consumer | Implementation |
|----------|----------|-------------|----------------|
| `/cgi-bin/health.py` | `{status:"ok",...}` | System Status, Header chip | Poll every 30s |
| `/cgi-bin/metrics.py` | `{cpu,mem,disk,backup,mesh}` | Device Info, LOGS | Poll every 30s |
| `/cgi-bin/backup.py` | `{list:[],count:0}` | Admin Console | Fetch on open |
| `/cgi-bin/keys.py` | `{ok:true,id:"anon",has:false}` | Security Tile | Poll every 60s |
| `/cgi-bin/keysync.py` | `{pending:0,last_export:"never"}` | Security Tile | Poll every 60s |

### ⚠️ FORBIDDEN STATE (DM)

| Endpoint | Response | UI Treatment |
|----------|----------|--------------|
| `/cgi-bin/dm.py` | `Status: 403` + `{ok:false,err:"forbidden"}` | Show "Admin Access Required" badge, no action button |

**Implementation:**
```jsx
<ForbiddenState
  title="Dead Man Switch"
  message="Admin Access Required"
  description="This feature requires administrator privileges."
  showRetry={false}
  showContactAdmin={false}
/>
```

### ⚠️ DEGRADED STATE (Sensors)

| Endpoint | Response | UI Treatment |
|----------|----------|--------------|
| `/cgi-bin/sensors.py` | `{status:"error"}` (I2C bus missing) | Show degraded state with troubleshooting |

**Implementation:**
```jsx
<DegradedState
  title="Environmental Sensors"
  message="I2C bus configuration required"
  description="Sensor bus not detected (/dev/i2c-3 not found)"
  showTroubleshooting={true}
  troubleshootSteps={[
    "1. Verify BME680 sensor physical connection",
    "2. Check available I2C buses: ls /dev/i2c-*",
    "3. Current detected bus: /dev/i2c-90",
    "4. Scan for sensor: i2cdetect -y 90",
    "5. Backend expects /dev/i2c-3 — symlink or config update required"
  ]}
  onRetry={() => refetchSensors()}
/>
```

### ❓ NOT CONFIGURED STATE (GPS)

| Endpoint | Response | UI Treatment |
|----------|----------|--------------|
| GPS (paths unknown) | N/A | Show "Not Configured" with setup instructions |

**Implementation:**
```jsx
<NotConfiguredState
  title="GPS Location"
  message="GPS Not Configured"
  description="GPS endpoints have not been set up on this device."
  setupInstructions={[
    "GPS hardware must be connected",
    "Backend GPS service must be configured",
    "Contact administrator to enable GPS features"
  ]}
  setupLink={null}  // No link until endpoints confirmed
/>
```

---

## UI STATE COMPONENTS (New)

### ConnectionContext States
```typescript
export const CONNECTION_STATES = {
  CONNECTED: 'connected',      // All critical endpoints responding
  DEGRADED: 'degraded',        // Some endpoints failing
  NOT_CONNECTED: 'not_connected', // No endpoints responding
  FORBIDDEN: 'forbidden',      // Auth required
  NOT_CONFIGURED: 'not_configured', // Feature not set up
};
```

### State Components to Create/Update

1. **ForbiddenState** - Red/gray lock icon, message, no action
2. **DegradedState** - Amber warning, message, troubleshooting steps, retry button
3. **NotConfiguredState** - Gray info icon, message, setup instructions
4. **EmptyState** - For connected but empty data (backup list = 0)

---

## ENTERTAINMENT MODULE

### Scope: FULL (with empty state handling)

### Header Navigation
- **Decision:** Add "Entertainment" nav item ONLY if it does not regress existing header layout
- **Fallback:** If spacing issues, keep tile-only entry
- **Position:** After "Help Center", before "Admin Console"

### Routes
```
/#/entertainment           - Overview (carousels, CTAs)
/#/entertainment/movies    - Movies grid
/#/entertainment/tv        - TV shows grid
/#/entertainment/music     - Music player (existing, enhanced)
/#/entertainment/games     - Games hub (SCAFFOLD)
```

### Jellyfin Integration (FULL)
```javascript
const JELLYFIN_CONFIG = {
  baseUrl: 'http://talon.local:8096',
  webPath: '/web/',
  apiEndpoints: {
    items: '/Items',
    users: '/Users',
    sessions: '/Sessions',
  },
};

// Carousel data sources
const carousels = [
  { id: 'continue', title: 'Continue Watching', filter: 'IsResumable' },
  { id: 'recent', title: 'Recently Added', sortBy: 'DateCreated' },
  { id: 'unwatched', title: 'Unwatched', filter: 'IsPlayed=false' },
];
```

### Movie Night Mode
```jsx
<MovieNightMode
  onActivate={() => {
    // 1. Enable hotspot (if API available)
    // 2. Generate QR code with talon.local:8096/web/
    // 3. Show connection instructions
  }}
  qrUrl="http://talon.local:8096/web/"
  hotspotInstructions={[
    "1. Connect to OMEGA WiFi network",
    "2. Scan QR code or visit talon.local:8096",
    "3. Select movie from shared library"
  ]}
/>
```

### Jellyfin Wrapper
```jsx
<JellyfinWrapper
  mode="fullscreen"  // Fullscreen with back overlay
  backButtonPosition="top-left"
  backButtonLabel="← Back to OMEGA"
  targetUrl={`${JELLYFIN_BASE}${JELLYFIN_WEB_PATH}`}
  onBack={() => navigate('/#/entertainment')}
/>
```

### Kiwix Wrapper
```jsx
<KiwixWrapper
  mode="embedded"  // OMEGA header persists
  targetUrl={KIWIX_BASE}
  headerTitle="Kiwix - Offline Wiki"
  showSearchBar={true}
  onBack={() => navigate('/#/')}
/>
```

### Empty States (if Jellyfin library empty)
```jsx
<EmptyLibraryState
  title="No Media Yet"
  message="Your Jellyfin library is empty"
  instructions={[
    "Add media files to your Jellyfin server",
    "Refresh this page to see your library"
  ]}
  action={{ label: "Open Jellyfin Admin", url: `${JELLYFIN_BASE}/web/#!/dashboard` }}
/>
```

---

## SERVICES LAUNCHER PAGE

### Route: `/#/services`

```jsx
const services = [
  {
    id: 'kiwix',
    name: 'Kiwix',
    description: 'Offline Wikipedia & Reference',
    url: 'http://talon.local:8090',
    icon: Book,
    status: 'online', // Check via fetch
    wrapperMode: 'embedded',
  },
  {
    id: 'jellyfin',
    name: 'Jellyfin',
    description: 'Media Server',
    url: 'http://talon.local:8096/web/',
    icon: Film,
    status: 'online',
    wrapperMode: 'fullscreen',
  },
];
```

---

## GLOBAL SEARCH FEDERATION

### Search Sources
| Source | Implementation | Action on Click |
|--------|----------------|-----------------|
| People | Local roster search | Open profile drawer |
| Commands | Command registry | Execute command |
| Knowledge | Kiwix search API | Open Kiwix wrapper |
| Entertainment | Jellyfin search API | Open Jellyfin wrapper |
| Help | Local help content | Open Help Center section |
| Quick Tools | Tool registry | Open tool modal |

### Search Results Format
```typescript
interface SearchResult {
  id: string;
  type: 'person' | 'command' | 'knowledge' | 'entertainment' | 'help' | 'tool';
  title: string;
  subtitle?: string;
  icon?: string;
  action: () => void;
}
```

---

## P0 IMPLEMENTATION CHECKLIST

### Connection & State Management
- [ ] Update ConnectionContext with new states (FORBIDDEN, NOT_CONFIGURED)
- [ ] Implement 3-second timeout before state change
- [ ] Implement 30-second auto-retry when degraded
- [ ] Add per-panel retry buttons
- [ ] Add global retry in System Status

### Endpoint Wiring
- [ ] Wire health.py → System Status + Header chip
- [ ] Wire metrics.py → Device Info + LOGS charts
- [ ] Wire backup.py → Admin Console (handle empty list)
- [ ] Wire keys.py → Security Tile
- [ ] Wire keysync.py → Security Tile
- [ ] Implement Forbidden state for dm.py
- [ ] Implement Degraded state for sensors.py with troubleshooting
- [ ] Implement Not Configured state for GPS

### State Components
- [ ] Create ForbiddenState component
- [ ] Create DegradedState component with troubleshooting
- [ ] Create NotConfiguredState component
- [ ] Update EmptyState component

---

## P1 IMPLEMENTATION CHECKLIST

### Entertainment Module
- [ ] Add Entertainment nav item (if no regression)
- [ ] Create Entertainment overview page
- [ ] Create poster carousel component
- [ ] Wire Jellyfin Items API for carousels
- [ ] Implement Movie Night Mode
- [ ] Create Jellyfin fullscreen wrapper with back overlay
- [ ] Create Kiwix embedded wrapper
- [ ] Handle empty Jellyfin library state

### Services & Search
- [ ] Create Services launcher page
- [ ] Implement service status checks
- [ ] Enhance Global Search with federation
- [ ] Add Kiwix search integration
- [ ] Add Jellyfin search integration

### Profile Enhancements
- [ ] Add team indicators to profile drawer
- [ ] Add team indicators to profile cards
- [ ] Implement Activity Tracker section

---

## P2 IMPLEMENTATION CHECKLIST (SCAFFOLDS)

All P2 items are UI scaffolds with mock data, no backend wiring:

- [ ] Games tab scaffold (Coming Soon cards)
- [ ] Multiplayer hub scaffold (tab structure)
- [ ] Creator tools scaffold (tool selector)
- [ ] Debate arena scaffold (timer UI)
- [ ] Photos hub scaffold (gallery grid)
- [ ] Personal Vault scaffold (folder tree + lock UI)
- [ ] New User Setup scaffold (step wizard)

---

## DEPLOYMENT NOTES

### nginx Status
- ✅ try_files configured (HashRouter works)
- ✅ No changes needed for current implementation
- ⚠️ Remove/disable kiwix.local server block to avoid confusion

### Build & Deploy
```bash
# Build
cd /app/frontend
yarn build:pi

# Deploy (symlink swap)
RELEASE=$(date +%Y%m%d_%H%M%S)
sudo cp -r build /var/www/releases/$RELEASE
sudo ln -sfn /var/www/releases/$RELEASE /var/www/html/current

# Verify
curl -s http://talon.local/ | grep -i '<title>'
```

### Config Verification
```bash
# Verify services reachable from LAN
curl -s http://talon.local:8093/cgi-bin/health.py
curl -s http://talon.local:8090/ | head -5
curl -s http://talon.local:8096/ -I | head -3
```

---

## REGRESSION PREVENTION

### Do NOT Modify (Pack 1 + Pack 2 Features)
- Dashboard home layout (dark/light)
- Header structure and subtitle
- Quick Tools bar (Guide, Calculator, Translator, SOS, Currency, Dictionary)
- Ally Communications Hub (all tabs)
- System Status Panel structure
- Audit Panel structure
- Community Hub (Overview/Directory/Teams)
- Help Center + HelpGuidePanel
- LOGS Analytics
- All existing tiles (Camera, Power, Security, Weather, Environment, Device Info, Hotspot)
- Existing Entertainment tile
- Existing Music Player
- Team Builder (all 3 steps)
- Profile Drawer structure

### Allowed Modifications
- Add new UI states (Forbidden, Degraded, Not Configured)
- Add new nav item (Entertainment) if no regression
- Enhance existing components with live data
- Add new routes/pages that don't affect existing structure

---

## ACCEPTANCE CRITERIA

### P0 Complete When:
1. All 5 confirmed endpoints wired and showing live data
2. dm.py shows "Admin Access Required" badge
3. sensors.py shows degraded state with troubleshooting steps
4. GPS shows "Not Configured" state
5. Connection states work: Connected → Degraded → Not Connected
6. Retry buttons functional

### P1 Complete When:
1. Entertainment page accessible (nav or tile)
2. Jellyfin carousels showing data (or empty state)
3. Movie Night Mode functional with QR
4. Kiwix wrapper working
5. Jellyfin wrapper working
6. Services launcher page working
7. Global Search returns federated results
8. Profile team indicators visible

### P2 Complete When:
1. All scaffold UIs render without error
2. "Coming Soon" or placeholder content visible
3. No JavaScript errors in console

---

*Implementation Prompt Generated: January 14, 2026*
*All TBDs Resolved Based on User Confirmations*
