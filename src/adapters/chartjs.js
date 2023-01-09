import { formatValue, jsOptionsFunc, merge, isArray, toStr, toFloat, toDate, sortByNumber, sortByNumberSeries, isMinute, isHour, isDay, isWeek, isMonth, isYear, seriesOption } from "../helpers";

const baseOptions = {
  maintainAspectRatio: false,
  animation: false,
  plugins: {
    legend: {},
    tooltip: {
      displayColors: false,
      callbacks: {}
    },
    title: {
      font: {
        size: 20
      },
      color: "#333"
    }
  },
  interaction: {}
};

const defaultOptions = {
  scales: {
    y: {
      ticks: {
        maxTicksLimit: 4
      },
      title: {
        font: {
          size: 16
        },
        color: "#333"
      },
      grid: {}
    },
    x: {
      grid: {
        drawOnChartArea: false
      },
      title: {
        font: {
          size: 16
        },
        color: "#333"
      },
      time: {},
      ticks: {}
    }
  }
};

// http://there4.io/2012/05/02/google-chart-color-list/
const defaultColors = [
  "#3366CC", "#DC3912", "#FF9900", "#109618", "#990099", "#3B3EAC", "#0099C6",
  "#DD4477", "#66AA00", "#B82E2E", "#316395", "#994499", "#22AA99", "#AAAA11",
  "#6633CC", "#E67300", "#8B0707", "#329262", "#5574A6", "#651067"
];

function hideLegend(options, legend, hideLegend) {
  if (legend !== undefined) {
    options.plugins.legend.display = !!legend;
    if (legend && legend !== true) {
      options.plugins.legend.position = legend;
    }
  } else if (hideLegend) {
    options.plugins.legend.display = false;
  }
}

function setTitle(options, title) {
  options.plugins.title.display = true;
  options.plugins.title.text = title;
}

function setMin(options, min) {
  if (min !== null) {
    options.scales.y.min = toFloat(min);
  }
}

function setMax(options, max) {
  options.scales.y.max = toFloat(max);
}

function setBarMin(options, min) {
  if (min !== null) {
    options.scales.x.min = toFloat(min);
  }
}

function setBarMax(options, max) {
  options.scales.x.max = toFloat(max);
}

function setStacked(options, stacked) {
  options.scales.x.stacked = !!stacked;
  options.scales.y.stacked = !!stacked;
}

function setXtitle(options, title) {
  options.scales.x.title.display = true;
  options.scales.x.title.text = title;
}

function setYtitle(options, title) {
  options.scales.y.title.display = true;
  options.scales.y.title.text = title;
}

// https://stackoverflow.com/questions/5623838/rgb-to-hex-and-hex-to-rgb
function addOpacity(hex, opacity) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? "rgba(" + parseInt(result[1], 16) + ", " + parseInt(result[2], 16) + ", " + parseInt(result[3], 16) + ", " + opacity + ")" : hex;
}

// check if not null or undefined
// https://stackoverflow.com/a/27757708/1177228
function notnull(x) {
  return x != null;
}

function setLabelSize(chart, data, options) {
  let maxLabelSize = Math.ceil(chart.element.offsetWidth / 4.0 / data.labels.length);
  if (maxLabelSize > 25) {
    maxLabelSize = 25;
  } else if (maxLabelSize < 10) {
    maxLabelSize = 10;
  }
  if (!options.scales.x.ticks.callback) {
    options.scales.x.ticks.callback = function (value) {
      value = toStr(this.getLabelForValue(value));
      if (value.length > maxLabelSize) {
        return value.substring(0, maxLabelSize - 2) + "...";
      } else {
        return value;
      }
    };
  }
}

function calculateScale(series) {
  // calculate max
  let max = 0;
  for (let i = 0; i < series.length; i++) {
    const s = series[i];
    for (let j = 0; j < s.data.length; j++) {
      if (s.data[j][1] > max) {
        max = s.data[j][1];
      }
    }
  }

  // calculate scale
  let scale = 1;
  while (max >= 1024) {
    scale *= 1024;
    max /= 1024;
  }

  return scale;
}

