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

/*
 * The navigation dropdown is controlled separately by nav-toggle.js.  Having
 * another listener here caused the button state to toggle twice, leaving the
 * menu stuck open.  Removing this duplicate logic ensures a single source of
 * truth for the menu and prevents conflicting behaviour.
 */
