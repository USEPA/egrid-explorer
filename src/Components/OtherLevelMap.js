import React, { Component } from "react";
import "../App.css";
import * as d3 from "d3";
import * as d3_composite from "d3-composite-projections";

class OtherLevelMap extends Component {
  constructor(props) {
    super(props);
    this.tooltip = React.createRef();
    this.background = React.createRef();
    this.map = React.createRef();
    this.labels = React.createRef();
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

  initView() {
    const layer = this.props.layer,
      label_width =
        this.props.layer_type === "grid gross loss rates"
          ? 120
          : this.props.layer_type === "state"
          ? 20
          : 40,
      label_height =
        this.props.layer_type !== "grid gross loss rates" ? 14 : 22;

    const projection = d3_composite
      .geoAlbersUsaTerritories()
      .scale(this.props.scale)
      .translate([this.props.width / 2, this.props.height / 2.5]);
    const path = d3.geoPath().projection(projection);
    const mapfill = this.props.mapfill;

    // add centroid to layer
    layer.features = layer.features
      .map((d) => {
        if (this.props.data.filter((e) => e.name === d.name)[0]) {
          let prop = this.props.data.filter((e) => e.name === d.name)[0];
          prop.centroid = path.centroid(d);
          d.properties = prop;
        } else {
          d.properties = null;
        }
        return d;
      })
      .filter((d) => d.properties !== null);

    // add fill scale
    let fill_scale = d3.scaleThreshold().range(mapfill);
    let domainArr = layer.features
      .map((e) => e.properties.value)
      .sort((a, b) => a - b);
    fill_scale.domain(
      d3
        .range(mapfill.length - 1)
        .map((d) => d3.quantile(domainArr, (d + 1) / mapfill.length))
    );

    // add layers
    d3.select(this.map.current).selectAll("path").remove();
    d3.select(this.map.current)
      .selectAll("path")
      .data(layer.features)
      .enter()
      .append("path")
      .attr("d", path)
      .attr("class", (d) => "paths mouseover_target region_" + d.properties.id)
      .style("fill", (d) =>
        this.props.layer_type !== "grid gross loss rates"
          ? fill_scale(d.properties.value)
          : "transparent"
      )
      .style("stroke", "#000")
      .style("stroke-width", 0.5)
      .on('mouseover', d=>{
        d3.select(this.tooltip.current)
        .transition()
        .duration(100)
        .style("opacity", 1);
      })
      .on('mousemove', d=>{
        let html = "<span>The <b>"+ this.props.title.slice(0,1).toLowerCase() + this.props.title.slice(1).split(' (')[0] + "</b><br>for <b>" + d.properties.name + "</b><br>is <b>" + d.properties.value + " " + d.properties.unit + "</b>.</span>";
        d3.select(this.tooltip.current)
        .html(html)
        .style("position", "absolute")
        .style("top", d3.event.pageY - 30 + "px")
        .style("left", d3.event.pageX + 30 + "px")
        .style("opacity", 1);

        d3.selectAll('.region_'+d.properties.id+' rect').classed('selected', true);
        d3.selectAll('.region_'+d.properties.id+' text').classed('selected', true);
        d3.selectAll('path.region_'+d.properties.id).classed('selected', true);
        d3.selectAll('.mouseover_target rect').classed('deemphasized', true);
        d3.selectAll('.mouseover_target text').classed('deemphasized', true);
        d3.selectAll('path.mouseover_target').classed('deemphasized', true);
      })
      .on('mouseout', d=>{
        d3.select(this.tooltip.current)
        .transition()
        .duration(500)
        .style("opacity", 0);

        d3.selectAll('.deemphasized').classed('deemphasized', false);
        d3.selectAll('.selected').classed('selected', false);
      });

    // add labels
    d3.select(this.labels.current).selectAll("g").remove();
    let labels = d3
      .select(this.labels.current)
      .selectAll("g")
      .data(layer.features)
      .enter()
      .append("g");

    labels
      .append("rect")
      .attr("x", (d) => d.properties.centroid[0] - label_width / 2)
      .attr("y", (d) => d.properties.centroid[1])
      .attr("width", label_width)
      .attr("height", label_height)
      .attr("rx", 4)
      .style("fill", "#fff")
      .style("stroke", (d) =>
        this.props.layer_type !== "grid gross loss rates" ? "none" : "#000"
      );

    labels
      .append("text")
      .attr("x", (d) => d.properties.centroid[0])
      .attr("y", (d) => d.properties.centroid[1] + label_height * 0.8)
      .style("text-anchor", "middle")
      .style("font-size", (d) =>
        this.props.layer_type !== "grid gross loss rates" ? "0.7em" : "1em"
      )
      .style("font-weight", "bold")
      .text((d) =>
        this.props.layer_type !== "grid gross loss rates"
          ? d.properties.label
          : d.properties.label + ": " + d.properties.value + "%"
      );

    // add background (grid gross loss rates)
    if (this.props.layer_type === "grid gross loss rates") {
      d3.select(this.background.current).selectAll("path").remove();
      d3.select(this.background.current)
        .selectAll("path")
        .data(this.props.background_layer.features)
        .enter()
        .append("path")
        .attr("d", path)
        .attr("class", "paths")
        .style("fill", "transparent")
        .style("stroke", "rgb(221, 221, 221)");
    }
  }

  componentDidMount() {
    this.initView();
  }

  componentDidUpdate(prevProps) {
    if (this.props.field !== prevProps.field) {
      this.initView();
    }
  }

  render() {
    let title = (
      <div>
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
        {this.props.layer_type !== "grid gross loss rates" && (
          <p
            style={{
              fontSize: "1em",
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
        )}
      </div>
    );

    return (
      <div>
        {title}
        <svg width={this.props.width} height={this.props.height}>
          <g ref={this.background} />
          <g ref={this.map} />
          <g ref={this.labels} />
        </svg>
        <div
          ref={this.tooltip}
          style={{
            opacity: 0,
            maxWidth: 400,
            maxHeight: 520,
            padding: 5,
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

export default OtherLevelMap;
