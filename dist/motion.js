(() => {
  'use strict';
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  const precise = window.matchMedia('(hover: hover) and (pointer: fine)');
  const selector = '.hero-copy > *, .hero-visual, .section-title, .experience, .about-visual, .about-copy, .approach-head, .approach-grid article, .care > div:first-child, .care-detail > div, .reflection-image, .reflections > div:last-child, .faq > div:first-child, .faq-list details, .booking-copy, .booking-form';
  const nodes = [...document.querySelectorAll(selector)];
  let observer;
  function setMotion() {
    observer?.disconnect();
    nodes.forEach(node => node.classList.remove('motion-enter'));
    if (reduced.matches || !('IntersectionObserver' in window)) return;
    observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        // Animate once. Content is never hidden while waiting for the observer.
        entry.target.classList.add('motion-enter');
        observer.unobserve(entry.target);
      });
    }, { threshold: .06 });
    nodes.forEach(node => {
      const siblings = [...node.parentElement.children].filter(child => nodes.includes(child));
      node.style.setProperty('--entry-delay', `${Math.min(siblings.indexOf(node), 3) * 65}ms`);
      observer.observe(node);
    });
  }
  setMotion();
  reduced.addEventListener?.('change', setMotion);

  // Pointer light stays within content blocks and updates at most once per frame.
  document.querySelectorAll('.experience, .approach-grid article').forEach(card => {
    let frame = 0;
    let x = 0;
    let y = 0;
    card.addEventListener('pointermove', event => {
      if (reduced.matches || !precise.matches || event.pointerType === 'touch') return;
      const rect = card.getBoundingClientRect();
      x = event.clientX - rect.left;
      y = event.clientY - rect.top;
      if (frame) return;
      frame = requestAnimationFrame(() => {
        frame = 0;
        card.style.setProperty('--light-x', `${x}px`);
        card.style.setProperty('--light-y', `${y}px`);
      });
    }, { passive: true });
    card.addEventListener('pointerleave', () => {
      cancelAnimationFrame(frame);
      frame = 0;
      card.style.removeProperty('--light-x');
      card.style.removeProperty('--light-y');
    });
  });
})();
