import React, { Component} from "react";
import * as d3 from "d3";
import * as d3_legend from "d3-svg-legend";

class OtherLevelMapLegend extends Component {
  constructor(props) {
    super(props);
    this.legend = React.createRef();
  }

  formatLegendLabel(t) {
    if (t >= 1000) {
      let num = d3.format(".2s")(t);
      let abbr = num.slice(-1);
      if (abbr === "G") {
        num = num.substring(0, num.length - 1) + "B";
      }
      return num;
    } else {
      return d3.format(".3")(t);
    }
  }
  render() {
    const map_fill = this.props.map_fill;
    let fill_scale = d3.scaleThreshold().range(map_fill);
    let domainArr = this.props.data.map((e) => e.value).sort((a, b) => a - b);
    fill_scale.domain(
      d3
        .range(map_fill.length - 1)
        .map((d) => d3.quantile(domainArr, (d + 1) / map_fill.length))
    );

    let legend = d3_legend
      .legendColor()
      .scale(fill_scale)
      .shape("rect")
      .shapeWidth(90)
      .shapeHeight(10)
      .shapePadding(0)
      .labelOffset(10)
      .orient("horizontal")
      .scale(fill_scale)
      .labelFormat(d3.format(".3f"))
      .labelAlign("start")
      .labels((d) => {
        if (d.i === 0) {
          return 0;
        } else {
          let label_str = d.generatedLabels[d.i - 1].split(" ");
          return label_str[label_str.length - 1];
        }
      });

    return (
      <svg width={this.props.width} height={this.props.height}>
        <g
          ref={(node) =>
            d3
              .select(node)
              .call(legend)
              .selectAll("text")
              .text(this.formatLegendLabel)
          }
        ></g>
      </svg>
    );
  }
}

export default OtherLevelMapLegend;
