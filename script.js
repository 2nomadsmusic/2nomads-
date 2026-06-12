/* =========================================================
   2 NOMADS — interactions
   ========================================================= */

(() => {
  'use strict';

  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isCoarse = window.matchMedia('(hover: none), (pointer: coarse)').matches;

  /* ----------- Custom cursor ----------- */
  if (!isCoarse && !reduced) {
    const cursor = document.querySelector('.cursor');
    const dot = cursor.querySelector('.cursor__dot');
    const ring = cursor.querySelector('.cursor__ring');
    let mx = window.innerWidth / 2, my = window.innerHeight / 2;
    let rx = mx, ry = my;
    let dx = mx, dy = my;

    window.addEventListener('mousemove', (e) => {
      mx = e.clientX; my = e.clientY;
    }, { passive: true });

    const tick = () => {
      // dot follows tightly
      dx += (mx - dx) * 0.55;
      dy += (my - dy) * 0.55;
      // ring lags slightly
      rx += (mx - rx) * 0.18;
      ry += (my - ry) * 0.18;
      dot.style.transform = `translate(${dx}px, ${dy}px) translate(-50%,-50%)`;
      ring.style.transform = `translate(${rx}px, ${ry}px) translate(-50%,-50%)`;
      requestAnimationFrame(tick);
    };
    tick();

    document.querySelectorAll('a, button, .card-music, .card-video, .show, .stat, .contact')
      .forEach(el => {
        el.addEventListener('mouseenter', () => document.body.classList.add('is-hovering'));
        el.addEventListener('mouseleave', () => document.body.classList.remove('is-hovering'));
      });

    // Hide cursor when leaving viewport
    document.addEventListener('mouseleave', () => cursor.style.opacity = '0');
    document.addEventListener('mouseenter', () => cursor.style.opacity = '1');
  } else {
    const c = document.querySelector('.cursor');
    if (c) c.style.display = 'none';
  }

  /* ----------- Hero parallax (mouse) ----------- */
  if (!isCoarse && !reduced) {
    const scope = document.querySelector('[data-parallax-scope]');
    const layers = scope ? scope.querySelectorAll('[data-parallax]') : [];
    if (scope && layers.length) {
      let tx = 0, ty = 0, cx = 0, cy = 0;
      scope.addEventListener('mousemove', (e) => {
        const r = scope.getBoundingClientRect();
        tx = ((e.clientX - r.left) / r.width  - 0.5) * 2;
        ty = ((e.clientY - r.top)  / r.height - 0.5) * 2;
      });
      scope.addEventListener('mouseleave', () => { tx = 0; ty = 0; });

      const animate = () => {
        cx += (tx - cx) * 0.06;
        cy += (ty - cy) * 0.06;
        layers.forEach(l => {
          const f = parseFloat(l.dataset.parallax) || 0;
          l.style.transform = `translate3d(${cx * f}px, ${cy * f * 0.5}px, 0)`;
        });
        requestAnimationFrame(animate);
      };
      animate();
    }
  }

  /* ----------- Reveal on scroll ----------- */
  const revealEls = document.querySelectorAll('[data-reveal]');
  if ('IntersectionObserver' in window && !reduced) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          e.target.classList.add('is-visible');
          io.unobserve(e.target);
        }
      });
    }, { rootMargin: '0px 0px -10% 0px', threshold: 0.05 });
    revealEls.forEach(el => io.observe(el));
  } else {
    revealEls.forEach(el => el.classList.add('is-visible'));
  }

  /* ----------- Counters ----------- */
  const counters = document.querySelectorAll('[data-count]');
  const animateCount = (el) => {
    const target = parseInt(el.dataset.count, 10);
    const dur = 1600;
    const start = performance.now();
    const ease = (t) => 1 - Math.pow(1 - t, 3);
    const step = (now) => {
      const t = Math.min(1, (now - start) / dur);
      el.textContent = Math.floor(ease(t) * target).toLocaleString();
      if (t < 1) requestAnimationFrame(step);
      else el.textContent = target.toLocaleString();
    };
    requestAnimationFrame(step);
  };

  if ('IntersectionObserver' in window && !reduced) {
    const cio = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          animateCount(e.target);
          cio.unobserve(e.target);
        }
      });
    }, { threshold: 0.5 });
    counters.forEach(el => cio.observe(el));
  } else {
    counters.forEach(el => el.textContent = parseInt(el.dataset.count, 10).toLocaleString());
  }

  /* ----------- Live clock (Berlin) ----------- */
  const clockEl = document.getElementById('liveClock');
  if (clockEl) {
    const tick = () => {
      try {
        const now = new Date();
        const fmt = new Intl.DateTimeFormat('en-GB', {
          hour: '2-digit', minute: '2-digit',
          hour12: false, timeZone: 'Europe/Berlin'
        });
        clockEl.textContent = fmt.format(now);
      } catch (_) {
        const d = new Date();
        clockEl.textContent =
          String(d.getHours()).padStart(2,'0') + ':' + String(d.getMinutes()).padStart(2,'0');
      }
    };
    tick();
    setInterval(tick, 30 * 1000);
  }

  /* ----------- Glass: pointer-tracked specular highlight ----------- */
  if (!isCoarse) {
    document.querySelectorAll('.glass').forEach(card => {
      card.addEventListener('pointermove', (e) => {
        const r = card.getBoundingClientRect();
        const x = ((e.clientX - r.left) / r.width) * 100;
        const y = ((e.clientY - r.top) / r.height) * 100;
        card.style.setProperty('--mx', x + '%');
        card.style.setProperty('--my', y + '%');
      });
    });
  }

  /* ----------- Smooth anchor offset ----------- */
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', (e) => {
      const id = a.getAttribute('href');
      if (id.length < 2) return;
      const t = document.querySelector(id);
      if (!t) return;
      e.preventDefault();
      const top = t.getBoundingClientRect().top + window.scrollY - 80;
      window.scrollTo({ top, behavior: reduced ? 'auto' : 'smooth' });
    });
  });

  /* ----------- Open Graph cover loader (any URL) -----------
     Loads only if the local <img src> failed (or src is empty/data URI).
     Tries Microlink first, then falls back to a screenshot service.
  */
  const ogImgs = document.querySelectorAll('img[data-og-cover]');

  const tryOgCover = async (img) => {
    const url = img.dataset.ogCover;
    if (!url) return;
    if (img.dataset.ogTried === '1') return;
    img.dataset.ogTried = '1';

    const candidates = [
      async () => {
        const r = await fetch('https://api.microlink.io/?url=' + encodeURIComponent(url));
        if (!r.ok) return null;
        const j = await r.json();
        return (j && j.data && j.data.image && j.data.image.url) || null;
      },
      async () => 'https://image.thum.io/get/width/1200/' + url,
    ];

    for (const get of candidates) {
      try {
        const cover = await get();
        if (!cover) continue;
        await new Promise((resolve, reject) => {
          const tmp = new Image();
          tmp.onload = () => { img.src = cover; img.classList.add('is-loaded'); resolve(); };
          tmp.onerror = reject;
          tmp.src = cover;
        });
        return;
      } catch (_) { /* try next */ }
    }
  };

  ogImgs.forEach((img) => {
    const localFailed = img.complete && img.naturalWidth === 0;
    const noRealSrc = !img.getAttribute('src') || img.getAttribute('src').startsWith('data:');
    if (localFailed || noRealSrc) {
      tryOgCover(img);
    } else {
      img.addEventListener('error', () => tryOgCover(img), { once: true });
    }
  });

  /* ----------- Spotify oEmbed cover loader ----------- */
  const spotifyImgs = document.querySelectorAll('img[data-spotify-cover]');
  spotifyImgs.forEach(async (img) => {
    const url = img.dataset.spotifyCover;
    if (!url) return;
    try {
      const res = await fetch('https://open.spotify.com/oembed?url=' + encodeURIComponent(url));
      if (!res.ok) return;
      const data = await res.json();
      if (!data.thumbnail_url) return;
      const tmp = new Image();
      tmp.onload = () => {
        img.src = data.thumbnail_url;
        img.classList.add('is-loaded');
      };
      tmp.src = data.thumbnail_url;
    } catch (e) { /* ignore */ }
  });

  /* ----------- Now-playing toggle (visual only) ----------- */
  const npBtn = document.querySelector('.np__btn');
  const npBars = document.querySelector('.np__bars');
  const npDisc = document.querySelector('.np__disc');
  if (npBtn && npBars && npDisc) {
    let playing = true;
    npBtn.addEventListener('click', () => {
      playing = !playing;
      npBars.style.animationPlayState = playing ? 'running' : 'paused';
      npBars.querySelectorAll('span').forEach(s => {
        s.style.animationPlayState = playing ? 'running' : 'paused';
      });
      npDisc.style.animationPlayState = playing ? 'running' : 'paused';
      npBtn.innerHTML = playing
        ? '<svg viewBox="0 0 24 24" width="14" height="14"><rect x="6" y="5" width="4" height="14" rx="1" fill="currentColor"/><rect x="14" y="5" width="4" height="14" rx="1" fill="currentColor"/></svg>'
        : '<svg viewBox="0 0 24 24" width="14" height="14"><path d="M7 5v14l12-7z" fill="currentColor"/></svg>';
    });
  }

})();
