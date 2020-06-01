import React, { Component } from "react";
import Spinner from "react-bootstrap/Spinner";
import * as d3 from "d3";
import * as _ from "underscore";

import lookup from "./assets/data/json/eGRID lookup.json";

import OtherLevelMap from "./OtherLevelMap";
import OtherLevelMapLegend from "./OtherLevelMapLegend";
import OtherLevelBarchart from "./OtherLevelBarchart";
import PlantLevelMapZoom from "./PlantLevelMapZoom";
import PlantLevelMapStatic from "./PlantLevelMapStatic";
import ResourceMixChart from "./ResourceMixChart";

class Visualization extends Component {
  constructor(props) {
    super(props);

    this.state = {
      window_width: window.innerWidth,
      window_height: window.innerHeight,
      field: this.props.field,
      name: this.props.name,
      unit: this.props.unit,
      tier1: this.props.tier1,
      tier2: this.props.tier2,
      tier4: this.props.tier4,
      tier5: this.props.tier5,
      data: [],
      us_data: [],
      resource_mix_data: [],
      plant_data: [],
      plant_data_map_only: [],
      fuels: [],
      map_fill: [],
      background_layer: {},
      layer: {},
    };

    this.init_window_width = window.innerWidth;
  }

  componentDidMount() {
    this.updateState();
    window.addEventListener("resize", () => {
      this.setState({
        window_width: window.innerWidth,
        window_height: window.innerHeight,
      });
    });
  }

  componentDidUpdate(prevProps) {
    if (this.props.field !== prevProps.field) {
      this.updateState();
    }
  }

