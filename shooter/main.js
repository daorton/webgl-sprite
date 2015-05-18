import { Sound }                                                        from '../lib/sound.js';
import { Sprite }                                                       from '../lib/sprite.js';
import { initGL, drawTriangles }                                        from '../lib/webgl.js';
import { Texture, GraphicTexture, ImageTexture }                        from '../lib/texture.js';
import { buildSpriteSheet, scanGamepads, removeInactive, bounceCenter } from '../lib/util.js';

const CONSTANTS = {
  width:               null,
  height:              null,
  gamepadZeroLimit:    0.08,

  targetCount:         5,
  targetBorderPercent: 10,
  targetSpeedMin:      0.1,
  targetSpeedMax:      0.3,
  targetFiringMinMS:   500,
  targetFiringMaxMS:   1500,

  projectileSpeed:     0.3,
  projectileOffset:    20,

  shooterCooldownMS:   500,
  shooterSpeedMax:     0.7,
  shooterTargetHit:    10,
  shooterTargetDamage: 5,
  shooterProjDamage:   10,

  missileSpeed:        0.4,
  missileOffset:       10,
};

let gl;

let shooter;
const targets = [];
const missile = [];
const projectiles = [];
const explosions = [];
let score = 0;

let pauseOn = false;
let gamepadOn = false;
let gameOver = false;

let lastTimeMS = 0;
let collisions = new Set();

const mouseState = {buttons: [], mouseX: null, mouseY: null};
let gamepad;

class Target extends Sprite {
  constructor(texture, center, velocity) {
    super(texture, {center: center, velocity: velocity});
    this.firingDelayMS = CONSTANTS.targetFiringMinMS + Math.random() * (CONSTANTS.targetFiringMaxMS - CONSTANTS.targetFiringMinMS);
    this.elapsedShotTimeMS = 0;
  }

  update(deltaTimeMS, mouseState, gamepad) {
    super.update(deltaTimeMS, mouseState, gamepad);
    this.elapsedShotTimeMS += deltaTimeMS;
    if (this.elapsedShotTimeMS > this.firingDelayMS) {
      this.elapsedShotTimeMS = 0;
      this.firingDelayMS = CONSTANTS.targetFiringMinMS + Math.random() * (CONSTANTS.targetFiringMaxMS - CONSTANTS.targetFiringMinMS);
      spawnProjectile(this.center, this.vel[0]);
    }
  }
}

class Shooter extends Sprite {
  constructor(texture, center) {
    super(texture, {center: center});
    this.canShoot = true;
    this.elapsedCooldownTimeMS = 0;
    this.healthValue = 100;
  }

  get health() {
    return this.healthValue;
  }

  set health(value) {
    this.healthValue = value < 0 ? 0 : value > 100 ? 100 : value;
  }

