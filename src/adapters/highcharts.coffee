'use strict'
Chartkick = window.Chartkick
merge = Chartkick.utils.merge

Chartkick.adapters.push new ->
  @name = 'highcharts'

  defaultOptions =
    chart: {}
    xAxis:
      labels:
        style:
          fontSize: '12px'
    yAxis:
      title:
        text: null
      labels:
        style:
          fontSize: '12px'
    title:
      text: null
    credits:
      enabled: false
    legend:
      borderWidth: 0
    tooltip:
      style:
        fontSize: '12px'
    plotOptions:
      areaspline: {}
      series:
        marker: {}

  hideLegend = (options) ->
    options.legend.enabled = false

  setMin = (options, min) ->
    options.yAxis.min = min

  setMax = (options, max) ->
    options.yAxis.max = max

  setStacked = (options) ->
    options.plotOptions.series.stacking = 'normal'

  jsOptions = Chartkick.utils.jsOptionsFunc defaultOptions, hideLegend,
    setMin, setMax, setStacked

  @renderLineChart = (chart, chartType = 'spline') ->
    chartOptions = if chartType == 'areaspline'
      plotOptions:
        areaspline:
          stacking: 'normal'
        series:
          marker:
            enabled: false
    else
      {}
    options = jsOptions(chart.data, chart.options, chartOptions)
    options.xAxis.type = if chart.options.discrete then 'category' else 'datetime'
    options.chart.type = chartType
    options.chart.renderTo = chart.element.id

    for section in chart.data
      unless chart.options.discrete
        for item in section.data
          item[0] = item[0].getTime()
      section.marker = symbol: 'circle'
    options.series = chart.data
    new Highcharts.Chart(options)

  @renderPieChart = (chart) ->
    chartOptions = {}
    chartOptions.colors = chart.options.colors if chart.options.colors
    options = merge(merge(defaultOptions, chartOptions), chart.options.library || {})
    options.chart.renderTo = chart.element.id
    options.series = [
      type: 'pie',
      name: 'Value',
      data: chart.data
    ]
    new Highcharts.Chart(options)

  @renderColumnChart = (chart, chartType = 'column') ->
    series = chart.data
    options = jsOptions(series, chart.options)
    options.chart.type = chartType
    options.chart.renderTo = chart.element.id

    rows = []
    for s, i in series
      for d in s.data
        rows[d[0]] = new Array(series.length) unless rows[d[0]]
        rows[d[0]][i] = d[1]

    categories = (i for i of rows when rows.hasOwnProperty(i))
    options.xAxis.categories = categories

    options.series = for s, i in series
      name: s.name,
      data: for category in categories
        rows[category][i] || 0

    new Highcharts.Chart(options)

  @renderBarChart = (chart) =>
    @renderColumnChart(chart, 'bar')

  @renderAreaChart = (chart) =>
    @renderLineChart(chart, 'areaspline')

  @
