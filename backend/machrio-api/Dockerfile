# =============================================
# Machrio Admin API - Dockerfile
# =============================================
# 多阶段构建 - 优化镜像大小
# =============================================

# ---------------------------------------------
# 阶段 1: 构建阶段
# ---------------------------------------------
FROM eclipse-temurin:21-jdk-alpine AS build

# 设置工作目录
WORKDIR /app

# 安装 Git 和 Gradle
RUN apk add --no-cache git gradle

# 复制构建配置文件
COPY build.gradle settings.gradle ./

# 复制源代码
COPY src ./src

# 构建应用（跳过测试）
RUN gradle bootJar -x test --no-daemon

# ---------------------------------------------
# 阶段 2: 运行阶段
# ---------------------------------------------
FROM eclipse-temurin:21-jre-alpine

# 设置工作目录
WORKDIR /app

# 安装必要的运行时依赖
RUN apk add --no-cache curl tzdata

# 设置时区为上海
RUN cp /usr/share/zoneinfo/Asia/Shanghai /etc/localtime && \
    echo "Asia/Shanghai" > /etc/timezone

# 从构建阶段复制 JAR 文件
COPY --from=build /app/build/libs/*.jar app.jar

# 创建非 root 用户（安全最佳实践）
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
USER appuser

# Railway 动态端口支持
ENV PORT=8080
EXPOSE 8080

# JVM 参数优化（Railway 免费版 512MB 内存限制）
ENV JAVA_TOOL_OPTIONS="-Xms200m -Xmx400m -XX:+UseG1GC"

# 激活生产环境配置
ENV SPRING_PROFILES_ACTIVE=production

# 健康检查
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
  CMD curl -f http://localhost:${PORT:-8080}/actuator/health || exit 1

# 启动应用（支持 Railway 动态端口）
ENTRYPOINT ["sh", "-c", "java -jar app.jar --server.port=${PORT:-8080}"]

# =============================================
# 构建命令:
# docker build -t machrio-admin-api:latest .
#
# 运行命令:
# docker run -d -p 8080:8080 \
#   -e SPRING_DATASOURCE_URL=jdbc:postgresql://host:5432/dbname \
#   -e SPRING_DATASOURCE_USERNAME=user \
#   -e SPRING_DATASOURCE_PASSWORD=password \
#   machrio-admin-api:latest
# =============================================
