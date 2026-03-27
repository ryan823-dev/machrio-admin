FROM eclipse-temurin:21-jdk-alpine AS build

WORKDIR /app

COPY backend/machrio-api/gradlew backend/machrio-api/gradlew.bat backend/machrio-api/settings.gradle backend/machrio-api/build.gradle ./
COPY backend/machrio-api/gradle ./gradle

RUN chmod +x gradlew && ./gradlew dependencies --no-daemon || true

COPY backend/machrio-api/src ./src

RUN ./gradlew build -x test --no-daemon

FROM eclipse-temurin:21-jre-alpine

WORKDIR /app

COPY --from=build /app/backend/machrio-api/build/libs/*.jar app.jar

EXPOSE 8080

ENTRYPOINT ["java", "-jar", "app.jar"]
