(function () {
  'use strict';

  function copyValue(value) {
    if (navigator.clipboard?.writeText) {
      return navigator.clipboard.writeText(value)
        .then(function () { return true; })
        .catch(function () { return false; });
    }

    return Promise.resolve(false);
  }

  function getCardSwatchClass(card) {
    const swatch = card.querySelector('.brand-swatch');
    if (!swatch) {
      return null;
    }

    for (const className of swatch.classList) {
      if (className.startsWith('swatch-')) {
        return className;
      }
    }

    return null;
  }

  function buildMiniSwatch(swatchClass) {
    const swatch = document.createElement('span');
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

    globalThis.setTimeout(function () {
      button.classList.remove('is-copied', 'is-copy-error');
      button.textContent = button.dataset.defaultLabel;
    }, 1200);
  }

  function buildCopyButton(label, value) {
    const button = document.createElement('button');
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
    const tokenCode = card.querySelector('.brand-token code');
    const valueCode = card.querySelector('.brand-value code');

    if (!tokenCode && !valueCode) {
      return;
    }

    const actions = document.createElement('div');
    actions.className = 'brand-copy-actions';
    const swatchClass = getCardSwatchClass(card);

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
    const seen = new Set();
    const output = [];

    for (const value of values) {
      if (!seen.has(value)) {
        seen.add(value);
        output.push(value);
      }
    }

    return output;
  }

  function collectHexValues(root) {
    const values = Array.from(root.querySelectorAll('.brand-value code'))
      .map(function (node) { return node.textContent.trim(); })
      .filter(function (text) { return /^#[0-9A-Fa-f]{3,8}$/.test(text); });

    return uniquePreserveOrder(values);
  }

  function collectCssVars(root) {
    const vars = Array.from(root.querySelectorAll('.brand-token code'))
      .map(function (node) { return node.textContent.trim(); })
      .filter(function (text) { return /^--[A-Za-z0-9_-]+$/.test(text); });

    return uniquePreserveOrder(vars);
  }

  function wireCopyAllButtons(root) {
    const hexButton = root.querySelector('#copy-all-hex');
    const cssButton = root.querySelector('#copy-all-css');

    [hexButton, cssButton].forEach(function (button) {
      if (button) {
        button.dataset.defaultLabel = button.textContent.trim();
      }
    });

    if (hexButton) {
      hexButton.addEventListener('click', function () {
        const payload = collectHexValues(root).join('\n');
        copyValue(payload).then(function (ok) {
          setButtonState(hexButton, ok ? 'ok' : 'error', ok ? 'Copied HEX' : 'Copy failed');
        });
      });
    }

    if (cssButton) {
      cssButton.addEventListener('click', function () {
        const payload = collectCssVars(root).join('\n');
        copyValue(payload).then(function (ok) {
          setButtonState(cssButton, ok ? 'ok' : 'error', ok ? 'Copied vars' : 'Copy failed');
        });
      });
    }
  }

  function initBrandColorsPage() {
    const root = document.querySelector('.brand-colors-page');
    if (!root) {
      return;
    }

    const cards = root.querySelectorAll('.brand-card');
    cards.forEach(buildCardActions);
    wireCopyAllButtons(root);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initBrandColorsPage);
  } else {
    initBrandColorsPage();
  }
})();