function setFormatOptions(chart, options, chartType) {
  const formatOptions = {
    prefix: chart.options.prefix,
    suffix: chart.options.suffix,
    thousands: chart.options.thousands,
    decimal: chart.options.decimal,
    precision: chart.options.precision,
    round: chart.options.round,
    zeros: chart.options.zeros
  };

  if (chart.options.bytes) {
    let series = chart.data;
    if (chartType === "pie") {
      series = [{data: series}];
    }

    // set step size
    formatOptions.byteScale = calculateScale(series);
  }

  if (chartType !== "pie") {
    let axis = options.scales.y;
    if (chartType === "bar") {
      axis = options.scales.x;
    }

    if (formatOptions.byteScale) {
      if (!axis.ticks.stepSize) {
        axis.ticks.stepSize = formatOptions.byteScale / 2;
      }
      if (!axis.ticks.maxTicksLimit) {
        axis.ticks.maxTicksLimit = 4;
      }
    }

    if (!axis.ticks.callback) {
      axis.ticks.callback = function (value) {
        return formatValue("", value, formatOptions, true);
      };
    }
  }

  if (!options.plugins.tooltip.callbacks.label) {
    if (chartType === "scatter") {
      options.plugins.tooltip.callbacks.label = function (context) {
        let label = context.dataset.label || '';
        if (label) {
          label += ': ';
        }

        if (chart.__adapterObject.chartjs4) {
          return label + context.formattedValue;
        } else {
          return label + '(' + context.label + ', ' + context.formattedValue + ')';
        }
      };
    } else if (chartType === "bubble") {
      options.plugins.tooltip.callbacks.label = function (context) {
        let label = context.dataset.label || '';
        if (label) {
          label += ': ';
        }
        const dataPoint = context.raw;
        return label + '(' + dataPoint.x + ', ' + dataPoint.y + ', ' + dataPoint.v + ')';
      };
    } else if (chartType === "pie") {
      // need to use separate label for pie charts
      options.plugins.tooltip.callbacks.label = function (context) {
        if (chart.__adapterObject.chartjs4) {
          return formatValue('', context.parsed, formatOptions);
        }

        let dataLabel = context.label;
        const value = ': ';

        if (isArray(dataLabel)) {
          // show value on first line of multiline label
          // need to clone because we are changing the value
          dataLabel = dataLabel.slice();
          dataLabel[0] += value;
        } else {
          dataLabel += value;
        }

        return formatValue(dataLabel, context.parsed, formatOptions);
      };
    } else {
      const valueLabel = chartType === "bar" ? "x" : "y";
      options.plugins.tooltip.callbacks.label = function (context) {
        // don't show null values for stacked charts
        if (context.parsed[valueLabel] === null) {
          return;
        }

        let label = context.dataset.label || '';
        if (label) {
          label += ': ';
        }
        return formatValue(label, context.parsed[valueLabel], formatOptions);
      };
    }
  }
}

function maxR(series) {
  let max = 0;
  for (let i = 0; i < series.length; i++) {
    const data = series[i].data;
    for (let j = 0; j < data.length; j++) {
      const r = data[j][2];
      if (r > max) {
        max = r;
      }
    }
  }
  return max;
}

const jsOptions = jsOptionsFunc(merge(baseOptions, defaultOptions), hideLegend, setTitle, setMin, setMax, setStacked, setXtitle, setYtitle);

