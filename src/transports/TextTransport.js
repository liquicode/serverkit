'use strict';


const LIB_PATH = require( 'path' );

const SRC_SERVER_MODULE = require( LIB_PATH.resolve( __dirname, '..', 'core', 'ServerModule.js' ) );


//---------------------------------------------------------------------
exports.Construct =
	function Construct( Server )
	{

		// Create the transport.
		let transport = SRC_SERVER_MODULE.NewServerModule(
			Server, 'transport',
			{
				name: 'Text',
				title: "Text Transport",
				description: "Make service origins callable via a text string.",
				verbs: [ 'text-call' ],
			},
			{
				enabled: false,
			},
		);


		//=====================================================================
		//=====================================================================
		//
		//	Module Functions
		//
		//=====================================================================
		//=====================================================================


		/*
			Authentication.Signup --UserEmail "john@doe" --Password "My Secret" --UserName "John Doe"
			Authentication.Signup "john@doe" "My Secret" "John Doe"
			Authentication.Signup { UserEmail: "john@doe", Password: "My Secret", UserName: "John Doe" }
		*/

		//---------------------------------------------------------------------
		// Command is a string containing the command name and command parameters.
		// The command name must be in dot notation: <Service>.<Origin>
		// Parameters can be specified in one of three ways:
		// - Key-Value: Parameters are supplied as name-value pairs: --<Name> "<Value>"
		//		- Any number of spaces are permitted after the '--'.
		// 		- Names and values can be separated by a space ' ', equals sign '=', or colon ':'.
		//		- When separated by ' ', any number of spaces are permitted.
		//		- When separated by '=', the '=' must appear directly after the name, after which any number of spaces are permitted.
		//		- When separated by ':', the ':' must appear directly after the name, after which any number of spaces are permitted.
		//		- Examples: --Param1 "Value1", --Param1:"Value1", --Param1: "Value1", --Param1="Value1", --Param1= "Value1"
		// - Positional: Parameters are supplied in order: "<Value1>" "<Value2>" "<Value3>"
		// - JSON Object: Parameters are supplied as a json object: {name1:"value1",name2:"value2",name3:"value3"}
		// - JSON Array: Parameters are supplied as a json array: ["value1","value2","value3"]
		// Returns an object containing the service and origin name used to invoke and the parameters to invoke with.
		// The return value will list any parse warnings or errors in the errors array.
		// - Example: result = { Service: "MyService", Origin: "SomethingFun", Parameters: { param1: value1, param2: value2 }, errors: [] }
		async function ParseCommandString( CommandString )
		{
			let result = {
				service_name: '',
				origin_name: '',
				Fields: null,
				errors: [],
			};

			// Get the service name.
			result.service_name = Server.Liquicode.Text.FirstWord( CommandString, './\\ ' );
			CommandString = Server.Liquicode.Text.AfterFirstWord( CommandString, './\\ ' );

			// Get the origin name.
			result.origin_name = Server.Liquicode.Text.FirstWord( CommandString, ' ' );
			CommandString = Server.Liquicode.Text.AfterFirstWord( CommandString, ' ' );

			// Get the parameters.
			let parameters = null;
			CommandString = CommandString.trim();
			if ( CommandString.startsWith( '{' ) )
			{
				// Parse as json.
				parameters = Server.Liquicode.Object.FromJson( CommandString );
			}
			else if ( CommandString.startsWith( '[' ) )
			{
				// Parse as json.
				parameters = Server.Liquicode.Object.FromJson( CommandString );
			}
			else if ( CommandString.startsWith( '-' ) )
			{
				// Parse as key-value pairs.
				parameters = {};
				let parameter_list = CommandString.split( '--' );
				for ( let parameter_index = 0; parameter_index < parameter_list.length; parameter_index++ )
				{
					let parameter_string = parameter_list[ parameter_index ];
					if ( parameter_string )
					{
						let key = Server.Liquicode.Text.FirstWord( parameter_string, ' =:' );
						let value = Server.Liquicode.Text.AfterFirstWord( parameter_string, ' =:' );
						key = key.trim();
						value = value.trim();
						value = Server.Liquicode.Object.FromJson( value );
						parameters[ key ] = value;
					}
				}
			}
			else
			{
				// Parse as positional.
				parameters = [];
				let tokenize_options = {};
				tokenize_options.whitespace = ` \t\r\n`;
				tokenize_options.symbols = ``;
				tokenize_options.literal_delimiters = `'"`;
				tokenize_options.literal_escape_chars = `\\`;
				tokenize_options.self_escape_literal_delimiters = false;
				tokenize_options.keywords = [];
				tokenize_options.keywords_are_case_sensitive = false;
				tokenize_options.discard_whitespace = true;
				tokenize_options.resolve_literal_values = false;
				tokenize_options.resolve_numeric_values = false;
				let tokens = Server.Liquicode.Parse.Tokenize( CommandString, tokenize_options );

				// console.table( tokens );
				for ( let token_index = 0; token_index < tokens.length; token_index++ )
				{
					let token = tokens[ token_index ];
					token.token = JSON.parse( token.token );
					if ( typeof token.token === 'string' )
					{
						if ( token.token.startsWith( '[' ) || token.token.startsWith( '{' ) )
						{
							token.token = Server.Liquicode.Object.FromJson( token.token );
						}
					}
					parameters.push( token.token );
				}
			}
			result.Fields = parameters;

			// Return result.
			return result;
		};
		transport.ParseCommandString = ParseCommandString;


		//---------------------------------------------------------------------
		// Invokes a service origin as specified by Command.
		// - Command can be either the output from ParseCommandString or a string to be sent to ParseCommandString.
		async function InvokeCommand( SessionToken, Command )
		{
			// Parse command.
			if ( !Command ) { throw new Error( Server.Utility.invalid_parameter_value_message( 'Command', Command, 'Command must be a string or an object.' ) ); }
			if ( typeof Command === 'string' )
			{
				Command = await transport.ParseCommandString( Command );
			}
			if ( typeof Command !== 'object' ) { throw new Error( Server.Utility.invalid_parameter_value_message( 'Command', Command, 'Command must be a string or an object.' ) ); }
			if ( typeof Command.Fields !== 'object' ) { throw new Error( Server.Utility.invalid_parameter_value_message( 'Command.Fields', Command.Fields, 'Command.Fields must be an object or array.' ) ); }

			// Locate the origin.
			let service = Server.Services[ Command.service_name ];
			if ( service === undefined ) { throw new Error( `Unknown service [${Command.service_name}].` ); }
			let origin = service.Origins[ Command.origin_name ];
			if ( origin === undefined ) { throw new Error( `Unknown origin [${Command.origin_name}] for service [${Command.service_name}].` ); }

			// Validate the origin has the 'text-call' verb.
			if ( !origin.verbs.includes( 'text-call' ) && !origin.verbs.includes( '*' ) ) { throw new Error( `The origin [${Command.origin_name}] for service [${Command.service_name}] is not available for transport [Text].` ); }

			// Load the session.
			let user = await Server.Services.Authentication.ConnectSession( SessionToken );
			if ( !user ) { user = JSON.parse( JSON.stringify( Server.Settings.AnonymousUser ) ); }

			// Validate user authorization.
			if ( !Server.AuthorizeOriginAccess( user, origin ) )
			{
				throw new Error( `This user [${user.user_id}] does not have permission to perform this function.` );
			}

			// Validate the parameter values.
			let parameter_values = [];
			if ( Command.Fields )
			{
				let validation_result = Server.ValidateFieldValues( origin.Fields, Command.Fields );
				if ( validation_result.errors.length ) { throw new Error( `Validation errors: ${validation_result.errors.join( '; ' )}` ); }
				parameter_values = Object.values( validation_result.fields );
			}

			// Invoke the origin.
			let result = await origin.invoke( user, ...parameter_values );

			// Return result.
			return result;
		};
		transport.InvokeCommand = InvokeCommand;


		//---------------------------------------------------------------------
		// Invokes a service origin as specified by Command (the output from Parse).
		async function InvokeCommandString( SessionID, CommandString )
		{
			let parse_result = await ParseCommandString( CommandString );
			let invoke_result = await InvokeCommand( SessionID, parse_result );
			return invoke_result;
		}
		transport.InvokeCommandString = InvokeCommandString;


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


		transport.InitializeModule =
			async function InitializeModule()
			{
				// Return
				return;
			};


		//---------------------------------------------------------------------
		//---------------------------------------------------------------------
		//	Startup Module
		//	Server has been initialized and is now starting up.
		//---------------------------------------------------------------------
		//---------------------------------------------------------------------


		transport.StartupModule =
			async function StartupModule()
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


		transport.ShutdownModule =
			async function ShutdownModule()
			{
				// Return
				return;
			};


		//---------------------------------------------------------------------
		// Return the Transport.
		//---------------------------------------------------------------------


		return transport;
	};
