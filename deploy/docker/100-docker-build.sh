#!/bin/bash

. ./~env-config

echo "------------------------------------------"
echo "100-docker-build.sh"
echo " - DOCKER_IMAGE_NAME  = $DOCKER_IMAGE_NAME"
echo " - DOCKER_REPO_URL    = $DOCKER_REPO_URL"
echo "------------------------------------------"

docker build -t $DOCKER_IMAGE_NAME:latest . --file ./$DOCKER_IMAGE_NAME.dockerfile
# docker tag $DOCKER_IMAGE_NAME:latest $DOCKER_REPO_URL/$DOCKER_IMAGE_NAME
