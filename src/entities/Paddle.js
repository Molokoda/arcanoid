export class Paddle {
  constructor({
    x = 0,
    y = 0,
    w = 88,
    h = 14,
    worldW = 360,
    margin = 8,
    speed = 800
  } = {}) {
    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;

    this.worldW = worldW;
    this.margin = margin;

    this.speed = speed;
    this.targetX = x;
  }

  get centerX() {
    return this.x + this.w / 2;
  }

  setCenterX(cx) {
    this.x = cx - this.w / 2;
    this.clampToWorld();
  }

  clampToWorld() {
    const minX = this.margin;
    const maxX = this.worldW - this.margin - this.w;
    if (this.x < minX) this.x = minX;
    if (this.x > maxX) this.x = maxX;
  }

  setTargetCenterX(cx) {
    const minCX = this.margin + this.w / 2;
    const maxCX = this.worldW - this.margin - this.w / 2;
    this.targetX = Math.max(minCX, Math.min(maxCX, cx));
  }

  update(dt) {
    const desiredX = this.targetX - this.w / 2;
    const dx = desiredX - this.x;
    const maxStep = this.speed * dt;

    if (Math.abs(dx) <= maxStep) {
      this.x = desiredX;
    } else {
      this.x += Math.sign(dx) * maxStep;
    }

    this.clampToWorld();
  }

  setWidth(w) {
    const cx = this.centerX;
    this.w = w;
    this.setCenterX(cx);
  }
}
