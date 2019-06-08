import '../../model/validations/validations.js';
import { assert, module, test } from 'qunit/qunit/qunit.js';

module('model/validations', {
  beforeEach: function() {
    $.Model.extend('Person', {}, {});
  }
});

test('models can validate, events, callbacks', function(assert) {
  assert.expect(11);
  Person.validate('age', { message: "it's a date type" }, function(val) {
    return !(val instanceof Date);
  });

  var task = new Person({ age: 'bad' }),
    errors = task.errors();

  assert.ok(errors, 'There are errors');
  assert.equal(errors.age.length, 1, 'there is one error');
  assert.equal(errors.age[0], "it's a date type", 'error message is right');

  task.bind('error.age', function(ev, errs) {
    assert.ok(this === task, 'we get task back by binding');

    assert.ok(errs, 'There are errors');
    assert.equal(errs.age.length, 1, 'there is one error');
    assert.equal(errs.age[0], "it's a date type", 'error message is right');
  });

  task.attr('age', 'blah');

  task.unbind('error.age');

  task.attr(
    'age',
    'blaher',
    function() {},
    function(errs) {
      assert.ok(this === task, 'we get task back in error handler');

      assert.ok(errs, 'There are errors');
      assert.equal(errs.age.length, 1, 'there is one error');
      assert.equal(errs.age[0], "it's a date type", 'error message is right');
    }
  );
});

test('validatesFormatOf', function() {
  Person.validateFormatOf('thing', /\d-\d/);

  assert.ok(!new Person({ thing: '1-2' }).errors(), 'no errors');

  var errors = new Person({ thing: 'foobar' }).errors();

  assert.ok(errors, 'there are errors');
  assert.equal(errors.thing.length, 1, 'one error on thing');

  assert.equal(errors.thing[0], 'is invalid', 'basic message');

  Person.validateFormatOf('otherThing', /\d/, { message: 'not a digit' });

  var errors2 = new Person({ thing: '1-2', otherThing: 'a' }).errors();

  assert.equal(
    errors2.otherThing[0],
    'not a digit',
    'can supply a custom message'
  );
});

test('validatesInclusionOf', function() {
  Person.validateInclusionOf('thing', ['yes', 'no', 'maybe']);

  assert.ok(!new Person({ thing: 'yes' }).errors(), 'no errors');

  var errors = new Person({ thing: 'foobar' }).errors();

  assert.ok(errors, 'there are errors');
  assert.equal(errors.thing.length, 1, 'one error on thing');

  assert.equal(
    errors.thing[0],
    'is not a valid option (perhaps out of range)',
    'basic message'
  );

  Person.validateInclusionOf('otherThing', ['yes', 'no', 'maybe'], {
    message: 'not a valid option'
  });

  var errors2 = new Person({ thing: 'yes', otherThing: 'maybe not' }).errors();

  assert.equal(
    errors2.otherThing[0],
    'not a valid option',
    'can supply a custom message'
  );
});

test('validatesLengthOf', function() {
  Person.validateLengthOf('thing', 2, 5);

  assert.ok(!new Person({ thing: 'yes' }).errors(), 'no errors');

  var errors = new Person({ thing: 'foobar' }).errors();

  assert.ok(errors, 'there are errors');
  assert.equal(errors.thing.length, 1, 'one error on thing');

  assert.equal(errors.thing[0], 'is too long (max=5)', 'basic message');

  Person.validateLengthOf('otherThing', 2, 5, { message: 'invalid length' });

  var errors2 = new Person({ thing: 'yes', otherThing: 'too long' }).errors();

  assert.equal(
    errors2.otherThing[0],
    'invalid length',
    'can supply a custom message'
  );
});

test('validatesPresenceOf', function() {
  $.Model.extend(
    'Task',
    {
      init: function() {
        this.validatePresenceOf('dueDate');
      }
    },
    {}
  );

  //test for undefined
  var task = new Task(),
    errors = task.errors();

  assert.ok(errors);
  assert.ok(errors.dueDate);
  assert.equal(errors.dueDate[0], "can't be empty", 'right message');

  //test for null
  task = new Task({ dueDate: null });
  errors = task.errors();

  assert.ok(errors);
  assert.ok(errors.dueDate);
  assert.equal(errors.dueDate[0], "can't be empty", 'right message');

  //test for ""
  task = new Task({ dueDate: '' });
  errors = task.errors();

  assert.ok(errors);
  assert.ok(errors.dueDate);
  assert.equal(errors.dueDate[0], "can't be empty", 'right message');

  //Affirmative test
  task = new Task({ dueDate: 'yes' });
  errors = task.errors();

  assert.ok(!errors, 'no errors ' + typeof errors);

  $.Model.extend(
    'Task',
    {
      init: function() {
        this.validatePresenceOf('dueDate', {
          message: 'You must have a dueDate'
        });
      }
    },
    {}
  );

  task = new Task({ dueDate: 'yes' });
  errors = task.errors();

  assert.ok(!errors, 'no errors ' + typeof errors);
});

test('validatesRangeOf', function() {
  Person.validateRangeOf('thing', 2, 5);

  assert.ok(!new Person({ thing: 4 }).errors(), 'no errors');

  var errors = new Person({ thing: 6 }).errors();

  assert.ok(errors, 'there are errors');
  assert.equal(errors.thing.length, 1, 'one error on thing');

  assert.equal(errors.thing[0], 'is out of range [2,5]', 'basic message');

  Person.validateRangeOf('otherThing', 2, 5, { message: 'value out of range' });

  var errors2 = new Person({ thing: 4, otherThing: 6 }).errors();

  assert.equal(
    errors2.otherThing[0],
    'value out of range',
    'can supply a custom message'
  );
});
