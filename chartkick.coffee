# Helpers
isArray = (variable)->
  return Object.prototype.toString.call(variable) == "[object Array]"

isPlainObject = (variable) ->
  return variable instanceof Object

# https://github.com/madrobby/zepto/blob/master/src/zepto.js
extend = (target, source) ->
  for key of source
    if (isPlainObject(source[key]) or isArray(source[key]))

      if (isPlainObject(source[key]) and !isPlainObject(target[key]))
        target[key] = {}
      if (isArray(source[key]) and !isArray(target[key]))
        target[key] = []

      extend(target[key], source[key]);

    else if (source[key] inst undefined)
      target[key] = source[key]

merge = (obj1, obj2) ->
  target = {}
  extend(target, obj1)
  extend(target, obj2)
  return target

# https://github.com/Do/iso8601.js
@ISO8601_PATTERN = /(\d\d\d\d)(\-)?(\d\d)(\-)?(\d\d)(T)?(\d\d)(:)?(\d\d)?(:)?(\d\d)?([\.,]\d+)?($|Z|([\+\-])(\d\d)(:)?(\d\d)?)/i
@DECIMAL_SEPARATOR = String(1.5).charAt(1)

parseISO8601 = (input) ->
  type = Object.prototype.toString.call(input)
  if (type == '[object Date]')
    return input
  if (type isnt '[object String]')
    return
  if (matches = input.match(@ISO8601_PATTERN))
    year = parseInt(matches[1], 10)
    month = parseInt(matches[3], 10) - 1
    day = parseInt(matches[5], 10)
    hour = parseInt(matches[7], 10)
    minutes = if matches[9] then parseInt(matches[9], 10) else 0
    seconds = if matches[11] then parseInt(matches[11], 10) else 0
    milliseconds = if matches[12] then parseFloat(@DECIMAL_SEPARATOR + matches[12].slice(1)) * 1000 else 0
    result = Date.UTC(year, month, day, hour, minutes, seconds, milliseconds)
    if (matches[13] and matches[14])
      offset = matches[15] * 60

      if (matches[17])
        offset += parseInt(matches[17], 10)

      offset *= if matches[14] == '-' then -1 else 1
      result -= offset * 60 * 1000

    return new Date(result)
# end iso8601.js

negativeValues = (series) ->
  for i in series
    data = series[i].data

    for j in data
      if (data[j][1] < 0)
        return true

  return false

jsOptionsFunc = (defaultOptions, hideLegend, setMin, setMax) ->
  return (series, opts) ->
    options = merge({}, defaultOptions);

    # hide legend
    # this is *not* an external option!
    if (opts.hideLegend)
      hideLegend(options)

    # min
    if ("min" of opts)
      setMin(options, opts.min)
    else if (!negativeValues(series))
      setMin(options, 0)

    # max
    if ("max" of opts)
      setMax(options, opts.max)

    # merge library last
    options = merge(options, opts.library or {})

    return options

# ChartKick = () ->
# only functions that need defined specific to charting library
# var renderLineChart, renderPieChart, renderColumnChart;

if ("Highcharts" of window)

  defaultOptions = 
    xAxis: 
      labels: 
        style: 
          fontSize: "12px"
    yAxis:
      title:
        text: null
      labels:
        style:
          fontSize: "12px"
    title:
      text: null
    credits:
      enabled: false
    legend:
      borderWidth: 0
    tooltip:
      style:
        fontSize: "12px"

  hideLegend = (options) ->
    options.legend.enabled = false

  setMin = (options, min) ->
    options.yAxis.min = min

  setMax = (options, max) ->
    options.yAxis.max = max

  jsOptions = HighChartLib.jsOptionsFunc(defaultOptions, hideLegend, setMin, setMax)

  renderLineChart = (element, series, opts) ->
    options = jsOptions(series, opts)
    options.xAxis.type = "datetime"
    options.chart = {type: "spline", renderTo: element.id}

    for i in series
      data = series[i].data
      for j in data
        data[j][0] = data[j][0].getTime()

      series[i].marker = {symbol: "circle"}
    options.series = series
    new Highcharts.Chart(options)

  renderPieChart = (element, series, opts) ->
    options = merge(defaultOptions, opts.library or {})
    options.chart = {renderTo: element.id}
    options.series = [
      type: "pie",
      name: "Value"
      data: series
    ]
    new Highcharts.Chart(options)

  renderColumnChart = (element, series, opts) ->
    options = jsOptions(series, opts)
    rows = []
    options.chart = {type: "column", renderTo: element.id}

    for i in series
      s = series[i]

      for j in data
        d = s.data[j]
        if (not rows[d[0]])
          rows[d[0]] = new Array(series.length)

        rows[d[0]][i] = d[1]

    categories = []
    for i of rows
      if (rows.hasOwnProperty(i))
        categories.push(i)

    options.xAxis.categories = categories

    newSeries = []
    for i in series
      d = []
      for j in categories
        d.push(rows[categories[j]][i])

      newSeries.push({
        name: series[i].name
        data: d
      })

    options.series = newSeries

    new Highcharts.Chart(options)

