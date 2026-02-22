@echo off
REM JAAGO Core - Nginx Deployment Helper (Windows/PowerShell)
REM This script uses scp and ssh to upload the config and reload Nginx.

set SERVER=jaagocore.jaago.com.bd
set USER=root
set REMOTE_PATH=/etc/nginx/sites-available/jaagocore
set REMOTE_LINK=/etc/nginx/sites-enabled/jaagocore

echo 🚀 Starting Deployment of Nginx Configuration...

echo 📤 Uploading NGINX_PROXY.conf to %SERVER%...
scp .\NGINX_PROXY.conf %USER%@%SERVER%:/tmp/janjaago.conf

if %errorlevel% neq 0 (
    echo ❌ Upload failed. Please check your SSH connection and credentials.
    exit /b %errorlevel%
)

echo ⚙️ Applying configuration and restarting Nginx...
ssh %USER%@%SERVER% "mv /tmp/janjaago.conf %REMOTE_PATH% && ln -sf %REMOTE_PATH% %REMOTE_LINK% && nginx -t && systemctl reload nginx"

if %errorlevel% neq 0 (
    echo ❌ Nginx reload failed. Please check the logs on the server.
    exit /b %errorlevel%
)

echo ✅ Deployment Complete! Please visit https://jaagocore.jaago.com.bd to verify.
pause
