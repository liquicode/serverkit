'use strict';


app.controller(
	'Administration_Controller',
	function ( $scope, $http, $window, $location, $cookies )
	{


		//---------------------------------------------------------------------
		var Page = {
			User: window.SERVER_DATA.User,
			UserViews: window.SERVER_DATA.UserViews,

			diagnostics_text: 'Diagnostics Output',
			auto_refresh_timer: null,
			auto_refresh_interval: 3000,
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
							Page.diagnostics_text = JSON.stringify( response.result, null, '    ' );
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
				if ( Page.auto_refresh_timer )
				{
					clearInterval( Page.auto_refresh_timer );
					Page.auto_refresh_timer = null;
				}
				else
				{
					Page.auto_refresh_timer = window.setInterval( Page.RefreshDiagnostics, Page.auto_refresh_interval );
				}
				return;
			};


		//---------------------------------------------------------------------
		Page.AutoRefreshEnabled =
			function AutoRefreshEnabled()
			{
				return !!Page.auto_refresh_timer;
			};


		//---------------------------------------------------------------------
		// Exit Controller
		return;
	} );
