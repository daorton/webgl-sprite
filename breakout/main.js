import { Sound } from '../lib/sound.js';
import { Sprite } from '../lib/sprite.js';
import { initGL, drawTriangles } from '../lib/webgl.js';
import { Texture, GraphicTexture, ImageTexture } from '../lib/texture.js';
import { buildSpriteSheet, scanGamepads, removeInactive, bounceCenter, intersection, interpolate } from '../lib/util.js';

const CONSTANTS = {
  width:            null,
  height:           null,
  gamepadZeroLimit: 0.08,

  ballCount:        3,
  ballSpeed:        0.3,
//  paddleSpeed:      1.0,
};

let gl;
let paddle;
const balls = [];
const bricks = [];
const explosions = [];
let score = 0;
let ballsPlayed = 0;

let pauseOn = false;
let gamepadOn = false;
let gameOver = false;

let lastTimeMS = 0;
let collisions = new Set();

const mouseState = {buttons: [], mouseX: null, mouseY: null};
let gamepad;

class Ball extends Sprite {
  constructor(texture, center, velocity) {
    super(texture, {center: center, velocity: velocity});
  }
}

class Paddle extends Sprite {
  constructor(texture, center) {
    super(texture, {center: center});
  }

  update(deltaTimeMS, mouseState, gamepad) {
    if (gamepad) {
      let vx = gamepad.axes[0];
      if (Math.abs(vx) < CONSTANTS.gamepadZeroLimit)
        vx = 0;
      this.velocity = [vx, 0];
      super.update(deltaTimeMS, mouseState, gamepad);
    } else {
      // this.mx = .75 * this.mx + .25 * mouseState.mouseX;
      // vx = this.mx - this.lastx;
      // this.lastx = this.mx;
      this.xl = mouseState.mouseX - this.texture.width / 2;
      this.xr = this.xl + this.texture.width;
      return;
    }
  }
}

class Brick extends Sprite {
  constructor(texture, center) {
    super(texture, {center: center});
  }
}

class Explosion extends Sprite {
  constructor(texture, center) {
    super(texture, {center: center, frameCount: 9, frameTimeMS: 10, frameColumns: 3});
  }
}

function spawnBall() {
  const center = [CONSTANTS.width / 2, CONSTANTS.height / 2];
  const speed =  CONSTANTS.ballSpeed;
  const angle = Math.PI / 4;
  balls.push(new Ball(textureInfo.ball, center, [Math.cos(angle) * speed, Math.sin(angle) * speed]));
}

function addBricks() {
  const bw = textureInfo.brick.width;
  const bh = textureInfo.brick.height;
  const nRows = Math.floor(CONSTANTS.height / 3 / bh);
  const nCols = Math.floor(CONSTANTS.width / bw);
  const xo = (CONSTANTS.width - bw * nCols) / 2;
  const yo = 3;
  for (let j = 0; j < nRows; ++j) {
    for (let i = 0; i < nCols; ++i) {
      const brick = new Brick(textureInfo.brick, [xo + i * bw + bw / 2, yo + j * bh + bh / 2]);
      bricks.push(brick);
    }
  }
}

