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
    .module('uncertApp', [
      'ngAnimate',
      'ngSanitize',
      'ngTouch',
      'ui.bootstrap'
    ])
    .run(function(SitesService, DrivemapService) {
      DrivemapService.load();
      SitesService.load();
    });

  angular.module('uncertApp.templates', []);
  angular.module('uncertApp.utils', ['uncertApp.templates']);
})();
