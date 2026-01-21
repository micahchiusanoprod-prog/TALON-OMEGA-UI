# OMEGA Dashboard - Forensic UI Audit Report

**Date:** 2026-01-21
**Dashboard URL:** http://talon.local/
**Build Version:** Production Pi Deployment
**Audit Scope:** Complete UI/UX, API dependencies, offline behavior

---

## EXECUTIVE SUMMARY

### Key Findings
- **Routes/Pages:** 2 main routes (`/` Dashboard, `/#/entertainment` Entertainment)
- **Major Panels/Modals:** 14 distinct modal/panel types
- **API Endpoints:** 15 backend endpoints (mostly mocked in preview)
- **External Dependencies:** 4 external CDN resources (OFFLINE RISK)
- **localStorage Keys:** 4 keys for user preferences
- **Offline Status:** UI loads fully offline, data falls back to mocks, Kiwix/Jellyfin require network

### Critical Offline Risks
1. `https://assets.emergent.sh/scripts/emergent-main.js` - Preview environment only
2. `https://cdn.tailwindcss.com` - Preview iframe only
3. Google Maps link in Community Hub (external)
4. PostHog analytics (preview environment)

### 10-Second Path Verification
| Goal | Path | Clicks | Status |
|------|------|--------|--------|
| Find Kiwix | Search bar → type query → Kiwix results | 2 | ✅ |
| Find Hotspot | Help Center → "Connect to Hotspot" | 2 | ✅ |
| System Status | Header → Status button | 1 | ✅ |
| Advanced Diagnostics | Admin Console → Data Health | 2 | ✅ |

---

## 1. SITEMAP (Complete Route Inventory)

```
/                       # Main Dashboard (HashRouter)
├── /#/                 # Dashboard (default route)
├── /#/entertainment    # Entertainment Hub page
└── /#/*                # Catch-all → redirects to Dashboard

Modals/Panels (overlay, no route change):
├── LOGS Analytics Panel
├── Community Hub Modal
├── Help Center Modal
├── Admin Console Modal
│   ├── Fleet Updates tab
│   ├── Roster & Readiness tab
│   ├── Broadcast & Assembly tab
│   ├── Search Health tab
│   ├── Data Health tab
│   └── Audit Panel (sub-modal)
├── System Status Panel
├── Quick Guide Modal
├── Calculator Modal
├── Translator Modal
├── SOS Beacon Modal
├── Currency Converter Modal
├── Dictionary Modal
├── Field Notes Modal
└── Language Selector Dropdown
```

---

## 2. UI INVENTORY (JSON Format)

