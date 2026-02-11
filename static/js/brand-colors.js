(function () {
  'use strict';

  function copyWithFallback(value) {
    var textarea = document.createElement('textarea');
    textarea.value = value;
    textarea.setAttribute('readonly', '');
    textarea.style.position = 'fixed';
    textarea.style.top = '-1000px';
    textarea.style.left = '-1000px';
    document.body.appendChild(textarea);
    textarea.focus();
    textarea.select();

    var copied = false;
    try {
      copied = document.execCommand('copy');
    } catch (error) {
      copied = false;
    }

    document.body.removeChild(textarea);
    return copied;
  }

  function copyValue(value) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      return navigator.clipboard.writeText(value)
        .then(function () { return true; })
        .catch(function () { return copyWithFallback(value); });
    }

    return Promise.resolve(copyWithFallback(value));
  }

  function parseColorFromValue(value) {
    if (!value) {
      return null;
    }

    var trimmed = value.trim();
    if (/^#[0-9A-Fa-f]{3}([0-9A-Fa-f]{3})?$/.test(trimmed) || /^#[0-9A-Fa-f]{8}$/.test(trimmed)) {
      return trimmed;
    }

    if (/^rgba?\([0-9,\s.]+\)$/.test(trimmed)) {
      return trimmed;
    }

    if (/^\d{1,3}\s*,\s*\d{1,3}\s*,\s*\d{1,3}$/.test(trimmed)) {
      return 'rgb(' + trimmed + ')';
    }

    return null;
  }

  function getCardSwatchColor(card, valueCode) {
    var parsed = parseColorFromValue(valueCode ? valueCode.textContent : '');
    if (parsed) {
      return parsed;
    }

    var swatch = card.querySelector('.brand-swatch');
    if (!swatch) {
      return null;
    }

    var resolved = window.getComputedStyle(swatch).backgroundColor;
    if (!resolved || resolved === 'rgba(0, 0, 0, 0)' || resolved === 'transparent') {
      return null;
    }

    return resolved;
  }

  function buildMiniSwatch(color) {
    var swatch = document.createElement('span');
    swatch.className = 'brand-mini-swatch';
    swatch.setAttribute('aria-hidden', 'true');

    if (color) {
      swatch.style.background = color;
    }

    return swatch;
  }

  function setButtonState(button, state, label) {
    button.dataset.copyState = state;
    button.textContent = label;

    window.setTimeout(function () {
      button.dataset.copyState = '';
      button.textContent = button.dataset.defaultLabel;
    }, 1200);
  }

  function buildCopyButton(label, value) {
    var button = document.createElement('button');
    button.type = 'button';
    button.className = 'brand-copy-btn';
    button.textContent = label;
    button.dataset.defaultLabel = label;
    button.setAttribute('aria-label', label + ' ' + value);

    button.addEventListener('click', function () {
      copyValue(value).then(function (ok) {
        if (ok) {
          setButtonState(button, 'ok', 'Copied');
        } else {
          setButtonState(button, 'error', 'Copy failed');
        }
      });
    });

    return button;
  }

  function buildCardActions(card) {
    var tokenCode = card.querySelector('.brand-token code');
    var valueCode = card.querySelector('.brand-value code');

    if (!tokenCode && !valueCode) {
      return;
    }

    var actions = document.createElement('div');
    actions.className = 'brand-copy-actions';
    var color = getCardSwatchColor(card, valueCode);

    if (tokenCode) {
      actions.appendChild(buildCopyButton('Copy token', tokenCode.textContent.trim()));
    }

    if (valueCode) {
      valueCode.prepend(buildMiniSwatch(color));
      actions.appendChild(buildCopyButton('Copy value', valueCode.textContent.trim()));
    }

    card.appendChild(actions);
  }

  function initBrandColorsPage() {
    var root = document.querySelector('.brand-colors-page');
    if (!root) {
      return;
    }

    var cards = root.querySelectorAll('.brand-card');
    cards.forEach(buildCardActions);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initBrandColorsPage);
  } else {
    initBrandColorsPage();
  }
})();
