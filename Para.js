var Para = Para || function ( numOrArray ) {

    "use strict";

    this.array = null;

    var _length = 0;
    var _size = 0;

    if ( Array.isArray( numOrArray ) ) {

        _length = numOrArray.length;
        _size = Math.ceil( Math.sqrt( _length / 4 ) );

        this.array = new Float32Array( _size * _size * 4 );
        this.array.set( numOrArray );

    } else if ( typeof ( numOrArray ) === 'number' ) {

        _length = numOrArray;
        _size = Math.ceil( Math.sqrt( _length / 4 ) );

        this.array = new Float32Array( _size * _size * 4 );

    } else {

        throw new Error( 'parm error' );

    }

    var gl = getGLContext( document.createElement( 'canvas' ) );

    /*
      a * * * * * d
    	* *     *
    	*   *   *
    	*     * *
      b * * * * * c
     */
    var position = new Float32Array( [ -1, -1, 1, -1, -1, 1, 1, 1 ] );
    var uv = new Float32Array( [ 0, 0, 1, 0, 0, 1, 1, 1 ] );
    var index = new Uint16Array( [ 0, 1, 2, 2, 1, 3 ] ); // bca acd

    var positionBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, positionBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, position, gl.STATIC_DRAW );

    var uvBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, uvBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, uv, gl.STATIC_DRAW );

    var indexBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ELEMENT_ARRAY_BUFFER, indexBuffer );
    gl.bufferData( gl.ELEMENT_ARRAY_BUFFER, index, gl.STATIC_DRAW );

    var dataTexture = createDataTexture( this.array );
    var resultTexture = createDataTexture( new Float32Array( this.array.length ) );

    // gl.viewport( 0, 0, size, size );
    // gl.bindFramebuffer( gl.FRAMEBUFFER, gl.createFramebuffer() );
    // gl.framebufferTexture2D( gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, resultTexture, 0 );


    this.vsCode =
        'attribute vec2 a_position;\n' +
        'attribute vec2 a_uv;\n' +
        'varying vec2 v_uv;\n' +
        'void main( void ) {\n' +
        '	v_uv = a_uv;\n' +
        '	gl_Position = vec4( a_position.xy, 0.0, 1.0 );\n' +
        "}\n";

    var fragmentShaderCodeHead =
        'precision mediump float;\n' +
        'uniform sampler2D u_texture;\n' +
        'varying vec2 v_uv;\n' +
        'void main( void ) {\n' +
        '	vec4 value = texture2D( u_texture, v_uv );\n';

    var fragmentShaderCodeTail =
        '	gl_FragColor = value;\n' +
        '}\n';


    this.fsCode = fragmentShaderCodeHead;


    this._update = function () {

        var program = gl.createProgram();

        var fragmentShader = gl.createShader( gl.FRAGMENT_SHADER );

        gl.shaderSource( fragmentShader, this.fsCode );
        gl.compileShader( fragmentShader );

        var vertexShader = gl.createShader( gl.VERTEX_SHADER );

        gl.shaderSource( vertexShader, this.vsCode );
        gl.compileShader( vertexShader );

        console.log( this.fsCode )

        if ( !gl.getShaderParameter( fragmentShader, gl.COMPILE_STATUS ) ) {
            var LOC = this.fsCode.split( '\n' );
            var dbgMsg = "ERROR: Could not build shader (fatal).\n\n------------------ KERNEL CODE DUMP ------------------\n"

            // for (var nl = 0; nl < LOC.length; nl++)
            // 	dbgMsg += (stdlib.split('\n').length + nl) + "> " + LOC[nl] + "\n";

            dbgMsg += "\n--------------------- ERROR  LOG ---------------------\n" + gl.getShaderInfoLog( fragmentShader )

            throw new Error( dbgMsg );
        }

        gl.attachShader( program, vertexShader );
        gl.attachShader( program, fragmentShader );
        gl.linkProgram( program );


        // initShader( this.vsCode, this.fsCode, program );

        var uTexture = gl.getUniformLocation( program, 'u_texture' );
        var aPosition = gl.getAttribLocation( program, 'a_position' );
        var aUv = gl.getAttribLocation( program, 'a_uv' );

        gl.useProgram( program );


        var dataTexture = createDataTexture( this.array );

        gl.viewport( 0, 0, _size, _size );
        gl.bindFramebuffer( gl.FRAMEBUFFER, gl.createFramebuffer() );

        gl.framebufferTexture2D( gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, resultTexture, 0 );

        gl.bindTexture( gl.TEXTURE_2D, dataTexture );
        gl.activeTexture( gl.TEXTURE0 );
        gl.uniform1i( uTexture, 0 );
        gl.bindBuffer( gl.ARRAY_BUFFER, uvBuffer );
        gl.enableVertexAttribArray( aUv );
        gl.vertexAttribPointer( aUv, 2, gl.FLOAT, false, 0, 0 );
        gl.bindBuffer( gl.ARRAY_BUFFER, positionBuffer );
        gl.enableVertexAttribArray( aPosition );
        gl.vertexAttribPointer( aPosition, 2, gl.FLOAT, false, 0, 0 );
        gl.bindBuffer( gl.ELEMENT_ARRAY_BUFFER, indexBuffer );
        gl.drawElements( gl.TRIANGLES, 6, gl.UNSIGNED_SHORT, 0 );
        gl.readPixels( 0, 0, _size, _size, gl.RGBA, gl.FLOAT, this.array );

        // this.array = this.array.subarray(0, 4);
        return this;

    }

    // function initShader( this.vsCode, fragmentShaderCode, program ) {

    //     console.log( this.vsCode, fragmentShaderCode )



    //     var fragmentShader = gl.createShader( gl.FRAGMENT_SHADER );

    //     gl.shaderSource( fragmentShader, fragmentShaderCode );
    //     gl.compileShader( fragmentShader );


    //     var vertexShader = gl.createShader( gl.VERTEX_SHADER );

    //     gl.shaderSource( vertexShader, this.vsCode );
    //     gl.compileShader( vertexShader );

    //     gl.attachShader( program, vertexShader );
    //     gl.attachShader( program, fragmentShader );
    //     gl.linkProgram( program );

    //     if ( !gl.getProgramParameter( program, gl.LINK_STATUS ) ) {
    //         var info = gl.getProgramInfoLog( program );
    //         throw 'Could not compile WebGL program. \n\n' + info;
    //     }


    //     console.log( 'link' )


    // }

    function createDataTexture( data ) {

        var texture = gl.createTexture();

        gl.bindTexture( gl.TEXTURE_2D, texture );
        gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE );
        gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE );
        gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST );
        gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST );
        gl.texImage2D( gl.TEXTURE_2D, 0, gl.RGBA, _size, _size, 0, gl.RGBA, gl.FLOAT, data );
        gl.bindTexture( gl.TEXTURE_2D, null );

        return texture;
    }

    function getGLContext( canvas ) {

        var gl = null;
        var attr = { alpha: false, antialias: false };

        var names = [ 'webgl', 'experimental-webgl', 'webkit-3d', 'moz-webgl' ];

        for ( var i = 0; i < names.length; i++ ) {

            gl = canvas.getContext( names[ i ], attr );

            if ( gl ) break;
        }

        if ( !gl || !gl.getExtension( 'OES_texture_float' ) ) throw new Error( 'unsupported' );

        return gl;
    }

    this.commit = function () {

        this.fsCode += fragmentShaderCodeTail;
        // initShader( this.vsCode, this.fsCode );
        console.log( this.fsCode )
        this._update();

        this.fsCode = fragmentShaderCodeHead;

        return this;

    }

    this.set = function ( array, index ) {

        index = index || 0;
        this.array.set( array, index );

        // TODO use gl.subTexImage2D
        dataTexture = createDataTexture( this.array );

        return this;
    }


}

Para.prototype = {

    constructor: Para,

    _formatNumber: function ( n ) {

        if ( n % 1 === 0 ) return n + '.';
        return n + '';

    },

    add: function ( n ) {

        var code = '    value += ' + this._formatNumber( n ) + ';\n';

        this.fsCode += code;

        return this;

    },

    sub: function ( n ) {

        var code = '    value -= ' + this._formatNumber( n ) + ';\n';

        this.fsCode += code;

        return this

    },

    mul: function ( n ) {

        var code = '    value *= ' + this._formatNumber( n ) + ';\n';

        this.fsCode += code;

        return this

    },

    div: function ( n ) {

        var code = '    value /= ' + this._formatNumber( n ) + ';\n';

        this.fsCode += code;

        return this

    },

    sqrt: function () {

        return this

    },

    abs: function () {

        return this

    },

    neg: function () {

        return this

    }
}
