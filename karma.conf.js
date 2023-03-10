module.exports = function(config) {
    config.set({
      frameworks: ['jasmine'],
      files: ['test/**/*.js'],
      reporters: ['progress'],
      port: 9876,  // karma web server port
      colors: true,
      logLevel: config.LOG_INFO,
      autoWatch: false,
      // singleRun: false, // Karma captures browsers, runs the tests and exits
      concurrency: Infinity,
      browsers: ['ChromeHeadlessNoSandbox'],
      customLaunchers: {
        ChromeHeadlessNoSandbox: {
          base: 'ChromeHeadless',
          flags: ['--no-sandbox']
        }
      },
    })
  }