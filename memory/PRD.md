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
| **Global Chat** | ✅ | Visible in tile, instant posting |
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
│   ├── AllyCommunicationsHub.jsx    # Main hub with Global Chat, Status Dropdown
│   └── ally/
│       ├── NodeCard.jsx             # Individual node card with status badges
│       ├── NodeDetailsDrawer.jsx    # Full node details drawer
│       ├── MessagingModal.jsx       # DM modal with templates
│       └── BroadcastModal.jsx       # Broadcast with confirmation
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

---

## Backlog / Future Work

### P1 - Pi Backend Integration (When Deployed)
- Set `enableMockData: false`
- Configure `REACT_APP_PI_API_URL` and `REACT_APP_PI_API_KEY`
- Test live connectivity

### P2 - Feature Completion
- Full GPS Map implementation
- Full Hero Search implementation
- Backups feature
- KeySync feature
- Encrypted DMs

### P3 - Enhancements
- Push notifications for broadcasts
- Offline message sync on reconnect
- Advanced node statistics and graphs

---

*Last Updated: January 7, 2026*
*Current Status: Ally Communications Hub COMPLETE (Preview Phase)*
*Next: Deploy to Pi and test with live backend*
