import '../../lang/observe/delegate/delegate.js';
import { assert, module, test } from 'qunit/qunit/qunit.js';

module('lang/observe');

test('Basic Observe', function() {
  var state = new $.O({
    category: 5,
    productType: 4,
    properties: {
      brand: [],
      model: [],
      price: []
    }
  });

  var added;

  state.bind('change', function(ev, attr, how, val, old) {
    assert.equal(attr, 'properties.brand.0', 'correct change name');
    assert.equal(how, 'add');
    assert.equal(val[0].attr('foo'), 'bar', 'correct');

    added = val[0];
  });

  state.attr('properties.brand').push({ foo: 'bar' });
  state.unbind('change');

  added.bind('change', function(ev, attr, how, val, old) {
    assert.equal(attr, 'foo');
    assert.equal(how, 'set');
    assert.equal(val, 'zoo');
  });
  state.bind('change', function(ev, attr, how, val, old) {
    assert.equal(attr, 'properties.brand.0.foo');
    assert.equal(how, 'set');
    assert.equal(val, 'zoo');
  });
  added.attr('foo', 'zoo');
});

test('list splice', function() {
  var l = new $.Observe.List([0, 1, 2, 3]),
    first = true;

  l.bind('change', function(ev, attr, how, newVals, oldVals) {
    assert.equal(attr, '1');
    // where comes from the attr ...
    //assert.equal(where, 1)
    if (first) {
      assert.equal(how, 'remove', 'removing items');
      assert.equal(newVals, undefined, 'no new Vals');
    } else {
      assert.deepEqual(newVals, ['a', 'b'], 'got the right newVals');
      assert.equal(how, 'add', 'adding items');
    }

    first = false;
  });

  l.splice(1, 2, 'a', 'b');
  assert.deepEqual(l.serialize(), [0, 'a', 'b', 3], 'serialized');
});

test('list pop', function() {
  var l = new $.Observe.List([0, 1, 2, 3]);

  l.bind('change', function(ev, attr, how, newVals, oldVals) {
    assert.equal(attr, '3');
    assert.equal(how, 'remove');
    assert.equal(newVals, undefined);
    assert.deepEqual(oldVals, [3]);
  });

  l.pop();
  assert.deepEqual(l.serialize(), [0, 1, 2]);
});

test('changing an object unbinds', function() {
  var state = new $.Observe({
      category: 5,
      productType: 4,
      properties: {
        brand: [],
        model: [],
        price: []
      }
    }),
    count = 0;

  var brand = state.attr('properties.brand');

  state.bind('change', function(ev, attr, how, val, old) {
    assert.equal(attr, 'properties.brand');

    assert.equal(count, 0, 'count called once');
    count++;
    assert.equal(how, 'set');
    assert.equal(val[0], 'hi');
  });
  if (typeof console != 'undefined') console.log('before');
  state.attr('properties.brand', ['hi']);
  if (typeof console != 'undefined') console.log('after');

  brand.push(1, 2, 3);
});

test('replacing with an object that object becomes observable', function() {
  var state = new $.Observe({
    properties: {
      brand: [],
      model: [],
      price: []
    }
  });

  assert.ok(state.attr('properties').bind, 'has bind function');

  state.attr('properties', {});

  assert.ok(state.attr('properties').bind, 'has bind function');
});

test('remove attr', function() {
  var state = new $.Observe({
    properties: {
      brand: [],
      model: [],
      price: []
    }
  });

  state.bind('change', function(ev, attr, how, newVal, old) {
    assert.equal(attr, 'properties');
    assert.equal(how, 'remove');
    assert.deepEqual(old.serialize(), {
      brand: [],
      model: [],
      price: []
    });
  });

  state.removeAttr('properties');
  assert.equal(undefined, state.attr('properties'));
});

test('attrs', function() {
  var state = new $.Observe({
    properties: {
      foo: 'bar',
      brand: []
    }
  });

  state.bind('change', function(ev, attr, how, newVal) {
    assert.equal(attr, 'properties.foo');
    assert.equal(newVal, 'bad');
  });

  state.attrs({
    properties: {
      foo: 'bar',
      brand: []
    }
  });

  state.attrs({
    properties: {
      foo: 'bad',
      brand: []
    }
  });

  state.unbind('change');

  state.bind('change', function(ev, attr, how, newVal) {
    assert.equal(attr, 'properties.brand.0');
    assert.equal(how, 'add');
    assert.deepEqual(newVal, ['bad']);
  });

  state.attrs({
    properties: {
      foo: 'bad',
      brand: ['bad']
    }
  });
});

test('empty get', function() {
  var state = new $.Observe({});

  assert.equal(state.attr('foo.bar'), undefined);
});

test('attrs deep array ', function() {
  var state = new $.Observe({});
  var arr = [
      {
        foo: 'bar'
      }
    ],
    thing = {
      arr: arr
    };

  state.attrs(
    {
      thing: thing
    },
    true
  );

  assert.ok(thing.arr === arr, 'thing unmolested');
});

test('attrs semi-serialize', function() {
  var first = {
      foo: { bar: 'car' },
      arr: [1, 2, 3, { four: '5' }]
    },
    compare = $.extend(true, {}, first);
  var res = new $.Observe(first).attrs();
  assert.deepEqual(res, compare, 'test');
});

test('attrs sends events after it is done', function() {
  var state = new $.Observe({ foo: 1, bar: 2 });
  state.bind('change', function() {
    assert.equal(state.attr('foo'), -1, 'foo set');
    assert.equal(state.attr('bar'), -2, 'bar set');
  });
  state.attrs({ foo: -1, bar: -2 });
});

test('direct property access', function() {
  var state = new $.Observe({ foo: 1, attrs: 2 });
  assert.equal(state.foo, 1);
  assert.equal(typeof state.attrs, 'function');
});

test('pop unbinds', function() {
  var l = new $.O([{ foo: 'bar' }]);
  var o = l.attr(0),
    count = 0;
  l.bind('change', function(ev, attr, how, newVal, oldVal) {
    count++;
    if (count == 1) {
      // the prop change
      assert.equal(attr, '0.foo', 'count is set');
    } else if (count === 2) {
      assert.equal(how, 'remove');
      assert.equal(attr, '0');
    } else {
      assert.ok(false, 'called too many times');
    }
  });

  assert.equal(o.attr('foo'), 'bar');

  o.attr('foo', 'car');
  l.pop();
  o.attr('foo', 'bad');
});

test('splice unbinds', function() {
  var l = new $.Observe.List([{ foo: 'bar' }]);
  var o = l.attr(0),
    count = 0;
  l.bind('change', function(ev, attr, how, newVal, oldVal) {
    count++;
    if (count == 1) {
      // the prop change
      assert.equal(attr, '0.foo', 'count is set');
    } else if (count === 2) {
      assert.equal(how, 'remove');
      assert.equal(attr, '0');
    } else {
      assert.ok(false, 'called too many times');
    }
  });

  assert.equal(o.attr('foo'), 'bar');

  o.attr('foo', 'car');
  l.splice(0, 1);
  o.attr('foo', 'bad');
});

test('always gets right attr even after moving array items', function() {
  var l = new $.Observe.List([{ foo: 'bar' }]);
  var o = l.attr(0);
  l.unshift('A new Value');

  l.bind('change', function(ev, attr, how) {
    assert.equal(attr, '1.foo');
  });

  o.attr('foo', 'led you');
});
