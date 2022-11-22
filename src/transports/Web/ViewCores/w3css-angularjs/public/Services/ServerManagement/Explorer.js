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
		var visbility_map = {};


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
				for ( var index = 0; index < InvokeParameters.length; index++ )
				{
					var parameter = InvokeParameters[ index ];
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
				var text = '';
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
				var values_array = [];
				var values_map = {};
				for ( var index = 0; index < Page.Invoke.parameters.length; index++ )
				{
					var parameter = Page.Invoke.parameters[ index ];
					var value = Page.Invoke.values[ parameter.name ];
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
					values_array.push( value );
					values_map[ parameter.name ] = value;
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
						send_socket_message(
							Page.Invoke.service_name + '.' + Page.Invoke.origin_name,
							values_map,
							socket_api_callback );
						break;
					case 'Http-Get':
						send_web_message(
							'get',
							'/' + Page.Invoke.service_name + '/' + Page.Invoke.origin_name,
							values_map,
							express_api_callback );
						break;
					case 'Http-Put':
						send_web_message(
							'put',
							'/' + Page.Invoke.service_name + '/' + Page.Invoke.origin_name,
							values_map,
							express_api_callback );
						break;
					case 'Http-Post':
						send_web_message(
							'post',
							'/' + Page.Invoke.service_name + '/' + Page.Invoke.origin_name,
							values_map,
							express_api_callback );
						break;
					case 'Http-Delete':
						send_web_message(
							'delete',
							'/' + Page.Invoke.service_name + '/' + Page.Invoke.origin_name,
							values_map,
							express_api_callback );
						break;
					case 'Http-Visit':
						var url = make_page_url(
							'/' + Page.Invoke.service_name + '/' + Page.Invoke.origin_name,
							values_map );
						window.open( url );
						break;
				}

				return;
			};


		//---------------------------------------------------------------------
		// Exit Controller
		return;
	} );

