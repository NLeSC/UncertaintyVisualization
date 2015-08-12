(function() {
  'use strict';

  function dcjsDirective() {
    return {
      restrict: 'EA',
      scope: {
        onClick: '&'  // parent execution binding
      },
      templateUrl: 'scripts/dcjs/dcjs.directive.html',
      controller: 'DcjsController',
      controllerAs: 'dcjscontroller',

      link: function(scope, element) {
        scope.dcjscontroller.init(element[0]);
      }
    };
  }

  angular.module('uncertApp.dcjs').directive('dcjsDirective', dcjsDirective);
})();
