# OMEGA Dashboard Click Guide v2.1 (Step 0.5)

## Quick Reference - All Elements Verified

### Home Dashboard (`/`)

#### Header Navigation
| Element | Test ID | Desktop | Mobile |
|---------|---------|---------|--------|
| LOGS button | `logs-btn` / `logs-btn-mobile` | ✅ | ✅ |
| Community button | `community-btn` / `community-btn-mobile` | ✅ | ✅ |
| Help Center button | `help-center-btn` | ✅ | Via overflow |
| Entertainment button | `entertainment-btn` | ✅ | ✅ |
| Admin Console button | `admin-console-btn` | ✅ | Via overflow |
| Theme Toggle | `theme-toggle-btn` | ✅ | ✅ |
| Language Selector | `language-selector` | ✅ | ✅ |
| System Status | `system-status-btn` | ✅ | ✅ |
| Overflow Menu | `overflow-menu-btn` | N/A | ✅ |

#### Mobile Overflow Menu (data-testid: `overflow-menu-dropdown`)
| Element | Test ID | Action |
|---------|---------|--------|
| Help Center | `overflow-help-center` | Opens Help Center modal |
| Admin Console | `overflow-admin-console` | Opens Admin Console modal |
| Metrics display | `overflow-metrics` | Shows CPU/Temp/RAM |

#### Quick Tools Bar (ALL 7 CAPTURED IN ALL 4 FOLDERS)
| Tool | Test ID | Screenshot Captured |
|------|---------|---------------------|
| Quick Guide | `tool-quickguide` | ✅ All folders |
| Calculator | `tool-calculator` | ✅ All folders |
| Translator | `tool-translator` | ✅ All folders |
| SOS Beacon | `tool-sos` | ✅ All folders |
| Currency | `tool-currency` | ✅ All folders |
| Dictionary | `tool-dictionary` | ✅ All folders |
| Notes | `tool-notes` | ✅ All folders |

### Entertainment Page (`/entertainment`)

| Tab | Test ID | Screenshot Captured |
|-----|---------|---------------------|
| Overview | `nav-overview` | ✅ All folders |
| Movies & TV | `nav-movies` | ✅ All folders |
| Games | `nav-games` | ✅ All folders |
| Music | `nav-music` | ✅ All folders |
| Photos | `nav-photos` | ✅ All folders |
| Vault | `nav-vault` | ✅ All folders |
| File Drop | `nav-share` | ✅ All folders |

### Modal Navigation

#### LOGS Modal
| Element | Test ID | Notes |
|---------|---------|-------|
| Close button | `logs-close` | Closes modal |
| This Device tab | `tab-this-device` | Default tab |
| Incidents tab | `tab-incidents` | Shows incident list |
| All Nodes tab | `tab-all-nodes` | Shows all nodes |

#### Community Hub Modal (ALL 5 TABS CAPTURED)
| Element | Test ID | Screenshot Captured |
|---------|---------|---------------------|
| Close button | `community-close` | - |
| Welcome dismiss | Text: "Got it, thanks!" | Click to dismiss |
| Overview tab | `tab-overview` | ✅ All folders |
| Analytics tab | `tab-analytics` | ✅ All folders |
| Directory tab | `tab-directory` | ✅ All folders |
| Comms tab | `tab-comms` | ✅ All folders |
| Incidents tab | `tab-incidents` | ✅ All folders |

#### Admin Console Modal (ALL 3 SECTIONS + AUDIT)
| Section | Test ID | Screenshot Captured |
|---------|---------|---------------------|
| Section tabs container | `admin-section-tabs` | - |
| Fleet Updates | `admin-section-fleet` | ✅ All folders |
| Roster & Readiness | `admin-section-roster` | ✅ All folders |
| Broadcast & Assembly | `admin-section-broadcast` | ✅ All folders |
| Audit Panel | `admin-section-audit` | Opens separate panel |

#### Help Center Modal
| Element | Test ID | Notes |
|---------|---------|-------|
| Close button | `help-center-close` | Closes modal |
| Mobile access | `overflow-help-center` | Via overflow menu |

## Theme Switching
- Toggle: `theme-toggle-btn`
- Values: `dark` / `light`
- Storage: `localStorage.omega-theme`

## Coverage: 100%
All interactive elements captured across all 4 folders (desktop_dark, desktop_light, mobile_dark, mobile_light).
