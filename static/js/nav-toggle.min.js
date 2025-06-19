/* tiny nav toggle – still <1 kB */
(() => {
  const btn  = document.getElementById('nav-toggle');
  if (!btn) return;

  const list = document.getElementById('nav-list');

  btn.addEventListener('click', () => {
    const html = document.documentElement;
    const open = html.classList.toggle('nav-open');

    // ARIA
    btn.setAttribute('aria-expanded', open);

    // show / hide list
    if (list) {
      if (open) {
        list.removeAttribute('hidden');
        list.classList.remove('hidden');
      } else {
        list.setAttribute('hidden', '');
        list.classList.add('hidden');
      }
    }
  });
})();