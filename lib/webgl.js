const vertexShaderSource = ''
    + 'precision mediump float;\n'
    + 'uniform mat4 viewMatrix;\n'
    + 'attribute vec2 position;\n'
    + 'attribute vec2 uv;\n'
    + 'varying vec2 vUV;\n'
    + 'void main(void) { \n'
    + '  gl_Position = viewMatrix * vec4(position, 0.0, 1.0);\n'
    + '  vUV = uv;\n'
    + '}'
;

const fragmentShaderSource=''
    + 'precision mediump float;\n'
    + 'uniform sampler2D sampler;\n'
    + 'varying vec2 vUV;\n'
    + 'void main(void) {\n'
    + '  gl_FragColor = texture2D(sampler, vUV);\n'
    + '}'
;

function compileShader(gl, shaderSource, shaderType) {
  const shader = gl.createShader(shaderType);
  gl.shaderSource(shader, shaderSource);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS))
    throw new Error('webgl compileShader failed:\n' + gl.getShaderInfoLog(shader));
  return shader;
}

export function initGL(webGLCanvas, spriteSheetCanvas, bgColor) {
  const options = {antialias: false, depth: false};
  const gl = webGLCanvas.getContext('webgl', options) || webGLCanvas.getContext('experimental-webgl', options);
  if (!gl)
    throw('webgl getContext failed');

  gl.enable(gl.BLEND); // allow alpha for the sprites (textures)
  gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

  const program = gl.createProgram();
  const vertexShader = compileShader(gl, vertexShaderSource, gl.VERTEX_SHADER);
  gl.attachShader(program, vertexShader);
  const fragmentShader = compileShader(gl, fragmentShaderSource, gl.FRAGMENT_SHADER);
  gl.attachShader(program, fragmentShader);
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS))
    throw 'webgl linkProgram failed:\n' + gl.getProgramInfoLog(program);
  gl.useProgram(program);

  gl.activeTexture(gl.TEXTURE0); // use TEXTURE0
  gl.bindTexture(gl.TEXTURE_2D, gl.createTexture()); // create the 2d texture to operate on
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST); // when expanding texture to screen sprite
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST); // when shrinking texture to screen sprite
  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true); // invert y for webgl cordinates
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, spriteSheetCanvas); // copy the canvas pixels (sprite sheet) to the texture
  gl.uniform1i(gl.getUniformLocation(program, 'sampler'), 0); // set sampler to TEXTURE_0

  const uv = gl.getAttribLocation(program, 'uv');
  const position = gl.getAttribLocation(program, 'position');

  gl.enableVertexAttribArray(uv);
  gl.enableVertexAttribArray(position);

  gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());

  gl.viewport(0.0, 0.0, webGLCanvas.width, webGLCanvas.height);
  gl.clearColor(bgColor[0] / 255, bgColor[1] / 255, bgColor[2] / 255, 1.0);

  // map web coordinates [0, width] [0, height] to webgl -1 : 1 inverting Y
  // var view = mat4.create();
  // mat4.scale(view, view, [1, -1, 1]);
  // mat4.translate(view, view, [-1, -1, 0]);
  // mat4.scale(view, view, [2 / canvas.width, 2 / canvas.height, 1]);
  const view = [2 / webGLCanvas.width, 0, 0, 0, 0, -2 / webGLCanvas.height, 0, 0, 0, 0, 1, 0, -1, 1, 0, 1]
  const viewMatrix = gl.getUniformLocation(program, 'viewMatrix');
  gl.uniformMatrix4fv(viewMatrix, false, view);

  gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 16, 0); // x, y : 16 bytes apart (4 floats) x, y, u, v
  gl.vertexAttribPointer(uv,       2, gl.FLOAT, false, 16, 8); // u, v start 8 bytes in

  return gl;
}

export function drawTriangles(gl, rectXYUV) {
  gl.clear(gl.COLOR_BUFFER_BIT);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(rectXYUV), gl.DYNAMIC_DRAW);
  gl.drawArrays(gl.TRIANGLES, 0, rectXYUV.length / 4);
  gl.flush();
}
