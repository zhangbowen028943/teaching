#!/bin/bash
set -e

echo "========================================"
echo "  教学管理系统 - 启动脚本"
echo "========================================"

# 确认在项目根目录
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

# 创建必要的目录
mkdir -p backend/uploads

# 安装依赖
echo ""
echo "[1/4] 安装前端依赖..."
cd frontend && npm install --legacy-peer-deps && cd ..

echo ""
echo "[2/4] 安装后端依赖..."
cd backend && npm install && cd ..

# 创建 .env 文件（如果不存在）
if [ ! -f backend/.env ]; then
  echo ""
  echo "[3/4] 创建默认环境配置..."
  cp backend/.env.example backend/.env
  echo "已创建 backend/.env，请根据需要修改配置"
fi

# 启动服务
echo ""
echo "[4/4] 启动服务..."
echo ""
echo "  前端地址: http://localhost:3000"
echo "  后端地址: http://localhost:5000"
echo "  健康检查: http://localhost:5000/health"
echo ""

# 启动后端
cd backend && npm run dev &
BACKEND_PID=$!

# 启动前端
cd ../frontend && npm start &
FRONTEND_PID=$!

# 捕获退出信号
cleanup() {
  echo ""
  echo "正在关闭服务..."
  kill $BACKEND_PID 2>/dev/null
  kill $FRONTEND_PID 2>/dev/null
  exit 0
}

trap cleanup SIGINT SIGTERM

# 等待
wait