  updateState() {
    let category = lookup[this.props.tier1],
      region = lookup[this.props.tier5];
    let choropleth_data = [],
      plant_data = { type: "FeatureCollection", features: [] },
      plant_data_map_only = { type: "FeatureCollection", features: [] },
      resource_mix_data = [],
      fuels = [],
      map_fill = [],
      background_layer = { type: "FeatureCollection", features: [] },
      layer = { type: "FeatureCollection", features: [] };

    // set state depending on region and category
    const us_data = this.props.us_data.map((d) => {
      Object.keys(d).forEach((e) => {
        if (e.split("US").length > 1) {
          d[
            this.props.field
              .replace(/\[|\]|\s/g, "")
              .split(",")[0]
              .substring(0, 2) + e.substring(2)
          ] = d[e];
        }
      });
      return d;
    });

    let data = [];
    if (region === "eGRID subregion") {
      data = this.props.subrgn_data;
      layer = this.props.subrgn_layer;
    } else if (region === "NERC region") {
      data = this.props.nerc_data;
      layer = this.props.nerc_layer;
    } else if (region === "state") {
      data = this.props.state_data;
      layer = this.props.state_layer;
    } else if (region === "Plant") {
      data = this.props.plant_data;
    }

    if (category === "grid gross loss rates") {
      choropleth_data = this.props.ggl_data;
      layer = this.props.ggl_layer;
      background_layer = this.props.state_layer;
    } else if (category === "resource mix (%)") {
      fuels = this.props.field.replace(/\[|\]|\s/g, "").split(",");
      resource_mix_data = data;
    } else {
      if (category.split("emission").length > 1) {
        map_fill = this.props.choropleth_map_fill.emission;
      } else if (category.split("generation").length > 1) {
        map_fill = this.props.choropleth_map_fill.generation;
      } else if (
        category.split("non-baseload").length > 1 ||
        category.split("heat input").length > 1 ||
        category.split("nameplate").length > 1
      ) {
        map_fill = this.props.choropleth_map_fill.others;
      }

      choropleth_data = data.map((d) => {
        return {
          name: d.name,
          id: d.id,
          label: d.label,
          unit: this.props.unit,
          type: region !== "Plant" ? lookup[this.props.tier5] : d.FUEL,
          value: d[this.props.field],
        };
      });

      if (region === "Plant") {
        fuels = this.props.plant_fuels;
        data.forEach((d) => {
          d.value = d[this.props.field];
          if (d.value > 0) {
            plant_data.features.push({
              type: "Feature",
              properties: d,
              id: d.id,
              title: d.name,
              geometry: { type: "Point", coordinates: [+d.LON, +d.LAT] },
            });
            plant_data_map_only.features.push({
              type: "Feature",
              properties: _.pick(
                d,
                _.flatten([
                  [
                    "label",
                    "name",
                    "id",
                    "value",
                    "PSTATABB",
                    "PNAME",
                    "ORISPL",
                    "CAPFAC",
                    "SUBRGN",
                    "PLPRMFL",
                    "SECFUEL",
                    "PLNAMEPCAP",
                    "FUEL",
                  ],
                  this.props.options
                    .map((d) => d["Final field name in eGRID"])
                    .filter((d) => d.startsWith("PL")),
                ])
              ),
              id: d.id,
              title: d.name,
              geometry: { type: "Point", coordinates: [+d.LON, +d.LAT] },
            });
          }
        });
      }
    }

    this.setState(
      {
        field: this.props.field,
        name: this.props.name,
        unit: this.props.unit,
        tier1: this.props.tier1,
        tier2: this.props.tier2,
        tier4: this.props.tier4,
        tier5: this.props.tier5,
        data: choropleth_data,
        us_data: us_data,
        resource_mix_data: resource_mix_data,
        plant_data: plant_data,
        plant_data_map_only: plant_data_map_only,
        fuels: fuels,
        map_fill: map_fill,
        layer: layer,
        background_layer: background_layer,
      },
      () => {
        // update export table
        d3.select("#export-table").on("click", () => {
          let export_table,
            csv = "data:text/csv;charset=utf-8,";

          if (+this.state.tier1 !== 7 && +this.state.tier1 !== 9) {
            if (+this.state.tier5 === 99) {
              export_table = this.state.plant_data.features.map(
                (d) => d.properties
              );
            } else {
              export_table = this.state.data;
            }
            csv += "Region, Units(" + this.state.unit + ")\r\n";
            export_table.forEach((r) => {
              csv +=
                r.name.toString().replace(/,/g, " ") + "," + r.value + "\r\n";
            });
          } else if (+this.state.tier1 === 7) {
            export_table = _.flatten([
              this.state.us_data[0],
              this.state.resource_mix_data,
            ]);

            let fuel_name_lookup = {};
            this.state.fuels.forEach((d) => {
              if (d.endsWith("CLPR")) {
                fuel_name_lookup[d] = "COAL";
              } else if (d.endsWith("OLPR")) {
                fuel_name_lookup[d] = "OIL";
              } else if (d.endsWith("GSPR")) {
                fuel_name_lookup[d] = "GAS";
              } else if (d.endsWith("NCPR")) {
                fuel_name_lookup[d] = "NUCLEAR";
              } else if (d.endsWith("HYPR")) {
                fuel_name_lookup[d] = "HYDRO";
              } else if (d.endsWith("BMPR")) {
                fuel_name_lookup[d] = "BIOMASS";
              } else if (d.endsWith("WIPR")) {
                fuel_name_lookup[d] = "WIND";
              } else if (d.endsWith("SOPR")) {
                fuel_name_lookup[d] = "SOLAR";
              } else if (d.endsWith("GTPR")) {
                fuel_name_lookup[d] = "GEOTHERMAL";
              } else if (d.endsWith("OFPR")) {
                fuel_name_lookup[d] = "OFSL";
              } else if (d.endsWith("OPPR")) {
                fuel_name_lookup[d] = "OTHF";
              } else if (d.endsWith("HYPR")) {
                fuel_name_lookup[d] = "HYPR";
              } else if (d.endsWith("THPR")) {
                fuel_name_lookup[d] = "THPR";
              } else if (d.endsWith("TNPR")) {
                fuel_name_lookup[d] = "TNPR";
              } else if (d.endsWith("CYPR")) {
                fuel_name_lookup[d] = "CYPR";
              } else if (d.endsWith("CNPR")) {
                fuel_name_lookup[d] = "CNPR";
              }
            });

            csv +=
              "Region," +
              Object.keys(fuel_name_lookup)
                .map((c) => this.props.fuel_label_lookup[fuel_name_lookup[c]])
                .join(",") +
              "\r\n";

            export_table.forEach((r) => {
              csv += r.name + ",";
              csv += Object.keys(fuel_name_lookup)
                .map((c) => r[c].toString() + "%")
                .join(",");
              csv += "\r\n";
            });
          } else if (+this.state.tier1 === 9) {
            export_table = this.state.data;
            csv += "Region, Percentage\r\n";
            export_table.forEach((r) => {
              csv += r.name + "," + r.value.toString() + "%" + "\r\n";
            });
          }
          let encodedUri = encodeURI(csv);
          let link = document.createElement("a");
          link.setAttribute("href", encodedUri);
          link.setAttribute("target", "_blank");
          link.setAttribute("download", this.state.name + ".csv");
          document.body.appendChild(link);
          link.click();
        });
      }
    );
  }

