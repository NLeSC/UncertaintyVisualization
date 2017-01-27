(function() {
  'use strict';

  function querySelectorDirective() {
    return {
      restrict: 'E',
      templateUrl: 'scripts/querySelector/querySelector.directive.html',
      controller: 'QuerySelectorController',
      controllerAs: 'qs'
    };
  }

  angular.module('uncertApp.querySelector').directive('querySelectorDirective', querySelectorDirective);
})();
