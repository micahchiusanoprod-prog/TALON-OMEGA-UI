# OMEGA Dashboard - Raspberry Pi Deployment Guide

## Overview

This guide explains how to deploy the OMEGA Dashboard to a Raspberry Pi for offline-first operation.

## Prerequisites

- Raspberry Pi 3B+ or newer (recommended: Pi 4 with 2GB+ RAM)
- Raspbian/Raspberry Pi OS (Lite or Desktop)
- nginx web server
- OMEGA Pi backend running on port 8093
- (Optional) Kiwix server on port 8090

## Build for Deployment

### Option 1: Quick Build (Development)

```bash
cd /app/frontend
yarn build
```

This creates a standard build in the `build/` directory.

### Option 2: Pi Release Package (Recommended)

```bash
cd /app/frontend
yarn build:pi
```

This creates a complete deployment package in `deploy/releases/<timestamp>/` including:
- Pre-configured static files
- nginx configuration
- Installation script
- Self-test documentation

## Deployment Methods

### Method A: Using Release Package (Recommended)

1. Build the release package:
   ```bash
   yarn build:pi
   ```

2. Transfer to Pi:
   ```bash
   scp -r deploy/releases/<timestamp> pi@your-pi-ip:~/
   ```

3. On the Pi, run the installer:
   ```bash
   cd ~/<timestamp>
   ./install.sh
   ```

4. Edit configuration:
   ```bash
   sudo nano /var/www/omega-dashboard/config.js
   ```

### Method B: Manual Installation

1. Build:
   ```bash
   yarn build
   ```

2. Copy files to Pi:
   ```bash
   scp -r build/* pi@your-pi-ip:/var/www/omega-dashboard/
   ```

3. Create runtime config on Pi:
   ```bash
   sudo nano /var/www/omega-dashboard/config.js
   ```
   
   Add:
   ```javascript
   window.OMEGA_CONFIG = {
     API_BASE: 'http://127.0.0.1:8093',
     KIWIX_BASE: 'http://127.0.0.1:8090',
     USE_MOCK_DATA: false,
   };
   ```

4. Update index.html to load config:
   ```bash
   # Add before </head>:
   <script src="./config.js"></script>
   ```

## nginx Configuration

Create `/etc/nginx/sites-available/omega-dashboard`:

```nginx
server {
    listen 80;
    server_name _;
    
    root /var/www/omega-dashboard;
    index index.html;
    
    location / {
        try_files $uri $uri/ /index.html;
    }
    
    location /cgi-bin/ {
        proxy_pass http://127.0.0.1:8093;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_connect_timeout 5s;
        proxy_read_timeout 30s;
    }
    
    location /kiwix/ {
        proxy_pass http://127.0.0.1:8090/;
    }
}
```

Enable the site:
```bash
sudo ln -s /etc/nginx/sites-available/omega-dashboard /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

## Runtime Configuration

The `config.js` file allows runtime configuration without rebuilding:

```javascript
window.OMEGA_CONFIG = {
  // Pi backend CGI endpoint base URL
  API_BASE: 'http://127.0.0.1:8093',
  
  // Kiwix offline wiki server
  KIWIX_BASE: 'http://127.0.0.1:8090',
  
  // Data mode: true = mock/demo data, false = live backend
  USE_MOCK_DATA: false,
};
```

### Configuration Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `API_BASE` | string | `http://127.0.0.1:8093` | Base URL for Pi backend CGI scripts |
| `KIWIX_BASE` | string | `http://127.0.0.1:8090` | Base URL for Kiwix wiki server |
| `USE_MOCK_DATA` | boolean | `false` | Use mock data instead of live backend |

## Hash Routing

The dashboard uses hash-based routing (`/#/path`) which:
- Works without server-side routing configuration
- Allows serving from any static file server
- Supports browser refresh on any page
- Works with file:// protocol for local testing

## Verification

After deployment:

1. **Open Dashboard**: Navigate to `http://your-pi-ip/`

2. **Check System Status**: 
   - Click "Status" button in header
   - Verify build version
   - Click "Run Self Test"

3. **Verify Endpoints**:
   - health: Should show PASS when backend is running
   - metrics: Should show PASS
   - sensors: Should show PASS

4. **Check Data Mode**:
   - If connected: Shows "LIVE" badge
   - If disconnected: Shows "MOCK DATA" badge

## Troubleshooting

### Blank Page
- Check browser console for errors
- Verify nginx is serving files
- Check file permissions

### API Errors
- Verify backend is running: `curl http://127.0.0.1:8093/cgi-bin/health.py`
- Check nginx proxy configuration
- Look at nginx error logs

### Wrong URLs
- Edit `/var/www/omega-dashboard/config.js`
- Hard refresh browser (Ctrl+Shift+R)

## Offline Operation

The dashboard is designed for offline-first operation:

1. **Service Worker**: Caches static assets for offline access
2. **Mock Data**: Falls back to mock data when backend unavailable
3. **Local Storage**: Persists user preferences locally
4. **Graceful Degradation**: UI remains functional without backend

## Updating

To update the dashboard:

1. Build new release: `yarn build:pi`
2. Transfer to Pi
3. Run `./install.sh` (or copy files manually)
4. Hard refresh browser

The `config.js` file is preserved during updates if using the install script.
