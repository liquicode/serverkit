'use strict';


const LIB_FS = require( 'fs' );
const LIB_PATH = require( 'path' );
const LIB_ASSERT = require( 'assert' );
const LIB_UUID = require( 'uuid' );

// const LIQUICODEJS = require( LIB_PATH.resolve( __dirname, '..', '..', 'liquicodejs.git', 'src', 'liquicode-node.js' ) );
const LIQUICODEJS = require( '@liquicode/liquicodejs' );

const SRC_TEST_SERVER = require( './test-routines/TestServer.js' );
const SRC_STORAGE_PROVIDER_TESTS = require( './test-routines/StorageProvider Tests.js' );
const SRC_USER_STORAGE_TESTS = require( './test-routines/UserStorage Tests.js' );
const SRC_USER_STORAGE_SHARING_TESTS = require( './test-routines/UserStorage Sharing Tests.js' );

// Make some fake users.
let Alice = { user_id: 'alice@server', user_role: 'admin' };


var SERVER_SETTINGS = {
	Services: {
		TestService: {
			Storage: {
				storage_provider: 'Mongo',
				MongoProvider: {
					database_name: 'TestStorage',			// Name of the MongoDB database.
					collection_name: 'TestService',			// Name of the MongoDB collection.
					connection_string: 'mongodb://localhost:27017',	// Connection string to the MongoDB server.
				},
			},
		}
	}
};
{
	// let filename = LIB_PATH.resolve( __dirname, '../build/~~secrets/test-mongodb-config.json' );
	// SERVER_SETTINGS.Services.TestService.Storage.MongoProvider = JSON.parse( LIB_FS.readFileSync( filename, 'utf-8' ) );
}


const MONGODB_IMAGE_NAME = 'mongo:latest';
const MONGODB_CONTAINER_NAME = 'serverkit-mongo-test';


