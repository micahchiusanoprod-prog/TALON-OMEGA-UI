# OMEGA Dashboard Click Guide

## How to Navigate

### Home Dashboard (`/`)

#### Header (Desktop)
| Element | Test ID | Action |
|---------|---------|--------|
| LOGS button | `logs-btn` | Opens LOGS analytics modal |
| Community button | `community-btn` | Opens Community Hub modal |
| Help Center button | `help-center-btn` | Opens Help Center modal |
| Entertainment button | `entertainment-btn` | Navigates to /entertainment |
| Admin Console button | `admin-console-btn` | Opens Admin Console modal |
| Theme Toggle | `theme-toggle-btn` | Switches between dark/light theme |
| Language Selector | `language-selector` | Opens language dropdown |
| System Status | `system-status-btn` | Opens system status panel |

#### Header (Mobile - via Overflow Menu)
| Element | Test ID | Action |
|---------|---------|--------|
| Overflow Menu | `overflow-menu-btn` | Opens dropdown with Help/Admin options |
| Help Center (overflow) | `overflow-help-center` | Opens Help Center modal |
| Admin Console (overflow) | `overflow-admin-console` | Opens Admin Console modal |

#### Quick Tools Bar
| Tool | Test ID | Description |
|------|---------|-------------|
| Quick Guide | `tool-quickguide` | Field guide and reference |
| Calculator | `tool-calculator` | Scientific calculator |
| Translator | `tool-translator` | Text translation tool |
| SOS Beacon | `tool-sos` | Emergency beacon/alert |
| Currency | `tool-currency` | Currency converter |
| Dictionary | `tool-dictionary` | Dictionary lookup |
| Notes | `tool-notes` | Field notes editor |

### Entertainment Page (`/entertainment`)

| Tab | Test ID | Shows |
|-----|---------|-------|
| Overview | `nav-overview` | All entertainment options overview |
| Movies & TV | `nav-movies` | Kiwix/Jellyfin movie integration |
| Games | `nav-games` | Game launcher (planned) |
| Music | `nav-music` | Music player with Beat Maker |
| Photos | `nav-photos` | Photo gallery |
| Vault | `nav-vault` | Personal encrypted vault |
| File Drop | `nav-share` | LAN file sharing |

### Modal Navigation

#### LOGS Modal
- Close: `logs-close` button
- Tabs: `tab-this-device`, `tab-incidents`, `tab-all-nodes`

#### Community Hub Modal
- Close: `community-close` button
- Welcome modal: Dismiss with "Got it, thanks!" button
- Tabs: `tab-overview`, `tab-analytics`, `tab-directory`, `tab-comms`

#### Admin Console Modal
- Close: Escape key or click outside
- Sections: `admin-section-fleet`, `admin-section-roster`, `admin-section-broadcast`, `admin-section-audit`

#### Help Center Modal
- Close: `help-center-close` button

## Theme Switching
- Use `theme-toggle-btn` to switch between dark and light themes
- Theme is persisted in localStorage as `omega-theme`
