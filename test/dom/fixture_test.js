import '../../dom/fixture/fixture.js';
import '../../model/model.js';
import { assert, module, test } from 'qunit/qunit/qunit.js';

module('dom/fixture');

test('static fixtures', function(assert) {
  const done = assert.async();

  $.fixture('GET something', '//dom/fixture/fixtures/test.json');
  $.fixture('POST something', '//dom/fixture/fixtures/test.json');

  $.get(
    'something',
    function(data) {
      assert.equal(data.sweet, 'ness', '$.get works');

      $.post(
        'something',
        function(data) {
          assert.equal(data.sweet, 'ness', '$.post works');

          done();
        },
        'json'
      );
    },
    'json'
  );
});

test('dynamic fixtures', function(assert) {
  const done = assert.async();

  $.fixture.delay = 10;
  $.fixture('something', function() {
    return [{ sweet: 'ness' }];
  });

  $.get(
    'something',
    function(data) {
      assert.equal(data.sweet, 'ness', '$.get works');
      done();
    },
    'json'
  );
});

test('fixture function', function(assert) {
  const done = assert.async();
  const url = '/dom/fixture/fixtures/foo.json';

  $.fixture(url, '//dom/fixture/fixtures/foobar.json');

  $.get(
    url,
    function(data) {
      assert.equal(data.sweet, 'ner', 'url passed works');

      $.fixture(url, '//dom/fixture/fixtures/test.json');

      $.get(
        url,
        function(data) {
          assert.equal(data.sweet, 'ness', 'replaced');

          $.fixture(url, null);

          $.get(
            url,
            function(data) {
              assert.equal(data.a, 'b', 'removed');

              done();
            },
            'json'
          );
        },
        'json'
      );
    },
    'json'
  );
});

test('fixtures with converters', function(assert) {
  const done = assert.async();
  $.ajax({
    url: '/dom/fixture/fixtures/foobar.json',
    dataType: 'json fooBar',
    converters: {
      'json fooBar': function(data) {
        // Extract relevant text from the xml document
        return 'Mr. ' + data.name;
      }
    },
    fixture: function() {
      return {
        name: 'Justin'
      };
    },
    success: function(prettyName) {
      done();
      assert.equal(prettyName, 'Mr. Justin');
    }
  });
});

test('$.fixture.make fixtures', function(assert) {
  const done = assert.async();
  $.fixture.make(
    'thing',
    1000,
    function(i) {
      return {
        id: i,
        name: 'thing ' + i
      };
    },
    function(item, settings) {
      if (settings.data.searchText) {
        var regex = new RegExp('^' + settings.data.searchText);
        return regex.test(item.name);
      }
    }
  );
  $.ajax({
    url: 'things',
    type: 'json',
    data: {
      offset: 100,
      limit: 200,
      order: ['name ASC'],
      searchText: 'thing 2'
    },
    fixture: '-things',
    success: function(things) {
      assert.equal(things.data[0].name, 'thing 29', 'first item is correct');
      assert.equal(things.data.length, 11, 'there are 11 items');
      done();
    }
  });
});

test('simulating an error', function(assert) {
  var st = '{type: "unauthorized"}';

  $.fixture('/foo', function() {
    return [401, st];
  });
  const done = assert.async();

  $.ajax({
    url: '/foo',
    success: function() {
      assert.ok(false, 'success called');
      done();
    },
    error: function(jqXHR, status, statusText) {
      assert.ok(true, 'error called');
      assert.equal(statusText, st);
      done();
    }
  });
});

test('rand', function(assert) {
  var rand = $.fixture.rand;
  var num = rand(5);
  assert.equal(typeof num, 'number');
  assert.ok(num >= 0 && num < 5, 'gets a number');

  const done = assert.async();
  var zero, three, between;
  // make sure rand can be everything we need
  setTimeout(function next() {
    var res = rand([1, 2, 3]);
    if (res.length == 0) {
      zero = true;
    } else if (res.length == 3) {
      three = true;
    } else {
      between = true;
    }
    if (zero && three && between) {
      assert.ok(true, 'got zero, three, between');
      done();
    } else {
      setTimeout(next, 10);
    }
  }, 10);
});

