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
                src: "index.js",
                dest: "index.min.js",
            },
        },
        watch: {
            scripts: {
                files: ["./models/*.js", "index.js"],
                tasks: ["jshint"],
                options: {
                    interrupt: false,
                },
            },
        },
        jshint: {
            all: ["Gruntfile.js", "index.js", "./models/*.js"],
            options: {
                esversion: 6,
            },
        },
    });

    // Load the plugins that provides tasks
    grunt.loadNpmTasks("grunt-contrib-watch");
    grunt.loadNpmTasks("grunt-contrib-uglify-es");
    grunt.loadNpmTasks("grunt-contrib-jshint"); // watch

    // Default task(s).
    grunt.registerTask("default", ["watch"]);
};
