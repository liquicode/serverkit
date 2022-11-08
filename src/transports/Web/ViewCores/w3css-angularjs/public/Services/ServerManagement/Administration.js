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
							$scope.$apply();
							w3CodeColor();
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
