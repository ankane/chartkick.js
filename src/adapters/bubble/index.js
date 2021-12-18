let bubbleOptions = {
    chart: {
        type: 'bubble',
        plotBorderWidth: 1,
        zoomType: 'xy'
    },
    xAxis: {
    gridLineWidth: 1,
      title: {
        text: null
      },
      labels: {
        style: {
          fontSize: "12px"
        }
      },
      plotLines: [{
        color: 'black',
        dashStyle: 'dot',
        width: 2,
        value: 65,
        label: {
            rotation: 0,
            y: 15,
            style: {
                fontStyle: 'italic'
            },
            text: null
        },
        zIndex: 3
    }],
    accessibility: {
        rangeDescription: 'Range: 60 to 100 grams.'
    }
    },
    yAxis: {
      startOnTick: false,
      endOnTick: false,
      title: {
        text: null
      },
      labels: {
        style: {
          fontSize: "12px"
        }
      },
      maxPadding: 0.2,
      plotLines: [{
        color: 'black',
        dashStyle: 'dot',
        width: 2,
        value: 50,
        label: {
            align: 'right',
            style: {
                fontStyle: 'italic'
            },
            text: null,
            x: -10
        },
        zIndex: 3
    }],
    accessibility: {
        rangeDescription: 'Range: 0 to 160 grams.'
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
        series: {
            dataLabels: {
                enabled: true,
                format: '{point.name}'
            }
        }
    },
    time: {
      useUTC: false
    }
  };
  
  export {bubbleOptions};