import * as $ from 'jquery';
import { classize, underscore, sub } from '../lang/string/string.js';
import { fixture, getAttrs, getId, isNew, isObject } from './helpers';

declare global {
  interface JQueryModelStatic {
    namespace: string;
    name: string;

    new (args: any[]): JQueryModel;

    // CRUD
    findAll(
      data: object,
      settings?: JQueryAjaxSettings
    ): Promise<JQueryModel[]>;
    findOne(data: object, settings?: JQueryAjaxSettings): Promise<JQueryModel>;
    create(model: JQueryModel, settings?: JQueryAjaxSettings): Promise<any>;
    update(model: JQueryModel, settings?: JQueryAjaxSettings): Promise<any>;
    destroy(id: any, settings?: JQueryAjaxSettings): Promise<any>;

    attributes: object;
    convert: object;
    serialize: object;
    defaults: object;
    pluginName: string;
    fullName: string;
    shortName: string;
    _fullName: string;
    _shortName: string;
    id: string;
    listType: any;
  }

  interface JQueryModel {
    id: string;
    list: any;

    attrs(attrs?: object): object | void;
    serialize(): object;
  }

  interface JQueryModelListStatic {
    new (attrs: object[]): JQueryModelList;
  }

  interface JQueryModelList {
    serialize(): object[];
  }

  interface JQuery {
    model(): JQueryModel;
    models(): JQueryModel[];
  }
}

const CRUDEvent = (funcName: string): Function =>
  function(attrs?: any) {
    // remove from the list if instance is destroyed
    if (funcName === 'destroyed' && this.constructor.list) {
      this.constructor.list.remove(getId(this));
    }

    // update attributes if attributes have been passed
    attrs &&
      typeof attrs == 'object' &&
      this.attrs(attrs.attrs ? attrs.attrs() : attrs);

    // call event on the instance
    trigger(this, funcName);

    //!steal-remove-start
    console.log('Model.js - ' + this.constructor.shortName + ' ' + funcName);
    //!steal-remove-end

    // call event on the instance's Class
    trigger(this.constructor, funcName, this);
    return [this].concat(makeArray(arguments)); // return like this for this.proxy chains
  };

export const List: JQueryModelListStatic = class implements JQueryModelList {
  serialize(): object[] {
    return [{}];
  }
};

