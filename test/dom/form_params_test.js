import '../../dom/form_params/form_params.js';
import '../../view/micro/micro.js';
import {assert, module, test } from 'qunit/qunit/qunit.js';

module('dom/form_params', {
  beforeEach: () =>
    $.ajaxSetup({
      cache: false
    }),
  afterEach: () =>
    $.ajaxSetup({
      cache: false
    })
});

test('with a form', function() {
  $('#qunit-test-area').html('test/dom/form_params/basics.micro', {});

  var formParams = $('#qunit-test-area form').formParams();
  assert.ok(formParams.params.one === '1', 'one is right');
  assert.ok(formParams.params.two === '2', 'two is right');
  assert.ok(formParams.params.three === '3', 'three is right');
  assert.deepEqual(formParams.params.four, ['4', '1'], 'four is right');
  assert.deepEqual(formParams.params.five, ['2', '3'], 'five is right');
  assert.equal(typeof formParams.id, 'string', 'Id value is empty');

  assert.equal(
    typeof formParams.singleRadio,
    'string',
    'Type of single named radio is string'
  );
  assert.equal(
    formParams.singleRadio,
    '2',
    'Value of single named radio is right'
  );

  assert.ok(
    $.isArray(formParams.lastOneChecked),
    'Type of checkbox with last option checked is array'
  );
  assert.equal(
    formParams.lastOneChecked,
    '4',
    'Value of checkbox with the last option checked is 4'
  );
});

test('With a non-form element', function() {
  $('#qunit-test-area').html('test/dom/form_params/non-form.micro', {});

  var formParams = $('#divform').formParams();

  assert.equal(formParams.id, 'foo-bar-baz', 'ID input read correctly');
});

test('with true false', function() {
  $('#qunit-test-area').html('test/dom/form_params/truthy.micro', {});

  var formParams = $('#qunit-test-area form').formParams(true);
  assert.ok(formParams.foo === undefined, 'foo is undefined');
  assert.ok(formParams.bar.abc === true, 'form bar is true');
  assert.ok(formParams.bar.def === true, 'form def is true');
  assert.ok(formParams.bar.ghi === undefined, 'form def is undefined');
  assert.ok(formParams.wrong === false, "'false' should become false");
});

test('just strings', function() {
  $('#qunit-test-area').html('test/dom/form_params/basics.micro', {});
  var formParams = $('#qunit-test-area form').formParams(false);
  assert.ok(formParams.params.one === '1', 'one is right');
  assert.ok(formParams.params.two === '2', 'two is right');
  assert.ok(formParams.params.three === '3', 'three is right');
  assert.deepEqual(formParams.params.four, ['4', '1'], 'four is right');
  assert.deepEqual(formParams.params.five, ['2', '3'], 'five is right');
  $('#qunit-test-area').html('');
});

test('empty string conversion', function() {
  $('#qunit-test-area').html('test/dom/form_params/basics.micro', {});
  var formParams = $('#qunit-test-area form').formParams(false);
  assert.ok('' === formParams.empty, 'Default empty string conversion');
  formParams = $('#qunit-test-area form').formParams(true);
  assert.ok(undefined === formParams.empty, 'Default empty string conversion');
});

test('missing names', function() {
  $('#qunit-test-area').html('test/dom/form_params/checkbox.micro', {});
  var formParams = $('#qunit-test-area form').formParams();
  assert.ok(true, 'does not break');
});

test('same input names to array', function() {
  $('#qunit-test-area').html('test/dom/form_params/basics.micro', {});
  var formParams = $('#qunit-test-area form').formParams(true);
  assert.deepEqual(formParams.param1, ['first', 'second', 'third']);
});
