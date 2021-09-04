import { formatValue, jsOptionsFunc, merge, sortByNumber,formatChartjsData } from "../helpers";

let defaultOptions = {
  chart: { type: '',
            zoomType:''},
  xAxis: {
    title: {
      text: null
    },
    labels: {
      style: {
        fontSize: "12px"
      }
    }
  },
  yAxis: {
    title: {
      text: null
    },
    labels: {
      style: {
        fontSize: "12px"
      }
    }
  },
  title: {
    text: null
  },
  subtitle: {
    text: null
  },
  credits: {
    enabled: false
  },
  legend: {
    borderWidth: 0,
  },
  tooltip: {
    headerFormat: '',
    pointFormat: '',
    clusterFormat:'',
    style: {
      fontSize: "12px"
    }
  },
  plotOptions: {
    areaspline: {},
    area: {},
    series: {
      marker: {}
    }
  },
  time: {
    useUTC: false
  }
};

let gaugeOptions = {
  chart: {
      type: 'solidgauge'
  },

  title: null,

  pane: {
      center: ['50%', '85%'],
      size: '140%',
      startAngle: -90,
      endAngle: 90,
      background: {
          backgroundColor:'#EEE',
          innerRadius: '60%',
          outerRadius: '100%',
          shape: 'arc'
      }
  },

  exporting: {
      enabled: false
  },

  tooltip: {
      enabled: false
  },

  // the value axis
  yAxis: {
      stops: [
          [0.1, '#55BF3B'], // green
          [0.5, '#DDDF0D'], // yellow
          [0.9, '#DF5353'] // red
      ],
      lineWidth: 0,
      tickWidth: 0,
      minorTickInterval: null,
      tickAmount: 2,
      title: {
          y: -70
      },
      labels: {
          y: 16
      }
  },

  plotOptions: {
      solidgauge: {
          dataLabels: {
              y: 5,
              borderWidth: 0,
              useHTML: true
          }
      }
  }
};

let organizationOptions = {
  chart: { },

title: {
    text: ''
},
tooltip: {
  style: {
    fontSize: "12px"
  },
  outside: true
},
accessibility: {
    point: {
        descriptionFormatter: function (point) {
            let nodeName = point.toNode.name,
                nodeId = point.toNode.id,
                nodeDesc = nodeName === nodeId ? nodeName : nodeName + ', ' + nodeId,
                parentDesc = point.fromNode.id;
            return point.index + '. ' + nodeDesc + ', reports to ' + parentDesc + '.';
        }
    }
}
};


let sparkOptions = {
  chart: {
    backgroundColor: null,
    borderWidth: 0,
    type: 'area',
    margin: [2, 0, 2, 0],
    width: 120,
    height: 20,
    style: {
      overflow: 'visible'
    },
    skipClone: true
  },
  navigation: {
    buttonOptions: {
        enabled: false
    }
  },
  credits: {
    enabled: false
  },
  xAxis: {
    title: {
      text: null
    },
    labels: {
      style: {
        fontSize: "12px"
      }
    },
    startOnTick: false,
    endOnTick: false,
    tickPositions: []
  },
  yAxis: {
    endOnTick: false,
    startOnTick: false,

    title: {
      text: null
    },
    labels: {
      enabled: false
    },
    tickPositions: [0]
  },
  title: {
    text: null
  },
  credits: {
    enabled: false
  },
  legend: {
    enabled: false
  },
  tooltip: {
    style: {
      fontSize: "12px"
    },
    hideDelay: 0,
    outside: true,
    shared: true
  },
  plotOptions: {
    series: {
      animation: false,
      lineWidth: 1,
      shadow: false,
      states: {
            hover: {
                lineWidth: 1
            }
      },
      marker: {
        radius: 1,
        states: {
          hover: {
              radius: 2
          }
        }
      },
      fillOpacity: 0.25
    },
    column: {
      negativeColor: '#910000',
      borderColor: 'silver'
    }
  },
  time: {
    useUTC: false
  }
};


