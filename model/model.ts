import * as $ from 'jquery';
import { underscore } from '../lang/string/string.js';

declare global {
  type ModelID = string;

  interface JQueryModelStatic<T> {
    new (args: object): T;

    // Names and namespacing
    namespace: string;
    name: string;
    pluginName: string;
    fullName: string;
    shortName: string;
    _fullName: string;
    _shortName: string;

    // Ident
    id: ModelID;

    // CRUD
    findAll(data: object, settings?: JQueryAjaxSettings): Promise<T[]>;
    findOne(id: ModelID, settings?: JQueryAjaxSettings): Promise<T>;
    create(model: T, settings?: JQueryAjaxSettings): Promise<T>;
    update(model: T, settings?: JQueryAjaxSettings): Promise<T>;
    destroy(model: T, settings?: JQueryAjaxSettings): Promise<any>;
  }

  interface JQueryModel {
    id?: ModelID;

    serialize(): object;
  }
}

export const Model: JQueryModelStatic<JQueryModel> = class
  implements JQueryModel {
  static namespace: string = '';
  static id = 'id';

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

  static models(attrs: object[] = []) {
    return attrs.map((item: object) => new this(item));
  }

  static create(data: JQueryModel, settings: JQueryAjaxSettings) {
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
    }).then(json => new this(json as object));
  }

  static update(data: JQueryModel, settings: JQueryAjaxSettings) {
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
    }).then(json => new this(json as object));
  }

  static destroy(model: JQueryModel, settings: JQueryAjaxSettings) {
    return new Promise((success, error) => {
      return $.ajax({
        url: `${this._shortName}`,
        type: 'DELETE',
        dataType: 'json',
        success,
        error,
        data: { [this.id]: model.id },
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
    }).then((json: []) => json.map(item => new this(item)));
  }

  static findOne(id: typeof Model.id, settings: JQueryAjaxSettings) {
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
    }).then(json => new this(json as object));
  }

  id: string;

  constructor(attrs: object) {
    const props = { ...(this.constructor.defaults || {}), ...attrs };
    Object.keys(props).forEach(attr => (this[attr] = props[attr]));
  }

  bind(eventType: string, handler: any) {
    return $([this]).bind(eventType, handler);
  }

  unbind(eventType: string, handler: any) {
    return $([this]).bind(eventType, handler);
  }

  save() {
    const Class = this.constructor as JQueryModelStatic<JQueryModel>;
    return !this.id ? Class.create(this) : Class.update(this);
  }

  serialize(): object {
    return Object.entries(this).reduce(
      (acc, [key, value]) => ({
        ...acc,
        [key]: value
      }),
      {}
    );
  }
};

export default Model;
