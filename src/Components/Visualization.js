import React, { Component } from "react";
import Spinner from "react-bootstrap/Spinner";

import * as d3 from "d3";
import * as topojson from "topojson-client";

import subrgn from "../assets/data/csv/subregion.csv";
import nerc from "../assets/data/csv/NERC.csv";
import state from "../assets/data/csv/state.csv";
import statefullname from "../assets/data/csv/eGRID state fullname.csv";
import plant from "../assets/data/csv/plant.csv";
import ggl from "../assets/data/csv/GGL.csv";
import us from "../assets/data/csv/US.csv";

import lookup from "../assets/data/json/eGRID lookup.json";
import subrgn_topo from "../assets/data/json/SUBRGN.json";
import nerc_topo from "../assets/data/json/NERC.json";
import ggl_topo from "../assets/data/json/GGL.json";
import us_topo from "../assets/data/json/US.json";

import coal from '../assets/img/coal.svg';
import gas from '../assets/img/gas.svg';
import hydro from '../assets/img/hydro.svg';
import nuclear from '../assets/img/nuclear.svg';
import oil from '../assets/img/oil.svg';
import papaya from '../assets/img/papaya.svg';
import solar from '../assets/img/solar.svg';
import wind from '../assets/img/wind.svg';


import OtherLevelMap from "./OtherLevelMap";
import OtherLevelMapLegend from "./OtherLevelMapLegend";
import OtherLevelBarchart from "./OtherLevelBarchart";
import PlantLevelMapZoom from "./PlantLevelMapZoom";
import ResourceMixChart from "./ResourceMixChart";

import "./Visualization.css";

class Visualization extends Component {
  constructor(props) {
    super(props);
    this.state = {
      field: this.props.field,
      name: this.props.name,
      unit: this.props.unit,
      tier1: this.props.tier1,
      tier2: this.props.tier2,
      tier3: this.props.tier3,
      tier4: this.props.tier4,
      tier5: this.props.tier5,
      data: [],
      json_data: [],
      fuels: [],
      mapfill: [],
      background_layer: {},
      layer: {}
    };

    this.ggl_layer = topojson.feature(ggl_topo, "GGL");
    this.subrgn_layer = topojson.feature(subrgn_topo, "subregion");
    this.nerc_layer = topojson.feature(nerc_topo, "NERC");
    this.state_layer = topojson.feature(us_topo, "states");

    this.ggl_layer.features.map((d) => (d.name = d.properties.GGL));
    this.nerc_layer.features = this.nerc_layer.features
      .filter((d) => d.properties.NERC !== "-")
      .map((d) => {
        d.name = d.properties.NERC;
        return d;
      });
    this.subrgn_layer.features.map((d) => (d.name = d.properties.Subregions));
  }

  componentDidMount() {
    this.initState();
  }

  componentDidUpdate(prevProps) {
    if (this.props.field !== prevProps.field) {
      this.updateState();
    }
  }

  initState() {
    Promise.all([
      d3.csv(subrgn),
      d3.csv(state),
      d3.csv(statefullname),
      d3.csv(nerc),
      d3.csv(plant),
      d3.csv(ggl),
      d3.csv(us),
    ]).then(([subrgn, state, state_fullname, nerc, plant, ggl, us]) => {
      // process data
      state.map((d) => {
        d.label = d.PSTATABB;
        d.ABBR = d.PSTATABB;
        d.PSTATABB = state_fullname
          .filter((e) => e.STATE === d.PSTATABB)
          .map((e) => e.STATEFULL)[0]; //add state full names to state layer
        d.name = d.PSTATABB;

        Object.keys(d).forEach((e) => {
          if (!isNaN(+d[e].replace(/,/g, ""))) {
            d[e] = +d[e].replace(/,/g, "");
          }
        });
        d.id = d.FIPSST;
      });
      this.state_layer.features.map((d) =>
        state.filter((e) => e.FIPSST === d.id).length === 1
          ? (d.name = state.filter((e) => e.FIPSST === d.id)[0].name)
          : ""
      );

      plant.map((d, i) => {
        d.label = d.PNAME;
        d.name = d.PNAME;
        Object.keys(d).forEach((e) => {
          if (!isNaN(+d[e].replace(/,/g, ""))) {
            d[e] = +d[e].replace(/,/g, "");
          }
        });
        d.id = i;
      });

      subrgn.map((d, i) => {
        d.label = d.SUBRGN;
        d.name = d.SUBRGN;
        Object.keys(d).forEach((e) => {
          if (!isNaN(+d[e].replace(/,/g, ""))) {
            d[e] = +d[e].replace(/,/g, "");
          }
        });
        d.id = i;
      });

      nerc = nerc.filter((d) => d.NERC !== "NA");
      nerc.map((d, i) => {
        d.label = d.NERC;
        d.name = d.NERC;
        Object.keys(d).forEach(function (e) {
          if (!isNaN(+d[e].replace(/,/g, ""))) {
            d[e] = +d[e].replace(/,/g, "");
          }
        });
        d.id = i;
      });

      ggl.map((d, i) => {
        d.label = d.GGL;
        d.name = d.GGL;
        d.id = i;
        d.unit = "%";
        d.value = +d.percentage;
      });

      us.map((d) => {
        Object.keys(d).forEach((e) => {
          if (!isNaN(+d[e].replace(/,/g, ""))) {
            d[e] = +d[e].replace(/,/g, "");
          }
        });
      });

      this.state_data = state;
      this.plant_data = plant;
      this.subrgn_data = subrgn;
      this.nerc_data = nerc;
      this.ggl_data = ggl;
      this.us_data = us;

      this.updateState();
    });
  }

