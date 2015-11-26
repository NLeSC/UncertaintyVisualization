/**
 * A concrete implementation of a general purpose bubble chart that allows data visualization using the
 * following dimensions:
 * - x axis position
 * - y axis position
 * - bubble radius
 * - color
 * Examples:
 * - {@link http://dc-js.github.com/dc.js/ Nasdaq 100 Index}
 * - {@link http://dc-js.github.com/dc.js/vc/index.html US Venture Capital Landscape 2011}
 * @name subwayChart
 * @memberof dc
 * @mixes dc.bubbleMixin
 * @mixes dc.coordinateGridMixin
 * @example
 * // create a bubble chart under #chart-container1 element using the default global chart group
 * var subwayChart1 = dc.subwayChart('#chart-container1');
 * // create a bubble chart under #chart-container2 element using chart group A
 * var subwayChart2 = dc.subwayChart('#chart-container2', 'chartGroupA');
 * @param {String|node|d3.selection} parent - Any valid
 * {@link https://github.com/mbostock/d3/wiki/Selections#selecting-elements d3 single selector} specifying
 * a dom block element such as a div; or a dom element or d3 selection.
 * @param {String} [chartGroup] - The name of the chart group this chart instance should be placed in.
 * Interaction with a chart will only trigger events and redraws within the chart's group.
 * @return {dc.subwayChart}
 */
