import React, { Component } from "react";
import * as d3 from "d3";
import * as d3_composite from "d3-composite-projections";

class PlantLevelMapStatic extends Component {
  constructor(props) {
    super(props);
    this.background = React.createRef();
    this.container = React.createRef();
    this.legend = React.createRef();
  }

  initStaticMap() {
    let w = d3.select(this.container.current).node().clientWidth,
      h = d3.select(this.container.current).node().clientHeight;

    let projection = d3_composite
      .geoAlbersUsaTerritories()
      .scale(this.props.scale)
      .translate([w / 2, h / 2]);
    let path = d3.geoPath().projection(projection);

    let svg = d3
      .select(this.container.current)
      .append("svg")
      .attr("width", w)
      .attr("height", h);

    // placeholder for map content
    svg.append("g").attr("class", "map-static-svg");

    // add background
    let background = svg.append("g");
    background.selectAll("path").remove();
    background
      .selectAll("path")
      .data(this.props.background_layer.features)
      .enter()
      .append("path")
      .attr("d", path)
      .attr("class", "paths")
      .style("fill", "transparent")
      .style("stroke", "rgb(221, 221, 221)");

    d3.select("#map-static").style("display", "none");
  }

  componentDidMount() {
    this.initStaticMap();
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
      </div>
    );

    return (
      <div id="map-static" style={{ width: "100%", margin: "0 auto" }}>
        {title}
        <div
          className="fuels-selection"
          style={{ width: "100%", height: 100, marginBottom: 5, display: "inline-block" }}
        ></div>
        <div
          className="map-container"
          style={{ width: "100%", height: 500, display: "inline-block" }}
          ref={this.container}
        ></div>
        <div>
          <div><span className="map-static-legend-title"></span></div>
          <div className="map-static-legend"
            style={{ width: 300, height: 75, display: "inline-block" }}
            ref={this.legend}
          ></div>
        </div>
      </div>
    );
  }
}

export default PlantLevelMapStatic;
