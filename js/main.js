/**
 * FunctionalInfusion — Main Application Module
 * Version: 1.0.0
 *
 * Responsibilities:
 *  - Navigation: responsive hamburger, active state, scroll behavior
 *  - Contact form: validated, rate-limited, CSRF-protected
 *  - FAQ accordion (ARIA-compliant)
 *  - Scroll animations (IntersectionObserver)
 *  - No eval(), no innerHTML with user input, no CDN dependencies
 */

'use strict';

/* ── Wait for DOM ─────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  FIApp.init();
});

const FIApp = (() => {

  /* ── 1. Navigation ────────────────────────────────────────── */
  function initNav() {
    const toggle  = document.getElementById('nav-toggle');
    const navMenu = document.getElementById('nav-menu');
    if (!toggle || !navMenu) return;

    // Open / close mobile menu
    toggle.addEventListener('click', () => {
      const expanded = toggle.getAttribute('aria-expanded') === 'true';
      toggle.setAttribute('aria-expanded', String(!expanded));
      navMenu.classList.toggle('open');
      // Trap scroll when menu is open on mobile
      document.body.style.overflow = !expanded ? 'hidden' : '';
    });

    // Close on nav link click (SPA-style feel)
    navMenu.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        toggle.setAttribute('aria-expanded', 'false');
        navMenu.classList.remove('open');
        document.body.style.overflow = '';
      });
    });

    // Close on outside click
    document.addEventListener('click', (e) => {
      if (!toggle.contains(e.target) && !navMenu.contains(e.target)) {
        toggle.setAttribute('aria-expanded', 'false');
        navMenu.classList.remove('open');
        document.body.style.overflow = '';
      }
    });

    // Close on Escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && navMenu.classList.contains('open')) {
        toggle.setAttribute('aria-expanded', 'false');
        navMenu.classList.remove('open');
        document.body.style.overflow = '';
        toggle.focus();
      }
    });

    // Scroll shadow
    const nav = document.querySelector('.site-nav');
    if (nav) {
      const onScroll = () => {
        nav.style.boxShadow = window.scrollY > 10
          ? 'var(--shadow-md)'
          : 'var(--shadow-sm)';
      };
      window.addEventListener('scroll', onScroll, { passive: true });
    }
  }

  /* ── 2. Active Nav Link ───────────────────────────────────── */
  function markActiveNavLink() {
    const currentPath = window.location.pathname.split('/').pop() || 'index.html';
    document.querySelectorAll('.nav-links a').forEach(link => {
      const href = link.getAttribute('href') || '';
      const isActive = href === currentPath ||
        (currentPath === '' && href === 'index.html');
      if (isActive) {
        link.setAttribute('aria-current', 'page');
      } else {
        link.removeAttribute('aria-current');
      }
    });
  }

  /* ── 3. Contact Form ──────────────────────────────────────── */
  function initContactForm() {
    const form = document.getElementById('contact-form');
    if (!form) return;

    // Inject CSRF token
    FISecurity.injectCSRFToken(form);

    // Initialize CSP reporter
    FISecurity.initCSPReporter();

    // Live validation on blur
    form.querySelectorAll('input, textarea, select').forEach(field => {
      if (field.type === 'hidden' || field.type === 'submit') return;
      field.addEventListener('blur', () => {
        const { valid, message } = FISecurity.validateField(field);
        FISecurity.setFieldError(field, valid ? '' : message);
      });
      field.addEventListener('input', () => {
        if (field.getAttribute('aria-invalid') === 'true') {
          const { valid, message } = FISecurity.validateField(field);
          FISecurity.setFieldError(field, valid ? '' : message);
        }
      });
    });

    // Submit handler
    form.addEventListener('submit', (e) => {
      e.preventDefault();

      const successEl = document.getElementById('form-success');
      const errorEl   = document.getElementById('form-error');
      const submitBtn = form.querySelector('[type="submit"]');

      // Rate limit check
      const { allowed, resetIn } = FISecurity.checkRateLimit();
      if (!allowed) {
        const secs = Math.ceil(resetIn / 1000);
        showAlert(errorEl, `Too many submissions. Please wait ${secs}s before trying again.`);
        return;
      }

      // Validate all fields
      const isValid = FISecurity.validateForm(form);
      if (!isValid) {
        // Focus first invalid field
        const firstInvalid = form.querySelector('[aria-invalid="true"]');
        if (firstInvalid) firstInvalid.focus();
        return;
      }

      // Disable submit to prevent double-send
      submitBtn.disabled = true;
      submitBtn.textContent = 'Sending…';

      // Record rate-limit timestamp
      FISecurity.recordSubmission();

      // Collect and sanitize form data
      const data = {};
      new FormData(form).forEach((val, key) => {
        // Skip CSRF — it's already in the header
        if (key === '_csrf') { data[key] = val; return; }
        data[key] = FISecurity.sanitizeText(String(val));
        // Extra: check each field for prompt injection
        if (FISecurity.detectPromptInjection(String(val))) {
          showAlert(errorEl, 'Invalid content detected. Please revise your message.');
          submitBtn.disabled = false;
          submitBtn.textContent = 'Send Message';
          return;
        }
      });

      // Simulate API call — replace with real fetch() to your backend
      submitToServer(data)
        .then(() => {
          hideAlert(errorEl);
          showAlert(successEl, "Thank you! We'll be in touch within 1 business day.");
          form.reset();
          FISecurity.clearFormErrors(form);
          FISecurity.injectCSRFToken(form); // rotate token
        })
        .catch(() => {
          showAlert(errorEl, 'Something went wrong. Please try again or call us directly.');
        })
        .finally(() => {
          submitBtn.disabled = false;
          submitBtn.textContent = 'Send Message';
        });
    });
  }

  /**
   * Sends sanitized form data to the server.
   * Replace the setTimeout stub with a real fetch() call.
   */
  function submitToServer(data) {
    // PRODUCTION: Replace with your endpoint
    // return fetch('/api/contact', {
    //   method: 'POST',
    //   headers: {
    //     'Content-Type': 'application/json',
    //     'X-CSRF-Token': data._csrf,
    //   },
    //   body: JSON.stringify(data),
    //   credentials: 'same-origin',
    // }).then(r => { if (!r.ok) throw new Error('Server error'); });

    // Development stub
    return new Promise((resolve) => setTimeout(resolve, 800));
  }

  /* ── 4. Alert Helpers ─────────────────────────────────────── */
  function showAlert(el, msg) {
    if (!el) return;
    FISecurity.safeSetText(el, msg); // never innerHTML
    el.removeAttribute('hidden');
    el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  function hideAlert(el) {
    if (!el) return;
    el.setAttribute('hidden', '');
    el.textContent = '';
  }

  /* ── 5. FAQ Accordion ─────────────────────────────────────── */
  function initFAQ() {
    document.querySelectorAll('.faq-question').forEach(btn => {
      btn.addEventListener('click', () => {
        const expanded = btn.getAttribute('aria-expanded') === 'true';
        const answer   = document.getElementById(btn.getAttribute('aria-controls'));
        if (!answer) return;

        // Close all others
        document.querySelectorAll('.faq-question').forEach(other => {
          if (other !== btn) {
            other.setAttribute('aria-expanded', 'false');
            const otherAnswer = document.getElementById(other.getAttribute('aria-controls'));
            if (otherAnswer) otherAnswer.classList.remove('open');
          }
        });

        btn.setAttribute('aria-expanded', String(!expanded));
        answer.classList.toggle('open', !expanded);
      });
    });
  }

  /* ── 6. Scroll Animations ─────────────────────────────────── */
  function initScrollAnimations() {
    // Respect reduced-motion preference
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    if (!('IntersectionObserver' in window)) return;

    const style = document.createElement('style');
    style.textContent = `
      .animate-in { opacity: 0; transform: translateY(24px);
        transition: opacity 0.5s ease, transform 0.5s ease; }
      .animate-in.visible { opacity: 1; transform: none; }
    `;
    document.head.appendChild(style);

    const targets = document.querySelectorAll(
      '.card, .section-header, .step, .value-item, .team-card, .benefit-card, .stat-card'
    );
    targets.forEach((el, i) => {
      el.classList.add('animate-in');
      el.style.transitionDelay = `${(i % 4) * 80}ms`;
    });

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });

    targets.forEach(el => observer.observe(el));
  }

  /* ── 7. Counter Animation ─────────────────────────────────── */
  function initCounters() {
    if (!('IntersectionObserver' in window)) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const counters = document.querySelectorAll('[data-count]');
    if (!counters.length) return;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        const el  = entry.target;
        const end = parseInt(el.dataset.count, 10);
        const dur = 1500;
        const step = Math.max(1, Math.floor(end / (dur / 16)));
        let current = 0;
        const tick = () => {
          current = Math.min(current + step, end);
          FISecurity.safeSetText(el, current.toLocaleString());
          if (current < end) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
        observer.unobserve(el);
      });
    }, { threshold: 0.5 });

    counters.forEach(c => observer.observe(c));
  }

  /* ── 8. External Link Safety ──────────────────────────────── */
  function secureExternalLinks() {
    document.querySelectorAll('a[href^="http"]').forEach(link => {
      try {
        const url = new URL(link.href);
        if (url.hostname !== window.location.hostname) {
          // Prevent tab-napping
          link.setAttribute('rel', 'noopener noreferrer');
          if (!link.getAttribute('aria-label')) {
            link.setAttribute('aria-label',
              `${link.textContent.trim()} (opens in new tab)`);
          }
        }
      } catch (_) { /* malformed URL — ignore */ }
    });
  }

  /* ── Public Init ──────────────────────────────────────────── */
  function init() {
    initNav();
    markActiveNavLink();
    initContactForm();
    initFAQ();
    initScrollAnimations();
    initCounters();
    secureExternalLinks();
  }

  return { init };

})();
