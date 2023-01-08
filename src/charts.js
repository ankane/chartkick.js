import Chart from "./chart";
import { processSimple, processSeries } from "./data";
import { toDate } from "./helpers";

class LineChart extends Chart {
  __processData() {
    return processSeries(this);
  }

  __chartName() {
    return "LineChart";
  }
}

class PieChart extends Chart {
  __processData() {
    return processSimple(this);
  }

  __chartName() {
    return "PieChart";
  }
}

class ColumnChart extends Chart {
  __processData() {
    return processSeries(this, null, true);
  }

  __chartName() {
    return "ColumnChart";
  }
}

class BarChart extends Chart {
  __processData() {
    return processSeries(this, null, true);
  }

  __chartName() {
    return "BarChart";
  }
}

class AreaChart extends Chart {
  __processData() {
    return processSeries(this);
  }

  __chartName() {
    return "AreaChart";
  }
}

class GeoChart extends Chart {
  __processData() {
    return processSimple(this);
  }

  __chartName() {
    return "GeoChart";
  }
}

class ScatterChart extends Chart {
  __processData() {
    return processSeries(this, "number");
  }

  __chartName() {
    return "ScatterChart";
  }
}

class BubbleChart extends Chart {
  __processData() {
    return processSeries(this, "bubble");
  }

  __chartName() {
    return "BubbleChart";
  }
}

class Timeline extends Chart {
  __processData() {
    const data = this.rawData;
    for (let i = 0; i < data.length; i++) {
      data[i][1] = toDate(data[i][1]);
      data[i][2] = toDate(data[i][2]);
    }
    return data;
  }

  __chartName() {
    return "Timeline";
  }
}

export { LineChart, PieChart, ColumnChart, BarChart, AreaChart, GeoChart, ScatterChart, BubbleChart, Timeline };
