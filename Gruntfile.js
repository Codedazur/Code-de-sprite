module.exports = function(grunt) {

    grunt.initConfig({
        uglify: {
            dist: {
                options: {},
                files: {
                    'code-de-sprite.min.js': ['code-de-sprite.js']
                }
            }
        }
    });

    // Load tasks
    grunt.loadNpmTasks('grunt-contrib-uglify');

    // Tasks
    grunt.registerTask('build', ['uglify:dist']);


};