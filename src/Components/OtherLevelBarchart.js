import React, { Component } from "react";
import * as d3 from "d3";
class OtherLevelBarchart extends Component {
  constructor(props) {
    super(props);
    this.barchart = React.createRef();
  }

  formatXaxis(d) {
    if (d >= 1000) {
      let num = d3.format(".2s")(d);
      let abbr = num.slice(-1);
      if (abbr === "G") {
        num = num.substring(0, num.length - 1) + "B";
      }
      let chars1 = num.slice(-3);
      let chars2 = chars1.substring(0, 2);
      if (chars2 === ".0") {
        num = num.slice(0, -3) + num.slice(-1);
        return num;
      }
      return num;
    } else if (d >= 1 && d < 10) {
      return d3.format(".2")(d);
    } else if (d < 1) {
      return d3.format(".3")(d);
    } else {
      return d3.format(".0f")(d);
    }
  }

  render() {
    // scale
    let marginTop = 30,
      marginLeft = 60;
    let barFillScale = d3.scaleThreshold().range(this.props.fill_colors),
      barXScale = d3
        .scaleLinear()
        .range([0, this.props.width - marginLeft * 2])
        .domain(d3.extent(this.props.data, (e) => e.value)),
      barYScale = d3
        .scaleBand()
        .range([0, this.props.height - marginTop * 2])
        .domain(this.props.data.map((d) => d.name))
        .paddingInner(0.1)
        .paddingOuter(0.2);

    // update scale domain
    let domainArr = this.props.data.map((e) => e.value).sort((a, b) => a - b);
    barFillScale.domain(
      d3
        .range(this.props.fill_colors.length - 1)
        .map((d) =>
          d3.quantile(domainArr, (d + 1) / this.props.fill_colors.length)
        )
    );

    // bars
    let bars = this.props.data.map((d, i) => (
      <rect
        key={d.name}
        x={0}
        y={barYScale(d.name)}
        width={barXScale(d.value)}
        height={barYScale.bandwidth()}
        style={{ fill: barFillScale(d.value) }}
      ></rect>
    ));

    return (
      <svg width={this.props.width} height={this.props.height}>
        <g
          className={"axis axis_x"}
          transform={"translate(" + marginLeft + "," + marginTop + ")"}
          ref={(node) =>
            d3
              .select(node)
              .call(d3.axisTop(barXScale).ticks(5).tickFormat(this.formatXaxis))
              .selectAll("text")
              .attr("transform", "rotate(-30)")
          }
        ></g>
        <text
          transform={
            "translate(" +
            (this.props.width - marginLeft + 5) +
            "," +
            marginTop +
            ")"
          }
          style={{
            fill: "#000",
            textAnchor: "start",
            stroke: "none",
            fontSize: "0.75em",
          }}
        >
          {this.props.unit}
        </text>
        <g
          className={"axis axis_y"}
          transform={"translate(" + marginLeft + "," + marginTop + ")"}
          ref={(node) => d3.select(node).call(d3.axisLeft(barYScale))}
        ></g>
        <g
          ref={this.barchart}
          transform={"translate(" + marginLeft + "," + marginTop + ")"}
        >
          {bars}
        </g>
      </svg>
    );
  }
}

export default OtherLevelBarchart;
