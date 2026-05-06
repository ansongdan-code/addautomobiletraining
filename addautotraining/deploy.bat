@echo off
echo === AddAuto Training Academy Deployment Script ===

echo Setting up environment...
if not exist .env.production (
    echo Error: .env.production file not found. Please create it with production credentials.
    exit /b 1
)

echo Building and starting Docker containers...
docker-compose down -v
docker-compose up --build -d

echo Waiting for services to be healthy...
timeout /t 30 /nobreak > nul

echo Checking service status...
docker-compose ps

echo Deployment complete!
echo.
echo Website accessible at:
echo - Frontend: http://localhost:3000
echo - Backend API: http://localhost:5000
echo.
echo Default admin credentials:
echo - Email: admin@test.com
echo - Password: admin123
echo.
echo Default super admin credentials:
echo - Email: superadmin@test.com
echo - Password: superadmin123
echo.
echo For production deployment with SSL, use: docker-compose -f docker-compose.production.yml up --build -d
echo.
echo To check logs: docker-compose logs -f
