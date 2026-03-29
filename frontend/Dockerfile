# =============================================
# Machrio Admin Frontend - Dockerfile
# =============================================
# 多阶段构建 - 生产环境优化
# =============================================

# ---------------------------------------------
# 阶段 1: 构建阶段
# ---------------------------------------------
FROM node:20-alpine AS build

WORKDIR /app

# 复制 package 文件
COPY package*.json ./

# 安装依赖
RUN npm ci --only=production

# 复制源代码
COPY . .

# 构建应用
RUN npm run build

# ---------------------------------------------
# 阶段 2: 生产环境（使用 Nginx）
# ---------------------------------------------
FROM nginx:alpine

# 复制自定义 Nginx 配置
COPY nginx.conf /etc/nginx/conf.d/default.conf

# 复制构建产物到 Nginx 目录
COPY --from=build /app/dist /usr/share/nginx/html

# 暴露端口
EXPOSE 80

# 健康检查
HEALTHCHECK --interval=30s --timeout=10s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://localhost/ || exit 1

# 启动 Nginx
CMD ["nginx", "-g", "daemon off;"]

# =============================================
# 构建命令:
# docker build -t machrio-admin-frontend:latest .
#
# 运行命令:
# docker run -d -p 80:80 machrio-admin-frontend:latest
# =============================================
