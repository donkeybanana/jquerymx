import '../../view/tmpl/tmpl.js';
import { assert, module, test, todo } from 'qunit/qunit/qunit.js';

module('view/tmpl');

test('ifs work', function() {
  $('#qunit-test-area').html('');

  $('#qunit-test-area').html('//test/view/test.tmpl', {});
  assert.ok($('#qunit-test-area').find('h1').length, "There's an h1");
});
