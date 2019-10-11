// Several of the methods in this plugin use code adapated from Prototype
//  Prototype JavaScript framework, version 1.6.0.1
//  (c) 2005-2007 Sam Stephenson
export const regs = {
  undHash: /_|-/,
  colons: /::/,
  words: /([A-Z]+)([A-Z][a-z])/g,
  lowUp: /([a-z\d])([A-Z])/g,
  dash: /([a-z\d])([A-Z])/g,
  replacer: /\{([^\}]+)\}/g,
  dot: /\./
};
// gets the nextPart property from current
// add - if true and nextPart doesnt exist, create it as an empty object
export const getNext = function(current, nextPart, add) {
  return current[nextPart] !== undefined
    ? current[nextPart]
    : add && (current[nextPart] = {});
};
// returns true if the object can have properties (no nulls)
export const isContainer = function(current) {
  var type = typeof current;
  return current && (type == 'function' || type == 'object');
};
/**
 * @function getObject
 * Gets an object from a string.  It can also modify objects on the
 * 'object path' by removing or adding properties.
 *
 *     Foo = {Bar: {Zar: {"Ted"}}}
 *     getObject("Foo.Bar.Zar") //-> "Ted"
 *
 * @param {String} name the name of the object to look for
 * @param {Array} [roots] an array of root objects to look for the
 *   name.  If roots is not provided, the window is used.
 * @param {Boolean} [add] true to add missing objects to
 *  the path. false to remove found properties. undefined to
 *  not modify the root object
 * @return {Object} The object.
 */
export const getObject = function(name, roots, add) {
  // the parts of the name we are looking up
  // ['App','Models','Recipe']
  var parts = name ? name.split(regs.dot) : [],
    length = parts.length,
    current,
    ret,
    i,
    r = 0,
    type;

  // make sure roots is an array
  roots = Array.isArray(roots) ? roots : [roots || window];

  if (length == 0) {
    return roots[0];
  }
  // for each root, mark it as current
  while ((current = roots[r++])) {
    // walk current to the 2nd to last object
    // or until there is not a container
    for (i = 0; i < length - 1 && isContainer(current); i++) {
      current = getNext(current, parts[i], add);
    }
    // if we can get a property from the 2nd to last object
    if (isContainer(current)) {
      // get (and possibly set) the property
      ret = getNext(current, parts[i], add);

      // if there is a value, we exit
      if (ret !== undefined) {
        // if add is false, delete the property
        if (add === false) {
          delete current[parts[i]];
        }
        return ret;
      }
    }
  }
};
/**
 * Capitalizes a string
 * @param {String} s the string.
 * @return {String} a string with the first character capitalized.
 */
export const capitalize = function(s) {
  return s.charAt(0).toUpperCase() + s.substr(1);
};
/**
 * Capitalizes a string from something undercored. Examples:
 * @codestart
 * camelize("one_two") //-> "oneTwo"
 * "three-four".camelize() //-> threeFour
 * @codeend
 * @param {String} s
 * @return {String} a the camelized string
 */
export const camelize = function(s) {
  s = classize(s);
  return s.charAt(0).toLowerCase() + s.substr(1);
};
/**
 * Like [camelize|camelize], but the first part is also capitalized
 * @param {String} s
 * @return {String} the classized string
 */
export const classize = function(s, join = '') {
  var parts = s.split(regs.undHash),
    i = 0;
  for (; i < parts.length; i++) {
    parts[i] = capitalize(parts[i]);
  }

  return parts.join(join);
};
/**
 * Like [classize|classize], but a space separates each 'word'
 * @codestart
 * niceName("one_two") //-> "One Two"
 * @codeend
 * @param {String} s
 * @return {String} the niceName
 */
export const niceName = function(s) {
  return classize(s, ' ');
};

/**
 * Underscores a string.
 * @codestart
 * underscore("OneTwo") //-> "one_two"
 * @codeend
 * @param {String} s
 * @return {String} the underscored string
 */
export const underscore = function(s) {
  return s
    .replace(regs.colons, '/')
    .replace(regs.words, '$1_$2')
    .replace(regs.lowUp, '$1_$2')
    .replace(regs.dash, '_')
    .toLowerCase();
};
/**
 * Returns a string with {param} replaced values from data.
 *
 *     sub("foo {bar}",{bar: "far"})
 *     //-> "foo far"
 *
 * @param {String} s The string to replace
 * @param {Object} data The data to be used to look for properties.  If it's an array, multiple
 * objects can be used.
 * @param {Boolean} [remove] if a match is found, remove the property from the object
 */
export const sub = function(s, data, remove) {
  var obs = [],
    remove = typeof remove == 'boolean' ? !remove : remove;
  obs.push(
    s.replace(regs.replacer, function(whole, inside) {
      //convert inside to type
      var ob = getObject(inside, data, remove);

      // if a container, push into objs (which will return objects found)
      if (isContainer(ob)) {
        obs.push(ob);
        return '';
      } else {
        return '' + ob;
      }
    })
  );

  return obs.length <= 1 ? obs[0] : obs;
};
