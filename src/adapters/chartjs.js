import { formatValue, jsOptionsFunc, merge, isArray, toStr, toFloat, toDate, sortByNumber, isMinute, isHour, isDay, isWeek, isMonth, isYear, seriesOption } from "../helpers";

function allZeros(data) {
  let i, j, d;
  for (i = 0; i < data.length; i++) {
    d = data[i].data;
    for (j = 0; j < d.length; j++) {
      if (d[j][1] != 0) {
        return false;
      }
    }
  }
  return true;
}

let baseOptions = {
  maintainAspectRatio: false,
  animation: false,
  tooltips: {
    displayColors: false,
    callbacks: {}
  },
  legend: {},
  title: {fontSize: 20, fontColor: "#333"}
};

let defaultOptions = {
  scales: {
    yAxes: [
      {
        ticks: {
          maxTicksLimit: 4
        },
        scaleLabel: {
          fontSize: 16,
          // fontStyle: "bold",
          fontColor: "#333"
        }
      }
    ],
    xAxes: [
      {
        gridLines: {
          drawOnChartArea: false
        },
        scaleLabel: {
          fontSize: 16,
          // fontStyle: "bold",
          fontColor: "#333"
        },
        time: {},
        ticks: {}
      }
    ]
  }
};

// http://there4.io/2012/05/02/google-chart-color-list/
let defaultColors = [
  "#3366CC", "#DC3912", "#FF9900", "#109618", "#990099", "#3B3EAC", "#0099C6",
  "#DD4477", "#66AA00", "#B82E2E", "#316395", "#994499", "#22AA99", "#AAAA11",
  "#6633CC", "#E67300", "#8B0707", "#329262", "#5574A6", "#651067"
];

let hideLegend = function (options, legend, hideLegend) {
  if (legend !== undefined) {
    options.legend.display = !!legend;
    if (legend && legend !== true) {
      options.legend.position = legend;
    }
  } else if (hideLegend) {
    options.legend.display = false;
  }
};

let setTitle = function (options, title) {
  options.title.display = true;
  options.title.text = title;
};

let setMin = function (options, min) {
  if (min !== null) {
    options.scales.yAxes[0].ticks.min = toFloat(min);
  }
};

let setMax = function (options, max) {
  options.scales.yAxes[0].ticks.max = toFloat(max);
};

let setBarMin = function (options, min) {
  if (min !== null) {
    options.scales.xAxes[0].ticks.min = toFloat(min);
  }
};

let setBarMax = function (options, max) {
  options.scales.xAxes[0].ticks.max = toFloat(max);
};

let setStacked = function (options, stacked) {
  options.scales.xAxes[0].stacked = !!stacked;
  options.scales.yAxes[0].stacked = !!stacked;
};

let setXtitle = function (options, title) {
  options.scales.xAxes[0].scaleLabel.display = true;
  options.scales.xAxes[0].scaleLabel.labelString = title;
};

let setYtitle = function (options, title) {
  options.scales.yAxes[0].scaleLabel.display = true;
  options.scales.yAxes[0].scaleLabel.labelString = title;
};

// https://stackoverflow.com/questions/5623838/rgb-to-hex-and-hex-to-rgb
let addOpacity = function(hex, opacity) {
  let result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? "rgba(" + parseInt(result[1], 16) + ", " + parseInt(result[2], 16) + ", " + parseInt(result[3], 16) + ", " + opacity + ")" : hex;
};

// check if not null or undefined
// https://stackoverflow.com/a/27757708/1177228
let notnull = function(x) {
  return x != null;
};

let setLabelSize = function (chart, data, options) {
  let maxLabelSize = Math.ceil(chart.element.offsetWidth / 4.0 / data.labels.length);
  if (maxLabelSize > 25) {
    maxLabelSize = 25;
  } else if (maxLabelSize < 10) {
    maxLabelSize = 10;
  }
  if (!options.scales.xAxes[0].ticks.callback) {
    options.scales.xAxes[0].ticks.callback = function (value) {
      value = toStr(value);
      if (value.length > maxLabelSize) {
        return value.substring(0, maxLabelSize - 2) + "...";
      } else {
        return value;
      }
    };
  }
};

