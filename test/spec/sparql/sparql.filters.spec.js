'use strict';

describe('sparql filters', function() {
  // load the module
  beforeEach(module('uncertApp.templates'));
  beforeEach(module('uncertApp.sparql'));

  describe('FormatSparqlBinding', function() {
    var formatSparqlBindingFilter;

    beforeEach(inject(function(_formatSparqlBindingFilter_) {
      formatSparqlBindingFilter = _formatSparqlBindingFilter_;
    }));

    it('returns the value when type=literal', function() {
      var value = 'some_string';
      var input = {
        'type': 'literal',
        'value': value
      };
      expect(formatSparqlBindingFilter(input)).toEqual(value);
    });

    it('returns a link to the value when type=uri', inject(function($sce, formatSparqlBindingFilter) {
      var value = 'http://www.newsreader-project.eu/provenance/author/Christine_Tierney_The_Detroit_News';
      var input = {
        'type': 'uri',
        'value': value
      };
      var url = '<a href="' + input.value + '">' + input.value + '</a>';
      expect(formatSparqlBindingFilter(input).$$unwrapTrustedValue()).toEqual(url);
    }));
  });
});
