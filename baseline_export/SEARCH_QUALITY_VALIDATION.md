# OMEGA Dashboard - Search Quality Validation Table

Generated: 2025-01-14
Version: 1.0.0

## Overview

This document contains the 25 test queries used to validate search quality, ranking, and autosuggest behavior across all scopes and sources. Each query is manually validated to ensure:

1. Correct source prioritization
2. Proper result capping
3. Accurate trust/provenance badges
4. Correct handling of stubbed sources (Jellyfin, Commands)

---

## Validation Table

### Legend
- **Scope**: Global | Knowledge | Media | Community | Files | Tools
- **Status**: PASS ✅ | FAIL ❌ | PARTIAL ⚠️
- **Sources**: Kiwix (K) | Jellyfin (J) | Community (C) | Commands (T) | Files (F)

---

### Knowledge Queries (8 queries)

| # | Query | Scope | Expected Top-3 Sources | Actual Top-3 Results | Status | Notes |
|---|-------|-------|------------------------|----------------------|--------|-------|
| K1 | `wikipedia` | Global | K, K, K | Wikipedia (English), Wikipedia Simple, Search in Knowledge | ⏳ | Pending Kiwix API integration |
| K2 | `wiki` | Knowledge | K, K, K | Wikipedia (EN), Wikipedia Simple, WikEM | ⏳ | Pending validation |
| K3 | `medical emergency` | Global | K, K, C | WikEM, WikiMed, Medical Response Team | ⏳ | Should show medical knowledge first |
| K4 | `how to fix phone` | Knowledge | K, K, K | iFixit, Search in Knowledge | ⏳ | iFixit should be top result |
| K5 | `arch linux install` | Knowledge | K, K | ArchWiki, DevDocs | ⏳ | Technical docs search |
| K6 | `first aid burns` | Global | K, K | WikEM, WikiMed | ⏳ | Medical priority |
| K7 | `python documentation` | Knowledge | K | DevDocs | ⏳ | Should hit DevDocs |
| K8 | `travel france` | Knowledge | K | Wikivoyage | ⏳ | Travel guide should appear |

---

### Entertainment/Media Queries (8 queries)

| # | Query | Scope | Expected Top-3 Sources | Actual Top-3 Results | Status | Notes |
|---|-------|-------|------------------------|----------------------|--------|-------|
| E1 | `movie night` | Global | J, T | Jellyfin (NOT_INDEXED), Start Movie Night (PLANNED) | ⏳ | Should show NOT_INDEXED badge |
| E2 | `watch film` | Media | J | Jellyfin Media Library (NOT_INDEXED) | ⏳ | Stub result expected |
| E3 | `music playlist` | Media | J | Jellyfin (NOT_INDEXED) | ⏳ | Media scope filter |
| E4 | `tv series` | Global | J | Jellyfin (NOT_INDEXED) | ⏳ | Should gracefully show stub |
| E5 | `jellyfin` | Global | J | Media Library Search (NOT_INDEXED) | ⏳ | Direct Jellyfin query |
| E6 | `download video` | Media | J | Jellyfin (NOT_INDEXED) | ⏳ | Video-related query |
| E7 | `stream` | Media | J | Jellyfin (NOT_INDEXED) | ⏳ | Streaming intent |
| E8 | `podcast` | Media | J | Jellyfin (NOT_INDEXED) | ⏳ | Audio content |

---

### Community Queries (4 queries)

| # | Query | Scope | Expected Top-3 Sources | Actual Top-3 Results | Status | Notes |
|---|-------|-------|------------------------|----------------------|--------|-------|
| C1 | `john smith` | Global | C | John Smith (Directory) | ⏳ | Person search |
| C2 | `medical team` | Community | C, C | Medical Response Team, Team results | ⏳ | Team search in scoped mode |
| C3 | `admin user` | Community | C | Admin users | ⏳ | Role-based search |
| C4 | `available members` | Community | C | Members with status | ⏳ | Availability search |

---

### File Queries (5 queries)

| # | Query | Scope | Expected Top-3 Sources | Actual Top-3 Results | Status | Notes |
|---|-------|-------|------------------------|----------------------|--------|-------|
| F1 | `manual pdf` | Global | K, F, F | Wiki results, omega_manual.pdf | ⏳ | Files should be capped (max 2) |
| F2 | `emergency procedures` | Files | F | emergency_procedures.docx | ⏳ | Direct file match |
| F3 | `map` | Global | K, F | OpenStreetMap Wiki, local_map.jpg | ⏳ | Mixed knowledge + files |
| F4 | `roster` | Files | F | team_roster.xlsx | ⏳ | Scoped file search |
| F5 | `.log` | Files | F | omega.log (noise, may be hidden) | ⏳ | Noise filtering test |

