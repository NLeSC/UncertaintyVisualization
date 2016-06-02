(function() {
  'use strict';

  function viewPerspectivesDirective() {
    return {
      restrict: 'E',
      templateUrl: 'scripts/viewperspectives/view.perspectives.directive.html',
      controller: 'ViewPerspectivesController',
      controllerAs: 'vpc'
    };
  }

  angular.module('uncertApp.viewperspectives')
    .directive('viewPerspectivesDirective', viewPerspectivesDirective);
})();
