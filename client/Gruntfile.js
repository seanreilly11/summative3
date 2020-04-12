module.exports = function(grunt) {
  // Project configuration.
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    uglify: {
      options: {
        banner: '/*! <%= pkg.name %> <%= grunt.template.today("yyyy-mm-dd") %> */\n'
      },
      build: {
        src: 'js/script.js',
        dest: 'js/script.min.js'
      }
    },
    watch: { // will be all linting tools
      scripts: {
        files: ['js/script.js', 'css/style.css'],
        tasks: ['jshint', 'csslint'],
        options: {
          interrupt: false,
        }
      },
    },
    jshint: {
      all: ['js/script.js'],
      options: {
        esversion: 6
      }
    },
    htmlmin: {                                     // Task
      dist: {                                      // Target
        options: {                                 // Target options
          removeComments: true,
          collapseWhitespace: true
        },
        files: {                                   // Dictionary of files
          'index.min.html': 'index.html'     // 'destination': 'source'
        }
      },
      dev: {                                       // Another target
        files: {
          'index.min.html': 'index.html'
        }
      }
    },
    cssmin: {
      options: {
        mergeIntoShorthands: false,
        roundingPrecision: -1
      },
      target: {
        files: {
          'css/style.min.css': ['css/style.css']
        }
      }
    },
    csslint: {
      strict: {
        options: {
          import: 2
        },
        src: ['css/style.css']
      },
      lax: {
        options: {
          import: false
        },
        src: ['css/style.css']
      }
    },
    imagemin: {
        static: {
            options: {
                optimizationLevel: 3,
                svgoPlugins: [{removeViewBox: false}],
                use: [mozjpeg()] // Example plugin usage
            },
            files: {
                'images/avatar.min.png': 'images/avatar.png'
            }
        }
    }
  });

  // Load the plugins that provides tasks
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-imagemin'); // need to make options
  grunt.loadNpmTasks('grunt-contrib-jshint'); // watch
  grunt.loadNpmTasks('grunt-contrib-cssmin');
  grunt.loadNpmTasks('grunt-contrib-htmlmin');
  grunt.loadNpmTasks('grunt-contrib-csslint'); // watch

  // Default task(s).
  grunt.registerTask('default', ['watch']);
  grunt.registerTask('bugs', ['csslint', 'jshint']);
  grunt.registerTask('ugly', ['uglify', 'imagemin', 'htmlmin', 'cssmin']);
};