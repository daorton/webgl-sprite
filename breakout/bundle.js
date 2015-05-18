(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});
exports.Sound = Sound;

function Sound(url, gain, onLoad) {
  this.url = url;
  this.gain = gain || 1;
  var thisthis = this;
  var request = new XMLHttpRequest();
  request.open('GET', url, true);
  request.responseType = 'arraybuffer';
  request.onload = function () {
    if (Sound.audioContext) {
      Sound.audioContext.decodeAudioData(this.response, function (buffer) {
        thisthis.data = buffer;
        if (onLoad) onLoad(thisthis);
      });
    } else onLoad(thisthis);
  };
  request.send();
}

Sound.prototype.play = function () {
  if (Sound.soundOn && this.data) {
    var source = Sound.audioContext.createBufferSource();
    source.buffer = this.data;
    var gainNode = Sound.audioContext.createGain();
    gainNode.gain.value = this.gain;
    source.connect(gainNode);
    gainNode.connect(Sound.audioContext.destination);
    source.start(0);
  }
};

Sound.soundOn = false;
Sound.audioContext = window.AudioContext || window.webkitAudioContext ? new (window.AudioContext || window.webkitAudioContext)() : null;
if (!Sound.audioContext) console.log('Error getting AudioContext');

},{}],2:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _slicedToArray(arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var id = 0;

var Sprite = (function () {
  function Sprite(texture, options) {
    _classCallCheck(this, Sprite);

    this.texture = texture;
    this.frameCount = options.frameCount || 1;
    this.frameColumns = options.frameColumns || this.frameCount;
    this.frameRows = options.frameRows || this.frameCount / this.frameColumns;
    this.frameTimeMS = options.frameTimeMS || 0;
    this.xl = options.center[0] - texture.width / this.frameColumns / 2;
    this.xr = options.center[0] + texture.width / this.frameColumns / 2;
    this.yt = options.center[1] - texture.height / this.frameRows / 2;
    this.yb = options.center[1] + texture.height / this.frameRows / 2;
    this.vel = options.velocity || [0, 0];

    this.active = true;
    this.spriteTimeMS = -1;
    this.frame = 0;

    this.id = ++id;
  }

  _createClass(Sprite, [{
    key: "update",
    value: function update(deltaTimeMS, mouseState, gamepad) {
      if (!this.active) return;

      if (this.spriteTimeMS < 0) {
        deltaTimeMS = 0;
        this.spriteTimeMS = 0;
      } else {
        this.spriteTimeMS += deltaTimeMS;
      }

      if (this.frameCount > 1) {
        this.frame = Math.floor(this.spriteTimeMS / this.frameTimeMS);
        if (this.frame >= this.frameCount) {
          this.active = false;
          return;
        }
      }

      var dx = deltaTimeMS * this.vel[0];
      var dy = deltaTimeMS * this.vel[1];
      this.xl += dx;
      this.xr += dx;
      this.yt += dy;
      this.yb += dy;
    }
  }, {
    key: "draw",
    value: function draw(xyuv) {
      if (!this.active) return;
      var uv = this.getTextureUV();
      xyuv.push(this.xl, this.yb, uv.ul, uv.vb, // two triangles
      this.xr, this.yt, uv.ur, uv.vt, this.xl, this.yt, uv.ul, uv.vt, this.xl, this.yb, uv.ul, uv.vb, this.xr, this.yb, uv.ur, uv.vb, this.xr, this.yt, uv.ur, uv.vt);
    }
  }, {
    key: "rect",
    get: function () {
      return { xl: this.xl, xr: this.xr, yt: this.yt, yb: this.yb };
    },
    set: function (value) {
      var _temp = value;

      var _temp2 = _slicedToArray(_temp, 4);

      this.xl = _temp2[0];
      this.xr = _temp2[1];
      this.yt = _temp2[2];
      this.yb = _temp2[3];
      _temp;
    }
  }, {
    key: "center",
    get: function () {
      return [(this.xl + this.xr) / 2, (this.yt + this.yb) / 2];
    },
    set: function (value) {
      this.xl = value[0] - this.texture.width / this.frameColumns / 2;
      this.xr = value[0] + this.texture.width / this.frameColumns / 2;
      this.yt = value[1] - this.texture.height / this.frameRows / 2;
      this.yb = value[1] + this.texture.height / this.frameRows / 2;
    }
  }, {
    key: "size",
    get: function () {
      return [this.texture.width / this.frameColumns, this.texture.height / this.frameRows];
    }
  }, {
    key: "velocity",
    get: function () {
      return [this.vel[0], this.vel[1]];
    },
    set: function (value) {
      this.vel = value;
    }
  }, {
    key: "isActive",
    get: function () {
      return this.active;
    },
    set: function (value) {
      this.active = value;
    }
  }, {
    key: "overlaps",
    value: function overlaps(sprite) {
      return this.xl < sprite.xr && this.xr > sprite.xl && this.yt < sprite.yb && this.yb > sprite.yt;
    }
  }, {
    key: "getTextureUV",
    value: function getTextureUV() {
      if (this.frameCount > 1) {
        var texture = this.texture;
        var row = Math.floor(this.frame / this.frameColumns);
        var col = this.frame - row * this.frameColumns;
        var sx = (texture.ur - texture.ul) / this.frameColumns;
        var sy = (texture.vb - texture.vt) / this.frameRows;
        return { ul: texture.ul + col * sx, ur: texture.ul + (col + 1) * sx, vt: texture.vt + row * sy, vb: texture.vt + (row + 1) * sy };
      }
      return this.texture;
    }
  }, {
    key: "constrain",
    value: function constrain(width, height, bounce) {
      var ret = false;
      if (this.xl < 0) {
        this.xl = 0;
        this.xr = this.texture.width / this.frameColumns;
        if (bounce) this.vel[0] = -this.vel[0];
        ret = true;
      } else if (this.xr > width) {
        this.xr = width;
        this.xl = width - this.texture.width / this.frameColumns;
        if (bounce) this.vel[0] = -this.vel[0];
        ret = true;
      }
      if (this.yt < 0) {
        this.yt = 0;
        this.yb = this.texture.height / this.frameRows;
        if (bounce) this.vel[1] = -this.vel[1];
        ret = true;
      } else if (this.yb > height) {
        this.yb = height;
        this.yt = height - this.texture.height / this.frameRows;
        if (bounce) this.vel[1] = -this.vel[1];
        ret = true;
      }
      return ret;
    }
  }]);

  return Sprite;
})();

exports.Sprite = Sprite;

},{}],3:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; desc = parent = getter = undefined; _again = false; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; continue _function; } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _slicedToArray(arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Texture = (function () {
  function Texture() {
    _classCallCheck(this, Texture);
  }

  _createClass(Texture, [{
    key: "draw",
    value: function draw(context) {}
  }, {
    key: "uv",
    set: function (value) {
      var _temp = value;

      var _temp2 = _slicedToArray(_temp, 4);

      this.ul = _temp2[0];
      this.ur = _temp2[1];
      this.vt = _temp2[2];
      this.vb = _temp2[3];
      _temp;
    }
  }, {
    key: "saveClip",
    value: function saveClip(context) {
      context.save();
      context.beginPath();
      context.rect(this.x, this.y, this.width, this.height);
      context.closePath();
      context.clip();
    }
  }, {
    key: "restoreClip",
    value: function restoreClip(context) {
      context.restore();
    }
  }]);

  return Texture;
})();

exports.Texture = Texture;

var ImageTexture = (function (_Texture) {
  function ImageTexture(url, onLoad) {
    _classCallCheck(this, ImageTexture);

    _get(Object.getPrototypeOf(ImageTexture.prototype), "constructor", this).call(this);

    this.image = new Image();
    var thisthis = this;

    this.image.onload = function () {
      thisthis.width = thisthis.image.width;
      thisthis.height = thisthis.image.height;
      onLoad();
    };
    this.image.src = url;
  }

  _inherits(ImageTexture, _Texture);

  _createClass(ImageTexture, [{
    key: "draw",
    value: function draw(context) {
      context.drawImage(this.image, this.x, this.y);
    }
  }]);

  return ImageTexture;
})(Texture);

exports.ImageTexture = ImageTexture;

var GraphicTexture = (function (_Texture2) {
  function GraphicTexture(width, height) {
    _classCallCheck(this, GraphicTexture);

    _get(Object.getPrototypeOf(GraphicTexture.prototype), "constructor", this).call(this);
    this.width = width;
    this.height = height;
  }

  _inherits(GraphicTexture, _Texture2);

  return GraphicTexture;
})(Texture);

exports.GraphicTexture = GraphicTexture;

/// remove clipping mask

// context.beginPath();
// context.moveTo(this.x, this.y);
// context.lineTo(this.x + this.width, this.y);
// context.moveTo(this.x, this.y + this.height);
// context.lineTo(this.x + this.width, this.y + this.height);

// context.moveTo(this.x, this.y);
// context.lineTo(this.x, this.y + this.height);
// context.moveTo(this.x + this.width, this.y);
// context.lineTo(this.x + this.width, this.y + this.height);

// context.lineWidth = 1;
// context.strokeStyle = '#ffff00';
// context.stroke();

},{}],4:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});
// http://en.wikipedia.org/wiki/Elastic_collision#Two-Dimensional_Collision_With_Two_Moving_Objects
exports.bounceCenter = bounceCenter;
exports.removeInactive = removeInactive;

