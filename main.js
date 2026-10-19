/**
 * AUREVANT — Interactive Features & Micro-Interactions
 */

document.addEventListener('DOMContentLoaded', () => {
  initLiveClock();
  initNavbarScroll();
  initMobileMenu();
  initGallerySlider();
  initPropertyFilter();
  initServicesAccordion();
  initBackToTop();
  initStatsCounter();
});

/**
 * 1. Live Clock for Header (New York Time)
 */
function initLiveClock() {
  const dayEl = document.getElementById('time-day');
  const clockEl = document.getElementById('time-clock');

  if (!dayEl || !clockEl) return;

  function updateTime() {
    const now = new Date();
    // Options for New York Timezone
    const optionsDate = {
      timeZone: 'America/New_York',
      weekday: 'short',
      day: '2-digit',
      month: 'short'
    };
    const optionsTime = {
      timeZone: 'America/New_York',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    };

    try {
      const dateParts = new Intl.DateTimeFormat('en-US', optionsDate).format(now);
      const timeStr = new Intl.DateTimeFormat('en-US', optionsTime).format(now);

      dayEl.textContent = dateParts.toUpperCase();
      clockEl.textContent = timeStr;
    } catch (e) {
      // Fallback
      clockEl.textContent = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    }
  }

  updateTime();
  setInterval(updateTime, 1000);
}

/**
 * 2. Sticky Navbar Glassmorphic Background on Scroll
 */
function initNavbarScroll() {
  const header = document.getElementById('main-header');
  if (!header) return;

  window.addEventListener('scroll', () => {
    if (window.scrollY > 40) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  }, { passive: true });
}

/**
 * 3. Mobile Navigation Drawer
 */
function initMobileMenu() {
  const toggleBtn = document.getElementById('mobile-menu-btn');
  const drawer = document.getElementById('mobile-drawer');

  if (!toggleBtn || !drawer) return;

  toggleBtn.addEventListener('click', () => {
    drawer.classList.toggle('open');
    const isOpen = drawer.classList.contains('open');
    toggleBtn.setAttribute('aria-expanded', isOpen);
  });

  // Close drawer on clicking any navigation link
  drawer.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      drawer.classList.remove('open');
      toggleBtn.setAttribute('aria-expanded', 'false');
    });
  });
}

/**
 * 4. Interactive Gallery Slider with Progress Bar
 */
function initGallerySlider() {
  const slider = document.getElementById('perspective-slider');
  if (!slider) return;

  const slides = slider.querySelectorAll('.gallery-slide');
  const prevBtn = document.getElementById('slider-prev');
  const nextBtn = document.getElementById('slider-next');
  const progressBar = document.getElementById('slider-progress');

  if (!slides.length) return;

  let currentIndex = 0;
  const totalSlides = slides.length;
  let autoplayTimer = null;

  function showSlide(index) {
    if (index < 0) {
      currentIndex = totalSlides - 1;
    } else if (index >= totalSlides) {
      currentIndex = 0;
    } else {
      currentIndex = index;
    }

    slides.forEach((slide, i) => {
      slide.classList.toggle('active', i === currentIndex);
    });

    if (progressBar) {
      const step = 100 / totalSlides;
      progressBar.style.width = `${step}%`;
      progressBar.style.left = `${currentIndex * step}%`;
    }
  }

  function nextSlide() {
    showSlide(currentIndex + 1);
  }

  function prevSlide() {
    showSlide(currentIndex - 1);
  }

  if (nextBtn) nextBtn.addEventListener('click', () => { nextSlide(); resetAutoplay(); });
  if (prevBtn) prevBtn.addEventListener('click', () => { prevSlide(); resetAutoplay(); });

  function startAutoplay() {
    autoplayTimer = setInterval(nextSlide, 5000);
  }

  function resetAutoplay() {
    clearInterval(autoplayTimer);
    startAutoplay();
  }

  slider.addEventListener('mouseenter', () => clearInterval(autoplayTimer));
  slider.addEventListener('mouseleave', () => startAutoplay());

  showSlide(0);
  startAutoplay();
}

/**
 * 5. Property Collection Filtering
 */
function initPropertyFilter() {
  const tabs = document.querySelectorAll('.filter-tab');
  const cards = document.querySelectorAll('.property-card');

  if (!tabs.length || !cards.length) return;

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => {
        t.classList.remove('active');
        t.setAttribute('aria-selected', 'false');
      });
      tab.classList.add('active');
      tab.setAttribute('aria-selected', 'true');

      const filter = tab.getAttribute('data-filter');

      cards.forEach(card => {
        const categories = (card.getAttribute('data-category') || '').split(' ');
        if (filter === 'all' || categories.includes(filter)) {
          card.style.display = 'flex';
          card.style.opacity = '0';
          setTimeout(() => {
            card.style.transition = 'opacity 0.4s ease';
            card.style.opacity = '1';
          }, 30);
        } else {
          card.style.display = 'none';
        }
      });
    });
  });
}

/**
 * 6. Services Interactive Accordion
 */
function initServicesAccordion() {
  const items = document.querySelectorAll('.service-item');
  if (!items.length) return;

  items.forEach(item => {
    const header = item.querySelector('.service-header');
    if (!header) return;

    header.addEventListener('click', () => {
      const isActive = item.classList.contains('active');

      // Close all items
      items.forEach(i => i.classList.remove('active'));

      // If clicked item wasn't active, activate it
      if (!isActive) {
        item.classList.add('active');
      }
    });
  });
}

/**
 * 7. Smooth Scroll to Top
 */
function initBackToTop() {
  const btn = document.getElementById('back-to-top-btn');
  if (!btn) return;

  btn.addEventListener('click', (e) => {
    e.preventDefault();
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  });
}

/**
 * 8. Stats Counter Animation
 */
function initStatsCounter() {
  const statNumbers = document.querySelectorAll('.stat-number');
  if (!statNumbers.length) return;

  let animated = false;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting && !animated) {
        animated = true;
        statNumbers.forEach(el => {
          const target = parseInt(el.getAttribute('data-target'), 10);
          if (isNaN(target)) return;

          const originalText = el.textContent;
          const suffix = originalText.replace(/[0-9]/g, '');

          let count = 0;
          const duration = 1500;
          const stepTime = 30;
          const increment = Math.ceil(target / (duration / stepTime));

          const timer = setInterval(() => {
            count += increment;
            if (count >= target) {
              count = target;
              clearInterval(timer);
              el.textContent = `${count}${suffix}`;
            } else {
              el.textContent = `${count}${suffix}`;
            }
          }, stepTime);
        });
      }
    });
  }, { threshold: 0.3 });

  const section = document.querySelector('.experience-section');
  if (section) observer.observe(section);
}
