import '../model/model.js';
import '../controller/controller.ts';
import '../view/ejs/ejs.js';
import '../model/fixture.js';

import { module, test } from 'qunit/qunit/qunit.js';

module('integration', {
  setup: function() {
    $('#qunit-test-area').html('');
  }
});

test('controller can listen to model instances and model classes', function(assert) {
  const done = assert.async();

  $('#qunit-test-area').html('');

  $.Controller.extend('Test.BinderThing', {
    '{model} created': function() {
      assert.ok(true, 'model called');
      done();
    },
    '{instance} created': function() {
      assert.ok(true, 'instance updated');
    }
  });

  $.Model.extend('Test.ModelThing', {
    create: function(attrs, success) {
      success({ id: 1 });
    }
  });

  var inst = new Test.ModelThing();

  $('<div>')
    .appendTo($('#qunit-test-area'))
    .test_binder_thing({
      model: Test.ModelThing,
      instance: inst
    });

  inst.save();
});

test('Model and Views', function(assert) {
  const done = assert.async();

  $.Model.extend(
    'Test.Thing',
    {
      findOne: '/thing'
    },
    {}
  );

  $.fixture('/thing', '//test/thing.json');

  $.View('//test/template.ejs', Test.Thing.findOne()).done(function(resolved) {
    assert.equal(resolved, 'foo', 'works');
    done();
  });
});