// http://codeincomplete.com/posts/2011/5/7/bin_packing/
exports.pack = pack;
exports.buildSpriteSheet = buildSpriteSheet;
exports.scanGamepads = scanGamepads;
exports.intersection = intersection;
exports.interpolate = interpolate;

function bounceCenter(x1, v1, m1, x2, v2, m2) {
  var v = [v1[0] - v2[0], v1[1] - v2[1]];
  var x = [x1[0] - x2[0], x1[1] - x2[1]];
  var l = Math.max(x[0] * x[0] + x[1] * x[1], 1);
  var d = 2 / (m1 + m2) * (v[0] * x[0] + v[1] * x[1]) / l;
  var s = m2 * d;
  var ov1 = [v1[0] - s * x[0], v1[1] - s * x[1]];
  s = m1 * d;
  var ov2 = [v2[0] + s * x[0], v2[1] + s * x[1]];
  //console.log((v1[0] * v1[0] + v2[0] * v2[0] + v1[1] * v1[1] + v2[1] * v2[1] - (ov1[0] * ov1[0] + ov2[0] * ov2[0] + ov1[1] * ov1[1] + ov2[1] * ov2[1])).toFixed(4));
  //console.log((v1[0] + v2[0] - (ov1[0] + ov2[0])).toFixed(4), (v1[1] + v2[1] - (ov1[1] + ov2[1])).toFixed(4));
  return [ov1, ov2];
}