```json
{
  "pages": [
    {
      "id": "dashboard",
      "route": "/",
      "element_label": "OMEGA Dashboard",
      "element_type": "page",
      "action": "main landing page",
      "dependencies": ["/api/cgi-bin/*", "http://talon.local:8090"],
      "offline_status": "works",
      "user_goal": "Central command center view",
      "notes": "Scrollable, contains all main tiles"
    },
    {
      "id": "entertainment",
      "route": "/#/entertainment",
      "element_label": "Entertainment Hub",
      "element_type": "page",
      "action": "navigate",
      "dependencies": ["http://talon.local:8096"],
      "offline_status": "degrades",
      "user_goal": "Access Jellyfin media",
      "notes": "Shows NOT_CONFIGURED if Jellyfin unavailable"
    }
  ],
  "header_buttons": [
    {
      "id": "logs-btn",
      "route": null,
      "element_label": "LOGS",
      "element_type": "button",
      "action": "open modal",
      "dependencies": ["localStorage"],
      "offline_status": "works",
      "user_goal": "View system analytics"
    },
    {
      "id": "community-btn",
      "route": null,
      "element_label": "Community",
      "element_type": "button",
      "action": "open modal",
      "dependencies": ["/api/ally/*"],
      "offline_status": "degrades",
      "user_goal": "View network members/roster"
    },
    {
      "id": "help-center-btn",
      "route": null,
      "element_label": "Help Center",
      "element_type": "button",
      "action": "open modal",
      "dependencies": [],
      "offline_status": "works",
      "user_goal": "Get help and documentation"
    },
    {
      "id": "entertainment-btn",
      "route": "/#/entertainment",
      "element_label": "Entertainment",
      "element_type": "button",
      "action": "navigate",
      "dependencies": ["http://talon.local:8096"],
      "offline_status": "degrades",
      "user_goal": "Access media"
    },
    {
      "id": "admin-console-btn",
      "route": null,
      "element_label": "Admin Console",
      "element_type": "button",
      "action": "open modal",
      "dependencies": ["/api/cgi-bin/*", "http://talon.local:8090"],
      "offline_status": "degrades",
      "user_goal": "Admin/operator functions"
    },
    {
      "id": "theme-toggle-btn",
      "route": null,
      "element_label": "Light/Dark",
      "element_type": "button",
      "action": "toggle theme",
      "dependencies": ["localStorage:omega-theme"],
      "offline_status": "works",
      "user_goal": "Change visual theme"
    }
  ],
  "quick_tools": [
    {
      "id": "tool-quickguide",
      "element_label": "Quick Guide",
      "element_type": "button",
      "action": "open modal",
      "dependencies": [],
      "offline_status": "works",
      "user_goal": "Learn how to use OMEGA"
    },
    {
      "id": "tool-calculator",
      "element_label": "Calculator",
      "element_type": "button",
      "action": "open modal",
      "dependencies": [],
      "offline_status": "works",
      "user_goal": "Math calculations"
    },
    {
      "id": "tool-translator",
      "element_label": "Translator",
      "element_type": "button",
      "action": "open modal",
      "dependencies": [],
      "offline_status": "works",
      "user_goal": "Translate text"
    },
    {
      "id": "tool-sos",
      "element_label": "SOS Beacon",
      "element_type": "button",
      "action": "open modal",
      "dependencies": ["/api/ally/broadcast"],
      "offline_status": "degrades",
      "user_goal": "Emergency distress signal"
    },
    {
      "id": "tool-currency",
      "element_label": "Currency",
      "element_type": "button",
      "action": "open modal",
      "dependencies": [],
      "offline_status": "works",
      "user_goal": "Currency conversion"
    },
    {
      "id": "tool-dictionary",
      "element_label": "Dictionary",
      "element_type": "button",
      "action": "open modal",
      "dependencies": ["http://talon.local:8090"],
      "offline_status": "degrades",
      "user_goal": "Word definitions"
    },
    {
      "id": "tool-notes",
      "element_label": "Field Notes",
      "element_type": "button",
      "action": "open modal",
      "dependencies": ["localStorage:omega-field-notes"],
      "offline_status": "works",
      "user_goal": "Save quick notes"
    }
  ],
  "search": [
    {
      "id": "search-bar",
      "element_label": "Search everything...",
      "element_type": "input",
      "action": "search",
      "dependencies": ["http://talon.local:8090/search", "localStorage:omega-recent-searches"],
      "offline_status": "degrades",
      "user_goal": "Find Kiwix articles, people, files",
      "notes": "Shows 'Kiwix Search Unavailable' when offline"
    }
  ],
  "dashboard_tiles": [
    {
      "id": "ally-communications-hub",
      "element_label": "Ally Communications Hub",
      "element_type": "tile",
      "action": "display info + tabs",
      "dependencies": ["/api/cgi-bin/mesh", "/api/ally/*"],
      "offline_status": "degrades",
      "user_goal": "View communication methods status"
    },
    {
      "id": "community-tile",
      "element_label": "Community Feed",
      "element_type": "tile",
      "action": "display posts",
      "dependencies": ["/api/community/posts"],
      "offline_status": "degrades",
      "user_goal": "Social feed from network"
    },
    {
      "id": "device-info-tile",
      "element_label": "Device Status",
      "element_type": "tile",
      "action": "display metrics",
      "dependencies": ["/api/cgi-bin/metrics"],
      "offline_status": "degrades",
      "user_goal": "System health metrics"
    },
    {
      "id": "environment-tile",
      "element_label": "Environment",
      "element_type": "tile",
      "action": "display sensors",
      "dependencies": ["/api/cgi-bin/sensors"],
      "offline_status": "degrades",
      "user_goal": "BME680 sensor readings"
    },
    {
      "id": "hotspot-tile",
      "element_label": "Hotspot",
      "element_type": "tile",
      "action": "display hotspot status",
      "dependencies": ["/api/hotspot/status", "/api/hotspot/clients"],
      "offline_status": "degrades",
      "user_goal": "WiFi hotspot management"
    },
    {
      "id": "power-tile",
      "element_label": "Power",
      "element_type": "tile",
      "action": "display power info",
      "dependencies": ["/api/cgi-bin/power"],
      "offline_status": "degrades",
      "user_goal": "Battery/power status"
    },
    {
      "id": "weather-tile",
      "element_label": "Weather",
      "element_type": "tile",
      "action": "display weather",
      "dependencies": ["/api/cgi-bin/weather"],
      "offline_status": "degrades",
      "user_goal": "Local weather conditions"
    },
    {
      "id": "security-tile",
      "element_label": "Security",
      "element_type": "tile",
      "action": "display profiles",
      "dependencies": ["localStorage:omega_profiles"],
      "offline_status": "works",
      "user_goal": "Family member profiles"
    }
  ],
  "admin_console_tabs": [
    {
      "id": "admin-section-fleet",
      "element_label": "Fleet Updates",
      "element_type": "tab",
      "action": "display fleet status",
      "dependencies": [],
      "offline_status": "works",
      "user_goal": "Manage OMEGA device fleet"
    },
    {
      "id": "admin-section-roster",
      "element_label": "Roster & Readiness",
      "element_type": "tab",
      "action": "display roster",
      "dependencies": [],
      "offline_status": "works",
      "user_goal": "Team readiness tracking"
    },
    {
      "id": "admin-section-broadcast",
      "element_label": "Broadcast & Assembly",
      "element_type": "tab",
      "action": "send broadcasts",
      "dependencies": ["/api/ally/broadcast"],
      "offline_status": "degrades",
      "user_goal": "Mass communication"
    },
    {
      "id": "admin-section-search",
      "element_label": "Search Health",
      "element_type": "tab",
      "action": "display search stats",
      "dependencies": ["http://talon.local:8090"],
      "offline_status": "degrades",
      "user_goal": "Monitor search service"
    },
    {
      "id": "admin-section-datahealth",
      "element_label": "Data Health",
      "element_type": "tab",
      "action": "display API status",
      "dependencies": ["/api/cgi-bin/*", "http://talon.local:8090", "http://talon.local:8096"],
      "offline_status": "works",
      "user_goal": "Monitor all data sources"
    },
    {
      "id": "admin-section-audit",
      "element_label": "Audit",
      "element_type": "tab",
      "action": "open audit panel",
      "dependencies": [],
      "offline_status": "works",
      "user_goal": "Development/QA audit"
    }
  ]
}
```