dc.subwayChart = function (parent, chartGroup) {
    var _chart = dc.customBubbleMixin(dc.stackMixin(dc.coordinateGridMixin({})));

    var _elasticRadius = false;
    var _interpolate = 'monotone';
    var _tension = 0.1;
    var _defined;
    var _dashStyle;

    var linesColorScale;

    _chart.transitionDuration(750);

    var bubbleLocator = function (d) {
        return 'translate(' + (bubbleX(d)) + ',' + (bubbleY(d)) + ')';
    };

    /**
     * Turn on or off the elastic bubble radius feature, or return the value of the flag. If this
     * feature is turned on, then bubble radii will be automatically rescaled to fit the chart better.
     * @name elasticRadius
     * @memberof dc.subwayChart
     * @instance
     * @param {Boolean} [elasticRadius=false]
     * @return {Boolean}
     * @return {dc.subwayChart}
     */
    _chart.elasticRadius = function (elasticRadius) {
        if (!arguments.length) {
            return _elasticRadius;
        }
        _elasticRadius = elasticRadius;
        return _chart;
    };

    var objectCompare = function (a, b) {
      if (a.x < b.x) {
        return -1;
      }
      if (a.x > b.x) {
        return 1;
      }
      return 0;
    };

    function locationOf(element, array, comparer, start, end) {
      if (array.length === 0) {
        return -1;
      }

      start = start || 0;
      end = end || array.length;
      var pivot = (start + end) >> 1;

      var c = comparer(element, array[pivot]);
      if (end - start <= 1) {
        return c === -1 ? pivot - 1 : pivot;
      }

      switch (c) {
          case -1: return locationOf(element, array, comparer, start, pivot);
          case 0: return pivot;
          case 1: return locationOf(element, array, comparer, pivot, end);
      }
    }

    function insert(element, array) {
      array.splice(locationOf(element, array, objectCompare) + 1, 0, element);
      return array;
    }

    var preprocessDataForLines = function(chartData) {

      var result = {};
      chartData.forEach(function (object) {
        var objKeys = Object.keys(object.key[1]);
        objKeys.forEach(function (objKey) {
          var dataKey = object.key[1][objKey];
          var dataValue = _chart.valueAccessor()(object);
          if (result[dataKey] === undefined) {
            result[dataKey] = { key: dataKey, values: [{x:_chart.x().range()[0], y:_chart.y()(dataValue)},{x:_chart.x().range()[1], y:_chart.y()(dataValue)}] };
          }

          insert({x:_chart.x()(object.key[0]), y:_chart.y()(dataValue)}, result[dataKey].values);
        });
      });

      var arrayResult = [];
      var allKeys = Object.keys(result);
      var count = 0;
      allKeys.forEach(function(k) {
        arrayResult.push(result[k]);
        if (result[k].values.length > 3) {
          count++;
        }
      });

      linesColorScale = d3.scale.category20c().domain(allKeys);
      console.log(count);
      return arrayResult;
    };

    _chart.plotData = function () {
        if (_elasticRadius) {
            _chart.r().domain([_chart.rMin(), _chart.rMax()]);
        }

        _chart.r().range([_chart.MIN_RADIUS, _chart.xAxisLength() * _chart.maxBubbleRelativeSize()]);

        // var subwayLineG = _chart.chartBodyG().selectAll('g.' + 'subway-line');
        var chartBody = _chart.chartBodyG();
        var layersList = chartBody.selectAll('g.stack-list');

        if (layersList.empty()) {
            layersList = chartBody.append('g').attr('class', 'stack-list');
        }

        var linesData = preprocessDataForLines(_chart.data());

        var layers = layersList.selectAll('g.stack').data(linesData);

        var layersEnter = layers
            .enter()
            .append('g')
            .attr('class', function (d, i) {
                return 'stack ' + '_' + i;
            });

        drawLine(layersEnter, layers);

        layers.exit().remove();
        // renderLines(subwayLineG);

        var bubbleG = _chart.chartBodyG().selectAll('g.' + _chart.BUBBLE_NODE_CLASS)
            .data(_chart.data(), function (d) { return d.key; });

        renderNodes(bubbleG);

        updateNodes(bubbleG);

        removeNodes(bubbleG);

        _chart.fadeDeselectedArea();
    };
    _chart.interpolate = function (interpolate) {
        if (!arguments.length) {
            return _interpolate;
        }
        _interpolate = interpolate;
        return _chart;
    };
    _chart.tension = function (tension) {
        if (!arguments.length) {
            return _tension;
        }
        _tension = tension;
        return _chart;
    };
    _chart.defined = function (defined) {
        if (!arguments.length) {
            return _defined;
        }
        _defined = defined;
        return _chart;
    };
    _chart.dashStyle = function (dashStyle) {
        if (!arguments.length) {
            return _dashStyle;
        }
        _dashStyle = dashStyle;
        return _chart;
    };

    function colors (d) {
      return linesColorScale(d.key);
    }

    function drawLine (layersEnter, layers) {
        var line = d3.svg.line()
            .x(function (d) {
                return d.x;
            })
            .y(function (d) {
                return d.y;
            })
            .interpolate(_interpolate)
            .tension(_tension);
        if (_defined) {
            line.defined(_defined);
        }

        var path = layersEnter.append('path')
            .attr('class', 'line')
            .attr('stroke', colors);
        if (_dashStyle) {
            path.attr('stroke-dasharray', _dashStyle);
        }

        dc.transition(layers.select('path.line'), _chart.transitionDuration())
            //.ease('linear')
            .attr('stroke', colors)
            .attr('d', function (d) {
                return safeD(line(d.values));
            });
    }

    function safeD (d) {
        return (!d || d.indexOf('NaN') >= 0) ? 'M0,0' : d;
    }

    // function renderLines (subwayLineG) {
    //   var rangeBands = _chart.y().range();
    //   // var xOffset = _chart.x(_chart.xAxisMin());
    //
    //   if (subwayLineG.empty()) {
    //     subwayLineG = _chart.chartBodyG().insert('g', ':first-child')
    //       .attr('class', 'subway-line')
    //       .attr('transform', 'translate(' + _chart.margins().left + ',' + _chart.margins().top + ')');
    //   }
    //
    //   var lines = subwayLineG.selectAll('line')
    //       .data(_chart.data(), function (d) { return d.key; });
    //
    //       // enter
    //       var linesGEnter = lines.enter()
    //         .append('line')
    //         .attr('x1', function (d) {
    //             return _chart.x()(_chart.keyAccessor()(d));
    //         })
    //         //-_chart.margins().left)
    //         .attr('y1', function (d) {
    //             return _chart.y()(_chart.valueAccessor()(d));
    //         })
    //         .attr('x2', function (d) {
    //             return _chart.x()(_chart.keyAccessor()(d));
    //         })
    //         .attr('y2', function (d) {
    //             return _chart.y()(_chart.valueAccessor()(d));
    //         })
    //         .attr('opacity', 1);
    //       dc.transition(linesGEnter, _chart.transitionDuration())
    //         .attr('opacity', 1);
    //
    //       // update
    //       dc.transition(lines, _chart.transitionDuration())
    //         .attr('x1', function (d) {
    //             return _chart.x()(_chart.keyAccessor()(d));
    //         })
    //         .attr('y1', function (d) {
    //             return _chart.y()(_chart.valueAccessor()(d));
    //         })
    //         .attr('x2', function (d) {
    //             return _chart.x()(_chart.keyAccessor()(d));
    //         })
    //         .attr('y2', function (d) {
    //             return _chart.y()(_chart.valueAccessor()(d));
    //         });
    //
    //       // exit
    //       lines.exit().remove();
    // }

    function renderNodes (bubbleG) {
        var bubbleGEnter = bubbleG.enter().append('g');

        bubbleGEnter
            .attr('class', _chart.BUBBLE_NODE_CLASS)
            .attr('transform', bubbleLocator)
            .append('circle').attr('class', function (d, i) {
                return _chart.BUBBLE_CLASS + ' _' + i;
            })
            .on('click', _chart.onClick)
            .attr('fill', _chart.getColor)
            .attr('r', 0);
        dc.transition(bubbleG, _chart.transitionDuration())
            .selectAll('circle.' + _chart.BUBBLE_CLASS)
            .attr('r', function (d) {
                return _chart.bubbleR(d);
            })
            .attr('opacity', function (d) {
                return (_chart.bubbleR(d) > 0) ? 1 : 0;
            });

        _chart._doRenderLabel(bubbleGEnter);

        _chart._doRenderTitles(bubbleGEnter);
    }

    function updateNodes (bubbleG) {
        dc.transition(bubbleG, _chart.transitionDuration())
          .attr('transform', bubbleLocator)
          .selectAll('circle.' + _chart.BUBBLE_CLASS)
          .attr('fill', _chart.getColor)
          .attr('r', function (d) {
              return _chart.bubbleR(d);
          })
          .attr('opacity', function (d) {
              return (_chart.bubbleR(d) > 0) ? 1 : 0;
          });

        _chart.doUpdateLabels(bubbleG);
        _chart.doUpdateTitles(bubbleG);
    }

    function removeNodes (bubbleG) {
        bubbleG.exit().remove();
    }

    function bubbleX (d) {
        var x = _chart.x()(_chart.keyAccessor()(d));
        if (isNaN(x)) {
            x = 0;
        }
        return x;
    }

    function bubbleY (d) {
        var rangeBands = _chart.y().range().length;
        var height = _chart.effectiveHeight();
        var offset = height/rangeBands;

        var y = _chart.y()(_chart.valueAccessor()(d));
        if (isNaN(y)) {
            y = 0;
        }
        return dc.utils.safeNumber(y+0.5*offset);
    }

    _chart.renderBrush = function () {
        // override default x axis brush from parent chart
        //
    };

    _chart.redrawBrush = function () {
        // override default x axis brush from parent chart
        // _chart.fadeDeselectedArea();
    };

    return _chart.anchor(parent, chartGroup);
};
