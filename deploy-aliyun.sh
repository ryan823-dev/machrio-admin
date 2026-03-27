#!/bin/bash

# =============================================
# Aliyun One-Click Deployment Script
# =============================================

set -e

echo "============================================="
echo "  Machrio Admin - Aliyun Deployment"
echo "============================================="
echo ""

# Check if running as root
if [ "$EUID" -ne 0 ]; then 
  echo "Please run as root: sudo $0"
  exit 1
fi

# Install Docker
echo "[1/5] Installing Docker..."
if ! command -v docker &> /dev/null; then
  curl -fsSL https://get.docker.com | sh
  systemctl enable docker
  systemctl start docker
  echo "✓ Docker installed"
else
  echo "✓ Docker already installed"
fi

# Install Docker Compose
echo "[2/5] Installing Docker Compose..."
if ! command -v docker-compose &> /dev/null; then
  curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
  chmod +x /usr/local/bin/docker-compose
  echo "✓ Docker Compose installed"
else
  echo "✓ Docker Compose already installed"
fi

# Create .env file
echo "[3/5] Creating environment configuration..."
cat > .env << 'EOF'
POSTGRES_DB=machrio
POSTGRES_USER=machrio
POSTGRES_PASSWORD=Machrio@2026
SPRING_JPA_HIBERNATE_DDL_AUTO=update
SERVER_PORT=8080
APP_CORS_ALLOWED_ORIGINS=*
EOF
echo "✓ Environment created"

# Build and start services
echo "[4/5] Building and starting services..."
docker-compose -f docker-compose.aliyun.yml down 2>/dev/null || true
docker-compose -f docker-compose.aliyun.yml build
docker-compose -f docker-compose.aliyun.yml up -d

# Show status
echo "[5/5] Checking service status..."
sleep 10
echo ""
echo "============================================="
echo "  Deployment Complete!"
echo "============================================="
echo ""
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
echo ""
echo "Access URLs:"
IP=$(hostname -I | awk '{print $1}')
echo "  Frontend: http://$IP"
echo "  Backend:  http://$IP:8080"
echo "  Health:   http://$IP:8080/api/health"
echo ""
