(function() {
  'use strict';

  function allCitationsChartDirective() {
    return {
      restrict: 'E',
      template: require('./allCitationsChart.directive.html'),
      controller: 'AllCitationsChartController',
      controllerAs: 'accCtrl'
    };
  }

  angular.module('uncertApp.allcitationschart').directive('allCitationsChartDirective', allCitationsChartDirective);
})();