let setFormatOptions = function(chart, options, chartType) {
  let formatOptions = {
    prefix: chart.options.prefix,
    suffix: chart.options.suffix,
    thousands: chart.options.thousands,
    decimal: chart.options.decimal
  };

  if (chartType !== "pie") {
    let myAxes = options.scales.yAxes;
    if (chartType === "bar") {
      myAxes = options.scales.xAxes;
    }

    if (!myAxes[0].ticks.callback) {
      myAxes[0].ticks.callback = function (value) {
        return formatValue("", value, formatOptions);
      };
    }
  }

  if (!options.tooltips.callbacks.label) {
    if (chartType === "scatter") {
      options.tooltips.callbacks.label = function (item, data) {
        let label = data.datasets[item.datasetIndex].label || '';
        if (label) {
          label += ': ';
        }
        return label + '(' + item.xLabel + ', ' + item.yLabel + ')';
      };
    } else if (chartType === "bubble") {
      options.tooltips.callbacks.label = function (item, data) {
        let label = data.datasets[item.datasetIndex].label || '';
        if (label) {
          label += ': ';
        }
        let dataPoint = data.datasets[item.datasetIndex].data[item.index];
        return label + '(' + item.xLabel + ', ' + item.yLabel + ', ' + dataPoint.v + ')';
      };
    } else if (chartType === "pie") {
      // need to use separate label for pie charts
      options.tooltips.callbacks.label = function (tooltipItem, data) {
        let dataLabel = data.labels[tooltipItem.index];
        let value = ': ';

        if (isArray(dataLabel)) {
          // show value on first line of multiline label
          // need to clone because we are changing the value
          dataLabel = dataLabel.slice();
          dataLabel[0] += value;
        } else {
          dataLabel += value;
        }

        return formatValue(dataLabel, data.datasets[tooltipItem.datasetIndex].data[tooltipItem.index], formatOptions);
      };
    } else {
      let valueLabel = chartType === "bar" ? "xLabel" : "yLabel";
      options.tooltips.callbacks.label = function (tooltipItem, data) {
        let label = data.datasets[tooltipItem.datasetIndex].label || '';
        if (label) {
          label += ': ';
        }
        return formatValue(label, tooltipItem[valueLabel], formatOptions);
      };
    }
  }
};

let jsOptions = jsOptionsFunc(merge(baseOptions, defaultOptions), hideLegend, setTitle, setMin, setMax, setStacked, setXtitle, setYtitle);

