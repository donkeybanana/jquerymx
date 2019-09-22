import * as $ from 'jquery';
import { isFunction } from 'jquery';
import { sub } from '../lang/string/string.js';
import { subscribe } from './subscribe/subscribe';

/**
 * Iterate static bindings and bind to the instance element
 */
export const bindEvents = instance => {
  for (let b in instance.constructor.bindings) {
    const { delegate, event, scope } = action(b, instance.options);
    let processor = binder;

    switch (event) {
      case 'subscribe':
        processor = subscribe;
        break;
    }

    console.log({
      scope,
      event,
      delegate,
      processor
    });

    instance.bindings.push(
      processor(
        delegate || instance.element,
        event,
        instance.constructor.bindings[b].bind(instance),
        scope
      )
    );
  }
};

const binder = function(el, ev, callback, selector?: string) {
  return selector
    ? delegate(el, selector, ev, callback)
    : bind(el, ev, callback);
};

// Binds an element, returns a function that unbinds
const delegate = function(el, selector: string, ev, callback) {
  var binder =
    el.delegate && el.undelegate ? el : $(isFunction(el) ? [el] : el);

  const wrappedCallback = function(event) {
    callback($(event.target), event);
  };
  binder.delegate(selector, ev, wrappedCallback);
  return function() {
    binder.undelegate(selector, ev, wrappedCallback);
    binder = el = ev = callback = selector = null;
  };
};

const shifter = function shifter(context, name) {
  const method = typeof name == 'string' ? context[name] : name;
  return function() {
    context.called = name;
    return method.apply(
      context,
      [this.nodeName ? $(this) : this].concat(
        Array.prototype.slice.call(arguments, 0)
      )
    );
  };
};

// Binds an element, returns a function that unbinds
// @TODO still ugly
const bind = function(el, ev, callback) {
  // @TODO possible performance issues
  // @TODO possible duplicate events
  const wrappedCallback = function(event) {
    callback(el, event);
  };
  const binder = el.bind && el.unbind ? el : $(isFunction(el) ? [el] : el);

  if (ev.indexOf('>') === 0) {
    ev = ev.substr(1);
  }

  binder.bind(ev, wrappedCallback);

  return function() {
    binder.unbind(ev, wrappedCallback);
    el = ev = callback = null;
  };
};

export const unbindEvents = instance => {
  while (instance.bindings.length > 0) {
    const fn = instance.bindings.pop();
    fn();
  }
};

const isAction = (name: string): boolean =>
  /[^\w]/.test(name) || !!$.event.special[name];

// @TODO more test cases for scoping, or get rid of it
const action = function(selector: string, options: any) {
  const s = sub(selector, [options, window]);
  const [delegate, method] = Array.isArray(s) ? s : [undefined, s];
  const scopes = method.match(/^(?:(.*?)\s)?([\w\.\:>]+)$/);
  const [scope, event] = scopes ? scopes.slice(1) : [delegate, method];

  return {
    scope,
    event,
    delegate
  };
};
