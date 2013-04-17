// # tween.js
(function(){

// ## Luv.Timer.Tween
Luv.Timer.Tween = Luv.Class('Luv.Timer.Tween', {

  init: function(timeToFinish, subject, to, options) {
    deepParamsCheck(subject,to,[]);

    options = options || {};
    this.easing       = getEasingFunction(options.easing);
    this.step         = options.step       || this.step;
    this.onFinished   = options.onFinished || this.onFinished;

    this.runningTime  = 0;
    this.finished     = false;
    this.timeToFinish = timeToFinish;
    this.subject      = subject;
    this.from         = deepCopy(subject, to);
    this.to           = deepCopy(to);
  },

  update: function(dt) {
    if(this.runningTime >= this.timeToFinish) { return; }
    this.runningTime += dt;
    if(this.runningTime >= this.timeToFinish) {
      this.runningTime = this.timeToFinish;
      this.onFinished();
      this.finished = true;
    }
    this.step(deepEase(this, this.from, this.to));
    return this.finished;
  },

  step: function(values) {
    this.subject = deepMerge(this.subject, values);
  },

  onFinished: function() {
  },

  isFinished: function() {
    return !!this.finished;
  }

});

Luv.Timer.Tween.easing = {
  linear: function(t, b, c, d){
    return c * t / d + b;
  }
};

var deepParamsCheck = function(subject, to, path) {
  var toType, newPath;
  for(var k in to) {
    if(to.hasOwnProperty(k)) {
      toType  = typeof to[k];
      newPath = path.slice(0);
      newPath.push(String(k));
      if(toType === 'number') {
        if(typeof subject[k] !== 'number') {
          throw new Error("Parameter '" + newPath.join('/') + "' is missing from 'from' or isn't a number");
        }
      } else if(toType === 'object') {
        deepParamsCheck(subject[k], to[k], newPath);
      } else {
        throw new Error("Parameter '" + newPath.join('/') + "' must be a number or string, was " + to[k]);
      }
    }
  }
};

var deepEase = function(tween, from, to) {
  var result;
  if(typeof to === "object") {
    result = Array.isArray(to) ? [] : {};
    for(var key in to) {
      if(to.hasOwnProperty(key)) {
        result[key] = deepEase(tween, from[key], to[key]);
      }
    }
  } else {
    result = tween.easing(
      tween.runningTime,  // t
      from,               // b
      to - from,          // c
      tween.timeToFinish  // d
    );
  }
  return result;
};

var getEasingFunction= function(easing) {
  easing = easing || "linear";
  return Luv.Timer.Tween.easing[easing];
};

var deepMerge = function(result, keysObj, valuesObj) {
  valuesObj = valuesObj || keysObj;
  if(typeof keysObj === "object") {
    result = result || (Array.isArray(keysObj) ? [] : {});
    for(var key in keysObj){
      if(keysObj.hasOwnProperty(key)) {
        result[key] = deepMerge(result[key], keysObj[key], valuesObj[key]);
      }
    }
  } else {
    result = keysObj;
  }
  return result;
};

var deepCopy = function(keysObj, valuesObj) {
  return deepMerge(null, keysObj, valuesObj);
};

}());
