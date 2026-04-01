/**
 * FunctionalInfusion — Security Module
 * Version: 1.0.0
 *
 * Defenses implemented:
 *  - Input sanitization (XSS, HTML injection)
 *  - Prompt injection detection (AI/LLM abuse)
 *  - Null-byte / null-root attack prevention
 *  - Rate limiting (client-side guard; enforce server-side too)
 *  - CSRF token generation for forms
 *  - Content validation patterns
 *  - Strict CSP violation logging stub
 *
 * NOTE: Client-side security is a first line of defense only.
 *       All input MUST be validated and sanitized server-side.
 */

'use strict';

const FISecurity = (() => {

  /* ── Constants ─────────────────────────────────────────── */
  const MAX_FIELD_LENGTH = 2048;
  const MAX_MESSAGE_LENGTH = 4096;
  const MAX_EMAIL_LENGTH   = 254;    // RFC 5321
  const RATE_LIMIT_WINDOW  = 60000;  // 1 minute in ms
  const RATE_LIMIT_MAX     = 3;      // max form submissions per window
  const TOKEN_ENTROPY      = 32;     // bytes for CSRF token

  /* ── Submission rate tracker ────────────────────────────── */
  let _submitTimestamps = [];

  /* ── 1. Input Sanitization ──────────────────────────────── */
  /**
   * Strips HTML tags and encodes dangerous characters.
   * Never use innerHTML — always use textContent for user data.
   */
  function sanitizeText(raw) {
    if (typeof raw !== 'string') return '';
    // Null-byte removal (null-root protection)
    let s = raw.replace(/\0/g, '');
    // Enforce length cap early to limit processing cost
    s = s.slice(0, MAX_FIELD_LENGTH);
    // Strip HTML/script tags
    s = s.replace(/<[^>]*>/g, '');
    // Encode remaining angle brackets and quotes
    s = s
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;')
      .replace(/\//g, '&#x2F;');
    return s.trim();
  }

  /**
   * Validate email format strictly.
   * Uses RFC 5322-compatible pattern without eval.
   */
  function validateEmail(email) {
    if (typeof email !== 'string') return false;
    if (email.length > MAX_EMAIL_LENGTH) return false;
    // Null-byte / special char guard
    if (/[\0\r\n]/.test(email)) return false;
    const pattern = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*\.[a-zA-Z]{2,}$/;
    return pattern.test(email);
  }

  /**
   * Validate a US/international phone number (loose, not prescriptive).
   */
  function validatePhone(phone) {
    if (!phone || phone.trim() === '') return true; // optional field
    const digits = phone.replace(/[\s\-().+]/g, '');
    return /^\d{7,15}$/.test(digits);
  }

  /* ── 2. Prompt Injection Detection ─────────────────────── */
  /**
   * Detects common LLM/AI prompt injection patterns in user input.
   * Blocks attempts to hijack AI-powered features or logging.
   *
   * Patterns flagged:
   *  - "ignore previous instructions"
   *  - "system prompt", "you are now", "new role"
   *  - Jailbreak starters: [DAN], [JAILBREAK], /jailbreak
   *  - Injection markup: <<SYS>>, [INST], ###, ----
   */
  const PROMPT_INJECTION_PATTERNS = [
    /ignore\s+(previous|all|prior|above)\s+instructions?/i,
    /system\s*prompt/i,
    /you\s+are\s+now\s+(a|an|the)\s+/i,
    /new\s+(role|persona|instruction)/i,
    /\[\s*(?:DAN|JAILBREAK|ADMIN|ROOT|SYSTEM)\s*\]/i,
    /\/jailbreak/i,
    /<<\s*SYS\s*>>/i,
    /\[INST\]/i,
    /act\s+as\s+(?:if\s+you\s+are|a|an)\s+/i,
    /disregard\s+(?:your|all|any|previous)/i,
    /pretend\s+(?:you\s+are|that\s+you)/i,
    /override\s+(?:your|all|safety|content)/i,
    /\beval\s*\(/i,           // JS injection attempt
    /javascript\s*:/i,        // javascript: URI
    /data\s*:\s*text\/html/i, // data: URI injection
    /on(?:load|error|click|mouse)\s*=/i, // event handler injection
  ];

  function detectPromptInjection(input) {
    if (typeof input !== 'string') return false;
    return PROMPT_INJECTION_PATTERNS.some(p => p.test(input));
  }

  /* ── 3. Null-Root / Path Traversal Prevention ───────────── */
  /**
   * Strips path traversal sequences from any string
   * used in file references or URL parameters.
   */
  function sanitizePath(path) {
    if (typeof path !== 'string') return '';
    return path
      .replace(/\0/g, '')          // null bytes
      .replace(/\.\.\//g, '')       // ../
      .replace(/\.\.\\/g, '')       // ..\
      .replace(/~\//g, '')          // ~/
      .replace(/[<>"|?*]/g, '');    // Windows forbidden chars
  }

  /* ── 4. Rate Limiting ───────────────────────────────────── */
  /**
   * Client-side rate limiting for form submissions.
   * Returns { allowed: bool, remaining: int, resetIn: int (ms) }
   */
  function checkRateLimit() {
    const now = Date.now();
    // Purge timestamps outside the window
    _submitTimestamps = _submitTimestamps.filter(
      ts => now - ts < RATE_LIMIT_WINDOW
    );
    const allowed   = _submitTimestamps.length < RATE_LIMIT_MAX;
    const remaining = Math.max(0, RATE_LIMIT_MAX - _submitTimestamps.length);
    const resetIn   = _submitTimestamps.length > 0
      ? RATE_LIMIT_WINDOW - (now - _submitTimestamps[0])
      : 0;
    return { allowed, remaining, resetIn };
  }

  function recordSubmission() {
    _submitTimestamps.push(Date.now());
  }

  /* ── 5. CSRF Token ──────────────────────────────────────── */
  /**
   * Generates a cryptographically random CSRF token.
   * Attach as a hidden field; verify server-side.
   */
  function generateCSRFToken() {
    const array = new Uint8Array(TOKEN_ENTROPY);
    crypto.getRandomValues(array);
    return Array.from(array)
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
  }

  /**
   * Injects a hidden CSRF token field into a form element.
   */
  function injectCSRFToken(formEl) {
    if (!(formEl instanceof HTMLFormElement)) return;
    let existing = formEl.querySelector('input[name="_csrf"]');
    if (!existing) {
      existing = document.createElement('input');
      existing.type = 'hidden';
      existing.name = '_csrf';
      formEl.appendChild(existing);
    }
    existing.value = generateCSRFToken();
  }

  /* ── 6. Form Validation Engine ──────────────────────────── */
  /**
   * Validates a form field against its constraints.
   * Returns { valid: bool, message: string }
   */
  function validateField(field) {
    const value = field.value;
    const name  = field.name || field.id || 'Field';

    // Required check
    if (field.required && !value.trim()) {
      return { valid: false, message: `${humanName(name)} is required.` };
    }

    // Type-specific validation
    if (value.trim()) {
      if (field.type === 'email' && !validateEmail(value)) {
        return { valid: false, message: 'Please enter a valid email address.' };
      }
      if (field.type === 'tel' && !validatePhone(value)) {
        return { valid: false, message: 'Please enter a valid phone number.' };
      }
      // Max length guard
      const maxLen = field.dataset.type === 'message'
        ? MAX_MESSAGE_LENGTH : MAX_FIELD_LENGTH;
      if (value.length > maxLen) {
        return { valid: false, message: `${humanName(name)} is too long (max ${maxLen} characters).` };
      }
      // Prompt injection check
      if (detectPromptInjection(value)) {
        return { valid: false, message: 'Invalid characters detected in input.' };
      }
    }

    return { valid: true, message: '' };
  }

  /**
   * Runs full form validation. Marks invalid fields with ARIA.
   * Returns true if all fields pass.
   */
  function validateForm(formEl) {
    if (!(formEl instanceof HTMLFormElement)) return false;
    const fields = formEl.querySelectorAll('input, textarea, select');
    let allValid = true;

    fields.forEach(field => {
      if (field.type === 'hidden' || field.type === 'submit') return;
      const { valid, message } = validateField(field);
      setFieldError(field, valid ? '' : message);
      if (!valid) allValid = false;
    });

    return allValid;
  }

  /* ── 7. ARIA Error Marking ──────────────────────────────── */
  function setFieldError(field, message) {
    const errorEl = field.parentElement
      ? field.parentElement.querySelector('.form-error')
      : null;

    if (message) {
      field.setAttribute('aria-invalid', 'true');
      if (errorEl) {
        errorEl.textContent = message;
        errorEl.style.display = 'block';
      }
    } else {
      field.removeAttribute('aria-invalid');
      if (errorEl) {
        errorEl.textContent = '';
        errorEl.style.display = 'none';
      }
    }
  }

  function clearFormErrors(formEl) {
    formEl.querySelectorAll('[aria-invalid]').forEach(f => {
      f.removeAttribute('aria-invalid');
    });
    formEl.querySelectorAll('.form-error').forEach(e => {
      e.textContent = '';
      e.style.display = 'none';
    });
  }

  /* ── 8. Output Encoding ─────────────────────────────────── */
  /**
   * Safely sets text content of an element (never innerHTML).
   */
  function safeSetText(el, text) {
    if (el) el.textContent = String(text);
  }

  /* ── 9. CSP Violation Reporter (stub) ───────────────────── */
  /**
   * Listens for CSP violations and logs them.
   * Wire this to your server's /api/csp-report endpoint.
   */
  function initCSPReporter() {
    document.addEventListener('securitypolicyviolation', (e) => {
      // Do NOT send user data — only policy info
      const report = {
        blockedURI:     e.blockedURI,
        violatedDirective: e.violatedDirective,
        originalPolicy: e.originalPolicy,
        disposition:    e.disposition,
        ts:             Date.now(),
      };
      // TODO: Send to your server's CSP report endpoint
      // fetch('/api/csp-report', { method: 'POST', body: JSON.stringify(report),
      //   headers: { 'Content-Type': 'application/csp-report' } });
      console.warn('[FI Security] CSP violation:', report);
    });
  }

  /* ── 10. Token Budget / Efficiency ─────────────────────── */
  /**
   * Truncates text to a max token estimate before sending to any AI API.
   * Rough estimate: 1 token ≈ 4 chars (English).
   * Prevents runaway token usage.
   */
  function enforceTokenBudget(text, maxTokens = 500) {
    const maxChars = maxTokens * 4;
    if (text.length <= maxChars) return text;
    return text.slice(0, maxChars) + '… [truncated]';
  }

  /* ── Helpers ────────────────────────────────────────────── */
  function humanName(name) {
    return name.replace(/[_-]/g, ' ')
               .replace(/\b\w/g, c => c.toUpperCase());
  }

  /* ── Public API ─────────────────────────────────────────── */
  return {
    sanitizeText,
    validateEmail,
    validatePhone,
    sanitizePath,
    detectPromptInjection,
    checkRateLimit,
    recordSubmission,
    generateCSRFToken,
    injectCSRFToken,
    validateField,
    validateForm,
    setFieldError,
    clearFormErrors,
    safeSetText,
    initCSPReporter,
    enforceTokenBudget,
  };

})();

// Freeze the public API to prevent tampering
Object.freeze(FISecurity);
