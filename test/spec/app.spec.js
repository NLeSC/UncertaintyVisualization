'use strict';

describe('app', function() {
  beforeEach(module('uncertApp'));

  var $rootScope;
  beforeEach(inject(function(_$rootScope_) {
    $rootScope = _$rootScope_;
  }));

  describe('uncertApp.run() function', function() {
    it('should do nothing', inject(function() {
      //Nothing to expect
    }));
  });
});
