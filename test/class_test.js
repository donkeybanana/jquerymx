import 'class/class.js';
import { module, test } from 'qunit/qunit/qunit.js';

module('class');

test('Creating', function(assert) {
  jQuery.Class.extend(
    'Animal',
    {
      count: 0,
      test: function() {
        return this.match ? true : false;
      }
    },
    {
      init: function() {
        this.Class.count++;
        this.eyes = false;
      }
    }
  );
  Animal.extend(
    'Dog',
    {
      match: /abc/
    },
    {
      init: function() {
        this._super();
      },
      talk: function() {
        return 'Woof';
      }
    }
  );
  const Ajax = Dog.extend(
    'Ajax',
    {
      count: 0
    },
    {
      init: function(hairs) {
        this._super();
        this.hairs = hairs;
        this.setEyes();
      },
      setEyes: function() {
        this.eyes = true;
      }
    }
  );
  new Dog();
  new Animal();
  new Animal();
  var ajax = new Ajax(1000);

  assert.equal(2, Animal.count, 'right number of animals');
  assert.equal(1, Dog.count, 'right number of animals');
  assert.ok(Dog.match, 'right number of animals');
  assert.ok(!Animal.match, 'right number of animals');
  assert.ok(Dog.test(), 'right number of animals');
  assert.ok(!Animal.test(), 'right number of animals');
  assert.equal(1, Ajax.count, 'right number of animals');
  assert.equal(2, Animal.count, 'right number of animals');
  assert.equal(true, ajax.eyes, 'right number of animals');
  assert.equal(1000, ajax.hairs, 'right number of animals');
});

// test('new instance', function({ equal }) {
//   var d = Ajax.newInstance(6);
//   equal(6, d.hairs);
// });

test('namespaces', function(assert) {
  var fb = $.Class.extend('Foo.Bar');
  assert.ok(Foo.Bar === fb, 'returns class');
  assert.equal(fb.shortName, 'Bar', 'short name is right');
  assert.equal(fb.fullName, 'Foo.Bar', 'fullName is right');
});

test('setups', function(assert) {
  var order = 0,
    staticSetup,
    staticSetupArgs,
    staticInit,
    staticInitArgs,
    protoSetup,
    protoInitArgs,
    protoInit,
    staticProps = {
      setup: function() {
        staticSetup = ++order;
        staticSetupArgs = arguments;
        return ['something'];
      },
      init: function() {
        staticInit = ++order;
        staticInitArgs = arguments;
      }
    },
    protoProps = {
      setup: function(name) {
        protoSetup = ++order;
        return ['Ford: ' + name];
      },
      init: function() {
        protoInit = ++order;
        protoInitArgs = arguments;
      }
    };
  $.Class.extend('Car', staticProps, protoProps);

  var geo = new Car('geo');
  assert.equal(staticSetup, 1);
  assert.equal(staticInit, 2);
  assert.equal(protoSetup, 3);
  assert.equal(protoInit, 4);

  assert.deepEqual($.makeArray(staticInitArgs), ['something']);
  assert.deepEqual($.makeArray(protoInitArgs), ['Ford: geo']);

  assert.deepEqual(
    $.makeArray(staticSetupArgs),
    [$.Class, 'Car', staticProps, protoProps],
    'static construct'
  );

  //now see if staticSetup gets called again ...
  const Truck = Car.extend('Truck');
  assert.equal(staticSetup, 5, 'Static setup is called if overwriting');
});

test('callback', function(assert) {
  var curVal = 0;
  $.Class.extend(
    'Car',
    {
      show: function(value) {
        assert.equal(curVal, value);
      }
    },
    {
      show: function(value) {}
    }
  );
  var cb = Car.callback('show');
  curVal = 1;
  cb(1);

  curVal = 2;
  var cb2 = Car.callback('show', 2);
  cb2();
});

test('callback error', function(assert) {
  assert.expect(1);

  $.Class.extend(
    'Car',
    {
      show: function(value) {
        assert.equal(curVal, value);
      }
    },
    {
      show: function(value) {}
    }
  );
  try {
    Car.callback('huh');
    assert.ok(false, 'I should have errored');
  } catch (e) {
    assert.ok(true, 'Error was thrown');
  }
});

test('Creating without extend', function(assert) {
  assert.expect(2);

  $.Class('Bar', {
    ok: function() {
      assert.ok(true, 'ok called');
    }
  });
  new Bar().ok();

  Bar('Foo', {
    dude: function(status) {
      assert.ok(status, 'dude called');
    }
  });
  new Foo().dude(true);
});

/* Not sure I want to fix this yet.
test("Super in derived when parent doesn't have init", function(){
	$.Class("Parent",{
	});
	
	Parent("Derived",{
		init : function(){
			this._super();
		}
	});

	try {
		new Derived();
		ok(true, "Can call super in init safely")
	} catch (e) {
		ok(false, "Failed to call super in init with error: " + e)
	}
})*/