let radarOptions = {
  chart: {
    polar: true
  },
  pane: {
    startAngle: 0,
    endAngle: 360
  },
  xAxis: {
    tickInterval: 45,
    min: 0,
    max: 360,
    title: {
      text: null
    },
    labels: {
      style: {
        fontSize: "12px"
      }
    }
  },
  yAxis: {
    min: 0,
    title: {
      text: null
    },
    labels: {
      style: {
        fontSize: "12px"
      }
    }
  },
  title: {
    text: null
  },
  credits: {
    enabled: false
  },
  legend: {
    borderWidth: 0
  },
  tooltip: {
    style: {
      fontSize: "12px"
    }
  },
  plotOptions: {
      series: {
        pointStart: 0,
        pointInterval: 45,
        marker: {}
    },
    column: {
        pointPadding: 0,
        groupPadding: 0
    },
    areaspline: {},
    area: {}
  },
  time: {
    useUTC: false
  }
};

let hideLegend = function (options, legend, hideLegend) {
  if (legend !== undefined) {
    options.legend.enabled = !!legend;
    if (legend && legend !== true) {
      if (legend === "top" || legend === "bottom") {
        options.legend.verticalAlign = legend;
      } else {
        options.legend.layout = "vertical";
        options.legend.verticalAlign = "middle";
        options.legend.align = legend;
      }
    }
  } else if (hideLegend) {
    options.legend.enabled = false;
  }
};

let setTitle = function (options, title) {
  options.title.text = title;
};

let setMin = function (options, min) {
  options.yAxis.min = min;
};

let setMax = function (options, max) {
  options.yAxis.max = max;
};

let setStacked = function (options, stacked) {
  let stackedValue = stacked ? (stacked === true ? "normal" : stacked) : null;
  options.plotOptions.series.stacking = stackedValue;
  options.plotOptions.area.stacking = stackedValue;
  options.plotOptions.areaspline.stacking = stackedValue;
};

let setXtitle = function (options, title) {
  options.xAxis.title.text = title;
};

let setYtitle = function (options, title) {
  options.yAxis.title.text = title;
};

let jsOptions = jsOptionsFunc(defaultOptions, hideLegend, setTitle, setMin, setMax, setStacked, setXtitle, setYtitle);

let setFormatOptions = function(chart, options, chartType) {
  let formatOptions = {
    prefix: chart.options.prefix,
    suffix: chart.options.suffix,
    thousands: chart.options.thousands,
    decimal: chart.options.decimal,
    precision: chart.options.precision,
    round: chart.options.round,
    zeros: chart.options.zeros
  };

  if (chartType !== "pie" && !options.yAxis.labels.formatter) {
    options.yAxis.labels.formatter = function () {
      return formatValue("", this.value, formatOptions);
    };
  }

  if (!options.tooltip.pointFormatter && !options.tooltip.pointFormat) {
    options.tooltip.pointFormatter = function () {
      return '<span style="color:' + this.color + '">\u25CF</span> ' + formatValue(this.series.name + ': <b>', this.y, formatOptions) + '</b><br/>';
    };
  }
};

export default class {
  constructor(library) {
    this.name = "highcharts";
    this.library = library;
  }

  renderTimeChart(chart) {
    let options = merge(defaultOptions, {});

    options.chart.type = 'timeline';
    options.chart.inverted = chart.options.horizontal || true; 
    options.xAxis.visible = false;
    options.yAxis.visible = false;
    let series = [{
      dataLabels: {
          allowOverlap: false,
          distance: chart.options.distance || 150,
          format: '<span style="color:{point.color}">● </span><span style="font-weight: bold;" > ' +
              '{point.x:%d %b %Y}</span><br/>{point.label}'
      },
      marker: {
          symbol: 'circle'
      },
      data: chart.rawData.data
    }];

    this.drawChart(chart, series, options);
  }


