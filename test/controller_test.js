import { extend } from 'jquery';
import Controller from '../controller/controller.ts';
import OpenAjax from '../lang/openajax/openajax.js';

import { module, test, todo } from 'qunit/qunit/qunit.js';

module('controller');

test('subscribe testing works', function(assert) {
  class MyTest extends Controller {
    static bindings = {
      click: () => clicks++,
      'a.b subscribe': () => subscribes++
    };

    destroy() {
      super.destroy();

      destroys++;
    }
  }
  MyTest.registerPlugin();

  const ta = $('<div>click here</div>')
    .appendTo($('#qunit-test-area'))
    .my_test();

  var clicks = 0,
    destroys = 0,
    subscribes = 0;

  ta.trigger('click');
  assert.equal(clicks, 1, 'can listen to clicks');

  OpenAjax.hub.publish('a.b', {});
  assert.equal(subscribes, 1, 'can subscribe');

  const C = ta.controller('my_test');
  assert.ok(C.constructor == MyTest, 'can get controller');

  C.destroy();
  assert.equal(destroys, 1, 'destroy called once');
  assert.ok(!ta.controller(), 'controller is removed');

  OpenAjax.hub.publish('a.b', {});
  assert.equal(subscribes, 1, 'subscription is torn down');

  ta.trigger('click');
  assert.equal(clicks, 1, 'No longer listening');

  ta.my_test();
  ta.trigger('click');
  OpenAjax.hub.publish('a.b', {});
  assert.equal(clicks, 2, 'can listen again to clicks');
  assert.equal(subscribes, 2, 'can listen again to subscription');

  // @TODO cleanup on remove
  // ta.remove();
  ta.controller().destroy();

  ta.trigger('click');
  OpenAjax.hub.publish('a.b', {});
  assert.equal(clicks, 2, 'Clicks stopped');
  assert.equal(subscribes, 2, 'Subscribes stopped');

  $('#qunit-test-area').html('')
});

test('bind to any special', function(assert) {
  jQuery.event.special.crazyEvent = {};
  var called = false;

  class WeirdBind extends Controller {
    static bindings = {
      crazyEvent: function(el, ev) {
        called = true;

        $('#qunit-test-area').html('');
      }
    }
  }
  WeirdBind.registerPlugin();

  $('<div />')
    .appendTo($('#qunit-test-area'))
    .weird_bind()
    .trigger('crazyEvent');

  assert.ok(called, 'heard the trigger');
});

test('parameterized actions', function(assert) {
  var called = false;
  class WeirderBind extends Controller {
    static bindings = {
      '{parameterized}': function() {
        called = true;
      }
    };
  }
  const el = $("<div id='crazy'></div>").appendTo($('#qunit-test-area'));
  const C = new WeirderBind(el, {
    parameterized: 'sillyEvent'
  });
  el.trigger('sillyEvent');
  assert.ok(called, 'heard the trigger');

  $('#qunit-test-area').html('');
});

test('windowresize', function(assert) {
  var called = false;
  class WindowBind extends Controller {
    static bindings = {
      '{window} resize': function() {
        called = true;
        $('#qunit-test-area').html('');
      }
    };
  }
  WindowBind.registerPlugin();

  $('<div />')
    .appendTo($('#qunit-test-area'))
    .window_bind();

  $(window).trigger('resize');
  assert.ok(called, 'got window resize event');
});

test('delegate', function(assert) {
  var called = false;
  class DelegateTest extends Controller {
    static bindings = {
      '> span a click': function() {
        called = true;
        $('#qunit-test-area').html('');
      }
    };
  }
  DelegateTest.registerPlugin();

  $("<div><span><a href='#'>click me</a></span></div>")
    .appendTo($('#qunit-test-area'))
    .delegate_test()
    .find('a')
    .trigger('click');

  assert.ok(called, 'delegate works');
});

test('inherit events', function(assert) {
  var called = false;
  class Parent extends Controller {
    static bindings = {
      click: function() {
        called = true;
        $('#qunit-test-area').html('');
      }
    };
  }
  class Child extends Parent {}
  Child.registerPlugin();

  $("<div id='parent'><span><a href='#'>click me</a></span></div>")
    .appendTo($('#qunit-test-area'))
    .child()
    .trigger('click');

  assert.ok(called, 'inherited the click method');
});

