let id = 0;

export class Sprite {
  constructor(texture, options) {
    this.texture = texture;
    this.frameCount = options.frameCount || 1;
    this.frameColumns = options.frameColumns || this.frameCount;
    this.frameRows = options.frameRows || this.frameCount / this.frameColumns;
    this.frameTimeMS = options.frameTimeMS || 0;
    this.xl = options.center[0] - texture.width  / this.frameColumns / 2;
    this.xr = options.center[0] + texture.width  / this.frameColumns / 2;
    this.yt = options.center[1] - texture.height / this.frameRows    / 2;
    this.yb = options.center[1] + texture.height / this.frameRows    / 2;
    this.vel = options.velocity || [0, 0];

    this.active = true;
    this.spriteTimeMS = -1;
    this.frame = 0;

    this.id = ++id;
  }

  update(deltaTimeMS, mouseState, gamepad) {
    if (!this.active)
      return;

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

    const dx = deltaTimeMS * this.vel[0];
    const dy = deltaTimeMS * this.vel[1];
    this.xl += dx;
    this.xr += dx;
    this.yt += dy;
    this.yb += dy;
  }

  draw(xyuv) {
    if (!this.active)
      return;
    const uv = this.getTextureUV();
    xyuv.push(this.xl, this.yb,  uv.ul, uv.vb,  // two triangles
              this.xr, this.yt,  uv.ur, uv.vt,
              this.xl, this.yt,  uv.ul, uv.vt,
              this.xl, this.yb,  uv.ul ,uv.vb,
              this.xr, this.yb,  uv.ur, uv.vb,
              this.xr, this.yt,  uv.ur, uv.vt);
  }

  get rect() {
    return {xl: this.xl, xr: this.xr, yt: this.yt, yb: this.yb};
  }

  set rect(value) {
    [this.xl, this.xr, this.yt, this.yb] = value;
  }

  get center() {
    return [(this.xl + this.xr) / 2, (this.yt + this.yb) / 2];
  }

  set center(value) {
    this.xl = value[0] - this.texture.width  / this.frameColumns / 2;
    this.xr = value[0] + this.texture.width  / this.frameColumns / 2;
    this.yt = value[1] - this.texture.height / this.frameRows    / 2;
    this.yb = value[1] + this.texture.height / this.frameRows    / 2;
  }

  get size() {
    return [this.texture.width / this.frameColumns, this.texture.height / this.frameRows];
  }

  get velocity() {
    return [this.vel[0], this.vel[1]];
  }

  set velocity(value) {
    this.vel = value;
  }

  get isActive() {
    return this.active;
  }

  set isActive(value) {
    this.active = value;
  }

  overlaps(sprite) {
    return this.xl < sprite.xr && this.xr > sprite.xl && this.yt < sprite.yb && this.yb > sprite.yt;
  }

  getTextureUV() {
    if (this.frameCount > 1) {
      const texture = this.texture;
      const row = Math.floor(this.frame / this.frameColumns);
      const col = this.frame - row * this.frameColumns;
      const sx = (texture.ur - texture.ul) / this.frameColumns;
      const sy = (texture.vb - texture.vt) / this.frameRows;
      return {ul: texture.ul + col * sx, ur: texture.ul + (col + 1) * sx, vt: texture.vt + row * sy, vb: texture.vt + (row + 1) * sy}
    }
    return this.texture;
  }

  constrain(width, height, bounce) {
    let ret = false;
    if (this.xl < 0) {
      this.xl = 0;
      this.xr = this.texture.width / this.frameColumns;
      if (bounce)
        this.vel[0] = -this.vel[0];
      ret = true;
    } else if (this.xr > width) {
      this.xr = width;
      this.xl = width - this.texture.width / this.frameColumns;
      if (bounce)
        this.vel[0] = -this.vel[0];
      ret = true;
    }
    if (this.yt < 0) {
      this.yt = 0;
      this.yb = this.texture.height / this.frameRows;
      if (bounce)
        this.vel[1] = -this.vel[1];
      ret = true;
    } else if (this.yb > height) {
      this.yb = height;
      this.yt = height - this.texture.height / this.frameRows;
      if (bounce)
        this.vel[1] = -this.vel[1];
      ret = true;
    }
    return ret;
  }
}
