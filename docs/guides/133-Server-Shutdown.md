
About Server.Shutdown()
---------------------------------------------------------------------

`Server.Shutdown()` calls `transport.ShutdownModule()` for each transport and `service.ShutdownModule()` for each service.
After calling this function, the Server is stopped and none of the transports will be functional.

Shutdown can be called at any point within the lifcycle of the application.
If the application need to resume operation after a Shutdown, it can call `Server.Startup()` to get things running again.

You can also have a Server shut itself down automatically when the NodeJS process exits by calling `Server.InstallAutoShutdown()`.

