import { formatValue, jsOptionsFunc, merge, isArray, toStr, toFloat, toDate, toArr, sortByTime, sortByNumberSeries, sortByNumber, isMinute, isHour, isDay, isWeek, isMonth, isYear, isDate } from "../helpers";

export default (function () {
  var defaultOptions = {
    chart: {},
    xAxis: {
      title: {
        text: null
      },
      labels: {
        style: {
          fontSize: "12px"
        }
      }
    },
    yAxis: {
      title: {
        text: null
      },
      labels: {
        style: {
          fontSize: "12px"
        }
      }
    },
    title: {
      text: null
    },
    credits: {
      enabled: false
    },
    legend: {
      borderWidth: 0
    },
    tooltip: {
      style: {
        fontSize: "12px"
      }
    },
    plotOptions: {
      areaspline: {},
      series: {
        marker: {}
      }
    }
  };

  var hideLegend = function (options, legend, hideLegend) {
    if (legend !== undefined) {
      options.legend.enabled = !!legend;
      if (legend && legend !== true) {
        if (legend === "top" || legend === "bottom") {
          options.legend.verticalAlign = legend;
        } else {
          options.legend.layout = "vertical";
          options.legend.verticalAlign = "middle";
          options.legend.align = legend;
        }
      }
    } else if (hideLegend) {
      options.legend.enabled = false;
    }
  };

  var setTitle = function (options, title) {
    options.title.text = title;
  };

  var setMin = function (options, min) {
    options.yAxis.min = min;
  };

  var setMax = function (options, max) {
    options.yAxis.max = max;
  };

  var setStacked = function (options, stacked) {
    options.plotOptions.series.stacking = stacked ? "normal" : null;
  };

  var setXtitle = function (options, title) {
    options.xAxis.title.text = title;
  };

  var setYtitle = function (options, title) {
    options.yAxis.title.text = title;
  };

  var jsOptions = jsOptionsFunc(defaultOptions, hideLegend, setTitle, setMin, setMax, setStacked, setXtitle, setYtitle);

  var drawChart = function(chart, data, options) {
    if (chart.chart) {
      chart.chart.destroy();
    }

    options.chart.renderTo = chart.element.id;
    options.series = data;
    chart.chart = new window.Highcharts.Chart(options);
  };

  var setFormatOptions = function(chart, options, chartType) {
    var formatOptions = {
      prefix: chart.options.prefix,
      suffix: chart.options.suffix,
      thousands: chart.options.thousands,
      decimal: chart.options.decimal
    };

    if (formatOptions.prefix || formatOptions.suffix || formatOptions.thousands || formatOptions.decimal) {
      if (chartType !== "pie" && !options.yAxis.labels.formatter) {
        options.yAxis.labels.formatter = function () {
          return formatValue("", this.value, formatOptions);
        };
      }

      if (!options.tooltip.pointFormatter) {
        options.tooltip.pointFormatter = function () {
          return '<span style="color:' + this.color + '>\u25CF</span> ' + formatValue(this.series.name + ': <b>', this.y, formatOptions) + '</b><br/>';
        };
      }
    }
  };

  var renderLineChart = function (chart, chartType) {
    chartType = chartType || "spline";
    var chartOptions = {};
    if (chartType === "areaspline") {
      chartOptions = {
        plotOptions: {
          areaspline: {
            stacking: "normal"
          },
          area: {
            stacking: "normal"
          },
          series: {
            marker: {
              enabled: false
            }
          }
        }
      };
    }

    if (chart.options.curve === false) {
      if (chartType === "areaspline") {
        chartType = "area";
      } else if (chartType === "spline") {
        chartType = "line";
      }
    }

    var options = jsOptions(chart, chart.options, chartOptions), data, i, j;
    options.xAxis.type = chart.discrete ? "category" : "datetime";
    if (!options.chart.type) {
      options.chart.type = chartType;
    }
    setFormatOptions(chart, options, chartType);

    var series = chart.data;
    for (i = 0; i < series.length; i++) {
      data = series[i].data;
      if (!chart.discrete) {
        for (j = 0; j < data.length; j++) {
          data[j][0] = data[j][0].getTime();
        }
      }
      series[i].marker = {symbol: "circle"};
      if (chart.options.points === false) {
        series[i].marker.enabled = false;
      }
    }

    drawChart(chart, series, options);
  };

  var renderScatterChart = function (chart) {
    var options = jsOptions(chart, chart.options, {});
    options.chart.type = "scatter";
    drawChart(chart, chart.data, options);
  };

  var renderPieChart = function (chart) {
    var chartOptions = merge(defaultOptions, {});

    if (chart.options.colors) {
      chartOptions.colors = chart.options.colors;
    }
    if (chart.options.donut) {
      chartOptions.plotOptions = {pie: {innerSize: "50%"}};
    }

    if ("legend" in chart.options) {
      hideLegend(chartOptions, chart.options.legend);
    }

    if (chart.options.title) {
      setTitle(chartOptions, chart.options.title);
    }

    var options = merge(chartOptions, chart.options.library || {});
    setFormatOptions(chart, options, "pie");
    var series = [{
      type: "pie",
      name: chart.options.label || "Value",
      data: chart.data
    }];

    drawChart(chart, series, options);
  };

  var renderColumnChart = function (chart, chartType) {
    chartType = chartType || "column";
    var series = chart.data;
    var options = jsOptions(chart, chart.options), i, j, s, d, rows = [], categories = [];
    options.chart.type = chartType;
    setFormatOptions(chart, options, chartType);

    for (i = 0; i < series.length; i++) {
      s = series[i];

      for (j = 0; j < s.data.length; j++) {
        d = s.data[j];
        if (!rows[d[0]]) {
          rows[d[0]] = new Array(series.length);
          categories.push(d[0]);
        }
        rows[d[0]][i] = d[1];
      }
    }

    if (chart.options.xtype === "number") {
      categories.sort(sortByNumber);
    }

    options.xAxis.categories = categories;

    var newSeries = [], d2;
    for (i = 0; i < series.length; i++) {
      d = [];
      for (j = 0; j < categories.length; j++) {
        d.push(rows[categories[j]][i] || 0);
      }

      d2 = {
        name: series[i].name,
        data: d
      };
      if (series[i].stack) {
        d2.stack = series[i].stack;
      }

      newSeries.push(d2);
    }

    drawChart(chart, newSeries, options);
  };

  var renderBarChart = function (chart) {
    renderColumnChart(chart, "bar");
  };

  var renderAreaChart = function (chart) {
    renderLineChart(chart, "areaspline");
  };

  return {
    name: "highcharts",
    renderLineChart: renderLineChart,
    renderPieChart: renderPieChart,
    renderColumnChart: renderColumnChart,
    renderBarChart: renderBarChart,
    renderAreaChart: renderAreaChart,
    renderScatterChart: renderScatterChart
  };
})();
