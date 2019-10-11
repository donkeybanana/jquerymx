import { extend, makeArray } from 'jquery';
import { bindEvents, unbindEvents } from './bind';
import { underscore } from '../lang/string/string.js';
import { default as view, _calculatePosition } from './view/view';

declare global {
  interface Function {
    defaults: object;
    pluginName: string;
    fullName: string;
    shortName: string;
    _fullName: string;
    _shortName: string;
    bindings: object;
  }
  interface JQuery {
    controller(string?): JQueryController;
    controllers(string?): JQueryController[];
  }
  interface JQueryController {}
}

const getPluginInstance = (el: JQuery, name: string): any =>
  getControllers(el)[name];
const getControllers = (el: JQuery): object => $(el).data('controllers') || {};
const addController = (el: JQuery, instance: Controller): JQuery => {
  const name = instance.constructor.pluginName;
  const controllers = getControllers(el);

  if (controllers[name]) {
    console.error(name, 'already exists on', el);
    return;
  }

  $(el).data('controllers', {
    ...controllers,
    [name]: instance
  });

  return $(el).addClass(name);
};
const removeController = (instance): void => {
  const el = instance.element;
  const name = instance.constructor.pluginName;
  let controllers = getControllers(el);
  delete controllers[name];
  el.data('controllers', controllers);
  el.removeClass(name);
};

const STR_CONSTRUCTOR = 'constructor',
  underscoreAndRemoveController = function(name: string): string {
    return underscore(
      name
        .replace('$.', '')
        .replace('jQuery.', '')
        .replace(/\./g, '_')
        .replace(/_?controllers?/gi, '')
    );
  };

class Controller {
  static namespace: string = '';

  static get pluginName(): string {
    return this._fullName;
  }

  static get fullName(): string {
    return (this.namespace ? this.namespace + '.' : '') + this.name;
  }
  static get _fullName(): string {
    return underscoreAndRemoveController(this.fullName);
  }

  static get shortName(): string {
    return this.name;
  }
  static get _shortName(): string {
    return underscoreAndRemoveController(this.name);
  }

  element: JQuery;
  options: object = {};
  _destroyed: boolean = false;

  constructor(el: JQuery, opts: object = {}) {
    this.setup(el, opts);
    this.init();
  }

  static defaults = {};
  static bindings = {};

  bindings = [];

  static _calculatePosition = _calculatePosition;

  static registerPlugin() {
    const controller = this;
    const pluginName = this.pluginName;

    if (!pluginName) {
      throw new Error('Cannot register plugin without a plugin name');
    }

    if (!$.fn[pluginName]) {
      $.fn[pluginName] = function(options: any) {
        var args = makeArray(arguments),
          isMethod =
            typeof options == 'string' &&
            typeof controller.prototype[options] === 'function';

        return this.each(function() {
          const instance = getPluginInstance($(this), pluginName);

          if (instance) {
            if (isMethod) {
              return instance[options](args.slice(1));
            }

            return instance.update(args);
          }

          new controller($(this), options);
        });
      };
    } else {
      console.error('Plugin ${pluginName} already registered');
    }
  }

  setup(el: JQuery, opts: object) {
    this.element = addController(el, this);
    this.options = extend(extend(true, {}, this.constructor.defaults), opts);

    bindEvents(this);
  }

  init() {}

  update(options: object) {
    extend(this.options, options);
  }

  destroy() {
    if (this._destroyed) {
      console.warn(`${this.constructor.fullName} controller already deleted`);
      return;
    }

    this._destroyed = true;

    removeController(this);
    unbindEvents(this);

    $(this).triggerHandler('destroyed');

    this.element = null;
  }

  find(selector: string) {
    return this.element.find(selector);
  }

  view = view;
}

/**
 * $.fn.controller
 * $.fn.controllers
 */
$.fn.extend({
  controllers: function(name?: string) {
    let instances = [];

    this.each(function() {
      const controllers = getControllers(this);
      for (let pluginName in controllers) {
        if (controllers.hasOwnProperty(pluginName)) {
          const c = controllers[pluginName];
          if (!name || c.constructor.pluginName === name) {
            instances.push(c);
          }
        }
      }
    });

    return instances;
  },

  controller: function(name?: string) {
    return this.controllers(name)[0];
  }
});

export default Controller;
