(function() {
  'use strict';

  function viewPerspectivesDirective() {
    return {
      restrict: 'E',
      template: require('./view.perspectives.directive.html'),
      controller: 'ViewPerspectivesController',
      controllerAs: 'vpc'
    };
  }

  angular.module('uncertApp.viewperspectives')
    .directive('viewPerspectivesDirective', viewPerspectivesDirective);
})();
