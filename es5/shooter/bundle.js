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

  targetCount: 5,
  targetBorderPercent: 10,
  targetSpeedMin: 0.1,
  targetSpeedMax: 0.3,
  targetFiringMinMS: 500,
  targetFiringMaxMS: 1500,

  projectileSpeed: 0.3,
  projectileOffset: 20,

  shooterCooldownMS: 500,
  shooterSpeedMax: 0.7,
  shooterTargetHit: 10,
  shooterTargetDamage: 5,
  shooterProjDamage: 10,

  missileSpeed: 0.4,
  missileOffset: 10 };

var gl = undefined;

var shooter = undefined;
var targets = [];
var missile = [];
var projectiles = [];
var explosions = [];
var score = 0;

var pauseOn = false;
var gamepadOn = false;
var gameOver = false;

var lastTimeMS = 0;
var collisions = new Set();

var mouseState = { buttons: [], mouseX: null, mouseY: null };
var gamepad = undefined;

var Target = (function (_Sprite) {
  function Target(texture, center, velocity) {
    _classCallCheck(this, Target);

    _get(Object.getPrototypeOf(Target.prototype), 'constructor', this).call(this, texture, { center: center, velocity: velocity });
    this.firingDelayMS = CONSTANTS.targetFiringMinMS + Math.random() * (CONSTANTS.targetFiringMaxMS - CONSTANTS.targetFiringMinMS);
    this.elapsedShotTimeMS = 0;
  }

  _inherits(Target, _Sprite);

  _createClass(Target, [{
    key: 'update',
    value: function update(deltaTimeMS, mouseState, gamepad) {
      _get(Object.getPrototypeOf(Target.prototype), 'update', this).call(this, deltaTimeMS, mouseState, gamepad);
      this.elapsedShotTimeMS += deltaTimeMS;
      if (this.elapsedShotTimeMS > this.firingDelayMS) {
        this.elapsedShotTimeMS = 0;
        this.firingDelayMS = CONSTANTS.targetFiringMinMS + Math.random() * (CONSTANTS.targetFiringMaxMS - CONSTANTS.targetFiringMinMS);
        spawnProjectile(this.center, this.vel[0]);
      }
    }
  }]);

  return Target;
})(_libSpriteJs.Sprite);

var Shooter = (function (_Sprite2) {
  function Shooter(texture, center) {
    _classCallCheck(this, Shooter);

    _get(Object.getPrototypeOf(Shooter.prototype), 'constructor', this).call(this, texture, { center: center });
    this.canShoot = true;
    this.elapsedCooldownTimeMS = 0;
    this.healthValue = 100;
  }

  _inherits(Shooter, _Sprite2);

  _createClass(Shooter, [{
    key: 'health',
    get: function () {
      return this.healthValue;
    },
    set: function (value) {
      this.healthValue = value < 0 ? 0 : value > 100 ? 100 : value;
    }
  }, {
    key: 'update',
    value: function update(deltaTimeMS, mouseState, gamepad) {
      if (this.healthValue == 0) return;

      _get(Object.getPrototypeOf(Shooter.prototype), 'update', this).call(this, deltaTimeMS, mouseState, gamepad);
      var center = undefined;
      var buttonDown = undefined;
      if (gamepad) {
        var curCenter = this.center;
        var dx = gamepad.axes[0];
        if (Math.abs(dx) < CONSTANTS.gamepadZeroLimit) dx = 0;
        var dy = gamepad.axes[1];
        if (Math.abs(dy) < CONSTANTS.gamepadZeroLimit) dy = 0;
        center = [curCenter[0] + dx * CONSTANTS.shooterSpeedMax * deltaTimeMS, curCenter[1] + dy * CONSTANTS.shooterSpeedMax * deltaTimeMS];
        buttonDown = gamepad.buttons[0].pressed;
      } else {
        center = [mouseState.mouseX, mouseState.mouseY];
        buttonDown = mouseState.buttons[0];
      }
      this.center = center;

      if (!this.canShoot) {
        this.elapsedCooldownTimeMS += deltaTimeMS;
        if (this.elapsedCooldownTimeMS > CONSTANTS.shooterCooldownMS || !buttonDown) {
          this.elapsedCooldownTimeMS = 0;
          this.canShoot = true;
        }
      }
      if (buttonDown && this.canShoot) {
        this.canShoot = false;
        spawnMissile(center);
      }
    }
  }]);

  return Shooter;
})(_libSpriteJs.Sprite);

var Missile = (function (_Sprite3) {
  function Missile(texture, center, velocity) {
    _classCallCheck(this, Missile);

    _get(Object.getPrototypeOf(Missile.prototype), 'constructor', this).call(this, texture, { center: center, velocity: velocity });
  }

  _inherits(Missile, _Sprite3);

  return Missile;
})(_libSpriteJs.Sprite);

