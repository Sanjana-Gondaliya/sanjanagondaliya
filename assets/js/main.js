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
      dateEl.textContent = now.toLocaleDateString('en-US', {
        day: 'numeric', month: 'numeric', year: 'numeric'
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
  const sections = ['home']
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

  /* ---------- Featured work carousel ---------- */
  const rail = document.getElementById('workRail');
  const prevBtn = document.getElementById('workPrev');
  const nextBtn = document.getElementById('workNext');
  if (rail && prevBtn && nextBtn) {
    const stepSize = () => {
      const card = rail.querySelector('.project-card');
      return card ? card.getBoundingClientRect().width + 22 : rail.clientWidth * 0.8;
    };
    const behavior = reduceMotion ? 'auto' : 'smooth';

    function updateArrows() {
      const max = rail.scrollWidth - rail.clientWidth - 4;
      prevBtn.classList.toggle('is-hidden', rail.scrollLeft <= 4);
      nextBtn.classList.toggle('is-hidden', rail.scrollLeft >= max);
    }
    prevBtn.addEventListener('click', () => rail.scrollBy({ left: -stepSize(), behavior }));
    nextBtn.addEventListener('click', () => rail.scrollBy({ left: stepSize(), behavior }));
    rail.addEventListener('scroll', updateArrows, { passive: true });
    window.addEventListener('resize', updateArrows);
    updateArrows();

    /* drag / swipe to scroll */
    let down = false, startX = 0, startScroll = 0, moved = false;
    rail.addEventListener('pointerdown', (e) => {
      down = true; moved = false;
      startX = e.clientX; startScroll = rail.scrollLeft;
      rail.classList.add('is-dragging');
    });
    rail.addEventListener('pointermove', (e) => {
      if (!down) return;
      const dx = e.clientX - startX;
      if (Math.abs(dx) > 4) moved = true;
      rail.scrollLeft = startScroll - dx;
    });
    function endDrag() {
      if (!down) return;
      down = false;
      rail.classList.remove('is-dragging');
    }
    rail.addEventListener('pointerup', endDrag);
    rail.addEventListener('pointercancel', endDrag);
    rail.addEventListener('pointerleave', endDrag);
    /* prevent accidental navigation after a drag */
    rail.addEventListener('click', (e) => { if (moved) { e.preventDefault(); e.stopPropagation(); } }, true);

    /* click a card -> open its detail page */
    rail.addEventListener('click', (e) => {
      if (moved) return;
      const card = e.target.closest('.project-card');
      if (card && card.dataset.id) window.location.href = 'project.html?id=' + card.dataset.id;
    });
  }

  /* ---------- 3D tilt + pop on cards ---------- */
  const tiltCards = document.querySelectorAll('.price-card, .custom-card');
  if (tiltCards.length && !reduceMotion && window.matchMedia('(pointer: fine)').matches) {
    const MAX = 9; // max tilt in degrees
    tiltCards.forEach(card => {
      card.addEventListener('pointerenter', () => {
        // override the slow .reveal transition so the tilt tracks the cursor
        card.style.transition = 'transform .08s ease-out, box-shadow .35s';
      });
      card.addEventListener('pointermove', (e) => {
        const r = card.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width - 0.5;
        const py = (e.clientY - r.top) / r.height - 0.5;
        card.style.transform =
          'perspective(850px) rotateX(' + (-py * MAX).toFixed(2) + 'deg) rotateY(' +
          (px * MAX).toFixed(2) + 'deg) translateY(-8px) scale(1.03)';
      });
      card.addEventListener('pointerleave', () => {
        card.style.transition = 'transform .5s ease, box-shadow .35s';
        card.style.transform = '';
      });
    });
  }

  /* ---------- Contact form (mailto) ---------- */
  const contactForm = document.getElementById('contactForm');
  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const data = new FormData(contactForm);
      const name = (data.get('name') || '').toString().trim();
      const company = (data.get('company') || '').toString().trim();
      const message = (data.get('message') || '').toString().trim();
      if (!name || !message) {
        contactForm.reportValidity();
        return;
      }
      const subject = 'Project inquiry from ' + name + (company ? ' (' + company + ')' : '');
      const body = message + '\n\n— ' + name + (company ? ', ' + company : '');
      const note = document.getElementById('formNote');
      if (note) note.hidden = false;
      window.location.href = 'mailto:gondaliyasanjana@gmail.com?subject=' +
        encodeURIComponent(subject) + '&body=' + encodeURIComponent(body);
    });
  }

  /* ---------- FAQ accordion ---------- */
  const faqItems = document.querySelectorAll('.faq-item');
  faqItems.forEach(item => {
    const q = item.querySelector('.faq-item__q');
    const a = item.querySelector('.faq-item__a');
    if (!q || !a) return;
    q.addEventListener('click', () => {
      const willOpen = !item.classList.contains('is-open');
      faqItems.forEach(other => {
        other.classList.remove('is-open');
        const oq = other.querySelector('.faq-item__q');
        const oa = other.querySelector('.faq-item__a');
        if (oq) oq.setAttribute('aria-expanded', 'false');
        if (oa) oa.style.maxHeight = '0px';
      });
      if (willOpen) {
        item.classList.add('is-open');
        q.setAttribute('aria-expanded', 'true');
        a.style.maxHeight = a.scrollHeight + 'px';
      }
    });
  });

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
