# OMEGA Dashboard - Product Requirements Document

## Overview
OMEGA Dashboard is a single-page, offline-first web dashboard for a Raspberry Pi "cyberdeck" device. The UI features a premium, Apple-like design, responsive layout, and polished dark/light mode themes.

## Target Users
- Family members using OMEGA cyberdeck devices
- Non-technical users who need clear visual indicators and intuitive controls
- Users in offline or low-connectivity environments
- Operators under stress who need larger tap targets and clear status indicators

---

## ✅ COMPLETED: Community Hub - Full Operations Hub Upgrade (January 9, 2026)

### Overview Tab - Operations Hub Features
| Feature | Status | Notes |
|---------|--------|-------|
| **Readiness Snapshot** | ✅ | 6 domain tiles (Medical, Comms, Security, Food & Water, Engineering, Logistics) |
| **Domain Tile Data** | ✅ | Qualified count, online count, redundancy level, status badge (OK/WARN/P0) |
| **Domain Deep Links** | ✅ | Clicking domain tile navigates to Analytics with filter |
| **Community Pulse** | ✅ | Online/Offline/New Members (7d)/Comms Activity (24h) |
| **Open Incidents Row** | ✅ | Admin sees count + click to incidents; non-admin sees lock + "—" |
| **Single Points of Failure** | ✅ | Panel showing skills with 0-1 holders, P0/P1 badges, Task/Candidates buttons |
| **Top Strengths** | ✅ | Top 5 skills with total/online counts, deep link to Directory |
| **Skill Gaps** | ✅ | Critical skills with lowest coverage, deep link to Directory |
| **System Recommendations** | ✅ | Actionable recs with priority badges, Task/Discuss/Members buttons, mark addressed |
| **Pinned Bulletins** | ✅ | Top 3 bulletins with severity dots, View All link to Comms |
| **Recent Activity** | ✅ | Last 3 activity items |
| **Data Quality Card** | ✅ | Profile completeness %, incomplete count, missing skills count |
| **Profile Reminder Modal** | ✅ | Copyable announcement template for profile completion |
| **My Privacy Settings** | ✅ | Button opens modal with toggle switches for age/height/weight/education |
| **Admin Governance Snapshot** | ✅ | Open incidents, last 7d incidents, threshold counts, at-risk members (admin-only) |
| **Member Roster Preview** | ✅ | 8 member mini-cards with search field, View All link |
| **Collapsible Privacy Banner** | ✅ | Remembers collapsed state per session |

### Directory Tab - Full Roster
| Feature | Status | Notes |
|---------|--------|-------|
| **Search** | ✅ | Searches displayName, skills labels, language labels |
| **Online Only Toggle** | ✅ | Filter to show only online members |
| **Filters Panel** | ✅ | Skills multi-select, Languages multi-select, Education select, Class select |
| **Sort Options** | ✅ | Online First (default), Name A-Z, Most Skilled |
| **Profile Card Grid** | ✅ | Photo, name, status dot, top 3 skills, languages, conditional fields |
| **Privacy Redaction** | ✅ | Fields show "Hidden" with eye-off icon for non-opted-in, non-admin viewers |
| **Admin Score Badge** | ✅ | Admin sees community score with color-coded threshold status |
| **View/DM Buttons** | ✅ | Hover actions on cards |
| **Profile Drawer** | ✅ | Full profile sheet with all skills, languages, certifications |
| **Drawer Redaction** | ✅ | Hidden fields in drawer show "Hidden" for non-admins |
| **Clear Filters** | ✅ | Reset all filters button |
| **Results Count** | ✅ | Shows "X of Y members" with filtered indicator |

