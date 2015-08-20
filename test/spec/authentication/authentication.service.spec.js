'use strict';

describe('authentication', function() {
  // load the module
  beforeEach(module('uncertApp.authentication'));

  describe('service', function() {
    var AuthenticationService, rootScope, http, cookieStore;
    beforeEach(function() {
      inject(function(_AuthenticationService_, $rootScope, $http, $cookieStore) {
        AuthenticationService = _AuthenticationService_;
        rootScope = $rootScope;
        http = $http; 
        cookieStore = $cookieStore;
      });
    });

    it('should set rootScope.globals to an empty object', function() {
      var expected = {};
      expect(rootScope.globals).toEqual(expected);
    });

    it('should contain a credentialsSet variable that is initially false', function() {
      expect(AuthenticationService.credentialsSet).toBeFalsy();
    });

    var username = 'maarten';
    var password = 'passwordTest';
    var authdata = 'bWFhcnRlbjpwYXNzd29yZFRlc3Q=';

    describe('Login function', function() {
      it('should exist', function() {
        expect(AuthenticationService.Login).toBeDefined();
      });

      var callbackSpy = jasmine.createSpy('callback');
      beforeEach(function() {
        AuthenticationService.Login(username, password, callbackSpy);
      });

      it('should callback', function() {
        expect(callbackSpy).toHaveBeenCalled();
      });
    });

    describe('SetCredentials function', function() {
      it('should exist', function() {
        expect(AuthenticationService.SetCredentials).toBeDefined();
      });

      beforeEach(function() {
        AuthenticationService.SetCredentials(username, password);
      });

      it('should have set rootScope.globals.currentUser', function() {
        var expectedRootScopeGlobals = {
          currentUser: {
            username: username,
            password: password,
            authdata: authdata
          }
        };

        expect(rootScope.globals).toEqual(expectedRootScopeGlobals);
      });

      it('should have set the http default headers', function() {
        var expected ='Basic ' + authdata;
        expect(http.defaults.headers.common.Authorization).toEqual(expected);
      });

      it('should set the cookiestore', function(){
        var expectedRootScopeGlobals = {
          currentUser: {
            username: username,
            password: password,
            authdata: authdata
          }
        };
        expect(cookieStore.get('globals')).toEqual(expectedRootScopeGlobals);
      });

      it('should have set the credentialsSet variable to be true', function() {
        expect(AuthenticationService.credentialsSet).toBeTruthy();
      });
    });

    describe('ClearCredentials function', function() {
      it('should exist', function() {
        expect(AuthenticationService.ClearCredentials).toBeDefined();
      });

      it('should clear the credentials', function() {
        rootScope.globals = {
          currentUser: {
            username: username,
            password: password,
            authdata: authdata
          }
        };
        AuthenticationService.ClearCredentials();

        expect(rootScope.globals).toEqual({});
      });

      it('should clear the cookiestore', function(){
        cookieStore.put('globals', 'something');
        AuthenticationService.ClearCredentials();
        expect(cookieStore.get('globals')).not.toBeDefined();
      });

      it('should have reset the http default headers', function() {
        var expected ='Basic ';
        AuthenticationService.ClearCredentials();
        expect(http.defaults.headers.common.Authorization).toEqual(expected);
      });

      it('should have set the credentialsSet variable to be true', function() {
        AuthenticationService.credentialsSet = false;
        AuthenticationService.ClearCredentials();
        expect(AuthenticationService.credentialsSet).toBeFalsy();
      });
    });
  });
});
