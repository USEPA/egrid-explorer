import React, { Component } from "react";
import mapboxgl from "mapbox-gl";
import OtherLevelTrends from "./OtherLevelTrends";
import MapboxGeocoder from '@mapbox/mapbox-gl-geocoder';
import '@mapbox/mapbox-gl-geocoder/dist/mapbox-gl-geocoder.css';
import * as d3 from "d3";

import reset_view_icon from "./assets/img/reset_view_icon.jpg";
import UpdatedTable from "./Table";
import ba_topo from "./assets/data/json/Control_Areas_simplified.json";

mapboxgl.accessToken =
  "pk.eyJ1Ijoia2F0aWVsb25nIiwiYSI6ImNpenpudmY1dzAxZmYzM2tmY2tobDN1MXoifQ._aoE2Zj7vx3dUlZw-gBCrg";

class BALevelMapZoom extends Component {


  constructor(props) {
    super(props);

    this._isMounted = false;

    this.legend = React.createRef();
    let table_info = {};
    let trend_info = {};
    Object.keys(this.props.table_rows).forEach((e) => {
      table_info[this.props.table_rows[e]] = "-"
      trend_info[this.props.table_rows[e]] = "-"
    });
    this.state = {
      selected_ba_id: null,
      selected_fuel: [],
      table_info: table_info,
      trend_info: trend_info,
      map_style: null,
      isActive: false,
    };

    this.map_layer_load_times = 0;
    this.field_factor_divided_by = 18;
    this.max_radius = 22;
    this.legend_len = 6;

    this.zoom_factor = this.max_radius / this.field_factor_divided_by;


    this.show_ba_info = false;
    this.hoveredBAId = null;
    this.hoveredBA = null;

    this.tooltip = new mapboxgl.Popup({
      closeButton: true,
      closeOnClick: false,
      focusAfterOpen: false
    });

    this.tooltip2 = new mapboxgl.Popup({
      closeButton: false,
      closeOnClick: false,
      focusAfterOpen: false
    });

    let trendsData = this.props.trendsData,
      sumstat = d3.nest()
        .key(function (d) { return d.name })
        .entries(trendsData), yearLength = sumstat[0].values.length;

    this.queryData = props.ba_data;

    this.updateTable = this.updateTable.bind(this);

  }

  updateTable(table) {
    this.props.getBAData(table);
  }

  formatNumber(d) {
    let num = Math.abs(d);
    if (num < 0.1) {
      return d === 0 ? d : d3.format(".4f")(d);
    } else if (num < 1) {
      return d3.format(".3f")(d);
    } else {
      return isNaN(d) ? "" : d3.format(",.2f")(d);
    }
  }

  formatLegend(d) {
    let num = Math.abs(d);
    if (num < 1) {
      return d === 0 ? d : d3.format(".3f")(d);
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
      return d3.format(".3")(d);
    }
  }

