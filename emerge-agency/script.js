/**
 * EMERG The Studio — script.js
 * Vanilla ES6+ JavaScript
 * Features: Theme Toggle, Scroll Effects, Nav Highlighting,
 *           IntersectionObserver Reveals, Portfolio Filter,
 *           Lightbox Modal, Form Validation
 */

'use strict';

/* ============================================================
   THEME SWITCHER
   ============================================================ */
const themeToggle = document.getElementById('themeToggle');
const html        = document.documentElement;

function getStoredTheme() {
  return localStorage.getItem('emerg-theme') || 'light';
}

function applyTheme(theme) {
  html.setAttribute('data-theme', theme);
  localStorage.setItem('emerg-theme', theme);

  const isDark = theme === 'dark';
  themeToggle.setAttribute(
    'aria-label',
    isDark ? 'Switch to light mode' : 'Switch to dark mode'
  );
}

// Apply on page load
applyTheme(getStoredTheme());

themeToggle.addEventListener('click', () => {
  const current = html.getAttribute('data-theme');
  applyTheme(current === 'dark' ? 'light' : 'dark');
});


/* ============================================================
   NAVBAR — SCROLL SHADOW & ACTIVE LINK HIGHLIGHTING
   ============================================================ */
const navbar   = document.getElementById('navbar');
const navLinks = document.querySelectorAll('.nav-link[data-section]');

// Scroll shadow
window.addEventListener('scroll', () => {
  navbar.classList.toggle('scrolled', window.scrollY > 20);
}, { passive: true });

// Active nav link tracking via IntersectionObserver
const sections = document.querySelectorAll('section[id]');

const navObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const id = entry.target.id;
      navLinks.forEach(link => {
        const isActive = link.dataset.section === id;
        link.classList.toggle('active', isActive);
      });
    }
  });
}, {
  rootMargin: '-40% 0px -55% 0px',
  threshold: 0,
});

sections.forEach(section => navObserver.observe(section));


/* ============================================================
   MOBILE NAV HAMBURGER
   ============================================================ */
const hamburger = document.getElementById('hamburger');
const mobileNav = document.getElementById('mobileNav');
const mobileNavLinks = document.querySelectorAll('.mobile-nav-link, #mobileNav .btn');

function openMobileNav() {
  hamburger.classList.add('open');
  mobileNav.classList.add('open');
  hamburger.setAttribute('aria-expanded', 'true');
  document.body.style.overflow = 'hidden';
}

function closeMobileNav() {
  hamburger.classList.remove('open');
  mobileNav.classList.remove('open');
  hamburger.setAttribute('aria-expanded', 'false');
  document.body.style.overflow = '';
}

hamburger.addEventListener('click', () => {
  const isOpen = mobileNav.classList.contains('open');
  isOpen ? closeMobileNav() : openMobileNav();
});

// Close on link click
mobileNavLinks.forEach(link => {
  link.addEventListener('click', closeMobileNav);
});

// Close on outside click
document.addEventListener('click', (e) => {
  if (
    mobileNav.classList.contains('open') &&
    !mobileNav.contains(e.target) &&
    !hamburger.contains(e.target)
  ) {
    closeMobileNav();
  }
});

// Close on Escape
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    if (mobileNav.classList.contains('open')) closeMobileNav();
    if (lightboxOverlay.getAttribute('aria-hidden') !== 'true') closeLightbox();
  }
});


/* ============================================================
   INTERSECTION OBSERVER — REVEAL ANIMATIONS
   ============================================================ */
const revealElements = document.querySelectorAll('.reveal');

const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      revealObserver.unobserve(entry.target); // fire once
    }
  });
}, {
  threshold: 0.12,
  rootMargin: '0px 0px -40px 0px',
});

revealElements.forEach(el => revealObserver.observe(el));


/* ============================================================
   PORTFOLIO — CATEGORY FILTER
   ============================================================ */
const filterBtns   = document.querySelectorAll('.filter-btn');
const projectCards = document.querySelectorAll('.project-card');

filterBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    const filter = btn.dataset.filter;

    // Update active state + ARIA
    filterBtns.forEach(b => {
      b.classList.remove('active');
      b.setAttribute('aria-pressed', 'false');
    });
    btn.classList.add('active');
    btn.setAttribute('aria-pressed', 'true');

    // Filter cards
    projectCards.forEach(card => {
      const category = card.dataset.category;
      const show = filter === 'all' || category === filter;

      if (show) {
        card.classList.remove('hidden');
        // Re-trigger reveal animation
        card.classList.remove('visible');
        setTimeout(() => card.classList.add('visible'), 10);
      } else {
        card.classList.add('hidden');
      }
    });
  });
});


/* ============================================================
   LIGHTBOX MODAL
   ============================================================ */
const lightboxOverlay  = document.getElementById('lightboxOverlay');
const lightboxClose    = document.getElementById('lightboxClose');
const lightboxImg      = document.getElementById('lightboxImg');
const lightboxCategory = document.getElementById('lightboxCategory');
const lightboxTitle    = document.getElementById('lightboxTitle');
const lightboxDesc     = document.getElementById('lightboxDesc');
const lightboxResults  = document.getElementById('lightboxResults');

let previouslyFocused = null;

function openLightbox(card) {
  previouslyFocused = document.activeElement;

  const title    = card.dataset.title;
  const desc     = card.dataset.desc;
  const results  = JSON.parse(card.dataset.results || '[]');
  const img      = card.dataset.img;
  const category = card.querySelector('.project-tag').textContent.trim();

  lightboxImg.src          = img;
  lightboxImg.alt          = title;
  lightboxCategory.textContent = category;
  lightboxTitle.textContent    = title;
  lightboxDesc.textContent     = desc;

  // Render results
  lightboxResults.innerHTML = results
    .map(r => `<div class="result-item">${r}</div>`)
    .join('');

  lightboxOverlay.removeAttribute('hidden');
  // Force reflow then animate
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      lightboxOverlay.classList.add('open');
    });
  });

  document.body.style.overflow = 'hidden';
  lightboxClose.focus();
}

function closeLightbox() {
  lightboxOverlay.classList.remove('open');
  document.body.style.overflow = '';

  // Hide after transition
  lightboxOverlay.addEventListener('transitionend', () => {
    lightboxOverlay.setAttribute('hidden', '');
    if (previouslyFocused) previouslyFocused.focus();
  }, { once: true });
}

// Open on card click or Enter/Space key
projectCards.forEach(card => {
  card.addEventListener('click', () => openLightbox(card));
  card.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      openLightbox(card);
    }
  });
});

lightboxClose.addEventListener('click', closeLightbox);

// Close on overlay backdrop click
lightboxOverlay.addEventListener('click', (e) => {
  if (e.target === lightboxOverlay) closeLightbox();
});