  renderLineChart(chart, chartType) {
    chartType = chartType || "spline";
    let chartOptions = {};
    if (chartType === "areaspline") {
      chartOptions = {
        plotOptions: {
          areaspline: {
            stacking: "normal"
          },
          area: {
            stacking: "normal"
          },
          series: {
            marker: {
              enabled: false
            }
          }
        }
      };
    }

    if (chart.options.curve === false) {
      if (chartType === "areaspline") {
        chartType = "area";
      } else if (chartType === "spline") {
        chartType = "line";
      }
    }

    let options = jsOptions(chart, chart.options, chartOptions), data, i, j;
    options.xAxis.type = chart.xtype === "string" ? "category" : (chart.xtype === "number" ? "linear" : "datetime");
    if (!options.chart.type) {
      options.chart.type = chartType;
    }
    setFormatOptions(chart, options, chartType);

    let series = chart.data;
    for (i = 0; i < series.length; i++) {
      series[i].name = series[i].name || "Value";
      data = series[i].data;
      if (chart.xtype === "datetime") {
        for (j = 0; j < data.length; j++) {
          data[j][0] = data[j][0].getTime();
        }
      }
      series[i].marker = {symbol: "circle"};
      if (chart.options.points === false) {
        series[i].marker.enabled = false;
      }
    }
    this.drawChart(chart, series, options);
  }

  renderSunBurstChart(chart) {

    let options = merge(defaultOptions, {});
    let allowDrillToNode = true;

    if (chart.options.title) {
      options.title.text = chart.options.title;
    }

    if (chart.options.colors) {
      options.colors = chart.options.colors;
    }

    if (chart.options.subtitle) {
      options.subtitle.text = chart.options.subtitle;
    }

    if(chart.xtype == 'sunburst'){
      options.tooltip.pointFormat = '<b>{point.name}</b> : <b>{point.value}</b>';
    }

    if(chart.options.allowDrillToNode){
      allowDrillToNode = chart.options.allowDrillToNode;
    }

    let series = [{
      type: "sunburst",
      data: chart.rawData,
      allowDrillToNode: allowDrillToNode,
      cursor: 'pointer',
      dataLabels: {
          format: '{point.name}',
          filter: {
              property: 'innerArcLength',
              operator: '>',
              value: 16
          },
          rotationMode: 'circular'
      },
      levels: [{
          level: 1,
          levelIsConstant: false,
          dataLabels: {
              filter: {
                  property: 'outerArcLength',
                  operator: '>',
                  value: 64
              }
          }
      }, {
          level: 2,
          colorByPoint: true
        }, {
          level: 3,
          colorVariation: {
              key: 'brightness',
              to: -0.5
          }
      }, {
          level: 4,
          colorVariation: {
              key: 'brightness',
              to: 0.5
          }
      }]
    }];
    this.drawChart(chart, series, options);
  }
  

  renderSolidGaugeChart(chart) {
    let options = merge(gaugeOptions, {});

    options.yAxis.min = chart.options.min;
    options.yAxis.max = chart.options.max;

    if (chart.options.intervals){
      options.yAxis.stops = chart.options.intervals;
    }

    let series = [{
      name: chart.options.name || '',
      data: chart.rawData,
      dataLabels: {
          format:
              '<div style="text-align:center">' +
              '<span style="font-size:25px">{y}</span><br/>' +
              `<span style="font-size:12px;opacity:0.4">${chart.options.valueSuffix}</span>` +
              '</div>'
      },
      tooltip: {
          valueSuffix: chart.options.valueSuffix
      }
  }];
  
    this.drawChart(chart, series, options);
  }

  renderCompareBarChart(chart) {
    let options = merge(defaultOptions, {});
    
    options.chart.type = 'bar';
    options.yAxis.min = chart.options.y_min;
    options.xAxis.categories = chart.rawData.categories;
    options.plotOptions.series.groupPadding = chart.options.groupPadding;
    options.plotOptions.series.pointPadding = chart.options.pointPadding;
    options.yAxis.labels.overflow = 'justify';
    options.tooltip.useHTML= true,
    options.tooltip.formatter =function () {
      return 'Series: ' + this.series.name + 
          '</br>Value: '+ Math.abs(this.y);
    };

    options.yAxis.labels.formatter = function() {
          return Math.abs(this.value);
      };
  
    let series = chart.rawData.series_data;
    this.drawChart(chart, series, options);
  }



