# OMEGA Dashboard - Pi Deployment Checklist
## Complete Deployment Guide for Raspberry Pi

---

## Pre-Deployment Requirements

### Pi Environment
- [ ] Raspberry Pi 5 (or 4 with 2GB+ RAM)
- [ ] Raspberry Pi OS installed
- [ ] nginx installed and running
- [ ] Network configured (LAN access)

### Services Running
- [ ] OMEGA Backend on port 8093
  ```bash
  curl http://127.0.0.1:8093/cgi-bin/health.py
  # Expected: {"status": "ok", ...}
  ```
- [ ] Kiwix on port 8090
  ```bash
  curl http://127.0.0.1:8090/
  # Expected: 200 OK
  ```
- [ ] Jellyfin on port 8096 (if Entertainment enabled)
  ```bash
  curl http://127.0.0.1:8096/
  # Expected: 200 OK
  ```

### Directory Structure
```bash
# Verify or create
sudo mkdir -p /var/www/html
sudo mkdir -p /var/www/releases
sudo chown -R www-data:www-data /var/www
```

---

## Build Process

### 1. Development Machine Build
```bash
# Navigate to frontend
cd /app/frontend

# Install dependencies (if needed)
yarn install

# Build for Pi deployment
yarn build:pi
```

### 2. Verify Build Output
```bash
# Check release was created
ls -la deploy/releases/

# Should see timestamped folder like:
# 2026-01-13_143052/
#   ├── www/
#   │   ├── index.html
#   │   ├── config.js
#   │   └── static/
#   ├── nginx.conf
#   ├── install.sh
#   ├── SELFTEST.md
#   └── README.md
```

### 3. Verify Bundle Size
```bash
# Check total size (target: <10MB)
du -sh deploy/releases/*/www/

# Check individual chunks
ls -lh deploy/releases/*/www/static/js/
```

---

## Transfer to Pi

### Option A: SCP (Simple)
```bash
# From development machine
RELEASE="2026-01-13_143052"  # Replace with actual timestamp
PI_HOST="pi@omega.local"     # Replace with your Pi

scp -r deploy/releases/$RELEASE $PI_HOST:/var/www/releases/
```

### Option B: rsync (Efficient for updates)
```bash
rsync -avz --progress deploy/releases/$RELEASE/ \
  $PI_HOST:/var/www/releases/$RELEASE/
```

### Option C: USB Drive (Offline)
```bash
# Copy to USB
cp -r deploy/releases/$RELEASE /media/usb/omega-release/

# On Pi, mount USB and copy
sudo cp -r /media/usb/omega-release/$RELEASE /var/www/releases/
```

---

## Pi Installation

### 1. SSH to Pi
```bash
ssh pi@omega.local
```

### 2. Configure Runtime Settings
```bash
# Edit config.js for your environment
sudo nano /var/www/releases/$RELEASE/www/config.js
```

```javascript
// Verify/update these values:
window.OMEGA_CONFIG = {
  API_BASE: 'http://127.0.0.1:8093',
  KIWIX_BASE: 'http://127.0.0.1:8090',
  JELLYFIN_BASE: 'http://127.0.0.1:8096',
  USE_MOCK_DATA: false,  // Set true for testing without backend
};
```

### 3. Set Permissions
```bash
sudo chown -R www-data:www-data /var/www/releases/$RELEASE
sudo chmod -R 755 /var/www/releases/$RELEASE
```

### 4. Symlink Swap
```bash
# Create/update symlink (atomic operation)
sudo ln -sfn /var/www/releases/$RELEASE/www /var/www/html/current

# Verify symlink
ls -la /var/www/html/current
```

### 5. Configure nginx (First time only)
```bash
# Copy nginx config
sudo cp /var/www/releases/$RELEASE/nginx.conf \
  /etc/nginx/sites-available/omega-dashboard

# Enable site
sudo ln -sf /etc/nginx/sites-available/omega-dashboard \
  /etc/nginx/sites-enabled/

# Test config
sudo nginx -t

# Reload nginx
sudo systemctl reload nginx
```

---

## nginx Configuration

### /etc/nginx/sites-available/omega-dashboard
```nginx
server {
    listen 80;
    server_name _;
    
    # Serve from symlinked current release
    root /var/www/html/current;
    index index.html;
    
    # SPA routing - serve index.html for all routes
    location / {
        try_files $uri $uri/ /index.html;
    }
    
    # Cache static assets (1 year)
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
    
    # Proxy API requests to OMEGA backend
    location /cgi-bin/ {
        proxy_pass http://127.0.0.1:8093;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_connect_timeout 5s;
        proxy_read_timeout 30s;
    }
    
    # Proxy Kiwix requests
    location /kiwix/ {
        proxy_pass http://127.0.0.1:8090/;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
    }
    
    # Proxy Jellyfin requests (optional)
    location /jellyfin/ {
        proxy_pass http://127.0.0.1:8096/;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
    }
}
```

