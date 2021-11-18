function isArray(variable) {
  return Object.prototype.toString.call(variable) === "[object Array]";
}

function isFunction(variable) {
  return variable instanceof Function;
}

function isPlainObject(variable) {
  // protect against prototype pollution, defense 2
  return Object.prototype.toString.call(variable) === "[object Object]" && !isFunction(variable) && variable instanceof Object;
}

// https://github.com/madrobby/zepto/blob/master/src/zepto.js
function extend(target, source) {
  let key;
  for (key in source) {
    // protect against prototype pollution, defense 1
    if (key === "__proto__") continue;

    if (isPlainObject(source[key]) || isArray(source[key])) {
      if (isPlainObject(source[key]) && !isPlainObject(target[key])) {
        target[key] = {};
      }
      if (isArray(source[key]) && !isArray(target[key])) {
        target[key] = [];
      }
      extend(target[key], source[key]);
    } else if (source[key] !== undefined) {
      target[key] = source[key];
    }
  }
}

function merge(obj1, obj2) {
  let target = {};
  extend(target, obj1);
  extend(target, obj2);
  return target;
}

let DATE_PATTERN = /^(\d\d\d\d)(-)?(\d\d)(-)?(\d\d)$/i;

function negativeValues(series) {
  let i, j, data;
  for (i = 0; i < series.length; i++) {
    data = series[i].data;
    for (j = 0; j < data.length; j++) {
      if (data[j][1] < 0) {
        return true;
      }
    }
  }
  return false;
}

function toStr(n) {
  return "" + n;
}

function toFloat(n) {
  return parseFloat(n);
}

function toDate(n) {
  let matches, year, month, day;
  if (typeof n !== "object") {
    if (typeof n === "number") {
      n = new Date(n * 1000); // ms
    } else {
      n = toStr(n);
      if ((matches = n.match(DATE_PATTERN))) {
        year = parseInt(matches[1], 10);
        month = parseInt(matches[3], 10) - 1;
        day = parseInt(matches[5], 10);
        return new Date(year, month, day);
      } else {
        // try our best to get the str into iso8601
        // TODO be smarter about this
        let str = n.replace(/ /, "T").replace(" ", "").replace("UTC", "Z");
        // Date.parse returns milliseconds if valid and NaN if invalid
        n = new Date(Date.parse(str) || n);
      }
    }
  }
  return n;
}

function toArr(n) {
  if (!isArray(n)) {
    let arr = [], i;
    for (i in n) {
      if (n.hasOwnProperty(i)) {
        arr.push([i, n[i]]);
      }
    }
    n = arr;
  }
  return n;
}

function jsOptionsFunc(defaultOptions, hideLegend, setTitle, setMin, setMax, setStacked, setXtitle, setYtitle) {
  return function (chart, opts, chartOptions) {
    let series = chart.data;
    let options = merge({}, defaultOptions);
    options = merge(options, chartOptions || {});

    if (chart.singleSeriesFormat || "legend" in opts) {
      hideLegend(options, opts.legend, chart.singleSeriesFormat);
    }

    if (opts.title) {
      setTitle(options, opts.title);
    }

    // min
    if ("min" in opts) {
      setMin(options, opts.min);
    } else if (!negativeValues(series)) {
      setMin(options, 0);
    }

    // max
    if (opts.max) {
      setMax(options, opts.max);
    }

    if ("stacked" in opts) {
      setStacked(options, opts.stacked);
    }

    if (opts.colors) {
      options.colors = opts.colors;
    }

    if (opts.xtitle) {
      setXtitle(options, opts.xtitle);
    }

    if (opts.ytitle) {
      setYtitle(options, opts.ytitle);
    }

    // merge library last
    options = merge(options, opts.library || {});

    return options;
  };
}

function sortByTime(a, b) {
  return a[0].getTime() - b[0].getTime();
}

function sortByNumberSeries(a, b) {
  return a[0] - b[0];
}

function sortByNumber(a, b) {
  return a - b;
}

function isMinute(d) {
  return d.getMilliseconds() === 0 && d.getSeconds() === 0;
}

function isHour(d) {
  return isMinute(d) && d.getMinutes() === 0;
}

function isDay(d) {
  return isHour(d) && d.getHours() === 0;
}

function isWeek(d, dayOfWeek) {
  return isDay(d) && d.getDay() === dayOfWeek;
}

function isMonth(d) {
  return isDay(d) && d.getDate() === 1;
}

function isYear(d) {
  return isMonth(d) && d.getMonth() === 0;
}

function isDate(obj) {
  return !isNaN(toDate(obj)) && toStr(obj).length >= 6;
}

