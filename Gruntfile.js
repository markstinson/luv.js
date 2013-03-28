module.exports = function(grunt) {
  var shell = require('shelljs');

  // order of these files is important, that's why you can't do src/*
  var srcFiles  = [
    "src/shims.js",
    "src/core.js",
    "src/timer.js",
    "src/keyboard.js",
    "src/mouse.js",
    "src/media.js",
    "src/audio.js",
    "src/audio/*",
    "src/graphics.js",
    "src/graphics/*"
  ];
  var testFiles = "test/**/*.js";
  var docFiles = ['README.js.md', 'MIT-LICENSE.md'].concat(srcFiles);

  var generateDocs = function(output) {
    shell.exec("rm -rf " + output);
    shell.exec("cp README.md README.js.md");
    shell.exec("docco " + docFiles.join(" ") + " -t docco/docco.jst -c docco/docco.css -o " + output);
    shell.exec("cp -r docco/public " + output + "/public");
    shell.exec("mv " + output + "/README.js.html " + output + "/index.html");
    shell.exec("rm README.js.md");
  };

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
      banner: {
        options: { banner: '<%= banner %>' },
        src: srcFiles,
        dest: '<%= pkg.name %>.js'
      }
    },
    uglify: {
      options: { banner: '<%= banner %>' },
      dist: {
        src:  '<%= pkg.name %>.js',
        dest: '<%= pkg.name %>.min.js'
      }
    },
    watch: {
      dist: {
        files: srcFiles.concat(testFiles),
        tasks: ['default']
      },
      docs: {
        files: docFiles,
        tasks: ['docs']
      }
    }
  });

  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-watch');

  grunt.registerTask('mocha', 'Run all tests using mocha-phantomjs (needs mocha-phantomjs to be installed globally)', function(){
    shell.exec("mocha-phantomjs test/index.html");
  });

  grunt.registerTask('docs', 'Runs docco and exports the result to docs', function() {
    generateDocs('docs');
  });

  grunt.registerTask('gh-pages', 'generates the docs with docco and publishes to github pages', function() {
    generateDocs('.git/docco-tmp');
    shell.exec("sh ./docco/publish-github-pages.sh");
  });

  grunt.registerTask('compile', 'generate luv.js and luv.min.js from src/', ['jshint:dist', 'concat', 'uglify']);

  // Default task(s).
  grunt.registerTask('default', ['jshint:test', 'compile', 'mocha']);

};
