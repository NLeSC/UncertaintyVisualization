(function() {
  'use strict';

  function AuthenticationController($scope, $rootScope, $location, AuthenticationService) {
    this.loggedIn = false;
    // reset login status
    AuthenticationService.ClearCredentials();

    this.login = function () {
      $scope.dataLoading = true;
      AuthenticationService.Login($scope.username, $scope.password, function(response) {
        if(response.success) {
            AuthenticationService.SetCredentials($scope.username, $scope.password);
            $location.path('/');
            this.loggedIn = true;
        } else {
            $scope.error = response.message;
            $scope.dataLoading = false;
        }
      }.bind(this));
    };
  }

  angular.module('uncertApp.authentication').controller('AuthenticationController', AuthenticationController);
})();
