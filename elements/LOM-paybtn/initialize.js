function (instance, context) {
  instance.data.buttonId = 'lomi-btn-' + Date.now() + '-' + Math.floor(Math.random() * 100000);
  instance.data.assetUrls = {
    payWithLomi: '//dd7tel2830j4w.cloudfront.net/plugins/lomi/pay-with-lomi.webp',
    securedByLomi: '//dd7tel2830j4w.cloudfront.net/plugins/lomi/secured-by-lomi.webp',
  };

  instance.data.markRedirect = function () {
    if (
      window.__lomiBubblePlugin &&
      typeof window.__lomiBubblePlugin.markCheckoutRedirect === 'function'
    ) {
      window.__lomiBubblePlugin.markCheckoutRedirect();
    }
  };

  instance.data.parseSessionId = function (url) {
    if (!url) return '';
    try {
      var parsed = new URL(url);
      var fromQuery = parsed.searchParams.get('session_id');
      if (fromQuery) return fromQuery;
      var parts = parsed.pathname.split('/').filter(Boolean);
      return parts.length ? parts[parts.length - 1] : '';
    } catch (e) {
      return '';
    }
  };

  instance.data.goToCheckout = function (properties) {
    var url = properties.checkout_url;
    if (!url) {
      instance.triggerEvent('onerror');
      return;
    }

    var sessionId = instance.data.parseSessionId(url);
    instance.publishState('checkout_url', url);
    if (sessionId) {
      instance.publishState('checkout_session_id', sessionId);
    }
    instance.triggerEvent('onclick');
    instance.data.markRedirect();

    if (properties.checkout_mode === 'embed' && window.Lomi && window.Lomi.loadLomiCheckout) {
      window.Lomi.loadLomiCheckout({
        checkoutUrl: url,
        mode: 'modal',
        onComplete: function (payload) {
          if (window.__lomiBubblePlugin) {
            window.__lomiBubblePlugin.clearCheckoutRedirect();
          }
          if (payload && payload.sessionId) {
            instance.publishState('checkout_session_id', payload.sessionId);
          }
          try {
            window.dispatchEvent(
              new CustomEvent('lomi:checkout-complete', { detail: payload || {} }),
            );
          } catch (e) {
            // ignore
          }
          instance.triggerEvent('oncomplete');
        },
        onError: function () {
          instance.triggerEvent('onerror');
        },
      });
      return;
    }

    window.location.assign(url);
  };

  var blockId = instance.data.buttonId + '-block';
  var payImg = instance.data.assetUrls.payWithLomi;
  var markup =
    '<div class="lomi-pay-block hide" id="' +
    blockId +
    '">' +
    '<button type="button" class="lomi-pay-button" id="' +
    instance.data.buttonId +
    '">Pay with lomi.</button>' +
    '<button type="button" class="lomi-pay-image-button hide" id="' +
    instance.data.buttonId +
    '-img">' +
    '<img class="lomi-pay-image" alt="Pay with lomi." src="' +
    payImg +
    '" />' +
    '</button>' +
    '<img class="lomi-secured-badge" alt="Secured by lomi." src="' +
    instance.data.assetUrls.securedByLomi +
    '" />' +
    '</div>';

  instance.canvas.append($(markup));
}
