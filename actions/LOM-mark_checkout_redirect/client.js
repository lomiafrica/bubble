function (properties, context) {
  if (
    window.__lomiBubblePlugin &&
    typeof window.__lomiBubblePlugin.markCheckoutRedirect === 'function'
  ) {
    window.__lomiBubblePlugin.markCheckoutRedirect();
  }
}
