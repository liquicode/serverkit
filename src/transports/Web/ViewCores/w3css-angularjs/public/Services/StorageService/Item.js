'use strict';


app.controller(
	'StorageItem_Controller',
	function ( $scope, $http, $window, $location, $cookies )
	{


		//---------------------------------------------------------------------
		var Page = {
			// Server data.
			User: window.SERVER_DATA.User,
			Service: window.SERVER_DATA.Service,
			Origin: window.SERVER_DATA.Origin,
			Parameters: window.SERVER_DATA.Parameters,
			// Instance data.
			object_info_visible: false,
			// Socket: SocketApi.NewSocket(),
			ItemID: null,
			PageOp: null,
			Item: null,
		};
		{
			// Parse Parameters
			Page.ItemID = Page.Parameters.ItemID;
			Page.PageOp = Page.Parameters.PageOp;
			if ( Page.PageOp === '' )
			{
				if ( Page.ItemID ) { Page.PageOp = 'Read'; }
				else { Page.PageOp = 'Create'; }
			}
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
		Page.IsFieldEditable =
			function IsFieldEditable( Field )
			{
				if ( Page.PageOp === 'Create' )
				{
					return true;
				}
				else if ( Page.PageOp === 'Read' ) 
				{
					return false;
				}
				else if ( Page.PageOp === 'Update' ) 
				{
					if ( Field.readonly ) { return false; }
					return true;
				}
				else if ( Page.PageOp === 'Delete' ) 
				{
					return false;
				}
				return false;
			};


		//---------------------------------------------------------------------
		Page.ItemSharingUrl =
			function ItemSharingUrl()
			{
				if ( Page.Item === null ) { return ''; }
				let url = `/${Page.Service.name}/Share?ItemID=${Page.ItemID}`;
				return url;
			};


		//---------------------------------------------------------------------
		Page.CreateItem =
			function CreateItem()
			{
				if ( WebOrigins )
				{
					let StorageCreateOne = WebOrigins[ Page.Service.name ].http_get_StorageCreateOne;
					StorageCreateOne( Page.Item,
						( Error, ApiResult ) =>
						{
							if ( Error )
							{
								console.error( Error );
								return;
							}
							if ( ApiResult.error )
							{
								alert( `Error during StorageCreateOne: ${ApiResult.error}` );
								return;
							}
							if ( !ApiResult.result )
							{
								alert( `StorageCreateOne did not return anything!` );
								return;
							}
							Page.Item = ApiResult.result;
							Page.ItemID = Page.Item.__.id;
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
		Page.ReadItem =
			function ReadItem()
			{
				if ( WebOrigins && Page.ItemID )
				{
					let StorageFindOne = WebOrigins[ Page.Service.name ].http_get_StorageFindOne;
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
					Page.Socket[ Page.Service.name ].FindOne( Page.ItemID,
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
		Page.WriteItem =
			function WriteItem()
			{
				if ( WebOrigins && Page.ItemID )
				{
					let StorageWriteOne = WebOrigins[ Page.Service.name ].http_get_StorageWriteOne;
					StorageWriteOne( Page.ItemID, Page.Item,
						( Error, ApiResult ) =>
						{
							if ( Error )
							{
								console.error( Error );
								return;
							}
							if ( ApiResult.error )
							{
								alert( `Error during StorageWriteOne: ${ApiResult.error}` );
								return;
							}
							if ( !ApiResult.result )
							{
								alert( `StorageWriteOne did not update anything!` );
								return;
							}
						} );
				}
				return;
			};


		//---------------------------------------------------------------------
		Page.DeleteItem =
			function DeleteItem()
			{
				if ( WebOrigins && Page.ItemID )
				{
					let StorageDeleteOne = WebOrigins[ Page.Service.name ].http_get_StorageDeleteOne;
					StorageDeleteOne( Page.ItemID,
						( Error, ApiResult ) =>
						{
							if ( Error )
							{
								console.error( Error );
								return;
							}
							if ( ApiResult.error )
							{
								alert( `Error during StorageDeleteOne: ${ApiResult.error}` );
								return;
							}
							if ( !ApiResult.result )
							{
								alert( `StorageDeleteOne did not delete anything!` );
								return;
							}
							Page.PageOp = 'Read';
							$scope.$apply();
						} );
				}
				return;
			};


		//---------------------------------------------------------------------
		// Initialize Controller
		if ( [ 'Create' ].includes( Page.PageOp ) )
		{
			Page.Item = {};
		}
		else if ( [ 'Read', 'Update', 'Delete' ].includes( Page.PageOp ) )
		{
			Page.ReadItem();
		}
		else
		{
			Page.Item = {};
		}


		//---------------------------------------------------------------------
		// Exit Controller
		return;
	} );

