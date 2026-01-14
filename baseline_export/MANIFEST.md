# OMEGA Dashboard Visual Baseline - v3.0 (Next-Phase UI Improvements)

Generated: 2025-01-14T03:45:00Z

## Summary

| Folder | Screenshots | Description |
|--------|-------------|-------------|
| desktop_dark | 32 | 1440x900 viewport, dark theme |
| desktop_light | 30 | 1440x900 viewport, light theme |
| mobile_dark | 29 | 390x844 viewport (iPhone 14), dark theme |
| mobile_light | 29 | 390x844 viewport (iPhone 14), light theme |
| **TOTAL** | **120** | Full parity with new features |

## New Features in v3.0

### 1. Progressive Disclosure
- Summary view (plain language + timestamp + action button)
- "Show Details" expansion (raw data, definitions, evidence)
- Components: `ProgressivePanel`, `PanelHelpIcon`

### 2. Help Guides Everywhere
- `HelpTooltip` component for acronyms/terms
- `PanelHelpIcon` on every major tile
- GLOSSARY with 12+ technical terms (CPU, RAM, TEMP, etc.)
- Help Center enhanced with Self-Test and Debug Bundle

### 3. Trust & Provenance
- `TrustBadge`: VERIFIED / DERIVED / ESTIMATED / UNKNOWN
- `ProvenanceStrip`: Source, Last Updated, Freshness
- Freshness indicators: LIVE / CACHED / STALE / UNKNOWN

### 4. Self-Test Runner
- Entry points: System Status Panel, Help Center
- Tests: Frontend, LocalStorage, API endpoints, GPS
- Status types: OK / DEGRADED / NOT_CONFIGURED / FORBIDDEN
- Results saved to localStorage

### 5. Debug Bundle
- Copy JSON Bundle: WIRED_LIVE
- ZIP Download: PLANNED
- Contents: BUILD_INFO, CONFIG_SNAPSHOT, self-test results, network logs, errors

### 6. Auth Gating (Role + PIN)
- Roles: guest / member / admin
- PIN unlock with 15-minute timeout
- Components: `PinEntryModal`, `AdminGate`
- Backend auth: PLANNED

### 7. Profile System
- localStorage-backed
- Fields: displayName, role
- Backend sync: PLANNED

## New Screenshots in v3.0

| ID | Description | Folders |
|----|-------------|---------|
| 0060_help_selftest_section | Help Center with Self-Test + Debug Bundle | All 4 |
| 0061_help_selftest_results | Help Center after running self-test | Desktop Dark |
| 0062_status_enhanced | System Status with enhanced debug | All 4 |
| 0063_status_selftest_results | System Status after self-test | Desktop Dark |

## Files Added/Modified

### New Files
- `/app/frontend/src/contexts/AuthContext.jsx` - Role + PIN auth
- `/app/frontend/src/contexts/EvidenceContext.jsx` - Evidence & self-test
- `/app/frontend/src/components/ui/ProgressiveDisclosure.jsx` - UI components
- `/app/frontend/src/components/ui/SelfTestDebug.jsx` - Self-test & debug

### Modified Files
- `/app/frontend/src/App.js` - Added AuthProvider, EvidenceProvider
- `/app/frontend/src/components/SystemStatusPanel.jsx` - Enhanced debug
- `/app/frontend/src/components/HelpCenter.jsx` - Added diagnostics section

## Open Questions (User Decisions Required)

1. **Admin Gating**: Implemented as PIN + Role (user confirmed)
2. **Profile Persistence**: localStorage only (user confirmed)
3. **Evidence Source**: Hybrid - Client now, System PLANNED (user confirmed)
4. **Help Text**: Hybrid - Static copy + metadata badges (user confirmed)

## Known Gaps
**NONE** - All planned features implemented or marked as PLANNED.
