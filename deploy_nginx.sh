#!/bin/bash

# JAAGO Core - Nginx Deployment Helper Script
# This script uploads the NGINX_PROXY.conf to the production server and reloads Nginx.

# Configuration
SERVER="jaagocore.jaago.com.bd"
USER="root" # Change this to your server username (e.g., 'ubuntu' or 'root')
REMOTE_PATH="/etc/nginx/sites-available/jaagocore"
REMOTE_LINK="/etc/nginx/sites-enabled/jaagocore"

echo "🚀 Starting Deployment of Nginx Configuration..."

# 1. Upload the configuration file
echo "📤 Uploading NGINX_PROXY.conf to $SERVER..."
scp ./NGINX_PROXY.conf $USER@$SERVER:/tmp/janjaago.conf

# 2. Apply the configuration and restart Nginx
echo "⚙️ Applying configuration and restarting Nginx..."
ssh $USER@$SERVER << EOF
    mv /tmp/janjaago.conf $REMOTE_PATH
    ln -sf $REMOTE_PATH $REMOTE_LINK
    nginx -t && systemctl reload nginx
    echo "✅ Nginx reloaded successfully!"
EOF

echo "✨ Deployment Complete! Please visit https://jaagocore.jaago.com.bd to verify."