var Projectile = (function (_Sprite4) {
  function Projectile(texture, center, velocity) {
    _classCallCheck(this, Projectile);

    _get(Object.getPrototypeOf(Projectile.prototype), 'constructor', this).call(this, texture, { center: center, velocity: velocity });
  }

  _inherits(Projectile, _Sprite4);

  return Projectile;
})(_libSpriteJs.Sprite);

var Explosion = (function (_Sprite5) {
  function Explosion(texture, center) {
    _classCallCheck(this, Explosion);

    _get(Object.getPrototypeOf(Explosion.prototype), 'constructor', this).call(this, texture, { center: center, frameCount: 9, frameTimeMS: 10, frameColumns: 3 });
  }

  _inherits(Explosion, _Sprite5);

  return Explosion;
})(_libSpriteJs.Sprite);

var Explosion2 = (function (_Sprite6) {
  function Explosion2(texture, center) {
    _classCallCheck(this, Explosion2);

    _get(Object.getPrototypeOf(Explosion2.prototype), 'constructor', this).call(this, texture, { center: center, frameCount: 32, frameTimeMS: 4, frameColumns: 8 });
  }

  _inherits(Explosion2, _Sprite6);

  return Explosion2;
})(_libSpriteJs.Sprite);

function spawnTarget() {
  var border = CONSTANTS.targetBorderPercent / 100 * CONSTANTS.width;
  var center = [Math.random() * (CONSTANTS.width - 2 * border) + border, Math.random() * (CONSTANTS.height - 2 * border) + border];
  var speed = CONSTANTS.targetSpeedMin + Math.random() * (CONSTANTS.targetSpeedMax - CONSTANTS.targetSpeedMin);
  var angle = 2 * Math.PI * Math.random();
  var newTarget = new Target(textureInfo.target, center, [Math.cos(angle) * speed, Math.sin(angle) * speed]);

  var noOverlapSprites = targets.concat(missile, shooter);
  while (noOverlapSprites.some(function (sprite) {
    return sprite.overlaps(newTarget);
  })) {
    // if we hit one then
    newTarget.center = [Math.random() * (CONSTANTS.width - 2 * border) + border, Math.random() * (CONSTANTS.height - 2 * border) + border];
  }

  targets.push(newTarget);
}

function spawnMissile(center) {
  soundInfo.fireMissile.play();
  var f = new Missile(textureInfo.missile, [center[0], center[1] - CONSTANTS.missileOffset], [0, -CONSTANTS.missileSpeed]);
  missile.push(f);
}

function spawnProjectile(center, vy) {
  soundInfo.spawnProjectile.play();
  var p = new Projectile(textureInfo.projectile, [center[0], center[1] + CONSTANTS.projectileOffset], [0, Math.max(CONSTANTS.projectileSpeed + vy, CONSTANTS.projectileSpeed)]);
  projectiles.push(p);
}

