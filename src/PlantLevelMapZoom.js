import React, { Component } from "react";
import mapboxgl from "mapbox-gl";
import * as d3 from "d3";
import * as d3_composite from "d3-composite-projections";

import UpdatedTable from "./Table";

mapboxgl.accessToken =
  "pk.eyJ1Ijoia2F0aWVsb25nIiwiYSI6ImNpenpudmY1dzAxZmYzM2tmY2tobDN1MXoifQ._aoE2Zj7vx3dUlZw-gBCrg";

class PlantLevelMapZoom extends Component {
  constructor(props) {
    super(props);
    this.fuels = React.createRef();
    this.legend = React.createRef();
    this.state = {
      selected_plant_id: null,
      selected_fuel: [],
      table_info: {},
      map_style: null,
    };

    this.map_layer_load_times = 0;
    this.field_factor_divided_by = 8;
    this.max_radius = 72;
    this.max_radius_before_remove = 24;
    this.zoom_factor = this.max_radius / this.field_factor_divided_by;
    this.legend_len = 6;
    this.legend_percentile = [0.1, 0.5, 0.8, 0.95, 0.98, 1];

    this.filter_text = "Filter by Primary Fuel";
    this.filter_reset_text = "Show All Fuels";

    this.show_plant_info = false;
    this.hoveredPlantId = null;
    this.tooltip = new mapboxgl.Popup({
      closeButton: true,
      closeOnClick: false,
    }).on("close", () => {
      this.show_plant_info = false;
      this.tooltip.options.anchor = "bottom";

      let table_info = {};
      Object.keys(this.state.table_info).forEach((e) => {
        table_info[e] = "-";
      });
      this.setState({ table_info: table_info, selected_plant_id: null });
    });
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
    let w = d3.select(".map-zoomable-legend").node().clientWidth,
      h = d3.select(".map-zoomable-legend").node().clientHeight;
    let nbox = this.legend_len;
    let boxlen = w / nbox;

    d3.select(".map-zoomable-legend").selectAll("g").remove();
    d3.select(".map-zoomable-legend-title").html(this.props.unit);

    let legend_values =
      field_values.length > 1
        ? this.legend_percentile.map((d) => d3.quantile(field_values, d))
        : field_values;

    legend_values = legend_values.filter(
      (d) => scale(d) <= this.max_radius_before_remove
    );

    let legend_cells = d3
      .select(".map-zoomable-legend")
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
      .style("fill", "#ddd")
      .style("stroke", "black")
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
          20
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
          this.props.init_zoom
        )
      )
      .sort((a, b) => a - b);
    scale = d3
      .scaleLinear()
      .domain(d3.extent(field_values))
      .range(d3.extent(radius_values));

    // draw plants on static map
    let w = d3.select(this.fuels.current).node().clientWidth,
      h = 500;
    let projection = d3_composite
      .geoAlbersUsaTerritories()
      .scale(this.props.static_map_scale)
      .translate([w / 2, h / 2]);

    d3.select(".map-static-svg").selectAll("circle").remove();
    d3.select(".map-static-svg")
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

    // draw legend
    w = d3.select(".map-zoomable-legend").node().clientWidth;
    h = d3.select(".map-zoomable-legend").node().clientHeight;
    let nbox = this.legend_len;
    let boxlen = w / nbox;
    let legend_values = this.legend_percentile.map((d) =>
      d3.quantile(field_values, d)
    );

    d3.select(".map-static-legend").select("svg").remove();
    d3.select(".map-static-legend-title").html(this.props.unit);

    let legend_cells = d3
      .select(".map-static-legend")
      .append("svg")
      .attr("width", w)
      .attr("height", h)
      .selectAll("g")
      .data(legend_values)
      .enter()
      .append("g")
      .attr("transform", (d, i) => "translate(" + i * boxlen + "," + 5 + ")");

    legend_cells
      .append("circle")
      .style("fill", "#ddd")
      .style("stroke", "black")
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
          20
      )
      .attr("dx", 0)
      .attr("dy", 0)
      .text((d) => this.formatLegend(d))
      .style("text-anchor", "middle");
  }

  updateMapWithFuelFilter() {
    const data = {
      type: "FeatureCollection",
      features: this.props.plant_data.features
        .filter((d) => d.properties[this.props.field] > 0)
        .filter(
          (d) => this.state.selected_fuel.indexOf(d.properties.FUEL) !== -1
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
    d3.selectAll(".selected")
      .classed("selected", false)
      .style("background", "none");
    d3.selectAll(".fuels-selection")
      .select(".reset")
      .style("opacity", 1)
      .style("cursor", "pointer")
      .on("mouseover", () => {
        d3.select(".reset").style("opacity", 0.7);
      })
      .on("mouseout", () => {
        d3.select(".reset").style("opacity", 1);
      })
      .on("click", (d) => {
        this.setState({ selected_fuel: [] });
      });

    d3.selectAll(".fuels-selection")
      .select(".reset text")
      .text(this.filter_reset_text)
      .call(
        this.props.wrap_long_labels,
        d3.select(this.fuels.current).node().clientWidth /
          (this.props.fuels.length + 1)
      );

    d3.selectAll(".fuels-selection")
      .selectAll(".fuel")
      .filter((d) => this.state.selected_fuel.indexOf(d) !== -1)
      .classed("selected", true)
      .style("background", "#ddd");

    this.map.on(
      "zoom",
      "plants-" +
        this.state.map_style +
        "-" +
        this.map_layer_load_times.toString(),
      () => {
        let features = data.features;
        let factor =
          d3.max(features.map((d) => d.properties[this.props.field])) /
          this.field_factor_divided_by;
        this.updateLegend(features, factor);
      }
    );
  }

  updateMapWithNOFuelFilter() {
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

    d3.selectAll(".fuels-selection")
      .select(".reset")
      .on("mouseover", null)
      .on("mouseout", null)
      .style("opacity", 0.5)
      .style("cursor", "not-allowed");
    d3.selectAll(".fuels-selection")
      .select(".reset text")
      .text(this.filter_text)
      .call(
        this.props.wrap_long_labels,
        d3.select(this.fuels.current).node().clientWidth /
          (this.props.fuels.length + 1)
      );
    d3.selectAll(".selected")
      .classed("selected", false)
      .style("background", "none");

    this.map.on(
      "zoom",
      "plants-" +
        this.state.map_style +
        "-" +
        this.map_layer_load_times.toString(),
      () => {
        let features = data.features;
        let factor =
          d3.max(features.map((d) => d.properties[this.props.field])) /
          this.field_factor_divided_by;
        this.updateLegend(features, factor);
      }
    );
  }

  setRadius(features) {
    let factor =
      d3.max(features.map((d) => d.properties[this.props.field])) /
      this.field_factor_divided_by;

    this.map.setPaintProperty(
      "plants-" +
        this.state.map_style +
        "-" +
        this.map_layer_load_times.toString(),
      "circle-radius",
      [
        "interpolate",
        ["linear"],
        ["zoom"],
        this.props.min_zoom,
        ["/", ["get", this.props.field], factor],
        this.props.max_zoom,
        ["/", ["get", this.props.field], factor / this.zoom_factor],
      ]
    );

    this.updateLegend(features, factor);
    this.updateStaticMap(features, factor);
  }

  componentDidUpdate(prevProps, prevState) {
    if (this.props.field !== prevProps.field) {
      if (this.state.selected_fuel.length !== 0) {
        if (this.map.loaded()) this.updateMapWithFuelFilter();
      } else if (this.state.selected_fuel.length === 0) {
        if (this.map.loaded()) this.updateMapWithNOFuelFilter();
      }
    } else {
      if (
        JSON.stringify(this.state.selected_fuel) !==
        JSON.stringify(prevState.selected_fuel)
      ) {
        if (this.state.selected_fuel.length !== 0) {
          if (this.map.loaded()) {
            this.updateMapWithFuelFilter();

            // refresh tooltip
            this.show_plant_info = false;
            this.tooltip.options.anchor = "bottom";

            let table_info = {};
            Object.keys(this.state.table_info).forEach((e) => {
              table_info[e] = "-";
            });
            this.setState({ table_info: table_info });

            this.tooltip.remove();
            if (this.hoveredPlantId) {
              this.map.setFeatureState(
                { source: "plants", id: this.hoveredPlantId },
                { hover: false }
              );
            }
            this.hoveredPlantId = null;
          }
        } else if (this.state.selected_fuel.length === 0) {
          if (this.map.loaded()) {
            this.updateMapWithNOFuelFilter();
          }
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
      center: init_center,
      zoom: init_zoom,
      minZoom: this.props.min_zoom + 0.1,
      maxZoom: this.props.max_zoom - 0.1,
    });

    // add controls
    // zoom control
    this.map.addControl(new mapboxgl.NavigationControl());

    // remove compass from navigation control
    d3.select(".mapboxgl-ctrl-compass").style("display", "none");

    // full screen control
    this.map.addControl(new mapboxgl.FullscreenControl());

    // re-center control
    class ResetControl {
      onAdd(map) {
        this._map = map;
        this._container = document.createElement("div");
        this._container.className = "mapboxgl-ctrl-group mapboxgl-ctrl";
        this._container.innerHTML =
          "<button><span class='mapboxgl-ctrl-icon' aria-haspopup='true' title='zoom to national view'><img src='reset_view_icon.jpg' alt='reset_view' width=29 height=29 style='border-radius: 4px'></img></span></button>";
        this._container.style.borderRadius = "4px";
        this._container.style.boxShadow = "0 0 0 2px rgba(0,0,0,.1)";
        this._container.style.cursor = "pointer";
        this._container.style.height = "29px";
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

    // base layer control
    class LayerControl {
      onAdd(map) {
        this._map = map;
        this._container = document.createElement("div");
        this._container.className =
          "mapboxgl-ctrl-group mapboxgl-ctrl mapboxgl-layer-switch";
        this._container.style.borderRadius = "4px";
        this._container.style.fontSize = "1.1em";
        this._container.style.boxShadow = "0 0 0 2px rgba(0,0,0,.1)";
        this._container.style.width = "80px";
        this._container.style.height = "50px";

        const layers = this._createInput(
          ["light-v10", "satellite-v9"],
          ["street", "satellite"]
        );
        this._container.appendChild(layers);
        return this._container;
      }

      onRemove() {
        this._container.parentNode.removeChild(this._container);
        this._map = undefined;
      }

      _createInput(id_list, value_list) {
        const container = window.document.createElement("div");
        container.id = "layer-control";
        container.style.position = "absolute";
        container.style.background = "#fff";
        container.style.ariaHaspopup = "true";
        container.style.marginLeft = "5px";
        container.style.marginTop = "2px";
        container.style.title = "change layers";

        id_list.forEach((d, i) => {
          const div = window.document.createElement("div");
          const input = window.document.createElement("input"),
            label = window.document.createElement("span");

          div.style.display = "block";
          div.style.textAlign = "left";

          input.style.display = "inline-block";
          input.id = d;
          input.value = value_list[i];
          input.type = "radio";
          input.name = "rtoggle";
          input.style.position = "relative";
          input.style.left = "0";
          input.style.padding = "0";

          label.style.verticalAlign = "text-bottom";
          label.style.paddingLeft = "5px";
          label.innerHTML = value_list[i];

          let m = this._map;
          d3.select(input).on("click", () => {
            m.setStyle("mapbox://styles/mapbox/" + d + "?optimize=true");
          });

          div.appendChild(input);
          div.appendChild(label);

          container.appendChild(div);
        });

        return container;
      }
    }
    this.map.addControl(new LayerControl());

    // add legends
    class Legend {
      onAdd(map) {
        this._map = map;
        this._container = document.createElement("div");
        this._container.className = "mapboxgl-ctrl";
        this._container.innerHTML =
          "<div class='mapboxgl-ctrl-group' aria-haspopup='true'><div><span class='map-zoomable-legend-title'></span></div><div><svg class='map-zoomable-legend' style='width:300px;height:75px;'></svg></div></div>";

        return this._container;
      }

      onRemove() {
        this._container.parentNode.removeChild(this._container);
        this._map = undefined;
      }
    }
    this.map.addControl(new Legend(), "bottom-right");

    // init map
    d3.select('#light-v10').property("checked", "checked").dispatch("click");

    // init map on style loaded
    this.map.on("style.load", (d) => {
      // set new state of map style
      this.setState(
        {
          map_style: d.style.stylesheet.id,
        },
        () => {
          this.map_layer_load_times += 1;

          // add fuel filter
          let w = d3.select(this.fuels.current).node().clientWidth,
            h = d3.select(this.fuels.current).node().clientHeight;
          let nbox = this.props.fuels.length + 1;
          let boxlen = w / nbox;

          d3.selectAll(".fuels-selection").selectAll("div").remove();
          let fuels = d3
            .selectAll(".fuels-selection")
            .append("div")
            .attr("class", "fuels")
            .selectAll("div")
            .data(this.props.fuels)
            .enter()
            .append("div")
            .attr("class", "fuel")
            .style("display", "inline-flex")
            .style("cursor", "pointer")
            .style("margin", 0)
            .style("border-radius", "5px");

          let fuels_svg = fuels
            .append("svg")
            .attr("width", boxlen)
            .attr("height", h);

          fuels_svg
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
            .style("display", "inline-flex")
            .attr("class", "reset no-export")
            .style("opacity", 0.5)
            .style("cursor", "not-allowed")
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

          d3.selectAll(".fuel")
            .on("click", (d) => {
              let n = d3
                .select(this.fuels.current)
                .selectAll(".fuel")
                .filter((e) => e === d);
              if (this.map.loaded()) {
                if (n.classed("selected")) {
                  this.setState({
                    selected_fuel: this.state.selected_fuel.filter(
                      (e) => e !== d
                    ),
                  });
                } else {
                  this.setState({
                    selected_fuel: this.state.selected_fuel.concat(d),
                  });
                }
              }
            })
            .on("mouseover", (d) => {
              let n = d3
                .select(this.fuels.current)
                .selectAll(".fuel")
                .filter((e) => e === d);
              if (this.map.loaded()) {
                if (!n.classed("selected")) {
                  n.style("background", "#eee");
                }
              }
            })
            .on("mouseout", (d) => {
              let n = d3
                .select(this.fuels.current)
                .selectAll(".fuel")
                .filter((e) => e === d);
              if (this.map.loaded()) {
                if (!n.classed("selected")) {
                  n.style("background", "none");
                } else {
                  n.style("background", "#ddd");
                }
              }
            });

          // add initial map data
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

          // add data source to map
          this.map.addSource("plants", {
            type: "geojson",
            data: data,
          });

          // add map layer
          this.map.addLayer({
            id:
              "plants-" +
              this.state.map_style +
              "-" +
              this.map_layer_load_times.toString(),
            type: "circle",
            source: "plants",
            minzoom: this.props.min_zoom,
            maxzoom: this.props.max_zoom,
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

          // set radius of circles
          this.setRadius(data.features);

          // re-style layer depending on if any fuel is selected
          if (this.state.selected_fuel.length !== 0) {
            this.updateMapWithFuelFilter();
          } else if (this.state.selected_fuel.length === 0) {
            this.updateMapWithNOFuelFilter();
          }

          // set selected plant
          this.map.setFeatureState(
            { source: "plants", id: this.state.selected_plant_id },
            { hover: true }
          );

          // add interactive events: mousemove, mouseleave, click
          this.map.on(
            "mousemove",
            "plants-" +
              this.state.map_style +
              "-" +
              this.map_layer_load_times.toString(),
            (d) => {
              if (!this.show_plant_info) {
                this.map.getCanvas().style.cursor = "pointer";

                if (d.features.length > 0) {
                  if (this.hoveredPlantId) {
                    this.map.setFeatureState(
                      { source: "plants", id: this.hoveredPlantId },
                      { hover: false }
                    );
                  }
                  this.hoveredPlantId = d.features[0].id;
                  this.map.setFeatureState(
                    { source: "plants", id: this.hoveredPlantId },
                    { hover: true }
                  );
                }

                while (
                  Math.abs(
                    d.lngLat.lng - d.features[0].geometry.coordinates.slice()[0]
                  ) > 180
                ) {
                  d.features[0].geometry.coordinates.slice()[0] +=
                    d.lngLat.lng > d.features[0].geometry.coordinates.slice()[0]
                      ? 360
                      : -360;
                }

                this.tooltip
                  .setLngLat(d.features[0].geometry.coordinates.slice())
                  .setText(d.features[0].properties.name)
                  .addTo(this.map);

                let table_info = {};
                Object.keys(d.features[0].properties).forEach((e) => {
                  table_info[e] =
                    typeof d.features[0].properties[e] === "number" &&
                    e !== "ORISPL"
                      ? this.formatNumber(d.features[0].properties[e])
                      : d.features[0].properties[e];
                });
                this.setState({ table_info: table_info });
              }
            }
          );

          this.map.on(
            "mouseleave",
            "plants-" +
              this.state.map_style +
              "-" +
              this.map_layer_load_times.toString(),
            () => {
              if (!this.show_plant_info) {
                this.map.getCanvas().style.cursor = "";
                this.tooltip.remove();

                if (this.hoveredPlantId) {
                  this.map.setFeatureState(
                    { source: "plants", id: this.hoveredPlantId },
                    { hover: false }
                  );
                }
                this.hoveredPlantId = null;
              }
            }
          );

          this.map.on(
            "click",
            "plants-" +
              this.state.map_style +
              "-" +
              this.map_layer_load_times.toString(),
            (d) => {
              if (d.features[0].id === this.state.selected_plant_id) {
                this.show_plant_info = false;
                this.tooltip.remove();
              } else {
                this.show_plant_info = true;

                if (d.features.length > 0) {
                  if (this.hoveredPlantId) {
                    this.map.setFeatureState(
                      { source: "plants", id: this.hoveredPlantId },
                      { hover: false }
                    );
                  }
                  this.hoveredPlantId = d.features[0].id;
                  this.map.setFeatureState(
                    { source: "plants", id: this.hoveredPlantId },
                    { hover: true }
                  );
                }

                this.tooltip
                  .setLngLat(d.features[0].geometry.coordinates.slice())
                  .setText(d.features[0].properties.name)
                  .addTo(this.map);

                let table_info = {};
                Object.keys(d.features[0].properties).forEach((e) => {
                  table_info[e] =
                    typeof d.features[0].properties[e] === "number" &&
                    e !== "ORISPL"
                      ? this.formatNumber(d.features[0].properties[e])
                      : d.features[0].properties[e];
                });

                this.setState({
                  table_info: table_info,
                  selected_plant_id: this.hoveredPlantId,
                });
              }
            }
          );

          this.map.on(
            "zoom",
            "plants-" +
              this.state.map_style +
              "-" +
              this.map_layer_load_times.toString(),
            () => {
              let features = data.features;
              let factor =
                d3.max(features.map((d) => d.properties[this.props.field])) /
                this.field_factor_divided_by;
              this.updateLegend(features, factor);
            }
          );
        }
      );
    });
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
      <div id="map-zoomable" style={{ width: "100%", margin: "0 auto" }}>
        {title}
        <div
          className="fuels-selection"
          style={{ width: "100%", height: 100, display: "inline-block" }}
          ref={this.fuels}
        ></div>
        <div style={{height: 730}}>
          <div
            className="map-container"
            style={{ width: "65%", height: 730, display: "inline-block" }}
            ref={(node) => (this.container = node)}
          />
          <div
            style={{
              width: "33%",
              height: 730,
              float: "right",
              display: "inline-block",
            }}
          >
            <UpdatedTable
              title={this.props.title}
              field={this.props.field}
              table_info={this.state.table_info}
            />
          </div>
        </div>
      </div>
    );
  }
}

export default PlantLevelMapZoom;
