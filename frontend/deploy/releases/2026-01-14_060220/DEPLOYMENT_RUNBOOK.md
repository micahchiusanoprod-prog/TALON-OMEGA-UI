# OMEGA Dashboard - Pi Deployment Runbook

## Version
- Release: 2026-01-14_060220
- Build: Production (sourcemaps disabled, mock data disabled)

---

## Pre-Flight Checks

```bash
# 1. SSH into Pi
ssh pi@talon.local

# 2. Verify Pi services are running
sudo systemctl status nginx
sudo systemctl status omega-backend  # Or your backend service name

# 3. Check disk space (need ~50MB)
df -h /var/www

# 4. Check current deployment (if exists)
ls -la /var/www/omega-dashboard/

# 5. Backup current deployment
sudo cp -r /var/www/omega-dashboard /var/www/omega-dashboard.backup.$(date +%Y%m%d%H%M%S)
```

---

## Deployment Steps

### Step 1: Transfer Release Package to Pi

```bash
# From your dev machine (where build was done)
scp -r /app/frontend/deploy/releases/2026-01-14_060220 pi@talon.local:~/omega-release/

# Or use rsync for better reliability
rsync -avz --progress /app/frontend/deploy/releases/2026-01-14_060220/ pi@talon.local:~/omega-release/
```

### Step 2: Run Installation Script

```bash
# SSH into Pi
ssh pi@talon.local

# Navigate to release
cd ~/omega-release

# Run installer (handles copying and nginx config)
chmod +x install.sh
./install.sh
```

### Step 3: Configure Runtime Settings

```bash
# Edit config.js for your network
sudo nano /var/www/omega-dashboard/config.js

# Key settings to verify:
#   API_BASE: 'http://talon.local' (or your Pi's hostname/IP)
#   KIWIX_BASE: 'http://talon.local:8090'
```

### Step 4: Verify Nginx Configuration

```bash
# Test nginx config syntax
sudo nginx -t

# If test passes, reload
sudo systemctl reload nginx

# Check nginx status
sudo systemctl status nginx
```

---

## Post-Deploy Smoke Tests

### From Pi (localhost)

```bash
# Test dashboard loads
curl -s -o /dev/null -w "%{http_code}" http://127.0.0.1/
# Expected: 200

# Test API proxy
curl -s -o /dev/null -w "%{http_code}" http://127.0.0.1/api/health
# Expected: 200 (or 502 if backend not running)

# Test Kiwix proxy
curl -s -o /dev/null -w "%{http_code}" http://127.0.0.1/kiwix/
# Expected: 200 (or 502 if Kiwix not running)

# Test health endpoint
curl http://127.0.0.1/health
# Expected: "OMEGA Dashboard OK"
```

### From LAN Client (another device)

```bash
# Replace talon.local with actual hostname or IP

# Test dashboard
curl -s -o /dev/null -w "%{http_code}" http://talon.local/
# Expected: 200

# Test API from LAN
curl -s http://talon.local/api/health
# Expected: JSON response or 502

# Test Kiwix from LAN
curl -s -o /dev/null -w "%{http_code}" http://talon.local/kiwix/
# Expected: 200 or 502
```

---

## Rollback Procedure

### One-Command Rollback

```bash
# Restore previous deployment
sudo rm -rf /var/www/omega-dashboard
sudo cp -r /var/www/omega-dashboard.backup.TIMESTAMP /var/www/omega-dashboard
sudo systemctl reload nginx
```

### Full Rollback (with nginx config)

```bash
# 1. Restore dashboard files
sudo rm -rf /var/www/omega-dashboard
sudo cp -r /var/www/omega-dashboard.backup.TIMESTAMP /var/www/omega-dashboard

# 2. Restore previous nginx config (if backed up)
sudo cp /etc/nginx/sites-available/omega-dashboard.backup /etc/nginx/sites-available/omega-dashboard
sudo nginx -t && sudo systemctl reload nginx

# 3. Verify rollback
curl http://127.0.0.1/
```

---

## Nginx Routes Summary

| Route | Target | Description |
|-------|--------|-------------|
| `/` | Static files | Dashboard SPA |
| `/api/*` | `127.0.0.1:8093` | OMEGA API (via proxy) |
| `/cgi-bin/*` | `127.0.0.1:8093/cgi-bin/` | Legacy CGI |
| `/kiwix/*` | `127.0.0.1:8090` | Kiwix proxy |
| `/health` | Direct | Health check |

### LAN Access
- Dashboard: `http://talon.local/`
- API: `http://talon.local/api/*`
- Kiwix: `http://talon.local/kiwix/*` OR `http://talon.local:8090/`

---

## Troubleshooting

### Dashboard shows blank page
1. Check browser console for errors
2. Verify `config.js` has correct URLs
3. Check nginx error log: `sudo tail -f /var/log/nginx/error.log`

### API returns 502
1. Backend not running: `sudo systemctl status omega-backend`
2. Wrong port: Check nginx upstream config
3. Restart backend: `sudo systemctl restart omega-backend`

### Kiwix returns 502
1. Kiwix not running: `sudo systemctl status kiwix-serve`
2. Start Kiwix: `sudo systemctl start kiwix-serve`
3. Check Kiwix direct: `curl http://127.0.0.1:8090/`

### CORS errors from LAN
1. Check nginx CORS headers in config
2. Verify `Access-Control-Allow-Origin: *` is set
3. Reload nginx after config changes

---

## Service Commands Reference

```bash
# Nginx
sudo systemctl start|stop|restart|reload|status nginx
sudo nginx -t  # Test config

# View logs
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log

# Backend (adjust service name)
sudo systemctl start|stop|restart|status omega-backend

# Kiwix
sudo systemctl start|stop|restart|status kiwix-serve
```

---

## Verification Matrix

After deployment, verify these flows work:

| Flow | Services Up | Kiwix Down | Jellyfin Missing | API Down |
|------|-------------|------------|------------------|----------|
| Home loads | ✅ | ✅ (badge) | ✅ (badge) | ✅ (badge) |
| Search works | ✅ | ✅ (library only) | ✅ (NOT_INDEXED) | ⚠️ (cached) |
| Admin→Search Health | ✅ | ✅ (UNAVAILABLE) | ✅ (NOT_CONFIGURED) | ⚠️ |
| Admin→Data Health | ✅ | ✅ (UNAVAILABLE + fix guide) | ✅ (fix guide) | ⚠️ |

**Legend:**
- ✅ = Works with appropriate status indicators
- ⚠️ = Degraded but shows status/guidance
- ❌ = Broken (should not happen)
