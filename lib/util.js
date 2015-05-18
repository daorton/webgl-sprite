// http://en.wikipedia.org/wiki/Elastic_collision#Two-Dimensional_Collision_With_Two_Moving_Objects
export function bounceCenter(x1, v1, m1, x2, v2, m2) {
  const v = [v1[0] - v2[0], v1[1] - v2[1]];
  const x = [x1[0] - x2[0], x1[1] - x2[1]];
  const l = Math.max(x[0] * x[0] + x[1] * x[1], 1);
  const d = 2 / (m1 + m2) * (v[0] * x[0] + v[1] * x[1]) / l;
  let s = m2 * d;
  const ov1 = [v1[0] - s * x[0], v1[1] - s * x[1]];
  s = m1 * d;
  const ov2 = [v2[0] + s * x[0], v2[1] + s * x[1]];
  //console.log((v1[0] * v1[0] + v2[0] * v2[0] + v1[1] * v1[1] + v2[1] * v2[1] - (ov1[0] * ov1[0] + ov2[0] * ov2[0] + ov1[1] * ov1[1] + ov2[1] * ov2[1])).toFixed(4));
  //console.log((v1[0] + v2[0] - (ov1[0] + ov2[0])).toFixed(4), (v1[1] + v2[1] - (ov1[1] + ov2[1])).toFixed(4));
  return [ov1, ov2];
}

export function removeInactive(sprites, width, height) {
  let k = 0;
  for (let i = 0; i < sprites.length; ++i) {
    if (sprites[i].isActive) {
      if (width && height) {
        const r = sprites[i].rect;
        if (r.xr < 0 || r.xl > width || r.yb < 0 || r.yt > height)
          continue;
      }
      sprites[k++] = sprites[i];
    }
  }
  sprites.length = k;
}

// http://codeincomplete.com/posts/2011/5/7/bin_packing/
export function pack(blocks, totalWidth, totalHeight) { // blocks have width and height, this sets x and y properties
  blocks.sort((b1, b2) => Math.max(b2.width, b2.height) - Math.max(b1.width, b1.height));

  function findNode(node, width, height) {
    if (node.right)
      return findNode(node.right, width, height) || findNode(node.down, width, height);
    else if (width <= node.w && height <= node.h)
      return node;
    else
      return null;
  }

  const root = {x: 0, y: 0, w: totalWidth, h: totalHeight};
  for (let i = 0; i < blocks.length; ++i) {
    const block = blocks[i];
    const node = findNode(root, block.width, block.height);
    if (node) {
      node.right = {x: node.x + block.width, y: node.y,                w: node.w - block.width, h: block.height         };
      node.down  = {x: node.x,               y: node.y + block.height, w: node.w,               h: node.h - block.height};
      block.x = node.x;
      block.y = node.y;
    } else
      return false;
  }
  return true;
}

export function buildSpriteSheet(textureInfo) {
  const textures = [];
  let minArea = 0;
  let minSide = 0;
  for (let key in textureInfo) {
    const texture = textureInfo[key];
    textures.push(texture);
    texture.width += 2; // allow for 1 pixel space between textures
    texture.height += 2;
    minArea = Math.max(minArea, texture.width * texture.height);
    minSide = Math.max(minSide, texture.width, texture.height);
  }

  let size = 16;
  while (size < minSide || size * size < minArea || !pack(textures, size, size))
    size *= 2;

  const canvas = document.createElement('canvas'); // never visible so not added to DOM
  canvas.width  = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');

  textures.forEach(function(texture) {
    texture.width -= 2;
    texture.height -= 2;
    texture.x += 1;
    texture.y += 1;
    texture.draw(ctx);
    texture.uv = [texture.x / size, (texture.x + texture.width) / size, 1.0 - texture.y / size, 1.0 - (texture.y + texture.height) / size];
  });

  return canvas;
}

export function scanGamepads() {
  if (navigator.getGamepads) {
    const gamepads = navigator.getGamepads();
    for (let i = 0; i < gamepads.length; ++i) {
      if (gamepads[i])
        return gamepads[i];
    }
  }
  return null;
}

export function intersection(rect1, rect2) {
  const xl = Math.max(rect1.xl, rect2.xl);
  const xr = Math.min(rect1.xr, rect2.xr);
  const yt = Math.max(rect1.yt, rect2.yt);
  const yb = Math.min(rect1.yb, rect2.yb);
  return {xl: xl, xr: xr, yt: yt, yb: yb, empty: (xl >= xr || yt >= yb)};
}

export function interpolate(x1, x2, y1, y2, x) {
  return (x - x1) * (y2 - y1) / (x2 - x1) + y1;
}
