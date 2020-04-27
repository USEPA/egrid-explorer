import React, { Component, useState, useEffect } from "react";
import OtherLevelMap from "./OtherLevelMap";
import OtherLevelMapLegend from "./OtherLevelMapLegend";
import OtherLevelBarchart from "./OtherLevelBarchart";
import PlantLevelMapZoom from "./PlantLevelMapZoom";
import PlantLevelMapStatic from "./PlantLevelMapStatic";

import ResourceMixChart from "./ResourceMixChart";
import lookup from "../assets/data/json/eGRID lookup.json";

import * as d3 from "d3";

import subrgn from "../assets/data/csv/subregion.csv";
import nerc from "../assets/data/csv/NERC.csv";
import state from "../assets/data/csv/state.csv";
import statefullname from "../assets/data/csv/eGRID state fullname.csv";
import plant from "../assets/data/csv/plant.csv";
import ggl from "../assets/data/csv/GGL.csv";

import "./Visualization.css";

import Spinner from "react-bootstrap/Spinner";

function Visualization(props) {
  const [data, setData] = useState([]);
  const [statefullnamedata, setStateName] = useState([]);
  const [fill_colors, setFillColors] = useState([]);
  const [fuels, setFuels] = useState([]);

  let field = props.field,
    name = props.name,
    unit = props.unit,
    tier1 = props.tier1,
    tier5 = props.tier5;
  let category = lookup[tier1],
    region = lookup[tier5];
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
    COAL: "rgb(31, 119, 180)",
    OIL: "rgb(255, 187, 120)",
    GAS: "rgb(255, 127, 14)",
    NUCLEAR: "rgb(148, 103, 189)",
    HYDRO: "rgb(174, 199, 232)",
    BIOMASS: "rgb(44, 160, 44)",
    WIND: "rgb(158, 218, 229)",
    SOLAR: "rgb(214, 39, 40)",
    GEOTHERMAL: "rgb(255, 152, 150)",
    OFSL: "rgb(140, 86, 75)",
    OTHF: "rgb(127, 127, 127)",
  };

  useEffect(() => {
    // get state full name
    d3.csv(statefullname, (row) => {
      return {
        id: +row.STATEID,
        name: row.STATE,
        fullname: row.STATEFULL,
      };
    }).then((d) => {
      setStateName(d);
    });
  }, []);

  useEffect(() => {
    // load data
    if (category === "grid gross loss rates") {
      d3.csv(ggl, (row) => {
        return {
          name: row.GGL,
          unit: "%",
          value: +row.percentage,
        };
      }).then((d) => {
        setData(d);
      });
    } else if (category === "resource mix (%)") {
      if (region === "eGRID subregion") {
        d3.csv(subrgn, (row) => {
          let data = [],
            cumsum = 0;
          field
            .replace(/\[|\]|\s/g, "")
            .split(",")
            .map((d) => {
              data.push({
                name: row.SUBRGN,
                unit: unit,
                type: d,
                value: +row[d],
                cumsum: cumsum,
              });
              cumsum = cumsum + +row[d];
            });
          return data;
        }).then((d) => {
          setData(d);
        });
      } else if (region === "NERC region") {
        d3.csv(nerc, (row) => {
          let data = [],
            cumsum = 0;
          field
            .replace(/\[|\]|\s/g, "")
            .split(",")
            .map((d) => {
              data.push({
                name: row.NERC,
                unit: unit,
                type: d,
                value: +row[d],
                cumsum: cumsum,
              });
              cumsum = cumsum + +row[d];
            });
          return data;
        }).then((d) => {
          setData(d);
        });
      } else if (region === "state") {
        d3.csv(state, (row) => {
          let data = [],
            cumsum = 0;
          field
            .replace(/\[|\]|\s/g, "")
            .split(",")
            .map((d) => {
              data.push({
                name: row.PSTATABB,
                unit: unit,
                type: d,
                value: +row[d],
                cumsum: cumsum,
              });
              cumsum = cumsum + +row[d];
            });
          return data;
        }).then((d) => {
          setData(d);
        });
      }
      setFuels(field.replace(/\[|\]|\s/g, "").split(","));
    } else {
      let fill = [];
      if (category.split("emission").length > 1) {
        fill = ["#eff3ff", "#bdd7e7", "#6baed6", "#3182bd", "#08519c"];
      } else if (category.split("generation").length > 1) {
        fill = ["#feedde", "#fdbe85", "#fd8d3c", "#e6550d", "#a63603"];
      } else if (
        category.split("non-baseload").length > 1 ||
        category.split("heat input").length > 1 ||
        category.split("nameplate").length > 1
      ) {
        fill = ["#edf8e9", "#bae4b3", "#74c476", "#31a354", "#006d2c"];
      }
      setFillColors(fill);

      if (region === "eGRID subregion") {
        d3.csv(subrgn, (row) => {
          return {
            name: row.SUBRGN,
            unit: unit,
            type: region,
            value: +row[field],
          };
        }).then((d) => {
          setData(d);
        });
      } else if (region === "NERC region") {
        d3.csv(nerc, (row) => {
          return {
            name: row.NERC,
            unit: unit,
            type: region,
            value: +row[field],
          };
        }).then((d) => {
          setData(d);
        });
      } else if (region === "state") {
        d3.csv(state, (row) => {
          return {
            name: row.PSTATABB,
            unit: unit,
            type: region,
            value: +row[field],
          };
        }).then((d) => {
          setData(d);
        });
      } else if (region === "Plant") {
        let geojson = { type: "FeatureCollection", features: [] };
        d3.csv(plant, (row) => {
          row[field] = +row[field];
          geojson.features.push({
            type: "Feature",
            properties: row,
            geometry: { type: "Point", coordinates: [+row.LON, +row.LAT] },
          });
        }).then(() => {
          setData(geojson);
        });
      }
    }
  }, [field]);

  // Subregion-, State-, NERC-level visualizations
  if (category === "grid gross loss rates") {
    return (
      <div className="visualization">
        <OtherLevelMap
          width={500}
          height={600}
          scale={600}
          title={name}
          data={data}
          fill_colors={fill_colors}
          layer_type={category}
          statefullnamedata={statefullnamedata}
        />
      </div>
    );
  } else if (category === "resource mix (%)") {
    return (
      <div className="visualization">
        <ResourceMixChart
          width={800}
          height={600}
          fuel_colors={Object.values(fuel_color_lookup)}
          fuels={fuels}
          title={name}
          data={data}
          statefullnamedata={statefullnamedata}
        />
      </div>
    );
  } else {
    if (region !== "Plant") {
      return (
        <div className="visualization">
          {data.length === 0 ? (
            <div className="loading">
              <Spinner animation="grow" variant="success" />
            </div>
          ) : (
            <div className="visualization">
              <div className="visualization-parts">
                <OtherLevelMap
                  width={500}
                  height={600}
                  scale={600}
                  title={name}
                  layer_type={region}
                  fill_colors={fill_colors}
                  data={data}
                  statefullnamedata={statefullnamedata}
                />
                <OtherLevelMapLegend
                  width={450}
                  height={50}
                  fill_colors={fill_colors}
                  data={data}
                />
              </div>
              <div className="visualization-parts">
                <OtherLevelBarchart
                  width={250}
                  height={600}
                  unit={unit}
                  layer_type={region}
                  fill_colors={fill_colors}
                  data={data}
                  statefullnamedata={statefullnamedata}
                />
              </div>
            </div>
          )}
        </div>
      );
    } else {
      return (
        <div>
          {data.length === 0 ? (
            <div className="loading">
              <Spinner animation="grow" variant="success" />
            </div>
          ) : (
            <div className="visualization">
              <PlantLevelMapZoom
                title={name}
                data={data}
                init_center={[-97.922211, 42.381266]}
                init_zoom={3}
                field={field}
                fuel_label_lookup={fuel_label_lookup}
                fuel_color_lookup={fuel_color_lookup}
              />
              {/* <PlantLevelMapStatic
                width={800}
                height={600}
                scale={800}
                title={name}
                fuel_label_lookup={fuel_label_lookup}
                fuel_colors={Object.values(fuel_color_lookup)}
                data={data}
              /> */}
            </div>
          )}
        </div>
      );
    }
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
          tier5={this.props.tier5}
        />
      </div>
    );
  }
}

export default UpdatedVisualization;
