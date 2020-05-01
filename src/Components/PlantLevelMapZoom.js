import React, { Component } from "react";
import mapboxgl from "mapbox-gl";
import * as d3 from "d3";

import "./Visualization.css";

mapboxgl.accessToken =
  "pk.eyJ1Ijoia2F0aWVsb25nIiwiYSI6ImNpenpudmY1dzAxZmYzM2tmY2tobDN1MXoifQ._aoE2Zj7vx3dUlZw-gBCrg";

class PlantLevelMapZoom extends Component {
  constructor(props) {
    super(props);
    this.fuels = React.createRef();
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
    this.filter_text = "Filter by Primary Fuel";
    this.filter_reset_text = "Show All Fuels";
  }

  componentDidUpdate(prevProps, prevState) {
    if (this.props.field !== prevProps.field) {
      // filter
      let w = d3.select(this.fuels.current).node().clientWidth,
        h = d3.select(this.fuels.current).node().clientHeight;
      let nbox = this.props.fuels.length + 1;
      let boxlen = w / nbox;

      d3.select(this.fuels.current).selectAll('div').remove();
      let fuels = d3
        .select(this.fuels.current)
        .append("div")
        .attr("class", "fuels")
        .selectAll("div")
        .data(this.props.fuels)
        .enter()
        .append("div")
        .style("display", "inline-block")
        .attr("class", "fuel");

      let fuels_svg = fuels
        .append("svg")
        .attr("width", boxlen)
        .attr("height", h);

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
        .attr("dx", 0)
        .attr("dy", 0)
        .text((d) => this.props.fuel_label_lookup[d])
        .style("text-anchor", "middle")
        .call(this.props.wrap_long_labels, boxlen);

      d3.select(".fuels")
        .insert("div", ".fuel")
        .style("display", "inline-block")
        .attr("class", "reset")
        .append("svg")
        .attr("width", boxlen)
        .attr("height", h)
        .append("text")
        .attr("x", 0)
        .attr("y", Math.min(boxlen, h * 0.5) / 2)
        .attr("dx", 0)
        .attr("dy", 0)
        .text(this.filter_text)
        .style("text-anchor", "start")
        .style("font-weight", "bold")
        .style("font-size", "1.2em")
        .call(this.props.wrap_long_labels, boxlen);

      d3.selectAll(".fuel").on("click", (d) => {
        let n = d3
          .select(this.fuels.current)
          .selectAll(".fuel")
          .filter((e) => e === d);
        if (this.map.loaded()) {
          if (n.classed("selected")) {
            this.setState({ selected_fuel: null });
          } else {
            this.setState({ selected_fuel: d });
          }
        }
      });

      if (this.map.loaded()) {
        const data = {
          type: "FeatureCollection",
          features: this.props.json_data.features
          .filter(d=>d.properties[this.props.field]>=0)
          .map((d) => {
            if (
              d.properties[this.props.field] >=
              this.plant_outlier[this.props.field]
            ) {
              d.properties[this.props.field] = this.plant_outlier[
                this.props.field
              ];
            }
            return d;
          }),
        };
        this.map.getSource("plants").setData(data);
        this.setRadius(data.features);

        d3.select(this.fuels.current)
          .select(".reset")
          .classed("reset_clickable", false);
        d3.select(this.fuels.current)
          .select(".reset text")
          .text(this.filter_text)
          .call(
            this.props.wrap_long_labels,
            d3.select(this.fuels.current).node().clientWidth /
              (this.props.fuels.length + 1)
          );
        d3.selectAll(".selected").classed("selected", false);
      }

    } else {
      if (
        this.state.selected_fuel !== prevState.selected_fuel &&
        this.state.selected_fuel !== null
      ) {
        if (this.map.loaded()) {
          const data = {
            type: "FeatureCollection",
            features: this.props.json_data.features
              .filter(d=>d.properties[this.props.field]>=0)
              .filter((d) => d.properties.FUEL === this.state.selected_fuel)
              .map((d) => {
                if (
                  d.properties[this.props.field] >=
                  this.plant_outlier[this.props.field]
                ) {
                  d.properties[this.props.field] = this.plant_outlier[
                    this.props.field
                  ];
                }
                return d;
              }),
          };
          this.map.getSource("plants").setData(data);
          this.setRadius(data.features);
          d3.selectAll(".selected").classed("selected", false);
          d3.select(this.fuels.current)
            .select(".reset")
            .classed("reset_clickable", true)
            .on("click", () => {
              this.setState({ selected_fuel: null });
            });
          d3.select(this.fuels.current)
            .select(".reset text")
            .text(this.filter_reset_text)
            .call(
              this.props.wrap_long_labels,
              d3.select(this.fuels.current).node().clientWidth /
                (this.props.fuels.length + 1)
            );
          d3.select(this.fuels.current)
            .selectAll(".fuel")
            .filter((e) => e === this.state.selected_fuel)
            .classed("selected", true);
        }
      } else if (
        this.state.selected_fuel !== prevState.selected_fuel &&
        this.state.selected_fuel === null
      ) {
        if (this.map.loaded()) {
          const data = {
            type: "FeatureCollection",
            features: this.props.json_data.features
            .filter(d=>d.properties[this.props.field]>=0)
            .map((d) => {
              if (
                d.properties[this.props.field] >=
                this.plant_outlier[this.props.field]
              ) {
                d.properties[this.props.field] = this.plant_outlier[
                  this.props.field
                ];
              }
              return d;
            }),
          };
          this.map.getSource("plants").setData(data);
          this.setRadius(data.features);

          d3.select(this.fuels.current)
            .select(".reset")
            .classed("reset_clickable", false);
          d3.select(this.fuels.current)
            .select(".reset text")
            .text(this.filter_text)
            .call(
              this.props.wrap_long_labels,
              d3.select(this.fuels.current).node().clientWidth /
                (this.props.fuels.length + 1)
            );
          d3.selectAll(".selected").classed("selected", false);
        }
      }
    }
  }

