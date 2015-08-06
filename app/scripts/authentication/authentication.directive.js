(function() {
  'use strict';

  function authenticationDirective() {
    return {
      restrict: 'EA',
      templateUrl: 'scripts/authentication/authentication.directive.html',
      controller: 'AuthenticationController',
      controllerAs: 'authentication'
    };
  }

  angular.module('uncertApp.authentication').directive('authenticationDirective', authenticationDirective);
})();
