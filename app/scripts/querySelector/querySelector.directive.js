(function() {
  'use strict';

  function querySelectorDirective() {
    return {
      restrict: 'E',
      template: require('./querySelector.directive.html'),
      controller: 'QuerySelectorController',
      controllerAs: 'qs'
    };
  }

  angular.module('uncertApp.querySelector').directive('querySelectorDirective', querySelectorDirective);
})();
