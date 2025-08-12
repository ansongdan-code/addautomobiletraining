# Deployment Guide

This guide provides step-by-step instructions for deploying the Auto Training Academy platform to various hosting providers.

## 📋 Pre-deployment Checklist

- [ ] All tests pass (`npm run test:all`)
- [ ] Build succeeds (`npm run build`)
- [ ] Environment variables configured
- [ ] Database connection tested
- [ ] Payment gateways configured
- [ ] SSL certificates ready (for production)
- [ ] Domain name configured
- [ ] Monitoring tools set up

## 🚀 Deployment Options

### 1. Heroku Deployment

#### Prerequisites
- Heroku CLI installed
- Git repository initialized

#### Steps
```bash
# Login to Heroku
heroku login

# Create Heroku app
heroku create your-app-name

# Add MongoDB Atlas add-on (or use external MongoDB)
heroku addons:create mongolab:sandbox

# Set environment variables
heroku config:set NODE_ENV=production
heroku config:set JWT_SECRET="your-super-secure-jwt-secret"
heroku config:set PAYPAL_CLIENT_ID="your-paypal-client-id"
heroku config:set PAYPAL_CLIENT_SECRET="your-paypal-secret"
heroku config:set REACT_APP_PAYPAL_CLIENT_ID="your-paypal-client-id"

# Deploy
git push heroku main

# Scale dynos
heroku ps:scale web=1
```

#### Heroku Procfile
Create a `Procfile` in the root directory:
```
web: npm run start:prod
```

### 2. Vercel Deployment

#### Prerequisites
- Vercel CLI installed
- GitHub repository connected

#### Steps
```bash
# Install Vercel CLI
npm install -g vercel

# Login to Vercel
vercel login

# Deploy
vercel

# Set environment variables in Vercel dashboard
# or use vercel env commands
```

#### Vercel Configuration
Create `vercel.json`:
```json
{
  "version": 2,
  "builds": [
    {
      "src": "server.js",
      "use": "@vercel/node"
    },
    {
      "src": "package.json",
      "use": "@vercel/static-build",
      "config": {
        "distDir": "build"
      }
    }
  ],
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "/server.js"
    },
    {
      "src": "/(.*)",
      "dest": "/build/$1"
    }
  ]
}
```

### 3. DigitalOcean/AWS/GCP Deployment

#### Prerequisites
- Server with Ubuntu 20.04+
- Domain name configured
- SSH access to server

#### Server Setup
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install MongoDB
wget -qO - https://www.mongodb.org/static/pgp/server-5.0.asc | sudo apt-key add -
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/5.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-5.0.list
sudo apt-get update
sudo apt-get install -y mongodb-org

# Start MongoDB
sudo systemctl start mongod
sudo systemctl enable mongod

# Install PM2
sudo npm install -g pm2

# Install Nginx
sudo apt install nginx -y
```

#### Application Deployment
```bash
# Clone repository
git clone https://github.com/username/addautotraining.git
cd addautotraining

# Install dependencies
npm install

# Create production environment file
cp .env.production.example .env.production
# Edit .env.production with your values

# Build application
npm run build