  updateLegend(features, layer_features, factor) {

    // set up scale
    let domainArr = this.props.ba_data.features
      .map((e) => e.properties.value)
      .sort((a, b) => a - b);
    domainArr = domainArr.filter((d, i) => domainArr.indexOf(d) === i);
    let domain = d3.range(this.props.map_fill.length)
      .map((d) => {
        return d3.quantile(domainArr, (d + 1) / this.props.map_fill.length);
      });
    domain = domain.filter((d, i) => domain.indexOf(d) === i);


    // draw legend
    let w = 330,
      h = 75;
    let nbox = this.legend_len;
    let boxlen = w / nbox;

    d3.select(".map-zoomable-legend").selectAll("g").remove();
    d3.select(".map-zoomable-legend-title").html(this.props.unit);

    // get features from visible layer
    let layer_features_extent = d3.extent(
      layer_features.map((d) => d.properties[this.props.field])
    );

    let thresholds = Object.values(domain).slice(0, domain.length + 1);
    let map_fills = Object.values(this.props.map_fill).slice(0, this.props.map_fill.length + 1);

    map_fills.push(this.props.map_fill_max);
    thresholds.push(domain[4]);


    let fill_values;
    let legend_values;

    if (
      layer_features_extent[0] === undefined &&
      layer_features_extent[1] === undefined
    ) {
      legend_values = [];
    } else {
      if (
        layer_features_extent[1] < thresholds.slice(thresholds.length - 1)[0]
      ) {
        thresholds = [
          thresholds.slice(0)[0],
          thresholds.slice(0)[0] +
          (layer_features_extent[1] - thresholds.slice(0)[0]) / 5,
          thresholds.slice(0)[0] +
          ((layer_features_extent[1] - thresholds.slice(0)[0]) * 2) / 5,
          thresholds.slice(0)[0] +
          ((layer_features_extent[1] - thresholds.slice(0)[0]) * 3) / 5,
          thresholds.slice(0)[0] +
          ((layer_features_extent[1] - thresholds.slice(0)[0]) * 4) / 5,
          layer_features_extent[1],
        ];

        if (layer_features_extent[1] <= thresholds.slice(0)[0]) {
          thresholds = [thresholds.slice(0)[0]];
          map_fills = [map_fills.slice(0)[0]];
        }
      }
      legend_values = thresholds.map((d) => d);
      fill_values = map_fills;

    }


    let legend_cells = d3
      .select("#map-zoomable-legend-ba")
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
      .style("fill", (d, i) => fill_values[i])
      .style("stroke", "black")
      .attr("r", 18)
      .attr("cx", boxlen / 2)
      .attr("cy", Math.min(boxlen, h * 0.5) / 2);

    legend_cells
      .append("text")
      .attr("x", boxlen / 2)
      .attr(
        "y",
        Math.min((boxlen, h * 0.5) / 2) + 40
      )
      // toLocaleString()
      .attr("dx", 0)
      .attr("dy", 0)
      .text((d, i) => {
        if (i === 5) {
          if (Math.abs(d) < 1) {
            return "≤" + d.toFixed(3);
          }
          if (Math.abs(d) > 1000 && Math.abs(d) < 1000000) {
            return "≤" + (d / 1000).toFixed(2) + "k";
          }
          if (Math.abs(d) > 1000000 && Math.abs(d) < 1000000000) {
            return "≤" + (d / 1000000).toFixed(2) + "m";
          }
          if (Math.abs(d) > 1000000000) {
            return "≤" + (d / 1000000000).toFixed(2) + "b";
          }
          else {
            return "≤" + d.toFixed(1);
          }
        }
        if (i === 0) {
          if (Math.abs(d) < 1) {
            return "≥" + d.toFixed(3);
          }
          if (Math.abs(d) > 1000 && Math.abs(d) < 1000000) {
            return "≥" + (d / 1000).toFixed(2) + "k";
          }
          if (Math.abs(d) > 1000000 && Math.abs(d) < 1000000000) {
            return "≥" + (d / 1000000).toFixed(2) + "m";
          }
          if (Math.abs(d) > 1000000000) {
            return "≥" + (d / 1000000000).toFixed(2) + "b";
          } else {
            return "≥" + d.toFixed(1);
          }
        } else {
          if (Math.abs(d) < 1) {
            return d.toFixed(3);
          }
          if (Math.abs(d) > 1000 && Math.abs(d) < 1000000) {
            return (d / 1000).toFixed(2) + "k";
          }
          if (Math.abs(d) > 1000000 && Math.abs(d) < 1000000000) {
            return (d / 1000000).toFixed(2) + "m";
          }
          if (Math.abs(d) > 1000000000) {
            return (d / 1000000000).toFixed(2) + "b";
          }
          else {
            return d.toFixed(1);
          }
        }
      })
      .style("text-anchor", "middle");
  }

  updateMap() {
    const data = {
      type: "FeatureCollection",
      features: this.props.ba_data.features
        .map((d) => {
          if (typeof d.properties[this.props.field] !== "number") {
            d.properties[this.props.field] = 0
          }
          d.properties[this.props.field + "_trimmed"] =
            d.properties[this.props.field];
          return d;
        }),
    };

    const ba_topo_data = {
      type: "FeatureCollection",
      features: ba_topo.features
    }

    // update map data
    this.map.getSource("bas").setData(data);
    this.map.getSource("bas_topo").setData(ba_topo_data);
    this.setMapFill();

    // update legend

    // update source data event
    this.map.on("sourcedata", (d) => {
      this.updateLegend(
        data.features,
        this.map.queryRenderedFeatures({
          layers: [
            "bas-" +
            this.state.map_style,
          ],
        }),
      );
    });
  }