### RBAC + Privacy + Deep Linking
| Feature | Status | Notes |
|---------|--------|-------|
| **Role Model** | ✅ | guest (2 tabs), member (4 tabs), admin (5 tabs) |
| **RequireRole Guard** | ✅ | Reusable component with fallback and redirect |
| **Route-level Protection** | ✅ | Direct nav to incidents as non-admin shows toast + redirect |
| **redactProfile Helper** | ✅ | Returns null for non-opted fields; admin sees all |
| **Privacy Flags** | ✅ | showAge, showHeightWeight, showEducation per profile |
| **URL Tab Sync** | ✅ | `?tab=overview|analytics|directory|comms|incidents` |
| **Directory Deep Links** | ✅ | `?q=`, `?skills=`, `?languages=`, `?online=true` |
| **Lazy URL Parsing** | ✅ | Initial state from URL params without effect loops |
| **QA Checklist** | ✅ | Dev-only panel with checkable test scenarios |

### Mock Data Module
| Feature | Status | Notes |
|---------|--------|-------|
| **Centralized Module** | ✅ | `/app/frontend/src/mock/communityMockData.js` |
| **15 Profiles** | ✅ | Varied skills, languages, education, privacy flags |
| **Canonical Skill Tags** | ✅ | `Medical.FirstAid`, `Comms.HAM`, etc. with labels |
| **Domain Config** | ✅ | 6 domains with colors, icons, labels |
| **Language Codes** | ✅ | BCP-47 codes with labels and flags |
| **Analytics Summary** | ✅ | Pre-aggregated population, coverage, SPoF, strengths, gaps |
| **Comms Preview** | ✅ | Pinned bulletins, recent activity, stats |
| **Incidents + Scores** | ✅ | Mock incidents, score config, calculateMemberScores() |

### Files Created/Modified
- `/app/frontend/src/mock/communityMockData.js` - NEW: Centralized mock data module
- `/app/frontend/src/components/CommunityHub.jsx` - REWRITTEN: Full Operations Hub (~1600 lines)
- `/app/frontend/src/components/Header.jsx` - Community button added

---

## ✅ COMPLETED: Community Hub Phase 0 + Phase 1 (January 9, 2026)

### P0 Features Implemented
| Feature | Status | Notes |
|---------|--------|-------|
| **Capture Health Panel** | ✅ | Shows capture ON/OFF, interval, retention, missed snapshots %, avg latency, endpoint health dots |
| **Endpoint Freshness** | ✅ | Health/Metrics/Sensors/GPS/Backup endpoints with OK/Stale status + last poll time |
| **Data Freshness Warning** | ✅ | Yellow warning banner when any endpoint is stale |
| **Detection Rules Panel** | ✅ | Collapsible panel in Settings with 7 configurable rules |
| **Rule Thresholds** | ✅ | CPU/RAM/Disk/Temp/GPS Accuracy/Comms Duration/Backup Fails with warning & critical levels |
| **Sensitivity Presets** | ✅ | Low/Medium/High presets that adjust detection thresholds |
| **Smoothing Window** | ✅ | 3/5/10 samples or 15 min averaging to reduce false positives |
| **Baseline Window** | ✅ | 6h/12h/24h/7d baseline for anomaly detection |
| **Incidents Tab** | ✅ | New sub-tab with badge showing open incident count |
| **Incident Timeline View** | ✅ | Horizontal timeline with colored segments for each incident |
| **Incident List View** | ✅ | Table with Severity/Incident/Subsystem/Started/Duration/Status columns |
| **Incident Filters** | ✅ | Time range (1h-7d), Severity (Info/Warn/Critical), Subsystem, Status |
| **Incident Stats** | ✅ | Total, Open, Critical, Resolved (24h) counts at top |
| **Incident Detail Drawer** | ✅ | Right-side drawer with full incident analysis |
| **Summary Section** | ✅ | Plain English description, duration, subsystems, anomaly count, peak values |
| **Top Drivers** | ✅ | 3-5 metrics with delta vs baseline, correlation strength (high/medium/low) |
| **Likely Causes** | ✅ | 2-4 suggested causes with confidence labels and percentages |
| **Verify Checklist** | ✅ | Operator-only section with copyable shell commands |
| **Resolution Notes** | ✅ | Text area + "Mark Resolved" button + "Add Annotation" button |
| **Tooltips/Microcopy** | ✅ | All new terms have info icons with explanations |
| **Mobile Responsive** | ✅ | All panels adapt to mobile viewport |

