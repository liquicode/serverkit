
About Server.Startup()
---------------------------------------------------------------------

`Server.Startup()` calls `service.StartupModule()` for each service and `transport.StartupModule()` for each transport.
After calling this function, the Server is started and requests can be made over any of the running transports.


