# AddAuto Training Academy - Production Deployment

## 🚀 Quick Deployment

### Prerequisites
- Docker and Docker Compose installed
- Node.js 18+ (for local development)
- Git

### Environment Setup
1. Copy `.env.production.example` to `.env.production`
2. Update the following variables in `.env.production`:
   - `JWT_SECRET`: Generate a secure random string
   - `MONGO_PASSWORD`: Set a strong MongoDB password
   - `PAYPAL_CLIENT_ID` & `PAYPAL_CLIENT_SECRET`: Your PayPal production credentials
   - `FRONTEND_URL`: Your production domain (e.g., https://yourdomain.com)

### Local Development Deployment
```bash
# Run the deployment script
./deploy.bat

# Or manually:
docker-compose down -v
docker-compose up --build -d
```

### Production Deployment
```bash
# For production with SSL reverse proxy
docker-compose -f docker-compose.production.yml up --build -d
```

## 📱 Mobile App Deployment

### Prerequisites
- EAS CLI: `npm install -g eas-cli`
- Expo account

### Build Commands
```bash
cd mobile

# Login to EAS
eas login

# Build for Android
eas build --platform android --profile production

# Build for iOS (requires macOS)
eas build --platform ios --profile production

# Submit to stores
eas submit --platform android --profile production
eas submit --platform ios --profile production
```

## 🔧 Services

### Website
- **Frontend**: React app served via Nginx (Port 3000)
- **Backend**: Express.js API (Port 5000)
- **Database**: MongoDB (Port 27017)

### Mobile App
- **Framework**: React Native with Expo
- **Platforms**: iOS, Android, Web

## 🔒 Security Features
- JWT authentication
- Rate limiting
- Security headers
- Input validation
- CORS protection
- Password hashing with bcrypt

## 📊 Monitoring
- Health check endpoint: `GET /health`
- PM2 process management (for non-Docker deployments)
- Docker health checks

## 🔄 CI/CD
The project includes GitHub Actions workflow for automated testing and deployment.

## 🆘 Troubleshooting
- Check logs: `docker-compose logs -f [service]`
- Restart services: `docker-compose restart`
- Rebuild: `docker-compose up --build --force-recreate`

## 📞 Support
For issues, check the logs or contact support@addautotraining.com
