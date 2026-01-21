# OMEGA Dashboard - Raspberry Pi Deployment Guide

## Overview

Production-ready OMEGA Dashboard build for Raspberry Pi deployment.

**Version:** pi-1.1.0  
**Features:**
- Zero external dependencies (all CSS/JS bundled)
- Relative URLs for nginx proxy
- LOCAL-based offline detection (not WAN-dependent)
- SHTF-first Quick Access panel
- Clean error handling for all Pi API responses

## Quick Deploy (5 minutes)

### Prerequisites

```bash
# Required services on Pi:
# - nginx (reverse proxy)
# - OMEGA API on port 8093
# - Kiwix on port 8090 (optional but recommended)
```

### Step 1: Copy Files

```bash
# Create web directory
sudo mkdir -p /var/www/omega

# Extract and copy (from this package)
sudo cp -r ./build/* /var/www/omega/

# Set permissions
sudo chown -R www-data:www-data /var/www/omega
sudo chmod -R 755 /var/www/omega
```

### Step 2: Configure nginx

```bash
# Create nginx config
sudo tee /etc/nginx/sites-available/omega << 'NGINX'
server {
    listen 80 default_server;
    listen [::]:80 default_server;
    server_name _;
    
    root /var/www/omega;
    index index.html;
    
    # Frontend SPA
    location / {
        try_files $uri $uri/ /index.html;
    }
    
    # API proxy → OMEGA backend
    location /api/ {
        proxy_pass http://127.0.0.1:8093/;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_connect_timeout 5s;
        proxy_read_timeout 30s;
    }
    
    # Kiwix proxy → Kiwix server
    location /kiwix/ {
        proxy_pass http://127.0.0.1:8090/;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_connect_timeout 5s;
        proxy_read_timeout 60s;
    }
    
    location = /kiwix {
        return 301 /kiwix/;
    }
    
    # Static asset caching
    location ~* \.(js|css|png|jpg|svg|woff|woff2)$ {
        expires 7d;
        add_header Cache-Control "public, immutable";
    }
    
    gzip on;
    gzip_types text/plain text/css application/json application/javascript;
}
NGINX
```

### Step 3: Enable and Start

```bash
# Enable site
sudo ln -sf /etc/nginx/sites-available/omega /etc/nginx/sites-enabled/omega
sudo rm -f /etc/nginx/sites-enabled/default

# Test and reload
sudo nginx -t && sudo systemctl reload nginx
```

### Step 4: Verify

```bash
# Test frontend
curl -s http://localhost/ | head -5

# Test API proxy
curl -s http://localhost/api/cgi-bin/health.py

# Test Kiwix proxy
curl -s http://localhost/kiwix/ | head -5
```

## URL Contract

| Path | Proxied To | Purpose |
|------|-----------|---------|
| `/` | Static files | React SPA |
| `/api/*` | `127.0.0.1:8093/*` | OMEGA API |
| `/kiwix/*` | `127.0.0.1:8090/*` | Kiwix wiki |

## API Endpoints Used

The dashboard calls these endpoints (all relative):

```
GET /api/cgi-bin/health.py    → System health
GET /api/cgi-bin/metrics.py   → CPU/RAM/disk
GET /api/cgi-bin/sensors.py   → BME680 sensor (may return error)
GET /api/cgi-bin/gps.py       → GPS location (may return error)
GET /api/cgi-bin/dm.py        → Direct messages (returns 403 if not setup)
GET /api/cgi-bin/mesh.py      → Mesh network status
GET /api/cgi-bin/keys.py      → Encryption keys
GET /api/cgi-bin/keysync.py   → Key sync status
GET /api/cgi-bin/backup.py    → Backup status
GET /kiwix/                   → Kiwix homepage (HTML)
GET /kiwix/catalog/v2/entries → ZIM catalog (Atom XML)
GET /kiwix/search?pattern=X   → Search (HTML results)
```

## Error Response Handling

The UI cleanly handles these Pi-specific responses:

| Endpoint | Response | UI Display |
|----------|----------|------------|
| `/api/cgi-bin/dm.py` | `403 {"ok":false,"err":"forbidden"}` | "Setup Required" + guide |
| `/api/cgi-bin/sensors.py` | `{"status":"error","error":"i2c..."}` | "Hardware Issue" + tip |
| `/api/cgi-bin/gps.py` | `{"status":"error","error":"gpspipe..."}` | "No Signal" + manual entry |

## System Health States

The dashboard determines local service health (independent of WAN):

| State | Condition | UI |
|-------|-----------|-----|
| `LOCAL_OK` | API + Kiwix responding | Green status |
| `LOCAL_DEGRADED` | Only one service up | Yellow warning |
| `LOCAL_DOWN` | Neither responding | Red alert |

## Quick Access Panel

First-screen buttons for SHTF access (<10 seconds):

1. **Knowledge Base** → Opens `/kiwix/` directly
2. **System Status** → Opens diagnostics panel
3. **WiFi Hotspot** → Scrolls to hotspot instructions
4. **Communications** → Scrolls to mesh/radio section

## Runtime Configuration

Edit `index.html` to customize without rebuild:

```html
<script>
window.OMEGA_CONFIG = {
    API_BASE: '',           // Keep empty for relative
    KIWIX_BASE: '/kiwix',   // Nginx proxy path
    jellyfinBase: null,     // Or 'http://pi.local:8096'
    USE_MOCK_DATA: false    // true for demo mode
};
</script>
```

## Troubleshooting

### "LOCAL_DOWN" status

```bash
# Check API
curl http://127.0.0.1:8093/cgi-bin/health.py

# Check Kiwix
curl http://127.0.0.1:8090/

# Check nginx logs
sudo tail -f /var/log/nginx/error.log
```

### Search returns no results

Kiwix `/kiwix/search` returns HTML. The dashboard parses this HTML for results.
If no results appear:
1. Verify ZIM files are loaded in Kiwix
2. Check `/kiwix/catalog/v2/entries` returns entries
3. Try searching directly at `/kiwix/`

### Sensors show "Hardware Issue"

Expected if BME680 sensor not connected:
```bash
# Check I2C
i2cdetect -y 1
# BME680 should appear at address 0x76 or 0x77
```

## Rollback

```bash
# Keep backup before deploy
sudo cp -r /var/www/omega /var/www/omega.bak

# Rollback if needed
sudo rm -rf /var/www/omega
sudo mv /var/www/omega.bak /var/www/omega
sudo systemctl reload nginx
```

## Package Contents

```
OMEGA_PI_BUILD/
├── build/
│   ├── index.html          # Main entry (no external deps)
│   ├── static/
│   │   ├── css/           # Bundled styles
│   │   └── js/            # Bundled scripts
│   └── 50x.html           # Error page
├── nginx.conf              # nginx configuration
├── README_PI_DEPLOY.md     # This file
├── INTEGRATION_CONTRACT.md # API specification
└── UI_ELEMENT_MANIFEST.json # UI inventory
```
