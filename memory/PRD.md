# OMEGA Dashboard - Product Requirements Document

## Overview
OMEGA Dashboard is a single-page, offline-first web dashboard for a Raspberry Pi "cyberdeck" device. The UI features a premium, Apple-like design, responsive layout, and polished dark/light mode themes.

## Target Users
- Family members using OMEGA cyberdeck devices
- Non-technical users who need clear visual indicators and intuitive controls
- Users in offline or low-connectivity environments

---

## ✅ COMPLETED: Ally Communications Hub (Jan 7, 2026)

### Implementation Status: COMPLETE (Mock Data)

All Definition of Done requirements have been implemented and verified:

| Feature | Status | Notes |
|---------|--------|-------|
| Node Details Drawer | ✅ | All fields (connection, identity, system health, power, GPS, sensors, alerts) |
| Missing field handling | ✅ | Graceful N/A display without breaking layout |
| Direct Messaging Modal | ✅ | Thread UI, delivery states (Sent/Queued/Failed) |
| Urgent toggle + templates | ✅ | 6 quick templates, urgent flag |
| Global Chat | ✅ | Visible in tile, instant posting |
| Broadcast pinning | ✅ | Red styling, flashing animation |
| Broadcast Modal | ✅ | Severity selection + confirmation step |
| Alerts badge update | ✅ | Increments on broadcast |
| Filters | ✅ | All/Online/Offline/Alerts/Need Help |
| Search | ✅ | By name or ID |
| Clear/reset | ✅ | Obvious clear button |
| Status Dropdown | ✅ | GOOD/OKAY/NEED HELP with note |
| Status time display | ✅ | "set X min ago" |
| Jump to Latest | ✅ | Button appears when scrolled up |
| Scroll position preservation | ✅ | Modals don't change page scroll |
| Offline-first UI | ✅ | No jank, clear loading/empty states |

### Known Limitations (Current State)
- **All data is MOCKED** - No real backend connection yet
- Mock data is generated in `allyApi.js`
- Messages are "queued" but not actually sent
- Status changes persist to localStorage only (not shared across nodes)

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
│   └── allyApi.js                   # Mock API service (to be wired to real backend)
└── utils/
    └── scrollLock.js                # Scroll position management for modals
```

---

## 🔄 IN PROGRESS: Backend Wiring (Port 8093)

### Objective
Connect the Ally Communications Hub UI to the real backend API running on port 8093.

### Requirements
1. **Keep UI stable** - No layout/UX changes
2. **Clean data adapter layer** - Swap mock ↔ live via `config.features.enableMockData`
3. **Graceful fallback** - If endpoint fails, show cached/mock data + "Disconnected / Last updated"
4. **Retries + timeouts + cache** - Behave well offline

### Endpoint Contract Assumptions

All endpoints use base URL: `http://127.0.0.1:8093`

#### 1. Node Discovery/Status
```
GET /api/ally/nodes
Response:
{
  "nodes": [
    {
      "node_id": "omega-01",
      "name": "Dad's OMEGA",
      "role": "Primary",
      "ip": "192.168.4.2",
      "url": "http://192.168.4.2:3000",
      "status": "online" | "offline" | "degraded",
      "user_status": "good" | "okay" | "need_help" | null,
      "user_status_note": "Optional note text" | null,
      "user_status_set_at": "2026-01-07T12:00:00Z" | null,
      "last_seen": "2026-01-07T12:00:00Z",
      "link_type": "Hotspot" | "LAN" | "Mesh" | null,
      "rssi": -45 | null,
      "alerts_count": 0
    }
  ],
  "timestamp": "2026-01-07T12:00:00Z"
}
```

#### 2. Node Detailed Status
```
GET /api/ally/node/{node_id}/status
Response:
{
  "node_id": "omega-01",
  "identity": {
    "hostname": "omega-primary",
    "version": "1.0.0",
    "uptime": 86400,
    "last_reboot": "2026-01-06T12:00:00Z"
  },
  "system": {
    "cpu": 32,
    "ram": 45,
    "disk": 58,
    "temp": 51,
    "services": {
      "backend": "up",
      "kiwix": "up",
      "jellyfin": "up",
      "gps": "up",
      "sensors": "up"
    }
  },
  "power": {
    "battery_pct": 87,
    "volts": 12.4,
    "amps": 0.8,
    "watts": 9.9,
    "charge_state": "discharging",
    "runtime_s": 7200
  },
  "gps": {
    "fix": "3D",
    "sats": 12,
    "lat": 37.7749,
    "lon": -122.4194,
    "acc": 3.2,
    "speed": 0
  },
  "sensors": {
    "temp": 22.5,
    "hum": 45.2,
    "pressure": 1013.2,
    "iaq": 95
  },
  "alerts": [
    {
      "message": "Low battery warning",
      "severity": "warning",
      "timestamp": "2026-01-07T11:00:00Z"
    }
  ],
  "timestamp": "2026-01-07T12:00:00Z"
}
```

