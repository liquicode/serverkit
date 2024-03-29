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
				title: "Server Management",
				description: "Server management.",
			},
			{
				enabled: true,
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
		service.Origins.ListTasks =
			Server.NewOriginDefinition( {
				name: 'ListTasks',
				description: "Return a list of Scheduled Tasks.",
				requires_login: true,
				allowed_roles: [ 'admin', 'super' ],
			},
				async function ( User )
				{

					return service.ListTasks( User );
				},
			);


		//---------------------------------------------------------------------
		service.Origins.ReadConfiguration =
			Server.NewOriginDefinition( {
				name: 'ReadConfiguration',
				description: "Return the server's runtime configuration.",
				requires_login: true,
				allowed_roles: [ 'admin', 'super' ],
			},
				async function ( User )
				{ return service.ReadConfiguration( User ); },
			);


		//---------------------------------------------------------------------
		service.Origins.WriteConfiguration =
			Server.NewOriginDefinition( {
				name: 'WriteConfiguration',
				description: "Update the server's runtime configuration. (NOT IMPLEMENTED)",
				requires_login: true,
				allowed_roles: [ 'admin', 'super' ],
			},
				async function ( User, Configuration )
				{ return service.WriteConfiguration( User, Configuration ); },
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
		// NOTE:
		// The RestartServer and StopServer origins can get a little
		// squirrely when they are invoked via the Web transport. 
		// This is because browser based calls will tend to retry their
		// calls when the server becomes unresponsive.
		//---------------------------------------------------------------------


		//---------------------------------------------------------------------
		//---------------------------------------------------------------------
		//	View Definitions
		//---------------------------------------------------------------------
		//---------------------------------------------------------------------


		//---------------------------------------------------------------------
		service.Views.Administration =
			Server.NewOriginDefinition( {
				name: 'Administration',
				title: 'Administration',
				description: 'Display server health and controls.',
				requires_login: true,
				allowed_roles: [ 'admin' ],
			} );


		//---------------------------------------------------------------------
		service.Views.Explorer =
			Server.NewOriginDefinition( {
				name: 'Explorer',
				title: 'Server Explorer',
				description: 'Service info and function testing.',
				requires_login: true,
				allowed_roles: [ 'admin', 'super' ],
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
		// ListTasks: Lists the scheduled tasks.
		//---------------------------------------------------------------------

		service.ListTasks =
			async function ListTasks( User )
			{
				let tasks = [];
				for ( let task_key in Server.TaskManager.ScheduledTasks )
				{
					let task = Server.TaskManager.ScheduledTasks[ task_key ];
					tasks.push( {
						name: task.name,
						enabled: task.enabled,
						last_start: task.last_start,
						last_finish: task.last_finish,
						last_duration: task.last_duration,
						last_error: task.last_error,
						run_count: task.run_count,
					} );
				}
				return tasks;
			};


		//---------------------------------------------------------------------
		// ReadConfiguration: Return the server's runtime configuration.
		//---------------------------------------------------------------------

		service.ReadConfiguration =
			async function ReadConfiguration( User )
			{
				Server.Log.info( `Server configuration is being read by (${User.user_id}).` );
				// Return the runtime configuration.
				return Server.Settings;
			};


		//---------------------------------------------------------------------
		// WriteConfiguration: Return the server's runtime configuration.
		//---------------------------------------------------------------------

		service.WriteConfiguration =
			async function WriteConfiguration( User, Configuration )
			{
				Server.Log.info( `Server configuration is being updated by (${User.user_id}).` );
				// Update the runtime configuration.

				return true;
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
				// View_Explorer.view = service.Settings.Views.explorer_view;
				// service.Views.Explorer = View_Explorer;
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
