// Karma configuration
// http://karma-runner.github.io/0.12/config/configuration-file.html
// Generated on 2015-01-07 using
// generator-karma 0.8.3

module.exports = function(config) {
  'use strict';

  config.set({
    // enable / disable watching file and executing tests whenever any file changes
    autoWatch: false,

    // base path, that will be used to resolve files and exclude
    basePath: '../',

    // testing framework to use (jasmine/mocha/qunit/...)
    frameworks: ['jasmine'],

    // list of files / patterns to load in the browser
    files: [
      // PhantomJS has no function() {}.bind(this) functionality, so polyfill it
      'node_modules/phantomjs-polyfill/bind-polyfill.js',
      'test/polyfills/string.includes.js',

      // bower:js
      'bower_components/angular/angular.js',
      'bower_components/angular-animate/angular-animate.js',
      'bower_components/angular-cookies/angular-cookies.js',
      'bower_components/angular-resource/angular-resource.js',
      'bower_components/angular-route/angular-route.js',
      'bower_components/angular-sanitize/angular-sanitize.js',
      'bower_components/angular-touch/angular-touch.js',
      'bower_components/d3/d3.js',
      'bower_components/crossfilter/crossfilter.js',
      'bower_components/dcjs/dc.js',
      'bower_components/colorbrewer/colorbrewer.js',
      'bower_components/material-design-lite/material.min.js',
      'bower_components/angular-bootstrap/ui-bootstrap-tpls.js',
      'bower_components/angular-toastr/dist/angular-toastr.tpls.js',
      'bower_components/angular-mocks/angular-mocks.js',
      // endbower

      'app/scripts/**/*.js',
      // test for directives need the templates, inside test load pattyApp.templates module to get templates
      '.tmp/template.js',
      'test/mock/**/*.js',
      'test/spec/**/*.js'
    ],

    // list of files / patterns to exclude
    exclude: [],

    // web server port
    port: 8080,

    // Start these browsers, currently available:
    // - Chrome
    // - ChromeCanary
    // - Firefox
    // - Opera
    // - Safari (only Mac)
    // - PhantomJS
    // - IE (only Windows)
    browsers: [
      'PhantomJS'
      // 'Chrome'
    ],

    // Which plugins to enable
    plugins: [
      'karma-phantomjs-launcher',
      // 'karma-chrome-launcher',
      'karma-jasmine',
      'karma-coverage',
      'karma-junit-reporter',
      'karma-htmlfile-reporter'
    ],

    preprocessors: {
      // source files, that you wanna generate coverage for
      // do not include tests or libraries
      // (these files will be instrumented by Istanbul)
      'app/scripts/**/*.js': ['coverage']
    },
    reporters: ['dots', 'junit', 'coverage', 'html'],
    junitReporter: {
      outputDir: 'test/reports/' //,
      //outputFile: 'test/reports/TEST-results.xml'
    },
    coverageReporter: {
      dir: 'test/reports/coverage/',
      reporters: [{
        type: 'lcov' // for viewing html pages and SonarQube
      }, {
        type: 'cobertura' // for use in Jenkins
      }]
    },
    htmlReporter: {
      outputFile: 'test/reports/units.html'
    },

    // Continuous Integration mode
    // if true, it capture browsers, run tests and exit
    singleRun: false,

    colors: true,

    // level of logging
    // possible values: LOG_DISABLE || LOG_ERROR || LOG_WARN || LOG_INFO || LOG_DEBUG
    logLevel: config.LOG_INFO,

    // Uncomment the following lines if you are using grunt's server to run the tests
    // proxies: {
    //   '/': 'http://localhost:9000/'
    // },
    // URL root prevent conflicts with the site root
    // urlRoot: '_karma_'
  });
};
