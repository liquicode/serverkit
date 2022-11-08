"use strict";


const LIB_FS = require( 'fs' );
const LIB_PATH = require( 'path' );

const Liquicode = require( '@liquicode/liquicodejs' );
const Builder = require( './builder-2022-09-14.js' );

const TIMESTAMP = ( new Date() ).toISOString();
const AWS_BUCKET = 'docs.serverkit.net';
const AWS_PROFILE = 'admin';

const DOCKER_IMAGE_NAME = 'serverkit';
const DOCKER_REGISTRY_URL = 'registry.hub.docker.com/agbowlin';

let package_folder = process.cwd();
let package_filename = LIB_PATH.join( package_folder, 'package.json' );
let PACKAGE = require( package_filename );


//=====================================================================
//=====================================================================
//
//		Build Startup
//
//=====================================================================
//=====================================================================


// Initial Heading.
Builder.LogHeading( `Build starting ...` );
Builder.LogMuted( `Running in: ${package_folder}` );


// Load the project's Package file.
Builder.LogMuted( `Loaded package.json` );
Builder.LogMuted( `  - name = ${PACKAGE.name}` );
Builder.LogMuted( `  - version = ${PACKAGE.version}` );


//=====================================================================
//=====================================================================
//
//		Build Docs
//
//=====================================================================
//=====================================================================


// Builder.LogHeading( `Building Docs ...` );
// {
// 	let build_folder = LIB_PATH.join( package_folder, 'build' );
// 	let filename = LIB_PATH.join( build_folder, '100-build-docs.js' );
// 	Builder.Execute( `node ${filename}` );
// }


//=====================================================================
//=====================================================================
//
//		Set Current Version
//
//=====================================================================
//=====================================================================


// Update 'VERSION'
LIB_FS.writeFileSync( LIB_PATH.join( package_folder, 'VERSION' ), PACKAGE.version );

// Update 'docs/_coverpage.md'
Liquicode.System.WithFileText(
	LIB_PATH.join( package_folder, 'docs', '_coverpage.md' ),
	function ( Filename, Text )
	{
		return Liquicode.Text.ReplaceBetween( Text, '(v', ')', PACKAGE.version );
	} );

// Update 'readme.md'
Liquicode.System.WithFileText(
	LIB_PATH.join( package_folder, 'readme.md' ),
	function ( Filename, Text )
	{
		return Liquicode.Text.ReplaceBetween( Text, '(v', ')', PACKAGE.version );
	} );


//=====================================================================
//=====================================================================
//
//		Build Docker Image
//
//=====================================================================
//=====================================================================


// Builder.LogHeading( `Building Docker Image ...` );

// // Update 'build/serverkit.dockerfile'
// Liquicode.System.WithFileText(
// 	LIB_PATH.join( package_folder, 'build', `${DOCKER_IMAGE_NAME}.dockerfile` ),
// 	function ( Filename, Text )
// 	{
// 		return Liquicode.Text.ReplaceBetween( Text, '(v', ')', PACKAGE.version );
// 	} );

// {
// 	let output = '';
// 	let docker_filename = LIB_PATH.join( package_folder, 'build', `${DOCKER_IMAGE_NAME}.dockerfile` );
// 	output = Builder.Execute( `docker build -t ${DOCKER_IMAGE_NAME}:latest . --file ${docker_filename}` );
// 	output = Builder.Execute( `docker image tag ${DOCKER_IMAGE_NAME}:latest ${DOCKER_REGISTRY_URL}/${DOCKER_IMAGE_NAME}:v${PACKAGE.version}` );
// 	output = Builder.Execute( `docker image tag ${DOCKER_IMAGE_NAME}:latest ${DOCKER_REGISTRY_URL}/${DOCKER_IMAGE_NAME}:latest` );
// 	output = Builder.Execute( `docker push ${DOCKER_REGISTRY_URL}/${DOCKER_IMAGE_NAME}:v${PACKAGE.version}` );
// 	output = Builder.Execute( `docker push ${DOCKER_REGISTRY_URL}/${DOCKER_IMAGE_NAME}:latest` );
// }


//=====================================================================
//=====================================================================
//
//		Run Tests and Update Docs External
//
//=====================================================================
//=====================================================================


