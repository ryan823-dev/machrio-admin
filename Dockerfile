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

# Enable detailed logging for debugging
ENV SPRING_PROFILES_ACTIVE=production
ENV LOGGING_LEVEL_ROOT=INFO
ENV LOGGING_LEVEL_COM_MACHRIO=DEBUG

# JVM options for better startup
ENV JAVA_TOOL_OPTIONS="-Xms128m -Xmx512m -XX:+UseG1GC"

ENTRYPOINT ["java", "-jar", "app.jar"]
