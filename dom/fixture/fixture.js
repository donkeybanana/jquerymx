import $ from 'jquery';

/*
 * TLDR;
 *
 * $.ajax({
 *   ...
 *   fixture: () => ({
 *     some: { data: ['a','b','c'] }
 *   })
 * })
 */

// Register `fixture` dataType for settings with `{ fixture: Function }`
$.ajaxPrefilter(function(settings) {
  if (!$.fixture.on) {
    return;
  }

  if (settings.fixture === undefined) {
    return;
  }

  if (typeof settings.fixture !== 'function') {
    console.warn('$.fixture', settings.type, settings.url, 'not a function');
    return;
  }

  // Become first dataType in order to override entire request
  settings.dataTypes.splice(0, 0, 'fixture');
});

// Exec fixture Function for dataType `fixture`
$.ajaxTransport('fixture', function(settings) {
  let timeout;
  const { fixture } = settings;

  return {
    send: function(_headers, callback) {
      callback(200, 'success', { fixture: JSON.stringify(fixture()) });
    },

    abort: function() {
      clearTimeout(timeout);
    }
  };
});

$.fixture = {
  on: true
};
