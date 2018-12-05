import './route.js';
import '../../lang/json/json.js';
import '../form_params/form_params.js';

window.location.hash = '';

$('#data_update_target').html();
$('#hash_update_target').html();
var hash_cnt = 0,
  data_cnt = 0;

$.route.routes = {};
$.route('');
$.route('pages/:var1/:var2/:var3', {
  var1: 'default1',
  var2: 'default2',
  var3: 'default3'
});
$.route('/:var1/:var2', {
  var1: 'def1',
  var2: 'def2'
});

$(window).bind('hashchange', function() {
  debugger;
  $('#hash_update_target')
    .append(++hash_cnt + ': Hash: <span class="green">' + window.location.hash)
    .append('</span> Route data: ' + $.toJSON($.route.data._data) + '<br />');
});

$.route.bind('change', function(ev, attr, how, newVal, oldVal) {
  debugger;
  $('#data_update_target')
    .append(
      ++data_cnt +
        ': <span class="green">' +
        showChange(attr, how, newVal, oldVal)
    )
    .append('</span> Route data: ' + $.toJSON($.route.data._data) + '<br />');
});

const showChange = function(attr, how, newVal, oldVal) {
  switch (how) {
    case 'set':
      $('#data_form > #' + attr).val(newVal);
      return how + ' ' + attr + ': ' + oldVal + ' => ' + newVal;
      break;
    case 'remove':
      $('#data_form > #' + attr).val('');
      return how + ' ' + attr;
      break;
    case 'add':
      $('#data_form > #' + attr).val(newVal);
      return how + ' ' + attr + ': ' + newVal;
      break;
  }
};

$('#data_form').bind('submit', function(ev) {
  ev.preventDefault();

  const data = $('#data_form').formParams();
  for (var val in data) {
    if (data[val] == '') {
      delete data[val];
    }
  }
  $.route.attrs(data, true);

  return false;
});

$('button').bind('click', function(ev) {
  $(ev.target)
    .siblings('div')
    .empty();
});
