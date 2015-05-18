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