function removeInactive(sprites, width, height) {
  var k = 0;
  for (var i = 0; i < sprites.length; ++i) {
    if (sprites[i].isActive) {
      if (width && height) {
        var r = sprites[i].rect;
        if (r.xr < 0 || r.xl > width || r.yb < 0 || r.yt > height) continue;
      }
      sprites[k++] = sprites[i];
    }
  }
  sprites.length = k;
}

function pack(blocks, totalWidth, totalHeight) {
  // blocks have width and height, this sets x and y properties
  blocks.sort(function (b1, b2) {
    return Math.max(b2.width, b2.height) - Math.max(b1.width, b1.height);
  });

  function findNode(_x, _x2, _x3) {
    var _left;

    var _again = true;

    _function: while (_again) {
      var node = _x,
          width = _x2,
          height = _x3;
      _again = false;

      if (node.right) {
        if (_left = findNode(node.right, width, height)) {
          return _left;
        }

        _x = node.down;
        _x2 = width;
        _x3 = height;
        _again = true;
        continue _function;
      } else if (width <= node.w && height <= node.h) return node;else return null;
    }
  }

  var root = { x: 0, y: 0, w: totalWidth, h: totalHeight };
  for (var i = 0; i < blocks.length; ++i) {
    var block = blocks[i];
    var node = findNode(root, block.width, block.height);
    if (node) {
      node.right = { x: node.x + block.width, y: node.y, w: node.w - block.width, h: block.height };
      node.down = { x: node.x, y: node.y + block.height, w: node.w, h: node.h - block.height };
      block.x = node.x;
      block.y = node.y;
    } else return false;
  }
  return true;
}

