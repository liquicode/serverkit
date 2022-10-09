'use strict';


const LIB_PATH = require( 'path' );

const SRC_SERVER_MODULE = require( LIB_PATH.resolve( __dirname, '..', 'core', 'ServerModule.js' ) );

const LIB_LOGGER = require( '@liquicode/lib-logger' );

const MODULE_NOT_INITIALIZED_MESSAGE = `Module [Log] is not initialized. Call App.Initialize() first.`;


//---------------------------------------------------------------------
exports.Construct =
	function Construct_LogModule( Server )
	{
		let server_module = SRC_SERVER_MODULE.NewServerModule(
			Server, 'module',
			{
				name: 'Log',
			},
			{
				Console:
				{
					enabled: true,
					DeviceName: 'console',
					LogLevels: 'TDIWEF',
					OutputGroup: false,
					OutputDate: false,
					OutputTime: true,
					OutputMilliseconds: true,
					OutputTimezone: false,
					OutputSeverity: true,
					OutputSeverityWords: true,
				},
				Shell:
				{
					enabled: false,
					DeviceName: 'shell',
					LogLevels: 'TDIWEF',
					OutputGroup: false,
					OutputDate: false,
					OutputTime: true,
					OutputMilliseconds: true,
					OutputTimezone: false,
					OutputSeverity: true,
					OutputSeverityWords: true,
					Shell:
					{
						ColorizeEntireLine: true,
						TraceColors: { Forecolor: LIB_LOGGER.ShellForecolor.DarkGray, Effect: LIB_LOGGER.ShellEffect.Dim },
						DebugColors: { Forecolor: LIB_LOGGER.ShellForecolor.DarkGray, Effect: LIB_LOGGER.ShellEffect.Bold },
						InfoColors: { Forecolor: LIB_LOGGER.ShellForecolor.White, Effect: '' },
						WarnColors: { Forecolor: LIB_LOGGER.ShellForecolor.Yellow, Effect: '' },
						ErrorColors: { Forecolor: LIB_LOGGER.ShellForecolor.Red, Effect: '' },
						FatalColors: { Forecolor: LIB_LOGGER.ShellForecolor.Red, Effect: LIB_LOGGER.ShellEffect.Invert },
					},
				},
				File:
				{
					enabled: false,
					DeviceName: 'file',
					LogLevels: 'IWEF',
					OutputGroup: false,
					OutputDate: true,
					OutputTime: true,
					OutputMilliseconds: true,
					OutputTimezone: true,
					OutputSeverity: true,
					OutputSeverityWords: true,
					File:
					{
						log_path: '',
						log_filename: 'server',
						log_extension: 'log',
						use_hourly_logfiles: false,
						use_daily_logfiles: false,
					},
				},
			},
		);


		//---------------------------------------------------------------------
		// Maintain a global logger object.
		server_module.Logger = null;


		//---------------------------------------------------------------------
		// Aliases
		server_module.debug = () => { throw new Error( MODULE_NOT_INITIALIZED_MESSAGE ); };
		server_module.trace = () => { throw new Error( MODULE_NOT_INITIALIZED_MESSAGE ); };
		server_module.info = () => { throw new Error( MODULE_NOT_INITIALIZED_MESSAGE ); };
		server_module.warn = () => { throw new Error( MODULE_NOT_INITIALIZED_MESSAGE ); };
		server_module.error = () => { throw new Error( MODULE_NOT_INITIALIZED_MESSAGE ); };
		server_module.fatal = () => { throw new Error( MODULE_NOT_INITIALIZED_MESSAGE ); };


		//---------------------------------------------------------------------
		server_module.InitializeModule =
			function InitializeModule()
			{
				if ( !server_module.Settings ) { throw new Error( `Invalid configuration, the [Log] section is missing.` ); }

				// Construct a new logger.
				server_module.Logger = LIB_LOGGER.NewLogger( Server.Settings.AppInfo.name );

				// Add the log targets.
				if ( server_module.Settings.Console && server_module.Settings.Console.enabled )
				{
					let target = LIB_LOGGER.NewConsoleLogTarget( server_module.Settings.Console.LogLevels );
					target.Config = server_module.Settings.Console;
					server_module.Logger.AddLogTarget( target );
				}
				if ( server_module.Settings.Shell && server_module.Settings.Shell.enabled )
				{
					let target = LIB_LOGGER.NewShellLogTarget( server_module.Settings.Shell.LogLevels );
					target.Config = server_module.Settings.Shell;
					server_module.Logger.AddLogTarget( target );
				}
				if ( server_module.Settings.File && server_module.Settings.File.enabled )
				{
					let target = LIB_LOGGER.NewFileLogTarget( server_module.Settings.File.LogLevels );
					target.Config = server_module.Settings.File;
					server_module.Logger.AddLogTarget( target );
				}

				// Wire up the alias functions.
				// module.debug = module.Logger.debug;
				// module.trace = module.Logger.trace;
				// module.info = module.Logger.info;
				// module.warn = module.Logger.warn;
				// module.error = module.Logger.error;
				// module.fatal = module.Logger.fatal;

				server_module.debug = function ( Message ) { process.nextTick( function () { server_module.Logger.debug( Message ); } ); };
				server_module.trace = function ( Message ) { process.nextTick( function () { server_module.Logger.trace( Message ); } ); };
				server_module.info = function ( Message ) { process.nextTick( function () { server_module.Logger.info( Message ); } ); };
				server_module.warn = function ( Message ) { process.nextTick( function () { server_module.Logger.warn( Message ); } ); };
				server_module.error = function ( Message ) { process.nextTick( function () { server_module.Logger.error( Message ); } ); };
				server_module.fatal = function ( Message ) { process.nextTick( function () { server_module.Logger.fatal( Message ); } ); };


				// Return, ok.
				return { ok: true };
			};


		//---------------------------------------------------------------------
		return server_module;
	};
