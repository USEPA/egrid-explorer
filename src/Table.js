import React, { Component } from "react";
import Dialog from "./Dialog.js";
import SubregionMap from "./assets/img/2018_egrid_subregions.png";

class UpdatedTable extends Component {
  constructor(props) {
    super(props);
    this.state = {
      show_modal: false,
    };
  }

  render() {
    let ggl_table = [],
      plant_table = [],
      resourcemix_table = [];

    if (this.props.title.startsWith("Grid gross loss rates")) {
      this.props.data.forEach((d, i) => {
        let row;
        row = (
          <tr
            style={{
              backgroundColor:
                this.props.region === d.name
                  ? this.props.highlight_color
                  : "#fff",
              fontWeight: this.props.region === d.name ? "bold" : "normal",
            }}
            key={i}
          >
            <td>{d.name}</td>
            <td>{d.subregion}</td>
            <td>{d.value}</td>
          </tr>
        );
        ggl_table.push(row);
      });
    } else if (this.props.title.startsWith("Resource Mix")) {
      Object.keys(this.props.table_info).forEach((r, i) => {
        let row;
        row = (
          <tr
            style={{
              backgroundColor:
                this.props.type === this.props.table_info[r].type
                  ? this.props.highlight_color
                  : "#fff",
              fontWeight:
                this.props.type === this.props.table_info[r].type
                  ? "bold"
                  : "normal",
            }}
          >
            <td>{r}</td>
            <td>
              {this.props.table_info[r]["US_" + this.props.table_info[r].type]}
            </td>
            <td style={{ width: this.props.region_level === "state" ? 175 : 120}}>{this.props.table_info[r][this.props.table_info[r].type]}</td>
          </tr>
        );
        resourcemix_table.push(row);
      });
    } else {
      Object.keys(this.props.table_info).forEach((r, i) => {
        let row;
        if (r !== "eGRID Subregion" && r !== "Plant Name") {
          row = (
            <tr
              style={{
                backgroundColor:
                  this.props.field === r ? this.props.highlight_color : "#fff",
                fontWeight: this.props.field === r ? "bold" : "normal",
              }}
              key={i}
            >
              <td>{r}</td>
              <td>{this.props.table_info[r]}</td>
            </tr>
          );
        } else if (r === "eGRID Subregion"){
          row = (
            <tr
              style={{
                backgroundColor:
                  this.props.field === r ? this.props.highlight_color : "#fff",
                fontWeight: this.props.field === r ? "bold" : "normal",
              }}
              key={i}
            >
              <td>
                {r}{" "}
                <span
                  className="clickable-cell"
                  onClick={() => {
                    this.setState({ show_modal: true });
                  }}
                >
                  (map)
                </span>
              </td>
              <td>{this.props.table_info[r]}</td>
            </tr>
          );
        }
        plant_table.push(row);
      });
    }

    return (
      <div>
        {this.props.title.startsWith("Resource Mix") ? (
          <table id="resourcemix-table">
            <thead>
              <tr style={{ height: 100}}>
                <th>Generation by Fuel Type</th>
                <th>
                  US
                  <br />
                  Resource Mix (%)
                </th>
                <th style={{ width: this.props.region_level === "state" ? 175 : 120}}>
                  {this.props.region === "state" ? "State" : this.props.region}
                  <br />
                  {"Resource Mix (%)"}
                </th>
              </tr>
            </thead>
            <tbody>{resourcemix_table}</tbody>
          </table>
        ) : this.props.title.startsWith("Grid gross loss rates") ? (
          <table id="ggl-table">
            <thead>
              <tr>
                <th>Region</th>
                <th>Associated eGRID Subregions</th>
                <th>Grid Gross Loss Rates (%)</th>
              </tr>
            </thead>
            <tbody>{ggl_table}</tbody>
          </table>
        ) : (
          <table id="plant-table">
            <thead>
              <tr>
                <th>Plant Name</th>
                <th>{this.props.table_info["Plant Name"]}</th>
              </tr>
            </thead>
            <tbody>
              {plant_table}
            </tbody>
          </table>
        )}
        <Dialog
          is_table="false"
          has_image="true"
          title="eGRID Subregion"
          text={{ text: [], list: [], image: SubregionMap }}
          show={this.state.show_modal}
          onHide={() => this.setState({ show_modal: false })}
        />
      </div>
    );
  }
}

export default UpdatedTable;
