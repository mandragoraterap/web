/* Mandrágora Aromaterapia — Interacciones Premium */

document.addEventListener('DOMContentLoaded', () => {
  window.__revealReady = true;
  // Formato de precios: agrega el punto de miles (28000 → 28.000). Si ya lo tiene, lo respeta.
  const formatPrice = (value) => {
    const raw = String(value).trim();
    if (/^\d{4,}$/.test(raw)) return raw.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    return raw;
  };

  // Precios: se editan en precios.js (único archivo a modificar)
  const prices = window.MANDRAGORA_PRECIOS || {};
  document.querySelectorAll('.product-price[data-price-key]').forEach((el) => {
    const key = el.dataset.priceKey;
    if (Object.prototype.hasOwnProperty.call(prices, key)) {
      el.textContent = formatPrice(prices[key]);
    }
  });

  // Header scroll effect
  const header = document.getElementById('header');
  let scrollTicking = false;
  const onScroll = () => {
    if (scrollTicking) return;
    scrollTicking = true;
    requestAnimationFrame(() => {
      header.classList.toggle('scrolled', window.scrollY > 40);
      scrollTicking = false;
    });
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  header.classList.toggle('scrolled', window.scrollY > 40);

  // Estado activo del menú según la sección visible
  const desktopLinks = document.querySelectorAll('.nav-desktop a[href^="#"]');
  const sections = [...desktopLinks]
    .map(link => document.querySelector(link.getAttribute('href')))
    .filter(Boolean);
  const sectionObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      desktopLinks.forEach(link => link.classList.toggle('active', link.getAttribute('href') === '#' + entry.target.id));
    });
  }, { rootMargin: '-35% 0px -55% 0px', threshold: 0 });
  sections.forEach(section => sectionObserver.observe(section));

  // Menú móvil
  const menuToggle = document.getElementById('menuToggle');
  const mobileMenu = document.getElementById('mobileMenu');
  const mobileLinks = document.querySelectorAll('.mobile-link');

  menuToggle.addEventListener('click', () => {
    const isOpen = mobileMenu.classList.toggle('open');
    document.body.style.overflow = isOpen ? 'hidden' : '';
    const spans = menuToggle.querySelectorAll('span');
    if (isOpen) {
      spans[0].style.transform = 'rotate(45deg) translate(5px, 5px)';
      spans[1].style.opacity = '0';
      spans[2].style.transform = 'rotate(-45deg) translate(5px, -5px)';
    } else {
      spans[0].style.transform = '';
      spans[1].style.opacity = '';
      spans[2].style.transform = '';
    }
  });

  mobileLinks.forEach(link => {
    link.addEventListener('click', () => {
      mobileMenu.classList.remove('open');
      document.body.style.overflow = '';
      const spans = menuToggle.querySelectorAll('span');
      spans[0].style.transform = '';
      spans[1].style.opacity = '';
      spans[2].style.transform = '';
    });
  });

  // Reveal animations
  const revealEls = document.querySelectorAll('.reveal');
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.01, rootMargin: '0px 0px 120px 0px' }
  );
  revealEls.forEach(el => observer.observe(el));

  // Estable: todo bloque que ya quedó arriba o dentro de la pantalla se muestra (aunque se haya pasado rápido con el scroll)
  let sweepTicking = false;
  const revealPassed = () => {
    document.querySelectorAll('.reveal:not(.visible)').forEach(el => {
      if (el.getBoundingClientRect().top < window.innerHeight + 120) el.classList.add('visible');
    });
    sweepTicking = false;
  };
  const queueSweep = () => { if (!sweepTicking) { sweepTicking = true; requestAnimationFrame(revealPassed); } };
  window.addEventListener('scroll', queueSweep, { passive: true });
  window.addEventListener('resize', queueSweep);
  window.addEventListener('load', queueSweep);
  queueSweep();

  // Seguro: si por algún motivo un bloque sigue oculto, se muestra igual tras 4 s
  setTimeout(() => {
    document.querySelectorAll('.reveal:not(.visible)').forEach(el => {
      const r = el.getBoundingClientRect();
      if (r.top < window.innerHeight * 1.5) el.classList.add('visible');
    });
  }, 4000);

  // Hero always visible
  document.querySelectorAll('.hero .reveal').forEach(el => el.classList.add('visible'));

  // Smooth scroll
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const targetId = this.getAttribute('href');
      if (targetId === '#' || !targetId) return;
      const target = document.querySelector(targetId);
      if (target) {
        e.preventDefault();
        const offset = 72;
        const top = target.getBoundingClientRect().top + window.pageYOffset - offset;
        window.scrollTo({ top, behavior: 'smooth' });
      }
    });
  });

  // Reintento automático: si una imagen falla por red inestable, se vuelve a pedir (hasta 2 veces)
  document.querySelectorAll('img').forEach((img) => {
    let tries = 0;
    img.addEventListener('error', () => {
      if (tries >= 2) return;
      tries += 1;
      const base = img.getAttribute('src').split('?')[0];
      setTimeout(() => { img.src = base + '?r=' + Date.now(); }, 700 * tries);
    });
  });
});


