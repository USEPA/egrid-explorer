import React, { Component } from "react";
import * as d3 from "d3";
import * as _ from "underscore";

class ResourceMixChart extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  componentDidMount() {
    let marginRight = 0,
      marginLeft = this.props.layer_type === "state" ? 130 : 60;
    let w = d3.select("#filter").node().clientWidth - marginLeft - marginRight,
      h = d3.select("#filter").node().clientHeight;
    let nbox = Object.keys(this.props.fuel_color_lookup).length + 1;
    let boxlen = w / nbox;
    let fuels = d3
      .select("#filter")
      .append("div")
      .attr("class", "fuels")
      .selectAll("div")
      .data(Object.keys(this.props.fuel_color_lookup))
      .enter()
      .append("div")
      .style("display", "inline-block")
      .attr("class", "fuel");

    let fuels_svg = fuels.append("svg").attr("width", boxlen).attr("height", h);

    fuels_svg
      .append("image")
      .attr("xlink:href", (d) => this.props.fuel_icon_lookup[d])
      .attr("x", boxlen / 2 - Math.min(boxlen, h * 0.5) / 2)
      .attr("y", 0)
      .attr("width", Math.min(boxlen, h * 0.5))
      .attr("height", Math.min(boxlen, h * 0.5));

    fuels_svg
      .filter((d) => this.props.fuel_icon_lookup[d] === "")
      .append("circle")
      .attr("r", Math.min(boxlen, h * 0.5) / 4)
      .attr("fill", (d) => this.props.fuel_color_lookup[d])
      .attr("cx", boxlen / 2)
      .attr("cy", Math.min(boxlen, h * 0.5) / 2);

    fuels_svg
      .append("text")
      .attr("x", boxlen / 2)
      .attr("y", Math.min(boxlen, h * 0.5) * 1.5)
      .style("text-anchor", "middle")
      .text((d) => this.props.fuel_label_lookup[d]);

    d3.select(".fuels")
      .insert("div", ".fuel")
      .style("display", "inline-block")
      .attr("class", "reset")
      .append("svg")
      .attr("width", boxlen)
      .attr("height", h)
      .append("text")
      .attr("x", 0)
      .attr("y", Math.min(boxlen, h * 0.5) * 0.75)
      .text(this.filter_text)
      .style("text-anchor", "start")
      .style("font-weight", "bold")
      .style("font-size", "1.2em");
  }

  render() {
    let marginRight = 0,
      marginLeft = this.props.layer_type === "state" ? 130 : 60;

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
        <div style={{ width: "90%", height: 80, margin: "0 auto"}} id="filter"></div>
        <svg width={this.props.width} height={this.props.height}>
          <g transform={"translate(" + marginLeft + ",0)"}>{bars}</g>
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
