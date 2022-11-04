
# ServerKit Function Reference

---

## Core
**Core library objects and functions.**


### ServerKit
- **The ServerKit Library**

<details>
<summary>
ServerKit Functions
</summary>

| Category | Type | Function | Parameters | Summary |
|----------|------|----------|------------|---------|
| General | Sync | NewServer | ( ApplicationName, ApplicationPath, ServerOptions ) | Returns a new Server object. |
</details>


### Log
- **Logging functions.**

<details>
<summary>
Log Functions
</summary>

| Category | Type | Function | Parameters | Summary |
|----------|------|----------|------------|---------|
| Logging |  | debug | ( Message ) | Outputs a (d)ebug message. |
| Logging |  | trace | ( Message ) | Outputs a (t)race message. |
| Logging |  | info | ( Message ) | Outputs an (i)nformational message. |
| Logging |  | warn | ( Message ) | Outputs a (w)arning message. |
| Logging |  | error | ( Message ) | Outputs an (e)rror message. |
| Logging |  | fatal | ( Message ) | Outputs a (f)atal error message. |
</details>


### TaskManager
- **Manage scheduled tasks.**

<details>
<summary>
TaskManager Functions
</summary>

| Category | Type | Function | Parameters | Summary |
|----------|------|----------|------------|---------|
| Tasks | Sync | ScheduleTask | ( TaskName, TaskCron, InvokeFunction ) | Schedules or unschedules a task. |
| Tasks | Sync | StopAllTasks | ( ) | Unschedules and stops all tasks. |
</details>


### ApplicationService
- **A "base class" for developing application services.**

<details>
<summary>
ApplicationService Functions
</summary>

| Category | Type | Function | Parameters | Summary |
|----------|------|----------|------------|---------|
| Module Control | Sync | InitializeModule | ( ) | Perform any one-time initialization for the module. |
| Module Control | Sync | StartupModule | ( ) | Start the module. |
| Module Control | Sync | ShutdownModule | ( ) | Shut down the module. |
</details>


### StorageService
- **A "base class" for developing user storage services.**

<details>
<summary>
StorageService Functions
</summary>

| Category | Type | Function | Parameters | Summary |
|----------|------|----------|------------|---------|
| Module Control | Sync | InitializeModule | ( ) | Perform any one-time initialization for the module. |
| Module Control | Sync | StartupModule | ( ) | Start the module. |
| Module Control | Sync | ShutdownModule | ( ) | Shut down the module. |
| Storage Control | Sync | InitializeStorage | ( ) | Perform any one-time initialization for the storage. Must be called by InitializeModule. |
| Storage Control | Sync | StartupStorage | ( ) | Start the storage. Must be called by StartupModule. |
| Storage Control | Sync | ShutdownStorage | ( ) | Shut down the storage. Must be called by ShutdownModule. |
| Internal | Async | NewStorageItem | ( User, Prototype ) | Initializes a new data item based upon the service's Item definition. |
| Service Call | Async | StorageCount | ( User, Criteria ) | Returns the number of objects that match the Criteria. |
| Service Call | Async | StorageFindOne | ( User, Criteria ) | Returns the first object that matches the Criteria. |
| Service Call | Async | StorageFindMany | ( User, Criteria ) | Returns all objects that match the Criteria. |
| Service Call | Async | StorageCreateOne | ( User, Prototype ) | Create and store a new object for the User. |
| Service Call | Async | StorageWriteOne | ( User, Criteria, DataObject ) | Update an existing object that matches the Criteria. |
| Service Call | Async | StorageDeleteOne | ( User, Criteria ) | Deletes the first object that matches the Criteria. |
| Service Call | Async | StorageDeleteMany | ( User, Criteria ) | Deletes all objects that match the Criteria. |
| Service Call | Async | StorageShare | ( User, Criteria, Readers, Writers, MakePublic ) | Shares all objects that match the Criteria with other users. |
| Service Call | Async | StorageUnshare | ( User, Criteria, NotReaders, NotWriters, MakeNotPublic ) | Unshares all objects that match the Criteria with other users. |
| Service View | Async | List | ( User, Criteria ) | Returns an html page that lists all objects. |
| Service View | Async | Item | ( User, ItemID, PageOp ) | Returns an html page that can view, edit, delete, or add a single object. |
| Service View | Async | Share | ( User, ItemID ) | Returns an html page that can share and unshare a single object. |
</details>