test('objects in action', function(assert) {
  const item = { name: 'Justin' };
  class Thing extends Controller {
    static bindings = {
      '{item} someEvent': function(item, event) {
        assert.ok(true, 'called');
        assert.equal(event.type, 'someEvent', 'correct event');
        assert.equal(
          this.constructor.fullName,
          'Thing',
          'This is a controller instance'
        );
        assert.equal(item.name, 'Justin', 'Raw, not jQuery wrapped thing');

        $('#qunit-test-area').html('');
      }
    };
  }
  Thing.registerPlugin();

  $('<div />')
    .appendTo('#qunit-test-area')
    .thing({ item });

  $(item).trigger('someEvent');
});

test('dot', function(assert) {
  class Dot extends Controller {
    static bindings = {
      'foo.bar': function() {
        assert.ok(true, 'called');
        $('#qunit-test-area').html('');
      }
    };
  }
  Dot.registerPlugin();

  $('<div/>')
    .appendTo($('#qunit-test-area'))
    .dot()
    .trigger('foo.bar');
});

test('the right element', function(assert) {
  class FormTester extends Controller {
    init() {
      assert.equal(this.element[0].nodeName.toLowerCase(), 'form');
      $('#qunit-test-area').html('');
    }
  }
  FormTester.registerPlugin();

  $("<form><input name='one' /></form>")
    .appendTo($('#qunit-test-area'))
    .form_tester();
});

test('pluginName', function(assert) {
  class PluginName extends Controller {
    static get pluginName() {
      return 'my_plugin';
    }

    method() {
      assert.ok(true, 'Method called');
    }

    update(options) {
      super.update(options);
      assert.ok(true, 'Update called');
    }

    destroy() {
      assert.ok(true, 'Destroyed');
      super.destroy();
    }
  }
  PluginName.registerPlugin();

  assert.equal(
    typeof $.fn.my_plugin,
    'function',
    '$.fn.my_plugin should be a function'
  );

  const el = $('<div />')
    .addClass('existing_class')
    .appendTo($('#qunit-test-area'))
    .my_plugin();

  assert.ok(el.hasClass('my_plugin'), 'Should have class my_plugin');

  el.my_plugin();
  el.my_plugin('method');
  el.controller().destroy();

  assert.ok(
    !el.hasClass('my_plugin'),
    "Shouldn't have class my_plugin after being destroyed"
  );
  assert.ok(
    el.hasClass('existing_class'),
    'Existing class should still be there'
  );
});

test('inherit defaults', function(assert) {
  class ParentDefaults extends Controller {
    static defaults = {
      foo: 'bar'
    };
  }

  class ChildDefaults extends ParentDefaults {
    static defaults = extend(ParentDefaults.defaults, {
      bar: 'foo'
    });
  }

  class OverrideDefaults extends ParentDefaults {
    static defaults = {
      foobar: 'barfoo'
    };
  }

  assert.ok(
    ChildDefaults.defaults.foo === 'bar',
    'Class should inherit defaults from the parent class'
  );
  assert.ok(
    ChildDefaults.defaults.bar === 'foo',
    'Class should maintain own defaults'
  );

  assert.deepEqual(
    OverrideDefaults.defaults,
    {
      foobar: 'barfoo'
    },
    'Class which overrides should not inherit defaults'
  );

  const C = new ChildDefaults($('<div />'));

  assert.equal(
    C.options.foo,
    'bar',
    'Instance should inherit defaults from the parent class'
  );
  assert.equal(C.options.bar, 'foo', 'Instance should maintain own defaults');
});

test('update rebinding', function(assert) {
  var first = true;
  class Rebinder extends Controller {
    static bindings = {
      '{item} foo': function(item, ev) {
        if (first) {
          assert.equal(item.id, 1, 'first item');
          first = false;
        } else {
          assert.equal(item.id, 2, 'first item');
        }
      }
    };
  }

  Rebinder.registerPlugin();

  var item1 = { id: 1 },
    item2 = { id: 2 },
    el = $('<div>').rebinder({ item: item1 });

  $(item1).trigger('foo');

  el.rebinder({ item: item2 });

  $(item2).trigger('foo');
});
