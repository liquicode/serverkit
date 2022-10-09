'use strict';


const LIQUICODEJS = require( '@liquicode/liquicodejs' );


exports.NewServerModule =
	function NewServerModule( Server, ModuleType, Definition, Defaults )
	{
		Server = Server ? Server : null;
		Definition = Definition ? Definition : {};
		Defaults = Defaults ? Defaults : {};

		let server_module = {};

		// Module Definition
		server_module.Definition = LIQUICODEJS.Object.Merge(
			{
				name: 'UnamedModule',
			},
			Definition );

		// Configuration Management
		server_module.Defaults = Defaults;
		server_module.Settings = {};

		// Module Control
		server_module.InitializeModule = function () { return; };	// Server has loaded and configurations are set.
		server_module.StartupModule = function () { return; };		// Server has initialized and is starting up.
		server_module.ShutdownModule = function () { return; };	// Server has been running and is shutting down.

		// Connect the module to the server.
		if ( Server )
		{
			// if ( !Server.ServerKitVersion ) { throw new Error( `The parameter [Server] is invalid.` ); }

			// Validate the module name.
			server_module.Definition.name = Server.MakeSafeName( server_module.Definition.name );
			let module_name = server_module.Definition.name;

			// Register the module.
			switch ( ModuleType.toLowerCase() )
			{
				case 'module':
					if ( Server[ module_name ] ) { throw new Error( `Module name [${module_name}] already exists in [Server].` ); }
					if ( Server.Modules[ module_name ] ) { throw new Error( `Module name [${module_name}] already exists in [Server.Modules].` ); }
					// Mount the module.
					Server[ module_name ] = server_module;
					Server.Modules[ module_name ] = server_module;
					break;
				case 'service':
					if ( Server.Services[ module_name ] ) { throw new Error( `Service name [${module_name}] already exists in [Server.Services].` ); }
					// Mount the module.
					Server.Services[ module_name ] = server_module;
					// Backpointer to the server.
					// server_module.Server = Server;
					break;
				case 'transport':
					if ( Server.Transports[ module_name ] ) { throw new Error( `Transport name [${module_name}] already exists in [Server.Transports].` ); }
					// Mount the module.
					Server.Transports[ module_name ] = server_module;
					// Backpointer to the server.
					// server_module.Server = Server;
					break;
				default:
					throw new Error( `Unknown module type [${ModuleType}].` );
			}
		}

		// Return the module.
		return server_module;
	};
