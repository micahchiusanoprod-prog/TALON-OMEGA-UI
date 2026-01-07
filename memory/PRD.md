# OMEGA Dashboard - Product Requirements Document

## Overview
OMEGA Dashboard is a single-page, offline-first web dashboard for a Raspberry Pi "cyberdeck" device. The UI features a premium, Apple-like design, responsive layout, and polished dark/light mode themes.

## Target Users
- Family members using OMEGA cyberdeck devices
- Non-technical users who need clear visual indicators and intuitive controls
- Users in offline or low-connectivity environments

---

## ✅ COMPLETED: P0 UI/UX Revisions (January 7, 2026)

### Standardized Help/Troubleshooting/Legend System

| Feature | Status | Notes |
|---------|--------|-------|
| **TileHelpTabs Component** | ✅ | Reusable component with Help/Troubleshoot/Legend tabs |
| **QuickHelpTips Component** | ✅ | Collapsible inline tips at top of tiles |
| **InlineLegend Component** | ✅ | Compact inline status legend |
| **HelpButton Component** | ✅ | Small ? button with hover popover |
| **Camera Tile Help** | ✅ | Standardized Help/Troubleshoot/Legend integrated |
| **Security Tile Help** | ✅ | Standardized Help/Troubleshoot/Legend integrated |
| **Music Tile Help** | ✅ | Standardized Help/Troubleshoot/Legend integrated |

### Comms Availability Panel Enhancements

| Feature | Status | Notes |
|---------|--------|-------|
| **Radio/SDR Transport** | ✅ | New transport method added |
| **Status Color Clarity** | ✅ | Green=Available, Yellow=Degraded, Red=Unavailable |
| **Status Badges** | ✅ | "2 UP", "1 WEAK", "2 DOWN" summary badges |
| **"Sending via X" Bar** | ✅ | Clear indicator of selected transport |
| **Degraded Explanation** | ✅ | Inline panel with "What Degraded means", causes, fixes |
| **Unavailable Explanation** | ✅ | Inline panel with causes and fixes |
| **Helper Text** | ✅ | "Select a transport... Green=ready, Yellow=limited, Red=offline" |

### Node Detail View Upgrades

| Feature | Status | Notes |
|---------|--------|-------|
| **Mini Map Panel** | ✅ | Shows node location on OpenStreetMap |
| **Node Pin** | ✅ | Status-colored marker with node name |
| **Accuracy Circle** | ✅ | Visual accuracy radius on map |
| **Fix Status Badge** | ✅ | 3D Fix / 2D Fix / No Fix indicator |
| **GPS Status Bar** | ✅ | Fix status, satellites below map |
| **Open in Maps Button** | ✅ | Links to Google Maps |
| **US Units** | ✅ | Accuracy in feet, speed in mph |

---

## ✅ COMPLETED: P0 Power Tile (January 7, 2026)

| Feature | Status | Notes |
|---------|--------|-------|
| **Battery Display** | ✅ | Percentage, voltage, current, temperature, health |
| **Runtime Estimate** | ✅ | Time remaining at current draw |
| **Battery Bar** | ✅ | Visual bar with color-coded status |
| **Net Flow Indicator** | ✅ | +/- watts showing charging/discharging |
| **Charge Sources Grid** | ✅ | Solar, AC, Vehicle 12V, USB-C with active status |
| **Consumption Breakdown** | ✅ | Bar chart showing CPU/Display/Radios/Other |
| **Alerts Section** | ✅ | Warning/critical alerts with timestamps |
| **Help/Troubleshoot/Legend** | ✅ | Standardized help system integrated |

---

## ✅ COMPLETED: P1 Community Tile (January 7, 2026)

| Feature | Status | Notes |
|---------|--------|-------|
| **Social Feed** | ✅ | Twitter-like scrollable post feed |
| **Post Types** | ✅ | Regular posts, Alerts (urgent), Polls |
| **Alert Posts** | ✅ | Red badge, red border, high priority |
| **Poll Posts** | ✅ | Yellow badge, voting options with percentages |
| **Reactions** | ✅ | 👍❤️😮😢🎉 emoji reactions with counts |
| **Reaction Picker** | ✅ | Click to open emoji selector |
| **Comments** | ✅ | Expandable comment threads, add new comments |
| **New Post Composer** | ✅ | Post/Alert/Poll type selector |
| **Poll Composer** | ✅ | Add options (2-4), remove options |
| **Filter Tabs** | ✅ | All / Alerts / Polls filters |
| **Sync Status** | ✅ | "Synced" vs "Pending sync" indicators |
| **Help/Troubleshoot/Legend** | ✅ | Standardized help system integrated |

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
| **Comms Availability Panel** | ✅ | 5 transport cards (LAN, Mesh, SDR, SMS, HF) with status indicators |
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
| **Power Tile** | ✅ | Battery monitoring, charge sources, consumption breakdown |
| **Community Tile** | ✅ | Social feed with posts, alerts, polls, reactions, comments |