function draw(timeMS) {
  gamepad = scanGamepads();
  const gamepadElement = document.getElementById('gamepad');
  gamepadElement.disabled = !gamepad;
  if (!gamepadOn)
    gamepad = null;

  const sprites = bricks.concat(explosions, balls, paddle);
  let deltaTimeMS = lastTimeMS > 0 ? timeMS - lastTimeMS : 0; // deltaTimeMS == 0 on first draw
  if (deltaTimeMS > 16.667) // handle pause - what if frame rate isn't 60 fps ???????????????
    deltaTimeMS = 16.667;

  for (let i = 0; i < sprites.length; ++i)
    sprites[i].update(deltaTimeMS, mouseState, gamepad);
  lastTimeMS = timeMS;

  const newCollisions = new Set()
  for (let i = 0; i < balls.length; ++i) {
    if (balls[i].overlaps(paddle)) {
      const hash = paddle.id + ',' + balls[i].id;
      newCollisions.add(hash);
      if (!collisions.has(hash)) {
        const v = balls[i].velocity;
        const r = intersection(paddle, balls[i]);
        const rx = (r.xl + r.xr) / 2;
        const angle = interpolate(paddle.xl, paddle.xr, Math.PI * 3 / 4, Math.PI / 4, rx);
        const s = Math.sqrt(v[0] * v[0] + v[1] * v[1]);
        balls[i].velocity = [s * Math.cos(angle), -s * Math.sin(angle)];
        soundInfo.bounce.play();
      }
    }
    if (balls[i].yb >= CONSTANTS.height) {
      balls[i].isActive = false;
      soundInfo.lostball.play();
      if (++ballsPlayed < CONSTANTS.ballCount)
        spawnBall();
      else
        gameOver = true;

    }
  }
  for (let i = 0; i < bricks.length; ++i) {
    for (let j = 0; j < balls.length; ++j) {
      if (bricks[i].isActive && bricks[i].overlaps(balls[j])) {
        const hash = bricks[i].id + ',' + balls[j].id;
        newCollisions.add(hash);
        if (!collisions.has(hash)) {
          const v = balls[j].velocity;

          const r = intersection(bricks[i], balls[j]);
          if (r.xr - r.xl > r.yb - r.yt)
            v[1] = -v[1];
          else
            v[0] = -v[0];

          balls[j].velocity = v;

          const explosion = new Explosion(textureInfo.explosion, bricks[i].center);
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
  for (let i = 0; i < balls.length; ++i) {
    const bounce = balls[i].constrain(CONSTANTS.width, CONSTANTS.height, true);
    if (bounce)
      soundInfo.bounce.play();
  }

  //gameOver = burger.health() == 0;
  if (gameOver) {
    const gameOverElement = document.getElementById('gameover');
    gameOverElement.style.display = 'block';
    gameOverElement.style.top = CONSTANTS.height * .5 + 'px';
    gameOverElement.style.left = (CONSTANTS.width / 2 - gameOverElement.offsetWidth / 2) + 'px';
    Sound.soundOn = false;
  }

  document.getElementById('score').textContent = score;

  removeInactive(balls);
  removeInactive(bricks);
  removeInactive(explosions);

  const rectXYUV = [];
  for (let i = 0; i < sprites.length; ++i) {
    if (sprites[i].isActive)
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
    overlayDiv.style.top = (webGLCanvas.height - overlayDiv.offsetHeight) + 'px';
    overlayDiv.className = 'nofocus';
    const soundElement = document.getElementById('sound');
    soundElement.checked = Sound.soundOn;
    const gamepadElement = document.getElementById('gamepad');
    gamepadElement.checked = gamepadOn;

    overlayDiv.addEventListener('mouseover',     function(e) { overlayDiv.className = 'focus'; },       false);
    overlayDiv.addEventListener('mouseout',      function(e) { overlayDiv.className = 'nofocus'; },     false);
    soundElement.addEventListener('change',      function(e) { Sound.soundOn = soundElement.checked; }, false);
    gamepadElement.addEventListener('change',    function(e) { gamepadOn = gamepadElement.checked; },   false);

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
    gl = initGL(webGLCanvas, spriteSheetCanvas, [100, 149, 237]);

    spawnBall();
    paddle = new Paddle(textureInfo.paddle, [CONSTANTS.width / 2, CONSTANTS.height * .85]);
    addBricks();

    window.requestAnimationFrame(draw);
  }
}

class BallTexture extends GraphicTexture {
  constructor(width, height) {
    super();
    this.width = width;
    this.height = height;
  }

  draw(context) {
    context.beginPath();
    const radius = this.width / 2 - 1;
    context.arc(this.x + this.width / 2, this.y + this.height / 2, radius, 0, 2 * Math.PI, false);
    context.fillStyle = 'green';
    context.fill();
    context.lineWidth = 3;
    context.strokeStyle = '#003300';
    context.stroke();
  }
}

class PaddleTexture extends GraphicTexture {
  constructor(width, height) {
    super();
    this.width = width;
    this.height = height;
  }

  draw(context) {
    const x = this.x;
    const y = this.y;
    const width = this.width;
    const height = this.height;
    const radius = 3;

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
}

class BrickTexture extends GraphicTexture {
  constructor(width, height) {
    super();
    this.width = width;
    this.height = height;
  }

  draw(context) {
    const x = this.x;
    const y = this.y;
    const width = this.width;
    const height = this.height;
    const radius = 7;

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
}

const textureInfo = {
  ball:      new BallTexture(12, 12),
  paddle:    new PaddleTexture(100, 12),
  brick:     new BrickTexture(80, 24),
  explosion: new ImageTexture('../lib/img/explosion.png', maybeRun),
};

const soundInfo = {
  brickhit: new Sound('../lib/snd/shot.mp3',   1.0, maybeRun),
  lostball: new Sound('../lib/snd/launch.mp3', 1.0, maybeRun),
  bounce:   new Sound('../lib/snd/boing.mp3',  1.0, maybeRun),
};

let nToLoad = 1 + Object.keys(soundInfo).length + 1;

window.onload = function(e) {
  maybeRun();
};

window.onerror = function(msg, url, line, col, error) {
  alert(msg + '\n' + url + '\nline: ' + line + '\ncol: ' + col + '\nerror: ' + error);
};
