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
    const p1 = Math.min(1, Math.max(0, fanProgress / 0.65));
    const dist1 = baseOff1 + (targetOff1 - baseOff1) * p1;
    const rot1 = baseRot1 + (targetRot1 - baseRot1) * p1;

    if (fanCardL1) {
      fanCardL1.style.transform = `translate(calc(-50% - ${dist1}px), -50%) rotate(${-rot1}deg)`;
      fanCardL1.style.opacity = '1';
    }
    if (fanCardR1) {
      fanCardR1.style.transform = `translate(calc(-50% + ${dist1}px), -50%) rotate(${rot1}deg)`;
      fanCardR1.style.opacity = '1';
    }

    // Phase 2: Left 2 & Right 2 (bắt đầu che nhiều ló ~10px chéo, cuộn xuống xòe xa nhất)
    const p2 = Math.min(1, Math.max(0, (fanProgress - 0.12) / 0.72));
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

  function updateQuyTrinhScrolly() {
    if (!quyTrinhTrack) return;
    const rect = quyTrinhTrack.getBoundingClientRect();
    const windowH = window.innerHeight;
    const totalDist = rect.height - windowH;
    if (totalDist <= 0) return;

    // Progress 0.0 to 1.0 across the 560vh track
    const progress = Math.min(1, Math.max(0, -rect.top / totalDist));
    lastQuyTrinhProgress = progress;

    // ── Continuous Scroll-Scrubbed Text Animation (Zero Jitter, Zero Overlap, Sybiosme-Standard) ──
    // Clean discrete handoffs: outgoing step glides up and exits BEFORE incoming step rises from below
    const cardTimeline = [
      { step: 0, inP: -0.05, peak: 0.04, outP: 0.09 },
      { step: 1, inP: 0.10,  peak: 0.18, outP: 0.25 },
      { step: 2, inP: 0.27,  peak: 0.35, outP: 0.43 },
      { step: 3, inP: 0.45,  peak: 0.52, outP: 0.58 },
      { step: 4, inP: 0.60,  peak: 0.67, outP: 0.73 },
      { step: 5, inP: 0.86,  peak: 0.90, outP: 1.05 }
    ];

    let activeStep = -1;

    cardTimeline.forEach(({ step, inP, peak, outP }) => {
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

      if (progress <= peak) {
        const t = Math.min(1, Math.max(0, (progress - inP) / (peak - inP)));
        alpha = t * t * (3 - 2 * t);
        offset = (1 - alpha) * 40; // rises into center from +40px below
      } else {
        const t = Math.min(1, Math.max(0, (progress - peak) / (outP - peak)));
        alpha = 1 - t * t * (3 - 2 * t);
        offset = -(1 - alpha) * 40; // glides up to -40px as it leaves
      }

      if (alpha > 0.45) {
        activeStep = step;
      }

      view.style.opacity = alpha.toFixed(3);
      view.style.visibility = alpha > 0.005 ? 'visible' : 'hidden';
      view.style.pointerEvents = alpha > 0.5 ? 'auto' : 'none';

      if (step === 5) {
        view.style.transform = `translateY(${offset.toFixed(1)}px)`;
      } else {
        view.style.transform = `translateY(calc(-50% + ${offset.toFixed(1)}px))`;
      }
    });

    lastActiveQuyTrinhStep = activeStep;

    // Render Procedural Halftone Dot Canvas
    renderQuyTrinhCanvas(progress, activeStep);
  }

  function renderQuyTrinhCanvas(progress, activeStep) {
    if (!quyTrinhCanvasCtx || !quyTrinhCanvas) return;
    const ctx = quyTrinhCanvasCtx;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const w = quyTrinhCanvas.width / dpr;
    const h = quyTrinhCanvas.height / dpr;
    if (w <= 0 || h <= 0) return;

    // ── 1. BACKGROUND COLOR BLEND (Hermite curve to #f2f2f4 Clean Light Paper) ──
    // 0.00 - 0.82: Deep Void #0a0b0e
    // 0.82 - 0.87: Smooth Hermite transition to #f2f2f4
    // 0.87 - 1.00: 100% Solid Clean Light Paper
    const bgProg = Math.min(1, Math.max(0, (progress - 0.82) / 0.05));
    const bgEase = bgProg * bgProg * (3 - 2 * bgProg);
    const r = Math.round(10 + (242 - 10) * bgEase);
    const g = Math.round(11 + (242 - 11) * bgEase);
    const b = Math.round(14 + (244 - 14) * bgEase);
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

    // ── 2. AMBIENT HALFTONE MICRO-GRID (Lưới chấm nền tinh tế chuẩn Sybiosme) ──
    const gridPitch = 12; // 12px lattice
    const dotAlpha = bgEase > 0.5 ? 0.075 : 0.085;
    ctx.fillStyle = bgEase > 0.5 ? `rgba(0, 0, 0, ${dotAlpha})` : `rgba(255, 255, 255, ${dotAlpha})`;
    const cols = Math.ceil(w / gridPitch);
    const rows = Math.ceil(h / gridPitch);
    for (let c = 0; c < cols; c++) {
      const gx = c * gridPitch + 6;
      for (let ro = 0; ro < rows; ro++) {
        const gy = ro * gridPitch + 6;
        ctx.fillRect(gx, gy, 1.2, 1.2);
      }
    }

    // Fade out rungs completely into Image 4 light screen (Zero slats when background is light)
    const slatAlpha = Math.max(0, 1 - bgEase);
    if (slatAlpha <= 0) return;

    const isDesktop = w >= 960;
    // Ladder center on left: constrained so it never touches or overlaps the right text column
    const initialCx = isDesktop ? w * 0.30 : (w > 640 ? w * 0.24 : w * 0.20);
    const centerCx = w * 0.50;

    // ── UNIFIED CONTINUOUS RULER-TO-3D-SLATS MORPH (Matching Sybiosme 100%) ──
    // "thanh này phải ở dưới to dần dần lên và hiện full màn hình chứ không tạo 1 thanh mới"
    // The exact ruler bar on screen widens progressively from the bottom upward, glides to center,
    // and expands to full screen width with zero secondary elements spawned.

    const morphRaw = Math.min(1, Math.max(0, (progress - 0.72) / 0.10));
    const morphT = morphRaw * morphRaw * (3 - 2 * morphRaw);

    const fullRaw = Math.min(1, Math.max(0, (progress - 0.78) / 0.06));
    const fullT = fullRaw * fullRaw * (3 - 2 * fullRaw);

    ctx.save();
    ctx.globalAlpha = slatAlpha;

    const dotPitch = 7.2;
    const centerY = h * 0.50;
    const rungSpacing = 26;

    let rawDrumOffset = 0;
    if (progress < 0.18) {
      rawDrumOffset = -260 + (progress / 0.18) * 260;
    } else if (progress < 0.35) {
      rawDrumOffset = ((progress - 0.18) / 0.17) * 520;
    } else if (progress < 0.52) {
      rawDrumOffset = 520 + ((progress - 0.35) / 0.17) * 520;
    } else if (progress < 0.68) {
      rawDrumOffset = 1040 + ((progress - 0.52) / 0.16) * 520;
    } else {
      rawDrumOffset = 1560; // Decelerated lock at NGÀY THỨ 10 while Step 4 is active
    }

    const drumOffset = rawDrumOffset;

    const specialRungs = {
      '-18': { date: 'THỨ SÁU, NGÀY 23 THÁNG 10', day: '', ext: 0, extRows: 1 },
      '-10': { date: 'THỨ HAI, NGÀY 26 THÁNG 10', day: '', ext: (isDesktop ? 65 : 40), extRows: 2 },
      '-4':  { date: 'THỨ BA, NGÀY 27 THÁNG 10',  day: '', ext: (isDesktop ? 90 : 50), extRows: 1 },
      '0':   { date: 'THỨ NĂM, NGÀY 29 THÁNG 10', day: 'NGÀY 1', ext: (isDesktop ? 220 : 120), extRows: 1, subDate: 'THỨ SÁU, NGÀY 30 THÁNG 10' },
      '20':  { date: 'THỨ BA, NGÀY 03 THÁNG 11',  day: 'NGÀY 4', ext: (isDesktop ? 220 : 120), extRows: 1, subDate: 'THỨ TƯ, NGÀY 04 THÁNG 11' },
      '40':  { date: 'THỨ SÁU, NGÀY 06 THÁNG 11', day: 'NGÀY 7', ext: (isDesktop ? 220 : 120), extRows: 1, subDate: 'THỨ BẢY, NGÀY 07 THÁNG 11' },
      '60':  { date: 'THỨ NĂM, NGÀY 12 THÁNG 11', day: 'NGÀY THỨ 10', ext: (isDesktop ? 220 : 120), extRows: 1, subDate: 'THỨ SÁU, NGÀY 13 THÁNG 11' }
    };

    // Glides smoothly from left drum position to exact screen center
    const cx = initialCx * (1 - morphT) + centerCx * morphT;

    const ladderTopY = h * 0.22;
    const ladderBottomY = h * 0.98;
    const rulerH = ladderBottomY - ladderTopY;
    const depthPower = 1.0 + 0.85 * morphT;

    // In 2D ruler at NGÀY THỨ 10, rungs 50 to 74 span from top (y~200) to bottom (y~860) of screen
    const visibleMinJ = 50;
    const visibleMaxJ = 74;

    for (let j = -25; j <= 75; j++) {
      const flatY = centerY + j * rungSpacing - drumOffset;
      if (flatY < -100 || flatY > h + 100) continue;

      const isVisibleOnScreen = j >= visibleMinJ && j <= visibleMaxJ;
      const outsideFade = isVisibleOnScreen ? 1.0 : Math.max(0, 1 - morphT * 3.5);
      if (outsideFade <= 0) continue;

      const distToCenter = Math.abs(flatY - centerY);
      const normDist = Math.min(1, distToCenter / (h * 0.48));
      const lensBulge = Math.max(0, 1 - normDist * normDist) * 12;
      const baseHalfW = (isDesktop ? 34 : 24) + lensBulge;

      let currentY = flatY;
      let currentHalfW = baseHalfW;
      let numRows = 1;
      let bevelFactor = 0;
      let dotR = 1.45;
      let rungDotAlpha = 0.75;

      const sInfo = specialRungs[j.toString()];
      const isMilestone = !!sInfo && !!sInfo.day;
      const milestoneExtension = (sInfo && morphT < 0.35) ? sInfo.ext * (1 - morphT * 3.0) : 0;
      const milestoneExtRows = sInfo ? sInfo.extRows : 1;

      if (isMilestone) {
        numRows = 1;
        dotR = 1.5;
        rungDotAlpha = 1.0;
      } else if (distToCenter < 75) {
        numRows = 3;
        dotR = 1.6;
        rungDotAlpha = 1.0;
      } else if (distToCenter < 240) {
        numRows = 2;
        dotR = 1.45;
        rungDotAlpha = 0.80;
      } else {
        numRows = 1;
        dotR = 1.35;
        rungDotAlpha = Math.max(0.18, 0.55 - (distToCenter - 240) / 280);
      }

      if (sInfo && sInfo.extRows > 1) {
        numRows = sInfo.extRows;
      }

      // ── "ở dưới to dần dần lên": Continuous bottom-up morphing of this exact bar ──
      if (isVisibleOnScreen) {
        // Vertical fraction in viewport: 0.0 at top (~y=200), 1.0 at bottom (~y=860)
        const v = Math.min(1, Math.max(0, (flatY - ladderTopY) / rulerH));
        const depthP = Math.pow(v, depthPower);
        const target3DY = ladderTopY + depthP * rulerH;

        currentY = flatY * (1 - morphT) + target3DY * morphT;

        // Bottom rungs (v=1) expand outward first; delay climbs to top rungs (v=0)
        const delay = (1 - v) * 0.42;
        const rungMorphRaw = Math.min(1, Math.max(0, (morphT - delay) / (1 - delay)));
        const rungMorph = rungMorphRaw * rungMorphRaw * (3 - 2 * rungMorphRaw);

        // Sybiosme 3D width: top ~15% w, bottom ~46% w, expanding to full screen (~54% w) in Phase 3
        const targetTopHalfW = (w * 0.15) * (1 - fullT) + (w * 0.22) * fullT;
        const targetBottomHalfW = (w * 0.46) * (1 - fullT) + (w * 0.54) * fullT; // 54% = full screen width!
        const target3DHalfW = targetTopHalfW + (targetBottomHalfW - targetTopHalfW) * depthP;

        currentHalfW = baseHalfW * (1 - rungMorph) + target3DHalfW * rungMorph;

        // Multi-row dots for perspective thickness (up to 10-12 rows at bottom)
        let target3DRows = 1;
        if (v > 0.90) target3DRows = 10;
        else if (v > 0.80) target3DRows = 8;
        else if (v > 0.70) target3DRows = 6;
        else if (v > 0.58) target3DRows = 5;
        else if (v > 0.45) target3DRows = 4;
        else if (v > 0.32) target3DRows = 3;
        else if (v > 0.18) target3DRows = 2;
        else target3DRows = 1;

        if (fullT > 0) {
          target3DRows = Math.round(target3DRows * (1 - fullT) + (target3DRows + 2) * fullT);
        }

        numRows = Math.max(1, Math.round(numRows * (1 - rungMorph) + target3DRows * rungMorph));
        dotR = 1.45 + (depthP * 0.5) * rungMorph;
        bevelFactor = rungMorph;
        rungDotAlpha = 1.0;
      }

      // Date labels on left (fade out quickly once morph begins)
      if (sInfo && isDesktop && morphT < 0.35 && flatY >= 35 && flatY <= h - 35) {
        ctx.save();
        const isMainMilestone = !!sInfo.day;
        const labelAlpha = (isMainMilestone ? 0.95 : 0.45) * Math.max(0, 1 - morphT * 3.0);
        ctx.globalAlpha = labelAlpha * slatAlpha;

        ctx.font = '500 11px monospace';
        ctx.fillStyle = isMainMilestone ? '#8e929b' : '#6b7280';
        ctx.textAlign = 'right';
        const dateRightX = cx - baseHalfW - 80;
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
      if (sInfo && sInfo.subDate && isDesktop && morphT < 0.35) {
        const subY = flatY + 4 * rungSpacing;
        if (subY >= 40 && subY <= h - 40) {
          ctx.save();
          ctx.globalAlpha = 0.45 * Math.max(0, 1 - morphT * 3.0) * slatAlpha;
          ctx.font = '500 10px monospace';
          ctx.fillStyle = '#6b7280';
          ctx.textAlign = 'right';
          ctx.fillText(sInfo.subDate, cx - baseHalfW - 80, subY + 3.5);
          ctx.restore();
        }
      }

      // Render the rung dots
      ctx.save();
      ctx.globalAlpha = slatAlpha * rungDotAlpha * outsideFade;
      ctx.fillStyle = '#ffffff';

      const flatLeft = cx - currentHalfW;
      const flatRight = cx + currentHalfW + milestoneExtension;
      const rowSpacing = 3.2;

      for (let rIdx = 0; rIdx < numRows; rIdx++) {
        const rowOffset = (rIdx - (numRows - 1) / 2) * rowSpacing;
        const dotY = currentY + rowOffset;

        const bevelExpand = (rIdx - (numRows - 1) / 2) * dotPitch * 0.95 * bevelFactor;
        const rowLeft = flatLeft - bevelExpand;
        const rowRight = flatRight + bevelExpand;
        const dotCount = Math.floor((rowRight - rowLeft) / dotPitch);

        for (let d = 0; d <= dotCount; d++) {
          const dotX = rowLeft + d * dotPitch;
          ctx.beginPath();
          ctx.arc(dotX, dotY, dotR, 0, Math.PI * 2);
          ctx.fill();
        }
      }
      ctx.restore();
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