### Server
- **An object representing an instance of a ServerKit server.**

<details>
<summary>
Server Functions
</summary>

| Category | Type | Function | Parameters | Summary |
|----------|------|----------|------------|---------|
| Server Control | Async | Initialize | ( ) | Initializes the Server, Services, and Transports. |
| Server Control | Async | Startup | ( ) | Starts the server. Starts Services and Transports. |
| Server Control | Async | Shutdown | ( ) | Shuts down the server. Also shuts down all Services and Transports. |
| Server Control | Sync | InstallAutoShutdown | ( ) | Intercept SIGHUP, SIGINT, SIGTERM and gracefully shut down when process exits. |
| Application | Sync | NewServerModule | ( Definition, Defaults ) | Creates a new blank ServerModule. |
| Application | Sync | NewApplicationService | ( Definition, Defaults ) | Creates a new blank ApplicationService. |
| Application | Sync | NewStorageService | ( Definition, Defaults ) | Creates a new blank StorageService. |
| Application | Sync | MakeSafeName | ( Name ) | Ensures that a name is safe for use with the server: _-~[a-z][A-Z][0-9] |
| Internal | Sync | ValidateModule | ( Module ) | Called for each service and transport during Server.Initialize(). |
| Service | Sync | ResolveApplicationPath | ( Path ) | Resolves and returns the given Path, relative to the Application Folder. |
| Service | Sync | NewOriginDefinition | ( Definition, OriginFunction ) | Create a new Origin definition. |
| Service | Sync | NewFieldDefinition | ( Definition ) | Create a new field definition to describe a Service Item or Origin Parameter. |
| Service | Async | VisitOrigins | ( Callback ) | Iterates through all origins in all services and calls Callback for each. |
| Service | Async | VisitViews | ( Callback ) | Iterates through all views in all services and calls Callback for each. |
| Service | Sync | VisitOriginsSync | ( Callback ) | Iterates through all origins in all services and calls Callback for each. |
| Service | Sync | VisitViewsSync | ( Callback ) | Iterates through all views in all services and calls Callback for each. |
| Transport | Sync | ValidateFieldValues | ( FieldDefinitions, FieldValues ) | Validate a set of values against a given definition. |
| Transport | Sync | AuthorizeOriginAccess | ( User, Origin ) | Tests if User has access to a specific Origin. |
| Transport | Sync | InvocationTracer | ( UserName, TransportName, RouteName, Parameters ) | Helper middleware to trace Origin invocations. |
</details>

---

## Services
**Internal services that ship with ServerKit.**


### ServerAccounts
- **Manages user accounts for the server.**

<details>
<summary>
ServerAccounts Functions
</summary>

| Category | Type | Function | Parameters | Summary |
|----------|------|----------|------------|---------|
| Internal | Async | FindOrCreateUser | ( UserInfo ) | Finds or creates a User in the accounts storage. |
| Internal | Async | NewStorageItem | ( User, Prototype ) | Initializes a new data item based upon the service's Item definition. |
| Service Call | Async | StorageCount | ( User, Criteria ) | Returns the number of objects that match the Criteria. |
| Service Call | Async | StorageFindOne | ( User, Criteria ) | Returns the first object that matches the Criteria. |
| Service Call | Async | StorageFindMany | ( User, Criteria ) | Returns all objects that match the Criteria. |
| Service Call | Async | StorageCreateOne | ( User, Prototype ) | Create and store a new object for the User. |
| Service Call | Async | StorageWriteOne | ( User, Criteria, DataObject ) | Update an existing object that matches the Criteria. |
| Service Call | Async | StorageDeleteOne | ( User, Criteria ) | Deletes the first object that matches the Criteria. |
| Service Call | Async | StorageDeleteMany | ( User, Criteria ) | Deletes all objects that match the Criteria. |
</details>


### Authentication
- **Manages user credentials and authenticates users for the server.**

<details>
<summary>
Authentication Functions
</summary>

| Category | Type | Function | Parameters | Summary |
|----------|------|----------|------------|---------|
| Internal | Async | ConnectSession | ( SessionToken ) | Allows transports to recover and reuse sessions. |
| Service Call | Async | Signup | ( User, UserEmail, Password, UserName ) | Creates a new server account for the user. |
| Service Call | Async | Login | ( User, UserEmail, Password ) | Logs a user in and creates a new session. |
| Service Call | Async | Logout | ( User, UserEmail ) | Logs a user out and destroys the session. |
</details>


