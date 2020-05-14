import React, { Component } from "react";
import { renderToString } from "react-dom/server";
import * as d3 from "d3";
import * as _ from "underscore";
import * as d3_composite from "d3-composite-projections";

import UpdatedTable from "./Table";

class ResourceMixChart extends Component {
  constructor(props) {
    super(props);
    this.wrapper = React.createRef();
    this.fuels = React.createRef();
    this.barchart = React.createRef();
    this.barchart_wrapper = React.createRef();
    this.axis_y = React.createRef();
    this.micromap = React.createRef();
    this.tooltip = React.createRef();
    this.state = {
      selected_fuel: null,
      show_tooltip: false
    };
    this.sort_text = "Click to rearrange";
  }

  componentDidUpdate(prevProps, prevState) {
    if (this.props.field !== prevProps.field) {
      this.initView();
    } else {
      if (
        this.state.selected_fuel !== prevState.selected_fuel &&
        this.state.selected_fuel !== null
      ) {
        d3.selectAll(".selected").classed("selected", false).style("background", "none");
        d3.select(this.fuels.current)
          .select(".reset")
          .style("opacity", 1)
          .style("cursor", "pointer")
          .on("click", () => {
            this.initView();
          });
        d3.select(this.fuels.current)
          .selectAll(".fuel")
          .filter((e) => e === this.state.selected_fuel)
          .classed("selected", true)
          .style("background", "#ddd");

        this.updateView(this.state.selected_fuel);
      } else if (
        this.state.selected_fuel !== prevState.selected_fuel &&
        this.state.selected_fuel === null
      ) {
        d3.selectAll(".selected").classed("selected", false).style("background", "none");
        d3.select(this.fuels.current)
          .select(".reset")
          .style("opacity", 0.5)
          .style("cursor", "not-allowed");

        this.initView();
      }
    }
  }

