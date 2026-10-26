/* ============================================================================
   KIYOEDU SCROLLYTELLING RUNTIME · MASTER CONTROLLER (WEBEDU V2.0 MINIMAL)
   Native IntersectionObserver + requestAnimationFrame 60FPS Orchestration
   Zero Scroll Hijacking · Micro-Parallax · Sticky Cross-Fade · Live Count-Up
   ============================================================================ */

import { ScrollytellingEngine } from './webgpu-story-engine.js';

const HEADER_HEIGHT = 70;

async function initScrollytelling() {
  // ── 1. Canvas Dot Grid Background ─────────────────────────────────────────
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

  // Chặng 2: Split-Screen Steps, Display Layers & Mode Tabs
  const stepCards = Array.from(document.querySelectorAll('.narrative-step-card'));
  const displayLayers = Array.from(document.querySelectorAll('.sticky-display-layer'));
  const modeTabs = Array.from(document.querySelectorAll('.mode-tab'));
  const stickyVisualLabel = document.getElementById('sticky-visual-label');
  const stickyStatusText = document.getElementById('sticky-status-text');

  const stepMeta = [
    { title: 'KiyoEdu Studio · Bóc tách SI', status: 'Bóc tách SI (3s)' },
    { title: 'KiyoEdu Arena · Live Quiz', status: 'Trực tiếp 0ms' },
    { title: 'KiyoEdu Manage · Sổ điểm Azota', status: 'Tự động chấm' }
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

  // ── 3. Chặng 1: Hero Parallax ─────────────────────────────────────────────
  function updateHeroParallax(scrollY) {
    if (!heroTarget) return;
    const heroH = window.innerHeight;
    if (scrollY <= heroH) {
      const progress = scrollY / heroH;
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

  // ── 4. Chặng 2: Sticky Split-Screen Step Observer & Tab Switching ─────────
  function activateStep(activeIndex) {
    stepCards.forEach((card, idx) => {
      card.classList.toggle('is-active', idx === activeIndex);
    });

    displayLayers.forEach((layer, idx) => {
      layer.classList.toggle('is-active', idx === activeIndex);
    });

    modeTabs.forEach((tab, idx) => {
      const isCurrent = idx === activeIndex;
      tab.classList.toggle('is-active', isCurrent);
      tab.setAttribute('aria-selected', isCurrent ? 'true' : 'false');
    });

    if (stepMeta[activeIndex]) {
      if (stickyVisualLabel) stickyVisualLabel.textContent = stepMeta[activeIndex].title;
      if (stickyStatusText) stickyStatusText.textContent = stepMeta[activeIndex].status;
    }
  }

  const stepObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const activeIndex = parseInt(entry.target.dataset.step, 10);
          if (!isNaN(activeIndex)) {
            activateStep(activeIndex);
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

  modeTabs.forEach((tab) => {
    tab.addEventListener('click', () => {
      const targetStep = parseInt(tab.dataset.tab, 10);
      if (stepCards[targetStep]) {
        stepCards[targetStep].scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      activateStep(targetStep);
    });
  });

  // ── 5. Chặng 3: Scroll-Linked Timeline Progress Line ──────────────────────
  function updateTimelineProgress() {
    if (!timelineTrack || !timelineLineFill) return;
    const rect = timelineTrack.getBoundingClientRect();
    const windowH = window.innerHeight;

    if (rect.top <= windowH * 0.7 && rect.bottom >= windowH * 0.3) {
      const totalDist = rect.height;
      const passedDist = (windowH * 0.7) - rect.top;
      const progress = Math.max(0, Math.min(1, passedDist / totalDist));
      timelineLineFill.style.height = `${progress * 100}%`;

      timelineNodes.forEach((node) => {
        const nodeRect = node.getBoundingClientRect();
        if (nodeRect.top < windowH * 0.7) {
          node.classList.add('is-passed');
        } else {
          node.classList.remove('is-passed');
        }
      });
    }
  }

  // ── 6. Chặng 4: Real Metrics Count-Up ────────────────────────────────────
  function runCountUp(el, target, duration = 1200) {
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
        if (entry.isIntersecting) {
          if (!statsCounted) {
            statsCounted = true;
            document.querySelectorAll('.stat-counter-item').forEach((item, idx) => {
              setTimeout(() => item.classList.add('is-visible'), idx * 70);
            });
            statValues.forEach((valEl) => {
              const target = parseFloat(valEl.dataset.count || '0');
              runCountUp(valEl, target, 1200);
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

  // ── 7. Global Scroll & Navigation Tracker ─────────────────────────────────
  function onScroll() {
    const scrollY = window.pageYOffset || document.documentElement.scrollTop;
    const totalScroll = document.documentElement.scrollHeight - window.innerHeight;

    // Header progress bar
    if (headerProgress && totalScroll > 0) {
      const progress = Math.max(0, Math.min(1, scrollY / totalScroll));
      headerProgress.style.transform = `scaleX(${progress})`;
      if (engine) engine.setStoryPos(progress * 5, progress);
    }

    // Hero parallax
    updateHeroParallax(scrollY);

    // Timeline line progress
    updateTimelineProgress();

    // Nav active link tracking
    stages.forEach((stage, idx) => {
      const rect = stage.getBoundingClientRect();
      if (rect.top <= HEADER_HEIGHT + 100 && rect.bottom >= HEADER_HEIGHT + 100) {
        navLinks.forEach((link, lIdx) => {
          link.classList.toggle('is-active', lIdx === idx);
        });
      }
    });
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', () => {
    if (engine) engine.resize();
  }, { passive: true });

  // Initial call
  onScroll();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initScrollytelling);
} else {
  initScrollytelling();
}
