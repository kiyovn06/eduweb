/* ============================================================================
   KIYOEDU SCROLLYTELLING ENGINE · MASTER EDITION
   Primary Renderer: WebGPU (WGSL Raymarched Optical Simulation)
   Multi-Tier Fallbacks: WebGL2 (GLSL 3.00 ES) -> Canvas 2D
   Evidence-Led Motion Design · Zero Scroll Hijacking · 100% Native Scroll
   6 Distinct Chapter Visual Scenes keyed by `act` + `progress`
   ========================================================================== */

export class ScrollytellingEngine {
  constructor(canvas) {
    this.canvas = canvas;
    this.rendererType = 'none'; // 'webgpu' | 'webgl2' | 'canvas2d'
    this.active = false;
    this.isDirty = true;

    // Story animation state — continuous unified story position [0.0 .. 5.0]
    this.storyPos = 0;
    this.targetStoryPos = 0;
    this.progress = 0;          // Fractional progress within active chapter [0, 1]
    this.targetProgress = 0;
    this.actIndex = 0;          // Continuous chapter float [0.0 .. 5.0]
    this.targetActIndex = 0;
    this.globalProgress = 0;
    this.targetGlobalProgress = 0;
    this.time = 0;
    this.aspect = 1.0;
    this.dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // WebGPU Context
    this.gpuDevice = null;
    this.gpuContext = null;
    this.gpuPipeline = null;
    this.gpuUniformBuffer = null;
    this.gpuBindGroup = null;

    // WebGL2 Context
    this.gl2 = null;
    this.gl2Program = null;
    this.gl2Uniforms = {};
    this.gl2Vao = null;

    // Canvas 2D Context
    this.ctx2d = null;

    // Interactive overrides
    this.customAperture = -1.0;
    this.customNegativeFill = -1.0;
    this.customAspectRatio = 0.0;

    // Listen to media query changes
    window.matchMedia('(prefers-reduced-motion: reduce)').addEventListener('change', (e) => {
      this.reducedMotion = e.matches;
      this.isDirty = true;
    });
  }

  // --------------------------------------------------------------------------
  // 1. ASYNCHRONOUS INITIALIZATION (WebGPU -> WebGL2 -> Canvas2D)
  // --------------------------------------------------------------------------
  async init() {
    this.resize();

    // 1. Attempt Primary WebGPU Renderer
    const webgpuSuccess = await this.initWebGPU();
    if (webgpuSuccess) {
      this.rendererType = 'webgpu';
      console.log('⚡ [KiyoEdu Scrollytelling] Primary WebGPU Renderer initialized successfully.');
      this.active = true;
      return 'webgpu';
    }

    // 2. Fallback to WebGL2
    const webgl2Success = this.initWebGL2();
    if (webgl2Success) {
      this.rendererType = 'webgl2';
      console.log('⚡ [KiyoEdu Scrollytelling] WebGL2 Fallback Renderer initialized.');
      this.active = true;
      return 'webgl2';
    }

    // 3. Fallback to Canvas 2D
    const c2dSuccess = this.initCanvas2D();
    if (c2dSuccess) {
      this.rendererType = 'canvas2d';
      console.log('⚡ [KiyoEdu Scrollytelling] Canvas 2D Fallback Renderer initialized.');
      this.active = true;
      return 'canvas2d';
    }

    console.warn('⚠️ [KiyoEdu Scrollytelling] No hardware acceleration available.');
    return 'none';
  }

