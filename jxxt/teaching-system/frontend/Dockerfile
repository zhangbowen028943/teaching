# ==========================================
# Stage 1: 构建阶段
# ==========================================
FROM node:18-alpine AS build

WORKDIR /app

# 复制 package.json 和 package-lock.json
COPY package*.json ./

# 安装所有依赖（包括 devDependencies）
RUN npm ci

# 复制所有源代码
COPY public/ ./public/
COPY src/ ./src/

# 构建生产版本
RUN npm run build

# ==========================================
# Stage 2: 运行阶段（Nginx）
# ==========================================
FROM nginx:alpine

# 删除默认的 Nginx 配置
RUN rm -f /etc/nginx/conf.d/default.conf

# 复制自定义 Nginx 配置
COPY nginx.conf /etc/nginx/conf.d/default.conf

# 从构建阶段复制构建产物
COPY --from=build /app/build /usr/share/nginx/html

# 暴露端口
EXPOSE 80

# 启动 Nginx
CMD ["nginx", "-g", "daemon off;"]