/* tiny nav toggle – still <1 kB */
(() => {
  const btn  = document.getElementById('nav-toggle');
  if (!btn) return;

  const list = document.getElementById('nav-list');

  btn.addEventListener('click', () => {
    const html = document.documentElement;
    const open = html.classList.toggle('nav-open');

    // show / hide list before updating ARIA
    if (list) {
      if (open) {
        if (list.hasAttribute('hidden')) list.removeAttribute('hidden');
        list.classList.remove('hidden');
      } else {
        if (!list.hasAttribute('hidden')) list.setAttribute('hidden', '');
        list.classList.add('hidden');
      }
    }

    // ARIA
    btn.setAttribute('aria-expanded', open);
  });
})();