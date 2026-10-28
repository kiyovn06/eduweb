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

    // Visual states:
    // 0: Initial Hero (0.00 - 0.10)
    // 1: Bước 1 (0.10 - 0.22)
    // 2: Bước 2 (0.22 - 0.34)
    // 3: Bước 3 (0.34 - 0.44)
    // 4: Bước 4 (0.44 - 0.52)
    // -: Image 2 Centered 3D Perspective Ladder (0.52 - 0.68, clean visual, no text overlay)
    // -: Image 3 Fullscreen Dot Slats (0.68 - 0.84, no text overlay)
    // 6: Image 4 Centered Final "Được làm riêng cho bạn. Không giới hạn ." (0.84 - 1.00, light grey background)
    let activeStep = -1;
    if (progress >= 0.84) {
      activeStep = 6;
    } else if (progress >= 0.52) {
      activeStep = -1; // Clean cinematic view for Image 2 (ladder) and Image 3 (fullscreen slats)
    } else if (progress >= 0.44) {
      activeStep = 4;
    } else if (progress >= 0.34) {
      activeStep = 3;
    } else if (progress >= 0.22) {
      activeStep = 2;
    } else if (progress >= 0.10) {
      activeStep = 1;
    } else {
      activeStep = 0;
    }

    if (activeStep !== lastActiveQuyTrinhStep) {
      lastActiveQuyTrinhStep = activeStep;

      quyTrinhStepViews.forEach((view) => {
        const stepIdx = parseInt(view.getAttribute('data-step'), 10);
        view.classList.toggle('is-active', stepIdx === activeStep);
      });
    }

    // Milestones glide and fade out as ladder morphs to center
    if (quyTrinhMilestones) {
      const mAlpha = Math.max(0, Math.min(1, 1 - (progress - 0.48) / 0.08));
      quyTrinhMilestones.style.opacity = mAlpha.toFixed(2);
      quyTrinhMilestones.style.transform = `translateY(${(progress - 0.25) * 60}px)`;
    }

    // Render Procedural Dot Canvas
    renderQuyTrinhCanvas(progress, activeStep);
  }

  function renderQuyTrinhCanvas(progress, activeStep) {
    if (!quyTrinhCanvasCtx || !quyTrinhCanvas) return;
    const ctx = quyTrinhCanvasCtx;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const w = quyTrinhCanvas.width / dpr;
    const h = quyTrinhCanvas.height / dpr;
    if (w <= 0 || h <= 0) return;

    // ── 1. BACKGROUND COLOR TRANSITION (To Image 4 light grey at end) ──
    // 0.00 - 0.84: Dark #0a0b0e
    // 0.84 - 0.94: Smooth transition to light #ececee
    const bgProg = Math.min(1, Math.max(0, (progress - 0.84) / 0.10));
    const bgEase = bgProg * bgProg * (3 - 2 * bgProg);
    const r = Math.round(10 + (236 - 10) * bgEase);
    const g = Math.round(11 + (236 - 11) * bgEase);
    const b = Math.round(14 + (238 - 14) * bgEase);
    ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;
    ctx.fillRect(0, 0, w, h);

    // Sync viewport background color
    const viewportEl = document.getElementById('quy-trinh-viewport');
    if (viewportEl) {
      viewportEl.style.backgroundColor = `rgb(${r}, ${g}, ${b})`;
    }

    // ── 2. MICRO-DOT MATRIX PATTERN (Image 1, 2, 3, 4) ──
    const gridPitch = 14;
    const dotAlpha = bgEase > 0.5 ? 0.07 : 0.09;
    ctx.fillStyle = bgEase > 0.5 ? `rgba(0, 0, 0, ${dotAlpha})` : `rgba(255, 255, 255, ${dotAlpha})`;
    const cols = Math.ceil(w / gridPitch);
    const rows = Math.ceil(h / gridPitch);
    for (let c = 0; c < cols; c++) {
      const gx = c * gridPitch + 7;
      for (let ro = 0; ro < rows; ro++) {
        const gy = ro * gridPitch + 7;
        ctx.fillRect(gx, gy, 1.2, 1.2);
      }
    }

    // When fully transitioned to Image 4, the dot slats are faded out
    if (bgEase >= 1) return;

    const isDesktop = w >= 960;
    const initialCx = isDesktop ? w * 0.36 : (w > 640 ? w * 0.28 : w * 0.22);
    const centerCx = w * 0.50;

    // ── 3. PHASES TIMELINE ──
    // Phase 1 (0.00 - 0.50): Streaming dot ruler on the left
    // Phase 2 (0.50 - 0.68): Morph into centered 3D perspective ladder (Image 2)
    // Phase 3 (0.68 - 0.84): Fullscreen expansion of dot slats (Image 3)
    // Phase 4 (0.84 - 1.00): Fade out rungs into Image 4 light screen

    const morphRaw = Math.min(1, Math.max(0, (progress - 0.50) / 0.16));
    const morphT = morphRaw * morphRaw * (3 - 2 * morphRaw);

    const fullRaw = Math.min(1, Math.max(0, (progress - 0.68) / 0.16));
    const fullT = fullRaw * fullRaw * (3 - 2 * fullRaw);

    const rungAlpha = Math.max(0, 1 - bgEase);
    ctx.save();
    ctx.globalAlpha = rungAlpha;

    const dotPitch = 7.2;

    if (morphT < 0.85) {
      // ══════════════════════════════════════════════════════════════════════
      // PHASE 1: STREAMING DOT RULER (Image 1, "tròn tròn tí", continuous)
      // ══════════════════════════════════════════════════════════════════════
      const barSpacing = 16;
      const tapeTravel = progress * 4800;
      const minY = -40;
      const maxY = h + 40;
      const kMin = Math.floor((minY - tapeTravel) / barSpacing);
      const kMax = Math.ceil((maxY - tapeTravel) / barSpacing);

      const milestoneDates = [
        'THỨ NĂM, NGÀY 22 THÁNG 10',
        'THỨ SÁU, NGÀY 23 THÁNG 10',
        'THỨ HAI, NGÀY 26 THÁNG 10',
        'THỨ TƯ, NGÀY 28 THÁNG 10',
        'THỨ SÁU, NGÀY 30 THÁNG 10',
        'THỨ HAI, NGÀY 02 THÁNG 11',
        'THỨ TƯ, NGÀY 04 THÁNG 11',
      ];

      const cx = initialCx * (1 - morphT) + centerCx * morphT;

      for (let k = kMin; k <= kMax; k++) {
        const flatY = k * barSpacing + tapeTravel;
        if (flatY < minY || flatY > maxY) continue;

        const baseHalfW = isDesktop ? 38 : 28;
        const isMilestone = (Math.abs(k) % 14 === 0);

        let milestoneExtension = 0;
        if (isMilestone) {
          const mType = Math.abs(Math.floor(k / 14)) % 2;
          milestoneExtension = isDesktop ? (mType === 1 ? 135 : 85) : (mType === 1 ? 85 : 55);

          // Milestone date on far left (fades out as it morphs to center)
          if (isDesktop && morphT < 0.6 && flatY >= 40 && flatY <= h - 40) {
            const dateIdx = Math.abs(Math.floor(k / 14)) % milestoneDates.length;
            const dateLabel = milestoneDates[dateIdx];
            ctx.save();
            ctx.globalAlpha = Math.max(0, (1 - morphT * 1.6) * 0.7 * rungAlpha);
            ctx.font = '600 11px monospace';
            ctx.fillStyle = '#888888';
            ctx.fillText(dateLabel, 48, flatY + 3.5);
            ctx.restore();
          }
        }

        // Active focus cluster (thicker rungs made of 3-4 rows of round dots, matching Image 1)
        const distToCenter = Math.abs(flatY - h * 0.50);
        const isFocused = distToCenter < 100;
        const focusFactor = Math.max(0, 1 - distToCenter / 100);

        let numRows = 1;
        if (isFocused && focusFactor > 0.35) {
          numRows = focusFactor > 0.7 ? 4 : 3;
        } else if (isMilestone) {
          numRows = 1;
        } else {
          numRows = (Math.abs(k) % 2 === 0) ? 2 : 1;
        }

        const flatLeft = cx - baseHalfW;
        const flatRight = cx + baseHalfW + milestoneExtension * (1 - morphT);

        // Draw circular dots ("tròn tròn tí")
        const dotR = 1.4 + (focusFactor * 0.5);
        ctx.fillStyle = isFocused ? '#ffffff' : 'rgba(235, 238, 245, 0.85)';

        const dotCount = Math.floor((flatRight - flatLeft) / dotPitch);
        const rowSpacing = 3.2;

        for (let d = 0; d <= dotCount; d++) {
          const dotX = flatLeft + d * dotPitch;
          for (let rIdx = 0; rIdx < numRows; rIdx++) {
            const rowOffset = (rIdx - (numRows - 1) / 2) * rowSpacing;
            const dotY = flatY + rowOffset;
            ctx.beginPath();
            ctx.arc(dotX, dotY, dotR, 0, Math.PI * 2);
            ctx.fill();
          }
        }
      }
    } else {
      // ══════════════════════════════════════════════════════════════════════
      // PHASE 2 & 3: CENTERED 3D PERSPECTIVE LADDER & FULLSCREEN EXPANSION
      // (Image 2: Center 3D perspective ladder / Image 3: Fullscreen dot slats)
      // ══════════════════════════════════════════════════════════════════════
      const cx = centerCx;
      const ladderTopY = h * 0.22;
      const ladderBottomY = h * 1.05;
      const rulerH = ladderBottomY - ladderTopY;

      const numLadderRungs = 16;
      for (let i = 0; i < numLadderRungs; i++) {
        const frac = i / (numLadderRungs - 1);
        const depthP = Math.pow(frac, 1.85); // Foreshortened 3D spacing
        const currentY = ladderTopY + depthP * rulerH;

        // Image 2 width vs Image 3 full width
        const topHalfW = 60 + 240 * fullT;
        const bottomHalfW = (isDesktop ? 340 : 190) + (w * 0.65 - (isDesktop ? 340 : 190)) * fullT;
        const currentHalfW = topHalfW + (bottomHalfW - topHalfW) * depthP;

        const finalLeft = cx - currentHalfW;
        const finalRight = cx + currentHalfW;

        // Number of dot rows:
        // Image 2 (fullT = 0): 1 row at top, up to 7 rows at bottom
        // Image 3 (fullT = 1): 2 rows at top, up to 14 rows at bottom
        const numRows = Math.round(1 + depthP * 6 + depthP * 7 * fullT);

        const dotR = 1.4 + depthP * 0.6 + fullT * 0.3;
        ctx.fillStyle = depthP > 0.5 ? '#ffffff' : 'rgba(235, 238, 245, 0.85)';

        const dotCount = Math.floor((finalRight - finalLeft) / dotPitch);
        const rowSpacing = 3.1 + fullT * 0.6;

        for (let d = 0; d <= dotCount; d++) {
          const dotX = finalLeft + d * dotPitch;
          for (let rIdx = 0; rIdx < numRows; rIdx++) {
            const rowOffset = (rIdx - (numRows - 1) / 2) * rowSpacing;
            const dotY = currentY + rowOffset;
            ctx.beginPath();
            ctx.arc(dotX, dotY, dotR, 0, Math.PI * 2);
            ctx.fill();
          }
        }
      }
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
