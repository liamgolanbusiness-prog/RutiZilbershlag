/* =========================================================
   Ruti Zilbershlag – interactivity
   ========================================================= */
(() => {
  'use strict';

  const $  = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- header scroll state ---------- */
  const header = $('#siteHeader');
  const onScroll = () => {
    if (window.scrollY > 24) header.classList.add('scrolled');
    else header.classList.remove('scrolled');
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---------- mobile menu ---------- */
  const toggle = $('#menuToggle');
  const menu   = $('#mobileMenu');
  const setMenu = (open) => {
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'סגרי תפריט' : 'פתחי תפריט');
    menu.classList.toggle('open', open);
    menu.setAttribute('aria-hidden', String(!open));
    document.body.style.overflow = open ? 'hidden' : '';
  };
  toggle.addEventListener('click', () => {
    setMenu(toggle.getAttribute('aria-expanded') !== 'true');
  });
  $$('#mobileMenu a').forEach(a => a.addEventListener('click', () => setMenu(false)));
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && toggle.getAttribute('aria-expanded') === 'true') setMenu(false);
  });

  /* ---------- reveal on scroll ---------- */
  const revealEls = $$('.reveal');
  if ('IntersectionObserver' in window && !reduceMotion) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    revealEls.forEach(el => io.observe(el));
  } else {
    revealEls.forEach(el => el.classList.add('is-visible'));
  }

  /* ---------- counters ---------- */
  const counters = $$('.stat-num');
  const animateCount = (el) => {
    const target = parseInt(el.dataset.count, 10);
    const dur = 1800;
    const start = performance.now();
    const ease = t => 1 - Math.pow(1 - t, 3);
    const tick = (now) => {
      const p = Math.min((now - start) / dur, 1);
      el.textContent = Math.floor(ease(p) * target).toLocaleString('he-IL');
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  };
  if ('IntersectionObserver' in window && !reduceMotion) {
    const co = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          animateCount(entry.target);
          co.unobserve(entry.target);
        }
      });
    }, { threshold: 0.5 });
    counters.forEach(c => co.observe(c));
  } else {
    counters.forEach(c => c.textContent = c.dataset.count);
  }

  /* ---------- hero 3D parallax ---------- */
  const hero3d = $('.hero-3d');
  const heroStage = $('.hero-stage');
  if (hero3d && !reduceMotion && !matchMedia('(pointer:coarse)').matches) {
    let rx = 0, ry = 0, tx = 0, ty = 0;
    let rafId = null;
    const update = () => {
      rx += (tx - rx) * 0.08;
      ry += (ty - ry) * 0.08;
      hero3d.style.transform = `translate(-50%, -50%) rotateX(${ry}deg) rotateY(${rx}deg)`;
      rafId = requestAnimationFrame(update);
    };
    heroStage.addEventListener('mousemove', (e) => {
      const r = heroStage.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width  - 0.5;
      const y = (e.clientY - r.top)  / r.height - 0.5;
      tx = x * 14;       // yaw
      ty = -y * 14;      // pitch
      if (!rafId) rafId = requestAnimationFrame(update);
    });
    heroStage.addEventListener('mouseleave', () => {
      tx = 0; ty = 0;
      setTimeout(() => {
        if (Math.abs(rx) < .2 && Math.abs(ry) < .2) {
          hero3d.style.transform = '';
          if (rafId) { cancelAnimationFrame(rafId); rafId = null; }
        }
      }, 600);
    });
  }

  /* ---------- 3D tilt cards ---------- */
  const tiltCards = $$('.tilt');
  if (!reduceMotion && !matchMedia('(pointer:coarse)').matches) {
    tiltCards.forEach(card => {
      let raf = null;
      const onMove = (e) => {
        const r = card.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width;
        const py = (e.clientY - r.top)  / r.height;
        const rx = (py - 0.5) * -10;
        const ry = (px - 0.5) *  12;
        if (raf) cancelAnimationFrame(raf);
        raf = requestAnimationFrame(() => {
          card.style.transform =
            `translateY(-8px) perspective(900px) rotateX(${rx}deg) rotateY(${ry}deg)`;
        });
      };
      const onLeave = () => {
        if (raf) cancelAnimationFrame(raf);
        card.style.transform = '';
      };
      card.addEventListener('mousemove', onMove);
      card.addEventListener('mouseleave', onLeave);
    });
  }

  /* ---------- background orb parallax ---------- */
  const orbs = $$('.orb');
  if (!reduceMotion) {
    let scrollY = 0, ticking = false;
    window.addEventListener('scroll', () => {
      scrollY = window.scrollY;
      if (!ticking) {
        requestAnimationFrame(() => {
          orbs.forEach((o, i) => {
            const speed = (i + 1) * 0.06;
            o.style.transform = `translateY(${scrollY * speed}px)`;
          });
          ticking = false;
        });
        ticking = true;
      }
    }, { passive: true });
  }

  /* ---------- smooth in-page scroll, accounting for sticky header ---------- */
  $$('a[href^="#"]').forEach(a => {
    a.addEventListener('click', (e) => {
      const href = a.getAttribute('href');
      if (href.length < 2) return;
      const target = document.querySelector(href);
      if (!target) return;
      e.preventDefault();
      const headerH = header.offsetHeight;
      const top = target.getBoundingClientRect().top + window.scrollY - headerH + 1;
      window.scrollTo({ top, behavior: reduceMotion ? 'auto' : 'smooth' });
    });
  });

  /* ---------- contact form -> whatsapp ---------- */
  const form = $('.contact-form');
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const name    = form.querySelector('#f-name').value.trim();
      const phone   = form.querySelector('#f-phone').value.trim();
      const service = form.querySelector('#f-service').value.trim();
      const msg     = form.querySelector('#f-msg').value.trim();

      if (!name || !phone) {
        form.querySelector(name ? '#f-phone' : '#f-name').focus();
        return;
      }

      const text =
        `היי רותי! 👋\n` +
        `שמי: ${name}\n` +
        `טלפון: ${phone}\n` +
        `מעוניינת ב: ${service}` +
        (msg ? `\nהודעה: ${msg}` : '');

      const url = `https://wa.me/972526976172?text=${encodeURIComponent(text)}`;
      window.open(url, '_blank', 'noopener');
    });
  }

  /* ---------- year ---------- */
  const yearEl = $('#year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ---------- marquee duplicate guard (ensure smooth loop on resize) ---------- */
  // Not needed – content is duplicated in markup. Hook left as comment for clarity.

})();
