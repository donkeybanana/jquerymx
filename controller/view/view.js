import '../controller.js';
import '../../view/view.js';
import { underscore } from '../../lang/string/string.js';

const classParts = Class =>
  Class.fullName.split('.Controllers.').map(part => part.split('.'));

const resolveView = (view, action_name) =>
  !view ? action_name.replace(/\.|#/g, '').replace(/ /g, '_') : view;

const addSuffix = view =>
  typeof view == 'string' && /\.[\w\d]+$/.test(view)
    ? view
    : view + jQuery.View.ext;

const addPrefix = (view, Class) => {
  if (!hasControllers(Class) || view.indexOf('/') !== -1) {
    return view;
  }

  return underscore(
    classParts(Class)[1]
      .concat(view)
      .join('/')
  );
};

const addRoot = (view, Class) =>
  '//' +
  underscore(
    classParts(Class)[0]
      .concat('views')
      .concat(view)
      .join('/')
  );

const hasControllers = Class =>
  Class.fullName.split('.').indexOf('Controllers') >= 0;

jQuery.Controller.getFolder = function() {
  return underscore(this.fullName.replace(/\./g, '/')).replace(
    '/Controllers',
    ''
  );
};

jQuery.Controller._calculatePosition = function(Class, view, action_name) {
  if (typeof view == 'string' && view.substr(0, 2) == '//') {
    return view;
  }

  return addRoot(
    addPrefix(addSuffix(resolveView(view, action_name)), Class),
    Class
  );
};

var calculateHelpers = function(myhelpers) {
  var helpers = {};
  if (myhelpers) {
    if (Array.isArray(myhelpers)) {
      for (var h = 0; h < myhelpers.length; h++) {
        jQuery.extend(helpers, myhelpers[h]);
      }
    } else {
      jQuery.extend(helpers, myhelpers);
    }
  } else {
    if (this._default_helpers) {
      helpers = this._default_helpers;
    }
    //load from name
    var current = window;
    var parts = this.constructor.fullName.split(/\./);
    for (var i = 0; i < parts.length; i++) {
      if (current) {
        if (typeof current.Helpers == 'object') {
          jQuery.extend(helpers, current.Helpers);
        }
        current = current[parts[i]];
      }
    }
    if (current && typeof current.Helpers == 'object') {
      jQuery.extend(helpers, current.Helpers);
    }
    this._default_helpers = helpers;
  }
  return helpers;
};

/**
 * @add jQuery.Controller.prototype
 */

/**
 * @tag view
 * Renders a View template with the controller instance. If the first argument
 * is not supplied,
 * it looks for a view in /views/controller_name/action_name.ejs.
 * If data is not provided, it uses the controller instance as data.
 * @codestart
 * TasksController = $.Controller.extend('TasksController',{
 *   click: function( el ) {
 *     // renders with views/tasks/click.ejs
 *     el.html( this.view() )
 *     // renders with views/tasks/under.ejs
 *     el.after( this.view("under", [1,2]) );
 *     // renders with views/tasks/under.micro
 *     el.after( this.view("under.micro", [1,2]) );
 *     // renders with views/shared/top.ejs
 *     el.before( this.view("shared/top", {phrase: "hi"}) );
 *   }
 * })
 * @codeend
 * @plugin jquery/controller/view
 * @return {String} the rendered result of the view.
 * @param {String} [view]  The view you are going to render.  If a view isn't explicity given
 * this function will try to guess at the correct view as show in the example code above.
 * @param {Object} [data]  data to be provided to the view.  If not present, the controller instance
 * is used.
 * @param {Object} [myhelpers] an object of helpers that will be available in the view.  If not present
 * this controller class's "Helpers" property will be used.
 *
 */
jQuery.Controller.prototype.view = function(view, data, myhelpers) {
  //shift args if no view is provided
  if (typeof view != 'string' && !myhelpers) {
    myhelpers = data;
    data = view;
    view = null;
  }
  //guess from controller name
  view = jQuery.Controller._calculatePosition(this.Class, view, this.called);

  //calculate data
  data = data || this;

  //calculate helpers
  var helpers = calculateHelpers.call(this, myhelpers);

  return jQuery.View(view, data, helpers); //what about controllers in other folders?
};
