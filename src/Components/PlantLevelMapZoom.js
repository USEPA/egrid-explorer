import React, { Component } from "react";
import mapboxgl from "mapbox-gl";
import * as d3 from "d3";

import "./Visualization.css";

mapboxgl.accessToken =
  "pk.eyJ1Ijoia2F0aWVsb25nIiwiYSI6ImNpenpudmY1dzAxZmYzM2tmY2tobDN1MXoifQ._aoE2Zj7vx3dUlZw-gBCrg";

class PlantLevelMapZoom extends Component {
  constructor(props) {
    super(props);
    this.state = {
      selected_fuel: null,
    };

    this.plant_outlier = {
      PLNOXRTA: 2000,
      PLNOXRTO: 1000,
      PLSO2RTA: 800,
      PLCO2RTA: 10000,
      PLCH4RTA: 20,
      PLN2ORTA: 3,
      PLC2ERTA: 10000,
      PLNOXRA: 7,
      PLNOXRO: 7,
      PLSO2RA: 6,
      PLCO2RA: 300,
      PLNGENAN: 20000000,
      PLNGENOZ: 10000000,
      PLGENACL: undefined,
      PLGENAOL: undefined,
      PLGENAGS: 13000000,
      PLGENANC: 27000000,
      PLGENAHY: 16000000,
      PLGENABM: undefined,
      PLGENAWI: 2000000,
      PLGENASO: 1000000,
      PLGENAGT: 1000000,
      PLGENAOF: 1000000,
      PLGENAOP: undefined,
      PLGENATN: 20000000,
      PLGENATR: 20000000,
      PLGENATH: 2000000,
      PLGENACY: 20000000,
      PLGENACN: 20000000,
      PLHTIAN: 165000000,
      PLHTIOZ: 75000000,
      PLNOXAN: undefined,
      PLNOXOZ: undefined,
      PLSO2AN: 30000,
      PLCO2AN: 17000000,
      PLCH4AN: undefined,
      PLN2OAN: undefined,
      PLCO2EQA: 17000000,
    };
  }

  componentDidUpdate(prevProps) {
    if (this.props.field !== prevProps.field) {
      if (this.map.loaded()) {
        this.setRadius();
      }
    }
  }

  componentDidMount() {
    let init_zoom = this.props.init_zoom, init_center = this.props.init_center;
    // filter
    let w = d3.select("#filter").node().clientWidth,
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
      .append("text")
      .attr("x", boxlen / 2)
      .attr("y", Math.min(boxlen, h * 0.5) * 0.75)
      .text("Filter")
      .style("text-anchor", "middle")
      .style("font-weight", "bold")
      .style("font-size", "1.2em");

    // set up map
    this.map = new mapboxgl.Map({
      container: this.container,
      style: "mapbox://styles/mapbox/light-v10",
      center: init_center,
      zoom: init_zoom,
    });
    this.map.setMaxZoom(17);
    this.map.setMinZoom(1);
    this.map.addControl(new mapboxgl.NavigationControl());
    this.map.addControl(new mapboxgl.FullscreenControl());

    class ResetControl {
      onAdd(map) {
        this._map = map;
        this._container = document.createElement("div");
        this._container.className = "mapboxgl-ctrl";
        this._container.innerHTML = "<span class='mapboxgl-ctrl-icon' aria-haspopup='true' title='Zoom to national view'><img src='reset_view_icon.png' alt='reset_view' width=29 height=29 style='border-radius: 4px'></img></span>";
        this._container.style.borderRadius = "4px";
        this._container.style.boxShadow = "0 0 0 2px rgba(0,0,0,.1)";
        this._container.style.cursor = "pointer";
        this._container.onclick = function () {
          map.flyTo({center: init_center, zoom: init_zoom});
        };
        return this._container;
      }

      onRemove() {
        this._container.parentNode.removeChild(this._container);
        this._map = undefined;
      }
    }
    this.map.addControl(new ResetControl());

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
      let cutoff = this.plant_outlier[this.props.field];
      this.props.jsondata.features = this.props.jsondata.features.map((d) => {
        if (d.properties[this.props.field] >= cutoff) {
          d.properties[this.props.field] = cutoff;
        }
        return d;
      });

      this.map.addSource("plants", {
        type: "geojson",
        data: this.props.jsondata,
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
            "#000",
          ],
        },
      });
      this.setRadius();
    });

    this.map.on("zoomend", () => {
      this.setRadius();
    });
  }

  setRadius() {
    let factor =
      d3.max(
        this.props.jsondata.features.map((d) => d.properties[this.props.field])
      ) / 5;

    this.map.setPaintProperty("plants", "circle-radius", [
      "interpolate",
      ["linear"],
      ["zoom"],
      1,
      ["/", ["get", this.props.field], factor],
      17,
      ["/", ["get", this.props.field], factor / 25],
    ]);
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
        {this.props.title}
      </p>
    );

    return (
      <div>
        {title}
        <svg width={"90%"} height={50} id="filter"></svg>
        <div
          ref={(node) => (this.container = node)}
          className="mapbox-container"
        />
      </div>
    );
  }
}

export default PlantLevelMapZoom;
