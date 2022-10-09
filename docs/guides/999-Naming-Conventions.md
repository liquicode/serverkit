
# Naming Conventions

An effort has been made to adhere to the following naming conventions.


Names Should Be Descriptive
---------------------------------------------------------------------

All names are descriptive to the point of verbosity.
Abbreviations and acronyms are rarely used.
Don't be lazy, select clarity over brevity.
If a variable is given a "generic" name (such as `index`), then it is only within a limited scope
where its meaning and reference is clearly understood.


Names Should Denote Scope and Visibility
---------------------------------------------------------------------

Local variables and functions are named using the [snake_case](https://en.wikipedia.org/wiki/Snake_case) format.

If a variable or function is meant to have visibility outside of the scope within which it is defined,
then the [PascalCase](https://techterms.com/definition/pascalcase) format is used.

When defining complex objects, PascalCase is used for naming objects that serve as "containers" for other
objects and values, while snake_case is used for the primitive elements which actually store values.

Parameter names for function arguments are always in PascalCase.
The function itself may be PascalCase or snake_case, depending on its visibility within the scope.

Variable and function names may be preceeded by an underscore '_' character to denote a certain amount
of obfuscation to the name.
This may also done to avoid clashing with other names within the same scope.


Notes on File and Path Naming
---------------------------------------------------------------------

This project has a setting in the `.gitignore` file which tells git to ignore any file or folder that begins with the '~' character.
I.e. `~*`.

This project takes advantage of this in two ways:
- Hide files/folders containing secrets.
	Often, during development, the software will be tested against remote services that require authentication.
	Files containing secrets should not be backed up, archived, or stored in source control.
	Prefixing sensitive files with a '~' has the effect of grouping these files together and sorting them towards the top
	It also provides a visual cue to help avoid inadvertent duplication of sesitive files.
	Furthermore, you may see the use of double tilde '~~' prefixing of a file or folder name.
	The purpose of this is to further segregate files that contain secrets from files that are simply meant to be ignored in git.
- Exclude runtime generated files from source control.
	During development and testing, many files, databases, etc. are created for a temporary and specific purpose.
	Storing these types of files in an excluded '~' folder prevents them from needlessly clogging up the source control repository.


Thoughts on camelCase
---------------------------------------------------------------------

It has been fashionable in recent years to adopt the [camelCase](https://techterms.com/definition/camelcase) convention
for the naming of variables and functions.

The reasoning behind this convention is fairly clear.
There are often situations when you are working with data and performing multiple operations on that data.
For example, there are many operations you can perform on a row in a database.
Namely, you can create, read, update, and delete (CRUD) rows in a database.
The camelCase naming convention assumes a verb-object syntax and highlights the object portion by rendering it in
upper case while rendering the verb portion in lower case:
```javascript
createUsefulData( ... );	// Create a UsefulData row.
readUsefulData( ... );		// Read a UsefulData row.
updateUsefulData( ... );	// Update a UsefulData row.
deleteUsefulData( ... );	// Delete a UsefulData row.
```
Upon reading this code, the "object" portion of the name is supposed to stand out and emphasize what the name
is actually referring to. In this case, `UsefulData`.
I can respect that. It makes sense, it conveys meaning, ok cool I get it.

The problem is that this convention only applies to a certain number of cases where you:
1) Have a clear verb and object.
2) Have a large number of names with the same object yet differing verbs. (e.g. the CRUD example above)

If you apply camelCase to only these circumstances, then your code will have one convention for these situations (camelCase)
and another convention for all other cases.
This is typically more confusing than it is clarifying.

What I commonly find, in practice, is a misunderstanding of the original intent of this convention (which is clarity)
and the wholesale use of the convention in all situations.
While this does make the code more consistent, it also leads to non-sensical scenarios which do not contribute to clarity.
I often see names like:
```javascript
myFunction				// Not verb-object.
webServer				// Does this imply there are other types of Server objects?
clientInformation		// From Javascript, makes no sense.
screenX, screenY		// Javascript again.
userName, emailAddress	// Why?
```
When used like this, any clarity afforded by the convention is lost.
The worst case is when camelCase is mixed in with other conventions from a different time or a different developer.
In these cases, where there is no overall convention to rely upon, clarity is often replaced by confusion as developers
are either forced to remember which names employ which conventions or they have to look up the name each time for
its correct spelling.

As such, I have always avoided employing camelCase and instead select conventions which can be used universally
for the purpose of increasing the consistency and clarity of the code that I write.


