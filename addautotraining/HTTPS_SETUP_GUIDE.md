# 🔒 HTTPS Setup Guide for Auto Training Academy

**Priority:** CRITICAL for Production  
**Estimated Time:** 30 minutes  
**Date:** January 26, 2026

---

## Quick Start - Enable HTTPS in 5 Steps

### Step 1: Generate Credentials

```bash
# Generate JWT Secret
JWT_SECRET=$(node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")
echo "JWT_SECRET=$JWT_SECRET"

# Generate MongoDB Password
MONGO_PASSWORD=$(node -e "console.log(require('crypto').randomBytes(16).toString('base64'))")
echo "MONGO_PASSWORD=$MONGO_PASSWORD"

# Save for later
echo "JWT_SECRET=$JWT_SECRET" >> .env.prod.secret
echo "MONGO_PASSWORD=$MONGO_PASSWORD" >> .env.prod.secret
```

### Step 2: Obtain SSL Certificate

**Option A: Let's Encrypt (FREE - Recommended)**

```bash
# Install certbot
# On Ubuntu/Debian:
sudo apt-get update
sudo apt-get install certbot python3-certbot-nginx -y

# On macOS:
brew install certbot

# Request certificate
sudo certbot certonly --standalone \
  -d yourdomain.com \
  -d www.yourdomain.com \
  --agree-tos \
  -m admin@yourdomain.com

# Certificates will be at:
# /etc/letsencrypt/live/yourdomain.com/fullchain.pem
# /etc/letsencrypt/live/yourdomain.com/privkey.pem
```

**Option B: Self-Signed (Testing Only)**

```bash
# Generate self-signed certificate
mkdir -p ./certs

openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout ./certs/private.key \
  -out ./certs/certificate.crt \
  -subj "/C=US/ST=State/L=City/O=Organization/CN=yourdomain.com"

# Valid for 365 days from $(date)
# For production, always use Let's Encrypt
```

### Step 3: Create Production Configuration

Create `nginx.conf.https`:

```nginx
upstream backend {
    server backend:5000;
}

# HTTP to HTTPS redirect
server {
    listen 80;
    server_name _;
    
    # Route Let's Encrypt challenges
    location /.well-known/acme-challenge/ {
        root /var/www/certbot;
    }
    
    # Redirect all other traffic to HTTPS
    location / {
        return 301 https://$host$request_uri;
    }
}

# HTTPS server
server {
    listen 443 ssl http2;
    server_name yourdomain.com www.yourdomain.com;

    # SSL Certificates
    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;

    # Security Settings
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;

    # Security Headers
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains; preload" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-Frame-Options "DENY" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
    add_header Permissions-Policy "geolocation=(), microphone=(), camera=()" always;

    # React Application
    root /usr/share/nginx/html;
    
    location / {
        try_files $uri $uri/ /index.html;
        add_header Cache-Control "public, max-age=3600" always;
    }

    # Static assets with long cache
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable" always;
    }

    # API Proxy
    location /api/ {
        proxy_pass http://backend;
        proxy_http_version 1.1;
        
        # Headers
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header Connection "upgrade";
        
        # Timeouts
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
        
        # Buffering
        proxy_buffering on;
        proxy_buffer_size 4k;
        proxy_buffers 8 4k;
    }

    # Block access to sensitive files
    location ~ /\. {
        deny all;
    }

    location ~ ~$ {
        deny all;
    }
}
```

### Step 4: Update docker-compose for HTTPS

Create `docker-compose.https.yml`:

```yaml
version: '3.8'

services:
  mongo:
    image: mongo:6
    container_name: addauto_mongo_prod
    restart: always
    environment:
      MONGO_INITDB_ROOT_USERNAME: admin
      MONGO_INITDB_ROOT_PASSWORD: ${MONGO_PASSWORD}
      MONGO_INITDB_DATABASE: addautotraining
    volumes:
      - mongo_data_prod:/data/db
    networks:
      - app-network
    healthcheck:
      test: echo 'db.runCommand("ping").ok' | mongosh localhost:27017/test --quiet
      interval: 10s
      timeout: 5s
      retries: 5

  backend:
    build:
      context: .
      dockerfile: Dockerfile.backend
    container_name: addauto_backend_prod
    restart: always
    environment:
      - NODE_ENV=production
      - MONGO_URI=mongodb://admin:${MONGO_PASSWORD}@mongo:27017/addautotraining?authSource=admin
      - JWT_SECRET=${JWT_SECRET}
      - FRONTEND_URL=https://${DOMAIN}
    depends_on:
      mongo:
        condition: service_healthy
    networks:
      - app-network
    expose:
      - "5000"

  frontend:
    build:
      context: .
      dockerfile: Dockerfile
    container_name: addauto_frontend_prod
    restart: always
    ports:
      - "80:80"
      - "443:443"
    volumes:
      # Use Let's Encrypt certificates
      - /etc/letsencrypt:/etc/letsencrypt:ro
      # Or use self-signed for testing:
      # - ./certs:/etc/letsencrypt:ro
      
      # Nginx configuration
      - ./nginx.conf.https:/etc/nginx/conf.d/default.conf:ro
    depends_on:
      - backend
    networks:
      - app-network

volumes:
  mongo_data_prod:

networks:
  app-network:
    driver: bridge
```

