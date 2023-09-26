import React, { Component } from "react";
import Spinner from "react-bootstrap/Spinner";
import * as d3 from "d3";
import * as topojson from "topojson-client";

import logo from "./assets/img/logo.png";

import subrgn_topo from "./assets/data/json/SUBRGN.json";
import nerc2018_topo from "./assets/data/json/NERC2018.json";
import nerc2019_topo from "./assets/data/json/NERC2019.json";
import nerc2020_topo from "./assets/data/json/NERC2020.json";
import ggl_topo from "./assets/data/json/GGL.json";
import us_topo from "./assets/data/json/US.json";
import ba_topo from "./assets/data/json/Control_Areas_Topology.json";

import data from "./assets/data/csv/eGRID all-level sentence structure.csv";
import glossary from "./assets/data/csv/eGRID glossary.csv";

import subrgn from "./assets/data/csv/subregion.csv";
import nerc from "./assets/data/csv/NERC.csv";
import state from "./assets/data/csv/state.csv";
import statefullname from "./assets/data/csv/eGRID state fullname.csv";
import plant from "./assets/data/csv/plant.csv";
import plant_legend from "./assets/data/csv/eGRID plant legend values.csv";
import us from "./assets/data/csv/US.csv";
import ggl from "./assets/data/csv/GGL.csv";
import ba from "./assets/data/csv/BA.csv";
import ba_legend from "./assets/data/csv/Control_Areas_FeatureToPoint.csv";

import Main from "./Main";
import Dialog from "./Dialog.js";

import "mapbox-gl/dist/mapbox-gl.css";
import "./App.css";

