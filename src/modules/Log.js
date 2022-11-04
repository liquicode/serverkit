'use strict';


const LIB_PATH = require( 'path' );

const SRC_SERVER_MODULE = require( LIB_PATH.resolve( __dirname, '..', 'core', 'ServerModule.js' ) );

const LIB_LOGGER = require( '@liquicode/lib-logger' );
const { json } = require( 'express' );

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
					LogLevels: 'TDIWEF',			// Can be one or more of: (T)race, (D)ebug, (I)nfo, (W)arning, (E)rror, and (F)atal.
					OutputGroup: false,				// Output the group name.
					OutputDate: false,				// Output a column for the date.
					OutputTime: true,				// Output a column for the time.
					OutputMilliseconds: true,		// Output a column for the milliseconds.
					OutputTimezone: false,			// Output the time zone.
					OutputSeverity: true,			// Output the message severity, one of: TDIWEF
					OutputSeverityWords: true,		// Use the full severity level name, rather than the first letter.
					ShellColorTheme: '',			// Color theme: 'ShellLight', 'ShellDark', or empty for no colors.
					DeferredOutput: false,			// Defers console output to the next tick when true.
				},
				ShellLight:
				{
					ColorizeEntireLine: true,
					TraceColors: { Forecolor: LIB_LOGGER.ShellForecolor.DarkGray, Effect: LIB_LOGGER.ShellEffect.Dim },
					DebugColors: { Forecolor: LIB_LOGGER.ShellForecolor.DarkGray, Effect: LIB_LOGGER.ShellEffect.Bold },
					InfoColors: { Forecolor: LIB_LOGGER.ShellForecolor.White, Effect: '' },
					WarnColors: { Forecolor: LIB_LOGGER.ShellForecolor.Yellow, Effect: '' },
					ErrorColors: { Forecolor: LIB_LOGGER.ShellForecolor.Red, Effect: '' },
					FatalColors: { Forecolor: LIB_LOGGER.ShellForecolor.Red, Effect: LIB_LOGGER.ShellEffect.Invert },
				},
				ShellDark:
				{
					ColorizeEntireLine: true,
					TraceColors: { Forecolor: LIB_LOGGER.ShellForecolor.DarkGray, Effect: '' },
					DebugColors: { Forecolor: LIB_LOGGER.ShellForecolor.LightGray, Effect: '' },
					InfoColors: { Forecolor: LIB_LOGGER.ShellForecolor.White, Effect: LIB_LOGGER.ShellEffect.Bold },
					WarnColors: { Forecolor: LIB_LOGGER.ShellForecolor.Yellow, Effect: '' },
					ErrorColors: { Forecolor: LIB_LOGGER.ShellForecolor.Red, Effect: '' },
					FatalColors: { Forecolor: LIB_LOGGER.ShellForecolor.Red, Effect: LIB_LOGGER.ShellEffect.Invert },
				},
				File:
				{
					enabled: false,
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
						log_path: '~server-data/log',
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
					let target = null;
					if ( !server_module.Settings.Console.ShellColorTheme )
					{
						// Console device.
						target = LIB_LOGGER.NewConsoleLogTarget( server_module.Settings.Console.LogLevels );
						target.Config = JSON.parse( JSON.stringify( server_module.Settings.Console ) );
						target.Config.DeviceName = 'console';
					}
					else
					{
						// Shell device.
						target = LIB_LOGGER.NewShellLogTarget( server_module.Settings.Console.LogLevels );
						target.Config = JSON.parse( JSON.stringify( server_module.Settings.Console ) );
						target.Config.DeviceName = 'shell';
						target.Config.Shell = server_module.Settings[ server_module.Settings.Console.ShellColorTheme ];
					}
					server_module.Logger.AddLogTarget( target );
				}
				// if ( server_module.Settings.Shell && server_module.Settings.Shell.enabled )
				// {
				// 	let target = LIB_LOGGER.NewShellLogTarget( server_module.Settings.Shell.LogLevels );
				// 	target.Config = server_module.Settings.Shell;
				// 	server_module.Logger.AddLogTarget( target );
				// }
				if ( server_module.Settings.File && server_module.Settings.File.enabled )
				{
					let target = LIB_LOGGER.NewFileLogTarget( server_module.Settings.File.LogLevels );
					target.Config = JSON.parse( JSON.stringify( server_module.Settings.File ) );
					target.Config.DeviceName = 'file';
					server_module.Logger.AddLogTarget( target );
				}

				// Wire up the alias functions.
				// module.debug = module.Logger.debug;
				// module.trace = module.Logger.trace;
				// module.info = module.Logger.info;
				// module.warn = module.Logger.warn;
				// module.error = module.Logger.error;
				// module.fatal = module.Logger.fatal;

				// if ( false )
				if ( server_module.Settings.Console.DeferredOutput )
				{
					server_module.debug = function ( Message ) { process.nextTick( function () { server_module.Logger.debug( Message ); } ); };
					server_module.trace = function ( Message ) { process.nextTick( function () { server_module.Logger.trace( Message ); } ); };
					server_module.info = function ( Message ) { process.nextTick( function () { server_module.Logger.info( Message ); } ); };
					server_module.warn = function ( Message ) { process.nextTick( function () { server_module.Logger.warn( Message ); } ); };
					server_module.error = function ( Message ) { process.nextTick( function () { server_module.Logger.error( Message ); } ); };
					server_module.fatal = function ( Message ) { process.nextTick( function () { server_module.Logger.fatal( Message ); } ); };
				}
				else
				{
					server_module.debug = function ( Message ) { server_module.Logger.debug( Message ); };
					server_module.trace = function ( Message ) { server_module.Logger.trace( Message ); };
					server_module.info = function ( Message ) { server_module.Logger.info( Message ); };
					server_module.warn = function ( Message ) { server_module.Logger.warn( Message ); };
					server_module.error = function ( Message ) { server_module.Logger.error( Message ); };
					server_module.fatal = function ( Message ) { server_module.Logger.fatal( Message ); };
				}


				// Return, ok.
				return { ok: true };
			};


		//---------------------------------------------------------------------
		return server_module;
	};
