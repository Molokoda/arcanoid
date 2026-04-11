import { Game } from "./game/Game.js";

const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d", { alpha: false });

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
  if (!input.pointerDown) return;
  onPointer(e);
});
canvas.addEventListener("pointerup", () => {
  input.pointerDown = false;
});
canvas.addEventListener("pointercancel", () => {
  input.pointerDown = false;
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

  game.update(dt);
  game.render();
}

resize();
window.addEventListener("resize", resize);

requestAnimationFrame(frame);
