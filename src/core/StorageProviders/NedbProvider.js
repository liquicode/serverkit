'use strict';


//---------------------------------------------------------------------
const LIB_NEDB = require( 'nedb' );


//---------------------------------------------------------------------
exports.ConfigurationDefaults =
	function ConfigurationDefaults()
	{
		let defaults = {
			filename: '~server-data/ServiceName/ItemName.nedb', 	// Name of the data file.
		};
		return defaults;
	};


//---------------------------------------------------------------------
exports.NewProvider =
	function NewProvider( Server, Settings )
	{
		let storage_provider = {};


		//---------------------------------------------------------------------
		async function WithStorage( api_callback )
		{
			try
			{

				// Get the collection.
				let collection_filename = Server.ResolveApplicationPath( Settings.filename );
				let collection = new LIB_NEDB( { filename: collection_filename, autoload: true } );

				// Do the stuff.
				let result = await api_callback( collection );
				return result;

			}
			catch ( error )
			{
				throw error;
			}
			finally
			{
			}

		};
		storage_provider.WithStorage = WithStorage;


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
				return await WithStorage(
					async function ( Collection )
					{
						return await new Promise(
							async ( resolve, reject ) =>
							{
								try
								{
									Collection.count( Criteria,
										function ( error, count ) 
										{
											if ( error ) { reject( error ); }
											else { resolve( count ); }
										} );
								}
								catch ( error )
								{
									reject( error );
								}
								return;
							} );
					} );
			};


		//=====================================================================
		// FindOne
		//=====================================================================


		storage_provider.FindOne =
			async function FindOne( Criteria ) 
			{
				return await WithStorage(
					async function ( Collection )
					{
						return await new Promise(
							async ( resolve, reject ) =>
							{
								try
								{
									Collection.findOne( Criteria,
										function ( error, document ) 
										{
											if ( error ) { reject( error ); }
											else { resolve( document ); }
										} );
								}
								catch ( error )
								{
									reject( error );
								}
								return;
							} );
					} );
			};


		//=====================================================================
		// FindMany
		//=====================================================================


		storage_provider.FindMany =
			async function FindMany( Criteria ) 
			{
				return await WithStorage(
					async function ( Collection )
					{
						return await new Promise(
							async ( resolve, reject ) =>
							{
								try
								{
									Collection.find( Criteria,
										function ( error, documents ) 
										{
											if ( error ) { reject( error ); }
											else { resolve( documents ); }
										} );
								}
								catch ( error )
								{
									reject( error );
								}
								return;
							} );
					} );
			};


		//=====================================================================
		// CreateOne
		//=====================================================================


		storage_provider.CreateOne =
			async function CreateOne( DataObject ) 
			{
				return await WithStorage(
					async function ( Collection )
					{
						return await new Promise(
							async ( resolve, reject ) =>
							{
								try
								{
									Collection.insert( DataObject,
										function ( error, document ) 
										{
											if ( error ) 
											{
												reject( error );
											}
											else 
											{
												// insert will modify DataObject by setting the _id field.
												DataObject._id = document._id;
												resolve( document );
											}
										} );
								}
								catch ( error )
								{
									reject( error );
								}
								return;
							} );
					} );
			};


		//=====================================================================
		// WriteOne
		//=====================================================================


		storage_provider.WriteOne =
			async function WriteOne( DataObject, Criteria ) 
			{
				return await WithStorage(
					async function ( Collection )
					{
						if ( !Server.Utility.has_value( Criteria ) )
						{
							// Criteria = { _id: DataObject._id };
							Criteria = { _id: DataObject._id };
						}
						// let data_object = Server.Liquicode.Object.Clone( DataObject );
						// delete data_object._id;
						// let db_response = await Collection.replaceOne( Criteria, data_object );
						// if ( !db_response.acknowledged ) { throw new Error( `Database did not acknowledge insertion.` ); }
						// return db_response.modifiedCount;
						return await new Promise(
							async ( resolve, reject ) =>
							{
								try
								{
									Collection.update( Criteria, DataObject, { multi: false, upsert: false, returnUpdatedDocs: false },
										function ( error, numAffected, affectedDocuments, upsert ) 
										{
											if ( error ) { reject( error ); }
											else { resolve( numAffected ); }
										} );
								}
								catch ( error )
								{
									reject( error );
								}
								return;
							} );
					} );
			};


		//=====================================================================
		// DeleteOne
		//=====================================================================


		storage_provider.DeleteOne =
			async function DeleteOne( Criteria ) 
			{
				return await WithStorage(
					async function ( Collection )
					{
						// let db_response = await Collection.deleteOne( Criteria );
						// if ( !db_response.acknowledged ) { throw new Error( `Database did not acknowledge deletion.` ); }
						// return db_response.deletedCount;
						return await new Promise(
							async ( resolve, reject ) =>
							{
								try
								{
									Collection.remove( Criteria, { multi: false },
										function ( error, numRemoved ) 
										{
											if ( error ) { reject( error ); }
											else { resolve( numRemoved ); }
										} );
								}
								catch ( error )
								{
									reject( error );
								}
								return;
							} );
					} );
			};


		//=====================================================================
		// DeleteMany
		//=====================================================================


		storage_provider.DeleteMany =
			async function DeleteMany( Criteria ) 
			{
				return await WithStorage(
					async function ( Collection )
					{
						// let db_response = await Collection.deleteMany( Criteria );
						// if ( !db_response.acknowledged ) { throw new Error( `Database did not acknowledge deletion.` ); }
						// return db_response.deletedCount;
						return await new Promise(
							async ( resolve, reject ) =>
							{
								try
								{
									Collection.remove( Criteria, { multi: true },
										function ( error, numRemoved ) 
										{
											if ( error ) { reject( error ); }
											else { resolve( numRemoved ); }
										} );
								}
								catch ( error )
								{
									reject( error );
								}
								return;
							} );
					} );
			};


		//=====================================================================
		return storage_provider;
	};