let createDataTable = function (chart, options, chartType) {
  let datasets = [];
  let labels = [];

  let colors = chart.options.colors || defaultColors;

  let day = true;
  let week = true;
  let dayOfWeek;
  let month = true;
  let year = true;
  let hour = true;
  let minute = true;

  let series = chart.data;

  let max = 0;
  if (chartType === "bubble") {
    for (let i = 0; i < series.length; i++) {
      let s = series[i];
      for (let j = 0; j < s.data.length; j++) {
        if (s.data[j][2] > max) {
          max = s.data[j][2];
        }
      }
    }
  }

  let i, j, s, d, key, rows = [], rows2 = [];

  if (chartType === "bar" || chartType === "column" || (chart.xtype !== "number" && chart.xtype !== "bubble")) {
    let sortedLabels = [];

    for (i = 0; i < series.length; i++) {
      s = series[i];

      for (j = 0; j < s.data.length; j++) {
        d = s.data[j];
        key = chart.xtype == "datetime" ? d[0].getTime() : d[0];
        if (!rows[key]) {
          rows[key] = new Array(series.length);
        }
        rows[key][i] = toFloat(d[1]);
        if (sortedLabels.indexOf(key) === -1) {
          sortedLabels.push(key);
        }
      }
    }

    if (chart.xtype === "datetime" || chart.xtype === "number") {
      sortedLabels.sort(sortByNumber);
    }

    for (j = 0; j < series.length; j++) {
      rows2.push([]);
    }

    let value;
    let k;
    for (k = 0; k < sortedLabels.length; k++) {
      i = sortedLabels[k];
      if (chart.xtype === "datetime") {
        value = new Date(toFloat(i));
        // TODO make this efficient
        day = day && isDay(value);
        if (!dayOfWeek) {
          dayOfWeek = value.getDay();
        }
        week = week && isWeek(value, dayOfWeek);
        month = month && isMonth(value);
        year = year && isYear(value);
        hour = hour && isHour(value);
        minute = minute && isMinute(value);
      } else {
        value = i;
      }
      labels.push(value);
      for (j = 0; j < series.length; j++) {
        // Chart.js doesn't like undefined
        rows2[j].push(rows[i][j] === undefined ? null : rows[i][j]);
      }
    }
  } else {
    for (let i = 0; i < series.length; i++) {
      let s = series[i];
      let d = [];
      for (let j = 0; j < s.data.length; j++) {
        let point = {
          x: toFloat(s.data[j][0]),
          y: toFloat(s.data[j][1])
        };
        if (chartType === "bubble") {
          point.r = toFloat(s.data[j][2]) * 20 / max;
          // custom attribute, for tooltip
          point.v = s.data[j][2];
        }
        d.push(point);
      }
      rows2.push(d);
    }
  }

  for (i = 0; i < series.length; i++) {
    s = series[i];

    let color = s.color || colors[i];
    let backgroundColor = chartType !== "line" ? addOpacity(color, 0.5) : color;

    let dataset = {
      label: s.name || "",
      data: rows2[i],
      fill: chartType === "area",
      borderColor: color,
      backgroundColor: backgroundColor,
      pointBackgroundColor: color,
      borderWidth: 2,
      pointHoverBackgroundColor: color
    };

    if (s.stack) {
      dataset.stack = s.stack;
    }

    let curve = seriesOption(chart, s, "curve");
    if (curve === false) {
      dataset.lineTension = 0;
    }

    let points = seriesOption(chart, s, "points");
    if (points === false) {
      dataset.pointRadius = 0;
      dataset.pointHitRadius = 5;
    }

    dataset = merge(dataset, chart.options.dataset || {});
    dataset = merge(dataset, s.library || {});
    dataset = merge(dataset, s.dataset || {});

    datasets.push(dataset);
  }

  let xmin = chart.options.xmin;
  let xmax = chart.options.xmax;

  if (chart.xtype === "datetime") {
    if (notnull(xmin)) {
      options.scales.xAxes[0].time.min = toDate(xmin).getTime();
    }
    if (notnull(xmax)) {
      options.scales.xAxes[0].time.max = toDate(xmax).getTime();
    }
  } else if (chart.xtype === "number") {
    if (notnull(xmin)) {
      options.scales.xAxes[0].ticks.min = xmin;
    }
    if (notnull(xmax)) {
      options.scales.xAxes[0].ticks.max = xmax;
    }
  }

  if (chart.xtype === "datetime" && labels.length > 0) {
    let minTime = (notnull(xmin) ? toDate(xmin) : labels[0]).getTime();
    let maxTime = (notnull(xmax) ? toDate(xmax) : labels[0]).getTime();

    for (i = 1; i < labels.length; i++) {
      let value = labels[i].getTime();
      if (value < minTime) {
        minTime = value;
      }
      if (value > maxTime) {
        maxTime = value;
      }
    }

    let timeDiff = (maxTime - minTime) / (86400 * 1000.0);

    if (!options.scales.xAxes[0].time.unit) {
      let step;
      if (year || timeDiff > 365 * 10) {
        options.scales.xAxes[0].time.unit = "year";
        step = 365;
      } else if (month || timeDiff > 30 * 10) {
        options.scales.xAxes[0].time.unit = "month";
        step = 30;
      } else if (day || timeDiff > 10) {
        options.scales.xAxes[0].time.unit = "day";
        step = 1;
      } else if (hour || timeDiff > 0.5) {
        options.scales.xAxes[0].time.displayFormats = {hour: chart.options.date_format || "MMM D, h a"};
        options.scales.xAxes[0].time.unit = "hour";
        step = 1 / 24.0;
      } else if (minute) {
        options.scales.xAxes[0].time.displayFormats = {minute: chart.options.time_format || "h:mm a"};
        options.scales.xAxes[0].time.unit = "minute";
        step = 1 / 24.0 / 60.0;
      }

      if (step && timeDiff > 0) {
        let unitStepSize = Math.ceil(timeDiff / step / (chart.element.offsetWidth / 100.0));
        if (week && step === 1) {
          unitStepSize = Math.ceil(unitStepSize / 7.0) * 7;
        }
        options.scales.xAxes[0].time.unitStepSize = unitStepSize;
      }
    }

    if (!options.scales.xAxes[0].time.tooltipFormat) {
      if (day) {
        options.scales.xAxes[0].time.tooltipFormat = "ll";
      } else if (hour) {
        options.scales.xAxes[0].time.tooltipFormat = chart.options.date_format || "MMM D, h a";
      } else if (minute) {
        options.scales.xAxes[0].time.tooltipFormat = chart.options.time_format || "h:mm a";
      }
    }
  }

  let data = {
    labels: labels,
    datasets: datasets
  };

  return data;
};

