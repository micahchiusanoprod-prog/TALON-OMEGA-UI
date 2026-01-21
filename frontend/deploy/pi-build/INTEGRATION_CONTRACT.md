# OMEGA Dashboard - Integration Contract

## Overview

This document defines every HTTP endpoint the OMEGA Dashboard UI calls, including expected request/response formats. Backend implementers should use this as the authoritative API specification.

## URL Strategy

All URLs are **relative** to enable nginx reverse proxy deployment:

- API calls: `/api/*` → proxied to `127.0.0.1:8093/*`
- Kiwix calls: `/kiwix/*` → proxied to `127.0.0.1:8090/*`
- Jellyfin: Direct access to port 8096 (configurable)

---

## API Endpoints (`/api/*`)

### Health & Status

#### `GET /api/cgi-bin/health.py`

System health check. **Primary source for LOCAL_OK/LOCAL_DOWN state.**

**Request:**
```http
GET /api/cgi-bin/health.py HTTP/1.1
```

**Response (200 OK):**
```json
{
  "status": "ok",
  "timestamp": "2024-01-15T10:30:00Z",
  "uptime": 86400,
  "version": "1.0.0",
  "services": {
    "api": true,
    "database": true,
    "mesh": false
  }
}
```

**Response (503 Service Unavailable):**
```json
{
  "status": "error",
  "message": "Service starting up"
}
```

---

#### `GET /api/cgi-bin/metrics.py`

System performance metrics (CPU, RAM, temperature).

**Request:**
```http
GET /api/cgi-bin/metrics.py HTTP/1.1
```

**Response (200 OK):**
```json
{
  "cpu": {
    "usage_percent": 23.5,
    "temperature_c": 45.2,
    "frequency_mhz": 1500
  },
  "memory": {
    "total_mb": 4096,
    "used_mb": 1024,
    "available_mb": 3072,
    "percent": 25.0
  },
  "disk": {
    "total_gb": 32,
    "used_gb": 8,
    "free_gb": 24,
    "percent": 25.0
  },
  "timestamp": "2024-01-15T10:30:00Z"
}
```

---

#### `GET /api/cgi-bin/sensors.py`

BME680 environmental sensor readings.

**Request:**
```http
GET /api/cgi-bin/sensors.py HTTP/1.1
```

**Response (200 OK):**
```json
{
  "temperature_c": 22.5,
  "humidity_percent": 45.0,
  "pressure_hpa": 1013.25,
  "gas_resistance_ohms": 50000,
  "air_quality_index": 75,
  "timestamp": "2024-01-15T10:30:00Z"
}
```

**Response (404 - Sensor not connected):**
```json
{
  "error": "BME680 sensor not detected",
  "code": "SENSOR_NOT_FOUND"
}
```

---

### Backup & Keys

#### `GET /api/cgi-bin/backup.py`

Backup status and last backup info.

**Response (200 OK):**
```json
{
  "last_backup": "2024-01-14T00:00:00Z",
  "backup_size_mb": 128,
  "backup_location": "/mnt/backup/omega",
  "next_scheduled": "2024-01-15T00:00:00Z",
  "status": "success"
}
```

---

#### `GET /api/cgi-bin/keys.py`

Encryption key status.

**Response (200 OK):**
```json
{
  "keys": [
    {
      "id": "master",
      "created": "2024-01-01T00:00:00Z",
      "expires": null,
      "status": "active"
    }
  ],
  "sync_status": "synced"
}
```

---

#### `GET /api/cgi-bin/keysync.py`

Key synchronization status with other nodes.

**Response (200 OK):**
```json
{
  "last_sync": "2024-01-15T10:00:00Z",
  "nodes_synced": 3,
  "pending_syncs": 0,
  "status": "complete"
}
```

---

### Hotspot Management

#### `GET /api/hotspot/status`

WiFi hotspot status.

**Response (200 OK):**
```json
{
  "enabled": true,
  "ssid": "OMEGA-Hotspot",
  "channel": 6,
  "clients_connected": 2,
  "ip_address": "192.168.4.1",
  "security": "WPA2"
}
```

---

#### `GET /api/hotspot/clients`

Connected hotspot clients.

**Response (200 OK):**
```json
{
  "clients": [
    {
      "mac": "AA:BB:CC:DD:EE:FF",
      "ip": "192.168.4.10",
      "hostname": "iphone-john",
      "connected_at": "2024-01-15T10:00:00Z",
      "signal_dbm": -45
    }
  ],
  "total": 1
}
```

---

#### `POST /api/hotspot/toggle`

Enable/disable hotspot.

**Request:**
```json
{
  "enabled": true
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "enabled": true,
  "message": "Hotspot enabled"
}
```

---

### Ally Communications

#### `GET /api/ally/nodes`

List network members/nodes.

**Response (200 OK):**
```json
{
  "nodes": [
    {
      "id": "node-001",
      "name": "Dad's OMEGA",
      "status": "online",
      "last_seen": "2024-01-15T10:30:00Z",
      "battery_percent": 85,
      "location": {
        "lat": 37.7749,
        "lng": -122.4194
      }
    }
  ],
  "total": 4,
  "online": 3
}
```

---

#### `POST /api/ally/chat`

Send message to node(s).

