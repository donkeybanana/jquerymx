import '../../dom/compare/compare.js';
import { assert, module, test } from 'qunit/qunit/qunit.js';

module('dom/compare');

test('Compare cases', function() {
  $(document.body).append(
    "<div id='outer'><div class='first'></div><div class='second'></div>"
  );

  var outer = $('#outer'),
    first = outer.find('.first'),
    second = outer.find('.second');

  assert.equal(outer.compare(outer), 0, 'identical elements');

  var outside = document.createElement('div');

  assert.ok(outer.compare(outside) & 1, 'different documents');

  assert.equal(outer.compare(first), 20, 'A container element');
  assert.equal(outer.compare(second), 20, 'A container element');

  assert.equal(first.compare(outer), 10, 'A parent element');
  assert.equal(second.compare(outer), 10, 'A parent element');

  assert.equal(first.compare(second), 4, 'A sibling elements');
  assert.equal(second.compare(first), 2, 'A sibling elements');

  outer.remove();
});
