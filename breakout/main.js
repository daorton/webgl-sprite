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