export default class {
  constructor(library) {
    this.name = "chartjs";
    this.library = library;
  }

  renderLineChart(chart, chartType) {
    let chartOptions = {};
    if (chartType === "area") {
      // TODO fix area stacked
      // chartOptions.stacked = true;
    }
    // fix for https://github.com/chartjs/Chart.js/issues/2441
    if (!chart.options.max && allZeros(chart.data)) {
      chartOptions.max = 1;
    }

    let options = jsOptions(chart, merge(chartOptions, chart.options));
    setFormatOptions(chart, options, chartType);

    let data = createDataTable(chart, options, chartType || "line");

    if (chart.xtype === "number") {
      options.scales.xAxes[0].type = "linear";
      options.scales.xAxes[0].position = "bottom";
    } else {
      options.scales.xAxes[0].type = chart.xtype === "string" ? "category" : "time";
    }

    this.drawChart(chart, "line", data, options);
  }

  renderPieChart(chart) {
    let options = merge({}, baseOptions);
    if (chart.options.donut) {
      options.cutoutPercentage = 50;
    }

    if ("legend" in chart.options) {
      hideLegend(options, chart.options.legend);
    }

    if (chart.options.title) {
      setTitle(options, chart.options.title);
    }

    options = merge(options, chart.options.library || {});
    setFormatOptions(chart, options, "pie");

    let labels = [];
    let values = [];
    for (let i = 0; i < chart.data.length; i++) {
      let point = chart.data[i];
      labels.push(point[0]);
      values.push(point[1]);
    }

    let dataset = {
      data: values,
      backgroundColor: chart.options.colors || defaultColors
    };
    dataset = merge(dataset, chart.options.dataset || {});

    let data = {
      labels: labels,
      datasets: [dataset]
    };

    this.drawChart(chart, "pie", data, options);
  }

  renderColumnChart(chart, chartType) {
    let options;
    if (chartType === "bar") {
      let barOptions = merge(baseOptions, defaultOptions);
      delete barOptions.scales.yAxes[0].ticks.maxTicksLimit;
      options = jsOptionsFunc(barOptions, hideLegend, setTitle, setBarMin, setBarMax, setStacked, setXtitle, setYtitle)(chart, chart.options);
    } else {
      options = jsOptions(chart, chart.options);
    }
    setFormatOptions(chart, options, chartType);
    let data = createDataTable(chart, options, "column");
    if (chartType !== "bar") {
      setLabelSize(chart, data, options);
    }
    this.drawChart(chart, (chartType === "bar" ? "horizontalBar" : "bar"), data, options);
  }

  renderAreaChart(chart) {
    this.renderLineChart(chart, "area");
  }

  renderBarChart(chart) {
    this.renderColumnChart(chart, "bar");
  }

  renderScatterChart(chart, chartType) {
    chartType = chartType || "scatter";

    let options = jsOptions(chart, chart.options);
    setFormatOptions(chart, options, chartType);

    if (!("showLines" in options)) {
      options.showLines = false;
    }

    let data = createDataTable(chart, options, chartType);

    options.scales.xAxes[0].type = "linear";
    options.scales.xAxes[0].position = "bottom";

    this.drawChart(chart, chartType, data, options);
  }

  renderBubbleChart(chart) {
    this.renderScatterChart(chart, "bubble");
  }

  destroy(chart) {
    if (chart.chart) {
      chart.chart.destroy();
    }
  }

  drawChart(chart, type, data, options) {
    this.destroy(chart);

    let chartOptions = {
      type: type,
      data: data,
      options: options
    };

    if (chart.options.code) {
      window.console.log("new Chart(ctx, " + JSON.stringify(chartOptions) + ");");
    }

    chart.element.innerHTML = "<canvas></canvas>";
    let ctx = chart.element.getElementsByTagName("CANVAS")[0];
    chart.chart = new this.library(ctx, chartOptions);
  }
}