### Data Model (Ready for Future Wiring)
```javascript
// Capture Health
{ capturing: boolean, interval: string, retention: string, missedSnapshots: { last1h: number, last12h: number }, avgLatency: number, endpoints: [{ id, name, status: 'ok'|'stale'|'degraded', lastPoll: ISO, latency: number }] }

// Detection Rules
{ cpu: { enabled: boolean, warning: number, critical: number }, ... }

// Incident
{ id, title, startTime, endTime, severity: 'info'|'warn'|'critical', subsystems: string[], status: 'open'|'monitoring'|'resolved', anomalyIds: string[], peakValues: {}, resolutionNotes?: string }
```

### Files Modified
- `/app/frontend/src/components/LogsAnalytics.jsx` - Added P0 components (~600 new lines)

---

## ✅ COMPLETED: LOGS Analytics (January 9, 2026)

### LOGS Analytics Features Implemented
| Feature | Status | Notes |
|---------|--------|-------|
| **LOGS Header Button** | ✅ | Premium emerald/cyan gradient pill button |
| **This Device Tab** | ✅ | Single device analytics with full monitoring |
| **All Nodes Tab** | ✅ | Fleet comparison and derived intelligence |
| **Snapshot Controls** | ✅ | Capture toggle, interval (15s/30s/60s/5m), retention (12h/24h/7d), export JSON, clear history |
| **Health Index** | ✅ | 0-100 score with trend arrow and sparkline |
| **System Charts** | ✅ | CPU/RAM/Disk, Temp/Humidity, GPS, Comms timelines (recharts) |
| **Time Range Selector** | ✅ | 1h/6h/12h/24h/7d options |
| **Window Comparison** | ✅ | Last 12h vs Previous 12h with delta & percent changes |
| **Anomaly Engine** | ✅ | Detects temp spikes, comms degradation, backup failures, CPU spikes |
| **Raw Snapshots Table** | ✅ | Collapsible table with row click for detail drawer |
| **Snapshot Detail Drawer** | ✅ | Formatted + JSON view with diff highlights |
| **Fleet Summary** | ✅ | Fleet Readiness Score, Outlier Detection, Capability Coverage |
| **Consensus Events** | ✅ | Detects synchronized issues across multiple nodes |
| **Node Roster** | ✅ | Cards with filters (all/degraded/unavailable) and sorting |
| **Compare Nodes** | ✅ | Interactive comparison tool with overlay charts |
| **Data Model Ready** | ✅ | Includes node_id/node_name for future wiring to port 8093 |

### Files Created
- `/app/frontend/src/components/LogsAnalytics.jsx` - Complete analytics component (~1200 lines)
- Updated `/app/frontend/src/components/Header.jsx` - Added LOGS button

---

## ✅ COMPLETED: Help Center (Manual App) (January 9, 2026)

### Help Center Features Implemented
| Feature | Status | Notes |
|---------|--------|-------|
| **Header Button** | ✅ | Premium pill/glass button centered in header ("Help Center" desktop, "Help" mobile) |
| **Search Functionality** | ✅ | Live search across categories, troubleshooting, glossary, and comms methods |
| **15 Category Cards** | ✅ | Getting Started, Cheat Sheet, Installed vs Optional, etc. (exact order per spec) |
| **"Need help fast?" Panel** | ✅ | 3 quick fix buttons for common issues |
| **Cheat Sheet (Verbatim)** | ✅ | All URLs, data paths, services, operator commands with copy buttons |
| **Communications Hub** | ✅ | All 5 methods with "What/How/Analogy/Use when" format + status colors |
| **Troubleshooting Textbook** | ✅ | 9 entries (A-I) with Symptom→Cause→Fix→Verify format |
| **Operator Only Callouts** | ✅ | Terminal-style blocks with amber styling |
| **Glossary** | ✅ | All terms with plain English definitions |
| **Appendix** | ✅ | What's Estimated vs Exact section |
| **Back to Top Button** | ✅ | Appears after scrolling 400px |
| **Print Button** | ✅ | window.print() integration |
| **Back to Dashboard** | ✅ | Returns to dashboard without state loss |
| **Mobile Optimized** | ✅ | Responsive layout, shortened labels |
| **Keyboard Accessible** | ✅ | All interactive elements focusable |

