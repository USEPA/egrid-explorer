import React, { Component } from "react";
import * as d3 from "d3";
import * as d3_composite from "d3-composite-projections";

import "./Visualization.css";

class PlantLevelMapStatic extends Component {
  constructor(props) {
    super(props);
    this.background = React.createRef();
    this.container = React.createRef();
  }

  initStaticMap() {
    let w = d3.select(this.container.current).node().clientWidth,
    h = d3.select(this.container.current).node().clientHeight;
    
    let projection = d3_composite
    .geoAlbersUsaTerritories()
    .scale(this.props.scale)
    .translate([w/ 2, h / 2.5]);
    let path = d3.geoPath().projection(projection);

    let svg = d3.select(this.container.current)
    .append('svg')
    .attr('width', w)
    .attr('height', h);

    // placeholder for map content
    svg.append('g').attr('class', 'static_map');
    
    // add background
    let background = svg.append('g');
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

    d3.select("#map_static").style("display", "none");
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
      <div id="map_static" style={{ width: "100%", margin: "0 auto" }}>
        {title}
        <div
          className="fuels_selection"
          style={{height: 100}}
        ></div>
        <div className="map_container"
          style={{height: 600}} 
          ref={this.container} >
        </div>
      </div>
    );
  }
}

export default PlantLevelMapStatic;
