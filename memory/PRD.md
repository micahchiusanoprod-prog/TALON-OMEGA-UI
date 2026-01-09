# OMEGA Dashboard - Product Requirements Document

## Overview
OMEGA Dashboard is a single-page, offline-first web dashboard for a Raspberry Pi "cyberdeck" device. The UI features a premium, Apple-like design, responsive layout, and polished dark/light mode themes.

## Target Users
- Family members using OMEGA cyberdeck devices
- Non-technical users who need clear visual indicators and intuitive controls
- Users in offline or low-connectivity environments
- Operators under stress who need larger tap targets and clear status indicators

---

## ✅ COMPLETED: FAQ Page & Tile Improvements (January 9, 2026)

### FAQ Help Center Page
| Feature | Status | Notes |
|---------|--------|-------|
| **FAQ Button in Header** | ✅ | HelpCircle icon with "FAQ" label, opens full-page modal |
| **Search Functionality** | ✅ | Search across all 12 categories and FAQ items |
| **Quick Navigation** | ✅ | Icon grid for all 12 categories (Connect, Navigate, Comms Hub, etc.) |
| **Expandable Categories** | ✅ | Each category shows count, expands to show Q&A items |
| **Category Content** | ✅ | 12 categories from PDF: Connect, Navigate, Comms Hub, Map & GPS, Sensors, Power, Library, Media, Files, Profiles, Admin, Fix It |
| **Still Need Help** | ✅ | Footer section with operator contact guidance |

### Environment Tile Improvements
| Feature | Status | Notes |
|---------|--------|-------|
| **Hero Temperature** | ✅ | Large 4xl font with °F and °C display |
| **Status Labels** | ✅ | Colored badges (Ideal, Comfortable, Normal, Good, etc.) |
| **Secondary Metrics** | ✅ | Humidity, Pressure, IAQ in 3-column grid |
| **Help Modal** | ✅ | Expandable sections for each metric |
| **Reference Ranges** | ✅ | Color-coded ranges with advice for each metric |
| **Status Legend** | ✅ | Optimal/Good/Caution/Alert with color indicators |
| **Pro Tips** | ✅ | Contextual tips for each sensor type |

### Device Info Tile Improvements
| Feature | Status | Notes |
|---------|--------|-------|
| **2x2 Grid Layout** | ✅ | CPU, RAM, Storage, Temperature in clean grid |
| **Progress Bars** | ✅ | Visual bars with status-based colors |
| **Status Labels** | ✅ | Low/Normal/High/Critical with color coding |
| **Uptime & Services** | ✅ | Combined row with service health dots |
| **Help Modal** | ✅ | All metrics documented with ranges and advice |
| **Status Legend** | ✅ | Good/Normal/High/Critical with descriptions |

### Weather Tile Improvements
| Feature | Status | Notes |
|---------|--------|-------|
| **OMEGA Sensors Section** | ✅ | Shows pressure trend from device sensors |
| **Pressure Trend** | ✅ | Rising/Falling/Steady with weather prediction |
| **Help Modal with Tabs** | ✅ | OMEGA Sensors, Forecast, Icons, Tips tabs |
| **Sensor Weather Data** | ✅ | Detailed explanations of how OMEGA sensors predict weather |
| **Reference Ranges** | ✅ | Pressure, Temperature, Humidity ranges for weather |
| **Icon Legend** | ✅ | Weather icon descriptions (Sunny, Cloudy, Rain, etc.) |

### Search & QuickTools Centering
| Feature | Status | Notes |
|---------|--------|-------|
| **Centered Layout** | ✅ | Both SearchBar and QuickToolsBar now centered |
| **max-w-3xl Container** | ✅ | Unified container for both elements |
| **Mobile & Desktop** | ✅ | Responsive centering on all viewports |

---

## ✅ COMPLETED: X/Twitter Style Community Feed (January 8, 2026)

