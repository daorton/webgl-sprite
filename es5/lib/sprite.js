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
