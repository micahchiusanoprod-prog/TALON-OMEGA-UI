# OMEGA Dashboard Visual Baseline - v4.0 (Master Global Search)

Generated: 2025-01-14T04:40:00Z

## Summary

| Folder | Screenshots | Description |
|--------|-------------|-------------|
| desktop_dark | 44 | 1440x900 viewport, dark theme |
| desktop_light | 36 | 1440x900 viewport, light theme |
| mobile_dark | 34 | 390x844 viewport (iPhone 14), dark theme |
| mobile_light | 34 | 390x844 viewport (iPhone 14), light theme |
| **TOTAL** | **148** | Full parity with search states |

## New Features in v4.0

### 1. Master Global Search (Section 1)
- **Autosuggest dropdown** with real-time results
- **Scope chips**: Global, Knowledge, Media, Community, Files, Tools
- **Source grouping** with labels and status badges
- **Trust badges** on all results (VERIFIED/DERIVED/ESTIMATED/UNKNOWN)
- **Freshness indicators** (LIVE/CACHED/STALE)
- **Dynamic caps** - files capped when high-value sources exist
- **File noise suppression** - bak/tmp/swp/old filtered
- **"Show more files"** link for hidden files
- **"Did you mean"** typo correction
- **"Explain results"** panel with ranking rules
- **Recent searches** stored per profile
- **Keyboard navigation** (up/down/enter/esc)

### 2. Source Status Indicators
- **Kiwix**: INDEXED (green)
- **Jellyfin**: NOT_INDEXED (blue badge) - "missing API key"
- **Community**: INDEXED
- **Commands**: PLANNED (amber badge) - stub only
- **Files**: INDEXED

### 3. Debug Bundle ZIP (Section 3)
- **Download ZIP** now WIRED_LIVE (was PLANNED)
- **Redact sensitive values** toggle
- **Bundle contents**:
  - debug_bundle.json (complete)
  - BUILD_INFO.json
  - CONFIG_SNAPSHOT.json
  - SELF_TEST_RESULTS.json
  - NETWORK_LOG.json (last 100)
  - ERROR_LOG.json (last 100)
  - CONNECTION_STATE.json
  - README.txt

## New Screenshots in v4.0

### Search States
| ID | Description | Folders |
|----|-------------|---------|
| 0070_search_empty_focus | Empty focus with recent searches | All 4 |
| 0071_search_wiki | "wiki" query with Kiwix results | All 4 |
| 0072_search_wikipedia | "wikipedia" exact match | Desktop Dark |
| 0073_search_movie_stub | "movie" with Jellyfin NOT_INDEXED | All 4 |
| 0074_search_omega_files | "omega" file query with caps | Desktop Dark |
| 0075_search_community | "john" community result | Desktop Dark |
| 0076_search_typo | "wikpedia" Did you mean | Desktop Dark |
| 0077_search_zero_results | Zero results guidance | Desktop Dark/Light |
| 0078_search_explain | Explain results panel | Desktop Dark |

### Debug Bundle
| ID | Description | Folders |
|----|-------------|---------|
| 0080_help_debug_bundle | Help Center with ZIP download | All 4 |

## Search Ranking Rules

See SEARCH_QUALITY_REPORT.md for full details.

### Priority Order
1. Kiwix (Knowledge)
2. Jellyfin (Media) - NOT_INDEXED currently
3. Community (People)
4. Commands (STUB only)
5. Files (capped in global)

### Match Ordering
Exact → Prefix → Full-text → Fuzzy

### Pinned Knowledge Sources
Wikipedia (EN), Wikipedia Simple, WikiMed, Wiktionary, iFixit, WikEM, ArchWiki, OpenStreetMap Wiki, DevDocs, Wikivoyage

## Files Added/Modified

### New Files
- SearchBar.jsx - Complete rewrite with autosuggest

### Modified Files
- SelfTestDebug.jsx - Added ZIP download and redaction toggle
- HelpCenter.jsx - Updated Debug Bundle section
- package.json - Added jszip dependency

## Metadata Files
- COVERAGE_REPORT.json
- FEATURE_MATRIX.json
- SEARCH_QUALITY_REPORT.md (NEW)
- MANIFEST.md
- CLICK_GUIDE.md
- INTERACTION_GRAPH.json
- UI_INVENTORY.json

## Known Limitations
1. Jellyfin not indexed - requires API key
2. Commands are stubs - execution not implemented
3. Article-level Kiwix search - planned for later
4. Mock data - real backend not wired
