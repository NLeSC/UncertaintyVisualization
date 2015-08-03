var HtmlReporter = require('protractor-html-screenshot-reporter');

exports.config = {
  allScriptsTimeout: 11000,

  specs: [
    'scenario.js'
  ],

  multiCapabilities: [{
    'browserName': 'chrome',
  }],

  baseUrl: 'http://localhost:9001/',
  //seleniumAddress: 'http://localhost:4444/wd/hub',

  framework: 'jasmine2',

  jasmineNodeOpts: {
    defaultTimeoutInterval: 30000
  },

  onPrepare: function() {
    // Add a screenshot reporter and store screenshots to `/tmp/screnshots`:
    jasmine.getEnv().addReporter(new HtmlReporter({
      baseDirectory: 'e2e/reports'
    }));
  }
};
