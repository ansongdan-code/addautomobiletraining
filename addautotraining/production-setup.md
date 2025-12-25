# Production Setup Guide

## 1. MongoDB Atlas Setup
1. After creating your cluster:
   - Go to "Security" → "Database Access"
   - Click "Add New Database User"
   - Create a user with password (save these credentials)
   - Set privileges to "Read and write to any database"

2. Configure Network Access:
   - Go to "Security" → "Network Access"
   - Click "Add IP Address"
   - Click "Allow Access from Anywhere" (or add your server's IP)
   - Click "Confirm"

3. Get Connection String:
   - Click "Connect" on your cluster
   - Choose "Connect your application"
   - Copy the connection string

## 2. JWT Secret Setup
Run this in your terminal to generate a secure JWT secret:
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

## 3. Environment Variables
Set these in your hosting platform:
- MONGODB_USER=your_atlas_username
- MONGODB_PASSWORD=your_atlas_password
- MONGODB_CLUSTER=your_cluster_url
- JWT_PRODUCTION_SECRET=generated_jwt_secret
- PAYPAL_PRODUCTION_CLIENT_ID=your_paypal_prod_client_id
- NODE_ENV=production
- CORS_ORIGIN=your_frontend_domain

## 4. SSL/TLS Setup
1. Register domain if not done
2. Set up SSL certificate (Let's Encrypt recommended)
3. Configure reverse proxy (Nginx recommended)

## 5. Security Checklist
- [ ] MongoDB Atlas IP whitelist configured
- [ ] Strong database user password
- [ ] Secure JWT secret set
- [ ] CORS origin restricted to your domain
- [ ] SSL/TLS certificates installed
- [ ] Environment variables secured
- [ ] Production PayPal credentials set
- [ ] Security headers configured

## 6. Deployment Steps
1. Build frontend:
   ```bash
   npm run build
   ```

2. Configure server:
   ```bash
   npm install pm2 -g
   pm2 start server.js --name "addautotraining"
   pm2 startup
   pm2 save
   ```

3. Monitor application:
   ```bash
   pm2 monitor
   ```