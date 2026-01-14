# OMEGA Dashboard - Pi Deployment Package

**Release:** 2026-01-14_060220
**Build Date:** 2026-01-14T06:02:20.182Z

## Contents

```
2026-01-14_060220/
├── www/              # Static dashboard files (copy to web root)
│   ├── index.html
│   ├── config.js     # Runtime configuration (EDIT THIS!)
│   └── static/       # CSS, JS, assets
├── nginx.conf        # nginx server configuration
├── install.sh        # Automated installation script
├── SELFTEST.md       # Post-installation verification guide
└── README.md         # This file
```

## Quick Install

```bash
# On your Raspberry Pi:
cd 2026-01-14_060220
./install.sh
```

## Manual Install

1. Copy `www/` contents to your web server root:
   ```bash
   sudo cp -r www/* /var/www/omega-dashboard/
   ```

2. Edit runtime configuration:
   ```bash
   sudo nano /var/www/omega-dashboard/config.js
   ```
   
   Update these values:
   - `API_BASE`: Your Pi backend URL (default: http://127.0.0.1:8093)
   - `KIWIX_BASE`: Your Kiwix server URL (default: http://127.0.0.1:8090)
   - `USE_MOCK_DATA`: Set to `false` for live data

3. Configure nginx using provided `nginx.conf`

4. Run self-test (see SELFTEST.md)

## Runtime Configuration

The `config.js` file allows you to change settings without rebuilding:

```javascript
window.OMEGA_CONFIG = {
  API_BASE: 'http://127.0.0.1:8093',     // Pi backend
  KIWIX_BASE: 'http://127.0.0.1:8090',   // Kiwix wiki
  USE_MOCK_DATA: false,                   // true = demo mode
};
```

## Hash Routing

This build uses hash-based routing (`/#/path`) which works without server-side routing configuration. You can serve the files from any static web server.

## Verification

After installation, open System Status panel to verify:
1. Build version matches this release
2. API endpoints are reachable
3. Data mode shows LIVE (not MOCK)

See SELFTEST.md for complete verification checklist.
