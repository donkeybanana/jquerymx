import deparam from '../../../lang/string/deparam/deparam.js';
import { assert, module, test } from 'qunit/qunit/qunit.js';

module('lang/string/deparam');

test('Basic deparam', function() {
  var data = deparam('a=b');
  assert.equal(data.a, 'b');

  var data = deparam('a=b&c=d');
  assert.equal(data.a, 'b');
  assert.equal(data.c, 'd');
});
test('Nested deparam', function() {
  var data = deparam('a[b]=1&a[c]=2');
  assert.equal(data.a.b, 1);
  assert.equal(data.a.c, 2);

  var data = deparam('a[]=1&a[]=2');
  assert.equal(data.a[0], 1);
  assert.equal(data.a[1], 2);

  var data = deparam('a[b][]=1&a[b][]=2');
  assert.equal(data.a.b[0], 1);
  assert.equal(data.a.b[1], 2);

  var data = deparam('a[0]=1&a[1]=2');
  assert.equal(data.a[0], 1);
  assert.equal(data.a[1], 2);
});

test('deparam an array', function() {
  var data = deparam('a[0]=1&a[1]=2');

  assert.ok(Array.isArray(data.a), 'is array');

  assert.equal(data.a[0], 1);
  assert.equal(data.a[1], 2);
});

test('deparam object with spaces', function() {
  var data = deparam('a+b=c+d&+e+f+=+j+h+');

  assert.equal(data['a b'], 'c d');
  assert.equal(data[' e f '], ' j h ');
});
