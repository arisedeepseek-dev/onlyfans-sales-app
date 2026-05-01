#!/bin/bash
# OnlyFans Sales Tracker — VPS Auto-Install Script
# For Ubuntu/Debian servers

set -e

echo "============================================"
echo " OnlyFans Sales Tracker — VPS Installer"
echo "============================================"
echo ""

# Detect if running as root
if [ "$EUID" -ne 0 ]; then
  echo "Please run as root: sudo ./install-vps.sh"
  exit 1
fi

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Step 1: Update system
echo -e "${YELLOW}[1/7] Updating system packages...${NC}"
apt update && apt upgrade -y

# Step 2: Install Node.js 20
echo -e "${YELLOW}[2/7] Installing Node.js 20...${NC}"
if command -v node &> /dev/null; then
  NODE_VERSION=$(node -v)
  echo "Node.js $NODE_VERSION already installed"
else
  curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
  apt install -y nodejs
fi
node -v

# Step 3: Install PM2, Git, Nginx
echo -e "${YELLOW}[3/7] Installing PM2, Git, Nginx...${NC}"
apt install -y git nginx

# Install PM2 globally
npm install -g pm2

# Step 4: Clone or pull repo
echo -e "${YELLOW}[4/7] Setting up application...${NC}"
APP_DIR="/var/www/onlyfans-sales"

if [ -d "$APP_DIR" ]; then
  echo "App directory exists — pulling latest..."
  cd "$APP_DIR"
  git pull origin main
else
  echo "Cloning repository..."
  cd /var/www
  git clone https://github.com/arisedeepseek-dev/onlyfans-sales-app.git onlyfans-sales
  cd "$APP_DIR"
fi

# Step 5: Install dependencies and build
echo -e "${YELLOW}[5/7] Building application...${NC}"
npm install
npm run build

# Step 6: Configure PM2
echo -e "${YELLOW}[6/7] Configuring PM2...${NC}"
cat > "$APP_DIR/ecosystem.config.js" << 'EOF'
module.exports = {
  apps: [{
    name: 'onlyfans-sales',
    cwd: '/var/www/onlyfans-sales',
    script: 'npm',
    args: 'run preview',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    interpreter: 'none',
    autorestart: true,
    max_restarts: 10,
    min_uptime: 5000
  }]
};
EOF

# Stop existing PM2 process if any
pm2 stop onlyfans-sales 2>/dev/null || true
pm2 delete onlyfans-sales 2>/dev/null || true

# Start the app
cd "$APP_DIR"
pm2 start ecosystem.config.js
pm2 save

# Step 7: Configure Nginx
echo -e "${YELLOW}[7/7] Configuring Nginx...${NC}"

# Get domain or IP
DOMAIN="${DOMAIN:-localhost}"
SERVER_BLOCK="/etc/nginx/sites-available/onlyfans-sales"

if [ "$DOMAIN" = "localhost" ]; then
  # Use IP detection
  SERVER_IP=$(curl -s ifconfig.me || hostname -I | awk '{print $1}')
  echo "Detected server IP: $SERVER_IP"
fi

cat > "$SERVER_BLOCK" << EOF
server {
    listen 80;
    server_name $SERVER_IP;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
    }
}
EOF

# Enable site
ln -sf "$SERVER_BLOCK" /etc/nginx/sites-enabled/onlyfans-sales

# Test and reload nginx
nginx -t && systemctl reload nginx

echo ""
echo "============================================"
echo -e "${GREEN}✅ Installation complete!${NC}"
echo "============================================"
echo ""
echo "Next steps:"
echo "1. Set up Cloudflare (recommended) to proxy traffic"
echo "2. Configure your Supabase project:"
echo "   - Go to https://supabase.com → your project → SQL Editor"
echo "   - Run the contents of supabase/schema.sql"
echo ""
echo "3. Create your admin user in Supabase SQL Editor:"
echo ""
echo "   INSERT INTO public.users (id, email, role)"
echo "   VALUES ('YOUR_AUTH_UID', 'admin@yourdomain.com', 'admin');"
echo ""
echo "4. Set admin password in Supabase Dashboard → Authentication → Users → Update"
echo ""
echo "============================================"
echo "DEFAULT CREDENTIALS:"
echo "  Admin Email:    admin@yourdomain.com"
echo "  Admin Password: admin123  ← CHANGE THIS AFTER FIRST LOGIN!"
echo "============================================"
echo ""
echo "App running at: http://$SERVER_IP:3000"
echo ""
echo "Useful commands:"
echo "  pm2 status       — Check app status"
echo "  pm2 logs         — View logs"
echo "  pm2 restart app  — Restart app"
echo ""