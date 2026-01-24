#!/bin/bash
# ═══════════════════════════════════════════════════════════════════════════════
# rollback.sh - Rollback Script
# Project: burnerbox
# VPS: 155.138.212.189
# ═══════════════════════════════════════════════════════════════════════════════

set -e

VPS_HOST="${VPS_HOST:-155.138.212.189}"
VPS_USER="${VPS_USER:-burnerbox-vps}"
APP_DIR="/opt/burnerbox"
PM2_APP_NAME="burnerbox"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

run_remote() {
    ssh "$VPS_USER@$VPS_HOST" "$1"
}

echo ""
echo "═══════════════════════════════════════════════════════════════════════════════"
echo "🔄 ROLLBACK - burnerbox"
echo "═══════════════════════════════════════════════════════════════════════════════"
echo ""

# Get commits
CURRENT_COMMIT=$(run_remote "cd $APP_DIR/source && git rev-parse HEAD 2>/dev/null || echo 'unknown'")
PREVIOUS_COMMIT=$(run_remote "cat /tmp/burnerbox-previous-commit 2>/dev/null || echo 'none'")

if [ "$PREVIOUS_COMMIT" = "none" ]; then
    PREVIOUS_COMMIT=$(run_remote "cd $APP_DIR/source && git rev-parse HEAD~1 2>/dev/null || echo 'none'")
fi

echo "Current:  ${CURRENT_COMMIT:0:7}"
echo "Rollback: ${PREVIOUS_COMMIT:0:7}"
echo ""

read -p "Proceed with rollback? (y/N) " -n 1 -r
echo ""
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Rollback cancelled"
    exit 0
fi

echo -e "${BLUE}Rolling back...${NC}"

# Reset to previous commit
run_remote "cd $APP_DIR/source && git reset --hard $PREVIOUS_COMMIT"

# Rebuild
run_remote "cd $APP_DIR/source && npm install --include=dev && npx vite build"
run_remote "cd $APP_DIR/source/backend && npm install --production"

# Redeploy
run_remote "cp -r $APP_DIR/source/backend/* $APP_DIR/backend/"
run_remote "cp -r $APP_DIR/source/dist/* $APP_DIR/frontend/"

# Restart
run_remote "pm2 restart $PM2_APP_NAME"
run_remote "pm2 save"

echo ""
echo "═══════════════════════════════════════════════════════════════════════════════"
echo -e "${GREEN}✅ ROLLBACK COMPLETE${NC}"
echo "═══════════════════════════════════════════════════════════════════════════════"
echo ""
echo "  Rolled back to: ${PREVIOUS_COMMIT:0:7}"
echo ""
run_remote "pm2 status"
echo ""
