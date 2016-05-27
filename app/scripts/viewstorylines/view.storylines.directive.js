(function() {
  'use strict';

  function viewStorylinesDirective() {
    return {
      restrict: 'E',
      templateUrl: 'scripts/viewstorylines/view.storylines.directive.html',
      controller: 'ViewStorylinesController',
      controllerAs: 'i'
    };
  }

  angular.module('uncertApp.viewstorylines')
    .directive('viewStorylinesDirective', viewStorylinesDirective);
})();
