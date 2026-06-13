function (instance, properties, context) {
  var block = document.getElementById(instance.data.blockId);
  if (!block) {
    return;
  }

  if (properties.is_visible === false) {
    block.classList.add('hide');
  } else {
    block.classList.remove('hide');
  }

  var methods = block.querySelector('.lomi-branding__methods');
  var secured = block.querySelector('.lomi-branding__secured');
  if (methods) {
    methods.style.display = properties.show_methods === false ? 'none' : 'flex';
  }
  if (secured) {
    secured.style.display = properties.show_secured === false ? 'none' : 'inline-block';
  }
}
