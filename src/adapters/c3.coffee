'use strict'

Chartkick = window.Chartkick
merge = Chartkick.utils.merge

Chartkick.adapters.push new ->
  @name = 'c3'

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
    chart.options.stacked = true if /^area/.test chartType
    columns = []
    groups = []
    x = ['x']
    x.push(item[0]) for item in chart.data[0].data
    columns.push(x)

    for series in chart.data
      data = [series.name]
      data.push(item[1]) for item in series.data
      columns.push(data)
      groups.push(data[0]) if chart.options.stacked

    c3.generate
      bindto: chart.element
      data:
        x: 'x'
        xFormat: '%Y-%m-%d %H:%M:%S %Z'
        columns: columns
        type: chartType
        groups: [groups]
      color:
        pattern: chart.options.colors
      axis:
        y:
          tick: {} # count: 5
          # min: 0
          padding:
            top: 0
            bottom: 0
        x:
          type: if chart.options.discrete then 'category' else 'timeseries'
          padding:
            left: 0
            right: 0
      legend:
        show: false
      grid:
        y:
          show: true

  @renderPieChart = (chart) ->
    chartOptions = {};
    chartOptions.colors = chart.options.colors if chart.options.colors
    options = merge(merge(defaultOptions, chartOptions), chart.options.library || {})

    c3.generate
      bindto: chart.element
      data:
        columns:  chart.data
        type:     'pie'
      color:
        pattern: chart.options.colors
      legend:
        position: 'right'

  @renderColumnChart = (chart, rotated = false) ->
    series = chart.data
    options = jsOptions(series, chart.options)
    options.chart.type = 'bar'
    options.chart.renderTo = chart.element.id
    groups = []

    columns = []
    for series in chart.data
      data = [series.name]
      data.push(item[1]) for item in series.data
      columns.push(data)
      groups.push(data[0]) if chart.options.stacked

    c3.generate
      bindto: chart.element
      data:
        columns: columns
        type: 'bar'
        groups: [groups]
      color:
        pattern: chart.options.colors
      bar:
        width:
          ratio: 0.5 # this makes bar width 50% of length between ticks
        # or
        # width: 100 # this makes bar width 100px
      axis:
        rotated: rotated
        y:
          tick: {} # count: 5
          min: 0
          padding:
            top: 0
            bottom: 0
      legend:
        show: false
      grid:
        y:
          show: true

  @renderAreaChart = (chart) =>
    @renderLineChart(chart, 'area-spline')

  @renderBarChart = (chart) =>
    @renderColumnChart(chart, true)

  @
