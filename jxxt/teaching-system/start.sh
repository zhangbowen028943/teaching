#!/bin/bash

echo "Starting Teaching System..."

# 检查MongoDB是否运行
echo "Checking MongoDB status..."
if ! command -v mongod &> /dev/null; then
    echo "MongoDB is not installed! Please install MongoDB first."
    exit 1
fi

# 创建必要的目录
mkdir -p backend/uploads

# 安装依赖
cd frontend
npm install
cd ../backend
npm install
cd ..

# 启动后端服务
echo "Starting backend server..."
cd backend
npm run dev &
cd ..

# 启动前端服务
echo "Starting frontend server..."
cd frontend
npm start &
cd ..

echo "System is starting up..."
echo "Frontend: http://localhost:3000"
echo "Backend: http://localhost:5000"

# 等待用户输入以关闭
read -p "Press any key to exit..." 