# OMEGA Dashboard - Product Requirements Document

## Overview
OMEGA Dashboard is a single-page, offline-first web dashboard for a Raspberry Pi "cyberdeck" device. The UI features a premium, Apple-like design, responsive layout, and polished dark/light mode themes.

## Target Users
- Family members using OMEGA cyberdeck devices
- Non-technical users who need clear visual indicators and intuitive controls
- Users in offline or low-connectivity environments

---

## ✅ COMPLETED: Ally Communications Hub (Preview Phase)

### Status: COMPLETE FOR PREVIEW
All UI/UX is complete and polished with mock data. Integration layer is production-ready for Pi deployment.

### Definition of Done - ALL ITEMS COMPLETE

| Feature | Status | Notes |
|---------|--------|-------|
| **Node Details Drawer** | ✅ | All fields (connection, identity, system health, power, GPS, sensors, alerts) |
| **Missing field handling** | ✅ | Graceful N/A display without breaking layout |
| **Direct Messaging Modal** | ✅ | Thread UI, delivery states (Sent/Queued/Failed) |
| **Urgent toggle + templates** | ✅ | 6 quick templates, urgent flag |
| **Global Chat** | ✅ | Visible in tile, instant posting, **increased height (h-64/h-72/h-80)** |
| **Broadcast pinning** | ✅ | Red styling, flashing animation |
| **Broadcast Modal** | ✅ | Severity selection + confirmation step |
| **Alerts badge update** | ✅ | Increments on broadcast |
| **Filters** | ✅ | All/Online/Offline/Alerts/Need Help |
| **Search** | ✅ | By name or ID |
| **Clear/reset** | ✅ | Obvious clear button |
| **Status Dropdown** | ✅ | GOOD/OKAY/NEED HELP with note |
| **Status time display** | ✅ | "set X min ago" |
| **Jump to Latest** | ✅ | Button appears when scrolled up |
| **Scroll position preservation** | ✅ | Modals don't change page scroll |
| **Offline-first UI** | ✅ | No jank, clear loading/empty states |
| **Integration adapter** | ✅ | API_BASE_URL + auth + graceful fallback |
| **Map Tab** | ✅ | Interactive Leaflet map with node locations |
| **Map Markers** | ✅ | Status-colored pins (green/amber/red/gray) |
| **Map Popups** | ✅ | Node name, status, last seen, location, role |
| **No GPS Panel** | ✅ | Lists nodes without GPS coordinates |
| **GPS Status Bar** | ✅ | Fix/No Fix indicator, timestamp, accuracy, satellites, altitude |
| **Quick Help Tips** | ✅ | Collapsible checklist when "No Fix" (SHTF-focused) |
| **GPS Guide Tab** | ✅ | Educational content with accordions (How GPS Works, Troubleshooting, etc.) |
| **Help Button** | ✅ | "?" in header opens help modal |
| **Tab Descriptions** | ✅ | Context + legend visible for each tab |
| **Map Controls** | ✅ | "All Nodes" + "My Location" (placeholder) buttons |
| **Comms Availability Panel** | ✅ | 4 transport cards (LAN, Mesh, SMS, HF) with status indicators |
| **Transport Selection** | ✅ | Click to select, info bar shows selected method + warnings |
| **Comms Availability Clarity** | ✅ | Helper text, RED for unavailable, explanation areas for degraded/unavailable |
| **Codes Tab (Codebook)** | ✅ | 49 codes, search, 5 category filters, compose helper |
| **Compose with Codes** | ✅ | Build multi-code messages, send to chat |
| **Comms Knowledge Tab** | ✅ | Field manual with Quick Decision Guide + accordion sections |
| **Transport Failure Modes** | ✅ | Each method shows how it works, when to use, failure modes, specs |
| **US Units** | ✅ | All GPS/map/tips use feet/miles (not meters/km) |
| **Compact Node List** | ✅ | Horizontal avatar strip with initials, status badges, short names |

---

## ✅ COMPLETED: New Dashboard Tiles (Preview Phase)