// Compartir el sitio completo desde el botón del encabezado
document.addEventListener('DOMContentLoaded', () => {
  const btn = document.getElementById('shareBtn');
  const toast = document.getElementById('shareToast');
  if (!btn) return;

  let toastTimer;
  const showToast = (msg) => {
    if (!toast) return;
    toast.textContent = msg;
    toast.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove('show'), 2200);
  };

  const copyLink = async (url) => {
    try {
      await navigator.clipboard.writeText(url);
      return true;
    } catch (e) {
      try {
        const ta = document.createElement('textarea');
        ta.value = url;
        ta.setAttribute('readonly', '');
        ta.style.cssText = 'position:fixed;top:0;left:0;opacity:0';
        document.body.appendChild(ta);
        ta.select();
        const ok = document.execCommand('copy');
        document.body.removeChild(ta);
        return ok;
      } catch (e2) {
        return false;
      }
    }
  };

  btn.addEventListener('click', async () => {
    const url = window.location.href.split('#')[0];
    const data = {
      title: 'Mandrágora Aromaterapia',
      text: 'Mandrágora Aromaterapia — Aromas con sentido',
      url
    };
    if (navigator.share) {
      try {
        await navigator.share(data);
        return;
      } catch (e) {
        if (e && e.name === 'AbortError') return; // la persona cerró el panel
      }
    }
    const ok = await copyLink(url);
    showToast(ok ? 'Enlace copiado' : 'Copiá este enlace: ' + url);
  });
});


// Desplazamiento suave de las imágenes al deslizar la página (efecto parallax)
document.addEventListener('DOMContentLoaded', () => {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  if (!window.CSS || !CSS.supports('translate', '0 1px')) return;

  const selector = '.product-card, .brumas-feature, .spray-feature, .rollon-feature, .catalog-cover, .visual-card, .armonizacion-visual';
  const skip = '.logo-img, .mobile-logo, .footer-logo, .hero-logo';
  const targets = new Map(); // elemento -> { k, y }
  let cardIndex = 0;

  document.querySelectorAll('img').forEach((img) => {
    if (img.matches(skip)) return;
    const el = img.closest(selector);
    if (!el || targets.has(el)) return;
    // Las tarjetas alternan intensidad (efecto escalonado); los marcos grandes se mueven un poco más
    const k = el.matches('.product-card, .visual-card') ? (cardIndex++ % 2 ? 12 : 24) : 30;
    targets.set(el, { k, y: 0 });
    el.classList.add('px-item');
  });
  if (!targets.size) return;

  const visible = new Set();
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting) { visible.add(e.target); e.target.classList.add('px-active'); }
      else { visible.delete(e.target); e.target.classList.remove('px-active'); }
    });
    queue();
  }, { rootMargin: '200px 0px' });
  targets.forEach((_, el) => io.observe(el));

  let ticking = false;
  const update = () => {
    ticking = false;
    const vh = window.innerHeight;
    visible.forEach((el) => {
      const t = targets.get(el);
      const r = el.getBoundingClientRect();
      const center = r.top - t.y + r.height / 2; // posición sin el desplazamiento ya aplicado
      const o = Math.max(-1, Math.min(1, (center - vh / 2) / vh));
      const y = Math.round(o * t.k * 10) / 10;
      if (y !== t.y) { t.y = y; el.style.translate = '0 ' + y + 'px'; }
    });
  };
  function queue() { if (!ticking) { ticking = true; requestAnimationFrame(update); } }
  window.addEventListener('scroll', queue, { passive: true });
  window.addEventListener('resize', queue);
  window.addEventListener('load', queue);
  queue();
});


