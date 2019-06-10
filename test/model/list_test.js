import '../../model/list/list.js';
import '../../dom/fixture/fixture.js';
import { assert, module, test, todo } from 'qunit/qunit/qunit.js';

var people;

module('model/list', {
  beforeEach: function() {
    $.Model.extend('Person');
    $.Model.List.extend(
      'Person.List',
      {
        destroy: 'DELETE /person/destroyAll',
        update: 'PUT /person/updateAll'
      },
      {}
    );
    const p = [];
    for (var i = 0; i < 20; i++) {
      p.push(new Person({ id: 'a' + i }));
    }
    people = new Person.List(p);
  }
});

test('hookup with list', function() {
  var div = $('<div>');

  for (var i = 0; i < 20; i++) {
    var child = $('<div>');
    var p = new Person({ foo: 'bar' + i, id: i });
    p.hookup(child[0]);
    div.append(child);
  }
  var models = div.children().models();
  assert.ok(models.Class === Person.List, 'correct type');
  assert.equal(models.length, 20, 'Got 20 people');
});

test('create', function() {
  assert.equal(people.length, 20);

  assert.equal(people.get('a2')[0].id, 'a2', 'get works');
});

test('splice', function() {
  assert.ok(people.get('a1').length, 'something where a1 is');
  people.splice(1, 1);
  assert.equal(people.length, 19);
  assert.ok(!people.get('a1').length, 'nothing where a1 is');
});

test('remove', function() {
  var res = people.remove('a1');
  assert.ok(!people.get('a1').length, 'nothing where a1 is');
  assert.ok(res.length, 'got something array like');
  assert.equal(res[0].id, 'a1');
});

test('list from models', function() {
  var people = Person.models([{ id: 1 }, { id: 2 }]);
  assert.ok(people.elements, 'we can find elements from a list');
});

test('destroy a list', function(assert) {
  assert.expect(5);
  var people = Person.models([{ id: 1 }, { id: 2 }]);
  const done = assert.async();
  // make sure a request is made
  $.fixture('DELETE /person/destroyAll', function() {
    assert.ok(true, 'called right fixture');
    return true;
  });
  // make sure the people have a destroyed event
  people[0].bind('destroyed', function() {
    assert.ok(true, 'destroyed event called');
  });

  people.destroy(function(deleted) {
    assert.ok(true, 'destroy callback called');
    assert.equal(people.length, 0, 'objects removed');
    assert.equal(deleted.length, 2, 'got back deleted items');
    done();
    // make sure the list is empty
  });
});

test('destroy a list with nothing in it', function(assert) {
  var people = Person.models([]);
  const done = assert.async();

  // make sure a request is made
  $.fixture('DELETE /person/destroyAll', function() {
    assert.ok(true, 'called right fixture');
    return true;
  });

  people.destroy(function(deleted) {
    assert.ok(true, 'destroy callback called');
    assert.equal(deleted.length, people.length, 'got back deleted items');
    done();
  });
});

test('update a list', function(assert) {
  assert.expect(7);
  var people = Person.models([{ id: 1 }, { id: 2 }]),
    updateWith = {
      name: 'Justin',
      age: 29
    },
    newProps = {
      newProp: 'yes'
    };
  const done = assert.async();

  // make sure a request is made
  $.fixture('PUT /person/updateAll', function(orig) {
    assert.ok(true, 'called right fixture');
    assert.ok(orig.data.ids.length, 2, 'got 2 ids');
    assert.equal(orig.data.attrs, updateWith, 'got the same attrs');
    return newProps;
  });

  // make sure the people have a destroyed event
  people[0].bind('updated', function() {
    assert.ok(true, 'updated event called');
  });

  people.update(updateWith, function(updated) {
    assert.ok(true, 'updated callback called');
    assert.ok(updated.length, 2, 'got back deleted items');
    assert.propEqual(updated[0].attrs(), { id: 1, ...newProps, ...updateWith });
    done();
  });
});

test('update a list with nothing in it', function(assert) {
  var people = Person.models([]),
    updateWith = {
      name: 'Justin',
      age: 29
    };
  const done = assert.async();

  // make sure a request is made
  $.fixture('PUT /person/updateAll', function(orig) {
    assert.ok(true, 'called right fixture');
    return newProps;
  });

  people.update(updateWith, function(updated) {
    assert.ok(true, 'updated callback called');
    assert.equal(updated.length, people.length, 'nothing updated');
    done();
  });
});

test('events - add', function(assert) {
  const done = assert.async();
  assert.expect(3);

  var count = 0;
  var list = new Person.List();
  list.bind('add', function(ev, items) {
    count++;
    assert.equal(count, 1, 'add called the correct number of times');
    assert.equal(items.length, 1, 'we get an array');
  });

  list.push(new Person({ id: 1, name: 'alex' }));
  list.unbind('add');
  list.push(new Person({ id: 2, name: 'bob' }));
  assert.equal(list.length, 2, 'list length is correct');

  setTimeout(() => done(), 500);
});

test('events - updated', function(assert) {
  const done = assert.async();
  assert.expect(3);
  var list = new Person.List();
  list.bind('updated', function(ev, updated) {
    assert.ok(1, 'update called');
    assert.ok(person === updated, 'we get the person back');
    assert.equal(updated.name, 'Alex', 'got the right name');
    done();
  });

  var person = new Person({ id: 1, name: 'justin' });
  list.push(person);

  person.update({ name: 'Alex' });
});
