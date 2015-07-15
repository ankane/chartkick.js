'use strict'

Chartkick = window.Chartkick
merge = Chartkick.utils.merge

Chartkick.adapters.push new ->
  @name = 'google'

  loaded = {}
  callbacks = []

  runCallbacks = ->
    i = 0
    while i < callbacks.length
      cb = callbacks[i]
      if google.visualization &&
          (
            (cb.pack == 'corechart' && google.visualization.LineChart) ||
            (cb.pack == 'timeline' && google.visualization.Timeline)
          )
        cb.callback()
        callbacks.splice(i, 1)
      else
        i += 1

  waitForLoaded = (pack, callback) ->
    unless callback
      callback = pack
      pack = 'corechart'

    callbacks.push({pack, callback})

    if loaded[pack]
      runCallbacks()
    else
      loaded[pack] = true
      # https://groups.google.com/forum/#!topic/google-visualization-api/fMKJcyA2yyI
      loadOptions =
        packages: [pack],
        callback: runCallbacks
      loadOptions.language = config.language if Chartkick.config.language
      google.load('visualization', '1', loadOptions)

  # Set chart options
  defaultOptions =
    chartArea: {}
    fontName: "'Lucida Grande', 'Lucida Sans Unicode', Verdana, Arial, Helvetica, sans-serif"
    pointSize: 6
    legend:
      textStyle:
        fontSize: 12
        color: '#444'
      alignment: 'center'
      position: 'right'
    curveType: 'function'
    hAxis:
      textStyle:
        color: '#666'
        fontSize: 12
      gridlines:
        color: 'transparent'
      baselineColor: '#ccc'
      viewWindow: {}
    vAxis:
      textStyle:
        color: '#666'
        fontSize: 12
      baselineColor: '#ccc'
      viewWindow: {}
    tooltip:
      textStyle:
        color: '#666'
        fontSize: 12

  hideLegend = (options) ->
    options.legend.position = 'none'

  setMin = (options, min) ->
    options.vAxis.viewWindow.min = min

  setMax = (options, max) ->
    options.vAxis.viewWindow.max = max

  setBarMin = (options, min) ->
    options.hAxis.viewWindow.min = min

  setBarMax = (options, max) ->
    options.hAxis.viewWindow.max = max

  setStacked = (options) ->
    options.isStacked = true

  jsOptions = Chartkick.utils.jsOptionsFunc defaultOptions, hideLegend,
    setMin, setMax, setStacked

  # cant use object as key
  createDataTable = (series, columnType) ->
    data = new google.visualization.DataTable()
    data.addColumn(columnType, '')
    is_datetime = columnType == 'datetime'

    rows = []
    for s, i in series
      data.addColumn('number', s.name)
      for d in s.data
        key = if is_datetime then d[0].getTime() else d[0]
        rows[key] ||= new Array(series.length)
        rows[key][i] = parseFloat(d[1])

    rows2 = for i of rows when rows.hasOwnProperty(i)
      [if is_datetime then new Date(parseFloat(i)) else i].concat(rows[i])
    rows2.sort(Chartkick.utils.sortByTime) if (is_datetime)
    data.addRows(rows2)
    data

  resize = (callback) ->
    if window.attachEvent
      window.attachEvent('onresize', callback)
    else if window.addEventListener
      window.addEventListener('resize', callback, true)
    callback()

  @renderLineChart = (chart) ->
    waitForLoaded ->
      options = jsOptions(chart.data, chart.options)
      type = if chart.options.discrete then 'string' else 'datetime'
      data = createDataTable(chart.data, type)
      chart.chart = new google.visualization.LineChart(chart.element)
      resize -> chart.chart.draw(data, options)

  @renderPieChart = (chart) ->
    waitForLoaded ->
      chartOptions =
        chartArea:
          top: '10%'
          height: '80%'
      chartOptions.colors = chart.options.colors if chart.options.colors
      options = merge(merge(defaultOptions, chartOptions), chart.options.library || {})

      data = new google.visualization.DataTable()
      data.addColumn('string', '')
      data.addColumn('number', 'Value')
      data.addRows(chart.data)

      chart.chart = new google.visualization.PieChart(chart.element)
      resize -> chart.chart.draw(data, options)

  @renderColumnChart = (chart) ->
    waitForLoaded ->
      options = jsOptions(chart.data, chart.options)
      data = createDataTable(chart.data, 'string')
      chart.chart = new google.visualization.ColumnChart(chart.element)
      resize -> chart.chart.draw(data, options)

  @renderBarChart = (chart) ->
    waitForLoaded ->
      chartOptions =
        hAxis:
          gridlines:
            color: '#ccc'
      options = Chartkick.utils.jsOptionsFunc(
        defaultOptions, hideLegend, setBarMin, setBarMax, setStacked
      )(chart.data, chart.options, chartOptions)
      data = createDataTable(chart.data, 'string')
      chart.chart = new google.visualization.BarChart(chart.element)
      resize -> chart.chart.draw(data, options)

  @renderAreaChart = (chart) ->
    waitForLoaded ->
      chartOptions =
        isStacked: true
        pointSize: 0
        areaOpacity: 0.5
      options = jsOptions(chart.data, chart.options, chartOptions)
      type = if chart.options.discrete then 'string' else 'datetime'
      data = createDataTable(chart.data, type)
      chart.chart = new google.visualization.AreaChart(chart.element)
      resize -> chart.chart.draw(data, options)

  @renderGeoChart = (chart) ->
    waitForLoaded ->
      chartOptions =
        legend: 'none'
        colorAxis:
          colors: chart.options.colors || ['#f6c7b6', '#ce502d']
      options = merge(merge(defaultOptions, chartOptions), chart.options.library || {})

      data = new google.visualization.DataTable()
      data.addColumn('string', '')
      data.addColumn('number', 'Value')
      data.addRows(chart.data)

      chart.chart = new google.visualization.GeoChart(chart.element)
      resize -> chart.chart.draw(data, options)

  @renderTimeline = (chart) ->
    waitForLoaded 'timeline', ->
      chartOptions =
        legend: 'none'

      chartOptions.colorAxis.colors = chart.options.colors if chart.options.colors
      options = merge(merge(defaultOptions, chartOptions), chart.options.library || {})

      data = new google.visualization.DataTable()
      data.addColumn({type: 'string', id: 'Name'})
      data.addColumn({type: 'date', id: 'Start'})
      data.addColumn({type: 'date', id: 'End'})
      data.addRows(chart.data)

      chart.chart = new google.visualization.Timeline(chart.element)
      resize -> chart.chart.draw(data, options)

  @
