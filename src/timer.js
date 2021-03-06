// # timer.js
(function(){

// ## Luv.Timer
Luv.Timer = Luv.Class('Luv.Timer', {

// In luv, time is managed via instances of this constructor, instead of with
// javascript's setInterval.
// Usually, the timer is something internal that is created by Luv when a game
// is created, and it's used mostly inside luv.js' `run` function.
// luv.js users will rarely need to manipulate objects of this
// library, except to obtain the Frames per second or maybe to tweak the
// deltaTimeLimit (see below)

  init: function() {
    // The time that has passed since the timer was created, in milliseconds
    this.microTime = performance.now();

    // The time that has passed between the last two frames, in seconds
    this.deltaTime = 0;

    // The upper value that deltaTime can have, in seconds. Defaults to 0.25.
    // Can be changed via `setDeltaTimeLimit`.
    // Note that this does *not* magically make a game go faster. If a game has
    // very low FPS, this makes sure that the delta time is not too great (its bad
    // for things like physics simulations, etc).
    this.deltaTimeLimit = Luv.Timer.DEFAULT_DELTA_TIME_LIMIT;

    this.events = {};
    this.maxEventId = 0;
  },

  // updates the timer with a new timestamp.
  nativeUpdate : function(el) {
    this.update((performance.now() - this.microTime) / 1000, el);
  },

  // updates the timer with a new deltatime
  update : function(dt) {
    this.deltaTime = Math.max(0, Math.min(this.deltaTimeLimit, dt));
    this.microTime += dt * 1000;
    for(var id in this.events) {
      if(this.events.hasOwnProperty(id) &&
         this.events[id].update(dt)) {
        delete(this.events[id]);
      }
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

  // Returns the frames per second
  getFPS : function() {
    return this.deltaTime === 0 ? 0 : 1 / this.deltaTime;
  },

  // This function is used in the main game loop. For now, it just calls `window.requestAnimationFrame`.
  nextFrame : function(f) {
    requestAnimationFrame(f);
  },

  after : function(timeToCall, callback, context) {
    return add(this, Luv.Timer.After(timeToCall, callback, context));
  },

  every : function(timeToCall, callback, context) {
    return add(this, Luv.Timer.Every(timeToCall, callback, context));
  },

  tween : function(timeToFinish, subject, to, options) {
    return add(this, Luv.Timer.Tween(timeToFinish, subject, to, options));
  },

  clear : function(id) {
    if(this.events[id]) {
      delete(this.events[id]);
      return true;
    }
    return false;
  }

});

Luv.Timer.DEFAULT_DELTA_TIME_LIMIT = 0.25;

var add = function(timer, e) {
  var id = timer.maxEventId++;
  timer.events[id] = e;
  return id;
};


// `performance.now` polyfill
var performance = window.performance || Date;
performance.now = performance.now       ||
                  performance.msNow     ||
                  performance.mozNow    ||
                  performance.webkitNow ||
                  Date.now;

// `requestAnimationFrame` polyfill
var lastTime = 0,
    requestAnimationFrame =
      window.requestAnimationFrame       ||
      window.msRequestAnimationFrame     ||
      window.mozRequestAnimationFrame    ||
      window.webkitRequestAnimationFrame ||
      window.oRequestAnimationFrame      ||
      function(callback) {
        var currTime   = performance.now(),
            timeToCall = Math.max(0, 16 - (currTime - lastTime)),
            id         = setTimeout(function() { callback(currTime + timeToCall); }, timeToCall);
        lastTime = currTime + timeToCall;
        return id;
      };

}());
