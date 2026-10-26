/* ============================================================================
   KIYOEDU SCROLLYTELLING RUNTIME · MASTER CONTROLLER (WEBEDU V2.0)
   Native IntersectionObserver + requestAnimationFrame 60FPS Orchestration
   Zero Scroll Hijacking · Micro-Parallax · Sticky Cross-Fade · Live Count-Up
   ============================================================================ */

import { ScrollytellingEngine } from './webgpu-story-engine.js';

const HEADER_HEIGHT = 70;

async function initScrollytelling() {
  // ── 1. Subtle Canvas Dot Grid ─────────────────────────────────────────────
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
  const headerProgress = document.getElementById('header-progress');
  const navLinks = Array.from(document.querySelectorAll('.nav-link'));

  // Chặng 1: Hero
  const heroTarget = document.getElementById('hero-parallax-target');
  const heroScrollCue = document.getElementById('hero-scroll-cue');

  // Chặng 2: Split-Screen Steps & Display Layers
  const stepCards = Array.from(document.querySelectorAll('.narrative-step-card'));
  const displayLayers = Array.from(document.querySelectorAll('.sticky-display-layer'));
  const stickyVisualLabel = document.getElementById('sticky-visual-label');
  const stickyStatusText = document.getElementById('sticky-status-text');

  const stepMeta = [
    { title: 'KiyoEdu Studio · Bóc tách đề thi SI & OCR', status: 'Quét SI tự động (3s)' },
    { title: 'KiyoEdu Arena · Đấu trường Quiz Trực tiếp', status: '38 Học sinh thi đấu' },
    { title: 'KiyoEdu Manage · Quản lý Lớp học Azota', status: '38/40 Đã chấm điểm' }
  ];

  // Chặng 3: Timeline Track
  const timelineTrack = document.getElementById('timeline-track');
  const timelineLineFill = document.getElementById('timeline-line-fill');
  const timelineNodes = Array.from(document.querySelectorAll('.timeline-node-item'));

  // Chặng 4: Stats & Bento
  const statsStrip = document.getElementById('stats-counter-strip');
  const statValues = Array.from(document.querySelectorAll('.stat-value'));
  const bentoCards = Array.from(document.querySelectorAll('.bento-card'));
  let statsCounted = false;

  // ── 3. Chặng 1: Hero Parallax (KHÔNG can thiệp opacity, luôn rõ nét 100%) ──
  function updateHeroParallax(scrollY) {
    if (!heroTarget) return;
    const heroH = window.innerHeight;
    if (scrollY <= heroH) {
      const progress = scrollY / heroH;
      // Chỉ dịch chuyển micro-translate nhẹ 20px, giữ opacity luôn 100% rõ nét
      const translateY = -(progress * 20);
      heroTarget.style.transform = `translate3d(0, ${translateY}px, 0)`;
      heroTarget.style.opacity = '1';

      if (heroScrollCue) {
        heroScrollCue.style.opacity = progress > 0.05 ? '0' : '1';
      }
    } else {
      heroTarget.style.transform = 'none';
      heroTarget.style.opacity = '1';
    }
  }

  // ── 4. Chặng 2: Sticky Split-Screen Step Observer ─────────────────────────
  const stepObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const activeIndex = parseInt(entry.target.dataset.step, 10);

          // Cập nhật thẻ dẫn chuyện bên phải
          stepCards.forEach((card, idx) => {
            card.classList.toggle('is-active', idx === activeIndex);
          });

          // Chuyển đổi lớp hiển thị tương tác bên trái (Cross-Fade mượt mà)
          displayLayers.forEach((layer, idx) => {
            layer.classList.toggle('is-active', idx === activeIndex);
          });

          // Cập nhật thanh tiêu đề và trạng thái studio
          if (stepMeta[activeIndex]) {
            if (stickyVisualLabel) stickyVisualLabel.textContent = stepMeta[activeIndex].title;
            if (stickyStatusText) stickyStatusText.textContent = stepMeta[activeIndex].status;
          }
        }
      });
    },
    {
      root: null,
      rootMargin: '-30% 0px -30% 0px',
      threshold: 0.1
    }
  );

  stepCards.forEach((card) => stepObserver.observe(card));

  // ── 5. Chặng 3: Scroll-Linked Timeline Progress Line ──────────────────────
  function updateTimelineProgress() {
    if (!timelineTrack || !timelineLineFill) return;
    const rect = timelineTrack.getBoundingClientRect();
    const windowH = window.innerHeight;

    const startY = windowH * 0.75;
    const totalDistance = rect.height;
    const currentProgress = (startY - rect.top) / totalDistance;
    const fillPercent = Math.max(0, Math.min(100, currentProgress * 100));

    timelineLineFill.style.height = `${fillPercent}%`;

    timelineNodes.forEach((node) => {
      const nodeRect = node.getBoundingClientRect();
      const nodeCenter = nodeRect.top + nodeRect.height * 0.35;
      const isActive = nodeCenter <= windowH * 0.75;
      node.classList.toggle('is-active', isActive);
    });
  }

  // ── 6. Chặng 4: Smooth Count-Up Animation & Bento Reveal ──────────────────
  function runCountUp(el, target, duration = 1500) {
    let startTimestamp = null;
    const startVal = 0;

    function step(timestamp) {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      const easeProgress = 1 - Math.pow(1 - progress, 3);
      const currentVal = Math.floor(startVal + (target - startVal) * easeProgress);

      el.textContent = currentVal.toLocaleString('en-US');

      if (progress < 1) {
        requestAnimationFrame(step);
      } else {
        el.textContent = target.toLocaleString('en-US');
      }
    }
    requestAnimationFrame(step);
  }

  const showcaseObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          if (!statsCounted) {
            statsCounted = true;
            document.querySelectorAll('.stat-counter-item').forEach((item, idx) => {
              setTimeout(() => item.classList.add('is-visible'), idx * 70);
            });
            statValues.forEach((valEl) => {
              const target = parseFloat(valEl.dataset.count || '0');
              runCountUp(valEl, target, 1500);
            });
          }

          bentoCards.forEach((card, idx) => {
            setTimeout(() => card.classList.add('is-visible'), 100 + idx * 90);
          });
        }
      });
    },
    { threshold: 0.15 }
  );

  if (statsStrip) showcaseObserver.observe(statsStrip);

  // ── 7. Global Scroll Loop (RAF Passive Sync) ──────────────────────────────
  let rafPending = false;

  function onScroll() {
    if (rafPending) return;
    rafPending = true;

    requestAnimationFrame(() => {
      rafPending = false;
      const scrollY = window.scrollY;
      const docH = document.documentElement.scrollHeight - window.innerHeight;
      const globalProgress = docH > 0 ? Math.max(0, Math.min(1, scrollY / docH)) : 0;

      // Cập nhật thanh tiến trình header
      if (headerProgress) {
        headerProgress.style.width = `${globalProgress * 100}%`;
      }

      updateHeroParallax(scrollY);
      updateTimelineProgress();

      // Đồng bộ trạng thái active cho Top Nav Links
      let activeStage = 0;
      stages.forEach((stage, idx) => {
        const r = stage.getBoundingClientRect();
        if (r.top <= window.innerHeight * 0.45 && r.bottom >= window.innerHeight * 0.45) {
          activeStage = idx;
        }
      });

      navLinks.forEach((link, idx) => {
        link.classList.toggle('is-active', idx === activeStage);
      });

      if (engine) {
        engine.setStoryPos(activeStage, globalProgress);
      }
    });
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', () => {
    if (engine) engine.resize();
    onScroll();
  }, { passive: true });

  onScroll();

  // ── 8. Smooth Anchor Navigation ───────────────────────────────────────────
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener('click', (e) => {
      const href = anchor.getAttribute('href');
      if (!href || href === '#') return;
      const targetId = href.slice(1);
      const targetEl = document.getElementById(targetId);
      if (targetEl) {
        e.preventDefault();
        const targetY = targetId === 'chang-1-hero' ? 0 : targetEl.offsetTop - HEADER_HEIGHT;
        window.scrollTo({ top: Math.max(0, targetY), behavior: 'smooth' });
      }
    });
  });
}

// Bootstrap
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initScrollytelling);
} else {
  initScrollytelling();
}
