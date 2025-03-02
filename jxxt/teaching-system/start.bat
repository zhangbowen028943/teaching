@echo off
echo Starting Teaching System...

REM 检查MongoDB是否运行
echo Checking MongoDB status...
mongod --version >nul 2>&1
if %errorlevel% neq 0 (
    echo MongoDB is not installed! Please install MongoDB first.
    pause
    exit /b
)

REM 创建必要的目录
mkdir backend\uploads 2>nul

REM 安装依赖
cd frontend
call npm install
cd ..\backend
call npm install
cd ..

REM 启动后端服务
start "Backend Server" cmd /k "cd backend && npm run dev"

REM 启动前端服务
start "Frontend Server" cmd /k "cd frontend && npm start"

echo System is starting up...
echo Frontend: http://localhost:3000
echo Backend: http://localhost:5000
echo.
echo Press any key to exit...
pause 