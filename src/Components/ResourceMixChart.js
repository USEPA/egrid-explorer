import React, { Component } from "react";
import * as d3 from "d3";
import * as _ from "underscore";

class ResourceMixChart extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  componentDidMount() {
    let marginRight = 60, marginLeft = this.props.layer_type === "state" ? 130 : 60;
    let w = d3.select("#filter").node().clientWidth - marginLeft - marginRight,
      h = d3.select("#filter").node().clientHeight;
    let nbox = Object.keys(this.props.fuel_color_lookup).length + 1;
    let boxlen = w / nbox;
    let fuels = d3
      .select("#filter")
      .append("g")
      .attr("class", "fuels")
      .selectAll("g")
      .data(Object.keys(this.props.fuel_color_lookup))
      .enter()
      .append("g")
      .attr("class", "fuel")
      .attr("transform", (d, i) => "translate(" + (i + 1) * boxlen + ",0)");

    fuels
      .append("circle")
      .attr("r", Math.min(boxlen, h * 0.5) / 2)
      .attr("fill", (d) => this.props.fuel_color_lookup[d])
      .attr("cx", boxlen / 2)
      .attr("cy", Math.min(boxlen, h * 0.5) / 2);

    fuels
      .append("text")
      .attr("x", boxlen / 2)
      .attr("y", Math.min(boxlen, h * 0.5) * 1.5)
      .style("text-anchor", "middle")
      .text((d) => this.props.fuel_label_lookup[d]);

    d3.select("#filter")
      .insert("g", ".fuels")
      .append("g", "reset")
      .append("text")
      .attr("x", 0)
      .attr("y", Math.min(boxlen, h * 0.5) * 0.75)
      .text(this.filter_text)
      .style("text-anchor", "start")
      .style("font-weight", "bold")
      .style("font-size", "1.2em");
  }

  render() {
    let marginRight = 60, marginLeft = this.props.layer_type === "state" ? 130 : 60;

    let data = _.flatten(this.props.data),
      fuel = this.props.fuels,
      fuel_colors = Object.values(this.props.fuel_color_lookup),
      name = _.uniq(data.map((d) => d.name));

    let barFillScale = d3.scaleOrdinal().domain(fuel).range(fuel_colors);
    let barXScale = d3
      .scaleLinear()
      .domain([0, 100])
      .range([0, this.props.width - marginLeft - marginRight]);
    let barYScale = d3
      .scaleBand()
      .domain(name)
      .range([0, this.props.height])
      .paddingInner(0.1)
      .paddingOuter(0.2);
    let bars = data.map((d, i) => (
      <rect
        key={"bar" + i}
        x={barXScale(d.cumsum)}
        y={barYScale(d.name)}
        width={barXScale(d.value)}
        height={barYScale.bandwidth()}
        style={{ fill: barFillScale(d.type) }}
      ></rect>
    ));

    let title = (
      <p
        style={{
          fontSize: "1.2em",
          fontWeight: "bold",
          fill: "#000",
          className: "title",
          textAnchor: "middle",
        }}
      >
        {this.props.title}
      </p>
    );
    return (
      <div>
        {title}
        <svg width={"90%"} height={50} id="filter"></svg>
        <svg width={this.props.width} height={this.props.height}>
          <g transform={"translate(" + marginLeft + ",0)"}>
            {bars}
          </g>
          <g
            className={"axis axis_y"}
            transform={"translate(" + marginLeft + ",0)"}
            ref={(node) => d3.select(node).call(d3.axisLeft(barYScale))}
          ></g>
        </svg>
      </div>
    );
  }
}

export default ResourceMixChart;
