import React, { Component } from "react";
import Spinner from "react-bootstrap/Spinner";
import * as d3 from "d3";
import * as _ from "underscore";

import lookup from "./assets/data/json/eGRID lookup.json";
import lookup_pollutant from "./assets/data/json/eGRID pollutant lookup.json";

import OtherLevelMap from "./OtherLevelMap";
import OtherLevelMapLegend from "./OtherLevelMapLegend";
import OtherLevelBarchart from "./OtherLevelBarchart";
import OtherLevelTrends from "./OtherLevelTrends";
import PlantLevelMapZoom from "./PlantLevelMapZoom";
import BALevelMapZoom from "./BaLevelMapZoom";

import ResourceMixChart from "./ResourceMixChart";
import GGLChart from "./GGLChart";
import Dialog from "./Dialog.js";

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
      tier3: this.props.tier3,
      tier4: this.props.tier4,
      tier5: this.props.tier5,
      barchart_sort: false,
      data: [],
      trendsData: [],
      us_data: [],
      us_data_trends: [],
      resource_mix_data: [],
      resource_mix_data_trends: [],
      ba_data: [],
      ba_data_map_only: [],
      specific_ba_data_export: {},
      plant_avail_fuels: [],
      plant_data: [],
      plant_data_map_only: [],
      specific_plant_data_export: {},
      fuels: [],
      map_fill: [],
      map_fill_max: [],
      background_layer: {},
      layer: {},
      show_alert: false
    };
    this.init_window_width = window.innerWidth;

    this.getPlantData = this.getPlantData.bind(this);

    this.getBAData = this.getBAData.bind(this);
  }

  getPlantData(table) {
    this.setState({ specific_plant_data_export: table });
  }

  getBAData(table) {
    this.setState({ specific_ba_data_export: table });
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

  componentWillUnmount() {
    window.removeEventListener("resize", () => {
      this.setState().unsubscribe();
    });
  }

  componentDidUpdate(prevProps) {
    if (this.props.field !== prevProps.field) {
      this.updateState();
    }
  }

  updateState() {
    let category = lookup[this.props.tier1],
      region = lookup[this.props.tier4];
    let choropleth_data = [],
      trends_data = [],
      plant_data = { type: "FeatureCollection", features: [] },
      plant_data_map_only = { type: "FeatureCollection", features: [] },
      ba_data = { type: "FeatureCollection", features: [] },
      ba_data_map_only = { type: "FeatureCollection", features: [] },
      resource_mix_data = [],
      resource_mix_data_trends = [],
      fuels = [],
      map_fill = [],
      map_fill_max = [],
      plant_avail_fuels = [],
      background_layer = { type: "FeatureCollection", features: [] },
      layer = { type: "FeatureCollection", features: [] };

    // set state depending on region and category
    const us_data = this.props.us_data.filter(d => +d.Year === +lookup[this.props.tier5]).map((d) => {
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

    // set state depending on region and category
    let us_data_trends = this.props.us_data.map((d) => {
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
    let trendsData = []
    if (region === "eGRID subregion") {
      data = this.props.subrgn_data.filter(d => +d.Year === +lookup[this.props.tier5]);
      layer = this.props.subrgn_layer;
      trendsData = this.props.subrgn_data;
    } else if (region === "NERC region") {
      data = this.props.nerc_data.filter(d => +d.Year === +lookup[this.props.tier5]);
      layer = +lookup[this.props.tier5] === 2018 ? this.props.nerc2018_layer : (+lookup[this.props.tier5] === 2019 ? this.props.nerc2019_layer : this.props.nerc2020_layer);
      trendsData = this.props.nerc_data;
    } else if (region === "state") {
      data = this.props.state_data.filter(d => +d.Year === +lookup[this.props.tier5]);
      layer = this.props.state_layer;
      trendsData = this.props.state_data;
    } else if (region === "plant") {
      // data = this.props.plant_data.filter(d => +d.Year === +lookup[this.props.tier5]);
      data = this.props.plant_data.filter(d => +d.Year === +lookup[this.props.tier5]);
      trendsData = this.props.plant_data;
    } else if (region === "balancing authority") {
      // data = this.props.ba_data.filter(d => +d.Year === +lookup[this.props.tier5]);
      data = this.props.ba_data.filter(d => +d.Year === +lookup[this.props.tier5]);
      layer = this.props.ba_layer;
      trendsData = this.props.ba_data;
    }

    if (category === "grid gross loss rates") {
      choropleth_data = this.props.ggl_data.filter(d => {
        d.value = `${parseFloat(d.value.substring(0, 4)).toFixed(1)}%`;
        return +d.Year === +lookup[this.props.tier5]
      });
      layer = this.props.ggl_layer;
      background_layer = this.props.state_layer;
    } else if (category === "resource mix (%)") {
      fuels = this.props.field.replace(/\[|\]|\s/g, "").split(",");
      resource_mix_data = data;
      resource_mix_data_trends = trendsData;
    } else {
      fuels = this.props.plant_fuels;

      if (category.split("emission").length > 1) {
        map_fill = this.props.choropleth_map_fill.emission;
        map_fill_max = this.props.choropleth_map_fill_max.emission;
      } else if (category.split("generation").length > 1) {
        map_fill = this.props.choropleth_map_fill.generation;
        map_fill_max = this.props.choropleth_map_fill_max.generation;
      } else if (
        category.split("non-baseload").length > 1 ||
        category.split("heat input").length > 1 ||
        category.split("nameplate").length > 1
      ) {
        map_fill = this.props.choropleth_map_fill.others;
        map_fill_max = this.props.choropleth_map_fill_max.others;
      }
      choropleth_data = data.map((d) => {
        return {
          name: d.name,
          id: d.id,
          label: d.label,
          unit: this.props.unit,
          type: region !== "plant" ? lookup[this.props.tier4] : d.FUEL,
          value: d[this.props.field],
          year: d.Year,
        };
      });

      trends_data = trendsData.map((d) => {
        return {
          name: d.label,
          id: d.id,
          label: d.label,
          unit: this.props.unit,
          type: region !== "plant" ? lookup[this.props.tier4] : d.FUEL,
          value: d[this.props.field],
          year: d.Year,
        };
      });

      us_data_trends = us_data_trends.map((d) => {
        return {
          name: d.name,
          id: d.id,
          label: d.name,
          unit: this.props.unit,
          type: region !== "plant" ? lookup[this.props.tier4] : d.FUEL,
          value: d[this.props.field],
          year: d.Year,
        };
      });

      if (region === "plant") {
        if (
          (lookup[this.props.tier1] === "total generation (MWh)" || lookup[this.props.tier1] === "heat input (MMBtu)") &
          (lookup[this.props.tier2] !== "all fuels")
        ) {
          plant_avail_fuels = this.props.fuel_sentence_code_lookup[lookup[this.props.tier2]];
        } else if ((lookup[this.props.tier1] === "output emission rates (lb/MWh)" || lookup[this.props.tier1] === "input emission rates (lb/MMBtu)") &
          (lookup[this.props.tier3] !== "all fuels")) {
          plant_avail_fuels = this.props.fuel_sentence_code_lookup[lookup[this.props.tier3]];
        } else {
          plant_avail_fuels = this.props.plant_fuels;
        }

        data.forEach((d) => {
          d.value = d[this.props.field];
          if (d.id && d.value > 0) {
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
                    "Year",
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
                    "NUMGEN",
                  ],
                  this.props.options
                    .map((d) => d["Final field name in eGRID"])
                    .filter((d) => d.startsWith("PL")),
                ])
              ),
              id: d.id,
              title: d.name,
              geometry: { type: "Point", coordinates: [+d.LON, +d.LAT] },
              year: d.Year,
            });
          }
        });

        trendsData.forEach((d) => {
          d.value = d[this.props.field];
          plant_data.features.push({
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
                  "NUMGEN",
                ],
                this.props.options
                  .map((d) => d["Final field name in eGRID"])
                  .filter((d) => d.startsWith("PL")),
              ])
            ),
            id: d.id,
            title: d.name,
            geometry: { type: "Point", coordinates: [+d.LON, +d.LAT] },
            year: d.Year,
          });
        });
      }
      if (region === "balancing authority") {
        data.forEach((d) => {
          d.value = d[this.props.field];
          if (d.id && d.value > 0) {
            ba_data_map_only.features.push({
              type: "Feature",
              properties: _.pick(
                d,
                _.flatten([
                  [
                    "label",
                    "name",
                    "id",
                    "value",
                    "BACODE",
                    "ID",
                    "Year",
                    "BANAME",
                    "BANAMEPCAP",
                    "BANGENAN",
                    "BAHTIANT",
                    "BANOXAN",
                    "BANOXOZ",
                    "BASO2AN",
                    "BACO2AN",
                    "BACH4AN",
                    "BAN2OAN",
                    "BACO2EQA",
                    "BANOXRTA",
                    "BANOXRTO",
                    "BASO2RTA",
                    "BACO2RTA",
                    "BACH4RTA",
                    "BAN2ORTA",
                    "BAC2ERTA",
                    "BANOXCRT",
                    "BANOXCRO",
                    "BASO2CRT",
                    "BACO2CRT",
                    "BACH4CRT",
                    "BAN2OCRT",
                    "BAC2ECRT",
                  ],
                  this.props.options
                    .map((d) => d["Final field name in eGRID"])
                    .filter((d) => d.startsWith("BA")),
                ])
              ),
              id: d.id,
              title: d.name,
              geometry: { type: "Point", coordinates: [d.POINT_X, d.POINT_Y] },
              year: d.Year
            });

          }

        });

        trendsData.forEach((d) => {
          d.value = d[this.props.field];
          ba_data.features.push({
            type: "Feature",
            properties: _.pick(
              d,
              _.flatten([
                [
                  "label",
                  "name",
                  "id",
                  "value",
                  "BACODE",
                  "ID",
                  "Year",
                  "BANAME",
                  "BANAMEPCAP",
                  "BANGENAN",
                  "BAHTIANT",
                  "BANOXAN",
                  "BANOXOZ",
                  "BASO2AN",
                  "BACO2AN",
                  "BACH4AN",
                  "BAN2OAN",
                  "BACO2EQA",
                  "BANOXRTA",
                  "BANOXRTO",
                  "BASO2RTA",
                  "BACO2RTA",
                  "BACH4RTA",
                  "BAN2ORTA",
                  "BAC2ERTA",
                  "BANOXCRT",
                  "BANOXCRO",
                  "BASO2CRT",
                  "BACO2CRT",
                  "BACH4CRT",
                  "BAN2OCRT",
                  "BAC2ECRT",
                ],
                this.props.options
                  .map((d) => d["Final field name in eGRID"])
                  .filter((d) => d.startsWith("BA")),
              ])
            ),
            id: d.id,
            title: d.name,
            geometry: { type: "Point", coordinates: [d.POINT_X, d.POINT_Y] },
            year: d.Year
          });
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
        tier3: this.props.tier3,
        tier4: this.props.tier4,
        tier5: this.props.tier5,
        data: choropleth_data,
        trendsData: trends_data,
        us_data: us_data,
        us_data_trends: us_data_trends,
        resource_mix_data: resource_mix_data,
        resource_mix_data_trends: resource_mix_data_trends,
        plant_data: plant_data,
        plant_data_map_only: plant_data_map_only,
        plant_avail_fuels: plant_avail_fuels,
        ba_data: ba_data,
        ba_data_map_only: ba_data_map_only,
        fuels: fuels,
        map_fill: map_fill,
        map_fill_max: map_fill_max,
        layer: layer,
        background_layer: background_layer,
        show_alert: false
      },
      () => {
        // update export
        d3.selectAll(".export-vis").on("click", () => {
          window.print();
        });
        d3.select("#export-table").on("click", () => {
          let export_table, filename = this.state.name, csv = "data:text/csv;charset=utf-8,";

          if (+this.state.tier1 !== 7 && +this.state.tier1 !== 9) {
            if (+this.state.tier4 === 99) {
              if (this.state.specific_plant_data_export["Plant Name"] !== undefined && this.state.specific_plant_data_export["Plant Name"] !== "-") {
                Object.keys(this.props.plant_table_rows).forEach((c, i) => {
                  let row_name = this.props.plant_table_rows[c].split(' ').map(w => Object.keys(lookup_pollutant).indexOf(w) > -1 ? lookup_pollutant[w] : w).join(' ');
                  csv +=
                    '"' +
                    row_name +
                    '","' +
                    this.state.specific_plant_data_export[this.props.plant_table_rows[c]] +
                    '"\r\n';
                  if (i === 0) csv += "Year, " + lookup[this.props.tier5] + "\r\n";
                });
                filename = this.state.specific_plant_data_export["Plant Name"] + ',' + this.state.name.split(',').splice(-1);
              } else {
                this.setState({ show_alert: true });
                return;
              }
            } else if (+this.state.tier4 === 98) {
              if (this.state.specific_ba_data_export["Balancing Authority Name"] !== undefined && this.state.specific_ba_data_export["Balancing Authority Name"] !== "-") {
                Object.keys(this.props.ba_table_rows).forEach((c, i) => {
                  let row_name = this.props.ba_table_rows[c].split(' ').map(w => Object.keys(lookup_pollutant).indexOf(w) > -1 ? lookup_pollutant[w] : w).join(' ');
                  csv +=
                    '"' +
                    row_name +
                    '","' +
                    this.state.specific_ba_data_export[this.props.ba_table_rows[c]] +
                    '"\r\n';
                  if (i === 0) csv += "Year, " + lookup[this.props.tier5] + "\r\n";
                });
                filename = this.state.specific_ba_data_export["Plant Name"] + ',' + this.state.name.split(',').splice(-1);
              } else {
                this.setState({ show_alert: true });
                return;
              }
            } else {
              let title = this.state.name.replace(/,/g, "").split(' ').map(w => Object.keys(lookup_pollutant).indexOf(w) > -1 ? lookup_pollutant[w] : w).join(' ');
              export_table = _.flatten([
                this.state.us_data.map(d => { d.value = this.state.us_data[0][this.props.field]; return d; }),
                this.state.data,
              ]);

              csv += "Region, " + title + "\r\n";
              export_table.forEach((r) => {
                csv +=
                  r.name.toString().replace(/,/g, " ") + "," + r.value + "\r\n";
              });
            }
          } else if (+this.state.tier1 === 7) {
            export_table = _.flatten([
              this.state.us_data[0],
              this.state.resource_mix_data,
              this.state.resource_mix_data_trends,
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
            csv +=
              "Region, Associated eGRID Subregions, Grid Gross Loss Rates (%)\r\n";
            export_table.forEach((r) => {
              csv += r.name + ',"' + r.subregion + '",' + r.value + "\r\n";
            });
          }

          let encodedUri = encodeURI(csv);
          let link = document.createElement("a");
          link.setAttribute("href", encodedUri);
          link.setAttribute("target", "_blank");
          link.setAttribute("download", filename + ".csv");
          document.body.appendChild(link);
          link.click();
        });
      }
    );
  }

  render() {
    let category = lookup[this.props.tier1],
      region = lookup[this.props.tier4];
    const plant_dist = this.props.plant_dist;
    const ba_dist = this.props.ba_dist;
    const fuel_label_lookup = this.props.fuel_label_lookup;
    const fuel_color_lookup = this.props.fuel_color_lookup;
    const table_highlight_color = this.props.table_highlight_color;
    const resourcemix_micromap_highlight_color = this.props
      .resourcemix_micromap_highlight_color;
    const fuel_background_highlight_color = this.props
      .fuel_background_highlight_color;
    const fuel_background_select_color = this.props
      .fuel_background_select_color;
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
              data={this.state.data}
              trendsData={this.state.trendsData}
              window_width={this.state.window_width}
              window_height={this.state.window_height}
              width={
                this.init_window_width > 1280 ? 1280 : this.init_window_width
              }
              map_width={
                this.init_window_width > 1280 ? 650 : this.init_window_width
              }
              table_width={450}
              margin_top={5}
              scale={
                this.init_window_width > 1280
                  ? 812.5
                  : this.init_window_width * 0.78
              }
              height={500}
              layer={this.props.ggl_layer}
              us_data={this.state.us_data}
              usTrendsData={this.state.us_data_trends}
              background_layer={this.props.state_layer}
              field={this.state.field}
              layer_type={category}
              map_fill={this.state.map_fill}
              map_fill_max={this.state.map_fill_max}
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
            trendsData={this.state.resource_mix_data_trends}
            window_width={this.state.window_width}
            window_height={this.state.window_height}
            width={
              this.init_window_width > 1280 ? 1280 : this.init_window_width
            }
            ipad_width={768}
            table_width={400}
            barchart_height={600}
            filter_height={120}
            margin_top={20}
            margin_right={10}
            margin_left={region === "state" ? 155 : 60}
            layer={this.state.layer}
            us_data={this.state.us_data_trends}
            unit={this.props.unit}
            fuels={this.state.fuels}
            category={category}
            region={region}
            year={+lookup[this.state.tier5]}
            field={this.state.field}
            layer_type={region}
            fuel_label_lookup={fuel_label_lookup}
            fuel_color_lookup={fuel_color_lookup}
            table_highlight_color={table_highlight_color}
            resourcemix_micromap_highlight_color={
              resourcemix_micromap_highlight_color
            }
            fuel_background_highlight_color={fuel_background_highlight_color}
            fuel_background_select_color={fuel_background_select_color}
            fuel_name_lookup={fuel_name_lookup}
            wrap_long_labels={wrap_long_labels}
          />
        </div>
      );
    } else {
      if (region !== "plant" && region !== "balancing authority") {
        vis =
          this.state.data.length === 0 ? (
            <div className="loading">
              <Spinner animation="grow" variant="success" />
            </div>
          ) : (
            <div className="visualization-wrapper">
              <div className="wrapper map-wrapper">
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
                    this.init_window_width < 768
                      ? this.init_window_width
                      : 812.5
                  }
                  layer={this.state.layer}
                  us_data={this.state.us_data}
                  unit={this.state.unit}
                  field={this.state.field}
                  layer_type={region}
                  map_fill={this.state.map_fill}
                  map_fill_max={this.state.map_fill_max}
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
                  map_fill_max={this.state.map_fill_max}
                  unit={this.state.unit}
                />
                <OtherLevelTrends title={this.state.name}
                  data={this.state.data}
                  window_width={this.state.window_width}
                  window_height={this.state.window_height}
                  width={
                    this.init_window_width < 768
                      ? this.init_window_width * 0.8
                      : 650
                  }
                  barchart_sort={this.state.barchart_sort}
                  height={150}
                  margin_top={10}
                  margin_bottom={30}
                  margin_right={30}
                  margin_left={60}
                  field={this.state.field}
                  us_data={this.state.us_data}
                  usTrendsData={this.state.us_data_trends}
                  layer_type={region}
                  unit={this.state.unit}
                  map_fill={this.state.map_fill}
                  map_fill_max={this.state.map_fill_max}
                  trendsData={this.state.trendsData}></OtherLevelTrends>
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
                  height={750}
                  margin_top={40}
                  margin_bottom={0}
                  margin_right={85}
                  margin_left={region === "state" ? 155 : 60}
                  field={this.state.field}
                  us_data={this.state.us_data}
                  layer_type={region}
                  unit={this.state.unit}
                  map_fill={this.state.map_fill}
                  map_fill_max={this.state.map_fill_max}
                  trendsData={this.state.trendsData}
                  usTrendsData={this.state.us_data_trends}
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
                data={this.state.plant_data}
                table_rows={this.props.plant_table_rows}
                window_width={this.state.window_width}
                window_height={this.state.window_height}
                filter_height={100}
                fuels={this.state.fuels}
                avail_fuels={this.state.plant_avail_fuels}
                init_center={[-96.922211, 37.381266]}
                init_zoom={3.3}
                min_zoom={2}
                max_zoom={15}
                circle_opacity={0.8}
                unit={this.state.unit}
                field={this.state.field}
                year={+lookup[this.state.tier5]}
                plant_dist={plant_dist}
                trendsData={this.state.trendsData}
                fuel_label_lookup={fuel_label_lookup}
                fuel_color_lookup={fuel_color_lookup}
                table_highlight_color={table_highlight_color}
                fuel_background_highlight_color={
                  fuel_background_highlight_color
                }
                fuel_background_select_color={fuel_background_select_color}
                wrap_long_labels={wrap_long_labels}
                getPlantData={this.getPlantData}
                map_fill={this.state.map_fill}
                map_fill_max={this.state.map_fill_max}
                us_data={this.state.us_data}
                usTrendsData={this.state.us_data_trends}
                layer_type={region}
              />
              {this.state.show_alert && <Dialog
                id="no-selected-plant-alert"
                title=""
                show={this.state.show_alert}
                onHide={() => this.setState({ show_alert: false })}
              />}
            </div>
          );
      } else if (region === "balancing authority") {
        vis =
          this.state.data.length === 0 ? (
            <div className="loading">
              <Spinner animation="grow" variant="success" />
            </div>
          ) : (
            <div className="visualization-wrapper">
              <BALevelMapZoom
                title={this.state.name}
                ba_data={this.state.ba_data_map_only}
                data={this.state.ba_data}
                table_rows={this.props.ba_table_rows}
                window_width={this.state.window_width}
                window_height={this.state.window_height}
                filter_height={100}
                init_center={[-96.922211, 37.381266]}
                circle_opacity={0.8}
                init_zoom={3.3}
                min_zoom={2}
                max_zoom={15}
                unit={this.state.unit}
                year={+lookup[this.state.tier5]}
                field={this.state.field}
                ba_dist={ba_dist}
                trendsData={this.state.trendsData}
                table_highlight_color={table_highlight_color}
                wrap_long_labels={wrap_long_labels}
                getBAData={this.getBAData}
                map_fill={this.state.map_fill}
                map_fill_max={this.state.map_fill_max}
                us_data={this.state.us_data}
                usTrendsData={this.state.us_data_trends}
                layer_type={region}


              />
              {/* {this.state.show_alert && <Dialog
                id="no-selected-plant-alert"
                title=""
                show={this.state.show_alert}
                onHide={() => this.setState({ show_alert: false })}
              />} */}
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

  componentWillUnmount() {
    window.removeEventListener("resize", () => {
      this.setState().unsubscribe();
    });
  }

  render() {
    return (
      <div>
        <div id="visualization-wrapper">
          <Visualization
            className="visualization-wrapper"
            options={this.props.options}
            choropleth_map_fill={this.props.choropleth_map_fill}
            choropleth_map_fill_max={this.props.choropleth_map_fill_max}
            plant_fuels={this.props.plant_fuels}
            plant_dist={this.props.plant_dist}
            ba_dist={this.props.ba_dist}
            fuel_label_lookup={this.props.fuel_label_lookup}
            fuel_color_lookup={this.props.fuel_color_lookup}
            table_highlight_color={this.props.table_highlight_color}
            resourcemix_micromap_highlight_color={
              this.props.resourcemix_micromap_highlight_color
            }
            fuel_background_highlight_color={
              this.props.fuel_background_highlight_color
            }
            fuel_background_select_color={this.props.fuel_background_select_color}
            ggl_fill_color={this.props.ggl_fill_color}
            fuel_sentence_code_lookup={this.props.fuel_sentence_code_lookup}
            plant_table_rows={this.props.plant_table_rows}
            ba_table_rows={this.props.ba_table_rows}
            wrap_long_labels={this.props.wrap_long_labels}
            field={this.props.field}
            name={this.props.name}
            unit={this.props.unit}
            tier1={this.props.tier1}
            tier2={this.props.tier2}
            tier3={this.props.tier3}
            tier4={this.props.tier4}
            tier5={this.props.tier5}
            ba_data={this.props.ba_data}
            plant_data={this.props.plant_data}
            state_data={this.props.state_data}
            subrgn_data={this.props.subrgn_data}
            nerc_data={this.props.nerc_data}
            ggl_data={this.props.ggl_data}
            us_data={this.props.us_data}
            state_layer={this.props.state_layer}
            subrgn_layer={this.props.subrgn_layer}
            ba_layer={this.props.ba_layer}
            nerc2018_layer={this.props.nerc2018_layer}
            nerc2019_layer={this.props.nerc2019_layer}
            nerc2020_layer={this.props.nerc2020_layer}
            ggl_layer={this.props.ggl_layer}
          />
        </div>
        <div
          className="no-export-to-pdf buttons-wrapper"
          style={{
            textAlign: this.state.window_width < 1024 ? "center" : "left",
          }}
        >
          <div>
            <b>Export view as: </b>
            {lookup[this.props.tier4] !== "plant" && (
              <input
                type="button"
                className="export-vis btn-primary-outline graphics-icon"
                value="Graphics"
              />
            )}
            {lookup[this.props.tier4] === "plant" && (
              <input
                type="button"
                className="export-vis btn-primary-outline graphics-icon"
                value="Graphics"
              />
            )}{" "}
            <input
              type="button"
              id="export-table"
              value="Data"
              className="btn-primary-outline data-icon"
            />
          </div>
          <div>
            <a href="https://www.epa.gov/egrid/download-data"
              target="_blank"
              rel="noopener noreferrer">Download complete eGRID data</a>
          </div>
        </div>
      </div>
    );
  }
}

export default UpdatedVisualization;
