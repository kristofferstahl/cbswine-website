/* ============================================================
   CBS WINE — Main JavaScript
   
   Handles:
   1. Navigation (scroll behavior, hamburger menu)
   2. Scroll animations (IntersectionObserver)
   3. Data loading from JSON files
   4. Gallery lightbox
   5. Footer year auto-update
   6. Form handling (Netlify Forms)
   ============================================================ */

(function () {
  'use strict';

  /* ----------------------------------------------------------
     1. NAVIGATION
     ---------------------------------------------------------- */

  const nav = document.querySelector('.nav');
  const hamburger = document.querySelector('.nav__hamburger');
  const overlay = document.querySelector('.nav__overlay');
  const overlayLinks = document.querySelectorAll('.nav__overlay-link');

  // Determine if this page has a hero (nav starts transparent)
  const hasHero = document.querySelector('.hero') !== null;

  // If no hero, nav should always be solid
  if (!hasHero && nav) {
    nav.classList.add('nav--solid');
  }

  // Scroll handler — add solid background after scrolling past threshold
  function handleNavScroll() {
    if (!nav || !hasHero) return;
    if (window.scrollY > 60) {
      nav.classList.add('nav--scrolled');
    } else {
      nav.classList.remove('nav--scrolled');
    }
  }

  window.addEventListener('scroll', handleNavScroll, { passive: true });
  handleNavScroll(); // Run on load

  // Hamburger menu toggle
  if (hamburger && overlay) {
    hamburger.addEventListener('click', function () {
      const isOpen = hamburger.classList.contains('nav__hamburger--open');

      if (isOpen) {
        closeMenu();
      } else {
        openMenu();
      }
    });

    // Close menu when clicking a link
    overlayLinks.forEach(function (link) {
      link.addEventListener('click', closeMenu);
    });

    // Close menu on Escape key
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && overlay.classList.contains('nav__overlay--open')) {
        closeMenu();
      }
    });
  }

  function openMenu() {
    hamburger.classList.add('nav__hamburger--open');
    overlay.classList.add('nav__overlay--open');
    document.body.style.overflow = 'hidden';
    hamburger.setAttribute('aria-expanded', 'true');
  }

  function closeMenu() {
    hamburger.classList.remove('nav__hamburger--open');
    overlay.classList.remove('nav__overlay--open');
    document.body.style.overflow = '';
    hamburger.setAttribute('aria-expanded', 'false');
  }


  /* ----------------------------------------------------------
     2. SCROLL ANIMATIONS (Intersection Observer)
     ---------------------------------------------------------- */

  const animateElements = document.querySelectorAll('[data-animate], [data-animate-stagger]');

  if ('IntersectionObserver' in window && animateElements.length > 0) {
    const observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target); // Animate once only
          }
        });
      },
      {
        threshold: 0.15,
        rootMargin: '0px 0px -40px 0px'
      }
    );

    animateElements.forEach(function (el) {
      observer.observe(el);
    });
  } else {
    // Fallback: show everything if IntersectionObserver not supported
    animateElements.forEach(function (el) {
      el.classList.add('is-visible');
    });
  }


  /* ----------------------------------------------------------
     3. DATA LOADING FROM JSON
     
     Utility function to fetch JSON from /data/ folder.
     Each page calls its own loader function.
     ---------------------------------------------------------- */

  /**
   * Fetches JSON data from the /data/ directory.
   * @param {string} filename - e.g. 'events.json'
   * @returns {Promise<any>} Parsed JSON data
   */
  async function loadData(filename) {
    try {
      const response = await fetch('/data/' + filename);
      if (!response.ok) throw new Error('Failed to load ' + filename);
      return await response.json();
    } catch (error) {
      console.warn('Could not load data/' + filename + ':', error.message);
      return null;
    }
  }

  /**
   * Creates a placeholder element when data isn't available yet.
   * @param {string} icon - SVG icon string
   * @param {string} title - Placeholder title
   * @param {string} text - Placeholder description
   * @returns {string} HTML string
   */
  function createPlaceholder(title, text) {
    return `
      <div class="placeholder">
        <svg class="placeholder__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
          <path d="M12 6v6l4 2"/>
          <circle cx="12" cy="12" r="10"/>
        </svg>
        <p class="placeholder__title">${title}</p>
        <p class="placeholder__text">${text}</p>
      </div>
    `;
  }

  /**
   * Format a date string nicely.
   * @param {string} dateStr - ISO date string, e.g. "2025-03-15"
   * @returns {string} Formatted date, e.g. "15 March 2025"
   */
  function formatDate(dateStr) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
      console.warn('CBS Wine: bad date "' + dateStr + '" in events.json — use YYYY-MM-DD (e.g. "2026-04-28").');
      return dateStr;
    }
    const date = new Date(dateStr + 'T00:00:00');
    return date.toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  }

  /**
   * Check if a date is in the future.
   */
  function isFutureDate(dateStr) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
      console.warn('CBS Wine: bad date "' + dateStr + '" in events.json — use YYYY-MM-DD (e.g. "2026-04-28").');
      return false;
    }
    const eventDate = new Date(dateStr + 'T23:59:59');
    return eventDate >= new Date();
  }


  /* ----------------------------------------------------------
     3a. EVENTS PAGE LOADER
     ---------------------------------------------------------- */

  const eventsContainer = document.getElementById('events-list');
  const pastEventsContainer = document.getElementById('past-events-list');

  if (eventsContainer || pastEventsContainer) {
    loadData('events.json').then(function (data) {
      if (!data || !data.events || data.events.length === 0) {
        if (eventsContainer) {
          eventsContainer.innerHTML = createPlaceholder(
            'Events coming soon',
            'We\'re planning our next wine tasting. Follow us on Instagram for announcements!'
          );
        }
        return;
      }

      const upcoming = [];
      const past = [];

      data.events.forEach(function (event) {
        if (isFutureDate(event.date)) {
          upcoming.push(event);
        } else {
          past.push(event);
        }
      });

      // Sort upcoming by date ascending, past by date descending
      upcoming.sort(function (a, b) { return new Date(a.date) - new Date(b.date); });
      past.sort(function (a, b) { return new Date(b.date) - new Date(a.date); });

      if (eventsContainer) {
        if (upcoming.length === 0) {
          eventsContainer.innerHTML = createPlaceholder(
            'No upcoming events',
            'Stay tuned — our next tasting is being planned! Follow us on Instagram for updates.'
          );
        } else {
          eventsContainer.innerHTML = upcoming.map(renderEventCard).join('');
        }
      }

      if (pastEventsContainer) {
        if (past.length === 0) {
          pastEventsContainer.innerHTML = '';
        } else {
          pastEventsContainer.innerHTML = past.map(renderEventCard).join('');
        }
      }

      // Re-observe new elements for scroll animation
      initAnimations();
    });
  }

  function renderEventCard(event) {
    const isUpcoming = isFutureDate(event.date);
    const badgeClass = event.soldOut ? 'badge--soldout' : (isUpcoming ? 'badge--upcoming' : 'badge--past');
    const badgeText = event.soldOut ? 'Sold Out' : (isUpcoming ? 'Upcoming' : 'Past');
    const imageSrc = event.image || '';
    const imageMarkup = imageSrc
      ? `<img class="card__image" src="${imageSrc}" alt="${event.title}" loading="lazy">`
      : `<div class="card__image skeleton--image"></div>`;

    return `
      <div class="card" data-animate>
        ${imageMarkup}
        <div class="card__body">
          <span class="badge ${badgeClass}">${badgeText}</span>
          <h3 class="card__title">${event.title}</h3>
          <p class="card__meta">${formatDate(event.date)}${event.time ? ' · ' + event.time : ''}${event.location ? ' · ' + event.location : ''}</p>
          <p class="card__description">${event.description || ''}</p>
          ${event.price ? '<p class="card__meta mt-lg"><strong>' + event.price + '</strong></p>' : ''}
          ${event.signupUrl && isUpcoming && !event.soldOut ? '<a href="' + event.signupUrl + '" class="btn btn--primary mt-lg" target="_blank" rel="noopener">Sign Up</a>' : ''}
        </div>
      </div>
    `;
  }


  /* ----------------------------------------------------------
     3b. HOME PAGE — FEATURED EVENTS
     ---------------------------------------------------------- */

  const featuredEventsContainer = document.getElementById('featured-events');

  if (featuredEventsContainer) {
    loadData('events.json').then(function (data) {
      if (!data || !data.events || data.events.length === 0) {
        featuredEventsContainer.innerHTML = createPlaceholder(
          'Events coming soon',
          'We\'re planning exciting wine tastings for this semester.'
        );
        return;
      }

      // Show next 2 upcoming events, or most recent 2 if none upcoming
      const upcoming = data.events
        .filter(function (e) { return isFutureDate(e.date); })
        .sort(function (a, b) { return new Date(a.date) - new Date(b.date); })
        .slice(0, 2);

      const eventsToShow = upcoming.length > 0 ? upcoming : data.events
        .sort(function (a, b) { return new Date(b.date) - new Date(a.date); })
        .slice(0, 2);

      featuredEventsContainer.innerHTML = eventsToShow.map(renderEventCard).join('');
      initAnimations();
    });
  }


  /* ----------------------------------------------------------
     3c. PARTNERS PAGE LOADER
     ---------------------------------------------------------- */

  const partnersGrid = document.getElementById('partners-grid');

  if (partnersGrid) {
    loadData('partners.json').then(function (data) {
      if (!data || !data.partners || data.partners.length === 0) {
        partnersGrid.innerHTML = createPlaceholder(
          'Partners coming soon',
          'We work with leading Danish wine importers and shops. Details coming soon.'
        );
        return;
      }

      partnersGrid.innerHTML = data.partners.map(function (partner) {
        const logoMarkup = partner.logo
          ? `<img class="partner-card__logo" src="${partner.logo}" alt="${partner.name}" loading="lazy">`
          : `<div class="partner-card__logo skeleton--text" style="width:120px;height:56px;"></div>`;

        return `
          <div class="partner-card" data-animate>
            ${logoMarkup}
            <h3 class="partner-card__name">${partner.name}</h3>
            <span class="partner-card__type">${partner.type || 'Partner'}</span>
            <p class="partner-card__description">${partner.description || ''}</p>
            ${partner.website ? '<a href="' + partner.website + '" class="link-arrow mt-lg" target="_blank" rel="noopener">Visit website</a>' : ''}
          </div>
        `;
      }).join('');

      initAnimations();
    });
  }

  // Home page partner logos
  const partnerLogos = document.getElementById('partner-logos');

  if (partnerLogos) {
    loadData('partners.json').then(function (data) {
      if (!data || !data.partners || data.partners.length === 0) return;

      partnerLogos.innerHTML = data.partners
        .filter(function (p) { return p.logo; })
        .map(function (partner) {
          return `
            <a href="${partner.website || '#'}" class="partner-logo" target="_blank" rel="noopener" title="${partner.name}">
              <img src="${partner.logo}" alt="${partner.name}" loading="lazy">
            </a>
          `;
        }).join('');
    });
  }


  /* ----------------------------------------------------------
     3d. GALLERY PAGE LOADER
     ---------------------------------------------------------- */

  const galleryGrid = document.getElementById('gallery-grid');
  let galleryImages = [];

  if (galleryGrid) {
    loadData('gallery.json').then(function (data) {
      if (!data || !data.images || data.images.length === 0) {
        galleryGrid.innerHTML = createPlaceholder(
          'Gallery coming soon',
          'Photos from our tastings will appear here. Stay tuned!'
        );
        return;
      }

      galleryImages = data.images;

      galleryGrid.innerHTML = data.images.map(function (img, index) {
        return `
          <div class="gallery-item" data-index="${index}" data-animate>
            <img src="${img.src}" alt="${img.caption || 'CBS Wine tasting'}" loading="lazy">
            <div class="gallery-item__overlay">
              <span class="gallery-item__caption">${img.caption || ''}</span>
            </div>
          </div>
        `;
      }).join('');

      // Attach lightbox click handlers
      galleryGrid.querySelectorAll('.gallery-item').forEach(function (item) {
        item.addEventListener('click', function () {
          openLightbox(parseInt(item.dataset.index, 10));
        });
      });

      initAnimations();
    });
  }


  /* ----------------------------------------------------------
     3e. (REMOVED — team section replaced with static "Join the Team")
     ---------------------------------------------------------- */


  /* ----------------------------------------------------------
     4. GALLERY LIGHTBOX
     ---------------------------------------------------------- */

  const lightbox = document.getElementById('lightbox');
  const lightboxImage = document.getElementById('lightbox-image');
  const lightboxCaption = document.getElementById('lightbox-caption');
  const lightboxClose = document.getElementById('lightbox-close');
  const lightboxPrev = document.getElementById('lightbox-prev');
  const lightboxNext = document.getElementById('lightbox-next');
  let currentLightboxIndex = 0;

  function openLightbox(index) {
    if (!lightbox || galleryImages.length === 0) return;
    currentLightboxIndex = index;
    updateLightboxImage();
    lightbox.classList.add('lightbox--open');
    document.body.style.overflow = 'hidden';
  }

  function closeLightbox() {
    if (!lightbox) return;
    lightbox.classList.remove('lightbox--open');
    document.body.style.overflow = '';
  }

  function updateLightboxImage() {
    if (!lightboxImage || galleryImages.length === 0) return;
    const img = galleryImages[currentLightboxIndex];
    lightboxImage.src = img.src;
    lightboxImage.alt = img.caption || '';
    if (lightboxCaption) {
      lightboxCaption.textContent = img.caption || '';
      lightboxCaption.style.display = img.caption ? 'block' : 'none';
    }
  }

  function nextImage() {
    currentLightboxIndex = (currentLightboxIndex + 1) % galleryImages.length;
    updateLightboxImage();
  }

  function prevImage() {
    currentLightboxIndex = (currentLightboxIndex - 1 + galleryImages.length) % galleryImages.length;
    updateLightboxImage();
  }

  if (lightboxClose) lightboxClose.addEventListener('click', closeLightbox);
  if (lightboxNext) lightboxNext.addEventListener('click', nextImage);
  if (lightboxPrev) lightboxPrev.addEventListener('click', prevImage);

  if (lightbox) {
    lightbox.addEventListener('click', function (e) {
      if (e.target === lightbox) closeLightbox();
    });

    document.addEventListener('keydown', function (e) {
      if (!lightbox.classList.contains('lightbox--open')) return;
      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowRight') nextImage();
      if (e.key === 'ArrowLeft') prevImage();
    });
  }


  /* ----------------------------------------------------------
     5. FOOTER — Auto-update year
     ---------------------------------------------------------- */

  const yearSpan = document.getElementById('current-year');
  if (yearSpan) {
    yearSpan.textContent = new Date().getFullYear();
  }


  /* ----------------------------------------------------------
     6. FORM HANDLING (Netlify Forms compatible)
     ---------------------------------------------------------- */

  const contactForm = document.getElementById('contact-form');

  if (contactForm) {
    contactForm.addEventListener('submit', function (e) {
      e.preventDefault();

      const formData = new FormData(contactForm);
      const submitBtn = contactForm.querySelector('.form__submit');
      const originalText = submitBtn.textContent;

      submitBtn.textContent = 'Sending...';
      submitBtn.disabled = true;

      fetch('/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams(formData).toString()
      })
        .then(function (response) {
          if (response.ok) {
            contactForm.innerHTML = `
              <div class="form__success">
                <p style="font-size: var(--text-xl); margin-bottom: var(--space-sm);">Thank you!</p>
                <p style="color: var(--color-text-muted); font-weight: 400;">We'll get back to you soon.</p>
              </div>
            `;
          } else {
            throw new Error('Form submission failed');
          }
        })
        .catch(function () {
          submitBtn.textContent = originalText;
          submitBtn.disabled = false;
          alert('Something went wrong. Please try again or email us directly.');
        });
    });
  }


  /* ----------------------------------------------------------
     6. EMAIL SIGNUP — placeholder, no real submission yet
     ---------------------------------------------------------- */

  document.querySelectorAll('.email-signup__form').forEach(function (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var wrap = form.closest('.email-signup__form-wrap');
      var success = wrap ? wrap.querySelector('.email-signup__success') : null;
      form.hidden = true;
      if (success) {
        success.removeAttribute('hidden');
      }
    });
  });


  /* ----------------------------------------------------------
     HELPER: Re-initialize scroll animations
     (Called after dynamically loading content)
     ---------------------------------------------------------- */

  function initAnimations() {
    if (!('IntersectionObserver' in window)) return;

    const newElements = document.querySelectorAll('[data-animate]:not(.is-visible), [data-animate-stagger]:not(.is-visible)');

    const observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.15,
        rootMargin: '0px 0px -40px 0px'
      }
    );

    newElements.forEach(function (el) {
      observer.observe(el);
    });
  }

})();