// Botón carrito junto a cada precio: suma unidades y muestra la cantidad en el globito
document.addEventListener('DOMContentLoaded', () => {
  const buttons = document.querySelectorAll('.btn-cart');
  if (!buttons.length) return;
  const toast = document.getElementById('shareToast');
  let toastTimer;
  const showToast = (msg) => {
    if (!toast) return;
    toast.textContent = msg;
    toast.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove('show'), 1800);
  };

  const STORE = 'mandragora_carrito';
  let cart = {};
  try { cart = JSON.parse(localStorage.getItem(STORE) || '{}') || {}; } catch (e) { cart = {}; }
  const save = () => { try { localStorage.setItem(STORE, JSON.stringify(cart)); } catch (e) {} };

  const render = (btn, qty) => {
    const badge = btn.querySelector('.cart-badge');
    badge.textContent = qty > 99 ? '99+' : qty;
    btn.classList.toggle('has-items', qty > 0);
    btn.setAttribute('aria-label', qty > 0 ? 'En el carrito: ' + qty + '. Agregar otro' : 'Agregar al carrito');
  };

  buttons.forEach((btn) => {
    const priceEl = btn.closest('.product-footer')?.querySelector('.product-price');
    const key = priceEl?.dataset.priceKey;
    if (!key) return;
    const card = btn.closest('.product-card');
    const name = (card?.querySelector('.product-name')?.textContent || 'Ungüentos naturales').trim();
    render(btn, cart[key] || 0);

    btn.addEventListener('click', (e) => {
      e.preventDefault();
      cart[key] = (cart[key] || 0) + 1;
      save();
      render(btn, cart[key]);
      btn.classList.remove('bump');
      void btn.offsetWidth;
      btn.classList.add('bump');
      setTimeout(() => btn.classList.remove('bump'), 800);
      if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        const plus = document.createElement('span');
        plus.className = 'cart-plus';
        plus.textContent = '+1';
        btn.appendChild(plus);
        setTimeout(() => plus.remove(), 950);
        for (let i = 0; i < 7; i++) {
          const a = (Math.PI * 2 * i) / 7 + Math.random() * .5;
          const d = 24 + Math.random() * 12;
          const sp = document.createElement('i');
          sp.className = 'cart-spark';
          sp.style.setProperty('--tx', Math.cos(a) * d + 'px');
          sp.style.setProperty('--ty', Math.sin(a) * d + 'px');
          btn.appendChild(sp);
          setTimeout(() => sp.remove(), 750);
        }
      }
      showToast(name + ' agregado al carrito');
    });
  });
});


