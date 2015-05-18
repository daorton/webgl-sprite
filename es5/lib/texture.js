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