---

## 3. NETWORK/DEPENDENCY MAP

### Backend API Endpoints (via /api/ proxy)

| Method | Path | Purpose | Status |
|--------|------|---------|--------|
| GET | `/api/cgi-bin/health.py` | System health check | LIVE (when Pi connected) |
| GET | `/api/cgi-bin/metrics.py` | CPU, RAM, temp metrics | LIVE |
| GET | `/api/cgi-bin/sensors.py` | BME680 sensor data | LIVE |
| GET | `/api/cgi-bin/backup.py` | Backup status | LIVE |
| GET | `/api/cgi-bin/keys.py` | Key management | LIVE |
| GET | `/api/cgi-bin/keysync.py` | Key sync status | LIVE |
| GET | `/api/cgi-bin/dm.py` | Direct messages | LIVE |
| GET | `/api/cgi-bin/power` | Power/battery info | PLANNED |
| GET | `/api/cgi-bin/weather` | Weather data | PLANNED |
| GET | `/api/cgi-bin/mesh` | Mesh network status | PLANNED |
| GET | `/api/cgi-bin/gps` | GPS location | NOT CONFIGURED |
| GET | `/api/hotspot/status` | Hotspot status | MOCKED |
| GET | `/api/hotspot/clients` | Connected clients | MOCKED |
| POST | `/api/hotspot/toggle` | Enable/disable hotspot | MOCKED |
| GET | `/api/ally/nodes` | Network members | MOCKED |
| POST | `/api/ally/chat` | Send messages | MOCKED |
| POST | `/api/ally/broadcast` | Mass broadcast | MOCKED |

