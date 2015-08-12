(function() {
  'use strict';

  function textDirective() {
    return {
      restrict: 'E',
      templateUrl: 'scripts/text/text.directive.html',
      controller: 'TextController',
      controllerAs: 'textcontroller'
    };
  }

  angular.module('uncertApp.text').directive('textDirective', textDirective);
})();