function buildSpriteSheet(textureInfo) {
  var textures = [];
  var minArea = 0;
  var minSide = 0;
  for (var key in textureInfo) {
    var texture = textureInfo[key];
    textures.push(texture);
    texture.width += 2; // allow for 1 pixel space between textures
    texture.height += 2;
    minArea = Math.max(minArea, texture.width * texture.height);
    minSide = Math.max(minSide, texture.width, texture.height);
  }

  var size = 16;
  while (size < minSide || size * size < minArea || !pack(textures, size, size)) size *= 2;

  var canvas = document.createElement('canvas'); // never visible so not added to DOM
  canvas.width = size;
  canvas.height = size;
  var ctx = canvas.getContext('2d');

  textures.forEach(function (texture) {
    texture.width -= 2;
    texture.height -= 2;
    texture.x += 1;
    texture.y += 1;
    texture.draw(ctx);
    texture.uv = [texture.x / size, (texture.x + texture.width) / size, 1 - texture.y / size, 1 - (texture.y + texture.height) / size];
  });

  return canvas;
}

function scanGamepads() {
  if (navigator.getGamepads) {
    var gamepads = navigator.getGamepads();
    for (var i = 0; i < gamepads.length; ++i) {
      if (gamepads[i]) return gamepads[i];
    }
  }
  return null;
}

function intersection(rect1, rect2) {
  var xl = Math.max(rect1.xl, rect2.xl);
  var xr = Math.min(rect1.xr, rect2.xr);
  var yt = Math.max(rect1.yt, rect2.yt);
  var yb = Math.min(rect1.yb, rect2.yb);
  return { xl: xl, xr: xr, yt: yt, yb: yb, empty: xl >= xr || yt >= yb };
}

function interpolate(x1, x2, y1, y2, x) {
  return (x - x1) * (y2 - y1) / (x2 - x1) + y1;
}

},{}],5:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});
exports.initGL = initGL;
exports.drawTriangles = drawTriangles;
var vertexShaderSource = '' + 'precision mediump float;\n' + 'uniform mat4 viewMatrix;\n' + 'attribute vec2 position;\n' + 'attribute vec2 uv;\n' + 'varying vec2 vUV;\n' + 'void main(void) { \n' + '  gl_Position = viewMatrix * vec4(position, 0.0, 1.0);\n' + '  vUV = uv;\n' + '}';

var fragmentShaderSource = '' + 'precision mediump float;\n' + 'uniform sampler2D sampler;\n' + 'varying vec2 vUV;\n' + 'void main(void) {\n' + '  gl_FragColor = texture2D(sampler, vUV);\n' + '}';

function compileShader(gl, shaderSource, shaderType) {
  var shader = gl.createShader(shaderType);
  gl.shaderSource(shader, shaderSource);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) throw new Error('webgl compileShader failed:\n' + gl.getShaderInfoLog(shader));
  return shader;
}

function initGL(webGLCanvas, spriteSheetCanvas, bgColor) {
  var options = { antialias: false, depth: false };
  var gl = webGLCanvas.getContext('webgl', options) || webGLCanvas.getContext('experimental-webgl', options);
  if (!gl) throw 'webgl getContext failed';

  gl.enable(gl.BLEND); // allow alpha for the sprites (textures)
  gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

  var program = gl.createProgram();
  var vertexShader = compileShader(gl, vertexShaderSource, gl.VERTEX_SHADER);
  gl.attachShader(program, vertexShader);
  var fragmentShader = compileShader(gl, fragmentShaderSource, gl.FRAGMENT_SHADER);
  gl.attachShader(program, fragmentShader);
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) throw 'webgl linkProgram failed:\n' + gl.getProgramInfoLog(program);
  gl.useProgram(program);

  gl.activeTexture(gl.TEXTURE0); // use TEXTURE0
  gl.bindTexture(gl.TEXTURE_2D, gl.createTexture()); // create the 2d texture to operate on
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST); // when expanding texture to screen sprite
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST); // when shrinking texture to screen sprite
  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true); // invert y for webgl cordinates
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, spriteSheetCanvas); // copy the canvas pixels (sprite sheet) to the texture
  gl.uniform1i(gl.getUniformLocation(program, 'sampler'), 0); // set sampler to TEXTURE_0

  var uv = gl.getAttribLocation(program, 'uv');
  var position = gl.getAttribLocation(program, 'position');

  gl.enableVertexAttribArray(uv);
  gl.enableVertexAttribArray(position);

  gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());

  gl.viewport(0, 0, webGLCanvas.width, webGLCanvas.height);
  gl.clearColor(bgColor[0] / 255, bgColor[1] / 255, bgColor[2] / 255, 1);

  // map web coordinates [0, width] [0, height] to webgl -1 : 1 inverting Y
  // var view = mat4.create();
  // mat4.scale(view, view, [1, -1, 1]);
  // mat4.translate(view, view, [-1, -1, 0]);
  // mat4.scale(view, view, [2 / canvas.width, 2 / canvas.height, 1]);
  var view = [2 / webGLCanvas.width, 0, 0, 0, 0, -2 / webGLCanvas.height, 0, 0, 0, 0, 1, 0, -1, 1, 0, 1];
  var viewMatrix = gl.getUniformLocation(program, 'viewMatrix');
  gl.uniformMatrix4fv(viewMatrix, false, view);

  gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 16, 0); // x, y : 16 bytes apart (4 floats) x, y, u, v
  gl.vertexAttribPointer(uv, 2, gl.FLOAT, false, 16, 8); // u, v start 8 bytes in

  return gl;
}