---

### Tools/Commands Queries (4 queries)

| # | Query | Scope | Expected Top-3 Sources | Actual Top-3 Results | Status | Notes |
|---|-------|-------|------------------------|----------------------|--------|-------|
| T1 | `hotspot` | Tools | T | Toggle Hotspot (PLANNED) | ⏳ | Command match |
| T2 | `self test` | Global | T | Run Self-Test (PLANNED) | ⏳ | Should show PLANNED badge |
| T3 | `backup system` | Tools | T | Start Backup (PLANNED) | ⏳ | Scoped command search |
| T4 | `sos beacon` | Global | T, K | SOS Beacon (PLANNED), WikEM (emergency) | ⏳ | Emergency + command mix |

---

## Edge Cases & Error States

### Typo Correction ("Did you mean")

| # | Query (Typo) | Expected Correction | Status | Notes |
|---|--------------|---------------------|--------|-------|
| Y1 | `wikpedia` | wikipedia | ⏳ | Missing 'i' |
| Y2 | `jllyfin` | jellyfin | ⏳ | Missing 'e' |
| Y3 | `emergncy` | emergency | ⏳ | Missing 'e' |

### Zero Results

| # | Query | Scope | Expected Behavior | Status | Notes |
|---|-------|-------|-------------------|--------|-------|
| Z1 | `xyzabc123nonsense` | Global | "No results" message | ⏳ | Clear no-results state |
| Z2 | `!!!@@@###` | Global | "No results" or empty | ⏳ | Special characters |

---

## Source Caps Validation (Global Scope)

The following caps should apply when high-value sources exist:

| Source | Max Results in Top 15 | Dynamic Suppression |
|--------|----------------------|---------------------|
| Kiwix | 6 | No |
| Jellyfin | 6 | No |
| Community | 4 | No |
| Tools/Commands | 4 | No |
| Files | 3 (0-2 when high-signal sources exist) | Yes - "Show more files" expansion |

---

## Kiwix API Integration Status

### Endpoint Configuration
- **Primary**: `http://talon.local:8090`
- **Fallback**: `http://127.0.0.1:8090`
- **Degraded Mode**: Library-level results only with "Kiwix Search Unavailable" badge

### API Endpoint Discovery
| Endpoint | Purpose | Status |
|----------|---------|--------|
| `/search` | Article-level search | ⏳ To be discovered |
| `/suggest` | Autosuggest | ⏳ To be discovered |
| `/catalog/v2/entries` | Library listing | ⏳ To be discovered |

---

## Screenshot Validation Matrix

### Autosuggest States (Per Mode)

| State | Desktop Light | Desktop Dark | Mobile Light | Mobile Dark |
|-------|---------------|--------------|--------------|-------------|
| Empty/Focus (Recent searches) | ⏳ | ⏳ | ⏳ | ⏳ |
| First character typed | ⏳ | ⏳ | ⏳ | ⏳ |
| Mid-word typed | ⏳ | ⏳ | ⏳ | ⏳ |
| Typo case (Did you mean) | ⏳ | ⏳ | ⏳ | ⏳ |
| Backspace correction | ⏳ | ⏳ | ⏳ | ⏳ |
| No results | ⏳ | ⏳ | ⏳ | ⏳ |

**Total Screenshots Required**: 24 (6 states × 4 modes)

---

## Validation Summary

| Category | Total | Pass | Fail | Partial | Pending |
|----------|-------|------|------|---------|---------|
| Knowledge | 8 | 0 | 0 | 0 | 8 |
| Media | 8 | 0 | 0 | 0 | 8 |
| Community | 4 | 0 | 0 | 0 | 4 |
| Files | 5 | 0 | 0 | 0 | 5 |
| Tools | 4 | 0 | 0 | 0 | 4 |
| Typos | 3 | 0 | 0 | 0 | 3 |
| Zero Results | 2 | 0 | 0 | 0 | 2 |
| **TOTAL** | **34** | **0** | **0** | **0** | **34** |

---

## Next Steps

1. ✅ Created validation table
2. ⏳ Implement Kiwix article-level search API integration
3. ⏳ Update source caps per specification
4. ⏳ Capture autosuggest screenshots
5. ⏳ Run full validation and update table
