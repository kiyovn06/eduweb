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

  // Stage 02: Bóc tách thu nhỏ 4/5 xuống 2/5 khi cuộn
  const bocTachTrack = document.getElementById('boc-tach-ai');
  const bocTachVisualCol = document.getElementById('boc-tach-visual-col');
  const bocTachTextCol = document.getElementById('boc-tach-text-col');

  // Stage 03: Live Quiz Fan-out từ giữa qua 2 bên
  const liveQuizTrack = document.getElementById('live-quiz');
  const fanCenterTablet = document.getElementById('fan-center-tablet');
  const fanCardL1 = document.getElementById('fan-card-l1');
  const fanCardL2 = document.getElementById('fan-card-l2');
  const fanCardR1 = document.getElementById('fan-card-r1');
  const fanCardR2 = document.getElementById('fan-card-r2');
  const liveQuizDeck = document.getElementById('live-quiz-feature-deck');

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

  // ── 3.1 Stage 02: Bóc tách - Ảnh 6/7 thu nhỏ về 4/7 · Chữ lần lượt từ phải vào ───
  function updateBocTachShrink() {
    if (!bocTachTrack || !bocTachVisualCol || !bocTachTextCol) return;
    if (window.innerWidth <= 768) return;

    const rect = bocTachTrack.getBoundingClientRect();
    const windowH = window.innerHeight;
    const totalDist = rect.height - windowH;
    if (totalDist <= 0) return;

    const passed = -rect.top;
    const progress = Math.min(1, Math.max(0, passed / totalDist));

    // 1. Ảnh bên trái: Ban đầu chiếm 6/7 (~85.714%), kéo xuống thu nhỏ xuống 4/7 (~57.143%)
    const shrinkProgress = Math.min(1, Math.max(0, progress / 0.65));
    const startWidth = (6 / 7) * 100; // 6/7 web (~85.714%)
    const endWidth = (4 / 7) * 100;   // 4/7 web (~57.143%)
    const currentWidth = startWidth - shrinkProgress * (startWidth - endWidth);
    bocTachVisualCol.style.width = `${currentWidth}%`;

    // 2. Chữ bên phải: Hiệu ứng lần lượt từ bên phải đi vô (Title -> Card 01 -> Card 02 -> Card 03)
    const titleGroup = bocTachTextCol.querySelector('.boc-tach-header-group');
    const cards = bocTachTextCol.querySelectorAll('.feature-block');

    // Tiêu đề "Bóc Tách Đề Thi Trong 3 Giây": Hiệu ứng từ bên phải đi vô trước
    if (titleGroup) {
      const titleProg = Math.min(1, Math.max(0, (shrinkProgress - 0.05) / 0.28));
      titleGroup.style.opacity = titleProg;
      titleGroup.style.transform = `translateX(${(1 - titleProg) * 48}px)`;
    }

    // Thẻ 01: Đi vào kế tiếp sau tiêu đề
    if (cards[0]) {
      const c0Prog = Math.min(1, Math.max(0, (shrinkProgress - 0.18) / 0.28));
      cards[0].style.opacity = c0Prog;
      cards[0].style.transform = `translateX(${(1 - c0Prog) * 48}px)`;
    }

    // Thẻ 02: Đi vào kế tiếp sau thẻ 01
    if (cards[1]) {
      const c1Prog = Math.min(1, Math.max(0, (shrinkProgress - 0.32) / 0.28));
      cards[1].style.opacity = c1Prog;
      cards[1].style.transform = `translateX(${(1 - c1Prog) * 48}px)`;
    }

    // Thẻ 03: Đi vào kế tiếp sau thẻ 02
    if (cards[2]) {
      const c2Prog = Math.min(1, Math.max(0, (shrinkProgress - 0.46) / 0.28));
      cards[2].style.opacity = c2Prog;
      cards[2].style.transform = `translateX(${(1 - c2Prog) * 48}px)`;
    }
  }

  // ── 3.2 Stage 03: Live Quiz - Fan-out từ giữa sang 2 bên khi cuộn ─────────
  function updateLiveQuizFanOut() {
    if (!liveQuizTrack || !fanCenterTablet) return;
    if (window.innerWidth <= 768) return;

    const rect = liveQuizTrack.getBoundingClientRect();
    const windowH = window.innerHeight;
    const totalDist = rect.height - windowH;
    if (totalDist <= 0) return;

    const passed = -rect.top;
    const progress = Math.min(1, Math.max(0, passed / totalDist));

    // Dynamic width scale based on window width:
    const stageW = Math.min(window.innerWidth, 1320);
    const scaleFactor = Math.max(0.72, Math.min(1.0, stageW / 1200));

    // Phase 1: Left 1 & Right 1 emerge (0.04 -> 0.48)
    const pL1 = Math.min(1, Math.max(0, (progress - 0.04) / 0.44));
    const distL1 = -230 * scaleFactor * pL1;
    const rotL1 = -2.5 * pL1;
    const scaleL1 = 0.88 + 0.1 * pL1;
    if (fanCardL1) {
      fanCardL1.style.transform = `translateX(${distL1}px) scale(${scaleL1}) rotate(${rotL1}deg)`;
      fanCardL1.style.opacity = pL1;
    }

    const pR1 = Math.min(1, Math.max(0, (progress - 0.04) / 0.44));
    const distR1 = 230 * scaleFactor * pR1;
    const rotR1 = 2.5 * pR1;
    const scaleR1 = 0.88 + 0.1 * pR1;
    if (fanCardR1) {
      fanCardR1.style.transform = `translateX(${distR1}px) scale(${scaleR1}) rotate(${rotR1}deg)`;
      fanCardR1.style.opacity = pR1;
    }

    // Phase 2: Left 2 & Right 2 emerge further (0.22 -> 0.72)
    const pL2 = Math.min(1, Math.max(0, (progress - 0.22) / 0.50));
    const distL2 = -435 * scaleFactor * pL2;
    const rotL2 = -5.0 * pL2;
    const scaleL2 = 0.82 + 0.12 * pL2;
    if (fanCardL2) {
      fanCardL2.style.transform = `translateX(${distL2}px) scale(${scaleL2}) rotate(${rotL2}deg)`;
      fanCardL2.style.opacity = pL2;
    }

    const pR2 = Math.min(1, Math.max(0, (progress - 0.22) / 0.50));
    const distR2 = 435 * scaleFactor * pR2;
    const rotR2 = 5.0 * pR2;
    const scaleR2 = 0.82 + 0.12 * pR2;
    if (fanCardR2) {
      fanCardR2.style.transform = `translateX(${distR2}px) scale(${scaleR2}) rotate(${rotR2}deg)`;
      fanCardR2.style.opacity = pR2;
    }

    // Center tablet: Subtle scale as cards emerge
    const pCenter = Math.min(1, Math.max(0, progress / 0.6));
    const tabletScale = 1.0 + 0.02 * pCenter;
    fanCenterTablet.style.transform = `scale(${tabletScale})`;

    // Phase 3: Bottom deck fades & glides up (0.50 -> 0.88)
    if (liveQuizDeck) {
      const pDeck = Math.min(1, Math.max(0, (progress - 0.50) / 0.38));
      liveQuizDeck.style.opacity = pDeck;
      liveQuizDeck.style.transform = `translateY(${(1 - pDeck) * 28}px)`;
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

    // Stage 02: Bóc tách thu nhỏ ảnh từ 6/7 xuống 4/7
    updateBocTachShrink();

    // Stage 03: Live Quiz fan-out từ giữa qua 2 bên
    updateLiveQuizFanOut();

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
