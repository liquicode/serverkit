#!/bin/bash
. ./~env-config

echo "------------------------------------------"
echo "101-docker-bash.sh"
echo " - DOCKER_IMAGE_NAME = $DOCKER_IMAGE_NAME"
echo "------------------------------------------"

docker run -it $DOCKER_IMAGE_NAME:latest /bin/bash
