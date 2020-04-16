module.exports = function (grunt) {
    // Project configuration.
    grunt.initConfig({
        pkg: grunt.file.readJSON("package.json"),
        uglify: {
            options: {
                banner:
                    '/*! <%= pkg.name %> <%= grunt.template.today("yyyy-mm-dd") %> */\n',
            },
            build: {
                src: "js/script.js",
                dest: "js/script.min.js",
            },
        },
        watch: {
            // will be all linting tools
            scripts: {
                files: ["js/script.js", "css/style.css"],
                tasks: ["jshint", "csslint"],
                options: {
                    interrupt: false,
                },
            },
        },
        jshint: {
            all: ["js/script.js"],
            options: {
                esversion: 6,
            },
        },
        cssmin: {
            options: {
                mergeIntoShorthands: false,
                roundingPrecision: -1,
            },
            target: {
                files: {
                    "css/style.min.css": ["css/style.css"],
                },
            },
        },
        csslint: {
            strict: {
                options: {
                    import: 2,
                },
                src: ["css/style.css"],
            },
            lax: {
                options: {
                    import: false,
                },
                src: ["css/style.css"],
            },
        },
    });

    // Load the plugins that provides tasks
    grunt.loadNpmTasks("grunt-contrib-watch");
    grunt.loadNpmTasks("grunt-contrib-uglify-es");
    grunt.loadNpmTasks("grunt-contrib-jshint"); // watch
    grunt.loadNpmTasks("grunt-contrib-cssmin");
    grunt.loadNpmTasks("grunt-contrib-csslint"); // watch

    // Default task(s).
    grunt.registerTask("default", ["watch"]);
    grunt.registerTask("bugs", ["csslint", "jshint"]);
    grunt.registerTask("ugly", ["uglify", "cssmin"]);
};
