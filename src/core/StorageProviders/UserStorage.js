"use strict";


const LIB_FS = require( 'fs' );
const LIB_PATH = require( 'path' );
const LIB_UUID = require( 'uuid' );

const SRC_STORAGE = require( './Storage.js' );


//---------------------------------------------------------------------
exports.ConfigurationDefaults =
	function ConfigurationDefaults()
	{
		let defaults = SRC_STORAGE.ConfigurationDefaults();
		defaults.storage_info_member = '__';			// Name of the info field used in objects (e.g. thing.__.id = '...').
		defaults.throw_permission_errors = false;		// Throw errors when user fails to have read or write access to an object.
		return defaults;
	};


//---------------------------------------------------------------------
exports.NewUserStorage =
	function NewUserStorage( Server, Service, UserStorageSettings )
	{
		let user_storage = {};


		//=====================================================================
		// Storage Provider
		//=====================================================================

		if ( !UserStorageSettings.storage_provider ) { throw new Error( `Cannot create UserStorage because no storage provider was specified.` ); }
		if ( !UserStorageSettings[ UserStorageSettings.storage_provider ] ) { throw new Error( `Cannot create UserStorage because no provider configuration was available for [${UserStorageSettings.storage_provider}].` ); }

		// Get the storage provider.
		let factory = require( `./${UserStorageSettings.storage_provider}.js` );
		user_storage.Provider = factory.NewProvider( Server, Service, UserStorageSettings[ UserStorageSettings.storage_provider ] );


		//=====================================================================
		// Private Functions
		//=====================================================================


		//---------------------------------------------------------------------
		function MISSING_PARAMETER_ERROR( Name )
		{
			return new Error( `Required parameter is missing: ${Name}` );
		};


		//---------------------------------------------------------------------
		function READ_ACCESS_ERROR()
		{
			return new Error( `User does not have read access to this object or the object does not exist.` );
		};


		//---------------------------------------------------------------------
		function WRITE_ACCESS_ERROR()
		{
			return new Error( `User does not have write access to this object.` );
		};


		//---------------------------------------------------------------------
		function _ValidateUser( User )
		{
			if ( !Server.Utility.has_value( User ) ) { throw MISSING_PARAMETER_ERROR( 'User' ); }
			if ( !Server.Utility.has_value( User.user_id ) ) { throw MISSING_PARAMETER_ERROR( 'User.user_id' ); }
			if ( !Server.Utility.has_value( User.user_role ) ) { throw MISSING_PARAMETER_ERROR( 'User.user_role' ); }
			// if ( ![ 'admin', 'super', 'user' ].includes( User.user_role ) ) { throw new Error( `Unknown value for User.user_role: [${User.user_role}]` ); }
			return;
		}


		//---------------------------------------------------------------------
		function _ValidateStorageObject( StorageObject )
		{
			if ( !Server.Utility.has_value( StorageObject ) ) { throw MISSING_PARAMETER_ERROR( 'StorageObject' ); }
			if ( !Server.Utility.has_value( StorageObject[ UserStorageSettings.storage_info_member ] ) ) { throw MISSING_PARAMETER_ERROR( 'StorageObject[ info_member ]' ); }
			if ( !Server.Utility.has_value( StorageObject[ UserStorageSettings.storage_info_member ].id ) ) { throw MISSING_PARAMETER_ERROR( 'StorageObject[ info_member ].id' ); }
			if ( !Server.Utility.has_value( StorageObject[ UserStorageSettings.storage_info_member ].owner_id ) ) { throw MISSING_PARAMETER_ERROR( 'StorageObject[ info_member ].owner_id' ); }
			if ( StorageObject[ UserStorageSettings.storage_info_member ].readers === undefined ) { throw MISSING_PARAMETER_ERROR( 'StorageObject[ info_member ].readers' ); }
			if ( StorageObject[ UserStorageSettings.storage_info_member ].writers === undefined ) { throw MISSING_PARAMETER_ERROR( 'StorageObject[ info_member ].writers' ); }
			if ( StorageObject[ UserStorageSettings.storage_info_member ].public === undefined ) { throw MISSING_PARAMETER_ERROR( 'StorageObject[ info_member ].public' ); }
			return;
		}


		//---------------------------------------------------------------------
		user_storage.StartupProvider =
			async function StartupProvider() 
			{
				if ( !Server.Utility.has_value( user_storage.Provider ) ) { throw new Error( `Storage Provider does not exist.` ); }
				await user_storage.Provider.StartupProvider();
				return;
			};


		//---------------------------------------------------------------------
		user_storage.ShutdownProvider =
			async function ShutdownProvider() 
			{
				if ( !Server.Utility.has_value( user_storage.Provider ) ) { throw new Error( `Storage Provider does not exist.` ); }
				await user_storage.Provider.ShutdownProvider();
				return;
			};


		//---------------------------------------------------------------------
		user_storage.NewStorageObject =
			function NewStorageObject( Owner, Prototype ) 
			{
				if ( !Server.Utility.has_value( Owner ) ) { throw MISSING_PARAMETER_ERROR( 'Owner' ); }
				if ( !Server.Utility.has_value( Owner.user_id ) ) { throw MISSING_PARAMETER_ERROR( 'Owner.user_id' ); }

				// Create a new user object.
				let user_object = Server.Liquicode.Object.Clone( Prototype );
				delete user_object[ UserStorageSettings.storage_info_member ];
				user_object[ UserStorageSettings.storage_info_member ] = {
					id: LIB_UUID.v4(),
					created_at: Server.Utility.zulu_timestamp(),
					updated_at: Server.Utility.zulu_timestamp(),
					owner_id: Owner.user_id,
					readers: [],
					writers: [],
					public: false,
				};

				// Return the user object.
				return user_object;
			};


		//---------------------------------------------------------------------
		user_storage.GetStorageData =
			function GetStorageData( StorageObject ) 
			{
				let user_data = Server.Liquicode.Object.Clone( StorageObject );
				delete user_data[ UserStorageSettings.storage_info_member ];
				return user_data;
			};


		//---------------------------------------------------------------------
		user_storage.GetStorageInfo =
			function GetStorageInfo( StorageObject ) 
			{
				let user_info = {};
				if ( typeof StorageObject[ UserStorageSettings.storage_info_member ] === 'object' ) 
				{
					user_info = Server.Liquicode.Object.Clone( StorageObject[ UserStorageSettings.storage_info_member ] );
				}
				return user_info;
			};


		//---------------------------------------------------------------------
		user_storage.UserCanShare =
			function UserCanShare( User, StorageObject )
			{
				_ValidateUser( User );
				_ValidateStorageObject( StorageObject );
				if ( User.user_role === 'admin' ) { return true; }
				if ( User.user_role === 'super' ) { return true; }
				if ( User.user_id === StorageObject[ UserStorageSettings.storage_info_member ].owner_id ) { return true; }
				return false;
			};


		//---------------------------------------------------------------------
		user_storage.UserCanWrite =
			function UserCanWrite( User, StorageObject )
			{
				if ( user_storage.UserCanShare( User, StorageObject ) ) { return true; }
				if ( StorageObject[ UserStorageSettings.storage_info_member ].writers.includes( User.user_id ) ) { return true; }
				return false;
			};


		//---------------------------------------------------------------------
		user_storage.UserCanRead =
			function UserCanRead( User, StorageObject )
			{
				if ( user_storage.UserCanWrite( User, StorageObject ) ) { return true; }
				if ( StorageObject[ UserStorageSettings.storage_info_member ].readers.includes( User.user_id ) ) { return true; }
				if ( StorageObject[ UserStorageSettings.storage_info_member ].public ) { return true; }
				return false;
			};


		//---------------------------------------------------------------------
		function _UserCriteria( User, ObjectOrID )
		{
			_ValidateUser( User );

			// Construct the query criteria.
			let criteria = {};

			let object_type = ( typeof ObjectOrID );
			if ( object_type === 'undefined' ) 
			{
				// Do nothing. Find all objects.
			}
			else if ( object_type === 'string' )
			{
				criteria[ UserStorageSettings.storage_info_member ] = { id: ObjectOrID }; // Match a single, specific object.
			}
			else if ( object_type === 'object' )
			{
				if ( ObjectOrID === null )
				{
					// Do nothing. Find all objects.
				}
				else
				{
					let user_info = user_storage.GetStorageInfo( ObjectOrID );
					if ( Server.Utility.has_value( user_info.id ) )
					{
						criteria[ UserStorageSettings.storage_info_member + '.id' ] = user_info.id; // Match a single, specific object by id.
					}
					else
					{
						criteria = user_storage.GetStorageData( ObjectOrID ); // match the provided object.
					}
				}
			}
			else
			{
				throw new Error( `Unknown parameter type [${object_type}] for [ObjectOrID]. Must be a string, object, null, or undefined.` );
			}

			// Apply role based restrictions on object reading.
			if ( User.user_role === 'admin' ) 
			{
				// Do nothing. Allow reading of all objects.
			}
			else if ( User.user_role === 'super' ) 
			{
				// Do nothing. Allow reading of all objects.
			}
			else
			{
				criteria.$or = []; // Use a set of optional conditions.
				{
					// Return objects owned by this user.
					let info_test = {};
					info_test[ UserStorageSettings.storage_info_member + '.owner_id' ] = User.user_id;
					criteria.$or.push( info_test );
				}
				{
					// Return objects shared to this user.
					let info_test = {};
					info_test[ UserStorageSettings.storage_info_member + '.readers' ] = { $in: [ User.user_id ] };
					criteria.$or.push( info_test );
				}
				{
					// Return objects shared to this user.
					let info_test = {};
					info_test[ UserStorageSettings.storage_info_member + '.writers' ] = { $in: [ User.user_id ] };
					criteria.$or.push( info_test );
				}
				{
					// Return public objects.
					let info_test = {};
					info_test[ UserStorageSettings.storage_info_member + '.public' ] = true;
					criteria.$or.push( info_test );
				}
				// let owner_id_member = _info_member + '.owner_id';
				// let readers_member = _info_member + '.readers';
				// let writers_member = _info_member + '.writers';
				// let public_member = _info_member + '.public';
				// criteria.$or.push( { owner_id_member: User.user_id } ); // Return objects owned by this user.
				// criteria.$or.push( { readers_member: { $in: User.user_id } } ); // Return objects shared to this user.
				// criteria.$or.push( { writers_member: { $in: User.user_id } } ); // Return objects shared to this user.
				// criteria.$or.push( { public_member: true } ); // Return public objects.
			}

			return criteria;
		}


		//=====================================================================
		// Count
		//---------------------------------------------------------------------
		// Returns the number of objects specified by Criteria.
		// Only objects that permit the user read or write access are counted.
		//=====================================================================


		user_storage.Count =
			async function Count( User, Criteria )
			{
				try
				{
					let criteria = _UserCriteria( User, Criteria );
					return await user_storage.Provider.Count( criteria );
				}
				catch ( error )
				{
					throw error;
				}
			};


		//=====================================================================
		// FindOne
		//---------------------------------------------------------------------
		// Finds a single object.
		// If multiple objects are found, then the first one is returned.
		// Only objects that permit the user read or write access are returned.
		//=====================================================================


		user_storage.FindOne =
			async function FindOne( User, Criteria )
			{
				try
				{
					let criteria = _UserCriteria( User, Criteria );
					let object = await user_storage.Provider.FindOne( criteria );
					if ( object ) { delete object._id; }
					return object;
				}
				catch ( error )
				{
					throw error;
				}
			};


		//=====================================================================
		// FindMany
		//---------------------------------------------------------------------
		// Finds a number of objects.
		// Only objects that permit the user read or write access are returned.
		//=====================================================================


		user_storage.FindMany =
			async function FindMany( User, Criteria )
			{
				try
				{
					let criteria = _UserCriteria( User, Criteria );
					let objects = await user_storage.Provider.FindMany( criteria );
					objects.forEach( object => { delete object._id; } );
					return objects;
				}
				catch ( error )
				{
					throw error;
				}
			};


		//=====================================================================
		// CreateOne
		//---------------------------------------------------------------------
		// Creates a single object. Values from Prototype are merged.
		// The created object is owned by the user.
		// Any user can call this.
		//=====================================================================


		user_storage.CreateOne =
			async function CreateOne( User, Prototype )
			{
				try
				{
					let user_object = user_storage.NewStorageObject( User, Prototype );
					let object = await user_storage.Provider.CreateOne( user_object );
					if ( object ) { delete object._id; }
					return object;
				}
				catch ( error )
				{
					throw error;
				}
			};


		//=====================================================================
		// WriteOne
		//---------------------------------------------------------------------
		// Modifies a single object. Values from DataObject are merged.
		// User must have write permissions.
		//=====================================================================


		user_storage.WriteOne =
			async function WriteOne( User, Criteria, DataObject )
			{
				try
				{
					let criteria = _UserCriteria( User, Criteria );
					let found_object = await user_storage.Provider.FindOne( criteria );
					if ( !found_object ) 
					{
						if ( UserStorageSettings.throw_permission_errors ) { throw READ_ACCESS_ERROR(); }
						else { return 0; }
					}
					if ( !user_storage.UserCanWrite( User, found_object ) ) 
					{
						if ( UserStorageSettings.throw_permission_errors ) { throw WRITE_ACCESS_ERROR(); }
						else { return 0; }
					}
					found_object[ UserStorageSettings.storage_info_member ].updated_at = Server.Utility.zulu_timestamp();
					found_object = Server.Liquicode.Object.Merge( found_object, DataObject );
					return await user_storage.Provider.WriteOne( found_object );
				}
				catch ( error )
				{
					throw error;
				}
			};


		//=====================================================================
		// DeleteOne
		//---------------------------------------------------------------------
		// Deletes a single object.
		// User must have write permissions.
		//=====================================================================


		user_storage.DeleteOne =
			async function DeleteOne( User, Criteria )
			{
				try
				{
					let criteria = _UserCriteria( User, Criteria );
					let found_object = await user_storage.Provider.FindOne( criteria );
					if ( !found_object ) 
					{
						if ( UserStorageSettings.throw_permission_errors ) { throw READ_ACCESS_ERROR(); }
						else { return 0; }
					}
					if ( !user_storage.UserCanWrite( User, found_object ) ) 
					{
						if ( UserStorageSettings.throw_permission_errors ) { throw WRITE_ACCESS_ERROR(); }
						else { return 0; }
					}
					return await user_storage.Provider.DeleteOne( _UserCriteria( User, found_object ) );
				}
				catch ( error )
				{
					throw error;
				}
			};


		//=====================================================================
		// DeleteMany
		//---------------------------------------------------------------------
		// Deletes a number of objects.
		// User must have write permissions.
		//=====================================================================


		user_storage.DeleteMany =
			async function DeleteMany( User, Criteria )
			{
				try
				{
					let criteria = _UserCriteria( User, Criteria );
					let operation_count = 0;
					let found_objects = await user_storage.Provider.FindMany( criteria );
					for ( let found_object_index = 0; found_object_index < found_objects.length; found_object_index++ )
					{
						let found_object = found_objects[ found_object_index ];
						if ( user_storage.UserCanWrite( User, found_object ) )
						{
							let count = await user_storage.Provider.DeleteOne( _UserCriteria( User, found_object ) );
							if ( !count ) { throw new Error( `There was an unexpected problem deleting the object.` ); }
							operation_count++;
						}
					}
					return operation_count;
				}
				catch ( error )
				{
					throw error;
				}
			};


		//=====================================================================
		// _SetOwner
		//---------------------------------------------------------------------
		// Sets the ownership of a number of objects.
		// User must be an admin, a super or be the owner of the object.
		//=====================================================================


		user_storage.SetOwner =
			async function SetOwner( User, OwnerID, Criteria )
			{
				try
				{
					let criteria = _UserCriteria( User, Criteria );
					let operation_count = 0;
					let found_objects = await user_storage.Provider.FindMany( criteria );
					for ( let found_object_index = 0; found_object_index < found_objects.length; found_object_index++ )
					{
						let found_object = found_objects[ found_object_index ];
						if ( user_storage.UserCanShare( User, found_object ) )
						{
							// Set the new owner.
							found_object[ UserStorageSettings.storage_info_member ].owner_id = OwnerID;
							found_object[ UserStorageSettings.storage_info_member ].updated_at = Server.Utility.zulu_timestamp();
							// Update the object.
							operation_count += await user_storage.Provider.WriteOne( found_object );
						}
					}
					return operation_count;
				}
				catch ( error )
				{
					throw error;
				}
			};


		//=====================================================================
		// SetSharing
		//---------------------------------------------------------------------
		// Sets the sharing permissions of a number of objects.
		// User must have sharing permissions.
		//=====================================================================


		user_storage.SetSharing =
			async function SetSharing( User, Criteria, Readers, Writers, MakePublic )
			{
				Readers = Readers || [];
				Writers = Writers || [];
				try
				{
					let criteria = _UserCriteria( User, Criteria );
					let operation_count = 0;
					let found_objects = await user_storage.Provider.FindMany( criteria );
					for ( let found_object_index = 0; found_object_index < found_objects.length; found_object_index++ )
					{
						let found_object = found_objects[ found_object_index ];
						if ( user_storage.UserCanShare( User, found_object ) )
						{
							// Update the object.
							found_object[ UserStorageSettings.storage_info_member ].readers = Readers;
							found_object[ UserStorageSettings.storage_info_member ].writers = Writers;
							found_object[ UserStorageSettings.storage_info_member ].public = !!MakePublic;

							// Write the object.
							found_object[ UserStorageSettings.storage_info_member ].updated_at = Server.Utility.zulu_timestamp();
							operation_count += await user_storage.Provider.WriteOne( found_object );
						}
					}
					return operation_count;
				}
				catch ( error )
				{
					throw error;
				}
			};


		//=====================================================================
		// Share
		//---------------------------------------------------------------------
		// Modifies the sharing permissions of a number of objects.
		// User must have sharing permissions.
		//=====================================================================


		user_storage.Share =
			async function Share( User, Criteria, Readers, Writers, MakePublic )
			{
				try
				{
					let criteria = _UserCriteria( User, Criteria );
					let operation_count = 0;
					let found_objects = await user_storage.Provider.FindMany( criteria );
					for ( let found_object_index = 0; found_object_index < found_objects.length; found_object_index++ )
					{
						let found_object = found_objects[ found_object_index ];
						if ( user_storage.UserCanShare( User, found_object ) )
						{
							// Update the object.
							let modified = false;
							if ( Server.Utility.has_value( Readers ) )
							{
								let readers = [];
								if ( typeof Readers === 'string' ) { readers.push( Readers ); }
								else if ( Array.isArray( Readers ) ) { readers = Readers; }
								else { throw new Error( `Invalid value for parameter [Readers], must be a string or array of strings.` ); }
								readers.forEach(
									element =>
									{
										if ( !found_object[ UserStorageSettings.storage_info_member ].readers.includes( element ) )
										{
											found_object[ UserStorageSettings.storage_info_member ].readers.push( element );
											modified = true;
										}
									} );
							}
							if ( Server.Utility.has_value( Writers ) )
							{
								let writers = [];
								if ( typeof Writers === 'string' ) { writers.push( Writers ); }
								else if ( Array.isArray( Writers ) ) { writers = Writers; }
								else { throw new Error( `Invalid value for parameter [Readers], must be a string or array of strings.` ); }
								writers.forEach(
									element =>
									{
										if ( !found_object[ UserStorageSettings.storage_info_member ].writers.includes( element ) )
										{
											found_object[ UserStorageSettings.storage_info_member ].writers.push( element );
											modified = true;
										}
									} );
							}
							if ( Server.Utility.has_value( MakePublic ) && MakePublic )
							{
								if ( !found_object[ UserStorageSettings.storage_info_member ].public )
								{
									found_object[ UserStorageSettings.storage_info_member ].public = true;
									modified = true;
								}
							}

							// Write the object.
							if ( modified )
							{
								found_object[ UserStorageSettings.storage_info_member ].updated_at = Server.Utility.zulu_timestamp();
								operation_count += await user_storage.Provider.WriteOne( found_object );
							}
						}
					}
					return operation_count;
				}
				catch ( error )
				{
					throw error;
				}
			};


		//=====================================================================
		// Unshare
		//---------------------------------------------------------------------
		// Modifies the sharing permissions of a number of objects.
		// User must have sharing permissions.
		//=====================================================================


		user_storage.Unshare =
			async function Unshare( User, Criteria, NotReaders, NotWriters, MakeNotPublic )
			{
				try
				{
					let criteria = _UserCriteria( User, Criteria );
					let operation_count = 0;
					let found_objects = await user_storage.Provider.FindMany( criteria );
					for ( let found_object_index = 0; found_object_index < found_objects.length; found_object_index++ )
					{
						let found_object = found_objects[ found_object_index ];
						if ( user_storage.UserCanShare( User, found_object ) )
						{
							// Update the object.
							let modified = false;
							if ( Server.Utility.has_value( NotReaders ) )
							{
								let not_readers = [];
								if ( typeof NotReaders === 'string' ) { not_readers.push( NotReaders ); }
								else if ( Array.isArray( Readers ) ) { not_readers = NotReaders; }
								else { throw new Error( `Invalid value for parameter [Readers], must be a string or array of strings.` ); }
								not_readers.forEach(
									element =>
									{
										let index = found_object[ UserStorageSettings.storage_info_member ].readers.indexOf( element );
										if ( index >= 0 )
										{
											found_object[ UserStorageSettings.storage_info_member ].readers.slice( index, 1 );
											modified = true;
										}
									} );
							}
							if ( Server.Utility.has_value( NotWriters ) )
							{
								let not_writers = [];
								if ( typeof NotWriters === 'string' ) { not_writers.push( NotWriters ); }
								else if ( Array.isArray( NotWriters ) ) { not_writers = NotWriters; }
								else { throw new Error( `Invalid value for parameter [Readers], must be a string or array of strings.` ); }
								not_writers.forEach(
									element =>
									{
										let index = found_object[ UserStorageSettings.storage_info_member ].writers.indexOf( element );
										if ( index >= 0 )
										{
											found_object[ UserStorageSettings.storage_info_member ].writers.slice( index, 1 );
											modified = true;
										}
									} );
							}
							if ( Server.Utility.has_value( MakeNotPublic ) && MakeNotPublic )
							{
								if ( found_object[ UserStorageSettings.storage_info_member ].public )
								{
									found_object[ UserStorageSettings.storage_info_member ].public = false;
									modified = true;
								}
							}

							// Write the object.
							if ( modified )
							{
								found_object[ UserStorageSettings.storage_info_member ].updated_at = Server.Utility.zulu_timestamp();
								operation_count += await user_storage.Provider.WriteOne( found_object );
							}
						}
					}
					return operation_count;
				}
				catch ( error )
				{
					throw error;
				}
			};


		//=====================================================================
		// Return Storage
		//=====================================================================


		return user_storage;


	};

