'use strict';

describe('text', function() {
    // load the module
    beforeEach(module('uncertApp.templates'));
    beforeEach(module('uncertApp.authentication'));
    beforeEach(module('uncertApp.text'));

    it('should create an application controller', inject(function($rootScope, $controller) {
      this.AuthenticationService = jasmine.createSpyObj('AuthenticationService.ready', ['success', 'error']);
      this.SparqlService = jasmine.createSpyObj('SparqlService', ['success', 'error']);

console.log(this.AuthenticationService);

      var scope = $rootScope.$new();
      $controller('TextController', {
        $scope: scope,
        AuthenticationService : this.AuthenticationService,
        SparqlService : this.SparqlService
      });
    }));

    describe('directive', function() {
        var element = '<text-directive></text-directive>';
        var html;
        var scope;

        beforeEach(function() {
            inject(function($rootScope, $compile) {
                scope = $rootScope.$new();
                html = $compile(element)(scope);
                scope.$digest();
            });
        });

        it('should create an element with a result text box', function() {
          expect(html.html()).toContain('div id="queryResult"');
        });
    });
});
