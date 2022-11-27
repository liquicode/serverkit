'use strict';


//---------------------------------------------------------------------
const LIB_FS = require( 'fs' );
const LIB_PATH = require( 'path' );
require( 'babel-polyfill' );
const LIB_JSON_CRITERIA = require( 'json-criteria' );
const LIB_UUID = require( 'uuid' );
const LIB_BETTER_SQLITE3 = require( 'better-sqlite3' );


//---------------------------------------------------------------------
exports.ConfigurationDefaults =
	function ConfigurationDefaults()
	{
		let defaults = {
			filename: 'ServiceName.sqlite3',				// Name of the database file.
			table_name: 'ItemName',							// Name of the table for this service.
		};
		return defaults;
	};


//---------------------------------------------------------------------
exports.NewProvider =
	function NewProvider( Server, Service, Settings )
	{
		let storage_provider = {};

		// Open/Create the database.
		let database_path = Server.ResolveDataPath( Service, Settings.path );
		LIB_FS.mkdirSync( database_path, { recursive: true } );
		let database_filename = LIB_PATH.join( database_path, Settings.filename );
		let database_options = {};
		let database = LIB_BETTER_SQLITE3( database_filename, database_options );

		// Create the table.
		let create_table_sql =
			`CREATE TABLE IF NOT EXISTS ${Settings.table_name} ( `
			+ '_id TEXT PRIMARY KEY, '
			+ 'data TEXT )';
		+ ')';
		let create_table_info = database.exec( create_table_sql );

		// Prepare sql statements.
		let cmd_insert = database.prepare( `INSERT INTO ${Settings.table_name} VALUES ( @_id, @data )` );
		let cmd_select_all = database.prepare( `SELECT * FROM ${Settings.table_name}` );
		let cmd_select_by_id = database.prepare( `SELECT * FROM ${Settings.table_name} WHERE (_id = @_id)` );
		let cmd_update_by_id = database.prepare( `UPDATE ${Settings.table_name} SET data = @data WHERE (_id = @_id)` );
		let cmd_delete_by_id = database.prepare( `DELETE FROM ${Settings.table_name} WHERE (_id = @_id)` );


		//---------------------------------------------------------------------
		function FindObjects( Criteria, GetFirst )
		{
			let found_objects = [];
			if ( Server.Utility.has_value( Criteria ) && Server.Utility.has_value( Criteria._id ) )
			{
				let row = cmd_select_by_id.get( { _id: Criteria._id } );
				if ( row )
				{
					let object = JSON.parse( row.data );
					object._id = row._id;
					found_objects.push( object );
				}
			}
			else
			{
				let rows = cmd_select_all.all();
				for ( let index = 0; index < rows.length; index++ )
				{
					let row = rows[ index ];
					let object = JSON.parse( row.data );
					object._id = row._id;
					if ( Server.Utility.has_value( Criteria ) )
					{
						if ( LIB_JSON_CRITERIA.test( object, Criteria ) )
						{
							found_objects.push( object );
							if ( GetFirst ) { break; }
						}
					}
					else
					{
						found_objects.push( object );
						if ( GetFirst ) { break; }
					}
				}
			}
			return found_objects;
		}


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
							database.close();
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
							let objects = FindObjects( Criteria, false );
							resolve( objects.length );
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
							let objects = FindObjects( Criteria, true );
							let object = null;
							if ( objects.length ) { object = objects[ 0 ]; }
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
							let objects = FindObjects( Criteria, false );
							resolve( objects );
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
							let data_object = {
								_id: LIB_UUID.v4(),
								data: JSON.stringify( DataObject ),
							};
							cmd_insert.run( data_object );

							// insert will modify DataObject by setting the _id field.
							DataObject._id = data_object._id;
							resolve( DataObject );
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
							let objects = FindObjects( Criteria, true );
							if ( objects.length ) 
							{
								let object = objects[ 0 ];
								object = Server.Liquicode.Object.Merge( object, DataObject );
								let row_id = object._id;
								delete object._id;
								let run_info = cmd_update_by_id.run( {
									_id: row_id,
									data: JSON.stringify( object ),
								} );
								resolve( run_info.changes );
							}
							else
							{
								resolve( 0 );
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
							let objects = FindObjects( Criteria, true );
							if ( objects.length ) 
							{
								let object = objects[ 0 ];
								let run_info = cmd_delete_by_id.run( { _id: object._id } );
								resolve( run_info.changes );
							}
							else
							{
								resolve( 0 );
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
							let deleted_count = 0;
							let objects = FindObjects( Criteria, false );
							if ( objects.length ) 
							{
								for ( let index = 0; index < objects.length; index++ )
								{
									let object = objects[ index ];
									let run_info = cmd_delete_by_id.run( { _id: object._id } );
									if ( run_info.changes )
									{
										deleted_count++;
									}
								}
							}
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

