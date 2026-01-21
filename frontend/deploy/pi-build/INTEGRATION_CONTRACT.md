# OMEGA Dashboard - Integration Contract

## Overview

This document specifies every HTTP endpoint the OMEGA Dashboard UI calls, including exact request/response formats based on the **production Pi environment**.

## URL Strategy

All URLs are **relative** (no hardcoded hostnames or ports):

- API: `/api/*` → nginx proxies to `127.0.0.1:8093/*`
- Kiwix: `/kiwix/*` → nginx proxies to `127.0.0.1:8090/*`

---

## API Endpoints (`/api/cgi-bin/*`)

### Health Check

#### `GET /api/cgi-bin/health.py`

Primary endpoint for determining LOCAL_OK/LOCAL_DOWN state.

**Response (200 OK):**
```json
{
  "status": "ok",
  "timestamp": "2024-01-15T10:30:00Z",
  "uptime": 86400,
  "version": "1.0.0"
}
```

---

### System Metrics

#### `GET /api/cgi-bin/metrics.py`

CPU, memory, disk usage.

**Response (200 OK):**
```json
{
  "cpu": {
    "usage_percent": 23.5,
    "temperature_c": 45.2
  },
  "memory": {
    "total_mb": 4096,
    "used_mb": 1024,
    "percent": 25.0
  },
  "disk": {
    "total_gb": 32,
    "used_gb": 8,
    "percent": 25.0
  }
}
```

---

### Environmental Sensors

#### `GET /api/cgi-bin/sensors.py`

BME680 sensor data. **May return error if sensor not connected.**

**Response (200 OK) - Success:**
```json
{
  "status": "ok",
  "temperature_c": 22.5,
  "humidity_percent": 45.0,
  "pressure_hpa": 1013.25,
  "gas_resistance_ohms": 50000
}
```

**Response (200 OK) - Error (sensor not found):**
```json
{
  "status": "error",
  "error": "Failed to read from BME680: [Errno 121] Remote I/O error on /dev/i2c-3"
}
```

**UI Handling:** Shows "Hardware Issue" with tip to check I2C connection.

---

### GPS Location

#### `GET /api/cgi-bin/gps.py`

GPS coordinates. **May return error if no GPS signal.**

**Response (200 OK) - Success:**
```json
{
  "status": "ok",
  "lat": 37.7749,
  "lon": -122.4194,
  "altitude_m": 10.5,
  "speed_kph": 0,
  "satellites": 8
}
```

**Response (200 OK) - Error (no signal/timeout):**
```json
{
  "status": "error",
  "error": "gpspipe timeout after 5 seconds - no GPS fix available"
}
```

**UI Handling:** Shows "No Signal" with option to enter coordinates manually.

---

### Direct Messages

#### `GET /api/cgi-bin/dm.py`

Direct messaging. **Returns 403 if not configured.**

**Response (403 Forbidden) - Not Setup:**
```json
{
  "ok": false,
  "err": "forbidden"
}
```

**UI Handling:** Shows "Setup Required" with link to configuration guide.

**Response (200 OK) - Configured:**
```json
{
  "ok": true,
  "messages": [
    {
      "id": "dm-001",
      "from": "node-002",
      "message": "Check in please",
      "timestamp": "2024-01-15T10:30:00Z"
    }
  ]
}
```

---

### Mesh Network

#### `GET /api/cgi-bin/mesh.py`

Mesh radio network status.

**Response (200 OK):**
```json
{
  "ok": true,
  "mesh": "ready",
  "nodes": 3,
  "last_heard": "2024-01-15T10:30:00Z"
}
```

---

### Encryption Keys

#### `GET /api/cgi-bin/keys.py`

Key management status.

**Response (200 OK):**
```json
{
  "ok": true,
  "id": "anon",
  "has": false
}
```

---

### Key Sync

#### `GET /api/cgi-bin/keysync.py`

Key synchronization status.

**Response (200 OK):**
```json
{
  "ok": true,
  "synced": true,
  "last_sync": "2024-01-15T10:00:00Z"
}
```

---

### Backup Status

#### `GET /api/cgi-bin/backup.py`

Backup information.

**Response (200 OK):**
```json
{
  "ok": true,
  "last_backup": "2024-01-14T00:00:00Z",
  "size_mb": 128
}
```

