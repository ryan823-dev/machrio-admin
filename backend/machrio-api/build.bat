@echo off
set JAVA_HOME=C:\Program Files\Eclipse Adoptium\jdk-11.0.30.7-hotspot
set PATH=%JAVA_HOME%\bin;%PATH%
echo Building with JAVA_HOME=%JAVA_HOME%
gradlew.bat clean build -x test
pause
