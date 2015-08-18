'use strict';

describe('authentication', function() {
  // load the module
  beforeEach(module('uncertApp.templates'));
  beforeEach(module('uncertApp.authentication'));

  describe('directive', function() {
    var element = '<authentication-directive></authentication-directive>';
    var html;
    var scope;

    beforeEach(function() {
      inject(function($rootScope, $compile) {
        scope = $rootScope.$new();
        html = $compile(element)(scope);
        scope.$digest();
      });
    });

    it('should create an element for an error message', function() {
      scope.error = 'fake error message';
      scope.$digest();
      expect(html.html()).toContain('<div ng-show="error" class="alert alert-danger ng-binding">fake error message</div>');
    });

    it('should create a form for logging in, calling the controller\'s login() function when submitted', function() {
      expect(html.html()).toContain('<div ng-show="!authentication.loggedIn">');
      expect(html.html()).toContain('<form name="form" ng-submit="authentication.login()" role="form');
    });

  });

  describe('controller', function() {
    var ctrl, scope;
    var AuthenticationService = jasmine.createSpyObj('AuthenticationService', ['ClearCredentials', 'Login', 'SetCredentials']);

    beforeEach(function() {
      inject(function($rootScope, $controller) {
        scope = $rootScope.$new();
        ctrl = $controller('AuthenticationController', {
          $scope: scope,
          AuthenticationService : AuthenticationService
        });
      });
    });

    it('should create an application controller', function() {
      expect(ctrl).toBeDefined();
    });

    it('should have a this.loggedIn object which is false', function() {
      expect(ctrl.loggedIn).toBeDefined();
      expect(ctrl.loggedIn).toBeFalsy();
    });

    it('should have called AuthenticationService.ClearCredentials()', function() {
      expect(AuthenticationService.ClearCredentials).toHaveBeenCalled();
    });

    describe('loginCallback()', function() {
      it('should exist', function() {
        expect(ctrl.loginCallback).toBeDefined();
      });

      describe('success', function() {
        beforeEach(function() {
          scope.username = 'maarten';
          scope.password = 'passwordTest';

          var response = {};
          response.success = true;
          ctrl.loginCallback(response);
        });

        it('should call AuthenticationService.SetCredentials if the login was a success', function() {
          expect(AuthenticationService.SetCredentials).toHaveBeenCalledWith('maarten', 'passwordTest');
        });

        it('should set ctrl.loggedIn to true if the login was a success', function() {
          expect(ctrl.loggedIn).toBeTruthy();
        });

        it('should not set $scope.dataLoading to false if the login was a success', function() {
          expect(scope.dataLoading).toBeFalsy();
        });
      });

      describe('failure', function() {
        beforeEach(function() {
          scope.username = 'maarten';
          scope.password = 'passwordTest';

          var response = {};
          response.success = false;
          ctrl.loginCallback(response);
        });

        it('should not set ctrl.loggedIn to true if the login was a failure', function() {
          expect(ctrl.loggedIn).toBeFalsy();
        });

        it('should set $scope.dataLoading to false if the login was a failure', function() {
          expect(scope.dataLoading).toBeFalsy();
        });
      });
    });

    describe('login()', function() {
      it('should exist', function() {
        expect(ctrl.login).toBeDefined();
      });

      it('should be called with username and password', function() {
        scope.username = 'maarten';
        scope.password = 'passwordTest';
        ctrl.login();

        expect(AuthenticationService.Login).toHaveBeenCalledWith('maarten', 'passwordTest', ctrl.loginCallback);
      });
    });
  });
});
