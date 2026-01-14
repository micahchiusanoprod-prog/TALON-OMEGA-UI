# OMEGA Dashboard - Click Guide

## How to Navigate Every Feature

This guide provides click paths to reach every interactive element in the UI.

---

## Route: / (Home Dashboard)

### Header Navigation (Desktop 1440px)
| Element | Click Path | What It Does | Screenshot |
|---------|------------|--------------|------------|
| LOGS | Click `[LOGS]` button | Opens LOGS Analytics modal with health metrics | `0003_modal_logs.jpg` |
| Community | Click `[Community]` button | Opens Community Hub with member directory | `0004_modal_community.jpg` |
| Help Center | Click `[Help Center]` button | Opens Help documentation | `0008_modal_help.jpg` |
| Entertainment | Click `[Entertainment]` button | Navigates to /entertainment | `0030_entertainment.jpg` |
| Admin Console | Click `[Admin Console]` button | Opens admin controls (fleet, broadcast, etc.) | `0009_modal_admin.jpg` |
| Status | Click `[Status]` button | Opens System Status panel | `0015_modal_status.jpg` |

### Header Navigation (Mobile 390px)
| Element | Click Path | What It Does | Screenshot |
|---------|------------|--------------|------------|
| LOGS | Click `[LOGS]` button | Opens LOGS Analytics modal | `mobile_dark/0003_modal_logs.jpg` |
| Community | Click `[Community]` icon | Opens Community Hub | `mobile_dark/0004_modal_community.jpg` |
| Entertainment | Click `[Sparkles]` icon | Navigates to /entertainment | `mobile_dark/0030_entertainment.jpg` |
| More | Click `[...]` overflow | Opens menu with Help Center + Admin Console | `mobile_dark/0045_overflow.jpg` |

### Quick Tools Bar
| Tool | Click Path | What It Does | Screenshot |
|------|------------|--------------|------------|
| Quick Guide | Scroll to tools bar → Click `[Quick Guide]` | Opens survival guide | `0038_tool_quickguide.jpg` |
| Calculator | Click `[Calculator]` | Opens calculator | `0039_tool_calculator.jpg` |
| Translator | Click `[Translator]` | Opens language translator | `0040_tool_translator.jpg` |
| SOS Beacon | Click `[SOS]` | Opens emergency SOS | `0041_tool_sos.jpg` |
| Currency | Click `[Currency]` | Opens currency converter | `0042_tool_currency.jpg` |
| Dictionary | Click `[Dictionary]` | Opens offline dictionary | `0043_tool_dictionary.jpg` |
| Field Notes | Click `[Notes]` | Opens note-taking modal | `0044_tool_notes.jpg` |

### Dashboard Tiles
| Tile | Location | Description |
|------|----------|-------------|
| Ally Communications | Top section | Shows mesh network nodes and communication methods |
| Community | Middle section | Shows family member status grid |
| Environment | Middle section | Shows temp, humidity, pressure, IAQ (mock) |
| Device Info | Middle section | Shows hostname, IP, uptime |
| Weather | Middle section | Shows current weather (mock) |
| Hotspot | Middle section | Shows WiFi AP status (mock) |
| Power | Middle section | Shows battery status (mock) |
| Camera | Middle section | Shows camera preview (mock) |
| Security | Middle section | Shows security alerts (mock) |
| Entertainment | Bottom section | Shows movies/TV carousel with View All button |

---

## Route: /entertainment

### Tab Navigation
| Tab | Click Path | What It Shows | Screenshot |
|-----|------------|---------------|------------|
| Overview | Click `[Overview]` tab | Continue Watching, Movie Night, Newly Added | `0030_entertainment.jpg` |
| Movies & TV | Click `[Movies & TV]` tab | Movie grid, TV show grid | `0031_ent_movies.jpg` |
| Games | Click `[Games]` tab | Games Hub with modes (PLANNED badge) | `0032_ent_games.jpg` |
| Music | Click `[Music]` tab | Music player, Beat Maker (MOCK badge) | `0033_ent_music.jpg` |
| Photos | Click `[Photos]` tab | Photos Hub placeholder | `0034_ent_photos.jpg` |
| Vault | Click `[Vault]` tab | Documents Vault (PLANNED badge) | `0035_ent_vault.jpg` |
| File Drop | Click `[File Drop]` tab | File sharing placeholder | `0036_ent_share.jpg` |

### Actions
| Action | Click Path | What It Does |
|--------|------------|--------------|
| Back | Click `[Dashboard]` button | Returns to home |
| Movie Night | Click `[Start Movie Night]` button | Opens Movie Night modal |
| New User Setup | Click floating button (bottom-right) | Placeholder for setup wizard |

---

## Modals

### LOGS Analytics
| Section | Content |
|---------|---------|
| Health Index | 0-100 score with color indicator |
| CPU | Usage percentage with bar |
| RAM | Usage percentage with bar |
| Disk | Usage percentage with bar |
| Temp | Temperature in Celsius |
| GPS | Fix status (none = red, fix = green) |
| Comms | Mesh status (available/unavailable) |
| Backup | Last backup status |

### Admin Console Tabs
| Tab | Click Path | Content | Screenshot |
|-----|------------|---------|------------|
| Fleet | Default tab | Node management | `0010_admin_fleet.jpg` |
| Broadcast | Click `[Broadcast]` | Alert broadcasting | Not captured |
| System | Click `[System]` | System controls | Not captured |
| Backups | Click `[Backups]` | Backup list | Not captured |
| Audit | Click `[Audit]` | Capability audit | Not captured |

### System Status Panel
| Section | Content | Screenshot |
|---------|---------|------------|
| CONNECTION INFO | Status (Connected/Not Connected) | `0015_modal_status.jpg` |
| CONFIGURATION | API Base, Kiwix Base, Mock Data flag | `0015_modal_status.jpg` |
| ENDPOINT STATUS | List of all endpoints with status badges | `0047_status_endpoints.jpg` |
| DEBUG INFO | Copy button for debug bundle | `0015_modal_status.jpg` |

---

## Badge Reference

| Badge | Meaning |
|-------|---------|
| `MOCK DATA` | UI functional, data is simulated |
| `PLANNED - NOT WIRED` | UI scaffold exists, backend not connected |
| `PLANNED - NOT IMPLEMENTED` | Placeholder only, no functionality |
| `LIVE` | Connected to real backend endpoint |
| `LOCKED` / `FORBIDDEN` | Requires authentication |
| `DEGRADED` | Partial functionality (hardware issue) |
| `NOT SET` / `NOT_CONFIGURED` | Feature not configured |
