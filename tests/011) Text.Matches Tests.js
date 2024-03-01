"use strict";

const LIB_ASSERT = require( 'assert' );

const LIB_TEXT = require( '../src/modules/Utility/Text' );


//---------------------------------------------------------------------
describe( `011) Text.Matches Tests`, function ()
{

	//---------------------------------------------------------------------
	it( `should match an empty string and an empty pattern`, function ()
	{
		let matches = LIB_TEXT.Matches( '', '' );
		LIB_ASSERT.ok( matches );
		return;
	} );

	//---------------------------------------------------------------------
	it( `an empty pattern should not match anything except an empty string`, function ()
	{
		let pattern = '';
		LIB_ASSERT.ok( LIB_TEXT.Matches( '', pattern ) );
		LIB_ASSERT.ok( !LIB_TEXT.Matches( 'a', pattern ) );
		LIB_ASSERT.ok( !LIB_TEXT.Matches( 'abc', pattern ) );
		LIB_ASSERT.ok( !LIB_TEXT.Matches( '*', pattern ) );
		return;
	} );

	//---------------------------------------------------------------------
	it( `the pattern '*' should match any text including an empty string`, function ()
	{
		let pattern = '*';
		LIB_ASSERT.ok( LIB_TEXT.Matches( '', pattern ) );
		LIB_ASSERT.ok( LIB_TEXT.Matches( 'a', pattern ) );
		LIB_ASSERT.ok( LIB_TEXT.Matches( 'abc', pattern ) );
		LIB_ASSERT.ok( LIB_TEXT.Matches( '*', pattern ) );
		return;
	} );

	//---------------------------------------------------------------------
	it( `the pattern '?' should match a single character`, function ()
	{
		let pattern = '?';
		LIB_ASSERT.ok( !LIB_TEXT.Matches( '', pattern ) );
		LIB_ASSERT.ok( LIB_TEXT.Matches( 'a', pattern ) );
		LIB_ASSERT.ok( !LIB_TEXT.Matches( 'abc', pattern ) );
		LIB_ASSERT.ok( LIB_TEXT.Matches( '*', pattern ) );
		return;
	} );

	//---------------------------------------------------------------------
	it( `the pattern '??' should match exactly two characters`, function ()
	{
		let pattern = '??';
		LIB_ASSERT.ok( !LIB_TEXT.Matches( '', pattern ) );
		LIB_ASSERT.ok( !LIB_TEXT.Matches( 'a', pattern ) );
		LIB_ASSERT.ok( !LIB_TEXT.Matches( '123', pattern ) );
		LIB_ASSERT.ok( LIB_TEXT.Matches( 'ab', pattern ) );
		LIB_ASSERT.ok( LIB_TEXT.Matches( '12', pattern ) );
		LIB_ASSERT.ok( LIB_TEXT.Matches( '  ', pattern ) );
		return;
	} );

	//---------------------------------------------------------------------
	it( `the pattern '??*' should match at least two characters`, function ()
	{
		let pattern = '??*';
		LIB_ASSERT.ok( !LIB_TEXT.Matches( '', pattern ) );
		LIB_ASSERT.ok( !LIB_TEXT.Matches( '1', pattern ) );
		LIB_ASSERT.ok( LIB_TEXT.Matches( '12', pattern ) );
		LIB_ASSERT.ok( LIB_TEXT.Matches( '123', pattern ) );
		return;
	} );

	//---------------------------------------------------------------------
	it( `the pattern '?*?' should match at least two characters`, function ()
	{
		let pattern = '?*?';
		LIB_ASSERT.ok( !LIB_TEXT.Matches( '', pattern ) );
		LIB_ASSERT.ok( !LIB_TEXT.Matches( '1', pattern ) );
		LIB_ASSERT.ok( LIB_TEXT.Matches( '12', pattern ) );
		LIB_ASSERT.ok( LIB_TEXT.Matches( '123', pattern ) );
		return;
	} );

	//---------------------------------------------------------------------
	it( `the pattern '*??' should match at least two characters`, function ()
	{
		let pattern = '*??';
		LIB_ASSERT.ok( !LIB_TEXT.Matches( '', pattern ) );
		LIB_ASSERT.ok( !LIB_TEXT.Matches( '1', pattern ) );
		LIB_ASSERT.ok( LIB_TEXT.Matches( '12', pattern ) );
		LIB_ASSERT.ok( LIB_TEXT.Matches( '123', pattern ) );
		return;
	} );

	//---------------------------------------------------------------------
	it( `should match the pattern '1?3'`, function ()
	{
		let pattern = '1?3';
		LIB_ASSERT.ok( !LIB_TEXT.Matches( '', pattern ) );
		LIB_ASSERT.ok( !LIB_TEXT.Matches( '1', pattern ) );
		LIB_ASSERT.ok( !LIB_TEXT.Matches( '12', pattern ) );
		LIB_ASSERT.ok( LIB_TEXT.Matches( '123', pattern ) );
		LIB_ASSERT.ok( !LIB_TEXT.Matches( '1234', pattern ) );
		return;
	} );

	//---------------------------------------------------------------------
	it( `should match the pattern '1*3'`, function ()
	{
		let pattern = '1*3';
		LIB_ASSERT.ok( !LIB_TEXT.Matches( '', pattern ) );
		LIB_ASSERT.ok( !LIB_TEXT.Matches( '1', pattern ) );
		LIB_ASSERT.ok( !LIB_TEXT.Matches( '12', pattern ) );
		LIB_ASSERT.ok( LIB_TEXT.Matches( '123', pattern ) );
		LIB_ASSERT.ok( LIB_TEXT.Matches( '13', pattern ) );
		LIB_ASSERT.ok( !LIB_TEXT.Matches( '1234', pattern ) );
		return;
	} );

	//---------------------------------------------------------------------
	return;
} );