else if ("google" of window)   # Google charts
  # load from google
  loaded = false
  google.setOnLoadCallback = () ->
    loaded = true
  google.load("visualization", "1.0", {"packages": ["corechart"]})

  waitForLoaded = (callback) ->
    google.setOnLoadCallback(callback)  # always do this to prevent race conditions (watch out for other issues due to this)
    if (loaded)
      callback()

  # Set chart options
  defaultOptions =
    fontName: "'Lucida Grande', 'Lucida Sans Unicode', Verdana, Arial, Helvetica, sans-serif"
    pointSize: 6
    legend:
      textStyle:
        fontSize: 12
        color: "#444"
      alignment: "center"
      position: "right"
    curveType: "function"
    hAxis:
      textStyle:
        color: "#666"
        fontSize: 12
      gridlines:
        color: "transparent"
      baselineColor: "#ccc"
    vAxis:
      textStyle:
        color: "#666"
        fontSize: 12
      baselineColor: "#ccc"
      viewWindow: {}
    tooltip:
      textStyle:
        color: "#666"
        fontSize: 12

  hideLegend = (options) ->
    options.legend.position = "none"

  setMin = (options, min) ->
    options.vAxis.viewWindow.min = min

  setMax = (options, max) ->
    options.vAxis.viewWindow.max = max

  jsOptions = jsOptionsFunc(defaultOptions, hideLegend, setMin, setMax)

  # cant use object as key
  createDataTable = (series, columnType) ->
    data = new google.visualization.DataTable()
    data.addColumn(columnType, "")

    rows = []
    for i in series
      s = series[i]
      data.addColumn("number", s.name)

      for j in s.data
        d = s.data[j]
        key = if (columnType == "datetime") then d[0].getTime() else d[0]
        if (!rows[key])
          rows[key] = new Array(series.length)

        rows[key][i] = toFloat(d[1])

    rows2 = []
    for i of rows
      if (rows.hasOwnProperty(i))
        rows2.push([ if (columnType == "datetime") then new Date(toFloat(i)) else i].concat(rows[i]))

    if (columnType == "datetime")
      rows2.sort(sortByTime)

    data.addRows(rows2)

    return data

  renderLineChart = (element, series, opts) ->
    waitForLoaded = () ->
      options = jsOptions(series, opts)
      data = createDataTable(series, "datetime")
      chart = new google.visualization.LineChart(element)
      chart.draw(data, options)

  renderPieChart = (element, series, opts) ->
    waitForLoaded = () ->
      options = merge(defaultOptions, opts.library || {})
      options.chartArea = {
        top: "10%"
        height: "80%"
      }

      data = new google.visualization.DataTable()
      data.addColumn("string", "")
      data.addColumn("number", "Value")
      data.addRows(series)

      chart = new google.visualization.PieChart(element)
      chart.draw(data, options)

  renderColumnChart = (element, series, opts) ->
    waitForLoaded = () ->
      options = jsOptions(series, opts)
      data = createDataTable(series, "string")
      chart = new google.visualization.ColumnChart(element)
      chart.draw(data, options)

else  # no chart library installed
  renderLineChart = renderPieChart = renderColumnChart = () ->
    throw new Error("Please install Google Charts or Highcharts")

setText = (element, text) ->
  if (document.body.innerText)
    element.innerText = text
  else
    element.textContent = text

chartError = (element, message) ->
  setText(element, "Error Loading Chart: " + message)
  element.style.color = "#ff0000"

getJSON = (element, url, success) ->
  $.ajax
    dataType: "json"
    url: url
    success: success
    error: (jqXHR, textStatus, errorThrown) ->
      message = if (typeof errorThrown == "string") then errorThrown else errorThrown.message
      chartError(element, message)

errorCatcher = (element, data, opts, callback) ->
  try
    callback(element, data, opts)
  catch err
    chartError(element, err.message)
    throw err

fetchDataSource = (element, dataSource, opts, callback) ->
  if (typeof dataSource == "string")
    getJSON( element, dataSource, (data, textStatus, jqXHR) ->
      errorCatcher(element, data, opts, callback)
    )
  else
    errorCatcher(element, dataSource, opts, callback)

# type conversions

toStr = (n) ->
  return "" + n

toFloat = (n) ->
  return parseFloat(n)

toDate = (n) ->
  if (typeof n != "object")
    if (typeof n == "number")
      n = new Date(n * 1000)  # ms
    else   # str
      # try our best to get the str into iso8601
      # TODO be smarter about this
      str = n.replace(/\ /, "T").replace(" ", "").replace("UTC", "Z")
      n = parseISO8601(str) || new Date(n)

  return n

toArr = (n) ->
  if (!isArray(n))
    arr = []
    for i of n
      if (n.hasOwnProperty(i))
        arr.push([i, n[i]])

    n = arr

  return n

# process data

sortByTime = (a, b) ->
  return a[0].getTime() - b[0].getTime()

processSeries = (series, opts, time) ->

  # see if one series or multiple
  if (!isArray(series) || typeof series[0] != "object" || isArray(series[0]))
    series = [{name: "Value", data: series}]
    opts.hideLegend = true
  else
    opts.hideLegend = false

  # right format
  for obj in series
    data = toArr(obj.data)
    r = []
    for obj in data
      key = obj[0]
      key = if time then toDate(key) else toStr(key)
      r.push([key, toFloat(obj[1])])

    if (time)
      r.sort(sortByTime)

    obj.data = r

  return series

processLineData = (element, data, opts) ->
  renderLineChart(element, processSeries(data, opts, true), opts)

processColumnData = (element, data, opts) ->
  renderColumnChart(element, processSeries(data, opts, false), opts)

processPieData = (element, data, opts) ->
  perfectData = toArr(data)
  for obj in perfectData
    obj = [toStr(obj[0]), toFloat(obj[1])]

  renderPieChart(element, perfectData, opts)

setElement = (element, data, opts, callback) ->
  if (typeof element == "string")
    element = document.getElementById(element)

  fetchDataSource(element, data, opts || {}, callback)

# define classes

Chartkick = {
  LineChart: (element, dataSource, opts) ->
    setElement(element, dataSource, opts, processLineData)
  ColumnChart: (element, dataSource, opts) ->
    setElement(element, dataSource, opts, processColumnData)
  PieChart: (element, dataSource, opts) ->
    setElement(element, dataSource, opts, processPieData)
}

window.Chartkick = Chartkick
