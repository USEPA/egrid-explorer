import React, { Component } from "react";
import Spinner from "react-bootstrap/Spinner";
import * as d3 from "d3";
import * as _ from "underscore";

import lookup from "./assets/data/json/eGRID lookup.json";

import OtherLevelMap from "./OtherLevelMap";
import OtherLevelMapLegend from "./OtherLevelMapLegend";
import OtherLevelBarchart from "./OtherLevelBarchart";
import PlantLevelMapZoom from "./PlantLevelMapZoom";

import ResourceMixChart from "./ResourceMixChart";
import GGLChart from "./GGLChart";
import Dialog from "./Dialog";

class Visualization extends Component {
  constructor(props) {
    super(props);

    this.state = {
      window_width: window.innerWidth,
      window_height: window.innerHeight,
      field: this.props.field,
      name: this.props.name,
      title: this.props.title,
      unit: this.props.unit,
      tier1: this.props.tier1,
      tier2: this.props.tier2,
      tier4: this.props.tier4,
      tier5: this.props.tier5,
      barchart_sort: false,
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
    this.plant_avail_fuels = ["COAL", "OIL", "GAS", "NUCLEAR", "HYDRO", "BIOMASS", "WIND", "SOLAR", "GEOTHERMAL", "OFSL", "OTHF"];
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
    } else if (region === "plant") {
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
          type: region !== "plant" ? lookup[this.props.tier5] : d.FUEL,
          value: d[this.props.field],
        };
      });

      if (region === "plant") {
        const fuel_sentence_code_lookup = this.props.fuel_sentence_code_lookup;
        if (lookup[this.props.tier1]==="total generation (MWh)" & lookup[this.props.tier2]!=="all fuels") {
          this.plant_avail_fuels = fuel_sentence_code_lookup[lookup[this.props.tier2]];
        }
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
                    "NUMUNT",
                    "NUMGEN"
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
        title: this.props.title,
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
        // update export
        d3.selectAll(".export-vis").on("click", () => {
          window.print();
        });
        d3.select("#export-table").on("click", () => {
          let export_table,
            csv = "data:text/csv;charset=utf-8,";

          if (+this.state.tier1 !== 7 && +this.state.tier1 !== 9) {
            if (+this.state.tier5 === 99) {
              export_table = this.state.plant_data.features.filter(
                d=>this.plant_avail_fuels.indexOf(d.properties.FUEL)>-1
              ).map(
                (d) => d.properties
              );
            } else {
              export_table = this.state.data;
            }
            csv += "Region, " + this.state.title.replace(/,/g, '') + "\r\n";
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
            csv += "Region, Associated eGRID Subregions, Grid Gross Loss Rates (%)\r\n";
            export_table.forEach((r) => {
              csv += r.name + ",\"" + r.subregion + "\"," + r.value + "\r\n";
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
    const plant_dist = this.props.plant_dist;
    const fuel_label_lookup = this.props.fuel_label_lookup;
    const fuel_color_lookup = this.props.fuel_color_lookup;
    const table_highlight_color = this.props.table_highlight_color;
    const resourcemix_micromap_highlight_color=this.props.resourcemix_micromap_highlight_color;
    const fuel_background_highlight_color=this.props.fuel_background_highlight_color;
    const fuel_background_select_color=this.props.fuel_background_select_color;
    const ggl_fill_color = this.props.ggl_fill_color;
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
        <div className="visualization-wrapper">
          <div className="wrapper">
            <GGLChart
              title={this.state.name}
              data={this.props.ggl_data}
              window_width={this.state.window_width}
              window_height={this.state.window_height}
              width={this.init_window_width > 1280 ? 1280 : this.init_window_width}
              map_width={this.init_window_width > 1280 ? 650 : this.init_window_width}
              table_width={450}
              margin_top={5}
              scale={this.init_window_width > 1280 ? 812.5 : this.init_window_width*0.78}
              height={550}
              layer={this.props.ggl_layer}
              us_data={this.state.us_data}
              background_layer={this.props.state_layer}
              field={this.state.field}
              layer_type={category}
              map_fill={this.state.map_fill}
              ggl_fill_color={ggl_fill_color}
              table_highlight_color={this.props.table_highlight_color}
            />
          </div>
        </div>
      );
    } else if (category === "resource mix (%)") {
      vis = (
        <div className="visualization-wrapper">
          <ResourceMixChart
            title={this.state.name}
            data={this.state.resource_mix_data}
            window_width={this.state.window_width}
            window_height={this.state.window_height}
            width={this.init_window_width > 1280 ? 1280 : this.init_window_width}
            ipad_width={768}
            table_width={400}
            barchart_height={600}
            filter_height={130}
            margin_top={20}
            margin_right={10}
            margin_left={region === "state" ? 155 : 60}
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
            table_highlight_color={table_highlight_color}
            resourcemix_micromap_highlight_color={resourcemix_micromap_highlight_color}
            fuel_background_highlight_color={fuel_background_highlight_color}
            fuel_background_select_color={fuel_background_select_color}
            fuel_name_lookup={fuel_name_lookup}
            wrap_long_labels={wrap_long_labels}
          />
        </div>
      );
    } else {
      if (region !== "plant") {
        vis =
          this.state.data.length === 0 ? (
            <div className="loading">
              <Spinner animation="grow" variant="success" />
            </div>
          ) : (
            <div className="visualization-wrapper">
              <div className="wrapper">
                <OtherLevelMap
                  title={this.state.name}
                  data={this.state.data}
                  window_width={this.state.window_width}
                  window_height={this.state.window_height}
                  width={
                    this.init_window_width < 768
                      ? this.init_window_width * 0.8
                      : 650
                  }
                  ipad_width={768}
                  height={550}
                  scale={
                    this.init_window_width < 768 ? this.init_window_width : 812.5
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
                      ? this.init_window_width * 0.8
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
              <div className="wrapper">
                <OtherLevelBarchart
                  title={this.state.name}
                  data={this.state.data}
                  window_width={this.state.window_width}
                  window_height={this.state.window_height}
                  width={
                    this.init_window_width < 768
                      ? this.init_window_width * 0.8
                      : 400
                  }
                  barchart_sort={this.state.barchart_sort}
                  height={580}
                  margin_top={40}
                  margin_bottom={0}
                  margin_right={85}
                  margin_left={region === "state" ? 155 : 60}
                  field={this.state.field}
                  us_data={this.state.us_data}
                  layer_type={region}
                  unit={this.state.unit}
                  map_fill={this.state.map_fill}
                />
              </div>
            </div>
          );
      } else if (region === "plant") {
        vis =
          this.state.data.length === 0 ? (
            <div className="loading">
              <Spinner animation="grow" variant="success" />
            </div>
          ) : (
            <div className="visualization-wrapper">
              <PlantLevelMapZoom
                title={this.state.name}
                plant_data={this.state.plant_data_map_only}
                data={this.state.data}
                window_width={this.state.window_width}
                window_height={this.state.window_height}
                fuels={this.state.fuels}
                avail_fuels={this.plant_avail_fuels}
                init_center={[-96.922211, 38.381266]}
                init_zoom={3.3}
                min_zoom={2}
                max_zoom={15}
                circle_opacity={0.8}
                unit={this.state.unit}
                field={this.state.field}
                plant_dist = {plant_dist}
                fuel_label_lookup={fuel_label_lookup}
                fuel_color_lookup={fuel_color_lookup}
                table_highlight_color={table_highlight_color}
                fuel_background_highlight_color={fuel_background_highlight_color}
                fuel_background_select_color={fuel_background_select_color}
                wrap_long_labels={wrap_long_labels}
              />
            </div>
          );
      }
    }
    return <div>{vis}</div>;
  }
}

class UpdatedVisualization extends Component {
  constructor(props) {
    super(props);
    this.state = {
      window_width: window.innerWidth,
    };
  }

  componentDidMount() {
    window.addEventListener("resize", () => {
      this.setState({
        window_width: window.innerWidth,
      });
    });
  }

  render() {
    return (
      <div>
        <Visualization
          className="visualization-wrapper"
          options={this.props.options}
          choropleth_map_fill={this.props.choropleth_map_fill}
          plant_fuels={this.props.plant_fuels}
          plant_dist={this.props.plant_dist}
          fuel_label_lookup={this.props.fuel_label_lookup}
          fuel_color_lookup={this.props.fuel_color_lookup}
          table_highlight_color={this.props.table_highlight_color}
          resourcemix_micromap_highlight_color={this.props.resourcemix_micromap_highlight_color}
          fuel_background_highlight_color={this.props.fuel_background_highlight_color}
          fuel_background_select_color={this.props.fuel_background_select_color}
          ggl_fill_color={this.props.ggl_fill_color}
          fuel_sentence_code_lookup={this.props.fuel_sentence_code_lookup}
          wrap_long_labels={this.props.wrap_long_labels}
          field={this.props.field}
          title={this.props.title}
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
        <div
          className="no-export-to-pdf buttons-wrapper"
          style={{
            textAlign: this.state.window_width < 1024 ? "center" : "left",
          }}
        >
          <input
            type="button"
            id="export-table"
            value="Export Table"
          />{" "}
          {lookup[this.props.tier5] !== "plant" && (
            <input
              type="button"
              className="export-vis"
              value="Export Visualization"
            />
          )}
          {lookup[this.props.tier5] === "plant" && (
            <input
              type="button"
              className="export-vis"
              value="Export Zoomable Map"
            />
          )}
          {" "}
          <a
            href="https://www.epa.gov/sites/production/files/2020-03/egrid2018_data_v2.xlsx"
            target="_blank"
            rel="noopener noreferrer"
          >
            <input
              type="button"
              value="Download eGRID2018 data"
            />
          </a>{" "}
          <a
            href="https://www.epa.gov/energy/forms/egrid-and-power-profiler-feedback-and-questions"
            target="_blank"
            rel="noopener noreferrer"
          >
            <input
              type="button"
              value="Feedback or Questions"
            />
          </a>
        </div>
      </div>
    );
  }
}

export default UpdatedVisualization;
