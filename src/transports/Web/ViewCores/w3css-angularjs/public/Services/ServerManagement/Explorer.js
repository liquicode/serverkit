'use strict';


app.controller(
	'Explorer_Controller',
	function ( $scope )
	{


		//---------------------------------------------------------------------
		var Page = {
			// Server data.
			User: window.SERVER_DATA.User,
			Service: window.SERVER_DATA.Service,
			Origin: window.SERVER_DATA.Origin,
			Parameters: window.SERVER_DATA.Parameters,
			// Instance data.
			Socket: WebSocket,
			Invoke: {
				as_user: null,
				verb: '',
				service_name: '',
				origin_name: '',
				parameters: [],
				values: {},
				response: null,
			},
			Elements: {
				InvokeModal: document.getElementById( 'invoke-modal' ),
				InvokeResponse: document.getElementById( 'invoke-response' ),
			},
		};
		$scope.Page = Page;


		//---------------------------------------------------------------------
		let visbility_map = {};


		//---------------------------------------------------------------------
		Page.ToggleContentVisible =
			function ToggleContentVisible( content_id )
			{
				visbility_map[ content_id ] = !visbility_map[ content_id ];
				return;
			};


		//---------------------------------------------------------------------
		Page.IsContentVisible =
			function IsContentVisible( content_id )
			{
				return !!visbility_map[ content_id ];
			};


		//---------------------------------------------------------------------
		Page.ShowInvokeModal =
			function ShowInvokeModal( Verb, ServiceName, OriginName, OriginDescription, InvokeParameters )
			{
				// Initialize the Invoke object.
				Page.Invoke.as_user = Page.User.user_id;
				Page.Invoke.verb = Verb;
				Page.Invoke.service_name = ServiceName;
				Page.Invoke.origin_name = OriginName;
				Page.Invoke.origin_description = OriginDescription;
				Page.Invoke.parameters = InvokeParameters;
				// Initialize the Invoke values.
				Page.Invoke.values = {};
				for ( let index = 0; index < InvokeParameters.length; index++ )
				{
					let parameter = InvokeParameters[ index ];
					Page.Invoke.values[ parameter.name ] = null;
				}
				Page.Invoke.response = null;
				Page.SetInvokeResponse();
				// Show the Invoke modal.
				Page.Elements.InvokeModal.style.display = 'block';
				return;
			};


		//---------------------------------------------------------------------
		Page.HideInvokeModal =
			function HideInvokeModal()
			{
				Page.Elements.InvokeModal.style.display = 'none';
				return;
			};


		//---------------------------------------------------------------------
		window.onclick =
			function ( event )
			{
				if ( event.target === Page.Elements.InvokeModal )
				{
					// Close the modal if it is currently active and the user clicks on the background window.
					Page.Elements.InvokeModal.style.display = 'none';
				}
				return;
			};


		//---------------------------------------------------------------------
		function express_api_callback( Error, Response )
		{
			if ( Error )
			{
				Page.Invoke.response = Error;
			}
			else
			{
				Page.Invoke.response = Response;
			}
			Page.SetInvokeResponse();
			return;
		}


		//---------------------------------------------------------------------
		function socket_api_callback( Error, Response )
		{
			if ( Error )
			{
				Page.Invoke.response = Error;
			}
			else
			{
				Page.Invoke.response = Response;
			}
			Page.SetInvokeResponse();
			return;
		}


		//---------------------------------------------------------------------
		Page.SetInvokeResponse =
			function SetInvokeResponse()
			{
				let text = '';
				if ( Page.Invoke.response )
				{
					text = JSON.stringify( Page.Invoke.response, null, '    ' );
				}
				Page.Elements.InvokeResponse.innerHTML = text;
				if ( text.length <= ( 8 * 1024 ) )
				{
					w3CodeColor();
				}
				return;
			};


		//---------------------------------------------------------------------
		Page.InvokeFunction =
			function InvokeFunction()
			{

				// Get the parameter values.
				let values = [];
				for ( let index = 0; index < Page.Invoke.parameters.length; index++ )
				{
					let parameter = Page.Invoke.parameters[ index ];
					let value = Page.Invoke.values[ parameter.name ];
					if ( parameter.schema && parameter.schema.type )
					{
						if ( typeof value === 'string' )
						{
							if ( parameter.schema.type === 'array' )
							{
								if ( !value.trim().startsWith( '[' ) ) { value = null; }
							}
							if ( parameter.schema.type === 'object' )
							{
								if ( !value.trim().startsWith( '{' ) ) { value = null; }
							}
						}
					}
					values.push( value );
				}

				// Invoke the function.
				switch ( Page.Invoke.verb )
				{
					case 'Socket-Call':
						if ( !Page.Socket )
						{
							socket_api_callback( 'Login is required to perform socket calls.' );
							return;
						}
						Page.Socket[ Page.Invoke.service_name ][ Page.Invoke.origin_name ]( ...values, socket_api_callback );
						break;
					case 'Http-Get':
						WebOrigins[ Page.Invoke.service_name ][ 'http_get_' + Page.Invoke.origin_name ]( ...values, express_api_callback );
						break;
					case 'Http-Put':
						WebOrigins[ Page.Invoke.service_name ][ 'http_put_' + Page.Invoke.origin_name ]( ...values, express_api_callback );
						break;
					case 'Http-Post':
						WebOrigins[ Page.Invoke.service_name ][ 'http_post_' + Page.Invoke.origin_name ]( ...values, express_api_callback );
						break;
					case 'Http-Delete':
						WebOrigins[ Page.Invoke.service_name ][ 'http_delete_' + Page.Invoke.origin_name ]( ...values, express_api_callback );
						break;
					case 'Http-Visit':
						let url = WebViews[ Page.Invoke.service_name ][ 'http_get_' + Page.Invoke.origin_name ]( ...values );
						window.open( url );
						break;
				}

				return;
			};


		//---------------------------------------------------------------------
		// Exit Controller
		return;
	} );

