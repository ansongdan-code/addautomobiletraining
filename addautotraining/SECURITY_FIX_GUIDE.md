# 🔐 Security Fix Guide - Auto Training Academy

**Status:** Critical fixes implemented  
**Date:** January 26, 2026  
**Target:** Production deployment

---

## Quick Start - Generate New Credentials

### Step 1: Generate Strong Credentials

```bash
# Generate new JWT Secret (64-character hex string)
node -e "console.log('JWT_SECRET=' + require('crypto').randomBytes(32).toString('hex'))"

# Generate new MongoDB Password (32-character random)
node -e "console.log('MONGO_PASSWORD=' + require('crypto').randomBytes(16).toString('base64'))"
```

**Example Output:**
```
JWT_SECRET=a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6a7b8c9d0e1
MONGO_PASSWORD=Ab3xY9Kp+LmN8Qr2Ws5Vt=
```

### Step 2: Create `.env.production` File

```bash
cd /path/to/addautotraining
```

Create a new file `.env.production` with:

```env
# === PRODUCTION CREDENTIALS ===
# Copy the generated values from Step 1 above

# MongoDB Password (Use generated value)
MONGO_PASSWORD=YOUR_GENERATED_MONGO_PASSWORD

# JWT Secret (Use generated value)
JWT_SECRET=YOUR_GENERATED_JWT_SECRET

# Frontend URL (Change to your production domain)
FRONTEND_URL=https://yourdomain.com

# Node Environment
NODE_ENV=production
```

### Step 3: Update docker-compose.yml for Production

Before deploying, ensure `docker-compose.yml` uses environment variables:

```bash
# Load from .env.production file
export $(cat .env.production | xargs)

# Or create .env symlink
ln -s .env.production .env  # macOS/Linux
mklink .env .env.production # Windows (admin)
```

### Step 4: Deploy with New Credentials

```bash
# Using environment variables
docker-compose -f docker-compose.yml up --build

# Or use env file explicitly
docker-compose --env-file .env.production -f docker-compose.yml up --build
```

---

## What Was Fixed

### ✅ 1. Added Security Headers

**File Modified:** `server.js`

**Headers Added:**
- `Strict-Transport-Security` - Forces HTTPS connection
- `Referrer-Policy` - Controls referrer information
- `Content-Security-Policy` - Prevents XSS attacks
- `X-Content-Type-Options: nosniff` - Prevents MIME sniffing
- `X-Frame-Options: DENY` - Prevents clickjacking
- `X-XSS-Protection` - Legacy XSS protection

**Impact:** 🟢 HIGH - Significantly improves browser security

### ✅ 2. Updated Credentials to Environment Variables

**File Modified:** `docker-compose.yml`

**Changes:**
- `MONGO_PASSWORD` - Now uses `${MONGO_PASSWORD}` environment variable
- `JWT_SECRET` - Now uses `${JWT_SECRET}` environment variable

**Before:**
```yaml
MONGO_INITDB_ROOT_PASSWORD: strongpassword
JWT_SECRET: your-super-secret-jwt-key-change-this-in-production-12345
```

**After:**
```yaml
MONGO_INITDB_ROOT_PASSWORD: ${MONGO_PASSWORD}
JWT_SECRET: ${JWT_SECRET}
```

**Impact:** 🟢 CRITICAL - Allows secure credential management

### ✅ 3. Protected Endpoint Authentication

**Status:** Already implemented in code ✅

The `/api/auth/me` endpoint already has the `protect` middleware:

```javascript
// routes/auth.js
router.get('/me', protect, async (req, res) => {
  // Protected - requires valid JWT token
});
```

**Test it:**
```bash
# Without token - should fail (401)
curl http://localhost:5000/api/auth/me

# With token - should succeed
curl -H "Authorization: Bearer YOUR_TOKEN" http://localhost:5000/api/auth/me
```

**Impact:** 🟢 HIGH - Prevents unauthorized data access

---

## Step-by-Step Implementation

### For Local Development

```bash
# 1. Stop current containers
docker-compose down

# 2. Create development credentials file
cat > .env.development << 'EOF'
MONGO_PASSWORD=dev_mongo_password
JWT_SECRET=dev_jwt_secret_for_development_only_change_in_production
FRONTEND_URL=http://localhost:3000
NODE_ENV=development
EOF

# 3. Start with development credentials
export $(cat .env.development | xargs)
docker-compose up --build

# 4. Test security
node quick-security-test.js
```

