/* ============================================================================
   KIYOEDU SCROLLYTELLING RUNTIME · MASTER CONTROLLER (EXPANDED 8-ACT NARRATIVE)
   Engineered under Scrollytelling Website Master Principles
   Native IntersectionObserver + requestAnimationFrame 60FPS Orchestration
   Zero Scroll Hijacking · Micro-Parallax · Smooth Continuous Progression
   ============================================================================ */

import { ScrollytellingEngine } from './webgpu-story-engine.js';

async function initScrollytelling() {
  // ── 1. Canvas Background Engine ───────────────────────────────────────────
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

  // Hero
  const heroTarget = document.getElementById('hero-parallax-target');
  const heroScrollCue = document.getElementById('hero-scroll-cue');

  // Timeline Track (Hồi 06)
  const timelineTrack = document.getElementById('timeline-track');
  const timelineLineFill = document.getElementById('timeline-line-fill');
  const timelineNodes = Array.from(document.querySelectorAll('.timeline-node-item'));

  // Stats Counters (Hồi 07)
  const statsStrip = document.getElementById('stats-counter-strip');
  const statValues = Array.from(document.querySelectorAll('.stat-value'));
  let statsCounted = false;

  // ── 3. Hero Subtle Parallax ───────────────────────────────────────────────
  function updateHeroParallax(scrollY) {
    if (!heroTarget) return;
    const heroH = window.innerHeight;
    if (scrollY <= heroH) {
      const progress = scrollY / heroH;
      const translateY = -(progress * 24);
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

  // ── 4. Timeline Progress Line (Hồi 06) ────────────────────────────────────
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

  // ── 5. Real Metrics Count-Up (Hồi 07) ────────────────────────────────────
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

  // ── 6. Global Scroll Tracking ─────────────────────────────────────────────
  function onScroll() {
    const scrollY = window.pageYOffset || document.documentElement.scrollTop;
    const totalScroll = document.documentElement.scrollHeight - window.innerHeight;

    // Header progress bar
    if (headerProgress && totalScroll > 0) {
      const progress = Math.max(0, Math.min(1, scrollY / totalScroll));
      headerProgress.style.transform = `scaleX(${progress})`;
      if (engine) engine.setStoryPos(progress * 8, progress);
    }

    // Hero parallax
    updateHeroParallax(scrollY);

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
