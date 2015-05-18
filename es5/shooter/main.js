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
