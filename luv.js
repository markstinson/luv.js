/*! luv 0.0.1 (2013-02-28) - https://github.com/kikito/luv.js */
/*! Minimal HTML5 game development lib */
/*! Enrique Garcia Cota */
(function(){
// http://paulirish.com/2011/requestanimationframe-for-smart-animating/
// http://my.opera.com/emoller/blog/2011/12/20/requestanimationframe-for-smart-er-animating
//
// requestAnimationFrame polyfill by Erik Möller
// fixes from Paul Irish and Tino Zijdel

(function() {
  var lastTime = 0;
  var vendors = ['ms', 'moz', 'webkit', 'o'];

  for(var x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
    window.requestAnimationFrame = window[vendors[x]+'RequestAnimationFrame'];
    window.cancelAnimationFrame  = window[vendors[x]+'CancelAnimationFrame'] ||
                                   window[vendors[x]+'CancelRequestAnimationFrame'];
  }

  if (!window.requestAnimationFrame) {
    window.requestAnimationFrame = function(callback, element) {
      var currTime = new Date().getTime();
      var timeToCall = Math.max(0, 16 - (currTime - lastTime));
      var id = window.setTimeout(function() { callback(currTime + timeToCall); },
                                 timeToCall);
      lastTime = currTime + timeToCall;
      return id;
    };
  }

  if (!window.cancelAnimationFrame) {
    window.cancelAnimationFrame = function(id) { clearTimeout(id); };
  }
}());

// # Luv.js

// ## Main Luv function
Luv = function(options) {
// The main Luv function, and the only global variable defined by luv.js
// It basically parses the given options (see `initializeOptions` for a list of accepted options).
// Returns a game.
// The recommended name for the variable to store the game is `luv`, but you are free to choose any other.

//       var luv = Luv({...});
//       // options omitted, see initializeOptions & LuvProto below

// The game will not start until you execute `luv.run()` (assuming that your game variable name is `luv`).

//       var luv = Luv({...});
//       ... // more code ommited, see LuvProto below for details
//       luv.run();

// If you have initialized your game completely with options, you could just run it straight away,
// without storing it into a variable:

//       Luv({...}).run();

  options = initializeOptions(options);

  var luv = Object.create(LuvProto);
  luv.el  = options.el;

  if(options.load)  { luv.load   = options.load; }
  if(options.update){ luv.update = options.update; }
  if(options.draw)  { luv.draw   = options.draw; }
  if(options.run)   { luv.run    = options.run; }

  // Initialize all the game submodules (see their docs for more info about each one)
  luv.graphics  = Luv.Graphics(luv.el, options.width, options.height);
  luv.timer     = Luv.Timer();
  luv.keyboard  = Luv.Keyboard(luv.el);
  luv.mouse     = Luv.Mouse(luv.el);
  luv.media     = Luv.Media();

  return luv;
};

// ## initializeOptions
var initializeOptions = function(options) {
// Accepted options:

// * `el`: A canvas DOM element to be used
// * `id`: A camvas DOM id to be used (Ignored if `el` is provided)
// * `width`: Sets the width of the canvas, in pixels
// * `height`: Sets the height of the canvas, in pixels
// * `load`: A load function (see above)
// * `update`: A load function (see above)
// * `draw`: A draw function (see above)
// * `run`: A run function (see above)

// Notes:

// * All options are ... well, optional.
// * The options parameter itself is optional (you can do `var luv = Luv();`)
// * Any other options passed through the `options` hash are ignored
// * If neither `el` or `id` is specified, a new DOM canvas element will be generated and appended to the `body` of the page.
// * `width` and `height` will attempt to get their values from the DOM element. If they can't, and they are not
//    provided as options, they will default to 800x600px
  options = options || {};
  var el     = options.el,
      id     = options.id,
      width  = options.width,
      height = options.height;

  if(!el && id) { el = document.getElementById(id); }
  if(el) {
    if(!width  && el.getAttribute('width'))  { width = parseInt(el.getAttribute('width'), 10); }
    if(!height && el.getAttribute('height')) { height = parseInt(el.getAttribute('height'), 10); }
  } else {
    el = document.createElement('canvas');
    document.getElementsByTagName('body')[0].appendChild(el);
  }
  width = width || 800;
  height = height || 600;
  el.setAttribute('width', width);
  el.setAttribute('height', height);

  options.el      = el;
  options.width   = width;
  options.height  = height;

  return options;
};





// ## LuvProto
// Contains the default implementation of Luv.load, Luv.draw, Luv.update and Luv.run
var LuvProto = {
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
  }
};



// # timer.js

// ## Luv.Timer
Luv.Timer = function() {

// In luv, time is managed via instances of this constructor, instead of with
// javascript's setInterval.
// Usually, the timer is something internal that is created by Luv when a game
// is created, and it's used mostly inside luv.js' `run` function.
// luv.js users will rarely need to manipulate objects of this
// library, except to obtain the Frames per second or maybe to tweak the
// deltaTimeLimit (see below)

  var timer = Object.create(TimerProto);
  // The time that has passed since the timer was created, in milliseconds
  timer.microTime = 0;

  // The time that has passed between the last two frames, in seconds
  timer.deltaTime = 0;

  // The upper value that deltaTime can have, in seconds. Defaults to 0.25.
  // Can be changed via `setDeltaTimeLimit`.
  // Note that this does *not* magically make a game go faster. If a game has
  // very low FPS, this makes sure that the delta time is not too great (its bad
  // for things like physics simulations, etc).
  timer.deltaTimeLimit = 0.25;
  return timer;
};

// ## TimerProto
// The `timer` methods go here
var TimerProto = {
  // updates the timer with a new timestamp.
  step : function(time) {
    // In some rare cases (the first couple frames) the time readings might
    // overflow. This conditional makes sure that case does not happen.
    if(time > this.microTime) {
      this.deltaTime = (time - this.microTime) / 1000;
      this.microTime = time;
    }
  },

  // `deltaTimeLimit` means "the maximum delta time that the timer will report".
  // It's 0.25 by default. That means that if a frame takes 3 seconds to complete,
  // the *reported* delta time will be 0.25s. This setting doesn't magically make
  // games go faster. It's there to prevent errors when a lot of time passes between
  // frames (for example, if the user changes tabs, the timer could spend entire
  // minutes locked in one frame).
  setDeltaTimeLimit : function(deltaTimeLimit) {
    this.deltaTimeLimit = deltaTimeLimit;
  },

  // returns the `deltaTimeLimit`; the maximum delta time that will be reported.
  // see `setDeltaTimeLimit` for details.
  getDeltaTimeLimit : function() {
    return this.deltaTimeLimit;
  },

  // returns how much time has passed between this frame and the previous one,
  // in seconds. Note that it's capped by `deltaTimeLimit`.
  getDeltaTime : function() {
    return Math.min(this.deltaTime, this.deltaTimeLimit);
  },

  // Returns how much time has passed since the timer was created, in milliseconds
  getMicroTime : function() {
    return this.microTime;
  },

  // Returns how much time has passed since the timer was created, in seconds
  getTime : function() {
    return this.getMicroTime() / 1000;
  },

  // Returns the frames per second
  getFPS : function() {
    return this.deltaTime === 0 ? 0 : 1 / this.deltaTime;
  },

  // This function is used in the main game loop. For now, it just calls `window.requestAnimationFrame`.
  nextFrame : function(f) {
    window.requestAnimationFrame(f);
  }

};




// keycodes/ algorithms inspired by http://www.selfcontained.us/2009/09/16/getting-keycode-values-in-javascript/
var keys = {
  8: "backspace", 9: "tab", 13: "enter", 16: "shift", 17: "ctrl", 18: "alt",
  19: "pause", 20: "capslock", 27: "escape", 33: "pageup", 34: "pagedown",
  35: "end", 36: "home", 37: "left", 38: "up", 39: "right", 40: "down", 45: "insert",
  46: "delete", 91: "lmeta", 92: "rmeta", 93: "mode", 96: "kp0", 97: "kp1",
  98: "kp2", 99: "kp3", 100: "kp4", 101: "kp5", 102: "kp6", 103: "kp7", 104: "kp8",
  105: "kp9", 106: "kp*", 107: "kp+", 109: "kp-", 110: "kp.", 111: "kp/", 112: "f1",
  113: "f2", 114: "f3", 115: "f4", 116: "f5", 117: "f6", 118: "f7", 119: "f8", 120: "f9",
  121: "f10", 122: "f11", 123: "f12", 144: "numlock", 145: "scrolllock", 186: ",",
  187: "=", 188: ",", 189: "-", 190: ".", 191: "/", 192: "`", 219: "[", 220: "\\",
  221: "]", 222: "'"
};

var shiftedKeys = {
  192:"~", 48:")", 49:"!", 50:"@", 51:"#", 52:"$", 53:"%", 54:"^", 55:"&", 56:"*", 57:"(", 109:"_", 61:"+",
  219:"{", 221:"}", 220:"|", 59:":", 222:"\"", 188:"<", 189:">", 191:"?",
  96:"insert", 97:"end", 98:"down", 99:"pagedown", 100:"left", 102:"right", 103:"home", 104:"up", 105:"pageup"
};

var rightKeys = {
  16: "rshift", 17: "rctrl", 18: "ralt"
};

var getKeyFromEvent = function(event) {
  var code = event.which;
  var key;
  if(event.keyLocation && event.keyLocation > 1) { key = rightKeys[code]; }
  else if(event.shiftKey) { key = shiftedKeys[code]; }
  else { key = keys[code]; }

  return key || String.fromCharCode(code);
};

var KeyboardProto = {
  onPressed  : function(key, code) {},
  onReleased : function(key, code) {},
  isDown     : function(key) {
    return !!this.keysDown[key];
  }
};

Luv.Keyboard = function(el) {
  var keyboard = Object.create(KeyboardProto);

  keyboard.keysDown = {};

  el.tabIndex = 1;
  el.focus();

  el.addEventListener('keydown', function(evt) {
    var key  = getKeyFromEvent(evt);
    keyboard.keysDown[key] = true;
    keyboard.onPressed(key, evt.which);
  });

  el.addEventListener('keyup', function(evt) {
    var key  = getKeyFromEvent(evt);
    keyboard.keysDown[key] = false;
    keyboard.onReleased(key, evt.which);
  });

  return keyboard;
};


// # mouse.js

// ## Luv.Mouse
Luv.Mouse = function(el) {
  // This module allows luv.js games to get input from the mouse
  // It is usually instantiated directly by the main Luv() function,
  // a programmer using luv.js to create a game will almost certainly
  // not need to create this module. But it's completely possible to
  // do so, like this:

  //       var mouse = Luv.Mouse(el); // el must be a DOM element
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
  getX: function() { return this.x; },
  getY: function() { return this.y; },
  getPosition: function() {
    return {x: this.x, y: this.y};
  },
  onPressed: function(x,y,button) {},
  onReleased: function(x,y,button) {},
  isPressed: function(button) {
    return !!this.pressedButtons[button];
  }
};


var AssetProto = {
  isPending: function() { return this.status == "pending"; },
  isLoaded:  function() { return this.status == "loaded"; },
  isError:   function() { return this.status == "error"; }
};

var ImageProto = Object.create(AssetProto);

ImageProto.getWidth       = function() { return this.source.width; };
ImageProto.getHeight      = function() { return this.source.height; };
ImageProto.getDimensions  = function() {
  return { width: this.source.width, height: this.source.height };
};
ImageProto.tostring       = function() {
  return 'Luv.Media.Image("' + this.path + '")';
};

var MediaProto = {
  isLoaded     : function() { return this.pending === 0; },
  getPending   : function() { return this.pending; },
  onAssetLoaded: function(asset) {},
  onLoadError  : function(asset) { throw new Error("Could not load " + asset); },
  onLoaded     : function() {},
  newAsset  : function(asset, loadCallback, errorCallback) {
    this.pending++;
    asset.loadCallback  = loadCallback;
    asset.errorCallback = errorCallback;
    asset.status        = "pending";
  },
  registerLoad : function(asset) {
    this.pending--;

    asset.status = "loaded";
    if(asset.loadCallback) { asset.loadCallback(asset); }

    this.onAssetLoaded(asset);
    if(this.isLoaded()) { this.onLoaded(); }
  },
  registerError: function(asset) {
    this.pending--;

    asset.status = "error";
    if(asset.errorCallback) { asset.errorCallback(asset); }

    this.onLoadError(asset);
  }
};

Luv.Media = function() {
  var media = Object.create(MediaProto);

  media.pending = 0;

  media.Image = function(path, loadCallback, errorCallback) {
    var image  = Object.create(ImageProto);
    image.path = path;

    media.newAsset(image, loadCallback, errorCallback);

    var source   = new Image(); // html image
    image.source = source;

    source.addEventListener('load',  function(){ media.registerLoad(image); });
    source.addEventListener('error', function(){ media.registerError(image); });
    source.src = path;

    return image;
  };

  return media;
};




var CanvasProto = {
  getWidth      : function(){ return this.width; },
  getHeight     : function(){ return this.height; },
  getDimensions : function(){ return { width: this.width, height: this.height }; }
};

var Canvas = function(el, width, height) {
  el.setAttribute('width', width);
  el.setAttribute('height', height);

  var canvas     = Object.create(CanvasProto);
  canvas.width   = width;
  canvas.height  = height;
  canvas.el      = el;
  canvas.ctx     = el.getContext('2d');

  return canvas;
};

var twoPI = Math.PI * 2;

var setColor = function(self, name, r,g,b,a) {
  var color = self[name];
  if(Array.isArray(r)) {
    color.r = r[0];
    color.g = r[1];
    color.b = r[2];
    color.a = r[3] || 255;
  } else {
    color.r = r;
    color.g = g;
    color.b = b;
    color.a = a || 255;
  }
  self[name + 'Style'] = "rgba(" + [color.r, color.g, color.b, color.a/255].join() + ")";
};

var getColor = function(color) {
  return [color.r, color.g, color.b, color.a ];
};

var drawPath = function(graphics, mode) {
  switch(mode){
  case 'fill':
    graphics.ctx.fillStyle = graphics.colorStyle;
    graphics.ctx.fill();
    break;
  case 'line':
    graphics.ctx.strokeStyle = graphics.colorStyle;
    graphics.ctx.stroke();
    break;
  default:
    throw new Error('Invalid mode: [' + mode + ']. Should be "fill" or "line"');
  }
};

var drawPolyLine = function(graphics, methodName, minLength, coords) {

  if(coords.length < minLength) { throw new Error(methodName + " requires at least 4 parameters"); }
  if(coords.length % 2 == 1) { throw new Error(methodName + " requires an even number of parameters"); }

  graphics.ctx.moveTo(coords[0], coords[1]);

  for(var i=2; i<coords.length; i=i+2) {
    graphics.ctx.lineTo(coords[i], coords[i+1]);
  }

  graphics.ctx.stroke();
};


var GraphicsProto = {
  setCanvas: function(canvas) {
    canvas = canvas || this.defaultCanvas;
    this.canvas = canvas;
    this.el     = canvas.el;
    this.ctx    = canvas.ctx;
    this.setLineWidth(this.lineWidth);
    this.setLineCap(this.lineCap);
  },
  getCanvas: function() { return this.canvas; },
  setColor : function(r,g,b,a) { setColor(this, 'color', r,g,b,a); },
  getColor : function() { return getColor(this.color); },

  setBackgroundColor : function(r,g,b,a) { setColor(this, 'backgroundColor', r,g,b,a); },
  getBackgroundColor : function() { return getColor(this.backgroundColor); },

  setLineWidth : function(width) {
    this.lineWidth = width;
    this.ctx.lineWidth = width;
  },

  getLineWidth : function() {
    return this.lineWidth;
  },

  setLineCap : function(cap) {
    if(cap != "butt" && cap != "round" && cap != "square") {
      throw new Error("Line cap must be either 'butt', 'round' or 'square'");
    }
    this.ctx.lineCap = cap;
    this.lineCap     = this.ctx.lineCap;
  },

  getLineCap : function() { return this.lineCap; },

  clear : function() {
    this.ctx.fillStyle = this.backgroundColorStyle;
    this.ctx.fillRect(0, 0, this.width, this.height);
  },

  print : function(str,x,y) {
    this.ctx.fillStyle = this.colorStyle;
    this.ctx.fillText(str, x, y);
  },

  line : function() {
    var coords = Array.isArray(arguments[0]) ? arguments[0] : arguments;

    this.ctx.beginPath();
    drawPolyLine(this, 'luv.graphics.line', 4, coords);
    drawPath(this, 'line');
  },

  rectangle : function(mode, left, top, width, height) {
    this.ctx.beginPath();
    this.ctx.rect(left, top, width, height);
    drawPath(this, mode);
    this.ctx.closePath();
  },

  polygon : function() {
    var mode   = arguments[0],
        coords = arguments[1];

    if(!Array.isArray(coords)) {
      coords = [];
      for(var i=1;i<arguments.length;i++) { coords[i-1] = arguments[i]; }
    }

    this.ctx.beginPath();

    drawPolyLine(this, 'luv.graphics.polygon', 6, coords);
    drawPath(this, mode);

    this.ctx.closePath();
  },

  circle : function(mode, x,y,radius) {
    this.arc(mode, x, y, radius, 0, twoPI);
    this.ctx.closePath();
  },

  arc : function(mode, x,y,radius, startAngle, endAngle) {
    this.ctx.beginPath();
    this.ctx.arc(x,y,radius, startAngle, endAngle, false);
    drawPath(this, mode);
  },

  drawImage : function(img, x, y) {
    if(!img.isLoaded()) {
      throw new Error("Attepted to draw a non loaded image: " + img);
    }
    this.ctx.drawImage(img.source, x, y);
  },

  drawCanvas : function(canvas, x, y) {
    this.ctx.drawImage(canvas.el, x, y);
  }
};

Luv.Graphics = function(el, width, height) {
  var gr = Object.create(GraphicsProto);

  gr.width = width;
  gr.height = height;

  gr.lineWidth = 1;
  gr.lineCap   = "butt";

  gr.color = {};
  gr.setColor(255,255,255);

  gr.backgroundColor = {};
  gr.setBackgroundColor(0,0,0);

  gr.defaultCanvas = Canvas(el, width, height);
  gr.setCanvas();

  gr.Canvas = function(width, height) {
    var el = document.createElement('canvas');
    return Canvas(el, width || gr.width, height || gr.height);
  };

  return gr;
};


}());