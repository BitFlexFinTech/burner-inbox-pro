# burnerbox — Project Bootstrap

> Universal Cursor Project Bootstrap - Auto-generated 2026-01-24

---

## Overview

| Property | Value |
|----------|-------|
| **Project Name** | burnerbox |
| **Repository** | https://github.com/BitFlexFinTech/burnerbox.git |
| **Branch** | main |
| **Frontend** | `src/` (React + Vite + Tailwind) |
| **Backend** | `backend/` (Node.js + Express + Prisma) |
| **VPS** | 155.138.212.189 |
| **VPS User** | burnerbox-vps |
| **Deployment** | PM2 + Nginx |
| **App Directory** | /opt/burnerbox |

---

## Tech Stack

### Frontend (`src/`)

| Technology | Purpose |
|------------|---------|
| React 18 | Frontend framework |
| Vite | Build tool |
| Tailwind CSS | Styling |
| TypeScript | Type safety |
| shadcn/ui | UI components |

### Backend (`backend/`)

| Technology | Purpose |
|------------|---------|
| Node.js 20.x | Runtime |
| Express | Web framework |
| Prisma | ORM |
| SQLite | Database |
| TypeScript | Type safety |
| JWT | Authentication |

### Infrastructure

| Technology | Purpose |
|------------|---------|
| PM2 | Process manager |
| Nginx | Reverse proxy + static files |
| GitHub Actions | CI/CD |
| Vultr VPS | Hosting |

---

## Project Structure

```
burnerbox/
├── .cursor/
│   └── rules                    # Cursor AI rules + NEXT_TASKS system
├── .github/
│   └── workflows/
│       └── deploy.yml           # GitHub Actions CI/CD pipeline
├── backend/
│   ├── prisma/
│   │   └── schema.prisma        # Database schema
│   ├── src/
│   │   ├── controllers/         # Route controllers
│   │   ├── middleware/          # Express middleware
│   │   ├── routes/              # API routes
│   │   ├── services/            # Business logic
│   │   └── utils/               # Utilities
│   └── package.json
├── src/
│   ├── components/              # React components
│   ├── pages/                   # Page components
│   ├── hooks/                   # Custom hooks
│   ├── services/                # API services
│   └── App.tsx
├── deploy/
│   ├── deploy.sh                # VPS deployment script
│   ├── healthcheck.sh           # Health check script
│   └── rollback.sh              # Rollback script
├── PROJECT_BOOTSTRAP.md         # This file
└── README.md
```

---

## Deployment Flow

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   Local Edit    │────▶│  GitHub Push    │────▶│  GitHub Actions │
│   (Cursor IDE)  │     │  (main branch)  │     │  (deploy.yml)   │
└─────────────────┘     └─────────────────┘     └────────┬────────┘
                                                         │
                                                         ▼
                                                ┌─────────────────┐
                                                │   VPS SSH       │
                                                │ (155.138.212.189)│
                                                └────────┬────────┘
                                                         │
        ┌────────────────────────────────────────────────┼────────────────────────────────┐
        │                                                │                                │
        ▼                                                ▼                                ▼
┌─────────────────┐                             ┌─────────────────┐              ┌─────────────────┐
│   rsync source  │                             │  npm install    │              │  pm2 restart    │
│   to VPS        │                             │  + vite build   │              │  burnerbox      │
└─────────────────┘                             └─────────────────┘              └─────────────────┘
                                                                                          │
                                                                                          ▼
                                                                                 ┌─────────────────┐
                                                                                 │  Health Check   │
                                                                                 │  /api/health    │
                                                                                 └─────────────────┘
```

### VPS Directory Structure

```
/opt/burnerbox/
├── source/          # Full source code (for building)
├── backend/         # Backend runtime (production)
└── frontend/        # Built frontend (Nginx serves this)
```

---

## NEXT_TASKS System

### Commit Format

```
<type>: <summary>

<optional description>

NEXT_TASKS:
- <task 1>
- <task 2>
- <task 3>
```

### On Project Startup

When you open this project in Cursor:

1. Cursor reads the latest commit
2. Extracts the NEXT_TASKS block
3. Asks: *"This is where I left off. Shall I continue with these tasks?"*
4. Waits for your approval

---

## Environment Variables

### Backend (`backend/.env`)

| Variable | Description |
|----------|-------------|
| `NODE_ENV` | production |
| `PORT` | 3001 |
| `DATABASE_URL` | SQLite path |
| `JWT_SECRET` | JWT signing key |
| `JWT_REFRESH_SECRET` | Refresh token key |
| `STRIPE_SECRET_KEY` | Stripe API key |
| `STRIPE_PUBLISHABLE_KEY` | Stripe public key |

### GitHub Secrets

| Secret | Description |
|--------|-------------|
| `VPS_HOST` | 155.138.212.189 |
| `VPS_USER` | burnerbox-vps |
| `VPS_SSH_KEY` | Private SSH key |

---

## Quick Commands

### Local Development

```bash
# Start frontend
npm run dev

# Start backend
cd backend && npm run dev

# Build frontend
npm run build
```

### VPS Management

```bash
# SSH to VPS
ssh burnerbox-vps@155.138.212.189

# Check app status
ssh burnerbox-vps@155.138.212.189 'pm2 status'

# View logs
ssh burnerbox-vps@155.138.212.189 'pm2 logs burnerbox'

# Restart app
ssh burnerbox-vps@155.138.212.189 'pm2 restart burnerbox'

# Health check
curl http://155.138.212.189/api/health
```

### Deployment

```bash
# Manual deploy (from project root)
./deploy-remote-build.sh --host 155.138.212.189 --user burnerbox-vps

# With domain
./deploy-remote-build.sh --host 155.138.212.189 --user burnerbox-vps --domain yourdomain.com
```

---

## Troubleshooting

### App Not Starting

```bash
# Check PM2 logs
ssh burnerbox-vps@155.138.212.189 'pm2 logs burnerbox --lines 100'

# Check Nginx status
ssh burnerbox-vps@155.138.212.189 'systemctl status nginx'

# Restart everything
ssh burnerbox-vps@155.138.212.189 'pm2 restart burnerbox && systemctl reload nginx'
```

### Database Issues

```bash
# SSH to VPS
ssh burnerbox-vps@155.138.212.189

# Run migrations
cd /opt/burnerbox/backend && npm run prisma:deploy

# Reset database (WARNING: deletes data)
cd /opt/burnerbox/backend && npm run prisma:reset
```

---

## Last Updated

- **Date:** 2026-01-24
- **By:** Universal Cursor Project Bootstrap Wizard
- **Latest Commit:** d53b12e (Clean up)

---

*This project is configured with the Universal Cursor Setup Wizard. NEXT_TASKS system is active.*
