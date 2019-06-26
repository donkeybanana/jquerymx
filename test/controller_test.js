import '../controller/controller.ts';
import '../controller/subscribe/subscribe.js';

import { module, test } from 'qunit/qunit/qunit.js';

module('controller');

test('subscribe testing works', function(assert) {
  var ta = $('<div/>').appendTo($('#qunit-test-area'));

  ta.html('click here');

  var clicks = 0,
    destroys = 0;
  var subscribes = 0;
  $.Controller.extend('MyTest', {
    click: function() {
      clicks++;
    },
    'a.b subscribe': function() {
      subscribes++;
    },
    destroy: function() {
      this._super();
      destroys++;
    }
  });
  ta.my_test();
  ta.trigger('click');
  assert.equal(clicks, 1, 'can listen to clicks');

  OpenAjax.hub.publish('a.b', {});
  assert.equal(subscribes, 1, 'can subscribe');
  var controllerInstance = ta.controller('my_test');
  assert.ok(controllerInstance.Class == MyTest, 'can get controller');
  controllerInstance.destroy();

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

  ta.remove();

  ta.trigger('click');
  OpenAjax.hub.publish('a.b', {});
  assert.equal(clicks, 2, 'Clicks stopped');
  assert.equal(subscribes, 2, 'Subscribes stopped');
});

test('bind to any special', function(assert) {
  jQuery.event.special.crazyEvent = {};
  var called = false;
  jQuery.Controller.extend('WeirdBind', {
    crazyEvent: function() {
      called = true;
    }
  });
  var a = $("<div id='crazy'></div>").appendTo($('#qunit-test-area'));
  a.weird_bind();
  a.trigger('crazyEvent');
  assert.ok(called, 'heard the trigger');

  $('#qunit-test-area').html('');
});

test('parameterized actions', function(assert) {
  var called = false;
  jQuery.Controller.extend('WeirderBind', {
    '{parameterized}': function() {
      called = true;
    }
  });
  var a = $("<div id='crazy'></div>").appendTo($('#qunit-test-area'));
  a.weirder_bind({ parameterized: 'sillyEvent' });
  a.trigger('sillyEvent');
  assert.ok(called, 'heard the trigger');

  $('#qunit-test-area').html('');
});

test('windowresize', function(assert) {
  var called = false;
  jQuery.Controller.extend('WindowBind', {
    '{window} resize': function() {
      called = true;
    }
  });
  $('#qunit-test-area').html("<div id='weird'>");
  $('#weird').window_bind();
  $(window).trigger('resize');
  assert.ok(called, 'got window resize event');

  $('#qunit-test-area').html('');
});

// this.delegate(this.cached.header.find('tr'), "th", "mousemove", "th_mousemove");
test('delegate', function(assert) {
  var called = false;
  jQuery.Controller.extend('DelegateTest', {
    click: function() {}
  });
  var els = $("<div><span><a href='#'>click me</a></span></div>").appendTo(
    $('#qunit-test-area')
  );
  var c = els.delegate_test();
  c.controller().delegate(els.find('span'), 'a', 'click', function() {
    called = true;
  });
  els.find('a').trigger('click');
  assert.ok(called, 'delegate works');
  $('#qunit-test-area').html('');
});

test('inherit', function(assert) {
  var called = false;
  $.Controller.extend('Parent', {
    click: function() {
      called = true;
    }
  });
  Parent.extend('Child', {});
  var els = $("<div><span><a href='#'>click me</a></span></div>").appendTo(
    $('#qunit-test-area')
  );
  els.child();
  els.find('a').trigger('click');
  assert.ok(called, 'inherited the click method');
  $('#qunit-test-area').html('');
});

test('objects in action', function(assert) {
  $.Controller.extend('Thing', {
    '{item} someEvent': function(thing, ev) {
      assert.ok(true, 'called');
      assert.equal(ev.type, 'someEvent', 'correct event');
      assert.equal(
        this.constructor.fullName,
        'Thing',
        'This is a controller isntance'
      );
      assert.equal(thing.name, 'Justin', 'Raw, not jQuery wrapped thing');
    }
  });

  var thing1 = { name: 'Justin' };

  var ta = $('<div/>').appendTo($('#qunit-test-area'));
  ta.thing({ item: thing1 });

  $(thing1).trigger('someEvent');

  $('#qunit-test-area').html('');
});

test('dot', function(assert) {
  $.Controller.extend('Dot', {
    'foo.bar': function() {
      assert.ok(true, 'called');
    }
  });

  var ta = $('<div/>').appendTo($('#qunit-test-area'));
  ta.dot().trigger('foo.bar');
  $('#qunit-test-area').html('');
});

// HTMLFormElement[0] breaks
test('the right element', function(assert) {
  assert.expect(1);

  $.Controller.extend('FormTester', {
    init: function() {
      assert.equal(this.element[0].nodeName.toLowerCase(), 'form');
    }
  });
  $("<form><input name='one'/></form>")
    .appendTo($('#qunit-test-area'))
    .form_tester();
  $('#qunit-test-area').html('');
});

test('pluginName', function(assert) {
  // Testing for controller pluginName fixes as reported in
  // http://forum.javascriptmvc.com/#topic/32525000000253001
  // http://forum.javascriptmvc.com/#topic/32525000000488001
  assert.expect(6);

  $.Controller.extend(
    'PluginName',
    {
      pluginName: 'my_plugin'
    },
    {
      method: function(arg) {
        assert.ok(true, 'Method called');
      },

      update: function(options) {
        this._super(options);
        assert.ok(true, 'Update called');
      },

      destroy: function() {
        assert.ok(true, 'Destroyed');
        this._super();
      }
    }
  );

  var ta = $('<div/>')
    .addClass('existing_class')
    .appendTo($('#qunit-test-area'));
  ta.my_plugin(); // Init
  assert.ok(ta.hasClass('my_plugin'), 'Should have class my_plugin');
  ta.my_plugin(); // Update
  ta.my_plugin('method'); // method()
  ta.controller().destroy(); // destroy
  assert.ok(
    !ta.hasClass('my_plugin'),
    "Shouldn't have class my_plugin after being destroyed"
  );
  assert.ok(
    ta.hasClass('existing_class'),
    'Existing class should still be there'
  );
});

test('inherit defaults', function(assert) {
  $.Controller.extend(
    'BaseController',
    {
      defaults: {
        foo: 'bar'
      }
    },
    {}
  );

  BaseController.extend(
    'InheritingController',
    {
      defaults: {
        newProp: 'newVal'
      }
    },
    {}
  );

  assert.ok(
    InheritingController.defaults.foo === 'bar',
    'Class must inherit defaults from the parent class'
  );
  assert.ok(
    InheritingController.defaults.newProp == 'newVal',
    'Class must have own defaults'
  );
  var inst = new InheritingController($('<div/>'), {});
  assert.ok(
    inst.options.foo === 'bar',
    'Instance must inherit defaults from the parent class'
  );
  assert.ok(
    inst.options.newProp == 'newVal',
    'Instance must have defaults of it`s class'
  );
});

test('update rebinding', function(assert) {
  assert.expect(2);

  var first = true;
  $.Controller.extend('Rebinder', {
    '{item} foo': function(item, ev) {
      if (first) {
        assert.equal(item.id, 1, 'first item');
        first = false;
      } else {
        assert.equal(item.id, 2, 'first item');
      }
    }
  });

  var item1 = { id: 1 },
    item2 = { id: 2 },
    el = $('<div>').rebinder({ item: item1 });

  $(item1).trigger('foo');

  el.rebinder({ item: item2 });

  $(item2).trigger('foo');
});
