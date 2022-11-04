'use strict';


//---------------------------------------------------------------------
const LIB_MONGODB = require( 'mongodb' );


//---------------------------------------------------------------------
exports.NewProvider =
	function NewProvider( Server, StorageService )
	{
		let storage_config = StorageService.Settings.UserStorage.MongoProvider;
		let storage_provider = {};


		//---------------------------------------------------------------------
		async function WithStorage( api_callback )
		{
			let database = null;
			let client = null;
			try
			{

				// Connect to the server.
				client = await LIB_MONGODB.MongoClient.connect(
					storage_config.connection_string,
					{
						// keepAlive: 1,
						keepAlive: true,
						useUnifiedTopology: true,
						useNewUrlParser: true,
					}
				);
				if ( !client ) { throw new Error( `Unable to establish a connection to the mongodb database server.` ); }

				// Get the database.
				database = client.db( storage_config.database_name );

				// Get the collection.
				let collection = database.collection( storage_config.collection_name );

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
				if ( client )
				{
					client.close();
					// database.close();
				}
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
						let db_response = await Collection.countDocuments( Criteria );
						return db_response;
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
						return await Collection.findOne( Criteria );
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
						let db_cursor = await Collection.find( Criteria );
						if ( !db_cursor ) { throw new Error( `Unable to obtain a cursor on the collection.` ); }
						let data_objects = await db_cursor.toArray();
						return data_objects;
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
						// insertOne will modify DataObject by adding the _id field to it.
						let db_response = await Collection.insertOne( DataObject );
						if ( !db_response.acknowledged ) { throw new Error( `Database did not acknowledge insertion.` ); }
						let new_data_object = Server.Liquicode.Object.Clone( DataObject );
						new_data_object._id = DataObject._id; // Because clone creates a string version of the id.
						return new_data_object;
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
							Criteria = { _id: new LIB_MONGODB.ObjectID( DataObject._id ) };
						}
						let data_object = Server.Liquicode.Object.Clone( DataObject );
						delete data_object._id;
						let db_response = await Collection.replaceOne( Criteria, data_object );
						if ( !db_response.acknowledged ) { throw new Error( `Database did not acknowledge insertion.` ); }
						return db_response.modifiedCount;
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
						let db_response = await Collection.deleteOne( Criteria );
						if ( !db_response.acknowledged ) { throw new Error( `Database did not acknowledge deletion.` ); }
						return db_response.deletedCount;
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
						let db_response = await Collection.deleteMany( Criteria );
						if ( !db_response.acknowledged ) { throw new Error( `Database did not acknowledge deletion.` ); }
						return db_response.deletedCount;
					} );
			};


		//=====================================================================
		return storage_provider;
	};

