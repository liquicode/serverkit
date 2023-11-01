'use strict';


app.controller(
	'Administration_Controller',
	function ( $scope )
	{


		//---------------------------------------------------------------------
		var Page = {
			User: window.SERVER_DATA.User,
			UserViews: window.SERVER_DATA.UserViews,

			Diagnostics: {
				text: 'Diagnostics Output',
				auto_refresh_timer: null,
				auto_refresh_interval: 3000,
			},

			ConfigurationJson: '',

			Tasks: null,

		};
		$scope.Page = Page;


		//---------------------------------------------------------------------
		Page.RestartServer =
			function RestartServer()
			{
				WebSocket.ServerManagement.RestartServer();
				return;
			};


		//---------------------------------------------------------------------
		Page.StopServer =
			function StopServer()
			{
				WebSocket.ServerManagement.StopServer();
				return;
			};


		//---------------------------------------------------------------------
		Page.RefreshDiagnostics =
			function RefreshDiagnostics() 
			{
				WebSocket.ServerManagement.Diagnostics(
					function ( error, response )
					{
						if ( error ) { alert( error ); }
						else
						{
							Page.Diagnostics.text = JSON.stringify( response.result, null, '    ' );
							var element = document.getElementById( 'DiagnosticsJson' );
							element.innerHTML = w3CodeColorize( Page.Diagnostics.text, 'js' );
						}
					}
				);
			};


		//---------------------------------------------------------------------
		Page.ToggleAutoRefresh =
			function ToggleAutoRefresh()
			{
				if ( Page.Diagnostics.auto_refresh_timer )
				{
					clearInterval( Page.Diagnostics.auto_refresh_timer );
					Page.Diagnostics.auto_refresh_timer = null;
				}
				else
				{
					Page.Diagnostics.auto_refresh_timer = window.setInterval(
						Page.RefreshDiagnostics,
						Page.Diagnostics.auto_refresh_interval );
				}
				return;
			};


		//---------------------------------------------------------------------
		Page.AutoRefreshEnabled =
			function AutoRefreshEnabled()
			{
				return !!Page.Diagnostics.auto_refresh_timer;
			};


		//---------------------------------------------------------------------
		Page.ReadConfiguration =
			function ReadConfiguration()
			{
				WebSocket.ServerManagement.ReadConfiguration(
					function ( error, response )
					{
						if ( error ) { alert( error ); }
						else
						{
							Page.ConfigurationJson = JSON.stringify( response.result, null, '    ' );
							var element = document.getElementById( 'ConfigurationJson' );
							element.innerHTML = w3CodeColorize( Page.ConfigurationJson, 'js' );
				}
					}
				);
				return;
			};


		//---------------------------------------------------------------------
		Page.WriteConfiguration =
			function WriteConfiguration()
			{
				var configuration = JSON.parse( Page.ConfigurationJson );
				WebSocket.ServerManagement.WriteConfiguration(
					configuration,
					function ( error, response )
					{
						if ( error ) { alert( error ); }
						else
						{
							// Page.Diagnostics.text = JSON.stringify( response.result, null, '    ' );
							// $scope.$apply();
							// w3CodeColor();
						}
					}
				);
				return;
			};


		//---------------------------------------------------------------------
		// Initialize Controller

		WebSocket.ServerManagement.ListTasks(
			function ( error, response )
			{
				if ( error ) { alert( error ); }
				else
				{
					Page.Tasks = response.result;
					$scope.$apply();
				}
			}
		);


		//---------------------------------------------------------------------
		// Exit Controller
		return;
	} );
