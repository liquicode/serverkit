"use strict";


const LIB_FS = require( 'fs' );
const LIB_PATH = require( 'path' );
const LIB_CHILD_PROCESS = require( 'child_process' );

const Liquicode = require( '@liquicode/liquicodejs' );


exports.ShellText = ShellText;

exports.LogBlank = log_blank_line;
exports.LogHeading = log_heading;
exports.LogMuted = log_muted;
exports.LogError = log_error;

exports.Execute = execute;

exports.StringToSemver = string_to_semver;
exports.SemverToString = semver_to_string;

exports.Git_FinalizeAndMarkVersion = git_finalize_and_mark_version;
exports.Git_PrepareNewVersion = git_prepare_new_version;

exports.Npm_Publish = npm_publish;

exports.Aws_S3_Sync = aws_s3_sync;


//---------------------------------------------------------------------
const ShellBackcolor =
{
	Default: 49,
	Black: 40,
	Red: 41,
	Green: 42,
	Yellow: 43,
	Blue: 44,
	Magenta: 45,
	Cyan: 46,
	LightGray: 47,
	DarkGray: 100,
	LightRed: 101,
	LightGreen: 102,
	LightYellow: 103,
	LightBlue: 104,
	LightMagenta: 105,
	LightCyan: 106,
	White: 107,
};


//---------------------------------------------------------------------
const ShellForecolor =
{
	Default: 39,
	Black: 30,
	Red: 31,
	Green: 32,
	Yellow: 33,
	Blue: 34,
	Magenta: 35,
	Cyan: 36,
	LightGray: 37,
	DarkGray: 90,
	LightRed: 91,
	LightGreen: 92,
	LightYellow: 93,
	LightBlue: 94,
	LightMagenta: 95,
	LightCyan: 96,
	White: 97,
};


//---------------------------------------------------------------------
const ShellEffect =
{
	UnsetAll: 0,
	Bold: 1,
	Dim: 2,
	Underlined: 4,
	Blink: 5,
	Invert: 7,
	Hidden: 8,
	UnsetBold: 21,
	UnsetDim: 22,
	UnsetUnderlined: 24,
	UnsetBlink: 25,
	UnsetInvert: 27,
	UnsetHidden: 28,
};


//---------------------------------------------------------------------
exports.ShellBackcolor = ShellBackcolor;
exports.ShellForecolor = ShellForecolor;
exports.ShellEffect = ShellEffect;


//---------------------------------------------------------------------
function ShellText( Text, Backcolor, Forecolor, Effect )
{
	if ( !Backcolor && !Forecolor && !Effect ) { return Text; }
	let formatted = '\x1B[';
	if ( Backcolor ) { formatted += Backcolor + ';'; }
	if ( Forecolor ) { formatted += Forecolor + ';'; }
	if ( Effect ) { formatted += Effect + ';'; }
	formatted = formatted.substr( 0, formatted.length - 1 ) + 'm';
	formatted += Text;
	formatted += `\x1B[${ShellEffect.UnsetAll}m`;
	return formatted;
}


//---------------------------------------------------------------------
function log_blank_line()
{
	console.log();
	return;
}


//---------------------------------------------------------------------
function log_heading( Text )
{
	Text = ShellText( Text, null, ShellForecolor.White, ShellEffect.Bold );
	console.log( Text );
	return;
}


//---------------------------------------------------------------------
function log_muted( Text )
{
	Text = ShellText( Text, null, ShellForecolor.LightGray, ShellEffect.Dim );
	console.log( Text );
	return;
}


//---------------------------------------------------------------------
function log_error( Text )
{
	Text = ShellText( Text, null, ShellForecolor.Red, ShellEffect.Bold );
	console.log( Text );
	return;
}


//---------------------------------------------------------------------
function execute( Command, Environment = {}, ShowOutput = true )
{
	console.log( `---------------------------------------------------------------------` );
	console.log( `Executing: ${Command}` );
	console.log( `---------------------------------------------------------------------` );
	let output = LIB_CHILD_PROCESS.execSync( Command, {
		encoding: 'utf-8',
		env: Environment,
	} );
	// Report output.
	Command = ShellText( Command, null, ShellForecolor.White, ShellEffect.Bold );
	log_muted( '+-----------------------------------------' );
	log_heading( '| ' + Command );
	output = output.trim();
	if ( output && ShowOutput )
	{
		log_muted( `| output:` );
		console.log( output );
	}
	log_muted( '+-----------------------------------------' );
	return output;
}


//---------------------------------------------------------------------
function string_to_semver( Version )
{
	let semver = {
		major: 0,
		minor: 0,
		patch: 0,
		extra: '',
	};
	let parts = Version.split( '.' );
	if ( parts.length !== 3 ) { throw new Error( `Invalid semver [${Version}].` ); }
	semver.major = parseInt( parts[ 0 ] );
	semver.minor = parseInt( parts[ 1 ] );
	semver.patch = parseInt( Liquicode.Text.FirstWord( parts[ 2 ], '-' ) );
	semver.extra = Liquicode.Text.AfterFirstWord( parts[ 2 ], '-' );
	return semver;
}


//---------------------------------------------------------------------
function semver_to_string( Semver )
{
	let version = `${Semver.major}.${Semver.minor}.${Semver.patch}`;
	if ( Semver.extra ) { version += `-${Semver.extra}`; }
	return version;
}


//---------------------------------------------------------------------
function git_finalize_and_mark_version( Version )
{
	// - Do final staging: `git add .`
	log_blank_line();
	log_heading( 'Do final staging before version tag' );
	execute( `git add .` );

	// - Get project status
	log_blank_line();
	log_heading( 'Get project status' );
	let git_status = execute( `git status` );
	let working_tree_clean = git_status.includes( 'working tree clean' );

	// - Do final commit: `git commit -m "Finalization for vX.Y.Z"`
	if ( !working_tree_clean )
	{
		log_blank_line();
		log_heading( 'Do final commit before version tag' );
		execute( `git commit -m "Finalization for v${Version}"` );
	}

	// - Do final push: `git push origin main`
	log_blank_line();
	log_heading( 'Do final push before version tag' );
	execute( `git push origin main` );

	// - Create git version tag: `git tag -a vX.Y.Z -m "Version vX.Y.Z"`
	log_blank_line();
	log_heading( 'Create git version tag' );
	execute( `git tag -a v${Version} -m "Version ${Version}"` );

	// - Push git version tag: `git push origin vX.Y.Z`
	log_blank_line();
	log_heading( 'Push git version tag' );
	execute( `git push origin v${Version}` );

	return;
}


//---------------------------------------------------------------------
function git_prepare_new_version( Version )
{
	// - Do initial staging: `git add .`
	log_blank_line();
	log_heading( 'Do initial staging for new version' );
	execute( `git add .` );

	// - Do initial commit: `git commit -m "Initialization for vX.Y.Z"`
	log_blank_line();
	log_heading( 'Do initial commit for new version' );
	execute( `git commit -m "Initialization for v${Version}"` );

	// - Do final push: `git push origin main`
	log_blank_line();
	log_heading( 'Do final push for new version' );
	execute( `git push origin main` );

	return;
}


//---------------------------------------------------------------------
function npm_publish()
{
	log_blank_line();
	log_heading( 'Create new npm version' );
	execute( `npm publish . --access public` );
	return;

}


//---------------------------------------------------------------------
function aws_s3_sync( Folder, Bucket, Profile )
{
	log_blank_line();
	log_heading( 'Syncing S3 folder' );
	execute( `aws s3 sync ${Folder} s3://${Bucket}`, { AWS_PROFILE: Profile } );
	return;

}