# Start with PM2
pm2 start ecosystem.config.js --env production
pm2 save
pm2 startup
```

#### Nginx Configuration
Create `/etc/nginx/sites-available/addautotraining`:
```nginx
server {
    listen 80;
    server_name your-domain.com www.your-domain.com;

    # Redirect HTTP to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name your-domain.com www.your-domain.com;

    # SSL Configuration
    ssl_certificate /path/to/your/certificate.crt;
    ssl_certificate_key /path/to/your/private.key;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512;
    ssl_prefer_server_ciphers off;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'" always;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_proxied expired no-cache no-store private must-revalidate auth;
    gzip_types text/plain text/css text/xml text/javascript application/x-javascript application/xml+rss;

    # Static files
    location /static/ {
        alias /var/www/addautotraining/build/static/;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # API routes
    location /api/ {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_redirect off;
    }

    # Frontend routes
    location / {
        root /var/www/addautotraining/build;
        index index.html index.htm;
        try_files $uri $uri/ /index.html;
    }

    # Security
    location ~ /\. {
        deny all;
    }
}
```

Enable the site:
```bash
sudo ln -s /etc/nginx/sites-available/addautotraining /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### 4. Docker Deployment

#### Dockerfile
```dockerfile
# Build stage
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

# Copy source code
COPY . .

# Build React app
RUN npm run build

# Production stage
FROM node:18-alpine AS production
WORKDIR /app

# Install dumb-init for proper signal handling
RUN apk add --no-cache dumb-init

# Create non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nextjs -u 1001

# Copy built application
COPY --from=builder --chown=nextjs:nodejs /app/build ./build
COPY --from=builder --chown=nextjs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nextjs:nodejs /app/package.json ./package.json
COPY --from=builder --chown=nextjs:nodejs /app/server.js ./server.js
COPY --from=builder --chown=nextjs:nodejs /app/models ./models
COPY --from=builder --chown=nextjs:nodejs /app/routes ./routes
COPY --from=builder --chown=nextjs:nodejs /app/middleware ./middleware

USER nextjs

EXPOSE 5000

ENV NODE_ENV production

ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "server.js"]
```

#### docker-compose.yml
```yaml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "5000:5000"
    environment:
      - NODE_ENV=production
      - MONGO_URI=mongodb://mongo:27017/addautotraining
      - JWT_SECRET=${JWT_SECRET}
      - PAYPAL_CLIENT_ID=${PAYPAL_CLIENT_ID}
      - PAYPAL_CLIENT_SECRET=${PAYPAL_CLIENT_SECRET}
    depends_on:
      - mongo
    restart: unless-stopped

  mongo:
    image: mongo:5.0
    ports:
      - "27017:27017"
    volumes:
      - mongo_data:/data/db
    restart: unless-stopped

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - ./ssl:/etc/nginx/ssl
    depends_on:
      - app
    restart: unless-stopped

volumes:
  mongo_data:
```

## 🔧 Environment Configuration

### Required Environment Variables

#### Production (.env.production)
```env
NODE_ENV=production
PORT=5000

# Database
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/addautotraining

# JWT
JWT_SECRET=your-super-secure-random-string-256-bits
JWT_EXPIRE=24h

# PayPal (Production)
PAYPAL_CLIENT_ID=your-live-paypal-client-id
PAYPAL_CLIENT_SECRET=your-live-paypal-client-secret
REACT_APP_PAYPAL_CLIENT_ID=your-live-paypal-client-id

# Paystack (Production)
PAYSTACK_PUBLIC_KEY=pk_live_your_paystack_public_key
PAYSTACK_SECRET_KEY=sk_live_your_paystack_secret_key

# Security
BCRYPT_SALT_ROUNDS=12
PASSWORD_MIN_LENGTH=8
MAX_LOGIN_ATTEMPTS=5
LOCK_TIME=7200000

# CORS
FRONTEND_URL=https://your-domain.com

# File Upload
FILE_UPLOAD_PATH=./uploads
MAX_FILE_SIZE=10000000

# Email (Optional)
EMAIL_SERVICE=gmail
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password

# Cloudinary (Optional)
CLOUDINARY_NAME=your-cloudinary-name
CLOUDINARY_API_KEY=your-cloudinary-api-key
CLOUDINARY_API_SECRET=your-cloudinary-api-secret
```

## 📊 Monitoring and Logging

### PM2 Monitoring
```bash
# Monitor application
pm2 monit

# View logs
pm2 logs addautotraining

# Application metrics
pm2 web
```

### Error Tracking
Consider integrating services like:
- **Sentry**: Error tracking and performance monitoring
- **LogRocket**: Session replay and error tracking
- **DataDog**: Application performance monitoring

### Health Checks
The application includes a health check endpoint:
- `GET /health` - Returns application status

## 🔒 Security Considerations

### SSL/TLS Certificate
- Use Let's Encrypt for free SSL certificates
- Configure HTTPS redirects
- Enable HSTS headers

### Firewall Configuration
```bash
# UFW firewall setup
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow ssh
sudo ufw allow 'Nginx Full'
sudo ufw enable
```

### Database Security
- Enable MongoDB authentication
- Use connection string with credentials
- Regular backups
- Network isolation

### Application Security
- Keep dependencies updated
- Use security headers
- Implement rate limiting
- Validate all inputs
- Use HTTPS everywhere

## 🔄 CI/CD Pipeline

### GitHub Actions Example
Create `.github/workflows/deploy.yml`:
```yaml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run test:all

  deploy:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    steps:
      - uses: actions/checkout@v3
      - name: Deploy to server
        uses: appleboy/ssh-action@v0.1.5
        with:
          host: ${{ secrets.HOST }}
          username: ${{ secrets.USERNAME }}
          key: ${{ secrets.SSH_KEY }}
          script: |
            cd /var/www/addautotraining
            git pull origin main
            npm ci
            npm run build
            pm2 reload ecosystem.config.js --env production
```

## 🆘 Troubleshooting

### Common Issues

#### Build Failures
```bash
# Clear cache and rebuild
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
npm run build
```

#### Database Connection Issues
```bash
# Check MongoDB status
sudo systemctl status mongod

# Restart MongoDB
sudo systemctl restart mongod

# Check connection string
mongo "your-connection-string"
```

#### PM2 Issues
```bash
# Restart application
pm2 restart addautotraining

# Update PM2
npm install -g pm2
pm2 update
```

### Performance Optimization
- Enable gzip compression
- Use CDN for static assets
- Implement caching strategies
- Monitor database queries
- Optimize images and assets

---

For additional support, please refer to the [main README](README.md) or contact support at contact@autotrainingacademy.com.
