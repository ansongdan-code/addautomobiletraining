# Docker Deployment Guide

This guide explains how to deploy the AddAuto Training Academy application using Docker images published to Docker Hub.

## Prerequisites

- Docker and Docker Compose installed
- `.env.production` file configured with your production credentials

## Quick Deploy

### Using the deployment script (Windows)
```bash
./deploy-docker.bat
```

### Manual deployment
```bash
# Pull latest images
docker pull ansongdan-code/addautotraining-backend:latest
docker pull ansongdan-code/addautotraining-frontend:latest

# Start services
docker-compose -f docker-compose.deploy.yml up -d

# Check status
docker-compose -f docker-compose.deploy.yml ps
```

## Access the Application

- **Frontend**: http://localhost
- **Backend API**: http://localhost/api
- **Health Check**: http://localhost/health

## Default Credentials

- **Admin**: admin@test.com / admin123
- **Super Admin**: superadmin@test.com / superadmin123

## Environment Configuration

Make sure your `.env.production` file contains:

```env
MONGO_PASSWORD=your-mongodb-password
JWT_SECRET=your-jwt-secret
FRONTEND_URL=http://localhost
NODE_ENV=production
```

## Services

| Service | Image | Port |
|---------|-------|------|
| Frontend | ansongdan-code/addautotraining-frontend:latest | 80 |
| Backend | ansongdan-code/addautotraining-backend:latest | Internal |
| MongoDB | mongo:6 | Internal |
| Nginx | nginx:alpine | 80/443 |

## Management Commands

```bash
# View logs
docker-compose -f docker-compose.deploy.yml logs -f

# Stop services
docker-compose -f docker-compose.deploy.yml down

# Restart services
docker-compose -f docker-compose.deploy.yml restart

# Update to latest images
docker-compose -f docker-compose.deploy.yml pull
docker-compose -f docker-compose.deploy.yml up -d
```

## Troubleshooting

### Check container status
```bash
docker-compose -f docker-compose.deploy.yml ps
```

### View specific service logs
```bash
docker-compose -f docker-compose.deploy.yml logs backend
docker-compose -f docker-compose.deploy.yml logs frontend
```

### Access container shell
```bash
docker-compose -f docker-compose.deploy.yml exec backend sh
```

### Health check
```bash
curl http://localhost/health
```