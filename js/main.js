/* ==========================================================================
   CV web — Laureano Ignacio Muñoz
   Efectos de la página. Sin dependencias; si este archivo no carga,
   el sitio se ve completo igual (solo sin animaciones ni visor).
   ========================================================================== */

(function () {
  'use strict';

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Navegación: sombra al scrollear y barra de progreso ---------- */

  var nav = document.querySelector('.nav');

  function onScroll() {
    var max = document.documentElement.scrollHeight - window.innerHeight;
    var progress = max > 0 ? window.scrollY / max : 0;
    nav.style.setProperty('--progress', progress.toFixed(4));
    nav.classList.toggle('nav--scrolled', window.scrollY > 8);
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll);
  onScroll();

  /* ---------- Menú móvil ---------- */

  var toggle = document.querySelector('.nav__toggle');
  var links = document.querySelectorAll('.nav__links a');

  function setMenu(open) {
    nav.classList.toggle('nav--open', open);
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Cerrar menú' : 'Abrir menú');
  }

  toggle.addEventListener('click', function () {
    setMenu(!nav.classList.contains('nav--open'));
  });

  links.forEach(function (link) {
    link.addEventListener('click', function () {
      setMenu(false);
    });
  });

  document.addEventListener('keydown', function (event) {
    if (event.key === 'Escape' && nav.classList.contains('nav--open')) {
      setMenu(false);
      toggle.focus();
    }
  });

  if (!('IntersectionObserver' in window)) return;

  /* ---------- Link activo según la sección visible ---------- */

  var linkById = {};
  links.forEach(function (link) {
    linkById[link.getAttribute('href').slice(1)] = link;
  });

  var sectionObserver = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      var link = linkById[entry.target.id];
      if (!link) return;
      if (entry.isIntersecting) {
        links.forEach(function (l) { l.removeAttribute('aria-current'); });
        link.setAttribute('aria-current', 'true');
      } else {
        link.removeAttribute('aria-current');
      }
    });
  }, { rootMargin: '-45% 0px -50% 0px' });

  document.querySelectorAll('main section[id]').forEach(function (section) {
    sectionObserver.observe(section);
  });

  /* ---------- Aparición al hacer scroll ---------- */

  // Elementos que aparecen al entrar en pantalla. Los que comparten
  // contenedor (tarjetas, fotos) entran escalonados.
  var REVEAL = [
    '.fact',
    '.section-title',
    '.about__text',
    '.specialty',
    '.job',
    '.viandas__inner > .eyebrow',
    '.viandas__title',
    '.viandas__lead',
    '.viandas__group',
    '.gallery__item',
    '.contact__lead',
    '.contact__item'
  ].join(',');

  if (!reduceMotion) {
    var revealObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var el = entry.target;
        revealObserver.unobserve(el);
        el.classList.add('is-visible');
        // Al terminar, se quita la clase para que vuelvan a regir
        // las transiciones propias del elemento (hover).
        var delay = parseFloat(el.style.getPropertyValue('--delay')) || 0;
        setTimeout(function () {
          el.classList.remove('reveal', 'is-visible');
          el.style.removeProperty('--delay');
        }, delay * 1000 + 950);
      });
    }, { rootMargin: '0px 0px -8% 0px' });

    document.querySelectorAll(REVEAL).forEach(function (el) {
      var siblings = Array.prototype.filter.call(el.parentElement.children, function (child) {
        return child.matches(REVEAL);
      });
      var index = siblings.indexOf(el);
      if (siblings.length > 2 && index > 0) {
        el.style.setProperty('--delay', ((index % 4) * 0.09).toFixed(2) + 's');
      }
      el.classList.add('reveal');
      revealObserver.observe(el);
    });
  }

  /* ---------- Contadores de datos destacados ---------- */

  var counterObserver = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (!entry.isIntersecting) return;
      var el = entry.target;
      counterObserver.unobserve(el);
      if (reduceMotion) return;

      var target = parseInt(el.dataset.count, 10);
      var prefix = el.dataset.prefix || '';
      var duration = 1400;
      var start = null;

      function step(now) {
        if (start === null) start = now;
        var t = Math.min((now - start) / duration, 1);
        var eased = 1 - Math.pow(1 - t, 3);
        el.textContent = prefix + Math.round(eased * target);
        if (t < 1) requestAnimationFrame(step);
      }
      requestAnimationFrame(step);
    });
  }, { threshold: 0.6 });

  document.querySelectorAll('[data-count]').forEach(function (el) {
    counterObserver.observe(el);
  });
})();

/* ---------- Visor de fotos de la galería ---------- */

(function () {
  'use strict';

  var dialog = document.querySelector('.lightbox');
  if (!dialog || typeof dialog.showModal !== 'function') return;

  var img = dialog.querySelector('.lightbox__img');
  var caption = dialog.querySelector('.lightbox__caption');
  var figure = dialog.querySelector('.lightbox__figure');
  var items = Array.prototype.slice.call(document.querySelectorAll('.gallery__link'));
  var current = 0;

  function show(index) {
    current = (index + items.length) % items.length;
    var thumb = items[current].querySelector('img');
    img.src = items[current].getAttribute('href');
    img.alt = thumb.alt;
    caption.textContent = thumb.alt;
    // Reinicia la animación de entrada en cada cambio de foto
    figure.style.animation = 'none';
    void figure.offsetWidth;
    figure.style.animation = '';
  }

  items.forEach(function (link, index) {
    link.addEventListener('click', function (event) {
      event.preventDefault();
      show(index);
      dialog.showModal();
    });
  });

  dialog.querySelector('.lightbox__close').addEventListener('click', function () {
    dialog.close();
  });
  dialog.querySelector('.lightbox__nav--prev').addEventListener('click', function () {
    show(current - 1);
  });
  dialog.querySelector('.lightbox__nav--next').addEventListener('click', function () {
    show(current + 1);
  });

  // Clic fuera de la foto cierra el visor
  dialog.addEventListener('click', function (event) {
    if (event.target === dialog) dialog.close();
  });

  dialog.addEventListener('keydown', function (event) {
    if (event.key === 'ArrowLeft') show(current - 1);
    if (event.key === 'ArrowRight') show(current + 1);
  });

  // Al cerrar, el foco vuelve a la foto que se abrió
  dialog.addEventListener('close', function () {
    items[current].focus();
  });
})();