  initView() {
    this.setState({ selected_fuel: null });
    let marginRight = 0,
      marginLeft = this.props.layer_type === "state" ? 130 : 60;
    let w = d3.select(this.barchart_wrapper.current).node().clientWidth,
      h = d3.select(this.barchart_wrapper.current).node().clientHeight;

    let fuel_names = this.props.fuels,
      fuel_colors = Object.values(this.props.fuel_name_lookup).map(
        (d) => this.props.fuel_color_lookup[d]
      );
    let barFillScale = d3.scaleOrdinal().domain(fuel_names).range(fuel_colors);

    let data = [];
    _.flatten([this.props.us_data, this.props.data]).forEach((d) => {
      let cumsum = 0;
      fuel_names.forEach((f) => {
        data.push({
          name: d.name,
          id: d.id,
          unit: this.props.unit,
          type: this.props.fuel_name_lookup[f],
          value: d[f],
          cumsum: cumsum,
        });
        cumsum = cumsum + d[f];
      });
    });
    let name = _.uniq(data.map((d) => d.name));

    let barXScale = d3
      .scaleLinear()
      .domain([0, 100])
      .range([0, w - marginLeft - marginRight]);
    let barYScale = d3
      .scaleBand()
      .domain(name)
      .range([0, h])
      .paddingInner(0.1)
      .paddingOuter(0.2);

    // micromap
    d3.select(this.micromap.current).selectAll("path").remove();
    let w_micro = d3.select(this.micromap.current).node().clientWidth,
      h_micro = d3.select(this.micromap.current).node().clientHeight;
    const projection = d3_composite
      .geoAlbersUsaTerritories()
      .scale(h_micro * 2)
      .translate([w_micro / 2, h_micro / 2]);
    const path = d3.geoPath().projection(projection);
    d3.select(this.micromap.current)
      .selectAll("path")
      .data(this.props.layer.features)
      .enter()
      .append("path")
      .attr("d", path)
      .attr("class", "paths")
      .style("fill", "transparent")
      .style("stroke", "#000")
      .style("stroke-width", 0.5);

    // barchart
    d3.select(this.barchart.current).selectAll("g").remove();
    d3.select(this.barchart.current)
      .attr("transform", "translate(" + marginLeft + ",0)")
      .append("g")
      .selectAll("rect")
      .data(data)
      .enter()
      .append("rect")
      .attr("class", (d) => "bars_" + d.id + "_" + d.type)
      .attr("x", (d) => barXScale(d.cumsum))
      .attr("y", (d) => barYScale(d.name))
      .attr("rx", 4)
      .attr("ry", 4)
      .attr("width", (d) => barXScale(d.value))
      .attr("height", barYScale.bandwidth())
      .style("cursor", "pointer")
      .style("fill", (d) => barFillScale(d.type))
      .on("mouseover", (d) => {
        if (!this.state.show_tooltip) {
          d3.select(this.tooltip.current)
          .transition()
          .duration(100)
          .style("opacity", 1);
        }
      })
      .on("mousemove", (d) => {
        if (!this.state.show_tooltip) {
          let table_info = {};
          data.filter(e=>e.name===d.name || e.name==="US").forEach(e=>{
            if (e.name === "US") {
              table_info[e.name+"_"+e.type]=d3.format(".2f")(e.value);
            } else {
              table_info[e.type]=d3.format(".2f")(e.value);
            }
          });
          
          let html = renderToString(<UpdatedTable region={d.name} title={this.props.title} type={d.type} table_info={table_info}/>);
          d3.select(this.tooltip.current)
            .html(html)
            .style("position", "absolute")
            .style("top", 350 + "px")
            .style("left", 1700 + "px")
            .style("opacity", .9);
          d3.select(this.wrapper.current)
            .select("rect.bars_" + d.id + "_" + d.type)
            .classed("selected", true)
            .style("stroke", "#000")
            .style("stroke-width", 1);
        }
      })
      .on("mouseout", (d) => {
        if (!this.state.show_tooltip) {
          d3.select(this.tooltip.current)
          .transition()
          .duration(500)
          .style("opacity", 0);
        d3.selectAll("rect.selected").classed("selected", false).style("stroke", "none");
        }
      })
      .on("click", d => {
        if (d3.select(this.wrapper.current).select("rect.bars_" + d.id + "_" + d.type).classed('highlighted')) {
          d3.selectAll('rect.highlighted').classed('highlighted', false).style("stroke", "none");
          this.setState({'show_tooltip': false});
        } else {
          d3.selectAll('rect.highlighted').classed('highlighted', false).style("stroke", "none");
          d3.selectAll('rect.selected').classed('selected', false).style("stroke", "none");
          d3.select(this.wrapper.current).select("rect.bars_" + d.id + "_" + d.type).classed('highlighted', true)
          .style("stroke", "#000")
          .style("stroke-width", 1);
          this.setState({'show_tooltip': true});

          d3.select(this.tooltip.current).style("opacity", 0);
          let table_info = {};
          data.filter(e=>e.name===d.name || e.name==="US").forEach(e=>{
            if (e.name === "US") {
              table_info[e.name+"_"+e.type]=d3.format(".2f")(e.value);
            } else {
              table_info[e.type]=d3.format(".2f")(e.value);
            }
          });
          
          let html = renderToString(<UpdatedTable region={d.name} title={this.props.title} type={d.type} table_info={table_info}/>);
          d3.select(this.tooltip.current)
            .html(html)
            .style("position", "absolute")
            .style("top", 350 + "px")
            .style("left", 1700 + "px")
            .style("opacity", .9);
        }

      });

    // axis
    d3.select(this.axis_y.current).selectAll("g").remove();
    d3.select(this.axis_y.current)
      .attr("transform", "translate(" + marginLeft + ",0)")
      .call(d3.axisLeft(barYScale))
      .selectAll("text")
      .filter((d) => d === "US")
      .style("font-size", "1.5em");

    // filter
    // _.uniq(data.filter(d=>d.value>0).map(d=>d.type))
    let w_legend = d3.select(this.fuels.current).node().clientWidth,
        h_legend = d3.select(this.fuels.current).node().clientHeight;
    let avail_fuels = _.uniq(data.filter(d=>d.value>0).map(d=>d.type));
    let nbox = avail_fuels.length + 1;
    let boxlen = w_legend / nbox;

    d3.select(this.fuels.current).selectAll("div").remove();
    let fuels = d3
      .select(this.fuels.current)
      .append("div")
      .attr("class", "fuels")
      .selectAll("div")
      .data(avail_fuels)
      .enter()
      .append("div")
      .attr("class", "fuel")
      .style("display", "inline-block")
      .style("cursor", "pointer")
      .style("margin",0)
      .style("border-radius", "5px");

    let fuels_svg = fuels
      .append("svg")
      .attr("width", boxlen)
      .attr("height", h_legend);

    fuels_svg
      .append("circle")
      .attr("r", Math.min(boxlen, h_legend * 0.5) / 4)
      .attr("fill", (d) => this.props.fuel_color_lookup[d])
      .attr("cx", boxlen / 2)
      .attr("cy", Math.min(boxlen, h_legend * 0.5) / 2);

    fuels_svg
      .append("text")
      .attr("x", boxlen / 2)
      .attr("y", Math.min(boxlen, h_legend * 0.5) * 1.5)
      .attr("dx", 0)
      .attr("dy", 0)
      .text((d) => this.props.fuel_label_lookup[d])
      .style("text-anchor", "middle")
      .call(this.props.wrap_long_labels, boxlen);

    d3.select(".fuels")
      .insert("div", ".fuel")
      .style("display", "inline-block")
      .attr("class", "reset")
      .style("opacity", 0.5)
      .style("cursor", "not-allowed")
      .append("svg")
      .attr("width", boxlen)
      .attr("height", h_legend)
      .append("text")
      .attr("x", 0)
      .attr("y", Math.min(boxlen, h_legend * 0.5) /2)
      .attr("dx", 0)
      .attr("dy", 0)
      .text(this.sort_text)
      .style("text-anchor", "start")
      .style("font-weight", "bold")
      .style("font-size", "1.1em")
      .call(this.props.wrap_long_labels, boxlen);

    d3.selectAll(".fuel").on("click", (d) => {
      let n = d3
        .select(this.fuels.current)
        .selectAll(".fuel")
        .filter((e) => e === d);
      if (n.classed("selected")) {
        this.setState({ selected_fuel: null });
      } else {
        this.setState({ selected_fuel: d });
      }
    })
    .on("mouseover", (d)=>{
      let n = d3
      .select(this.fuels.current)
      .selectAll(".fuel")
      .filter((e) => e === d);
      if (!n.classed("selected")) {
        n.style("background", "#eee");
      }
    })
    .on("mouseout", (d)=>{
      let n = d3
      .select(this.fuels.current)
      .selectAll(".fuel")
      .filter((e) => e === d);
      if (!n.classed("selected")) {
        n.style("background", "none");
      } else {
        n.style("background", "#ddd");
      }
    });
  }

