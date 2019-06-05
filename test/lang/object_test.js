import '../../lang/object/object.js';
import { assert, module, test } from 'qunit/qunit/qunit.js';

module('lang/object');

test('same', function() {
  assert.ok(
    $.Object.same(
      { type: 'FOLDER' },
      { type: 'FOLDER', count: 5 },
      {
        count: null
      }
    ),
    'count ignored'
  );

  assert.ok(
    $.Object.same(
      { type: 'folder' },
      { type: 'FOLDER' },
      {
        type: 'i'
      }
    ),
    'folder case ignored'
  );
});

test('subsets', function() {
  var res1 = $.Object.subsets({ parentId: 5, type: 'files' }, [
    { parentId: 6 },
    { type: 'folders' },
    { type: 'files' }
  ]);

  assert.deepEqual(res1, [{ type: 'files' }]);

  var res2 = $.Object.subsets({ parentId: 5, type: 'files' }, [
    {},
    { type: 'folders' },
    { type: 'files' }
  ]);

  assert.deepEqual(res2, [{}, { type: 'files' }]);

  var res3 = $.Object.subsets({ parentId: 5, type: 'folders' }, [
    { parentId: 5 },
    { type: 'files' }
  ]);

  assert.deepEqual(res3, [{ parentId: 5 }]);
});

test('subset compare', function() {
  assert.ok(
    $.Object.subset({ type: 'FOLDER' }, { type: 'FOLDER' }),

    'equal sets'
  );

  assert.ok(
    $.Object.subset({ type: 'FOLDER', parentId: 5 }, { type: 'FOLDER' }),

    'sub set'
  );

  assert.ok(
    !$.Object.subset({ type: 'FOLDER' }, { type: 'FOLDER', parentId: 5 }),

    'wrong way'
  );

  assert.ok(
    !$.Object.subset(
      { type: 'FOLDER', parentId: 7 },
      { type: 'FOLDER', parentId: 5 }
    ),

    'different values'
  );

  assert.ok(
    $.Object.subset(
      { type: 'FOLDER', count: 5 }, // subset
      { type: 'FOLDER' },
      { count: null }
    ),

    'count ignored'
  );

  assert.ok(
    $.Object.subset(
      { type: 'FOLDER', kind: 'tree' }, // subset
      { type: 'FOLDER', foo: true, bar: true },
      { foo: null, bar: null }
    ),

    'understands a subset'
  );
  assert.ok(
    $.Object.subset(
      { type: 'FOLDER', foo: true, bar: true },
      { type: 'FOLDER', kind: 'tree' }, // subset

      { foo: null, bar: null, kind: null }
    ),

    'ignores nulls'
  );
});

test('searchText', function() {
  var item = {
      id: 1,
      name: 'thinger'
    },
    searchText = {
      searchText: 'foo'
    },
    compare = {
      searchText: function(items, paramsText, itemr, params) {
        assert.equal(item, itemr);
        assert.equal(searchText, params);
        return true;
      }
    };

  assert.ok($.Object.subset(item, searchText, compare), 'searchText');
});
