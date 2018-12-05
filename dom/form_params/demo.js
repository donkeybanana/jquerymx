steal('./form_params', '../../lang/json/json.js', function() {
  // updates the JSON text
  var update = function() {
    // get form data
    var json = $('#fp').formParams(),
      //convert it to JSON
      jsonString = $.toJSON(json);

    // show JSON
    $('#result').text(jsonString);
  };

  // listen for changes and update
  $('#fp').change(update);

  // show json right away
  update();
});
