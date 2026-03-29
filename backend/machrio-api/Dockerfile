# =============================================
# Machrio Admin - 前后端一体化部署
# =============================================
# Spring Boot 托管前端静态文件
# =============================================

# ---------------------------------------------
# 阶段 1: 构建前端
# ---------------------------------------------
FROM node:22-alpine AS frontend-build

WORKDIR /app/frontend

# 安装 pnpm
RUN npm install -g pnpm

# 复制前端 package 文件（不复制 lock 文件，避免构建失败）
COPY frontend/package.json ./

# 安装依赖
RUN pnpm install

# 复制前端源代码
COPY frontend/ ./

# 设置 API 地址为相对路径（同域名访问）
ENV VITE_API_URL=/api

# 构建前端
RUN pnpm build

# ---------------------------------------------
# 阶段 2: 构建后端
# ---------------------------------------------
FROM gradle:8-jdk21-alpine AS backend-build

WORKDIR /app

# 复制后端构建配置
COPY backend/machrio-api/build.gradle backend/machrio-api/settings.gradle ./

# 复制后端源代码
COPY backend/machrio-api/src ./src

# 构建 JAR（跳过测试）
RUN gradle bootJar -x test --no-daemon

# ---------------------------------------------
# 阶段 3: 运行阶段
# ---------------------------------------------
FROM eclipse-temurin:21-jre-alpine

WORKDIR /app

# 创建静态文件目录
RUN mkdir -p /app/static

# 从后端构建阶段复制 JAR
COPY --from=backend-build /app/build/libs/*.jar app.jar

# 从前端构建阶段复制静态文件
COPY --from=frontend-build /app/frontend/dist /app/static

# 创建非 root 用户
RUN addgroup -S appgroup && adduser -S appuser -G appgroup && \
    chown -R appuser:appgroup /app
USER appuser

# Railway 动态端口
ENV PORT=8080
EXPOSE 8080

# JVM 优化（Railway 免费版 512MB）
ENV JAVA_TOOL_OPTIONS="-Xms200m -Xmx400m -XX:+UseG1GC"

# 激活生产环境配置
ENV SPRING_PROFILES_ACTIVE=production

# Spring Boot 静态文件路径
ENV SPRING_WEB_RESOURCES_STATIC_LOCATIONS=file:/app/static

# 启动应用
ENTRYPOINT ["sh", "-c", "java -jar app.jar --server.port=${PORT:-8080}"]