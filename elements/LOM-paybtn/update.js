function (instance, properties, context) {
  var button = document.getElementById(instance.data.buttonId);
  var imageButton = document.getElementById(instance.data.buttonId + '-img');
  var block = document.getElementById(instance.data.buttonId + '-block');
  if (!button || !block) {
    return;
  }

  var useImage = properties.use_image_button === true;
  button.classList.toggle('hide', useImage);
  if (imageButton) {
    imageButton.classList.toggle('hide', !useImage);
  }

  button.textContent = properties.button_text || 'Pay with lomi.';
  if (properties.is_visible === false) {
    block.classList.add('hide');
  } else {
    block.classList.remove('hide');
  }

  var badge = block.querySelector('.lomi-secured-badge');
  if (badge) {
    badge.style.display = properties.show_badge === false ? 'none' : 'inline-block';
    if (instance.data.assetUrls && instance.data.assetUrls.securedByLomi) {
      badge.src = instance.data.assetUrls.securedByLomi;
    }
  }

  var payImage = block.querySelector('.lomi-pay-image');
  if (payImage && instance.data.assetUrls && instance.data.assetUrls.payWithLomi) {
    payImage.src = instance.data.assetUrls.payWithLomi;
  }

  var hasUrl = Boolean(properties.checkout_url);
  button.disabled = !hasUrl;
  button.classList.toggle('lomi-pay-button--disabled', !hasUrl);
  if (imageButton) {
    imageButton.disabled = !hasUrl;
    imageButton.classList.toggle('lomi-pay-image-button--disabled', !hasUrl);
  }

  var handler = function () {
    instance.data.goToCheckout(properties);
  };

  if (hasUrl) {
    button.onclick = handler;
    if (imageButton) {
      imageButton.onclick = handler;
    }
  }

  if (properties.checkout_url) {
    var sessionId = instance.data.parseSessionId(properties.checkout_url);
    if (sessionId) {
      instance.publishState('checkout_session_id', sessionId);
    }
    instance.publishState('checkout_url', properties.checkout_url);
  }
}