  updateState() {
    let category = lookup[this.props.tier1],
      region = lookup[this.props.tier5];
    let data_formatted = [],
      json_data = { type: "FeatureCollection", features: [] },
      fuels = [],
      mapfill = [],
      background_layer = { type: "FeatureCollection", features: [] },
      layer = { type: "FeatureCollection", features: [] };

    // set state depending on region and category
    let data = [];
    if (region === "eGRID subregion") {
      data = this.subrgn_data;
      layer = this.subrgn_layer;
    } else if (region === "NERC region") {
      data = this.nerc_data;
      layer = this.nerc_layer;
    } else if (region === "state") {
      data = this.state_data;
      layer = this.state_layer;
    } else if (region === "Plant") {
      data = this.plant_data;
    }

    if (category === "grid gross loss rates") {
      data_formatted = this.ggl_data;
      layer = this.ggl_layer;
      background_layer = this.state_layer;
    } else if (category === "resource mix (%)") {
      fuels = this.props.field.replace(/\[|\]|\s/g, "").split(",");
      data.map((d) => {
        let cumsum = 0;
        fuels.map((f) => {
          data_formatted.push({
            name: d.name,
            id: d.id,
            unit: this.props.unit,
            type: f,
            value: +d[f],
            cumsum: cumsum,
          });
          cumsum = cumsum + d[f];
        });
      });
    } else {
      if (category.split("emission").length > 1) {
        mapfill = ["#eff3ff", "#bdd7e7", "#6baed6", "#3182bd", "#08519c"];
      } else if (category.split("generation").length > 1) {
        mapfill = ["#feedde", "#fdbe85", "#fd8d3c", "#e6550d", "#a63603"];
      } else if (
        category.split("non-baseload").length > 1 ||
        category.split("heat input").length > 1 ||
        category.split("nameplate").length > 1
      ) {
        mapfill = ["#edf8e9", "#bae4b3", "#74c476", "#31a354", "#006d2c"];
      }

      data_formatted = data.map((d) => {
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
        data.map((d) => {
          json_data.features.push({
            type: "Feature",
            properties: d,
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
      tier3: this.props.tier3,
      tier4: this.props.tier4,
      tier5: this.props.tier5,
      data: data_formatted,
      json_data: json_data,
      fuels: fuels,
      mapfill: mapfill,
      layer: layer,
      background_layer: background_layer
    });
  }

  render() {
    let category = lookup[this.props.tier1],
      region = lookup[this.props.tier5];
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
    };
    let fuel_color_lookup = {
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
    };
    let fuel_icon_lookup = {
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
    };

    let vis;
    if (category === "grid gross loss rates") {
      vis = (
        <OtherLevelMap
          title={this.state.name}
          width={800}
          height={600}
          scale={800}
          layer={this.state.layer}
          background_layer={this.state.background_layer}
          data={this.state.data}
          layer_type={category}
          mapfill={this.state.mapfill}
        />
      );
    } else if (category === "resource mix (%)") {
      vis = (
        <ResourceMixChart
          title={this.state.name}
          width={800}
          height={600}
          data={this.state.data}
          fuels={this.state.fuels}
          layer_type={region}
          fuel_label_lookup={fuel_label_lookup}
          fuel_color_lookup={fuel_color_lookup}
          fuel_icon_lookup={fuel_icon_lookup}
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
                  width={600}
                  height={500}
                  scale={650}
                  layer={this.state.layer}
                  data={this.state.data}
                  layer_type={region}
                  mapfill={this.state.mapfill}
                />
                <OtherLevelMapLegend
                  width={450}
                  height={50}
                  data={this.state.data}
                  mapfill={this.state.mapfill}
                />
              </div>
              <div className="visualization-parts">
                <OtherLevelBarchart
                  width={300}
                  height={600}
                  data={this.state.data}
                  layer_type={region}
                  unit={this.state.unit}
                  mapfill={this.state.mapfill}
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
                data={this.state.data}
                jsondata={this.state.json_data}
                init_center={[-97.922211, 42.381266]}
                init_zoom={3}
                field={this.state.field}
                fuel_label_lookup={fuel_label_lookup}
                fuel_color_lookup={fuel_color_lookup}
                fuel_icon_lookup={fuel_icon_lookup}
              />
            </div>
          );
      }
    }
    return <div className="visualization">{vis}</div>;
  }
}

class UpdatedVisualization extends Component {
  render() {
    return (
      <div>
        <Visualization
          field={this.props.field}
          name={this.props.name}
          unit={this.props.unit}
          tier1={this.props.tier1}
          tier2={this.props.tier2}
          tier3={this.props.tier3}
          tier4={this.props.tier4}
          tier5={this.props.tier5}
        />
      </div>
    );
  }
}

export default UpdatedVisualization;
