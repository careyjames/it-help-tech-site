window.addEventListener('DOMContentLoaded', function() {
  var toggle = document.querySelector('.dropdown-toggle');
  var menu = document.querySelector('.dropdown-content');
  if (!toggle || !menu) return;
  toggle.addEventListener('click', function(e) {
    e.preventDefault();
    menu.classList.toggle('show');
    var arrow = toggle.querySelector('.arrow');
    if (arrow) {
      arrow.textContent = menu.classList.contains('show') ? '\u25B2' : '\u25BC';
    }
  });
});