  renderBubbleChart2(chart) {
    let chartOptions = {};
    let options = jsOptions(chart, chart.options, chartOptions);

    options.chart.type= 'bubble';
    options.chart.zoomType='xy';
    options.tooltip.pointFormat = '<b> x={point.x}</b>, <b> y={point.y}</b>';
    options.tooltip.headerFormat='<b>{series.name}</b><br>';
    options.tooltip.clusterFormat= 'Clustered points: {point.clusterPointsAmount}';

    if(chart.options.X_title){
      options.xAxis.title.text = chart.options.X_title;
    }

    if(chart.options.Y_title){
      options.yAxis.title.text = chart.options.Y_title;
    }

    let series = [];
    for(let i = 0 ; i < chart.data.length; i++){

      let seriesObject = {
        name:'',
        color: '',
        data : []
      };
      seriesObject.name = chart.data[i]['name'] || `Series${i}`;
      seriesObject.color = chart.data[i]['color'] || 'grey';
      seriesObject.data = chart.rawData[i]['data'];
      series = [...series, seriesObject];
    }

    this.drawChart(chart, series, options);
  }

  renderBoxPlot(chart) {
    let options = merge(defaultOptions, {});
    options.chart.type = 'boxplot';

    if(chart.options.X_title){
      options.xAxis.title.text = chart.options.X_title;
    }

    if(chart.options.Y_title){
      options.yAxis.title.text = chart.options.Y_title;
    }

    if(chart.options.categories){
      options.xAxis.categories = chart.options.categories;
    }

    let pointInfo =  function () {
      return '<span style="color:' +
          this.series.color + '">\u25CF</span> <b> ' +
          this.series.name + '</b><br/>' +
          'Maximum: ' + (this.high) + '<br/>' +
          'Upper quartile: ' + (this.q3 ) + '<br/>' +
          'Median: ' + (this.median ) + '<br/>' +
          'Lower quartile: ' + (this.q1 ) + '<br/>' +
          'Minimum: ' + (this.low ) + '<br/>';
  };
    options.tooltip.headerFormat = '<em>{point.key}</em><br/>';
    options.tooltip.pointFormatter = pointInfo;

    let series = [{
      name: chart.options.name || "Series 1",
      data: chart.rawData
    }];

    this.drawChart(chart, series, options);
  }

  renderSentimentAnalysisChart(chart){
    let options = merge(defaultOptions, {});

    options.chart.type='bar';

    if(chart.options.categories){
      options.xAxis.categories = chart.options.categories;
    }

    let series = chart.rawData;
    options.plotOptions.series.stacking = 'normal';
    options.tooltip.formatter = function () {
      return '<b> Series:' + this.series.name + ',point: ' + this.point.category + '</b><br/>' +
          'Value: ' + this.point.y ;
  };
    this.drawChart(chart, series, options);

  }

  renderHeatChart(chart){
    let options = merge(defaultOptions, {});

    options.chart= {
      type: 'heatmap',
      marginTop: 40,
      marginBottom: 80,
      plotBorderWidth: 1
    };

    options.xAxis.categories = chart.options.X_title;
    options.xAxis.opposite=true;
    options.yAxis.categories = chart.options.Y_title;
    options.plotOptions.rowsize = 55;
    delete options.tooltip; 

    
    options.yAxis.labels.formatter = function () {
      if ('Monday' === this.value) {
         return '<span style="color: orange;">' + this.value + '</span>';
      } else {
          return this.value;
      }
    };
    
    let allBlackout = [];
    for(let i=0;i<chart.options.black_out.length;i++){
      let blackout =  {
        value: null,
        color: 'black',
        width: chart.options.width || 55,
        zIndex: 10
      };

      blackout.value = chart.options.black_out[i];
      allBlackout.push(blackout);
    }

    options.yAxis.plotLines= allBlackout;

    options.colorAxis = {
      min: 0,
      minColor: '#FFFFFF',
      maxColor: Highcharts.getOptions().colors[0]
    };

    options.legend = {
      align: 'right',
      layout: 'vertical',
      margin: 0,
      verticalAlign: 'top',
      y: 25,
      symbolHeight: 280
    };



    let series = [{
      name: chart.options.title,
      borderWidth: 1,
      data: chart.rawData,
      dataLabels: {
          enabled: true,
          color: '#000000'
      }
    }];

    this.drawChart(chart, series, options);

  }