#### 3. Global Chat
```
GET /api/ally/chat/global?since={timestamp}
Response:
{
  "messages": [
    {
      "id": "msg-uuid",
      "sender": "omega-01",
      "sender_name": "Dad's OMEGA",
      "sender_status": "good",
      "text": "Message text",
      "timestamp": "2026-01-07T12:00:00Z",
      "priority": "normal" | "urgent" | "emergency",
      "status": "delivered",
      "broadcast_title": null | "EMERGENCY TITLE",
      "broadcast_severity": null | "info" | "warning" | "emergency"
    }
  ],
  "timestamp": "2026-01-07T12:00:00Z"
}

POST /api/ally/chat/global
Body:
{
  "text": "Message text",
  "priority": "normal" | "urgent"
}
Response:
{
  "id": "msg-uuid",
  "status": "sent" | "queued",
  "timestamp": "2026-01-07T12:00:00Z"
}
```

#### 4. Direct Messages
```
GET /api/ally/chat/dm/{node_id}?since={timestamp}
Response:
{
  "messages": [
    {
      "id": "msg-uuid",
      "sender": "omega-01" | "me",
      "text": "Message text",
      "timestamp": "2026-01-07T12:00:00Z",
      "status": "delivered" | "sent" | "queued" | "failed",
      "priority": "normal" | "urgent"
    }
  ],
  "timestamp": "2026-01-07T12:00:00Z"
}

POST /api/ally/chat/dm/{node_id}
Body:
{
  "text": "Message text",
  "priority": "normal" | "urgent"
}
Response:
{
  "id": "msg-uuid",
  "status": "sent" | "queued",
  "timestamp": "2026-01-07T12:00:00Z"
}
```

#### 5. Broadcast Alert
```
POST /api/ally/broadcast
Body:
{
  "title": "Broadcast title",
  "message": "Broadcast message",
  "severity": "info" | "warning" | "emergency"
}
Response:
{
  "id": "broadcast-uuid",
  "status": "sent" | "queued",
  "timestamp": "2026-01-07T12:00:00Z"
}
```

#### 6. User Status
```
GET /api/ally/status/me
Response:
{
  "status": "good" | "okay" | "need_help",
  "note": "Optional note" | null,
  "set_at": "2026-01-07T12:00:00Z" | null
}

PUT /api/ally/status/me
Body:
{
  "status": "good" | "okay" | "need_help",
  "note": "Optional note" | null
}
Response:
{
  "status": "good" | "okay" | "need_help",
  "note": "Optional note" | null,
  "set_at": "2026-01-07T12:00:00Z"
}
```

#### 7. Ping/Refresh
```
POST /api/ally/node/{node_id}/ping
Response:
{
  "rtt_ms": 45,
  "status": "success" | "failed"
}

POST /api/ally/node/{node_id}/refresh
Response:
{
  "status": "requested",
  "timestamp": "2026-01-07T12:00:00Z"
}
```

### Acceptance Test Criteria
1. ✅ Open Ally Hub → node list populates from 8093
2. ✅ Send Global Chat message → appears immediately and persists after refresh
3. ✅ Send DM to a node → appears and persists after refresh
4. ✅ Change status to NEED HELP w/ note → updates and persists after refresh

---

## Core Features (Existing)

### 1. Header Bar
- Fixed position with system status
- Real-time metrics (CPU, RAM, Disk, etc.)
- Theme toggle (dark/light)

### 2. Search Bar (Hero Search)
- Omnibox for searching Kiwix content, files, and commands
- Placeholder UI implemented

### 3. Feature Tiles
- **Quality of Life Tools**: Translator, Tasks, Notes, Hotspot QR, System Logs, Tools
- **Community**: Posts, Polls, Chat, Files
- **Entertainment**: Placeholder
- **Environment**: Temperature, Humidity, Pressure, Air Quality sensors
- **Device Info**: CPU, RAM, Disk, Temperature with status indicators
- **Hotspot Manager**: WiFi controls, connected devices, performance metrics

---

## Technical Architecture

### Frontend
- **Framework**: React.js with React Hooks
- **Styling**: Tailwind CSS with custom design tokens in index.css
- **Icons**: lucide-react
- **Notifications**: react-hot-toast, sonner

### Design System
- **Dark Mode**: Deep dark background (#0a0f18), cyan accents, glassmorphism
- **Light Mode**: Baby blue gradient, clean white cards
- **Animations**: Fade-in, critical flash, critical glow

### State Management
- React useState/useEffect hooks
- localStorage for user preferences (status, theme)

### API Layer
- **apiService.js**: Main backend API calls
- **allyApi.js**: Ally Communications API (mock → live transition)
- **dataAdapter.js**: Data normalization layer

### Offline-First Design
- Graceful fallback to mock/cached data
- Optimistic UI updates
- Message queue with retry mechanism

---

## Backlog / Future Work

### P1 - Backend Wiring (IN PROGRESS)
- Wire Ally Hub to port 8093 endpoints
- Implement data adapter for mock ↔ live switching
- Add proper error handling and offline fallback

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

## Test Reports
- `/app/test_reports/iteration_1.json` - Ally Hub comprehensive test (100% pass)

---

*Last Updated: January 7, 2026*
*Current Status: Ally Hub COMPLETE (mock) → Backend wiring IN PROGRESS*
