(function() {
  'use strict';

  function RdfController($scope, $http, N3) {
    var parser = N3.Parser();

    this.triples = [];
    this.test = 0;

    $http.get('data/4M1J-3MC0-TWKJ-V1W8.xml.perspective.trig').then(function (response){
        parser.parse(response.data, function (error, triple) {
          // See https://github.com/RubenVerborgh/N3.js/ for details on how
          // the function on the parsed data is called.
          if (triple){
            this.triples.push(triple);
          }
          $scope.$apply();
        }.bind(this));
      }.bind(this));
  }

  angular.module('uncertApp.rdf').controller('RdfController', RdfController);
})();
