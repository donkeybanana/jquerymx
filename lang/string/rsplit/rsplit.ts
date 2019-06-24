/**
 * Splits a string with a regex correctly cross browser
 *
 *     rsplit("a.b.c.d", /\./) //-> ['a','b','c','d']
 *
 * @param {String} string The string to split
 * @param {RegExp} regex A regular expression
 * @return {Array} An array of strings
 */
export default function(str: string, regex: RegExp) {
  var result = regex.exec(str),
    retArr = [],
    first_idx: number

  while (result !== null) {
    first_idx = result.index;
    if (first_idx !== 0) {
      retArr.push(str.substring(0, first_idx));
      str = str.slice(first_idx);
    }
    retArr.push(result[0]);
    str = str.slice(result[0].length);
    result = regex.exec(str);
  }
  if (str !== '') {
    retArr.push(str);
  }
  return retArr;
}
