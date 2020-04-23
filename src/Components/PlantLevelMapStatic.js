import React, { Component } from "react";
import "../App.css";
import * as d3 from "d3";
import * as d3_composite from "d3-composite-projections";
import * as topojson from "topojson-client";

import us from "../assets/data/json/US.json";

class PlantLevelMapStatic extends Component {
  render() {
    const layer = topojson.feature(us, "states");
    const projection = d3_composite
      .geoAlbersUsaTerritories()
      .scale(this.props.scale)
      .translate([this.props.width / 2, this.props.height / 2]);
    const pathGenerator = d3.geoPath().projection(projection);

    let plantSizeScale = d3
        .scaleLinear()
        .domain(d3.extent(this.props.data, (d) => d.value))
        .range([3, 10]),
      plantFillScale = d3
        .scaleOrdinal()
        .domain(Object.keys(this.props.fuel_label_lookup))
        .range(this.props.fuel_colors);
    let map = layer.features.map((d, i) => (
      <path
        key={"path" + i + "_boundary"}
        d={pathGenerator(d)}
        className="paths"
      />
    ));
    let title = (
      <text
        transform={"translate(" + this.props.width / 2 + "," + 80 + ")"}
        style={{
          fontSize: "1.2em",
          fontWeight: "bold",
          fill: "#000",
          className: "title",
          textAnchor: "middle",
        }}
      >
        {this.props.title}
      </text>
    );

    // let plants = this.props.data.map((d,i)=><circle
    //                                          key={'circle' + i}
    //                                          cx={projection([d.long, d.lat])[0]}
    //                                          cy={projection([d.long, d.lat])[1]}
    //                                          r={plantSizeScale(d.value)}
    //                                          style={{fill:plantFillScale(d.type)}}
    //                                          />);

    return (
      <svg width={this.props.width} height={this.props.height}>
        {title}
        {map}
        {/* {plants} */}
      </svg>
    );
  }
}

export default PlantLevelMapStatic;
