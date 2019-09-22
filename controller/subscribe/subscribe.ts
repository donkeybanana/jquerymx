import OpenAjax from '../../lang/openajax/openajax.js';

/**
 * @function jQuery.Controller.static.processors.subscribe
 * @parent jQuery.Controller.static.processors
 * @plugin jquery/controller/subscribe
 * Adds OpenAjax.Hub subscribing to controllers.
 *
 *     $.Controller("Subscriber",{
 *       "recipe.updated subscribe" : function(called, recipe){
 *
 *       },
 *       "todo.* subscribe" : function(called, todo){
 *
 *       }
 *     })
 *
 * You should typically be listening to jQuery triggered events when communicating between
 * controllers.  Subscribe should be used for listening to model changes.
 *
 * ### API
 *
 * This is the call signiture for the processor, not the controller subscription callbacks.
 *
 * @param {HTMLElement} el the element being bound.  This isn't used.
 * @param {String} event the event type (subscribe).
 * @param {String} cb the callback function's name
 * @param {String} selector the subscription name
 */
export const subscribe = function(el, event, cb, selector) {
  const subscription = OpenAjax.hub.subscribe(selector, cb);
  return function() {
    OpenAjax.hub.unsubscribe(subscription);
  };
};

/**
 * @function publish
 * @hide
 * Publishes a message to OpenAjax.hub.
 * @param {String} message Message name, ex: "Something.Happened".
 * @param {Object} data The data sent.
 */
export const publish = OpenAjax.hub.publish;
