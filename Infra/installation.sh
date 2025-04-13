#!/bin/bash

# Update & install tools
sudo apt update -y
sudo apt install -y curl git nginx

# Install Node.js (18.x)
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo bash -
sudo apt install -y nodejs

# Clone your repo (replace with your actual repo)
# cd /home/ubuntu
# git clone https://github.com/YOUR_USERNAME/YOUR_REPO.git react-app
# cd react-app

# # Build the React app
# npm install
# npm run build

# # Move build to nginx directory
# cp -r build/* /var/www/html/

# # Optional: Replace default nginx config (see below)
# cat > /etc/nginx/sites-available/default << EOF
# server {
#     listen 80;
#     server_name _;

#     root /var/www/html;
#     index index.html index.htm;

#     location / {
#         try_files \$uri /index.html;
#     }
# }
# EOF

# # Restart nginx
# systemctl restart nginx