// Trap focus inside modal
lightboxOverlay.addEventListener('keydown', (e) => {
  if (e.key !== 'Tab') return;

  const focusable = lightboxOverlay.querySelectorAll(
    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
  );
  const first = focusable[0];
  const last  = focusable[focusable.length - 1];

  if (e.shiftKey) {
    if (document.activeElement === first) {
      e.preventDefault();
      last.focus();
    }
  } else {
    if (document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  }
});


/* ============================================================
   CONTACT FORM VALIDATION
   ============================================================ */
const contactForm    = document.getElementById('contactForm');
const formSuccess    = document.getElementById('formSuccess');
const submitBtn      = document.getElementById('formSubmitBtn');

const fields = {
  name:    { el: document.getElementById('fullName'),      error: document.getElementById('error-name'),    group: document.getElementById('group-name')    },
  email:   { el: document.getElementById('emailAddress'),  error: document.getElementById('error-email'),   group: document.getElementById('group-email')   },
  service: { el: document.getElementById('serviceSelect'), error: document.getElementById('error-service'),  group: document.getElementById('group-service')  },
  message: { el: document.getElementById('projectMessage'),error: document.getElementById('error-message'), group: document.getElementById('group-message') },
};

// Real-time inline validation on blur
Object.values(fields).forEach(({ el, error, group }) => {
  el.addEventListener('blur', () => {
    validateField(el, error, group);
  });
  el.addEventListener('input', () => {
    if (group.classList.contains('error')) {
      validateField(el, error, group);
    }
  });
});

function validateField(el, error, group) {
  let valid = true;

  if (el.type === 'email') {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    valid = el.value.trim() !== '' && emailRegex.test(el.value.trim());
  } else if (el.tagName === 'SELECT') {
    valid = el.value !== '';
  } else if (el.tagName === 'TEXTAREA') {
    valid = el.value.trim().length >= 20;
  } else {
    valid = el.value.trim().length >= 2;
  }

  group.classList.toggle('error', !valid);
  error.classList.toggle('visible', !valid);

  return valid;
}

function validateAll() {
  let allValid = true;
  const { name, email, service, message } = fields;

  if (!validateField(name.el,    name.error,    name.group))    allValid = false;
  if (!validateField(email.el,   email.error,   email.group))   allValid = false;
  if (!validateField(service.el, service.error, service.group)) allValid = false;
  if (!validateField(message.el, message.error, message.group)) allValid = false;

  return allValid;
}

contactForm.addEventListener('submit', async (e) => {
  e.preventDefault();

  if (!validateAll()) {
    // Focus first error
    const firstError = contactForm.querySelector('.form-group.error input, .form-group.error select, .form-group.error textarea');
    if (firstError) firstError.focus();
    return;
  }

  // Loading state
  const originalBtnText   = submitBtn.textContent;
  submitBtn.innerHTML     = '<span class="btn-spinner" aria-hidden="true"></span> Sending…';
  submitBtn.disabled      = true;
  submitBtn.style.opacity = '0.8';
  const formError = document.getElementById('formError');
  if (formError) formError.style.display = 'none';

  // Map service values to readable titles
  const serviceMap = {
    branding:    'Brand Identity & Creative Design',
    social:      'Social Media Strategy & Management',
    ai:          'AI Workflows & Marketing Automation',
    performance: 'Performance Marketing & Scaling',
    full:        'Full-Studio Partnership',
  };

  const payload = {
    name:      fields.name.el.value.trim(),
    email:     fields.email.el.value.trim(),
    service:   serviceMap[fields.service.el.value] || fields.service.el.value,
    message:   fields.message.el.value.trim(),
    _subject:  `New Inquiry from ${fields.name.el.value.trim()} — EMERG Website`,
    _template: 'table',
    _captcha:  'false',
    _replyto:  fields.email.el.value.trim(),
  };

  try {
    const response = await fetch('https://formsubmit.co/ajax/anshikagarg9165@gmail.com', {
      method:  'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept':        'application/json'
      },
      body: JSON.stringify(payload)
    });

    const result = await response.json();

    if (response.ok && (result.success === 'true' || result.success === true)) {
      contactForm.style.display = 'none';
      formSuccess.removeAttribute('hidden');
      formSuccess.classList.add('visible');
      formSuccess.focus();
    } else {
      throw new Error(result.message || 'Form submission failed');
    }
  } catch (err) {
    console.error('FormSubmit error:', err);
    if (formError) {
      formError.style.display = 'flex';
      if (err.message && err.message !== 'Form submission failed') {
        formError.innerHTML = `⚠️ ${err.message}`;
      } else if (window.location.protocol === 'file:') {
        formError.innerHTML = `⚠️ Note: Form submissions require opening the site through a web server (e.g. VS Code Live Server or live hosting) rather than directly as a local file (file://).`;
      } else {
        formError.innerHTML = `⚠️ Something went wrong. Please try again or email us directly at <a href="mailto:anshikagarg9165@gmail.com" style="color:inherit;font-weight:600;text-decoration:underline;">anshikagarg9165@gmail.com</a>`;
      }
    }
    submitBtn.textContent   = originalBtnText;
    submitBtn.disabled      = false;
    submitBtn.style.opacity = '1';
  }
});


/* ============================================================
   SMOOTH SCROLL POLYFILL (for older Safari)
   ============================================================ */
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    const target = document.querySelector(this.getAttribute('href'));
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
});


/* ============================================================
   HERO SCROLL HINT — fade out on scroll
   ============================================================ */
const scrollHint = document.querySelector('.hero-scroll-hint');
if (scrollHint) {
  window.addEventListener('scroll', () => {
    scrollHint.style.opacity = window.scrollY > 60 ? '0' : '1';
  }, { passive: true });
}