### Kiwix Endpoints (direct to :8090)

| Method | Path | Purpose |
|--------|------|---------|
| GET | `http://talon.local:8090/catalog/v2/entries` | List available ZIM files |
| GET | `http://talon.local:8090/search?pattern=X&limit=20` | Article search |
| GET | `http://talon.local:8090/suggest?term=X` | Autocomplete suggestions |
| GET | `http://talon.local:8090/content/*` | Article content |

### Jellyfin Endpoints (direct to :8096)

| Method | Path | Purpose |
|--------|------|---------|
| GET | `http://talon.local:8096/web/` | Jellyfin web interface |
| GET | `http://talon.local:8096/Items` | Media library |

### External Resources (OFFLINE RISK)

| Resource | Purpose | Risk Level |
|----------|---------|------------|
| `https://assets.emergent.sh/scripts/emergent-main.js` | Preview environment badge | LOW (preview only) |
| `https://cdn.tailwindcss.com` | Preview iframe styling | LOW (preview only) |
| `https://us.i.posthog.com` | Analytics | LOW (preview only) |
| `https://www.google.com/maps` | Open map location | MEDIUM (optional feature) |

### localStorage Keys

| Key | Purpose | Default |
|-----|---------|---------|
| `omega-theme` | Light/dark theme | `'dark'` |
| `omega-field-notes` | User notes | `''` |
| `omega-recent-searches` | Search history | `[]` |
| `omega-pinned-hotkeys` | Pinned quick actions | `[]` |
| `omega_profiles` | Family member profiles | `[]` |

---

## 4. OFFLINE BEHAVIOR MATRIX

### Pages That Load Offline ✅
| Component | Status | Notes |
|-----------|--------|-------|
| Dashboard shell | ✅ WORKS | Full UI loads |
| Header/navigation | ✅ WORKS | All buttons functional |
| Quick Tools bar | ✅ WORKS | All modals open |
| Theme toggle | ✅ WORKS | Persists in localStorage |
| Language selector | ✅ WORKS | Client-side translations |
| Help Center | ✅ WORKS | Static content |
| Quick Guide | ✅ WORKS | Static content |
| Calculator | ✅ WORKS | Client-side |
| Currency converter | ✅ WORKS | Offline rates |
| Field Notes | ✅ WORKS | localStorage |
| Admin Console shell | ✅ WORKS | UI loads |

### Features That Degrade Offline ⚠️
| Component | Status | Fallback Behavior |
|-----------|--------|-------------------|
| Search | ⚠️ DEGRADES | Shows "Kiwix Unavailable" banner + library fallback |
| Data tiles | ⚠️ DEGRADES | Shows "UNAVAILABLE" badge + mock data |
| Community Hub | ⚠️ DEGRADES | Shows mock roster data |
| Data Health | ⚠️ DEGRADES | Shows accurate UNAVAILABLE status for each source |
| Search Health | ⚠️ DEGRADES | Shows "Service Unavailable" with fix instructions |

### Features That Fail Offline ❌
| Component | Status | User Impact |
|-----------|--------|-------------|
| Kiwix article content | ❌ FAILS | Cannot read actual wiki articles |
| Jellyfin streaming | ❌ FAILS | Cannot play media |
| Real sensor data | ❌ FAILS | Shows simulated data warning |
| SOS Beacon send | ❌ FAILS | Cannot transmit distress signal |
| Mesh messaging | ❌ FAILS | Cannot send/receive messages |

