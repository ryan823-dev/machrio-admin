#!/bin/bash
cd backend/machrio-api
chmod +x gradlew
./gradlew build -x test
