import '../../model/backup/backup.js';
import { assert, module, test } from 'qunit/qunit/qunit.js';

module('model/backup', {
  before: function() {
    $.Model.extend('Recipe');
  }
});

test('backing up', function() {
  var recipe = new Recipe({ name: 'cheese' });
  assert.ok(!recipe.isDirty(), 'not backedup, but clean');

  recipe.backup();
  assert.ok(!recipe.isDirty(), 'backedup, but clean');

  recipe.name = 'blah';

  assert.ok(recipe.isDirty(), 'dirty');

  recipe.restore();

  assert.ok(!recipe.isDirty(), 'restored, clean');

  assert.equal(recipe.name, 'cheese', 'name back');
});

test('backup / restore with associations', function() {
  $.Model.extend('Instruction');
  $.Model.extend('Cookbook');

  $.Model.extend(
    'Recipe',
    {
      attributes: {
        instructions: 'Instruction.models',
        cookbook: 'Cookbook.model'
      }
    },
    {}
  );

  var recipe = new Recipe({
    name: 'cheese burger',
    instructions: [
      {
        description: 'heat meat'
      },
      {
        description: 'add cheese'
      }
    ],
    cookbook: {
      title: "Justin's Grillin Times"
    }
  });

  //test basic is dirty

  assert.ok(!recipe.isDirty(), 'not backedup, but clean');

  recipe.backup();
  assert.ok(!recipe.isDirty(), 'backedup, but clean');

  recipe.name = 'blah';

  assert.ok(recipe.isDirty(), 'dirty');

  recipe.restore();

  assert.ok(!recipe.isDirty(), 'restored, clean');

  assert.equal(recipe.name, 'cheese burger', 'name back');

  // test belongs too

  assert.ok(!recipe.cookbook.isDirty(), 'cookbook not backedup, but clean');

  recipe.cookbook.backup();

  recipe.cookbook.attr('title', "Brian's Burgers");

  assert.ok(!recipe.isDirty(), 'recipe itself is clean');

  assert.ok(recipe.isDirty(true), 'recipe is dirty if checking associations');

  recipe.cookbook.restore();

  assert.ok(
    !recipe.isDirty(true),
    'recipe is now clean with checking associations'
  );

  assert.equal(
    recipe.cookbook.title,
    "Justin's Grillin Times",
    'cookbook title back'
  );

  //try belongs to recursive restore

  recipe.cookbook.attr('title', "Brian's Burgers");
  recipe.restore();
  assert.ok(
    recipe.isDirty(true),
    'recipe is dirty if checking associations, after a restore'
  );

  recipe.restore(true);
  assert.ok(
    !recipe.isDirty(true),
    'cleaned all of recipe and its associations'
  );
});
