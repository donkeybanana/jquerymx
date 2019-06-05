import '../../../lang/observe/observe.js';
import '../../../lang/observe/delegate/delegate.js';
import { assert, module, test } from 'qunit/qunit/qunit.js';

module('lang/observe/delegate');

var matches = $.Observe.prototype.delegate.matches;

test('matches', function() {
  assert.equal(matches(['**'], ['foo', 'bar', '0']), 'foo.bar.0', 'everything');

  assert.equal(
    matches(['*.**'], ['foo']),
    null,
    'everything at least one level deep'
  );

  assert.equal(matches(['foo', '*'], ['foo', 'bar', '0']), 'foo.bar');

  assert.equal(matches(['*'], ['foo', 'bar', '0']), 'foo');

  assert.equal(matches(['*', 'bar'], ['foo', 'bar', '0']), 'foo.bar');
  // - props -
  // - returns - 'foo.bar'
});

test('list events', function() {
  var list = new $.Observe.List([
    { name: 'Justin' },
    { name: 'Brian' },
    { name: 'Austin' },
    { name: 'Mihael' }
  ]);
  list.comparator = 'name';
  list.sort();
  // events on a list
  // - move - item from one position to another
  //          due to changes in elements that change the sort order
  // - add (items added to a list)
  // - remove (items removed from a list)
  // - reset (all items removed from the list)
  // - change something happened

  // a move directly on this list
  list.bind('move', function(ev, item, newPos, oldPos) {
    assert.ok(true, 'move called');
    assert.equal(item.name, 'Zed');
    assert.equal(newPos, 3);
    assert.equal(oldPos, 0);
  });

  // a remove directly on this list
  list.bind('remove', function(ev, items, oldPos) {
    assert.ok(true, 'remove called');
    assert.equal(items.length, 1);
    assert.equal(items[0].name, 'Alexis');
    assert.equal(oldPos, 0, 'put in right spot');
  });
  list.bind('add', function(ev, items, newPos) {
    assert.ok(true, 'add called');
    assert.equal(items.length, 1);
    assert.equal(items[0].name, 'Alexis');
    assert.equal(newPos, 0, 'put in right spot');
  });

  list.push({ name: 'Alexis' });

  // now lets remove alexis ...
  list.splice(0, 1);
  list[0].attr('name', 'Zed');
});

test('delegate', function() {
  var state = new $.Observe({
    properties: {
      prices: []
    }
  });
  var prices = state.attr('properties.prices');

  state.delegate('properties.prices', 'change', function(
    ev,
    attr,
    how,
    val,
    old
  ) {
    assert.equal(attr, '0', 'correct change name');
    assert.equal(how, 'add');
    assert.equal(val[0].attr('foo'), 'bar', 'correct');
    assert.ok(this === prices, 'rooted element');
  });

  prices.push({ foo: 'bar' });

  state.undelegate();
});
test('delegate on add', function() {
  var state = new $.Observe({});

  state
    .delegate('foo', 'add', function(ev, newVal) {
      assert.ok(true, 'called');
      assert.equal(newVal, 'bar', 'got newVal');
    })
    .delegate('foo', 'remove', function() {
      assert.ok(false, 'remove should not be called');
    });

  state.attr('foo', 'bar');
});

test('delegate set is called on add', function() {
  var state = new $.Observe({});

  state.delegate('foo', 'set', function(ev, newVal) {
    assert.ok(true, 'called');
    assert.equal(newVal, 'bar', 'got newVal');
  });
  state.attr('foo', 'bar');
});

test("delegate's this", function() {
  var state = new $.Observe({
    person: {
      name: {
        first: 'justin',
        last: 'meyer'
      }
    },
    prop: 'foo'
  });
  var n = state.attr('person.name'),
    check;

  // listen to person name changes
  state.delegate(
    'person.name',
    'set',
    (check = function(ev, newValue, oldVal, from) {
      // make sure we are getting back the person.name
      assert.equal(this, n);
      assert.equal(newValue, 'Brian');
      assert.equal(oldVal, 'justin');
      // and how to get there
      assert.equal(from, 'first');
    })
  );
  n.attr('first', 'Brian');
  state.undelegate('person.name', 'set', check);
  // stop listening

  // now listen to changes in prop
  state.delegate('prop', 'set', function() {
    assert.equal(this, 'food');
  }); // this is weird, probably need to support direct bind ...

  // update the prop
  state.attr('prop', 'food');
});

test('delegate on deep properties with *', function() {
  var state = new $.Observe({
    person: {
      name: {
        first: 'justin',
        last: 'meyer'
      }
    }
  });

  state.delegate('person', 'set', function(ev, newVal, oldVal, attr) {
    assert.equal(this, state.attr('person'), 'this is set right');
    assert.equal(attr, 'name.first');
  });
  state.attr('person.name.first', 'brian');
});

test('compound sets', function() {
  var state = new $.Observe({
    type: 'person',
    id: '5'
  });
  var count = 0;
  state.delegate('type=person id', 'set', function() {
    assert.equal(state.type, 'person', 'type is person');
    assert.ok(state.id !== undefined, 'id has value');
    count++;
  });

  // should trigger a change
  state.attr('id', 0);
  assert.equal(count, 1, 'changing the id to 0 caused a change');

  // should not fire a set
  state.removeAttr('id');
  assert.equal(count, 1, 'removing the id changed nothing');

  state.attr('id', 3);
  assert.equal(count, 2, 'adding an id calls callback');

  state.attr('type', 'peter');
  assert.equal(count, 2, 'changing the type does not fire callback');

  state.removeAttr('type');
  state.removeAttr('id');

  assert.equal(count, 2, '');

  state.attrs({
    type: 'person',
    id: '5'
  });

  assert.equal(count, 3, 'setting person and id only fires 1 event');

  state.removeAttr('type');
  state.removeAttr('id');

  state.attrs({
    type: 'person'
  });
  assert.equal(count, 3, 'setting person does not fire anything');
});

test('undelegate within event loop', function() {
  var state = new $.Observe({
    type: 'person',
    id: '5'
  });
  var f1 = function() {
      state.undelegate('type', 'add', f2);
    },
    f2 = function() {
      assert.ok(false, 'I am removed, how am I called');
    },
    f3 = function() {
      state.undelegate('type', 'add', f1);
    },
    f4 = function() {
      assert.ok(true, 'f4 called');
    };
  state.delegate('type', 'set', f1);
  state.delegate('type', 'set', f2);
  state.delegate('type', 'set', f3);
  state.delegate('type', 'set', f4);
  state.attr('type', 'other');
});
