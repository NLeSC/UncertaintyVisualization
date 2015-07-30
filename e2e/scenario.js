'use strict';

/* global describe, beforeEach, it, expect */
/* global browser */

describe('uncertApp', function() {

  beforeEach(function() {
    browser.get('index.html');
  });

  it('should have Uncertainty Visualisation title', function() {
    expect(browser.getTitle()).toMatch('Uncertainty Visualisation');
  });
});
