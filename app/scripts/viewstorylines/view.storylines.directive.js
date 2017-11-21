(function() {
  'use strict';

  function viewStorylinesDirective() {
    return {
      restrict: 'E',
      template: require('./view.storylines.directive.html'),
      controller: 'ViewStorylinesController',
      controllerAs: 'i'
    };
  }

  angular.module('uncertApp.viewstorylines')
    .directive('viewStorylinesDirective', viewStorylinesDirective);
})();
