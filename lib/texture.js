export class Texture {
  constructor() {}

  draw(context) {}

  set uv(value) {
    [this.ul, this.ur, this.vt, this.vb] = value;
  }

  saveClip(context) {
    context.save();
    context.beginPath();
    context.rect(this.x, this.y, this.width, this.height);
    context.closePath();
    context.clip();
  }

  restoreClip(context) {
    context.restore();
  }
}

export class ImageTexture extends Texture {
  constructor(url, onLoad) {
    super();

    this.image = new Image();
    const thisthis = this;

    this.image.onload = function() {
      thisthis.width = thisthis.image.width;
      thisthis.height = thisthis.image.height;
      onLoad();
    };
    this.image.src = url;
  }

  draw(context) {
    context.drawImage(this.image, this.x, this.y);
  }
}

export class GraphicTexture extends Texture {
  constructor(width, height) {
    super();
    this.width = width;
    this.height = height;
  }
}

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