---

## Kiwix Endpoints (`/kiwix/*`)

### Homepage

#### `GET /kiwix/`

Kiwix web interface homepage.

**Response (200 OK):** HTML page

**Used for:** Health check (any 2xx = Kiwix is running)

---

### Catalog

#### `GET /kiwix/catalog/v2/entries`

OPDS catalog of available ZIM files.

**Response (200 OK):** Atom XML

```xml
<?xml version="1.0" encoding="UTF-8"?>
<feed xmlns="http://www.w3.org/2005/Atom">
  <entry>
    <title>Wikipedia (English)</title>
    <id>wikipedia_en_all</id>
    <link href="/kiwix/content/wikipedia_en_all/" type="text/html"/>
  </entry>
</feed>
```

---

### Search

#### `GET /kiwix/search?pattern={query}&limit={n}`

Search across all ZIM files. **Returns HTML, not JSON.**

**Request:**
```
GET /kiwix/search?pattern=first%20aid&limit=20
```

**Response (200 OK):** HTML page with search results

The UI parses this HTML to extract results. Results are typically in:
- `<li class="result">` elements
- `<div class="searchresult">` elements
- Links with `/content/` paths

**Note:** `/kiwix/suggest` returns **404** and must NOT be called.

---

### Content

#### `GET /kiwix/content/{zimFile}/{path}`

Fetch article content.

**Response (200 OK):** HTML article

---

## Error Handling Contract

### HTTP Status Codes

| Code | Meaning | UI Action |
|------|---------|-----------|
| 200 | Success | Parse response |
| 403 | Forbidden | Show "Setup Required" |
| 404 | Not Found | Show "Not Available" |
| 500 | Server Error | Show "Service Error" |
| Network Error | Can't connect | Show "Connection Failed" |

### Error Response Parsing

When response contains `"status": "error"`:

```javascript
if (data.status === 'error') {
  const errorMsg = data.error || 'Unknown error';
  
  if (errorMsg.includes('i2c') || errorMsg.includes('sensor')) {
    // Show sensor hardware error UI
  } else if (errorMsg.includes('gps') || errorMsg.includes('timeout')) {
    // Show GPS no-signal UI
  } else {
    // Show generic error UI
  }
}
```

### Required Error UI Elements

Every error state must have:

1. **Clear message** - What's wrong in plain language
2. **Next action** - What the user can do (offline-friendly)
3. **Escape hatch** - "Return to Dashboard" button

---

## Polling Intervals

| Endpoint | Interval | Purpose |
|----------|----------|---------|
| `/api/cgi-bin/health.py` | 15s | System health |
| `/api/cgi-bin/metrics.py` | 5s | CPU/RAM display |
| `/api/cgi-bin/sensors.py` | 5s | Temperature display |
| `/kiwix/` | 30s | Kiwix availability |

---

## Request Configuration

| Setting | Value |
|---------|-------|
| Timeout | 8000ms |
| Retry attempts | 2 |
| Retry delay | 1000ms |

---

## System State Logic

```javascript
// Check LOCAL health (WAN-independent)
const apiOk = await checkEndpoint('/api/cgi-bin/health.py');
const kiwixOk = await checkEndpoint('/kiwix/');

if (apiOk && kiwixOk) {
  state = 'LOCAL_OK';      // All local services up
} else if (apiOk || kiwixOk) {
  state = 'LOCAL_DEGRADED'; // Partial service
} else {
  state = 'LOCAL_DOWN';     // All services unreachable
}
```

---

## Implementation Checklist

Backend must:

- [ ] `/api/cgi-bin/health.py` returns `{"status":"ok"}` when ready
- [ ] All endpoints return JSON with `Content-Type: application/json`
- [ ] Sensor/GPS errors return 200 with `{"status":"error","error":"..."}`
- [ ] DM returns 403 with `{"ok":false,"err":"forbidden"}` when not configured
- [ ] Kiwix `/kiwix/search` returns HTML with parseable results
- [ ] Kiwix `/kiwix/suggest` may return 404 (UI does not call it)

Frontend handles:

- [ ] All error states with actionable UI
- [ ] "Return to Dashboard" escape from every modal/error
- [ ] LOCAL_OK/DEGRADED/DOWN states independently of WAN
- [ ] HTML parsing for Kiwix search results
