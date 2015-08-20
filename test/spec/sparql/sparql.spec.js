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

    it('should create an element with a text box to input sparql queries', function() {
      expect(html.html()).toContain('<textarea class="form-control ng-pristine ng-untouched ng-valid" id="query" ng-model="sparqlcontroller.query" rows="5"></textarea>');
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

    it('should have an empty jsonData object', function() {
      expect(ctrl.jsonData).toBeDefined();
      expect(ctrl.jsonData).toEqual({});
    });
  });

  describe('service', function() {
    var SparqlService, httpBackend, succesfulQueryResult, erroneousQueryResult;
    var mockedAuthenticationService, mockedMessagebus;

    beforeEach(module(function($provide) {
      mockedAuthenticationService = jasmine.createSpy('AuthenticationService');
      $provide.value('AuthenticationService', mockedAuthenticationService);

      mockedMessagebus = jasmine.createSpyObj('Messagebus', ['subscribe', 'publish']);
      $provide.value('Messagebus', mockedMessagebus);

      mockedAuthenticationService.credentialsSet = true;
    }));

    beforeEach(module('mockedKnowledgeStore'));

    beforeEach(function() {
      inject(function(_SparqlService_, $httpBackend, _succesfulQueryResult_, _erroneousQueryResult_) {
        SparqlService = _SparqlService_;
        httpBackend = $httpBackend;
        succesfulQueryResult = _succesfulQueryResult_;
        erroneousQueryResult = _erroneousQueryResult_;
      });
    });

    it('should exist', function() {
      expect(SparqlService).toBeDefined();
    });

    it('should have a knowledgeStore URL', function() {
      expect(SparqlService.knowledgeStoreURL).toBeDefined();
    });

    it('should have subscribed to Messagebus.\'query\'', function() {
      expect(mockedMessagebus.subscribe).toHaveBeenCalledWith('query', jasmine.any(Function));
    });

    describe('queryKnowledgeBase function', function() {
      var testKnowledgeStoreURL = 'https://shrouded-gorge-9256.herokuapp.com/do_sparql?query=';
      var testRequest;
      beforeEach(function() {
        testRequest = {
          requestee: 'test',
          url: 'SELECT%20DISTINCT%20?source%20?doc%20%0AWHERE%20%7B%20%0A%20%20VALUES%20?event%20%7B%20%3Chttp://www.newsreader-project.eu/data/cars/2009/05/22/7VRY-F631-2PP8-S0NC.xml%23ev21%3E%20%7D%20%0A%20%20%7B%20%0A%20%20%20%20GRAPH%20?graph%20%7B%20?event%20?predicate%20?object%20.%20%7D%20%0A%20%20%20%20?graph%20prov:wasAttributedTo%20?source%20.%20%0A%20%20%20%20?graph%20gaf:denotedBy%20?mention%20.%20%0A%20%20%20%20BIND%20(STRBEFORE(STR(?mention),%22%23%22)%20as%20?doc)%20%0A%20%20%7D%20%0A%7D%20%0AORDER%20BY%20?doc&dataset=cars'
        };
      });

      it('should publish an error back to the requestee on the Messagebus if the right data is not provided in the struct, but a requestee is set', function() {
        var badTestRequest = {
          requestee: testRequest.requestee
        };

        SparqlService.queryKnowledgeBase(badTestRequest);
        expect(mockedMessagebus.publish).toHaveBeenCalledWith('queryResult ' + testRequest.requestee, {
          url: '',
          status: 'error',
          data: 'No struct provided with both requestee and url.'
        });
      });

      it('should publish a general error if the requestee is not provided in the struct', function() {
        var badTestRequest = {
          url: testRequest.url
        };

        SparqlService.queryKnowledgeBase(badTestRequest);
        expect(mockedMessagebus.publish).toHaveBeenCalledWith('error', 'queryKnowledgeBase input error, no requestee set');
      });

      it('should publish an error to Messagebus if the user is not logged in', function() {
        mockedAuthenticationService.credentialsSet = false;
        SparqlService.queryKnowledgeBase(testRequest);
        expect(mockedMessagebus.publish).toHaveBeenCalledWith('queryResult ' + testRequest.requestee, {
          url: testRequest.url,
          status: 'error',
          data: 'Not logged in.'
        });
      });

      it('should publish an error to Messagebus if the request was faulty', function() {
        var expectedData = {
          url: '',
          status: 'error',
          data: 'HTTP Error 400: Bad Request'
        };
        var badTestRequest = {
          requestee: testRequest.requestee,
          url: ''
        };
        httpBackend.whenGET(testKnowledgeStoreURL).respond(400, erroneousQueryResult);
        SparqlService.queryKnowledgeBase(badTestRequest);
        httpBackend.flush();
        expect(mockedMessagebus.publish).toHaveBeenCalledWith('queryResult ' + badTestRequest.requestee, expectedData);
      });

      it('should publish a success to Messagebus if the request was succesful', function() {
        var expectedData = {
          url: testRequest.url,
          status: 'success',
          data: {
            head: {
              vars: [
                'source',
                'doc'
              ]
            },
            results: {
              bindings: [{
                'doc': {
                  'datatype': 'http://www.w3.org/2001/XMLSchema#string',
                  'type': 'literal',
                  'value': 'http://www.newsreader-project.eu/data/cars/2009/05/22/7VRY-F631-2PP8-S0NC.xml'
                },
                'source': {
                  'type': 'uri',
                  'value': 'http://www.newsreader-project.eu/provenance/author/Christine_Tierney_The_Detroit_News'
                }
              }, {
                'doc': {
                  'datatype': 'http://www.w3.org/2001/XMLSchema#string',
                  'type': 'literal',
                  'value': 'http://www.newsreader-project.eu/data/cars/2009/05/22/7VRY-F631-2PP8-S0NC.xml'
                },
                'source': {
                  'type': 'uri',
                  'value': 'http://www.newsreader-project.eu/provenance/sourceowner/The_Detroit_News_(Michigan)'
                }
              }, {
                'doc': {
                  'datatype': 'http://www.w3.org/2001/XMLSchema#string',
                  'type': 'literal',
                  'value': 'http://www.newsreader-project.eu/data/cars/2009/05/23/7VS0-M0J0-Y9DV-8092.xml'
                },
                'source': {
                  'type': 'uri',
                  'value': 'http://www.newsreader-project.eu/provenance/author/Christine_Tierney_The_Detroit_News'
                }
              }, {
                'doc': {
                  'datatype': 'http://www.w3.org/2001/XMLSchema#string',
                  'type': 'literal',
                  'value': 'http://www.newsreader-project.eu/data/cars/2009/05/23/7VS0-M0J0-Y9DV-8092.xml'
                },
                'source': {
                  'type': 'uri',
                  'value': 'http://www.newsreader-project.eu/provenance/sourceowner/The_Detroit_News_(Michigan)'
                }
              }]
            }
          }
        };
        httpBackend.whenGET(testKnowledgeStoreURL+'SELECT%20DISTINCT%20?source%20?doc%20%0AWHERE%20%7B%20%0A%20%20VALUES%20?event%20%7B%20%3Chttp://www.newsreader-project.eu/data/cars/2009/05/22/7VRY-F631-2PP8-S0NC.xml%23ev21%3E%20%7D%20%0A%20%20%7B%20%0A%20%20%20%20GRAPH%20?graph%20%7B%20?event%20?predicate%20?object%20.%20%7D%20%0A%20%20%20%20?graph%20prov:wasAttributedTo%20?source%20.%20%0A%20%20%20%20?graph%20gaf:denotedBy%20?mention%20.%20%0A%20%20%20%20BIND%20(STRBEFORE(STR(?mention),%22%23%22)%20as%20?doc)%20%0A%20%20%7D%20%0A%7D%20%0AORDER%20BY%20?doc&dataset=cars').respond(200, succesfulQueryResult);
        SparqlService.queryKnowledgeBase(testRequest);
        httpBackend.flush();
        expect(mockedMessagebus.publish).toHaveBeenCalledWith('queryResult ' + testRequest.requestee, expectedData);
      });

    });
  });
});
