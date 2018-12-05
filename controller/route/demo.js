steal('./route.js', function() {
  $.Controller.extend('Router', {
    'foo/:bar route': function() {
      console.log('foo/:bar');
    },
    route: function() {
      console.log('route');
    }
  });

  new Router(window);
});