### Community Tile Redesign
| Feature | Status | Notes |
|---------|--------|-------|
| **X-style Posts** | ✅ | Avatar, display name, @handle, timestamp, "..." menu |
| **Action Bar** | ✅ | Comment, Retweet, Like, Views, Bookmark, Share icons |
| **X Color Scheme** | ✅ | #1d9bf0 (blue), #f91880 (pink), #00ba7c (green), #71767b (gray) |
| **Tab Navigation** | ✅ | "For you", "Alerts", "Polls" with blue underline indicator |
| **Interactive States** | ✅ | Hover effects, filled icons for active states |
| **Bookmark Icon** | ✅ | SVG bookmark with fill state |
| **View Counts** | ✅ | Bar chart icon with K formatting |
| **Retweet Counts** | ✅ | Green highlight when retweeted |

### File Cleanup
| Action | Status | Notes |
|--------|--------|-------|
| **Remove MoviesTile.jsx** | ✅ | Obsolete - replaced by EntertainmentTile |
| **Remove ShowsTile.jsx** | ✅ | Obsolete - replaced by EntertainmentTile |
| **Remove GamesTile.jsx** | ✅ | Obsolete - replaced by EntertainmentTile |
| **Remove OmegaNetflixTile.jsx** | ✅ | Obsolete - replaced by EntertainmentTile |

---

## ✅ COMPLETED: UI/UX Revisions (January 7, 2026)

### Quick Access Bar (Minimal Design)
| Feature | Status | Notes |
|---------|--------|-------|
| **Larger Icons** | ✅ | w-10 h-10 icons in rounded squares for glove-friendly tap targets |
| **Full Readable Titles** | ✅ | "Comms Hub", "Map", "Flashlight", etc. - no truncation |
| **Generous Spacing** | ✅ | gap-3 between buttons, p-4 padding for minimal noise |
| **Minimal Header** | ✅ | "Quick Access" label with "Customize" button |

### Node Avatar Strip (Clearer Status)
| Feature | Status | Notes |
|---------|--------|-------|
| **Larger Avatars** | ✅ | w-16 h-16 avatar circles with w-7 h-7 status badges |
| **Always-Visible Status** | ✅ | Status labels (GOOD/OKAY/NEED HELP/OFFLINE) always visible at top |
| **GPS Indicator** | ✅ | Shows "GPS" text next to green dot when node has coordinates |
| **Generous Spacing** | ✅ | gap-4 between avatar cards, pt-3 pb-3 for scroll area |
| **Card Width** | ✅ | w-28 cards with clear name display |

### Node Detail View Upgrades
| Feature | Status | Notes |
|---------|--------|-------|
| **Copy Coordinates** | ✅ | Button copies "lat, lon" to clipboard with toast confirmation |
| **Open in Maps** | ✅ | Opens Google Maps with node coordinates |
| **Expand Map** | ✅ | Placeholder button for larger map view (shows toast info) |
| **Mini Map Panel** | ✅ | Shows node location with status-colored pin and accuracy circle |

### Power Tile Enhancements
| Feature | Status | Notes |
|---------|--------|-------|
| **Field-use Summary Row** | ✅ | Battery% \| Runtime \| Net flow \| Draw \| Top source - highlighted border |
| **US Units (Fahrenheit)** | ✅ | Temperature converted: Math.round(temp * 9/5 + 32)°F |
| **Runtime Collapsing Checklist** | ✅ | 7-step emergency checklist shows when runtime < 60 min |
| **Top Charge Source** | ✅ | Shows highest-wattage active source in summary |

### Community Tile Enhancements
| Feature | Status | Notes |
|---------|--------|-------|
| **Status Report Button** | ✅ | "Post Status Report" auto-fills from device data |
| **Status Report Content** | ✅ | #StatusReport with Battery%, GPS fix, Comms summary, timestamp |
| **Share as Alert Toggle** | ✅ | Appears after Status Report generated - posts as urgent |
| **Image Polls** | ✅ | Toggle to add images to poll options (UI-stubbed) |
| **Alert Filtering** | ✅ | Filter tabs: All / Alerts / Polls |

