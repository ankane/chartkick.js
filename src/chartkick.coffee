# Chartkick.js
# Create beautiful Javascript charts with minimal code
# https://github.com/ankane/chartkick.js
# v1.3.0
# MIT License

'use strict'

# helpers
isArray = (variable) ->
  Object.prototype.toString.call(variable) == '[object Array]'

isFunction = (variable) ->
  variable instanceof Function

isPlainObject = (variable) ->
  !isFunction(variable) && variable instanceof Object

# https://github.com/madrobby/zepto/blob/master/src/zepto.js
extend = (target, source) ->
  for key, item of source
    if isPlainObject(item) || isArray(item)
      if isPlainObject(item) && !isPlainObject(target[key])
        target[key] = {}
      if isArray(item) && !isArray(target[key])
        target[key] = []
      extend(target[key], item)
    else if item != undefined
      target[key] = item
  target

merge = (obj1, obj2) ->
  extend extend({}, obj1), obj2

# https://github.com/Do/iso8601.js
ISO8601_PATTERN = ///
  (\d\d\d\d)(\-)?(\d\d)(\-)?(\d\d)(T)?
  (\d\d)(:)?(\d\d)?(:)?(\d\d)?([\.,]\d+)?($|Z|([\+\-])(\d\d)(:)?(\d\d)?)
///i
DECIMAL_SEPARATOR = String(1.5).charAt(1)

parseISO8601 = (input) ->
  type = Object.prototype.toString.call(input);
  return input if type == '[object Date]'
  return if type != '[object String]'
  return unless matches = input.match(ISO8601_PATTERN)
  year = parseInt(matches[1], 10)
  month = parseInt(matches[3], 10) - 1
  day = parseInt(matches[5], 10)
  hour = parseInt(matches[7], 10)
  minutes = if matches[9] then parseInt(matches[9], 10) else 0
  seconds = if matches[11] then parseInt(matches[11], 10) else 0
  milliseconds = if matches[12]
    parseFloat(DECIMAL_SEPARATOR + matches[12].slice(1)) * 1000
  else
    0
  result = Date.UTC(year, month, day, hour, minutes, seconds, milliseconds)
  if matches[13] && matches[14]
    offset = matches[15] * 60
    offset += parseInt(matches[17], 10) if matches[17]
    offset *= matches[14] == '-' ? -1 : 1
    result -= offset * 60 * 1000
  new Date(result)

negativeValues = (series) ->
  for section in series
    for item in section.data
      return true if item[1] < 0
  false

setText = (element, text) ->
  if document.body.innerText
    element.innerText = text
  else
    element.textContent = text

chartError = (element, message) ->
  setText(element, "Error Loading Chart: #{message}")
  element.style.color = '#ff0000'

getJSON = (element, url, success) ->
  $ = window.jQuery || window.Zepto || window.$
  $.ajax
    dataType: 'json'
    url: url
    success: success
    error: (jqXHR, textStatus, errorThrown) ->
      message = if typeof errorThrown == 'string'
        errorThrown
      else
        errorThrown.message
      chartError(element, message)

errorCatcher = (chart, callback) ->
  try
    callback(chart)
  catch err
    chartError(chart.element, err.message)
    throw err

fetchDataSource = (chart, callback) ->
  if typeof chart.dataSource == 'string'
    getJSON chart.element, chart.dataSource, (data, textStatus, jqXHR) ->
      chart.data = data
      callback(chart)
  else
    chart.data = chart.dataSource
    callback(chart)

# type conversions

toDate = (n) ->
  return n if typeof n == 'object'
  if typeof n == 'number'
    new Date(n * 1000); # ms
  else # str
    # try our best to get the str into iso8601
    # TODO be smarter about this
    str = n.replace(/\ /, 'T').replace(' ', '').replace('UTC', 'Z')
    parseISO8601(str) || new Date(n);

