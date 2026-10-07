(() => {
  'use strict';
  const menu = document.querySelector('.menu-toggle');
  const navigation = document.getElementById('navigation');
  function closeMenu() { navigation.classList.remove('open'); menu.setAttribute('aria-expanded', 'false'); menu.setAttribute('aria-label', 'Abrir menu'); }
  menu.addEventListener('click', () => { const open = menu.getAttribute('aria-expanded') !== 'true'; navigation.classList.toggle('open', open); menu.setAttribute('aria-expanded', String(open)); menu.setAttribute('aria-label', open ? 'Fechar menu' : 'Abrir menu'); });
  navigation.querySelectorAll('a').forEach(link => link.addEventListener('click', closeMenu));
  document.addEventListener('keydown', event => { if (event.key === 'Escape') closeMenu(); });
  document.getElementById('year').textContent = new Date().getFullYear();
  const privacy = document.getElementById('privacy-dialog');
  document.querySelectorAll('.privacy-trigger').forEach(button => button.addEventListener('click', () => privacy.showModal()));
  privacy.querySelector('.close-dialog').addEventListener('click', () => privacy.close());
  privacy.addEventListener('click', event => { if (event.target === privacy) { const r = privacy.getBoundingClientRect(); if (event.clientX < r.left || event.clientX > r.right || event.clientY < r.top || event.clientY > r.bottom) privacy.close(); } });
  const form = document.getElementById('booking-form');
  const submit = document.getElementById('submit-button');
  const status = document.getElementById('form-status');
  const email = String(window.SITE_CONFIG?.formSubmitEmail || '').trim();
  const configured = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  if (configured) {
    form.action = 'https://formsubmit.co/' + encodeURIComponent(email);
    document.getElementById('form-next').value = new URL('obrigado.html', window.location.href).href;
    submit.disabled = false;
    status.textContent = 'Sua solicitação será encaminhada por e-mail. Aguarde o retorno para confirmar o agendamento.';
  }
  form.addEventListener('submit', event => {
    if (!configured) { event.preventDefault(); status.textContent = 'O formulário ainda não está recebendo solicitações. Utilize os canais de contato.'; return; }
    if (!form.reportValidity()) { event.preventDefault(); return; }
    submit.disabled = true;
    submit.firstChild.textContent = 'Encaminhando solicitação ';
  });
})();
