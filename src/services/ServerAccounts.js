'use strict';


//---------------------------------------------------------------------
exports.Construct =
	function Construct( Server )
	{

		// Create the storage service.
		let service = Server.NewStorageService(
			{
				name: 'ServerAccounts',
				title: "Server Accounts",
				description: "Manages user accounts for this server.",
				//---------------------------------------------------------------------
				//	Storage Item
				//---------------------------------------------------------------------
				Item: {
					name: 'ServerAccount',
					title: "Server Account",
					titles: "Server Accounts",
					description: "A User Account for the Server",
					shareable: false,
					Fields: [
						Server.NewFieldDefinition( {
							name: 'user_id',
							title: "User Email",
							description: "Email address of the user.",
							type: 'string',
							format: 'email',
							example: 'username@server',
							readonly: true,
						} ),
						Server.NewFieldDefinition( {
							name: 'user_role',
							title: "User Role",
							description: "The role of this user on the server.",
							type: 'string',
							example: 'user',
							readonly: true,
						} ),
						Server.NewFieldDefinition( {
							name: 'user_name',
							title: "User Name",
							description: "Display name of the user.",
							type: 'string',
							example: 'John Doe',
						} ),
						Server.NewFieldDefinition( {
							name: 'image_url',
							title: "Image Url",
							description: "Url of the image associated with this acoount.",
							type: 'string',
							format: 'image_url',
							example: 'http://server-address/image.png',
						} ),
					],
				},
			},
			{
				first_created_is_admin: true,
			},
		);


		//---------------------------------------------------------------------
		//---------------------------------------------------------------------
		//	Origin Definitions
		//---------------------------------------------------------------------
		//---------------------------------------------------------------------


		// None.


		//---------------------------------------------------------------------
		//---------------------------------------------------------------------
		//	View Definitions
		//---------------------------------------------------------------------
		//---------------------------------------------------------------------


		// None.


		//=====================================================================
		//=====================================================================
		//
		//	Service Functions
		//
		//=====================================================================
		//=====================================================================


		//---------------------------------------------------------------------
		// FindOrCreateUser
		//---------------------------------------------------------------------

		service.FindOrCreateUser =
			async function FindOrCreateUser( UserInfo )
			{
				let api_response = {
					ok: true,
					error: '',
					result: null,
				};

				//---------------------------------------------------------------------
				// Validate inputs.
				try
				{
					if ( Server.Utility.value_missing_null_empty( service.UserStorage ) ) { throw new Error( `Service has not been initialized.` ); }
					if ( Server.Utility.value_missing_null_empty( UserInfo ) ) { throw new Error( `Missing Parameter: UserInfo` ); }
					if ( Server.Utility.value_missing_null_empty( UserInfo.user_id ) ) { throw new Error( `Missing Parameter: UserInfo.user_email` ); }
					if ( Server.Utility.value_missing_null_empty( UserInfo.user_role ) ) { throw new Error( `Missing Parameter: UserInfo.user_role` ); }
				}
				catch ( error )
				{
					api_response.ok = false;
					api_response.error = error.message;
					return api_response;
				}

				//---------------------------------------------------------------------
				// Create a user object that is owned by that user.
				async function create_user( ThisUserInfo )
				{
					let new_user = await service.UserStorage.CreateOne( service.StorageAdministrator(), ThisUserInfo );
					let info = service.UserStorage.GetStorageInfo( new_user );
					let count = await service.UserStorage.SetOwner( service.StorageAdministrator(), ThisUserInfo.user_id, info.id ); // Users own their accounts.
					if ( !count ) { Server.Log.warn( `Unable to set ownership of the new ServerAccount.` ); }
					new_user = await service.UserStorage.FindOne( ThisUserInfo, info.id );
					if ( !new_user ) { Server.Log.error( `Unable to retrieve the new ServerAccount.` ); }
					return new_user;
				}

				//---------------------------------------------------------------------
				let found_user = null;
				try
				{
					// Count all users of the system.
					let count = await service.UserStorage.Count( service.StorageAdministrator(), {} );
					if ( count === 0 && service.Settings.first_created_is_admin )
					{
						// Create the first user as the admin user.
						Server.Log.warn( `ServerAccounts is empty, creating first ServerAccount as the admin.` );
						UserInfo.user_role = 'admin';
						found_user = await create_user( UserInfo );
						Server.Log.debug( `Created a new admin ServerAccount: (${found_user.user_id})` );
					}
					else
					{
						// Find the user email amongst all users of the system.
						found_user = await service.UserStorage.FindOne( service.StorageAdministrator(), { user_id: UserInfo.user_id } );
						if ( found_user === null )
						{
							found_user = await create_user( UserInfo );
							Server.Log.debug( `Created a new ServerAccount: (${found_user.user_id})` );
						}
						else
						{
							// Server.Log.debug( `Found an existing ServerAccount: (${found_user.user_id})` );
						}
					}
				}
				catch ( error )
				{
					api_response.ok = false;
					api_response.error = error.message;
					return api_response;
				}

				//---------------------------------------------------------------------
				api_response.result = found_user;
				return api_response;
			};


		//=====================================================================
		//=====================================================================
		//
		//	Module Control
		//
		//=====================================================================
		//=====================================================================


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
				// Initialize the storage.
				service.InitializeStorage();

				// Add default users.
				if ( Server.Settings.DefaultUsers ) 
				{
					let count = await service.StorageCount( service.StorageAdministrator() );
					if ( count === 0 )
					{
						for ( let index = 0; index < Server.Settings.DefaultUsers.length; index++ )
						{
							let default_user = Server.Settings.DefaultUsers[ index ];
							let user = {
								user_id: default_user.user_id,
								user_name: default_user.user_name,
								user_role: default_user.user_role,
							};
							await service.FindOrCreateUser( user );
							Server.Log.debug( `Added user [${user.user_id}] to the credentials store.` );
						}
					}
				}

				// Restrict the permissions for the ServerAccounts service.
				// Admin and Super can perform functions for all accounts.
				// Users can only create, read, and write their own account.
				// Accounts are not shareable.
				service.Origins.StorageCount.allowed_roles = [ 'admin', 'super', 'user' ];
				service.Origins.StorageFindOne.allowed_roles = [ 'admin', 'super', 'user' ];
				service.Origins.StorageFindMany.allowed_roles = [ 'admin', 'super' ];
				service.Origins.StorageCreateOne.allowed_roles = [ 'admin', 'super' ];
				service.Origins.StorageWriteOne.allowed_roles = [ 'admin', 'super', 'user' ];
				service.Origins.StorageDeleteOne.allowed_roles = [ 'admin', 'super' ];
				service.Origins.StorageDeleteMany.allowed_roles = [ 'admin', 'super' ];

				// Disable sharing.
				service.Origins.StorageShare.allowed_roles = [];
				service.Origins.StorageShare.verbs = [];
				service.Origins.StorageUnshare.allowed_roles = [];
				service.Origins.StorageUnshare.verbs = [];

				// Limit listing to only admin and super.
				service.Views.List.allowed_roles = [ 'admin', 'super' ];

				// Use the default storage service pages.
				service.Views.List.title = 'Account List';
				service.Views.List.view = 'Services/StorageService/List';
				service.Views.Item.title = 'Account Item';
				service.Views.Item.view = 'Services/StorageService/Item';

				// Disable sharing.
				service.Views.Share.verbs = [];					// Do not expose the Share view

				// Return.
				return;
			};


		//---------------------------------------------------------------------
		//---------------------------------------------------------------------
		//	Startup Module
		//	Server has been initialized and is now starting up.
		//---------------------------------------------------------------------
		//---------------------------------------------------------------------


		service.StartupModule =
			function StartupModule()
			{
				// Startup the storage.
				service.StartupStorage();
				// Return.
				return;
			};


		//---------------------------------------------------------------------
		//---------------------------------------------------------------------
		//	Shutdown Module
		//	Server has been running and is now shutting down.
		//---------------------------------------------------------------------
		//---------------------------------------------------------------------


		service.ShutdownModule =
			function ShutdownModule()
			{
				// Shutdown the storage.
				service.ShutdownStorage();
				// Return.
				return;
			};


		//---------------------------------------------------------------------
		// Return the Service.
		//---------------------------------------------------------------------


		return service;
	};
