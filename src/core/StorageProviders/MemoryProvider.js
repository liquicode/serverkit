'use strict';


//---------------------------------------------------------------------
require( 'babel-polyfill' );
const LIB_JSON_CRITERIA = require( 'json-criteria' );
const LIB_UUID = require( 'uuid' );


//---------------------------------------------------------------------
exports.ConfigurationDefaults =
	function ConfigurationDefaults()
	{
		let defaults = {};
		return defaults;
	};


//---------------------------------------------------------------------
exports.NewProvider =
	function NewProvider( Server, Settings )
	{

		// Storage Provider State.
		let storage_provider = {};
		let storage_objects = [];
		let storage_dirty = false;


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
							if ( Server.Utility.has_value( Criteria ) )
							{
								for ( let object_index = 0; object_index < storage_objects.length; object_index++ )
								{
									let test_object = storage_objects[ object_index ];
									if ( LIB_JSON_CRITERIA.test( test_object, Criteria ) )
									{
										object_count++;
									}
								}
							}
							else
							{
								object_count = storage_objects.length;
							}
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
							let object = null;
							if ( Server.Utility.has_value( Criteria ) )
							{
								for ( let object_index = 0; object_index < storage_objects.length; object_index++ )
								{
									let test_object = storage_objects[ object_index ];
									if ( LIB_JSON_CRITERIA.test( test_object, Criteria ) )
									{
										object = Server.Liquicode.Object.Clone( test_object );
										break;
									}
								}
							}
							else
							{
								if ( storage_objects.length > 0 )
								{
									object = Server.Liquicode.Object.Clone( storage_objects[ 0 ] );
								}
							}
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
							for ( let object_index = 0; object_index < storage_objects.length; object_index++ )
							{
								let test_object = storage_objects[ object_index ];
								if ( !Server.Utility.has_value( Criteria ) )
								{
									found_objects.push( Server.Liquicode.Object.Clone( test_object ) );
								}
								else if ( LIB_JSON_CRITERIA.test( test_object, Criteria ) )
								{
									found_objects.push( Server.Liquicode.Object.Clone( test_object ) );
								}
							}
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
							storage_objects.push( new_data_object );
							storage_dirty = true;
							resolve( Server.Liquicode.Object.Clone( new_data_object ) );
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
							for ( let object_index = 0; object_index < storage_objects.length; object_index++ )
							{
								let test_object = storage_objects[ object_index ];
								if ( LIB_JSON_CRITERIA.test( test_object, Criteria ) )
								{
									storage_objects[ object_index ] = Server.Liquicode.Object.Merge( test_object, DataObject );
									storage_dirty = true;
									resolve( 1 );
									return;
								}
							}
							resolve( 0 );
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
							let deleted_count = 0;
							if ( !Server.Utility.has_value( Criteria ) )
							{
								if ( storage_objects.length > 0 )
								{
									storage_objects.splice( 0, 1 );
									deleted_count++;
								}
							}
							else
							{
								for ( let object_index = 0; object_index < storage_objects.length; object_index++ )
								{
									let test_object = storage_objects[ object_index ];
									if ( LIB_JSON_CRITERIA.test( test_object, Criteria ) )
									{
										storage_objects.splice( object_index, 1 );
										deleted_count++;
										break;
									}
								}
							}
							if ( deleted_count > 0 )
							{
								storage_dirty = true;
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
							if ( !Server.Utility.has_value( Criteria ) )
							{
								deleted_count = storage_objects.length;
								storage_objects = [];
							}
							else
							{
								for ( let object_index = storage_objects.length - 1; object_index >= 0; object_index-- )
								{
									let test_object = storage_objects[ object_index ];
									if ( LIB_JSON_CRITERIA.test( test_object, Criteria ) )
									{
										storage_objects.splice( object_index, 1 );
										deleted_count++;
									}
								}
							}
							if ( deleted_count > 0 )
							{
								storage_dirty = true;
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

