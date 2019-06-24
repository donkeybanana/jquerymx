/**
 * Splits a string with a regex correctly cross browser
 *
 *     rsplit("a.b.c.d", /\./) //-> ['a','b','c','d']
 *
 * @param {String} string The string to split
 * @param {RegExp} regex A regular expression
 * @return {Array} An array of strings
 */
export default (str: string, regex: RegExp) =>
  str.split(regex).filter(m => !!m);
