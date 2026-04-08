export function clamp(v, min, max) {
  return Math.max(min, Math.min(max, v));
}

export function reflectX(ball) {
  ball.vx = -ball.vx;
}

export function reflectY(ball) {
  ball.vy = -ball.vy;
}

export function normalizeVelocity(ball, speed) {
  const len = Math.hypot(ball.vx, ball.vy) || 1;
  ball.vx = (ball.vx / len) * speed;
  ball.vy = (ball.vy / len) * speed;
}

export function circleAabbMTV(ball, box) {
  const closestX = clamp(ball.x, box.x, box.x + box.w);
  const closestY = clamp(ball.y, box.y, box.y + box.h);

  const dx = ball.x - closestX;
  const dy = ball.y - closestY;

  const dist2 = dx * dx + dy * dy;
  const r = ball.r;

  if (dist2 > r * r) return null;

  if (dist2 === 0) {
    const left = Math.abs(ball.x - box.x);
    const right = Math.abs(box.x + box.w - ball.x);
    const top = Math.abs(ball.y - box.y);
    const bottom = Math.abs(box.y + box.h - ball.y);

    const minSide = Math.min(left, right, top, bottom);
    if (minSide === left) return { nx: -1, ny: 0, depth: r };
    if (minSide === right) return { nx: 1, ny: 0, depth: r };
    if (minSide === top) return { nx: 0, ny: -1, depth: r };
    return { nx: 0, ny: 1, depth: r };
  }

  const dist = Math.sqrt(dist2);
  const depth = r - dist;
  const nx = dx / dist;
  const ny = dy / dist;

  return { nx, ny, depth };
}

export function resolveBallAabb(ball, box, opts = {}) {
  const mtv = circleAabbMTV(ball, box);
  if (!mtv) return false;

  const bounce = opts.bounce ?? 1;
  const epsilon = opts.epsilon ?? 0.01;

  ball.x += mtv.nx * (mtv.depth + epsilon);
  ball.y += mtv.ny * (mtv.depth + epsilon);

  const dot = ball.vx * mtv.nx + ball.vy * mtv.ny;
  ball.vx = (ball.vx - 2 * dot * mtv.nx) * bounce;
  ball.vy = (ball.vy - 2 * dot * mtv.ny) * bounce;

  return true;
}

export function resolveBallWalls(ball, world, opts = {}) {
  const bounce = opts.bounce ?? 1;
  const epsilon = opts.epsilon ?? 0.01;

  let hit = false;
  const left = world.wall ?? 0;
  const top = world.wall ?? 0;
  const right = world.w - (world.wall ?? 0);

  if (ball.x - ball.r < left) {
    ball.x = left + ball.r + epsilon;
    ball.vx = Math.abs(ball.vx) * bounce;
    hit = true;
  }

  if (ball.x + ball.r > right) {
    ball.x = right - ball.r - epsilon;
    ball.vx = -Math.abs(ball.vx) * bounce;
    hit = true;
  }

  if (ball.y - ball.r < top) {
    ball.y = top + ball.r + epsilon;
    ball.vy = Math.abs(ball.vy) * bounce;
    hit = true;
  }

  return hit;
}

export function bounceBallFromPaddle(ball, paddle, speed, maxAngleDeg = 60) {
  const hit = resolveBallAabb(ball, paddle, { bounce: 1 });
  if (!hit) return false;

  if (ball.vy < 0) {
    normalizeVelocity(ball, speed);
    return true;
  }

  const center = paddle.x + paddle.w / 2;
  const t = clamp((ball.x - center) / (paddle.w / 2), -1, 1);

  const maxA = (maxAngleDeg * Math.PI) / 180;
  const angle = t * maxA;

  ball.vx = speed * Math.sin(angle);
  ball.vy = -speed * Math.cos(angle);

  const minVX = 0.12 * speed;
  if (Math.abs(ball.vx) < minVX) {
    ball.vx = Math.sign(ball.vx || 1) * minVX;
    const vySign = Math.sign(ball.vy || -1);
    ball.vy =
      vySign * Math.sqrt(Math.max(0, speed * speed - ball.vx * ball.vx));
  }

  return true;
}