// Visor de imagen ampliada (estilo marketplace): tocar la imagen → se agranda; X arriba a la izquierda → vuelve al mismo lugar
document.addEventListener('DOMContentLoaded', () => {
  const box = document.getElementById('lightbox');
  const stage = document.getElementById('lightboxStage');
  const big = document.getElementById('lightboxImg');
  const closeBtn = document.getElementById('lightboxClose');
  const triggers = document.querySelectorAll('[data-lightbox]');
  if (!box || !stage || !big || !closeBtn || !triggers.length) return;

  const MAX = 4, TAP_ZOOM = 2.5;
  let isOpen = false, trigger = null, savedY = 0, pushed = false;
  let s = 1, x = 0, y = 0;
  const pts = new Map();
  let startDist = 0, startScale = 1, moved = false, downX = 0, downY = 0, downTarget = null;

  const apply = (smooth) => {
    big.style.transition = smooth ? 'transform .25s ease, opacity .28s ease' : 'opacity .28s ease';
    big.style.transform = 'translate(' + x + 'px,' + y + 'px) scale(' + s + ')';
    stage.classList.toggle('zoomed', s > 1);
    box.classList.toggle('is-zoomed', s > 1);
  };
  const clamp = () => {
    const maxX = Math.max(0, (big.offsetWidth * s - stage.clientWidth) / 2);
    const maxY = Math.max(0, (big.offsetHeight * s - stage.clientHeight) / 2);
    x = Math.max(-maxX, Math.min(maxX, x));
    y = Math.max(-maxY, Math.min(maxY, y));
  };
  // zoom manteniendo fijo el punto (px, py) de la pantalla
  const zoomAt = (px, py, ns) => {
    const r = stage.getBoundingClientRect();
    const cx = px - (r.left + r.width / 2), cy = py - (r.top + r.height / 2);
    ns = Math.max(1, Math.min(MAX, ns));
    x = cx - (cx - x) * (ns / s);
    y = cy - (cy - y) * (ns / s);
    s = ns;
    if (s === 1) { x = 0; y = 0; }
    clamp();
  };

  const open = (el) => {
    const img = el.matches('img') ? el : el.querySelector('img');
    if (!img || isOpen) return;
    trigger = el;
    savedY = window.scrollY;
    big.src = img.currentSrc || img.src;
    big.alt = img.alt || '';
    s = 1; x = 0; y = 0;
    box.classList.remove('is-zoomed');
    box.hidden = false;
    document.documentElement.style.overflow = 'hidden';
    isOpen = true;
    big.style.transform = 'scale(.96)';
    requestAnimationFrame(() => requestAnimationFrame(() => {
      box.classList.add('open');
      apply(false);
    }));
    try { history.pushState({ lightbox: true }, ''); pushed = true; } catch (e) { pushed = false; }
    closeBtn.focus({ preventScroll: true });
  };

  const finish = () => {
    if (!isOpen) return;
    isOpen = false;
    box.classList.remove('open');
    document.documentElement.style.overflow = '';
    setTimeout(() => { if (!isOpen) { box.hidden = true; big.removeAttribute('src'); } }, 300);
    window.scrollTo(0, savedY); // vuelve exactamente al mismo lugar
    if (trigger) trigger.focus({ preventScroll: true });
  };
  const close = () => {
    if (!isOpen) return;
    if (pushed) { pushed = false; try { history.back(); } catch (e) {} } // popstate llama a finish()
    finish();
  };

  window.addEventListener('popstate', () => { pushed = false; finish(); });
  document.addEventListener('keydown', (e) => {
    if (!isOpen) return;
    if (e.key === 'Escape') close();
  });

  triggers.forEach((el) => {
    el.addEventListener('click', () => open(el));
    el.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open(el); }
    });
  });
  closeBtn.addEventListener('click', close);

  // Gestos: tocar = acercar/alejar, arrastrar = mover, pellizcar = zoom, rueda del mouse = zoom
  const dist = () => { const [a, b] = [...pts.values()]; return Math.hypot(a.x - b.x, a.y - b.y) || 1; };
  stage.addEventListener('pointerdown', (e) => {
    stage.setPointerCapture(e.pointerId);
    pts.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (pts.size === 1) { downX = e.clientX; downY = e.clientY; moved = false; downTarget = e.target; }
    if (pts.size === 2) { startDist = dist(); startScale = s; moved = true; }
  });
  stage.addEventListener('pointermove', (e) => {
    const p = pts.get(e.pointerId);
    if (!p) return;
    const dx = e.clientX - p.x, dy = e.clientY - p.y;
    p.x = e.clientX; p.y = e.clientY;
    if (pts.size === 2) {
      const [a, b] = [...pts.values()];
      zoomAt((a.x + b.x) / 2, (a.y + b.y) / 2, startScale * dist() / startDist);
      apply(false);
    } else if (pts.size === 1) {
      if (Math.hypot(e.clientX - downX, e.clientY - downY) > 6) moved = true;
      if (s > 1 && moved) {
        x += dx; y += dy; clamp(); apply(false);
        stage.classList.add('dragging');
      }
    }
  });
  const endPointer = (e) => {
    if (!pts.has(e.pointerId)) return;
    pts.delete(e.pointerId);
    stage.classList.remove('dragging');
    if (pts.size === 0 && !moved && e.type === 'pointerup') {
      if (downTarget === big) {
        zoomAt(e.clientX, e.clientY, s > 1 ? 1 : TAP_ZOOM);
        apply(true);
      } else if (s === 1) {
        close(); // tocar el fondo oscuro también cierra
      }
    }
  };
  stage.addEventListener('pointerup', endPointer);
  stage.addEventListener('pointercancel', endPointer);
  stage.addEventListener('wheel', (e) => {
    e.preventDefault();
    zoomAt(e.clientX, e.clientY, s * (e.deltaY < 0 ? 1.15 : 1 / 1.15));
    apply(false);
  }, { passive: false });
  window.addEventListener('resize', () => { if (isOpen) { clamp(); apply(false); } });
});