### Step 5: Deploy with HTTPS

```bash
# Create environment file
cat > .env.https << EOF
DOMAIN=yourdomain.com
JWT_SECRET=$JWT_SECRET
MONGO_PASSWORD=$MONGO_PASSWORD
EOF

# Load variables
export $(cat .env.https | xargs)

# Deploy
docker-compose -f docker-compose.https.yml up --build -d

# Verify
docker-compose -f docker-compose.https.yml ps
```

---

## Verification

### Test HTTPS Connection

```bash
# Test HTTP redirect
curl -I http://yourdomain.com
# Should return 301 redirect to https://

# Test HTTPS (ignore self-signed cert warning if testing)
curl -I https://yourdomain.com
# Should return 200 OK

# With certificate check
curl https://yourdomain.com
# Should return HTML page
```

### Check Security Headers

```bash
# View all security headers
curl -I https://yourdomain.com | grep -E "Strict-Transport|X-Content|X-Frame|CSP|Referrer"

# Expected output:
# Strict-Transport-Security: max-age=31536000; includeSubDomains; preload
# X-Content-Type-Options: nosniff
# X-Frame-Options: DENY
# X-XSS-Protection: 1; mode=block
# Referrer-Policy: strict-origin-when-cross-origin
```

### Test API Endpoints

```bash
# Test API (should proxy to backend)
curl https://yourdomain.com/api/courses
# Should return JSON array of courses

# Test authentication
curl -X POST https://yourdomain.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@test.com","password":"admin123"}'
# Should return JWT token
```

### SSL/TLS Certificate Check

```bash
# Check certificate validity
curl -I https://yourdomain.com 2>&1 | grep SSL

# Detailed certificate info
openssl s_client -connect yourdomain.com:443

# Check expiration date
echo | openssl s_client -servername yourdomain.com -connect yourdomain.com:443 2>/dev/null | openssl x509 -noout -dates
```

---

## SSL/TLS Configuration Details

### Security Levels

**Recommended (Modern):**
```nginx
ssl_protocols TLSv1.2 TLSv1.3;
ssl_ciphers 'ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256:...';
```

**Maximum Compatibility:**
```nginx
ssl_protocols TLSv1 TLSv1.1 TLSv1.2 TLSv1.3;
ssl_ciphers HIGH:!aNULL:!MD5;
```

**Balanced (Recommended):**
```nginx
ssl_protocols TLSv1.2 TLSv1.3;
ssl_ciphers HIGH:!aNULL:!MD5;
```

### Performance Optimization

```nginx
# Session caching
ssl_session_cache shared:SSL:10m;
ssl_session_timeout 10m;

# HTTP/2 (faster)
listen 443 ssl http2;

# Gzip compression (for text)
gzip on;
gzip_types text/plain text/css application/json application/javascript;
gzip_min_length 1000;
```

---

## Certificate Renewal (Let's Encrypt)

### Automatic Renewal with Docker

Add renewal service to `docker-compose.https.yml`:

```yaml
certbot:
  image: certbot/certbot
  container_name: certbot_renewal
  restart: always
  volumes:
    - /etc/letsencrypt:/etc/letsencrypt
    - /var/www/certbot:/var/www/certbot
  entrypoint: /bin/sh -c "trap exit TERM; while :; do certbot renew --webroot -w /var/www/certbot -q; sleep 12h & wait $!; done"
```

### Manual Renewal

```bash
# Check when certificate expires
sudo certbot certificates

# Renew certificate
sudo certbot renew --force-renewal \
  -d yourdomain.com \
  -d www.yourdomain.com

# Verify renewal
sudo certbot certificates
```

### Setup Cron Job (Linux)

```bash
# Edit crontab
sudo crontab -e

# Add this line (runs daily at 3 AM)
0 3 * * * certbot renew --quiet && systemctl reload nginx
```

---

## Monitoring & Maintenance

### Daily Checks

```bash
# Container status
docker-compose -f docker-compose.https.yml ps

# View logs
docker-compose -f docker-compose.https.yml logs -f

# Check certificate expiry
sudo certbot certificates
```

### Weekly Tasks

```bash
# Security updates
docker pull nginx:latest
docker pull mongo:6
docker pull node:20-alpine

# Rebuild with updates
docker-compose -f docker-compose.https.yml up --build -d

# Run security test
node quick-security-test.js
```

