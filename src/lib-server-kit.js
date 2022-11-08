'use strict';


//---------------------------------------------------------------------
const LIB_FS = require( 'fs' );
const LIB_PATH = require( 'path' );
const LIB_MERGE_CONFIG = require( 'merge-config' );

// const LIQUICODEJS = require( LIB_PATH.resolve( __dirname, '..', '..', 'liquicodejs.git', 'src', 'liquicode-node.js' ) );
const LIQUICODEJS = require( '@liquicode/liquicodejs' );


//---------------------------------------------------------------------
const SRC_SERVER_MODULE = require( LIB_PATH.join( __dirname, 'core', 'ServerModule.js' ) );
const SRC_APPLICATION_SERVICE = require( LIB_PATH.join( __dirname, 'core', 'ApplicationService.js' ) );
const SRC_STORAGE_SERVICE = require( LIB_PATH.join( __dirname, 'core', 'StorageService.js' ) );
const SRC_TASK_MANAGER = require( LIB_PATH.join( __dirname, 'core', 'TaskManager.js' ) );

const MODULES_PATH = LIB_PATH.join( __dirname, 'modules' );
const SRC_UTILTIY_MODULE = require( LIB_PATH.join( MODULES_PATH, 'Utility.js' ) );
const SRC_LOG_MODULE = require( LIB_PATH.join( MODULES_PATH, 'Log.js' ) );

const PACKAGE_VERSION = require( LIB_PATH.resolve( __dirname, '..', 'package.json' ) ).version;


//---------------------------------------------------------------------
function _make_safe_name( Name )
{
	return LIQUICODEJS.Text.ReplaceCharacters( Name, ` !@#$%^&*()+=[]{}<>,.:;?/\\'"\`|`, '_' );
}


