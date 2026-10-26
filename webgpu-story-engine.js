/* ============================================================================
   KIYOEDU SCROLLYTELLING ENGINE · SUBTLE MINIMALIST TECHNICAL CANVAS
   Engineered under Scrollytelling Website Master Principles
   High Performance · Zero AI Glow · Zero Blurry Shadows · Pure Hairline Grid
   ============================================================================ */

export class ScrollytellingEngine {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas ? canvas.getContext('2d') : null;
    this.storyPos = 0;
    this.targetStoryPos = 0;
    this.globalProgress = 0;
    this.targetGlobalProgress = 0;
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.active = true;

    this.resize();
  }

  async init() {
    this.resize();
    return 'canvas2d-editorial-master';
  }

  resize() {
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    if (this.canvas) {
      this.canvas.width = Math.floor(this.width * this.dpr);
      this.canvas.height = Math.floor(this.height * this.dpr);
      this.canvas.style.width = `${this.width}px`;
      this.canvas.style.height = `${this.height}px`;
      if (this.ctx) {
        this.ctx.setTransform(1, 0, 0, 1, 0, 0);
        this.ctx.scale(this.dpr, this.dpr);
      }
    }
  }

  setStoryPos(pos, globalProg = 0) {
    this.targetStoryPos = pos;
    this.targetGlobalProgress = globalProg;
  }

  render(timestamp = 0) {
    if (!this.ctx || !this.active) return;

    // Smooth spring interpolation for scroll progress
    this.storyPos += (this.targetStoryPos - this.storyPos) * 0.10;
    this.globalProgress += (this.targetGlobalProgress - this.globalProgress) * 0.10;

    const ctx = this.ctx;
    ctx.clearRect(0, 0, this.width, this.height);

    // 1. Subtle Minimalist Dot Grid (spacing: 56px)
    const gridSize = 56;
    const dotRadius = 0.8;
    const offsetX = (this.width % gridSize) / 2;
    const offsetY = (this.height % gridSize) / 2;

    ctx.fillStyle = 'rgba(15, 23, 42, 0.04)';

    for (let x = offsetX; x < this.width; x += gridSize) {
      for (let y = offsetY; y < this.height; y += gridSize) {
        ctx.beginPath();
        ctx.arc(x, y, dotRadius, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // 2. Technical Subtle Hairline Axis (Follows Story Progress)
    const axisY = (this.height * 0.25) + (this.globalProgress * (this.height * 0.5));
    ctx.strokeStyle = 'rgba(37, 99, 235, 0.05)';
    ctx.lineWidth = 1;
    ctx.setLineDash([4, 12]);
    ctx.beginPath();
    ctx.moveTo(offsetX, axisY);
    ctx.lineTo(this.width - offsetX, axisY);
    ctx.stroke();
    ctx.setLineDash([]);
  }
}