export const Model: JQueryModelStatic = class implements JQueryModel {
  static namespace: string = '';
  static id = 'id';
  static listType = null;
  static defaults = {};
  static attributes = {};
  static serialize = {
    default: (raw: any) => (raw instanceof Model ? raw.serialize() : raw),
    date: (raw: any) => raw && raw.getTime()
  };
  static convert = {
    default: (raw: any) => raw
  };

  static List = List;

  static get pluginName(): string {
    return this._fullName;
  }

  static get fullName(): string {
    return (this.namespace ? this.namespace + '.' : '') + this.name;
  }
  static get _fullName(): string {
    return underscore(this.fullName);
  }

  static get shortName(): string {
    return this.name;
  }
  static get _shortName(): string {
    return underscore(this.name);
  }

  static model(attrs: JQueryModel | object) {
    return new this(attrs instanceof Model ? attrs.serialize() : attrs);
  }

  static models(attrs: JQueryModelList | object[] = []) {
    const list = getList(this.listType);
    (attrs instanceof List ? attrs.serialize() : attrs).forEach((a: object) => {
      list.push(this.model(a));
    });
    return list;
  }

  static create(data: JQueryModel, settings) {
    return new Promise((success, error) => {
      return $.ajax({
        url: `${this._shortName}`,
        type: 'POST',
        dataType: 'json',
        success,
        error,
        data,
        ...settings
      });
    }).then(json => this.model(json as object));
  }

  static update(data: JQueryModel, settings) {
    return new Promise((success, error) => {
      return $.ajax({
        url: `${this._shortName}`,
        type: 'PUT',
        dataType: 'json',
        success,
        error,
        data,
        ...settings
      });
    }).then(json => this.model(json as object));
  }

  static destroy(data: JQueryModel, settings) {
    return new Promise((success, error) => {
      return $.ajax({
        url: `${this._shortName}`,
        type: 'DELETE',
        dataType: 'json',
        success,
        error,
        data: { [this.id]: data.id },
        ...settings
      });
    }).then(res => res);
  }

  static findAll(data: object = {}, settings: JQueryAjaxSettings) {
    return new Promise((success, error) => {
      return $.ajax({
        url: this._shortName,
        type: 'GET',
        dataType: 'json',
        success,
        error,
        data,
        ...settings
      });
    }).then(json => this.models(json as object[]));
  }

  static findOne(id: any, settings: JQueryAjaxSettings) {
    return new Promise((success, error) => {
      return $.ajax({
        url: `${this._shortName}/${id}`,
        type: 'GET',
        dataType: 'json',
        success,
        error,
        data: { [this.id]: id },
        ...settings
      });
    }).then(json => this.model(json as object));
  }

  id = null;
  list = null;

  created(attrs?: object) {
    this.attrs(attrs instanceof Model ? (attrs.attrs() as object) : attrs);

    trigger(this, 'created');
    trigger(this.constructor, 'created', this);
    return [this].concat(makeArray(arguments)); // return like this for this.proxy chains
  }

  updated = CRUDEvent('updated').bind(this);
  destroyed = CRUDEvent('destroyed').bind(this);

  constructor(attrs: object) {}

  bind(eventType: string, handler: any) {
    return $([this]).bind(eventType, handler);
  }

  unbind(eventType: string, handler: any) {
    return $([this]).bind(eventType, handler);
  }

  setup(attrs) {
    // @TODO
    // each(['attributes', 'validations'], function(i, name) {
    //   if (!self[name] || superClass[name] === self[name]) {
    //     self[name] = {};
    //   }
    // });
    // @TODO
    // each(['convert', 'serialize'], function(i, name) {
    //   if (superClass[name] != self[name]) {
    //     self[name] = extend({}, superClass[name], self[name]);
    //   }
    // });
    // @TODO
    // Model.models[this._fullName] = this.listType;
    // if (this.constructor.listType) {
    //   this.list = new this.constructor.listType([]);
    // }
    // @TODO these need to work on the static
    // var name = '* ' + this.constructor._shortName + '.model';
    // console.log(name);
    // $.ajaxSetup({
    //   converters: {
    //     [name]: console.log,
    //     [name + 's']: console.log
    //   }
    // });
  }

  save() {
    const Class = this.constructor as JQueryModelStatic;
    return isNew(this) ? Class.create(this) : Class.update(this);
  }

  serialize(): object {
    const Class = this.constructor as JQueryModelStatic;
    const attrs = Class.attributes;
    const converters = Class.serialize;

    return Object.keys(attrs).reduce((acc: object, attr: string) => {
      if (attrs.hasOwnProperty(attr)) {
        const t = attrs[attr];
        const converter = converters[t] || converters['default'];
        return { ...acc, [attr]: converter.call(Class, this[attr], t) };
      }
    }, {});
  }

  attrs(attrs?: object): object | void {
    const Class = this.constructor as JQueryModelStatic;
    const attributes = Class.attributes;
    return !isObject(attrs) ? this.getAttrs() : this.setAttrs(attrs);
  }

  getAttrs(): object {
    const Class = this.constructor as JQueryModelStatic;
    const attributes = Class.attributes;
    return Object.keys(attributes).reduce(
      (acc, key) => ({
        ...acc,
        [key]: this[key]
      }),
      {}
    );
  }

  setAttrs(attrs: object): void {
    const Class = this.constructor as JQueryModelStatic;
    const attributes = Class.attributes;
    const ident = Class.id;

    Object.keys(attrs).forEach(
      key => key !== ident && this.attr(key, attrs[key])
    );

    // Set ident last, for whatever reason
    if (ident in attrs) {
      this.attr(ident, attrs[ident]);
    }
  }

  attr(key: string, value?: any, success?: Function, error?: Function): void {
    if (value !== undefined) {
      return this.setAttr(key, value, success, error);
    }
    const getter = this['get' + classize(key)];
    return typeof getter === 'function' ? getter() : this[key];
  }

  // @TODO handle promises
  setAttr(
    key: string,
    value: any,
    success: Function = function() {},
    error: Function = function() {}
  ): void {
    const Class = this.constructor as JQueryModelStatic;
    const setter = this['set' + classize(key)];
    const old = this[key];
    const errorCallback = (errors: any) => {
      error.call(this, errors);
      trigger(this, 'error.' + key, errors);
    };
    const res = (typeof setter === 'function' && setter(value)) || undefined;
    const t = Class.attributes[key];
    const converter =
      Class.convert[t] ||
      Class.convert['default'] ||
      function(raw: any) {
        return raw;
      };
    const newValue = (this[key] = converter(value, function() {}, t));

    return;

    let callback = success;
    let event;
    let globalEvent = 'updated.';
    let errors;
    // @TODO
    // Skip validation during init
    // if (!this._init) {
    //   errors = this.errors(key);
    // }
    let args = [newValue];
    let globalArgs = [key, newValue, old];

    if (errors) {
      event = globalEvent = 'error.';
      callback = errorCallback;
      globalArgs.splice(1, 0, errors);
      args.unshift(errors);
    }

    // @TODO
    // Triger events if the value changed
    // if (old !== newValue && !this._init) {
    //   !errors && trigger(this, event + key, args);
    //   trigger(this, globalEvent + 'attr', globalArgs);
    // }
    callback.apply(this, args);

    // @TODO
    // Update global list
    // if (key === Class.id && newValue !== null && list) {
    //   // if we didn't have an old id, add ourselves
    //   if (!old) {
    //     list.push(this);
    //   } else if (old != val) {
    //     // if our id has changed ... well this should be ok
    //     list.remove(old);
    //     list.push(this);
    //   }
    // }
  }
};

