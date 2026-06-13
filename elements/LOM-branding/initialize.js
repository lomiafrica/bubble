function (instance, context) {
  instance.data.blockId = 'lomi-branding-' + Date.now();
  instance.data.urls = {
    wave: '//dd7tel2830j4w.cloudfront.net/plugins/lomi/wave.webp',
    mtn: '//dd7tel2830j4w.cloudfront.net/plugins/lomi/mtn.webp',
    apple: '//dd7tel2830j4w.cloudfront.net/plugins/lomi/apple-pay.webp',
    google: '//dd7tel2830j4w.cloudfront.net/plugins/lomi/google-pay.webp',
    spi: '//dd7tel2830j4w.cloudfront.net/plugins/lomi/spi.webp',
    secured: '//dd7tel2830j4w.cloudfront.net/plugins/lomi/secured-by-lomi.webp',
  };

  var markup =
    '<div class="lomi-branding" id="' +
    instance.data.blockId +
    '">' +
    '<div class="lomi-branding__methods">' +
    '<img src="' +
    instance.data.urls.wave +
    '" alt="Wave" />' +
    '<img src="' +
    instance.data.urls.mtn +
    '" alt="MTN" />' +
    '<img src="' +
    instance.data.urls.apple +
    '" alt="Apple Pay" />' +
    '<img src="' +
    instance.data.urls.google +
    '" alt="Google Pay" />' +
    '<img src="' +
    instance.data.urls.spi +
    '" alt="SPI" />' +
    '</div>' +
    '<img class="lomi-branding__secured" alt="Secured by lomi." src="' +
    instance.data.urls.secured +
    '" />' +
    '</div>';

  instance.canvas.append($(markup));
}