test('_getData', function() {
  var d1 = $.fixture._getData('/thingers/{id}', '/thingers/5');
  assert.equal(d1.id, 5, 'gets data');
  var d2 = $.fixture._getData('/thingers/5?hi.there', '/thingers/5?hi.there');
  assert.deepEqual(d2, {}, 'gets data');
});

test('_getData with double character value', function() {
  var data = $.fixture._getData(
    '/days/{id}/time_slots.json',
    '/days/17/time_slots.json'
  );
  assert.equal(data.id, 17, 'gets data');
});

test('_compare', function() {
  var same = $.Object.same(
    { url: '/thingers/5' },
    { url: '/thingers/{id}' },
    $.fixture._compare
  );

  assert.ok(same, 'they are similar');

  same = $.Object.same(
    { url: '/thingers/5' },
    { url: '/thingers' },
    $.fixture._compare
  );

  assert.ok(!same, 'they are not the same');
});

test('_similar', function() {
  var same = $.fixture._similar(
    { url: '/thingers/5' },
    { url: '/thingers/{id}' }
  );

  assert.ok(same, 'similar');

  same = $.fixture._similar(
    { url: '/thingers/5', type: 'get' },
    { url: '/thingers/{id}' }
  );

  assert.ok(same, 'similar with extra pops on settings');

  var exact = $.fixture._similar(
    { url: '/thingers/5', type: 'get' },
    { url: '/thingers/{id}' },
    true
  );

  assert.ok(!exact, 'not exact');

  var exact = $.fixture._similar(
    { url: '/thingers/5' },
    { url: '/thingers/5' },
    true
  );

  assert.ok(exact, 'exact');
});

test('fixture function gets id', function(assert) {
  $.fixture('/thingers/{id}', function(settings) {
    return {
      id: settings.data.id,
      name: 'justin'
    };
  });
  const done = assert.async();
  $.get(
    '/thingers/5',
    {},
    function(data) {
      done();
      assert.ok(data.id);
    },
    'json'
  );
});

test('replacing and removing a fixture', function(assert) {
  var url = '/dom/fixture/fixtures/remove.json';
  $.fixture('GET ' + url, function() {
    return { weird: 'ness!' };
  });
  const done = assert.async();
  $.get(
    url,
    {},
    function(json) {
      assert.equal(json.weird, 'ness!', 'fixture set right');

      $.fixture('GET ' + url, function() {
        return { weird: 'ness?' };
      });

      $.get(
        url,
        {},
        function(json) {
          assert.equal(json.weird, 'ness?', 'fixture set right');

          $.fixture('GET ' + url, null);

          $.get(
            url,
            {},
            function(json) {
              assert.equal(json.weird, 'ness', 'fixture set right');

              done();
            },
            'json'
          );
        },
        'json'
      );
    },
    'json'
  );
});

(function() {
  return; // future fixture stuff

  // returning undefined means you want to control timing?
  $.fixture('GET /foo', function(orig, settings, headers, cb) {
    setTimeout(function() {
      cb(200, 'success', { json: '{}' }, {});
    }, 1000);
  });

  // fixture that hooks into model / vice versa?

  // fixture that creates a nice store

  var store = $.fixture.store(1000, function() {});

  store.find();

  // make cloud

  var clouds = $.fixture.store(1, function() {
    return {
      name: 'ESCCloud',
      DN: 'ESCCloud-ESCCloud',
      type: 'ESCCloud'
    };
  });

  var computeCluster = $.fixture.store(5, function(i) {
    return {
      name: '',
      parentDN: clouds.find()[0].DN,
      type: 'ComputeCluster',
      DN: 'ComputeCluster-ComputeCluster' + i
    };
  });

  $.fixture('GET /computeclusters', function() {
    return [];
  });

  // hacking models?
})();
