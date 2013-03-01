// # mouse.js

// ## Luv.Mouse
Luv.Mouse = function(el) {
  // This function creates a mouse handler for a mouse game.
  // It is usually instantiated directly by the main Luv() function,
  // you will probably not need to call `Luv.Mouse()` yourself:

  //       var luv = Luv();
  //       luv.mouse // Already instantiated mouse handler

  var mouse = Object.create(MouseProto);

  mouse.x = 0;
  mouse.y = 0;
  mouse.pressedButtons = {};

  // The mouse module works by attaching several event listeners to the
  // given el element. That's how clicks and movements are detected.

  // mousemove is particularly laggy in Chrome. I'd love to find a better solution
  el.addEventListener('mousemove', function(evt) {
    var rect = el.getBoundingClientRect();
    mouse.x = evt.pageX - rect.left;
    mouse.y = evt.pageY - rect.top;
  });

  el.addEventListener('mousedown', function(evt) {
    var button = getButtonFromEvent(evt);
    mouse.pressedButtons[button] = true;
    mouse.onPressed(mouse.x, mouse.y, button);
  });

  el.addEventListener('mouseup', function(evt) {
    var button = getButtonFromEvent(evt);
    mouse.pressedButtons[button] = false;
    mouse.onReleased(mouse.x, mouse.y, button);
  });

  return mouse;
};


// Internal variable + function to transform DOM event magic numbers into human button names
// (left, middle, right)
var mouseButtonNames = {1: "l", 2: "m", 3: "r"};
var getButtonFromEvent = function(evt) {
  return mouseButtonNames[evt.which];
};

// ## MouseProto
// Shared mouse functions go here
var MouseProto = {

  // Returns the x coordinate where the mouse is (relative to the DOM element)
  getX: function() { return this.x; },

  // Returns the x coordinate where the mouse is (relative to the DOM element)
  getY: function() { return this.y; },

  // Returns both the x and y coordinates of the mouse, as an object of the form
  // `{x: 100, y:200}
  getPosition: function() {
    return {x: this.x, y: this.y};
  },

  // `onPressed` is an overridable callback that is called when any of the mouse
  // buttons is pressed.
  // `button` is a string representing a button name (`"l"` for left, `"m"` for middle,
  // `"r"` for right).

  //       var luv = Luv();
  //       luv.mouse.onPressed = function(x,y,button) {
  //         console.log("Mouse button " + button + " was pressed in " + x + ", " + y);
  //       }
  onPressed: function(x,y,button) {},

  // Works the same as `onPressed`, but is called when a button stops being pressed.
  onReleased: function(x,y,button) {},

  // Returns true if a button is pressed, false otherwhise. Usually used inside
  // the update loop:

  //       var luv = Luv();
  //       luv.update = function(dt) {
  //         if(luv.mouse.isPressed('l')) {
  //           console.log('Left mouse button pressed');
  //         }
  //       };
  isPressed: function(button) {
    return !!this.pressedButtons[button];
  }
};