//---------------------------------------------------------------------
describe( `144) Storage - MongoProvider Tests`,
	function ()
	{

		let container_status = null;

		//---------------------------------------------------------------------
		before(
			async function ()
			{
				container_status = LIQUICODEJS.System.ContainerStatus( MONGODB_CONTAINER_NAME );
				if ( !container_status )
				{
					// Run the container.
					console.log( `Running ${MONGODB_CONTAINER_NAME} + 3 seconds.` );
					LIQUICODEJS.System.RunContainer( MONGODB_IMAGE_NAME, {
						name: MONGODB_CONTAINER_NAME,
						ports: [
							{ container: 27017, localhost: 27017, },
						]
					} );
					// container_status = LIQUICODEJS.System.ContainerStatus( MONGODB_CONTAINER_NAME );
					await LIQUICODEJS.System.AsyncSleep( 3 * 1000 );
				}
				else if ( !container_status.State.Running )
				{
					// Start the container.
					console.log( `Starting ${MONGODB_CONTAINER_NAME}.` );
					LIQUICODEJS.System.StartContainer( MONGODB_CONTAINER_NAME );
				}
				return;
			}
		);


		//---------------------------------------------------------------------
		after(
			async function ()
			{
				if ( !container_status )
				{
					console.log( `Killing ${MONGODB_CONTAINER_NAME}.` );
					LIQUICODEJS.System.KillContainer( MONGODB_CONTAINER_NAME );
				}
				else if ( !container_status.State.Running )
				{
					console.log( `Stopping ${MONGODB_CONTAINER_NAME}.` );
					LIQUICODEJS.System.StopContainer( MONGODB_CONTAINER_NAME );
				}
				return;
			}
		);


		//---------------------------------------------------------------------
		describe( `MongoProvider Tests (10 Objects)`,
			function ()
			{


				//---------------------------------------------------------------------
				let session_id = LIB_UUID.v4();
				let test_object_count = 10;
				let Server = null;
				let StorageService = null;


				//---------------------------------------------------------------------
				before(
					async function ()
					{
						Server = await SRC_TEST_SERVER.CreateTestServer( SERVER_SETTINGS );
						StorageService = Server.Services.TestService;
						return;
					}
				);


				//---------------------------------------------------------------------
				after(
					async function ()
					{
						await SRC_TEST_SERVER.CleanupTestServer( Server );
						return;
					}
				);


				//---------------------------------------------------------------------
				it( `Should create test objects`,
					async function ()
					{
						await SRC_STORAGE_PROVIDER_TESTS.CreateTestObjects( StorageService.UserStorage.Provider, session_id, test_object_count );
						return;
					} );


				//---------------------------------------------------------------------
				it( `Should read and write test objects`,
					async function ()
					{
						await SRC_STORAGE_PROVIDER_TESTS.ReadAndWriteTestObjects( StorageService.UserStorage.Provider, session_id, test_object_count );
						return;
					} );


				//---------------------------------------------------------------------
				it( `Should find all test objects`,
					async function ()
					{
						await SRC_STORAGE_PROVIDER_TESTS.FindAllTestObjects( StorageService.UserStorage.Provider, session_id, test_object_count );
						return;
					} );


				//---------------------------------------------------------------------
				it( `Should delete all test objects`,
					async function ()
					{
						await SRC_STORAGE_PROVIDER_TESTS.DeleteAllTestObjects( StorageService.UserStorage.Provider, session_id, test_object_count );
						return;
					} );


				return;
			} );


		//---------------------------------------------------------------------
		describe( `UserStorage on MongoProvider Tests`,
			function ()
			{


				//---------------------------------------------------------------------
				let session_id = LIB_UUID.v4();
				let test_object_count = 10;
				let Server = null;
				let StorageService = null;


				//---------------------------------------------------------------------
				before(
					async function ()
					{
						Server = await SRC_TEST_SERVER.CreateTestServer( SERVER_SETTINGS );
						StorageService = Server.Services.TestService;
						return;
					}
				);


				//---------------------------------------------------------------------
				after(
					async function ()
					{
						await SRC_TEST_SERVER.CleanupTestServer( Server );
						return;
					}
				);



				//---------------------------------------------------------------------
				it( `Should create test objects`,
					async function ()
					{
						await SRC_USER_STORAGE_TESTS.CreateTestObjects( StorageService.UserStorage, Alice, session_id, test_object_count );
						return;
					} );


				//---------------------------------------------------------------------
				it( `Should count all objects`,
					async function ()
					{
						let object_count = await StorageService.UserStorage.Count( Alice, {} );
						LIB_ASSERT.ok( object_count > 0 );
						return;
					} );


				//---------------------------------------------------------------------
				it( `Should read and write test objects`,
					async function ()
					{
						await SRC_USER_STORAGE_TESTS.ReadAndWriteTestObjects( StorageService.UserStorage, Alice, session_id, test_object_count );
						return;
					} );


				//---------------------------------------------------------------------
				it( `Should find all test objects`,
					async function ()
					{
						await SRC_USER_STORAGE_TESTS.FindAllTestObjects( StorageService.UserStorage, Alice, session_id, test_object_count );
						return;
					} );


				//---------------------------------------------------------------------
				it( `Should delete all test objects`,
					async function ()
					{
						await SRC_USER_STORAGE_TESTS.DeleteAllTestObjects( StorageService.UserStorage, Alice, session_id, test_object_count );
						return;
					} );


				return;
			} );


		//---------------------------------------------------------------------
		describe( `UserStorage Sharing on MongoProvider Tests`,
			function ()
			{


				//---------------------------------------------------------------------
				let Server = null;
				let StorageService = null;


				//---------------------------------------------------------------------
				before(
					async function ()
					{
						Server = await SRC_TEST_SERVER.CreateTestServer( SERVER_SETTINGS );
						StorageService = Server.Services.TestService;
						return;
					}
				);


				//---------------------------------------------------------------------
				after(
					async function ()
					{
						await SRC_TEST_SERVER.CleanupTestServer( Server );
						return;
					}
				);


				//---------------------------------------------------------------------
				it( `Should create test objects`,
					async function ()
					{
						await SRC_USER_STORAGE_SHARING_TESTS.CreateTestObjects( StorageService.UserStorage );
						return;
					} );


				//---------------------------------------------------------------------
				it( `Alice should read all documents and write all documents`,
					async function ()
					{
						await SRC_USER_STORAGE_SHARING_TESTS.TestAccessForAlice( StorageService.UserStorage );
						return;
					} );


				//---------------------------------------------------------------------
				it( `Bob should read some documents and write some documents`,
					async function ()
					{
						await SRC_USER_STORAGE_SHARING_TESTS.TestAccessForBob( StorageService.UserStorage );
						return;
					} );


				//---------------------------------------------------------------------
				it( `Eve should read some documents and write some documents`,
					async function ()
					{
						await SRC_USER_STORAGE_SHARING_TESTS.TestAccessForEve( StorageService.UserStorage );
						return;
					} );


				//---------------------------------------------------------------------
				it( `Public objects should be readable by everyone`,
					async function ()
					{
						await SRC_USER_STORAGE_SHARING_TESTS.TestReadAccessForPublicObjects( StorageService.UserStorage );
						return;
					} );


				//---------------------------------------------------------------------
				it( `Public objects should only be writable by the owner`,
					async function ()
					{
						await SRC_USER_STORAGE_SHARING_TESTS.TestWriteAccessForPublicObjects( StorageService.UserStorage );
						return;
					} );


				//---------------------------------------------------------------------
				it( `Should not allow readers to update documents`,
					async function ()
					{
						await SRC_USER_STORAGE_SHARING_TESTS.TestReadOnlyAccess( StorageService.UserStorage );
						return;
					} );


				return;
			} );


		return;
	} );

