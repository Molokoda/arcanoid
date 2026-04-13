import { Game } from "./game/Game.js";

const canvas = document.getElementById("canvas");
if (!(canvas instanceof HTMLCanvasElement)) {
  throw new Error('Canvas element with id "canvas" not found.');
}

const ctx = canvas.getContext("2d", { alpha: false });
if (!ctx) {
  throw new Error("Failed to create 2D canvas context.");
}

const WORLD_W = 360;
const WORLD_H = 640;

const view = {
  dpr: 1,
  scale: 1,
  offsetX: 0,
  offsetY: 0
};

const input = {
  pointerDown: false,
  left: false,
  right: false,
  launchPressed: false,
  worldX: WORLD_W / 2,
  worldY: WORLD_H / 2
};

function clamp(v, a, b) {
  return Math.max(a, Math.min(b, v));
}

function resize() {
  const rect = canvas.getBoundingClientRect();
  const cssW = Math.max(1, rect.width);
  const cssH = Math.max(1, rect.height);

  view.dpr = Math.max(1, window.devicePixelRatio || 1);

  view.scale = Math.min(cssW / WORLD_W, cssH / WORLD_H);

  view.offsetX = (cssW - WORLD_W * view.scale) / 2;
  view.offsetY = (cssH - WORLD_H * view.scale) / 2;

  canvas.width = Math.round(cssW * view.dpr);
  canvas.height = Math.round(cssH * view.dpr);

  ctx.setTransform(
    view.dpr * view.scale,
    0,
    0,
    view.dpr * view.scale,
    view.dpr * view.offsetX,
    view.dpr * view.offsetY
  );

  ctx.imageSmoothingEnabled = true;
}

function screenToWorld(clientX, clientY) {
  const rect = canvas.getBoundingClientRect();
  const xCss = clientX - rect.left;
  const yCss = clientY - rect.top;

  const xWorld = (xCss - view.offsetX) / view.scale;
  const yWorld = (yCss - view.offsetY) / view.scale;

  return {
    x: clamp(xWorld, 0, WORLD_W),
    y: clamp(yWorld, 0, WORLD_H)
  };
}

function onPointer(e) {
  const p = screenToWorld(e.clientX, e.clientY);
  input.worldX = p.x;
  input.worldY = p.y;
}

canvas.style.touchAction = "none";
canvas.addEventListener("pointerdown", (e) => {
  input.pointerDown = true;
  canvas.setPointerCapture?.(e.pointerId);
  onPointer(e);
});
canvas.addEventListener("pointermove", (e) => {
  onPointer(e);
});
canvas.addEventListener("pointerup", () => {
  input.pointerDown = false;
});
canvas.addEventListener("pointercancel", () => {
  input.pointerDown = false;
});

window.addEventListener("keydown", (e) => {
  if (e.code === "ArrowLeft") input.left = true;
  if (e.code === "ArrowRight") input.right = true;
  if (e.code === "Space") {
    input.launchPressed = true;
    e.preventDefault();
  }
});

window.addEventListener("keyup", (e) => {
  if (e.code === "ArrowLeft") input.left = false;
  if (e.code === "ArrowRight") input.right = false;
});

let paused = false;
document.addEventListener("visibilitychange", () => {
  paused = document.hidden;
});

const game = new Game({
  ctx,
  W: WORLD_W,
  H: WORLD_H,
  input
});

let prev = performance.now();

function frame(now) {
  requestAnimationFrame(frame);

  if (paused) {
    prev = now;
    return;
  }

  let dt = (now - prev) / 1000;
  prev = now;

  dt = Math.min(dt, 1 / 30);

  const keySpeed = 520;
  const dir = (input.right ? 1 : 0) - (input.left ? 1 : 0);
  if (dir !== 0) {
    input.worldX = clamp(input.worldX + dir * keySpeed * dt, 0, WORLD_W);
  }

  game.update(dt);
  game.render();
}

resize();
window.addEventListener("resize", resize);

requestAnimationFrame(frame);