function isNumber(obj) {
  return typeof obj === "number";
}

let byteSuffixes = ["bytes", "KB", "MB", "GB", "TB", "PB", "EB"];

function formatValue(pre, value, options, axis) {
  pre = pre || "";
  if (options.prefix) {
    if (value < 0) {
      value = value * -1;
      pre += "-";
    }
    pre += options.prefix;
  }

  let suffix = options.suffix || "";
  let precision = options.precision;
  let round = options.round;

  if (options.byteScale) {
    let suffixIdx;
    let baseValue = axis ? options.byteScale : value;

    if (baseValue >= 1152921504606846976) {
      value /= 1152921504606846976;
      suffixIdx = 6;
    } else if (baseValue >= 1125899906842624) {
      value /= 1125899906842624;
      suffixIdx = 5;
    } else if (baseValue >= 1099511627776) {
      value /= 1099511627776;
      suffixIdx = 4;
    } else if (baseValue >= 1073741824) {
      value /= 1073741824;
      suffixIdx = 3;
    } else if (baseValue >= 1048576) {
      value /= 1048576;
      suffixIdx = 2;
    } else if (baseValue >= 1024) {
      value /= 1024;
      suffixIdx = 1;
    } else {
      suffixIdx = 0;
    }

    // TODO handle manual precision case
    if (precision === undefined && round === undefined) {
      if (value >= 1023.5) {
        if (suffixIdx < byteSuffixes.length - 1) {
          value = 1.0;
          suffixIdx += 1;
        }
      }
      precision = value >= 1000 ? 4 : 3;
    }
    suffix = " " + byteSuffixes[suffixIdx];
  }

  if (precision !== undefined && round !== undefined) {
    throw Error("Use either round or precision, not both");
  }

  if (!axis) {
    if (precision !== undefined) {
      value = value.toPrecision(precision);
      if (!options.zeros) {
        value = parseFloat(value);
      }
    }

    if (round !== undefined) {
      if (round < 0) {
        let num = Math.pow(10, -1 * round);
        value = parseInt((1.0 * value / num).toFixed(0)) * num;
      } else {
        value = value.toFixed(round);
        if (!options.zeros) {
          value = parseFloat(value);
        }
      }
    }
  }

  if (options.thousands || options.decimal) {
    value = toStr(value);
    let parts = value.split(".");
    value = parts[0];
    if (options.thousands) {
      value = value.replace(/\B(?=(\d{3})+(?!\d))/g, options.thousands);
    }
    if (parts.length > 1) {
      value += (options.decimal || ".") + parts[1];
    }
  }

  return pre + value + suffix;
}

function seriesOption(chart, series, option) {
  if (option in series) {
    return series[option];
  } else if (option in chart.options) {
    return chart.options[option];
  }
  return null;
}

function convertToHighChartFormat(data) {
  let result = [];
  for(let i = 0 ; i < data.length; i++){
      let object = {};
      let xValues = [];
      let ydata = [];
      if(data[i]['type'] === 'column'){
        object['data'] = data[i]['data'];
        object['name'] = data[i]['name'];
        object['type'] = data[i]['type'];
      } else{
        for(let j = 0 ; j < data[i]['data'].length; j++){
          let yValues = {};
          xValues.push(data[i]['data'][j]['x']);
          yValues['y']= (data[i]['data'][j]['y']);
          yValues['color'] = (data[i]['data'][j]['color']);
          ydata.push(yValues);
          object['marker'] = { fillColor : "transparent", lineColor : data[i]['data'][j]['color']};
          object['xValues'] = xValues;
          object['data'] = ydata;
          object['name'] = data[i]['name'];
          object['type'] = data[i]['type'];
        }
      }
        result.push(object);
  }
  return result;
}

function formatChartjsData(data){
  let result = {};
  let object = {};
  let types =[];
  let cat = [];

  for( let i = 0; i < data.length; i++){
    let dataArray = [];
    cat = [];
    types.push(data[i]['type']);
    for(const key in data[i]['data']){
      dataArray.push(data[i]['data'][key]);
      cat.push(key);
    }
    object[i] = dataArray;
 }
 result['catagories'] = cat;
 result['data'] = object;
 result['types'] = types;
 return result;
}

export { formatValue, jsOptionsFunc, merge, isArray, isFunction, toStr, toFloat, toDate, toArr, sortByTime, sortByNumberSeries, sortByNumber, isMinute, isHour, isDay, isWeek, isMonth, isYear, isDate, isNumber, seriesOption, convertToHighChartFormat,formatChartjsData };
