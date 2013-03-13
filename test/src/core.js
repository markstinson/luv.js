describe("Luv", function(){
  it("exists", function(){
    expect(Luv).to.be.a('function');
  });
  describe("constructor", function() {
    describe("when invoked with no params", function() {
      it("creates a Luv instance with default attributes", function() {
        var luv = Luv();
        expect(luv.graphics.el).to.be.ok;
        expect(luv.graphics.getWidth()).to.equal(800);
        expect(luv.graphics.getHeight()).to.equal(600);

        expect(luv.load).to.be.a('function');
        expect(luv.draw).to.be.a('function');
        expect(luv.update).to.be.a('function');
        expect(luv.run).to.be.a('function');

        expect(luv.timer).to.be.ok;
        expect(luv.keyboard).to.be.ok;
        expect(luv.mouse).to.be.ok;
        expect(luv.media).to.be.ok;
      });
    });

    describe("when invoked with params", function() {
      it("sets the el", function() {
        var el = document.createElement('canvas');
        var luv = Luv({el: el});
        expect(luv.el).to.equal(el);
      });

      it("sets the el via an id", function() {
        var el = document.createElement('canvas');
        sinon.stub(document, 'getElementById').withArgs('foo').returns(el);

        var luv = Luv({id: "foo"});
        expect(luv.el).to.equal(el);

        document.getElementById.restore();
      });

      it("reads the width and height from el", function() {
        var el = document.createElement('canvas');
        el.setAttribute('width', 320);
        el.setAttribute('height', 200);

        var luv = Luv({el: el});
        expect(luv.graphics.getDimensions()).to.deep.equal({width: 320, height: 200});
      });

      it("reads the width and height from options", function() {
        var el = document.createElement('canvas');
        el.setAttribute('width', 320);
        el.setAttribute('height', 200);

        var luv = Luv({el: el, width: 500, height: 300});
        expect(luv.graphics.getDimensions()).to.deep.equal({width: 500, height: 300});
      });

      it("reads the load, update, draw and run functions from options", function() {
        var load   = function(){},
            update = function(){},
            draw   = function(){},
            run    = function(){};

        var luv = Luv({load: load, update: update, draw: draw, run: run});

        expect(luv.load).to.equal(load);
        expect(luv.update).to.equal(update);
        expect(luv.draw).to.equal(draw);
        expect(luv.run).to.equal(run);

      });

    });

  });

  describe("Luv.extend", function() {
    it("copies properties inside an object, and returns the object", function() {
      var obj = {};
      expect(Luv.extend(obj, {bar: 'baz'})).to.equal(obj);
      expect(obj.bar).to.equal('baz');
    });
    it("copies more than one argument", function() {
      var obj = Luv.extend({}, {a: 1, b: 2}, {b: 3, c: 4});
      expect(obj).to.deep.equal({a: 1, b: 3, c: 4});
    });
  });

  describe("Luv.module", function() {
    it("adds getType and toString, returns the object", function() {
      var m = Luv.module('foo');
      expect(m.getType()).to.equal('foo');
      expect(m+"").to.equal('foo');
    });

    it("adds methods to the object", function() {
      var m = Luv.module('foo', {bar: 'baz'});
      expect(m.bar).to.equal('baz');
    });
  });

  describe("Luv.create", function() {
    it("instantiates modules", function() {
      var m = Luv.module('foo', {bar: 'baz'});
      var obj = m.create();
      expect(obj.bar).to.equal('baz');
    });

    it("extends properties, if present", function() {
      var m = Luv.module('foo');
      var obj = m.create({myProperty: 1});
      expect(obj.myProperty).to.equal(1);
    });
  });

  describe("luv.run", function() {
    it("invokes the expected functions", function() {

      this.clock = sinon.useFakeTimers(0, "setTimeout", "clearTimeout", "Date");

      var luv = Luv();

      var load      = sinon.spy(luv,'load'),
          update    = sinon.spy(luv, 'update'),
          step      = sinon.spy(luv.timer, 'step'),
          clear     = sinon.spy(luv.graphics, 'clear'),
          draw      = sinon.spy(luv, 'draw');

      var counter = 0;
      var nextFrame = sinon.stub(luv.timer, 'nextFrame', function(f) {
        if(counter !== 0) { return; }
        counter = counter + 1;
        f(0);
      });

      luv.run();

      expect(step).to.have.been.called;
      expect(load).to.have.been.called;
      expect(update).to.have.been.called;
      expect(clear).to.have.been.called;
      expect(draw).to.have.been.called;
      expect(nextFrame).to.have.been.called;

      this.clock.restore();
    });
  });


});