
# Testing Output

- Project: @liquicode/serverkit
- Version: v0.0.34
- Timestamp: 2022-11-03T10:57:23.575Z

~~~
010) json-criteria Tests
    √ Should perform a simple match
    √ Should perform a similar match
    √ Should perform a nested match
    √ Should perform an array match

  json-criteria Tests: Speed Matching
    √ Should match ten-thousand times

  json-criteria Tests: Not Matching
    √ Should not match 'undefined'
    √ Should not match 'null'
    √ Should not match empty object '{}'
    √ Should not match different values
    √ Should not match different objects

  100) Server Tests
    √ should load configuration

  101) ValidateFieldValues Tests
    √ should be initialized
    ConvertValues Tests
      √ should set nulls for missing fields that have no defaults
      √ should intialize missing fields with default values
      √ should intialize missing fields with default values when fields are required, but also generate validation errors
      √ should convert from string values
      √ should not convert from null values

  110) Utility Module Tests
    √ should replace all instances of a single character within a string
    √ should replace all instances of a multiple characters within a string
    √ should count all files within a single folder
    √ should recursively count all files within multiple folders

  120) Log Module Tests
    √ should be able to log a message

  130) TaskManager Tests
Hello World from the Test task.
    √ should be able to schedule a task
Hello World from the Test task.

  140) StorageService Tests
    √ Should create the test storage service

  141) Storage - MemoryProvider Tests
    MemoryProvider Tests (1000 Objects)
      √ Should create test objects
      √ Should read and write test objects
      √ Should find all test objects
      √ Should delete all test objects
    UserStorage on MemoryProvider Tests
      √ Should create test objects
      √ Should count all objects
      √ Should read and write test objects
      √ Should find all test objects
      √ Should delete all test objects
    UserStorage Sharing on MemoryProvider Tests
      √ Should create test objects
      √ Alice should read all documents and write all documents
      √ Bob should read some documents and write some documents
      √ Eve should read some documents and write some documents
      √ Public objects should be readable by everyone
      √ Public objects should only be writable by the owner
      √ Should not allow readers to update documents

  142) Storage - FileProvider Tests
    FileProvider Tests (100 Objects)
      √ Should create test objects
      √ Should read and write test objects
      √ Should find all test objects
      √ Should delete all test objects
    UserStorage on FileProvider Tests
      √ Should create test objects
      √ Should count all objects
      √ Should read and write test objects
      √ Should find all test objects
      √ Should delete all test objects
    UserStorage Sharing on FileProvider Tests
      √ Should create test objects
      √ Alice should read all documents and write all documents
      √ Bob should read some documents and write some documents
      √ Eve should read some documents and write some documents
      √ Public objects should be readable by everyone
      √ Public objects should only be writable by the owner
      √ Should not allow readers to update documents

  143) Storage - Sqlite3Provider Tests
    Sqlite3Provider Tests (100 Objects)
      √ Should create test objects
      √ Should read and write test objects
      √ Should find all test objects
      √ Should delete all test objects
    UserStorage on Sqlite3Provider Tests
      √ Should create test objects
      √ Should count all objects
      √ Should read and write test objects
      √ Should find all test objects
      √ Should delete all test objects
    UserStorage Sharing on Sqlite3Provider Tests
      √ Should create test objects
      √ Alice should read all documents and write all documents
      √ Bob should read some documents and write some documents
      √ Eve should read some documents and write some documents
      √ Public objects should be readable by everyone
      √ Public objects should only be writable by the owner
      √ Should not allow readers to update documents

  144) Storage - MongoProvider Tests
    MongoProvider Tests (10 Objects)
      √ Should create test objects
      √ Should read and write test objects
      √ Should find all test objects
      √ Should delete all test objects
    UserStorage on MongoProvider Tests
      √ Should create test objects
      √ Should count all objects
      √ Should read and write test objects
      √ Should find all test objects
      √ Should delete all test objects
    UserStorage Sharing on MongoProvider Tests
      √ Should create test objects
      √ Alice should read all documents and write all documents
      √ Bob should read some documents and write some documents
      √ Eve should read some documents and write some documents
      √ Public objects should be readable by everyone
      √ Public objects should only be writable by the owner
      √ Should not allow readers to update documents

  200) Services Tests
    √ should load services
    √ should have loaded the ServerManagement service
    √ should have loaded the ServerAccounts service
    √ should have loaded the Authentication service
    √ should have loaded the TestService service

  230) ServerAccounts Service Tests
    √ should perform storage functions
    √ should create admin-owned users
    √ should create self-owned users

  240) Authentication Service Tests
    √ should support Authentication flow

  300) TestService Tests
    √ should add two numbers
    √ should subtract two numbers
    √ should multiply two numbers
    √ should divide two numbers

  310) Text Transport Tests
    √ should have loaded
    ParseCommand Tests
      √ should parse key-value parameters, space ' ' separated
      √ should parse key-value parameters, equals '=' separated
      √ should parse key-value parameters, colon ':' separated
      √ should parse key-value parameters, mixed separators
      √ should parse positional parameters
      √ should parse json parameters
    Authentication Tests
      √ should Login as admin
      √ should have admin access
      √ should Logout as admin
    TestService Tests
      √ should Login as user
      √ should add two numbers
      √ should subtract two numbers
      √ should multiply two numbers
      √ should divide two numbers
      √ should not matter what order the parameters are in

  320) Web Transport Tests
    √ should have loaded
    Authentication Tests
      √ should not authenticate invalid credentials (bad username)
      √ should not authenticate invalid credentials (bad password)
      √ should authenticate valid credentials
    TestService Tests
      √ should login
      √ should add two numbers
      √ should subtract two numbers
      √ should multiply two numbers
      √ should divide two numbers
      √ should not matter what order the parameters are in

  330) WebSocket Transport Tests
    √ should have loaded
    Connectivity Tests
      √ should connect to socket server
    Authentication Tests
      √ should Login as admin
      √ should have admin access
      √ should Logout as admin
    TestService Tests
      √ should add two numbers
      √ should subtract two numbers
      √ should multiply two numbers
      √ should divide two numbers
      √ should not matter what order the parameters are in

  340) Amqp Transport Tests
    √ should have loaded
    Connectivity Tests
      √ should connect to socket server
    Authentication Tests
      √ should Login as admin
      √ should have admin access
      √ should Logout as admin
    TestService Tests
      √ should add two numbers
      √ should subtract two numbers
      √ should multiply two numbers
      √ should divide two numbers
      √ should not matter what order the parameters are in

  400) Command Line Tests
    √ should display the version
    √ should list the services
    √ should login
    √ should show admin as logged in
    √ should get Server Diagnostics
    √ should find all ServerAccounts
    √ should find all admin accounts - syntax 1
    √ should find all admin accounts - syntax 2


  155 passing (20s)
~~~