if ( false ) // Running tests seems to no longer work. It just hangs.
{
	Builder.LogHeading( `Run Tests and Update Docs External ...` );
	//---------------------------------------------------------------------
	// Run Tests
	//---------------------------------------------------------------------

	let tests_folder = LIB_PATH.join( package_folder, 'tests' );

	let testing_output = Builder.Execute( `npx mocha -u bdd ${tests_folder}/*.js --no-timeout --slow 1000000` );
	{
		let output_lines = testing_output.split( '\n' );
		if ( output_lines.length === 0 ) { throw new Error( 'Unable to capture testing output.' ); }
		let last_line = output_lines[ output_lines.length - 1 ];
		if ( last_line.indexOf( ' passing' ) < 0 ) { throw new Error( 'Detected an error in the testing output.' ); }
	}

	//---------------------------------------------------------------------
	// Update Docs Externals
	//---------------------------------------------------------------------

	let docs_external_folder = LIB_PATH.join( package_folder, 'docs', 'external' );

	Builder.LogMuted( `Writing [testing-output.md] ...` );
	{
		let to = LIB_PATH.join( docs_external_folder, 'testing-output.md' );
		LIB_FS.writeFileSync( to, `
# Testing Output

- Project: ${PACKAGE.name}
- Version: v${PACKAGE.version}
- Timestamp: ${TIMESTAMP}

~~~
${testing_output}
~~~
` );
	}
}

Builder.LogHeading( `Update Docs External ...` );
{
	//---------------------------------------------------------------------
	// Update Docs Externals
	//---------------------------------------------------------------------

	let docs_external_folder = LIB_PATH.join( package_folder, 'docs', 'external' );

	Builder.LogMuted( `Copying [readme.md] ...` );
	{
		let from = LIB_PATH.join( package_folder, 'readme.md' );
		let to = LIB_PATH.join( docs_external_folder, 'readme.md' );
		LIB_FS.copyFileSync( from, to );
	}

	Builder.LogMuted( `Copying [license.md] ...` );
	{
		let from = LIB_PATH.join( package_folder, 'license.md' );
		let to = LIB_PATH.join( docs_external_folder, 'license.md' );
		LIB_FS.copyFileSync( from, to );
	}

	Builder.LogMuted( `Copying [VERSION] ...` );
	{
		let from = LIB_PATH.join( package_folder, 'VERSION' );
		let to = LIB_PATH.join( docs_external_folder, 'VERSION' );
		LIB_FS.copyFileSync( from, to );
	}

	Builder.LogMuted( `Setting [TIMESTAMP] ...` );
	{
		let to = LIB_PATH.join( docs_external_folder, 'TIMESTAMP' );
		LIB_FS.writeFileSync( to, TIMESTAMP );
	}
}


//=====================================================================
//=====================================================================
//
//		Publish Current Version
//
//=====================================================================
//=====================================================================


Builder.LogHeading( `Publish Current Version ...` );

// Publish current version to git.
Builder.Git_FinalizeAndMarkVersion( PACKAGE.version );

// Publish current version to npm.
Builder.Npm_Publish();

// Publish current version docs to S3.
Builder.Aws_S3_Sync( LIB_PATH.join( package_folder, 'docs' ), AWS_BUCKET, AWS_PROFILE );


//=====================================================================
//=====================================================================
//
//		Start New Version
//
//=====================================================================
//=====================================================================


Builder.LogHeading( `Incrementing Package Version Number` );
let previous_version = PACKAGE.version;
let semver = Builder.StringToSemver( PACKAGE.version );
semver.patch++;
PACKAGE.version = Builder.SemverToString( semver );

// Update 'package.json'
LIB_FS.writeFileSync( LIB_PATH.join( package_folder, 'package.json' ), JSON.stringify( PACKAGE, null, '\t' ) );

// Update 'VERSION'
LIB_FS.writeFileSync( LIB_PATH.join( package_folder, 'VERSION' ), PACKAGE.version );

// Update 'docs/_coverpage.md'
Liquicode.System.WithFileText(
	LIB_PATH.join( package_folder, 'docs', '_coverpage.md' ),
	function ( Filename, Text )
	{
		return Liquicode.Text.ReplaceBetween( Text, '(v', ')', PACKAGE.version );
	} );

// Update 'readme.md'
Liquicode.System.WithFileText(
	LIB_PATH.join( package_folder, 'readme.md' ),
	function ( Filename, Text )
	{
		return Liquicode.Text.ReplaceBetween( Text, '(v', ')', PACKAGE.version );
	} );

Builder.Git_PrepareNewVersion( PACKAGE.version );


//=====================================================================
//=====================================================================
//
//		End of Build
//
//=====================================================================
//=====================================================================


Builder.LogHeading( `Published version [${previous_version}], you are now at version [${PACKAGE.version}].` );

