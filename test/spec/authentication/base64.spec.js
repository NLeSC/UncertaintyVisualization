'use strict';

describe('authentication.base64', function() {
  // load the module
  beforeEach(module('uncertApp.authentication'));

  describe('service', function() {
    var Base64;
    beforeEach(function() {
      inject(function(_Base64_) {
        Base64 = _Base64_;
      });
    });

    it('should contain an encode function', function() {
      expect(Base64.encode).toBeDefined();
    });

    it('should contain a decode function', function() {
      expect(Base64.decode).toBeDefined();
    });

    it('should encode a string properly', function() {
      var username = 'maarten';
      var password = 'passwordTest';
      var authdata = Base64.encode(username + ':' + password);

      expect(authdata).toEqual('bWFhcnRlbjpwYXNzd29yZFRlc3Q=');
    });

    it('should decode a string properly', function() {
      var username = 'maarten';
      var password = 'passwordTest';
      var authdata = Base64.decode('bWFhcnRlbjpwYXNzd29yZFRlc3Q=');

      expect(authdata).toEqual(username + ':' + password);
    });
  });
});
