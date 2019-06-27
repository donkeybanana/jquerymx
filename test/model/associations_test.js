import '../../model/model.js';
import '../../dom/fixture/fixture.js';
import { assert, module, test } from 'qunit/qunit/qunit.js';

module('model/associations', {
  beforeEach: function() {
    $.Model.extend('MyTest.Person', {
      serialize: function() {
        return 'My name is ' + this.name;
      }
    });
    $.Model.extend('MyTest.Loan');
    $.Model.extend('MyTest.Issue');

    $.Model.extend(
      'MyTest.Customer',
      {
        attributes: {
          person: 'MyTest.Person.model',
          loans: 'MyTest.Loan.models',
          issues: 'MyTest.Issue.models'
        },

        update: function(id, attrs, success, error) {
          const { loans, issues, ...params } = attrs;
          return $.ajax({
            url: '/people/' + id,
            data: params,
            type: 'post',
            dataType: 'json',
            fixture: function() {
              return [
                {
                  loansAttr: attrs.loans,
                  personAttr: attrs.person
                }
              ];
            },
            success: success
          });
        }
      },
      {}
    );
  }
});

test('associations work', function() {
  var c = new MyTest.Customer({
    id: 5,
    person: {
      id: 1,
      name: 'Justin'
    },
    issues: [],
    loans: [
      {
        amount: 1000,
        id: 2
      },
      {
        amount: 19999,
        id: 3
      }
    ]
  });
  assert.equal(c.person.name, 'Justin', 'association present');
  assert.equal(c.person.Class, MyTest.Person, 'belongs to association typed');

  assert.equal(c.issues.length, 0);

  assert.equal(c.loans.length, 2);

  assert.equal(c.loans[0].Class, MyTest.Loan);
});

test('Model association serialize on save', function(assert) {
  const done = assert.async();
  var c = new MyTest.Customer({
    id: 5,
    person: {
      id: 1,
      name: 'thecountofzero'
    },
    issues: [],
    loans: []
  });

  c.save().then(function(customer) {
    assert.equal(
      customer.personAttr,
      'My name is thecountofzero',
      'serialization works'
    );
    done();
  });
});

test('Model.List association serialize on save', function(assert) {
  const done = assert.async();
  var c = new MyTest.Customer({
    id: 5,
    person: {
      id: 1,
      name: 'thecountofzero'
    },
    issues: [],
    loans: [
      {
        amount: 1000,
        id: 2
      },
      {
        amount: 19999,
        id: 3
      }
    ]
  });

  c.save().then(function(customer) {
    assert.ok(
      customer.loansAttr._namespace === undefined,
      '_namespace does not exist'
    );
    assert.ok(customer.loansAttr._data === undefined, '_data does not exist');
    assert.ok(
      customer.loansAttr._use_call === undefined,
      '_use_call does not exist'
    );
    assert.ok(
      customer.loansAttr._changed === undefined,
      '_changed does not exist'
    );
    done();
  });
});
