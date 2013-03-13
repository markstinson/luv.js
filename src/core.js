// # core.js
(function() {

// ## Main Luv function
Luv = function(options) {
// The main Luv function, and the only global variable defined by luv.js
// It basically parses the given options (see `initializeOptions` for a list of accepted options).
// Returns a game.
// The recommended name for the variable to store the game is `luv`, but you are free to choose any other.

//       var luv = Luv({...});
//       // options omitted, see below for details

// The game will not start until you execute `luv.run()` (assuming that your game variable name is `luv`).

//       var luv = Luv({...});
//       ... // more code ommited, see LuvProto below for details
//       luv.run();

// If you have initialized your game completely with options, you could just run it straight away,
// without storing it into a variable:

//       Luv({...}).run();

  options = initializeOptions(options);

  var luv = Luv.create(LuvModule);

  luv.el  = options.el;

  if(options.load)     { luv.load     = options.load; }
  if(options.update)   { luv.update   = options.update; }
  if(options.draw)     { luv.draw     = options.draw; }
  if(options.run)      { luv.run      = options.run; }
  if(options.onResize) { luv.onResize = options.onResize; }

  // Initialize all the game submodules (see their docs for more info about each one)
  luv.media     = Luv.Media();
  luv.timer     = Luv.Timer();
  luv.keyboard  = Luv.Keyboard(luv.el);
  luv.mouse     = Luv.Mouse(luv.el);
  luv.graphics  = Luv.Graphics(luv.el, luv.media);

  if(options.fullWindow) {
    var resize = function() {
      luv.graphics.setDimensions(window.innerWidth, window.innerHeight);
      luv.onResize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener('resize', resize, false);
    window.addEventListener('orientationChange', resize, false);
  }

  return luv;
};

// ## initializeOptions
var initializeOptions = function(options) {
// Accepted options:

// * `el`: A canvas DOM element to be used
// * `id`: A canvas DOM id to be used (Ignored if `el` is provided)
// * `width`: Sets the width of the canvas, in pixels
// * `height`: Sets the height of the canvas, in pixels
// * `fullWindow`: If set to true, the game canvas will ocuppy the whole window, and auto-adjust (off by default)
// * `load`: A load function (see below)
// * `update`: A load function (see below)
// * `draw`: A draw function (see below)
// * `run`: A run function (see below)
// * `onResize`: A callback that is called when the window is resized (only works when `fullWindow` is active)

// Notes:

// * All options are ... well, optional.
// * The options parameter itself is optional (you can do `var luv = Luv();`)
// * Any other options passed through the `options` hash are ignored
// * If neither `el` or `id` is specified, a new DOM canvas element will be generated and appended to the window. Overrides width and height.
// * `width` and `height` will attempt to get their values from the DOM element. If they can't, and they are not
//    provided as options, they will default to 800x600px
  options = options || {};
  var el      = options.el,
      id      = options.id,
      width   = options.width,
      height  = options.height,
      body    = document.getElementsByTagName('body')[0],
      html    = document.getElementsByTagName('html')[0],
      fullCss = "width: 100%; height: 100%; margin: 0; overflow: hidden;";

  if(!el && id) { el = document.getElementById(id); }
  if(el) {
    if(!width  && el.getAttribute('width'))  { width = parseInt(el.getAttribute('width'), 10); }
    if(!height && el.getAttribute('height')) { height = parseInt(el.getAttribute('height'), 10); }
  } else {
    el = document.createElement('canvas');
    body.appendChild(el);
  }
  if(options.fullWindow) {
    html.style.cssText = body.style.cssText = fullCss;
    width  = window.innerWidth;
    height = window.innerHeight;
  } else {
    width = width   || 800;
    height = height || 600;
  }
  el.setAttribute('width', width);
  el.setAttribute('height', height);

  options.el      = el;
  options.width   = width;
  options.height  = height;

  return options;
};

// ## Luv.extend
// This is a cheap knockoff of [underscore's extend](http://underscorejs.org/#extend): it copies `properties` into `dest`, and returns `dest`.
Luv.extend = function(dest) {
  var properties;
  for(var i=1; i < arguments.length; i++) {
    properties = arguments[i];
    for(var property in properties) {
      if(properties.hasOwnProperty(property)) {
        dest[property] = properties[property];
      }
    }
  }
  return dest;
};

// internal function used for initializing Luv submodules
Luv.module = function(name, methods) {
  var f = function(){ return name; };
  return Luv.extend(Object.create(null), {getType: f, toString: f}, methods);
};

// internal function used to create instances of modules
Luv.create = function(module, properties) {
  return Luv.extend(Object.create(module), properties);
};

// ## Luv default methods
// Contains the default implementation of Luv.load, Luv.draw, Luv.update and Luv.run
var LuvModule = Luv.module('Luv', {
  // Use the `load` function to start loading up resources:

  //       var image;
  //       var luv = Luv();
  //       luv.load = function() {
  //         image = luv.media.Image('cat.png');
  //       };

  // As al alternative, you can override it directly on the options parameter. Note that in that case, you must use
  // `this` instead of `luv` inside the function:

  //       var image;
  //       var luv = Luv({
  //         load: function() {
  //           // notice the usage of this.media instead of luv.media
  //           image = this.media.Image('cat.png');
  //         };
  //       });

  // `load` will be called once at the beginning of the first game cycle, and then never again (see the `run`
  // function below for details). By default, it does nothing (it is an empty function).

  load  : function(){},

  // Use the draw function to draw everything on the canvas. For example:

  //       var luv = Luv();
  //       luv.draw = function() {
  //         luv.graphics.print("hello", 100, 200);
  //       };

  // Alternative syntax, passed as an option:

  //     var luv = Luv({
  //       draw: function() {
  //         // this.graphics instead of luv.graphics
  //         this.graphics.print("hello", 100, 200);
  //       }
  //     });

  // `draw` is called once per frame, after the screen has been erased. See the `run` function below for details.
  draw  : function(){},

  // Use the `update` function to update your game objects/variables between frames.
  // Note that `update` has a parameter `dt`, which is the time that has passed since the last frame.
  // You should use dt to update your entity positions according to their velocity/movement – *Don't assume that
  // the time between frames stays constant*.

  //       var player = { x: 0, y: 0 };
  //       var luv = Luv();
  //       luv.update = function(dt) {
  //         // Player moves to the right 10 pixels per second
  //         player.x += dt * 10;
  //       };

  // Alternative syntax, passed as an option:

  //       var player = { x: 0, y: 0 };
  //       var luv = Luv({
  //         update: function(dt) {
  //         // Player moves to the right 10 pixels per second
  //           player.x += dt * 10;
  //         };
  //       });

  // As with all other luv methods, if you choose this syntax you must use `this` instead of `luv`, since
  // `luv` is still not defined.

  // `update` will be invoked once per frame (see `run` below) and is empty by default (it updates nothing).
  update: function(dt){},

  // The `run` function provides a default game loop. It is usually a good default, and you rarely will need to
  // change it. But you could, if you so desired, the same way you can change `load`, `update` and `draw` (as a
  // field of the `luv` variable or as an option).
  run   : function(){
    var luv = this;

    luv.load(); // luv.run execute luv.load just once, at the beginning

    var loop = function(time) {

      // The first thing we do is updating the timer with the new frame
      luv.timer.step(time);

      // We obtain dt (the difference between previous and this frame's timestamp, in seconds) and pass it
      // to luv.update
      var dt = luv.timer.getDeltaTime();
      luv.update(dt);           // Execute luv.update(dt) once per frame

      luv.graphics.setCanvas(); // And then invoke luv.draw()
      luv.graphics.clear();     // Right after setting the default canvas and erasing it
      luv.draw();               // with the default background color

      // This enqueues another call to the loop function in the next available frame
      luv.timer.nextFrame(loop);
    };

    // Once the loop function is defined, we call it once, so the cycle begins
    luv.timer.nextFrame(loop);
  },

  // `onResize` gets called when `fullWindow` is active and the window is resized. It can be used to
  // control game resizings, i.e. recalculate your camera's viewports. By default, it does nothing.
  onResize  : function(newWidth, newHeight) {}
});


}());