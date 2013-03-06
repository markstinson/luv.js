// # media/image.js
(function() {

// ## Luv.Media.Image
// Internal object used by the images created inside Luv.Media()
Luv.Media.Image = function(path) {
  var media = this;
  var image = Luv.extend(Object.create(Luv.Media.Image), {
    path: path
  });

  media.newAsset(image);

  var source   = new Image(); // html image
  image.source = source;

  source.addEventListener('load',  function(){ media.registerLoad(image); });
  source.addEventListener('error', function(){ media.registerError(image); });
  source.src = path;

  return image;
};

Luv.setType(Luv.Media.Image, 'Luv.Media.Image');

// ## Luv.Media.Image methods
Luv.extend(Luv.Media.Image, Luv.Media.Asset, {
  toString      : function() {
    return 'Luv.Media.Image("' + this.path + '")';
  },
  getWidth      : function() { return this.source.width; },
  getHeight     : function() { return this.source.height; },
  getDimensions : function() {
    return { width: this.source.width, height: this.source.height };
  }
});


}());
