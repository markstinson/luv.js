module.exports = function(grunt) {
  var shell = require('shelljs');
  var fs    = require('fs');

  // order of these files is important, that's why you can't do src/*
  var srcFiles  = [
    "src/shims.js",
    "src/Luv.js",
    "src/timer.js",
    "src/keyboard.js",
    "src/mouse.js",
    "src/media.js",
    "src/graphics.js"
  ];
  var testFiles = "src/**/*.js";

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    banner: "/*! <%= pkg.name %> <%= pkg.version %> (<%= grunt.template.today('yyyy-mm-dd') %>) - <%= pkg.homepage %> */\n" +
            "/*! <%= pkg.description %> */\n" +
            "/*! <%= pkg.author %> */\n",
    jshint: {
      dist: srcFiles,
      test: {
        options: {expr: true}, // needed for sinon-grunt
        files: testFiles
      }
    },
    concat: {
      dist: {
        src:  srcFiles,
        dest: '<%= pkg.name %>.js'
      },
      banner: {
        options: { banner: '<%= banner %>' },
        src: '<%= pkg.name %>.js',
        dest: '<%= pkg.name %>.js'
      }
    },
    wrap: {
      dist: {
        src: ['<%= pkg.name %>.js'],
        dest: ['<%= pkg.name %>.js'],
        wrapper: ['(function(){\n', '\n}());']
      }
    },
    uglify: {
      options: { banner: '<%= banner %>' },
      dist: {
        src: '<%= pkg.name %>.js',
        dest:  '<%= pkg.name %>.min.js'
      }
    },
    groc: {
      local: {
        src: ['README.md'].concat(srcFiles),
        options: {
          out: 'docs/'
        }
      },
      github: {
        src: ['README.md'].concat(srcFiles),
        options: {
          github: true
        }
      }
    }
  });

  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-wrap');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-groc');

  grunt.registerTask('mocha', 'Run all tests using mocha-phantomjs (needs mocha-phantomjs to be installed globally)', function(){
    shell.exec("mocha-phantomjs test/index.html");
  });

  grunt.registerTask('compile', 'generate luv.js and luv.min.js from src/', ['jshint:dist', 'concat:dist', 'wrap:dist', 'concat:banner', 'uglify']);

  // Default task(s).
  grunt.registerTask('default', ['jshint:test', 'compile', 'mocha']);
};
