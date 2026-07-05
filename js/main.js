/* ============================================
   Web3Edu - Main JavaScript
   Core functionality, animations, and utilities
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {
  initNavbar();
  initScrollProgress();
  initFadeAnimations();
  initBackToTop();
  initMouseGlow();
  initCounters();
  initFAQ();
  initMobileMenu();
  initTypingEffect();
  initFloatingCoins();
  initParticles();
  initLoadingScreen();
  initToastSystem();
  initNewsletter();
  initSmoothScroll();
});

/* ============================================
   Loading Screen
   ============================================ */
function initLoadingScreen() {
  const loader = document.querySelector('.loading-overlay');
  if (!loader) return;

  window.addEventListener('load', () => {
    setTimeout(() => {
      loader.classList.add('hidden');
    }, 800);
  });
}

/* ============================================
   Navbar Scroll Effect
   ============================================ */
function initNavbar() {
  const navbar = document.querySelector('.navbar');
  if (!navbar) return;

  let lastScroll = 0;

  window.addEventListener('scroll', () => {
    const currentScroll = window.pageYOffset;

    if (currentScroll > 50) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }

    lastScroll = currentScroll;
  });
}

/* ============================================
   Mobile Menu
   ============================================ */
function initMobileMenu() {
  const hamburger = document.querySelector('.hamburger');
  const nav = document.querySelector('.navbar-nav');
  if (!hamburger || !nav) return;

  hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('active');
    nav.classList.toggle('active');
    document.body.style.overflow = nav.classList.contains('active') ? 'hidden' : '';
  });

  // Close menu on link click
  nav.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', () => {
      hamburger.classList.remove('active');
      nav.classList.remove('active');
      document.body.style.overflow = '';
    });
  });

  // Close on outside click
  document.addEventListener('click', (e) => {
    if (!hamburger.contains(e.target) && !nav.contains(e.target) && nav.classList.contains('active')) {
      hamburger.classList.remove('active');
      nav.classList.remove('active');
      document.body.style.overflow = '';
    }
  });
}

/* ============================================
   Scroll Progress Bar
   ============================================ */
function initScrollProgress() {
  const progressBar = document.querySelector('.scroll-progress');
  if (!progressBar) return;

  window.addEventListener('scroll', () => {
    const scrollTop = window.pageYOffset;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const progress = (scrollTop / docHeight) * 100;
    progressBar.style.width = `${progress}%`;
  });
}

/* ============================================
   Fade In Animations on Scroll
   ============================================ */