  // --------------------------------------------------------------------------
  // 2. WEBGPU INITIALIZATION & WGSL SHADER
  // --------------------------------------------------------------------------
  async initWebGPU() {
    if (!navigator.gpu) return false;

    try {
      const adapter = await navigator.gpu.requestAdapter({
        powerPreference: 'high-performance',
      });
      if (!adapter) return false;

      this.gpuDevice = await adapter.requestDevice();
      this.gpuDevice.lost.then((info) => {
        console.warn('WebGPU device was lost:', info);
        this.gpuDevice = null;
        this.initWebGL2();
      });

      this.gpuContext = this.canvas.getContext('webgpu');
      const presentationFormat = navigator.gpu.getPreferredCanvasFormat();

      this.gpuContext.configure({
        device: this.gpuDevice,
        format: presentationFormat,
        alphaMode: 'premultiplied',
      });

      // WGSL Shader Pipeline: 6 Distinct Chapter Visual Scenes
      const wgslCode = `
        struct Uniforms {
          progress: f32,
          act: f32,
          aspect: f32,
          time: f32,
          reducedMotion: f32,
          globalProg: f32,
          pad2: f32,
          pad3: f32,
        };

        @group(0) @binding(0) var<uniform> u: Uniforms;

        struct VertexOutput {
          @builtin(position) position: vec4f,
          @location(0) uv: vec2f,
        };

        @vertex
        fn vs_main(@builtin(vertex_index) vertexIndex: u32) -> VertexOutput {
          var pos = array<vec2f, 4>(
            vec2f(-1.0, -1.0),
            vec2f( 1.0, -1.0),
            vec2f(-1.0,  1.0),
            vec2f( 1.0,  1.0)
          );
          var uvs = array<vec2f, 4>(
            vec2f(0.0, 1.0),
            vec2f(1.0, 1.0),
            vec2f(0.0, 0.0),
            vec2f(1.0, 0.0)
          );

          var output: VertexOutput;
          output.position = vec4f(pos[vertexIndex], 0.0, 1.0);
          output.uv = uvs[vertexIndex];
          return output;
        }

        @fragment
        fn fs_main(@location(0) uv: vec2f) -> @location(0) vec4f {
          var p = (uv - 0.5) * vec2f(u.aspect, 1.0);
          let prog = u.progress;
          let act = u.act;

          // Pure Ivory & Carbon Ink aesthetic (#fcfbf9 & #111113)
          let ink = vec3f(0.067, 0.067, 0.075);

          // Center of optical stage (right-biased on desktop, center on mobile)
          var center = vec2f(0.32, 0.0);
          if (u.aspect < 1.0) {
            center = vec2f(0.0, -0.10);
          }
          let d = length(p - center);
          let angle = atan2(p.y - center.y, p.x - center.x);

          var lines = 0.0;
          var shadowMultiplier = 1.0;

          // Compute smooth blend weights for each of the 6 acts
          let w0 = max(0.0, 1.0 - abs(act - 0.0));
          let w1 = max(0.0, 1.0 - abs(act - 1.0));
          let w2 = max(0.0, 1.0 - abs(act - 2.0));
          let w3 = max(0.0, 1.0 - abs(act - 3.0));
          let w4 = max(0.0, 1.0 - abs(act - 4.0));
          let w5 = max(0.0, 1.0 - abs(act - 5.0));

          // ------------------------------------------------------------------
          // SCENE 0: HERO (Act 0) — Majestic Concentric Cooke Lens & Rays
          // ------------------------------------------------------------------
          if (w0 > 0.01) {
            let heroAngle = angle + u.time * 0.15;
            let rOuter = 0.44;
            let rBarrel = abs(d - rOuter);
            var l0 = (1.0 - smoothstep(0.0, 0.0035, rBarrel)) * 0.60;

            // Perimeter focus gear teeth
            let gearMod = fract(heroAngle * 54.0 / 6.28318);
            l0 += step(0.5, gearMod) * smoothstep(0.012, 0.0, abs(d - (rOuter + 0.01))) * 0.35;

            // Concentric Cooke optical glass curves
            l0 += (1.0 - smoothstep(0.0, 0.0030, abs(d - 0.12))) * 0.50;
            l0 += (1.0 - smoothstep(0.0, 0.0025, abs(d - 0.22))) * 0.40;
            l0 += (1.0 - smoothstep(0.0, 0.0022, abs(d - 0.32))) * 0.35;

            // 9 breathing aperture blades
            let bAngle = fract(heroAngle / (6.28318 / 9.0)) * (6.28318 / 9.0);
            let irisOpen = 0.14 + sin(u.time * 0.8) * 0.04;
            let bDist = abs(d * cos(bAngle - 0.349) - irisOpen);
            l0 += (1.0 - smoothstep(0.0, 0.0032, bDist)) * smoothstep(irisOpen * 0.4, irisOpen, d) * 0.45;

            // Converging horizontal light rays
            for (var i = -2.0; i <= 2.0; i += 1.0) {
              let ry = center.y + i * 0.06;
              if (p.x < center.x && p.x > center.x - 0.55) {
                l0 += (1.0 - smoothstep(0.0, 0.002, abs(p.y - ry))) * 0.22;
              }
            }

            lines += l0 * w0;
          }

          // ------------------------------------------------------------------
          // SCENE 1: OPTICS (Act 1) — Precision Iris Closing f/1.4 -> f/16
          // ------------------------------------------------------------------
          if (w1 > 0.01) {
            let optAngle = angle + prog * 1.57;
            var l1 = 0.0;

            // Concentric optical barrels
            l1 += (1.0 - smoothstep(0.0, 0.0035, abs(d - 0.46))) * 0.55;
            l1 += (1.0 - smoothstep(0.0, 0.0025, abs(d - 0.36))) * 0.40;
            l1 += (1.0 - smoothstep(0.0, 0.0020, abs(d - 0.24))) * 0.35;

            // Iris blades closing smoothly from f/1.4 (0.26) to f/16 (0.04)
            let irisRadius = mix(0.26, 0.04, prog);
            let bAngle1 = fract(optAngle / (6.28318 / 9.0)) * (6.28318 / 9.0);
            let bDist1 = abs(d * cos(bAngle1 - 0.349) - irisRadius);
            l1 += (1.0 - smoothstep(0.0, 0.0030, bDist1)) * smoothstep(irisRadius * 0.4, irisRadius, d) * 0.70;

            // Precision imperial distance tick marks
            let tickMod = abs(sin(optAngle * 18.0));
            l1 += smoothstep(0.95, 0.99, tickMod) * smoothstep(0.46, 0.44, d) * smoothstep(0.38, 0.40, d) * 0.40;

            // Converging refracted ray traces
            let focalX = center.x + 0.35;
            for (var i = -2.0; i <= 2.0; i += 1.0) {
              let ry = center.y + i * 0.06;
              if (p.x >= center.x && p.x <= focalX) {
                let t = (p.x - center.x) / (focalX - center.x);
                let targetY = mix(ry, center.y, t);
                l1 += (1.0 - smoothstep(0.0, 0.002, abs(p.y - targetY))) * 0.25;
              }
            }

            lines += l1 * w1;
          }

          // ------------------------------------------------------------------
          // SCENE 2: LIGHTING (Act 2) — Chiaroscuro Diagonal Shadow Plane
          // ------------------------------------------------------------------
          if (w2 > 0.01) {
            var l2 = 0.0;
            // Elliptical portrait lighting envelope
            let portraitD = length((p - center) * vec2f(0.8, 1.2));
            l2 += (1.0 - smoothstep(0.0, 0.004, abs(portraitD - 0.38))) * 0.35;
            l2 += (1.0 - smoothstep(0.0, 0.003, abs(portraitD - 0.26))) * 0.25;

            // EV Exposure latitude grid rings
            let evRings = abs(sin(portraitD * 40.0));
            l2 += smoothstep(0.96, 0.99, evRings) * smoothstep(0.40, 0.10, portraitD) * 0.18;

            // Diagonal shadow cut angle sweeping with progress
            let shadowAngle = 0.785 + (prog - 0.5) * 1.2;
            let shadowDot = (p.x - center.x) * cos(shadowAngle) + (p.y - center.y) * sin(shadowAngle);
            let chiaroscuroCut = smoothstep(-0.25, 0.25, shadowDot);
            shadowMultiplier = mix(1.0, chiaroscuroCut, w2 * 0.85);

            // Light ray indicator line
            let normalAngle = shadowAngle + 1.57;
            let rayDist = abs((p.x - center.x) * cos(normalAngle) + (p.y - center.y) * sin(normalAngle));
            l2 += (1.0 - smoothstep(0.0, 0.0025, rayDist)) * 0.30;

            lines += l2 * w2;
          }

          // ------------------------------------------------------------------
          // SCENE 3: BLOCKING (Act 3) — 180° Action Axis & Camera Arc Path
          // ------------------------------------------------------------------
          if (w3 > 0.01) {
            var l3 = 0.0;
            // 180-degree dashed axis line
            let axisDist = abs(p.y - center.y);
            let dash = step(0.5, fract((p.x - center.x) * 16.0));
            l3 += (1.0 - smoothstep(0.0, 0.0035, axisDist)) * dash * 0.65;

            // Two Actor marks (Mark A & Mark B)
            let markA = length(p - (center + vec2f(-0.16, 0.0)));
            let markB = length(p - (center + vec2f( 0.16, 0.0)));
            l3 += (1.0 - smoothstep(0.0, 0.004, abs(markA - 0.035))) * 0.60;
            l3 += (1.0 - smoothstep(0.0, 0.004, abs(markB - 0.035))) * 0.60;
            // Actor proximity radius pulses
            l3 += (1.0 - smoothstep(0.0, 0.002, abs(markA - 0.07))) * 0.30;
            l3 += (1.0 - smoothstep(0.0, 0.002, abs(markB - 0.07))) * 0.30;

            // Camera arc trajectory path (sweeping safe semi-circle below axis)
            let arcRadius = 0.28;
            let arcDist = abs(d - arcRadius);
            let inSafeHalf = step(p.y, center.y);
            l3 += (1.0 - smoothstep(0.0, 0.003, arcDist)) * inSafeHalf * 0.50;

            // Animated camera indicator moving along the arc with progress
            let camAngle = -3.14159 + prog * 3.14159;
            let camPos = center + vec2f(cos(camAngle) * arcRadius, sin(camAngle) * arcRadius);
            let camDist = length(p - camPos);
            l3 += (1.0 - smoothstep(0.0, 0.005, abs(camDist - 0.025))) * 0.85;

            // Perspective floor depth lines radiating from stage center
            let fan = abs(sin(angle * 8.0));
            l3 += smoothstep(0.97, 0.99, fan) * smoothstep(0.48, 0.12, d) * inSafeHalf * 0.22;

            lines += l3 * w3;
          }

          // ------------------------------------------------------------------
          // SCENE 4: GEAR & FRAMING GATES (Act 4) — 1.33:1 -> 1.85:1 -> 2.39:1
          // ------------------------------------------------------------------
          if (w4 > 0.01) {
            var l4 = 0.0;
            // Dynamic aspect ratio morphing from 1.33 -> 1.85 -> 2.39
            let targetRatio = mix(1.33, 2.39, prog);
            let halfW = 0.38;
            let halfH = 0.38 / targetRatio;
            let boxX = abs(p.x - center.x) - halfW;
            let boxY = abs(p.y - center.y) - halfH;
            let boxDist = max(boxX, boxY);
            l4 += (1.0 - smoothstep(0.0, 0.0035, abs(boxDist))) * 0.65;

            // Optical center crosshairs
            let crossX = abs(p.x - center.x);
            let crossY = abs(p.y - center.y);
            let inCrossX = step(crossX, 0.035) * (1.0 - smoothstep(0.0, 0.002, crossY));
            let inCrossY = step(crossY, 0.035) * (1.0 - smoothstep(0.0, 0.002, crossX));
            l4 += (inCrossX + inCrossY) * 0.45;

            // Optical corner bracket ticks
            let cornerTickX = step(abs(boxX), 0.02) * (1.0 - smoothstep(0.0, 0.0025, abs(boxY)));
            let cornerTickY = step(abs(boxY), 0.02) * (1.0 - smoothstep(0.0, 0.0025, abs(boxX)));
            l4 += (cornerTickX + cornerTickY) * 0.50;

            lines += l4 * w4;
          }

          // ------------------------------------------------------------------
          // SCENE 5: FINALE (Act 5) — Minimal Concentric Pupil Expanding
          // ------------------------------------------------------------------
          if (w5 > 0.01) {
            var l5 = 0.0;
            let finalCenter = mix(center, vec2f(0.0, 0.0), prog * 0.5);
            let finalD = length(p - finalCenter);

            // Single expanding circle of focus
            let focusR = 0.15 + prog * 0.22;
            l5 += (1.0 - smoothstep(0.0, 0.0035, abs(finalD - focusR))) * 0.70;
            l5 += (1.0 - smoothstep(0.0, 0.0025, abs(finalD - (focusR * 0.65)))) * 0.45;
            l5 += (1.0 - smoothstep(0.0, 0.0018, abs(finalD - (focusR * 0.35)))) * 0.30;

            lines += l5 * w5;
          }

          // Text legibility fade on reading column (left half of screen)
          var readFade = 1.0;
          if (u.aspect >= 1.0) {
            readFade = smoothstep(0.04, 0.40, uv.x);
          } else {
            readFade = 0.50;
          }

          let alpha = clamp(lines * shadowMultiplier * readFade * 1.5, 0.0, 0.88);
          return vec4f(ink * alpha, alpha);
        }
      `;

      const shaderModule = this.gpuDevice.createShaderModule({ code: wgslCode });

      // Uniform buffer (32 bytes aligned: 8 f32s = 32 bytes)
      this.gpuUniformBuffer = this.gpuDevice.createBuffer({
        size: 32,
        usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
      });

      const bindGroupLayout = this.gpuDevice.createBindGroupLayout({
        entries: [{
          binding: 0,
          visibility: GPUShaderStage.VERTEX | GPUShaderStage.FRAGMENT,
          buffer: { type: 'uniform' },
        }],
      });

      this.gpuBindGroup = this.gpuDevice.createBindGroup({
        layout: bindGroupLayout,
        entries: [{
          binding: 0,
          resource: { buffer: this.gpuUniformBuffer },
        }],
      });

      const pipelineLayout = this.gpuDevice.createPipelineLayout({
        bindGroupLayouts: [bindGroupLayout],
      });

      this.gpuPipeline = this.gpuDevice.createRenderPipeline({
        layout: pipelineLayout,
        vertex: {
          module: shaderModule,
          entryPoint: 'vs_main',
        },
        fragment: {
          module: shaderModule,
          entryPoint: 'fs_main',
          targets: [{
            format: presentationFormat,
            blend: {
              color: {
                srcFactor: 'one',
                dstFactor: 'one-minus-src-alpha',
                operation: 'add',
              },
              alpha: {
                srcFactor: 'one',
                dstFactor: 'one-minus-src-alpha',
                operation: 'add',
              },
            },
          }],
        },
        primitive: {
          topology: 'triangle-strip',
        },
      });

      return true;
    } catch (e) {
      console.warn('WebGPU init failed:', e);
      return false;
    }
  }

