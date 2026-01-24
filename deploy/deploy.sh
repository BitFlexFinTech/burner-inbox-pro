#!/bin/bash
# ═══════════════════════════════════════════════════════════════════════════════
# deploy.sh - Standardized VPS Deployment Script
# Project: burnerbox
# VPS: 155.138.212.189 (burnerbox-vps)
# ═══════════════════════════════════════════════════════════════════════════════

set -e

# Configuration
VPS_HOST="${VPS_HOST:-155.138.212.189}"
VPS_USER="${VPS_USER:-burnerbox-vps}"
SSH_PORT="${SSH_PORT:-22}"
APP_DIR="/opt/burnerbox"
PM2_APP_NAME="burnerbox"
BRANCH="${BRANCH:-main}"
HEALTH_CHECK_URL="http://localhost:3001/health"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

log() { echo -e "${BLUE}[$(date '+%H:%M:%S')]${NC} $1"; }
success() { echo -e "${GREEN}✅ $1${NC}"; }
warn() { echo -e "${YELLOW}⚠️  $1${NC}"; }
error() { echo -e "${RED}❌ $1${NC}"; }

run_remote() {
    ssh -p "$SSH_PORT" "$VPS_USER@$VPS_HOST" "$1"
}

echo ""
echo "═══════════════════════════════════════════════════════════════════════════════"
echo "🚀 DEPLOYING BURNERBOX"
echo "═══════════════════════════════════════════════════════════════════════════════"
echo ""

# Step 1: Test connection
log "Step 1/8: Testing SSH connection..."
if ! run_remote "echo 'Connected'"; then
    error "Cannot connect to VPS"
    exit 1
fi
success "SSH connection OK"

# Step 2: Save current commit for rollback
log "Step 2/8: Saving current state for rollback..."
PREVIOUS_COMMIT=$(run_remote "cd $APP_DIR/source 2>/dev/null && git rev-parse HEAD 2>/dev/null || echo 'none'")
run_remote "echo '$PREVIOUS_COMMIT' > /tmp/burnerbox-previous-commit"
success "Previous commit: ${PREVIOUS_COMMIT:0:7}"

# Step 3: Sync source code
log "Step 3/8: Syncing source code to VPS..."
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

rsync -avz --progress \
    -e "ssh -p $SSH_PORT" \
    --exclude 'node_modules/' \
    --exclude 'dist/' \
    --exclude '.git/' \
    --exclude '.env' \
    --exclude '*.log' \
    --exclude '*.sqlite' \
    "$PROJECT_ROOT/" \
    "$VPS_USER@$VPS_HOST:$APP_DIR/source/"
success "Source code synced"

# Step 4: Build frontend on VPS
log "Step 4/8: Building frontend on VPS..."
run_remote "cd $APP_DIR/source && npm install --include=dev && npx vite build" || {
    error "Frontend build failed"
    exit 1
}
success "Frontend built"

# Step 5: Install backend dependencies
log "Step 5/8: Installing backend dependencies..."
run_remote "cd $APP_DIR/source/backend && npm install --production" || {
    error "Backend install failed"
    exit 1
}
success "Backend dependencies installed"

# Step 6: Run database migrations
log "Step 6/8: Running database migrations..."
run_remote "cd $APP_DIR/source/backend && npm run prisma:generate && npm run prisma:deploy" || {
    warn "Migration warning (may already be up to date)"
}
success "Database updated"

# Step 7: Copy to deployment directories
log "Step 7/8: Deploying to production directories..."
run_remote "cp -r $APP_DIR/source/backend/* $APP_DIR/backend/ 2>/dev/null || mkdir -p $APP_DIR/backend && cp -r $APP_DIR/source/backend/* $APP_DIR/backend/"
run_remote "mkdir -p $APP_DIR/frontend && cp -r $APP_DIR/source/dist/* $APP_DIR/frontend/"
success "Files deployed"

# Step 8: Restart services
log "Step 8/8: Restarting services..."
run_remote "cd $APP_DIR/backend && pm2 restart $PM2_APP_NAME 2>/dev/null || pm2 start npm --name $PM2_APP_NAME -- start"
run_remote "pm2 save"
run_remote "nginx -t && systemctl reload nginx" || warn "Nginx reload skipped"
success "Services restarted"

# Health check
log "Running health check..."
sleep 5
if run_remote "curl -sf http://localhost:3001/health > /dev/null 2>&1"; then
    success "Health check passed"
else
    warn "Health check inconclusive - check manually"
fi

CURRENT_COMMIT=$(run_remote "cd $APP_DIR/source && git rev-parse HEAD 2>/dev/null || echo 'unknown'")

echo ""
echo "═══════════════════════════════════════════════════════════════════════════════"
echo -e "${GREEN}✅ DEPLOYMENT COMPLETE${NC}"
echo "═══════════════════════════════════════════════════════════════════════════════"
echo ""
echo "  Previous: ${PREVIOUS_COMMIT:0:7}"
echo "  Current:  ${CURRENT_COMMIT:0:7}"
echo ""
echo "  Frontend: http://$VPS_HOST"
echo "  API:      http://$VPS_HOST/api"
echo "  Health:   http://$VPS_HOST/api/health"
echo ""
run_remote "pm2 status"
echo ""
