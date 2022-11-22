'use strict';


app.controller(
	'StorageList_Controller',
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
			// Socket: ( ( SocketApi !== undefined ) ? SocketApi.NewSocket() : null ),
			Items: [],
		};
		{
			// Parse Parameters
			Page.Criteria = Page.Parameters.Criteria;
			if ( !Page.Criteria ) { Page.Criteria = {}; }
		}
		$scope.Page = Page;


		//---------------------------------------------------------------------
		Page.UserCanDo =
			function UserCanDo( FunctionName )
			{
				// var origin = Page.Origins[ FunctionName ];
				var origin = window.SERVER_DATA.ServiceOrigins[ FunctionName ];
				if ( origin )
				{
					if ( !origin.requires_login ) { return true; }
					if ( origin.allowed_roles.includes( Page.User.user_role ) ) { return true; }
				}
				return false;
			};


		//---------------------------------------------------------------------
		Page.ShowCreateButton =
			function ShowCreateButton()
			{
				return Page.UserCanDo( 'StorageCreateOne' );
			};


		//---------------------------------------------------------------------
		Page.ShowDeleteButton =
			function ShowDeleteButton()
			{
				return Page.UserCanDo( 'StorageDeleteOne' );
			};


		//---------------------------------------------------------------------
		Page.ListItems =
			function ListItems()
			{
				if ( WebOrigins )
				{
					var StorageFindMany = WebOrigins[ Page.Service.name ].http_get_StorageFindMany;
					StorageFindMany( Page.Criteria,
						function ( Error, ApiResult )
						{
							if ( Error )
							{
								console.error( Error );
								return;
							}
							Page.Items = ApiResult.result;
							$scope.$apply();
						} );
				}
				else
				{
					Page.Items = [];
				}

				return;
			};


		//---------------------------------------------------------------------
		Page.ItemCreateUrl =
			function ItemCreateUrl()
			{
				// return `/${Page.Service.name}/Item?PageOp=Create`;
				var url = WebViews[ Page.Service.name ].http_get_Item( '', 'Create' );
				return url;
			};


		//---------------------------------------------------------------------
		Page.ItemViewUrl =
			function ItemViewUrl( object )
			{
				// return `/${Page.Service.name}/Item?ItemID=${object.__.id}&PageOp=Read`;
				var url = WebViews[ Page.Service.name ].http_get_Item( object.__.id, 'Read' );
				return url;
			};


		//---------------------------------------------------------------------
		Page.ItemEditUrl =
			function ItemEditUrl( object )
			{
				// return `/${Page.Service.name}/Item?ItemID=${object.__.id}&PageOp=Update`;
				var url = WebViews[ Page.Service.name ].http_get_Item( object.__.id, 'Update' );
				return url;
			};


		//---------------------------------------------------------------------
		Page.ItemDeleteUrl =
			function ItemDeleteUrl( object )
			{
				// return `/${Page.Service.name}/Item?ItemID=${object.__.id}&PageOp=Delete`;
				var url = WebViews[ Page.Service.name ].http_get_Item( object.__.id, 'Delete' );
				return url;
			};


		//---------------------------------------------------------------------
		// Start Controller
		Page.ListItems();


		//---------------------------------------------------------------------
		// Exit Controller
		return;
	} );

