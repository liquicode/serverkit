'use strict';


app.controller(
	'Home_Controller',
	function ( $scope, $http, $window, $location, $cookies )
	{


		//---------------------------------------------------------------------
		var Page = {
			User: window.SERVER_DATA.User,
			// Socket: SocketApi.NewSocket(),
		};
		$scope.Page = Page;


		//---------------------------------------------------------------------
		// Exit Controller
		return;
	} );
