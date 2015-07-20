module.exports = function(grunt) {

    grunt.initConfig({
        uglify: {
            dist: {
                options: {},
                files: {
                    'sprite.min.js': ['sprite.js']
                }
            }
        }
    });

    // Load tasks
    grunt.loadNpmTasks('grunt-contrib-uglify');

    // Tasks
    grunt.registerTask('dist', ['uglify:dist']);


};