  render() {
    let category = lookup[this.props.tier1],
      region = lookup[this.props.tier5];
    const plant_outlier = this.props.plant_outlier;
    const fuel_label_lookup = this.props.fuel_label_lookup;
    const fuel_color_lookup = this.props.fuel_color_lookup;
    const wrap_long_labels = this.props.wrap_long_labels;
    let fuel_name_lookup = {};
    this.state.fuels.forEach((d) => {
      if (d.endsWith("CLPR")) {
        fuel_name_lookup[d] = "COAL";
      } else if (d.endsWith("OLPR")) {
        fuel_name_lookup[d] = "OIL";
      } else if (d.endsWith("GSPR")) {
        fuel_name_lookup[d] = "GAS";
      } else if (d.endsWith("NCPR")) {
        fuel_name_lookup[d] = "NUCLEAR";
      } else if (d.endsWith("HYPR")) {
        fuel_name_lookup[d] = "HYDRO";
      } else if (d.endsWith("BMPR")) {
        fuel_name_lookup[d] = "BIOMASS";
      } else if (d.endsWith("WIPR")) {
        fuel_name_lookup[d] = "WIND";
      } else if (d.endsWith("SOPR")) {
        fuel_name_lookup[d] = "SOLAR";
      } else if (d.endsWith("GTPR")) {
        fuel_name_lookup[d] = "GEOTHERMAL";
      } else if (d.endsWith("OFPR")) {
        fuel_name_lookup[d] = "OFSL";
      } else if (d.endsWith("OPPR")) {
        fuel_name_lookup[d] = "OTHF";
      } else if (d.endsWith("HYPR")) {
        fuel_name_lookup[d] = "HYPR";
      } else if (d.endsWith("THPR")) {
        fuel_name_lookup[d] = "THPR";
      } else if (d.endsWith("TNPR")) {
        fuel_name_lookup[d] = "TNPR";
      } else if (d.endsWith("CYPR")) {
        fuel_name_lookup[d] = "CYPR";
      } else if (d.endsWith("CNPR")) {
        fuel_name_lookup[d] = "CNPR";
      }
    });

    let vis;
    if (category === "grid gross loss rates") {
      vis = (
        <OtherLevelMap
          title={this.state.name}
          data={this.props.ggl_data}
          window_width={this.state.window_width}
          window_height={this.state.window_height}
          width={
            this.init_window_width < 768 ? this.init_window_width*0.8 : 700
          }
          ipad_width={768}
          height={600}
          scale={
            this.init_window_width  < 768
              ? this.init_window_width
              : 875
          }
          layer={this.props.ggl_layer}
          us_data={this.state.us_data}
          background_layer={this.props.state_layer}
          field={this.state.field}
          layer_type={category}
          map_fill={this.state.map_fill}
        />
      );
    } else if (category === "resource mix (%)") {
      vis = (
        <ResourceMixChart
          title={this.state.name}
          data={this.state.resource_mix_data}
          window_width={this.state.window_width}
          window_height={this.state.window_height}
          width={
            this.init_window_width > 1280? 1280: this.init_window_width
          }
          ipad_width={768}
          table_width={385}
          barchart_height={600}
          filter_height={100}
          margin_top={20}
          margin_right={10}
          margin_left={region==="state"?155:60}
          layer={this.state.layer}
          us_data={this.state.us_data}
          unit={this.props.unit}
          fuels={this.state.fuels}
          category={category}
          region={region}
          field={this.state.field}
          layer_type={region}
          fuel_label_lookup={fuel_label_lookup}
          fuel_color_lookup={fuel_color_lookup}
          fuel_name_lookup={fuel_name_lookup}
          wrap_long_labels={wrap_long_labels}
        />
      );
    } else {
      if (region !== "Plant") {
        vis =
          this.state.data.length === 0 ? (
            <div className="loading">
              <Spinner animation="grow" variant="success" />
            </div>
          ) : (
            <div style={{ textAlign: "center" }}>
              <div style={{ display: "inline-block", verticalAlign: "top" }}>
                <OtherLevelMap
                  title={this.state.name}
                  data={this.state.data}
                  window_width={this.state.window_width}
                  window_height={this.state.window_height}
                  width={
                    this.init_window_width < 768
                      ? this.init_window_width*0.8
                      : 600
                  }
                  ipad_width={768}
                  height={600}
                  scale={
                    this.init_window_width < 768
                      ? this.init_window_width
                      : 750
                  }
                  layer={this.state.layer}
                  us_data={this.state.us_data}
                  unit={this.state.unit}
                  field={this.state.field}
                  layer_type={region}
                  map_fill={this.state.map_fill}
                />
                <OtherLevelMapLegend
                  window_width={this.state.window_width}
                  window_height={this.state.window_height}
                  width={
                    this.init_window_width < 768
                      ? this.init_window_width*0.8
                      : 600
                  }
                  ipad_width={768}
                  height={50}
                  data={this.state.data}
                  field={this.state.field}
                  map_fill={this.state.map_fill}
                  unit={this.state.unit}
                />
              </div>
              <div style={{ display: "inline-block", verticalAlign: "top" }}>
                <OtherLevelBarchart
                  title={this.state.name}
                  data={this.state.data}
                  window_width={this.state.window_width}
                  window_height={this.state.window_height}
                  width={
                    this.init_window_width < 768
                      ? this.init_window_width*0.8
                      : 350
                  }
                  height={600}
                  margin_top={40}
                  margin_bottom={0}
                  margin_right={70}
                  margin_left={region==="state"?155:60}
                  field={this.state.field}
                  us_data={this.state.us_data}
                  layer_type={region}
                  unit={this.state.unit}
                  map_fill={this.state.map_fill}
                />
              </div>
            </div>
          );
      } else if (region === "Plant") {
        vis =
          this.state.data.length === 0 ? (
            <div className="loading">
              <Spinner animation="grow" variant="success" />
            </div>
          ) : (
            <div style={{ textAlign: "center" }}>
              <PlantLevelMapZoom
                title={this.state.name}
                plant_data={this.state.plant_data_map_only}
                static_map_scale={900}
                data={this.state.data}
                window_width={this.state.window_width}
                window_height={this.state.window_height}
                fuels={this.state.fuels}
                init_center={[-97.922211, 42.381266]}
                init_zoom={3}
                min_zoom={2}
                max_zoom={15}
                circle_opacity={0.8}
                unit={this.state.unit}
                field={this.state.field}
                plant_outlier={plant_outlier}
                fuel_label_lookup={fuel_label_lookup}
                fuel_color_lookup={fuel_color_lookup}
                wrap_long_labels={wrap_long_labels}
              />
              <PlantLevelMapStatic
                title={this.state.name}
                scale={900}
                window_width={this.state.window_width}
                window_height={this.state.window_height}
                background_layer={this.props.state_layer}
              />
            </div>
          );
      }
    }
    return <div style={{ textAlign: "center" }}>{vis}</div>;
  }
}

