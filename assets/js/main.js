/* =====================================================
   Sanjana Gondaliya — Portfolio interactions
   ===================================================== */
(function () {
  'use strict';

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Live clock + date ---------- */
  const clockEl = document.getElementById('liveClock');
  const dateEl  = document.getElementById('liveDate');
  const yearEl  = document.getElementById('year');

  function updateTime() {
    const now = new Date();
    if (clockEl) {
      clockEl.textContent = now.toLocaleTimeString('en-US', {
        hour: 'numeric', minute: '2-digit', hour12: true
      });
    }
    if (dateEl) {
      dateEl.textContent = now.toLocaleDateString('en-GB', {
        day: '2-digit', month: 'short', year: 'numeric'
      });
    }
  }
  updateTime();
  setInterval(updateTime, 1000 * 30);
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());

  /* ---------- Scroll progress bar ---------- */
  const progress = document.getElementById('scrollProgress');
  function onScrollProgress() {
    const h = document.documentElement;
    const scrolled = (h.scrollTop) / (h.scrollHeight - h.clientHeight);
    if (progress) progress.style.width = Math.min(scrolled * 100, 100) + '%';
  }
  document.addEventListener('scroll', onScrollProgress, { passive: true });
  onScrollProgress();

  /* ---------- Reveal on scroll ---------- */
  const reveals = document.querySelectorAll('.reveal');
  if (reduceMotion) {
    reveals.forEach(el => el.classList.add('is-visible'));
  } else {
    const io = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });
    reveals.forEach(el => io.observe(el));
  }

  /* ---------- Animated stat counters ---------- */
  const counters = document.querySelectorAll('[data-count]');
  const countIO = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      const target = parseInt(el.dataset.count, 10);
      if (reduceMotion) { el.textContent = String(target); countIO.unobserve(el); return; }
      let start = null;
      const dur = 1400;
      function step(ts) {
        if (start === null) start = ts;
        const p = Math.min((ts - start) / dur, 1);
        const eased = 1 - Math.pow(1 - p, 3);
        el.textContent = Math.round(target * eased) + (p === 1 && target >= 30 ? '+' : '');
        if (p < 1) requestAnimationFrame(step);
      }
      requestAnimationFrame(step);
      countIO.unobserve(el);
    });
  }, { threshold: 0.6 });
  counters.forEach(el => countIO.observe(el));

  /* ---------- Active nav highlight ---------- */
  const navLinks = document.querySelectorAll('.nav__link[data-section]');
  const sections = ['home', 'work', 'services', 'contact']
    .map(id => document.getElementById(id))
    .filter(Boolean);

  const navIO = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.id;
        navLinks.forEach(link => {
          link.classList.toggle('is-active', link.dataset.section === id);
        });
      }
    });
  }, { threshold: 0.4, rootMargin: '-20% 0px -40% 0px' });
  sections.forEach(s => navIO.observe(s));

  /* ---------- Mobile menu ---------- */
  const toggle = document.getElementById('menuToggle');
  const sidebar = document.getElementById('sidebar');
  function closeMenu() {
    sidebar.classList.remove('is-open');
    toggle.classList.remove('is-open');
  }
  if (toggle && sidebar) {
    toggle.addEventListener('click', () => {
      sidebar.classList.toggle('is-open');
      toggle.classList.toggle('is-open');
    });
    sidebar.querySelectorAll('a[href^="#"]').forEach(a =>
      a.addEventListener('click', closeMenu));
    document.addEventListener('click', (e) => {
      if (window.innerWidth > 820) return;
      if (!sidebar.contains(e.target) && !toggle.contains(e.target)) closeMenu();
    });
  }

  /* ---------- Animated starfield ---------- */
  const canvas = document.getElementById('stars');
  if (canvas && !reduceMotion) {
    const ctx = canvas.getContext('2d');
    let w, h, stars, dpr;

    function resize() {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = canvas.width = window.innerWidth * dpr;
      h = canvas.height = window.innerHeight * dpr;
      canvas.style.width = window.innerWidth + 'px';
      canvas.style.height = window.innerHeight + 'px';
      const count = Math.min(120, Math.floor((window.innerWidth * window.innerHeight) / 14000));
      stars = Array.from({ length: count }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        r: (Math.random() * 1.2 + 0.3) * dpr,
        a: Math.random() * 0.6 + 0.2,
        tw: Math.random() * 0.02 + 0.004,
        dir: Math.random() > 0.5 ? 1 : -1,
        vx: (Math.random() - 0.5) * 0.12 * dpr,
        vy: (Math.random() - 0.5) * 0.12 * dpr
      }));
    }

    function draw() {
      ctx.clearRect(0, 0, w, h);
      for (const s of stars) {
        s.a += s.tw * s.dir;
        if (s.a > 0.85 || s.a < 0.15) s.dir *= -1;
        s.x += s.vx; s.y += s.vy;
        if (s.x < 0) s.x = w; if (s.x > w) s.x = 0;
        if (s.y < 0) s.y = h; if (s.y > h) s.y = 0;
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(200, 190, 255,' + s.a + ')';
        ctx.fill();
      }
      requestAnimationFrame(draw);
    }

    resize();
    draw();
    let rt;
    window.addEventListener('resize', () => { clearTimeout(rt); rt = setTimeout(resize, 200); });
  }

})();