function createDataTable(chart, options, chartType) {
  const datasets = [];
  const labels = [];

  const colors = chart.options.colors || defaultColors;

  let day = true;
  let week = true;
  let dayOfWeek;
  let month = true;
  let year = true;
  let hour = true;
  let minute = true;

  const series = chart.data;

  const rows = [];
  const rows2 = [];

  if (chartType === "bar" || chartType === "column" || (chart.xtype !== "number" && chart.xtype !== "bubble")) {
    const sortedLabels = [];

    for (let i = 0; i < series.length; i++) {
      const data = series[i].data;

      for (let j = 0; j < data.length; j++) {
        const d = data[j];
        const key = chart.xtype === "datetime" ? d[0].getTime() : d[0];
        if (!rows[key]) {
          rows[key] = new Array(series.length);
        }
        rows[key][i] = d[1];
        if (sortedLabels.indexOf(key) === -1) {
          sortedLabels.push(key);
        }
      }
    }

    if (chart.xtype === "datetime" || chart.xtype === "number") {
      sortedLabels.sort(sortByNumber);
    }

    for (let i = 0; i < series.length; i++) {
      rows2.push([]);
    }

    for (let i = 0; i < sortedLabels.length; i++) {
      const v = sortedLabels[i];
      let value;
      if (chart.xtype === "datetime") {
        value = new Date(v);
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
        value = v;
      }
      labels.push(value);
      for (let j = 0; j < series.length; j++) {
        // Chart.js doesn't like undefined
        rows2[j].push(rows[v][j] === undefined ? null : rows[v][j]);
      }
    }
  } else if (chartType === "bubble") {
    const max = maxR(series);

    for (let i = 0; i < series.length; i++) {
      const data = series[i].data;
      const points = [];
      for (let j = 0; j < data.length; j++) {
        const v = data[j];
        points.push({
          x: v[0],
          y: v[1],
          r: v[2] * 20 / max,
          // custom attribute, for tooltip
          v: v[2]
        });
      }
      rows2.push(points);
    }
  } else {
    // scatter or numeric line/area
    for (let i = 0; i < series.length; i++) {
      const data = series[i].data;

      if (chartType !== "scatter") {
        data.sort(sortByNumberSeries);
      }

      const points = [];
      for (let j = 0; j < data.length; j++) {
        const v = data[j];
        points.push({
          x: v[0],
          y: v[1]
        });
      }
      rows2.push(points);
    }
  }

  for (let i = 0; i < series.length; i++) {
    const s = series[i];

    // use colors for each bar for single series format
    let color;
    let backgroundColor;
    if (chart.options.colors && chart.singleSeriesFormat && (chartType === "bar" || chartType === "column") && !s.color && isArray(chart.options.colors) && !isArray(chart.options.colors[0])) {
      color = colors;
      backgroundColor = [];
      for (let j = 0; j < colors.length; j++) {
        backgroundColor[j] = addOpacity(color[j], 0.5);
      }
    } else {
      color = s.color || colors[i];
      backgroundColor = chartType !== "line" ? addOpacity(color, 0.5) : color;
    }

    let dataset = {
      label: s.name || "",
      data: rows2[i],
      fill: chartType === "area",
      borderColor: color,
      backgroundColor: backgroundColor,
      borderWidth: 2
    };

    const pointChart = chartType === "line" || chartType === "area" || chartType === "scatter" || chartType === "bubble";
    if (pointChart) {
      dataset.pointBackgroundColor = color;
      dataset.pointHoverBackgroundColor = color;
      dataset.pointHitRadius = 50;
    }

    if (chartType === "bubble") {
      dataset.pointBackgroundColor = backgroundColor;
      dataset.pointHoverBackgroundColor = backgroundColor;
      dataset.pointHoverBorderWidth = 2;
    }

    if (s.stack) {
      dataset.stack = s.stack;
    }

    const curve = seriesOption(chart, s, "curve");
    if (curve === false) {
      dataset.tension = 0;
    } else if (pointChart) {
      dataset.tension = 0.4;
    }

    const points = seriesOption(chart, s, "points");
    if (points === false) {
      dataset.pointRadius = 0;
      dataset.pointHoverRadius = 0;
    }

    dataset = merge(dataset, chart.options.dataset || {});
    dataset = merge(dataset, s.library || {});
    dataset = merge(dataset, s.dataset || {});

    datasets.push(dataset);
  }

  const xmin = chart.options.xmin;
  const xmax = chart.options.xmax;

  if (chart.xtype === "datetime") {
    if (notnull(xmin)) {
      options.scales.x.min = toDate(xmin).getTime();
    }
    if (notnull(xmax)) {
      options.scales.x.max = toDate(xmax).getTime();
    }
  } else if (chart.xtype === "number") {
    if (notnull(xmin)) {
      options.scales.x.min = xmin;
    }
    if (notnull(xmax)) {
      options.scales.x.max = xmax;
    }
  }

  // for empty datetime chart
  if (chart.xtype === "datetime" && labels.length === 0) {
    if (notnull(xmin)) {
      labels.push(toDate(xmin));
    }
    if (notnull(xmax)) {
      labels.push(toDate(xmax));
    }
    day = false;
    week = false;
    month = false;
    year = false;
    hour = false;
    minute = false;
  }

  if (chart.xtype === "datetime" && labels.length > 0) {
    let minTime = (notnull(xmin) ? toDate(xmin) : labels[0]).getTime();
    let maxTime = (notnull(xmax) ? toDate(xmax) : labels[0]).getTime();

    for (let i = 1; i < labels.length; i++) {
      const value = labels[i].getTime();
      if (value < minTime) {
        minTime = value;
      }
      if (value > maxTime) {
        maxTime = value;
      }
    }

    const timeDiff = (maxTime - minTime) / (86400 * 1000.0);

    if (!options.scales.x.time.unit) {
      let step;
      if (year || timeDiff > 365 * 10) {
        options.scales.x.time.unit = "year";
        step = 365;
      } else if (month || timeDiff > 30 * 10) {
        options.scales.x.time.unit = "month";
        step = 30;
      } else if (day || timeDiff > 10) {
        options.scales.x.time.unit = "day";
        step = 1;
      } else if (hour || timeDiff > 0.5) {
        options.scales.x.time.displayFormats = {hour: "MMM d, h a"};
        options.scales.x.time.unit = "hour";
        step = 1 / 24.0;
      } else if (minute) {
        options.scales.x.time.displayFormats = {minute: "h:mm a"};
        options.scales.x.time.unit = "minute";
        step = 1 / 24.0 / 60.0;
      }

      if (step && timeDiff > 0) {
        // width not available for hidden elements
        const width = chart.element.offsetWidth;
        if (width > 0) {
          let unitStepSize = Math.ceil(timeDiff / step / (width / 100.0));
          if (week && step === 1) {
            unitStepSize = Math.ceil(unitStepSize / 7.0) * 7;
          }
          if (chart.__adapterObject.chartjs4) {
            options.scales.x.ticks.stepSize = unitStepSize;
          } else {
            options.scales.x.time.stepSize = unitStepSize;
          }
        }
      }
    }

    if (!options.scales.x.time.tooltipFormat) {
      if (day) {
        options.scales.x.time.tooltipFormat = "PP";
      } else if (hour) {
        options.scales.x.time.tooltipFormat = "MMM d, h a";
      } else if (minute) {
        options.scales.x.time.tooltipFormat = "h:mm a";
      }
    }
  }

  const data = {
    labels: labels,
    datasets: datasets
  };

  return data;
}

