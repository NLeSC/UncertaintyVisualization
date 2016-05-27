(function() {
  'use strict';

  function SelectorController($scope, Messagebus) {
    $scope.tab = 1;

    var myEl = angular.element( document.querySelector( '#inventory-button' ) );
    myEl.addClass('black');

    $scope.setTab = function(newTab){
      $scope.tab = newTab;
      var c1 = 'white';
      var c2 = 'black';
      if ($scope.tab == 1){
        c1 = 'black';
        c2 = 'white';
      }
      var myEl = angular.element( document.querySelector( '#inventory-button' ) );
      myEl.removeClass(c2);
      myEl.addClass(c1);
      var myEl2 = angular.element( document.querySelector( '#wrangler-button' ) );
      myEl2.removeClass(c1);
      myEl2.addClass(c2);
    };

    $scope.isSet = function(tabNum){
      return $scope.tab === tabNum;
    };

    Messagebus.subscribe('changingToWrangler',function(event) {
      $scope.setTab(2)
    }.bind(this));

  }
  angular.module('uncertApp.selector')
    .controller('SelectorController', SelectorController);
})();
