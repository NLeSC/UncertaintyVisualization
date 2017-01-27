(function() {
  'use strict';

  function querySelector() {
    return {
      restrict: 'E',
      templateUrl: 'scripts/querySelector/querySelector.directive.html',
      controller: 'QuerySelectorController',
      controllerAs: 'qs'
    };
  }

  angular.module('uncertApp.querySelector')
    .directive('querySelector', querySelector);
})();