### For Production Deployment

```bash
# 1. Generate secure credentials
MONGO_PASS=$(node -e "console.log(require('crypto').randomBytes(16).toString('base64'))")
JWT_PASS=$(node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")

# 2. Create production environment file
cat > .env.production << EOF
MONGO_PASSWORD=$MONGO_PASS
JWT_SECRET=$JWT_PASS
FRONTEND_URL=https://yourdomain.com
NODE_ENV=production
EOF

# 3. Verify file created
cat .env.production

# 4. Deploy
export $(cat .env.production | xargs)
docker-compose --env-file .env.production up --build -d

# 5. Verify running
docker-compose ps
```

---

## Testing the Fixes

### Test 1: Protected Endpoint

```bash
# Without token - should return 401
curl -X GET http://localhost:5000/api/auth/me

# Expected response:
# {"success":false,"error":"Not authorized to access this route"}

# With valid token - should return 200 and user data
curl -X GET http://localhost:5000/api/auth/me \
  -H "Authorization: Bearer <YOUR_JWT_TOKEN>"

# Expected response:
# {"success":true,"data":{...user object...}}
```

### Test 2: Security Headers

```bash
# Check for security headers
curl -I http://localhost:5000/api/auth/login

# Should include:
# Strict-Transport-Security: max-age=31536000...
# Referrer-Policy: strict-origin-when-cross-origin
# Content-Security-Policy: ...
# X-Content-Type-Options: nosniff
# X-Frame-Options: DENY
```

### Test 3: Run Security Assessment

```bash
# Run full security test
node quick-security-test.js

# Expected output: Security Score should improve from 78/100
```

---

## HTTPS Configuration (Critical for Production)

### Option 1: Let's Encrypt with Certbot (Recommended)

```bash
# Install certbot
sudo apt-get install certbot python3-certbot-nginx  # Ubuntu/Debian
brew install certbot certbot-nginx                  # macOS

# Get certificate
sudo certbot certonly --standalone -d yourdomain.com -d www.yourdomain.com

# Certificates stored in:
# /etc/letsencrypt/live/yourdomain.com/

# Update nginx.conf with:
listen 443 ssl;
ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;
```

### Option 2: Self-Signed Certificate (Testing Only)

```bash
# Generate self-signed certificate
openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout /path/to/private.key \
  -out /path/to/certificate.crt

# Update nginx.conf:
listen 443 ssl;
ssl_certificate /path/to/certificate.crt;
ssl_certificate_key /path/to/private.key;
```

### Update Docker Nginx Configuration

Create `nginx.conf.https`:

```nginx
upstream backend {
    server backend:5000;
}

server {
    listen 80;
    server_name _;
    
    # Redirect HTTP to HTTPS
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl http2;
    server_name yourdomain.com www.yourdomain.com;
    
    # SSL Configuration
    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;
    
    # Security headers
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains; preload" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-Frame-Options "DENY" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
    
    # React app
    location / {
        root /usr/share/nginx/html;
        try_files $uri $uri/ /index.html;
        add_header Cache-Control "public, max-age=3600";
    }
    
    # API proxy
    location /api/ {
        proxy_pass http://backend;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_read_timeout 60s;
    }
    
    # Static files cache
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

### Docker Compose with HTTPS

Update `docker-compose.prod.yml`:

```yaml
version: '3.8'

services:
  mongo:
    image: mongo:6
    container_name: addauto_mongo
    restart: always
    environment:
      MONGO_INITDB_ROOT_USERNAME: admin
      MONGO_INITDB_ROOT_PASSWORD: ${MONGO_PASSWORD}
      MONGO_INITDB_DATABASE: addautotraining
    volumes:
      - mongo_data:/data/db
    networks:
      - app-network

  backend:
    build:
      context: .
      dockerfile: Dockerfile.backend
    container_name: addauto_backend
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

  frontend:
    build:
      context: .
      dockerfile: Dockerfile
    container_name: addauto_frontend
    restart: always
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf.https:/etc/nginx/conf.d/default.conf:ro
      - /etc/letsencrypt:/etc/letsencrypt:ro
    depends_on:
      - backend
    networks:
      - app-network