### Monthly Audit

```bash
# Check for vulnerabilities
npm audit

# Update dependencies
npm update

# Review nginx configuration
docker exec addauto_frontend_prod nginx -t

# Database backup
docker exec addauto_mongo_prod mongodump \
  -u admin \
  -p $MONGO_PASSWORD \
  --authenticationDatabase admin \
  -o /backup/mongo_$(date +%Y%m%d)
```

---

## Troubleshooting HTTPS

### Certificate not found error

```bash
# Check if certificate exists
ls -la /etc/letsencrypt/live/yourdomain.com/

# If missing, request new certificate
sudo certbot certonly --standalone -d yourdomain.com

# Verify path in nginx.conf
grep ssl_certificate /path/to/nginx.conf
```

### "Connection refused" on 443

```bash
# Check port binding
netstat -tulpn | grep :443

# Verify firewall
sudo ufw allow 443
sudo ufw allow 80
sudo firewall-cmd --add-service=https --permanent

# Test connection
sudo iptables -L | grep 443
```

### Mixed content warning (HTTP + HTTPS)

```javascript
// In React frontend - update API calls to use HTTPS
const API_URL = process.env.FRONTEND_URL || 'https://yourdomain.com';

// Ensure all fetch calls use HTTPS
fetch(`${API_URL}/api/endpoint`)
```

### Certificate verification failure

```bash
# Test SSL connection
openssl s_client -connect yourdomain.com:443 -showcerts

# Validate certificate chain
openssl verify /etc/letsencrypt/live/yourdomain.com/cert.pem

# Check certificate dates
openssl x509 -in /etc/letsencrypt/live/yourdomain.com/cert.pem -text -noout | grep -A2 "Validity"
```

### Docker volume permission denied

```bash
# Fix Let's Encrypt directory permissions
sudo chmod -R 755 /etc/letsencrypt

# Or mount with proper permissions in docker-compose
volumes:
  - /etc/letsencrypt:/etc/letsencrypt:ro
```

---

## Advanced Configuration

### Enable HTTP/2 Push

```nginx
# Preload critical assets
http2_push /static/css/main.css;
http2_push /static/js/main.js;
```

### Add Subdomain Support

```nginx
server_name yourdomain.com www.yourdomain.com api.yourdomain.com;

# Different locations for subdomains
location ~ ^/api/ {
    # API specific configuration
}
```

### Rate Limiting

```nginx
# Define rate limit
limit_req_zone $binary_remote_addr zone=api_limit:10m rate=10r/s;

location /api/ {
    limit_req zone=api_limit burst=20 nodelay;
    proxy_pass http://backend;
}
```

### Caching Strategy

```nginx
# Cache static files
location ~* ^/static/ {
    expires 1y;
    add_header Cache-Control "public, immutable";
}

# No cache for index.html
location = /index.html {
    add_header Cache-Control "public, max-age=0, must-revalidate";
}
```

---

## Security Audit Checklist

- [ ] HTTPS enabled (port 443 listening)
- [ ] HTTP redirects to HTTPS (port 80 redirect)
- [ ] SSL certificate valid (not self-signed in production)
- [ ] TLS version 1.2+ only
- [ ] Strong cipher suites configured
- [ ] HSTS header present (max-age >= 1 year)
- [ ] Certificate renewal automated
- [ ] API endpoints proxied correctly
- [ ] Environment variables for secrets
- [ ] Database password changed
- [ ] JWT secret changed from default
- [ ] Default admin credentials changed
- [ ] Rate limiting on auth endpoints
- [ ] Security headers all present
- [ ] CORS configured for domain

---

## Final Security Score Target

After implementing HTTPS and all fixes:

**Expected Score:** 95+/100 ✅

**Remaining Improvements (Optional):**
- Two-factor authentication
- API key management
- Comprehensive logging
- DDoS protection (Cloudflare/AWS Shield)
- WAF (Web Application Firewall)
- Security monitoring (SIEM)

---

## Next Steps

1. **Obtain SSL Certificate** (10 min)
   - Use Let's Encrypt for free certificate

2. **Update nginx Configuration** (10 min)
   - Copy `nginx.conf.https` to your server

3. **Generate New Credentials** (5 min)
   - Create strong JWT_SECRET and MONGO_PASSWORD

4. **Deploy with docker-compose.https.yml** (5 min)
   - Start HTTPS-enabled containers

5. **Verify HTTPS Working** (5 min)
   - Test security headers and endpoints

6. **Run Security Test** (5 min)
   - Verify all tests passing

**Total Time to Production:** ~40 minutes

---

**Created:** January 26, 2026  
**Status:** Ready for Implementation  
**Support:** See SECURITY_FIX_GUIDE.md and SECURITY_ASSESSMENT_REPORT.md
