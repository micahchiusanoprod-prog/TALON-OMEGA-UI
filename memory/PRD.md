# OMEGA Dashboard - Product Requirements Document

## Overview
OMEGA Dashboard is a single-page, offline-first web dashboard for a Raspberry Pi "cyberdeck" device. The UI features a premium, Apple-like design, responsive layout, and polished dark/light mode themes.

## Target Users
- Family members using OMEGA cyberdeck devices
- Non-technical users who need clear visual indicators and intuitive controls
- Users in offline or low-connectivity environments

## Core Features

### 1. Header Bar
- Fixed position with system status
- Real-time metrics (CPU, RAM, Disk, etc.)

### 2. Search Bar (Hero Search)
- Omnibox for searching Kiwix content, files, and commands
- Placeholder: "Search Kiwix library, files, or commands..."

### 3. Feature Tiles
Modular cards for various functionalities:
- **Quality of Life Tools**: Translator, Tasks, Notes, Hotspot QR, System Logs, Tools
- **Community**: Posts, Polls, Chat, Files
- **Entertainment**: Placeholder for media features
- **Environment**: Temperature, Humidity, Pressure, Air Quality sensors
- **Device Info**: CPU, RAM, Disk, Temperature metrics with status indicators
- **Hotspot Manager**: WiFi hotspot controls, connected devices, performance metrics

### 4. Ally Communications Hub ✅ COMPLETED
Full-featured communication module for coordinating with other OMEGA devices.

**Sub-features:**
- **Node List**: Displays all family OMEGA devices with:
  - Status indicators (Online/Degraded/Offline)
  - User status badges (GOOD/OKAY/NEED HELP)
  - Alert counts
  - Connection info (Link type, Signal strength, IP)
  - Action buttons (Message, Ping, Details)

- **Global Chat**: 
  - Always visible chat box in the tile
  - Real-time message feed
  - Sender status badges
  - Pinned emergency broadcasts (red styling, flashing animation)
  - Message input with send button

- **Node Details Drawer**:
  - Connection info (Status, Last Seen, Connection Type, Signal, IP/URL)
  - Identity (Hostname, Version, Uptime, Last Reboot)
  - System Health (CPU, RAM, Disk, Temp, Services OK/Down count)
  - Power (Battery %, Voltage, Current, Power, State, Runtime)
  - GPS Summary (Fix, Satellites, Lat/Lon, Accuracy, Speed)
  - Environment Sensors (Temp, Humidity, Pressure, Air Quality)
  - Active Alerts list
  - Actions: Message, Refresh, Favorite

- **Direct Messaging Modal**:
  - DM thread UI with message history
  - Delivery states: Sending → Sent → Delivered / Queued / Failed
  - Urgent toggle switch
  - Quick template buttons: "On my way!", "All good here", "Need assistance", "Wait for me", "Share your location", "Call when you can"
  - Retry mechanism for failed messages

- **Broadcast Modal**:
  - Severity selection: Info / Warning / Emergency
  - Title and message inputs
  - Live preview
  - Two-step confirmation before sending
  - Broadcasts appear pinned in Global Chat

- **Filters & Search**:
  - Filter buttons: All, Online, Offline, Alerts, Need Help
  - Search by name or ID
  - Clear/reset button when filters active
  - Empty state with "Clear filters" link

- **User Status Dropdown**:
  - Current status indicator on button (GOOD/OKAY/NEED HELP)
  - Status options with descriptions
  - NEED HELP supports optional note
  - Persists to localStorage

## Design System

### Theme
- **Dark Mode**: Deep dark background (#0a0f18), cyan accents, glassmorphism effects
- **Light Mode**: Baby blue gradient background, clean white cards

### Key Design Tokens
- Primary: Cyan (#00d4ff)
- Success: Green
- Warning: Amber
- Destructive: Red

### Glassmorphism
- `.glass`: Subtle blur with light border
- `.glass-strong`: Enhanced blur for prominent elements

### Animations
- `.animate-fade-in`: Entry animation
- `.animate-critical-flash`: Flashing effect for emergencies
- `.animate-critical-glow`: Pulsing glow for critical alerts

### Status Indicators
- Health-based color coding with legends
- Flashing animations for critical states

## Technical Architecture

### Frontend
- **Framework**: React.js with React Hooks
- **Styling**: Tailwind CSS with custom design tokens in index.css
- **Icons**: lucide-react
- **Notifications**: react-hot-toast, sonner

### State Management
- React useState/useEffect hooks
- localStorage for persistent user preferences

### API Layer
- **apiService.js**: Main backend API calls
- **allyApi.js**: Ally Communications API (currently mocked)
- **dataAdapter.js**: Data normalization layer

### Offline-First Design
- All components gracefully handle offline/missing data
- Mock data fallbacks for all API calls
- Optimistic UI updates for message sending
- Message queue with retry mechanism

## File Structure
```
/app/frontend/src/
├── App.js
├── index.css (Design System)
├── config.js (API endpoints, polling intervals)
├── components/
│   ├── AllyCommunicationsHub.jsx
│   ├── HotspotTile.jsx
│   ├── DeviceInfoTile.jsx
│   ├── EnvironmentTile.jsx
│   ├── Header.jsx
│   ├── Search.jsx
│   └── ally/
│       ├── NodeCard.jsx
│       ├── NodeDetailsDrawer.jsx
│       ├── MessagingModal.jsx
│       └── BroadcastModal.jsx
└── services/
    ├── apiService.js
    ├── allyApi.js
    └── dataAdapter.js
```

## Completed Work

### Phase 1: Core Dashboard ✅
- Dashboard layout with tile system
- Dark/Light mode toggle
- Design system implementation
- Glassmorphism effects

### Phase 2: Feature Tiles ✅
- Quality of Life tools tile
- Community tile
- Entertainment tile (placeholder)
- Environment sensors tile with status indicators
- Device Info tile with health monitoring
- Hotspot Manager tile with full controls

### Phase 3: Ally Communications Hub ✅ (Completed Jan 7, 2026)
- Node list with status badges
- Global Chat with pinned broadcasts
- Node Details Drawer (all planned fields)
- Direct Messaging with delivery states
- Broadcast Modal with confirmation step
- Filters and Search
- User Status Dropdown

## Backlog / Future Work

### P1 - Backend Integration
- Wire up all tiles to live backend API on port 8093
- Replace mock data with real API responses
- Implement proper error handling for network failures

### P2 - Feature Completion
- Full GPS Map implementation (currently placeholder)
- Full Hero Search implementation (search logic)
- Backups feature
- KeySync feature
- Encrypted DMs

### P3 - Enhancements
- Push notifications for broadcasts
- Offline message sync when reconnecting
- Advanced node statistics and graphs

## Testing

### Test Report
- **Location**: `/app/test_reports/iteration_1.json`
- **Status**: 100% pass rate
- **Features Tested**: All Ally Communications Hub features

### Test Coverage
- Node Details Drawer: PASS
- Direct Messaging: PASS
- Global Chat: PASS
- Broadcast Modal: PASS
- Filters & Search: PASS
- Status Dropdown: PASS
- Offline-first UI: PASS

---

*Last Updated: January 7, 2026*
*Status: Ally Communications Hub COMPLETE (UI with mock data)*
