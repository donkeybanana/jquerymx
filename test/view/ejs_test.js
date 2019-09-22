import '../../view/ejs/ejs.js';
import { assert, module, test, todo } from 'qunit/qunit/qunit.js';
import ejs from 'ejs';

module('view/ejs', {
  before: function() {
    this.animals = ['sloth', 'bear', 'monkey'];
    if (!this.animals.each) {
      this.animals.each = function(func) {
        for (var i = 0; i < this.length; i++) {
          func(this[i]);
        }
      };
    }

    this.squareBrackets =
      '<ul>[% this.animals.each(function(animal){%]' +
      '<li>[%= animal %]</li>' +
      '[%});%]</ul>';
    this.squareBracketsNoThis =
      '<ul>[% animals.each(function(animal){%]' +
      '<li>[%= animal %]</li>' +
      '[%});%]</ul>';
    this.angleBracketsNoThis =
      '<ul><% animals.each(function(animal){%>' +
      '<li><%= animal %></li>' +
      '<%});%></ul>';
  }
});
todo('render with left bracket', function() {
  const res = ejs.render(this.squareBrackets, {
    animals: this.animals
  });
  assert.equal(
    res,
    '<ul><li>sloth</li><li>bear</li><li>monkey</li></ul>',
    'renders with bracket'
  );
});
test('render with with', function() {
  const res = ejs.render(this.angleBracketsNoThis, { animals: this.animals });
  assert.equal(
    res,
    '<ul><li>sloth</li><li>bear</li><li>monkey</li></ul>',
    'renders bracket with no this'
  );
});
test('default carrot', function() {
  const res = ejs.render(this.angleBracketsNoThis, {
    animals: this.animals
  });

  assert.equal(res, '<ul><li>sloth</li><li>bear</li><li>monkey</li></ul>');
});
test('render with double angle', function() {
  var text =
    '<%% replace_me %>' +
    '<ul><% animals.each(function(animal){%>' +
    '<li><%= animal %></li>' +
    '<%});%></ul>';
  const res = ejs.render(text, { animals: this.animals });
  assert.equal(
    res,
    '<% replace_me %><ul><li>sloth</li><li>bear</li><li>monkey</li></ul>',
    'works'
  );
});

test('comments', function() {
  var text =
    '<%# replace_me %>' +
    '<ul><% animals.each(function(animal){%>' +
    '<li><%= animal %></li>' +
    '<%});%></ul>';
  const res = ejs.render(text, { animals: this.animals });
  assert.equal(res, '<ul><li>sloth</li><li>bear</li><li>monkey</li></ul>');
});

test('multi line', function() {
  var text = 'a \n b \n c',
    result = ejs.render(text, {});

  assert.equal(result, text);
});

test('escapedContent', function() {
  var text =
    "<span><%= tags %></span><label>&amp;</label><strong><%= number %></strong><input value='<%= quotes %>'/>";
  const res = ejs.render(text, {
    tags: 'foo < bar < car > zar > poo',
    quotes: 'I use \'quote\' fingers "a lot"',
    number: 123
  });

  var div = $('<div/>').html(res);
  assert.equal(div.find('span').text(), 'foo < bar < car > zar > poo');
  assert.equal(div.find('strong').text(), 123);
  assert.equal(div.find('input').val(), 'I use \'quote\' fingers "a lot"');
  assert.equal(div.find('label').html(), '&amp;');
});

test('unescapedContent', function() {
  var text =
    "<span><%- tags %></span><div><%= tags %></div><input value='<%- quotes %>'/>";
  const res = ejs.render(text, {
    tags: '<strong>foo</strong><strong>bar</strong>',
    quotes: 'I use &#39;quote&#39; fingers &quot;a lot&quot;'
  });

  var div = $('<div/>').html(res);
  assert.equal(div.find('span').text(), 'foobar');
  assert.equal(
    div
      .find('div')
      .text()
      .toLowerCase(),
    '<strong>foo</strong><strong>bar</strong>'
  );
  assert.equal(
    div
      .find('span')
      .html()
      .toLowerCase(),
    '<strong>foo</strong><strong>bar</strong>'
  );
  assert.equal(div.find('input').val(), 'I use \'quote\' fingers "a lot"');
});

todo('returning blocks', function() {
  var somethingHelper = function(cb) {
    return cb([1, 2, 3, 4]);
  };

  var res = $.View('//test/view/ejs/test.ejs', {
    something: somethingHelper,
    items: ['a', 'b']
  });
  // make sure expected values are in res
  assert.ok(/\s4\s/.test(res), 'first block called');
  assert.equal(res.match(/ItemsLength4/g).length, 4, 'innerBlock and each');
});

test('easy hookup', function() {
  var div = $('<div/>').html('//test/view/ejs/hookup.ejs', {
    text: 'yes'
  });
  assert.ok(div.find('div').hasClass('yes'), 'has yes');
});

test('helpers', function() {
  $.EJS.Helpers.prototype.simpleHelper = function() {
    return 'Simple';
  };

  $.EJS.Helpers.prototype.elementHelper = function() {
    return function(el) {
      el.innerHTML = 'Simple';
    };
  };

  var text = '<div><%= simpleHelper() %></div>';
  var res = ejs.render(text);
  assert.equal(compiled, '<div>Simple</div>');

  text = '<div id="hookup" <%= elementHelper() %>></div>';
  compiled = new $.EJS({ text: text })();
  $('#qunit-test-area').append($(compiled));
  assert.equal($('#hookup').html(), 'Simple');
});
