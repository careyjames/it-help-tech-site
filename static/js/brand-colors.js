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

  function getCardSwatchClass(card) {
    var swatch = card.querySelector('.brand-swatch');
    if (!swatch) {
      return null;
    }

    var classList = Array.from(swatch.classList);
    for (var i = 0; i < classList.length; i += 1) {
      if (classList[i].indexOf('swatch-') === 0) {
        return classList[i];
      }
    }

    return null;
  }

  function buildMiniSwatch(swatchClass) {
    var swatch = document.createElement('span');
    swatch.className = 'brand-mini-swatch';
    swatch.setAttribute('aria-hidden', 'true');

    if (swatchClass) {
      swatch.classList.add(swatchClass);
    }

    return swatch;
  }

  function setButtonState(button, state, label) {
    button.classList.remove('is-copied', 'is-copy-error');
    if (state === 'ok') {
      button.classList.add('is-copied');
    } else if (state === 'error') {
      button.classList.add('is-copy-error');
    }
    button.textContent = label;

    window.setTimeout(function () {
      button.classList.remove('is-copied', 'is-copy-error');
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
    var swatchClass = getCardSwatchClass(card);

    if (tokenCode) {
      actions.appendChild(buildCopyButton('Copy token', tokenCode.textContent.trim()));
    }

    if (valueCode) {
      valueCode.prepend(buildMiniSwatch(swatchClass));
      actions.appendChild(buildCopyButton('Copy value', valueCode.textContent.trim()));
    }

    card.appendChild(actions);
  }

  function uniquePreserveOrder(values) {
    var seen = new Set();
    var output = [];

    values.forEach(function (value) {
      if (!seen.has(value)) {
        seen.add(value);
        output.push(value);
      }
    });

    return output;
  }

  function collectHexValues(root) {
    var values = Array.from(root.querySelectorAll('.brand-value code'))
      .map(function (node) { return node.textContent.trim(); })
      .filter(function (text) { return /^#[0-9A-Fa-f]{3,8}$/.test(text); });

    return uniquePreserveOrder(values);
  }

  function collectCssVars(root) {
    var vars = Array.from(root.querySelectorAll('.brand-token code'))
      .map(function (node) { return node.textContent.trim(); })
      .filter(function (text) { return /^--[A-Za-z0-9_-]+$/.test(text); });

    return uniquePreserveOrder(vars);
  }

  function wireCopyAllButtons(root) {
    var hexButton = root.querySelector('#copy-all-hex');
    var cssButton = root.querySelector('#copy-all-css');

    [hexButton, cssButton].forEach(function (button) {
      if (button) {
        button.dataset.defaultLabel = button.textContent.trim();
      }
    });

    if (hexButton) {
      hexButton.addEventListener('click', function () {
        var payload = collectHexValues(root).join('\n');
        copyValue(payload).then(function (ok) {
          setButtonState(hexButton, ok ? 'ok' : 'error', ok ? 'Copied HEX' : 'Copy failed');
        });
      });
    }

    if (cssButton) {
      cssButton.addEventListener('click', function () {
        var payload = collectCssVars(root).join('\n');
        copyValue(payload).then(function (ok) {
          setButtonState(cssButton, ok ? 'ok' : 'error', ok ? 'Copied vars' : 'Copy failed');
        });
      });
    }
  }

  function initBrandColorsPage() {
    var root = document.querySelector('.brand-colors-page');
    if (!root) {
      return;
    }

    var cards = root.querySelectorAll('.brand-card');
    cards.forEach(buildCardActions);
    wireCopyAllButtons(root);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initBrandColorsPage);
  } else {
    initBrandColorsPage();
  }
})();
