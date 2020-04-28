import React, { Component } from "react";
import mapboxgl from "mapbox-gl";
import "./Visualization.css";

// import plants from "../assets/data/json/plant.json";
// import * as topojson from "topojson-client";
import * as d3 from "d3";

mapboxgl.accessToken =
  "pk.eyJ1Ijoia2F0aWVsb25nIiwiYSI6ImNpenpudmY1dzAxZmYzM2tmY2tobDN1MXoifQ._aoE2Zj7vx3dUlZw-gBCrg";

class PlantLevelMapZoom extends Component {
  constructor(props) {
    super(props);
    this.state = {
      field: this.props.field
    };
  }

  componentDidUpdate(prevProps) {
    // console.log(this.state.field);
    // if(this.props.field !== prevProps.field) {
    //   console.log(1);
    //   this.setRadius();
    // }
  }

  componentDidMount() {
    this.map = new mapboxgl.Map({
      container: this.container,
      style: "mapbox://styles/mapbox/light-v10",
      center: this.props.init_center,
      zoom: this.props.init_zoom
    });
    this.map.setMaxZoom(17);
    this.map.setMinZoom(1);

    this.map.on("move", () => {
      this.setState({
        center: [
          this.map.getCenter().lng.toFixed(4),
          this.map.getCenter().lat.toFixed(4),
        ],
        zoom: this.map.getZoom().toFixed(2),
      });
    });

    this.map.on("load", () => {
      this.map.addSource("plants", {
        type: "geojson",
        data: this.props.jsondata
      });

      this.map.addLayer({
        id: "plants",
        type: "circle",
        source: "plants",
        paint: {
          "circle-opacity": 0.8,
          "circle-color": [
            "match",
            ["get", "FUEL"],
            "COAL",
            this.props.fuel_color_lookup.COAL,
            "OIL",
            this.props.fuel_color_lookup.OIL,
            "GAS",
            this.props.fuel_color_lookup.GAS,
            "NUCLEAR",
            this.props.fuel_color_lookup.NUCLEAR,
            "HYDRO",
            this.props.fuel_color_lookup.HYDRO,
            "BIOMASS",
            this.props.fuel_color_lookup.BIOMASS,
            "WIND",
            this.props.fuel_color_lookup.WIND,
            "SOLAR",
            this.props.fuel_color_lookup.SOLAR,
            "GEOTHERMAL",
            this.props.fuel_color_lookup.GEOTHERMAL,
            "OFSL",
            this.props.fuel_color_lookup.OFSL,
            "OTHF",
            this.props.fuel_color_lookup.OTHF,
            "#000"
          ],
        },
      });

      this.setRadius();
    });

    // filter
    let w = d3.select("#filter").node().clientWidth, h=d3.select('#filter').node().clientHeight;
    let nbox = Object.keys(this.props.fuel_color_lookup).length + 1;
    let boxlen = w/nbox;

    let fuels = d3.select('#filter')
    .append('g')
    .attr('class', 'fuels')
    .selectAll('g')
    .data(Object.keys(this.props.fuel_color_lookup))
    .enter()
    .append('g')
    .attr('transform', (d,i)=>'translate(' + (i+1)*boxlen + ',0)');

    fuels.append('circle')
    .attr('r', Math.min(boxlen, h*0.5)/2)
    .attr('fill', (d)=>this.props.fuel_color_lookup[d])
    .attr('cx', boxlen/2)
    .attr('cy', Math.min(boxlen, h*0.5)/2);

    fuels
    .append('text')
    .attr('x', boxlen/2)
    .attr('y', Math.min(boxlen, h*0.5)*1.5)
    .style('text-anchor', 'middle')
    .text(d=>this.props.fuel_label_lookup[d]);

    d3.select('#filter')
    .insert('g', '.fuels')
    .append('text')
    .attr('x', boxlen/2)
    .attr('y', Math.min(boxlen, h*0.5)*0.75)
    .text('Filter')
    .style('text-anchor', 'middle')
    .style('font-weight', 'bold')
    .style('font-size', '1.2em');

  }

  setRadius(){
    this.map.setPaintProperty('plants', 'circle-radius', [
      'interpolate', ['exponential', 1000], ['zoom'],
      1, ['/', ['get',  this.state.field], 2500],
      17,  ['/', ['get', this.state.field], 100],
    ]);
  }
  
  render() {
    // console.log(this.state.field);
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
        <svg width={'90%'} height={50} id="filter"></svg>
        <div
          ref={(node) => (this.container = node)}
          className="mapbox-container"
        />
      </div>
    );
  }
}

export default PlantLevelMapZoom;
