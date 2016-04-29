(function() {
  'use strict';

  function DataTableController($element, d3, dc, NdxService, HelperFunctions, Messagebus) {
    var sources = {};
    var findMine = function(sources, uri) {
      var result;
      sources.forEach(function(source) {
        if (source.uri.localeCompare(uri) === 0) {
          result = source;
        }
      });
      return result;
    };

    var sourceToHtml = function(d) {
      var result = [];
      var raw = d.mentions;
      raw.forEach(function(mention) {
        var source;
        if (mention.perspective) {
          source = mention.perspective.source;
        } else {
          source = '';
        }

        if (source) {
          result.push({
            source: source
          });
        }
      });
      var html = '';
      result.forEach(function(phrase) {
        html += phrase.source + '</br>';
      });
      return html;
    };

    var mentionToHtml = function(d, sources) {
      var result = [];
      var raw = d.mentions;
      raw.forEach(function(mention) {
        var uri = mention.uri[0];
        if (mention.uri[1] !== undefined) {
          console.log('unparsed mention here');
        }
        var charStart = parseInt(mention.char[0]);
        var charEnd = parseInt(mention.char[1]);

        var found = findMine(sources, uri);

        // var meta = raw[i+1].split('=');
        // var sentence = meta[meta.length-1];
        if (found) {
          result.push({
            charStart: charStart,
            charEnd: charEnd,
            text: found.text
          });
        }
      });
      var html = '';
      result.forEach(function(phrase) {
        var pre = phrase.text.substring(phrase.charStart - 30, phrase.charStart);
        var word = phrase.text.substring(phrase.charStart, phrase.charEnd);
        var post = phrase.text.substring(phrase.charEnd, phrase.charEnd + 30);

        html += pre + '<span class=\'highlighted-mention\'>' + word + '</span>' + post + '</br>';
      });
      return html;
    };

    this.initializeChart = function() {
      var dataTable = dc.dataTable('#'+$element[0].children[0].attributes.id.value);

      //These parameters should make for fairly unique events
      var idDimension = NdxService.buildDimension(function(d) {
        return [d.instance];
      });

      // use odd page size to show the effect better
      this.ofs = 0;
      this.pag = 17;
      this.tableDisplay = function() {
          d3.select('#begin').text(this.ofs);
          d3.select('#end').text(this.ofs+this.pag-1);
          d3.select('#last').attr('disabled', this.ofs-this.pag<0 ? 'true' : null);
          d3.select('#next').attr('disabled', this.ofs+this.pag>=NdxService.getSize() ? 'true' : null);
          d3.select('#size').text(NdxService.getSize());
      };
      this.tableUpdate = function() {
          dataTable.beginSlice(this.ofs);
          dataTable.endSlice(this.ofs+this.pag);
          this.tableDisplay();
      };
      this.tableNext = function() {
          this.ofs += this.pag;
          this.tableUpdate();
          dataTable.redraw();
      };
      this.tableLast = function() {
          this.ofs -= this.pag;
          this.tableUpdate();
          dataTable.redraw();
      };

      //Set up the
      dataTable
        // .size(10)
        // .width(1200)
        .dimension(idDimension)
        .group(function() {
          return '';
        })
        .showGroups(false)
        .size(Infinity)
        .sortBy(function(d) {
          return d.time;
        })
        .order(d3.ascending)
        .columns([
        // {
        //   label: 'GroupName',
        //   format: function(d) {
        //     return d.groupName;
        //   }
        // },
        {
          label: '<div class=col_0>Time</div>',
          format: function(d) {
            var time = d3.time.format('%Y%m%d').parse(d.time);
            return '<div class=col_0>' + time.getDate() + '/' + (time.getMonth()+1) + '/' + time.getFullYear() + '</div>';
          }
        }, {
          label: '<div class=col_1>Source</div>',
          format: function(d) {
            return '<div class=col_1>' + sourceToHtml(d) + '</div>';
          }
        }, {
          label: '<div class=col_2>Mentions</div>',
          format: function(d) {
            return '<div class=col_2>' + mentionToHtml(d, sources) + '</div>';
          }
        // }
        // , {
        //   label: 'Labels',
        //   format: function(d) {
        //     var result = '';
        //     if (d.labels) {
        //       d.labels.forEach(function(l) {
        //         result += l + '</br>';
        //       });
        //     }
        //
        //     return result;
        //   }
        }]);

      this.tableUpdate();
      dataTable.render();
    };

    Messagebus.subscribe('crossfilter ready', function() {
      sources = NdxService.getData().timeline.sources;
      this.initializeChart();
    }.bind(this));
  }

  angular.module('uncertApp.datatable').controller('DataTableController', DataTableController);
})();
