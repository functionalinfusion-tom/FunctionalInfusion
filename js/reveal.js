/**
 * Functional Infusion — Scroll Reveal Module
 * Version: 2.0.0
 *
 * Adds `.visible` to elements with `.reveal` class when
 * they enter the viewport. Respects prefers-reduced-motion.
 *
 * Apply `.reveal` to: section headlines, card grids,
 * pricing tables, process steps, stat grids.
 *
 * Optional stagger via data-delay attribute (ms):
 *   <div class="reveal" data-delay="100">...</div>
 */

'use strict';

(function () {

  /* Respect user motion preference */
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    /* Make everything immediately visible */
    document.querySelectorAll('.reveal').forEach(el => {
      el.classList.add('visible');
    });
    return;
  }

  if (!('IntersectionObserver' in window)) {
    /* Fallback for old browsers */
    document.querySelectorAll('.reveal').forEach(el => {
      el.classList.add('visible');
    });
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;

        const el    = entry.target;
        const delay = parseInt(el.dataset.delay || '0', 10);

        if (delay > 0) {
          setTimeout(() => el.classList.add('visible'), delay);
        } else {
          el.classList.add('visible');
        }

        observer.unobserve(el);
      });
    },
    {
      threshold: 0.12,
      rootMargin: '0px 0px -40px 0px',
    }
  );

  /* Observe on DOMContentLoaded */
  document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
  });

  /* Also observe if called after DOM is ready */
  if (document.readyState !== 'loading') {
    document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
  }

})();
