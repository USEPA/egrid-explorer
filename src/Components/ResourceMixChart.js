import React, { Component } from "react";
import * as d3 from "d3";
import * as _ from "underscore";

class ResourceMixChart extends Component {
  render() {
    let data = _.flatten(this.props.data),
      fuel = this.props.fuels,
      fuel_colors = Object.values(this.props.fuel_color_lookup),
      name = _.uniq(data.map((d) => d.name));

    let barFillScale = d3.scaleOrdinal().domain(fuel).range(fuel_colors);
    let barXScale = d3
      .scaleLinear()
      .domain([0, 100])
      .range([0, this.props.width]);
    let barYScale = d3
      .scaleBand()
      .domain(name)
      .range([0, this.props.height])
      .paddingInner(0.1)
      .paddingOuter(0.2);
    let bars = data.map((d) => (
      <rect
        key={d.name.toString() + "_" + d.type}
        x={barXScale(d.cumsum)}
        y={barYScale(d.name)}
        width={barXScale(d.value)}
        height={barYScale.bandwidth()}
        style={{ fill: barFillScale(d.type) }}
      ></rect>
    ));

    return (
      <svg width={this.props.width} height={this.props.height}>
        {bars}
      </svg>
    );
  }
}

export default ResourceMixChart;
