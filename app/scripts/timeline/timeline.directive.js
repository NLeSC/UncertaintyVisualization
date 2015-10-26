(function() {
  'use strict';

  function timelineDirective() {
    return {
      restrict: 'E',
      templateUrl: 'scripts/timeline/timeline.directive.html',
      controller: 'TimelineController',
      controllerAs: 'timelinecontroller'
    };
  }

  angular.module('uncertApp.timeline').directive('timelineDirective', timelineDirective);
})();
