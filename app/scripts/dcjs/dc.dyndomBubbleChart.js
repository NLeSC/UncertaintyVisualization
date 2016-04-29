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
 * @name dyndomBubbleChart
 * @memberof dc
 * @mixes dc.bubbleMixin
 * @mixes dc.coordinateGridMixin
 * @example
 * // create a bubble chart under #chart-container1 element using the default global chart group
 * var dyndomBubbleChart1 = dc.dyndomBubbleChart('#chart-container1');
 * // create a bubble chart under #chart-container2 element using chart group A
 * var dyndomBubbleChart2 = dc.dyndomBubbleChart('#chart-container2', 'chartGroupA');
 * @param {String|node|d3.selection} parent - Any valid
 * {@link https://github.com/mbostock/d3/wiki/Selections#selecting-elements d3 single selector} specifying
 * a dom block element such as a div; or a dom element or d3 selection.
 * @param {String} [chartGroup] - The name of the chart group this chart instance should be placed in.
 * Interaction with a chart will only trigger events and redraws within the chart's group.
 * @return {dc.dyndomBubbleChart}
 */
dc.dyndomBubbleChart = function(parent, chartGroup) {
  var _chart = dc.customBubbleMixin(dc.coordinateGridMixin({}));

  var _elasticRadius = false;

  _chart.transitionDuration(750);

  var bubbleLocator = function(d) {
    return 'translate(' + (bubbleX(d)) + ',' + (bubbleY(d)) + ')';
  };

  function Node(x, y) {
    this.x = x;
    this.y = y;
  }

  var unknot = function(chartData) {
    var newData = [];
    chartData.forEach(function(datapoint) {
      datapoint.key[1].forEach(function(singleKey) {
        newData.push({
          key: [datapoint.key[0], singleKey],
          value: datapoint.value
        })
      });
    });
    return newData;
  }

  var determineNodes = function(chartData) {
    var nodes = {};

    chartData.forEach(function (node) {
      //Don't bother adding nodes which are filtered out
      if (_chart.radiusValueAccessor()(node) > 0) {
        var time = node.key[0];
        var participants = _chart.valueAccessor()(node);

        var newNode = new Node(new Date(time), participants);

        if (nodes[newNode.x] === undefined) {
          nodes[newNode.x] = [newNode];
        } else {
          nodes[newNode.x].push(newNode);
        }
      }
    });

    return nodes;
  };

  function fiddleWithDomain(nodes) {
    var keys = Object.keys(nodes);

    keys.sort(function(a, b) {
      return new Date(a) - new Date(b);
    });

    var newDomain = [];
    keys.forEach(function(key) {
      nodes[key].forEach(function(node) {
        if (newDomain.indexOf(node.y) < 0) {
          newDomain.push(node.y);
        }
      });
    });

    return newDomain;
  }

  /**
   * Turn on or off the elastic bubble radius feature, or return the value of the flag. If this
   * feature is turned on, then bubble radii will be automatically rescaled to fit the chart better.
   * @name elasticRadius
   * @memberof dc.dyndomBubbleChart
   * @instance
   * @param {Boolean} [elasticRadius=false]
   * @return {Boolean}
   * @return {dc.dyndomBubbleChart}
   */
  _chart.elasticRadius = function(elasticRadius) {
    if (!arguments.length) {
      return _elasticRadius;
    }
    _elasticRadius = elasticRadius;
    return _chart;
  };

  _chart.plotData = function() {
    var chartData = unknot(_chart.data());

    var nodes = determineNodes(chartData);
    var domain = fiddleWithDomain(nodes);
    _chart.y().domain(domain);

    if (_elasticRadius) {
      _chart.r().domain([_chart.rMin(), _chart.rMax()]);
    }

    _chart.r().range([_chart.MIN_RADIUS, _chart.xAxisLength() * _chart.maxBubbleRelativeSize()]);


    var gridLineG = _chart.chartBodyG().selectAll('g.' + 'horizontal');
    renderLanes(gridLineG);

    var bubbleG = _chart.chartBodyG().selectAll('g.' + _chart.BUBBLE_NODE_CLASS)
      .data(chartData, function(d) {
        return d.key;
      });

    renderNodes(bubbleG);

    updateNodes(bubbleG);

    removeNodes(bubbleG);

    _chart.rescale();
    _chart.fadeDeselectedArea();
  };

  function renderLanes(gridLineG) {

    var rangeBands = _chart.y().range();
    // var xOffset = _chart.x(_chart.xAxisMin());

    if (gridLineG.empty()) {
      gridLineG = _chart.chartBodyG().insert('g', ':first-child')
        .attr('class', 'grid-line' + ' ' + 'horizontal')
        .attr('transform', 'translate(' + _chart.margins().left + ',' + _chart.margins().top + ')');
    }

    var lines = gridLineG.selectAll('line')
      .data(rangeBands);

    // enter
    var linesGEnter = lines.enter()
      .append('line')
      .attr('x1', -_chart.margins().left)
      .attr('y1', function(d) {
        return d;
      })
      .attr('x2', _chart.xAxisLength())
      .attr('y2', function(d) {
        return d;
      })
      .attr('opacity', 1);
    dc.transition(linesGEnter, _chart.transitionDuration())
      .attr('opacity', 1);

    // update
    dc.transition(lines, _chart.transitionDuration())
      .attr('x1', -_chart.margins().left)
      .attr('y1', function(d) {
        return d;
      })
      .attr('x2', _chart.xAxisLength())
      .attr('y2', function(d) {
        return d;
      });

    // exit
    lines.exit().remove();
  }

  function renderNodes(bubbleG) {
    var bubbleGEnter = bubbleG.enter().append('g');

    bubbleGEnter
      .attr('class', _chart.BUBBLE_NODE_CLASS)
      .attr('transform', bubbleLocator)
      .append('circle').attr('class', function(d, i) {
        return _chart.BUBBLE_CLASS + ' _' + i;
      })
      .on('click', _chart.onClick)
      .attr('fill', _chart.getColor)
      .attr('r', 0);
    dc.transition(bubbleG, _chart.transitionDuration())
      .selectAll('circle.' + _chart.BUBBLE_CLASS)
      .attr('r', function(d) {
        return _chart.bubbleR(d);
      })
      .attr('opacity', function(d) {
        return (_chart.bubbleR(d) > 0) ? 1 : 0;
      });

    _chart._doRenderLabel(bubbleGEnter);

    _chart._doRenderTitles(bubbleGEnter);
  }

  function updateNodes(bubbleG) {
    dc.transition(bubbleG, _chart.transitionDuration())
      .attr('transform', bubbleLocator)
      .selectAll('circle.' + _chart.BUBBLE_CLASS)
      .attr('fill', _chart.getColor)
      .attr('r', function(d) {
        return _chart.bubbleR(d);
      })
      .attr('opacity', function(d) {
        return (_chart.bubbleR(d) > 0) ? 1 : 0;
      });

    _chart.doUpdateLabels(bubbleG);
    _chart.doUpdateTitles(bubbleG);
  }

  function removeNodes(bubbleG) {
    bubbleG.exit().remove();
  }

  function bubbleX(d) {
    var x = _chart.x()(_chart.keyAccessor()(d));
    if (isNaN(x)) {
      x = 0;
    }
    return x;
  }

  function bubbleY(d) {
    var rangeBands = _chart.y().range().length;
    var height = _chart.effectiveHeight();
    var offset = height / rangeBands;

    var y = _chart.y()(_chart.valueAccessor()(d));
    if (isNaN(y)) {
      y = 0;
    }
    return dc.utils.safeNumber(y + 0.5 * offset);
  }

  _chart.renderBrush = function() {
    // override default x axis brush from parent chart
    //
  };

  _chart.redrawBrush = function() {
    // override default x axis brush from parent chart
    // _chart.fadeDeselectedArea();
  };

  return _chart.anchor(parent, chartGroup);
};