var makeArray = $.makeArray,
  extend = $.extend,
  each = $.each,
  trigger = function(obj, event, args?: any) {
    // @TODO
    // $(obj).trigger(event);
    // $.event.trigger(event, args, obj, true);
  },
  // used to make an ajax request where
  // ajaxOb - a bunch of options
  // data - the attributes or data that will be sent
  // success - callback function
  // error - error callback
  // fixture - the name of the fixture (typically a path or something on $.fixture
  // type - the HTTP request type (defaults to "post")
  // dataType - how the data should return (defaults to "json")
  ajax = function(
    ajaxOb,
    data,
    success,
    error,
    fixture,
    type = 'POST',
    dataType = 'json'
  ) {
    // if we get a string, handle it
    if (typeof ajaxOb == 'string') {
      // if there's a space, it's probably the type
      var sp = ajaxOb.indexOf(' ');
      if (sp > -1) {
        ajaxOb = {
          url: ajaxOb.substr(sp + 1),
          type: ajaxOb.substr(0, sp)
        };
      } else {
        ajaxOb = { url: ajaxOb };
      }
    }

    // if we are a non-array object, copy to a new attrs
    ajaxOb.data =
      typeof data == 'object' && !Array.isArray(data)
        ? extend(ajaxOb.data || {}, data)
        : data;

    // get the url with any templated values filled out
    ajaxOb.url = sub(ajaxOb.url, ajaxOb.data, true);

    return $.ajax(
      extend(
        {
          type,
          dataType,
          fixture,
          success,
          error
        },
        ajaxOb
      )
    );
  },
  // returns the best list-like object (list is passed)
  getList = function(type) {
    // @TODO
    return [];
    var listType = type || List || Array;
    return new listType();
  },
  // returns a collection of unique items
  // this works on objects by adding a "__u Nique" property.
  unique = function(items) {
    var collect = [];
    // check unique property, if it isn't there, add to collect
    each(items, function(i, item) {
      if (!item['__u Nique']) {
        collect.push(item);
        item['__u Nique'] = 1;
      }
    });
    // remove unique
    return each(collect, function(i, item) {
      delete item['__u Nique'];
    });
  },
  // helper makes a request to a static ajax method
  // it also calls updated, created, or destroyed
  // and it returns a deferred that resolvesWith self and the data
  // returned from the ajax request
  makeRequest = function(self, type, success, error, method?: string) {
    // create the deferred makeRequest will return
    var deferred = $.Deferred(),
      // on a successful ajax request, call the
      // updated | created | destroyed method
      // then resolve the deferred
      resolve = function(data) {
        self[method || type + 'd'](data);
        deferred.resolveWith(self, [self, data, type]);
      },
      // on reject reject the deferred
      reject = function(data) {
        deferred.rejectWith(self, [data]);
      },
      // the args to pass to the ajax method
      args = [self.serialize(), resolve, reject],
      // the Model
      model = self.constructor,
      jqXHR,
      promise = deferred.promise();

    // destroy does not need data
    if (type == 'destroy') {
      args.shift();
    }

    // update and destroy need the id
    if (type !== 'create') {
      args.unshift(getId(self));
    }

    // hook up success and error
    deferred.then(success);
    deferred.fail(error);

    // call the model's function and hook up
    // abort
    jqXHR = model[type].apply(model, args);
    if (jqXHR && jqXHR.abort) {
      // @TODO
      // promise.abort = function() {
      //   jqXHR.abort();
      // };
    }
    return promise;
  },
  bind = () => {},
  unbind = () => {},
  STR_CONSTRUCTOR = 'constructor';

$.fn.models = function() {
  var collection = [];
  this.each(function() {
    $(this)
      .data('models')
      .forEach(model => collection.push(model));
  });
  return collection;
};

$.fn.model = function() {
  // @TODO
  // if (type && type instanceof Model) {
  //   type.hookup(this[0]);
  //   return this;
  // } else {
  return this.models.apply(this, arguments)[0];
  // }
};

export default Model;