  renderOrganizationChart(chart) {
    let options = merge(organizationOptions, {});
    
    options.chart.height = chart.options.height || 600;
    options.chart.inverted = chart.options.inverted || true;

    if(chart.options.title){
      options.title.text = chart.options.title;
    }

    let levels =[];
    if(chart.options.levels){
      for(let i = 0; i < chart.options.levels; i++){
        let level = {
          level: null,
          color: '',
          dataLabels: {
              color: ''
          },
          height: 25
        }; 
        if( i != chart.options.levels -1) {
        level.level = i;
        } else {
          level.level = i +1;
        }
        if(chart.options.colors){
        level.color = chart.options.colors[i];
        }
        if(chart.options.text_color){
        level.dataLabels.color = chart.options.text_color || '';
        }
        if(chart.options.height){
        level.height = chart.options.height[i];
        }
        levels.push(level);
      }
      
    let series = [{
      type: 'organization',
      name: chart.options.name || "Series",
      keys: ['from', 'to'],
      data: chart.rawData[0],
      levels: levels,
      nodes: chart.rawData[1],
      colorByPoint: false,
      color: '#007ad0',
      dataLabels: {
          color: 'white'
      },
      borderColor: 'white',
      nodeWidth: 65
    }];

    this.drawChart(chart, series, options);
  }
}




  renderScatterChart(chart) {
    let options = jsOptions(chart, chart.options, {});
    options.chart.type = "scatter";
    this.drawChart(chart, chart.data, options);
  }

  renderPieChart(chart) {
    let chartOptions = merge(defaultOptions, {});

    if (chart.options.colors) {
      chartOptions.colors = chart.options.colors;
    }
    if (chart.options.donut) {
      chartOptions.plotOptions = {pie: {innerSize: "50%"}};
    }

    if ("legend" in chart.options) {
      hideLegend(chartOptions, chart.options.legend);
    }

    if (chart.options.title) {
      setTitle(chartOptions, chart.options.title);
    }

    let options = merge(chartOptions, chart.options.library || {});
    setFormatOptions(chart, options, "pie");
    let series = [{
      type: "pie",
      name: chart.options.label || "Value",
      data: chart.data
    }];
    this.drawChart(chart, series, options);
  }

  renderFunnelChart(chart) {
    let chartOptions = merge(defaultOptions, {});

    if (chart.options.colors) {
      chartOptions.colors = chart.options.colors;
    }

    if ("legend" in chart.options) {
      hideLegend(chartOptions, chart.options.legend);
    }

    if (chart.options.title) {
      setTitle(chartOptions, chart.options.title);
    }

    let options = merge(chartOptions, chart.options.library || {});
    setFormatOptions(chart, options, "funnel");
    let series = [{
        type: "funnel",
        name: chart.options.label || "Value",
        data: chart.data
      }];

    this.drawChart(chart, series, options);
  }

  renderWordCloud(chart) {
    let chartOptions = merge(defaultOptions, {});

    if (chart.options.colors) {
      chartOptions.colors = chart.options.colors;
    }

    if ("legend" in chart.options) {
      hideLegend(chartOptions, chart.options.legend);
    }

    if (chart.options.title) {
      setTitle(chartOptions, chart.options.title);
    }

    let options = merge(chartOptions, chart.options.library || {});
    setFormatOptions(chart, options, "WordCloud");

    let series = [{
      type: "wordcloud",
      name: chart.options.label || "Occurrences",
      data: chart.data
    }];

    delete options.tooltip;
    this.drawChart(chart, series, options);
  }


