# OMEGA Dashboard - Raspberry Pi Deployment Guide

## Overview

This package contains a production-ready build of the OMEGA Dashboard optimized for Raspberry Pi deployment. The build has:

- **Zero external dependencies** - All CSS/JS bundled locally
- **Relative URLs** - Works behind nginx reverse proxy
- **Offline-first design** - Functions without WAN connectivity
- **WAN-independent health checks** - Monitors local services only

## Quick Start (5 minutes)

### Prerequisites

- Raspberry Pi with Raspbian/Debian
- nginx installed (`sudo apt install nginx`)
- OMEGA backend running on port 8093
- Kiwix server running on port 8090 (optional)
- Jellyfin running on port 8096 (optional)

### Step 1: Copy Files

```bash
# Create web directory
sudo mkdir -p /var/www/omega

# Copy build files (from this package)
sudo cp -r ./build/* /var/www/omega/

# Set permissions
sudo chown -R www-data:www-data /var/www/omega
sudo chmod -R 755 /var/www/omega
```

### Step 2: Configure nginx

```bash
# Backup existing config
sudo cp /etc/nginx/sites-available/default /etc/nginx/sites-available/default.bak

# Create OMEGA config
sudo nano /etc/nginx/sites-available/omega
```

Paste this configuration:

```nginx
server {
    listen 80 default_server;
    listen [::]:80 default_server;
    
    server_name talon.local _;
    
    # Serve static frontend
    root /var/www/omega;
    index index.html;
    
    # Frontend routes (SPA)
    location / {
        try_files $uri $uri/ /index.html;
    }
    
    # API proxy to OMEGA backend
    location /api/ {
        proxy_pass http://127.0.0.1:8093/;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_connect_timeout 5s;
        proxy_read_timeout 30s;
    }
    
    # Kiwix proxy
    location /kiwix/ {
        proxy_pass http://127.0.0.1:8090/;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_buffering off;
        proxy_connect_timeout 5s;
        proxy_read_timeout 60s;
    }
    
    # Direct Kiwix access (legacy support)
    location = /kiwix {
        return 301 /kiwix/;
    }
    
    # Cache static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2)$ {
        expires 7d;
        add_header Cache-Control "public, immutable";
    }
    
    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    
    # Gzip compression
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml;
    gzip_min_length 1000;
}
```

### Step 3: Enable and Start

```bash
# Enable the site
sudo ln -sf /etc/nginx/sites-available/omega /etc/nginx/sites-enabled/omega
sudo rm -f /etc/nginx/sites-enabled/default

# Test configuration
sudo nginx -t

# Reload nginx
sudo systemctl reload nginx

# Verify
curl -I http://localhost/
```

### Step 4: Verify Deployment

```bash
# Check frontend loads
curl -s http://localhost/ | head -20

# Check API proxy
curl -s http://localhost/api/cgi-bin/health.py

# Check Kiwix proxy (if running)
curl -s http://localhost/kiwix/

# Check from another device on LAN
# On your phone/laptop: http://talon.local/
```

## URL Contract

The dashboard uses these relative URLs (all go through nginx):

| Path | Target | Purpose |
|------|--------|---------|
| `/` | Static files | Frontend SPA |
| `/api/*` | `127.0.0.1:8093/*` | OMEGA backend API |
| `/kiwix/*` | `127.0.0.1:8090/*` | Kiwix wiki server |

Jellyfin is accessed directly on port 8096 (configurable via `OMEGA_CONFIG.jellyfinBase`).

## Runtime Configuration

You can override settings without rebuilding by editing `/var/www/omega/index.html`:

```html
<script>
window.OMEGA_CONFIG = {
    API_BASE: '',           // Keep empty for relative URLs
    KIWIX_BASE: '/kiwix',   // Proxied through nginx
    jellyfinBase: 'http://talon.local:8096',  // Direct access
    USE_MOCK_DATA: false,   // Use live backend
};
</script>
```

## Troubleshooting

### Dashboard shows "LOCAL_DOWN"

1. Check if OMEGA backend is running:
   ```bash
   curl http://127.0.0.1:8093/cgi-bin/health.py
   ```

2. Check nginx error logs:
   ```bash
   sudo tail -f /var/log/nginx/error.log
   ```

### Kiwix search unavailable

1. Check if Kiwix is running:
   ```bash
   curl http://127.0.0.1:8090/
   ```

2. Verify nginx proxy:
   ```bash
   curl http://localhost/kiwix/
   ```

### Cannot access from other devices

1. Check Pi hostname:
   ```bash
   hostname
   ```

2. Verify avahi/mDNS is running:
   ```bash
   sudo systemctl status avahi-daemon
   ```

3. Try IP address instead:
   ```bash
   hostname -I
   # Then access: http://<IP_ADDRESS>/
   ```

## Rollback

To restore previous version:

```bash
# Stop nginx
sudo systemctl stop nginx

# Restore backup
sudo rm -rf /var/www/omega
sudo cp -r /var/www/omega.bak /var/www/omega

# Restart
sudo systemctl start nginx
```

## File Structure

```
/var/www/omega/
├── index.html          # Main entry point
├── static/
│   ├── css/           # Bundled styles
│   └── js/            # Bundled scripts
├── manifest.json      # PWA manifest (optional)
└── robots.txt         # Search engine config
```

## Service Ports Reference

| Service | Port | Protocol | Notes |
|---------|------|----------|-------|
| nginx | 80 | HTTP | Public frontend |
| OMEGA API | 8093 | HTTP | Backend (localhost only) |
| Kiwix | 8090 | HTTP | Wiki server (localhost only) |
| Jellyfin | 8096 | HTTP | Media server (LAN accessible) |

## Support

- Dashboard version: See footer or `/api/cgi-bin/health.py`
- Build timestamp: Check `index.html` header comment
- Logs: `/var/log/nginx/access.log` and `error.log`
