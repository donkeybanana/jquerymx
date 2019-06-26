import '../../controller/controller.js';
import '../../view/micro/micro.js';
import { assert, module, test } from 'qunit/qunit/qunit.js';

module('controller/view');

test('this.view', function() {
  const C = $.Controller.extend('Test.Controller', {
    init: function() {
      this.element.html(this.view());
    }
  });
  jQuery.View.ext = '.micro';
  $('#qunit-test-area').append("<div id='cont_view'/>");

  new C($('#cont_view'));

  assert.ok(/Hello World/i.test($('#cont_view').text()), 'view rendered');
});

test('test.suffix.doubling', function() {
  const C = $.Controller.extend('Test.Controller', {
    init: function() {
      this.element.html(this.view('init.micro'));
    }
  });

  jQuery.View.ext = '.ejs'; // Reset view extension to default
  assert.equal('.ejs', jQuery.View.ext);

  $('#qunit-test-area').append("<div id='suffix_test_cont_view'/>");

  new C($('#suffix_test_cont_view'));

  assert.ok(
    /Hello World/i.test($('#suffix_test_cont_view').text()),
    'view rendered'
  );
});

test('complex paths nested inside a controller directory', function() {
  const C1 = $.Controller.extend('Myproject.Controllers.Foo.Bar');
  const path1 = jQuery.Controller._calculatePosition(C1, 'init.ejs', 'init');
  assert.equal(
    path1,
    '//myproject/views/foo/bar/init.ejs',
    'view path is correct'
  );
  assert.equal(
    path1,
    jQuery.Controller._calculatePosition(
      Myproject.Controllers.Foo.Bar,
      'init.ejs',
      'init'
    ),
    'same path is returned for global vs assigned Class'
  );

  const C2 = $.Controller.extend('Myproject.Controllers.FooBar');
  const path2 = jQuery.Controller._calculatePosition(C2, 'init.ejs', 'init');
  assert.equal(
    path2,
    '//myproject/views/foo_bar/init.ejs',
    'view path is correct'
  );
  assert.equal(
    path1,
    jQuery.Controller._calculatePosition(
      Myproject.Controllers.Foo.Bar,
      'init.ejs',
      'init'
    ),
    'same path is returned for global vs assigned Class'
  );
});