### ServerManagement
- **Server management.**

<details>
<summary>
ServerManagement Functions
</summary>

| Category | Type | Function | Parameters | Summary |
|----------|------|----------|------------|---------|
| Service Call | Async | Diagnostics | ( User ) | Returns diagnostic information, including cpu and memory usage. |
| Service Call | Async | RestartServer | ( User ) | Restarts the server. |
| Service Call | Async | StopServer | ( User ) | Stops the server. |
| Service View | Async | Explorer | ( ) | A view to explore and invoke service origins. |
</details>

---

## Transports
****


### Text
- **A command line text transport.**

<details>
<summary>
Text Functions
</summary>

| Category | Type | Function | Parameters | Summary |
|----------|------|----------|------------|---------|
| Internal | Async | ParseCommandString | ( CommandString ) | Parses a string containing a command name and paramters. |
| Internal | Async | InvokeCommand | ( SessionToken, Command ) | Invokes an Origin with the command name and paramters. |
| Internal | Async | InvokeCommandString | ( SessionID, CommandString ) | Parses and invokes a string containing a command name and paramters. |
</details>


### Web
- **An http web transport.**

<details>
<summary>
Web Functions
</summary>

| Category | Type | Function | Parameters | Summary |
|----------|------|----------|------------|---------|
| Internal | Sync | ServerAddress | ( ) | Returns the server address (e.g. "http://localhost: 42") |
| Internal | Sync | ServerPath | ( ) | Returns the server's root path |
| Internal | Sync | ServicesPath | ( ) | Returns the custom path (including the server path) for service api calls. |
| Internal | Sync | PublicPath | ( ) | Returns the custom path (including the server path) for public files. |
| Internal | Sync | GetServerCookie | ( WebRequest ) | Returns the server cookie value from the request headers. |
| Internal | Sync | SetServerCookie | ( WebResponse, SessionToken ) | Sets the server cookie value in the response headers. |
| Internal | Sync | AuthenticationGate | ( Origin ) | Returns an Express middleware that validates the session. |
| Internal | Sync | AuthorizationGate | ( Origin ) | Returns an Express middleware that authorizes the user to access an origin. |
| Internal | Sync | InvocationGate | ( Origin, RouteName, Invocation ) | Returns an Express middleware that invokes an origin an returns the result. |
| Internal | Sync | GetUserViews | ( User, OnlyNoRequiredFields = true ) | Returns the Views that the user has access to. |
</details>


### WebSocket
- **A web socket transport.**

<details>
<summary>
WebSocket Functions
</summary>

| Category | Type | Function | Parameters | Summary |
|----------|------|----------|------------|---------|
| Internal | Sync | ServerAddress | ( ) | Returns the server address (e.g. "http://localhost: 42") |
| Internal | Sync | ServerPath | ( ) | Returns the server's root path |
| Internal | Async | NewWebSocketClient | ( SessionToken_or_UserEmail, Password ) | Creates a new client and establishes a session. |
</details>


### WebSocketClient
- **A client for invoking Origins using the WebSocket transport.**

<details>
<summary>
WebSocketClient Functions
</summary>

| Category | Type | Function | Parameters | Summary |
|----------|------|----------|------------|---------|
| Internal | Async | Call | ( RouteName, Parameters ) | Calls an origin on the server. |
| Internal | Async | Close | ( ) | Closes the client connection to the server. |
</details>


### Amqp
- **A message queue transport using the amqp protocol.**

<details>
<summary>
Amqp Functions
</summary>

| Category | Type | Function | Parameters | Summary |
|----------|------|----------|------------|---------|
| Internal | Async | NewAmqpClient | ( SessionToken_or_UserEmail, Password ) | Creates a new client and establishes a session. |
</details>


### AmqpClient
- **A client for invoking Origins using the Amqp transport.**

<details>
<summary>
AmqpClient Functions
</summary>

| Category | Type | Function | Parameters | Summary |
|----------|------|----------|------------|---------|
| Internal | Async | Call | ( RouteName, Parameters ) | Calls an origin on the server. |
| Internal | Async | Close | ( ) | Closes the client connection to the server. |
</details>
