@echo off
echo ========================================
echo   教学管理系统 - 启动脚本
echo ========================================

REM 创建必要的目录
mkdir backend\uploads 2>nul

echo.
echo [1/4] 安装前端依赖...
cd frontend
call npm install --legacy-peer-deps
cd ..

echo.
echo [2/4] 安装后端依赖...
cd backend
call npm install
cd ..

REM 创建 .env 文件（如果不存在）
if not exist backend\.env (
    echo.
    echo [3/4] 创建默认环境配置...
    copy backend\.env.example backend\.env >nul
    echo 已创建 backend\.env，请根据需要修改配置
)

echo.
echo [4/4] 启动服务...
echo.
echo   前端地址: http://localhost:3000
echo   后端地址: http://localhost:5000
echo   健康检查: http://localhost:5000/health
echo.

REM 启动后端
start "Backend Server" cmd /k "cd backend && npm run dev"

REM 启动前端
start "Frontend Server" cmd /k "cd frontend && npm start"

echo.
echo 系统启动中，请稍候...
echo Press any key to exit...
pause >nul