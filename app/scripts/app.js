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
      'ngRoute',
      'ngCookies',
      'ui.bootstrap',
      'uncertApp.authentication',
      //'uncertApp.sparql',
      'uncertApp.text'
    ])
    .run(function() {
    })
    .controller('rdfCtrl', function ($scope, $http){
      var parser = N3.Parser();

      $scope.triples = [];
      $scope.test = 0;

      $http.get('data/4M1J-3MC0-TWKJ-V1W8.xml.perspective.trig')
        .then(function (response){
          parser.parse(response.data, function (error, triple, prefixes) {
            // See https://github.com/RubenVerborgh/N3.js/ for details on how
            // the function on the parsed data is called.
            if (triple){
              $scope.triples.push(triple);
            }
            $scope.$apply();
          });
        });
    });

  angular.module('uncertApp.templates', []);
  angular.module('uncertApp.utils', ['uncertApp.templates']);
  angular.module('uncertApp.authentication', ['ngCookies']);
  angular.module('uncertApp.sparql', ['uncertApp.utils','uncertApp.authentication']);
  angular.module('uncertApp.text', ['uncertApp.sparql', 'uncertApp.utils']);
})();
