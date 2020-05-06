import React, { Component } from "react";
import Main from "./Components/Main";
import logo from "./assets/img/logo.png";
import * as d3 from "d3";
import * as topojson from "topojson-client";

import Spinner from "react-bootstrap/Spinner";
import Dialog from "./Components/Dialog";

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
      <div className="app">
        {this.state.options.length > 0 &&
        this.state.plant_data.length > 0 &&
        this.state.state_data.length > 0 &&
        this.state.subrgn_data.length > 0 &&
        this.state.nerc_data.length > 0 &&
        this.state.ggl_data.length > 0 &&
        this.state.us_data.length > 0 ? (
          <div>
            <header>
              <h2>Emissions and Generation Resource Integrated Database</h2>
              <span className="dialog"> (</span>
              <span
                className="dialog-text"
                onClick={() => this.setState({ show_modal: true })}
              >
                More Information
              </span>
              <span className="dialog">)</span>
              <img id="logo" src={logo}></img>
            </header>
            <Main
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
