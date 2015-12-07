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
    _chart.BUBBLE_CLASS = 'subwayBubble';

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

    // function Station(x, y) {
    //   this.x = x;
    //   this.y = y;
    // }
    //
    // function Segment(source, target) {
    //   this.source = source;
    //   this.target = target;
    // }
    //
    // function SubwayLine(lineID, stations) {
    //   this.lineID = lineID;
    //   this.stations = stations;
    //   this.segments = [];
    // }
    //
    // var stationCompare = function (a, b) {
    //   if (a.x < b.x) {
    //     return -1;
    //   }
    //   if (a.x > b.x) {
    //     return 1;
    //   }
    //   return 0;
    // };
    //
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
    //
    // function insertStation(station, stations) {
    //   var location = locationOf(station, stations, stationCompare)+1;
    //
    //   stations.splice(location, 0, station);
    //
    //   return stations;
    // }

    // Object.equals = function( x, y ) {
    //   // if both x and y are null or undefined and exactly the same
    //   if ( x === y ) {
    //     return true;
    //   }
    //
    //     // if they are not strictly equal, they both need to be Objects
    //   if ( ! ( x instanceof Object ) || ! ( y instanceof Object ) ) {
    //     return false;
    //   }
    //
    //   // they must have the exact same prototype chain, the closest we can do is
    //   // test their constructor.
    //   if ( x.constructor !== y.constructor ) {
    //     return false;
    //   }
    //
    //   for ( var p in x ) {
    //     // other properties were tested using x.constructor === y.constructor
    //     if ( ! x.hasOwnProperty( p ) ) {
    //       continue;
    //     }
    //
    //     // allows to compare x[ p ] and y[ p ] when set to undefined
    //     if ( ! y.hasOwnProperty( p ) ) {
    //       return false;
    //     }
    //
    //     // if they have the same strict value or identity then they are equal
    //     if ( x[ p ] === y[ p ] ) {
    //       continue;
    //     }
    //
    //     // Numbers, Strings, Functions, Booleans must be strictly equal
    //     if ( typeof( x[ p ] ) !== 'object') {
    //       return false;
    //     }
    //
    //     // Objects and Arrays must be tested recursively
    //     if ( ! Object.equals( x[ p ],  y[ p ] ) ) {
    //       return false;
    //     }
    //   }
    //
    //   // allows x[ p ] to be set to undefined
    //   for ( p in y ) {
    //     if ( y.hasOwnProperty( p ) && ! x.hasOwnProperty( p ) ) {
    //       return false;
    //     }
    //   }
    //   return true;
    // };

    // function LineSegment(line, source, target) {
    //   this.line = line;
    //   this.source = source;
    //   this.target = target;
    // }

    // var preprocessDataForLines = function(chartData) {
    //   var subwayLines = {};
    //
    //   chartData.forEach(function (object) {
    //     //Don't bother adding nodes which are filtered out
    //     if (object.value.count > 0) {
    //       var objKeys = Object.keys(object.key[1]);
    //       objKeys.forEach(function (objKey) {
    //         var line = object.key[1][objKey];
    //         var dataValue = _chart.valueAccessor()(object);
    //
    //         if (subwayLines[line] === undefined) {
    //           // var source = new Station(_chart.x().range()[0], _chart.y()(line));
    //           // var target = new Station(_chart.x().range()[1], _chart.y()(line));
    //           // subwayLines[line] = new SubwayLine(line, [source, target]);
    //           subwayLines[line] = new SubwayLine(line, []); //[source, target]);
    //         }
    //
    //         // insertStation(new Station(_chart.x()(object.key[0]), ordinalAverager(dataValue)), subwayLines[line].stations);
    //         insertStation(new Station(object.key[0], dataValue), subwayLines[line].stations);
    //       });
    //     }
    //   });
    //
    //   subwayLines.forEach(function(line) {
    //     var source = new Station(_chart.x().range()[0], _chart.y()(line));
    //     var target = new Station(_chart.x().range()[1], _chart.y()(line));
    //
    //     line.segments.push(source);
    //     line.segments.push(target);
    //
    //     var index = 0;
    //     line.stations.forEach(function(station){
    //       while (line.stations[index+2] === line.stations[index+1]) {
    //
    //       }
    //
    //       if (line.stations(index+1) && line.stations(index+2) )
    //     });
    //   });
    //
    //   var arrayResult = [];
    //   var allKeys = Object.keys(subwayLines);
    //   allKeys.forEach(function(k) {
    //     arrayResult.push(subwayLines[k]);
    //   });
    //
    //   linesColorScale = d3.scale.category20b().domain(allKeys);
    //   return arrayResult;
    // };







    var objectCompare = function (a, b) {
      if (a.x < b.source.x) {
        return -1;
      }
      if (a.x > b.source.x) {
        return 1;
      }
      return 0;
    };


    function splicePath(array, location, pathPre, element, pathPost) {
      var newPath = {
        source:{x:pathPre.source.x, y:pathPre.source.y},
        target:{x:element.x,        y:element.y}
      };

      pathPre.target.x = element.x;
      pathPre.target.y = element.y;

      pathPost.source.x = element.x;
      pathPost.source.y = element.y;

      array.splice(location, 0, newPath);
    }

    function splitPath(array, location, pathPre, element, pathPost) {
      var newPath1 = {
        source:{x:pathPre.source.x, y:pathPre.source.y},
        target:{x:element.x,        y:element.y}
      };
      var newPath2 = {
        source:{x:element.x,         y:element.y},
        target:{x:pathPost.target.x, y:pathPost.target.y}
      };

      pathPre.target.x = element.x;
      pathPre.target.y = element.y;

      pathPost.source.x = element.x;
      pathPost.source.y = element.y;

      array.splice(location, 0, newPath);
    }

    function insert(element, array) {
      var location, elementPre, elementPost;
      //Don't bother placing filtered out elements
      if (element.x < array[0].source.x || element.x > array[array.length-1].target.x) {
        console.log('OUT OF BOUNDS : ' + element.x);
        return array;
      }

      if (array.length === 1) {
        console.log('FIRST ADDITION : ' + element.x);
        location = 0;
        elementPre = array[0];
        elementPost = array[0];

        var newElement = {source:{x:elementPre.source.x,  y:elementPre.source.y},
                          target:{x:element.x,            y:element.y}};
        elementPost.source.x = element.x;
        elementPost.source.y = element.y;

        array.splice(location + 1, 0, newElement);


      } else {
        location = locationOf(element, array, objectCompare);

        if (array[location].source.x < element.x)  {

        } else if (array[location].source.x < element.x)  {
        }

        elementPre = array[location];



        if (element.x < elementPre.target.x) {
          elementPost = array[location];
        } else if (element.x === elementPre.target.x) {
          //console.log('T same : ' + element.x + ' : ' + elementPre.source.x);
          var newSource, newTarget, newLocation = location;
          while (element.x === array[newLocation].target.x || newLocation === 0) {
            newLocation--;
            newSource = array[newLocation];
          }

          newLocation = location;
          while (element.x === array[newLocation].target.x || newLocation === array.length-1) {
            newLocation++;
            newTarget = array[newLocation];
          }

          console.log('WAS : ' + element.x);
          console.log('NOW : ' + newSource.target.x + ' : ' + element.x + ' : ' + newTarget.target.x);

          elementPost = array[location+1];
        } else {
          elementPost = array[location+1];
        }
      }
      location -= 1;

      var newElement = {source:{x:elementPre.source.x,  y:elementPre.source.y},
                        target:{x:element.x,            y:element.y}};
      elementPost.source.x = element.x;
      elementPost.source.y = element.y;

      array.splice(location + 1, 0, newElement);
      return array;
    }

    var ordinalAverager = function(ordinalValues)  {
      var result = 0;
      ordinalValues.forEach(function(ordinalValue) {
        result += _chart.y()(ordinalValue);
      });

      return result / ordinalValues.length;
    };

    var preprocessDataForLines = function(chartData) {
      var result = {};
      chartData.forEach(function (object) {
        //Don't bother adding nodes which are filtered out
        if (object.value.count > 0) {
          var objKeys = Object.keys(object.key[1]);
          objKeys.forEach(function (objKey) {
            var dataKey = object.key[1][objKey];
            var dataValue = _chart.valueAccessor()(object);
            if (result[dataKey] === undefined) {
              result[dataKey] = {
                key: dataKey,
                values: [{
                          source:{x:_chart.x().range()[0], y:_chart.y()(dataKey)},
                          target:{x:_chart.x().range()[1], y:_chart.y()(dataKey)}
                        }]
              };
            }
            insert({x:_chart.x()(object.key[0]), y:ordinalAverager(dataValue)}, result[dataKey].values);
          });
        }
      });

      var arrayResult = [];
      var allKeys = Object.keys(result);
      allKeys.forEach(function(k) {
        arrayResult.push(result[k]);
      });

      linesColorScale = d3.scale.category20b().domain(allKeys);
      return arrayResult;
    };

    _chart.plotData = function () {
        if (_elasticRadius) {
            _chart.r().domain([_chart.rMin(), _chart.rMax()]);
        }

        _chart.r().range([_chart.MIN_RADIUS, _chart.xAxisLength() * _chart.maxBubbleRelativeSize()]);

        var linesData = preprocessDataForLines(_chart.data());
        _chart.chartBodyG().selectAll('g.' + 'subway-line').remove();
        var subwayLineG = _chart.chartBodyG().selectAll('g.' + 'subway-line')
            .data(linesData);
        renderLines(subwayLineG);

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



    function renderLines(subwayLineG) {
      var lineGEnter = subwayLineG.enter().insert('g', ':first-child');

      var diagonal = d3.svg.diagonal()
        .source(function(d) {
          return {'x':d.source.y, 'y':d.source.x};
        })
        .target(function(d) {
          return {'x':d.target.y, 'y':d.target.x};
        })
        .projection(function(d) {
          var rangeBands = _chart.y().range().length;
          var height = _chart.effectiveHeight();
          var offset = height/rangeBands;

          var x = d.x;
          if (isNaN(x)) {
              x = 0;
          }
          var result = dc.utils.safeNumber(x+0.5*offset);

          return [d.y, result];
        });

      lineGEnter
        .attr('stroke', function(d) {
          return linesColorScale(d.key);
        })
        .attr('class', function (d, i) {
            return 'subway-line ' + '_' + i;
          });

      var paths = lineGEnter.selectAll('path.diagonal').data(function(d) {
        return d.values;
      });

      var pathEnter = paths
        .enter()
        .append('path')
        .attr('class', 'diagonal');

      dc.transition(pathEnter, _chart.transitionDuration())
        .attr('d', function (d) {
            return safeD(diagonal(d));
        });

      paths.exit().remove();
      subwayLineG.exit().remove();
    }

    function safeD (d) {
        return (!d || d.indexOf('NaN') >= 0) ? 'M0,0' : d;
    }

    function renderNodes (bubbleG) {
        var bubbleGEnter = bubbleG.enter().append('g');

        bubbleGEnter
            .attr('class', _chart.BUBBLE_NODE_CLASS)
            .attr('transform', bubbleLocator)
            .append('ellipse').attr('class', function (d, i) {
                return _chart.BUBBLE_CLASS + ' _' + i;
            })
            .on('click', _chart.onClick)
            .attr('fill', _chart.getColor)
            .attr('width', 0)
            .attr('height', 0);
        dc.transition(bubbleG, _chart.transitionDuration())
            .selectAll('ellipse.' + _chart.BUBBLE_CLASS)
            .attr('ry', function (d) {
                return _chart.bubbleR(d);
            })
            .attr('rx', function (d) {
                return _chart.minRadius();
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
          .selectAll('ellipse.' + _chart.BUBBLE_CLASS)
          .attr('fill', _chart.getColor)
          .attr('ry', function (d) {
              return _chart.bubbleR(d);
          })
          .attr('rx', function (d) {
              return _chart.minRadius();
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

        var y = ordinalAverager(_chart.valueAccessor()(d));
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