function initFadeAnimations() {
  const fadeElements = document.querySelectorAll('.fade-in');
  if (!fadeElements.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

  fadeElements.forEach(el => observer.observe(el));
}

/* ============================================
   Back To Top Button
   ============================================ */
function initBackToTop() {
  const backToTop = document.querySelector('.back-to-top');
  if (!backToTop) return;

  backToTop.addEventListener('click', (e) => {
    e.preventDefault();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

/* ============================================
   Mouse Glow Effect
   ============================================ */
function initMouseGlow() {
  const glow = document.querySelector('.mouse-glow');
  if (!glow || window.matchMedia('(pointer: coarse)').matches) return;

  let mouseX = 0, mouseY = 0;
  let glowX = 0, glowY = 0;
  let rafId = null;
  let isMoving = false;
  let timeout = null;

  document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    isMoving = true;

    clearTimeout(timeout);
    timeout = setTimeout(() => { isMoving = false; }, 100);

    if (!rafId) {
      animateGlow();
    }
  });

  function animateGlow() {
    if (!isMoving) {
      rafId = null;
      return;
    }

    glowX += (mouseX - glowX) * 0.1;
    glowY += (mouseY - glowY) * 0.1;

    glow.style.left = `${glowX}px`;
    glow.style.top = `${glowY}px`;

    rafId = requestAnimationFrame(animateGlow);
  }
}

/* ============================================
   Animated Counters
   ============================================ */
function initCounters() {
  const counters = document.querySelectorAll('[data-counter]');
  if (!counters.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        animateCounter(entry.target);
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });

  counters.forEach(counter => observer.observe(counter));
}

function animateCounter(element) {
  const target = parseInt(element.dataset.counter);
  const duration = 2000;
  const start = performance.now();
  const suffix = element.dataset.suffix || '';
  const prefix = element.dataset.prefix || '';

  function update(currentTime) {
    const elapsed = currentTime - start;
    const progress = Math.min(elapsed / duration, 1);

    // Ease out quart
    const ease = 1 - Math.pow(1 - progress, 4);
    const current = Math.floor(ease * target);

    element.textContent = `${prefix}${current.toLocaleString()}${suffix}`;

    if (progress < 1) {
      requestAnimationFrame(update);
    } else {
      element.textContent = `${prefix}${target.toLocaleString()}${suffix}`;
    }
  }

  requestAnimationFrame(update);
}

/* ============================================
   FAQ Accordion
   ============================================ */
function initFAQ() {
  const faqItems = document.querySelectorAll('.faq-item');
  if (!faqItems.length) return;

  faqItems.forEach(item => {
    const question = item.querySelector('.faq-question');
    if (!question) return;

    question.addEventListener('click', () => {
      const isActive = item.classList.contains('active');

      // Close all others
      faqItems.forEach(other => other.classList.remove('active'));

      // Toggle current
      if (!isActive) {
        item.classList.add('active');
      }
    });
  });
}

/* ============================================
   Typing Effect
   ============================================ */
function initTypingEffect() {
  const element = document.querySelector('.typing-text');
  if (!element) return;

  const text = element.dataset.text || 'Welcome to Web3';
  const speed = parseInt(element.dataset.speed) || 100;
  let index = 0;

  element.textContent = '';
  element.classList.add('typing-text');

  function type() {
    if (index < text.length) {
      element.textContent += text.charAt(index);
      index++;
      setTimeout(type, speed);
    }
  }

  setTimeout(type, 500);
}

/* ============================================
   Floating Crypto Coins
   ============================================ */
function initFloatingCoins() {
  const container = document.querySelector('.hero-particles');
  if (!container) return;

  const coins = ['₿', 'Ξ', '◎', '△', '○'];
  const colors = ['#F7931A', '#627EEA', '#8247E5', '#14F195', '#2775CA'];

  for (let i = 0; i < 15; i++) {
    createFloatingParticle(container, coins, colors, i);
  }
}

function createFloatingParticle(container, coins, colors, index) {
  const particle = document.createElement('div');
  const size = Math.random() * 20 + 10;
  const left = Math.random() * 100;
  const delay = Math.random() * 10;
  const duration = Math.random() * 10 + 10;
  const coinIndex = Math.floor(Math.random() * coins.length);

  particle.style.cssText = `
    position: absolute;
    width: ${size}px;
    height: ${size}px;
    left: ${left}%;
    top: 100%;
    color: ${colors[coinIndex]};
    font-size: ${size}px;
    opacity: 0.3;
    pointer-events: none;
    animation: float-up ${duration}s linear ${delay}s infinite;
  `;
  particle.textContent = coins[coinIndex];

  container.appendChild(particle);
}

// Add float-up keyframe dynamically
const floatUpStyle = document.createElement('style');
floatUpStyle.textContent = `
  @keyframes float-up {
    0% { transform: translateY(0) rotate(0deg); opacity: 0; }
    10% { opacity: 0.3; }
    90% { opacity: 0.3; }
    100% { transform: translateY(-110vh) rotate(360deg); opacity: 0; }
  }
`;
document.head.appendChild(floatUpStyle);

/* ============================================
   Particles Canvas
   ============================================ */
function initParticles() {
  const canvas = document.getElementById('particles-canvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  let particles = [];
  let animationId = null;

  function resize() {
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
  }

  resize();
  window.addEventListener('resize', resize);

  class Particle {
    constructor() {
      this.x = Math.random() * canvas.width;
      this.y = Math.random() * canvas.height;
      this.vx = (Math.random() - 0.5) * 0.5;
      this.vy = (Math.random() - 0.5) * 0.5;
      this.size = Math.random() * 2 + 1;
      this.opacity = Math.random() * 0.5 + 0.2;
    }

    update() {
      this.x += this.vx;
      this.y += this.vy;

      if (this.x < 0 || this.x > canvas.width) this.vx *= -1;
      if (this.y < 0 || this.y > canvas.height) this.vy *= -1;
    }

    draw() {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(139, 92, 246, ${this.opacity})`;
      ctx.fill();
    }
  }

  for (let i = 0; i < 50; i++) {
    particles.push(new Particle());
  }

  function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    particles.forEach(particle => {
      particle.update();
      particle.draw();
    });

    // Draw connections
    particles.forEach((a, i) => {
      particles.slice(i + 1).forEach(b => {
        const dx = a.x - b.x;
        const dy = a.y - b.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < 100) {
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.strokeStyle = `rgba(139, 92, 246, ${0.1 * (1 - dist / 100)})`;
          ctx.lineWidth = 1;
          ctx.stroke();
        }
      });
    });

    animationId = requestAnimationFrame(animate);
  }

  animate();

  // Cleanup on visibility change
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      cancelAnimationFrame(animationId);
    } else {
      animate();
    }
  });
}

/* ============================================
   Toast Notification System
   ============================================ */
function initToastSystem() {
  window.showToast = function(message, type = 'info', duration = 3000) {
    let container = document.querySelector('.toast-container');

    if (!container) {
      container = document.createElement('div');
      container.className = 'toast-container';
      document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.className = `toast ${type}`;

    const icons = {
      success: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 6L9 17l-5-5"/></svg>',
      error: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M15 9l-6 6M9 9l6 6"/></svg>',
      info: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/></svg>'
    };

    toast.innerHTML = `${icons[type] || icons.info}<span>${message}</span>`;
    container.appendChild(toast);

    setTimeout(() => {
      toast.classList.add('toast-out');
      setTimeout(() => toast.remove(), 300);
    }, duration);
  };
}

/* ============================================
   Newsletter Form
   ============================================ */
function initNewsletter() {
  const form = document.querySelector('.newsletter-form');
  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const input = form.querySelector('input');
    const email = input.value.trim();

    if (!email || !email.includes('@')) {
      showToast('Please enter a valid email address', 'error');
      return;
    }

    showToast('Thank you for subscribing! Welcome to Web3Edu.', 'success');
    input.value = '';
  });
}

/* ============================================
   Smooth Scroll for Anchor Links
   ============================================ */
function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      const href = this.getAttribute('href');
      if (href === '#') return;

      const target = document.querySelector(href);
      if (target) {
        e.preventDefault();
        const offset = 80;
        const top = target.getBoundingClientRect().top + window.pageYOffset - offset;
        window.scrollTo({ top, behavior: 'smooth' });
      }
    });
  });
}

/* ============================================
   Utility Functions
   ============================================ */

// Debounce function
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

// Throttle function
function throttle(func, limit) {
  let inThrottle;
  return function(...args) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}

// Format number with commas
function formatNumber(num) {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

// Format currency
function formatCurrency(value, currency = 'USD') {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(value);
}

// Copy to clipboard
async function copyToClipboard(text) {
  try {
    await navigator.clipboard.writeText(text);
    showToast('Copied to clipboard!', 'success');
  } catch (err) {
    showToast('Failed to copy', 'error');
  }
}