//---------------------------------------------------------------------
exports.NewServer =
	function NewServer( ApplicationName, ApplicationPath, ServerOptions )
	{
		if ( !LIB_FS.existsSync( ApplicationPath ) ) { throw new Error( `The application path does not exist [${ApplicationPath}].` ); }
		ApplicationName = ApplicationName ? ApplicationName : 'unnamed';
		ApplicationName = _make_safe_name( ApplicationName );


		// Create a new module.
		let server = SRC_SERVER_MODULE.NewServerModule(
			null, '',
			{
				name: ApplicationName,
			},
			{
				// publish_path: '~publish',
				AppInfo: {
					name: ApplicationName,
					description: '',
					version: '',
					homepage: '',
					environment: 'development',
				},
				// Default starter accounts.
				DefaultUsers: [
					{ user_id: 'admin@server', password: 'password', user_role: 'admin', user_name: 'Administrator' },
					{ user_id: 'super@server', password: 'password', user_role: 'super', user_name: 'Supervisor' },
					{ user_id: 'user@server', password: 'password', user_role: 'user', user_name: 'User' }
				],
				AnonymousUser: { user_id: 'anon@server', user_role: 'anon', user_name: 'Anonymous' },
				Services: {},
				Transports: {},
				Modules: {},
			}
		);

		// Remove some unused module functions.
		delete server.InitializeModule;
		delete server.StartupModule;
		delete server.ShutdownModule;

		server.Modules = {};
		server.Services = {};
		server.Transports = {};

		server.version = PACKAGE_VERSION;
		server.Liquicode = LIQUICODEJS;


		//=====================================================================
		//=====================================================================
		//
		//	Internal Server Functions
		//
		//=====================================================================
		//=====================================================================


		{ // Internal Server Functions



			//---------------------------------------------------------------------
			// Expose some constructor functions.
			//---------------------------------------------------------------------

			server.NewServerModule =
				function NewServerModule( Definition, Defaults )
				{
					return SRC_SERVER_MODULE.NewServerModule( server, 'module', Definition, Defaults );
				};

			server.NewApplicationService =
				function NewApplicationService( Definition, Defaults )
				{
					return SRC_APPLICATION_SERVICE.NewApplicationService( server, Definition, Defaults );
				};

			server.NewStorageService =
				function NewStorageService( Definition, Defaults )
				{
					return SRC_STORAGE_SERVICE.NewStorageService( server, Definition, Defaults );
				};


			//---------------------------------------------------------------------
			// MakeSafeName
			//---------------------------------------------------------------------
			//	- Called for each name during load.
			//	- Ensures that a name is safe for use with the server.
			//	- Valid characters are: _-~[a-z][A-Z]
			//	- Where name is: server name, service name, transport name,
			//	  origin name, view name, item field name, parameter name.
			//---------------------------------------------------------------------

			server.MakeSafeName = _make_safe_name;


			//---------------------------------------------------------------------
			// ValidateModule
			//---------------------------------------------------------------------
			//	- Called for each service and transport during Server.Initialize().
			//	- Makes all names safe.
			//	- Throws errors on invalid module settings.
			//---------------------------------------------------------------------

			server.ValidateModule =
				function validate_module( Module )
				{
					let valid_data_types = [ 'boolean', 'integer', 'number', 'string', 'array', 'object' ];

					// Validate module definition.
					if ( !Module.Definition ) { throw new Error( `Module Definition is missing.` ); }

					// Validate module name.
					let module_name = Module.Definition.name;
					if ( !module_name ) { throw new Error( `Module name is missing.` ); }

					// Validation procedure for all fields and parameters.
					function validate_field( Field )
					{
						Field.name = _make_safe_name( Field.name );
						if ( !Field.name ) { throw new Error( `A field or parameter is missing a name, module [${module_name}].` ); }
						// Validate origin parameter type.
						if ( !Field.type ) { throw new Error( `A field or parameter is missing a type, module [${module_name}].` ); }
						Field.type = Field.type.toLowerCase();
						if ( !valid_data_types.includes( Field.type ) ) { Field.type = 'string'; }
						if ( Field.type === 'string' )
						{
							if ( !Field.format ) { Field.format = 'text'; }
						}
						return;
					}

					// Validation procedure for all origins.
					function validate_origin( OriginType, Origin )
					{
						// Validate origin name.
						Origin.name = _make_safe_name( Origin.name );
						let origin_name = Origin.name;
						if ( !origin_name ) { throw new Error( `${OriginType} name is missing, module [${module_name}].` ); }
						// Validate origin parameters.
						if ( !Origin.Fields ) { throw new Error( `${OriginType} ${origin_name} is missing Parameters, module [${module_name}].` ); }
						for ( let parameter_index = 0; parameter_index < Origin.Fields.length; parameter_index++ )
						{
							let parameter = Origin.Fields[ parameter_index ];
							validate_field( parameter );
						}
						return;
					}

					// Validate storage item.
					if ( Module.Definition.Item )
					{

						// Validate item name.
						Module.Definition.Item.name = _make_safe_name( Module.Definition.Item.name );
						let item_name = Module.Definition.Item.name;
						if ( !item_name ) { throw new Error( `Item name is missing in module [${module_name}].` ); }

						// Validate item fields.
						if ( !Module.Definition.Item.Fields ) { throw new Error( `Item.Fields is missing in [${module_name}].` ); }
						for ( let index = 0; index < Module.Definition.Item.Fields.length; index++ )
						{
							let field = Module.Definition.Item.Fields[ index ];
							validate_field( field );
						}
					}

					// Validate service origins.
					if ( Module.Origins )
					{
						let origin_keys = Object.keys( Module.Origins );
						for ( let origin_index = 0; origin_index < origin_keys.length; origin_index++ )
						{
							let origin = Module.Origins[ origin_keys[ origin_index ] ];
							validate_origin( 'Origin', origin );
						}
					}

					// Validate service view.
					if ( Module.Views )
					{
						let origin_keys = Object.keys( Module.Views );
						for ( let origin_index = 0; origin_index < origin_keys.length; origin_index++ )
						{
							let origin = Module.Views[ origin_keys[ origin_index ] ];
							validate_origin( 'View', origin );
						}
					}

					// Return.
					return;
				};


			//---------------------------------------------------------------------
			// ResolveApplicationPath
			//---------------------------------------------------------------------
			//	- Returns the full local file path for the given application path.
			//---------------------------------------------------------------------

			server.ResolveApplicationPath =
				function ResolveApplicationPath( Path )
				{
					return LIB_PATH.resolve( ApplicationPath, Path );
				};


			//---------------------------------------------------------------------
			// NewOriginDefinition
			//---------------------------------------------------------------------
			//	- Creates a new fieOriginld using values found in Prototype.
			//---------------------------------------------------------------------

			server.NewOriginDefinition =
				function NewOriginDefinition( Definition, OriginFunction )
				{
					let origin = {
						name: '',					// Origin name. Must be unique within the Service.
						description: '',			// Origin description.
						requires_login: false,		// Use true to disable anonymous access.
						allowed_roles: [ '*' ],		// The list of user roles allowed to call this Origin.
						verbs: [ '*' ],				// The transports this Origin will be bound to.
						Fields: [],					// The paramters for this Origin.
					};
					origin = LIQUICODEJS.Object.Merge( origin, Definition );
					if ( !origin.name ) { throw new Error( `Origin is missing a name.` ); }
					if ( !origin.description ) { origin.description = origin.name; }
					origin.invoke = OriginFunction;
					return origin;
				};


			//---------------------------------------------------------------------
			// NewFieldDefinition
			//---------------------------------------------------------------------
			//	- Creates a new field using values found in Prototype.
			//---------------------------------------------------------------------

			server.NewFieldDefinition =
				function NewFieldDefinition( Definition )
				{
					let field = {
						name: '',				// Field name.
						title: "",				// Field title is used in UI displays.
						description: "",		// Field description.
						type: '',				// One of: *, boolean, number, string, object, array
						format: '',				// A type-specific UI hint.
						example: null,			// Example values for this field.
						default: null,			// The default value of this field.
						required: false,		// True if this field requires a value.
						readonly: false,		// True if this field is read-only.
					};
					if ( Definition ) { field = LIQUICODEJS.Object.Clone( Definition ); }
					field = LIQUICODEJS.Object.Merge( field, Definition );
					if ( !field.name ) { throw new Error( `Field is missing a name.` ); }
					if ( !field.title ) { field.title = field.name; }
					if ( !field.description ) { field.description = field.name; }
					if ( !field.type ) { field.type = 'string'; }
					if ( ( field.type === 'string' ) && !field.format ) { field.format = 'text'; }
					return field;
				};


			//---------------------------------------------------------------------
			// VisitOrigins
			//---------------------------------------------------------------------
			//	- Iterates through all services and origins, calling a callback for each.
			//---------------------------------------------------------------------

			server.VisitOrigins =
				async function VisitOrigins( Callback )
				{
					let service_keys = Object.keys( server.Services );
					for ( let index = 0; index < service_keys.length; index++ )
					{
						let service_key = service_keys[ index ];
						let service = server.Services[ service_key ];
						// Callback
						let callback_result = await Callback( service, null );
						if ( callback_result !== undefined ) { return callback_result; }
						// Iterate Service Origins
						let origin_keys = Object.keys( service.Origins );
						for ( let origin_index = 0; origin_index < origin_keys.length; origin_index++ )
						{
							let origin_key = origin_keys[ origin_index ];
							let origin = service.Origins[ origin_key ];
							// Callback
							callback_result = await Callback( service, origin );
							if ( callback_result !== undefined ) { return callback_result; }
						}
					}
					return;
				};


			server.VisitOriginsSync =
				function VisitOriginsSync( Callback )
				{
					let service_keys = Object.keys( server.Services );
					for ( let index = 0; index < service_keys.length; index++ )
					{
						let service_key = service_keys[ index ];
						let service = server.Services[ service_key ];
						// Callback
						let callback_result = Callback( service, null );
						if ( callback_result !== undefined ) { return callback_result; }
						// Iterate Service Origins
						let origin_keys = Object.keys( service.Origins );
						for ( let origin_index = 0; origin_index < origin_keys.length; origin_index++ )
						{
							let origin_key = origin_keys[ origin_index ];
							let origin = service.Origins[ origin_key ];
							// Callback
							callback_result = Callback( service, origin );
							if ( callback_result !== undefined ) { return callback_result; }
						}
					}
					return;
				};


			//---------------------------------------------------------------------
			// VisitViews
			//---------------------------------------------------------------------
			//	- Iterates through all services and views, calling a callback for each.
			//---------------------------------------------------------------------

			server.VisitViews =
				async function VisitViews( Callback )
				{
					let service_keys = Object.keys( server.Services );
					for ( let index = 0; index < service_keys.length; index++ )
					{
						let service_key = service_keys[ index ];
						let service = server.Services[ service_key ];
						// Callback
						let callback_result = await Callback( service, null );
						if ( callback_result !== undefined ) { return callback_result; }
						// Iterate Service Origins
						let origin_keys = Object.keys( service.Views );
						for ( let origin_index = 0; origin_index < origin_keys.length; origin_index++ )
						{
							let origin_key = origin_keys[ origin_index ];
							let origin = service.Views[ origin_key ];
							// Callback
							callback_result = await Callback( service, origin );
							if ( callback_result !== undefined ) { return callback_result; }
						}
					}
					return;
				};


			server.VisitViewsSync =
				function VisitViewsSync( Callback )
				{
					let service_keys = Object.keys( server.Services );
					for ( let index = 0; index < service_keys.length; index++ )
					{
						let service_key = service_keys[ index ];
						let service = server.Services[ service_key ];
						// Callback
						let callback_result = Callback( service, null );
						if ( callback_result !== undefined ) { return callback_result; }
						// Iterate Service Origins
						let origin_keys = Object.keys( service.Views );
						for ( let origin_index = 0; origin_index < origin_keys.length; origin_index++ )
						{
							let origin_key = origin_keys[ origin_index ];
							let origin = service.Views[ origin_key ];
							// Callback
							callback_result = Callback( service, origin );
							if ( callback_result !== undefined ) { return callback_result; }
						}
					}
					return;
				};


			//---------------------------------------------------------------------
			// ValidateFieldValues
			//---------------------------------------------------------------------
			//	- Validates and (optionally) converts FieldValues based upon FieldDefinitions.
			//	- Returns a string of all validation errors encountered. When no errors exist, an empty string '' is returned.
			//	- FieldDefinitions: An Item.Fields or Origin.Fields array.
			//	- FieldValues: A parameters object or a value array.
			//		- If FieldValues is an object, it is expected to have the same schema as specified by FieldDefinitions.
			//		- If FieldValues is an array, it is expected to have values in the same order as they appear in FieldDefinitions.
			//	- CoerceValues: If true, update FieldValues with any coerced field values.
			//		- Coercion attempts to convert field values to the same type as in FieldDefinitions.
			//	- ThrowError: If true, throws an error if any validation errors encountered.
			//---------------------------------------------------------------------

			server.ValidateFieldValues =
				function ValidateFieldValues( FieldDefinitions, FieldValues )
				{
					let result = {
						errors: [],
						fields: {},
					};
					// let error_message = '';

					// Validate FieldValues.
					let FieldValues_type = '';
					if ( Array.isArray( FieldValues ) ) { FieldValues_type = 'array'; }
					else if ( FieldValues === null ) { /* Do nothing. */ }
					else if ( typeof FieldValues === 'object' ) { FieldValues_type = 'object'; }
					if ( !FieldValues_type ) { throw new Error( `FieldValues must be an object or an array.` ); }

					// Validate Fields.
					for ( let field_index = 0; field_index < FieldDefinitions.length; field_index++ )
					{
						let field = FieldDefinitions[ field_index ];
						let value = null;
						if ( FieldValues_type === 'array' )
						{
							if ( field_index < FieldValues.length )
							{
								value = FieldValues[ field_index ];
							}
						}
						else if ( FieldValues_type === 'object' )
						{
							value = FieldValues[ field.name ];
						}

						// Validate the parameter.
						if ( value === undefined )
						{
							if ( field.required )
							{
								// Always emit a validation error when missing a required field, even when the field has a default.
								// error_message += `[${field.name}] is required; `;
								result.errors.push( `[${field.name}] is required` );
							}
							if ( field.default !== undefined )
							{
								// Set the default value
								value = JSON.parse( JSON.stringify( field.default ) );
							}
							else
							{
								// Not required and no default, stay undefined.
								value = null;
							}
						}
						else if ( field.type )
						{
							try
							{
								if ( value === null )
								{
									// if ( field.default !== undefined )
									// {
									// 	value = JSON.parse( JSON.stringify( field.default ) );
									// }
								}
								else
								{
									// Coerce the value to match the field definition.
									switch ( field.type )
									{
										case 'boolean':
											value = Boolean( value );
											break;
										case 'integer':
											value = parseInt( value );
											break;
										case 'number':
											value = parseFloat( value );
											break;
										case 'string':
											value = '' + value;
											break;
										case 'array':
											if ( typeof value === 'string' )
											{
												if ( value.trim().startsWith( '[' ) )
												{
													value = JSON.parse( value );
												}
												else if ( value === 'null' )
												{
													value = null;
												}
												else if ( value === '' )
												{
													value = null;
												}
												else
												{
													value = [ value ];
												}
											}
											break;
										case 'object':
											if ( typeof value === 'string' )
											{
												if ( value.trim().startsWith( '{' ) )
												{
													value = JSON.parse( value );
												}
												else if ( value === 'null' )
												{
													value = null;
												}
												else if ( value === '' )
												{
													value = null;
												}
											}
											break;
										default:
											// error_message += `[${field.name}] has unknown type [${field.type}]; `;
											result.errors.push( `[${field.name}] has unknown type [${field.type}]` );
											break;
									}
								}
							}
							catch ( error )
							{
								// error_message += `[${field.name}] ${error.message}; `;
								result.errors.push( `[${field.name}] ${error.message}` );
							}
						}

						// Update the fields object with the validated value.
						result.fields[ field.name ] = value;

					}
					// if ( ThrowError && error_message ) { throw new Error( error_message ); }
					// return error_message;
					return result;
				};


			//---------------------------------------------------------------------
			// AuthorizeOriginAccess
			//---------------------------------------------------------------------
			//	- Authorizes user access to a Service Origin or View.
			//---------------------------------------------------------------------

			server.AuthorizeOriginAccess =
				function AuthorizeOriginAccess( User, Origin )
				{
					if ( !User ) { throw new Error( `User is required.` ); }
					if ( !Origin ) { throw new Error( `Origin is required.` ); }

					// Check for no login required.
					if ( !Origin.requires_login ) { return true; }

					// // Check for login required.
					// if ( Origin.requires_login ) 
					// {
					// 	if ( !User ) { return false; }
					// 	if ( !User.user_role ) { return false; }
					// 	if ( User.user_role === 'anon' ) { return false; }
					// }

					// Check for allowed roles.
					if ( !User.user_role ) { return false; }
					if ( !Origin.allowed_roles ) { return false; }
					if ( !Origin.allowed_roles.length ) { return false; }
					if ( Origin.allowed_roles.includes( '*' ) ) { return true; } // Any role allowed, Authorized!
					if ( !Origin.allowed_roles.includes( User.user_role ) ) { return false; }

					// Return, Authorization successful.
					return true; // Authorized!
				};


			//---------------------------------------------------------------------
			// LogOriginRequest
			//---------------------------------------------------------------------
			//	- Provides standard log messages accross transports.
			//---------------------------------------------------------------------

			server.InvocationTracer =
				function InvocationTracer( UserName, TransportName, RouteName, Parameters )
				{
					let tracer = {

						//---------------------------------------------------------------------
						user_name: UserName,
						transport_name: TransportName,
						route_name: RouteName,
						request_time: null,
						symbol_requesting: '-->>',
						symbol_responding: '<<--',


						//---------------------------------------------------------------------
						LogRequest:
							function LogRequest( Parameters )
							{
								this.request_time = Date.now();
								let parameters_text = '';
								if ( ( Parameters === undefined ) )
								{
									parameters_text = '(no parameter values)';
								}
								else if ( ( Parameters === null ) )
								{
									parameters_text = '(null)';
								}
								else
								{
									parameters_text = JSON.stringify( Parameters );
								}
								let message = '';
								message += `${this.transport_name} ${this.symbol_requesting} `;
								message += `${this.user_name} ${this.symbol_requesting} `;
								message += `${this.route_name} ${this.symbol_requesting} `;
								message += `${parameters_text}`;
								return message;
							},


						//---------------------------------------------------------------------
						LogResponse:
							function LogResponse( ResponseError, ResponseValue )
							{
								let duration_ms = ( Date.now() - this.request_time );

								let response_text = '';
								if ( ( ResponseValue === undefined ) )
								{
									response_text = '(no response value)';
								}
								else if ( ( ResponseValue === null ) )
								{
									response_text = '(null)';
								}
								else
								{
									response_text = JSON.stringify( ResponseValue );
								}
								let message = '';
								message += `${this.transport_name} ${this.symbol_responding} `;
								message += `${this.user_name} ${this.symbol_responding} `;
								message += `${this.route_name} ${this.symbol_responding} `;
								if ( ResponseError )
								{
									message += `*** ERROR: ${ResponseError} *** `;
								}
								else
								{
									message += `${response_text} `;
								}
								message += `(${duration_ms}ms)`;
								return message;
							},


					};
					return tracer;
				};


		} // Internal Server Functions


		//---------------------------------------------------------------------
		// Process Server Options
		//---------------------------------------------------------------------


		if ( !ServerOptions ) { ServerOptions = {}; }
		ServerOptions = LIQUICODEJS.Object.Merge( {
			defaults_filename: '',		// Writes server defaults to a file.
			settings_filename: '',		// Writes server settings to a file.
			config_path: '',			// Merges, alphabetically, all json/yaml files in path. Can be the filename of a single config file.
			services_path: '',			// Path to the application services folder. Can be the filename of a single service.
			Settings: null,				// Merge an explicit object with the configuration. This is applied last.
		}, ServerOptions );

		if ( ServerOptions.defaults_filename )
		{
			ServerOptions.defaults_filename = server.ResolveApplicationPath( ServerOptions.defaults_filename );
		}
		if ( ServerOptions.settings_filename )
		{
			ServerOptions.settings_filename = server.ResolveApplicationPath( ServerOptions.settings_filename );
		}
		if ( ServerOptions.config_path )
		{
			ServerOptions.config_path = server.ResolveApplicationPath( ServerOptions.config_path );
		}
		if ( ServerOptions.services_path )
		{
			ServerOptions.services_path = server.ResolveApplicationPath( ServerOptions.services_path );
		}
		else
		{
			if ( LIB_FS.existsSync( server.ResolveApplicationPath( 'services' ) ) )
			{
				ServerOptions.services_path = server.ResolveApplicationPath( 'services' );
			}
			else if ( LIB_FS.existsSync( server.ResolveApplicationPath( 'Services' ) ) )
			{
				ServerOptions.services_path = server.ResolveApplicationPath( 'Services' );
			}
			else
			{
				ServerOptions.services_path = server.ResolveApplicationPath( '' );
			}
		}


		//=====================================================================
		//=====================================================================
		//
		//	Server Modules
		//
		//=====================================================================
		//=====================================================================


		//---------------------------------------------------------------------
		// Load Module Helper
		//---------------------------------------------------------------------


		function load_module( ModuleType, Path, Filename )
		{
			let file_ext = LIB_PATH.extname( Filename );
			if ( file_ext !== '.js' ) { return; }
			// Load the module.
			let module_path = LIB_PATH.join( Path, Filename );
			let module_source = require( module_path );
			if ( module_source.Construct === undefined ) { return; } // Not a server module.
			let server_module = module_source.Construct( server );

			// // Validate the module name.
			// server_module.Definition.name = _make_safe_name( server_module.Definition.name );
			// let module_name = server_module.Definition.name;
			// if ( server[ ModuleType ][ module_name ] ) { throw new Error( `Module name [${module_name}] already exists in ${ModuleType}.` ); }
			// // Mount the module.
			// server[ ModuleType ][ module_name ] = server_module;

			// Register the module Defaults.
			server.Defaults[ ModuleType ][ server_module.Definition.name ] = server_module.Defaults;
			// Return.
			return;
		};


		//---------------------------------------------------------------------
		// Load Modules
		//---------------------------------------------------------------------


		// Load Server-Kit Modules
		{
			let server_kit_modules_path = LIB_PATH.join( __dirname, 'modules' );
			let filenames = LIB_FS.readdirSync( server_kit_modules_path );
			for ( let index = 0; index < filenames.length; index++ )
			{
				load_module( 'Modules', server_kit_modules_path, filenames[ index ] );
			}
		}


		//---------------------------------------------------------------------
		// Load Server Services
		//---------------------------------------------------------------------


		// Load Server-Kit Services
		{
			let server_kit_services_path = LIB_PATH.join( __dirname, 'services' );
			let filenames = LIB_FS.readdirSync( server_kit_services_path );
			for ( let index = 0; index < filenames.length; index++ )
			{
				load_module( 'Services', server_kit_services_path, filenames[ index ] );
			}
		}

		// Load Application Services
		{
			// let application_services_path = server.ResolveApplicationPath( 'services' );
			if ( ServerOptions.services_path )
			{
				// let path = server.ResolveApplicationPath( ServerOptions.services_path );
				if ( LIB_FS.existsSync( ServerOptions.services_path ) )
				{
					if ( LIB_FS.lstatSync( ServerOptions.services_path ).isDirectory() )
					{
						let filenames = LIB_FS.readdirSync( ServerOptions.services_path );
						for ( let index = 0; index < filenames.length; index++ )
						{
							load_module( 'Services', ServerOptions.services_path, filenames[ index ] );
						}
					}
					else
					{
						load_module( 'Services', LIB_PATH.dirname( ServerOptions.services_path ), LIB_PATH.basename( ServerOptions.services_path ) );
					}
				}
				else
				{
					console.error( `The application services path does not exist [${ServerOptions.services_path}].` );
				}
			}
		}


		//---------------------------------------------------------------------
		// Load Server Transports
		//---------------------------------------------------------------------


		// Load Server-Kit Transports
		{
			let path = LIB_PATH.join( __dirname, 'transports' );
			let filenames = LIB_FS.readdirSync( path );
			for ( let index = 0; index < filenames.length; index++ )
			{
				load_module( 'Transports', path, filenames[ index ] );
			}
		}


		//---------------------------------------------------------------------
		// Apply configuration modifications to finalize Server Settings.
		//---------------------------------------------------------------------


		// server.Config.ResetSettings();
		server.Settings = LIQUICODEJS.Object.Clone( server.Defaults );


		// Write the application's Defaults file.
		if ( ServerOptions.defaults_filename )
		{
			// server.Config.SaveDefaults( defaults_filename );
			let content = JSON.stringify( server.Defaults, null, '\t' );
			LIB_FS.mkdirSync( LIB_PATH.dirname( ServerOptions.defaults_filename ), { recursive: true } );
			LIB_FS.writeFileSync( ServerOptions.defaults_filename, content );
		}

		// Build the application's config.
		if ( ServerOptions.config_path )
		{
			if ( LIB_FS.existsSync( ServerOptions.config_path ) )
			{
				// server.Config.MergePath( path );
				let config = new LIB_MERGE_CONFIG();
				config.merge( server.Settings );
				config.file( ServerOptions.config_path );
				server.Settings = config.get();
			}
		}
		if ( ServerOptions.Settings )
		{
			// server.Config.MergeSettings( ServerOptions.Settings );
			let config = new LIB_MERGE_CONFIG();
			config.merge( server.Settings );
			config.merge( ServerOptions.Settings );
			server.Settings = config.get();
		}

		// Write the application's Settings file.
		if ( ServerOptions.settings_filename )
		{
			// server.Config.SaveSettings( settings_filename );
			let content = JSON.stringify( server.Settings, null, '\t' );
			LIB_FS.mkdirSync( LIB_PATH.dirname( ServerOptions.settings_filename ), { recursive: true } );
			LIB_FS.writeFileSync( ServerOptions.settings_filename, content );
		}


		//---------------------------------------------------------------------
		// Configure Server Modules
		//---------------------------------------------------------------------


		// Configure Modules
		{
			let module_keys = Object.keys( server.Modules );
			for ( let index = 0; index < module_keys.length; index++ )
			{
				let module_key = module_keys[ index ];
				let server_module = server.Modules[ module_key ];
				server_module.Settings = server.Settings.Modules[ module_key ];
				if ( server_module.Settings.enabled === undefined ) { server_module.Settings.enabled = true; }
			}
		}

		// Configure Services
		{
			let module_keys = Object.keys( server.Services );
			for ( let index = 0; index < module_keys.length; index++ )
			{
				let module_key = module_keys[ index ];
				let server_module = server.Services[ module_key ];
				server_module.Settings = server.Settings.Services[ module_key ];
				if ( server_module.Settings.enabled === undefined ) { server_module.Settings.enabled = true; }
			}
		}

		// Configure Transports
		{
			let module_keys = Object.keys( server.Transports );
			for ( let index = 0; index < module_keys.length; index++ )
			{
				let module_key = module_keys[ index ];
				let server_module = server.Transports[ module_key ];
				server_module.Settings = server.Settings.Transports[ module_key ];
				if ( server_module.Settings.enabled === undefined ) { server_module.Settings.enabled = false; }
			}
		}


		//=====================================================================
		//=====================================================================
		//
		//	Server Initialize
		//
		//=====================================================================
		//=====================================================================


		server.Initialize =
			async function Intialize()
			{

				// Initialize the Log Module.
				// server.Log.SetSettings( server.Settings.Log );
				// server.Log.Settings = server.Settings.Log;
				server.Log.InitializeModule();
				// server.Log.trace( `Server initialized module [Log].` );

				// Report config initialization.
				if ( ServerOptions.defaults_filename )
				{
					server.Log.trace( `Wrote configuration defaults to file [${ServerOptions.defaults_filename}].` );
				}
				if ( ServerOptions.settings_filename ) 
				{
					server.Log.trace( `Wrote configuration settings to file [${ServerOptions.settings_filename}].` );
					server.Log.warn( `WARNING!`
						+ ` The settings file [${LIB_PATH.basename( ServerOptions.settings_filename )}] contains all of your server's private settings and keys.`
						+ ` This file is generated to assist in documenting and debugging your server's configuration.`
						+ ` DO NOT include this file in backups or in source code repositories.` );
				}

				// Set the runtime environment.
				if ( server.Settings.AppInfo.environment )
				{
					process.env.NODE_ENV = server.Settings.AppInfo.environment;
					server.Log.debug( `Runtime environment set to: ${process.env.NODE_ENV}` );
				}

				// Initialize Task Manager
				{
					server.TaskManager = SRC_TASK_MANAGER.NewTaskManager( server );
				}

				// Initialize Modules
				{
					let module_keys = Object.keys( server.Modules );
					for ( let module_index = 0; module_index < module_keys.length; module_index++ )
					{
						let module_key = module_keys[ module_index ];
						let server_module = server.Modules[ module_key ];
						await server_module.InitializeModule();
						server.Log.trace( `Server initialized module [${module_key}].` );
					}
				}

				// Initialize Services
				{
					let module_keys = Object.keys( server.Services );
					for ( let module_index = 0; module_index < module_keys.length; module_index++ )
					{
						let module_key = module_keys[ module_index ];
						let server_module = server.Services[ module_key ];
						if ( server_module.Settings.enabled )
						{
							await server_module.InitializeModule();
							server.ValidateModule( server_module );
							// let origin_keys = Object.keys( server_module.Origins );
							// for ( let origin_index = 0; origin_index < origin_keys.length; origin_index++ )
							// {
							// }
							server.Log.trace( `Server initialized service [${module_key}].` );
						}
					}
				}

				// Initialize Transports
				let all_verbs = [];
				{
					let module_keys = Object.keys( server.Transports );
					for ( let module_index = 0; module_index < module_keys.length; module_index++ )
					{
						let module_key = module_keys[ module_index ];
						let server_module = server.Transports[ module_key ];
						if ( server_module.Settings.enabled )
						{
							await server_module.InitializeModule();
							server.ValidateModule( server_module );
							all_verbs.push( ...server_module.Definition.verbs );
							server.Log.trace( `Server initialized transport [${module_key}].` );
						}
					}
				}

				// // Expand role and verb wildcard for Origins.
				// let all_roles = [ 'admin', 'super', 'user' ];
				// await server.VisitOrigins(
				// 	function ( Service, Origin )
				// 	{
				// 		if ( Origin )
				// 		{
				// 			if ( ( Origin.allowed_roles.length === 1 ) && ( Origin.allowed_roles[ 0 ] === '*' ) )
				// 			{
				// 				Origin.allowed_roles = LIQUICODEJS.Object.Clone( all_roles );
				// 			}
				// 			if ( ( Origin.verbs.length === 1 ) && ( Origin.verbs[ 0 ] === '*' ) )
				// 			{
				// 				Origin.verbs = LIQUICODEJS.Object.Clone( all_verbs );
				// 			}
				// 		}
				// 	} );

				// server.Log.info( `Server is initialized.` );
				server.Log.info( `Server has initialized.` );
				return { ok: true };
			};


		//=====================================================================
		//=====================================================================
		//
		//	Server Startup
		//
		//=====================================================================
		//=====================================================================


		server.Startup =
			async function Startup()
			{

				// Startup Services
				{
					let module_keys = Object.keys( server.Services );
					for ( let index = 0; index < module_keys.length; index++ )
					{
						let module_key = module_keys[ index ];
						if ( server.Services[ module_key ].Settings.enabled )
						{
							server.Log.debug( `Server is starting service [${module_key}].` );
							await server.Services[ module_key ].StartupModule();
						}
					}
				}

				// Startup Transports
				{
					let module_keys = Object.keys( server.Transports );
					for ( let index = 0; index < module_keys.length; index++ )
					{
						let module_key = module_keys[ index ];
						if ( server.Transports[ module_key ].Settings.enabled )
						{
							server.Log.debug( `Server is starting transport [${module_key}].` );
							await server.Transports[ module_key ].StartupModule();
						}
					}
				}

				// Startup Task Manager
				{
					server.TaskManager.Startup();
				}

				server.Log.info( `Server is running.` );
				return;
			};


		//=====================================================================
		//=====================================================================
		//
		//	Server Shutdown
		//
		//=====================================================================
		//=====================================================================


		server.Shutdown =
			async function Shutdown()
			{
				// Shutdown Task Manager
				{
					server.TaskManager.Shutdown();
				}

				// Shutdown Transports
				{
					let module_keys = Object.keys( server.Transports );
					for ( let index = 0; index < module_keys.length; index++ )
					{
						let module_key = module_keys[ index ];
						if ( server.Transports[ module_key ].Settings.enabled )
						{
							server.Log.debug( `Server is stopping transport [${module_key}].` );
							await server.Transports[ module_key ].ShutdownModule();
						}
					}
				}

				// Shutdown Services
				{
					let module_keys = Object.keys( server.Services );
					for ( let index = 0; index < module_keys.length; index++ )
					{
						let module_key = module_keys[ index ];
						if ( server.Services[ module_key ].Settings.enabled )
						{
							server.Log.debug( `Server is stopping service [${module_key}].` );
							await server.Services[ module_key ].ShutdownModule();
						}
					}
				}

				server.Log.info( `Server has stopped.` );
				return;
			};


		//=====================================================================
		//=====================================================================
		//
		//	Install Auto Shutdown
		//
		//=====================================================================
		//=====================================================================


		server.InstallAutoShutdown =
			function InstallAutoShutdown()
			{
				//---------------------------------------------------------------------
				// Graceful Shutdown
				// NOTE: This will shutdown only the last server created.

				// process.on( 'exit',
				// 	async function ()
				// 	{
				// 		server.Log.info( `Server detected a termination signal, shutting down now.` );
				// 		await server.Shutdown();
				// 	} );
				// process.on( 'SIGHUP', () => process.exit( 128 + 1 ) );
				// process.on( 'SIGINT', () => process.exit( 128 + 2 ) );
				// process.on( 'SIGTERM', () => process.exit( 128 + 15 ) );

				async function graceful_shutdown( ExitCode )
				{
					server.Log.info( `Server detected a termination signal, shutting down now.` );
					await server.Shutdown();
					process.exit( ExitCode );
				}

				process.on( 'SIGHUP', () => graceful_shutdown( 128 + 1 ) );
				process.on( 'SIGINT', () => graceful_shutdown( 128 + 2 ) );
				process.on( 'SIGTERM', () => graceful_shutdownexit( 128 + 15 ) );
				return;
			};


		//---------------------------------------------------------------------
		// Return the Server.
		//---------------------------------------------------------------------


		return server;
	};
