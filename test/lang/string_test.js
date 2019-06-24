import {
  getObject,
  niceName,
  sub,
  underscore
} from '../../lang/string/string.js';
import { assert, module, test } from 'qunit/qunit/qunit.js';

module('lang/string');

test('sub', function() {
  assert.equal(sub('a{b}', { b: 'c' }), 'ac');

  var foo = { b: 'c' };

  assert.equal(sub('a{b}', foo, true), 'ac');

  assert.ok(!foo.b, 'removed this b');
});

test('sub double', function() {
  assert.equal(sub('{b} {d}', [{ b: 'c', d: 'e' }]), 'c e');
});

test('underscore', function() {
  assert.equal(underscore('Foo.Bar.ZarDar'), 'foo.bar.zar_dar');
});

test('getObject', function() {
  var obj1 = getObject('foo', [{ a: 1 }, { foo: 'bar' }]);

  assert.equal(obj1, 'bar', 'got bar');

  // test null data

  var obj2 = getObject('foo', [{ a: 1 }, { foo: 0 }]);

  assert.equal(obj2, 0, 'got 0 (falsey stuff)');
});

test('niceName', function() {
  var str = 'some_underscored_string';
  var niceStr = niceName(str);
  assert.equal(niceStr, 'Some Underscored String', 'got correct niceName');
});