function drawTriangles(gl, rectXYUV) {
  gl.clear(gl.COLOR_BUFFER_BIT);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(rectXYUV), gl.DYNAMIC_DRAW);
  gl.drawArrays(gl.TRIANGLES, 0, rectXYUV.length / 4);
  gl.flush();
}

},{}],6:[function(require,module,exports){
'use strict';

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; desc = parent = getter = undefined; _again = false; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; }

var _libSoundJs = require('../lib/sound.js');

var _libSpriteJs = require('../lib/sprite.js');

var _libWebglJs = require('../lib/webgl.js');

var _libTextureJs = require('../lib/texture.js');

var _libUtilJs = require('../lib/util.js');

var CONSTANTS = {
  width: null,
  height: null,
  gamepadZeroLimit: 0.08,

  ballCount: 3,
  ballSpeed: 0.3 };

var gl = undefined;
var paddle = undefined;
var balls = [];
var bricks = [];
var explosions = [];
var score = 0;
var ballsPlayed = 0;

var pauseOn = false;
var gamepadOn = false;
var gameOver = false;

var lastTimeMS = 0;
var collisions = new Set();

var mouseState = { buttons: [], mouseX: null, mouseY: null };
var gamepad = undefined;

var Ball = (function (_Sprite) {
  function Ball(texture, center, velocity) {
    _classCallCheck(this, Ball);

    _get(Object.getPrototypeOf(Ball.prototype), 'constructor', this).call(this, texture, { center: center, velocity: velocity });
  }

  _inherits(Ball, _Sprite);

  return Ball;
})(_libSpriteJs.Sprite);

var Paddle = (function (_Sprite2) {
  function Paddle(texture, center) {
    _classCallCheck(this, Paddle);

    _get(Object.getPrototypeOf(Paddle.prototype), 'constructor', this).call(this, texture, { center: center });
  }

  _inherits(Paddle, _Sprite2);

  _createClass(Paddle, [{
    key: 'update',
    value: function update(deltaTimeMS, mouseState, gamepad) {
      if (gamepad) {
        var vx = gamepad.axes[0];
        if (Math.abs(vx) < CONSTANTS.gamepadZeroLimit) vx = 0;
        this.velocity = [vx, 0];
        _get(Object.getPrototypeOf(Paddle.prototype), 'update', this).call(this, deltaTimeMS, mouseState, gamepad);
      } else {
        // this.mx = .75 * this.mx + .25 * mouseState.mouseX;
        // vx = this.mx - this.lastx;
        // this.lastx = this.mx;
        this.xl = mouseState.mouseX - this.texture.width / 2;
        this.xr = this.xl + this.texture.width;
        return;
      }
    }
  }]);

  return Paddle;
})(_libSpriteJs.Sprite);

var Brick = (function (_Sprite3) {
  function Brick(texture, center) {
    _classCallCheck(this, Brick);

    _get(Object.getPrototypeOf(Brick.prototype), 'constructor', this).call(this, texture, { center: center });
  }

  _inherits(Brick, _Sprite3);

  return Brick;
})(_libSpriteJs.Sprite);

var Explosion = (function (_Sprite4) {
  function Explosion(texture, center) {
    _classCallCheck(this, Explosion);

    _get(Object.getPrototypeOf(Explosion.prototype), 'constructor', this).call(this, texture, { center: center, frameCount: 9, frameTimeMS: 10, frameColumns: 3 });
  }

  _inherits(Explosion, _Sprite4);

  return Explosion;
})(_libSpriteJs.Sprite);

function spawnBall() {
  var center = [CONSTANTS.width / 2, CONSTANTS.height / 2];
  var speed = CONSTANTS.ballSpeed;
  var angle = Math.PI / 4;
  balls.push(new Ball(textureInfo.ball, center, [Math.cos(angle) * speed, Math.sin(angle) * speed]));
}

function addBricks() {
  var bw = textureInfo.brick.width;
  var bh = textureInfo.brick.height;
  var nRows = Math.floor(CONSTANTS.height / 3 / bh);
  var nCols = Math.floor(CONSTANTS.width / bw);
  var xo = (CONSTANTS.width - bw * nCols) / 2;
  var yo = 3;
  for (var j = 0; j < nRows; ++j) {
    for (var i = 0; i < nCols; ++i) {
      var brick = new Brick(textureInfo.brick, [xo + i * bw + bw / 2, yo + j * bh + bh / 2]);
      bricks.push(brick);
    }
  }
}

function draw(timeMS) {
  gamepad = (0, _libUtilJs.scanGamepads)();
  var gamepadElement = document.getElementById('gamepad');
  gamepadElement.disabled = !gamepad;
  if (!gamepadOn) gamepad = null;

  var sprites = bricks.concat(explosions, balls, paddle);
  var deltaTimeMS = lastTimeMS > 0 ? timeMS - lastTimeMS : 0; // deltaTimeMS == 0 on first draw
  if (deltaTimeMS > 16.667) // handle pause - what if frame rate isn't 60 fps ???????????????
    deltaTimeMS = 16.667;

  for (var i = 0; i < sprites.length; ++i) {
    sprites[i].update(deltaTimeMS, mouseState, gamepad);
  }lastTimeMS = timeMS;

  var newCollisions = new Set();
  for (var i = 0; i < balls.length; ++i) {
    if (balls[i].overlaps(paddle)) {
      var hash = paddle.id + ',' + balls[i].id;
      newCollisions.add(hash);
      if (!collisions.has(hash)) {
        var v = balls[i].velocity;
        var r = (0, _libUtilJs.intersection)(paddle, balls[i]);
        var rx = (r.xl + r.xr) / 2;
        var angle = (0, _libUtilJs.interpolate)(paddle.xl, paddle.xr, Math.PI * 3 / 4, Math.PI / 4, rx);
        var s = Math.sqrt(v[0] * v[0] + v[1] * v[1]);
        balls[i].velocity = [s * Math.cos(angle), -s * Math.sin(angle)];
        soundInfo.bounce.play();
      }
    }
    if (balls[i].yb >= CONSTANTS.height) {
      balls[i].isActive = false;
      soundInfo.lostball.play();
      if (++ballsPlayed < CONSTANTS.ballCount) spawnBall();else gameOver = true;
    }
  }
  for (var i = 0; i < bricks.length; ++i) {
    for (var j = 0; j < balls.length; ++j) {
      if (bricks[i].isActive && bricks[i].overlaps(balls[j])) {
        var hash = bricks[i].id + ',' + balls[j].id;
        newCollisions.add(hash);
        if (!collisions.has(hash)) {
          var v = balls[j].velocity;

          var r = (0, _libUtilJs.intersection)(bricks[i], balls[j]);
          if (r.xr - r.xl > r.yb - r.yt) v[1] = -v[1];else v[0] = -v[0];

          balls[j].velocity = v;

          var explosion = new Explosion(textureInfo.explosion, bricks[i].center);
          explosions.push(explosion); // add to sprites ??
          bricks[i].isActive = false;
          soundInfo.brickhit.play();
          ++score;
        }
      }
    }
  }
  collisions = newCollisions;
  paddle.constrain(CONSTANTS.width, CONSTANTS.height, false);
  for (var i = 0; i < balls.length; ++i) {
    var bounce = balls[i].constrain(CONSTANTS.width, CONSTANTS.height, true);
    if (bounce) soundInfo.bounce.play();
  }

  //gameOver = burger.health() == 0;
  if (gameOver) {
    var gameOverElement = document.getElementById('gameover');
    gameOverElement.style.display = 'block';
    gameOverElement.style.top = CONSTANTS.height * 0.5 + 'px';
    gameOverElement.style.left = CONSTANTS.width / 2 - gameOverElement.offsetWidth / 2 + 'px';
    _libSoundJs.Sound.soundOn = false;
  }

  document.getElementById('score').textContent = score;

  (0, _libUtilJs.removeInactive)(balls);
  (0, _libUtilJs.removeInactive)(bricks);
  (0, _libUtilJs.removeInactive)(explosions);

  var rectXYUV = [];
  for (var i = 0; i < sprites.length; ++i) {
    if (sprites[i].isActive) sprites[i].draw(rectXYUV);
  }
  (0, _libWebglJs.drawTriangles)(gl, rectXYUV);

  if (!pauseOn) window.requestAnimationFrame(draw);
}

function maybeRun() {
  if (--nToLoad == 0) {
    (function () {
      var webGLCanvas = document.getElementById('webgl');
      CONSTANTS.width = webGLCanvas.width = window.innerWidth;
      CONSTANTS.height = webGLCanvas.height = window.innerHeight;

      webGLCanvas.addEventListener('mousedown', function (e) {
        mouseState.buttons[0] = true;
      }, false);
      webGLCanvas.addEventListener('mouseup', function (e) {
        mouseState.buttons[0] = false;
      }, false);
      webGLCanvas.addEventListener('mousemove', function (e) {
        mouseState.mouseX = e.pageX;mouseState.mouseY = e.pageY;
      }, false);

      var overlayDiv = document.getElementById('overlay');
      overlayDiv.style.display = 'block'; // started with display:none just so no annoying startup flash
      overlayDiv.style.left = webGLCanvas.width - overlayDiv.offsetWidth + 'px';
      overlayDiv.style.top = webGLCanvas.height - overlayDiv.offsetHeight + 'px';
      overlayDiv.className = 'nofocus';
      var soundElement = document.getElementById('sound');
      soundElement.checked = _libSoundJs.Sound.soundOn;
      var gamepadElement = document.getElementById('gamepad');
      gamepadElement.checked = gamepadOn;

      overlayDiv.addEventListener('mouseover', function (e) {
        overlayDiv.className = 'focus';
      }, false);
      overlayDiv.addEventListener('mouseout', function (e) {
        overlayDiv.className = 'nofocus';
      }, false);
      soundElement.addEventListener('change', function (e) {
        _libSoundJs.Sound.soundOn = soundElement.checked;
      }, false);
      gamepadElement.addEventListener('change', function (e) {
        gamepadOn = gamepadElement.checked;
      }, false);

      window.addEventListener('keydown', function (e) {
        switch (e.keyCode) {
          case 27:
            // escape
            pauseOn = !pauseOn;
            if (!pauseOn) window.requestAnimationFrame(draw);
            break;
          case 83:
            // 'S'
            soundElement.checked = !soundElement.checked;
            soundElement.dispatchEvent(new Event('change'));
            break;
        }
      }, false);

      document.getElementById('gameover').style.display = 'none';

      var spriteSheetCanvas = (0, _libUtilJs.buildSpriteSheet)(textureInfo);
      gl = (0, _libWebglJs.initGL)(webGLCanvas, spriteSheetCanvas, [100, 149, 237]);

      spawnBall();
      paddle = new Paddle(textureInfo.paddle, [CONSTANTS.width / 2, CONSTANTS.height * 0.85]);
      addBricks();

      window.requestAnimationFrame(draw);
    })();
  }
}

var BallTexture = (function (_GraphicTexture) {
  function BallTexture(width, height) {
    _classCallCheck(this, BallTexture);

    _get(Object.getPrototypeOf(BallTexture.prototype), 'constructor', this).call(this);
    this.width = width;
    this.height = height;
  }

  _inherits(BallTexture, _GraphicTexture);

  _createClass(BallTexture, [{
    key: 'draw',
    value: function draw(context) {
      context.beginPath();
      var radius = this.width / 2 - 1;
      context.arc(this.x + this.width / 2, this.y + this.height / 2, radius, 0, 2 * Math.PI, false);
      context.fillStyle = 'green';
      context.fill();
      context.lineWidth = 3;
      context.strokeStyle = '#003300';
      context.stroke();
    }
  }]);

  return BallTexture;
})(_libTextureJs.GraphicTexture);

var PaddleTexture = (function (_GraphicTexture2) {
  function PaddleTexture(width, height) {
    _classCallCheck(this, PaddleTexture);

    _get(Object.getPrototypeOf(PaddleTexture.prototype), 'constructor', this).call(this);
    this.width = width;
    this.height = height;
  }

  _inherits(PaddleTexture, _GraphicTexture2);

  _createClass(PaddleTexture, [{
    key: 'draw',
    value: function draw(context) {
      var x = this.x;
      var y = this.y;
      var width = this.width;
      var height = this.height;
      var radius = 3;

      this.saveClip(context);
      context.beginPath();
      context.moveTo(x + radius, y);
      context.lineTo(x + width - radius, y);
      context.quadraticCurveTo(x + width, y, x + width, y + radius);
      context.lineTo(x + width, y + height - radius);
      context.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
      context.lineTo(x + radius, y + height);
      context.quadraticCurveTo(x, y + height, x, y + height - radius);
      context.lineTo(x, y + radius);
      context.quadraticCurveTo(x, y, x + radius, y);
      context.closePath();

      context.fillStyle = 'yellow';
      context.fill();
      context.lineWidth = 3;
      context.strokeStyle = '#003300';
      context.stroke();
      this.restoreClip(context);
    }
  }]);

  return PaddleTexture;
})(_libTextureJs.GraphicTexture);

var BrickTexture = (function (_GraphicTexture3) {
  function BrickTexture(width, height) {
    _classCallCheck(this, BrickTexture);

    _get(Object.getPrototypeOf(BrickTexture.prototype), 'constructor', this).call(this);
    this.width = width;
    this.height = height;
  }

  _inherits(BrickTexture, _GraphicTexture3);

  _createClass(BrickTexture, [{
    key: 'draw',
    value: function draw(context) {
      var x = this.x;
      var y = this.y;
      var width = this.width;
      var height = this.height;
      var radius = 7;

      this.saveClip(context);
      context.beginPath();
      context.moveTo(x + radius, y);
      context.lineTo(x + width - radius, y);
      context.quadraticCurveTo(x + width, y, x + width, y + radius);
      context.lineTo(x + width, y + height - radius);
      context.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
      context.lineTo(x + radius, y + height);
      context.quadraticCurveTo(x, y + height, x, y + height - radius);
      context.lineTo(x, y + radius);
      context.quadraticCurveTo(x, y, x + radius, y);
      context.closePath();

      context.fillStyle = 'red';
      context.fill();
      context.lineWidth = 3;
      context.strokeStyle = 'gray';
      context.stroke();
      this.restoreClip(context);
    }
  }]);

  return BrickTexture;
})(_libTextureJs.GraphicTexture);

var textureInfo = {
  ball: new BallTexture(12, 12),
  paddle: new PaddleTexture(100, 12),
  brick: new BrickTexture(80, 24),
  explosion: new _libTextureJs.ImageTexture('../lib/img/explosion.png', maybeRun) };

var soundInfo = {
  brickhit: new _libSoundJs.Sound('../lib/snd/shot.mp3', 1, maybeRun),
  lostball: new _libSoundJs.Sound('../lib/snd/launch.mp3', 1, maybeRun),
  bounce: new _libSoundJs.Sound('../lib/snd/boing.mp3', 1, maybeRun) };

var nToLoad = 1 + Object.keys(soundInfo).length + 1;

window.onload = function (e) {
  maybeRun();
};

window.onerror = function (msg, url, line, col, error) {
  alert(msg + '\n' + url + '\nline: ' + line + '\ncol: ' + col + '\nerror: ' + error);
};

//  paddleSpeed:      1.0,

},{"../lib/sound.js":1,"../lib/sprite.js":2,"../lib/texture.js":3,"../lib/util.js":4,"../lib/webgl.js":5}]},{},[6]);
