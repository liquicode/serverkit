"use strict";


const LIB_FS = require( 'fs' );
const LIB_PATH = require( 'path' );

const Liquicode = require( '@liquicode/liquicodejs' );
const Builder = require( './builder-2022-09-14.js' );

const DOCKER_IMAGE_NAME = 'serverkit';
const DOCKER_REGISTRY_URL = 'registry.hub.docker.com/agbowlin';
// const DOCKER_REGISTRY_URL = 'serverkit.net';

let package_folder = process.cwd();
let package_filename = LIB_PATH.join( package_folder, 'package.json' );
let PACKAGE = require( package_filename );

let docker_filename = LIB_PATH.join( package_folder, 'build', `${DOCKER_IMAGE_NAME}.dockerfile` );


Builder.LogHeading( `Updating Version Number in Docker Script ...` );
// Update the Version in Dockerfile
Liquicode.System.WithFileText(
	docker_filename,
	function ( Filename, Text )
	{
		return Liquicode.Text.ReplaceBetween( Text, '(v', ')', PACKAGE.version );
	} );


Builder.LogHeading( `Building Docker Image ...` );

// docker build -t %BUILD_DOCKER_IMAGE_NAME%:latest . --file ./deploy/docker/%BUILD_DOCKER_IMAGE_NAME%.dockerfile
// docker tag %BUILD_DOCKER_IMAGE_NAME%:latest %BUILD_DOCKER_REPO_URL%/%BUILD_DOCKER_IMAGE_NAME%
let output = '';
output = Builder.Execute( `docker build -t ${DOCKER_IMAGE_NAME}:latest . --file ${docker_filename}` );
output = Builder.Execute( `docker image tag ${DOCKER_IMAGE_NAME}:latest ${DOCKER_REGISTRY_URL}/${DOCKER_IMAGE_NAME}:v${PACKAGE.version}` );
output = Builder.Execute( `docker image tag ${DOCKER_IMAGE_NAME}:latest ${DOCKER_REGISTRY_URL}/${DOCKER_IMAGE_NAME}:latest` );
output = Builder.Execute( `docker push ${DOCKER_REGISTRY_URL}/${DOCKER_IMAGE_NAME}:v${PACKAGE.version}` );
output = Builder.Execute( `docker push ${DOCKER_REGISTRY_URL}/${DOCKER_IMAGE_NAME}:latest` );

process.exit();
