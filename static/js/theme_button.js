(function() {
  const html   = document.documentElement;   // <html>
  const key    = 'theme';                    // localStorage key
  const pref   = localStorage.getItem(key);

  // apply stored choice (default: dark)
  if (pref === 'light') html.classList.add('switch');
  else html.classList.remove('switch');

  document.addEventListener('DOMContentLoaded', () => {
    const toggle = document.getElementById('mode');
    if (!toggle) return;
    toggle.addEventListener('click', () => {
      const light = html.classList.toggle('switch');
      localStorage.setItem(key, light ? 'light' : 'dark');
    });
  });
})();

document.addEventListener('DOMContentLoaded',() => {
  document.querySelector('.dropdown-toggle')?.addEventListener('click',e=>{
    const btn=e.currentTarget;
    const list=btn.nextElementSibling;
    btn.setAttribute('aria-expanded',list.classList.toggle('hidden')?'false':'true');
  });
});
