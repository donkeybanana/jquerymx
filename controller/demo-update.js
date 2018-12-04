steal(
  './controller.js',
  '../model/model.js',
  '../dom/form_params/form_params.js',
  '../dom/fixture/fixture.js',
  function() {
    $.fixture.delay = 2000;
    $.fixture('POST /recipes', function() {
      return {};
    });

    $.Model.extend(
      'Recipe',
      {
        create: '/recipes'
      },
      {}
    );

    $.Controller.extend('Creator', {
      '{recipe} created': function() {
        this.update({
          recipe: new Recipe()
        });
        this.element[0].reset();
        this.find('[type=submit]').val('Create Recipe');
      },
      submit: function(el, ev) {
        ev.preventDefault();
        var recipe = this.options.recipe;
        recipe.attrs(this.element.formParams());
        this.find('[type=submit]').val('Saving...');
        recipe.save();
      }
    });

    $('#createRecipes').creator({
      recipe: new Recipe()
    });
  }
);