toArr = (n) ->
  return n if isArray(n)
  [k, v] for k, v of n when n.hasOwnProperty(k)

sortByTime = (a, b) ->
  a[0].getTime() - b[0].getTime()

# TODO remove chartType if cross-browser way
# to get the name of the chart class
renderChart = (chartType, chart) ->
  fn_name = "render#{chartType}"
  adapter_name = chart.options.adapter

  for adapter in Chartkick.adapters
    if (!adapter_name || adapter_name == adapter.name) && isFunction(adapter[fn_name])
      return adapter[fn_name](chart)

  throw new Error('No adapter found')

# process data

processSeries = (series, opts, time) ->
  # see if one series or multiple
  if !isArray(series) || typeof series[0] != 'object' || isArray(series[0])
    series = [{name: 'Value', data: series}]
    opts.hideLegend = true
  else
    opts.hideLegend = false
  time = false if opts.discrete

  # right format
  for section in series
    section.data = for item in toArr(section.data)
      key = if time then toDate(item[0]) else "#{item[0]}"
      [key, parseFloat(item[1])]
    section.data.sort(sortByTime) if time

  series

processSimple = (data) ->
  for item in toArr(data)
    item = ["#{item[0]}", parseFloat(item[1])]
  data

processTime = (data) ->
  for item in data
    item[1] = toDate(item[1])
    item[2] = toDate(item[2])
  data

setElement = (chart, element, dataSource, opts, callback) ->
  element = document.getElementById(element) if typeof element == 'string'
  chart.element = element
  chart.options = opts || {}
  chart.dataSource = dataSource
  Chartkick.charts[element.id] = chart
  fetchDataSource chart, callback#(x) -> errorCatcher x, callback

Chartkick =
  adapters: []
  config: window.Chartkick || {}
  charts: {}

  LineChart: (element, dataSource, opts) ->
    setElement this, element, dataSource, opts, (chart) ->
      chart.data = processSeries(chart.data, chart.options, true)
      renderChart('LineChart', chart)
  PieChart: (element, dataSource, opts) ->
    setElement this, element, dataSource, opts, (chart) ->
      chart.data = processSimple(chart.data)
      renderChart('PieChart', chart)
  ColumnChart: (element, dataSource, opts) ->
    setElement this, element, dataSource, opts, (chart) ->
      chart.data = processSeries(chart.data, chart.options, false)
      renderChart('ColumnChart', chart)
  BarChart: (element, dataSource, opts) ->
    setElement this, element, dataSource, opts, (chart) ->
      chart.data = processSeries(chart.data, chart.options, false)
      renderChart('BarChart', chart)
  AreaChart: (element, dataSource, opts) ->
    setElement this, element, dataSource, opts, (chart) ->
      chart.data = processSeries(chart.data, chart.options, true)
      renderChart('AreaChart', chart)
  GeoChart: (element, dataSource, opts) ->
    setElement this, element, dataSource, opts, (chart) ->
      chart.data = processSimple(chart.data)
      renderChart('GeoChart', chart)
  Timeline: (element, dataSource, opts) ->
    setElement this, element, dataSource, opts, (chart) ->
      chart.data = processTime(chart.data)
      renderChart('Timeline', chart)
  utils:
    merge: merge
    sortByTime: sortByTime
    jsOptionsFunc: (defaultOptions, hideLegend, setMin, setMax, setStacked) ->
      (series, opts, chartOptions) ->
        options = merge(defaultOptions, chartOptions || {})
        # hide legend
        # this is *not* an external option!
        hideLegend(options) if (opts.hideLegend)
        # min
        if 'min' of opts
          setMin(options, opts.min)
        else
          setMin(options, 0) if !negativeValues(series)
        # max
        setMax(options, opts.max) if 'max' of opts
        setStacked(options) if opts.stacked
        options.colors = opts.colors if opts.colors
        # merge library last
        if opts.library then merge(options, opts.library) else options

window.Chartkick = Chartkick
