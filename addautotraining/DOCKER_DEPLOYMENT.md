# Docker Deployment Guide

## Overview
The application has been successfully containerized using Docker and Docker Compose. All three services (MongoDB, Backend API, Frontend React App) are now running in Docker containers.

## Architecture

### Services
1. **MongoDB (mongo)** - Database container
   - Image: `mongo:6`
   - Port: `27017`
   - Network: `app-network`
   - Health check enabled
   - Persistent volume: `mongo_data`

2. **Backend API (backend)** - Node.js/Express server
   - Base: `node:20-alpine`
   - Port: `5000`
   - Network: `app-network`
   - Connects to MongoDB with retry logic
   - Health check enabled

3. **Frontend (frontend)** - React application served by Nginx
   - Base: `node:20-alpine` (build) + `nginx:alpine` (serve)
   - Port: `3000` → `80` (mapped)
   - Network: `app-network`
   - Proxies API requests to backend

## Files Created/Modified

### Docker Configuration Files
- `Dockerfile` - Frontend React app build and deployment
- `Dockerfile.backend` - Backend Node.js API
- `nginx.conf` - Nginx configuration for React app
- `docker-compose.yml` - Orchestrates all services
- `.dockerignore` - Excludes unnecessary files from builds

### Code Changes
- `server.js` - Made PayPal SDK optional and added MongoDB retry logic

## Quick Start

### Prerequisites
- Docker Desktop installed and running
- Ports 3000, 5000, and 27017 available

### Starting the Application
```bash
# Start all services
docker-compose up -d

# Check status
docker-compose ps

# View logs
docker-compose logs -f

# View specific service logs
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f mongo
```

### Stopping the Application
```bash
# Stop all services
docker-compose down

# Stop and remove volumes (WARNING: deletes database data)
docker-compose down -v
```

### Rebuilding After Changes
```bash
# Rebuild all services
docker-compose build

# Rebuild specific service
docker-compose build backend

# Rebuild and restart
docker-compose up -d --build
```

## Access Points

- **Frontend (React App)**: http://localhost:3000
- **Backend API**: http://localhost:5000/api
- **Health Check**: http://localhost:5000/health
- **Settings Endpoint**: http://localhost:5000/api/settings
- **MongoDB**: mongodb://admin:strongpassword@localhost:27017/addautotraining

## Environment Variables

The backend uses environment variables from `.env` file:
- `MONGO_URI` - MongoDB connection string (overridden in docker-compose)
- `NODE_ENV` - Set to `production` in Docker
- `PORT` - Backend port (default: 5000)
- `FRONTEND_URL` - Frontend URL for CORS
- `JWT_SECRET` - JWT signing secret
- `PAYPAL_CLIENT_ID` - PayPal credentials
- Other API keys and secrets

## Network Configuration

All services communicate through the `app-network` bridge network:
- Services can reference each other by service name (e.g., `mongo`, `backend`)
- Frontend nginx proxies `/api/*` requests to `http://backend:5000`

## Health Checks

### Backend
- Endpoint: `/api/settings`
- Interval: 30s
- Timeout: 3s
- Retries: 3

### MongoDB
- Command: `mongosh ping`
- Interval: 10s
- Timeout: 5s
- Retries: 5

## Data Persistence

MongoDB data is persisted in Docker volume `addautotraining_mongo_data`. This ensures:
- Database data survives container restarts
- Data is preserved across container recreations
- Only removed with `docker-compose down -v`

## Troubleshooting

### Backend won't start
```bash
# Check logs
docker-compose logs backend

# Verify MongoDB is healthy
docker-compose ps

# Restart backend
docker-compose restart backend
```

### Frontend not accessible
```bash
# Check nginx logs
docker-compose logs frontend

# Verify port 3000 is not in use
netstat -ano | findstr :3000
```

### MongoDB connection issues
```bash
# Check MongoDB logs
docker-compose logs mongo

# Test connectivity from backend
docker exec addauto_backend ping mongo

# Restart all services
docker-compose restart
```

### Port conflicts
If ports 3000, 5000, or 27017 are in use, modify `docker-compose.yml`:
```yaml
ports:
  - "3001:80"  # Change frontend port
  - "5001:5000"  # Change backend port
  - "27018:27017"  # Change MongoDB port
```

## Production Notes

1. **Security**: Update MongoDB credentials in `.env` and `docker-compose.yml`
2. **SSL/TLS**: Add nginx SSL configuration for HTTPS
3. **Environment**: Use separate production docker-compose file
4. **Secrets**: Use Docker secrets or external secret management
5. **Monitoring**: Add logging and monitoring solutions
6. **Backups**: Implement MongoDB backup strategy
7. **Scaling**: Use Docker Swarm or Kubernetes for production

## Development Workflow

For development with hot-reload:
1. Keep containers running
2. Make code changes in the host
3. Rebuild specific service: `docker-compose build backend`
4. Restart service: `docker-compose up -d backend`

Alternatively, mount source code as volumes for live updates (not recommended for production).

## Success Verification

After running `docker-compose up -d`, verify:

✅ All containers are running and healthy:
```bash
docker-compose ps
```

✅ Backend responds:
```bash
curl http://localhost:5000/health
```

✅ Frontend loads:
```bash
curl http://localhost:3000
```

✅ MongoDB is connected (check backend logs):
```bash
docker-compose logs backend | grep "MongoDB connected"
```

## Common Commands

```bash
# View running containers
docker-compose ps

# Stream logs for all services
docker-compose logs -f

# Execute command in container
docker exec -it addauto_backend sh

# View container resource usage
docker stats

# Clean up unused resources
docker system prune -a
```

## Next Steps

1. ✅ Dockerize application
2. ✅ Configure networking
3. ✅ Add health checks
4. ✅ Test all services
5. 🔄 Set up CI/CD pipeline
6. 🔄 Deploy to cloud provider
7. 🔄 Implement monitoring and logging
8. 🔄 Add automated backups

---

**Status**: ✅ All services successfully running in Docker
**Last Updated**: 2025-12-22