---

## Post-Deployment Verification

### 1. Basic Access Test
```bash
# From Pi
curl -s http://127.0.0.1/ | head -20
# Should show HTML with <title>OMEGA Dashboard</title>

# From another device on LAN
curl -s http://omega.local/
```

### 2. Open in Browser
Navigate to: `http://omega.local/` or `http://<pi-ip>/`

### 3. Self-Test Checklist

#### Dashboard Load
- [ ] Page loads without blank screen
- [ ] No console errors (check DevTools)
- [ ] OMEGA header visible
- [ ] Quick Tools bar visible

#### System Status Panel
- [ ] Click "Status" button in header
- [ ] Build version displays correctly
- [ ] API Base URL shows configured value
- [ ] Click "Run Self Test"

#### Endpoint Connectivity
After Self Test:
- [ ] health: PASS (or meaningful error)
- [ ] metrics: PASS (or meaningful error)
- [ ] sensors: PASS (or meaningful error)

#### Data Mode
- [ ] If USE_MOCK_DATA=false: Shows "LIVE" when connected
- [ ] If USE_MOCK_DATA=true: Shows "MOCK DATA" badge

#### Offline Test
- [ ] Disconnect network
- [ ] Refresh page
- [ ] Dashboard still loads (service worker)
- [ ] Shows "Not Connected" status

---

## Rollback Procedure

### If Issues Found
```bash
# 1. List available releases
ls -la /var/www/releases/

# 2. Identify previous working release
# e.g., 2026-01-12_093000

# 3. Swap symlink to previous
sudo ln -sfn /var/www/releases/2026-01-12_093000/www /var/www/html/current

# 4. Verify rollback
curl http://127.0.0.1/

# 5. Hard refresh browser (Ctrl+Shift+R)
```

### Cleanup Old Releases
```bash
# Keep last 5 releases, remove older
cd /var/www/releases
ls -t | tail -n +6 | xargs rm -rf
```

---

## Troubleshooting

### Blank Page
1. Check browser console for errors
2. Verify nginx is serving: `curl http://127.0.0.1/`
3. Check permissions: `ls -la /var/www/html/current/`
4. Check nginx logs: `tail /var/log/nginx/error.log`

### API Errors
1. Verify backend: `curl http://127.0.0.1:8093/cgi-bin/health.py`
2. Check nginx proxy config
3. Check backend logs

### Wrong Configuration
1. Edit `/var/www/html/current/config.js`
2. Hard refresh browser (Ctrl+Shift+R)
3. No nginx restart needed for config.js changes

### Service Worker Issues
1. Open DevTools → Application → Service Workers
2. Click "Unregister"
3. Hard refresh (Ctrl+Shift+R)
4. Verify new version registers

---

## Maintenance Commands

### View Current Version
```bash
# Check symlink target
readlink /var/www/html/current

# Check version in config
grep -A5 "build:" /var/www/html/current/config.js
```

### Check nginx Status
```bash
sudo systemctl status nginx
sudo nginx -t  # Test configuration
```

### View Access Logs
```bash
tail -f /var/log/nginx/access.log
```

### View Error Logs
```bash
tail -f /var/log/nginx/error.log
```

### Disk Space Check
```bash
df -h /var/www
du -sh /var/www/releases/*
```

---

## Release Versioning

### Version Format
```
YYYY-MM-DD_HHMMSS
Example: 2026-01-13_143052
```

### Version in UI
- System Status → BUILD INFO
- Footer (optional)

### Release Notes Location
```
/var/www/releases/<version>/RELEASE_NOTES.md
```

---

## Security Considerations

### File Permissions
```bash
# Web files: read-only for www-data
sudo chown -R root:www-data /var/www/releases/
sudo chmod -R 755 /var/www/releases/
sudo chmod -R 644 /var/www/releases/*/www/*.html
sudo chmod -R 644 /var/www/releases/*/www/*.js
```

### Config Protection
```bash
# config.js should be editable but not world-writable
sudo chmod 644 /var/www/html/current/config.js
```

### Firewall (Optional)
```bash
# Only allow LAN access
sudo ufw allow from 192.168.0.0/24 to any port 80
```

---

## Quick Reference

| Action | Command |
|--------|---------|
| Build | `yarn build:pi` |
| Deploy | `ln -sfn /var/www/releases/<ver>/www /var/www/html/current` |
| Rollback | Same as deploy with previous version |
| Reload nginx | `sudo systemctl reload nginx` |
| Check status | `curl http://127.0.0.1/` |
| View logs | `tail -f /var/log/nginx/error.log` |
| Self test | Open browser → Status → Run Self Test |

---

*Last Updated: January 13, 2026*
