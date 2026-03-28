#!/bin/bash
set -e

echo "=== Starting Spring Boot Application ==="

# Navigate to backend directory
cd backend/machrio-api

# Make gradlew executable
chmod +x gradlew

# Build if not already built
if [ ! -f build/libs/*.jar ]; then
  echo "Building application..."
  ./gradlew build -x test --no-daemon
fi

# Find the JAR file
JAR_FILE=$(ls build/libs/*.jar | head -1)

echo "Starting $JAR_FILE..."

# Start Spring Boot
java -Xms256m -Xmx512m -XX:+UseG1GC -jar "$JAR_FILE"
