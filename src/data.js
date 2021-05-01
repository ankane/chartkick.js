import { isArray, toStr, toFloat, toDate, toArr, sortByTime, sortByNumberSeries, isDate, isNumber } from "./helpers";

function formatSeriesData(data, keyType) {
  let r = [], j, keyFunc;

  if (keyType === "number") {
    keyFunc = toFloat;
  } else if (keyType === "datetime") {
    keyFunc = toDate;
  } else {
    keyFunc = toStr;
  }

  if (keyType === "bubble") {
    for (j = 0; j < data.length; j++) {
      r.push([toFloat(data[j][0]), toFloat(data[j][1]), toFloat(data[j][2])]);
    }
  } else {
    for (j = 0; j < data.length; j++) {
      r.push([keyFunc(data[j][0]), toFloat(data[j][1])]);
    }
  }

  if (keyType === "datetime") {
    r.sort(sortByTime);
  } else if (keyType === "number") {
    r.sort(sortByNumberSeries);
  }

  return r;
}

function detectXType(series, noDatetime, options) {
  if (dataEmpty(series)) {
    if ((options.xmin || options.xmax) && (!options.xmin || isDate(options.xmin)) && (!options.xmax || isDate(options.xmax))) {
      return "datetime";
    } else {
      return "number";
    }
  } else if (detectXTypeWithFunction(series, isNumber)) {
    return "number";
  } else if (!noDatetime && detectXTypeWithFunction(series, isDate)) {
    return "datetime";
  } else {
    return "string";
  }
}

function detectXTypeWithFunction(series, func) {
  let i, j, data;
  for (i = 0; i < series.length; i++) {
    data = toArr(series[i].data);
    for (j = 0; j < data.length; j++) {
      if (!func(data[j][0])) {
        return false;
      }
    }
  }
  return true;
}

// creates a shallow copy of each element of the array
// elements are expected to be objects
function copySeries(series) {
  let newSeries = [], i, j;
  for (i = 0; i < series.length; i++) {
    let copy = {};
    for (j in series[i]) {
      if (series[i].hasOwnProperty(j)) {
        copy[j] = series[i][j];
      }
    }
    newSeries.push(copy);
  }
  return newSeries;
}

function processSeries(chart, keyType, noDatetime) {
  let i;

  let opts = chart.options;
  let series = chart.rawData;

  // see if one series or multiple
  chart.singleSeriesFormat = (!isArray(series) || typeof series[0] !== "object" || isArray(series[0]));
  if (chart.singleSeriesFormat) {
    series = [{name: opts.label, data: series}];
  }

  // convert to array
  // must come before dataEmpty check
  series = copySeries(series);
  for (i = 0; i < series.length; i++) {
    series[i].data = toArr(series[i].data);
  }

  chart.xtype = keyType ? keyType : (opts.discrete ? "string" : detectXType(series, noDatetime, opts));

  // right format
  for (i = 0; i < series.length; i++) {
    series[i].data = formatSeriesData(series[i].data, chart.xtype);
  }

  return series;
}

function processSimple(chart) {
  let perfectData = toArr(chart.rawData), i;
  for (i = 0; i < perfectData.length; i++) {
    perfectData[i] = [toStr(perfectData[i][0]), toFloat(perfectData[i][1])];
  }
  return perfectData;
}

function dataEmpty(data, chartType) {
  if (chartType === "PieChart" || chartType === "GeoChart" || chartType === "Timeline") {
    return data.length === 0;
  } else {
    for (let i = 0; i < data.length; i++) {
      if (data[i].data.length > 0) {
        return false;
      }
    }
    return true;
  }
}

export { dataEmpty, processSeries, processSimple };
