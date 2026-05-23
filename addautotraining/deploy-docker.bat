@echo off
echo ========================================
echo AddAuto Training Academy - Docker Deploy
echo ========================================

echo Stopping existing containers...
docker-compose down

echo Pulling latest images from Docker Hub...
docker pull ansongdan-code/addautotraining-backend:latest
docker pull ansongdan-code/addautotraining-frontend:latest

echo Starting production deployment...
docker-compose -f docker-compose.deploy.yml up -d

echo Waiting for services to start...
timeout /t 10 /nobreak > nul

echo Checking service status...
docker-compose -f docker-compose.deploy.yml ps

echo ========================================
echo Deployment Complete!
echo ========================================
echo.
echo Frontend: http://localhost
echo Backend API: http://localhost/api
echo.
echo To view logs: docker-compose -f docker-compose.deploy.yml logs -f
echo To stop: docker-compose -f docker-compose.deploy.yml down
echo.