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
  window.lenis = lenis;

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

  // Quy Trình Scrollytelling & Solid Black Timeline Ladder
  const quyTrinhTrack = document.getElementById('quy-trinh-track');
  const quyTrinhCanvas = document.getElementById('quy-trinh-canvas');
  const quyTrinhRulerHandle = document.getElementById('quy-trinh-ruler-handle');
  const quyTrinhStepViews = Array.from(document.querySelectorAll('.quy-trinh-step-view'));
  const quyTrinhMilestones = document.getElementById('quy-trinh-milestones');
  let quyTrinhCanvasCtx = null;
  let lastActiveQuyTrinhStep = -1;
  let lastQuyTrinhProgress = 0;
  let isDraggingRuler = false;
  let rulerDragStartY = 0;
  let rulerDragStartScrollY = 0;

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
      const raw = Math.min(1, Math.max(0, (shrinkProgress - 0.05) / 0.28));
      const titleProg = smootherstep(raw);
      titleGroup.style.opacity = titleProg.toFixed(3);
      titleGroup.style.transform = `translateX(${((1 - titleProg) * 40).toFixed(1)}px)`;
    }

    // Thẻ 01: Đi vào kế tiếp sau tiêu đề
    if (cards[0]) {
      const raw = Math.min(1, Math.max(0, (shrinkProgress - 0.18) / 0.28));
      const c0Prog = smootherstep(raw);
      cards[0].style.opacity = c0Prog.toFixed(3);
      cards[0].style.transform = `translateX(${((1 - c0Prog) * 40).toFixed(1)}px)`;
    }

    // Thẻ 02: Đi vào kế tiếp sau thẻ 01
    if (cards[1]) {
      const raw = Math.min(1, Math.max(0, (shrinkProgress - 0.32) / 0.28));
      const c1Prog = smootherstep(raw);
      cards[1].style.opacity = c1Prog.toFixed(3);
      cards[1].style.transform = `translateX(${((1 - c1Prog) * 40).toFixed(1)}px)`;
    }

    // Thẻ 03: Đi vào kế tiếp sau thẻ 02
    if (cards[2]) {
      const raw = Math.min(1, Math.max(0, (shrinkProgress - 0.46) / 0.28));
      const c2Prog = smootherstep(raw);
      cards[2].style.opacity = c2Prog.toFixed(3);
      cards[2].style.transform = `translateX(${((1 - c2Prog) * 40).toFixed(1)}px)`;
    }
  }

  // ── 3.2 Stage 03: Live Quiz - Fan-out từ giữa sang 2 bên khi cuộn & đứng im ─────────
  function updateLiveQuizFanOut() {
    if (!liveQuizTrack || !fanCenterTablet) return;
    if (window.innerWidth <= 768) return;

    const rect = liveQuizTrack.getBoundingClientRect();
    const windowH = window.innerHeight;
    const totalDist = rect.height - windowH;
    if (totalDist <= 0) return;

    const passed = -rect.top;

    // Cards xòe hoàn chỉnh trong khoảng 1.15 * windowH đầu tiên, sau đó ĐỨNG IM TUYỆT ĐỐI
    const fanDist = windowH * 1.15;
    const fanProgress = Math.min(1, Math.max(0, passed / fanDist));

    // Dynamic width scale based on window width:
    const stageW = Math.min(window.innerWidth, 1440);
    const scaleFactor = Math.max(0.72, Math.min(1.0, stageW / 1366));

    // Base preview at rest: che nhiều, xem trước chỉ gần 10px và hơi chéo chéo
    const baseOff1 = 5 * scaleFactor;
    const baseRot1 = 1.8;
    const targetOff1 = 240 * scaleFactor;
    const targetRot1 = 3.5;

    const baseOff2 = 10 * scaleFactor;
    const baseRot2 = 3.6;
    const targetOff2 = 450 * scaleFactor;
    const targetRot2 = 7.0;

    // Phase 1: Left 1 & Right 1 (bắt đầu che nhiều ló ~10px chéo, cuộn xuống xòe rộng ra)
    const rawP1 = Math.min(1, Math.max(0, fanProgress / 0.65));
    const p1 = smootherstep(rawP1);
    const dist1 = baseOff1 + (targetOff1 - baseOff1) * p1;
    const rot1 = baseRot1 + (targetRot1 - baseRot1) * p1;

    if (fanCardL1) {
      fanCardL1.style.transform = `translate(calc(-50% - ${dist1.toFixed(1)}px), -50%) rotate(${(-rot1).toFixed(2)}deg)`;
      fanCardL1.style.opacity = '1';
    }
    if (fanCardR1) {
      fanCardR1.style.transform = `translate(calc(-50% + ${dist1.toFixed(1)}px), -50%) rotate(${rot1.toFixed(2)}deg)`;
      fanCardR1.style.opacity = '1';
    }

    // Phase 2: Left 2 & Right 2 (bắt đầu che nhiều ló ~10px chéo, cuộn xuống xòe xa nhất)
    const rawP2 = Math.min(1, Math.max(0, (fanProgress - 0.12) / 0.72));
    const p2 = smootherstep(rawP2);
    const dist2 = baseOff2 + (targetOff2 - baseOff2) * p2;
    const rot2 = baseRot2 + (targetRot2 - baseRot2) * p2;

    if (fanCardL2) {
      fanCardL2.style.transform = `translate(calc(-50% - ${dist2}px), -50%) rotate(${-rot2}deg)`;
      fanCardL2.style.opacity = '1';
    }
    if (fanCardR2) {
      fanCardR2.style.transform = `translate(calc(-50% + ${dist2}px), -50%) rotate(${rot2}deg)`;
      fanCardR2.style.opacity = '1';
    }

    // Center card: Giữ chuẩn vị trí tâm chính xác
    const pCenter = Math.min(1, Math.max(0, fanProgress / 0.6));
    const tabletScale = 1.0 + 0.02 * pCenter;
    fanCenterTablet.style.transform = `translate(-50%, -50%) scale(${tabletScale})`;
  }

  // ── 3.3 Stage 04: Grail-Style Editorial Sheet Transition (Chương 03 · Quản lý lớp học) ─────────
  // Cached visual width to prevent layout thrashing on scroll
  let cachedGrailVisualW = 0;
  function getGrailVisualW(visualEl) {
    if (cachedGrailVisualW > 0) return cachedGrailVisualW;
    if (!visualEl) return window.innerWidth - 380;
    cachedGrailVisualW = visualEl.clientWidth || (window.innerWidth - 380);
    return cachedGrailVisualW;
  }
  window.addEventListener('resize', () => {
    const visualEl = document.querySelector('.grail-sheet-visual');
    if (visualEl) cachedGrailVisualW = visualEl.clientWidth || (window.innerWidth - 380);
  });

  // ── 3.3 Stage 04: Grail-Style Editorial Sheet Transition (Chương 03 · Quản lý lớp học) ─────────
  function updateGrailSheetTransition() {
    const sheetCard = document.getElementById('grail-sheet-card');
    const sheetSection = document.getElementById('quan-ly-lop');
    if (!sheetCard || !sheetSection) return;

    const headerEl = sheetSection.querySelector('.grail-sheet-header');
    const visualEl = sheetSection.querySelector('.grail-sheet-visual');
    const galleryItems = Array.from(sheetSection.querySelectorAll('.grail-gallery-item'));
    const numItems = galleryItems ? galleryItems.length : 0;

    // Click handler for 40px collapsed items to quickly jump
    const galleryStrip = document.getElementById('grail-gallery-strip');
    if (galleryStrip && !galleryStrip.dataset.clickBound) {
      galleryStrip.dataset.clickBound = 'true';
      galleryItems.forEach((stripItem, sIdx) => {
        stripItem.addEventListener('click', () => {
          const stepTargets = numItems > 1
            ? [0.02, ...Array.from({ length: numItems - 1 }, (_, i) => 0.05 + (i + 0.5) * (0.9 / (numItems - 1)))]
            : [0];
          const targetP = stepTargets[sIdx] || 0;
          const sRect = sheetSection.getBoundingClientRect();
          const curScrollY = window.scrollY;
          const sTop = curScrollY + sRect.top;
          const sTotalDist = sheetSection.offsetHeight - window.innerHeight;
          const targetScrollY = sTop + targetP * sTotalDist;
          window.scrollTo({ top: targetScrollY, behavior: 'smooth' });
        });
      });
    }

    if (window.innerWidth <= 768) {
      if (headerEl) { headerEl.style.transform = 'none'; headerEl.style.opacity = '1'; }
      if (visualEl) { visualEl.style.transform = 'none'; visualEl.style.opacity = '1'; }
      if (galleryItems) {
        galleryItems.forEach((it, idx) => {
          it.style.display = idx === 0 ? 'block' : 'none';
          it.style.width = idx === 0 ? '100%' : '0px';
          it.style.marginLeft = '0px';
          it.style.opacity = idx === 0 ? '1' : '0';
        });
      }
      return;
    }

    const rect = sheetSection.getBoundingClientRect();
    const windowH = window.innerHeight;

    if (rect.top <= windowH && galleryItems && numItems > 0) {
      const visualW = getGrailVisualW(visualEl);
      const collapsedW = 40; // 40px standard slice
      const gap = 14;

      const totalDist = rect.height - windowH;
      const galleryProgress = totalDist > 0 ? Math.min(1, Math.max(0, -rect.top / totalDist)) : 0;

      // Calculate step windows with smooth Hermite easing
      const numTransitions = numItems - 1;
      const startPad = 0.04;
      const endPad = 0.04;
      const availableP = 1 - startPad - endPad;
      const stepSpan = availableP / Math.max(1, numTransitions);

      const steps = [];
      for (let i = 0; i < numTransitions; i++) {
        steps.push({
          from: i,
          to: i + 1,
          start: startPad + i * stepSpan,
          end: startPad + (i + 1) * stepSpan
        });
      }

      const widths = new Array(numItems).fill(0);
      const margins = new Array(numItems).fill(0);

      if (steps.length === 0 || galleryProgress < steps[0].start) {
        // Initial state: Photo 0 takes full width
        widths[0] = visualW;
        margins[0] = 0;
      } else if (galleryProgress >= steps[steps.length - 1].end) {
        // Final state: Photos 0..N-2 collapsed to 40px on left, last photo fills rest
        for (let i = 0; i < numItems - 1; i++) {
          widths[i] = collapsedW;
          margins[i] = i === 0 ? 0 : gap;
        }
        const usedLeft = (numItems - 1) * (collapsedW + gap);
        widths[numItems - 1] = Math.max(collapsedW, visualW - usedLeft);
        margins[numItems - 1] = gap;
      } else {
        // Transitioning between step from and to:
        let currentStepIdx = 0;
        for (let s = 0; s < steps.length; s++) {
          if (galleryProgress >= steps[s].start && galleryProgress < steps[s].end) {
            currentStepIdx = s;
            break;
          }
        }
        const curStep = steps[currentStepIdx];
        const rawP = Math.max(0, Math.min(1, (galleryProgress - curStep.start) / (curStep.end - curStep.start)));

        // Smooth Hermite easing (Smoothstep) for zero-jitter, continuous velocity
        const easeT = rawP * rawP * (3 - 2 * rawP);

        // Previous items are fully collapsed to 40px
        for (let i = 0; i < curStep.from; i++) {
          widths[i] = collapsedW;
          margins[i] = i === 0 ? 0 : gap;
        }

        // Space available for current pair (from & to)
        const usedLeft = curStep.from * (collapsedW + gap);
        const spaceForPair = Math.max(collapsedW + gap + 40, visualW - usedLeft);

        // Photo `from` margin:
        margins[curStep.from] = curStep.from === 0 ? 0 : gap;

        // Photo `from` shrinks smoothly to collapsedW (40px)
        const fromW = spaceForPair - (spaceForPair - collapsedW) * easeT;
        widths[curStep.from] = fromW;

        // Gap between `from` and `to` grows smoothly from 0 to 14px
        const curGap = gap * easeT;
        margins[curStep.to] = curGap;

        // Photo `to` expands to fill exact remainder
        // Mathematical invariant: fromW + curGap + toW = spaceForPair AT ALL TIMES!
        const toW = Math.max(0, spaceForPair - fromW - curGap);
        widths[curStep.to] = toW;

        // Subsequent items remain hidden
        for (let i = curStep.to + 1; i < numItems; i++) {
          widths[i] = 0;
          margins[i] = 0;
        }
      }

      // Apply widths and margins with subpixel precision
      galleryItems.forEach((item, idx) => {
        const w = widths[idx];
        const ml = margins[idx];

        if (w <= 0.5) {
          if (item.style.display !== 'none') {
            item.style.display = 'none';
            item.style.opacity = '0';
            item.classList.remove('is-active', 'is-collapsed');
          }
        } else {
          if (item.style.display !== 'block') {
            item.style.display = 'block';
            item.style.opacity = '1';
          }

          const isCollapsed = w <= 45;
          const isActive = !isCollapsed;

          item.style.width = `${w.toFixed(2)}px`;
          item.style.marginLeft = `${ml.toFixed(2)}px`;

          item.classList.toggle('is-collapsed', isCollapsed);
          item.classList.toggle('is-active', isActive);
        }
      });
    }
  }

  // ── 3.4 Stage 04.1: Showcase Quản Lý Trong 1 Ứng Dụng (Phone & Card Stacking) ──
  function updateAppPhoneStack() {
    const showcaseTrack = document.getElementById('quan-ly-app') || document.getElementById('app-showcase-track');
    const p1 = document.getElementById('phone-card-1');
    const p2 = document.getElementById('phone-card-2');
    const c1 = document.getElementById('feature-card-1');
    const c2 = document.getElementById('feature-card-2');
    if (!showcaseTrack || !p2 || !c2) return;

    const leftCol = showcaseTrack.querySelector('.managed-left-col');
    const rightCol = showcaseTrack.querySelector('.managed-right-col');

    if (window.innerWidth <= 768) {
      if (leftCol) { leftCol.style.transform = 'none'; leftCol.style.opacity = '1'; }
      if (rightCol) { rightCol.style.transform = 'none'; rightCol.style.opacity = '1'; }
      return;
    }

    const rect = showcaseTrack.getBoundingClientRect();
    const windowH = window.innerHeight;
    const totalDist = rect.height - windowH;
    if (totalDist <= 0) return;

    // ── GIAI ĐOẠN 1: HIỆU ỨNG CÁC THÀNH PHẦN BAY TỪ 2 BÊN VÀO KHI KÉO XUỐNG ──
    // Cột trái ("Quản lý trong 1 ứng dụng") bay từ bên trái vào (-180px -> 0px)
    // Cột phải (Thẻ tính năng) bay từ bên phải vào (+180px -> 0px)
    // Cột giữa (Điện thoại 1) zoom mượt mà vào giữa
    if (rect.top > 0 && rect.top <= windowH) {
      const enterProgress = 1 - (rect.top / windowH);
      const enterEase = 1 - Math.pow(1 - enterProgress, 2.5);

      const leftOffset = (-180 * (1 - enterEase)).toFixed(1);
      const rightOffset = (180 * (1 - enterEase)).toFixed(1);
      const enterOpacity = Math.min(1, enterEase * 1.6).toFixed(2);
      const centerScale = (0.9 + 0.1 * enterEase).toFixed(3);
      const centerOffsetY = Math.round(50 * (1 - enterEase));

      if (leftCol) {
        leftCol.style.transform = `translateX(${leftOffset}px)`;
        leftCol.style.opacity = enterOpacity;
      }
      if (rightCol) {
        rightCol.style.transform = `translateX(${rightOffset}px)`;
        rightCol.style.opacity = enterOpacity;
      }
      if (p1) {
        p1.style.transform = `translate(-50%, calc(-50% + ${centerOffsetY}px)) scale(${centerScale})`;
        p1.style.opacity = enterOpacity;
        p1.style.filter = 'brightness(1)';
      }
      if (c1) {
        c1.style.transform = 'translateY(0) scale(1)';
        c1.style.filter = 'brightness(1)';
      }

      // Ẩn Phone 2 và Card 2 khi mới bước vào
      p2.style.transform = 'translate(-50%, 140%)';
      p2.style.opacity = '0';
      p2.style.pointerEvents = 'none';
      c2.style.transform = 'translateY(140%)';
      c2.style.opacity = '0';
      c2.style.pointerEvents = 'none';
      return;
    } else if (rect.top > windowH) {
      // Chưa vào màn hình
      if (leftCol) {
        leftCol.style.transform = 'translateX(-180px)';
        leftCol.style.opacity = '0';
      }
      if (rightCol) {
        rightCol.style.transform = 'translateX(180px)';
        rightCol.style.opacity = '0';
      }
      if (p1) {
        p1.style.transform = 'translate(-50%, calc(-50% + 50px)) scale(0.9)';
        p1.style.opacity = '0';
      }
      p2.style.transform = 'translate(-50%, 140%)';
      p2.style.opacity = '0';
      p2.style.pointerEvents = 'none';
      c2.style.transform = 'translateY(140%)';
      c2.style.opacity = '0';
      c2.style.pointerEvents = 'none';
      return;
    }

    // Khi đã vào trọn màn hình (rect.top <= 0): Cột trái và Cột phải cố định vững chắc
    if (leftCol) {
      leftCol.style.transform = 'none';
      leftCol.style.opacity = '1';
    }
    if (rightCol) {
      rightCol.style.transform = 'none';
      rightCol.style.opacity = '1';
    }

    // ── GIAI ĐOẠN 2: STACKING PHONE 2 VÀ CARD 2 TRƯỢT LÊN ĐÈ LÊN PHONE 1 VÀ CARD 1 ──
    const passed = -rect.top;
    const progress = Math.min(1, Math.max(0, passed / totalDist));

    const stackProgress = Math.min(1, Math.max(0, (progress - 0.15) / 0.70));
    
    if (stackProgress <= 0) {
      p2.style.transform = 'translate(-50%, 140%)';
      p2.style.opacity = '0';
      p2.style.pointerEvents = 'none';
      c2.style.transform = 'translateY(140%)';
      c2.style.opacity = '0';
      c2.style.pointerEvents = 'none';
      if (p1) {
        p1.style.transform = 'translate(-50%, -50%) scale(1)';
        p1.style.opacity = '1';
        p1.style.filter = 'brightness(1)';
      }
      if (c1) {
        c1.style.transform = 'translateY(0) scale(1)';
        c1.style.filter = 'brightness(1)';
      }
      return;
    }

    const easeY = 1 - Math.pow(1 - stackProgress, 2.5); // Smooth natural deceleration
    const phoneY = 140 - (190 * easeY); // from 140% to -50%

    // Điểm dừng của Card 2: chạm ngay dưới tiêu đề của Card 1 là dừng lại
    let stopOffsetY = 165;
    const c1Title = c1 ? c1.querySelector('.card-title') : null;
    if (c1 && c1Title) {
      const titleBottom = c1Title.offsetTop + c1Title.offsetHeight;
      if (titleBottom > 0) {
        stopOffsetY = titleBottom + 16;
      }
    }

    const cardHeight = c1 ? c1.offsetHeight : windowH;
    const startCardY = cardHeight * 1.25;
    const currentCardY = Math.round(startCardY - (startCardY - stopOffsetY) * easeY);
    const itemOpacity = Math.min(1, stackProgress * 3.5).toFixed(2);

    p2.style.transform = `translate(-50%, ${phoneY.toFixed(2)}%)`;
    p2.style.opacity = itemOpacity;
    p2.style.pointerEvents = 'auto';

    c2.style.transform = `translateY(${currentCardY}px)`;
    c2.style.opacity = itemOpacity;
    c2.style.pointerEvents = 'auto';

    // Under-card: Giữ tiêu đề Card 1 nguyên vẹn, sắc nét
    const underScale = (1 - 0.045 * easeY).toFixed(3);
    const underBright = (1 - 0.15 * easeY).toFixed(2);
    if (p1) {
      p1.style.transform = `translate(-50%, -50%) scale(${underScale})`;
      p1.style.opacity = '1';
      p1.style.filter = `brightness(${underBright})`;
    }
    if (c1) {
      c1.style.transform = 'translateY(0) scale(1)';
      c1.style.filter = 'brightness(1)';
    }
  }

  // ── 4. Minimalist Solid Black Timeline & Fullscreen Expansion (#quy-trinh) ───
  function initQuyTrinhCanvas() {
    if (!quyTrinhCanvas) return;
    quyTrinhCanvasCtx = quyTrinhCanvas.getContext('2d');
    resizeQuyTrinhCanvas();
    window.addEventListener('resize', resizeQuyTrinhCanvas, { passive: true });

    // Interactive Drag-to-Scroll on ruler handle ("phải kéo được")
    if (quyTrinhRulerHandle) {
      quyTrinhRulerHandle.addEventListener('pointerdown', (e) => {
        isDraggingRuler = true;
        rulerDragStartY = e.clientY;
        rulerDragStartScrollY = window.scrollY;
        quyTrinhRulerHandle.classList.add('is-grabbing');
        try { quyTrinhRulerHandle.setPointerCapture(e.pointerId); } catch (err) {}
        document.body.style.userSelect = 'none';
      });

      quyTrinhRulerHandle.addEventListener('pointermove', (e) => {
        if (!isDraggingRuler || !quyTrinhTrack) return;
        const dy = e.clientY - rulerDragStartY;
        const trackRect = quyTrinhTrack.getBoundingClientRect();
        const totalDist = trackRect.height - window.innerHeight;
        // Sensitivity: dragging across ~70% screen height scrolls through the section
        const dragRatio = totalDist / (window.innerHeight * 0.70);
        const targetScrollY = rulerDragStartScrollY + dy * dragRatio;
        if (window.lenis) {
          window.lenis.scrollTo(targetScrollY, { immediate: true });
        } else {
          window.scrollTo(0, targetScrollY);
        }
      });

      const stopRulerDrag = (e) => {
        if (!isDraggingRuler) return;
        isDraggingRuler = false;
        quyTrinhRulerHandle.classList.remove('is-grabbing');
        try { quyTrinhRulerHandle.releasePointerCapture(e.pointerId); } catch (err) {}
        document.body.style.userSelect = '';
      };

      quyTrinhRulerHandle.addEventListener('pointerup', stopRulerDrag);
      quyTrinhRulerHandle.addEventListener('pointercancel', stopRulerDrag);
    }
  }

  function resizeQuyTrinhCanvas() {
    if (!quyTrinhCanvas || !quyTrinhCanvasCtx) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const w = window.innerWidth;
    const h = window.innerHeight;
    quyTrinhCanvas.width = Math.round(w * dpr);
    quyTrinhCanvas.height = Math.round(h * dpr);
    quyTrinhCanvas.style.width = `${w}px`;
    quyTrinhCanvas.style.height = `${h}px`;
    quyTrinhCanvasCtx.setTransform(1, 0, 0, 1, 0, 0);
    quyTrinhCanvasCtx.scale(dpr, dpr);
    renderQuyTrinhCanvas(lastQuyTrinhProgress, lastActiveQuyTrinhStep);
  }

  // Smootherstep helper: C2 continuous zero acceleration jerk at boundaries
  function smootherstep(t) {
    const c = Math.max(0, Math.min(1, t));
    return c * c * c * (c * (c * 6 - 15) + 10);
  }

  // Continuous Monotonic Hermite Spline: non-zero, steady glide velocity across milestones
  function getSmoothDrumOffset(p) {
    if (p <= 0) return -260;
    if (p >= 0.62) return 1560; // Locked at NGÀY THỨ 10

    const points = [
      { p: 0.00, y: -260.0 },
      { p: 0.16, y: 0.0 },    // NGÀY 1
      { p: 0.32, y: 520.0 },  // NGÀY 4
      { p: 0.48, y: 1040.0 }, // NGÀY 7
      { p: 0.62, y: 1560.0 }  // NGÀY THỨ 10
    ];
    const tangents = [1625.0, 3250.0, 3250.0, 3400.0, 0.0];

    for (let i = 0; i < points.length - 1; i++) {
      const p0 = points[i].p;
      const y0 = points[i].y;
      const p1 = points[i+1].p;
      const y1 = points[i+1].y;
      if (p >= p0 && p <= p1) {
        const h = p1 - p0;
        const t = (p - p0) / h;
        const t2 = t * t;
        const t3 = t2 * t;
        const h00 = 2 * t3 - 3 * t2 + 1;
        const h10 = t3 - 2 * t2 + t;
        const h01 = -2 * t3 + 3 * t2;
        const h11 = t3 - t2;
        const m0 = tangents[i] * h;
        const m1 = tangents[i+1] * h;
        return h00 * y0 + h10 * m0 + h01 * y1 + h11 * m1;
      }
    }
    return 1560;
  }

  function updateQuyTrinhScrolly() {
    if (!quyTrinhTrack) return;
    const rect = quyTrinhTrack.getBoundingClientRect();
    const windowH = window.innerHeight;
    const totalDist = rect.height - windowH;
    if (totalDist <= 0) return;

    // Progress 0.0 to 1.0 across the 560vh track
    const progress = Math.min(1, Math.max(0, -rect.top / totalDist));
    lastQuyTrinhProgress = progress;

    // ── Continuous Scroll-Scrubbed Text Animation (With Stable Readability Plateaus) ──
    const cardTimeline = [
      { step: 0, inP: -0.05, peakIn: 0.02, peakOut: 0.05, outP: 0.12 },
      { step: 1, inP: 0.08,  peakIn: 0.14, peakOut: 0.18, outP: 0.25 }, // Day 1
      { step: 2, inP: 0.24,  peakIn: 0.30, peakOut: 0.34, outP: 0.41 }, // Day 4
      { step: 3, inP: 0.40,  peakIn: 0.46, peakOut: 0.50, outP: 0.57 }, // Day 7
      { step: 4, inP: 0.56,  peakIn: 0.64, peakOut: 0.72, outP: 0.76 }, // Day 10 & 3D Ladder on Left
      { step: 5, inP: 0.94,  peakIn: 0.97, peakOut: 1.05, outP: 1.05 }  // Centered Title on pure white (after white bloom)
    ];

    let activeStep = -1;

    cardTimeline.forEach(({ step, inP, peakIn, peakOut, outP }) => {
      const view = quyTrinhStepViews.find(v => parseInt(v.getAttribute('data-step'), 10) === step);
      if (!view) return;

      if (progress < inP || progress > outP) {
        view.style.opacity = '0';
        view.style.visibility = 'hidden';
        view.style.pointerEvents = 'none';
        return;
      }

      let alpha = 0;
      let offset = 0;

      if (progress < peakIn) {
        const t = Math.min(1, Math.max(0, (progress - inP) / (peakIn - inP)));
        alpha = smootherstep(t);
        offset = (1 - alpha) * 24; // gentle 24px rise into center
      } else if (progress <= peakOut) {
        alpha = 1.0;
        offset = 0; // solid centered dwell plateau
      } else {
        const t = Math.min(1, Math.max(0, (progress - peakOut) / (outP - peakOut)));
        alpha = 1 - smootherstep(t);
        offset = -(1 - alpha) * 24; // gentle 24px glide up as it leaves
      }

      if (alpha > 0.45) {
        activeStep = step;
      }

      view.style.opacity = alpha.toFixed(3);
      view.style.visibility = alpha > 0.005 ? 'visible' : 'hidden';
      view.style.pointerEvents = alpha > 0.5 ? 'auto' : 'none';

      if (step === 4) {
        // Continuous analog spotlight lighting reveal (starts at 0.64, fully lit by 0.68)
        const lightRaw = Math.min(1, Math.max(0, (progress - 0.64) / 0.04));
        const lightT = smootherstep(lightRaw);
        view.classList.toggle('is-lit', lightT >= 0.5);

        const faintEls = view.querySelectorAll('.step4-faint');
        faintEls.forEach(el => {
          el.style.opacity = (0.26 + 0.74 * lightT).toFixed(3);
        });

        const accentEls = view.querySelectorAll('.step4-accent');
        accentEls.forEach(el => {
          const r = Math.round(255 + (254 - 255) * lightT);
          const g = Math.round(255 + (71 - 255) * lightT);
          const b = Math.round(255 + (1 - 255) * lightT);
          const a = (0.26 + 0.74 * lightT).toFixed(3);
          el.style.setProperty('color', `rgb(${r}, ${g}, ${b})`, 'important');
          el.style.opacity = a;
        });
      }

      if (step === 5) {
        view.style.transform = `translateY(${offset.toFixed(1)}px)`;
      } else {
        view.style.transform = `translateY(calc(-50% + ${offset.toFixed(1)}px))`;
      }
    });

    lastActiveQuyTrinhStep = activeStep;

    // Render Procedural Halftone Dot Canvas directly in sync with smooth scroll
    renderQuyTrinhCanvas(progress, activeStep);
  }

  function renderQuyTrinhCanvas(progress, activeStep) {
    if (!quyTrinhCanvasCtx || !quyTrinhCanvas) return;
    const ctx = quyTrinhCanvasCtx;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const w = quyTrinhCanvas.width / dpr;
    const h = quyTrinhCanvas.height / dpr;
    if (w <= 0 || h <= 0) return;

    // ── 1. BACKGROUND DUAL-TONE & WHITE BLOOM (100% User Directive) ──
    // Void #0a0b0e stays solid throughout Drum, 3D Ladder on Left, Center Road,
    // AND stays black while the road ZOOMS FORWARD TO FILL THE ENTIRE SCREEN ("phóng to hết màn hình")!
    // Background transitions to pure radiant white #ffffff ONLY AFTER slats fill the whole screen (0.94 - 0.98)!
    const bgProgress = Math.min(1, Math.max(0, (progress - 0.94) / 0.04));
    const bgEase = smootherstep(bgProgress);

    const r = Math.round(10 + (255 - 10) * bgEase);
    const g = Math.round(11 + (255 - 11) * bgEase);
    const b = Math.round(14 + (255 - 14) * bgEase);
    ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;
    ctx.fillRect(0, 0, w, h);

    // Sync sticky viewport background
    const viewportEl = document.getElementById('quy-trinh-viewport');
    if (viewportEl) {
      viewportEl.style.backgroundColor = `rgb(${r}, ${g}, ${b})`;
    }

    // Toggle header light mode (Logo and buttons turn dark on light background)
    const headerEl = document.querySelector('.sybios-floating-header');
    if (headerEl) {
      headerEl.classList.toggle('is-light', bgEase > 0.5);
    }

    // ── 2. AMBIENT HALFTONE LATTICE (Trame de fond - Sybiosme Signature 12px matrix) ──
    if (bgEase < 0.98) {
      const gridPitch = 12;
      const ambientAlpha = (1 - bgEase) * (1 - Math.min(1, Math.max(0, (progress - 0.86) / 0.08)) * 0.9) * 0.08;
      if (ambientAlpha > 0.002) {
        ctx.fillStyle = `rgba(255, 255, 255, ${ambientAlpha})`;
        const cols = Math.ceil(w / gridPitch);
        const rows = Math.ceil(h / gridPitch);
        for (let c = 0; c < cols; c++) {
          const gx = c * gridPitch + 6;
          for (let ro = 0; ro < rows; ro++) {
            const gy = ro * gridPitch + 6;
            ctx.fillRect(gx, gy, 1.2, 1.2);
          }
        }
      }
    }

    // When background is 100% pure white, slats have dissolved into paper
    if (bgEase >= 1.0) return;

    const isDesktop = w >= 960;
    // Ladder center on LEFT (Image 1, 2, 3, 4): exactly 26.5% width on desktop
    const leftCx = isDesktop ? w * 0.265 : (w > 640 ? w * 0.24 : w * 0.22);
    // Ladder center in MIDDLE (Image 5): exactly 50% width
    const centerCx = w * 0.50;

    // ── 3. TIMELINE PHASES MATCHING USER DIRECTION 100% ──
    // Phase 1 (0.00 - 0.62): 2D drum on LEFT scrolling dates (All slats 100% equal width!)
    // Phase 2 (0.62 - 0.74): Drum locks at NGÀY THỨ 10, 3D ladder forms on LEFT with Step 4 text
    // Phase 3 (0.74 - 0.80): Ladder glides to CENTER and forms 3D perspective curved road
    // Phase 4 (0.80 - 0.86): "kéo 1 lúc nữa" - Road dwell, top of road curves gently to the right like a receding highway
    // Phase 5 (0.86 - 0.94): "mới mở rộng qua 2 bên" & "phóng to hết màn hình" - Slats expand and merge to become solid white background
    // Phase 6 (0.94 - 0.98): Background blooms to white behind merged slats
    // Phase 7 (0.95 - 1.00+): Step 5 headline on pure white background

    // Morph on the LEFT (Phase 2: 0.62 to 0.74)
    const leftMorphRaw = Math.min(1, Math.max(0, (progress - 0.62) / 0.12));
    const leftMorphT = smootherstep(leftMorphRaw);

    // Glide to CENTER (Phase 3: 0.74 to 0.80)
    const centerGlideRaw = Math.min(1, Math.max(0, (progress - 0.74) / 0.06));
    const centerT = smootherstep(centerGlideRaw);

    // Fullscreen Zoom Expansion (Phase 5: 0.86 to 0.94) - "kéo 1 lúc nữa mới mở rộng qua 2 bên"
    const zoomRaw = Math.min(1, Math.max(0, (progress - 0.86) / 0.08));
    const zoomT = smootherstep(zoomRaw);

    // Center X position: Stays on LEFT until Step 4 finishes (progress 0.74), then glides to CENTER!
    const cx = leftCx * (1 - centerT) + centerCx * centerT;

    ctx.save();
    const slatAlpha = Math.max(0, 1 - Math.pow(bgEase, 1.5));
    ctx.globalAlpha = slatAlpha;

    const dotPitch = isDesktop ? 6.8 : 5.6;
    const centerY = h * 0.50;
    const rungSpacing = isDesktop ? 26 : 22;

    // Smooth continuous drum offset with zero acceleration jerk
    const drumOffset = getSmoothDrumOffset(progress);

    // 100% Equal Width across all drum slats (user directive: xóa mấy cái thanh thẳng quá dài đi tất cả đều bằng nhau 100%)
    const specialRungs = {
      '-22': { date: 'THỨ NĂM, NGÀY 22 THÁNG 10', day: '' },
      '-18': { date: 'THỨ SÁU, NGÀY 23 THÁNG 10', day: '' },
      '-10': { date: 'THỨ HAI, NGÀY 26 THÁNG 10', day: '' },
      '-4':  { date: 'THỨ BA, NGÀY 27 THÁNG 10',  day: '' },
      '0':   { date: 'THỨ NĂM, NGÀY 29 THÁNG 10', day: 'NGÀY 1', subDate: 'THỨ SÁU, NGÀY 30 THÁNG 10' },
      '20':  { date: 'THỨ BA, NGÀY 03 THÁNG 11',  day: 'NGÀY 4', subDate: 'THỨ TƯ, NGÀY 04 THÁNG 11' },
      '40':  { date: 'THỨ SÁU, NGÀY 06 THÁNG 11', day: 'NGÀY 7', subDate: 'THỨ BẢY, NGÀY 07 THÁNG 11' },
      '60':  { date: 'THỨ NĂM, NGÀY 12 THÁNG 11', day: 'NGÀY THỨ 10', subDate: 'THỨ SÁU, NGÀY 13 THÁNG 11' }
    };

    // 22 rungs on screen
    const visibleMinJ = 50;
    const visibleMaxJ = 71;
    const totalSlats = visibleMaxJ - visibleMinJ;

    // Y Bounds on LEFT (Image 4):
    const leftTopY = h * 0.14;
    const leftBottomY = h * 0.94;

    // Y Bounds in CENTER (3D Road & Fullscreen Zoom):
    const centerTopY = h * 0.10;
    const centerBottomY = h * 0.95;

    for (let j = -25; j <= 75; j++) {
      const flatY = centerY + j * rungSpacing - drumOffset;
      if (flatY < -150 || flatY > h + 150) continue;

      const isVisibleOnScreen = j >= visibleMinJ && j <= visibleMaxJ;
      const outsideFade = isVisibleOnScreen ? 1.0 : Math.max(0, 1 - leftMorphT * 1.5);
      if (outsideFade <= 0) continue;

      const distToCenter = Math.abs(flatY - centerY);
      const normDist = Math.min(1, distToCenter / (h * 0.48));
      const lensBulge = Math.max(0, 1 - normDist * normDist) * 12;
      const baseHalfW = (isDesktop ? 34 : 24) + lensBulge;

      let currentY = flatY;
      let currentHalfW = baseHalfW;
      let dotR = 1.45;
      let rungDotAlpha = 0.75;
      let bevelAmount = 0;
      let baseRows = 1.0;

      // 3D Drum Curvature to the Right ("ở dưới cũng cong", "cong cong qua bên phải")
      // In Sybiosme, both the top and bottom of the cylindrical drum recede and curve smoothly to the right
      const normDistY = (currentY - centerY) / (h * 0.48);
      const absNormDistY = Math.min(1.2, Math.abs(normDistY));
      const curveFactor = normDistY < 0 ? (isDesktop ? 65 : 40) : (isDesktop ? 55 : 35);
      const drumCurveX = Math.pow(absNormDistY, 1.5) * curveFactor;
      let slatCurveX = drumCurveX * (1 - zoomT);

      const sInfo = specialRungs[j.toString()];
      const isMilestone = !!sInfo && !!sInfo.day;

      if (isMilestone) {
        baseRows = 1.0;
        dotR = 1.5;
        rungDotAlpha = 1.0;
      } else if (distToCenter < 75) {
        baseRows = 3.0;
        dotR = 1.6;
        rungDotAlpha = 1.0;
      } else if (distToCenter < 240) {
        baseRows = 2.0;
        dotR = 1.45;
        rungDotAlpha = 0.80;
      } else {
        baseRows = 1.0;
        dotR = 1.35;
        rungDotAlpha = Math.max(0.18, 0.55 - (distToCenter - 240) / 280);
      }

      let contRows = baseRows;

      // ── "ở dưới to dần dần lên" & 3D Curved Road Evolution ──
      if (isVisibleOnScreen) {
        const slatIdx = j - visibleMinJ;
        const u = slatIdx / totalSlats; // 0.0 at top slat (horizon), 1.0 at bottom slat (camera)

        // Target Y on LEFT (Image 4)
        const target3DLeftY = leftTopY + (leftBottomY - leftTopY) * Math.pow(u, 1.55);

        // Target Y in CENTER (3D Road & Fullscreen Zoom Expansion):
        const zoomTopY = (centerTopY) * (1 - zoomT) + (-h * 0.12) * zoomT;
        const zoomBottomY = (centerBottomY) * (1 - zoomT) + (h * 1.35) * zoomT;
        const target3DCenterY = zoomTopY + (zoomBottomY - zoomTopY) * Math.pow(u, 1.72 * (1 - zoomT * 0.45));

        // Delay climbs from bottom up (Image 3: bottom rungs thicken first)
        const delay = (1 - u) * 0.42;
        const rungMorphRaw = Math.min(1, Math.max(0, (leftMorphT - delay) / 0.58));
        const rungMorph = smootherstep(rungMorphRaw);

        const yOnLeft = flatY * (1 - rungMorph) + target3DLeftY * rungMorph;
        currentY = yOnLeft * (1 - centerT) + target3DCenterY * centerT;

        // 3D Road Curve to the Right ("cong cong ra bên phải", "ở trên nó sẽ thành kiểu như 1 con đường á")
        // As u approaches 0 (top/horizon), the road centerline curves gracefully to the right:
        const roadCurveX = Math.pow(1 - u, 1.7) * (w * 0.11);
        
        // Smoothly blend from Drum Curvature (on the left) to Road Highway Curvature (in the center):
        slatCurveX = (drumCurveX * (1 - centerT) + roadCurveX * centerT) * (1 - zoomT);

        // Slat Width Evolution:
        // On LEFT (Image 4): Top halfW = 20px (~6 dots), Bottom halfW = 135px (~40 dots)
        const leftHalfW = (20 + (135 - 20) * Math.pow(u, 1.15));
        const wOnLeft = baseHalfW * (1 - rungMorph) + leftHalfW * rungMorph;

        // In CENTER (3D Road) -> FULLSCREEN EXPANSION ("mới mở rộng qua 2 bên", "phóng to hết màn hình"):
        // At zoomT = 0: roadTopHalfW = 24px (tapered top), bottomHalfW = w * 0.52 (Road perspective)
        // At zoomT = 1: topHalfW = w * 1.50, bottomHalfW = w * 2.00 (Every slat extends far past screen edges)
        const roadTopHalfW = isDesktop ? 24 : 18;
        const zoomTopHalfW = (roadTopHalfW) * (1 - zoomT) + (w * 1.50) * zoomT;
        const zoomBottomHalfW = (w * 0.52) * (1 - zoomT) + (w * 2.00) * zoomT;
        const centerHalfW = zoomTopHalfW + (zoomBottomHalfW - zoomTopHalfW) * Math.pow(u, 1.25 * (1 - zoomT * 0.70));

        currentHalfW = wOnLeft * (1 - centerT) + centerHalfW * centerT;

        // Continuous Row Count & Gap Closure:
        let targetRowsLeft = 1.0;
        if (u > 0.88) targetRowsLeft = 1.0 + 5.5 * Math.pow((u - 0.2) / 0.8, 1.4);
        else if (u > 0.20) targetRowsLeft = 1.0 + 3.8 * Math.pow((u - 0.2) / 0.8, 1.4);
        else targetRowsLeft = 1.0;

        let targetRowsCenter = targetRowsLeft;
        if (centerT > 0) {
          if (u > 0.80) targetRowsCenter = 7.0 * centerT + targetRowsLeft * (1 - centerT);
          else if (u > 0.60) targetRowsCenter = 5.0 * centerT + targetRowsLeft * (1 - centerT);
          else if (u > 0.35) targetRowsCenter = 3.0 * centerT + targetRowsLeft * (1 - centerT);
          else if (u > 0.18) targetRowsCenter = 2.0 * centerT + targetRowsLeft * (1 - centerT);
          else targetRowsCenter = 1.0 * centerT + targetRowsLeft * (1 - centerT);
        }

        // When zooming in fullscreen, slats expand row count to merge and become the white background ("lấy cái đó làm nền trắng luôn"):
        if (zoomT > 0) {
          const fullscreenRows = 14.0 + u * 12.0;
          targetRowsCenter = targetRowsCenter * (1 - zoomT) + fullscreenRows * zoomT;
        }

        const rowsOnLeft = baseRows * (1 - rungMorph) + targetRowsLeft * rungMorph;
        contRows = Math.max(1.0, rowsOnLeft * (1 - centerT) + targetRowsCenter * centerT);

        // Dot radius grows during zoom so dots merge horizontally and vertically into solid white
        dotR = 1.45 + (u * 0.35) * rungMorph + (u * 0.8 + 0.3) * centerT + (2.6 * zoomT);
        bevelAmount = Math.max(rungMorph, centerT);
        rungDotAlpha = 1.0;
      }

      // Date labels on left (Image 1 & Image 2) - fade smoothly
      const dateLabelFade = Math.max(0, 1 - leftMorphRaw * 5.0);
      if (sInfo && isDesktop && dateLabelFade > 0 && flatY >= 35 && flatY <= h - 35) {
        ctx.save();
        const isMainMilestone = !!sInfo.day;
        const labelAlpha = (isMainMilestone ? 0.95 : 0.45) * dateLabelFade;
        ctx.globalAlpha = labelAlpha * slatAlpha;

        ctx.font = '500 11px monospace';
        ctx.fillStyle = isMainMilestone ? '#8e929b' : '#6b7280';
        ctx.textAlign = 'right';
        const dateRightX = (cx + slatCurveX) - baseHalfW - 80;
        ctx.fillText(sInfo.date, dateRightX, flatY + 4);

        if (isMainMilestone) {
          ctx.strokeStyle = 'rgba(255, 255, 255, 0.22)';
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(dateRightX + 16, flatY - 8);
          ctx.lineTo(dateRightX + 16, flatY + 8);
          ctx.stroke();

          ctx.font = '700 11px monospace';
          ctx.fillStyle = '#ffffff';
          ctx.textAlign = 'left';
          ctx.fillText(sInfo.day, dateRightX + 28, flatY + 4);
        }

        ctx.restore();
      }

      // Secondary date label 4 rungs below milestone
      if (sInfo && sInfo.subDate && isDesktop && dateLabelFade > 0) {
        const subY = flatY + 4 * rungSpacing;
        if (subY >= 40 && subY <= h - 40) {
          ctx.save();
          ctx.globalAlpha = 0.45 * dateLabelFade * slatAlpha;
          ctx.font = '500 10px monospace';
          ctx.fillStyle = '#6b7280';
          ctx.textAlign = 'right';
          const subNormDistY = (subY - centerY) / (h * 0.48);
          const subAbsNorm = Math.min(1.2, Math.abs(subNormDistY));
          const subCurveFactor = subNormDistY < 0 ? (isDesktop ? 65 : 40) : (isDesktop ? 55 : 35);
          const subCurveX = Math.pow(subAbsNorm, 1.5) * subCurveFactor;
          ctx.fillText(sInfo.subDate, (cx + subCurveX) - baseHalfW - 80, subY + 3.5);
          ctx.restore();
        }
      }

      // Render the slat dots with crisp, beveled trapezoid ends & continuous growth
      ctx.save();
      const baseAlpha = ctx.globalAlpha * rungDotAlpha * outsideFade;
      ctx.fillStyle = '#ffffff';

      // Center of this specific slat (with gentle road curvature to the right):
      const slatCx = cx + slatCurveX;
      // 100% equal width, NO long lines sticking out anywhere:
      const flatLeft = slatCx - currentHalfW;
      const flatRight = slatCx + currentHalfW;
      const rowSpacing = dotPitch;

      const totalRowsCount = Math.ceil(contRows);
      for (let rIdx = 0; rIdx < totalRowsCount; rIdx++) {
        // Continuous row weight: 1.0 for fully active rows, fractional for nascent outer rows
        const rowCoverage = Math.max(0, Math.min(1, contRows - rIdx));
        if (rowCoverage <= 0.02) continue;

        const rowNorm = (rIdx - (contRows - 1) / 2);
        const dotY = currentY + rowNorm * rowSpacing;

        // Trapezoid stair-step bevel matching Sybiosme 100%
        const rowBevel = rowNorm * dotPitch * 0.55 * bevelAmount;
        const rowLeft = flatLeft - rowBevel;
        const rowRight = flatRight + rowBevel;
        const dotCount = Math.floor((rowRight - rowLeft) / dotPitch);

        // Smooth growth: dots in nascent rows grow smoothly from 0.4 radius to full radius
        const curDotR = dotR * (0.35 + 0.65 * rowCoverage);
        ctx.globalAlpha = baseAlpha * (0.15 + 0.85 * rowCoverage);

        for (let d = 0; d <= dotCount; d++) {
          const dotX = rowLeft + d * dotPitch;
          ctx.beginPath();
          ctx.arc(dotX, dotY, curDotR, 0, Math.PI * 2);
          ctx.fill();
        }
      }
      ctx.restore();
    }

    // Seamless Solid White Transition ("nó sẽ làm lấy cái đó làm nền trắng luôn nhé"):
    // As zoomT finishes (0.85 -> 1.0), smoothly bridge any micro interstitial crevices so
    // the expanding slats physically become 100% solid white before the background color switch!
    if (zoomT > 0.85) {
      const mergeWhiteAlpha = Math.min(1, (zoomT - 0.85) / 0.15);
      ctx.fillStyle = `rgba(255, 255, 255, ${mergeWhiteAlpha})`;
      ctx.fillRect(0, 0, w, h);
    }

    ctx.restore();
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

    // Stage 03: Live Quiz fan-out từ giữa qua 2 bên & đứng im
    updateLiveQuizFanOut();

    // Stage 04: Grail-style editorial sheet trượt lên đè Section 03
    updateGrailSheetTransition();

    // Stage 04.1: Showcase Quản lý trong 1 ứng dụng (Phone & Card stacking)
    updateAppPhoneStack();

    // Stage 05: Quy Trình Scrollytelling & Dot-Matrix Procedural Ladder
    updateQuyTrinhScrolly();

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

  // Init Quy Trình Dot-Matrix Procedural Canvas
  initQuyTrinhCanvas();

  // Initial update
  onScrollUpdate(window.pageYOffset || 0);
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initScrollytelling);
} else {
  initScrollytelling();
}
