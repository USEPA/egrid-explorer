import React, { Component } from "react";
import Spinner from "react-bootstrap/Spinner";
import Button from "react-bootstrap/Button";

import * as d3 from "d3";

import lookup from "../assets/data/json/eGRID lookup.json";

import coal from "../assets/img/coal.svg";
import gas from "../assets/img/gas.svg";
import hydro from "../assets/img/hydro.svg";
import nuclear from "../assets/img/nuclear.svg";
import oil from "../assets/img/oil.svg";
import papaya from "../assets/img/papaya.svg";
import solar from "../assets/img/solar.svg";
import wind from "../assets/img/wind.svg";

import OtherLevelMap from "./OtherLevelMap";
import OtherLevelMapLegend from "./OtherLevelMapLegend";
import OtherLevelBarchart from "./OtherLevelBarchart";
import PlantLevelMapZoom from "./PlantLevelMapZoom";
import PlantLevelMapStatic from "./PlantLevelMapStatic";
import ResourceMixChart from "./ResourceMixChart";

import "./Visualization.css";

class Visualization extends Component {
  constructor(props) {
    super(props);
    console.log(props);

    this.state = {
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
      fuels: [],
      map_fill: [],
      background_layer: {},
      layer: {},
    };
  }

  componentDidMount() {
    this.updateState();
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
        map_fill = ["#eff3ff", "#bdd7e7", "#6baed6", "#3182bd", "#08519c"];
      } else if (category.split("generation").length > 1) {
        map_fill = ["#feedde", "#fdbe85", "#fd8d3c", "#e6550d", "#a63603"];
      } else if (
        category.split("non-baseload").length > 1 ||
        category.split("heat input").length > 1 ||
        category.split("nameplate").length > 1
      ) {
        map_fill = ["#edf8e9", "#bae4b3", "#74c476", "#31a354", "#006d2c"];
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
        fuels = [
          "COAL",
          "OIL",
          "GAS",
          "NUCLEAR",
          "HYDRO",
          "BIOMASS",
          "WIND",
          "SOLAR",
          "GEOTHERMAL",
          "OFSL",
          "OTHF",
        ];
        data.map((d) => {
          plant_data.features.push({
            type: "Feature",
            properties: d,
            id: d.id,
            title: d.name,
            geometry: { type: "Point", coordinates: [+d.LON, +d.LAT] },
          });
        });
      }
    }

    this.setState({
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
      fuels: fuels,
      map_fill: map_fill,
      layer: layer,
      background_layer: background_layer,
    });
  }

  render() {
    let category = lookup[this.props.tier1],
      region = lookup[this.props.tier5];
    const plant_outlier = {
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
    const fuel_label_lookup = {
      COAL: "Coal",
      OIL: "Oil",
      GAS: "Gas",
      NUCLEAR: "Nuclear",
      HYDRO: "Hydro",
      BIOMASS: "Biomass",
      WIND: "Wind",
      SOLAR: "Solar",
      GEOTHERMAL: "Geothermal",
      OFSL: "Other Fossil",
      OTHF: "Other Unknown",
      HYPR: "Hydro",
      THPR: "All Non-Hydro Renewables",
      TNPR: "All Non-Renewables",
      CYPR: "All Combustion",
      CNPR: "All Non-Combustion",
    };
    const fuel_color_lookup = {
      COAL: "rgb(85, 85, 85)",
      OIL: "rgb(237, 28, 36)",
      GAS: "rgb(246, 139, 40)",
      NUCLEAR: "rgb(207, 74, 154)",
      HYDRO: "rgb(0, 129, 197)",
      BIOMASS: "rgb(44, 160, 44)",
      WIND: "rgb(13, 177, 75)",
      SOLAR: "rgb(215, 201, 68)",
      GEOTHERMAL: "rgb(255, 152, 150)",
      OFSL: "rgb(140, 86, 75)",
      OTHF: "rgb(255, 239, 213)",
      HYPR: "rgb(0, 129, 197)",
      THPR: "rgb(13, 177, 75)",
      TNPR: "rgb(255, 187, 120)",
      CYPR: "rgb(237, 28, 36)",
      CNPR: "rgb(255, 187, 120)",
    };
    const fuel_icon_lookup = {
      COAL: coal,
      OIL: oil,
      GAS: gas,
      NUCLEAR: nuclear,
      HYDRO: hydro,
      BIOMASS: "",
      WIND: wind,
      SOLAR: solar,
      GEOTHERMAL: "",
      OFSL: "",
      OTHF: papaya,
      HYPR: "",
      THPR: "",
      TNPR: "",
      CYPR: "",
      CNPR: "",
    };
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

    const wrap_long_labels = function (text, width) {
      text.each(function () {
        var text = d3.select(this),
          words = text.text().split(/\s+/).reverse(),
          word,
          line = [],
          lineNumber = 0,
          lineHeight = 1.1, // ems
          x = text.attr("x"),
          y = text.attr("y"),
          dy = parseFloat(text.attr("dy")),
          tspan = text
            .text(null)
            .append("tspan")
            .attr("x", x)
            .attr("y", y)
            .attr("dy", dy + "em");
        while ((word = words.pop())) {
          line.push(word);
          tspan.text(line.join(" "));
          if (tspan.node().getComputedTextLength() > width) {
            line.pop();
            tspan.text(line.join(" "));
            line = [word];
            tspan = text
              .append("tspan")
              .attr("x", x)
              .attr("y", y)
              .attr("dy", ++lineNumber * lineHeight + dy + "em")
              .text(word);
          }
        }
      });
    };

    let vis;
    if (category === "grid gross loss rates") {
      vis = (
        <OtherLevelMap
          title={this.state.name}
          width={800}
          height={600}
          scale={800}
          data={this.props.ggl_data}
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
          width={800}
          height={600}
          data={this.state.resource_mix_data}
          layer={this.state.layer}
          us_data={this.state.us_data}
          unit={this.props.unit}
          fuels={this.state.fuels}
          category={category}
          field={this.state.field}
          layer_type={region}
          fuel_label_lookup={fuel_label_lookup}
          fuel_color_lookup={fuel_color_lookup}
          fuel_icon_lookup={fuel_icon_lookup}
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
            <div className="visualization">
              <div className="visualization-parts">
                <OtherLevelMap
                  title={this.state.name}
                  width={800}
                  height={500}
                  data={this.state.data}
                  layer={this.state.layer}
                  us_data={this.state.us_data}
                  unit={this.state.unit}
                  field={this.state.field}
                  scale={800}
                  layer_type={region}
                  map_fill={this.state.map_fill}
                />
                <OtherLevelMapLegend
                  width={500}
                  height={50}
                  data={this.state.data}
                  map_fill={this.state.map_fill}
                />
              </div>
              <div className="visualization-parts">
                <OtherLevelBarchart
                  title={this.state.name}
                  width={400}
                  height={600}
                  data={this.state.data}
                  field={this.state.field}
                  us_data={this.us_data}
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
            <div className="visualization">
              <PlantLevelMapZoom
                title={this.state.name}
                static_map_scale={900}
                data={this.state.data}
                fuels={this.state.fuels}
                plant_data={this.state.plant_data}
                init_center={[-97.922211, 42.381266]}
                init_zoom={3}
                min_zoom={1}
                max_zoom={20}
                circle_opacity={0.8}
                field={this.state.field}
                plant_outlier={plant_outlier}
                fuel_label_lookup={fuel_label_lookup}
                fuel_color_lookup={fuel_color_lookup}
                fuel_icon_lookup={fuel_icon_lookup}
                wrap_long_labels={wrap_long_labels}
              />
              <PlantLevelMapStatic
                title={this.state.name}
                scale={900}
                background_layer={this.props.state_layer}
              />
            </div>
          );
      }
    }
    return <div className="visualization">{vis}</div>;
  }
}

