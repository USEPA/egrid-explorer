import React, { Component } from "react";
import Spinner from "react-bootstrap/Spinner";
import Dialog from "./Dialog";
import * as d3 from "d3";
import * as topojson from "topojson-client";

import logo from "./assets/img/logo.png";

import subrgn_topo from "./assets/data/json/SUBRGN.json";
import nerc_topo from "./assets/data/json/NERC.json";
import ggl_topo from "./assets/data/json/GGL.json";
import us_topo from "./assets/data/json/US.json";

import data from "./assets/data/csv/eGRID all-level sentence structure.csv";
import subrgn from "./assets/data/csv/subregion.csv";
import nerc from "./assets/data/csv/NERC.csv";
import state from "./assets/data/csv/state.csv";
import statefullname from "./assets/data/csv/eGRID state fullname.csv";
import plant from "./assets/data/csv/plant.csv";
import ggl from "./assets/data/csv/GGL.csv";
import us from "./assets/data/csv/US.csv";

import Main from "./Main";

import "./EPAStyle.css";

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      show_modal: false,
      options: [],
      plant_data: [],
      state_data: [],
      subrgn_data: [],
      nerc_data: [],
      ggl_data: [],
      us_data: [],
    };

    this.year = 2018;
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
    this.choropleth_map_fill = {
      emission: ["#eff3ff", "#bdd7e7", "#6baed6", "#3182bd", "#08519c"],
      generation: ["#feedde", "#fdbe85", "#fd8d3c", "#e6550d", "#a63603"],
      others: ["#edf8e9", "#bae4b3", "#74c476", "#31a354", "#006d2c"]
    };
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
    this.plant_outlier = {
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
      TNPR: "All Non-Renewables",
      CYPR: "All Combustion",
      CNPR: "All Non-Combustion",
    };
    this.fuel_color_lookup = {
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
    this.wrap_long_labels = function (text, width) {
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

    this.ggl_layer = topojson.feature(ggl_topo, "GGL");
    this.subrgn_layer = topojson.feature(subrgn_topo, "subregion");
    this.nerc_layer = topojson.feature(nerc_topo, "NERC");
    this.state_layer = topojson.feature(us_topo, "states");

    this.ggl_layer.features.map((d) => (d.name = d.properties.GGL));
    this.nerc_layer.features = this.nerc_layer.features
      .filter((d) => d.properties.NERC !== "-" && d.properties.NERC !== "SPP") // no data for "-" and "SPP"
      .map((d) => {
        d.name = d.properties.NERC;
        return d;
      });
    this.subrgn_layer.features.map((d) => (d.name = d.properties.Subregions));
    this.state_layer.features = this.state_layer.features.filter(d=>d.id !== 72 && d.id !== 78); // no data for state 72 and state 78
  }

  componentDidMount() {
    this.prepData();
  }

  prepData() {
    Promise.all([
      d3.csv(data),
      d3.csv(subrgn),
      d3.csv(state),
      d3.csv(statefullname),
      d3.csv(nerc),
      d3.csv(plant),
      d3.csv(ggl),
      d3.csv(us),
    ]).then(
      ([options, subrgn, state, state_fullname, nerc, plant, ggl, us]) => {
        // process data
        state.map((d) => {
          d.label = d.PSTATABB;
          d.ABBR = d.PSTATABB;
          d.PSTATABB = state_fullname
            .filter((e) => e.STATE === d.PSTATABB)
            .map((e) => e.STATEFULL)[0];
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
          d.name = "US";
          d.id = -1;
        });

        this.state_data = state;
        this.plant_data = plant;
        this.subrgn_data = subrgn;
        this.nerc_data = nerc;
        this.ggl_data = ggl;
        this.us_data = us;

        this.setState({
          options: options.filter((e) => e.tier5 !== "52"),
          state_data: state,
          plant_data: plant,
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
      <div style={{padding: "5px"}}>
        {this.state.options.length > 0 &&
        this.state.plant_data.length > 0 &&
        this.state.state_data.length > 0 &&
        this.state.subrgn_data.length > 0 &&
        this.state.nerc_data.length > 0 &&
        this.state.ggl_data.length > 0 &&
        this.state.us_data.length > 0 ? (
          <div>
            <Main
              year={this.year}
              conjunction={this.conjunction}
              choropleth_map_fill={this.choropleth_map_fill}
              plant_fuels={this.plant_fuels}
              plant_outlier={this.plant_outlier}
              fuel_label_lookup={this.fuel_label_lookup}
              fuel_color_lookup={this.fuel_color_lookup}
              wrap_long_labels={this.wrap_long_labels}
              options={this.state.options}
              plant_data={this.state.plant_data}
              state_data={this.state.state_data}
              subrgn_data={this.state.subrgn_data}
              nerc_data={this.state.nerc_data}
              ggl_data={this.state.ggl_data}
              us_data={this.state.us_data}
              state_layer={this.state_layer}
              subrgn_layer={this.subrgn_layer}
              nerc_layer={this.nerc_layer}
              ggl_layer={this.ggl_layer}
            ></Main>
          </div>
        ) : (
          <div className="loading">
            <Spinner animation="grow" variant="success" />
          </div>
        )}
        <Dialog
          show={this.state.show_modal}
          onHide={() => this.setState({ show_modal: false })}
        />
      </div>
    );
  }
}

export default App;
