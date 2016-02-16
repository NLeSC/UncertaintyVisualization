// The app

(function() {
  'use strict';

  /**
   * @ngdoc overview
   * @name uncertApp
   * @description
   * # uncertApp
   *
   * Main module of the application.
   */
  angular
    .module('rigApp', [
      'ngAnimate',
      'ngSanitize',
      'ngTouch',
      'ui.bootstrap'
    ])
    .run(function(SitesService, DrivemapService) {
      DrivemapService.load();
      SitesService.load();
    });

  angular.module('rigApp.templates', []);
  angular.module('rigApp.utils', ['rigApp.templates']);
})();