function allZeros(data) {
  for (let i = 0; i < data.length; i++) {
    const d = data[i].data;
    for (let j = 0; j < d.length; j++) {
      if (d[j][1] !== 0) {
        return false;
      }
    }
  }
  return true;
}

export default class {
  constructor(library) {
    this.name = "chartjs";
    this.library = library;
    this.chartjs4 = parseInt(library.version, 10) >= 4;
  }

  renderLineChart(chart, chartType) {
    const chartOptions = {};
    if (chartType === "area") {
      // TODO fix area stacked
      // chartOptions.stacked = true;
    }
    // fix for https://github.com/chartjs/Chart.js/issues/2441
    if (!chart.options.max && allZeros(chart.data)) {
      chartOptions.max = 1;
    }

    const options = jsOptions(chart, merge(chartOptions, chart.options));
    setFormatOptions(chart, options, chartType);

    const data = createDataTable(chart, options, chartType || "line");

    if (chart.xtype === "number") {
      options.scales.x.type = options.scales.x.type || "linear";
      options.scales.x.position = options.scales.x.position || "bottom";
    } else {
      options.scales.x.type = chart.xtype === "string" ? "category" : "time";
    }

    this.drawChart(chart, "line", data, options);
  }

  renderPieChart(chart) {
    let options = merge({}, baseOptions);
    if (chart.options.donut) {
      options.cutout = "50%";
    }

    if ("legend" in chart.options) {
      hideLegend(options, chart.options.legend);
    }

    if (chart.options.title) {
      setTitle(options, chart.options.title);
    }

    options = merge(options, chart.options.library || {});
    setFormatOptions(chart, options, "pie");

    const labels = [];
    const values = [];
    for (let i = 0; i < chart.data.length; i++) {
      const point = chart.data[i];
      labels.push(point[0]);
      values.push(point[1]);
    }

    let dataset = {
      data: values,
      backgroundColor: chart.options.colors || defaultColors
    };
    dataset = merge(dataset, chart.options.dataset || {});

    const data = {
      labels: labels,
      datasets: [dataset]
    };

    this.drawChart(chart, "pie", data, options);
  }

