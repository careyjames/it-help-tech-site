// Prevent a flash of the wrong theme before CSS loads.
// Externalized for CSP hardening (Sub-4): with this script as a same-origin
// blocking <script src=...> with SRI, the parser pauses here, applies the
// stored preference, and only then continues — same UX as the old inline IIFE
// but with no inline-script CSP hash required.
(function () {
  try {
    if (localStorage.getItem('theme') === 'light') {
      document.documentElement.classList.add('switch');
    }
  } catch (error) {
    // localStorage can throw in privacy-restricted contexts; keep default theme.
    if (typeof console !== 'undefined' && typeof console.debug === 'function') {
      console.debug('Theme preference storage unavailable:', error);
    }
  }
})();
