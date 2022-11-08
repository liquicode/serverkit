'use strict';


app.controller(
	'Home_Controller',
	function ( $scope )
	{


		//---------------------------------------------------------------------
		var Page = {
			User: window.SERVER_DATA.User,
			UserViews: window.SERVER_DATA.UserViews,
		};
		$scope.Page = Page;


		//---------------------------------------------------------------------
		// Exit Controller
		return;
	} );
