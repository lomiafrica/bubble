function (properties, context) {
  var url = properties.checkout_url;
  if (!url) {
    throw new Error('checkout_url is required');
  }

  var dispatchComplete = function (payload) {
    try {
      window.dispatchEvent(
        new CustomEvent('lomi:checkout-complete', { detail: payload || {} }),
      );
    } catch (e) {
      // ignore
    }
    if (properties.trigger_complete_event) {
      if (typeof bubble_fn_lomi_checkout_complete === 'function') {
        bubble_fn_lomi_checkout_complete(payload);
      }
    }
  };

  if (typeof window.Lomi !== 'undefined' && window.Lomi.loadLomiCheckout) {
    if (
      window.__lomiBubblePlugin &&
      typeof window.__lomiBubblePlugin.markCheckoutRedirect === 'function'
    ) {
      window.__lomiBubblePlugin.markCheckoutRedirect();
    }
    window.Lomi.loadLomiCheckout({
      checkoutUrl: url,
      mode: properties.mode || 'modal',
      onComplete: function (payload) {
        if (
          window.__lomiBubblePlugin &&
          typeof window.__lomiBubblePlugin.clearCheckoutRedirect === 'function'
        ) {
          window.__lomiBubblePlugin.clearCheckoutRedirect();
        }
        dispatchComplete(payload);
      },
      onError: function (err) {
        console.error('lomi. checkout error', err);
        try {
          window.dispatchEvent(
            new CustomEvent('lomi:checkout-error', { detail: err || {} }),
          );
        } catch (e) {
          // ignore
        }
      },
    });
    return;
  }

  if (
    window.__lomiBubblePlugin &&
    typeof window.__lomiBubblePlugin.markCheckoutRedirect === 'function'
  ) {
    window.__lomiBubblePlugin.markCheckoutRedirect();
  }
  window.location.assign(url);
}
