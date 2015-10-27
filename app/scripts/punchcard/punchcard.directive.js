(function() {
  'use strict';

  function punchcardDirective() {
    return {
      restrict: 'E',
      templateUrl: 'scripts/punchcard/punchcard.directive.html',
      controller: 'PunchcardController',
      controllerAs: 'punchcardcontroller'
    };
  }

  angular.module('uncertApp.punchcard').directive('punchcardDirective', punchcardDirective);
})();
