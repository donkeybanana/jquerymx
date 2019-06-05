import '../../dom/dimensions/dimensions.js';
import '../../view/micro/micro.js';
import { assert, module, test } from 'qunit/qunit/qunit.js';

module('dom/curStyles');

test('reading', function() {
  $('#qunit-test-area').html('test/dom/dom.micro', {});

  var res = $.curStyles($('#styled')[0], [
    'padding-left',
    'position',
    'display',
    'margin-top',
    'borderTopWidth',
    'float'
  ]);

  assert.equal(res.borderTopWidth, '2px', 'border top');
  assert.equal(res.display, 'block', 'display');
  assert.equal(res.cssFloat, 'left', 'float');
  assert.equal(res.marginTop, '10px', 'margin top');
  assert.equal(res.paddingLeft, '5px', 'padding left');
  assert.equal(res.position, 'relative', 'position');

  $('#qunit-test-area').html('');
});
