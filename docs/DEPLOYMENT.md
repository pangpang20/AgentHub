# AgentHub Deployment Guide

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Environment Setup](#environment-setup)
3. [Database Setup](#database-setup)
4. [Backend Deployment](#backend-deployment)
5. [Frontend Deployment](#frontend-deployment)
6. [Monitoring](#monitoring)
7. [Troubleshooting](#troubleshooting)

## Prerequisites

- Node.js 18+ and npm
- PostgreSQL 15+
- Redis 7+
- Docker and Docker Compose (optional)
- Git
- Domain name and SSL certificate (for production)

## Environment Setup

### 1. Clone the Repository

```bash
git clone https://github.com/your-org/agenthub.git
cd agenthub
```

### 2. Install Dependencies

```bash
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

### 3. Configure Environment Variables

#### Backend Environment Variables

Create `.env` file in `backend/` directory:

```env
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/agenthub

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=1h
JWT_REFRESH_EXPIRES_IN=7d

# LLM Providers
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...
GOOGLE_AI_API_KEY=...

# Vector Database
PINECONE_API_KEY=...
PINECONE_ENVIRONMENT=...
PINECONE_INDEX=agenthub-kb

# Storage
S3_ACCESS_KEY_ID=...
S3_SECRET_ACCESS_KEY=...
S3_BUCKET=agenthub-documents
S3_REGION=us-east-1

# Redis
REDIS_URL=redis://localhost:6379

# Application
NODE_ENV=production
PORT=3001
FRONTEND_URL=https://yourdomain.com
API_URL=https://api.yourdomain.com
```

#### Frontend Environment Variables

Create `.env.local` file in `frontend/` directory:

```env
NEXT_PUBLIC_API_URL=https://api.yourdomain.com
NEXT_PUBLIC_WS_URL=wss://api.yourdomain.com
```

## Database Setup

### Option 1: Managed PostgreSQL (Recommended for Production)

**AWS RDS**
```bash
# Create RDS instance
aws rds create-db-instance \
  --db-instance-identifier agenthub-db \
  --db-instance-class db.t3.micro \
  --engine postgres \
  --master-username admin \
  --master-user-password yourpassword \
  --allocated-storage 20
```

**Neon**
```bash
# Create account at https://neon.tech
# Get connection string
# Update DATABASE_URL in .env
```

**Supabase**
```bash
# Create account at https://supabase.com
# Create project
# Get connection string
# Update DATABASE_URL in .env
```

### Option 2: Self-Hosted PostgreSQL

Using Docker:

```bash
docker run -d \
  --name agenthub-postgres \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=yourpassword \
  -e POSTGRES_DB=agenthub \
  -p 5432:5432 \
  -v postgres_data:/var/lib/postgresql/data \
  postgres:15-alpine
```

### Run Migrations

```bash
cd backend
npx prisma migrate deploy
npx prisma generate
```

### Seed Database (Optional)

```bash
npm run db:seed
```

## Backend Deployment

### Option 1: Railway (Recommended)

1. Create account at https://railway.app
2. Create new project
3. Add PostgreSQL service
4. Add Redis service
5. Connect GitHub repository
6. Configure environment variables
7. Deploy

**Railway Command:**
```bash
# Install Railway CLI
npm install -g @railway/cli

# Login
railway login

# Initialize
railway init

# Add services
railway add postgresql
railway add redis

# Set environment variables
railway variables set DATABASE_URL=...
railway variables set JWT_SECRET=...

# Deploy
railway up
```

### Option 2: Render

1. Create account at https://render.com
2. Create new Web Service
3. Connect GitHub repository
4. Configure build and start commands:
   - Build: `npm run build`
   - Start: `npm start`
5. Add PostgreSQL and Redis services
6. Configure environment variables
7. Deploy

### Option 3: AWS EC2

1. Launch EC2 instance (Ubuntu 22.04)
2. SSH into instance
3. Install dependencies:

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Install PostgreSQL
sudo apt install -y postgresql postgresql-contrib

# Install Redis
sudo apt install -y redis-server

# Install Nginx
sudo apt install -y nginx

# Install PM2
sudo npm install -g pm2
```

4. Clone repository and setup:

```bash
git clone https://github.com/your-org/agenthub.git
cd agenthub/backend
npm install
npm run build
```

5. Configure Nginx:

```nginx
# /etc/nginx/sites-available/agenthub
server {
    listen 80;
    server_name api.yourdomain.com;

    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

6. Start application with PM2:

```bash
pm2 start npm --name "agenthub-api" -- start
pm2 save
pm2 startup
```

7. Setup SSL with Let's Encrypt:

```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d api.yourdomain.com
```

### Option 4: VPS (DigitalOcean, Linode, Vultr)

Similar to AWS EC2, but with easier setup:

1. Create VPS
2. SSH into VPS
3. Use Docker Compose:

```yaml
# docker-compose.prod.yml
version: '3.8'

services:
  postgres:
    image: postgres:15-alpine
    environment:
      POSTGRES_USER: ${POSTGRES_USER}
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
      POSTGRES_DB: agenthub
    volumes:
      - postgres_data:/var/lib/postgresql/data
    restart: unless-stopped

  redis:
    image: redis:7-alpine
    volumes:
      - redis_data:/data
    restart: unless-stopped

  backend:
    build: ./backend
    ports:
      - "3001:3001"
    environment:
      - NODE_ENV=production
      - DATABASE_URL=${DATABASE_URL}
      - REDIS_URL=${REDIS_URL}
      - JWT_SECRET=${JWT_SECRET}
    depends_on:
      - postgres
      - redis
    restart: unless-stopped

volumes:
  postgres_data:
  redis_data:
```

```bash
docker-compose -f docker-compose.prod.yml up -d
```

## Frontend Deployment

### Option 1: Vercel (Recommended)

1. Create account at https://vercel.com
2. Import project from GitHub
3. Configure environment variables:
   - `NEXT_PUBLIC_API_URL`
   - `NEXT_PUBLIC_WS_URL`
4. Deploy

**Vercel CLI:**
```bash
npm install -g vercel
vercel login
vercel
```

### Option 2: Netlify

1. Create account at https://netlify.com
2. Import project from GitHub
3. Configure build settings:
   - Build command: `npm run build`
   - Publish directory: `.next`
   - Environment variables: Add `NEXT_PUBLIC_API_URL`
4. Deploy

### Option 3: AWS S3 + CloudFront

1. Build frontend:

```bash
cd frontend
npm run build
```

2. Upload to S3:

```bash
aws s3 sync out/ s3://agenthub-frontend --delete
```

3. Configure CloudFront distribution

4. Setup custom domain and SSL

### Option 4: Nginx

1. Build frontend:

```bash
cd frontend
npm run build
```

2. Serve with Nginx:

```nginx
# /etc/nginx/sites-available/agenthub-frontend
server {
    listen 80;
    server_name yourdomain.com;

    root /var/www/agenthub/out;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /_next/static {
        expires 365d;
        add_header Cache-Control "public, immutable";
    }
}
```

## Monitoring

### Application Monitoring

**Sentry**
```bash
npm install @sentry/node @sentry/tracing
```

```typescript
import * as Sentry from '@sentry/node';

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 1.0,
});
```

**LogRocket**
```typescript
import LogRocket from 'logrocket';

LogRocket.init('your-app-id');
```

### Database Monitoring

**pgAdmin** - PostgreSQL management
**RedisInsight** - Redis management

### Performance Monitoring

**New Relic**
**Datadog**
**Prometheus + Grafana**

## Troubleshooting

### Common Issues

#### Database Connection Failed

```bash
# Check PostgreSQL is running
sudo systemctl status postgresql

# Check connection
psql -h localhost -U postgres -d agenthub

# Check firewall
sudo ufw allow 5432
```

#### Redis Connection Failed

```bash
# Check Redis is running
sudo systemctl status redis

# Check connection
redis-cli ping

# Check firewall
sudo ufw allow 6379
```

#### Build Errors

```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install

# Clear Next.js cache
rm -rf .next
npm run build
```

#### Memory Issues

```bash
# Increase Node.js memory limit
NODE_OPTIONS="--max-old-space-size=4096" npm start

# Use PM2 cluster mode
pm2 start npm --name "agenthub-api" -i max -- start
```

#### SSL Certificate Issues

```bash
# Renew Let's Encrypt certificate
sudo certbot renew

# Force renewal
sudo certbot renew --force-renewal
```

### Health Checks

```bash
# Backend health
curl https://api.yourdomain.com/v1/health

# Database health
psql -h localhost -U postgres -d agenthub -c "SELECT 1"

# Redis health
redis-cli -h localhost -p 6379 ping
```

### Logs

```bash
# PM2 logs
pm2 logs agenthub-api

# System logs
sudo journalctl -u postgresql
sudo journalctl -u redis

# Nginx logs
sudo tail -f /var/log/nginx/error.log
sudo tail -f /var/log/nginx/access.log
```

## Security Best Practices

1. **Use HTTPS everywhere**
2. **Rotate secrets regularly**
3. **Implement rate limiting**
4. **Enable CORS only for trusted domains**
5. **Use environment variables for sensitive data**
6. **Keep dependencies updated**
7. **Regular security audits**
8. **Enable firewall rules**
9. **Use strong passwords**
10. **Implement backup strategy**

## Backup Strategy

### Database Backup

```bash
# Daily backup
0 2 * * * pg_dump -h localhost -U postgres agenthub | gzip > / backups/agenthub_$(date +\%Y\%m\%d).sql.gz

# Keep last 7 days
0 3 * * * find /backups -name "agenthub_*.sql.gz" -mtime +7 -delete
```

### Redis Backup

```bash
# Enable AOF persistence
# In redis.conf:
appendonly yes
appendfsync everysec
```

## Scaling

### Horizontal Scaling

```bash
# Use load balancer (Nginx, HAProxy)
# Run multiple instances
pm2 start npm --name "agenthub-api-1" -- start
pm2 start npm --name "agenthub-api-2" -- start
pm2 start npm --name "agenthub-api-3" -- start
```

### Vertical Scaling

- Increase CPU cores
- Add more RAM
- Use SSD storage

## Cost Optimization

1. **Use reserved instances** for predictable workloads
2. **Auto-scale** based on traffic
3. **Optimize database queries**
4. **Use caching** (Redis)
5. **Compress assets**
6. **Use CDN** for static files
7. **Monitor and optimize** regularly

## Support

For deployment support:
- Email: support@agenthub.com
- GitHub Issues: https://github.com/agenthub/platform/issues
- Discord: https://discord.gg/agenthub
