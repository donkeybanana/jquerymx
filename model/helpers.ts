import _get from 'lodash.get';
import {
  capitalize,
  classize,
  getObject,
  underscore,
  sub
} from '../lang/string/string.js';

declare global {
  interface JQueryStatic {
    fixture: object;
  }
}

export const addId = function(
  model: { id: string },
  attrs: { [key: string]: any },
  id: any
): Object {
  const identity = model.id;
  const { [identity]: existingId, ...rest } = attrs;
  if (attrs[identity] && attrs[identity] !== id) {
    return {
      ...rest,
      ['new' + capitalize(id)]: identity
    };
  }
  return {
    ...rest,
    [identity]: id
  };
};

export const getId = (model: any) => model[model.constructor.id];

export const isNew = (model: any): boolean => {
  var id = getId(model);
  return id === undefined || id === null || id === '';
};

// Simple object test
export const isObject = (raw: any): boolean =>
  typeof raw === 'object' && raw !== null;

// No reducer here as recursion is not what we need
export const getAttrs = function(raw: object, keys: string[]): object {
  for (let i = 0; i < keys.length; i++) {
    const branch = _get(raw, keys[i]);
    if (isObject(branch)) {
      return branch;
    }
  }
  return raw;
};

export const fixture = (
  model: JQueryModelStatic,
  extra: string = '',
  or?: string
) => {
  const short = model.constructor._shortName;
  const path = (model.constructor as JQueryModelStatic).namespace
    .replace(/\.models\..*/, '')
    .replace(/\./g, '/');
  const key = `-${short}${extra}`;

  if ($.fixture && $.fixture[key]) {
    return key;
  }

  if (or) {
    return or;
  }

  return `//${path}/fixtures/${short}.json`;
};