function draw(timeMS) {
  gamepad = (0, _libUtilJs.scanGamepads)();
  var gamepadElement = document.getElementById('gamepad');
  gamepadElement.disabled = !gamepad;
  if (!gamepadOn) gamepad = null;

  var sprites = targets.concat(missile, projectiles, shooter, explosions);

  var deltaTimeMS = lastTimeMS > 0 ? timeMS - lastTimeMS : 0; // deltaTimeMS == 0 on first draw
  if (deltaTimeMS > 16.667) // handle pause - what if frame rate isn't 60 fps ???????????????
    deltaTimeMS = 16.667;

  for (var i = 0; i < sprites.length; ++i) {
    sprites[i].update(deltaTimeMS, mouseState, gamepad);
  }lastTimeMS = timeMS;

  var newCollisions = new Set();
  for (var i = 0; i < targets.length; ++i) {
    if (targets[i].isActive) {
      for (var j = 0; j < missile.length; ++j) {
        if (missile[j].isActive && missile[j].overlaps(targets[i])) {
          targets[i].isActive = false;
          missile[j].isActive = false;
          soundInfo.targetHit.play();
          var explosion = new Explosion(textureInfo.explosion, missile[j].center);
          explosions.push(explosion);
          sprites.push(explosion); // new so add to list of all current sprites
          score += CONSTANTS.shooterTargetHit;
        }
      }

      if (targets[i].isActive) {
        for (var j = i + 1; j < targets.length; ++j) {
          if (targets[j].isActive && targets[j].overlaps(targets[i])) {
            var hash = Math.min(targets[i].id, targets[j].id) + ',' + Math.max(targets[i].id, targets[j].id);
            newCollisions.add(hash);
            if (!collisions.has(hash)) {
              soundInfo.targetCollide.play();
              var vs = (0, _libUtilJs.bounceCenter)(targets[i].center, targets[i].velocity, 1, targets[j].center, targets[j].velocity, 1);
              targets[i].velocity = vs[0];
              targets[j].velocity = vs[1];
            }
          }
        }
      }

      if (targets[i].isActive) targets[i].constrain(CONSTANTS.width, CONSTANTS.height, true);
    }
  }
  collisions = newCollisions;

  for (var i = 0; i < projectiles.length; ++i) {
    if (projectiles[i].overlaps(shooter)) {
      soundInfo.shooterHit.play();
      projectiles[i].isActive = false;
      var explosion = new Explosion2(textureInfo.explosion2, projectiles[i].center);
      explosions.push(explosion);
      sprites.push(explosion);
      shooter.health = shooter.health - CONSTANTS.shooterProjDamage;
    }
  }

  for (var i = 0; i < targets.length; ++i) {
    if (targets[i].overlaps(shooter)) {
      soundInfo.targetHit.play();
      targets[i].isActive = false;
      var explosion = new Explosion(textureInfo.explosion, targets[i].center);
      explosions.push(explosion);
      sprites.push(explosion);
      shooter.health = shooter.health - CONSTANTS.shooterTargetDamage;
    }
  }

  gameOver = shooter.health == 0;
  if (gameOver) {
    var gameOverElement = document.getElementById('gameover');
    gameOverElement.style.display = 'block';
    gameOverElement.style.top = 100 + 'px';
    gameOverElement.style.left = CONSTANTS.width / 2 - gameOverElement.offsetWidth / 2 + 'px';
  }

  document.getElementById('health').textContent = shooter.health;
  document.getElementById('score').textContent = score;

  shooter.constrain(CONSTANTS.width, CONSTANTS.height, false);

  (0, _libUtilJs.removeInactive)(targets);
  (0, _libUtilJs.removeInactive)(missile, CONSTANTS.width, CONSTANTS.height);
  (0, _libUtilJs.removeInactive)(projectiles, CONSTANTS.width, CONSTANTS.height);
  (0, _libUtilJs.removeInactive)(explosions);

  while (targets.length < CONSTANTS.targetCount) spawnTarget();

  var rectXYUV = [];
  for (var i = 0; i < sprites.length; ++i) {
    if (sprites[i].isActive) // we could rebuild the sprites array
      sprites[i].draw(rectXYUV);
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
      overlayDiv.style.top = 0;
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
      gl = (0, _libWebglJs.initGL)(webGLCanvas, spriteSheetCanvas, [165, 242, 243]);

      shooter = new Shooter(textureInfo.shooter, [webGLCanvas.width / 2, webGLCanvas.height / 8]);
      for (var i = 0; i < CONSTANTS.targetCount; ++i) {
        spawnTarget();
      }window.requestAnimationFrame(draw);
    })();
  }
}

var textureInfo = {
  shooter: new _libTextureJs.ImageTexture('../lib/img/bird.png', maybeRun),
  missile: new _libTextureJs.ImageTexture('../lib/img/missile.png', maybeRun),
  target: new _libTextureJs.ImageTexture('../lib/img/penguin.png', maybeRun),
  projectile: new _libTextureJs.ImageTexture('../lib/img/penguinsm2.png', maybeRun),
  explosion: new _libTextureJs.ImageTexture('../lib/img/explosion.png', maybeRun),
  explosion2: new _libTextureJs.ImageTexture('../lib/img/explosion2.png', maybeRun) };

var soundInfo = {
  fireMissile: new _libSoundJs.Sound('../lib/snd/electronicshot.mp3', 0.3, maybeRun),
  targetHit: new _libSoundJs.Sound('../lib/snd/shot.mp3', 1, maybeRun),
  targetCollide: new _libSoundJs.Sound('../lib/snd/boing.mp3', 0.3, maybeRun),
  spawnProjectile: new _libSoundJs.Sound('../lib/snd/spawn.mp3', 0.03, maybeRun),
  shooterHit: new _libSoundJs.Sound('../lib/snd/launch.mp3', 0.1, maybeRun) };

var nToLoad = 1 + Object.keys(textureInfo).length + Object.keys(soundInfo).length;

window.onload = function (e) {
  maybeRun();
};

window.onerror = function (msg, url, line, col, error) {
  alert(msg + '\n' + url + '\nline: ' + line + '\ncol: ' + col + '\nerror: ' + error);
};

},{"../lib/sound.js":1,"../lib/sprite.js":2,"../lib/texture.js":3,"../lib/util.js":4,"../lib/webgl.js":5}]},{},[6]);
