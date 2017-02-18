var Para = Para || function( numOrArray ) {

	"use strict";

	this.array = null;

	if ( numOrArray instanceof Array || typeof( numOrArray ) === 'number' ) {

		this.array = new Float32Array( numOrArray );

	} else {

		// error

	}

	var gl = getGLContext( document.createElement( 'canvas' ) );

	var vertexShader = 
		'uniform float var'
		'attribute vec2 position;\n' +
		'attribute vec2 texture;\n' +
		'varying vec2 vIndex;\n' +
		'void main(void) {\n' +
		"}";

	function getGLContext( canvas ) {

		var gl = null;
		var attr = { alpha: false, antialias: false };

		var names = [ 'webgl', 'experimental-webgl', 'webkit-3d', 'moz-webgl' ];

		for ( var i = 0; i < names.length; i ++ ) {

			gl = canvas.getContext( names[ i ], attr );

			if ( gl ) break;
		}

		if ( !gl ) {
			// error
		}

		if ( !gl.getExtension( 'OES_texture_float' ) ) {
			// error
		}

		return gl;
	}

}

Para.prototype = {
	constructor: Para,

	add: function ( n ) {
		
	},

	sub: function ( n ) {
		
	},

	mul: function ( n ) {

	},

	div: function ( n ) {

	},

	sqrt: function ( n ) {

	}

	abs: function () {

	},

	neg: function () {

	}
}