| Tile | Status | Notes |
|------|--------|-------|
| **Camera Tile** | ✅ | Daily Diary, Photos, Videos, Voice Memo sections |
| **Diary Timestamp Toggle** | ✅ | Overlay date + time while recording |
| **Person Tagging** | ✅ | Manual tag selector (placeholder) |
| **Security Tile** | ✅ | People list with permission levels (Admin/Member/Guest) |
| **Fingerprint Management** | ✅ | Add/remove fingerprint UI (placeholder) |
| **Security Education Tab** | ✅ | How to add fingerprints, permissions, troubleshooting |
| **Music Tile** | ✅ | Mini player, Most Played, Liked, Albums sections |
| **Music Placeholders** | ✅ | Lyrics + Music Videos structure (coming soon) |

---

## ✅ COMPLETED: Hotkeys Customization (QoL)

| Feature | Status | Notes |
|---------|--------|-------|
| **Hotkeys Bar** | ✅ | Top row with 8 default quick access buttons |
| **Customize Modal** | ✅ | Add/remove/reorder hotkeys |
| **localStorage Persistence** | ✅ | Selection survives refresh |
| **27 Available Hotkeys** | ✅ | 6 categories: Default, Navigation, Comms, System, Tools, Entertainment |
| **Reset to Default** | ✅ | One-click restore to default 8 |

### Integration Layer (Production-Ready)

The integration layer in `allyApi.js` is ready for Pi deployment:

#### Configuration (`config.js`)
```javascript
api: {
  baseUrl: process.env.REACT_APP_PI_API_URL || 'http://127.0.0.1:8093/cgi-bin',
  apiKey: process.env.REACT_APP_PI_API_KEY || '',
  timeout: 5000,
},
features: {
  enableMockData: true,  // Set false for Pi deployment
},
```

#### Environment Variables for Pi Deployment
```bash
REACT_APP_PI_API_URL=http://<PI_IP>:8093/cgi-bin
REACT_APP_PI_API_KEY=your-api-key-here
```

#### Authentication Support
Two authentication methods supported:
1. **X-API-Key header** (primary) - Added to all requests automatically
2. **?key= query param** (fallback) - Added when header may not pass through

```javascript
// Headers (primary auth)
headers: {
  'Content-Type': 'application/json',
  'X-API-Key': config.api.apiKey,
}

// URL (fallback auth)
url.searchParams.set('key', this.apiKey);
```

#### Offline-First Features
- ✅ "Disconnected" warning when API unreachable
- ✅ "Last updated" timestamp for offline state
- ✅ Message queue for outbound messages when offline
- ✅ Automatic retry with exponential backoff
- ✅ Local cache for all data
- ✅ localStorage persistence for user status

### Files Implemented
```
/app/frontend/src/
├── components/
│   ├── Dashboard.jsx                # Main dashboard with HotkeysBar and new tiles
│   ├── AllyCommunicationsHub.jsx    # Main hub with 5 tabs, Comms Panel, Help button
│   ├── CameraTile.jsx               # Camera with Diary, Photos, Videos, Voice Memo
│   ├── SecurityTile.jsx             # People + Fingerprints + Permissions + Education
│   ├── MusicTile.jsx                # Music player with sections
│   ├── HotkeysBar.jsx               # Customizable hotkeys with localStorage
│   └── ally/
│       ├── NodeCard.jsx             # Individual node card with status badges
│       ├── NodeDetailsDrawer.jsx    # Full node details drawer
│       ├── NodeAvatarStrip.jsx      # Compact horizontal node list
│       ├── MessagingModal.jsx       # DM modal with templates
│       ├── BroadcastModal.jsx       # Broadcast with confirmation
│       ├── AllyMapView.jsx          # Map view with GPS status bar and controls
│       ├── LazyMapContent.jsx       # Leaflet map with markers and popups
│       ├── GpsStatusBar.jsx         # GPS fix status bar (US units: feet)
│       ├── GpsGuide.jsx             # Educational GPS guide (US units)
│       ├── AllyHubHelp.jsx          # Help modal and tab descriptions (5 tabs)
│       ├── CommsAvailabilityPanel.jsx # Transport cards with explanations
│       ├── CommsKnowledge.jsx       # Field manual (US units: miles)
│       └── Codebook.jsx             # Searchable codebook with compose helper
├── services/
│   └── allyApi.js                   # API service with mock/live support
├── utils/
│   └── scrollLock.js                # Scroll position management
└── config.js                        # Central configuration
```

