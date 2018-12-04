import '../../dom/form_params/form_params.js';
import '../../view/micro/micro.js';
import { module, test } from 'qunit/qunit/qunit.js';

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

test('with a form', function(assert) {
  $('#qunit-test-area').html('test/dom/form_params/basics.micro', {});

  var formParams = $('#qunit-test-area form').formParams();
  ok(formParams.params.one === '1', 'one is right');
  ok(formParams.params.two === '2', 'two is right');
  ok(formParams.params.three === '3', 'three is right');
  same(formParams.params.four, ['4', '1'], 'four is right');
  same(formParams.params.five, ['2', '3'], 'five is right');
  equal(typeof formParams.id, 'string', 'Id value is empty');

  equal(
    typeof formParams.singleRadio,
    'string',
    'Type of single named radio is string'
  );
  equal(formParams.singleRadio, '2', 'Value of single named radio is right');

  ok(
    $.isArray(formParams.lastOneChecked),
    'Type of checkbox with last option checked is array'
  );
  equal(
    formParams.lastOneChecked,
    '4',
    'Value of checkbox with the last option checked is 4'
  );
});

test('With a non-form element', function(assert) {
  $('#qunit-test-area').html(
    '//jquery/dom/form_params/test/non-form.micro',
    {}
  );

  var formParams = $('#divform').formParams();

  equal(formParams.id, 'foo-bar-baz', 'ID input read correctly');
});

test('with true false', function(assert) {
  $('#qunit-test-area').html('//jquery/dom/form_params/test/truthy.micro', {});

  var formParams = $('#qunit-test-area form').formParams(true);
  ok(formParams.foo === undefined, 'foo is undefined');
  ok(formParams.bar.abc === true, 'form bar is true');
  ok(formParams.bar.def === true, 'form def is true');
  ok(formParams.bar.ghi === undefined, 'form def is undefined');
  ok(formParams.wrong === false, "'false' should become false");
});

test('just strings', function(assert) {
  $('#qunit-test-area').html('//jquery/dom/form_params/test/basics.micro', {});
  var formParams = $('#qunit-test-area form').formParams(false);
  ok(formParams.params.one === '1', 'one is right');
  ok(formParams.params.two === '2', 'two is right');
  ok(formParams.params.three === '3', 'three is right');
  same(formParams.params.four, ['4', '1'], 'four is right');
  same(formParams.params.five, ['2', '3'], 'five is right');
  $('#qunit-test-area').html('');
});

test('empty string conversion', function(assert) {
  $('#qunit-test-area').html('//jquery/dom/form_params/test/basics.micro', {});
  var formParams = $('#qunit-test-area form').formParams(false);
  ok('' === formParams.empty, 'Default empty string conversion');
  formParams = $('#qunit-test-area form').formParams(true);
  ok(undefined === formParams.empty, 'Default empty string conversion');
});

test('missing names', function(assert) {
  $('#qunit-test-area').html(
    '//jquery/dom/form_params/test/checkbox.micro',
    {}
  );
  var formParams = $('#qunit-test-area form').formParams();
  ok(true, 'does not break');
});

test('same input names to array', function(assert) {
  $('#qunit-test-area').html('//jquery/dom/form_params/test/basics.micro', {});
  var formParams = $('#qunit-test-area form').formParams(true);
  same(formParams.param1, ['first', 'second', 'third']);
});
