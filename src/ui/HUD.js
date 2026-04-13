export class HUD {
  constructor({
    worldW = 360,
    worldH = 640,
    padding = 10,
    color = "#E6EAF2",
    muted = "rgba(230,234,242,0.65)"
  } = {}) {
    this.worldW = worldW;
    this.worldH = worldH;
    this.padding = padding;
    this.color = color;
    this.muted = muted;

    this.font = "14px system-ui, -apple-system, Segoe UI, Roboto, Arial";
    this.fontBig = "18px system-ui, -apple-system, Segoe UI, Roboto, Arial";
  }

  render(
    ctx,
    { score = 0, lives = 3, level = 1, stateText = "", hintText = "" } = {}
  ) {
    ctx.save();
    ctx.font = this.font;
    ctx.fillStyle = this.color;
    ctx.textBaseline = "top";

    const y = this.padding;

    ctx.textAlign = "left";
    ctx.fillText(`Score: ${score}`, this.padding, y);

    ctx.textAlign = "center";
    ctx.fillStyle = this.muted;
    ctx.fillText(`Level ${level}`, this.worldW / 2, y);

    ctx.textAlign = "right";
    ctx.fillStyle = this.color;
    ctx.fillText(`Lives: ${lives}`, this.worldW - this.padding, y);

    if (stateText) {
      ctx.font = this.fontBig;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";

      ctx.fillStyle = "rgba(0,0,0,0.35)";
      const panelW = this.worldW - 48;
      const panelH = Math.round(this.worldH * 0.14);
      const panelX = Math.round((this.worldW - panelW) / 2);
      const panelY = Math.round(this.worldH * 0.42);
      ctx.fillRect(panelX, panelY, panelW, panelH);

      ctx.fillStyle = this.color;
      const cx = this.worldW / 2;
      const cy = panelY + panelH / 2;
      ctx.fillText(stateText, cx, cy - 10);

      if (hintText) {
        ctx.font = this.font;
        ctx.fillStyle = this.muted;
        ctx.fillText(hintText, cx, cy + 16);
      }
    }

    ctx.restore();
  }
}
