import { formatValue, jsOptionsFunc, merge, sortByNumber } from "../helpers";

let defaultOptions = {
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
    area: {},
    series: {
      marker: {}
    }
  }
};

let hideLegend = function (options, legend, hideLegend) {
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

let setTitle = function (options, title) {
  options.title.text = title;
};

let setMin = function (options, min) {
  options.yAxis.min = min;
};

let setMax = function (options, max) {
  options.yAxis.max = max;
};

let setStacked = function (options, stacked) {
  let stackedValue = stacked ? (stacked === true ? "normal" : stacked) : null;
  options.plotOptions.series.stacking = stackedValue;
  options.plotOptions.area.stacking = stackedValue;
  options.plotOptions.areaspline.stacking = stackedValue;
};

let setXtitle = function (options, title) {
  options.xAxis.title.text = title;
};

let setYtitle = function (options, title) {
  options.yAxis.title.text = title;
};

let jsOptions = jsOptionsFunc(defaultOptions, hideLegend, setTitle, setMin, setMax, setStacked, setXtitle, setYtitle);

let setFormatOptions = function(chart, options, chartType) {
  let formatOptions = {
    prefix: chart.options.prefix,
    suffix: chart.options.suffix,
    thousands: chart.options.thousands,
    decimal: chart.options.decimal,
    precision: chart.options.precision,
    round: chart.options.round,
    zeros: chart.options.zeros
  };

  if (chartType !== "pie" && !options.yAxis.labels.formatter) {
    options.yAxis.labels.formatter = function () {
      return formatValue("", this.value, formatOptions);
    };
  }

  if (!options.tooltip.pointFormatter) {
    options.tooltip.pointFormatter = function () {
      return '<span style="color:' + this.color + '">\u25CF</span> ' + formatValue(this.series.name + ': <b>', this.y, formatOptions) + '</b><br/>';
    };
  }
};

export default class {
  constructor(library) {
    this.name = "highcharts";
    this.library = library;
  }

  renderLineChart(chart, chartType) {
    chartType = chartType || "spline";
    let chartOptions = {};
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

    let options = jsOptions(chart, chart.options, chartOptions), data, i, j;
    options.xAxis.type = chart.xtype === "string" ? "category" : (chart.xtype === "number" ? "linear" : "datetime");
    if (!options.chart.type) {
      options.chart.type = chartType;
    }
    setFormatOptions(chart, options, chartType);

    let series = chart.data;
    for (i = 0; i < series.length; i++) {
      series[i].name = series[i].name || "Value";
      data = series[i].data;
      if (chart.xtype === "datetime") {
        for (j = 0; j < data.length; j++) {
          data[j][0] = data[j][0].getTime();
        }
      }
      series[i].marker = {symbol: "circle"};
      if (chart.options.points === false) {
        series[i].marker.enabled = false;
      }
    }

    this.drawChart(chart, series, options);
  }

  renderScatterChart(chart) {
    let options = jsOptions(chart, chart.options, {}), data, i, j;
    options.chart.type = "scatter";

    let series = chart.data;
    for (i = 0; i < series.length; i++) {
      series[i].name = series[i].name || "Value";
      data = series[i].data;
      if (chart.xtype === "datetime") {
        for (j = 0; j < data.length; j++) {
          data[j][0] = data[j][0].getTime();
        }
      }
      series[i].marker = {symbol: "circle"};
      if (chart.options.points === false) {
        series[i].marker.enabled = false;
      }
    }

    if (chart.xtype === "datetime") {
      options.xAxis.type = "datetime";
      options.tooltip.formatter = function() {
        return `(<b>${Highcharts.dateFormat('%b %d %Y', new Date(this.x))}</b>, <b>${this.y}</b>)`;
      }
    }

    this.drawChart(chart, chart.data, options);
  }

  renderPieChart(chart) {
    let chartOptions = merge(defaultOptions, {});

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

    let options = merge(chartOptions, chart.options.library || {});
    setFormatOptions(chart, options, "pie");
    let series = [{
      type: "pie",
      name: chart.options.label || "Value",
      data: chart.data
    }];

    this.drawChart(chart, series, options);
  }

  renderColumnChart(chart, chartType) {
    chartType = chartType || "column";
    let series = chart.data;
    let options = jsOptions(chart, chart.options), i, j, s, d, rows = [], categories = [];
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

    if (chart.xtype === "number") {
      categories.sort(sortByNumber);
    }

    options.xAxis.categories = categories;

    let newSeries = [], d2;
    for (i = 0; i < series.length; i++) {
      d = [];
      for (j = 0; j < categories.length; j++) {
        d.push(rows[categories[j]][i] || 0);
      }

      d2 = {
        name: series[i].name || "Value",
        data: d
      };
      if (series[i].stack) {
        d2.stack = series[i].stack;
      }

      newSeries.push(d2);
    }

    this.drawChart(chart, newSeries, options);
  }

  renderBarChart(chart) {
    this.renderColumnChart(chart, "bar");
  }

  renderAreaChart(chart) {
    this.renderLineChart(chart, "areaspline");
  }

  destroy(chart) {
    if (chart.chart) {
      chart.chart.destroy();
    }
  }

  drawChart(chart, data, options) {
    this.destroy(chart);

    options.chart.renderTo = chart.element.id;
    options.series = data;

    if (chart.options.code) {
      window.console.log("new Highcharts.Chart(" + JSON.stringify(options) + ");");
    }

    chart.chart = new this.library.Chart(options);
  }
}