  // --------------------------------------------------------------------------
  // 3. WEBGL2 FALLBACK PIPELINE
  // --------------------------------------------------------------------------
  initWebGL2() {
    try {
      const gl = this.canvas.getContext('webgl2', { alpha: true, antialias: true, premultipliedAlpha: true });
      if (!gl) return false;
      this.gl2 = gl;

      const vsSource = `#version 300 es
        in vec2 a_pos;
        out vec2 v_uv;
        void main() {
          v_uv = (a_pos + 1.0) * 0.5;
          v_uv.y = 1.0 - v_uv.y;
          gl_Position = vec4(a_pos, 0.0, 1.0);
        }
      `;

      const fsSource = `#version 300 es
        precision highp float;
        in vec2 v_uv;
        out vec4 outColor;
        uniform float u_progress;
        uniform float u_act;
        uniform float u_aspect;
        uniform float u_time;

        void main() {
          vec2 p = (v_uv - 0.5) * vec2(u_aspect, 1.0);
          vec3 ink = vec3(0.067, 0.067, 0.075);
          vec2 center = u_aspect >= 1.0 ? vec2(0.32, 0.0) : vec2(0.0, -0.10);
          float d = length(p - center);
          float angle = atan2(p.y - center.y, p.x - center.x);

          float lines = 0.0;
          float shadowMultiplier = 1.0;

          float w0 = max(0.0, 1.0 - abs(u_act - 0.0));
          float w1 = max(0.0, 1.0 - abs(u_act - 1.0));
          float w2 = max(0.0, 1.0 - abs(u_act - 2.0));
          float w3 = max(0.0, 1.0 - abs(u_act - 3.0));
          float w4 = max(0.0, 1.0 - abs(u_act - 4.0));
          float w5 = max(0.0, 1.0 - abs(u_act - 5.0));

          // Scene 0 & 1: Cooke lens barrel & aperture
          if (w0 > 0.01 || w1 > 0.01) {
            float rOuter = 0.44;
            float l01 = (1.0 - smoothstep(0.0, 0.0035, abs(d - rOuter))) * 0.60;
            l01 += (1.0 - smoothstep(0.0, 0.0030, abs(d - 0.12))) * 0.50;
            l01 += (1.0 - smoothstep(0.0, 0.0025, abs(d - 0.22))) * 0.40;
            l01 += (1.0 - smoothstep(0.0, 0.0022, abs(d - 0.32))) * 0.35;

            float iris = mix(0.18, 0.04, u_progress);
            float bAngle = fract(angle / (6.28318 / 9.0)) * (6.28318 / 9.0);
            float bDist = abs(d * cos(bAngle - 0.349) - iris);
            l01 += (1.0 - smoothstep(0.0, 0.0032, bDist)) * smoothstep(iris * 0.4, iris, d) * 0.55;
            lines += l01 * (w0 + w1);
          }

          // Scene 2: Chiaroscuro shadow
          if (w2 > 0.01) {
            float sAngle = 0.785 + (u_progress - 0.5) * 1.2;
            float sDot = (p.x - center.x) * cos(sAngle) + (p.y - center.y) * sin(sAngle);
            shadowMultiplier = mix(1.0, smoothstep(-0.25, 0.25, sDot), w2 * 0.85);
          }

          // Scene 3: 180 axis
          if (w3 > 0.01) {
            float axisDist = abs(p.y - center.y);
            float dash = step(0.5, fract((p.x - center.x) * 16.0));
            lines += (1.0 - smoothstep(0.0, 0.0035, axisDist)) * dash * 0.65 * w3;
          }

          // Scene 4: Framing gate
          if (w4 > 0.01) {
            float targetRatio = mix(1.33, 2.39, u_progress);
            float boxDist = max(abs(p.x - center.x) - 0.38, abs(p.y - center.y) - 0.38 / targetRatio);
            lines += (1.0 - smoothstep(0.0, 0.0035, abs(boxDist))) * 0.65 * w4;
          }

          // Scene 5: Expanding circle
          if (w5 > 0.01) {
            lines += (1.0 - smoothstep(0.0, 0.0035, abs(d - (0.15 + u_progress * 0.22)))) * 0.70 * w5;
          }

          float readFade = u_aspect >= 1.0 ? smoothstep(0.04, 0.40, v_uv.x) : 0.50;
          float finalAlpha = clamp(lines * shadowMultiplier * readFade * 1.5, 0.0, 0.88);

          outColor = vec4(ink * finalAlpha, finalAlpha);
        }
      `;

      const createShader = (type, source) => {
        const s = gl.createShader(type);
        gl.shaderSource(s, source);
        gl.compileShader(s);
        if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
          console.warn('WebGL2 shader error:', gl.getShaderInfoLog(s));
          gl.deleteShader(s);
          return null;
        }
        return s;
      };

      const vs = createShader(gl.VERTEX_SHADER, vsSource);
      const fs = createShader(gl.FRAGMENT_SHADER, fsSource);
      if (!vs || !fs) return false;

      this.gl2Program = gl.createProgram();
      gl.attachShader(this.gl2Program, vs);
      gl.attachShader(this.gl2Program, fs);
      gl.linkProgram(this.gl2Program);

      if (!gl.getProgramParameter(this.gl2Program, gl.LINK_STATUS)) {
        console.warn('WebGL2 program error:', gl.getProgramInfoLog(this.gl2Program));
        return false;
      }

      this.gl2Uniforms = {
        progress: gl.getUniformLocation(this.gl2Program, 'u_progress'),
        act: gl.getUniformLocation(this.gl2Program, 'u_act'),
        aspect: gl.getUniformLocation(this.gl2Program, 'u_aspect'),
        time: gl.getUniformLocation(this.gl2Program, 'u_time'),
      };

      this.gl2Vao = gl.createVertexArray();
      gl.bindVertexArray(this.gl2Vao);

      const posBuffer = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, posBuffer);
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
        -1, -1,
         1, -1,
        -1,  1,
        -1,  1,
         1, -1,
         1,  1,
      ]), gl.STATIC_DRAW);

      const posAttr = gl.getAttribLocation(this.gl2Program, 'a_pos');
      gl.enableVertexAttribArray(posAttr);
      gl.vertexAttribPointer(posAttr, 2, gl.FLOAT, false, 0, 0);

      gl.enable(gl.BLEND);
      gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);

      return true;
    } catch (e) {
      console.warn('WebGL2 error:', e);
      return false;
    }
  }

  // --------------------------------------------------------------------------
  // 4. CANVAS 2D FALLBACK
  // --------------------------------------------------------------------------
  initCanvas2D() {
    this.ctx2d = this.canvas.getContext('2d');
    return !!this.ctx2d;
  }

  // --------------------------------------------------------------------------
  // 5. UPDATE SCROLL PROGRESS (Coalesced & Damped)
  // --------------------------------------------------------------------------
  // Primary API: Unified continuous story position [0.0 .. 5.0]
  setStoryPos(storyPos, globalProgress = 0) {
    this.targetStoryPos = Math.max(0, Math.min(5.0, storyPos));
    this.targetGlobalProgress = Math.max(0, Math.min(1, globalProgress));
    this.isDirty = true;
  }

  setStoryState(chapterIndex, chapterProgress, globalProgress) {
    const continuousPos = chapterIndex + Math.max(0, Math.min(1, chapterProgress));
    this.setStoryPos(continuousPos, globalProgress);
  }

  setProgress(target, actIdx = 0) {
    this.setStoryPos(actIdx + Math.max(0, Math.min(1, target)));
  }

  setAperture(norm) {
    this.customAperture = norm;
    this.isDirty = true;
  }

  setNegativeFill(enabled) {
    this.customNegativeFill = enabled ? 1.0 : 0.0;
    this.isDirty = true;
  }

  setAspectRatio(ratio) {
    this.customAspectRatio = ratio;
    this.isDirty = true;
  }

  // --------------------------------------------------------------------------
  // 6. RENDER TICK (Ultra-Smooth Spring Tracking)
  // --------------------------------------------------------------------------
  render(timeNow = 0) {
    this.time = timeNow * 0.001;

    // Single-variable continuous damping — zero hitching, zero dead zones
    if (this.reducedMotion) {
      this.storyPos = this.targetStoryPos;
      this.globalProgress = this.targetGlobalProgress;
    } else {
      const delta = this.targetStoryPos - this.storyPos;
      if (Math.abs(delta) > 0.0001) {
        this.storyPos += delta * 0.20;
        this.isDirty = true;
      } else {
        this.storyPos = this.targetStoryPos;
      }
    }

    this.actIndex = this.storyPos;
    this.progress = this.storyPos - Math.floor(this.storyPos);
    if (this.storyPos >= 5.0) {
      this.actIndex = 5.0;
      this.progress = 1.0;
    }

    if (!this.isDirty) return;

    if (this.rendererType === 'webgpu') {
      this.renderWebGPU();
    } else if (this.rendererType === 'webgl2') {
      this.renderWebGL2();
    } else if (this.rendererType === 'canvas2d') {
      this.renderCanvas2D();
    }

    if (Math.abs(this.targetStoryPos - this.storyPos) <= 0.0001) {
      this.isDirty = false;
    }
  }

  renderWebGPU() {
    if (!this.gpuDevice || !this.gpuPipeline || !this.gpuContext) return;

    const uniformData = new Float32Array([
      this.progress,
      this.actIndex,
      this.aspect,
      this.time,
      this.reducedMotion ? 1.0 : 0.0,
      this.globalProgress,
      this.customNegativeFill,
      this.customAspectRatio,
    ]);
    this.gpuDevice.queue.writeBuffer(this.gpuUniformBuffer, 0, uniformData);

    const commandEncoder = this.gpuDevice.createCommandEncoder();
    const textureView = this.gpuContext.getCurrentTexture().createView();

    const renderPass = commandEncoder.beginRenderPass({
      colorAttachments: [{
        view: textureView,
        clearValue: { r: 0.0, g: 0.0, b: 0.0, a: 0.0 },
        loadOp: 'clear',
        storeOp: 'store',
      }],
    });

    renderPass.setPipeline(this.gpuPipeline);
    renderPass.setBindGroup(0, this.gpuBindGroup);
    renderPass.draw(4);
    renderPass.end();

    this.gpuDevice.queue.submit([commandEncoder.finish()]);
  }

  renderWebGL2() {
    if (!this.gl2 || !this.gl2Program) return;
    const gl = this.gl2;

    gl.viewport(0, 0, this.canvas.width, this.canvas.height);
    gl.clearColor(0.0, 0.0, 0.0, 0.0);
    gl.clear(gl.COLOR_BUFFER_BIT);

    gl.useProgram(this.gl2Program);
    gl.uniform1f(this.gl2Uniforms.progress, this.progress);
    gl.uniform1f(this.gl2Uniforms.act, this.actIndex);
    gl.uniform1f(this.gl2Uniforms.aspect, this.aspect);
    gl.uniform1f(this.gl2Uniforms.time, this.time);

    gl.bindVertexArray(this.gl2Vao);
    gl.drawArrays(gl.TRIANGLES, 0, 6);
  }

  renderCanvas2D() {
    if (!this.ctx2d) return;
    const ctx = this.ctx2d;
    const w = this.canvas.width;
    const h = this.canvas.height;

    ctx.clearRect(0, 0, w, h);

    const cx = w * (this.aspect >= 1.0 ? 0.70 : 0.5);
    const cy = h * 0.5;
    const maxR = Math.min(w, h) * 0.44;

    ctx.save();
    ctx.lineWidth = 1 * this.dpr;

    // Dynamic rendering per act in Canvas 2D fallback
    if (this.actIndex < 1.5) {
      // Concentric Cooke lens rings
      [0.12, 0.24, 0.42, 0.62, 0.84].forEach((rRatio, idx) => {
        ctx.beginPath();
        ctx.arc(cx, cy, maxR * rRatio, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(17, 17, 19, ${0.16 - idx * 0.02})`;
        ctx.stroke();
      });

      // 9 aperture blades
      const bladeCount = 9;
      const angleOffset = this.progress * Math.PI * 0.5;
      ctx.strokeStyle = 'rgba(17, 17, 19, 0.14)';
      for (let i = 0; i < bladeCount; i++) {
        const a = (i / bladeCount) * Math.PI * 2 + angleOffset;
        const rInner = maxR * (0.08 + Math.sin(this.progress * Math.PI) * 0.20);
        const rOuter = maxR * 0.82;
        ctx.beginPath();
        ctx.moveTo(cx + Math.cos(a) * rInner, cy + Math.sin(a) * rInner);
        ctx.lineTo(cx + Math.cos(a + 0.35) * rOuter, cy + Math.sin(a + 0.35) * rOuter);
        ctx.stroke();
      }
    } else if (this.actIndex < 2.5) {
      // Chiaroscuro line
      ctx.strokeStyle = 'rgba(17, 17, 19, 0.25)';
      ctx.beginPath();
      ctx.moveTo(cx - maxR, cy - maxR * 0.7);
      ctx.lineTo(cx + maxR, cy + maxR * 0.7);
      ctx.stroke();
    } else if (this.actIndex < 3.5) {
      // 180 axis dashed
      ctx.setLineDash([8, 8]);
      ctx.strokeStyle = 'rgba(17, 17, 19, 0.35)';
      ctx.beginPath();
      ctx.moveTo(cx - maxR, cy);
      ctx.lineTo(cx + maxR, cy);
      ctx.stroke();
    } else {
      // Aspect gate box
      ctx.strokeStyle = 'rgba(17, 17, 19, 0.30)';
      ctx.strokeRect(cx - maxR * 0.8, cy - (maxR * 0.8 / 1.85), maxR * 1.6, (maxR * 1.6 / 1.85));
    }

    ctx.restore();
  }

  // --------------------------------------------------------------------------
  // 7. RESPONSIVE RESIZE
  // --------------------------------------------------------------------------
  resize() {
    const width = window.innerWidth;
    const height = window.innerHeight;
    this.dpr = Math.min(window.devicePixelRatio || 1, 2);

    this.canvas.width = Math.floor(width * this.dpr);
    this.canvas.height = Math.floor(height * this.dpr);
    this.aspect = width / height;
    this.isDirty = true;
  }
}
