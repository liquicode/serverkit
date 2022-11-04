'use strict';


//---------------------------------------------------------------------
const LIB_FS = require( 'fs' );
const LIB_PATH = require( 'path' );

//---------------------------------------------------------------------
require( 'babel-polyfill' );
const LIB_JSON_CRITERIA = require( 'json-criteria' );
const LIB_UUID = require( 'uuid' );

// const LIB_LOCKFILE = require( 'lockfile' );
const LIB_PROPER_LOCKFILE = require( 'proper-lockfile' );
const LOCK_OPTIONS = {
	// wait: 15000,
	// pollPeriod: 100,
	// retryWait: 100
	// stale: 15000,
	// retries: 1000,
};

//---------------------------------------------------------------------
exports.NewProvider =
	function NewProvider( Server, StorageService )
	{
		let storage_config = StorageService.Settings.UserStorage.FileProvider;

		// Storage Provider State.
		let storage_provider = {};
		let storage_path = Server.ResolveApplicationPath( storage_config.path );
		LIB_FS.mkdirSync( storage_path, { recursive: true } );
		let storage_filename = storage_config.filename;


		//=====================================================================
		// _WriteObject
		//=====================================================================


		async function _WriteObject( Filename, Object ) 
		{
			return new Promise(
				async ( resolve, reject ) =>
				{
					let lock_release = null;
					try
					{
						if ( storage_config.use_lock_file && LIB_FS.existsSync( Filename ) )
						{
							lock_release = LIB_PROPER_LOCKFILE.lockSync( Filename );
						}
						LIB_FS.writeFileSync( Filename, JSON.stringify( Object, null, '\t' ) );
						resolve();
					}
					catch ( error )
					{
						reject( error );
					}
					finally
					{
						if ( lock_release ) { lock_release(); }
					}
					return;
				} );
		};


		//=====================================================================
		// _ReadObject
		//=====================================================================


		async function _ReadObject( Filename ) 
		{
			return new Promise(
				async ( resolve, reject ) =>
				{
					let lock_release = null;
					try
					{
						if ( storage_config.use_lock_file && LIB_FS.existsSync( Filename ) )
						{
							lock_release = LIB_PROPER_LOCKFILE.lockSync( Filename );
						}
						let content = LIB_FS.readFileSync( Filename, 'utf-8' );
						let object = JSON.parse( content );
						resolve( object );
					}
					catch ( error )
					{
						reject( error );
					}
					finally
					{
						if ( lock_release ) { lock_release(); }
					}
					return null;
				} );
		};


		//=====================================================================
		// _DeleteObject
		//=====================================================================


		async function _DeleteObject( Filename ) 
		{
			return new Promise(
				async ( resolve, reject ) =>
				{
					let lock_release = null;
					try
					{
						if ( storage_config.use_lock_file && LIB_FS.existsSync( Filename ) )
						{
							lock_release = LIB_PROPER_LOCKFILE.lockSync( Filename );
						}
						LIB_FS.unlinkSync( Filename );
						resolve();
					}
					catch ( error )
					{
						reject( error );
					}
					finally
					{
						if ( lock_release ) { lock_release(); }
					}
					return;
				} );
		};


		//=====================================================================
		// StartupProvider
		//=====================================================================


		storage_provider.StartupProvider =
			async function StartupProvider() 
			{
				return new Promise(
					async ( resolve, reject ) =>
					{
						try
						{
							resolve();
						}
						catch ( error )
						{
							reject( error );
						}
						return;
					} );
			};


		//=====================================================================
		// ShutdownProvider
		//=====================================================================


		storage_provider.ShutdownProvider =
			async function ShutdownProvider() 
			{
				return new Promise(
					async ( resolve, reject ) =>
					{
						try
						{
							resolve();
						}
						catch ( error )
						{
							reject( error );
						}
						return;
					} );
			};


		//=====================================================================
		// Count
		//=====================================================================


		storage_provider.Count =
			async function Count( Criteria ) 
			{
				return new Promise(
					async ( resolve, reject ) =>
					{
						try
						{
							let object_count = 0;
							let filename_pattern = `${storage_filename}.*.json`;
							await Server.Liquicode.System.AsyncVisitFiles( storage_path, filename_pattern, false,
								async function ( Path, Filename )
								{
									if ( Server.Utility.has_value( Criteria ) )
									{
										let filename = LIB_PATH.join( Path, Filename );
										let object = await _ReadObject( filename );
										if ( LIB_JSON_CRITERIA.test( object, Criteria ) )
										{
											object_count++;
										}
									}
									else
									{
										object_count++;
									}
									return;
								} );
							resolve( object_count );
						}
						catch ( error )
						{
							reject( error );
						}
						return;
					} );
			};


		//=====================================================================
		// FindOne
		//=====================================================================


		storage_provider.FindOne =
			async function FindOne( Criteria ) 
			{
				return new Promise(
					async ( resolve, reject ) =>
					{
						try
						{
							let filename_pattern = `${storage_filename}.*.json`;
							let object = await Server.Liquicode.System.AsyncVisitFiles( storage_path, filename_pattern, false,
								async function ( Path, Filename )
								{
									if ( Server.Utility.has_value( Criteria ) )
									{
										let object_filename = LIB_PATH.join( Path, Filename );
										let object = await _ReadObject( object_filename );
										if ( LIB_JSON_CRITERIA.test( object, Criteria ) )
										{
											return object;
										}
									}
									return;
								} );
							resolve( object );
						}
						catch ( error )
						{
							reject( error );
						}
						return;
					} );
			};


		//=====================================================================
		// FindMany
		//=====================================================================


		storage_provider.FindMany =
			async function FindMany( Criteria ) 
			{
				return new Promise(
					async ( resolve, reject ) =>
					{
						try
						{
							let found_objects = [];
							let filename_pattern = `${storage_filename}.*.json`;
							await Server.Liquicode.System.AsyncVisitFiles( storage_path, filename_pattern, false,
								async function ( Path, Filename )
								{
									let object_filename = LIB_PATH.join( Path, Filename );
									let object = await _ReadObject( object_filename );
									if ( Server.Utility.has_value( Criteria ) )
									{
										if ( LIB_JSON_CRITERIA.test( object, Criteria ) )
										{
											// Found Object
											found_objects.push( object );
										}
									}
									else
									{
										// All Objects
										found_objects.push( object );
									}
									return;
								} );
							resolve( found_objects );
						}
						catch ( error )
						{
							reject( error );
						}
						return;
					} );
			};


		//=====================================================================
		// CreateOne
		//=====================================================================


		storage_provider.CreateOne =
			async function CreateOne( DataObject ) 
			{
				return new Promise(
					async ( resolve, reject ) =>
					{
						try
						{
							// insert will modify DataObject by setting the _id field.
							DataObject._id = LIB_UUID.v4();
							let new_data_object = Server.Liquicode.Object.Clone( DataObject );
							let object_filename = `${storage_filename}.${DataObject._id}.json`;
							object_filename = LIB_PATH.join( storage_path, object_filename );
							await _WriteObject( object_filename, new_data_object );
							resolve( new_data_object );
						}
						catch ( error )
						{
							reject( error );
						}
						return;
					} );
			};


		//=====================================================================
		// WriteOne
		//=====================================================================


		storage_provider.WriteOne =
			async function WriteOne( DataObject, Criteria ) 
			{
				return new Promise(
					async ( resolve, reject ) =>
					{
						try
						{
							if ( !Server.Utility.has_value( Criteria ) )
							{
								if ( !Server.Utility.has_value( DataObject._id ) )
								{
									throw new Error( `You must supply either [Criteria] or [DataObject._id] in the parameters.` );
								}
								Criteria = { _id: DataObject._id };
							}

							let filename_pattern = `${storage_filename}.*.json`;
							let data_object = await Server.Liquicode.System.AsyncVisitFiles( storage_path, filename_pattern, false,
								async function ( Path, Filename )
								{
									let object_filename = LIB_PATH.join( Path, Filename );
									let object = await _ReadObject( object_filename );
									if ( LIB_JSON_CRITERIA.test( object, Criteria ) )
									{
										// Found Object
										object = Server.Liquicode.Object.Merge( object, DataObject );
										await _WriteObject( object_filename, object );
										return object;
									}
									return;
								} );

							if ( data_object === undefined )
							{
								resolve( 0 );
							}
							else
							{
								resolve( 1 );
							}
						}
						catch ( error )
						{
							reject( error );
						}
						return;
					} );
			};


		//=====================================================================
		// DeleteOne
		//=====================================================================


		storage_provider.DeleteOne =
			async function DeleteOne( Criteria ) 
			{
				return new Promise(
					async ( resolve, reject ) =>
					{
						try
						{
							let filename_pattern = `${storage_filename}.*.json`;
							let deleted_count = 0;
							await Server.Liquicode.System.AsyncVisitFiles( storage_path, filename_pattern, false,
								async function ( Path, Filename )
								{
									let object_filename = LIB_PATH.join( Path, Filename );
									if ( Server.Utility.has_value( Criteria ) )
									{
										let object = await _ReadObject( object_filename );
										if ( LIB_JSON_CRITERIA.test( object, Criteria ) )
										{
											// Delete Specific Object
											await _DeleteObject( object_filename );
											deleted_count++;
											return 1;
										}
									}
									else
									{
										// Delete First Object
										await _DeleteObject( object_filename );
										deleted_count++;
										return 1;
									}
									return;
								} );
							resolve( deleted_count );
						}
						catch ( error )
						{
							reject( error );
						}
						return;
					} );
			};


		//=====================================================================
		// DeleteMany
		//=====================================================================


		storage_provider.DeleteMany =
			async function DeleteMany( Criteria ) 
			{
				return new Promise(
					async ( resolve, reject ) =>
					{
						try
						{
							let filename_pattern = `${storage_filename}.*.json`;
							let deleted_count = 0;
							await Server.Liquicode.System.AsyncVisitFiles( storage_path, filename_pattern, false,
								async function ( Path, Filename )
								{
									let object_filename = LIB_PATH.join( Path, Filename );
									if ( Server.Utility.has_value( Criteria ) )
									{
										let object = await _ReadObject( object_filename );
										if ( LIB_JSON_CRITERIA.test( object, Criteria ) )
										{
											// Delete Specific Object
											await _DeleteObject( object_filename );
											deleted_count++;
										}
									}
									else
									{
										// Delete All Objects
										await _DeleteObject( object_filename );
										deleted_count++;
									}
									return;
								} );
							resolve( deleted_count );
						}
						catch ( error )
						{
							reject( error );
						}
						return;
					} );
			};


		//=====================================================================
		return storage_provider;
	};

