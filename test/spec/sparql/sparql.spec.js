'use strict';

describe('sparql', function() {
  // load the module
  beforeEach(module('uncertApp.templates'));
  beforeEach(module('uncertApp.sparql'));

  describe('directive', function() {
    var element = '<sparql-directive></sparql-directive>';
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
      expect(html.html()).toContain('<textarea class="form-control ng-pristine ng-untouched ng-valid" id="query" rows="5" ng-model="sparqlcontroller.query"></textarea>');
    });
  });

  describe('controller', function() {
    var ctrl;
    beforeEach(function() {
      inject(function($rootScope, $controller) {
        var scope = $rootScope.$new();
        ctrl = $controller('SparqlController', {
          $scope: scope
        });
      });
    });

    it('should create an application controller', function() {
      expect(ctrl).toBeDefined();
    });

    it('should have a textResult object with an empty string', function() {
      expect(ctrl.resultText).toBeDefined();
      expect(ctrl.resultText).toMatch('');
    });
  });
});
