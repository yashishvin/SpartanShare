#!/bin/bash

# Update & install tools
sudo apt update -y
sudo apt install -y curl git nginx

# Install Node.js (18.x)
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo bash -
sudo apt install -y nodejs

# # Move build to nginx directory
  rm -rf /var/www/html/*

# Clean up existing site configs
rm -f /etc/nginx/sites-enabled/*
rm -f /etc/nginx/conf.d/*

# Add your React app config
cat > /etc/nginx/conf.d/react.conf << 'EOF'
server {
    listen 80;
    root /var/www/html;
    index index.html;
    location / {
        try_files $uri /index.html;
    }
}
EOF

# # Restart nginx
sudo nginx -t && sudo systemctl reload nginx


