/* ============================================================================
   KIYOEDU SCROLLYTELLING RUNTIME · MASTER EDITION
   Fixed WebGPU canvas + 6 distinct chapter layouts synced via native scroll.
   Continuous Story Coordinate · Zero Dead Zones · Zero Hitching
   Live SMPTE Timecode · Dynamic DoF Meter · Tactical Cam Staging · Aspect Gates
   ============================================================================ */

import { ScrollytellingEngine } from './webgpu-story-engine.js';

const HEADER_H = 60; // px — matches CSS --header-h

async function init() {
  // ── 1. Init WebGPU / WebGL2 / Canvas2D Engine ─────────────────────────────
  const canvas = document.getElementById('scrolly-canvas');
  if (!canvas) {
    console.warn('[KiyoEdu] #scrolly-canvas not found.');
    return;
  }

  const engine = new ScrollytellingEngine(canvas);
  const rendererType = await engine.init();
  console.log(`[KiyoEdu] Visual Stage Engine: ${rendererType}`);

  // ── 2. Render Loop (drives canvas smoothly via spring tracking) ───────────
  function loop(t) {
    engine.render(t);
    requestAnimationFrame(loop);
  }
  requestAnimationFrame(loop);

  document.addEventListener('visibilitychange', () => {
    engine.isDirty = !document.hidden;
  });

  // ── 3. DOM Cache ──────────────────────────────────────────────────────────
  const chapters = Array.from(document.querySelectorAll('.story-chapter'));
  const progressBar = document.getElementById('header-progress');
  const navLinks = Array.from(document.querySelectorAll('.nav-link'));
  const dofBar = document.getElementById('dof-bar');
  const dofReadout = document.getElementById('dof-readout');
  const timecodeEl = document.getElementById('smpte-timecode');
  const camPos1 = document.getElementById('cam-pos-1');
  const camPos2 = document.getElementById('cam-pos-2');
  const camPos3 = document.getElementById('cam-pos-3');
  const ratioChips = Array.from(document.querySelectorAll('.ratio-chip'));
  const ratioCaption = document.getElementById('ratio-caption');

  // ── 4. Live 24fps SMPTE Timecode Ticker ───────────────────────────────────
  let tcHour = 1, tcMin = 24, tcSec = 14, tcFrame = 8;
  setInterval(() => {
    tcFrame++;
    if (tcFrame >= 24) {
      tcFrame = 0;
      tcSec++;
      if (tcSec >= 60) {
        tcSec = 0;
        tcMin++;
        if (tcMin >= 60) {
          tcMin = 0;
          tcHour++;
        }
      }
    }
    if (timecodeEl) {
      const pad = (n) => String(n).padStart(2, '0');
      timecodeEl.textContent = `${pad(tcHour)}:${pad(tcMin)}:${pad(tcSec)}:${pad(tcFrame)}`;
    }
  }, 1000 / 24);

  // ── 5. Continuous Scroll Sync (Zero Dead Zones, Zero Hitching) ────────────
  let rafPending = false;

  function onScroll() {
    if (rafPending) return;
    rafPending = true;
    requestAnimationFrame(() => {
      rafPending = false;

      const scrollY = window.scrollY;
      const docH = document.documentElement.scrollHeight - window.innerHeight;
      const globalProgress = docH > 0 ? Math.max(0, Math.min(1, scrollY / docH)) : 0;

      // Update header ink line
      if (progressBar) {
        progressBar.style.width = (globalProgress * 100) + '%';
      }

      // Compute scroll start offsets for each chapter
      const chapterStarts = chapters.map((ch, i) => {
        return i === 0 ? 0 : ch.offsetTop - HEADER_H;
      });

      let activeChapter = 0;
      let localProg = 0;
      let storyPos = 0;

      if (scrollY <= 0) {
        activeChapter = 0;
        localProg = 0;
        storyPos = 0;
      } else if (scrollY >= docH) {
        activeChapter = chapters.length - 1;
        localProg = 1.0;
        storyPos = chapters.length - 1;
      } else {
        // Continuous linear story mapping across chapter spans
        let found = false;
        for (let i = 0; i < chapters.length - 1; i++) {
          const s0 = chapterStarts[i];
          const s1 = chapterStarts[i + 1];
          if (scrollY >= s0 && scrollY < s1) {
            activeChapter = i;
            localProg = (scrollY - s0) / (s1 - s0);
            storyPos = i + localProg;
            found = true;
            break;
          }
        }
        if (!found) {
          activeChapter = chapters.length - 1;
          const sLast = chapterStarts[chapters.length - 1];
          const denom = Math.max(1, docH - sLast);
          localProg = Math.max(0, Math.min(1, (scrollY - sLast) / denom));
          storyPos = activeChapter + localProg;
        }
      }

      // Send continuous story coordinate to WebGPU engine (smoothly interpolates)
      engine.setStoryPos(storyPos, globalProgress);

      // Chapter-specific live micro-interactions:
      // Act 1: Dynamic DoF gauge bar
      if (activeChapter === 1 && dofBar && dofReadout) {
        const leftPercent = 15 + localProg * 25;
        const widthPercent = 12 + localProg * 55;
        dofBar.style.left = `${leftPercent}%`;
        dofBar.style.width = `${widthPercent}%`;
        if (localProg < 0.3) {
          dofReadout.textContent = 'f/1.4 — VÙNG NÉT: 4 INCHES (ĐẶC TẢ)';
        } else if (localProg < 0.7) {
          dofReadout.textContent = 'f/4.0 — VÙNG NÉT: 1.8 FEET (TRUNG CẢNH)';
        } else {
          dofReadout.textContent = 'f/16 — VÙNG NÉT: TOÀN DẢI VÔ CỰC (ĐẠI CẢNH)';
        }
      }

      // Act 3: Tactical camera active position tracking
      if (activeChapter === 3) {
        if (camPos1) camPos1.classList.toggle('is-active', localProg < 0.35);
        if (camPos2) camPos2.classList.toggle('is-active', localProg >= 0.35 && localProg < 0.70);
        if (camPos3) camPos3.classList.toggle('is-active', localProg >= 0.70);
      }

      // Act 4: Dynamic aspect ratio sync
      if (activeChapter === 4 && ratioChips.length > 0) {
        let activeIdx = 1;
        if (localProg < 0.33) activeIdx = 0;
        else if (localProg > 0.66) activeIdx = 2;
        ratioChips.forEach((chip, idx) => {
          chip.classList.toggle('is-active', idx === activeIdx);
        });
        if (ratioCaption) {
          if (activeIdx === 0) ratioCaption.textContent = '1.33:1 Academy — Tỉ lệ điện ảnh kinh điển 35mm 4-perf.';
          else if (activeIdx === 1) ratioCaption.textContent = '1.85:1 Flat DCI — Chuẩn khung hình chiếu rạp tiêu chuẩn quốc tế.';
          else ratioCaption.textContent = '2.39:1 Anamorphic Scope — Đại cảnh điện ảnh tráng lệ chuẩn Hollywood.';
        }
      }

      // Highlight active nav link
      navLinks.forEach(link => {
        const href = link.getAttribute('href');
        const id = href ? href.slice(1) : '';
        const targetCh = chapters.find(c => c.id === id);
        if (!targetCh) return;
        const r = targetCh.getBoundingClientRect();
        const isActive = r.top <= window.innerHeight * 0.55 && r.bottom >= 0;
        link.classList.toggle('is-active', isActive);
      });
    });
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', () => {
    engine.resize();
    onScroll();
  }, { passive: true });

  // Initial trigger
  onScroll();

  // ── 6. Smooth Scroll for Anchor Links (Navigates without fighting wheel physics)
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', e => {
      const href = anchor.getAttribute('href');
      if (!href || href === '#') return;
      const targetId = href.slice(1);
      const targetEl = document.getElementById(targetId);
      if (targetEl) {
        e.preventDefault();
        const targetY = targetId === 'khoi-nguon' ? 0 : targetEl.offsetTop - HEADER_H;
        window.scrollTo({ top: Math.max(0, targetY), behavior: 'smooth' });
      }
    });
  });

  // ── 7. Aspect Ratio Chip Click Handlers ────────────────────────────────────
  ratioChips.forEach(chip => {
    chip.addEventListener('click', () => {
      ratioChips.forEach(c => c.classList.remove('is-active'));
      chip.classList.add('is-active');
      const ratio = parseFloat(chip.dataset.ratio || '1.85');
      if (ratioCaption) {
        if (ratio < 1.5) ratioCaption.textContent = '1.33:1 Academy — Tỉ lệ điện ảnh kinh điển 35mm 4-perf.';
        else if (ratio < 2.0) ratioCaption.textContent = '1.85:1 Flat DCI — Chuẩn khung hình chiếu rạp tiêu chuẩn quốc tế.';
        else ratioCaption.textContent = '2.39:1 Anamorphic Scope — Đại cảnh điện ảnh tráng lệ chuẩn Hollywood.';
      }
    });
  });

  // ── 8. Application Form Submission Handler ─────────────────────────────────
  const form = document.getElementById('apply-form');
  if (form) {
    form.addEventListener('submit', e => {
      e.preventDefault();
      const nameInput = document.getElementById('input-author-name');
      const authorName = (nameInput && nameInput.value) ? nameInput.value.trim() : 'Tác giả';
      form.innerHTML = `
        <div style="padding: 1.5rem 0; font-family: var(--f-mono); font-size: 0.8125rem; color: var(--c-ink); line-height: 1.8;">
          <div style="font-weight: 700; margin-bottom: 0.5rem; text-transform: uppercase;">✓ HỒ SƠ ĐÃ ĐƯỢC TIẾP NHẬN</div>
          <p style="color: var(--c-muted); margin: 0;">Cảm ơn ${authorName}. Hội đồng chuyên môn KiyoEdu sẽ xem xét hồ sơ và liên lạc qua số điện thoại/email trong vòng 48 giờ làm việc.</p>
        </div>
      `;
    });
  }
}

// Bootstrap
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
