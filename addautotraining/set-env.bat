@echo off
echo Setting up environment variables...
echo.
echo 1. Setting NODE_ENV to production
echo production | vercel env add NODE_ENV production
echo.
echo 2. Setting JWT_SECRET
echo ee8751aee1e667bfab36c942cf69fc2e12e3f740da248866235aba31a50699bd6135bc167c910ceef191673ec96a2e04667e1a44df09ba26f9550a90cbd84831 | vercel env add JWT_SECRET production
echo.
echo 3. Setting JWT_EXPIRE
echo 24h | vercel env add JWT_EXPIRE production
echo.
echo Environment variables set successfully!
pause
