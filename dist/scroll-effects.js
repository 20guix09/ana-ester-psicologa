(() => {
  'use strict';
  const progress = document.getElementById('scroll-progress-fill');
  const section = document.querySelector('.quote-section');
  if (!progress || !section) return;
  const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
  let scheduled = false;
  const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
  function update() {
    scheduled = false;
    const viewport = window.innerHeight;
    const height = document.documentElement.scrollHeight - viewport;
    const fraction = height > 0 ? clamp(window.scrollY / height, 0, 1) : 0;
    progress.style.transform = `scaleX(${fraction})`;
    const rect = section.getBoundingClientRect();
    if (motion.matches) {
      section.style.setProperty('--circle-one-x', '0px');
      section.style.setProperty('--circle-one-y', '0px');
      section.style.setProperty('--circle-two-x', '0px');
      section.style.setProperty('--circle-two-y', '0px');
    } else if (rect.bottom >= 0 && rect.top <= viewport) {
      // A seção funciona como uma janela: os círculos passam atrás do texto.
      const offset = clamp((viewport / 2 - (rect.top + rect.height / 2)) * .22, -150, 150);
      section.style.setProperty('--circle-one-x', `${offset * .28}px`);
      section.style.setProperty('--circle-one-y', `${offset}px`);
      section.style.setProperty('--circle-two-x', `${-offset * .2}px`);
      section.style.setProperty('--circle-two-y', `${-offset * .7}px`);
    }
  }
  function schedule() {
    if (!scheduled) { scheduled = true; window.requestAnimationFrame(update); }
  }
  window.addEventListener('scroll', schedule, { passive: true });
  window.addEventListener('resize', schedule, { passive: true });
  window.addEventListener('load', schedule);
  window.addEventListener('pageshow', schedule);
  motion.addEventListener?.('change', schedule);
  if ('ResizeObserver' in window) new ResizeObserver(schedule).observe(document.body);
  if (document.fonts?.ready) document.fonts.ready.then(schedule);
  update();
})();
