export class Ball {
  constructor({ x = 0, y = 0, r = 6, vx = 0, vy = -1, speed = 320 } = {}) {
    this.x = x;
    this.y = y;
    this.r = r;

    this.vx = vx;
    this.vy = vy;

    this.speed = speed;
    this.stuck = true;
  }

  stickToPaddle(paddle) {
    this.stuck = true;
    this.x = paddle.x + paddle.w / 2;
    this.y = paddle.y - this.r - 2;
    this.vx = 0;
    this.vy = -this.speed;
  }

  launch(angleRad = (-60 * Math.PI) / 180, power = 1) {
    this.stuck = false;
    const s = this.speed * power;
    this.vx = Math.cos(angleRad) * s;
    this.vy = Math.sin(angleRad) * s;
  }

  update(dt, paddle = null) {
    if (this.stuck && paddle) {
      this.x = paddle.x + paddle.w / 2;
      this.y = paddle.y - this.r - 2;
      return;
    }
    this.x += this.vx * dt;
    this.y += this.vy * dt;
  }

  setSpeed(newSpeed) {
    this.speed = newSpeed;
    const len = Math.hypot(this.vx, this.vy) || 1;
    this.vx = (this.vx / len) * this.speed;
    this.vy = (this.vy / len) * this.speed;
  }
}