  setMapFill() {
    let domainArr = this.props.ba_data.features
      .map((e) => e.properties.value)
      .sort((a, b) => a - b);
    domainArr = domainArr.filter((d, i) => domainArr.indexOf(d) === i);
    let domain = d3.range(this.props.map_fill.length)
      .map((d) => {
        return d3.quantile(domainArr, (d + 1) / this.props.map_fill.length);
      });
    domain = domain.filter((d, i) => domain.indexOf(d) === i);

    this.map.setPaintProperty("bas-" + this.state.map_style, "circle-color", [
      'step',
      ["get", this.props.field + "_trimmed"],
      this.props.map_fill[0],
      domain[0],
      this.props.map_fill[1],
      domain[1],
      this.props.map_fill[2],
      domain[2],
      this.props.map_fill[3],
      domain[3],
      this.props.map_fill[4],
      domain[4],
      this.props.map_fill_max,
    ]);
  }

  componentDidUpdate() {
    if (this.map.loaded()) {
      this.updateMap();
    }
  }


  componentDidMount() {

    this._isMounted = true;

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
          "<button><span className='mapboxgl-ctrl-icon' aria-haspopup='true' title='zoom to national view'><img src=" +
          reset_view_icon +
          " alt='reset_view' width=29 height=29 style='border-radius: 4px'></img></span></button>";
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
            label = window.document.createElement("label");

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
          label.htmlFor = d;
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

    const queryData = this.props.ba_data;

    let forwardGeocoder = (query) => {
      const matchingFeatures = [];

      for (const feature of queryData.features.filter(g => g.properties.Year === this.props.year)) {
        // Handle queries with different capitalization
        // than the source data by calling toLowerCase().

        if (
          (feature.properties.BACODE
            .toLowerCase()
            .includes(query.toLowerCase())) || (feature.title
              .toLowerCase()
              .includes(query.toLowerCase()))
        ) {
          feature['place_name'] = `${feature.title}`;
          feature['center'] = feature.geometry.coordinates;
          matchingFeatures.push(feature);
        }
      }
      return matchingFeatures;
    }


    let geocoder = new MapboxGeocoder({
      accessToken: mapboxgl.accessToken,
      localGeocoder: forwardGeocoder,
      localGeocoderOnly: true,
      placeholder: 'Search balancing authorities',
      mapboxgl: mapboxgl,
      zoom: 5,
      clearOnBlur: false,
      marker: false,
    });
    let geocoderResult;

    this.map.addControl(geocoder, 'top-left');

    geocoder.on('result', (result) => {
      geocoderResult = result;
      let trends = [];
      this.props.data.features.forEach(e => {
        if (geocoderResult.result.id == e.id) {
          trends.push(e);
        }
      })
      clearAll();
      if (this._isMounted) {
        this.map.setFeatureState(
          { source: "bas", id: Number(result.result.id) },
          { hover: false }
        );

        this.map.setFeatureState(
          { source: "bas_topo", id: Number(result.result.id) },
          { selected: true }
        );


        let table_info = {};
        let trend_info = {};
        Object.keys(this.props.table_rows).forEach((e) => {
          table_info[this.props.table_rows[e]] =
            typeof (result.result.properties[e]) === "number" &&
              e !== "BACODE"
              ? this.formatNumber(result.result.properties[e])
              : (result.result.properties[e]) === ""
                ? "-"
                : (result.result.properties[e])
          let sumstat = d3.nest()
            .key(function (l) { return l.year })
            .entries(trends);

          trend_info[this.props.table_rows[e]] =
            typeof sumstat.map(g => g.values.map(p => p.properties[e])) === "number" &&
              e !== "BACODE"
              ? [sumstat.map(g => g.key), this.formatNumber(sumstat.map(g => g.values.map(p => p.properties[e])))]
              : e === "BANAME" || e === "BACODE"
                ? "-"
                : [sumstat.map(l => l.key), sumstat.map(l => l.values.map(p => p.properties[e] >= 0 ? p.properties[e] : "-"))]
        });


        this.updateTable(table_info);
        this.setState({ table_info: table_info, trend_info: trend_info, selected_ba_id: Number(result.result.id) });
        if (this.hoveredBAId) {
          this.map.setFeatureState(
            { source: "bas", id: this.hoveredBAId },
            { hover: false }
          );
          this.map.setFeatureState(
            { source: "bas_topo", id: this.hoveredBAId },
            { hover: false }
          );
        }
        this.hoveredBAId = null;
        this.tooltip.remove();
        this.tooltip2.remove();
        this.show_ba_info = true;


        this.tooltip
          .setLngLat(geocoderResult.result.geometry.coordinates.slice())
          .setHTML(geocoderResult.result.properties.name + " (" + geocoderResult.result.properties.BACODE + ")" + "</br>" + geocoderResult.result.properties.value.toLocaleString(undefined, {
            maximumFractionDigits: 2
          }) + " " + this.props.unit)
          .addTo(this.map);

        d3.selectAll(".mapboxgl-popup-close-button").on("click", () => {
          geocoder.clear();
        });

        d3.selectAll(".region_" + result.result.id)
          .classed("selected", true)
          .style("opacity", 1);
        d3.selectAll(".region_" + result.result.id + " circle")
          .classed("selected", true);
        d3.selectAll(".region_" + result.result.id + " path")
          .classed("selected", true);
        d3.selectAll(".region_" + result.result.id + " text")
          .classed("selected", true);


        d3.selectAll(`.all_trends:not(.selected)`).attr("display", "none");
        d3.selectAll(`.all_trends:not(.selected) circle`).attr("display", "none");
        d3.selectAll(`.all_trends:not(.selected) path`).attr("display", "none");
        d3.selectAll(`.all_trends:not(.selected) text`).attr("display", "none");
        d3.selectAll(`.selected`).attr("display", "block");
      }

      geocoder.on('clear', () => {

        if (this._isMounted) {

          this.map.flyTo({ center: init_center, zoom: init_zoom });
          clearAll();
        }

      });

    });

    let clearAll = () => {
      this.show_ba_info = false;
      this.tooltip.options.anchor = "bottom";
      let table_info = {};
      let trend_info = {};
      Object.keys(this.props.table_rows).forEach((e) => {
        table_info[this.props.table_rows[e]] = "-"
        trend_info[this.props.table_rows[e]] = ["-"]
      });
      this.updateTable(table_info);
      this.setState({ table_info: table_info, trend_info: trend_info });

      if (geocoderResult !== undefined) {
        this.map.setFeatureState(
          { source: "bas", id: geocoderResult.result.id },
          { selected: false }
        )
        this.map.setFeatureState(
          { source: "bas_topo", id: geocoderResult.result.id },
          { selected: false }
        );

      }

      this.map.querySourceFeatures("bas", {
        selected: false
      });
      this.map.querySourceFeatures("bas_topo", {
        selected: false
      });
      this.map.setFeatureState(
        { source: "bas", id: this.state.selected_ba_id },
        { selected: false }
      );
      this.map.setFeatureState(
        { source: "bas_topo", id: this.state.selected_ba_id },
        { selected: false }
      );

      if (this.hoveredBAId) {
        this.map.setFeatureState(
          { source: "bas", id: this.hoveredBAId },
          { hover: false }
        );
        this.map.setFeatureState(
          { source: "bas_topo", id: this.hoveredBAId },
          { hover: false }
        );
      }
      this.tooltip.remove();
      this.hoveredBAId = null;
      this.state.selected_ba_id = null;

      d3.selectAll(".all_trends")
        .classed("selected", false)
        .style("opacity", 0);
      d3.selectAll(".all_trends circle")
        .classed("selected", false);
      d3.selectAll(".all_trends path")
        .classed("selected", false);
      d3.selectAll(".all_trends text")
        .classed("selected", false);


      d3.selectAll(`.all_trends:not(.selected)`).attr("display", "none");
      d3.selectAll(`.all_trends:not(.selected) circle`).attr("display", "none");
      d3.selectAll(`.all_trends:not(.selected) path`).attr("display", "none");
      d3.selectAll(`.all_trends:not(.selected) text`).attr("display", "none");
    }




    // add legends
    class Legend {
      onAdd(map) {
        this._map = map;
        this._container = document.createElement("div");
        this._container.className = "mapboxgl-ctrl mapbox-legend";
        this._container.innerHTML =
          "<div class='mapboxgl-ctrl-group' aria-haspopup='true'><div><span class='map-zoomable-legend-title'></span></div><div><svg class='map-zoomable-legend' id='map-zoomable-legend-ba'></svg></div></div>";

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

          // add initial map data
          const data = {
            type: "FeatureCollection",
            features: this.props.ba_data.features
              .map((d) => {
                d.properties[this.props.field + "_trimmed"] =
                  d.properties[this.props.field];

                return d;
              }),
          };

          const ba_topo_data = {
            type: "FeatureCollection",
            features: ba_topo.features
          }


          // remove source and layer
          if (this.map.getLayer("bas-" + this.state.map_style)) this.map.removeLayer("bas-" + this.state.map_style);
          if (this.map.getSource("bas")) this.map.removeSource("bas");

          // add data source to map
          this.map.addSource("bas", {
            type: "geojson",
            data: data,
          });

          // add data source to map
          this.map.addSource("bas_topo", {
            type: "geojson",
            data: ba_topo_data
          });

          d3.selectAll(`.all_trends :not(.selected)`).attr("display", "none");
          d3.selectAll(`.region_${this.state.selected_ba_id} .selected`).attr("display", "block");


          let BATOPO = this.map.getSource("bas_topo");

          let BATOPOFeatures = BATOPO._data.features;
          BATOPOFeatures.map(feature => Object.assign(feature, { id: feature.properties.ID }));

          this.map.addLayer({

            id: "bas_topo",
            type: "fill",
            source: "bas_topo",
            minzoom: this.props.min_zoom,
            maxzoom: this.props.max_zoom,
            paint: {
              'fill-color': '#627BC1',
              'fill-opacity': [
                'case',
                ['boolean', ['feature-state', 'hover'], false],
                0.5,
                ['boolean', ['feature-state', 'selected'], false],
                0.5,
                0
              ]
            },
          });


          // add map layer
          this.map.addLayer({

            id:
              "bas-" +
              this.state.map_style,
            type: "circle",
            source: "bas",
            minzoom: this.props.min_zoom,
            maxzoom: this.props.max_zoom,
            paint: {
              'circle-radius': 10,
              'circle-stroke-width': 1,
              'circle-stroke-color': "#000"
            },
          });



          // set fill of circles
          this.setMapFill();

          // set selected ba
          this.map.setFeatureState(
            { source: "bas", id: this.state.selected_ba_id },
            { hover: true }
          );

          this.map.setFeatureState(
            { source: "bas_topo", id: this.state.selected_ba_id },
            { hover: true }
          );

          // add interactive events: mouseenter, mouseleave, click
          // this.map.on(
          //   "mousemove",
          //   "bas-" +
          //   this.state.map_style,
          //   (d) => {
          //     d.features.map((g, i) => {
          //       if (d.features[i] != undefined) {
          //         this.hoveredBA = d.features[i]
          //       } else {
          //         this.hoveredBA = d.features[0]
          //       }
          //     })
          //     if (!this.show_ba_info) {
          //       this.map.getCanvas().style.cursor = "pointer";

          //       if (d.features.length > 0) {
          //         if (this.hoveredBAId) {
          //           this.map.setFeatureState(
          //             { source: "bas", id: this.hoveredBAId },
          //             { hover: false }
          //           );
          //           this.map.setFeatureState(
          //             { source: "bas_topo", id: this.hoveredBAId },
          //             { hover: false }
          //           );
          //         }
          //         this.hoveredBAId = this.hoveredBA.id;
          //         this.map.setFeatureState(
          //           { source: "bas", id: this.hoveredBAId },
          //           { hover: true }
          //         );
          //         this.map.setFeatureState(
          //           { source: "bas_topo", id: this.hoveredBAId },
          //           { hover: true }
          //         );
          //       }

          //       while (
          //         Math.abs(
          //           d.lngLat.lng - this.hoveredBA.geometry.coordinates.slice()[0]
          //         ) > 180
          //       ) {
          //         this.hoveredBA.geometry.coordinates.slice()[0] +=
          //           d.lngLat.lng > this.hoveredBA.geometry.coordinates.slice()[0]
          //             ? 360
          //             : -360;
          //       }

          //       this.tooltip
          //         .setLngLat(this.hoveredBA.geometry.coordinates.slice())
          //         .setHTML(this.hoveredBA.properties.name + " (" + this.hoveredBA.properties.BACODE + ")" + "</br>" + this.hoveredBA.properties.value.toLocaleString(undefined, {
          //           maximumFractionDigits: 2
          //         }) + " " + this.props.unit)
          //         .addTo(this.map);

          //       let table_info = {};
          //       let trend_info = {};
          //       Object.keys(this.props.table_rows).forEach((e) => {
          //         table_info[this.props.table_rows[e]] =
          //           typeof this.hoveredBA.properties[e] === "number" &&
          //             e !== "BACODE"
          //             ? this.formatNumber(this.hoveredBA.properties[e])
          //             : this.hoveredBA.properties[e] === ""
          //               ? "-"
          //               : this.hoveredBA.properties[e]
          //         let result = d.features.filter(l => l.properties.Year != undefined);
          //         let deduped = [...new Set(result)]
          //         let sumstat = d3.nest()
          //           .key(function (l) { return l.properties.Year })
          //           .entries(deduped);
          //         trend_info[this.props.table_rows[e]] =
          //           typeof sumstat.map(l => l.values.map(p => p.properties[e])) === "number" &&
          //             e !== "BACODE"
          //             ? [sumstat.map(l => l.key), this.formatNumber(sumstat.map(l => l.values.map(p => p.properties[e])))]
          //             : e === "BANAME" || e === "BACODE"
          //               ? "-"
          //               : [sumstat.map(l => l.key), sumstat.map(l => l.values.map(p => p.properties[e]))]
          //       });
          //       this.updateTable(table_info);
          //       this.setState({ table_info: table_info, trend_info: trend_info });
          //     }
          //   }
          // );

          this.map.on(
            "mouseenter",
            "bas-" +
            this.state.map_style,
            (d) => {
              this.map.getCanvas().style.cursor = "pointer";
              d.features.filter((g, i) => g.properties.Year === undefined)
              this.hoveredBA = d.features[0];
              if (!this.show_ba_info) {
                if (d.features.length > 0) {
                  if (this.hoveredBAId) {
                    this.map.setFeatureState(
                      { source: "bas", id: this.hoveredBAId },
                      { hover: false }
                    );
                    this.map.setFeatureState(
                      { source: "bas_topo", id: this.hoveredBAId },
                      { hover: false }
                    );
                  }
                  this.hoveredBAId = this.hoveredBA.id;
                  this.map.setFeatureState(
                    { source: "bas", id: this.hoveredBAId },
                    { hover: true }
                  );
                  this.map.setFeatureState(
                    { source: "bas_topo", id: this.hoveredBAId },
                    { hover: true }
                  );

                  let id = this.hoveredBAId

                  d3.selectAll(".all_trends.region_" + id)
                    .classed("selected", true)
                    .style("opacity", 1);
                  d3.selectAll(".all_trends.region_" + id + " circle")
                    .classed("selected", true);
                  d3.selectAll(".all_trends.region_" + id + " path")
                    .classed("selected", true);
                  d3.selectAll(".all_trends.region_" + id + " text")
                    .classed("selected", true);

                  d3.selectAll(".all_trends:not(.region_" + id + ")")
                    .classed("selected", false)
                    .style("opacity", 0);
                  d3.selectAll(".all_trends:not(.region_" + id + ") circle")
                    .classed("selected", false);
                  d3.selectAll(".all_trends:not(.region_" + id + ") path")
                    .classed("selected", false);
                  d3.selectAll(".all_trends:not(.region_" + id + ") text")
                    .classed("selected", false);


                  d3.selectAll(`.all_trends:not(.selected)`).attr("display", "none");
                  d3.selectAll(`.all_trends:not(.selected) circle`).attr("display", "none");
                  d3.selectAll(`.all_trends:not(.selected) path`).attr("display", "none");
                  d3.selectAll(`.all_trends:not(.selected) text`).attr("display", "none");
                  d3.selectAll(`.selected`).attr("display", "block");
                }

                while (
                  Math.abs(
                    d.lngLat.lng - this.hoveredBA.geometry.coordinates.slice()[0]
                  ) > 180
                ) {
                  this.hoveredBA.geometry.coordinates.slice()[0] +=
                    d.lngLat.lng > this.hoveredBA.geometry.coordinates.slice()[0]
                      ? 360
                      : -360;
                }

                this.tooltip
                  .setLngLat(this.hoveredBA.geometry.coordinates.slice())
                  .setHTML(this.hoveredBA.properties.name + " (" + this.hoveredBA.properties.BACODE + ")" + "</br>" + this.hoveredBA.properties.value.toLocaleString(undefined, {
                    maximumFractionDigits: 2
                  }) + " " + this.props.unit).addTo(this.map);


                let table_info = {};
                let trend_info = {};

                Object.keys(this.props.table_rows).forEach((e) => {
                  table_info[this.props.table_rows[e]] =
                    typeof this.hoveredBA.properties[e] === "number" &&
                      e !== "BACODE"
                      ? this.formatNumber(this.hoveredBA.properties[e])
                      : this.hoveredBA.properties[e] === ""
                        ? "-"
                        : this.hoveredBA.properties[e];
                  let trends = [];
                  this.props.data.features.forEach(e => {
                    if (+e.id === this.hoveredBA.id) {
                      trends.push(e)
                    }
                  })
                  let result = trends.filter(l => l.year != undefined);
                  let deduped = [...new Set(result)]
                  let sumstat = d3.nest()
                    .key(function (l) { return l.year })
                    .entries(deduped);

                  trend_info[e] =
                    typeof sumstat.map(l => l.values.map(p => p.properties[e])) === "number" &&
                      e !== "BACODE"
                      ? [sumstat.map(l => l.key), this.formatNumber(sumstat.map(l => l.values.map(p => p.properties[e] > 0 ? p.properties[e] : "-")))]
                      : e === "BANAME" || e === "BACODE"
                        ? "-"
                        : [sumstat.map(l => l.key), sumstat.map(l => l.values.map(p => p.properties[e] > 0 ? p.properties[e] : "-"))]
                  return d;
                });
                this.updateTable(table_info);
                this.setState({ table_info: table_info, trend_info: trend_info });
              } else {
                this.tooltip2
                  .setLngLat(this.hoveredBA.geometry.coordinates.slice())
                  .setHTML(this.hoveredBA.properties.name + " (" + this.hoveredBA.properties.BACODE + ")" + "</br>" + this.hoveredBA.properties.value.toLocaleString(undefined, {
                    maximumFractionDigits: 2
                  }) + " " + this.props.unit).addTo(this.map);
              }
            }
          );

          this.map.on(
            "mouseleave",
            "bas-" +
            this.state.map_style,
            () => {
              this.map.getCanvas().style.cursor = ""

              if (!this.show_ba_info) {
                this.tooltip.remove();
                if (this.hoveredBAId) {
                  this.map.setFeatureState(
                    { source: "bas", id: this.hoveredBAId },
                    { hover: false }
                  );
                  this.map.setFeatureState(
                    { source: "bas_topo", id: this.hoveredBAId },
                    { hover: false }
                  );
                }
                this.hoveredBAId = null;

              } else {
                this.tooltip2.remove();
                if (this.hoveredBAId) {
                  this.map.setFeatureState(
                    { source: "bas", id: this.hoveredBAId },
                    { hover: true }
                  );
                  this.map.setFeatureState(
                    { source: "bas_topo", id: this.hoveredBAId },
                    { hover: true }
                  );

                }
              }
            }
          );

          this.map.on(
            "click",
            "bas-" +
            this.state.map_style,
            (d) => {
              let id = this.hoveredBA.id;

              d.features.filter((g, i) => g.properties.Year === undefined)
              this.hoveredBA = d.features[0];
              if (geocoderResult !== undefined) {
                this.map.querySourceFeatures("bas_topo", {
                  selected: false
                });
                this.map.setFeatureState(
                  { source: "bas_topo", id: Number(geocoderResult.result.id) },
                  { selected: false }
                );
              }
              this.tooltip.remove();
              this.tooltip2.remove();
              if (this.hoveredBA.id === this.state.selected_ba_id) {
                this.show_ba_info = false;

                d3.selectAll(".region_" + id)
                  .classed("selected", false)
                  .style("opacity", 0);
                d3.selectAll(".region_" + id + " circle")
                  .classed("selected", false);
                d3.selectAll(".region_" + id + " path")
                  .classed("selected", false);
                d3.selectAll(".region_" + id + " text")
                  .classed("selected", false);

              } else {
                this.show_ba_info = true;

                let prev_id = this.state.selected_ba_id;

                d3.selectAll(".region_" + id)
                  .classed("selected", true)
                  .style("opacity", 1);
                d3.selectAll(".region_" + id + " circle")
                  .classed("selected", true);
                d3.selectAll(".region_" + id + " path")
                  .classed("selected", true);
                d3.selectAll(".region_" + id + " text")
                  .classed("selected", true);

                d3.selectAll(".region_" + prev_id)
                  .classed("selected", false)
                  .style("opacity", 0);
                d3.selectAll(".region_" + prev_id + " circle")
                  .classed("selected", false);
                d3.selectAll(".region_" + prev_id + " path")
                  .classed("selected", false);
                d3.selectAll(".region_" + prev_id + " text")
                  .classed("selected", false);



                if (d.features.length > 0) {
                  if (this.hoveredBAId) {
                    this.map.setFeatureState(
                      { source: "bas", id: this.hoveredBAId },
                      { hover: false }
                    );
                    this.map.setFeatureState(
                      { source: "bas_topo", id: this.hoveredBAId },
                      { hover: false }
                    );
                  }
                  this.hoveredBAId = this.hoveredBA.id;
                  this.map.setFeatureState(
                    { source: "bas", id: this.hoveredBAId },
                    { hover: true }
                  );
                  this.map.setFeatureState(
                    { source: "bas_topo", id: this.hoveredBAId },
                    { hover: true }
                  );
                }

                this.tooltip
                  .setLngLat(this.hoveredBA.geometry.coordinates.slice())
                  .setHTML(this.hoveredBA.properties.name + " (" + this.hoveredBA.properties.BACODE + ")" + "</br>" + this.hoveredBA.properties.value.toLocaleString(undefined, {
                    maximumFractionDigits: 2
                  }) + " " + this.props.unit)
                  .addTo(this.map);

                let table_info = {};
                let trend_info = {};
                Object.keys(this.props.table_rows).forEach((e) => {
                  table_info[this.props.table_rows[e]] =
                    typeof this.hoveredBA.properties[e] === "number" &&
                      e !== "BACODE"
                      ? this.formatNumber(this.hoveredBA.properties[e])
                      : this.hoveredBA.properties[e] === ""
                        ? "-"
                        : this.hoveredBA.properties[e];
                  let trends = [];
                  this.props.data.features.forEach(e => {
                    if (+e.id === this.hoveredBA.id) {
                      trends.push(e)
                    }
                  })
                  let result = trends.filter(l => l.year != undefined);
                  let deduped = [...new Set(result)]
                  let sumstat = d3.nest()
                    .key(function (l) { return l.year })
                    .entries(deduped);

                  trend_info[e] =
                    typeof sumstat.map(l => l.values.map(p => p.properties[e])) === "number" &&
                      e !== "BACODE"
                      ? [sumstat.map(l => l.key), this.formatNumber(sumstat.map(l => l.values.map(p => p.properties[e] > 0 ? p.properties[e] : "-")))]
                      : e === "BANAME" || e === "BACODE"
                        ? "-"
                        : [sumstat.map(l => l.key), sumstat.map(l => l.values.map(p => p.properties[e] > 0 ? p.properties[e] : "-"))]
                  return d;
                });
                this.updateTable(table_info);
                this.setState({
                  table_info: table_info,
                  trend_info: trend_info,
                  selected_ba_id: this.hoveredBAId,
                });

                d3.selectAll(".mapboxgl-popup-close-button").on("click", () => {
                  clearAll();
                });

              }

              d3.selectAll(`.all_trends:not(.selected)`).attr("display", "none");
              d3.selectAll(`.all_trends:not(.selected) circle`).attr("display", "none");
              d3.selectAll(`.all_trends:not(.selected) path `).attr("display", "none");
              d3.selectAll(`.all_trends:not(.selected) text `).attr("display", "none");
              d3.selectAll(`.selected`).attr("display", "block");
            }
          );


          this.updateMap();
        }
      );
    });
  }

  componentWillUnmount() {
    this._isMounted = false;
  }


  render() {
    let title = <p className="title">{this.props.title.replace(",", "\n")}</p>;

    return (
      <div id="map-zoomable-wrapper">
        {title}
        <div id="map-zoomable">
          <div style={{
            display: "flex",
            flexDirection: "column",
            width: this.props.window_width < 1024 ? "100%" : "62%",
          }}>
            <div
              style={{
                width: "100%",
                height: this.props.window_width < 1024 ? 640 : 850,
                verticalAlign: "top",
              }}
              className="map-container"
              ref={(node) => (this.container = node)}
            >
            </div>
            {/* <OtherLevelTrends
              title={this.props.title}
              data={this.props.data}
              window_width={this.props.window_width}
              window_height={this.props.window_height}
              width={
                this.init_window_width < 800
                  ? this.init_window_width * 0.8
                  : 650
              }
              barchart_sort={this.props.barchart_sort}
              height={150}
              margin_top={10}
              margin_bottom={30}
              margin_right={30}
              margin_left={60}
              field={this.props.field}
              us_data={this.props.us_data}
              usTrendsData={this.props.usTrendsData}
              layer_type={this.props.layer_type}
              unit={this.props.unit}
              map_fill={this.props.map_fill}
              map_fill_max={this.props.map_fill_max}
              trendsData={this.props.trendsData}
            /> */}
          </div>
          <div
            className="table-wrapper"
            style={{
              width: this.props.window_width < 1024 ? "unset" : "37%",
              marginTop: this.props.window_width < 1024 ? 5 : 0,
              marginLeft: 5,
            }}
          >
            <UpdatedTable
              title={this.props.title}
              field={this.props.table_rows[this.props.field]}
              table_info={this.state.table_info}
              trend_info={this.state.trend_info}
              highlight_color={this.props.table_highlight_color}
              trendsData={this.props.trendsData}
              year={this.props.year}
              map_fill={this.props.map_fill}
            />
          </div>
        </div>
      </div>
    );
  }
}


export default BALevelMapZoom;
