import { Ball } from "../entities/Ball.js";
import { Paddle } from "../entities/Paddle.js";
import { BrickField } from "../entities/BrickField.js";
import { HUD } from "../ui/HUD.js";
import { LevelManager } from "./LevelManager.js";
import { SFX } from "../audio/SFX.js";

import {
  resolveBallWalls,
  bounceBallFromPaddle,
  resolveBallAabb,
  normalizeVelocity,
  clamp
} from "../systems/Collision.js";

export class Game {
  constructor({ ctx, W = 360, H = 640, input }) {
    this.ctx = ctx;
    this.W = W;
    this.H = H;
    this.input = input;

    this.wall = 8;

    this.levels = new LevelManager();
    this.bricks = new BrickField({
      worldW: W,
      wall: this.wall,
      cols: 10,
      gap: 4,
      brickH: 18,
      topOffset: 72
    });

    this.paddle = new Paddle({
      worldW: W,
      w: 88,
      h: 14,
      margin: this.wall,
      speed: 900,
      x: (W - 88) / 2,
      y: H - 48
    });

    this.ball = new Ball({ r: 6, speed: 320 });
    this.ball.stickToPaddle(this.paddle);

    this.hud = new HUD({ worldW: W });
    this.sfx = new SFX({ volume: 0.5, muted: false });

    this.score = 0;
    this.lives = 3;

    this.state = "serve";
    this.stateT = 0;

    this.prevPointerDown = false;

    this.loadLevel(0);
  }

  loadLevel(index0) {
    this.levels.index = clamp(index0, 0, this.levels.count - 1);
    this.levels.loadInto(this.bricks);

    const base = 320;
    const speed = Math.min(420, base + this.levels.index * 20);
    this.ball.setSpeed(speed);

    this.state = "serve";
    this.stateT = 0;

    this.ball.stickToPaddle(this.paddle);
  }

  loseLife() {
    this.sfx.loseLife();
    this.lives -= 1;
    if (this.lives <= 0) {
      this.state = "gameOver";
      this.stateT = 0;
      return;
    }
    this.state = "serve";
    this.stateT = 0;
    this.ball.stickToPaddle(this.paddle);
  }

  tryAdvanceLevel() {
    const advanced = this.levels.advanceInto(this.bricks);
    if (!advanced) {
      this.loadLevel(0);
      this.score += 500;
      return;
    }

    const speed = Math.min(420, 320 + this.levels.index * 20);
    this.ball.setSpeed(speed);

    this.state = "serve";
    this.stateT = 0;
    this.ball.stickToPaddle(this.paddle);
  }

  pointerJustPressed() {
    const down = !!this.input?.pointerDown;
    const just = down && !this.prevPointerDown;
    this.prevPointerDown = down;
    return just;
  }

  update(dt) {
    this.stateT += dt;

    if (this.input) this.paddle.setTargetCenterX(this.input.worldX);
    this.paddle.update(dt);

    if (this.state === "serve") {
      this.ball.update(dt, this.paddle);

      if (this.pointerJustPressed()) {
        this.sfx.init();
        const angleDeg = -90 + (Math.random() * 30 - 15);
        this.ball.launch((angleDeg * Math.PI) / 180, 1);
        this.sfx.bounce();
        normalizeVelocity(this.ball, this.ball.speed);
        this.state = "playing";
        this.stateT = 0;
      }
      return;
    }

    if (this.state === "levelComplete") {
      if (this.stateT >= 0.9) this.tryAdvanceLevel();
      return;
    }

    if (this.state === "gameOver") {
      if (this.pointerJustPressed()) {
        this.score = 0;
        this.lives = 3;
        this.loadLevel(0);
      }
      return;
    }

    this.ball.update(dt);

    if (
      resolveBallWalls(this.ball, { w: this.W, h: this.H, wall: this.wall })
    ) {
      this.sfx.bounce();
    }

    if (bounceBallFromPaddle(this.ball, this.paddle, this.ball.speed)) {
      this.sfx.bounce();
    }

    let hitBrick = false;
    this.bricks.forEachAlive((b) => {
      if (hitBrick) return;
      if (resolveBallAabb(this.ball, b, { epsilon: 0.02 })) {
        hitBrick = true;

        const destroyed = this.bricks.damage(b, 1);
        this.sfx.brickHit(b.maxHp);
        if (destroyed) this.sfx.brickBreak();
        this.score += destroyed ? b.score : 0;
      }
    });

    if (this.ball.y - this.ball.r > this.H + 2) {
      this.loseLife();
      return;
    }

    if (this.bricks.aliveCount === 0) {
      this.score += 200;
      this.sfx.levelComplete();
      this.state = "levelComplete";
      this.stateT = 0;
    }
  }

  render() {
    const ctx = this.ctx;

    ctx.fillStyle = "#0B1020";
    ctx.fillRect(0, 0, this.W, this.H);

    this.bricks.render(ctx);

    ctx.fillStyle = "#7C5CFF";
    ctx.fillRect(this.paddle.x, this.paddle.y, this.paddle.w, this.paddle.h);

    ctx.fillStyle = "#FFFFFF";
    ctx.beginPath();
    ctx.arc(this.ball.x, this.ball.y, this.ball.r, 0, Math.PI * 2);
    ctx.fill();

    let stateText = "";
    let hintText = "";

    if (this.state === "serve") {
      stateText = "Tap / Click to launch";
      hintText = "Move to aim";
    } else if (this.state === "levelComplete") {
      stateText = "Level complete";
      hintText = "Next...";
    } else if (this.state === "gameOver") {
      stateText = "Game over";
      hintText = "Tap / Click to restart";
    }

    this.hud.render(ctx, {
      score: this.score,
      lives: this.lives,
      level: this.levels.levelNumber,
      stateText,
      hintText
    });
  }
}
