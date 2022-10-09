
# Services


Internal Services
---------------------------------------------------------------------

Server Kit defines three internal services:
- `ServerAccounts`: Stores user account information in a database.
- `Authentication`: Manages user authentication, credentials, and sessions.
- `ServerManagement`: Diagnostic functionality to aid in development.


Application Services
---------------------------------------------------------------------

Build your server functionality by developing application services that get loaded,
initialized, and started with the other services in your server.

An application service can use one of two "base classes" depending upon the needs of the service:
- `ApplicationService`: A service that exports functions and/or views through the server.
- `StorageService`: A type of `ApplicationService` that includes additional user-based storage features.

