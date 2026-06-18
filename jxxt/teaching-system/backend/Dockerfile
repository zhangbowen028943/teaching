FROM node:18-alpine

WORKDIR /app

# 复制 package.json 和 package-lock.json（如果存在）
COPY package*.json ./

# 仅安装生产依赖
RUN npm ci --only=production

# 复制源代码
COPY src/ ./src/

# 创建 uploads 和 logs 目录
RUN mkdir -p uploads logs

# 暴露端口
EXPOSE 5000

# 启动应用
CMD ["node", "src/app.js"]