---

## API Endpoint Contract (For Pi Backend)

All endpoints use base URL from `REACT_APP_PI_API_URL` (default: `http://127.0.0.1:8093/cgi-bin`)

### Node Discovery
```
GET /api/ally/nodes
GET /api/ally/node/{node_id}/status
```

### Messaging
```
GET /api/ally/chat/global?since={timestamp}
POST /api/ally/chat/global  { text, priority }

GET /api/ally/chat/dm/{node_id}?since={timestamp}
POST /api/ally/chat/dm/{node_id}  { text, priority }
```

### Broadcast
```
POST /api/ally/broadcast  { title, message, severity }
```

### User Status
```
GET /api/ally/status/me
PUT /api/ally/status/me  { status, note }
```

### Actions
```
POST /api/ally/node/{node_id}/ping
POST /api/ally/node/{node_id}/refresh
```

---

## Other Existing Features

### Header Bar
- Fixed position with OMEGA logo
- Theme toggle (dark/light)

### Quality of Life Tools
- Translator, Tasks, Notes, Hotspot QR, System Logs, Tools

### Community Section
- Posts, Polls, Chat, Files tabs

### Entertainment
- Placeholder for media features

### Environment Tile
- Temperature, Humidity, Pressure, Air Quality sensors
- Color-coded status indicators with legends

### Device Info Tile
- CPU, RAM, Disk, Temperature metrics
- Health status indicators

### Hotspot Manager Tile
- WiFi hotspot controls
- Connected devices list
- Performance metrics

---

## Design System

### Themes
- **Dark Mode**: Deep dark (#0a0f18), cyan accents, glassmorphism
- **Light Mode**: Baby blue gradient, clean white cards

### Key Components
- Glassmorphism cards (`.glass`, `.glass-strong`)
- Status indicators with color coding
- Flashing animations for critical alerts
- Responsive layout with mobile support

---

## Test Reports
- `/app/test_reports/iteration_1.json` - Ally Hub comprehensive test (100% pass)
- `/app/test_reports/iteration_2.json` - Chat size increase + Map tab test (100% pass)
- `/app/test_reports/iteration_3.json` - GPS Status Bar, GPS Guide, Help pattern test (100% pass)
- `/app/test_reports/iteration_4.json` - Comms Panel, Codes Tab, Knowledge Tab test (100% pass)
- `/app/test_reports/iteration_5.json` - P0 revisions (US units, compact nodes, comms clarity) + P1 tiles (Camera, Security, Music, Hotkeys) (100% pass)

---

## Backlog / Future Work

### P1 - Pi Backend Integration (When Deployed)
- Set `enableMockData: false`
- Configure `REACT_APP_PI_API_URL` and `REACT_APP_PI_API_KEY`
- Test live connectivity
- Wire GPS status to real GPS data from Pi
- Wire Comms status to actual transport availability
- Wire Camera to actual camera hardware
- Wire Security to fingerprint sensor
- Wire Music to audio player backend

### P2 - Feature Completion
- Full GPS Map enhancements (mesh lines, signal circles, route drawing)
- "My Location" button to use device's actual GPS
- Signal History mini-chart for GPS Status Bar (when real data available)
- Full Hero Search implementation
- Backups feature
- KeySync feature
- Encrypted DMs
- Hotkey actions (navigation, modal opening, etc.)

### P3 - Enhancements
- Push notifications for broadcasts
- Offline message sync on reconnect
- Advanced node statistics and graphs
- Cluster markers when zoomed out (optional)

---

*Last Updated: January 7, 2026*
*Current Status: Full Preview Phase COMPLETE (Ally Hub, Camera, Security, Music, Hotkeys)*
*Next: Deploy to Pi and test with live backend*