  updateView(fuel) {
    let marginRight = 0,
      marginLeft = this.props.layer_type === "state" ? 130 : 60;
    let w = d3.select(this.barchart_wrapper.current).node().clientWidth,
      h = d3.select(this.barchart_wrapper.current).node().clientHeight;

    if (fuel === null) {
      const fuel_names = this.props.fuels;

      let data = [];
      _.flatten([this.props.us_data, this.props.data]).forEach((d) => {
        let cumsum = 0;
        fuel_names.forEach((f) => {
          data.push({
            name: d.name,
            id: d.id,
            unit: this.props.unit,
            type: this.props.fuel_name_lookup[f],
            value: d[f],
            cumsum: cumsum,
          });
          cumsum = cumsum + d[f];
        });
      });
      let name = _.uniq(data.map((d) => d.name));
      name = _.flatten([["US"], name.filter((d) => d !== "US")]);

      let barXScale = d3
        .scaleLinear()
        .domain([0, 100])
        .range([0, w - marginLeft - marginRight]);
      let barYScale = d3
        .scaleBand()
        .domain(name)
        .range([0, h])
        .paddingInner(0.1)
        .paddingOuter(0.2);

      // barchart
      d3.select(this.barchart.current)
        .selectAll("rect")
        .attr("x", (d) => barXScale(d.cumsum))
        .transition()
        .attr("y", (d) => barYScale(d.name));

      // axis
      d3.select(this.axis_y.current).call(d3.axisLeft(barYScale));
    } else {
      const fuel_names = _.flatten([
        [_.invert(this.props.fuel_name_lookup)[fuel]],
        this.props.fuels.filter(
          (d) => d !== _.invert(this.props.fuel_name_lookup)[fuel]
        ),
      ]);

      let data = [];
      _.flatten([this.props.us_data, this.props.data]).forEach((d) => {
        let cumsum = 0;
        fuel_names.forEach((f) => {
          data.push({
            name: d.name,
            id: d.id,
            unit: this.props.unit,
            type: this.props.fuel_name_lookup[f],
            value: d[f],
            cumsum: cumsum,
          });
          cumsum = cumsum + d[f];
        });
      });

      let name = data
        .filter((d) => d.type === fuel)
        .sort((a, b) => b.value - a.value)
        .map((d) => d.name);
      name = _.flatten([["US"], name.filter((d) => d !== "US")]);

      let barXScale = d3
        .scaleLinear()
        .domain([0, 100])
        .range([0, w - marginLeft - marginRight]);

      let barYScale = d3
        .scaleBand()
        .domain(name)
        .range([0, h])
        .paddingInner(0.1)
        .paddingOuter(0.2);

      d3.select(this.barchart.current)
        .selectAll("rect")
        .each((d) => {
          d.cumsum = data
            .filter((e) => e.name === d.name && e.type === d.type)
            .map((e) => e.cumsum)[0];
        })
        .attr("x", (d) => barXScale(d.cumsum))
        .transition()
        .attr("y", (d) => barYScale(d.name));

      d3.select(this.axis_y.current).call(d3.axisLeft(barYScale));
    }
  }

  render() {
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
        {this.props.title + ", by " + this.props.layer_type}
      </p>
    );

    return (
      <div ref={this.wrapper}>
        {title}
        <div
          style={{ width: "100%", height: 100, margin: "0 auto" }}
          ref={this.fuels}
        ></div>
        <svg
          style={{ width: "100%", height: 600, margin: "0 auto" }}
          ref={this.barchart_wrapper}
        >
          <g ref={this.barchart}></g>
          <g ref={this.axis_y} className={"axis axis_y"}></g>
        </svg>
        <svg
          style={{ width: "100%", height: 150, margin: "0 auto" }}
          ref={this.micromap}
        ></svg>
        <div
          ref={this.tooltip}
          style={{
            opacity: 0,
            maxWidth: 400,
            maxHeight: 520,
            overflow: "auto",
            backgroundColor: "rgba(255,255,255,0.95)",
            boxShadow: "0 2px 8px rgba(0, 0, 0, 0.5)",
            borderRadius: "4px",
          }}
        ></div>
      </div>
    );
  }
}

export default ResourceMixChart;
