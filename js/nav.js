/**
 * Functional Infusion — Navigation Module
 * Version: 2.0.0
 *
 * Handles:
 *  - Sticky shadow on scroll
 *  - Mobile hamburger toggle (drawer slide-in)
 *  - Services dropdown (hover + keyboard)
 *  - Active link state by current page
 *  - Body scroll lock when drawer is open
 *  - Escape key to close drawer / dropdown
 */

'use strict';

(function () {
  const nav         = document.querySelector('.site-nav');
  const hamburger   = document.getElementById('nav-hamburger');
  const drawer      = document.getElementById('nav-drawer');
  const dropToggle  = document.querySelector('.nav-dropdown-toggle');
  const dropMenu    = document.querySelector('.nav-dropdown-menu');

  if (!nav) return;

  /* ── Sticky shadow ─────────────────────────────────── */
  const onScroll = () => {
    nav.classList.toggle('scrolled', window.scrollY > 8);
  };
  window.addEventListener('scroll', onScroll, { passive: true });

  /* ── Mobile drawer ─────────────────────────────────── */
  function openDrawer() {
    if (!hamburger || !drawer) return;
    hamburger.setAttribute('aria-expanded', 'true');
    drawer.classList.add('open');
    document.body.classList.add('nav-open');
  }

  function closeDrawer() {
    if (!hamburger || !drawer) return;
    hamburger.setAttribute('aria-expanded', 'false');
    drawer.classList.remove('open');
    document.body.classList.remove('nav-open');
  }

  function toggleDrawer() {
    const isOpen = hamburger?.getAttribute('aria-expanded') === 'true';
    isOpen ? closeDrawer() : openDrawer();
  }

  if (hamburger) {
    hamburger.addEventListener('click', toggleDrawer);
  }

  // Close drawer when a link inside is clicked
  if (drawer) {
    drawer.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', closeDrawer);
    });
  }

  // Close drawer on outside click
  document.addEventListener('click', (e) => {
    if (
      drawer?.classList.contains('open') &&
      !drawer.contains(e.target) &&
      !hamburger?.contains(e.target)
    ) {
      closeDrawer();
    }
  });

  /* ── Services dropdown (keyboard accessible) ───────── */
  if (dropToggle && dropMenu) {
    // Keyboard: toggle on Enter/Space
    dropToggle.addEventListener('click', () => {
      const expanded = dropToggle.getAttribute('aria-expanded') === 'true';
      dropToggle.setAttribute('aria-expanded', String(!expanded));
      dropMenu.classList.toggle('open', !expanded);
    });

    // Close dropdown when focus leaves
    dropMenu.querySelectorAll('a').forEach((link, i, arr) => {
      link.addEventListener('keydown', (e) => {
        if (e.key === 'Tab' && i === arr.length - 1 && !e.shiftKey) {
          dropToggle.setAttribute('aria-expanded', 'false');
          dropMenu.classList.remove('open');
        }
      });
    });
  }

  /* ── Escape key ────────────────────────────────────── */
  document.addEventListener('keydown', (e) => {
    if (e.key !== 'Escape') return;

    if (drawer?.classList.contains('open')) {
      closeDrawer();
      hamburger?.focus();
    }

    if (dropMenu?.classList.contains('open')) {
      dropToggle?.setAttribute('aria-expanded', 'false');
      dropMenu.classList.remove('open');
      dropToggle?.focus();
    }
  });

  /* ── Active nav link by current page ───────────────── */
  const currentFile = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-link, .nav-drawer-link').forEach(link => {
    const href = link.getAttribute('href') || '';
    const linkFile = href.split('/').pop();
    if (linkFile === currentFile || (currentFile === '' && linkFile === 'index.html')) {
      link.setAttribute('aria-current', 'page');
    }
  });

  /* ── Secure external links ─────────────────────────── */
  document.querySelectorAll('a[href^="http"]').forEach(link => {
    try {
      const url = new URL(link.href);
      if (url.hostname !== window.location.hostname) {
        link.setAttribute('rel', 'noopener noreferrer');
        if (!link.getAttribute('target')) {
          link.setAttribute('target', '_blank');
        }
      }
    } catch (_) { /* malformed URL */ }
  });

})();
