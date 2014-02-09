module.exports = function(grunt) {
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),

    concat: {
      options: {
        // define a string to put between each file in the concatenated output
        separator: ';'
      },
      lib: {
        // the files to concatenate
        src: ['js/lib/*.js'],
        // the location of the resulting JS file
        dest: 'js/lib/<%= pkg.name %>-lib.js'
      }
    },

    uglify: {
      options: {
        // the banner is inserted at the top of the output
        banner: '/*! <%= pkg.name %> <%= grunt.template.today("dd-mm-yyyy") %> */\n'
      },
      dist: {
        files: {
          'js/lib/<%= pkg.name %>.lib.min.js': ['<%= concat.lib.dest %>']
        }
      }
    },

    qunit: {
      files: ['tests/index.html']
    },

    jshint: {
      // define the files to lint
      files: ['js/ucarousel.js','js/tests.js'],
      // configure JSHint (documented at http://www.jshint.com/docs/)
      options: {
        "curly": true,
        "eqnull": true,
        "eqeqeq": true,
        "es3": true,
        //"indent": 4,
        //"undef": true,
        //"unused": true,
        "camelcase": true,
        globals: {
          jQuery: true,
          console: true,
          module: true
        }
      }
    },

    compass: {                  // Task
      dist: {                   // Target
        options: {              // Target options
          sassDir: 'sass',
          cssDir: 'stylesheets'
        }
      }
    },

    watch: {
      files: ['<%= jshint.files %>'],
      tasks: ['jshint', 'qunit']
    }

  });

  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-qunit');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-compass');

  grunt.registerTask('test', ['jshint', 'qunit']);

  grunt.registerTask('default', ['jshint', 'qunit', 'concat', 'compass' , 'uglify' ]);
}