// ============================================================
// EFECTOS NUEVOS + CARGA ROBUSTA DE IMÁGENES
// ============================================================
document.addEventListener('DOMContentLoaded', () => {
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

  // --- Imágenes: si una falla, reintenta; mientras carga muestra un brillo suave ---
  document.querySelectorAll('img').forEach((img) => {
    if (img.id === 'lightboxImg') return;
    const host = img.closest('.product-image-wrap, .zoom-wrap, .spray-feature-inner, .catalog-cover, .visual-card, .armonizacion-visual') || img.parentElement;
    let tries = 0;
    const done = () => { host && host.classList.remove('img-pending'); };
    if (!img.complete || img.naturalWidth === 0) {
      host && host.classList.add('img-pending');
      img.addEventListener('load', done, { once: true });
    }
    img.addEventListener('error', () => {
      if (tries++ < 2) {
        const base = img.src.split('&r=')[0].split('?r=')[0];
        setTimeout(() => { img.src = base + (base.includes('?') ? '&' : '?') + 'r=' + Date.now(); }, 900 * tries);
      } else { done(); }
    });
  });

  // --- Barra de progreso + botón volver arriba (un solo listener de scroll) ---
  const bar = document.getElementById('scrollProgress');
  const toTop = document.getElementById('toTop');
  let pTick = false;
  const updateProgress = () => {
    pTick = false;
    const max = document.documentElement.scrollHeight - window.innerHeight;
    const p = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0;
    if (bar) bar.style.transform = 'scaleX(' + p.toFixed(4) + ')';
    if (toTop) {
      toTop.style.setProperty('--p', (p * 100).toFixed(1));
      toTop.classList.toggle('show', window.scrollY > 700);
    }
  };
  const queueProgress = () => { if (!pTick) { pTick = true; requestAnimationFrame(updateProgress); } };
  window.addEventListener('scroll', queueProgress, { passive: true });
  window.addEventListener('resize', queueProgress);
  window.addEventListener('load', queueProgress);
  updateProgress();
  if (toTop) toTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' }));

  // --- Ondas al tocar botones (sin tapar el globito del carrito) ---
  document.querySelectorAll('.btn, .btn-product').forEach((el) => {
    el.classList.add('ripple-host');
    el.addEventListener('pointerdown', (e) => {
      if (reduce) return;
      const r = el.getBoundingClientRect();
      const size = Math.max(r.width, r.height) * 2;
      const dot = document.createElement('span');
      dot.className = 'ripple';
      dot.style.cssText = 'width:' + size + 'px;height:' + size + 'px;left:' + (e.clientX - r.left - size / 2) + 'px;top:' + (e.clientY - r.top - size / 2) + 'px';
      el.appendChild(dot);
      setTimeout(() => dot.remove(), 650);
    });
  });

  if (reduce) return;

  // --- Partículas doradas en el inicio (se pausan cuando el inicio no se ve) ---
  const hero = document.querySelector('.hero');
  if (hero) {
    const wrap = document.createElement('div');
    wrap.className = 'hero-particles';
    wrap.setAttribute('aria-hidden', 'true');
    const n = window.innerWidth < 700 ? 9 : 16;
    for (let i = 0; i < n; i++) {
      const s = document.createElement('span');
      s.style.cssText = '--s:' + (3 + Math.random() * 4).toFixed(1) + 'px;left:' + (Math.random() * 100).toFixed(1) + '%;--d:' + (10 + Math.random() * 9).toFixed(1) + 's;--w:-' + (Math.random() * 14).toFixed(1) + 's;--x:' + (Math.round(Math.random() * 50) - 25) + 'px';
      wrap.appendChild(s);
    }
    hero.insertBefore(wrap, hero.firstChild);
    new IntersectionObserver((en) => en.forEach((e) => wrap.classList.toggle('paused', !e.isIntersecting))).observe(hero);
  }

  if (!finePointer) return;

  // --- Luz dorada que sigue al cursor ---
  const glow = document.getElementById('cursorGlow');
  if (glow) {
    let gx = 0, gy = 0, gTick = false;
    window.addEventListener('pointermove', (e) => {
      if (e.pointerType !== 'mouse') return;
      gx = e.clientX; gy = e.clientY;
      glow.classList.add('on');
      if (!gTick) { gTick = true; requestAnimationFrame(() => { glow.style.transform = 'translate3d(' + gx + 'px,' + gy + 'px,0)'; gTick = false; }); }
    }, { passive: true });
    document.addEventListener('mouseleave', () => glow.classList.remove('on'));
  }

  // --- Tarjetas: inclinación 3D suave + reflejo ---
  document.querySelectorAll('.product-card').forEach((card) => {
    let tick = false, ev = null;
    card.addEventListener('pointerenter', (e) => {
      if (e.pointerType !== 'mouse') return;
      card.style.transition = 'transform .12s ease-out, box-shadow .4s ease, border-color .4s ease';
      card.classList.add('tilting');
    });
    card.addEventListener('pointermove', (e) => {
      if (e.pointerType !== 'mouse') return;
      ev = e;
      if (tick) return;
      tick = true;
      requestAnimationFrame(() => {
        tick = false;
        const r = card.getBoundingClientRect();
        const px = (ev.clientX - r.left) / r.width, py = (ev.clientY - r.top) / r.height;
        card.style.transform = 'perspective(900px) rotateX(' + ((.5 - py) * 7).toFixed(2) + 'deg) rotateY(' + ((px - .5) * 8).toFixed(2) + 'deg) translateY(-8px) scale(1.012)';
        card.style.setProperty('--gx', (px * 100).toFixed(1) + '%');
        card.style.setProperty('--gy', (py * 100).toFixed(1) + '%');
      });
    });
    card.addEventListener('pointerleave', () => {
      card.classList.remove('tilting');
      card.style.transform = '';
      card.style.transition = '';
    });
  });
});


// Carritos: se animan solo mientras están a la vista (cada uno con su propio ritmo)
document.addEventListener('DOMContentLoaded', () => {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const carts = document.querySelectorAll('.btn-cart');
  if (!carts.length || !('IntersectionObserver' in window)) return;
  carts.forEach((b) => b.style.setProperty('--cd', (-Math.random() * 4.4).toFixed(2) + 's'));
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => e.target.classList.toggle('cart-live', e.isIntersecting));
  }, { rootMargin: '60px 0px' });
  carts.forEach((b) => io.observe(b));
});
