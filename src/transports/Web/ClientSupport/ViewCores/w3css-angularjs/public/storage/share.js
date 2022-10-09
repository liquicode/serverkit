'use strict';


app.controller(
	'StorageItemShare_Controller',
	function ( $scope, $http, $window, $location, $cookies )
	{


		//=====================================================================
		//=====================================================================
		// 
		// 		Page
		// 
		//=====================================================================
		//=====================================================================


		//---------------------------------------------------------------------
		var Page = {
			// Server data.
			User: window.SERVER_DATA.User,
			Service: window.SERVER_DATA.Service,
			Origin: window.SERVER_DATA.Origin,
			Parameters: window.SERVER_DATA.Parameters,
			// Instance data.
			// ItemID: '',
			object_info_visible: false,
			// Socket: SocketApi.NewSocket(),
			Item: null,
		};
		{
			// Parse Parameters
			Page.ItemID = Page.Parameters.ItemID;
		}
		$scope.Page = Page;


		//---------------------------------------------------------------------
		Page.ItemInfo =
			function ItemInfo()
			{
				if ( Page.Item === null ) { return ''; }
				return JSON.stringify( Page.Item.__, null, '    ' );
			};


		//---------------------------------------------------------------------
		Page.ReadItem =
			function ReadItem()
			{
				if ( WebOrigins && Page.ItemID )
				{
					let StorageFindOne = WebOrigins[ Page.Definition.name ].http_get_StorageFindOne;
					StorageFindOne( Page.ItemID,
						( Error, ApiResult ) =>
						{
							if ( Error )
							{
								console.error( Error );
								return;
							}
							if ( ApiResult.error )
							{
								alert( `Error during StorageFindOne: ${ApiResult.error}` );
								return;
							}
							if ( !ApiResult.result )
							{
								alert( `StorageFindOne did not return anything!` );
								return;
							}
							Page.Item = ApiResult.result;
							$scope.$apply();
						} );
				}
				else if ( Page.Socket && Page.ItemID )
				{
					Page.Socket[ Page.Definition.name ].FindOne( Page.ItemID,
						( api_result ) =>
						{
							if ( api_result.error )
							{
								alert( `Error during FindOne: ${api_result.error}` );
								return;
							}
							Page.Item = api_result.result;
							$scope.$apply();
						} );
				}
				else
				{
					Page.Item = {};
				}
				return;
			};


		//---------------------------------------------------------------------
		// Initialize Controller
		Page.ReadItem();


		//---------------------------------------------------------------------
		// Exit Controller
		return;
	} );