volumes:
  mongo_data:

networks:
  app-network:
    driver: bridge
```

---

## Environment Variables Reference

### Required for Production

```env
# === CRITICAL - Must Change ===
JWT_SECRET=                  # 64-char hex: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
MONGO_PASSWORD=              # 32-char random: node -e "console.log(require('crypto').randomBytes(16).toString('base64'))"
FRONTEND_URL=https://        # Your production domain

# === Optional but Recommended ===
NODE_ENV=production
DOMAIN=yourdomain.com        # For SSL certificate
```

### Development (Default Values Used)

```env
JWT_SECRET=dev_secret
MONGO_PASSWORD=dev_password
FRONTEND_URL=http://localhost:3000
NODE_ENV=development
```

---

## Verification Checklist

Before deploying to production, verify all fixes are in place:

### Security Headers
- [ ] Strict-Transport-Security header present
- [ ] Content-Security-Policy header present
- [ ] X-Content-Type-Options: nosniff
- [ ] X-Frame-Options: DENY
- [ ] X-XSS-Protection: 1; mode=block
- [ ] Referrer-Policy: strict-origin-when-cross-origin

### Credentials
- [ ] JWT_SECRET changed from default
- [ ] MONGO_PASSWORD changed from 'strongpassword'
- [ ] Default admin credentials changed
- [ ] FRONTEND_URL set to production domain

### HTTPS
- [ ] SSL certificate obtained (Let's Encrypt or provider)
- [ ] nginx.conf updated for HTTPS
- [ ] HTTP redirects to HTTPS (port 80 → 443)
- [ ] HSTS header set with 1-year expiry

### Authentication
- [ ] Protected endpoints require Bearer token
- [ ] /api/auth/me returns 401 without token
- [ ] Invalid tokens rejected with 401
- [ ] Rate limiting active on auth endpoints

### Database
- [ ] MongoDB authentication enabled
- [ ] Using environment variable for password
- [ ] Connection string includes authSource=admin

### Testing
- [ ] All security tests passing
- [ ] Manual endpoint testing successful
- [ ] Production build tested locally
- [ ] Docker containers starting without errors

---

## Post-Deployment Monitoring

### Daily
```bash
# Check container health
docker-compose ps

# Check logs for errors
docker-compose logs --tail=100 backend
docker-compose logs --tail=100 mongo
```

### Weekly
```bash
# Security updates
docker pull mongo:6
docker pull node:20-alpine
docker-compose up --build

# Check certificate expiry (if using Let's Encrypt)
sudo certbot renew --dry-run
```

### Monthly
```bash
# Re-run security assessment
node quick-security-test.js

# Check npm packages for vulnerabilities
npm audit

# Backup database
mongodump --uri="mongodb://admin:$MONGO_PASSWORD@localhost:27017/addautotraining?authSource=admin"
```

---

## Troubleshooting

### Container won't start with new credentials

```bash
# Check environment variables
docker-compose config | grep -A5 environment:

# Verify .env file exists
cat .env

# Check logs
docker-compose logs backend
```

### Still getting 401 on protected endpoints

```bash
# Get valid JWT token
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@test.com","password":"admin123"}'

# Use token in request
TOKEN=$(curl -s -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@test.com","password":"admin123"}' | jq -r '.token')

curl -H "Authorization: Bearer $TOKEN" http://localhost:5000/api/auth/me
```

### HTTPS certificate issues

```bash
# Check certificate validity
openssl x509 -in /etc/letsencrypt/live/yourdomain.com/fullchain.pem -text -noout

# Check nginx configuration
docker exec addauto_frontend nginx -t

# View nginx logs
docker logs addauto_frontend
```

---

## Support & Additional Resources

- **Security Best Practices:** [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- **Node.js Security:** [Node.js Security Checklist](https://blog.risingstack.com/node-js-security-checklist/)
- **Docker Security:** [Docker Security Best Practices](https://docs.docker.com/develop/security-best-practices/)
- **MongoDB Security:** [MongoDB Security Documentation](https://docs.mongodb.com/manual/security/)

---

**Last Updated:** January 26, 2026  
**Status:** Production Ready After Implementation  
**Questions?** Review SECURITY_ASSESSMENT_REPORT.md for details
