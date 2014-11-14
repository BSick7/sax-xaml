var version = require('./build/version'),
    setup = require('./build/setup');

module.exports = function (grunt) {
    grunt.loadNpmTasks('grunt-typescript');
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-qunit');
    grunt.loadNpmTasks('grunt-contrib-symlink');
    grunt.loadNpmTasks('grunt-contrib-uglify');

    var meta = {
        name: 'sax-xaml'
    };

    var dirs = {
        test: {
            root: 'test',
            build: 'test/.build',
            lib: 'test/lib'
        }
    };

    grunt.initConfig({
        meta: meta,
        dirs: dirs,
        pkg: grunt.file.readJSON('./package.json'),
        clean: {
            bower: ['./lib'],
            test: ['<%= dirs.test.lib %>']
        },
        setup: {
            base: {
                cwd: '.'
            }
        },
        symlink: {
            options: {
                overwrite: true
            },
            test: {
                files: [
                    {src: './lib/qunit', dest: '<%= dirs.test.lib %>/qunit'},
                    {src: './lib/sax-js', dest: '<%= dirs.test.lib %>/sax-js'},
                    {src: './dist', dest: '<%= dirs.test.lib %>/<%= meta.name %>/dist'},
                    {src: './src', dest: '<%= dirs.test.lib %>/<%= meta.name %>/src'}
                ]
            }
        },
        typescript: {
            build: {
                src: [
                    'typings/*.d.ts',
                    './src/_Version.ts',
                    './src/*.ts',
                    './src/**/*.ts'
                ],
                dest: 'dist/<%= meta.name %>.js',
                options: {
                    target: 'es5',
                    declaration: true,
                    sourceMap: true
                }
            },
            test: {
                src: [
                    'typings/*.d.ts',
                    '<%= dirs.test.root %>/**/*.ts',
                    '!<%= dirs.test.lib %>/**/*.ts',
                    'dist/sax-xaml.d.ts'
                ],
                dest: '<%= dirs.test.build %>',
                options: {
                    target: 'es5',
                    basePath: '<%= dirs.test.root %>',
                    module: 'amd',
                    sourceMap: true
                }
            }
        },
        qunit: {
            all: ['<%= dirs.test.root %>/*.html']
        },
        concat: {
            options: {
                sourceMap: true,
                sourceMapStyle: 'link'
            },
            dist: {
                src: ['lib/sax-js/lib/sax.js', 'dist/sax-xaml.js'],
                dest: 'dist/sax-xaml.concat.js'
            }
        },
        uglify: {
            options: {
                sourceMap: function (path) {
                    return path.replace(/(.*).min.js/, "$1.js.map");
                },
                sourceMapIn: 'dist/sax-xaml.concat.js.map',
                sourceMapIncludeSources: true
            },
            dist: {
                src: ['dist/sax-xaml.concat.js'],
                dest: 'dist/sax-xaml.min.js'
            }
        },
        version: {
            bump: {},
            apply: {
                src: './build/_VersionTemplate._ts',
                dest: './src/_Version.ts'
            }
        }
    });

    grunt.registerTask('default', ['typescript:build']);
    grunt.registerTask('test', ['typescript:build', 'typescript:test', 'qunit']);
    setup(grunt);
    version(grunt);
    grunt.registerTask('lib:reset', ['clean', 'setup', 'symlink:test']);
    grunt.registerTask('dist:upbuild', ['version:bump', 'version:apply', 'typescript:build', 'concat:dist', 'uglify:dist']);
    grunt.registerTask('dist:upminor', ['version:bump:minor', 'version:apply', 'typescript:build', 'concat:dist', 'uglify:dist']);
    grunt.registerTask('dist:upmajor', ['version:bump:major', 'version:apply', 'typescript:build', 'concat:dist', 'uglify:dist']);
};