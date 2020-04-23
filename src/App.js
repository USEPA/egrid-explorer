import React, { Component } from "react";
import Main from "./Components/Main";
import logo from "./assets/img/logo.png";
import * as d3 from "d3";
import data from "./assets/data/csv/eGRID all-level sentence structure.csv";
import Spinner from "react-bootstrap/Spinner";

class App extends Component {
  constructor(props) {
    super(props);
    this.state = { OPTIONS: [] };
  }

  componentDidMount() {
    d3.csv(data).then((d) => {
      this.setState({ OPTIONS: d.filter((e) => e.tier5 !== "52") });
    });
  }

  render() {
    return (
      <div className="app">
        {this.state.OPTIONS.length > 0 ? (
          <div>
            <header>
              <h2>Emissions and Generation Resource Integrated Database</h2>
              <img id="logo" src={logo}></img>
            </header>
            <Main options={this.state.OPTIONS}></Main>
          </div>
        ) : (
          <div className="loading">
            <Spinner animation="grow" variant="success" />
          </div>
        )}
      </div>
    );
  }
}

export default App;
