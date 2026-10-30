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
    this.needsRender = true;
    this.offscreenGrid = null;

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
      this.canvas.style.width = this.width + 'px';
      this.canvas.style.height = this.height + 'px';
      if (this.ctx) {
        this.ctx.setTransform(1, 0, 0, 1, 0, 0);
        this.ctx.scale(this.dpr, this.dpr);
      }
    }
    this.buildOffscreenGrid();
    this.needsRender = true;
  }

  buildOffscreenGrid() {
    if (!this.width || !this.height) return;
    this.offscreenGrid = document.createElement('canvas');
    this.offscreenGrid.width = Math.floor(this.width * this.dpr);
    this.offscreenGrid.height = Math.floor(this.height * this.dpr);
    const offCtx = this.offscreenGrid.getContext('2d');
    if (!offCtx) return;

    offCtx.scale(this.dpr, this.dpr);
    const gridSize = 56;
    const dotRadius = 0.8;
    const offsetX = (this.width % gridSize) / 2;
    const offsetY = (this.height % gridSize) / 2;

    offCtx.fillStyle = 'rgba(15, 23, 42, 0.04)';
    for (let x = offsetX; x < this.width; x += gridSize) {
      for (let y = offsetY; y < this.height; y += gridSize) {
        offCtx.beginPath();
        offCtx.arc(x, y, dotRadius, 0, Math.PI * 2);
        offCtx.fill();
      }
    }
  }

  setStoryPos(pos, globalProg = 0) {
    if (Math.abs(this.targetStoryPos - pos) > 0.0001 || Math.abs(this.targetGlobalProgress - globalProg) > 0.0001) {
      this.targetStoryPos = pos;
      this.targetGlobalProgress = globalProg;
      this.needsRender = true;
    }
  }

  render(timestamp = 0) {
    if (!this.ctx || !this.active) return;

    const diffStory = Math.abs(this.targetStoryPos - this.storyPos);
    const diffGlobal = Math.abs(this.targetGlobalProgress - this.globalProgress);

    // If settled and already rendered, do zero work
    if (!this.needsRender && diffStory < 0.0001 && diffGlobal < 0.0001) {
      return;
    }

    if (diffStory < 0.0001 && diffGlobal < 0.0001) {
      this.storyPos = this.targetStoryPos;
      this.globalProgress = this.targetGlobalProgress;
      this.needsRender = false;
    } else {
      this.storyPos += (this.targetStoryPos - this.storyPos) * 0.12;
      this.globalProgress += (this.targetGlobalProgress - this.globalProgress) * 0.12;
    }

    const ctx = this.ctx;
    ctx.clearRect(0, 0, this.width, this.height);

    // 1. Draw cached offscreen dot grid in a single ultra-fast blit
    if (this.offscreenGrid) {
      ctx.drawImage(this.offscreenGrid, 0, 0, this.width, this.height);
    }

    // 2. Technical Subtle Hairline Axis (Follows Story Progress)
    const gridSize = 56;
    const offsetX = (this.width % gridSize) / 2;
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
