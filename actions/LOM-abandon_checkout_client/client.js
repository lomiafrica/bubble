function (properties, context) {
  var detail = {
    checkout_session_id: properties.checkout_session_id || '',
    bubble_thing_id: properties.bubble_thing_id || '',
  };

  if (
    window.__lomiBubblePlugin &&
    typeof window.__lomiBubblePlugin.handleAbandonedCheckout === 'function'
  ) {
    window.__lomiBubblePlugin.handleAbandonedCheckout({ detail: detail });
    return;
  }

  try {
    sessionStorage.removeItem('lomi_bubble_checkout_redirect');
    window.dispatchEvent(new CustomEvent('lomi:checkout-abandon', { detail: detail }));
  } catch (e) {
    // ignore
  }
}
