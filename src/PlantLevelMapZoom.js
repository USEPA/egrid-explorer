import React, { Component } from "react";
import { renderToString } from "react-dom/server";
import mapboxgl from "mapbox-gl";
import * as d3 from "d3";
import * as d3_composite from "d3-composite-projections";

import UpdatedTable from "./Table";

import "./Visualization.css";

mapboxgl.accessToken =
  "pk.eyJ1Ijoia2F0aWVsb25nIiwiYSI6ImNpenpudmY1dzAxZmYzM2tmY2tobDN1MXoifQ._aoE2Zj7vx3dUlZw-gBCrg";

class PlantLevelMapZoom extends Component {
  constructor(props) {
    super(props);
    this.fuels = React.createRef();
    this.legend = React.createRef();
    this.state = {
      selected_fuel: [],
    };

    this.field_factor_divided_by = 8;
    this.max_radius = 72;
    this.max_radius_before_remove = 24;
    this.zoom_factor = this.max_radius / this.field_factor_divided_by;
    this.legend_len = 6;
    this.legend_percentile = [0.1, 0.5, 0.8, 0.95, 0.98, 1];

    this.filter_text = "Filter by Primary Fuel";
    this.filter_reset_text = "Show All Fuels";
  }

  formatLegend(d) {
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

  componentDidUpdate(prevProps, prevState) {
    if (this.props.field !== prevProps.field) {
      // filter
      let w = d3.select(this.fuels.current).node().clientWidth,
        h = d3.select(this.fuels.current).node().clientHeight;
      let nbox = this.props.fuels.length + 1;
      let boxlen = w / nbox;

      d3.selectAll(".fuels_selection").selectAll("div").remove();
      let fuels = d3
        .selectAll(".fuels_selection")
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
            this.setState({
              selected_fuel: this.state.selected_fuel.filter((e) => e !== d),
            });
          } else {
            this.setState({
              selected_fuel: this.state.selected_fuel.concat(d),
            });
          }
        }
      });

      if (this.map.loaded()) {
        const data = {
          type: "FeatureCollection",
          features: this.props.plant_data.features
            .filter((d) => d.properties[this.props.field] > 0)
            .map((d) => {
              if (
                d.properties[this.props.field] >=
                this.props.plant_outlier[this.props.field]
              ) {
                d.properties[this.props.field] = this.props.plant_outlier[
                  this.props.field
                ];
              }
              return d;
            }),
        };
        this.map.getSource("plants").setData(data);
        this.setRadius(data.features);

        d3.selectAll(".fuels_selection")
          .select(".reset")
          .classed("reset_clickable", false);
        d3.selectAll(".fuels_selection")
          .select(".reset text")
          .text(this.filter_text)
          .call(
            this.props.wrap_long_labels,
            d3.select(".fuels_selection").node().clientWidth /
              (this.props.fuels.length + 1)
          );
        d3.selectAll(".selected").classed("selected", false);

        this.map.on("zoom", "plants", () => {
          let features = data.features;
          let factor =
            d3.max(features.map((d) => d.properties[this.props.field])) /
            this.field_factor_divided_by;
          this.updateLegend(features, factor);
        });
      }
    } else {
      if (
        JSON.stringify(this.state.selected_fuel) !==
          JSON.stringify(prevState.selected_fuel) &&
        this.state.selected_fuel.length !== 0
      ) {
        if (this.map.loaded()) {
          const data = {
            type: "FeatureCollection",
            features: this.props.plant_data.features
              .filter((d) => d.properties[this.props.field] > 0)
              .filter(
                (d) =>
                  this.state.selected_fuel.indexOf(d.properties.FUEL) !== -1
              )
              .map((d) => {
                if (
                  d.properties[this.props.field] >=
                  this.props.plant_outlier[this.props.field]
                ) {
                  d.properties[this.props.field] = this.props.plant_outlier[
                    this.props.field
                  ];
                }
                return d;
              }),
          };
          this.map.getSource("plants").setData(data);
          this.setRadius(data.features);
          d3.selectAll(".selected").classed("selected", false);
          d3.selectAll(".fuels_selection")
            .select(".reset")
            .classed("reset_clickable", true)
            .on("click", (d) => {
              this.setState({ selected_fuel: [] });
            });

          d3.selectAll(".fuels_selection")
            .select(".reset text")
            .text(this.filter_reset_text)
            .call(
              this.props.wrap_long_labels,
              d3.select(this.fuels.current).node().clientWidth /
                (this.props.fuels.length + 1)
            );

          d3.selectAll(".fuels_selection")
            .selectAll(".fuel")
            .filter((d) => this.state.selected_fuel.indexOf(d) !== -1)
            .classed("selected", true);

          this.map.on("zoom", "plants", () => {
            let features = data.features;
            let factor =
              d3.max(features.map((d) => d.properties[this.props.field])) /
              this.field_factor_divided_by;
            this.updateLegend(features, factor);
          });
        }
      } else if (
        JSON.stringify(this.state.selected_fuel) !==
          JSON.stringify(prevState.selected_fuel) &&
        this.state.selected_fuel.length === 0
      ) {
        if (this.map.loaded()) {
          const data = {
            type: "FeatureCollection",
            features: this.props.plant_data.features
              .filter((d) => d.properties[this.props.field] > 0)
              .map((d) => {
                if (
                  d.properties[this.props.field] >=
                  this.props.plant_outlier[this.props.field]
                ) {
                  d.properties[this.props.field] = this.props.plant_outlier[
                    this.props.field
                  ];
                }
                return d;
              }),
          };
          this.map.getSource("plants").setData(data);
          this.setRadius(data.features);

          d3.selectAll(".fuels_selection")
            .select(".reset")
            .classed("reset_clickable", false);
          d3.selectAll(".fuels_selection")
            .select(".reset text")
            .text(this.filter_text)
            .call(
              this.props.wrap_long_labels,
              d3.select(".fuels_selection").node().clientWidth /
                (this.props.fuels.length + 1)
            );
          d3.selectAll(".selected").classed("selected", false);

          this.map.on("zoom", "plants", () => {
            let features = data.features;
            let factor =
              d3.max(features.map((d) => d.properties[this.props.field])) /
              this.field_factor_divided_by;
            this.updateLegend(features, factor);
          });
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
    this.map.setMaxZoom(this.props.max_zoom);
    this.map.setMinZoom(this.props.min_zoom);
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

    class Legend {
      onAdd(map) {
        this._map = map;
        this._container = document.createElement("div");
        this._container.className = "mapboxgl-ctrl";
        this._container.innerHTML =
          "<div class='mapboxgl-ctrl-group' aria-haspopup='true'><div><span id='legend_title'></span></div><div><svg id='legend'></svg></div></div>";

        return this._container;
      }

      onRemove() {
        this._container.parentNode.removeChild(this._container);
        this._map = undefined;
      }
    }

    this.map.addControl(new Legend(), "bottom-right");

    this.map.on("load", () => {
      const data = {
        type: "FeatureCollection",
        features: this.props.plant_data.features
          .filter((d) => d.properties[this.props.field] > 0)
          .map((d) => {
            if (
              d.properties[this.props.field] >=
              this.props.plant_outlier[this.props.field]
            ) {
              d.properties[this.props.field] = this.props.plant_outlier[
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
            [
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
          ],
          "circle-opacity": this.props.circle_opacity,
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

      // interaction: mousemove, mouseleave, click
      let show_tooltip = false,
        hoveredPlantId = null,
        tooltip = new mapboxgl.Popup({
          closeButton: false,
          closeOnClick: false,
          maxWidth: d3.select(this.fuels.current).node().clientWidth * 0.7,
        }).on("close", () => {
          tooltip.options.closeButton = false;
          tooltip.options.anchor = "bottom";
          show_tooltip = false;
        });

      this.map.on("mousemove", "plants", (d) => {
        if (!show_tooltip) {
          if (d.features.length > 0) {
            if (hoveredPlantId) {
              this.map.setFeatureState(
                { source: "plants", id: hoveredPlantId },
                { hover: false }
              );
            }
            hoveredPlantId = d.features[0].id;
            this.map.setFeatureState(
              { source: "plants", id: hoveredPlantId },
              { hover: true }
            );
          }

          this.map.getCanvas().style.cursor = "pointer";
          tooltip
            .setLngLat(d.features[0].geometry.coordinates.slice())
            .setText(d.features[0].properties.name)
            .addTo(this.map);
        }
      });

      this.map.on("mouseleave", "plants", () => {
        if (!show_tooltip) {
          this.map.getCanvas().style.cursor = "";
          tooltip.remove();
          if (hoveredPlantId) {
            this.map.setFeatureState(
              { source: "plants", id: hoveredPlantId },
              { hover: false }
            );
          }
          hoveredPlantId = null;
        }
      });

      this.map.on("click", "plants", (d) => {
        if (
          show_tooltip &&
          d.features[0].geometry.coordinates.slice()[0] ===
            tooltip.getLngLat().lng &&
          d.features[0].geometry.coordinates.slice()[1] ===
            tooltip.getLngLat().lat
        ) {
          tooltip.options.closeButton = false;
          tooltip.options.anchor = "bottom";
          show_tooltip = false;
        } else {
          if (d.features.length > 0) {
            if (hoveredPlantId) {
              this.map.setFeatureState(
                { source: "plants", id: hoveredPlantId },
                { hover: false }
              );
            }
            hoveredPlantId = d.features[0].id;
            this.map.setFeatureState(
              { source: "plants", id: hoveredPlantId },
              { hover: true }
            );
          }
          let table_info = {};
          Object.keys(d.features[0].properties).forEach((e) => {
            table_info[e] = d.features[0].properties[e];
          });
          let description = renderToString(
            <UpdatedTable title={this.props.title} table_info={table_info} />
          );
          tooltip.options.closeButton = true;
          tooltip.options.anchor = "left";
          tooltip
            .setLngLat(d.features[0].geometry.coordinates.slice())
            .setHTML(description)
            .addTo(this.map);
          show_tooltip = true;
        }
      });

      this.map.on("zoom", "plants", () => {
        let features = data.features;
        let factor =
          d3.max(features.map((d) => d.properties[this.props.field])) /
          this.field_factor_divided_by;
        this.updateLegend(features, factor);
      });
    });
  }

  updateLegend(features, factor) {
    let field_values, radius_values, scale;

    // set up scale
    field_values = features
      .map((d) => d.properties[this.props.field])
      .sort((a, b) => a - b);
    radius_values = field_values
      .map((d) =>
        d3
          .scaleLinear()
          .domain([this.props.min_zoom, this.props.max_zoom])
          .range([d / factor, (d / factor) * this.zoom_factor])(
          this.map.getZoom()
        )
      )
      .sort((a, b) => a - b);
    scale = d3
      .scaleLinear()
      .domain(d3.extent(field_values))
      .range(d3.extent(radius_values));

    // draw legend
    let w = d3.select("#legend").node().clientWidth,
      h = d3.select("#legend").node().clientHeight;
    let nbox = this.legend_len;
    let boxlen = w / nbox;

    d3.select("#legend").selectAll("g").remove();
    d3.select("#legend_title").html(this.props.title);

    let legend_values =
      field_values.length > 1
        ? this.legend_percentile.map((d) => d3.quantile(field_values, d))
        : field_values;

    legend_values = legend_values.filter(
      (d) => scale(d) <= this.max_radius_before_remove
    );
    let legend_cells = d3
      .select("#legend")
      .append("g")
      .attr("width", w)
      .attr("height", h)
      .selectAll("g")
      .data(legend_values)
      .enter()
      .append("g")
      .attr("transform", (d, i) => "translate(" + i * boxlen + "," + 5 + ")");

    legend_cells
      .append("circle")
      .attr("r", (d) => scale(d))
      .attr("cx", boxlen / 2)
      .attr("cy", Math.min(boxlen, h * 0.5) / 2);

    legend_cells
      .append("text")
      .attr("x", boxlen / 2)
      .attr(
        "y",
        Math.min(boxlen, h * 0.5) / 2 +
          scale(legend_values[legend_values.length - 1]) +
          10
      )
      .attr("dx", 0)
      .attr("dy", 0)
      .text((d) => this.formatLegend(d))
      .style("text-anchor", "middle");
  }

  updateStaticMap(features, factor) {
    // add plants
    let field_values, radius_values, scale;

    // set up scale
    field_values = features
      .map((d) => d.properties[this.props.field])
      .sort((a, b) => a - b);
    radius_values = field_values
      .map((d) =>
        d3
          .scaleLinear()
          .domain([this.props.min_zoom, this.props.max_zoom])
          .range([d / factor, (d / factor) * this.zoom_factor])(
          this.map.getZoom()
        )
      )
      .sort((a, b) => a - b);
    scale = d3.scaleOrdinal().domain(field_values).range(radius_values);

    // draw plants on static map
    let w = d3.select('.map_container').node().clientWidth,
    h = d3.select('.map_container').node().clientHeight;
    let projection = d3_composite
      .geoAlbersUsaTerritories()
      .scale(this.props.static_map_scale)
      .translate([w / 2, h / 2.5]);

    d3.select(".static_map").selectAll("circle").remove();
    d3.select(".static_map")
      .selectAll("circle")
      .data(features)
      .enter()
      .append("circle")
      .attr("cx", (d) => projection(d.geometry.coordinates)[0])
      .attr("cy", (d) => projection(d.geometry.coordinates)[1])
      .attr("r", (d) => scale(d.properties[this.props.field]))
      .style("opacity", this.props.circle_opacity)
      .style("fill", (d) => this.props.fuel_color_lookup[d.properties.FUEL])
      .style("stroke", (d) => this.props.fuel_color_lookup[d.properties.FUEL]);
  }

  setRadius(features) {
    let factor =
      d3.max(features.map((d) => d.properties[this.props.field])) /
      this.field_factor_divided_by;

    this.map.setPaintProperty("plants", "circle-radius", [
      "interpolate",
      ["linear"],
      ["zoom"],
      this.props.min_zoom,
      ["/", ["get", this.props.field], factor],
      this.props.max_zoom,
      ["/", ["get", this.props.field], factor / this.zoom_factor],
    ]);

    this.updateLegend(features, factor);
    this.updateStaticMap(features, factor);
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
      <div id="map_zoomable" >
        {title}
        <div
          className="fuels_selection"
          ref={this.fuels}
        ></div>
        <div
          className="map_container"
          ref={(node) => (this.container = node)}
        />
      </div>
    );
  }
}

export default PlantLevelMapZoom;