---

## 5. SCREENSHOT CHECKLIST (22 Captures)

| # | Page/Component | State | Scroll | Captured |
|---|---------------|-------|--------|----------|
| 1 | Landing Page | Default | Top | ✅ |
| 2 | Landing Page | Default | Middle | ✅ |
| 3 | Landing Page | Default | Bottom | ✅ |
| 4 | LOGS Analytics | Modal open | - | ✅ |
| 5 | Community Hub | Modal open | - | ✅ |
| 6 | Help Center | Modal open | - | ✅ |
| 7 | Admin Console | Fleet Updates tab | - | ✅ |
| 8 | Admin Console | Roster & Readiness tab | - | ✅ |
| 9 | Admin Console | Broadcast & Assembly tab | - | ✅ |
| 10 | Admin Console | Search Health tab | - | ✅ |
| 11 | Admin Console | Data Health tab | - | ✅ |
| 12 | Admin Console | Audit Panel | - | ✅ |
| 13 | Search | Focus/empty state | - | ✅ |
| 14 | Search | Results (query: "medical") | - | ✅ |
| 15 | Quick Guide | Modal open | - | ✅ |
| 16 | Entertainment Page | Default | Top | ✅ |
| 17 | Entertainment Page | Default | Scrolled | ✅ |
| 18 | System Status | Panel open | - | ✅ |
| 19 | Calculator | Modal open | - | ✅ |
| 20 | SOS Beacon | Modal open | - | ✅ |
| 21 | Mobile Landing | 375x800 | - | ✅ |
| 22 | Mobile Overflow Menu | Menu open | - | ✅ |

---

## 6. RECORDING SCRIPT (Walkthrough)

### Part A: First-Time User Path (Under 10 Seconds)

```
STEP 1: Open http://talon.local/
OBSERVE: Dashboard loads with communications hub, search bar, quick tools

STEP 2: Click search bar (top center)
OBSERVE: Search dropdown opens with scope tabs

STEP 3: Type "first aid" 
OBSERVE: Kiwix results appear (or "Unavailable" banner if Kiwix down)
TIME: ~5 seconds

STEP 4: Press Escape, click "Help Center" button
OBSERVE: Help Center modal opens with quick start guide
TIME: ~7 seconds

STEP 5: Scroll to "Connect to Hotspot" section
OBSERVE: Step-by-step hotspot instructions visible
TIME: ~9 seconds

STEP 6: Press Escape, look at header for Status indicator
OBSERVE: Status dot shows system health (green/yellow/red)
TIME: ~10 seconds
```

### Part B: Advanced Diagnostics Path

```
STEP 1: Click "Admin Console" button (header right)
OBSERVE: Admin Console modal opens on Fleet Updates

STEP 2: Click "Data Health" tab
OBSERVE: All 8 data sources listed with status (LIVE/UNAVAILABLE)

STEP 3: Click any source row
OBSERVE: Expanded view shows:
  - Endpoint URL
  - Last check timestamp
  - Latency
  - 24-hour uptime graph
  - "How to fix" instructions

STEP 4: Click "Search Health" tab
OBSERVE: Kiwix and Jellyfin status with metrics

STEP 5: Click "Audit" tab
OBSERVE: Developer audit panel with all mocked/live/missing data points
```

### Part C: Full Feature Tour

```
1. Landing Page → scroll to see all tiles
2. Click each header button (LOGS, Community, Help, Entertainment, Admin)
3. In Admin Console → click each tab
4. Click each Quick Tool (Guide, Calculator, Translator, SOS, Currency, Dictionary, Notes)
5. Open search → try queries: "wiki", "medical", "john", empty
6. Navigate to /#/entertainment
7. Back to home → click Status button
8. Toggle theme (Light/Dark)
9. Change language (if available)
10. Mobile: resize window → test overflow menu
```

---

