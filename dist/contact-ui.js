(() => {
  'use strict';
  const phone = document.querySelector('input[name="Telefone"]');
  function digitsOnly(value) {
    let digits = value.replace(/\D/g, '');
    if (digits.length > 11 && digits.startsWith('55')) digits = digits.slice(2);
    return digits.slice(0, 11);
  }
  function formatPhone(digits) {
    if (!digits) return '';
    let value = '(' + digits.slice(0, 2);
    if (digits.length >= 2) value += ')';
    if (digits.length > 2) {
      const split = digits.length === 11 ? 7 : 6;
      value += ' ' + digits.slice(2, split);
      if (digits.length > split) value += '-' + digits.slice(split);
    }
    return value;
  }
  function maskPhone() {
    const old = phone.value;
    const cursor = phone.selectionStart ?? old.length;
    const atEnd = cursor === old.length;
    let preceding = old.slice(0, cursor).replace(/\D/g, '').length;
    const allDigits = old.replace(/\D/g, '');
    if (allDigits.length > 11 && allDigits.startsWith('55')) preceding = Math.max(0, preceding - 2);
    const value = formatPhone(digitsOnly(old));
    phone.value = value;
    let position = value.length;
    if (!atEnd) {
      position = 0;
      let seen = 0;
      while (position < value.length && seen < preceding) {
        if (/\d/.test(value[position])) seen++;
        position++;
      }
    }
    phone.setSelectionRange(position, position);
  }
  if (phone) {
    phone.addEventListener('input', maskPhone);
    phone.addEventListener('blur', maskPhone);
    // Handle pasted unformatted numbers before maxlength truncates them.
    phone.addEventListener('paste', event => {
      const text = event.clipboardData?.getData('text');
      if (!text) return;
      event.preventDefault();
      const start = phone.selectionStart ?? 0;
      const end = phone.selectionEnd ?? phone.value.length;
      phone.value = phone.value.slice(0, start) + text + phone.value.slice(end);
      maskPhone();
      phone.dispatchEvent(new Event('input', { bubbles: true }));
    });
    maskPhone();
  }

  let closeCurrent = () => {};
  document.querySelectorAll('.form-grid select').forEach((select, index) => {
    const original = select.closest('label');
    if (!original) return;
    const field = document.createElement('div');
    field.className = 'form-field';
    const label = document.createElement('label');
    label.id = `select-label-${index}`;
    label.textContent = original.firstChild.textContent.trim();
    const wrapper = document.createElement('div');
    wrapper.className = 'custom-select';
    const trigger = document.createElement('button');
    trigger.type = 'button';
    trigger.id = `select-trigger-${index}`;
    trigger.className = 'select-trigger';
    label.htmlFor = trigger.id;
    trigger.setAttribute('role', 'combobox');
    trigger.setAttribute('aria-haspopup', 'listbox');
    trigger.setAttribute('aria-expanded', 'false');
    trigger.setAttribute('aria-required', String(select.required));
    const value = document.createElement('span');
    value.id = `select-value-${index}`;
    trigger.append(value);
    trigger.setAttribute('aria-labelledby', `${label.id} ${value.id}`);
    const menu = document.createElement('div');
    menu.id = `select-menu-${index}`;
    menu.className = 'select-menu';
    menu.setAttribute('role', 'listbox');
    menu.setAttribute('aria-labelledby', label.id);
    menu.hidden = true;
    trigger.setAttribute('aria-controls', menu.id);
    const error = document.createElement('p');
    error.className = 'select-error';
    error.id = `select-error-${index}`;
    error.textContent = 'Selecione uma opção.';
    error.hidden = true;
    trigger.setAttribute('aria-describedby', error.id);
    const options = [...select.options].filter(option => option.value !== '');
    const rows = options.map((option, rowIndex) => {
      const row = document.createElement('div');
      row.id = `select-option-${index}-${rowIndex}`;
      row.className = 'select-option';
      row.setAttribute('role', 'option');
      row.textContent = option.textContent;
      menu.append(row);
      row.addEventListener('pointerdown', event => event.preventDefault());
      row.addEventListener('click', () => choose(rowIndex));
      return row;
    });
    let active = 0;
    let search = '';
    let searchTime = 0;
    function sync() {
      value.textContent = select.selectedOptions[0]?.textContent || 'Selecione';
      rows.forEach((row, i) => row.setAttribute('aria-selected', String(options[i].value === select.value)));
      if (select.value) { trigger.removeAttribute('aria-invalid'); error.hidden = true; }
    }
    function highlight(next) {
      active = Math.max(0, Math.min(rows.length - 1, next));
      rows.forEach((row, i) => row.classList.toggle('is-active', i === active));
      trigger.setAttribute('aria-activedescendant', rows[active].id);
      const row = rows[active];
      if (row.offsetTop < menu.scrollTop) menu.scrollTop = row.offsetTop;
      else if (row.offsetTop + row.offsetHeight > menu.scrollTop + menu.clientHeight) {
        menu.scrollTop = row.offsetTop + row.offsetHeight - menu.clientHeight;
      }
    }
    function close() {
      menu.hidden = true;
      trigger.setAttribute('aria-expanded', 'false');
      trigger.removeAttribute('aria-activedescendant');
    }
    function open() {
      closeCurrent();
      closeCurrent = close;
      menu.hidden = false;
      trigger.setAttribute('aria-expanded', 'true');
      const rect = trigger.getBoundingClientRect();
      menu.classList.toggle('opens-up', window.innerHeight - rect.bottom < menu.offsetHeight + 12 && rect.top > menu.offsetHeight + 12);
      highlight(Math.max(0, options.findIndex(option => option.value === select.value)));
    }
    function choose(i) {
      select.value = options[i].value;
      select.dispatchEvent(new Event('change', { bubbles: true }));
      close();
      trigger.focus();
    }
    trigger.addEventListener('click', () => menu.hidden ? open() : close());
    trigger.addEventListener('keydown', event => {
      const key = event.key;
      if (key === 'Tab') { close(); return; }
      if (key === 'Escape') { event.preventDefault(); close(); return; }
      if (['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(key)) {
        event.preventDefault();
        const wasClosed = menu.hidden;
        if (wasClosed) open();
        if (key === 'Home') highlight(0);
        else if (key === 'End') highlight(rows.length - 1);
        else if (!wasClosed) highlight(active + (key === 'ArrowDown' ? 1 : -1));
      } else if ((key === 'Enter' || key === ' ') && !menu.hidden) {
        event.preventDefault();
        choose(active);
      } else if (key.length === 1 && !event.ctrlKey && !event.metaKey && !event.altKey) {
        event.preventDefault();
        if (menu.hidden) open();
        const now = Date.now();
        search = now - searchTime > 600 ? key : search + key;
        searchTime = now;
        const found = options.findIndex(option => option.textContent.toLocaleLowerCase('pt-BR').startsWith(search.toLocaleLowerCase('pt-BR')));
        if (found >= 0) highlight(found);
      }
    });
    trigger.addEventListener('blur', close);
    select.addEventListener('change', sync);
    select.addEventListener('invalid', event => {
      event.preventDefault();
      trigger.setAttribute('aria-invalid', 'true');
      error.hidden = false;
      // Keep focus on the first invalid field in form order.
      const first = select.form?.querySelector(':invalid');
      if (first === select) trigger.focus();
    });
    select.classList.add('native-select');
    select.tabIndex = -1;
    select.setAttribute('aria-hidden', 'true');
    original.replaceWith(field);
    wrapper.append(select, trigger, menu);
    field.append(label, wrapper, error);
    select.form?.addEventListener('reset', () => setTimeout(() => { sync(); close(); error.hidden = true; trigger.removeAttribute('aria-invalid'); }, 0));
    sync();
  });
  document.addEventListener('pointerdown', event => {
    if (!event.target.closest('.custom-select')) closeCurrent();
  });
})();