  update(deltaTimeMS, mouseState, gamepad) {
    if (this.healthValue == 0)
      return;

    super.update(deltaTimeMS, mouseState, gamepad);
    let center;
    let buttonDown;
    if (gamepad) {
      const curCenter = this.center;
      let dx = gamepad.axes[0];
      if (Math.abs(dx) < CONSTANTS.gamepadZeroLimit)
        dx = 0;
      let dy = gamepad.axes[1];
      if (Math.abs(dy) < CONSTANTS.gamepadZeroLimit)
        dy = 0;
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
}

class Missile extends Sprite {
  constructor(texture, center, velocity) {
    super(texture, {center: center, velocity: velocity});
  }
}

class Projectile extends Sprite {
  constructor(texture, center, velocity) {
    super(texture, {center: center, velocity: velocity});
  }
}

class Explosion extends Sprite {
  constructor(texture, center) {
    super(texture, {center: center, frameCount: 9, frameTimeMS: 10, frameColumns: 3});
  }
}

class Explosion2 extends Sprite {
  constructor(texture, center) {
    super(texture, {center: center, frameCount: 32, frameTimeMS: 4, frameColumns: 8});
  }
}

function spawnTarget() {
  const border = CONSTANTS.targetBorderPercent / 100 * CONSTANTS.width;
  const center = [Math.random() * (CONSTANTS.width  - 2 * border) + border, Math.random() * (CONSTANTS.height - 2 * border) + border];
  const speed =  CONSTANTS.targetSpeedMin + Math.random() * (CONSTANTS.targetSpeedMax - CONSTANTS.targetSpeedMin);
  const angle = 2 * Math.PI * Math.random();
  const newTarget = new Target(textureInfo.target, center, [Math.cos(angle) * speed, Math.sin(angle) * speed]);

  const noOverlapSprites = targets.concat(missile, shooter);
  while (noOverlapSprites.some(function(sprite) { return sprite.overlaps(newTarget); })) { // if we hit one then
    newTarget.center = [Math.random() * (CONSTANTS.width  - 2 * border) + border, Math.random() * (CONSTANTS.height - 2 * border) + border];
  }

  targets.push(newTarget);
}

function spawnMissile(center) {
  soundInfo.fireMissile.play();
  const f = new Missile(textureInfo.missile, [center[0], center[1] - CONSTANTS.missileOffset], [0, -CONSTANTS.missileSpeed]);
  missile.push(f);
}

function spawnProjectile(center, vy) {
  soundInfo.spawnProjectile.play();
  const p = new Projectile(textureInfo.projectile, [center[0], center[1] + CONSTANTS.projectileOffset], [0, Math.max(CONSTANTS.projectileSpeed + vy, CONSTANTS.projectileSpeed)]);
  projectiles.push(p);
}

function draw(timeMS) {
  gamepad = scanGamepads();
  const gamepadElement = document.getElementById('gamepad');
  gamepadElement.disabled = !gamepad;
  if (!gamepadOn)
    gamepad = null;

  const sprites = targets.concat(missile, projectiles, shooter, explosions);

  let deltaTimeMS = lastTimeMS > 0 ? timeMS - lastTimeMS : 0; // deltaTimeMS == 0 on first draw
  if (deltaTimeMS > 16.667) // handle pause - what if frame rate isn't 60 fps ???????????????
    deltaTimeMS = 16.667;

  for (let i = 0; i < sprites.length; ++i)
    sprites[i].update(deltaTimeMS, mouseState, gamepad);
  lastTimeMS = timeMS;

  const newCollisions = new Set();
  for (let i = 0; i < targets.length; ++i) {
    if (targets[i].isActive) {
      for (let j = 0; j < missile.length; ++j) {
        if (missile[j].isActive && missile[j].overlaps(targets[i])) {
          targets[i].isActive = false;
          missile[j].isActive = false;
          soundInfo.targetHit.play();
          const explosion = new Explosion(textureInfo.explosion, missile[j].center);
          explosions.push(explosion);
          sprites.push(explosion); // new so add to list of all current sprites
          score += CONSTANTS.shooterTargetHit;
        }
      }

      if (targets[i].isActive) {
        for (let j = i + 1; j < targets.length; ++j) {
          if (targets[j].isActive && targets[j].overlaps(targets[i])) {
            const hash = Math.min(targets[i].id, targets[j].id) + ',' + Math.max(targets[i].id, targets[j].id);
            newCollisions.add(hash);
            if (!collisions.has(hash)) {
              soundInfo.targetCollide.play();
              const vs = bounceCenter(targets[i].center, targets[i].velocity, 1, targets[j].center, targets[j].velocity, 1);
              targets[i].velocity = vs[0];
              targets[j].velocity = vs[1];
            }
          }
        }
      }

      if (targets[i].isActive)
        targets[i].constrain(CONSTANTS.width, CONSTANTS.height, true);
    }
  }
  collisions = newCollisions;

  for (let i = 0; i < projectiles.length; ++i) {
    if (projectiles[i].overlaps(shooter)) {
      soundInfo.shooterHit.play();
      projectiles[i].isActive = false;
      const explosion = new Explosion2(textureInfo.explosion2, projectiles[i].center);
      explosions.push(explosion);
      sprites.push(explosion);
      shooter.health = shooter.health - CONSTANTS.shooterProjDamage;
    }
  }

  for (let i = 0; i < targets.length; ++i) {
    if (targets[i].overlaps(shooter)) {
      soundInfo.targetHit.play();
      targets[i].isActive = false;
      const explosion = new Explosion(textureInfo.explosion, targets[i].center);
      explosions.push(explosion);
      sprites.push(explosion);
      shooter.health = shooter.health - CONSTANTS.shooterTargetDamage;
    }
  }

  gameOver = shooter.health == 0;
  if (gameOver) {
    const gameOverElement = document.getElementById('gameover');
    gameOverElement.style.display = 'block';
    gameOverElement.style.top = 100 + 'px';
    gameOverElement.style.left = (CONSTANTS.width / 2 - gameOverElement.offsetWidth / 2) + 'px';
  }


  document.getElementById('health').textContent = shooter.health;
  document.getElementById('score').textContent = score;

  shooter.constrain(CONSTANTS.width, CONSTANTS.height, false);

  removeInactive(targets);
  removeInactive(missile, CONSTANTS.width, CONSTANTS.height);
  removeInactive(projectiles, CONSTANTS.width, CONSTANTS.height);
  removeInactive(explosions);

  while (targets.length < CONSTANTS.targetCount)
    spawnTarget();

  const rectXYUV = [];
  for (let i = 0; i < sprites.length; ++i) {
    if (sprites[i].isActive) // we could rebuild the sprites array
      sprites[i].draw(rectXYUV);
  }
  drawTriangles(gl, rectXYUV);

  if (!pauseOn)
    window.requestAnimationFrame(draw);
}

function maybeRun() {
  if (--nToLoad == 0) {
    const webGLCanvas = document.getElementById('webgl');
    CONSTANTS.width = webGLCanvas.width = window.innerWidth;
    CONSTANTS.height = webGLCanvas.height = window.innerHeight;

    webGLCanvas.addEventListener('mousedown', function(e) { mouseState.buttons[0] = true; },                             false);
    webGLCanvas.addEventListener('mouseup',   function(e) { mouseState.buttons[0] = false; },                            false);
    webGLCanvas.addEventListener('mousemove', function(e) { mouseState.mouseX = e.pageX; mouseState.mouseY = e.pageY; }, false);

    const overlayDiv = document.getElementById('overlay');
    overlayDiv.style.display = 'block'; // started with display:none just so no annoying startup flash
    overlayDiv.style.left = (webGLCanvas.width - overlayDiv.offsetWidth) + 'px';
    overlayDiv.style.top = 0;
    overlayDiv.className = 'nofocus';
    const soundElement = document.getElementById('sound');
    soundElement.checked = Sound.soundOn;
    const gamepadElement = document.getElementById('gamepad');
    gamepadElement.checked = gamepadOn;

    overlayDiv.addEventListener('mouseover',     function(e) { overlayDiv.className = 'focus'; },     false);
    overlayDiv.addEventListener('mouseout',      function(e) { overlayDiv.className = 'nofocus'; },   false);
    soundElement.addEventListener('change',      function(e) { Sound.soundOn = soundElement.checked; },     false);
    gamepadElement.addEventListener('change',    function(e) { gamepadOn = gamepadElement.checked; }, false);

    window.addEventListener('keydown', function(e) {
      switch (e.keyCode) {
        case 27:  // escape
          pauseOn = !pauseOn;
          if (!pauseOn)
            window.requestAnimationFrame(draw);
          break;
        case 83: // 'S'
          soundElement.checked = !soundElement.checked;
          soundElement.dispatchEvent(new Event('change'));
          break;
      }
    }, false);

    document.getElementById('gameover').style.display = 'none';

    const spriteSheetCanvas = buildSpriteSheet(textureInfo);
    gl = initGL(webGLCanvas, spriteSheetCanvas, [165, 242, 243]);

    shooter = new Shooter(textureInfo.shooter, [webGLCanvas.width / 2, webGLCanvas.height / 8]);
    for (let i = 0; i < CONSTANTS.targetCount; ++i)
      spawnTarget();

    window.requestAnimationFrame(draw);
  }
}

const textureInfo = {
  shooter:    new ImageTexture('../lib/img/bird.png',       maybeRun),
  missile:    new ImageTexture('../lib/img/missile.png',    maybeRun),
  target:     new ImageTexture('../lib/img/penguin.png',    maybeRun),
  projectile: new ImageTexture('../lib/img/penguinsm2.png', maybeRun),
  explosion:  new ImageTexture('../lib/img/explosion.png',  maybeRun),
  explosion2: new ImageTexture('../lib/img/explosion2.png', maybeRun),
};

const soundInfo = {
  fireMissile:     new Sound('../lib/snd/electronicshot.mp3', 0.3,  maybeRun),
  targetHit:       new Sound('../lib/snd/shot.mp3',           1.0,  maybeRun),
  targetCollide:   new Sound('../lib/snd/boing.mp3',          0.3,  maybeRun),
  spawnProjectile: new Sound('../lib/snd/spawn.mp3',          0.03, maybeRun),
  shooterHit:      new Sound('../lib/snd/launch.mp3',         0.1,  maybeRun),
};

let nToLoad = 1 + Object.keys(textureInfo).length + Object.keys(soundInfo).length;

window.onload = function(e) {
  maybeRun();
};

window.onerror = function(msg, url, line, col, error) {
  alert(msg + '\n' + url + '\nline: ' + line + '\ncol: ' + col + '\nerror: ' + error);
};
