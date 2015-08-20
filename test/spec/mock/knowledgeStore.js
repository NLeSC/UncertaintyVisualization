'use strict';

angular.module('mockedKnowledgeStore', [])
  .value('succesfulQueryResult', {
    'head': {
      'vars': [
        'source',
        'doc'
      ]
    },
    'results': {
      'bindings': [{
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
  })
  .value('erroneousQueryResult', {
    statusText: 'HTTP Error 400: Bad Request'
  });
