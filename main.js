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
  function updateGrailSheetTransition() {
    const sheetCard = document.getElementById('grail-sheet-card');
    const sheetSection = document.getElementById('quan-ly-lop');
    if (!sheetCard || !sheetSection) return;

    const headerEl = sheetSection.querySelector('.grail-sheet-header');
    const visualEl = sheetSection.querySelector('.grail-sheet-visual');

    if (window.innerWidth <= 768) {
      if (headerEl) { headerEl.style.transform = 'none'; headerEl.style.opacity = '1'; }
      if (visualEl) { visualEl.style.transform = 'none'; visualEl.style.opacity = '1'; }
      return;
    }

    const rect = sheetSection.getBoundingClientRect();
    const windowH = window.innerHeight;

    // Khi cuộn xuống: Thẻ chéo qua bên phải, từ từ thẳng lại thành 100% full screen
    if (rect.top > 0 && rect.top <= windowH) {
      const progress = 1 - (rect.top / windowH); // 0 khi mới ló ở đáy, 1 khi chạm đỉnh
      const ease = 1 - Math.pow(1 - progress, 2.5);

      // Hiệu ứng chéo qua bên phải và từ từ thẳng lại:
      const rot = ((1 - ease) * 4.2).toFixed(2); // Nghiêng chéo sang phải, giảm dần về 0deg
      const scale = (0.91 + 0.09 * ease).toFixed(4);
      const radius = Math.round((1 - ease) * 32);
      const maxW = (92 + 8 * ease).toFixed(1);

      sheetCard.style.transform = `scale(${scale}) rotate(${rot}deg)`;
      sheetCard.style.transformOrigin = 'center 15%';
      sheetCard.style.borderRadius = `${radius}px ${radius}px 0 0`;
      sheetCard.style.maxWidth = `${maxW}vw`;
      sheetCard.style.width = '100%';
      sheetCard.style.boxShadow = `0 -${Math.round(24 * (1 - ease))}px ${Math.round(50 * (1 - ease))}px rgba(15, 23, 42, ${((1 - ease) * 0.12).toFixed(3)})`;

      // Hiệu ứng các thành phần ở ảnh 2 bay từ 2 bên vào khi kéo xuống:
      const leftOffset = (-180 * (1 - ease)).toFixed(1);
      const rightOffset = (180 * (1 - ease)).toFixed(1);
      const splitOpacity = Math.min(1, ease * 1.6).toFixed(2);

      if (headerEl) {
        headerEl.style.transform = `translateX(${leftOffset}px)`;
        headerEl.style.opacity = splitOpacity;
      }
      if (visualEl) {
        visualEl.style.transform = `translateX(${rightOffset}px)`;
        visualEl.style.opacity = splitOpacity;
      }
    } else if (rect.top <= 0) {
      // Đã vào trọn vẹn màn hình: Hoàn toàn thẳng đứng, 100% full screen phẳng
      sheetCard.style.transform = 'none';
      sheetCard.style.borderRadius = '0';
      sheetCard.style.maxWidth = '100vw';
      sheetCard.style.width = '100%';
      sheetCard.style.boxShadow = 'none';

      if (headerEl) {
        headerEl.style.transform = 'none';
        headerEl.style.opacity = '1';
      }
      if (visualEl) {
        visualEl.style.transform = 'none';
        visualEl.style.opacity = '1';
      }
    } else {
      // Chưa vào màn hình
      sheetCard.style.transform = 'scale(0.91) rotate(4.2deg)';
      sheetCard.style.transformOrigin = 'center 15%';
      sheetCard.style.borderRadius = '32px 32px 0 0';
      sheetCard.style.maxWidth = '92vw';
      sheetCard.style.boxShadow = '0 -24px 50px rgba(15, 23, 42, 0.12)';

      if (headerEl) {
        headerEl.style.transform = 'translateX(-180px)';
        headerEl.style.opacity = '0';
      }
      if (visualEl) {
        visualEl.style.transform = 'translateX(180px)';
        visualEl.style.opacity = '0';
      }
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

    // Stage 03: Live Quiz fan-out từ giữa qua 2 bên & đứng im
    updateLiveQuizFanOut();

    // Stage 04: Grail-style editorial sheet trượt lên đè Section 03
    updateGrailSheetTransition();

    // Stage 04.1: Showcase Quản lý trong 1 ứng dụng (Phone & Card stacking)
    updateAppPhoneStack();

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
  window.addEventListener('scroll', () => {
    onScrollUpdate(window.scrollY);
  }, { passive: true });

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
