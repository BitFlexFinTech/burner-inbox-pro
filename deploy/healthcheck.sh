#!/bin/bash
# ═══════════════════════════════════════════════════════════════════════════════
# healthcheck.sh - Health Check Script
# Project: burnerbox
# VPS: 155.138.212.189
# ═══════════════════════════════════════════════════════════════════════════════

set -e

VPS_HOST="${VPS_HOST:-155.138.212.189}"
VPS_USER="${VPS_USER:-burnerbox-vps}"
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
echo "🏥 HEALTH CHECK - burnerbox"
echo "═══════════════════════════════════════════════════════════════════════════════"
echo ""

HEALTH_STATUS=0

# Check 1: PM2 Status
echo -e "${BLUE}[1/4] Checking PM2 process...${NC}"
BOT_STATUS=$(run_remote "pm2 jlist 2>/dev/null | jq -r '.[] | select(.name==\"$PM2_APP_NAME\") | .pm2_env.status' 2>/dev/null || echo 'unknown'")
if [ "$BOT_STATUS" = "online" ]; then
    echo -e "${GREEN}   ✅ PM2 Status: $BOT_STATUS${NC}"
else
    echo -e "${RED}   ❌ PM2 Status: $BOT_STATUS${NC}"
    HEALTH_STATUS=1
fi

# Check 2: API Health
echo -e "${BLUE}[2/4] Checking API health endpoint...${NC}"
HTTP_STATUS=$(run_remote "curl -s -o /dev/null -w '%{http_code}' http://localhost:3001/health 2>/dev/null || echo '000'")
if [ "$HTTP_STATUS" = "200" ]; then
    echo -e "${GREEN}   ✅ API responding (HTTP $HTTP_STATUS)${NC}"
else
    echo -e "${RED}   ❌ API not responding (HTTP $HTTP_STATUS)${NC}"
    HEALTH_STATUS=1
fi

# Check 3: Nginx Status
echo -e "${BLUE}[3/4] Checking Nginx...${NC}"
NGINX_STATUS=$(run_remote "systemctl is-active nginx 2>/dev/null || echo 'inactive'")
if [ "$NGINX_STATUS" = "active" ]; then
    echo -e "${GREEN}   ✅ Nginx: $NGINX_STATUS${NC}"
else
    echo -e "${RED}   ❌ Nginx: $NGINX_STATUS${NC}"
    HEALTH_STATUS=1
fi

# Check 4: Disk Space
echo -e "${BLUE}[4/4] Checking disk space...${NC}"
DISK_PERCENT=$(run_remote "df -h / | awk 'NR==2 {gsub(/%/,\"\"); print \$5}'")
if [ "$DISK_PERCENT" -lt 80 ]; then
    echo -e "${GREEN}   ✅ Disk: ${DISK_PERCENT}% used${NC}"
elif [ "$DISK_PERCENT" -lt 90 ]; then
    echo -e "${YELLOW}   ⚠️  Disk: ${DISK_PERCENT}% used${NC}"
else
    echo -e "${RED}   ❌ Disk Critical: ${DISK_PERCENT}% used${NC}"
    HEALTH_STATUS=1
fi

echo ""
echo "═══════════════════════════════════════════════════════════════════════════════"
if [ "$HEALTH_STATUS" -eq 0 ]; then
    echo -e "${GREEN}✅ HEALTH CHECK PASSED${NC}"
else
    echo -e "${RED}❌ HEALTH CHECK FAILED${NC}"
    echo ""
    echo "Troubleshooting:"
    echo "  - View logs: ssh $VPS_USER@$VPS_HOST 'pm2 logs $PM2_APP_NAME'"
    echo "  - Restart: ssh $VPS_USER@$VPS_HOST 'pm2 restart $PM2_APP_NAME'"
fi
echo "═══════════════════════════════════════════════════════════════════════════════"
echo ""

exit $HEALTH_STATUS
