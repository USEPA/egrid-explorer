import React, { Component } from "react";
import mapboxgl from "mapbox-gl";
import * as d3 from "d3";
import * as d3_composite from "d3-composite-projections";

import reset_view_icon from "./assets/img/reset_view_icon.jpg";
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

    this.legend_min_radius = 3;
    this.map_layer_load_times = 0;
    this.field_factor_divided_by = 12;
    this.max_radius = 22;
    this.legend_len = 6;

    this.zoom_factor = this.max_radius / this.field_factor_divided_by;
    
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
      this.updateTable(table_info);
      this.setState({ table_info: table_info, selected_plant_id: null });
      
      if (this.hoveredPlantId) {
        this.map.setFeatureState(
          { source: "plants", id: this.hoveredPlantId },
          { hover: false }
        );
      }
      this.hoveredPlantId = null;
    });

    this.updateTable = this.updateTable.bind(this);
  }

  updateTable(table) {
    this.props.getPlantData(table);
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
    let num = Math.abs(d);
    if (num < 1) {
      return d===0? d : d3.format(".3f")(d);
    } else if (num >= 1000) {
      let num = d3.format(".3s")(d);
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
    } else {
      return d3.format('.3')(d);
    }
  }

  updateLegend(features, layer_features, factor) {
    let field_values, radius_values, scale;

    // set up scale
    field_values = features
      .map((d) => d.properties[this.props.field + '_trimmed'])
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
    let w = 300, h = 75;
    let nbox = this.legend_len;
    let boxlen = w / nbox;

    d3.select(".map-zoomable-legend").selectAll("g").remove();
    d3.select(".map-zoomable-legend-title").html(this.props.unit);

    // get features from visible layer
    let layer_features_extent = d3.extent(layer_features.map((d) => d.properties[this.props.field]));
    let thresholds = Object.values(this.props.plant_dist[this.props.field]).slice(0,this.props.plant_dist[this.props.field].length);
    let legend_values;

    if (layer_features_extent[0]===undefined && layer_features_extent[1]===undefined) {
      legend_values = [];
    } else {
      if (layer_features_extent[1] < thresholds.slice(thresholds.length-1)[0]) {
        thresholds = [thresholds.slice(0)[0],
        thresholds.slice(0)[0]+(layer_features_extent[1]-thresholds.slice(0)[0])/5,
        thresholds.slice(0)[0]+(layer_features_extent[1]-thresholds.slice(0)[0])*2/5,
        thresholds.slice(0)[0]+(layer_features_extent[1]-thresholds.slice(0)[0])*3/5,
        thresholds.slice(0)[0]+(layer_features_extent[1]-thresholds.slice(0)[0])*4/5,
        layer_features_extent[1]];
  
        if (layer_features_extent[1] <= thresholds.slice(0)[0]) {
          thresholds = [thresholds.slice(0)[0]];
        }
      }
      legend_values = thresholds.map((d) => scale(d)).sort((a, b) => a - b);
    }

    let legend_cells = d3.select(".map-zoomable-legend")
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
      .style("fill", this.props.fuel_background_select_color)
      .style("stroke", "black")
      .attr("r", (d) => d)
      .attr("cx", boxlen / 2)
      .attr("cy", Math.min(boxlen, h * 0.5) / 2);

    legend_cells
      .append("text")
      .attr("x", boxlen / 2)
      .attr(
        "y",
        Math.min(boxlen, h * 0.5) / 2 +
          legend_values[legend_values.length - 1] +
          20
      )
      .attr("dx", 0)
      .attr("dy", 0)
      .text((d,i) => i===0 ? "<=" + this.formatLegend(scale.invert(d)).toString() : (i===legend_values.length-1 && scale.invert(d)===this.props.plant_dist[this.props.field].max? ">=" + this.formatLegend(scale.invert(d)).toString() : this.formatLegend(scale.invert(d))))
      .style("text-anchor", "middle");
  }

  updateMapWithFuelFilter() {
    const data = {
      type: "FeatureCollection",
      features: this.props.plant_data.features
        .filter(
          (d) => this.state.selected_fuel.indexOf(d.properties.FUEL) !== -1
        )
        .map((d) => {
          d.properties[this.props.field +  '_trimmed'] = d.properties[this.props.field];
          if (
            d.properties[this.props.field] >=
            this.props.plant_dist[this.props.field].max
          ) {
            d.properties[this.props.field +  '_trimmed'] = this.props.plant_dist[
              this.props.field
            ].max;
          }
          if (
            d.properties[this.props.field] <=
            this.props.plant_dist[this.props.field].min
          ) {
            d.properties[this.props.field +  '_trimmed'] = this.props.plant_dist[
              this.props.field
            ].min;
          }
          return d;
        }),
    };

    // update map data
    this.map.getSource("plants").setData(data);
    this.setRadius(data.features);

    // update legend
    let factor =
      d3.max(data.features.map((d) => d.properties[this.props.field + '_trimmed'])) /
      this.field_factor_divided_by;

    // update source data event
    this.map.on("sourcedata", (d) => {
      this.updateLegend(
        data.features,
        this.map.queryRenderedFeatures({
          layers: [
            "plants-" +
              this.state.map_style +
              "-" +
              this.map_layer_load_times.toString(),
          ],
        }),
        factor
      );
    });

    // update fuel filter
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
      .on("click", () => {
        this.setState({ selected_fuel: [] });
      });

    d3.selectAll(".fuels-selection")
      .select(".reset text")
      .text(this.filter_reset_text)
      .call(this.props.wrap_long_labels, 88);

    d3.selectAll(".fuels-selection")
      .selectAll(".fuel")
      .filter((d) => this.state.selected_fuel.indexOf(d) !== -1)
      .classed("selected", true)
      .style("background", this.props.fuel_background_select_color);
  }

  updateMapWithNOFuelFilter() {
    const data = {
      type: "FeatureCollection",
      features: this.props.plant_data.features.filter(d=>{
        return this.props.avail_fuels.indexOf(d.properties.FUEL) > -1;
      })
      .map((d) => {
        d.properties[this.props.field +  '_trimmed'] = d.properties[this.props.field];

        if (
          d.properties[this.props.field] >=
          this.props.plant_dist[this.props.field].max
        ) {
          d.properties[this.props.field +  '_trimmed'] = this.props.plant_dist[
            this.props.field
          ].max;
        }

        if (
          d.properties[this.props.field] <=
          this.props.plant_dist[this.props.field].min
        ) {
          d.properties[this.props.field +  '_trimmed'] = this.props.plant_dist[
            this.props.field
          ].min;
        }
        return d;
      }),
    };

    // update map data
    this.map.getSource("plants").setData(data);
    this.setRadius(data.features);

    // update legend
    let factor =
      d3.max(data.features.map((d) => d.properties[this.props.field + '_trimmed'])) /
      this.field_factor_divided_by;

    // update source data event
    this.map.on("sourcedata", (d) => {
      this.updateLegend(
        data.features,
        this.map.queryRenderedFeatures({
          layers: [
            "plants-" +
              this.state.map_style +
              "-" +
              this.map_layer_load_times.toString(),
          ],
        }),
        factor
      );
    });

    // update fuel filter
    d3.selectAll(".fuels-selection")
      .select(".reset")
      .on("mouseover", null)
      .on("mouseout", null)
      .style("opacity", 0.5)
      .style("cursor", "not-allowed");
    d3.selectAll(".fuels-selection")
      .select(".reset text")
      .text(this.filter_text)
      .call(this.props.wrap_long_labels, 88);
    d3.selectAll(".selected")
      .classed("selected", false)
      .style("background", "none");
  }

  setRadius(features) {
    let factor =
      d3.max(features.map((d) => d.properties[this.props.field + '_trimmed'])) /
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
        ["/", ["get", this.props.field + '_trimmed'], factor],
        this.props.max_zoom,
        ["/", ["get", this.props.field + '_trimmed'], factor / this.zoom_factor],
      ]
    );
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
            this.updateTable(table_info);
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
    let init_zoom =
        this.props.window_width < 768
          ? this.props.min_zoom + 0.1
          : this.props.init_zoom,
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
          "<button><span className='mapboxgl-ctrl-icon' aria-haspopup='true' title='zoom to national view'><img src=" + reset_view_icon + " alt='reset_view' width=29 height=29 style='border-radius: 4px'></img></span></button>";
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
        this._container.className = "mapboxgl-ctrl mapbox-legend";
        this._container.innerHTML =
          "<div class='mapboxgl-ctrl-group' aria-haspopup='true'><div><span class='map-zoomable-legend-title'></span></div><div><svg class='map-zoomable-legend'></svg></div></div>";

        return this._container;
      }

      onRemove() {
        this._container.parentNode.removeChild(this._container);
        this._map = undefined;
      }
    }
    this.map.addControl(new Legend(), "bottom-right");

    // init map
    d3.select("#light-v10").property("checked", "checked").dispatch("click");

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
          let nbox = this.props.fuels.length + 2;
          let boxlen = w / nbox > 100 ? 100 : Math.max(w / nbox, 90);
          let boxlen_filter = boxlen, boxlen_reset = boxlen * 1.5;
          
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
            .attr("width", boxlen_filter)
            .attr("height", h);

          fuels_svg
            .append("circle")
            .attr("r", Math.min(boxlen_filter, h * 0.5) / 4)
            .attr("fill", (d) => this.props.fuel_color_lookup[d])
            .attr("cx", boxlen_filter / 2)
            .attr("cy", Math.min(boxlen_filter, h * 0.5) / 2);

          fuels_svg
            .append("text")
            .attr("x", boxlen_filter / 2)
            .attr("y", Math.min(boxlen_filter, h * 0.5) * 1.5)
            .attr("dx", 0)
            .attr("dy", 0)
            .text((d) => this.props.fuel_label_lookup[d])
            .style("text-anchor", "middle")
            .call(this.props.wrap_long_labels, boxlen_filter);

          d3.select(".fuels")
            .insert("div", ".fuel")
            .style("display", "inline-flex")
            .attr("class", "reset no-export-to-pdf")
            .style("opacity", 0.5)
            .style("cursor", "not-allowed")
            .append("svg")
            .attr("width", boxlen_reset)
            .attr("height", h)
            .append("text")
            .attr("x", boxlen_reset / 2)
            .attr("y", h / 3)
            .attr("dx", 0)
            .attr("dy", 0)
            .text(this.filter_text)
            .style("text-anchor", "middle")
            .style("font-weight", "bold")
            .style("font-size", "1.1em")
            .call(this.props.wrap_long_labels, 88);

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
                  n.style("background", this.props.fuel_background_highlight_color);
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
                  n.style("background", this.props.fuel_background_select_color);
                }
              }
            });

          d3.selectAll(".fuel")
            .filter((d) => this.props.avail_fuels.indexOf(d) === -1)
            .style("opacity", 0.3)
            .style("pointer-events", "none");

          // add initial map data
          const data = {
            type: "FeatureCollection",
            features: this.props.plant_data.features.filter(d=>{
              return this.props.avail_fuels.indexOf(d.properties.FUEL) > -1;
            }).map((d) => {
              d.properties[this.props.field +  '_trimmed'] = d.properties[this.props.field];

              if (
                d.properties[this.props.field] >=
                this.props.plant_dist[this.props.field].max
              ) {
                d.properties[this.props.field +  '_trimmed'] = this.props.plant_dist[
                  this.props.field
                ].max;
              }

              if (
                d.properties[this.props.field] <=
                this.props.plant_dist[this.props.field].min
              ) {
                d.properties[this.props.field +  '_trimmed'] = this.props.plant_dist[
                  this.props.field
                ].min;
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
                      : d.features[0].properties[e] === ""
                      ? "-"
                      : d.features[0].properties[e];
                });
                this.updateTable(table_info);
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
                      : d.features[0].properties[e] === ""
                      ? "-"
                      : d.features[0].properties[e];
                });

                this.updateTable(table_info);
                this.setState({
                  table_info: table_info,
                  selected_plant_id: this.hoveredPlantId,
                });
              }
            }
          );

          // set data for map layer, set legend, update zoom event for layer
          if (this.state.selected_fuel.length !== 0) {
            this.updateMapWithFuelFilter();
          } else if (this.state.selected_fuel.length === 0) {
            this.updateMapWithNOFuelFilter();
          }
        }
      );
    });
  }

  render() {
    let title = (
      <p className="title">
        {this.props.title.replace(',', '\n')}
      </p>
    );

    return (
      <div id="map-zoomable-wrapper">
        {title}
        <div
          className="fuels-selection"
          style={{ width: "100%" }}
          ref={this.fuels}
        ></div>
        <div id="map-zoomable">
          <div
            className="map-container"
            style={{
              width: this.props.window_width < 1024 ? "100%" : "62%",
              height: this.props.window_width < 1024 ? 640 : 850,
              verticalAlign: "top",
            }}
            ref={(node) => (this.container = node)}
          />
          <div
            className="table-wrapper"
            style={{
              width: this.props.window_width < 1024 ? "unset" : "37%",
              marginTop: this.props.window_width < 1024 ? 5 : 0,
              marginLeft: 5
            }}
          >
            <UpdatedTable
              title={this.props.title}
              field={this.props.field}
              table_info={this.state.table_info}
              highlight_color={this.props.table_highlight_color}
            />
          </div>
        </div>
      </div>
    );
  }
}

export default PlantLevelMapZoom;
