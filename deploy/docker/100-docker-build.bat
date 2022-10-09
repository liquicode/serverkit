@echo off

CALL ./~env-config.bat

echo ------------------------------------------
echo 100-docker-build.bat
echo  - BUILD_DOCKER_IMAGE_NAME = %BUILD_DOCKER_IMAGE_NAME%
echo  - BUILD_DOCKER_REPO_URL   = %BUILD_DOCKER_REPO_URL%
echo ------------------------------------------

docker build -t %BUILD_DOCKER_IMAGE_NAME%:latest . --file ./deploy/docker/%BUILD_DOCKER_IMAGE_NAME%.dockerfile
@REM docker tag %BUILD_DOCKER_IMAGE_NAME%:latest %BUILD_DOCKER_REPO_URL%/%BUILD_DOCKER_IMAGE_NAME%