---

## ✅ COMPLETED: P0 + P1 Features (January 7, 2026)

### Standardized Help/Troubleshooting/Legend
- **TileHelpTabs.jsx** - Reusable component with Help/Troubleshoot/Legend tabs
- **QuickHelpTips** - Collapsible inline tips at top of tiles
- Integrated in: Camera, Security, Music, Power, Community tiles

### Comms Availability Panel
- **Radio/SDR Transport** - New method in Ally Hub (not separate tile)
- **Status Colors** - Green=Available, Yellow=Degraded, Red=Unavailable
- **"Sending via X"** bar - Shows selected transport with status
- **Inline Explanations** - "What Degraded means" with causes + fixes

### Power Tile (Mission-Critical)
- Battery monitoring with %, voltage, current, temperature (°F)
- Net flow indicator (charging/discharging)
- Charge sources grid (Solar, AC, Vehicle, USB-C)
- Consumption breakdown bar

### Community Tile (Offline Twitter-like)
- Posts, Alerts (urgent), Polls with voting
- Emoji reactions (👍❤️😮😢🎉)
- Expandable comment threads
- New post composer with type selector

---

## Files Implemented/Updated

```
/app/frontend/src/
├── components/
│   ├── Dashboard.jsx                # Main dashboard
│   ├── AllyCommunicationsHub.jsx    # Ally Hub with 5 tabs
│   ├── HotkeysBar.jsx               # UPDATED: Minimal design, larger tap targets
│   ├── CameraTile.jsx               # Help/Troubleshoot integrated
│   ├── SecurityTile.jsx             # Help/Troubleshoot integrated
│   ├── MusicTile.jsx                # Help/Troubleshoot integrated
│   ├── PowerTile.jsx                # UPDATED: Field-use summary, Fahrenheit, checklist
│   ├── CommunityTile.jsx            # UPDATED: Status Report, image polls
│   └── ally/
│       ├── NodeAvatarStrip.jsx      # UPDATED: Larger avatars, always-visible status
│       ├── NodeDetailsDrawer.jsx    # UPDATED: Copy/Expand/Maps buttons
│       ├── NodeMiniMap.jsx          # Mini map with node location
│       ├── CommsAvailabilityPanel.jsx # Radio/SDR, explanations
│       └── ... (other ally components)
└── components/ui/
    └── TileHelpTabs.jsx             # Standardized Help/Troubleshoot/Legend
```

---

## Test Reports

| Iteration | Focus | Result |
|-----------|-------|--------|
| 1 | Ally Hub comprehensive | 100% pass |
| 2 | Chat size + Map tab | 100% pass |
| 3 | GPS Status, Guide, Help | 100% pass |
| 4 | Comms Panel, Codes, Knowledge | 100% pass |
| 5 | US units, compact nodes, comms clarity + P1 tiles | 100% pass |
| 6 | TileHelpTabs, Radio/SDR, Node Mini Map, Power Tile | 100% pass |
| 7 | Community Tile: posts, alerts, polls, reactions, comments | 100% pass |
| **8** | **UI/UX Revisions: Quick Access, Node Avatars, Power, Community** | **100% pass** |

---

## P2 Backlog / Future Work

### Pi Backend Integration (When Deployed)
- Set `enableMockData: false`
- Configure `REACT_APP_PI_API_URL` and `REACT_APP_PI_API_KEY`
- Wire all tiles to live data

### Feature Completion
- Full GPS Map enhancements
- "My Location" button
- GIF picker for Community posts (beyond image polls)
- Backups, KeySync, encrypted DMs
- Hero Search omnibox

---

*Last Updated: January 8, 2026*
*Current Status: Full Preview Phase COMPLETE with X-style Community Feed*
*All data remains MOCKED. Ready for Pi backend integration.*
