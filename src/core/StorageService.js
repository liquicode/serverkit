'use strict';


//---------------------------------------------------------------------
const SRC_USER_STORAGE = require( './StorageProviders/UserStorage.js' );


//---------------------------------------------------------------------
exports.NewStorageService =
	function NewStorageService( Server, Definition, Defaults )
	{

		//---------------------------------------------------------------------
		// The Storage Service.
		let service = Server.NewApplicationService( Definition, Defaults );


		//---------------------------------------------------------------------
		// Storage object which holds an instance of a storage provider.
		service.UserStorage = null;


		//---------------------------------------------------------------------
		service.StorageAdministrator = function ()
		{
			return {
				name: 'Storage Administrator',
				user_id: 'admin@server',
				user_role: 'admin',
			};
		};
		service.StorageSupervisor = function ()
		{
			return {
				name: 'Storage Supervisor',
				user_id: 'super@server',
				user_role: 'super',
			};
		};


		//=====================================================================
		//=====================================================================
		//
		//	Module Configuration
		//
		//=====================================================================
		//=====================================================================


		{ // Module Configuration


			//---------------------------------------------------------------------
			// Create the default storage configuration.

			// let default_storage_config = LIB_USER_STORAGE.DefaultConfiguration();
			// service.Defaults.Storage = LIB_USER_STORAGE.DefaultConfiguration();

			// //---------------------------------------------------------------------
			// // Create the storage default configuration.
			// // Call this from GetDefaults.
			// service.GetStorageDefaults =
			// 	function GetStorageDefaults()
			// 	{
			// 		return LIB_USER_STORAGE.DefaultConfiguration();
			// 	};

			service.Defaults = Server.Liquicode.Object.Merge( {
				UserStorage: SRC_USER_STORAGE.ConfigurationDefaults()
				// UserStorage: {
				// 	// - User Storage Configuration -
				// 	storage_info_member: '__',			// Name of the info field used in objects (e.g. thing.__.id = '...').
				// 	throw_permission_errors: false,		// Throw errors when user fails to have read or write access to an object.
				// 	storage_provider: 'MemoryProvider',
				// 	// - Memory Provider Configuration -
				// 	MemoryProvider: {},
				// 	// - File Provider Configuration -
				// 	FileProvider: {
				// 		path: '~server-data/ServiceName',				// Path to the data files.
				// 		filename: 'ItemName',							// Name of the data files: {filename}.{id}.json
				// 		use_lock_file: false,							// If true, uses lock files to control updates.
				// 	},
				// 	NedbProvider: {
				// 		filename: '~server-data/ServiceName/ItemName.nedb', 	// Name of the data file.
				// 	},
				// 	// - Sqlite3 Provider Configuration -
				// 	Sqlite3Provider: {
				// 		path: '~server-data',							// Path to the database file.
				// 		filename: 'ServiceName.sqlite3',				// Name of the database file.
				// 		table_name: 'ItemName',							// Name of the table for this service.
				// 	},
				// 	// - MongoDB Provider Configuration -
				// 	MongoProvider: {
				// 		database_name: 'ServiceName',					// Name of the MongoDB database.
				// 		collection_name: 'ItemName',					// Name of the MongoDB collection.
				// 		connection_string: 'mongodb://<username>:<password>@<server-address>:27017',	// Connection string to the MongoDB server.
				// 	},
				// },
			}, service.Defaults );


		} // Module Configuration


		//=====================================================================
		//=====================================================================
		//
		//	Module Definition
		//
		//=====================================================================
		//=====================================================================


		service.Definition = Server.Liquicode.Object.Merge(
			{
				name: 'UnnamedStorage',
				title: "Unnamed Storage Service",
				description: "Storage Service Base Class",
				Item: {
					name: 'UnnamedItem',
					title: "Unnamed Item",
					titles: "Unnamed Items",
					description: "Empty Item",
					shareable: false,
					Fields: [],
				},
			},
			service.Definition
		);

		{ // Module Definition


			//---------------------------------------------------------------------
			//---------------------------------------------------------------------
			//	Origin Definitions
			//---------------------------------------------------------------------
			//---------------------------------------------------------------------


			//---------------------------------------------------------------------
			service.Origins.NewStorageItem =
				Server.NewOriginDefinition( {
					name: 'NewStorageItem',
					description: "Creates a new item based upon the values given in prototype.",
					requires_login: true,
					Fields: [
						Server.NewFieldDefinition( {
							name: 'Prototype',
							title: "Prototype",
							description: "The prototype (initial values) to use for the new item.",
							type: 'object',
						} ),
					],
				},
					async function ( User, Prototype )
					{ return service.NewStorageItem( User, Prototype ); }
				);


			//---------------------------------------------------------------------
			service.Origins.StorageCount =
				Server.NewOriginDefinition( {
					name: 'StorageCount',
					description: "Returns the number of items matching the given criteria.",
					requires_login: true,
					Fields: [
						Server.NewFieldDefinition( {
							name: 'Criteria',
							title: "Criteria",
							description: "Criteria of the items to count.",
							type: 'object',
							example: { foo: 'bar' },
						} ),
					],
				},
					async function ( User, Criteria )
					{ return service.StorageCount( User, Criteria ); },
				);


			//---------------------------------------------------------------------
			service.Origins.StorageFindOne =
				Server.NewOriginDefinition( {
					name: 'StorageFindOne',
					description: "Returns the first object matching the given Criteria.",
					requires_login: true,
					Fields: [
						Server.NewFieldDefinition( {
							name: 'Criteria',
							title: "Criteria",
							description: "Criteria of the item to find.",
							type: 'object',
							example: { foo: 'bar' },
						} ),
					],
				},
					async function ( User, Criteria )
					{ return service.StorageFindOne( User, Criteria ); },
				);


			//---------------------------------------------------------------------
			service.Origins.StorageFindMany =
				Server.NewOriginDefinition( {
					name: 'StorageFindMany',
					description: 'Returns an array of all items matching the given criteria.',
					requires_login: true,
					Fields: [
						Server.NewFieldDefinition( {
							name: 'Criteria',
							title: "Criteria",
							description: "Criteria of the items to find.",
							type: 'object',
							example: { foo: 'bar' },
						} ),
					],
				},
					async function ( User, Criteria )
					{ return service.StorageFindMany( User, Criteria ); },
				);


			//---------------------------------------------------------------------
			service.Origins.StorageCreateOne =
				Server.NewOriginDefinition( {
					name: 'StorageCreateOne',
					description: "Creates and stores a new item based upon the given values in prototype; Returns the stored item.",
					requires_login: true,
					Fields: [
						Server.NewFieldDefinition( {
							name: 'Prototype',
							title: "Prototype",
							description: "The prototype (initial values) of the item to create.",
							type: 'object',
							example: { foo: 'bar' },
						} ),
					],
				},
					async function ( User, Prototype )
					{ return service.StorageCreateOne( User, Prototype ); },
				);


			//---------------------------------------------------------------------
			service.Origins.StorageWriteOne =
				Server.NewOriginDefinition( {
					name: 'StorageWriteOne',
					description: "Overwrites values in the first item matching the given criteria with values found in data object; Returns the number of items updated.",
					requires_login: true,
					Fields: [
						Server.NewFieldDefinition( {
							name: 'Criteria',
							title: "Criteria",
							description: "Criteria of the item to update.",
							type: 'object',
							example: { foo: 'bar' },
						} ),
						Server.NewFieldDefinition( {
							name: 'data_object',
							title: "DataObject",
							description: "Object containing update values.",
							type: 'object',
							example: { foo: 'bar' },
						} ),
					],
				},
					async function ( User, Criteria, DataObject )
					{ return service.StorageWriteOne( User, Criteria, DataObject ); },
				);


			//---------------------------------------------------------------------
			service.Origins.StorageDeleteOne =
				Server.NewOriginDefinition( {
					name: 'StorageDeleteOne',
					description: 'Deletes the first item matching the given criteria; Returns the number of items deleted.',
					requires_login: true,
					Fields: [
						Server.NewFieldDefinition( {
							name: 'Criteria',
							title: "Criteria",
							description: "Criteria of the item to delete.",
							type: 'object',
							example: { foo: 'bar' },
						} ),
					],
				},
					async function ( User, Criteria )
					{ return service.StorageDeleteOne( User, Criteria ); },
				);


			//---------------------------------------------------------------------
			service.Origins.StorageDeleteMany =
				Server.NewOriginDefinition( {
					name: 'StorageDeleteMany',
					description: 'Deletes all items matching the given criteria; Returns the number of items deleted.',
					requires_login: true,
					Fields: [
						Server.NewFieldDefinition( {
							name: 'Criteria',
							title: "Criteria",
							description: "Criteria of the items to delete.",
							type: 'object',
							example: { foo: 'bar' },
						} ),
					],
				},
					async function ( User, Criteria )
					{ return service.StorageDeleteMany( User, Criteria ); },
				);


			//---------------------------------------------------------------------
			service.Origins.StorageShare =
				Server.NewOriginDefinition( {
					name: 'StorageShare',
					description: "Shares all items matching the given criteria. Returns the number of items shared.",
					requires_login: true,
					Fields: [
						Server.NewFieldDefinition( {
							name: 'Criteria',
							title: "Criteria",
							description: "Criteria of the items to share.",
							type: 'object',
							example: { foo: 'bar' },
						} ),
						Server.NewFieldDefinition( {
							name: 'Readers',
							title: "Readers",
							description: "Array of user_id's to be added to each item's readers list.",
							type: 'array',
							example: [ 'user1_id', 'user2_id' ],
						} ),
						Server.NewFieldDefinition( {
							name: 'Writers',
							title: "Writers",
							description: "Array of user_id's to be added to each item's writers list.",
							type: 'array',
							example: [ 'user1_id', 'user2_id' ],
						} ),
						Server.NewFieldDefinition( {
							name: 'MakePublic',
							title: "MakePublic",
							description: "Mark each found item as public.",
							type: 'boolean',
							example: true,
						} ),
					],
				},
					async function ( User, Criteria, Readers, Writers, MakePublic )
					{ return service.StorageShare( User, Criteria, Readers, Writers, MakePublic ); },
				);


			//---------------------------------------------------------------------
			service.Origins.StorageUnshare =
				Server.NewOriginDefinition( {
					name: 'StorageUnshare',
					description: "Unshares all items matching the given criteria. Returns the number of items unshared.",
					requires_login: true,
					Fields: [
						Server.NewFieldDefinition( {
							name: 'Criteria',
							title: "Criteria",
							description: "Criteria of the items to unshare.",
							type: 'object',
							example: { foo: 'bar' },
						} ),
						Server.NewFieldDefinition( {
							name: 'NotReaders',
							title: "NotReaders",
							description: "Array of user_id's to be removed from each item's readers list.",
							type: 'array',
							example: [ 'user1_id', 'user2_id' ],
						} ),
						Server.NewFieldDefinition( {
							name: 'NotWriters',
							title: "NotWriters",
							description: "Array of user_id's to be removed from each item's writers list.",
							type: 'array',
							example: [ 'user1_id', 'user2_id' ],
						} ),
						Server.NewFieldDefinition( {
							name: 'MakeNotPublic',
							title: "MakeNotPublic",
							description: "Mark each found item as not public (i.e. private).",
							type: 'boolean',
							example: true,
						} ),
					],
				},
					async function ( User, Criteria, NotReaders, NotWriters, MakeNotPublic )
					{ return service.StorageUnshare( User, Criteria, NotReaders, NotWriters, MakeNotPublic ); },
				);


			//---------------------------------------------------------------------
			//---------------------------------------------------------------------
			//	View Definitions
			//---------------------------------------------------------------------
			//---------------------------------------------------------------------


			//---------------------------------------------------------------------
			service.Views.List =
				Server.NewOriginDefinition( {
					name: 'List',
					description: "List items for a service.",
					requires_login: true,
					Fields: [
						Server.NewFieldDefinition( {
							name: 'Criteria',
							title: "Criteria",
							description: "Criteria of the items to list.",
							type: 'object',
							example: { foo: 'bar' },
						} ),
					],
					// view: 'storage/list',
					// view: 'Services/StorageService/List',
				} );


			//---------------------------------------------------------------------
			service.Views.Item =
				Server.NewOriginDefinition( {
					name: 'Item',
					description: "Item detail and management functions.",
					requires_login: true,
					Fields: [
						Server.NewFieldDefinition( {
							name: 'ItemID',
							title: "ItemID",
							description: 'ID of the item to show.',
							type: 'string',
							example: 'b88d6048-725f-4f21-a8b0-e6de2de262e0',
							required: true,
						} ),
						Server.NewFieldDefinition( {
							name: 'PageOp',
							title: "PageOp",
							description: "Page operation: Create, Read, Update, or Delete.",
							type: 'string',
							example: 'Read',
						} ),
					],
					// view: 'storage/item',
					// view: 'Services/StorageService/Item',
				} );


			//---------------------------------------------------------------------
			service.Views.Share =
				Server.NewOriginDefinition( {
					name: 'Share',
					description: 'Manage sharing permissions for an item.',
					requires_login: true,
					Fields: [
						Server.NewFieldDefinition( {
							name: 'ItemID',
							title: "ItemID",
							description: "ID of the Item to share.",
							type: 'string',
							example: 'b88d6048-725f-4f21-a8b0-e6de2de262e0',
							required: true,
						} ),
					],
					// view: 'storage/share',
					// view: 'Services/StorageService/Share',
				} );


		} // Module Definition


		//=====================================================================
		//=====================================================================
		//
		//	Service Functions
		//
		//=====================================================================
		//=====================================================================


		{ // Service Functions


			//---------------------------------------------------------------------
			service.NewStorageItem =
				async function NewStorageItem( User, Prototype )
				{
					let result = Server.ValidateFieldValues( service.Definition.Item.Fields, Prototype );
					return result.fields;
					// let storage_item = {};
					// if ( Prototype ) { storage_item = Server.Utility.clone( Prototype ); }
					// let field_names = Object.keys( service.Definition.Item.Fields );
					// for ( let field_index = 0; field_index < field_names.length; field_index++ )
					// {
					// 	let field_name = field_names[ field_index ];
					// 	let field = service.Definition.Item.Fields[ field_name ];
					// 	if ( typeof storage_item[ field.name ] === 'undefined' )
					// 	{
					// 		storage_item[ field.name ] = null;
					// 		if ( field.type )
					// 		{
					// 			if ( field.type === 'boolean' ) { storage_item[ field.name ] = false; }
					// 			else if ( field.type === 'integer' ) { storage_item[ field.name ] = 0; }
					// 			else if ( field.type === 'number' ) { storage_item[ field.name ] = 0.0; }
					// 			else if ( field.type === 'string' ) { storage_item[ field.name ] = ''; }
					// 			else if ( field.type === 'array' ) { storage_item[ field.name ] = []; }
					// 			else if ( field.type === 'object' ) { storage_item[ field.name ] = {}; }
					// 		}
					// 	}
					// }
					// return storage_item;
				};

			//---------------------------------------------------------------------
			service.StorageCount =
				async function StorageCount( User, Criteria )
				{
					return await service.UserStorage.Count( User, Criteria );
				};

			//---------------------------------------------------------------------
			service.StorageFindOne =
				async function StorageFindOne( User, Criteria )
				{
					return await service.UserStorage.FindOne( User, Criteria );
				};

			//---------------------------------------------------------------------
			service.StorageFindMany =
				async function StorageFindMany( User, Criteria ) 
				{
					return await service.UserStorage.FindMany( User, Criteria );
				};

			//---------------------------------------------------------------------
			service.StorageCreateOne =
				async function StorageCreateOne( User, Prototype )
				{
					let data_object = await service.NewStorageItem( User, Prototype );
					return await service.UserStorage.CreateOne( User, data_object );
				};

			//---------------------------------------------------------------------
			service.StorageWriteOne =
				async function StorageWriteOne( User, Criteria, DataObject ) 
				{
					return await service.UserStorage.WriteOne( User, Criteria, DataObject );
				};

			//---------------------------------------------------------------------
			service.StorageDeleteOne =
				async function StorageDeleteOne( User, Criteria )
				{
					return await service.UserStorage.DeleteOne( User, Criteria );
				};

			//---------------------------------------------------------------------
			service.StorageDeleteMany =
				async function StorageDeleteMany( User, Criteria )
				{
					return await service.UserStorage.DeleteMany( User, Criteria );
				};

			//---------------------------------------------------------------------
			service.StorageShare =
				async function StorageShare( User, Criteria, Readers, Writers, MakePublic )
				{
					return await service.UserStorage.Share( User, Criteria, Readers, Writers, MakePublic );
				};

			//---------------------------------------------------------------------
			service.StorageUnshare =
				async function StorageUnshare( User, Criteria, NotReaders, NotWriters, MakeNotPublic ) 
				{
					return await service.UserStorage.Unshare( User, Criteria, NotReaders, NotWriters, MakeNotPublic );
				};


		} // Service Functions


		//=====================================================================
		//=====================================================================
		//
		//	Module Control
		//
		//=====================================================================
		//=====================================================================


		{ // Module Control


			//---------------------------------------------------------------------
			// Initialize the storage.
			// Call this from InitializeModule.
			service.InitializeStorage =
				async function InitializeStorage()
				{
					service.UserStorage = SRC_USER_STORAGE.NewUserStorage( Server, service, service.Settings.UserStorage );
					return;
				};


			//---------------------------------------------------------------------
			service.StartupStorage =
				async function StartupStorage()
				{
					if ( service.UserStorage )
					{
						await service.UserStorage.StartupProvider();
					}
					return;
				};


			//---------------------------------------------------------------------
			service.ShutdownStorage =
				async function ShutdownStorage()
				{
					if ( service.UserStorage )
					{
						await service.UserStorage.ShutdownProvider();
					}
					return;
				};


			//---------------------------------------------------------------------
			//---------------------------------------------------------------------
			//	Initialize Module
			//	Server has loaded and configurations are set.
			//	Modules should finalize their Definition here.
			//---------------------------------------------------------------------
			//---------------------------------------------------------------------


			service.InitializeModule =
				async function InitializeModule()
				{
					await service.InitializeStorage();
					Server.Log.trace( `Services: ${service.Definition.name} is initialized.` );
					return;
				};


			//---------------------------------------------------------------------
			//---------------------------------------------------------------------
			//	Startup Module
			//	Server has been initialized and is now starting up.
			//---------------------------------------------------------------------
			//---------------------------------------------------------------------


			service.StartupModule =
				async function StartupModule()
				{
					await service.StartupStorage();
					Server.Log.trace( `Services: ${service.Definition.name} has started.` );
					return;
				};


			//---------------------------------------------------------------------
			//---------------------------------------------------------------------
			//	Shutdown Module
			//	Server has been running and is now shutting down.
			//---------------------------------------------------------------------
			//---------------------------------------------------------------------


			service.ShutdownModule =
				async function ShutdownModule()
				{
					await service.ShutdownStorage();
					Server.Log.trace( `Services: ${service.Definition.name} has stopped.` );
					return;
				};


		} // Module Control


		//---------------------------------------------------------------------
		// Return the Storage Service.
		//---------------------------------------------------------------------


		return service;
	};


