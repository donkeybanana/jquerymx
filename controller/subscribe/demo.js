steal('./subscribe.js', function() {
  const controller = $.Controller.extend(
    'subscribeTest',
    {
      onDocument: false
    },
    {
      init: el => {
        el.html(`
          <a href="#" id="publish">
            Publish to console.log
          </a>
        `);
      },
      '#publish click': function(el, ev) {
        ev.stopPropagation();

        this.publish('hola', { params: 'Hola Mundo' });
      },
      'hola subscribe': function(called, data) {
        console.log(called, data);
      }
    }
  );

  var instance = new controller($('#subscribe'));

  $('#off').bind('click', function() {
    instance.destroy();

    $('body').html('Destroyed!');
  });
});