### Files Created
- `/app/frontend/src/components/HelpCenter.jsx` - Complete Help Center component (~1500 lines)
- Updated `/app/frontend/src/components/Header.jsx` - Added Help Center button

---

## ✅ COMPLETED: Camera Tile Redesign & Music Player Verification (January 9, 2026)

### Camera Tile Redesign
| Feature | Status | Notes |
|---------|--------|-------|
| **No Constant Live Feed** | ✅ | Camera activates ONLY when user taps capture button |
| **4 Capture Modes** | ✅ | Daily Diary, Photo, Video, Voice Memo with unique gradients |
| **Data Overlay Options** | ✅ | Date, Time, Location, Temperature, Battery, All Metrics |
| **Overlay Preview** | ✅ | Live preview of selected overlays on camera view |
| **Select All/Clear All** | ✅ | Quick buttons to toggle all overlay options |
| **Media Gallery** | ✅ | List/Grid view with filters (All, Photos, Videos, Voice) |
| **Timestamps** | ✅ | All media items show date/time, duration, tagged person |
| **"DATA" Badge** | ✅ | Indicates media with overlay data embedded |
| **Storage Info** | ✅ | Shows storage usage (2.4 GB / 32 GB) with progress bar |
| **Tag Person** | ✅ | Option to associate media with a person |

### Music Player (Already Implemented - Verified)
| Feature | Status | Notes |
|---------|--------|-------|
| **Album Art** | ✅ | Gradient-colored album art with animated visualizer |
| **Player Controls** | ✅ | Play/Pause, Skip, Previous, Shuffle, Repeat |
| **Progress Bar** | ✅ | Clickable scrubber with time display |
| **Volume Control** | ✅ | Slider with mute toggle |
| **Lyrics Section** | ✅ | Toggleable lyrics panel with verse/chorus sections |
| **Favoriting** | ✅ | Pink heart icon to favorite tracks |
| **Playlist Management** | ✅ | "Add to Playlist" button, "Create New Playlist" option |
| **Track List** | ✅ | All tracks with artist, duration, favorite status |

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
│   ├── CameraTile.jsx               # REWRITTEN: Activate-on-click, data overlays, gallery
│   ├── SecurityTile.jsx             # Help/Troubleshoot integrated
│   ├── MusicTile.jsx                # Help/Troubleshoot integrated
│   ├── PowerTile.jsx                # UPDATED: Field-use summary, Fahrenheit, checklist
│   ├── CommunityTile.jsx            # UPDATED: Status Report, image polls
│   ├── EntertainmentTile.jsx        # Full Music Player with lyrics, playlists
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

### Community Hub - Upcoming Phases
| Phase | Feature | Priority |
|-------|---------|----------|
| **Phase 2** | Overview Tab - Full implementation with charts | P1 |
| **Phase 3** | Analytics Tab - Coverage matrix, gap analysis, reports | P1 |
| **Phase 4** | Directory Tab - Full search, profiles, Team Builder | P1 |
| **Phase 5** | Comms Tab - Announcements, feeds, polls, tasks | P1 |
| **Phase 6** | Incident Reports Tab - Full incident management | P1 |

### LOGS Observability - P1 Features
- Anomaly Feed Upgrades
- Annotations system
- Report Generator
- Service Reliability Panel

### LOGS Observability - P2 Features
- Raw Log Explorer

### Lower Tiles Refactor (Optional)
- HotspotTile, PowerTile, SecurityTile already have purpose-built layouts
- Consider standardizing if user wants visual consistency

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

*Last Updated: January 9, 2026*
*Current Status: Community Hub Phase 0+1 COMPLETE*
*All data remains MOCKED. Ready for Pi backend integration.*
