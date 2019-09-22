import Controller from '../../controller/controller.ts';
import '../../view/micro/micro.js';
import { assert, module, test } from 'qunit/qunit/qunit.js';

module('controller/view');

test('this.view', function() {
  class ThisView extends Controller {
    static namespace = 'Test.Controller.View';
    init() {
      this.element.html(this.view('init'));
    }
  }
  ThisView.registerPlugin();
  jQuery.View.ext = '.micro';

  $("<div id='cont_view' />")
    .appendTo('#qunit-test-area')
    .test_view_this_view();

  assert.ok(/Hello World/i.test($('#cont_view').text()), 'view rendered');
  $('#qunit-test-area').html('');
});

test('test.suffix.doubling', function() {
  class SuffixDoubling extends Controller {
    static namespace = 'Test.Controller.View';
    init() {
      this.element.html(this.view('init.micro'));
    }
  }
  SuffixDoubling.registerPlugin();

  jQuery.View.ext = '.ejs';
  assert.equal('.ejs', jQuery.View.ext);

  $("<div id='suffix_test_cont_view'/>")
    .appendTo('#qunit-test-area')
    .test_view_suffix_doubling();

  assert.ok(
    /Hello World/i.test($('#suffix_test_cont_view').text()),
    'view rendered'
  );
  $('#qunit-test-area').html('');
});

test('complex paths nested inside a controller directory', function() {
  class Bar extends Controller {
    static namespace = 'Myproject.Controllers.Foo';
  }
  const barPath = Controller._calculatePosition(Bar, 'init.ejs', 'init');

  assert.equal(
    barPath,
    '//myproject/views/foo/bar/init.ejs',
    'view path is correct'
  );

  class FooBar extends Controller {
    static namespace = 'Myproject.Controllers';
  }
  const fooBarPath = Controller._calculatePosition(FooBar, 'init.ejs', 'init');

  assert.equal(
    fooBarPath,
    '//myproject/views/foo_bar/init.ejs',
    'view path is correct'
  );
});
