/* ============================================================================
   KIYOEDU AWWWARDS SCROLLYTELLING RUNTIME · MASTER CONTROLLER
   Standards: Awwwards Site of the Day / Studio Freight / Lenis Integration
   Zero Scroll Locking · Continuous Inertial Flow · Micro-Parallax Orchestration
   ============================================================================ */

import Lenis from 'lenis';
import { ScrollytellingEngine } from './webgpu-story-engine.js';

async function initScrollytelling() {
  // ── 0. Lenis Smooth Scroll Engine (Awwwards Industry Benchmark) ──────────
  const lenis = new Lenis({
    duration: 1.2,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    smoothWheel: true,
    smoothTouch: false,
    wheelMultiplier: 1.0,
    touchMultiplier: 1.5,
  });

  function raf(time) {
    lenis.raf(time);
    requestAnimationFrame(raf);
  }
  requestAnimationFrame(raf);

  // ── 1. Technical Canvas Background Engine ─────────────────────────────────
  const canvas = document.getElementById('scrolly-canvas');
  let engine = null;
  if (canvas) {
    engine = new ScrollytellingEngine(canvas);
    await engine.init();

    function renderLoop(t) {
      engine.render(t);
      requestAnimationFrame(renderLoop);
    }
    requestAnimationFrame(renderLoop);
  }

  // ── 2. DOM Elements Cache ─────────────────────────────────────────────────
  const stages = Array.from(document.querySelectorAll('.stage-section'));
  const navLinks = Array.from(document.querySelectorAll('.nav-link'));

  // Hero Elements Cache (Pinned & Scaling)
  const heroStage = document.getElementById('tong-quan');
  const heroForeground = document.getElementById('hero-foreground');
  const heroBackdrop = document.getElementById('hero-backdrop');
  const heroBgImg = document.getElementById('hero-bg-img');
  const heroPoincianaWrap = document.getElementById('hero-poinciana-wrap');
  const heroTarget = document.getElementById('hero-parallax-target');

  // Stage 02: Interactive Zoom-Dive-Scroll Tablet Viewport (FULL MÀN HÌNH)
  const bocTachSection = document.getElementById('boc-tach-ai');
  const tabletDeviceLayer = document.getElementById('layer-tablet-device');
  const handTapLayer = document.getElementById('layer-hand-tap');
  const screenDiveLayer = document.getElementById('layer-screen-dive');
  const screenScrollTrack = document.getElementById('screen-scroll-track');
  const capScanStatus = document.getElementById('cap-scan-status');
  const hudPill1 = document.getElementById('hud-pill-1');
  const hudPill2 = document.getElementById('hud-pill-2');
  const hudPill3 = document.getElementById('hud-pill-3');

  // Timeline Track
  const timelineTrack = document.getElementById('timeline-track');
  const timelineLineFill = document.getElementById('timeline-line-fill');
  const timelineNodes = Array.from(document.querySelectorAll('.timeline-node-item'));

  // Stats Counters
  const statsStrip = document.getElementById('stats-counter-strip');
  const statValues = Array.from(document.querySelectorAll('.stat-value'));
  let statsCounted = false;

  // ── 3. Smooth Hero Pinned Scroll & Scaling (Kéo lên luôn · Chữ & Ảnh co giãn) ───
  function updateHeroParallax(scrollY) {
    if (!heroStage) return;
    const windowH = window.innerHeight;
    if (windowH <= 0) return;

    // Progress chạy mượt từ 0.0 đến 1.0 ngay khi cuộn (kéo lên luôn cùng curtain sheet)
    const progress = Math.min(1, Math.max(0, scrollY / windowH));

    // 1. Chữ to nhỏ lại (Scale down text as user scrolls down)
    if (heroForeground) {
      const textScale = Math.max(0.68, 1 - progress * 0.32);
      const textOpacity = Math.max(0, 1 - progress * 1.35);
      const textY = -progress * 60;
      heroForeground.style.transform = `translate3d(0, ${textY}px, 0) scale(${textScale})`;
      heroForeground.style.opacity = textOpacity;
    }

    // 2. Ảnh lúc đầu HIỆN FULL (0px), KHI KÉO XUỐNG MỚI BẮT ĐẦU BO GÓC (lên tới 40px)
    if (heroBackdrop) {
      const currentRadius = progress * 40;
      heroBackdrop.style.borderRadius = `${currentRadius}px`;
      const imgScale = Math.max(0.94, 1 - progress * 0.06);
      heroBackdrop.style.transform = `scale(${imgScale})`;
    }
    if (heroBgImg) {
      heroBgImg.style.transform = 'none';
    }

    // 3. Cây phượng vĩ ở bên phải có parallax nhẹ theo scroll
    if (heroPoincianaWrap) {
      const poincianaY = -progress * 30;
      heroPoincianaWrap.style.transform = `translate3d(0, ${poincianaY}px, 0)`;
    }
  }

  // ── 3.1 Interactive Zoom & Screen Dive on Scroll (FULL MÀN HÌNH · Tay riêng + Màn hình riêng -> Zoom -> Cuộn) ───
  function updateBocTachZoomScroll() {
    if (!bocTachSection || !tabletDeviceLayer || !handTapLayer || !screenDiveLayer || !screenScrollTrack) return;
    const rect = bocTachSection.getBoundingClientRect();
    const windowH = window.innerHeight;
    const totalDist = rect.height - windowH;
    if (totalDist <= 0) return;

    // Progress chạy mượt từ 0.0 khi section chạm đỉnh màn hình đến 1.0 khi cuộn hết stage
    const passed = -rect.top;
    const progress = Math.min(1, Math.max(0, passed / totalDist));

    if (progress <= 0.40) {
      // Phase 1: Cái tay di chuyển bấm vô màn hình và PHÓNG TO FULL MÀN HÌNH
      const p1 = progress / 0.40;

      // Tay di chuyển từ ngoài vào bấm màn hình (hover effect)
      const handHoverY = p1 < 0.25 ? (1 - p1 / 0.25) * 35 : 0;
      const handHoverX = p1 < 0.25 ? (1 - p1 / 0.25) * 25 : 0;
      const zoomScale = 1 + p1 * 1.6; // Zoom cả tay lẫn màn hình từ 1.0 lên 2.6 full screen

      tabletDeviceLayer.style.transform = `scale(${zoomScale})`;
      tabletDeviceLayer.style.opacity = '1';

      const handOpacity = p1 > 0.65 ? Math.max(0, 1 - (p1 - 0.65) / 0.35) : 1;
      handTapLayer.style.transform = `translate3d(${handHoverX}px, ${handHoverY}px, 0) scale(${zoomScale})`;
      handTapLayer.style.opacity = handOpacity;

      screenDiveLayer.style.opacity = p1 > 0.5 ? (p1 - 0.5) / 0.5 : 0;
      screenDiveLayer.style.transform = `scale(${0.88 + p1 * 0.12})`;
      screenScrollTrack.style.transform = 'translate3d(0, 0, 0)';
      if (capScanStatus) capScanStatus.textContent = p1 < 0.25 ? 'Chạm ngón tay lên tablet...' : '1 Chạm Quét Đề AI';

      if (hudPill1) hudPill1.className = 'hud-step-pill ' + (p1 < 0.5 ? 'is-active' : '');
      if (hudPill2) hudPill2.className = 'hud-step-pill ' + (p1 >= 0.5 ? 'is-active' : '');
      if (hudPill3) hudPill3.className = 'hud-step-pill';
    } else {
      // Phase 2: ĐI VÀO TRONG MÀN HÌNH VÀ KÉO NỘI DUNG CUỘN TRANG FULL MÀN HÌNH
      handTapLayer.style.opacity = 0;
      tabletDeviceLayer.style.opacity = 0;
      screenDiveLayer.style.opacity = 1;
      screenDiveLayer.style.transform = 'scale(1)';

      const p2 = (progress - 0.40) / 0.60;
      const maxScrollPx = screenScrollTrack.scrollHeight - windowH;
      const trackY = p2 * Math.max(0, maxScrollPx);
      screenScrollTrack.style.transform = `translate3d(0, ${-trackY}px, 0)`;
      if (capScanStatus) capScanStatus.textContent = `Bóc tách KaTeX ${Math.min(100, Math.round(p2 * 100))}%`;

      if (hudPill1) hudPill1.className = 'hud-step-pill';
      if (hudPill2) hudPill2.className = 'hud-step-pill';
      if (hudPill3) hudPill3.className = 'hud-step-pill is-active';
    }
  }

  // ── 4. Timeline Progress Line ─────────────────────────────────────────────
  function updateTimelineProgress() {
    if (!timelineTrack || !timelineLineFill) return;
    const rect = timelineTrack.getBoundingClientRect();
    const windowH = window.innerHeight;

    if (rect.top <= windowH * 0.75 && rect.bottom >= windowH * 0.25) {
      const totalDist = rect.height;
      const passedDist = (windowH * 0.75) - rect.top;
      const progress = Math.max(0, Math.min(1, passedDist / totalDist));
      timelineLineFill.style.height = `${progress * 100}%`;

      timelineNodes.forEach((node) => {
        const nodeRect = node.getBoundingClientRect();
        if (nodeRect.top < windowH * 0.75) {
          node.classList.add('is-passed');
        } else {
          node.classList.remove('is-passed');
        }
      });
    }
  }

  // ── 5. Real Metrics Count-Up ─────────────────────────────────────────────
  function runCountUp(el, target, duration = 1400) {
    const start = 0;
    const startTime = performance.now();
    const isDecimal = target % 1 !== 0;

    function step(currentTime) {
      const elapsed = currentTime - startTime;
      const p = Math.min(elapsed / duration, 1);
      const easeOut = 1 - Math.pow(1 - p, 3);
      const currentVal = start + (target - start) * easeOut;

      if (isDecimal) {
        el.textContent = currentVal.toFixed(1);
      } else if (target >= 1000) {
        el.textContent = Math.floor(currentVal).toLocaleString('vi-VN');
      } else {
        el.textContent = Math.floor(currentVal);
      }

      if (p < 1) {
        requestAnimationFrame(step);
      } else {
        if (isDecimal) {
          el.textContent = target.toFixed(1);
        } else if (target >= 1000) {
          el.textContent = target.toLocaleString('vi-VN');
        } else {
          el.textContent = target;
        }
      }
    }
    requestAnimationFrame(step);
  }

  const showcaseObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting && !statsCounted) {
          statsCounted = true;
          statValues.forEach((valEl) => {
            const target = parseFloat(valEl.dataset.count || '0');
            runCountUp(valEl, target, 1400);
          });
        }
      });
    },
    { threshold: 0.15 }
  );

  if (statsStrip) showcaseObserver.observe(statsStrip);

  // ── 6. Flow-In Observer (Chảy vô từ bên trái & bên phải) ─────────────────
  const flowObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
        }
      });
    },
    { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
  );

  document.querySelectorAll('.flow-in-left, .flow-in-right, .flow-in-up').forEach((el) => {
    flowObserver.observe(el);
  });

  // Trigger hero elements immediately on load
  setTimeout(() => {
    document.querySelectorAll('.stage-hero .flow-in-left, .stage-hero .flow-in-right, .stage-hero .flow-in-up').forEach((el) => {
      el.classList.add('is-visible');
    });
  }, 80);

  // ── 7. Sync Lenis Scroll with UI ──────────────────────────────────────────
  function onScrollUpdate(scrollY) {
    const totalScroll = document.documentElement.scrollHeight - window.innerHeight;

    // WebGL / Engine story sync (nếu có)
    if (engine && totalScroll > 0) {
      const progress = Math.max(0, Math.min(1, scrollY / totalScroll));
      engine.setStoryPos(progress * 10, progress);
    }

    // Hero parallax
    updateHeroParallax(scrollY);

    // Stage 02: Bóc tách zoom & screen dive scroll
    updateBocTachZoomScroll();

    // Timeline progress
    updateTimelineProgress();

    // Nav active link tracking
    stages.forEach((stage, idx) => {
      const rect = stage.getBoundingClientRect();
      if (rect.top <= 120 && rect.bottom >= 120) {
        navLinks.forEach((link, lIdx) => {
          link.classList.toggle('is-active', lIdx === idx);
        });
      }
    });
  }

  lenis.on('scroll', (e) => {
    onScrollUpdate(e.scroll);
  });

  // Smooth anchor link scrolling via Lenis
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener('click', (e) => {
      const targetId = anchor.getAttribute('href');
      if (targetId && targetId !== '#') {
        const targetEl = document.querySelector(targetId);
        if (targetEl) {
          e.preventDefault();
          lenis.scrollTo(targetEl, { offset: -20, duration: 1.2 });
        }
      }
    });
  });

  window.addEventListener('resize', () => {
    if (engine) engine.resize();
  }, { passive: true });

  // Initial update
  onScrollUpdate(window.pageYOffset || 0);
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initScrollytelling);
} else {
  initScrollytelling();
}