class UpdatedVisualization extends Component {
  constructor(props) {
    super(props);
    this.exportStaticMap = this.exportStaticMap.bind(this);
    this.exportVis = this.exportVis.bind(this);
  }

  exportStaticMap() {
    let zoomable_status = d3.select("#map_zoomable").style("display");
    let static_status = d3.select("#map_static").style("display");
    d3.select("#map_zoomable").style("display", "none");
    d3.select("#map_static").style("display", null);
    window.print();
    d3.select("#map_zoomable").style("display", zoomable_status);
    d3.select("#map_static").style("display", static_status);
  }

  exportVis() {
    window.print();
  }

  render() {
    return (
      <div>
        <div className="export-div">
          <Button variant="secondary" size="sm">
            Export Table
          </Button>{" "}
          {lookup[this.props.tier5] !== "Plant" && (
            <Button variant="secondary" size="sm" onClick={this.exportVis}>
              Export Visualization
            </Button>
          )}
          {lookup[this.props.tier5] === "Plant" && (
            <Button variant="secondary" size="sm" onClick={this.exportVis}>
              Export Zoomable Map
            </Button>
          )}
          {lookup[this.props.tier5] === "Plant" && " "}
          {lookup[this.props.tier5] === "Plant" && (
            <Button variant="secondary" size="sm" onClick={this.exportStaticMap}>
              Export Static Map
            </Button>
          )}
        </div>
        <Visualization
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
