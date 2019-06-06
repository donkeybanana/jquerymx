import { assert, module, test, todo } from 'qunit/qunit/qunit.js';

module('view');

test('Ajax transport', function() {
  var order = 0;
  $.ajax({
    url: '//test/view/template.ejs',
    dataType: 'view',
    async: false
  }).done(function(view) {
    assert.equal(++order, 1, 'called synchronously');
    assert.equal(
      view({ message: 'hi' }).indexOf('<h3>hi</h3>'),
      0,
      'renders stuff!'
    );
  });

  assert.equal(++order, 2, 'called synchronously');
});

test('multiple template types work', function() {
  $.each(['micro', 'ejs'], function() {
    $('#qunit-test-area').html('');
    assert.ok(
      $('#qunit-test-area').children().length == 0,
      this + ': Empty To Start'
    );

    $('#qunit-test-area').html('//test/view/template.' + this, {
      message: 'helloworld'
    });
    assert.ok(
      $('#qunit-test-area').find('h3').length,
      this + ': h3 written for '
    );
    assert.ok(
      /helloworld\s*/.test($('#qunit-test-area').text()),
      this + ': hello world present for '
    );
  });
});

todo('jaml', () => {});
todo('tmpl', () => {});

todo('plugin in ejs', function() {
  $('#qunit-test-area').html('');
  $('#qunit-test-area').html('//test/view/plugin.ejs', {});
  assert.ok(
    /something/.test($('#something').text()),
    'something has something'
  );
  $('#qunit-test-area').html('');
});
todo('nested plugins', function() {
  $('#qunit-test-area').html('');
  $('#qunit-test-area').html('//test/view/nested_plugin.ejs', {});
  assert.ok(
    /something/.test($('#something').text()),
    'something has something'
  );
});

test('async templates, and caching work', function(assert) {
  $('#qunit-test-area').html('');
  const done = assert.async();
  var i = 0;
  $('#qunit-test-area').html(
    '//test/view/temp.ejs',
    { message: 'helloworld' },
    function(text) {
      assert.ok(/helloworld\s*/.test($('#qunit-test-area').text()));
      assert.ok(/helloworld\s*/.test(text), 'we got a rendered template');
      i++;
      assert.equal(i, 2, 'Ajax is not synchronous');
      assert.equal(this.attr('id'), 'qunit-test-area');
      done();
    }
  );
  i++;
  assert.equal(i, 1, 'Ajax is not synchronous');
});
test('caching works', function(assert) {
  // this basically does a large ajax request and makes sure
  // that the second time is always faster
  $('#qunit-test-area').html('');
  const done = assert.async();
  var startT = new Date(),
    first;
  $('#qunit-test-area').html(
    '//test/view/large.ejs',
    { message: 'helloworld' },
    function(text) {
      first = new Date();
      assert.ok(text, 'we got a rendered template');

      $('#qunit-test-area').html('');
      $('#qunit-test-area').html(
        '//test/view/large.ejs',
        { message: 'helloworld' },
        function(text) {
          var lap2 = new Date() - first,
            lap1 = first - startT;
          // assert.ok( lap1 > lap2, "faster this time "+(lap1 - lap2) )

          done();
          $('#qunit-test-area').html('');
        }
      );
    }
  );
});
test('hookup', function(assert) {
  $('#qunit-test-area').html('');

  $('#qunit-test-area').html('//test/view/hookup.ejs', {}); //makes sure no error happens

  assert.expect(0);
});

test("inline templates other than 'tmpl' like ejs", function() {
  $('#qunit-test-area').html('');

  $('#qunit-test-area').html(
    $(
      '<script type="test/ejs" id="test_ejs"><span id="new_name"><%= name %></span></script>'
    )
  );

  $('#qunit-test-area').html('test_ejs', { name: 'Henry' });
  assert.equal($('#new_name').text(), 'Henry');
  $('#qunit-test-area').html('');
});

test('object of deferreds', function(assert) {
  var foo = $.Deferred(),
    bar = $.Deferred();
  const done = assert.async();
  $.View('//test/view/deferreds.ejs', {
    foo: foo.promise(),
    bar: bar
  }).then(function(result) {
    assert.equal(result, 'FOO and BAR');
    done();
  });
  setTimeout(function() {
    foo.resolve('FOO');
  }, 100);
  bar.resolve('BAR');
});

test('deferred', function(assert) {
  var foo = $.Deferred();
  const done = assert.async();
  $.View('//test/view/deferred.ejs', foo).then(function(result) {
    assert.equal(result, 'FOO');
    done();
  });
  setTimeout(function() {
    foo.resolve({
      foo: 'FOO'
    });
  }, 1000);
});

test('modifier with a deferred', function(assert) {
  $('#qunit-test-area').html('');

  var foo = $.Deferred();
  const done = assert.async();

  $('#qunit-test-area').html('//test/view/deferred.ejs', foo);
  setTimeout(function() {
    foo.resolve({
      foo: 'FOO'
    });
    setTimeout(function() {
      assert.equal($('#qunit-test-area').html(), 'FOO', 'worked!');
      done();
    }, 200);
  }, 200);
});

test('jQuery.fn.hookup', function(assert) {
  $('#qunit-test-area').html('');
  var els = $($.View('//test/view/hookup.ejs', {})).hookup();
  $('#qunit-test-area').html(els); //makes sure no error happens

  assert.expect(0);
});

test('non-HTML content in hookups', function() {
  $('#qunit-test-area').html('<textarea></textarea>');
  $.View.hookup(function() {});
  $('#qunit-test-area textarea').val('asdf');
  assert.equal($('#qunit-test-area textarea').val(), 'asdf');
});

test('html takes promise', function(assert) {
  var d = $.Deferred();
  $('#qunit-test-area').html(d);
  const done = assert.async();
  d.done(function() {
    assert.equal(
      $('#qunit-test-area').html(),
      'Hello World',
      'deferred is working'
    );
    done();
  });
  setTimeout(function() {
    d.resolve('Hello World');
  }, 10);
});

test('val set with a template within a hookup within another template', function(assert) {
  $('#qunit-test-area').html('//test/view/hookupvalcall.ejs', {});

  assert.expect(0);
});

/*test("bad url", function(){
	$.View("//asfdsaf/sadf.ejs")
});*/

test('hyphen in type', function() {
  $(document.body).append(
    "<script type='text/x-ejs' id='hyphenEjs'>\nHyphen\n</script>"
  );

  $('#qunit-test-area').html('hyphenEjs', {});

  assert.ok(/Hyphen/.test($('#qunit-test-area').html()), 'has hyphen');
});