  componentDidMount() {
    let init_zoom = this.props.init_zoom,
      init_center = this.props.init_center;

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
        this._container.innerHTML =
          "<span class='mapboxgl-ctrl-icon' aria-haspopup='true' title='zoom to national view'><img src='reset_view_icon.png' alt='reset_view' width=29 height=29 style='border-radius: 4px'></img></span>";
        this._container.style.borderRadius = "4px";
        this._container.style.boxShadow = "0 0 0 2px rgba(0,0,0,.1)";
        this._container.style.cursor = "pointer";
        this._container.onclick = function () {
          map.flyTo({ center: init_center, zoom: init_zoom });
        };
        return this._container;
      }
      onRemove() {
        this._container.parentNode.removeChild(this._container);
        this._map = undefined;
      }
    }
    this.map.addControl(new ResetControl());

    class LayerControl {
      onAdd(map) {
        this._map = map;
        this._container = document.createElement("div");
        this._container.className = "mapboxgl-ctrl";
        this._container.innerHTML =
          "<span class='mapboxgl-ctrl-group' style='padding: 10px;' aria-haspopup='true' title='change layers'><input id='light-v10' type='radio' name='rtoggle' value='light' checked='checked'/><label for='light'>light</label><input id='satellite-v9' type='radio' name='rtoggle' value='satellite' /><label for='satellite'>satellite</label></span>";

        d3.select(this._container)
          .selectAll("input")
          .nodes()
          .map((n) => {
            n.onclick = function () {
              if (map.loaded()) {
                // map.setStyle("mapbox://styles/mapbox/" + n.id);
              }
            };
          });
        return this._container;
      }

      onRemove() {
        this._container.parentNode.removeChild(this._container);
        this._map = undefined;
      }
    }
    this.map.addControl(new LayerControl());

    this.map.on("load", () => {
      const data = {
        type: "FeatureCollection",
        features: this.props.json_data.features
        .filter(d=>d.properties[this.props.field]>=0)
        .map((d) => {
          if (
            d.properties[this.props.field] >=
            this.plant_outlier[this.props.field]
          ) {
            d.properties[this.props.field] = this.plant_outlier[
              this.props.field
            ];
          }
          return d;
        }),
      };

      this.map.addSource("plants", {
        type: "geojson",
        data: data,
      });

      this.map.addLayer({
        id: "plants",
        type: "circle",
        source: "plants",
        paint: {
          "circle-stroke-width": 1,
          "circle-stroke-color": [
            "case",
            ["boolean", ["feature-state", "hover"], false],
            "#000",
            "#fff",
          ],
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

      this.setRadius(data.features);

      let hoveredPlantId = null;

      this.map.on("mousemove", "plants", (e) => {
        if (e.features.length > 0) {
          if (hoveredPlantId) {
            this.map.setFeatureState(
              { source: "plants", id: hoveredPlantId },
              { hover: false }
            );
          }
          hoveredPlantId = e.features[0].id;
          this.map.setFeatureState(
            { source: "plants", id: hoveredPlantId },
            { hover: true }
          );
        }
      });

      this.map.on("mouseleave", "plants", () => {
        if (hoveredPlantId) {
          this.map.setFeatureState(
            { source: "plants", id: hoveredPlantId },
            { hover: false }
          );
        }
        hoveredPlantId = null;
      });
    });
  }

  setRadius(features) {
    let factor =
      d3.max(features.map((d) => d.properties[this.props.field])) / 5;

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
        <div
          style={{ width: "90%", height: 80, margin: "0 auto" }}
          ref={this.fuels}
        ></div>
        <div
          ref={(node) => (this.container = node)}
          className="mapbox-container"
        />
      </div>
    );
  }
}

export default PlantLevelMapZoom;
