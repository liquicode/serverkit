'use strict';
/*global angular*/

var app = angular.module(
	'Application_Module',
	[
		// 'angular-loading-bar',
		// 'locationProvider',
		// 'ngCookies',
		// 'ngResource',
		// 'ngSanitize',
		// 'ngTouch',
	]
	// function ( $locationProvider )
	// {
	// 	$locationProvider.html5Mode(
	// 		{
	// 			enabled: true,
	// 			requireBase: false
	// 		} );
	// 	return;
	// },
);

// app.config(
// 	[
// 		'$locationProvider',
// 		function ( $locationProvider )
// 		{
// 			$locationProvider.html5Mode( { enabled: true, requireBase: false } );
// 		},
// 	]
// );


//---------------------------------------------------------------------
// app.constant( "moment", moment );
// app.constant( "WebApi", WebApi );
// app.constant( "WebPages", WebPages );


// //---------------------------------------------------------------------
// function clone_object( item )
// {
// 	return JSON.parse( JSON.stringify( item ) );
// }


// const APP_COOKIE_NAME = 'lib-server-kit';


// //---------------------------------------------------------------------
// const COOKIE =
// {
// 	//---------------------------------------------------------------------
// 	load:
// 		function ( $cookies, name )
// 		{
// 			let info = $cookies.getObject( `${APP_COOKIE_NAME}.${name}` );
// 			return info;
// 		},


// 	//---------------------------------------------------------------------
// 	save:
// 		function ( $cookies, name, info )
// 		{
// 			let time_now_ms = new Date().getTime();
// 			let default_time_expires = new Date();
// 			default_time_expires.setTime( time_now_ms + ( 100 * ( 24 * 60 * 60 ) * 1000 ) ); // 100 days
// 			$cookies.putObject( `${APP_COOKIE_NAME}.${name}`, info, { expires: default_time_expires } );
// 			return;
// 		},

// };