  renderRadarChart(chart) {
    let chartOptions = merge(radarOptions, {});

    if (chart.options.colors) {
      chartOptions.colors = chart.options.colors;
    }

    if ("legend" in chart.options) {
      hideLegend(chartOptions, chart.options.legend);
    }

    if (chart.options.title) {
      setTitle(chartOptions, chart.options.title);
    }

    let options = merge(chartOptions, chart.options.library || {});
    setFormatOptions(chart, options, "RadarChart");

    let series = [{
        type: "column",
        name: chart.data[0].name || 'Column',
        data: chart.data[0].data,
        pointPlacement: 'between'
      },
      {
        type: "line",
        name: chart.data[1].name || 'Line',
        data: chart.data[1].data
      },
      {
        type: "area",
        name: chart.data[2].name || 'Area',
        data: chart.data[2].data
      }
    ];

    this.drawChart(chart, series, options);
  }

  renderPolarSpiderChart(chart, chartType) {
    chartType = chartType || "PolarSpiderChart";
    let chartOptions = {};
    chartOptions = {
      chart: {
          polar: true,
          type: 'line'
      },
      pane: {
          size: '80%'
      },
      xAxis: {
          categories: chart.options.xAxis.categories || [],
          tickmarkPlacement: 'on',
          lineWidth: 0
      },
      yAxis: {
          gridLineInterpolation: 'polygon',
          lineWidth: 0,
          min: 0
      }
    };

    let options = jsOptions(chart, chart.options, chartOptions), data, i;
    options.xAxis.type = chart.xtype === "string" ? "category" : (chart.xtype === "number" ? "linear" : "datetime");
    if (!options.chart.type) {
      options.chart.type = chartType;
    }
    setFormatOptions(chart, options, chartType);

    let series = chart.rawData;
    for (i = 0; i < series.length; i++) {
      series[i].name = series[i].name || "Value";
      data = series[i].data;
    }

    this.drawChart(chart, series, options);
  }

  renderSparklineChart(chart) {
    let chartOptions = merge(sparkOptions, {});

    let options = merge(chartOptions, chart.options.library || {});
    setFormatOptions(chart, options, "SparklineChart");
    let series = [{
      name: chart.options.label || "Value",
      data: chart.data[0].data
    }];
    this.drawChart(chart, series, options);
  }


  renderColumnChart(chart, chartType) {
    chartType = chartType || "column";
    let series = chart.data;
    let options = jsOptions(chart, chart.options), i, j, s, d, rows = [], categories = [];
    options.chart.type = chartType;
    setFormatOptions(chart, options, chartType);

    for (i = 0; i < series.length; i++) {
      s = series[i];

      for (j = 0; j < s.data.length; j++) {
        d = s.data[j];
        if (!rows[d[0]]) {
          rows[d[0]] = new Array(series.length);
          categories.push(d[0]);
        }
        rows[d[0]][i] = d[1];
      }
    }

    if (chart.xtype === "number") {
      categories.sort(sortByNumber);
    }

    options.xAxis.categories = categories;

    let newSeries = [], d2;
    for (i = 0; i < series.length; i++) {
      d = [];
      for (j = 0; j < categories.length; j++) {
        d.push(rows[categories[j]][i] || 0);
      }

      d2 = {
        name: series[i].name || "Value",
        data: d
      };
      if (series[i].stack) {
        d2.stack = series[i].stack;
      }

      newSeries.push(d2);
    }

    this.drawChart(chart, newSeries, options);
  }

  renderBarChart(chart) {
    this.renderColumnChart(chart, "bar");
  }

  renderAreaChart(chart) {
    this.renderLineChart(chart, "areaspline");
  }

  destroy(chart) {
    if (chart.chart) {
      chart.chart.destroy();
    }
  }

  drawChart(chart, data, options) {
    this.destroy(chart);
    if (chart.destroyed) return;

    options.chart.renderTo = chart.element.id;
    options.series = data;

    if (chart.options.code) {
      window.console.log("new Highcharts.Chart(" + JSON.stringify(options) + ");");
    }

    chart.chart = new this.library.Chart(options);
  }
}
