/**
 * Nemesis Foundation - Scripts
 * - 1:1 Seamless Fluid Hero Logo Shrink on Scroll into Top Nav Bar
 * - Expandable Grantees Accordion
 */
document.addEventListener('DOMContentLoaded', () => {
  // --- 1. Hero Logo 1:1 Fluid Shrink on Scroll ---
  const heroSection = document.getElementById('hero-section');
  const heroSpacer = document.querySelector('.hero-spacer');
  const logoWrapper = document.getElementById('logo-wrapper');
  const logoImg = document.getElementById('hero-logo');

  if (heroSection && heroSpacer && logoWrapper && logoImg) {
    let ticking = false;
    let initialHeight = 380;
    let minHeight = 72;
    let maxScroll = 308;
    let initialLogoWidth = 1000;
    let minLogoWidth = 520;
    let lastWindowWidth = 0;

    function recalculateDimensions() {
      const windowWidth = window.innerWidth;

      // Ignore vertical-only height changes (e.g. mobile URL bar collapsing during scroll)
      if (windowWidth === lastWindowWidth && initialHeight > 0 && window.scrollY > 0) {
        return;
      }
      lastWindowWidth = windowWidth;

      const isMobile = windowWidth <= 768;

      initialHeight = isMobile ? 220 : (windowWidth > 1024 ? 380 : 300);
      minHeight = isMobile ? 60 : 72;
      maxScroll = Math.max(1, initialHeight - minHeight);

      if (windowWidth > 1024) {
        initialLogoWidth = Math.min(1000, windowWidth * 0.85);
        minLogoWidth = Math.min(520, windowWidth * 0.65);
      } else if (windowWidth > 768) {
        initialLogoWidth = Math.min(720, windowWidth * 0.85);
        minLogoWidth = Math.min(420, windowWidth * 0.65);
      } else {
        initialLogoWidth = Math.min(300, windowWidth * 0.85);
        minLogoWidth = Math.min(180, windowWidth * 0.55);
      }

      if (heroSpacer) {
        heroSpacer.style.height = `${initialHeight}px`;
      }

      // Set base logo width once on load/resize so scale transform animates without layout reflows
      logoImg.style.width = `${initialLogoWidth}px`;
    }

    function onScroll() {
      if (!ticking) {
        requestAnimationFrame(updateHero);
        ticking = true;
      }
    }

    function updateHero() {
      const scrollY = Math.max(0, window.scrollY || window.pageYOffset || 0);

      // Clamp scroll progress between 0 and 1
      const progress = Math.min(1, scrollY / maxScroll);

      // Height shrinks seamlessly 1:1 with scroll position
      const currentHeight = Math.max(minHeight, initialHeight - scrollY);
      heroSection.style.height = `${currentHeight}px`;

      // Scale logo smoothly using GPU compositor transform (0 DOM reflows)
      const targetScale = minLogoWidth / initialLogoWidth;
      const currentScale = 1 - progress * (1 - targetScale);
      logoImg.style.transform = `scale(${currentScale.toFixed(4)}) translateZ(0)`;

      // Apply subtle navbar shadow and border when fully docked at top
      if (progress > 0.05) {
        const shadowAlpha = Math.min(0.5, progress * 0.5);
        const borderAlpha = Math.min(0.12, progress * 0.12);
        heroSection.style.boxShadow = `0 4px 20px rgba(0, 0, 0, ${shadowAlpha.toFixed(2)})`;
        heroSection.style.borderBottom = `1px solid rgba(255, 255, 255, ${borderAlpha.toFixed(2)})`;
      } else {
        heroSection.style.boxShadow = 'none';
        heroSection.style.borderBottom = 'none';
      }

      ticking = false;
    }

    recalculateDimensions();
    updateHero();

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', () => {
      recalculateDimensions();
      updateHero();
    }, { passive: true });
    window.addEventListener('orientationchange', () => {
      setTimeout(() => {
        recalculateDimensions();
        updateHero();
      }, 100);
    });
  }

  // --- 2. Single-Expandable Grantees Accordion ---
  document.addEventListener('click', (e) => {
    const header = e.target.closest('.accordion-header');
    if (!header) return;

    const currentItem = header.closest('.accordion-item');
    if (!currentItem) return;

    const currentContent = currentItem.querySelector('.accordion-content');
    const isCurrentlyExpanded = currentItem.classList.contains('active');

    // Close all accordion items across the grantees list
    const container = currentItem.closest('.grantees-accordions') || document;
    const allItems = container.querySelectorAll('.accordion-item');

    allItems.forEach(item => {
      item.classList.remove('active');
      const h = item.querySelector('.accordion-header');
      if (h) h.setAttribute('aria-expanded', 'false');
      const c = item.querySelector('.accordion-content');
      if (c) c.style.maxHeight = '0px';
    });

    // If the clicked item was not previously expanded, open it now
    if (!isCurrentlyExpanded && currentContent) {
      currentItem.classList.add('active');
      header.setAttribute('aria-expanded', 'true');
      currentContent.style.maxHeight = `${currentContent.scrollHeight + 32}px`;
    }
  });
});
