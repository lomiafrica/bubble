(function () {
  'use strict';

  var STORAGE_KEY = 'lomi_bubble_checkout_redirect';

  window.__lomiBubblePlugin = window.__lomiBubblePlugin || { version: '1.0.0' };

  window.__lomiBubblePlugin.markCheckoutRedirect = function () {
    try {
      sessionStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ startedAt: Date.now() }),
      );
    } catch (e) {
      // sessionStorage unavailable
    }
  };

  window.__lomiBubblePlugin.clearCheckoutRedirect = function () {
    try {
      sessionStorage.removeItem(STORAGE_KEY);
    } catch (e) {
      // ignore
    }
  };

  window.__lomiBubblePlugin.handleAbandonedCheckout = function (options) {
    options = options || {};
    var raw;
    try {
      raw = sessionStorage.getItem(STORAGE_KEY);
    } catch (e) {
      return false;
    }
    if (!raw) {
      return false;
    }

    window.__lomiBubblePlugin.clearCheckoutRedirect();

    if (typeof options.onAbandon === 'function') {
      options.onAbandon();
    }

    if (options.dispatchEvent !== false) {
      try {
        window.dispatchEvent(
          new CustomEvent('lomi:checkout-abandon', {
            detail: options.detail || {},
          }),
        );
      } catch (e) {
        // CustomEvent unsupported
      }
    }

    return true;
  };

  function onPageShow(event) {
    if (event.persisted) {
      window.__lomiBubblePlugin.handleAbandonedCheckout();
    }
  }

  document.addEventListener('DOMContentLoaded', function () {
    window.__lomiBubblePlugin.handleAbandonedCheckout();
  });

  window.addEventListener('pageshow', onPageShow);
})();
