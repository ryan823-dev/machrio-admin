FROM eclipse-temurin:21-jdk-alpine AS build

WORKDIR /app

# Copy Gradle wrapper files
COPY backend/machrio-api/gradlew ./
COPY backend/machrio-api/gradlew.bat ./
COPY backend/machrio-api/settings.gradle ./
COPY backend/machrio-api/build.gradle ./
COPY backend/machrio-api/gradle ./gradle

# Make gradlew executable
RUN chmod +x ./gradlew

# Download dependencies first (cached layer)
RUN ./gradlew dependencies --no-daemon || true

# Copy source code
COPY backend/machrio-api/src ./src

# Build the application
RUN ./gradlew clean build -x test --no-daemon

# Runtime stage
FROM eclipse-temurin:21-jre-alpine

WORKDIR /app

# Copy the built jar file
COPY --from=build /app/build/libs/*.jar app.jar

EXPOSE 8080

HEALTHCHECK --interval=30s --timeout=3s --start-period=60s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:8080/api/health || exit 1

ENTRYPOINT ["java", "-jar", "app.jar"]