class App extends Component {
  constructor(props) {
    super(props);
    // state controls
    this.state = {
      show_instruction: false,
      show_glossary: false,
      options: [],
      plant_data: [],
      state_data: [],
      subrgn_data: [],
      nerc_data: [],
      ggl_data: [],
      us_data: [],
      ba_data: [],
    };
    // placeholder
    this.plant_dist_lookup = {};
    this.ba_dist_lookup = {};


    // colors
    this.table_highlight_color = "rgba(0, 113, 188, 0.1)";
    this.resourcemix_micromap_highlight_color = "#aaa";
    this.fuel_background_highlight_color = "#eee";
    this.fuel_background_select_color = "#ddd";
    this.ggl_fill_color = "rgba(186, 228, 179, 0.6)";

    this.choropleth_map_fill = {
      emission: ["#eff3ff", "#bdd7e7", "#6baed6", "#3182bd", "#08519c"],
      generation: ["#feedde", "#fdbe85", "#fd8d3c", "#e6550d", "#a63603"],
      others: ["#edf8e9", "#bae4b3", "#74c476", "#31a354", "#006d2c"],
    };

    this.choropleth_map_fill_max =
    {
      emission: "#042b53",
      generation: "#5b1e02",
      others: "#00210d",
    };

    this.fuel_color_lookup = {
      COAL: "rgb(135,135,135)",
      OIL: "rgb(253,191,111)",
      GAS: "rgb(255,127,0)",
      NUCLEAR: "rgb(106,61,154)",
      HYDRO: "rgb(31,120,180)",
      BIOMASS: "rgb(51,160,44)",
      WIND: "rgb(178,223,138)",
      SOLAR: "rgb(227,26,28)",
      GEOTHERMAL: "rgb(251,154,153)",
      OFSL: "rgb(202,178,214)",
      OTHF: "rgb(140,81,10)",
      HYPR: "rgb(31,120,180)",
      THPR: "rgb(255, 187, 120)",
      TNPR: "rgb(255, 127, 14)",
      CYPR: "rgb(31, 119, 180)",
      CNPR: "rgb(255, 187, 120)",
    };

    // header data
    this.logo_link =
      "https://www.epa.gov/egrid";

    // sentence query
    this.conjunction = {
      tier1_0: {
        conjunct1: "for",
        conjunct2: "for",
        conjunct3: "at the",
        conjunct4: "level",
      },
      tier1_1: {
        conjunct1: "for",
        conjunct2: "for",
        conjunct3: "at the",
        conjunct4: "level",
      },
      tier1_2: {
        conjunct1: "for",
        conjunct2: "for",
        conjunct3: "at the",
        conjunct4: "level",
      },
      tier1_3: {
        conjunct1: "of",
        conjunct2: "",
        conjunct3: "at the",
        conjunct4: "level",
      },
      tier1_4: {
        conjunct1: "from",
        conjunct2: "",
        conjunct3: "at the",
        conjunct4: "level",
      },
      tier1_5: {
        conjunct1: "from",
        conjunct2: "",
        conjunct3: "at the",
        conjunct4: "level",
      },
      tier1_6: {
        conjunct1: "for",
        conjunct2: "",
        conjunct3: "at the",
        conjunct4: "level",
      },
      tier1_7: {
        conjunct1: "for",
        conjunct2: "for",
        conjunct3: "at the",
        conjunct4: "level",
      },
      tier1_8: {
        conjunct1: "",
        conjunct2: "",
        conjunct3: "at the",
        conjunct4: "level",
      },
      tier1_9: { conjunct1: "", conjunct2: "", conjunct3: "", conjunct4: "" },
    };

    // labels
    this.plant_fuels = [
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

    this.fuel_label_lookup = {
      COAL: "Coal",
      OIL: "Oil",
      GAS: "Gas",
      NUCLEAR: "Nuclear",
      HYDRO: "Hydro",
      BIOMASS: "Biomass",
      WIND: "Wind",
      SOLAR: "Solar",
      GEOTHERMAL: "Geo thermal",
      OFSL: "Other Fossil",
      OTHF: "Other Unknown",
      HYPR: "Hydro",
      THPR: "All Non-Hydro Renewables",
      TNPR: "All Non Renewables",
      CYPR: "All Combustion",
      CNPR: "All Non Combustion",
    };

    this.fuel_sentence_code_lookup = {
      coal: ["COAL"],
      oil: ["OIL"],
      "natural gas": ["GAS"],
      nuclear: ["NUCLEAR"],
      hydro: ["HYDRO"],
      biomass: ["BIOMASS"],
      wind: ["WIND"],
      solar: ["SOLAR"],
      geothermal: ["GEOTHERMAL"],
      "other fossil fuels": ["OFSL"],
      "other unknown/purchased fuels": ["OTHF"],
      "all non-renewable fuels": [
        "COAL",
        "OIL",
        "GAS",
        "OFSL",
        "NUCLEAR",
        "OTHF",
      ],
      "all renewable fuels": [
        "BIOMASS",
        "WIND",
        "SOLAR",
        "GEOTHERMAL",
        "HYDRO",
      ],
      "all non-hydro renewable fuels": [
        "BIOMASS",
        "WIND",
        "SOLAR",
        "GEOTHERMAL",
      ],
      "all combustion fuels": ["COAL", "OIL", "GAS", "OFSL", "BIOMASS", "OTHF"],
      "all non-combustion fuels": [
        "NUCLEAR",
        "HYDRO",
        "WIND",
        "SOLAR",
        "GEOTHERMAL",
      ],
    };

    // table names
    this.plant_table_rows = {
      // PNAME: "Plant Name",
      ORISPL: "Facility ID",
      PSTATABB: "Plant State",
      SUBRGN: "eGRID Subregion",
      PLPRMFL: "Plant Primary Fuel",
      SECFUEL: "Plant Secondary Fuel",
      NUMUNT: "Number of Units",
      NUMGEN: "Number of Generators",
      PLNAMEPCAP: "Nameplate Capacity (MW)",
      CAPFAC: "Plant Capacity Factor",
      PLNGENAN: "Total Generation (MWh)",
      PLHTIANT: "Total Heat Input (MMBtu)",
      PLNOXAN: "Annual NOₓ Total Emissions (tons)",
      PLNOXOZ: "Ozone Season NOₓ Total Emissions (tons)",
      PLSO2AN: "SO₂ Total Emissions (tons)",
      PLCO2AN: "CO₂ Total Emissions (tons)",
      PLCH4AN: "CH₄ Total Emissions (lbs)",
      PLN2OAN: "N₂O Total Emissions (lbs)",
      PLCO2EQA: "CO₂ equivalent Total Emissions (tons)",
      PLNOXRTA: "Annual NOₓ Total Output Emission Rate (lb/MWh)",
      PLNOXRTO: "Ozone Season NOₓ Total Output Emission Rate (lb/MWh)",
      PLSO2RTA: "SO₂ Total Output Emission Rate (lb/MWh)",
      PLCO2RTA: "CO₂ Total Output Emission Rate (lb/MWh)",
      PLCH4RTA: "CH₄ Total Output Emission Rate (lb/MWh)",
      PLN2ORTA: "N₂O Total Output Emission Rate (lb/MWh)",
      PLC2ERTA: "CO₂ equivalent Total Output Emission Rate (lb/MWh)",
      PLNOXCRT: "Annual NOₓ Combustion Output Emission Rate (lb/MWh)",
      PLNOXCRO: "Ozone Season NOₓ combustion Output Emission Rate (lb/MWh)",
      PLSO2CRT: "Annual SO₂ Combustion Output Emission Rate (lb/MWh)",
      PLCO2CRT: "Annual CO₂ Combustion Output Emission Rate (lb/MWh)",
      PLCH4CRT: "Annual CH₄ Combustion Output Emission Rate (lb/MWh)",
      PLN2OCRT: "Annual N₂O Combustion Output Emission Rate (lb/MWh)",
      PLC2ECRT: "Annual CO₂ equivalent Combustion Output Emission Rate (lb/MWh)"
    };

    // table names
    this.ba_table_rows = {
      // BANAME: "Balancing Authority Name",
      BACODE: "Balancing Authority Code",
      BANAMEPCAP: "Nameplate Capacity (MW)",
      BANGENAN: "Total Generation (MWh)",
      BAHTIANT: "Total Heat Input (MMBtu)",
      BANOXAN: "Annual NOₓ Total Emissions (tons)",
      BANOXOZ: "Ozone Season NOₓ Total Emissions (tons)",
      BASO2AN: "SO₂ Total Emissions (tons)",
      BACO2AN: "CO₂ Total Emissions (tons)",
      BACH4AN: "CH₄ Total Emissions (lbs)",
      BAN2OAN: "N₂O Total Emissions (lbs)",
      BACO2EQA: "CO₂ equivalent Total Emissions (tons)",
      BANOXRTA: "Annual NOₓ Total Output Emission Rate (lb/MWh)",
      BANOXRTO: "Ozone Season NOₓ Total Output Emission Rate (lb/MWh)",
      BASO2RTA: "SO₂ Total Output Emission Rate (lb/MWh)",
      BACO2RTA: "CO₂ Total Output Emission Rate (lb/MWh)",
      BACH4RTA: "CH₄ Total Output Emission Rate (lb/MWh)",
      BAN2ORTA: "N₂O Total Output Emission Rate (lb/MWh)",
      BAC2ERTA: "CO₂ equivalent Total Output Emission Rate (lb/MWh)",
      BANOXCRT: "Annual NOₓ Combustion Output Emission Rate (lb/MWh)",
      BANOXCRO: "Ozone Season NOₓ combustion Output Emission Rate (lb/MWh)",
      BASO2CRT: "Annual SO₂ Combustion Output Emission Rate (lb/MWh)",
      BACO2CRT: "Annual CO₂ Combustion Output Emission Rate (lb/MWh)",
      BACH4CRT: "Annual CH₄ Combustion Output Emission Rate (lb/MWh)",
      BAN2OCRT: "Annual N₂O Combustion Output Emission Rate (lb/MWh)",
      BAC2ECRT: "Annual CO₂ equivalent Combustion Output Emission Rate (lb/MWh)"
    };

    // geo layers
    this.ggl_layer = topojson.feature(ggl_topo, "GGL");
    this.subrgn_layer = topojson.feature(subrgn_topo, "subregion");
    this.nerc2018_layer = topojson.feature(nerc2018_topo, "NERC");
    this.nerc2019_layer = topojson.feature(nerc2019_topo, "NERC");
    this.nerc2020_layer = topojson.feature(nerc2020_topo, "NERC");
    this.state_layer = topojson.feature(us_topo, "states");
    this.ba_layer = topojson.feature(ba_topo, "Control_Areas");

    this.ggl_layer.features.forEach((d) => {
      d.id = null;
      d.name = d.properties.GGL;
    });
    this.subrgn_layer.features.forEach((d) => {
      d.id = null;
      d.name = d.properties.Subregions;
    });
    this.nerc2018_layer.features = this.nerc2018_layer.features
      .filter((d) => d.properties.NERC !== "-" && d.properties.NERC !== "SPP") // no data for "-" and "SPP"
      .map((d) => {
        d.id = null;
        d.name = d.properties.NERC;
        return d;
      });
    this.nerc2019_layer.features = this.nerc2019_layer.features
      .filter((d) => d.properties.NERC !== "-" && d.properties.NERC !== "SPP") // no data for "-" and "SPP"
      .map((d) => {
        d.id = null;
        d.name = d.properties.NERC;
        return d;
      });
    this.nerc2020_layer.features = this.nerc2020_layer.features
      .filter((d) => d.properties.NERC !== "-" && d.properties.NERC !== "SPP") // no data for "-" and "SPP"
      .map((d) => {
        d.id = null;
        d.name = d.properties.NERC;
        return d;
      });
    this.state_layer.features = this.state_layer.features.filter(
      (d) => d.id !== 78
    ); // no data for state 72 and state 78

    this.ba_layer.features.forEach((d) => {
      d.id = null;
      d.name = d.properties.BANAME;
    });

    // wrap svg text labels
    this.wrap_long_labels = function (text, width) {
      text.each(function () {
        let text = d3.select(this),
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
            .attr("class", "tspan")
            .attr("x", x)
            .attr("y", y)
            .attr("dy", dy + "em");
        while ((word = words.pop())) {
          line.push(word);
          if (tspan.node().classList.length > 0) {
            tspan.text(line.join(" "));
          }
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
  }

  componentDidMount() {
    this.prepData();
  }

  prepData() {
    Promise.all([
      d3.csv(data),
      d3.csv(glossary),
      d3.csv(subrgn),
      d3.csv(state),
      d3.csv(statefullname),
      d3.csv(nerc),
      d3.csv(plant),
      d3.csv(plant_legend),
      d3.csv(ba),
      d3.csv(ba_legend),
      d3.csv(ggl),
      d3.csv(us),
    ]).then(
      ([
        options,
        glossary,
        subrgn,
        state,
        state_fullname,
        nerc,
        plant,
        plant_dist,
        ba,
        ba_dist,
        ggl,
        us,
      ]) => {
        // process data
        state.forEach((d) => {
          d.label = d.PSTATABB;
          d.ABBR = d.PSTATABB;
          d.PSTATABB = state_fullname
            .filter((e) => e.STATE === d.PSTATABB)
            .map((e) => e.STATEFULL)[0];
          d.name = d.PSTATABB;

          Object.keys(d).forEach((e) => {
            if (!isNaN(+d[e].replace(/,/g, "")) && d[e] !== "") {
              d[e] = +d[e].replace(/,/g, "");
            }
          });
          d.id = d.FIPSST;
        });
        this.state_layer.features.forEach((d) => {
          if (state.filter((e) => e.FIPSST === d.id).length > 0) {
            d.name = state.filter((e) => e.FIPSST === d.id)[0].name;
          }
        });

        plant.forEach((d, i) => {
          d.label = d.PNAME;
          d.name = d.PNAME;
          Object.keys(d).forEach((e) => {
            if (!isNaN(+d[e].replace(/,/g, "")) && d[e] !== "") {
              d[e] = +d[e].replace(/,/g, "");
            }
          });
          d.id = +d.ORISPL;
        });

        plant_dist.forEach((d, i) => {
          this.plant_dist_lookup[d.Field] = {
            min: +d.Threshold1,
            t2: +d.Threshold2,
            t3: +d.Threshold3,
            t4: +d.Threshold4,
            t5: +d.Threshold5,
            max: +d.Threshold6,
          };
        });


        ba.forEach((d, i) => {
          d.label = d.BANAME;
          d.name = d.BANAME;
          Object.keys(d).forEach((e) => {
            if (!isNaN(+d[e].replace(/,/g, "")) && d[e] !== "") {
              d[e] = +d[e].replace(/,/g, "");
            }
          });
          ba_dist.forEach((s, i) => {
            if (d.BANAME.toLowerCase() === s.NAME.toLowerCase()) {
              d.id = s.ID;
              d.POINT_Y = s.POINT_Y;
              d.POINT_X = s.POINT_X
            }
          })
        });


        ba_dist.forEach((d, i) => {
          this.ba_dist_lookup = d;
        })


        this.ba_layer.features.forEach((d) => {
          d.id = d.properties.ID
        });


        let subrgn_names = subrgn.map(d => d.SUBRGN);
        subrgn_names = subrgn_names.filter((d, i) => subrgn_names.indexOf(d) === i);
        subrgn.forEach((d, i) => {
          d.label = d.SUBRGN;
          d.name = d.SUBRGN;
          Object.keys(d).forEach((e) => {
            if (!isNaN(+d[e].replace(/,/g, "")) && d[e] !== "") {
              d[e] = +d[e].replace(/,/g, "");
            }
          });
          d.id = subrgn_names.indexOf(d.SUBRGN);
        });
        this.subrgn_layer.features.forEach((d) => {
          d.id = subrgn.filter((e) => e.name === d.name).map((e) => e.id)[0];
        });

        let nerc_names = nerc.map(d => d.NERC);
        nerc_names = nerc_names.filter((d, i) => nerc_names.indexOf(d) === i);
        nerc = nerc.filter((d) => d.NERC !== "NA");
        nerc.forEach((d, i) => {
          d.label = d.NERC;
          d.name = d.NERC;
          Object.keys(d).forEach(function (e) {
            if (!isNaN(+d[e].replace(/,/g, "")) && d[e] !== "") {
              d[e] = +d[e].replace(/,/g, "");
            }
          });
          d.id = nerc_names.indexOf(d.NERC);
        });
        this.nerc2018_layer.features.forEach((d) => {
          d.id = nerc.filter((e) => e.name === d.name).map((e) => e.id)[0];
        });
        this.nerc2019_layer.features.forEach((d) => {
          d.id = nerc.filter((e) => e.name === d.name).map((e) => e.id)[0];
        });
        this.nerc2020_layer.features.forEach((d) => {
          d.id = nerc.filter((e) => e.name === d.name).map((e) => e.id)[0];
        });

        ggl.forEach((d, i) => {
          d.label = d.Region;
          d.name = d.Region;
          d.id = i;
          d.unit = "%";
          d.value = d["Grid Gross Loss Rate (%)"];
          d.subregion = d.Subregion;
        });
        this.ggl_layer.features.forEach((d) => {
          d.id = ggl.filter((e) => e.name === d.name).map((e) => e.id)[0];
        });

        us.forEach((d) => {
          Object.keys(d).forEach((e) => {
            if (!isNaN(+d[e].replace(/,/g, "")) && d[e] !== "") {
              d[e] = +d[e].replace(/,/g, "");
            }
          });
          d.name = "US";
          d.id = -1;
        });

        this.state_data = state;
        this.plant_data = plant;
        this.ba_data = ba;
        this.subrgn_data = subrgn;
        this.nerc_data = nerc;
        this.ggl_data = ggl;
        this.us_data = us;

        this.glossary_table_header = Object.keys(glossary[0]);
        this.glossary_table_rows = glossary.map((d) => Object.values(d));

        this.setState({
          options: options.filter((e) => e.tier4 !== "52"),
          state_data: state,
          plant_data: plant,
          ba_data: ba,
          subrgn_data: subrgn,
          nerc_data: nerc,
          ggl_data: ggl,
          us_data: us,
        });
      }
    );
  }

  render() {
    return (
      <div>
        {this.state.options.length > 0 &&
          this.state.plant_data.length > 0 &&
          this.state.ba_data.length > 0 &&
          this.state.state_data.length > 0 &&
          this.state.subrgn_data.length > 0 &&
          this.state.nerc_data.length > 0 &&
          this.state.ggl_data.length > 0 &&
          this.state.us_data.length > 0 ? (
          <div className="app">
            <header>
              <a
                href={this.logo_link}
                target="_blank"
                rel="noopener noreferrer"
              >
                <img id="logo" src={logo} alt="eGrid Logo" />
              </a>
              <div className="no-export-to-pdf">
                <input
                  className="btn-secondary"
                  type="button"
                  value="Instructions"
                  onClick={() => this.setState({ show_instruction: true })}
                />{" "}
                <input
                  className="btn-secondary"
                  type="button"
                  value="Glossary"
                  onClick={() => this.setState({ show_glossary: true })}
                />
              </div>
            </header>
            <Main
              conjunction={this.conjunction}
              choropleth_map_fill={this.choropleth_map_fill}
              choropleth_map_fill_max={this.choropleth_map_fill_max}
              plant_fuels={this.plant_fuels}
              plant_dist={this.plant_dist_lookup}
              ba_dist={this.ba_dist_lookup}
              fuel_label_lookup={this.fuel_label_lookup}
              fuel_color_lookup={this.fuel_color_lookup}
              table_highlight_color={this.table_highlight_color}
              resourcemix_micromap_highlight_color={
                this.resourcemix_micromap_highlight_color
              }
              fuel_background_highlight_color={
                this.fuel_background_highlight_color
              }
              fuel_background_select_color={this.fuel_background_select_color}
              ggl_fill_color={this.ggl_fill_color}
              fuel_sentence_code_lookup={this.fuel_sentence_code_lookup}
              plant_table_rows={this.plant_table_rows}
              ba_table_rows={this.ba_table_rows}
              wrap_long_labels={this.wrap_long_labels}
              options={this.state.options}
              plant_data={this.state.plant_data}
              state_data={this.state.state_data}
              subrgn_data={this.state.subrgn_data}
              nerc_data={this.state.nerc_data}
              ggl_data={this.state.ggl_data}
              ba_data={this.state.ba_data}
              us_data={this.state.us_data}
              state_layer={this.state_layer}
              subrgn_layer={this.subrgn_layer}
              ba_layer={this.ba_layer}
              nerc2018_layer={this.nerc2018_layer}
              nerc2019_layer={this.nerc2019_layer}
              nerc2020_layer={this.nerc2020_layer}
              ggl_layer={this.ggl_layer}
            ></Main>
          </div>
        ) : (
          <div className="loading">
            <Spinner animation="grow" variant="success" />
          </div>
        )}
        {this.state.show_instruction && <Dialog
          id="instruction"
          title=""
          name="Instructions"
          show={this.state.show_instruction}
          onHide={() => this.setState({ show_instruction: false })}
        />}
        {this.state.show_glossary && <Dialog
          id="glossary"
          title=""
          name="Glossary"
          table_header={this.glossary_table_header}
          table_rows={this.glossary_table_rows}
          show={this.state.show_glossary}
          onHide={() => this.setState({ show_glossary: false })}
        />}
      </div>
    );
  }
}

export default App;
