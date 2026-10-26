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

  // Chặng 2: Split-Screen Steps, Display Layers & Mode Tabs
  const stepCards = Array.from(document.querySelectorAll('.narrative-step-card'));
  const displayLayers = Array.from(document.querySelectorAll('.sticky-display-layer'));
  const modeTabs = Array.from(document.querySelectorAll('.mode-tab'));
  const stepDirectBtns = Array.from(document.querySelectorAll('.step-direct-btn'));
  const stickyVisualLabel = document.getElementById('sticky-visual-label');
  const stickyStatusText = document.getElementById('sticky-status-text');

  const stepMeta = [
    { title: 'KiyoEdu Studio · Bóc tách đề thi SI & OCR', status: 'Quét SI tự động (3s)' },
    { title: 'KiyoEdu Arena · Đấu trường Quiz Trực tiếp', status: '42 Học sinh thi đấu' },
    { title: 'KiyoEdu Manage · Quản lý Lớp học Azota', status: '38/40 Đã chấm điểm' }
  ];

  // Chặng 3: Timeline Track
  const timelineTrack = document.getElementById('timeline-track');
  const timelineLineFill = document.getElementById('timeline-line-fill');
  const timelineNodes = Array.from(document.querySelectorAll('.timeline-node-item'));

  // Chặng 4: Stats & Bento Interactive Levels
  const statsStrip = document.getElementById('stats-counter-strip');
  const statValues = Array.from(document.querySelectorAll('.stat-value'));
  const bentoCards = Array.from(document.querySelectorAll('.bento-card'));
  const levelTabs = Array.from(document.querySelectorAll('.level-tab'));
  const examPreviewTitle = document.getElementById('exam-preview-title');
  const examPreviewBadge = document.getElementById('exam-preview-badge');
  const examPreviewItems = document.getElementById('exam-preview-items');
  let statsCounted = false;

  // Chặng 5: CTA Quick Chips
  const cqChips = Array.from(document.querySelectorAll('.cq-chip'));
  const ctaClassCodeInput = document.getElementById('cta-class-code');

  // ── 3. Chặng 1: Hero Parallax (KHÔNG can thiệp opacity, luôn rõ nét 100%) ──
  function updateHeroParallax(scrollY) {
    if (!heroTarget) return;
    const heroH = window.innerHeight;
    if (scrollY <= heroH) {
      const progress = scrollY / heroH;
      // Giữ opacity luôn 100% rõ nét, chỉ dịch nhẹ translate
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
    // Cập nhật thẻ dẫn chuyện bên phải
    stepCards.forEach((card, idx) => {
      card.classList.toggle('is-active', idx === activeIndex);
    });

    // Chuyển đổi lớp hiển thị tương tác bên trái (Cross-Fade mượt mà)
    displayLayers.forEach((layer, idx) => {
      layer.classList.toggle('is-active', idx === activeIndex);
    });

    // Cập nhật Mode Tabs trên Mockup Header
    modeTabs.forEach((tab, idx) => {
      const isCurrent = idx === activeIndex;
      tab.classList.toggle('is-active', isCurrent);
      tab.setAttribute('aria-selected', isCurrent ? 'true' : 'false');
    });

    // Cập nhật thanh tiêu đề và trạng thái studio
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
          activateStep(activeIndex);
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

  // Tương tác bấm tab Mockup trực tiếp hoặc bấm nút "Xem demo"
  modeTabs.forEach((tab) => {
    tab.addEventListener('click', () => {
      const targetStep = parseInt(tab.dataset.tab, 10);
      if (stepCards[targetStep]) {
        stepCards[targetStep].scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      activateStep(targetStep);
    });
  });

  stepDirectBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      const targetStep = parseInt(btn.dataset.targetStep, 10);
      activateStep(targetStep);
      // Rung nhẹ hoặc hiệu ứng focus vào mockup
      const mockup = document.getElementById('sticky-app-mockup');
      if (mockup) {
        mockup.style.transform = 'scale(1.02)';
        setTimeout(() => { mockup.style.transform = 'none'; }, 300);
      }
    });
  });

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

  // ── 6b. Chặng 4: Bento Interactive Difficulty Level Switcher ──────────────
  const levelData = {
    '1': {
      title: '📄 Đề kiểm tra 15 phút · Đại số 9',
      badge: 'Mức 1 · Tỷ lệ ăn điểm 94%',
      items: [
        { text: '<strong>Câu 1:</strong> Cho phương trình <em>ax² + bx + c = 0 (a ≠ 0)</em>. Biệt thức <em>Δ</em> là?', tag: 'Δ = b² − 4ac' },
        { text: '<strong>Câu 2:</strong> Căn bậc hai số học của 25 là số nào?', tag: '5 (Không lấy −5)' }
      ]
    },
    '2': {
      title: '📄 Đề kiểm tra 15 phút · Đại số 9',
      badge: 'Mức 2 · Tỷ lệ ăn điểm 78%',
      items: [
        { text: '<strong>Câu 1:</strong> Điều kiện của <em>m</em> để phương trình <em>x² − 2x + m = 0</em> có 2 nghiệm phân biệt:', tag: 'm < 1' },
        { text: '<strong>Câu 2:</strong> Hàm số <em>y = (m − 1)x + 2</em> đồng biến trên R khi nào?', tag: 'm > 1' }
      ]
    },
    '3': {
      title: '📄 Đề kiểm tra 1 tiết · Đại số 9',
      badge: 'Mức 3 · Tỷ lệ ăn điểm 52%',
      items: [
        { text: '<strong>Câu 1:</strong> Cho phương trình <em>x² − 2(m−1)x + m² − 3 = 0</em>. Tìm <em>m</em> để <em>x₁² + x₂² = 10</em>:', tag: 'm = 2 hoặc m = −1' },
        { text: '<strong>Câu 2:</strong> Mảnh đất hình chữ nhật có diện tích 360m², tăng chiều rộng thêm 2m...', tag: 'Dài 24m, Rộng 15m' }
      ]
    },
    '4': {
      title: '📄 Đề thi thử vào lớp 10 Chuyên',
      badge: 'Mức 4 · Phân hóa điểm 9 - 10',
      items: [
        { text: '<strong>Câu 1:</strong> Tìm GTNN của <em>P = (x² + y²)/(xy)</em> với <em>x, y > 0</em> và <em>x + y = 4</em>:', tag: 'Min P = 2 khi x = y = 2' },
        { text: '<strong>Câu 2:</strong> Giải hệ phương trình đối xứng: <em>{ x³ − 3x = y³ − 3y, x² + y² = 4 }</em>:', tag: '(x,y) = (√2, √2), (−√2, −√2)' }
      ]
    }
  };

  levelTabs.forEach((tab) => {
    tab.addEventListener('click', () => {
      const level = tab.dataset.level;
      if (!levelData[level]) return;

      levelTabs.forEach((t) => t.classList.toggle('is-active', t === tab));

      const data = levelData[level];
      if (examPreviewTitle) examPreviewTitle.textContent = data.title;
      if (examPreviewBadge) examPreviewBadge.textContent = data.badge;

      if (examPreviewItems) {
        examPreviewItems.style.opacity = '0';
        setTimeout(() => {
          examPreviewItems.innerHTML = data.items.map(it => `
            <div class="e-item">
              <span class="e-txt">${it.text}</span>
              <span class="e-tag-green">${it.tag}</span>
            </div>
          `).join('');
          examPreviewItems.style.opacity = '1';
        }, 150);
      }
    });
  });

  // ── 6c. Chặng 5: Quick Join Preset Chips ──────────────────────────────────
  cqChips.forEach((chip) => {
    chip.addEventListener('click', () => {
      const code = chip.dataset.code;
      if (ctaClassCodeInput && code) {
        ctaClassCodeInput.value = code;
        ctaClassCodeInput.focus();
        const joinBtn = document.getElementById('cta-join-btn');
        if (joinBtn) {
          joinBtn.style.transform = 'scale(1.05)';
          setTimeout(() => { joinBtn.style.transform = 'none'; }, 200);
        }
      }
    });
  });

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