---

## ✅ COMPLETED: Hotkeys Customization (QoL)

| Feature | Status | Notes |
|---------|--------|-------|
| **Hotkeys Bar** | ✅ | Top row with 8 default quick access buttons |
| **Customize Modal** | ✅ | Add/remove/reorder hotkeys |
| **localStorage Persistence** | ✅ | Selection survives refresh |
| **27 Available Hotkeys** | ✅ | 6 categories: Default, Navigation, Comms, System, Tools, Entertainment |
| **Reset to Default** | ✅ | One-click restore to default 8 |

---

## Files Implemented

```
/app/frontend/src/
├── components/
│   ├── Dashboard.jsx                # Main dashboard with all tiles
│   ├── AllyCommunicationsHub.jsx    # Main hub with 5 tabs, Comms Panel, Help button
│   ├── CameraTile.jsx               # Camera with Help/Troubleshoot/Legend
│   ├── SecurityTile.jsx             # Security with Help/Troubleshoot/Legend
│   ├── MusicTile.jsx                # Music with Help/Troubleshoot/Legend
│   ├── PowerTile.jsx                # Power monitoring with all features
│   ├── CommunityTile.jsx            # Social feed with posts/alerts/polls
│   ├── HotkeysBar.jsx               # Customizable hotkeys with localStorage
│   └── ally/
│       ├── NodeCard.jsx             # Individual node card with status badges
│       ├── NodeDetailsDrawer.jsx    # Full node details with mini-map
│       ├── NodeAvatarStrip.jsx      # Compact horizontal node list
│       ├── NodeMiniMap.jsx          # Mini map for node detail view
│       ├── MessagingModal.jsx       # DM modal with templates
│       ├── BroadcastModal.jsx       # Broadcast with confirmation
│       ├── AllyMapView.jsx          # Map view with GPS status bar and controls
│       ├── LazyMapContent.jsx       # Leaflet map with markers and popups
│       ├── GpsStatusBar.jsx         # GPS fix status bar (US units: feet)
│       ├── GpsGuide.jsx             # Educational GPS guide (US units)
│       ├── AllyHubHelp.jsx          # Help modal and tab descriptions (5 tabs)
│       ├── CommsAvailabilityPanel.jsx # Enhanced transport cards with Radio/SDR
│       ├── CommsKnowledge.jsx       # Field manual (US units: miles)
│       └── Codebook.jsx             # Searchable codebook with compose helper
├── components/ui/
│   └── TileHelpTabs.jsx             # Standardized Help/Troubleshoot/Legend template
├── services/
│   └── allyApi.js                   # API service with mock/live support
├── utils/
│   └── scrollLock.js                # Scroll position management
└── config.js                        # Central configuration
```

---

## Test Reports

- `/app/test_reports/iteration_1.json` - Ally Hub comprehensive test (100% pass)
- `/app/test_reports/iteration_2.json` - Chat size increase + Map tab test (100% pass)
- `/app/test_reports/iteration_3.json` - GPS Status Bar, GPS Guide, Help pattern test (100% pass)
- `/app/test_reports/iteration_4.json` - Comms Panel, Codes Tab, Knowledge Tab test (100% pass)
- `/app/test_reports/iteration_5.json` - P0 revisions (US units, compact nodes, comms clarity) + P1 tiles (100% pass)
- `/app/test_reports/iteration_6.json` - P0 UI Revisions: TileHelpTabs, Radio/SDR, Node Mini Map, Power Tile (100% pass)
- `/app/test_reports/iteration_7.json` - P1 Community Tile: Posts, Alerts, Polls, Reactions, Comments (100% pass)

---

## P2 Backlog / Future Work

### Pi Backend Integration (When Deployed)
- Set `enableMockData: false`
- Configure `REACT_APP_PI_API_URL` and `REACT_APP_PI_API_KEY`
- Test live connectivity
- Wire GPS status to real GPS data from Pi
- Wire Comms status to actual transport availability
- Wire Camera to actual camera hardware
- Wire Security to fingerprint sensor
- Wire Music to audio player backend
- Wire Power to real battery/charging data
- Wire Community to mesh network sync

### Feature Completion
- Full GPS Map enhancements (mesh lines, signal circles, route drawing)
- "My Location" button to use device's actual GPS
- Signal History mini-chart for GPS Status Bar (when real data available)
- Full Hero Search implementation
- Backups feature
- KeySync feature
- Encrypted DMs
- Hotkey actions (navigation, modal opening, etc.)
- GIF picker for Community posts (UI-stubbed)

### Enhancements
- Push notifications for broadcasts
- Offline message sync on reconnect
- Advanced node statistics and graphs
- Cluster markers when zoomed out (optional)
- Community post media attachments

---

*Last Updated: January 7, 2026*
*Current Status: Full Preview Phase COMPLETE (P0 + P1)*
*All UI/UX complete with mock data. Ready for Pi backend integration.*