**Request:**
```json
{
  "to": "node-001",
  "message": "Check in please",
  "priority": "normal"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message_id": "msg-12345",
  "queued": true
}
```

---

#### `POST /api/ally/broadcast`

Send broadcast to all nodes (SOS, assembly, etc.).

**Request:**
```json
{
  "type": "sos",
  "message": "Emergency at base camp",
  "location": {
    "lat": 37.7749,
    "lng": -122.4194
  },
  "priority": "critical"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "broadcast_id": "bcast-12345",
  "nodes_reached": 3,
  "nodes_pending": 1
}
```

---

### Direct Messages

#### `GET /api/cgi-bin/dm.py`

Fetch direct messages.

**Request:**
```http
GET /api/cgi-bin/dm.py?since=2024-01-15T00:00:00Z HTTP/1.1
```

**Response (200 OK):**
```json
{
  "messages": [
    {
      "id": "dm-001",
      "from": "node-002",
      "from_name": "Mom's OMEGA",
      "message": "Heading back to camp",
      "timestamp": "2024-01-15T10:30:00Z",
      "read": false
    }
  ],
  "unread_count": 1
}
```

---

## Kiwix Endpoints (`/kiwix/*`)

### Health Check

#### `GET /kiwix/` or `HEAD /kiwix/`

Check if Kiwix server is running.

**Response (200 OK):** HTML welcome page (body not parsed, just status code)

---

### Catalog

#### `GET /kiwix/catalog/v2/entries`

List available ZIM files.

**Response (200 OK):**
```json
{
  "entries": [
    {
      "id": "wikipedia_en_medicine",
      "title": "Wikipedia Medical",
      "description": "Medical articles from Wikipedia",
      "language": "en",
      "articleCount": 50000,
      "mediaCount": 10000,
      "size": 1073741824,
      "favicon": "/kiwix/meta?name=favicon&content=wikipedia_en_medicine"
    }
  ]
}
```

---

### Search

#### `GET /kiwix/search?pattern={query}&limit={n}`

Search articles across all ZIM files.

**Request:**
```http
GET /kiwix/search?pattern=first%20aid&limit=20 HTTP/1.1
```

**Response (200 OK):**
```json
{
  "results": [
    {
      "title": "First Aid",
      "path": "/kiwix/content/wikipedia_en_medicine/A/First_aid",
      "snippet": "First aid is the assistance given to any person suffering...",
      "score": 0.95,
      "zimFile": "wikipedia_en_medicine"
    }
  ],
  "total": 150,
  "query": "first aid"
}
```

---

### Suggestions (Autocomplete)

#### `GET /kiwix/suggest?term={term}`

Get autocomplete suggestions.

**Request:**
```http
GET /kiwix/suggest?term=first HTTP/1.1
```

**Response (200 OK):**
```json
[
  "First aid",
  "First Amendment",
  "First World War"
]
```

---

### Content

#### `GET /kiwix/content/{zimFile}/{path}`

Fetch article content.

**Response (200 OK):** HTML article content

---

## Jellyfin Endpoints (Direct)

Jellyfin is accessed directly on port 8096 (not proxied through nginx by default).

### Web Interface

#### `GET http://talon.local:8096/web/`

Jellyfin web interface.

### Items (API)

#### `GET http://talon.local:8096/Items`

List media library items (requires API key).

---

## Error Response Format

All endpoints should return errors in this format:

```json
{
  "error": true,
  "code": "ERROR_CODE",
  "message": "Human-readable error message",
  "details": {}
}
```

Common error codes:
- `NOT_FOUND` - Resource not found
- `UNAUTHORIZED` - Authentication required
- `FORBIDDEN` - Permission denied
- `SERVICE_UNAVAILABLE` - Backend service down
- `TIMEOUT` - Request timed out
- `SENSOR_NOT_FOUND` - Hardware not connected
- `NOT_CONFIGURED` - Feature not set up

---

## Timeout & Retry Behavior

The UI uses these defaults (configurable via `OMEGA_CONFIG`):

| Setting | Value | Notes |
|---------|-------|-------|
| Request timeout | 8000ms | Pi can be slow |
| Health check interval | 15000ms | Background polling |
| Retry attempts | 2 | On transient failures |
| Retry delay | 1000ms | Between retries |

---

## Offline Behavior

When endpoints return errors, the UI shows:

| Error Type | UI Behavior |
|------------|-------------|
| Network error | "UNAVAILABLE" badge + mock data fallback |
| 404 Not Found | "NOT_CONFIGURED" badge + setup guide |
| 503 Unavailable | "SERVICE_DOWN" badge + retry option |
| Timeout | "TIMEOUT" badge + retry option |

The UI **never** shows a blank screen or dead end. Every error state has:
1. Clear status indicator
2. Actionable next steps
3. "Return to Dashboard" escape hatch

---

## Implementation Checklist

Backend implementers should ensure:

- [ ] `/api/cgi-bin/health.py` returns 200 when system is ready
- [ ] All endpoints return JSON with `Content-Type: application/json`
- [ ] Error responses use the standard error format
- [ ] CORS headers allow same-origin requests (nginx handles this)
- [ ] Timeouts are < 5 seconds for health checks
- [ ] Kiwix is accessible at `/kiwix/` via nginx proxy
