'use strict';

describe('sparql filters', function() {
  // load the module
  beforeEach(module('uncertApp.sparql'));

  describe("FormatSparqlBinding", function() {
    var formatSparqlBinding;

    beforeEach(inject(function(_formatSparqlBinding_) {
      formatSparqlBinding = formatSparqlBinding;

      it('returns the value when type=literal', function() {
        var value = 'some_string'
        var input = {'type': 'literal', 'value': value};
        expect(formatSparqlBinding(input)).toEqual(value);
      });

      it('returns a link to the value when type=uri', function() {
        var value = 'http://www.newsreader-project.eu/provenance/author/Christine_Tierney_The_Detroit_News'
        var input = {'type': 'uri', 'value': value};
        var url = '<a href="'+input.value+'">'+input.value+'</a>'
        expect(formatSparqlBinding(input)).toEqual(url);
      });

    }));
  });
});
