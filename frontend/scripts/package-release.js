#!/usr/bin/env node
/**
 * OMEGA Dashboard - Pi Release Packager
 * Creates a timestamped release bundle for deployment to Raspberry Pi
 */

const fs = require('fs');
const path = require('path');

const timestamp = new Date().toISOString().replace(/[:.]/g, '-').split('T')[0] + '_' + 
                  new Date().toISOString().split('T')[1].replace(/[:.]/g, '').substring(0, 6);

const releaseDir = path.join(__dirname, '..', 'deploy', 'releases', timestamp);
const wwwDir = path.join(releaseDir, 'www');
const buildDir = path.join(__dirname, '..', 'build');

console.log('📦 OMEGA Dashboard Release Packager');
console.log('====================================');
console.log(`Release: ${timestamp}`);

// Create release directories
fs.mkdirSync(wwwDir, { recursive: true });
console.log(`✅ Created release directory: ${releaseDir}`);

// Copy build files to www
function copyDir(src, dest) {
  fs.mkdirSync(dest, { recursive: true });
  const entries = fs.readdirSync(src, { withFileTypes: true });
  
  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    
    if (entry.isDirectory()) {
      copyDir(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

if (fs.existsSync(buildDir)) {
  copyDir(buildDir, wwwDir);
  console.log('✅ Copied build files to www/');
} else {
  console.error('❌ Build directory not found! Run yarn build first.');
  process.exit(1);
}

// Create runtime config template
const runtimeConfig = `// OMEGA Dashboard Runtime Configuration
// Edit this file to configure the dashboard for your Pi

window.OMEGA_CONFIG = {
  // Pi backend CGI base URL
  API_BASE: 'http://127.0.0.1:8093',
  
  // Kiwix offline wiki server URL
  KIWIX_BASE: 'http://127.0.0.1:8090',
  
  // Set to false to enable live backend connections
  // Set to true to use mock/demo data
  USE_MOCK_DATA: false,
};
`;

fs.writeFileSync(path.join(wwwDir, 'config.js'), runtimeConfig);
console.log('✅ Created runtime config.js');

// Update index.html to load config.js
const indexPath = path.join(wwwDir, 'index.html');
let indexHtml = fs.readFileSync(indexPath, 'utf8');

// Insert config.js script before closing head tag
if (!indexHtml.includes('config.js')) {
  indexHtml = indexHtml.replace(
    '</head>',
    '    <script src="./config.js"></script>\n  </head>'
  );
  fs.writeFileSync(indexPath, indexHtml);
  console.log('✅ Updated index.html with config.js reference');
}

// Create nginx config
const nginxConfig = `# OMEGA Dashboard nginx configuration
# Copy this to /etc/nginx/sites-available/omega-dashboard

server {
    listen 80;
    server_name _;
    
    root /var/www/omega-dashboard;
    index index.html;
    
    # Serve static files
    location / {
        try_files $uri $uri/ /index.html;
    }
    
    # Cache static assets
    location ~* \\.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
    
    # Proxy API requests to Pi backend
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
}
`;

fs.writeFileSync(path.join(releaseDir, 'nginx.conf'), nginxConfig);
console.log('✅ Created nginx.conf');

// Create install script
const installScript = `#!/bin/bash
# OMEGA Dashboard Installation Script
# Run this on your Raspberry Pi

set -e

INSTALL_DIR="/var/www/omega-dashboard"
RELEASE_DIR="$(dirname "$0")"

echo "🚀 Installing OMEGA Dashboard..."
echo "================================"

# Create install directory
sudo mkdir -p $INSTALL_DIR

# Copy files
sudo cp -r "$RELEASE_DIR/www/"* $INSTALL_DIR/
echo "✅ Copied dashboard files"

# Set permissions
sudo chown -R www-data:www-data $INSTALL_DIR
sudo chmod -R 755 $INSTALL_DIR
echo "✅ Set permissions"

# Copy nginx config if nginx is installed
if command -v nginx &> /dev/null; then
    sudo cp "$RELEASE_DIR/nginx.conf" /etc/nginx/sites-available/omega-dashboard
    sudo ln -sf /etc/nginx/sites-available/omega-dashboard /etc/nginx/sites-enabled/
    sudo nginx -t && sudo systemctl reload nginx
    echo "✅ Configured nginx"
fi

echo ""
echo "✅ Installation complete!"
echo ""
echo "📝 Next steps:"
echo "   1. Edit $INSTALL_DIR/config.js to set your API URLs"
echo "   2. Ensure your Pi backend is running on port 8093"
echo "   3. Access the dashboard at http://your-pi-ip/"
echo ""
echo "🔧 To run self-test, open the dashboard and click 'System Status'"
`;

fs.writeFileSync(path.join(releaseDir, 'install.sh'), installScript);
fs.chmodSync(path.join(releaseDir, 'install.sh'), '755');
console.log('✅ Created install.sh');

// Create SELFTEST.md
const selftest = `# OMEGA Dashboard Self-Test Checklist

## Pre-Installation Verification

Before installing, verify your Pi environment:

\`\`\`bash
# Check nginx is installed
nginx -v

# Check Pi backend is running
curl -s http://127.0.0.1:8093/cgi-bin/health.py

# Check Kiwix is running (optional)
curl -s http://127.0.0.1:8090/
\`\`\`

## Post-Installation Self-Test

### 1. Dashboard Loads
- [ ] Navigate to http://your-pi-ip/ in a browser
- [ ] Dashboard loads without blank screen
- [ ] No console errors (check browser DevTools)

### 2. System Status Panel
- [ ] Click "Status" button in header
- [ ] Build version displays correctly
- [ ] API Base URL shows your configured URL
- [ ] Click "Run Self Test" button

### 3. Endpoint Connectivity
After running self-test, verify:
- [ ] health endpoint: PASS or meaningful error
- [ ] metrics endpoint: PASS or meaningful error
- [ ] sensors endpoint: PASS or meaningful error

### 4. Mock/Live Mode
- [ ] If USE_MOCK_DATA=true: Shows "MOCK DATA" badge
- [ ] If USE_MOCK_DATA=false: Shows "LIVE" when connected

### 5. Offline Capability
- [ ] Disconnect network
- [ ] Refresh page
- [ ] Dashboard still loads from cache
- [ ] Shows "Not Connected" status

## Troubleshooting

### Dashboard shows blank page
1. Check browser console for errors
2. Verify nginx is serving files: \`curl http://localhost/\`
3. Check file permissions: \`ls -la /var/www/omega-dashboard/\`

### API calls failing
1. Verify backend is running: \`curl http://127.0.0.1:8093/cgi-bin/health.py\`
2. Check nginx proxy config
3. Look at nginx error log: \`tail /var/log/nginx/error.log\`

### Wrong API URL
1. Edit \`/var/www/omega-dashboard/config.js\`
2. Change API_BASE to correct URL
3. Hard refresh browser (Ctrl+Shift+R)

## Expected Self-Test Output

When all systems are operational:
\`\`\`
✅ health: PASS (45ms)
✅ metrics: PASS (32ms)  
✅ sensors: PASS (28ms)
\`\`\`

When backend is not running:
\`\`\`
❌ health: FAIL (timeout)
❌ metrics: FAIL (timeout)
❌ sensors: FAIL (timeout)
\`\`\`
`;

fs.writeFileSync(path.join(releaseDir, 'SELFTEST.md'), selftest);
console.log('✅ Created SELFTEST.md');

// Create README
const readme = `# OMEGA Dashboard - Pi Deployment Package

**Release:** ${timestamp}
**Build Date:** ${new Date().toISOString()}

## Contents

\`\`\`
${timestamp}/
├── www/              # Static dashboard files (copy to web root)
│   ├── index.html
│   ├── config.js     # Runtime configuration (EDIT THIS!)
│   └── static/       # CSS, JS, assets
├── nginx.conf        # nginx server configuration
├── install.sh        # Automated installation script
├── SELFTEST.md       # Post-installation verification guide
└── README.md         # This file
\`\`\`

## Quick Install

\`\`\`bash
# On your Raspberry Pi:
cd ${timestamp}
./install.sh
\`\`\`

## Manual Install

1. Copy \`www/\` contents to your web server root:
   \`\`\`bash
   sudo cp -r www/* /var/www/omega-dashboard/
   \`\`\`

2. Edit runtime configuration:
   \`\`\`bash
   sudo nano /var/www/omega-dashboard/config.js
   \`\`\`
   
   Update these values:
   - \`API_BASE\`: Your Pi backend URL (default: http://127.0.0.1:8093)
   - \`KIWIX_BASE\`: Your Kiwix server URL (default: http://127.0.0.1:8090)
   - \`USE_MOCK_DATA\`: Set to \`false\` for live data

3. Configure nginx using provided \`nginx.conf\`

4. Run self-test (see SELFTEST.md)

## Runtime Configuration

The \`config.js\` file allows you to change settings without rebuilding:

\`\`\`javascript
window.OMEGA_CONFIG = {
  API_BASE: 'http://127.0.0.1:8093',     // Pi backend
  KIWIX_BASE: 'http://127.0.0.1:8090',   // Kiwix wiki
  USE_MOCK_DATA: false,                   // true = demo mode
};
\`\`\`

## Hash Routing

This build uses hash-based routing (\`/#/path\`) which works without server-side routing configuration. You can serve the files from any static web server.

## Verification

After installation, open System Status panel to verify:
1. Build version matches this release
2. API endpoints are reachable
3. Data mode shows LIVE (not MOCK)

See SELFTEST.md for complete verification checklist.
`;

fs.writeFileSync(path.join(releaseDir, 'README.md'), readme);
console.log('✅ Created README.md');

// Print summary
console.log('');
console.log('====================================');
console.log('✅ Release package created!');
console.log('');
console.log(`📁 Location: deploy/releases/${timestamp}/`);
console.log('');
console.log('📦 Contents:');
console.log('   www/           - Static dashboard files');
console.log('   config.js      - Runtime configuration');
console.log('   nginx.conf     - Server configuration');
console.log('   install.sh     - Installation script');
console.log('   SELFTEST.md    - Verification guide');
console.log('   README.md      - Deployment instructions');
console.log('');
console.log('🚀 To deploy: Copy this folder to your Pi and run ./install.sh');
