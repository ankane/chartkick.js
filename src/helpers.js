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
  for (const key in source) {
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
  const target = {};
  extend(target, obj1);
  extend(target, obj2);
  return target;
}

const DATE_PATTERN = /^(\d\d\d\d)(?:-)?(\d\d)(?:-)?(\d\d)$/i;

function negativeValues(series) {
  for (let i = 0; i < series.length; i++) {
    const data = series[i].data;
    for (let j = 0; j < data.length; j++) {
      if (data[j][1] < 0) {
        return true;
      }
    }
  }
  return false;
}

function toStr(obj) {
  return "" + obj;
}

function toFloat(obj) {
  return parseFloat(obj);
}

function toDate(obj) {
  if (obj instanceof Date) {
    return obj;
  } else if (typeof obj === "number") {
    return new Date(obj * 1000); // ms
  } else {
    const s = toStr(obj);
    const matches = s.match(DATE_PATTERN);
    if (matches) {
      const year = parseInt(matches[1], 10);
      const month = parseInt(matches[2], 10) - 1;
      const day = parseInt(matches[3], 10);
      return new Date(year, month, day);
    } else {
      // try our best to get the str into iso8601
      // TODO be smarter about this
      const str = s.replace(/ /, "T").replace(" ", "").replace("UTC", "Z");
      // Date.parse returns milliseconds if valid and NaN if invalid
      return new Date(Date.parse(str) || s);
    }
  }
}

function toArr(obj) {
  if (isArray(obj)) {
    return obj;
  } else {
    const arr = [];
    for (const i in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, i)) {
        arr.push([i, obj[i]]);
      }
    }
    return arr;
  }
}

function jsOptionsFunc(defaultOptions, hideLegend, setTitle, setMin, setMax, setStacked, setXtitle, setYtitle) {
  return function (chart, opts, chartOptions) {
    const series = chart.data;
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

// needed since sort() without arguments does string comparison
function sortByNumber(a, b) {
  return a - b;
}

function every(values, fn) {
  for (let i = 0; i < values.length; i++) {
    if (!fn(values[i])) {
      return false;
    }
  }
  return true;
}

function isDay(timeUnit) {
  return timeUnit === "day" || timeUnit === "week" || timeUnit === "month" || timeUnit === "year";
}

function calculateTimeUnit(values, maxDay = false) {
  if (values.length === 0) {
    return null;
  }

  const minute = every(values, (d) => d.getMilliseconds() === 0 && d.getSeconds() === 0);
  if (!minute) {
    return null;
  }

  const hour = every(values, (d) => d.getMinutes() === 0);
  if (!hour) {
    return "minute";
  }

  const day = every(values, (d) => d.getHours() === 0);
  if (!day) {
    return "hour";
  }

  if (maxDay) {
    return "day";
  }

  const dayOfWeek = values[0].getDay();
  const week = every(values, (d) => d.getDay() === dayOfWeek);
  if (!week) {
    return "day";
  }

  const month = every(values, (d) => d.getDate() === 1);
  if (!month) {
    return "week";
  }

  const year = every(values, (d) => d.getMonth() === 0);
  if (!year) {
    return "month";
  }

  return "year";
}

function isDate(obj) {
  return !isNaN(toDate(obj)) && toStr(obj).length >= 6;
}

function isNumber(obj) {
  return typeof obj === "number";
}

const byteSuffixes = ["bytes", "KB", "MB", "GB", "TB", "PB", "EB"];

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
  const round = options.round;

  if (options.byteScale) {
    const positive = value >= 0;
    if (!positive) {
      value *= -1;
    }

    const baseValue = axis ? options.byteScale : value;

    let suffixIdx;
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

    // flip value back
    if (!positive) {
      value *= -1;
    }
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
        const num = Math.pow(10, -1 * round);
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
    const parts = value.split(".");
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

export { formatValue, jsOptionsFunc, merge, isArray, isFunction, isPlainObject, toStr, toFloat, toDate, toArr, sortByTime, sortByNumberSeries, sortByNumber, isDay, calculateTimeUnit, isDate, isNumber, seriesOption };
