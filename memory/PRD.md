# OMEGA Dashboard - Product Requirements Document

## Overview
OMEGA Dashboard is a sophisticated Raspberry Pi dashboard application providing system monitoring, community features, entertainment integration, and administrative tools.

## Current State (2025-01-14)

### Phase Complete: Master Global Search v4.0
- **148 screenshots** captured with full parity
- All search features implemented and verified

## What's Been Implemented

### Master Global Search (Section 1) ✅
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
- **Recent searches** stored per profile (localStorage)
- **Keyboard navigation** (up/down/enter/esc)

### Source Configuration
| Source | Status | Priority | Cap |
|--------|--------|----------|-----|
| Kiwix | INDEXED | 1 | 6 |
| Jellyfin | NOT_INDEXED (missing API key) | 2 | 6 |
| Community | INDEXED | 3 | 4 |
| Commands | PLANNED (STUB) | 4 | 3 |
| Files | INDEXED | 5 | 2 |

### Pinned Kiwix Sources (Boosted)
- Wikipedia (EN), Wikipedia Simple, WikiMed
- Wiktionary, iFixit, WikEM
- ArchWiki, OpenStreetMap Wiki, DevDocs, Wikivoyage

### Debug Bundle ZIP (Section 3) ✅
- **Download ZIP** - WIRED_LIVE (was PLANNED)
- **Redact sensitive values** toggle
- Bundle contents:
  - BUILD_INFO.json
  - CONFIG_SNAPSHOT.json  
  - SELF_TEST_RESULTS.json
  - NETWORK_LOG.json (last 100)
  - ERROR_LOG.json (last 100)
  - CONNECTION_STATE.json
  - README.txt

### Previous Phases (Still Active)
- Progressive Disclosure - WIRED_LIVE
- Help Guides - WIRED_LIVE
- Trust Badges - WIRED_LIVE
- Provenance Strip - WIRED_LIVE
- Self-Test Runner - WIRED_LIVE
- Auth Gating (Role + PIN) - WIRED_LIVE
- Profile System (localStorage) - WIRED_LIVE

## User Decisions Implemented
- **Q4.1**: Source priority approved with dynamic caps
- **Q4.2**: Commands as STUB (not executable)
- **Q4.3**: Profile backend sync as PLANNED scaffold
- **Q4.4**: Pinned sources approved (no WikiHow, no Gutenberg boost)

## New Files Created

### SearchBar.jsx (Complete Rewrite)
- Autosuggest with source grouping
- Scope chips
- Trust badges and freshness
- Recent searches
- Did you mean
- Explain results
- Keyboard navigation

### Modified Files
- SelfTestDebug.jsx - ZIP download + redaction toggle
- package.json - Added jszip dependency

## Baseline Artifacts
- **Latest ZIP**: `/baseline_visual_export.zip` (2.6MB, 148 screenshots)
- **Coverage**: 100%
- **New Files**: SEARCH_QUALITY_REPORT.md

## Backlog / Future Tasks

### P1 - Search Improvements
1. Wire to real Kiwix search API
2. Configure Jellyfin API key
3. Implement article-level Kiwix search (PLANNED)
4. Add Search Health panel to Admin

### P2 - Progressive Disclosure Wiring
1. Apply provenance strips to data tiles
2. Add "View Evidence" links

### P3 - Backend Integration
1. Connect to live Pi endpoints
2. Wire real data sources
3. Implement backend auth

### P4 - Deployment
1. Pi build (yarn build:pi)
2. Nginx reverse proxy
3. Production deployment

## Section 6 - Search Validation (PENDING)
Need to complete:
- 25 test queries table
- 8 Kiwix queries
- 8 Jellyfin queries (stub behavior)
- 5 file queries
- 4 community queries
- Screenshots of best/worst/zero/explain states

## Known Limitations
1. Jellyfin not indexed - requires API key
2. Commands are stubs - execution not implemented
3. Article-level Kiwix search - planned for later
4. Mock data - real backend not wired