class UpdatedVisualization extends Component {
  constructor(props) {
    super(props);
    this.exportStaticMap = this.exportStaticMap.bind(this);
    this.exportVis = this.exportVis.bind(this);
  }

  exportStaticMap() {
    let zoomable_status = d3.select("#map-zoomable").style("display");
    let static_status = d3.select("#map-static").style("display");
    d3.select("#map-zoomable").style("display", "none");
    d3.select("#map-static").style("display", null);
    window.print();
    d3.select("#map-zoomable").style("display", zoomable_status);
    d3.select("#map-static").style("display", static_status);
  }

  exportVis() {
    window.print();
  }

  render() {
    return (
      <div>
        <div style={{ marginBottom: "1rem" }} className="no-export">
          <input
            style={{
              padding: "5px",
              borderRadius: "4px",
            }}
            type="button"
            id="export-table"
            value="Export Table"
          />{" "}
          {lookup[this.props.tier5] !== "Plant" && (
            <input
              style={{
                padding: "5px",
                borderRadius: "4px",
              }}
              type="button"
              value="Export Visualization"
              onClick={this.exportVis}
            />
          )}
          {lookup[this.props.tier5] === "Plant" && (
            <input
              style={{
                padding: "5px",
                borderRadius: "4px",
              }}
              type="button"
              value="Export Zoomable Map"
              onClick={this.exportVis}
            />
          )}
          {lookup[this.props.tier5] === "Plant" && " "}
          {lookup[this.props.tier5] === "Plant" && (
            <input
              style={{
                padding: "5px",
                borderRadius: "4px",
              }}
              type="button"
              value="Export Static Map"
              onClick={this.exportStaticMap}
            />
          )}
        </div>
        <Visualization
          style={{ textAlign: "center" }}
          options={this.props.options}
          choropleth_map_fill={this.props.choropleth_map_fill}
          plant_fuels={this.props.plant_fuels}
          plant_outlier={this.props.plant_outlier}
          fuel_label_lookup={this.props.fuel_label_lookup}
          fuel_color_lookup={this.props.fuel_color_lookup}
          wrap_long_labels={this.props.wrap_long_labels}
          field={this.props.field}
          name={this.props.name}
          unit={this.props.unit}
          tier1={this.props.tier1}
          tier2={this.props.tier2}
          tier4={this.props.tier4}
          tier5={this.props.tier5}
          plant_data={this.props.plant_data}
          state_data={this.props.state_data}
          subrgn_data={this.props.subrgn_data}
          nerc_data={this.props.nerc_data}
          ggl_data={this.props.ggl_data}
          us_data={this.props.us_data}
          state_layer={this.props.state_layer}
          subrgn_layer={this.props.subrgn_layer}
          nerc_layer={this.props.nerc_layer}
          ggl_layer={this.props.ggl_layer}
        />
      </div>
    );
  }
}

export default UpdatedVisualization;
