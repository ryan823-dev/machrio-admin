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

# 安装 Git（Gradle 需要）
RUN apk add --no-cache git

# 复制 Gradle 配置文件
COPY build.gradle settings.gradle ./
COPY gradle ./gradle
COPY gradlew ./

# 下载依赖（利用 Docker 缓存）
RUN chmod +x gradlew && ./gradlew dependencies --no-daemon || true

# 复制源代码
COPY src ./src

# 构建应用（跳过测试）
RUN chmod +x gradlew && ./gradlew bootJar -x test --no-daemon

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

# 暴露端口
EXPOSE 8080

# 健康检查
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
  CMD curl -f http://localhost:8080/actuator/health || exit 1

# JVM 参数优化
ENV JAVA_TOOL_OPTIONS="-Xms512m -Xmx1g -XX:+UseG1GC -XX:MaxGCPauseMillis=200"

# 激活生产环境配置
ENV SPRING_PROFILES_ACTIVE=production

# 启动应用
ENTRYPOINT ["java", "-jar", "app.jar"]

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
