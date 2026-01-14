#!/bin/bash
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
