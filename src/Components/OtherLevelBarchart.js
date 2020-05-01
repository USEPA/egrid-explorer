import React, { Component } from "react";
import ToggleButtonGroup from "react-bootstrap/ToggleButtonGroup";
import ToggleButton from "react-bootstrap/ToggleButton";

import * as d3 from "d3";
class OtherLevelBarchart extends Component {
  constructor(props) {
    super(props);
    this.barchart = React.createRef();
    this.axis_x = React.createRef();
    this.axis_y = React.createRef();
    this.axis_x_title = React.createRef();
    this.state = {
      sort_by: "alphabet",
    };
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

  formatNumber(d) {
    if (d < 1) {
      return d3.format(".3f")(d);
    } else if (d >= 1000000) {
      return d3.format(",.0f")(d);
    } else {
      return isNaN(d) ? "" : d3.format(",.2f")(Math.floor(d * 100) / 100);
    }
  }

  formatLabel(d) {
    if (d >= 1000000) {
      var num = d3.format(".2s")(d);
      var abbr = num.slice(-1);
      if (abbr === "G") {
        num = num.substring(0, num.length - 1) + "B";
      }
      var chars1 = num.slice(-3);
      var chars2 = chars1.substring(0, 2);
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
      return isNaN(d) ? "" : d3.format(",.0f")(d);
    }
  }

  initView(by) {
    // scale
    let marginTop = 40,
      marginBottom = 0,
      marginRight = 60,
      marginLeft = this.props.layer_type === "state" ? 130 : 60;
    let barFillScale = d3.scaleThreshold().range(this.props.mapfill),
      barXScale = d3
        .scaleLinear()
        .range([0, this.props.width - marginLeft - marginRight])
        .domain(d3.extent(this.props.data, (e) => e.value)),
      barYScale = d3
        .scaleBand()
        .range([0, this.props.height - marginTop - marginBottom])
        .domain(this.props.data.map((d) => d.name))
        .paddingInner(0.1)
        .paddingOuter(0.2);

    // update scale domain
    let domainArr = this.props.data.map((e) => e.value).sort((a, b) => a - b);
    barFillScale.domain(
      d3
        .range(this.props.mapfill.length - 1)
        .map((d) => d3.quantile(domainArr, (d + 1) / this.props.mapfill.length))
    );

    // bars
    d3.select(this.barchart.current).selectAll("g").remove();
    let bars = d3
      .select(this.barchart.current)
      .attr("transform", "translate(" + marginLeft + "," + marginTop + ")")
      .append("g")
      .selectAll("g")
      .data(this.props.data)
      .enter()
      .append("g")
      .attr("class", "bars")
      .attr("transform", (d) => "translate(0," + barYScale(d.name) + ")");

    bars
      .append("rect")
      .attr("x", 0)
      .attr("y", 0)
      .attr("width", (d) => barXScale(d.value))
      .attr("height", barYScale.bandwidth())
      .style("fill", (d) => barFillScale(d.value));

    bars
      .append("text")
      .attr("class", "labels")
      .attr("x", (d) => barXScale(d.value))
      .attr("y", 0)
      .attr("dx", 5)
      .attr("dy", barYScale.bandwidth() / 2 + 5)
      .text((d) => this.formatLabel(d.value))
      .style("fill", "#000")
      .style("stroke", "none");

    // axis
    d3.select(this.axis_x.current).selectAll("g").remove();
    d3.select(this.axis_x.current)
      .attr("class", "axis_x")
      .attr("transform", "translate(" + marginLeft + "," + marginTop + ")")
      .call(d3.axisTop(barXScale).ticks(5).tickFormat(this.formatXaxis))
      .selectAll("text")
      .attr("transform", "rotate(-30)");

    d3.select(this.axis_x_title.current)
      .attr(
        "transform",
        "translate(" +
          (this.props.width - marginRight + 5) +
          "," +
          marginTop +
          ")"
      )
      .style("fill", "#000")
      .style("text-anchor", "start")
      .style("stroke", "none")
      .style("font-size", "0.75em")
      .text(this.props.unit);

    d3.select(this.axis_y.current).selectAll("g").remove();
    d3.select(this.axis_y.current)
      .attr("transform", "translate(" + marginLeft + "," + marginTop + ")")
      .attr("class", "axis_y")
      .call(d3.axisLeft(barYScale));
    
    this.updateView(by);
  }

  updateView(by) {
    let marginTop = 40,
      marginBottom = 0;
    let barYScale = d3
      .scaleBand()
      .range([0, this.props.height - marginTop - marginBottom])
      .domain(
        this.props.data
          .sort((a, b) =>
            by === "amount"
              ? d3.descending(a.value, b.value)
              : d3.ascending(a.name, b.name)
          )
          .map((d) => d.name)
      )
      .paddingInner(0.1)
      .paddingOuter(0.2);

    d3.select(this.barchart.current)
      .selectAll(".bars")
      .transition()
      .attr("transform", (d) => "translate(0," + barYScale(d.name) + ")");

    d3.select(this.axis_y.current).call(d3.axisLeft(barYScale));
  }

  componentDidMount() {
    this.initView(this.state.sort_by);
  }

  componentDidUpdate(prevProps, prevState) {
    if (this.props.field !== prevProps.field) {
      this.initView(this.state.sort_by);
    } else {
      if (this.state.sort_by !== prevState.sort_by) {
        this.updateView(this.state.sort_by);
      }
    }
  }

  render() {
    // title
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
        {"US: " +
          this.formatNumber(this.props.us_data[0][this.props.field]) +
          "(" +
          this.props.unit +
          ")"}
      </p>
    );

    return (
      <div>
        {title}
        <ToggleButtonGroup
          type="radio"
          name="options"
          defaultValue={this.state.sort_by}
          onChange={(val) => this.setState({ sort_by: val })}
        >
          <ToggleButton value={"alphabet"}>Sort Alphabetically</ToggleButton>
          <ToggleButton value={"amount"}>Sort by Amount</ToggleButton>
        </ToggleButtonGroup>
        <svg width={this.props.width} height={this.props.height}>
          <g className={"axis"}>
            <g ref={this.axis_x}></g>
            <text ref={this.axis_x_title}></text>
            <g ref={this.axis_y}></g>
          </g>

          <g ref={this.barchart}></g>
        </svg>
      </div>
    );
  }
}

export default OtherLevelBarchart;
