function (properties, context) {
  var url = properties.checkout_url;
  if (!url) {
    throw new Error('checkout_url is required. Run “Create checkout session” first.');
  }
  if (
    window.__lomiBubblePlugin &&
    typeof window.__lomiBubblePlugin.markCheckoutRedirect === 'function'
  ) {
    window.__lomiBubblePlugin.markCheckoutRedirect();
  }
  if (properties.open_in_new_tab) {
    window.open(url, '_blank', 'noopener,noreferrer');
    return;
  }
  window.location.assign(url);
}
