'use strict';


const LIB_OS = require( 'os' );


//---------------------------------------------------------------------
exports.Construct =
	function Construct( Server )
	{

		// Create the storage service.
		let service = Server.NewApplicationService(
			{
				name: 'ServerManagement',
				title: "ServerManagement",
				description: "Server management.",
			},
			{
				enabled: true,
				Views:{
					explorer_view: 'explorer/explorer',
				},
			},
		);


		//---------------------------------------------------------------------
		//---------------------------------------------------------------------
		//	Origin Definitions
		//---------------------------------------------------------------------
		//---------------------------------------------------------------------


		//---------------------------------------------------------------------
		service.Origins.Diagnostics =
			Server.NewOriginDefinition( {
				name: 'Diagnostics',
				description: "Return a Diagnostics Package.",
				requires_login: true,
				allowed_roles: [ 'admin', 'super' ],
			},
				async function ( User )
				{ return service.Diagnostics( User ); },
			);


		//---------------------------------------------------------------------
		service.Origins.RestartServer =
			Server.NewOriginDefinition( {
				name: 'RestartServer',
				description: "Restarts the server.",
				requires_login: true,
				allowed_roles: [ 'admin', 'super' ],
			},
				async function ( User )
				{ return service.RestartServer( User ); },
			);


		//---------------------------------------------------------------------
		service.Origins.StopServer =
			Server.NewOriginDefinition( {
				name: 'StopServer',
				description: "Stops the server.",
				requires_login: true,
				allowed_roles: [ 'admin', 'super' ],
			},
				async function ( User )
				{ return service.StopServer( User ); },
			);


		//---------------------------------------------------------------------
		//---------------------------------------------------------------------
		//	View Definitions
		//---------------------------------------------------------------------
		//---------------------------------------------------------------------


		//---------------------------------------------------------------------
		let View_Explorer =
			Server.NewOriginDefinition( {
				name: 'Explorer',
				description: 'A ui to get information about services and to test their functions.',
				requires_login: true,
				view: 'explorer/explorer',
			} );


		//=====================================================================
		//=====================================================================
		//
		//	Service Functions
		//
		//=====================================================================
		//=====================================================================


		//---------------------------------------------------------------------
		// Diagnostics: Return a Diagnostics Package.
		//---------------------------------------------------------------------

		service.Diagnostics =
			async function Diagnostics( User )
			{
				let diagnostics = {
					timestamp: ( new Date() ).toISOString(),
					cpu_architecture: LIB_OS.arch(),
					cpu_count: LIB_OS.cpus().length,
					os_platform: LIB_OS.platform(),
					os_type: LIB_OS.type(),
					os_version: LIB_OS.version(),
					os_release: LIB_OS.release(),
					uptime_seconds: LIB_OS.uptime(),
					total_memory_bytes: LIB_OS.totalmem(),
					free_memory_bytes: LIB_OS.freemem(),
					free_memory_ratio: LIB_OS.freemem() / LIB_OS.totalmem(),
				};

				// Return the diagnostics.
				return diagnostics;
			};


		//---------------------------------------------------------------------
		// RestartServer: Restarts the server.
		//---------------------------------------------------------------------

		service.RestartServer =
			async function RestartServer( User )
			{
				Server.Log.info( `Server is being restarted by (${User.user_id}).` );
				await Server.Shutdown();
				await Server.Startup();
				return;
			};


		//---------------------------------------------------------------------
		// StopServer: Stops the server.
		//---------------------------------------------------------------------

		service.StopServer =
			async function StopServer( User )
			{
				Server.Log.info( `Server is being stopped by (${User.user_id}).` );
				await Server.Shutdown();
				return;
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
			function InitializeModule()
			{
				View_Explorer.view = service.Settings.Views.explorer_view;
				service.Views.Explorer = View_Explorer;
				// Return
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
				// Return
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
				// Return
				return;
			};


		//---------------------------------------------------------------------
		// Return the Service.
		//---------------------------------------------------------------------


		return service;
	};
