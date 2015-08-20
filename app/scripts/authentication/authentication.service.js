(function() {
  'use strict';

  function AuthenticationService(Base64, $http, $cookieStore, $rootScope) {
    this.credentialsSet = false;

    $rootScope.globals = {};

    this.Login = function(username, password, callback) {
      /* Dummy authentication for testing, uses $timeout to simulate api call
       ----------------------------------------------*/
      // $timeout(function() {
      var response = {
        success: true
      };
      // if (!response.success) {
      //   response.message = 'Username or password is incorrect';
      // }
      callback(response);
      // }, 1000);


      /* Use this for real authentication
       ----------------------------------------------*/
      // $http.post('/api/authenticate', { username: username, password: password })
      //    .success(function (response) {
      //        callback(response);
      //    });

    };

    this.SetCredentials = function(username, password) {
      var authdata = Base64.encode(username + ':' + password);

      $rootScope.globals = {
        currentUser: {
          username: username,
          password: password,
          authdata: authdata
        }
      };

      $http.defaults.headers.common['Authorization'] = 'Basic ' + authdata; // jshint ignore:line
      // $http.defaults.headers.common['Authorization'] = 'Basic ' + username + ':' + password; // jshint ignore:line
      $cookieStore.put('globals', $rootScope.globals);
      this.credentialsSet = true;
    };

    this.ClearCredentials = function() {
      $rootScope.globals = {};
      $cookieStore.remove('globals');
      $http.defaults.headers.common['Authorization'] = 'Basic '; // jshint ignore:line
      this.credentialsSet = false;
    };
  }

  angular.module('uncertApp.authentication').service('AuthenticationService', AuthenticationService);
})();
