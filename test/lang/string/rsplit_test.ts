import rsplit from '../../../lang/string/rsplit/rsplit';
import { assert, module, test } from 'qunit/qunit/qunit.js';

module('lang/string/rsplit');

test('/\\./', () => {
  assert.deepEqual(rsplit('a.b.c', /\./), ['a', 'b', 'c']);
  assert.deepEqual(rsplit('..a..b..c', /\./), ['a', 'b', 'c']);
});
test('/\\//', () => {
  assert.deepEqual(rsplit('a/b/c', /\//), ['a', 'b', 'c']);
  assert.deepEqual(rsplit('//a/b/c', /\//), ['a', 'b', 'c']);
});
