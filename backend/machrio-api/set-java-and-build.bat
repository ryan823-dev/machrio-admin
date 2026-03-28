@echo off
setx JAVA_HOME "C:\Program Files\Eclipse Adoptium\jdk-11.0.30.7-hotspot"
set JAVA_HOME=C:\Program Files\Eclipse Adoptium\jdk-11.0.30.7-hotspot
set PATH=%JAVA_HOME%\bin;%PATH%
echo Using Java from: %JAVA_HOME%
java -version
echo.
echo Building project...
call gradlew.bat clean build -x test
pause
