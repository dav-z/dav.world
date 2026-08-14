/**
 * Nemesis Foundation - Scripts
 * - 1:1 Seamless Fluid Hero Logo Shrink on Scroll into Top Nav Bar
 * - Expandable Grantees Accordion
 */
document.addEventListener('DOMContentLoaded', () => {
  // --- 1. Hero Logo 1:1 Fluid Shrink on Scroll ---
  const heroSection = document.getElementById('hero-section');
  const heroSpacer = document.querySelector('.hero-spacer');
  const logoImg = document.getElementById('hero-logo');

  if (heroSection && logoImg) {
    // If native CSS scroll-driven animations are supported, let CSS GPU compositor handle it with 0 JS overhead
    if (window.CSS && CSS.supports && CSS.supports('animation-timeline', 'scroll()')) {
      return;
    }

    let ticking = false;
    let initialHeight = 380;
    let minHeight = 72;
    let maxScroll = 308;
    let targetMinScale = 0.62;
    let lastWindowWidth = 0;

    let targetScrollY = 0;
    let currentScrollY = 0;

    function recalculateDimensions() {
      const windowWidth = window.innerWidth;

      // Ignore vertical-only height changes (e.g. mobile Safari URL bar collapsing during scroll)
      if (windowWidth === lastWindowWidth && lastWindowWidth > 0) {
        return;
      }
      lastWindowWidth = windowWidth;

      if (windowWidth > 1024) {
        initialHeight = 380;
        minHeight = 72;
        targetMinScale = 0.65;
      } else if (windowWidth > 768) {
        initialHeight = 300;
        minHeight = 72;
        targetMinScale = 0.62;
      } else {
        initialHeight = 220;
        minHeight = 60;
        targetMinScale = 0.60;
      }

      maxScroll = Math.max(1, initialHeight - minHeight);

      if (heroSpacer) {
        heroSpacer.style.height = `${initialHeight}px`;
      }
    }

    function render() {
      targetScrollY = Math.max(0, window.scrollY || window.pageYOffset || 0);

      // Smooth Lerp dampening (absorbs fast scroll momentum spikes)
      const diff = targetScrollY - currentScrollY;
      if (Math.abs(diff) < 0.1) {
        currentScrollY = targetScrollY;
      } else {
        currentScrollY += diff * 0.35;
      }

      // Clamp scroll progress between 0 and 1
      const progress = Math.min(1, Math.max(0, currentScrollY / maxScroll));

      // Height shrinks seamlessly 1:1 with scroll position
      const currentHeight = initialHeight - progress * (initialHeight - minHeight);
      heroSection.style.height = `${currentHeight.toFixed(1)}px`;

      // Scale logo smoothly using GPU compositor transform (0 DOM reflows)
      const currentScale = 1 - progress * (1 - targetMinScale);
      logoImg.style.transform = `scale(${currentScale.toFixed(4)}) translateZ(0)`;

      // Apply subtle navbar shadow and border when scrolled
      if (progress > 0.01) {
        const shadowAlpha = (progress * 0.5).toFixed(2);
        const borderAlpha = (progress * 0.12).toFixed(2);
        heroSection.style.boxShadow = `0 4px 20px rgba(0, 0, 0, ${shadowAlpha})`;
        heroSection.style.borderBottom = `1px solid rgba(255, 255, 255, ${borderAlpha})`;
      } else {
        heroSection.style.boxShadow = 'none';
        heroSection.style.borderBottom = 'none';
      }

      // Continue animating until currentScrollY catches up with targetScrollY
      if (Math.abs(targetScrollY - currentScrollY) > 0.1) {
        requestAnimationFrame(render);
      } else {
        ticking = false;
      }
    }

    function onScroll() {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(render);
      }
    }

    recalculateDimensions();
    currentScrollY = Math.max(0, window.scrollY || window.pageYOffset || 0);
    render();

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', () => {
      recalculateDimensions();
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(render);
      }
    }, { passive: true });
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