## 7. TOP 15 FIXES (Prioritized)

### Priority 1: Offline-First Compliance

| # | Fix | Impact | Effort |
|---|-----|--------|--------|
| 1 | **Remove external CDN scripts from production build** | Eliminates offline failure | LOW |
| 2 | **Add explicit "OFFLINE MODE" banner when no network** | User awareness | LOW |
| 3 | **Cache last-known-good data in localStorage** | Data survives refresh | MEDIUM |
| 4 | **Pre-bundle offline Kiwix search index subset** | Search works offline | HIGH |

### Priority 2: Find Kiwix/Hotspot/Status <10s

| # | Fix | Impact | Effort |
|---|-----|--------|--------|
| 5 | **Add "Quick Access" panel to landing page** | Immediate access to key features | LOW |
| 6 | **Add prominent Kiwix card/button on dashboard** | One-click to knowledge base | LOW |
| 7 | **Add "Hotspot Setup" card on landing page** | Direct path to hotspot | LOW |
| 8 | **Make Status indicator clickable (opens panel)** | Faster diagnostics | LOW |

### Priority 3: Eliminate Dead Ends

| # | Fix | Impact | Effort |
|---|-----|--------|--------|
| 9 | **Add "No network - try later" guidance to failed states** | Clear user path | LOW |
| 10 | **Ensure all "How to fix" sections have offline alternatives** | Actionable guidance | MEDIUM |
| 11 | **Add "Return to Dashboard" from all dead-end states** | Navigation recovery | LOW |

### Priority 4: Raspberry Pi Performance

| # | Fix | Impact | Effort |
|---|-----|--------|--------|
| 12 | **Lazy-load Community Hub and Entertainment** | Faster initial load | MEDIUM |
| 13 | **Reduce polling frequency when on battery** | Power savings | MEDIUM |
| 14 | **Add `loading="lazy"` to all images** | Memory efficiency | LOW |
| 15 | **Implement virtual scrolling for long lists** | Smooth scroll on Pi | MEDIUM |

---

## 8. DEAD END ANALYSIS

### Confirmed Dead Ends
| Location | Condition | User Impact | Fix |
|----------|-----------|-------------|-----|
| Search | Kiwix down + no fallback | "Unavailable" with no next step | Add offline search tips |
| Entertainment | Jellyfin not configured | "NOT_CONFIGURED" dead end | Add setup guide link |
| SOS Beacon | Network down | Can't send distress | Add local alert option |
| GPS Map | No GPS endpoint | Map shows no data | Show "GPS not available" |

### Potential Dead Ends (Edge Cases)
| Location | Condition | Risk |
|----------|-----------|------|
| Dictionary | Kiwix down | Shows "lookup available via Kiwix" but Kiwix offline |
| Community Hub | All nodes offline | Empty roster with no guidance |

---

## 9. KIWIX-SPECIFIC PATHS

### Path to Kiwix (3 ways)
1. **Search Bar**: Type any query → Kiwix results appear
2. **Help Center**: "Knowledge Base" section → direct link
3. **Admin Console**: Data Health → Kiwix row → "Open in browser"

### Kiwix Integration Points
- Search results display source as "OFFLINE KNOWLEDGE"
- Search Health tab monitors Kiwix availability
- Data Health shows Kiwix uptime graph
- Help Center documents Kiwix troubleshooting

---

## 10. SUMMARY OF EXTERNAL DEPENDENCIES

### Production-Safe (bundled/local)
- React + React Router
- Tailwind CSS (compiled)
- Lucide Icons (bundled)
- Shadcn/UI components

### Preview-Only (not in production build)
- `assets.emergent.sh` scripts
- `cdn.tailwindcss.com`
- PostHog analytics

### Runtime Dependencies (require network)
- `http://talon.local:8090` - Kiwix
- `http://talon.local:8093` - OMEGA API
- `http://talon.local:8096` - Jellyfin

---

**Audit Complete**
All findings documented. Dashboard is well-architected for offline-first use with clear degradation paths.
