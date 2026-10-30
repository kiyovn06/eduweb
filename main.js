/* ============================================================================
   KIYOEDU AWWWARDS SCROLLYTELLING RUNTIME · MASTER CONTROLLER
   Standards: Awwwards Site of the Day / Studio Freight / Lenis Integration
   Zero Scroll Locking · Continuous Inertial Flow · Micro-Parallax Orchestration
   High Performance · Zero Layout Thrashing · Offscreen Section Culling · Zero Paint Spikes
   ============================================================================ */

import Lenis from 'lenis';
import { ScrollytellingEngine } from './webgpu-story-engine.js';

async function initScrollytelling() {
  // ── 0. Lenis Smooth Scroll Engine (Awwwards Industry Benchmark) ──────────
  const lenis = new Lenis({
    duration: 1.3,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    smoothWheel: true,
    smoothTouch: false,
    wheelMultiplier: 0.72,
    touchMultiplier: 1.0,
  });
  window.lenis = lenis;

  // ── 1. Technical Canvas Background Engine ─────────────────────────────────
  const canvas = document.getElementById('scrolly-canvas');
  let engine = null;
  if (canvas) {
    engine = new ScrollytellingEngine(canvas);
    await engine.init();
  }

  // Unified Frame Loop: Lenis + Canvas in a Single rAF Callback
  function raf(time) {
    lenis.raf(time);
    if (engine) engine.render(time);
    requestAnimationFrame(raf);
  }
  requestAnimationFrame(raf);

  // ── 2. DOM Elements Cache ─────────────────────────────────────────────────
  const stages = Array.from(document.querySelectorAll('.stage-section'));
  const navLinks = Array.from(document.querySelectorAll('.nav-link'));

  // Hero Elements Cache
  const heroStage = document.getElementById('tong-quan');
  const heroForeground = document.getElementById('hero-foreground');
  const heroBackdrop = document.getElementById('hero-backdrop');
  const heroBgImg = document.getElementById('hero-bg-img');
  const heroPoincianaWrap = document.getElementById('hero-poinciana-wrap');

  // Stage 02: Bóc tách
  const bocTachTrack = document.getElementById('boc-tach-ai');
  const bocTachVisualCol = document.getElementById('boc-tach-visual-col');
  const bocTachTextCol = document.getElementById('boc-tach-text-col');
  const bocTachTitleGroup = bocTachTextCol ? bocTachTextCol.querySelector('.boc-tach-header-group') : null;
  const bocTachCards = bocTachTextCol ? Array.from(bocTachTextCol.querySelectorAll('.feature-block')) : [];

  // Stage 03: Live Quiz
  const liveQuizTrack = document.getElementById('live-quiz');
  const fanCenterTablet = document.getElementById('fan-center-tablet');
  const fanCardL1 = document.getElementById('fan-card-l1');
  const fanCardL2 = document.getElementById('fan-card-l2');
  const fanCardR1 = document.getElementById('fan-card-r1');
  const fanCardR2 = document.getElementById('fan-card-r2');

  // Stage 04: Grail Sheet
  const grailSheetCard = document.getElementById('grail-sheet-card');
  const grailSheetSection = document.getElementById('quan-ly-lop');
  const grailHeaderEl = grailSheetSection ? grailSheetSection.querySelector('.grail-sheet-header') : null;
  const grailVisualEl = grailSheetSection ? grailSheetSection.querySelector('.grail-sheet-visual') : null;
  const grailGalleryItems = grailSheetSection ? Array.from(grailSheetSection.querySelectorAll('.grail-gallery-item')) : [];
  const grailNumItems = grailGalleryItems ? grailGalleryItems.length : 0;
  const grailGalleryStrip = document.getElementById('grail-gallery-strip');

  // Stage 04.1: Showcase Quản Lý Trong 1 Ứng Dụng (Phone & Card Stacking)
  const showcaseTrack = document.getElementById('quan-ly-app') || document.getElementById('app-showcase-track');
  const p1 = document.getElementById('phone-card-1');
  const p2 = document.getElementById('phone-card-2');
  const c1 = document.getElementById('feature-card-1');
  const c2 = document.getElementById('feature-card-2');
  const appLeftCol = showcaseTrack ? showcaseTrack.querySelector('.managed-left-col') : null;
  const appRightCol = showcaseTrack ? showcaseTrack.querySelector('.managed-right-col') : null;
  const c1Title = c1 ? c1.querySelector('.card-title') : null;

  // Stats Counters
  const statsStrip = document.getElementById('stats-counter-strip');
  const statValues = Array.from(document.querySelectorAll('.stat-value'));
  let statsCounted = false;

  // Smootherstep helper: C2 continuous zero acceleration jerk at boundaries
  function smootherstep(t) {
    const c = Math.max(0, Math.min(1, t));
    return c * c * c * (c * (c * 6 - 15) + 10);
  }

  // Precomputed Dimensions & Track Geometry (Zero getBoundingClientRect in scroll loop!)
  let windowH = window.innerHeight;
  let windowW = window.innerWidth;
  let cachedGrailVisualW = 0;
  let cachedAppStopOffsetY = 150;
  let cachedCardHeight = 400;

  let bocTachTop = 0, bocTachHeight = 0, bocTachDist = 0;
  let liveQuizTop = 0, liveQuizHeight = 0, liveQuizFanDist = 0;
  let grailSheetTop = 0, grailSheetHeight = 0, grailSheetDist = 0;
  let showcaseTop = 0, showcaseHeight = 0, showcaseDist = 0;
  let cachedStageOffsets = [];

  function getElementPageTop(el) {
    if (!el) return 0;
    const rect = el.getBoundingClientRect();
    return rect.top + (window.pageYOffset || document.documentElement.scrollTop || 0);
  }

  function updateCachedDimensions() {
    windowH = window.innerHeight;
    windowW = window.innerWidth;

    if (bocTachTrack) {
      bocTachTop = getElementPageTop(bocTachTrack);
      bocTachHeight = bocTachTrack.offsetHeight;
      bocTachDist = bocTachHeight - windowH;
    }
    if (liveQuizTrack) {
      liveQuizTop = getElementPageTop(liveQuizTrack);
      liveQuizHeight = liveQuizTrack.offsetHeight;
      liveQuizFanDist = liveQuizHeight - windowH;
    }
    if (grailSheetSection) {
      grailSheetTop = getElementPageTop(grailSheetSection);
      grailSheetHeight = grailSheetSection.offsetHeight;
      grailSheetDist = grailSheetHeight - windowH;
    }
    if (showcaseTrack) {
      showcaseTop = getElementPageTop(showcaseTrack);
      showcaseHeight = showcaseTrack.offsetHeight;
      showcaseDist = showcaseHeight - windowH;
    }

    cachedStageOffsets = stages.map((s) => {
      const top = getElementPageTop(s);
      const height = s.offsetHeight;
      return { top, bottom: top + height };
    });

    if (grailVisualEl) {
      cachedGrailVisualW = grailVisualEl.clientWidth || (windowW - 380);
    }
    if (c1 && c1Title) {
      const titleBottom = c1Title.offsetTop + c1Title.offsetHeight;
      if (titleBottom > 0) {
        cachedAppStopOffsetY = titleBottom + 16;
      }
      cachedCardHeight = c1.offsetHeight || windowH;
    }
  }
  updateCachedDimensions();
  window.addEventListener('resize', updateCachedDimensions, { passive: true });
  window.addEventListener('load', updateCachedDimensions, { passive: true });
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(updateCachedDimensions);
  }
  setTimeout(updateCachedDimensions, 400);

  // Bind Grail Gallery Jump Click Handler (ONCE at init)
  if (grailGalleryStrip && grailSheetSection && grailNumItems > 0) {
    grailGalleryItems.forEach((stripItem, sIdx) => {
      stripItem.addEventListener('click', () => {
        const stepTargets = grailNumItems > 1
          ? [0.02, ...Array.from({ length: grailNumItems - 1 }, (_, i) => 0.05 + (i + 0.5) * (0.9 / (grailNumItems - 1)))]
          : [0];
        const targetP = stepTargets[sIdx] || 0;
        const sRect = grailSheetSection.getBoundingClientRect();
        const curScrollY = window.scrollY;
        const sTop = curScrollY + sRect.top;
        const sTotalDist = grailSheetSection.offsetHeight - windowH;
        const targetScrollY = sTop + targetP * sTotalDist;
        if (window.lenis) {
          window.lenis.scrollTo(targetScrollY, { duration: 1.2 });
        } else {
          window.scrollTo({ top: targetScrollY, behavior: 'smooth' });
        }
      });
    });
  }

  // ── 3. Smooth Hero Pinned Scroll & Scaling (100% GPU Accelerated · Zero Repaint) ───
  let lastHeroProgress = -1;
  function updateHeroParallax(scrollY) {
    if (!heroStage || windowH <= 0) return;
    const progress = Math.min(1, Math.max(0, scrollY / windowH));
    if (Math.abs(progress - lastHeroProgress) < 0.0005) return;
    if ((progress === 0 && lastHeroProgress === 0) || (progress === 1 && lastHeroProgress === 1)) return;
    lastHeroProgress = progress;

    if (heroForeground) {
      const textScale = Math.max(0.68, 1 - progress * 0.32);
      const textOpacity = Math.max(0, 1 - progress * 1.35);
      const textY = -progress * 60;
      heroForeground.style.transform = `translate3d(0, ${textY.toFixed(1)}px, 0) scale(${textScale.toFixed(3)})`;
      heroForeground.style.opacity = textOpacity.toFixed(3);
    }

    if (heroBackdrop) {
      const imgScale = Math.max(0.94, 1 - progress * 0.06).toFixed(3);
      heroBackdrop.style.transform = `scale(${imgScale})`;
    }

    if (heroPoincianaWrap) {
      const poincianaY = (-progress * 30).toFixed(1);
      heroPoincianaWrap.style.transform = `translate3d(0, ${poincianaY}px, 0)`;
    }
  }

  // ── 3.1 Stage 02: Bóc tách - Ảnh 6/7 thu nhỏ về 4/7 · Chữ lần lượt từ phải vào ───
  let lastBocTachProgress = -1;
  let lastBocTachWidth = -1;
  function applyBocTachState(progress) {
    const shrinkProgress = Math.min(1, Math.max(0, progress));
    const startWidth = (6 / 7) * 100;
    const endWidth = (4 / 7) * 100;
    const currentWidth = startWidth - shrinkProgress * (startWidth - endWidth);
    if (Math.abs(currentWidth - lastBocTachWidth) >= 0.1 || progress === 0 || progress === 1) {
      bocTachVisualCol.style.width = `${currentWidth.toFixed(2)}%`;
      lastBocTachWidth = currentWidth;
    }

    if (bocTachTitleGroup) {
      const raw = Math.min(1, Math.max(0, shrinkProgress / 0.35));
      const titleProg = smootherstep(raw);
      bocTachTitleGroup.style.opacity = titleProg.toFixed(3);
      bocTachTitleGroup.style.transform = `translate3d(${((1 - titleProg) * 36).toFixed(1)}px, 0, 0)`;
    }

    if (bocTachCards[0]) {
      const raw = Math.min(1, Math.max(0, (shrinkProgress - 0.18) / 0.35));
      const c0Prog = smootherstep(raw);
      bocTachCards[0].style.opacity = c0Prog.toFixed(3);
      bocTachCards[0].style.transform = `translate3d(${((1 - c0Prog) * 36).toFixed(1)}px, 0, 0)`;
    }

    if (bocTachCards[1]) {
      const raw = Math.min(1, Math.max(0, (shrinkProgress - 0.36) / 0.35));
      const c1Prog = smootherstep(raw);
      bocTachCards[1].style.opacity = c1Prog.toFixed(3);
      bocTachCards[1].style.transform = `translate3d(${((1 - c1Prog) * 36).toFixed(1)}px, 0, 0)`;
    }

    if (bocTachCards[2]) {
      const raw = Math.min(1, Math.max(0, (shrinkProgress - 0.54) / 0.38));
      const c2Prog = smootherstep(raw);
      bocTachCards[2].style.opacity = c2Prog.toFixed(3);
      bocTachCards[2].style.transform = `translate3d(${((1 - c2Prog) * 36).toFixed(1)}px, 0, 0)`;
    }
  }

  function updateBocTachShrink(scrollY) {
    if (!bocTachTrack || !bocTachVisualCol || !bocTachTextCol) return;
    if (windowW <= 768) return;

    const rectTop = bocTachTop - scrollY;
    const rectBottom = rectTop + bocTachHeight;

    if (rectBottom < -100) {
      if (lastBocTachProgress === 1) return;
      applyBocTachState(1);
      lastBocTachProgress = 1;
      return;
    }
    if (rectTop > windowH + 100) {
      if (lastBocTachProgress === 0) return;
      applyBocTachState(0);
      lastBocTachProgress = 0;
      return;
    }

    if (bocTachDist <= 0) return;

    const passed = scrollY - bocTachTop;
    const progress = Math.min(1, Math.max(0, passed / bocTachDist));
    if (Math.abs(progress - lastBocTachProgress) < 0.0008) return;

    applyBocTachState(progress);
    lastBocTachProgress = progress;
  }

  // ── 3.2 Stage 03: Live Quiz - Fan-out từ giữa sang 2 bên khi cuộn & đứng im ─────────
  let lastFanProgress = -1;
  function applyFanState(fanProgress) {
    const stageW = Math.min(windowW, 1440);
    const scaleFactor = Math.max(0.72, Math.min(1.0, stageW / 1366));

    const baseOff1 = 5 * scaleFactor;
    const baseRot1 = 1.8;
    const targetOff1 = 240 * scaleFactor;
    const targetRot1 = 3.5;

    const baseOff2 = 10 * scaleFactor;
    const baseRot2 = 3.6;
    const targetOff2 = 450 * scaleFactor;
    const targetRot2 = 7.0;

    // Phase 1: Left 1 & Right 1
    const rawP1 = Math.min(1, Math.max(0, fanProgress / 0.68));
    const p1 = smootherstep(rawP1);
    const dist1 = baseOff1 + (targetOff1 - baseOff1) * p1;
    const rot1 = baseRot1 + (targetRot1 - baseRot1) * p1;

    if (fanCardL1) {
      fanCardL1.style.transform = `translate3d(calc(-50% - ${dist1.toFixed(1)}px), -50%, 0) rotate(${(-rot1).toFixed(2)}deg)`;
    }
    if (fanCardR1) {
      fanCardR1.style.transform = `translate3d(calc(-50% + ${dist1.toFixed(1)}px), -50%, 0) rotate(${rot1.toFixed(2)}deg)`;
    }

    // Phase 2: Left 2 & Right 2
    const rawP2 = Math.min(1, Math.max(0, (fanProgress - 0.18) / 0.78));
    const p2 = smootherstep(rawP2);
    const dist2 = baseOff2 + (targetOff2 - baseOff2) * p2;
    const rot2 = baseRot2 + (targetRot2 - baseRot2) * p2;

    if (fanCardL2) {
      fanCardL2.style.transform = `translate3d(calc(-50% - ${dist2.toFixed(1)}px), -50%, 0) rotate(${(-rot2).toFixed(2)}deg)`;
    }
    if (fanCardR2) {
      fanCardR2.style.transform = `translate3d(calc(-50% + ${dist2.toFixed(1)}px), -50%, 0) rotate(${rot2.toFixed(2)}deg)`;
    }

    // Center card
    const pCenter = Math.min(1, Math.max(0, fanProgress / 0.68));
    const tabletScale = (1.0 + 0.02 * pCenter).toFixed(3);
    fanCenterTablet.style.transform = `translate3d(-50%, -50%, 0) scale(${tabletScale})`;
  }

  function updateLiveQuizFanOut(scrollY) {
    if (!liveQuizTrack || !fanCenterTablet) return;
    if (windowW <= 768) return;

    const rectTop = liveQuizTop - scrollY;
    const rectBottom = rectTop + liveQuizHeight;

    if (rectBottom < -100) {
      if (lastFanProgress === 1) return;
      applyFanState(1);
      lastFanProgress = 1;
      return;
    }
    if (rectTop > windowH + 100) {
      if (lastFanProgress === 0) return;
      applyFanState(0);
      lastFanProgress = 0;
      return;
    }

    const passed = scrollY - liveQuizTop;
    const fanProgress = Math.min(1, Math.max(0, passed / liveQuizFanDist));
    if (Math.abs(fanProgress - lastFanProgress) < 0.0008) return;

    applyFanState(fanProgress);
    lastFanProgress = fanProgress;
  }

  // ── 3.3 Stage 04: Grail-Style Editorial Sheet Transition (Zero Allocations · Precomputed Steps) ─────────
  const grailSteps = [];
  const cachedGrailWidths = [];
  const cachedGrailMargins = [];
  const lastRenderedWidths = [];
  const lastRenderedMargins = [];

  function initGrailSteps() {
    if (!grailGalleryItems || grailNumItems === 0) return;
    const numTransitions = grailNumItems - 1;
    const startPad = 0.02;
    const endPad = 0.02;
    const availableP = 1 - startPad - endPad;
    const stepSpan = availableP / Math.max(1, numTransitions);

    grailSteps.length = 0;
    for (let i = 0; i < numTransitions; i++) {
      grailSteps.push({
        from: i,
        to: i + 1,
        start: startPad + i * stepSpan,
        end: startPad + (i + 1) * stepSpan,
      });
    }

    cachedGrailWidths.length = grailNumItems;
    cachedGrailMargins.length = grailNumItems;
    lastRenderedWidths.length = grailNumItems;
    lastRenderedMargins.length = grailNumItems;
    for (let i = 0; i < grailNumItems; i++) {
      cachedGrailWidths[i] = 0;
      cachedGrailMargins[i] = 0;
      lastRenderedWidths[i] = -1;
      lastRenderedMargins[i] = -1;
    }
  }
  initGrailSteps();

  let lastGrailProgress = -1;
  function applyGrailState(galleryProgress) {
    if (!grailGalleryItems || grailNumItems === 0) return;
    const visualW = cachedGrailVisualW > 0 ? cachedGrailVisualW : (windowW - 380);
    const collapsedW = 48;
    const gap = 24;

    if (grailSteps.length === 0 || galleryProgress < grailSteps[0].start) {
      cachedGrailWidths[0] = visualW;
      cachedGrailMargins[0] = 0;
      for (let i = 1; i < grailNumItems; i++) {
        cachedGrailWidths[i] = 0;
        cachedGrailMargins[i] = 0;
      }
    } else if (galleryProgress >= grailSteps[grailSteps.length - 1].end) {
      for (let i = 0; i < grailNumItems - 1; i++) {
        cachedGrailWidths[i] = collapsedW;
        cachedGrailMargins[i] = i === 0 ? 0 : gap;
      }
      const usedLeft = (grailNumItems - 1) * (collapsedW + gap);
      cachedGrailWidths[grailNumItems - 1] = Math.max(collapsedW, visualW - usedLeft);
      cachedGrailMargins[grailNumItems - 1] = gap;
    } else {
      let currentStepIdx = 0;
      for (let s = 0; s < grailSteps.length; s++) {
        if (galleryProgress >= grailSteps[s].start && galleryProgress < grailSteps[s].end) {
          currentStepIdx = s;
          break;
        }
      }
      const curStep = grailSteps[currentStepIdx];
      const rawP = Math.max(0, Math.min(1, (galleryProgress - curStep.start) / (curStep.end - curStep.start)));

      const easeT = rawP * rawP * (3 - 2 * rawP);

      for (let i = 0; i < curStep.from; i++) {
        cachedGrailWidths[i] = collapsedW;
        cachedGrailMargins[i] = i === 0 ? 0 : gap;
      }

      const usedLeft = curStep.from * (collapsedW + gap);
      const spaceForPair = Math.max(collapsedW + gap + 100, visualW - usedLeft);

      cachedGrailMargins[curStep.from] = curStep.from === 0 ? 0 : gap;
      const shrinkAmount = (spaceForPair - collapsedW) * easeT;
      const fromW = Math.max(collapsedW, spaceForPair - shrinkAmount);
      cachedGrailWidths[curStep.from] = fromW;

      cachedGrailMargins[curStep.to] = gap;
      const freedSpace = spaceForPair - fromW;
      const toW = freedSpace > gap ? freedSpace - gap : 0;
      cachedGrailWidths[curStep.to] = toW;

      for (let i = curStep.to + 1; i < grailNumItems; i++) {
        cachedGrailWidths[i] = 0;
        cachedGrailMargins[i] = 0;
      }
    }

    for (let idx = 0; idx < grailNumItems; idx++) {
      const item = grailGalleryItems[idx];
      const w = cachedGrailWidths[idx];
      const ml = cachedGrailMargins[idx];

      if (w <= 0.5) {
        if (item.style.display !== 'none') {
          item.style.display = 'none';
          item.style.opacity = '0';
          item.classList.remove('is-active', 'is-collapsed');
          lastRenderedWidths[idx] = 0;
          lastRenderedMargins[idx] = 0;
        }
      } else {
        if (item.style.display !== 'block') {
          item.style.display = 'block';
          item.style.opacity = '1';
        }

        const isCollapsed = w <= 55;
        const isActive = !isCollapsed;

        if (Math.abs(w - lastRenderedWidths[idx]) > 0.4) {
          item.style.width = `${w.toFixed(1)}px`;
          lastRenderedWidths[idx] = w;
        }
        if (Math.abs(ml - lastRenderedMargins[idx]) > 0.4) {
          item.style.marginLeft = `${ml.toFixed(1)}px`;
          lastRenderedMargins[idx] = ml;
        }

        item.classList.toggle('is-collapsed', isCollapsed);
        item.classList.toggle('is-active', isActive);
      }
    }
  }

  function updateGrailSheetTransition(scrollY) {
    if (!grailSheetCard || !grailSheetSection) return;
    if (windowW <= 768) {
      if (grailHeaderEl) { grailHeaderEl.style.transform = 'none'; grailHeaderEl.style.opacity = '1'; }
      if (grailVisualEl) { grailVisualEl.style.transform = 'none'; grailVisualEl.style.opacity = '1'; }
      if (grailGalleryItems) {
        grailGalleryItems.forEach((it, idx) => {
          it.style.display = idx === 0 ? 'block' : 'none';
          it.style.width = idx === 0 ? '100%' : '0px';
          it.style.marginLeft = '0px';
          it.style.opacity = idx === 0 ? '1' : '0';
        });
      }
      return;
    }

    const rectTop = grailSheetTop - scrollY;
    const rectBottom = rectTop + grailSheetHeight;

    if (rectBottom < -100) {
      if (lastGrailProgress === 1) return;
      applyGrailState(1);
      lastGrailProgress = 1;
      return;
    }
    if (rectTop > windowH + 100) {
      if (lastGrailProgress === 0) return;
      applyGrailState(0);
      lastGrailProgress = 0;
      return;
    }

    if (grailSheetDist <= 0) return;

    const passed = scrollY - grailSheetTop;
    const galleryProgress = Math.min(1, Math.max(0, passed / grailSheetDist));
    if (Math.abs(galleryProgress - lastGrailProgress) < 0.0008) return;

    applyGrailState(galleryProgress);
    lastGrailProgress = galleryProgress;
  }

  // ── 3.4 Stage 04.1: Showcase Quản Lý Trong 1 Ứng Dụng (Phone & Card Stacking) ──
  let lastAppState = -999;
  let lastAppProgress = -1;

  function applyAppBeforeEnterState() {
    if (appLeftCol) {
      appLeftCol.style.transform = 'translateX(-180px)';
      appLeftCol.style.opacity = '0';
    }
    if (appRightCol) {
      appRightCol.style.transform = 'translateX(180px)';
      appRightCol.style.opacity = '0';
    }
    if (p1) {
      p1.style.transform = 'translate3d(-50%, calc(-50% + 50px), 0) scale(0.9)';
      p1.style.opacity = '0';
    }
    p2.style.transform = 'translate3d(-50%, 140%, 0)';
    p2.style.opacity = '0';
    p2.style.pointerEvents = 'none';
    c2.style.transform = 'translate3d(0, 140%, 0)';
    c2.style.opacity = '0';
    c2.style.pointerEvents = 'none';
  }

  function applyAppEnterState(enterProgress, isStateTransition = false) {
    if (isStateTransition) {
      if (c1) {
        c1.style.transform = 'translateY(0) scale(1)';
        c1.style.opacity = '1';
      }
      p2.style.transform = 'translate(-50%, 140%)';
      p2.style.opacity = '0';
      p2.style.pointerEvents = 'none';
      c2.style.transform = 'translateY(140%)';
      c2.style.opacity = '0';
      c2.style.pointerEvents = 'none';
    }

    const enterEase = 1 - Math.pow(1 - enterProgress, 2.5);
    const leftOffset = (-180 * (1 - enterEase)).toFixed(1);
    const rightOffset = (180 * (1 - enterEase)).toFixed(1);
    const enterOpacity = Math.min(1, enterEase * 1.6).toFixed(2);
    const centerScale = (0.9 + 0.1 * enterEase).toFixed(3);
    const centerOffsetY = Math.round(50 * (1 - enterEase));

    if (appLeftCol) {
      appLeftCol.style.transform = `translateX(${leftOffset}px)`;
      appLeftCol.style.opacity = enterOpacity;
    }
    if (appRightCol) {
      appRightCol.style.transform = `translateX(${rightOffset}px)`;
      appRightCol.style.opacity = enterOpacity;
    }
    if (p1) {
      p1.style.transform = `translate(-50%, calc(-50% + ${centerOffsetY}px)) scale(${centerScale})`;
      p1.style.opacity = enterOpacity;
    }
  }

  function applyAppStackState(progress) {
    if (appLeftCol) {
      appLeftCol.style.transform = 'none';
      appLeftCol.style.opacity = '1';
    }
    if (appRightCol) {
      appRightCol.style.transform = 'none';
      appRightCol.style.opacity = '1';
    }

    const stackProgress = Math.min(1, Math.max(0, (progress - 0.05) / 0.90));

    if (stackProgress <= 0) {
      p2.style.transform = 'translate3d(-50%, 140%, 0)';
      p2.style.opacity = '0';
      p2.style.pointerEvents = 'none';
      c2.style.transform = 'translate3d(0, 140%, 0)';
      c2.style.opacity = '0';
      c2.style.pointerEvents = 'none';
      if (p1) {
        p1.style.transform = 'translate3d(-50%, -50%, 0) scale(1)';
        p1.style.opacity = '1';
      }
      if (c1) {
        c1.style.transform = 'translate3d(0, 0, 0) scale(1)';
        c1.style.opacity = '1';
      }
      return;
    }

    const easeY = 1 - Math.pow(1 - stackProgress, 2.5);
    const phoneY = 140 - (190 * easeY);

    const startCardY = cachedCardHeight * 1.25;
    const currentCardY = Math.round(startCardY - (startCardY - cachedAppStopOffsetY) * easeY);
    const itemOpacity = Math.min(1, stackProgress * 3.5).toFixed(2);

    p2.style.transform = `translate3d(-50%, ${phoneY.toFixed(2)}%, 0)`;
    p2.style.opacity = itemOpacity;
    p2.style.pointerEvents = 'auto';

    c2.style.transform = `translate3d(0, ${currentCardY}px, 0)`;
    c2.style.opacity = itemOpacity;
    c2.style.pointerEvents = 'auto';

    // Under-card: Giữ tiêu đề Card 1 sắc nét, sử dụng opacity tăng tốc GPU 100%
    const underScale = (1 - 0.045 * easeY).toFixed(3);
    const underOpacity = (1 - 0.15 * easeY).toFixed(3);
    if (p1) {
      p1.style.transform = `translate3d(-50%, -50%, 0) scale(${underScale})`;
      p1.style.opacity = underOpacity;
    }
    if (c1) {
      c1.style.transform = 'translate3d(0, 0, 0) scale(1)';
      c1.style.opacity = '1';
    }
  }

  function updateAppPhoneStack(scrollY) {
    if (!showcaseTrack || !p2 || !c2) return;
    if (windowW <= 768) {
      if (appLeftCol) { appLeftCol.style.transform = 'none'; appLeftCol.style.opacity = '1'; }
      if (appRightCol) { appRightCol.style.transform = 'none'; appRightCol.style.opacity = '1'; }
      return;
    }

    const rectTop = showcaseTop - scrollY;
    const rectBottom = rectTop + showcaseHeight;

    if (rectBottom < -100) {
      if (lastAppState === 2 && lastAppProgress === 1) return;
      applyAppStackState(1);
      lastAppState = 2;
      lastAppProgress = 1;
      return;
    }
    if (rectTop > windowH + 100) {
      if (lastAppState === 0) return;
      applyAppBeforeEnterState();
      lastAppState = 0;
      lastAppProgress = 0;
      return;
    }

    if (showcaseDist <= 0) return;

    if (rectTop > 0 && rectTop <= windowH) {
      const enterProgress = 1 - (rectTop / windowH);
      applyAppEnterState(enterProgress, lastAppState !== 1);
      lastAppState = 1;
      lastAppProgress = enterProgress;
      return;
    }

    const passed = scrollY - showcaseTop;
    const progress = Math.min(1, Math.max(0, passed / showcaseDist));
    if (Math.abs(progress - lastAppProgress) < 0.0008 && lastAppState === 2) return;

    applyAppStackState(progress);
    lastAppState = 2;
    lastAppProgress = progress;
  }

  // ── 4. Real Metrics Count-Up ─────────────────────────────────────────────
  function runCountUp(el, target, duration = 1400) {
    const start = 0;
    const startTime = performance.now();
    const isDecimal = target % 1 !== 0;

    function step(currentTime) {
      const elapsed = currentTime - startTime;
      const p = Math.min(elapsed / duration, 1);
      const easeOut = 1 - Math.pow(1 - p, 3);
      const currentVal = start + (target - start) * easeOut;

      const formatted = isDecimal
        ? currentVal.toFixed(1)
        : (target >= 1000 ? Math.floor(currentVal).toLocaleString('vi-VN') : String(Math.floor(currentVal)));
      if (el.textContent !== formatted) {
        el.textContent = formatted;
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
          showcaseObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15 }
  );

  if (statsStrip) showcaseObserver.observe(statsStrip);

  // ── 5. Flow-In Observer (Chảy vô từ bên trái & bên phải) ─────────────────
  const flowObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          flowObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
  );

  document.querySelectorAll('.flow-in-left, .flow-in-right, .flow-in-up').forEach((el) => {
    flowObserver.observe(el);
  });

  setTimeout(() => {
    document.querySelectorAll('.stage-hero .flow-in-left, .stage-hero .flow-in-right, .stage-hero .flow-in-up').forEach((el) => {
      el.classList.add('is-visible');
    });
  }, 80);

  // ── 6. Optimized Nav Link Active Tracking (Pure Binary/Offset Math · Zero DOM Reads) ──
  let lastActiveNavIdx = -1;
  function updateNavActiveLink(scrollY) {
    const checkY = scrollY + 120;
    let activeIdx = -1;
    for (let idx = 0; idx < cachedStageOffsets.length; idx++) {
      const stage = cachedStageOffsets[idx];
      if (checkY >= stage.top && checkY < stage.bottom) {
        activeIdx = idx;
        break;
      }
    }
    if (activeIdx !== lastActiveNavIdx && activeIdx !== -1) {
      lastActiveNavIdx = activeIdx;
      for (let lIdx = 0; lIdx < navLinks.length; lIdx++) {
        navLinks[lIdx].classList.toggle('is-active', lIdx === activeIdx);
      }
    }
  }

  // ── 7. Unified Frame Tick / Scroll Handler (100% Zero DOM Layout Reads) ──
  function onScrollUpdate(scrollY) {
    const totalScroll = document.documentElement.scrollHeight - windowH;

    // Canvas story engine sync
    if (engine && totalScroll > 0) {
      const progress = Math.max(0, Math.min(1, scrollY / totalScroll));
      engine.setStoryPos(progress * 10, progress);
    }

    updateHeroParallax(scrollY);
    updateBocTachShrink(scrollY);
    updateLiveQuizFanOut(scrollY);
    updateGrailSheetTransition(scrollY);
    updateAppPhoneStack(scrollY);
    updateNavActiveLink(scrollY);
  }

  if (lenis) {
    lenis.on('scroll', (e) => {
      onScrollUpdate(e.scroll);
    });
  } else {
    window.addEventListener('scroll', () => {
      onScrollUpdate(window.scrollY);
    }, { passive: true });
  }

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

  // Pre-decode scrollytelling images asynchronously so GPU textures are primed
  if ('requestIdleCallback' in window) {
    window.requestIdleCallback(() => {
      document.querySelectorAll('img').forEach((img) => {
        if (img.decode) img.decode().catch(() => {});
      });
    });
  } else {
    setTimeout(() => {
      document.querySelectorAll('img').forEach((img) => {
        if (img.decode) img.decode().catch(() => {});
      });
    }, 120);
  }

  // Initial update
  onScrollUpdate(window.pageYOffset || 0);
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initScrollytelling);
} else {
  initScrollytelling();
}
