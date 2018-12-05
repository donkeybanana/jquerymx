import '../../lang/string/string.js';
import { module, test } from 'qunit/qunit/qunit.js';

module('lang/string');

test('$.String.sub', function(assert) {
  assert.equal($.String.sub('a{b}', { b: 'c' }), 'ac');

  var foo = { b: 'c' };

  assert.equal($.String.sub('a{b}', foo, true), 'ac');

  assert.ok(!foo.b, 'removed this b');
});

test('$.String.sub double', function(assert) {
  assert.equal($.String.sub('{b} {d}', [{ b: 'c', d: 'e' }]), 'c e');
});

test('String.underscore', function(assert) {
  assert.equal($.String.underscore('Foo.Bar.ZarDar'), 'foo.bar.zar_dar');
});

test('$.String.getObject', function(assert) {
  var obj1 = $.String.getObject('foo', [{ a: 1 }, { foo: 'bar' }]);

  assert.equal(obj1, 'bar', 'got bar');

  // test null data

  var obj2 = $.String.getObject('foo', [{ a: 1 }, { foo: 0 }]);

  assert.equal(obj2, 0, 'got 0 (falsey stuff)');
});

test('$.String.niceName', function(assert) {
  var str = 'some_underscored_string';
  var niceStr = $.String.niceName(str);
  assert.equal(niceStr, 'Some Underscored String', 'got correct niceName');
});
