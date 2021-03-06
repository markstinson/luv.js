(function() {

  var $code, $iframe, refreshInputTimeout;

  var ordered_example_ids =
    "introduction hello_luv rectangles bubbles bob_the_square cat_and_mouse fingers airplanes ding paint"
      .split(" "),
    humanize   = function(str)  { return str.replace(/_/g, " "); },
    makeUpper  = function(str)  { return str.toUpperCase(); },
    capitalize = function(str)  { return str.replace(/(^| )(\w)/g, makeUpper); },
    examples = ordered_example_ids.map(function(id) {
      return {
        id: id,
        title: capitalize(humanize(id)),
        html: example_data[id]
      };
    });

  var refreshIframe = function() {
    var $parent   = $iframe.parentNode,
        $newframe = document.createElement('iframe');

    clearTimeout(refreshInputTimeout);

    $parent.removeChild($iframe);
    $parent.appendChild($newframe);

    // settimeout gives the new frame time to "settle in" in the dom
    // without it, sometimes it doesn't refresh correctly
    setTimeout(function() {
      var doc  = $newframe.contentWindow.document;
      doc.open();
      doc.write($code.getValue());
      doc.close();

      $iframe = $newframe;
    }, 1);
  };

  var delayedRefreshIframe = function() {
    clearTimeout(refreshInputTimeout);
    refreshInputTimeout = setTimeout(refreshIframe, 1000);
  };

  var addExampleToList = function(example) {
    var $ul = document.getElementById('example-selectors'),
        $li = document.createElement('li'),
        $a  = document.createElement('a');

    $a.href = "#" + example.id;
    $a.innerHTML = example.title;
    $a.addEventListener('click', function(evt) {
      evt.preventDefault();
      evt.stopPropagation();

      window.location.hash = example.id;

      $code.setValue(example.html);
      refreshIframe();

      return false;
    });

    $li.appendChild($a);
    $ul.appendChild($li);
  };


  var getAnchor = function() {
    var split = location.href.split("#");
    return split.length > 1 ? split[split.length - 1] : "";
  };

  document.addEventListener('DOMContentLoaded', function() {
    var anchor    = getAnchor(),
        isFilled  = false,
        $textArea = document.getElementsByTagName('textarea')[0];

    $iframe = document.getElementsByTagName('iframe')[0];

    $code = CodeMirror.fromTextArea($textArea, {mode: "htmlmixed"});

    $code.on('change', delayedRefreshIframe);

    examples.forEach(function(example) {
      addExampleToList(example);

      // if we have an anchor, use it to fill the example
      if(example.id == anchor) {
        isFilled = true;
        $code.setValue(example.html);
        refreshIframe();
      }
    });

    // if we have no anchor, just fill it with the first example
    if(!isFilled) {
      $code.setValue(examples[0].html);
      refreshIframe();
    }
  });

}());

