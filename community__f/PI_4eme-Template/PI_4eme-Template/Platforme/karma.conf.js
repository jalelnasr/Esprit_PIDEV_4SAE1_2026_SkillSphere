const path = require('path');

try {
  process.env.CHROME_BIN = require('puppeteer').executablePath();
} catch {
  // Keep default Chrome resolution when Puppeteer is unavailable.
}

module.exports = function (config) {
  config.set({
    basePath: '',
    frameworks: ['jasmine', '@angular-devkit/build-angular'],
    plugins: [
      require('karma-jasmine'),
      require('karma-chrome-launcher'),
      require('karma-coverage'),
      require('@angular-devkit/build-angular/plugins/karma')
    ],
    client: {
      clearContext: false,
      jasmine: {
        random: false
      }
    },
    coverageReporter: {
      dir: path.join(__dirname, './coverage/platforme'),
      subdir: '.',
      reporters: [{ type: 'html' }, { type: 'text-summary' }]
    },
    reporters: ['progress'],
    customLaunchers: {
      ChromeHeadlessCI: {
        base: 'ChromeHeadless',
        flags: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
      }
    },
    browsers: ['ChromeHeadlessCI'],
    browserNoActivityTimeout: 120000,
    browserDisconnectTolerance: 2,
    captureTimeout: 120000,
    restartOnFileChange: true
  });
};
