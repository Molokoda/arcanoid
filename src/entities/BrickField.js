export class BrickField {
  constructor({
    worldW = 360,
    wall = 8,
    cols = 10,
    rows = 7,
    gap = 4,
    brickH = 18,
    topOffset = 72
  } = {}) {
    this.worldW = worldW;
    this.wall = wall;

    this.cols = cols;
    this.rows = rows;

    this.gap = gap;
    this.brickH = brickH;
    this.topOffset = topOffset;

    this.bricks = [];
  }

  clear() {
    this.bricks.length = 0;
  }

  get brickW() {
    const areaW = this.worldW - this.wall * 2;
    return (areaW - this.gap * (this.cols - 1)) / this.cols;
  }

  loadFromMatrix(matrix) {
    this.clear();
    const bw = this.brickW;

    const rows = matrix.length;
    for (let r = 0; r < rows; r++) {
      const row = matrix[r] || [];
      for (let c = 0; c < this.cols; c++) {
        const hp = row[c] | 0;
        if (hp <= 0) continue;

        const x = this.wall + c * (bw + this.gap);
        const y = this.topOffset + r * (this.brickH + this.gap);

        this.bricks.push({
          x,
          y,
          w: bw,
          h: this.brickH,
          hp,
          maxHp: hp,
          score: hp * 10
        });
      }
    }
  }

  get aliveCount() {
    let n = 0;
    for (const b of this.bricks) if (b.hp > 0) n++;
    return n;
  }

  forEachAlive(fn) {
    for (let i = 0; i < this.bricks.length; i++) {
      const b = this.bricks[i];
      if (b.hp > 0) fn(b, i);
    }
  }

  damage(brick, amount = 1) {
    if (brick.hp <= 0) return false;
    brick.hp = Math.max(0, brick.hp - amount);
    return brick.hp === 0;
  }

  render(ctx, palette = {}) {
    const hp1 = palette.hp1 ?? "#2DD4BF";
    const hp2 = palette.hp2 ?? "#60A5FA";
    const hp3 = palette.hp3 ?? "#F97316";
    const stroke = palette.stroke ?? "rgba(255,255,255,0.08)";

    for (const b of this.bricks) {
      if (b.hp <= 0) continue;

      ctx.fillStyle = b.maxHp >= 3 ? hp3 : b.maxHp === 2 ? hp2 : hp1;
      ctx.fillRect(b.x, b.y, b.w, b.h);

      ctx.strokeStyle = stroke;
      ctx.strokeRect(b.x + 0.5, b.y + 0.5, b.w - 1, b.h - 1);

      if (b.maxHp > 1) {
        const k = b.hp / b.maxHp;
        ctx.fillStyle = "rgba(0,0,0,0.25)";
        ctx.fillRect(b.x, b.y, b.w, 3);
        ctx.fillStyle = "rgba(255,255,255,0.6)";
        ctx.fillRect(b.x, b.y, b.w * k, 3);
      }
    }
  }
}