  renderColumnChart(chart, chartType) {
    let options;
    if (chartType === "bar") {
      const barOptions = merge(baseOptions, defaultOptions);
      barOptions.indexAxis = "y";

      // ensure gridlines have proper orientation
      barOptions.scales.x.grid.drawOnChartArea = true;
      barOptions.scales.y.grid.drawOnChartArea = false;
      delete barOptions.scales.y.ticks.maxTicksLimit;

      options = jsOptionsFunc(barOptions, hideLegend, setTitle, setBarMin, setBarMax, setStacked, setXtitle, setYtitle)(chart, chart.options);
    } else {
      options = jsOptions(chart, chart.options);
    }
    setFormatOptions(chart, options, chartType);
    const data = createDataTable(chart, options, "column");
    if (chartType !== "bar") {
      setLabelSize(chart, data, options);
    }
    if (this.chartjs4 && !("mode" in options.interaction)) {
      options.interaction.mode = "index";
    }
    this.drawChart(chart, "bar", data, options);
  }

  renderAreaChart(chart) {
    this.renderLineChart(chart, "area");
  }

  renderBarChart(chart) {
    this.renderColumnChart(chart, "bar");
  }

  renderScatterChart(chart, chartType) {
    chartType = chartType || "scatter";

    const options = jsOptions(chart, chart.options);
    setFormatOptions(chart, options, chartType);

    if (!("showLine" in options)) {
      options.showLine = false;
    }

    const data = createDataTable(chart, options, chartType);

    options.scales.x.type = options.scales.x.type || "linear";
    options.scales.x.position = options.scales.x.position || "bottom";

    // prevent grouping hover and tooltips
    if (!("mode" in options.interaction)) {
      options.interaction.mode = "nearest";
    }

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
    if (chart.destroyed) return;

    const chartOptions = {
      type: type,
      data: data,
      options: options
    };

    if (chart.options.code) {
      window.console.log("new Chart(ctx, " + JSON.stringify(chartOptions) + ");");
    }

    chart.element.innerHTML = "<canvas></canvas>";
    const ctx = chart.element.getElementsByTagName("CANVAS")[0];
    chart.chart = new this.library(ctx, chartOptions);
  }
}
