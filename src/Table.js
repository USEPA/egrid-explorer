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
    let ggl_table = [];

    if (this.props.title.startsWith("Grid gross loss rates")) {
      this.props.data.forEach((d, i) => {
        let row;
        if (i < this.props.data.length - 1) {
          row = (
            <tr 
            style={{
              backgroundColor:
                this.props.region === d.name
                  ? this.props.highlight_color
                  : "#fff",
              fontWeight: this.props.region === d.name ? "bold" : "normal",
            }} key={i}>
              <td>{d.name}</td>
              <td>{d.subregion}</td>
              <td>{d.value}</td>
            </tr>
          );
        } else {
          row = (
            <tr className="last-row" key={i}>
              <td>{d.name}</td>
              <td>{d.subregion}</td>
              <td>{d.value}</td>
            </tr>
          );
        }
        ggl_table.push(row);
      });
    }

    return (
      <div>
        {this.props.title.startsWith("Resource Mix") ? (
          <table id="resourcemix-table">
            <thead>
              <tr className="first-row">
                <th>Generation by Fuel Type</th>
                <th>
                  US
                  <br />
                  Resource Mix (%)
                </th>
                <th>
                  {this.props.region === "state" ? "State" : this.props.region}
                  <br />
                  {"Resource Mix (%)"}
                </th>
              </tr>
            </thead>
            {this.props.title.startsWith("Resource Mix by all fuel types") && (
              <tbody>
                <tr
                  style={{
                    backgroundColor:
                      this.props.type === "COAL"
                        ? this.props.highlight_color
                        : "#fff",
                    fontWeight: this.props.type === "COAL" ? "bold" : "normal",
                  }}
                >
                  <td>Coal</td>
                  <td>{this.props.table_info.US_COAL}</td>
                  <td>{this.props.table_info.COAL}</td>
                </tr>
                <tr
                  style={{
                    backgroundColor:
                      this.props.type === "OIL"
                        ? this.props.highlight_color
                        : "#fff",
                    fontWeight: this.props.type === "OIL" ? "bold" : "normal",
                  }}
                >
                  <td>Oil</td>
                  <td>{this.props.table_info.US_OIL}</td>
                  <td>{this.props.table_info.OIL}</td>
                </tr>
                <tr
                  style={{
                    backgroundColor:
                      this.props.type === "GAS"
                        ? this.props.highlight_color
                        : "#fff",
                    fontWeight: this.props.type === "GAS" ? "bold" : "normal",
                  }}
                >
                  <td>Gas</td>
                  <td>{this.props.table_info.US_GAS}</td>
                  <td>{this.props.table_info.GAS}</td>
                </tr>
                <tr
                  style={{
                    backgroundColor:
                      this.props.type === "NUCLEAR"
                        ? this.props.highlight_color
                        : "#fff",
                    fontWeight:
                      this.props.type === "NUCLEAR" ? "bold" : "normal",
                  }}
                >
                  <td>Nuclear</td>
                  <td>{this.props.table_info.US_NUCLEAR}</td>
                  <td>{this.props.table_info.NUCLEAR}</td>
                </tr>
                <tr
                  style={{
                    backgroundColor:
                      this.props.type === "HYDRO"
                        ? this.props.highlight_color
                        : "#fff",
                    fontWeight: this.props.type === "HYDRO" ? "bold" : "normal",
                  }}
                >
                  <td>Hydro</td>
                  <td>{this.props.table_info.US_HYDRO}</td>
                  <td>{this.props.table_info.HYDRO}</td>
                </tr>
                <tr
                  style={{
                    backgroundColor:
                      this.props.type === "BIOMASS"
                        ? this.props.highlight_color
                        : "#fff",
                    fontWeight:
                      this.props.type === "BIOMASS" ? "bold" : "normal",
                  }}
                >
                  <td>Biomass</td>
                  <td>{this.props.table_info.US_BIOMASS}</td>
                  <td>{this.props.table_info.BIOMASS}</td>
                </tr>
                <tr
                  style={{
                    backgroundColor:
                      this.props.type === "WIND"
                        ? this.props.highlight_color
                        : "#fff",
                    fontWeight: this.props.type === "WIND" ? "bold" : "normal",
                  }}
                >
                  <td>Wind</td>
                  <td>{this.props.table_info.US_WIND}</td>
                  <td>{this.props.table_info.WIND}</td>
                </tr>
                <tr
                  style={{
                    backgroundColor:
                      this.props.type === "SOLAR"
                        ? this.props.highlight_color
                        : "#fff",
                    fontWeight: this.props.type === "SOLAR" ? "bold" : "normal",
                  }}
                >
                  <td>Solar</td>
                  <td>{this.props.table_info.US_SOLAR}</td>
                  <td>{this.props.table_info.SOLAR}</td>
                </tr>
                <tr
                  style={{
                    backgroundColor:
                      this.props.type === "GEOTHERMAL"
                        ? this.props.highlight_color
                        : "#fff",
                    fontWeight:
                      this.props.type === "GEOTHERMAL" ? "bold" : "normal",
                  }}
                >
                  <td>Geothermal</td>
                  <td>{this.props.table_info.US_GEOTHERMAL}</td>
                  <td>{this.props.table_info.GEOTHERMAL}</td>
                </tr>
                <tr
                  style={{
                    backgroundColor:
                      this.props.type === "OFSL"
                        ? this.props.highlight_color
                        : "#fff",
                    fontWeight: this.props.type === "OFSL" ? "bold" : "normal",
                  }}
                >
                  <td>Other Fossil</td>
                  <td>{this.props.table_info.US_OFSL}</td>
                  <td>{this.props.table_info.OFSL}</td>
                </tr>
                <tr
                  className="last-row"
                  style={{
                    backgroundColor:
                      this.props.type === "OTHF"
                        ? this.props.highlight_color
                        : "#fff",
                    fontWeight: this.props.type === "OTHF" ? "bold" : "normal",
                  }}
                >
                  <td>Other Unknown or Purchased Fuel</td>
                  <td>{this.props.table_info.US_OTHF}</td>
                  <td>{this.props.table_info.OTHF}</td>
                </tr>
              </tbody>
            )}
            {this.props.title.startsWith("Resource Mix by renewable vs. non-renewable fuels") && (
              <tbody>
                <tr
                  className="first-row"
                  style={{
                    backgroundColor:
                      this.props.type === "HYDRO"
                        ? this.props.highlight_color
                        : "#fff",
                    fontWeight: this.props.type === "HYDRO" ? "bold" : "normal",
                  }}
                >
                  <td>Hydro</td>
                  <td>{this.props.table_info.US_HYDRO}</td>
                  <td>{this.props.table_info.HYDRO}</td>
                </tr>
                <tr
                  style={{
                    backgroundColor:
                      this.props.type === "TNPR"
                        ? this.props.highlight_color
                        : "#fff",
                    fontWeight: this.props.type === "TNPR" ? "bold" : "normal",
                  }}
                >
                  <td>Total Nonrenewables</td>
                  <td>{this.props.table_info.US_TNPR}</td>
                  <td style={{ textAlign: "right", padding: "0.6em" }}>
                    {this.props.table_info.TNPR}
                  </td>
                </tr>
                <tr
                  className="last-row"
                  style={{
                    backgroundColor:
                      this.props.type === "THPR"
                        ? this.props.highlight_color
                        : "#fff",
                    fontWeight: this.props.type === "THPR" ? "bold" : "normal",
                  }}
                >
                  <td
                    style={{ padding: "0.6em", borderBottomLeftRadius: "10px" }}
                  >
                    Total Nonhydro Renewables
                  </td>
                  <td>{this.props.table_info.US_THPR}</td>
                  <td
                    style={{
                      textAlign: "right",
                      padding: "0.6em",
                      borderBottomRightRadius: "10px",
                    }}
                  >
                    {this.props.table_info.THPR}
                  </td>
                </tr>
              </tbody>
            )}
            {this.props.title.startsWith("Resource Mix by combustible vs. non-combustible fuels") && (
              <tbody>
                <tr
                  className="first-row"
                  style={{
                    backgroundColor:
                      this.props.type === "CYPR"
                        ? this.props.highlight_color
                        : "#fff",
                    fontWeight: this.props.type === "CYPR" ? "bold" : "normal",
                  }}
                >
                  <td>Total Combustion</td>
                  <td>{this.props.table_info.US_CYPR}</td>
                  <td style={{ textAlign: "right", padding: "0.6em" }}>
                    {this.props.table_info.CYPR}
                  </td>
                </tr>
                <tr
                  className="last-row"
                  style={{
                    backgroundColor:
                      this.props.type === "CNPR"
                        ? this.props.highlight_color
                        : "#fff",
                    fontWeight: this.props.type === "CNPR" ? "bold" : "normal",
                  }}
                >
                  <td
                    style={{ padding: "0.6em", borderBottomLeftRadius: "10px" }}
                  >
                    Total Noncumbustion
                  </td>
                  <td>{this.props.table_info.US_CNPR}</td>
                  <td
                    style={{
                      textAlign: "right",
                      padding: "0.6em",
                      borderBottomRightRadius: "10px",
                    }}
                  >
                    {this.props.table_info.CNPR}
                  </td>
                </tr>
              </tbody>
            )}
          </table>
        ) : this.props.title.startsWith("Grid gross loss rates") ? (
          <table id="ggl-table">
            <thead>
              <tr className="first-row">
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
              <tr className="first-row">
                <th>Plant Name</th>
                <th>{this.props.table_info.PNAME}</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Facility ID</td>
                <td>{this.props.table_info.ORISPL}</td>
              </tr>
              <tr>
                <td>Plant State</td>
                <td>{this.props.table_info.PSTATABB}</td>
              </tr>
              <tr>
                <td>eGRID Subregion</td>
                <td
                  className="clickable-cell"
                  onClick={() => {
                    this.setState({ show_modal: true });
                  }}
                >
                  {this.props.table_info.SUBRGN}
                </td>
              </tr>
              <tr>
                <td>Plant Primary Fuel</td>
                <td>{this.props.table_info.PLPRMFL}</td>
              </tr>
              <tr>
                <td>Plant Secondary Fuel</td>
                <td>{this.props.table_info.SECFUEL}</td>
              </tr>
              <tr
                style={{
                  backgroundColor:
                    this.props.field === "NUMUNT"
                      ? this.props.highlight_color
                      : "#fff",
                  fontWeight: this.props.field === "NUMUNT" ? "bold" : "normal",
                }}
              >
                <td>Number of Units</td>
                <td>{this.props.table_info.NUMUNT}</td>
              </tr>
              <tr
                style={{
                  backgroundColor:
                    this.props.field === "NUMGEN"
                      ? this.props.highlight_color
                      : "#fff",
                  fontWeight: this.props.field === "NUMGEN" ? "bold" : "normal",
                }}
              >
                <td>Number of Generators</td>
                <td>{this.props.table_info.NUMGEN}</td>
              </tr>
              <tr
                style={{
                  backgroundColor:
                    this.props.field === "PLNAMEPCAP"
                      ? this.props.highlight_color
                      : "#fff",
                  fontWeight:
                    this.props.field === "PLNAMEPCAP" ? "bold" : "normal",
                }}
              >
                <td>Nameplate Capacity (MW)</td>
                <td>{this.props.table_info.PLNAMEPCAP}</td>
              </tr>
              <tr>
                <td>Plant Capacity Factor</td>
                <td>{this.props.table_info.CAPFAC}</td>
              </tr>
              <tr
                style={{
                  backgroundColor:
                    this.props.field === "PLNGENAN"
                      ? this.props.highlight_color
                      : "#fff",
                  fontWeight:
                    this.props.field === "PLNGENAN" ? "bold" : "normal",
                }}
              >
                <td>Plant Generation (MWh)</td>
                <td>{this.props.table_info.PLNGENAN}</td>
              </tr>
              <tr
                style={{
                  backgroundColor:
                    this.props.field === "PLHTIANT"
                      ? this.props.highlight_color
                      : "#fff",
                  fontWeight:
                    this.props.field === "PLHTIANT" ? "bold" : "normal",
                }}
              >
                <td>Heat Input (MMBtu)</td>
                <td>{this.props.table_info.PLHTIANT}</td>
              </tr>

              <tr
                style={{
                  backgroundColor:
                    this.props.field === "PLNOXAN"
                      ? this.props.highlight_color
                      : "#fff",
                  fontWeight:
                    this.props.field === "PLNOXAN" ? "bold" : "normal",
                }}
              >
                <td>NOₓ Annual Emissions (tons)</td>
                <td>{this.props.table_info.PLNOXAN}</td>
              </tr>
              <tr
                style={{
                  backgroundColor:
                    this.props.field === "PLNOXOZ"
                      ? this.props.highlight_color
                      : "#fff",
                  fontWeight:
                    this.props.field === "PLNOXOZ" ? "bold" : "normal",
                }}
              >
                <td>NOₓ Ozone Season Emissions (tons)</td>
                <td>{this.props.table_info.PLNOXOZ}</td>
              </tr>
              <tr
                style={{
                  backgroundColor:
                    this.props.field === "PLSO2AN"
                      ? this.props.highlight_color
                      : "#fff",
                  fontWeight:
                    this.props.field === "PLSO2AN" ? "bold" : "normal",
                }}
              >
                <td>SO₂ Annual Emissions (tons)</td>
                <td>{this.props.table_info.PLSO2AN}</td>
              </tr>
              <tr
                style={{
                  backgroundColor:
                    this.props.field === "PLCO2AN"
                      ? this.props.highlight_color
                      : "#fff",
                  fontWeight:
                    this.props.field === "PLCO2AN" ? "bold" : "normal",
                }}
              >
                <td>CO₂ Annual Emissions (tons)</td>
                <td>{this.props.table_info.PLCO2AN}</td>
              </tr>
              <tr
                style={{
                  backgroundColor:
                    this.props.field === "PLCH4AN"
                      ? this.props.highlight_color
                      : "#fff",
                  fontWeight:
                    this.props.field === "PLCH4AN" ? "bold" : "normal",
                }}
              >
                <td>CH₄ Annual Emissions (lbs)</td>
                <td>{this.props.table_info.PLCH4AN}</td>
              </tr>
              <tr
                style={{
                  backgroundColor:
                    this.props.field === "PLN2OAN"
                      ? this.props.highlight_color
                      : "#fff",
                  fontWeight:
                    this.props.field === "PLN2OAN" ? "bold" : "normal",
                }}
              >
                <td>N₂O Annual Emissions (lbs)</td>
                <td>{this.props.table_info.PLN2OAN}</td>
              </tr>
              <tr
                style={{
                  backgroundColor:
                    this.props.field === "PLCO2EQA"
                      ? this.props.highlight_color
                      : "#fff",
                  fontWeight:
                    this.props.field === "PLCO2EQA" ? "bold" : "normal",
                }}
              >
                <td>CO₂ equivalent Annual Emissions (tons)</td>
                <td>{this.props.table_info.PLCO2EQA}</td>
              </tr>
              <tr
                style={{
                  backgroundColor:
                    this.props.field === "PLNOXRTA"
                      ? this.props.highlight_color
                      : "#fff",
                  fontWeight:
                    this.props.field === "PLNOXRTA" ? "bold" : "normal",
                }}
              >
                <td>NOₓ Annual Output Emission Rate (lb/MWh)</td>
                <td>{this.props.table_info.PLNOXRTA}</td>
              </tr>
              <tr
                style={{
                  backgroundColor:
                    this.props.field === "PLNOXRTO"
                      ? this.props.highlight_color
                      : "#fff",
                  fontWeight:
                    this.props.field === "PLNOXRTO" ? "bold" : "normal",
                }}
              >
                <td>NOₓ Ozone Season Output Emission Rate (lb/MWh)</td>
                <td>{this.props.table_info.PLNOXRTO}</td>
              </tr>
              <tr
                style={{
                  backgroundColor:
                    this.props.field === "PLSO2RTA"
                      ? this.props.highlight_color
                      : "#fff",
                  fontWeight:
                    this.props.field === "PLSO2RTA" ? "bold" : "normal",
                }}
              >
                <td>SO₂ Annual Output Emission Rate (lb/MWh)</td>
                <td>{this.props.table_info.PLSO2RTA}</td>
              </tr>
              <tr
                style={{
                  backgroundColor:
                    this.props.field === "PLCO2RTA"
                      ? this.props.highlight_color
                      : "#fff",
                  fontWeight:
                    this.props.field === "PLCO2RTA" ? "bold" : "normal",
                }}
              >
                <td>CO₂ Annual Output Emission Rate (lb/MWh)</td>
                <td>{this.props.table_info.PLCO2RTA}</td>
              </tr>
              <tr
                style={{
                  backgroundColor:
                    this.props.field === "PLCH4RTA"
                      ? this.props.highlight_color
                      : "#fff",
                  fontWeight:
                    this.props.field === "PLCH4RTA" ? "bold" : "normal",
                }}
              >
                <td>CH₄ Annual Output Emission Rate (lb/MWh)</td>
                <td>{this.props.table_info.PLCH4RTA}</td>
              </tr>
              <tr
                style={{
                  backgroundColor:
                    this.props.field === "PLN2ORTA"
                      ? this.props.highlight_color
                      : "#fff",
                  fontWeight:
                    this.props.field === "PLN2ORTA" ? "bold" : "normal",
                }}
              >
                <td>N₂O Annual Output Emission Rate (lb/MWh)</td>
                <td>{this.props.table_info.PLN2ORTA}</td>
              </tr>
              <tr
                className="last-row"
                style={{
                  backgroundColor:
                    this.props.field === "PLC2ERTA"
                      ? this.props.highlight_color
                      : "#fff",
                  fontWeight:
                    this.props.field === "PLC2ERTA" ? "bold" : "normal",
                }}
              >
                <td>CO₂ equivalent Output Emission Rate (lb/MWh)</td>
                <td>{this.props.table_info.PLC2ERTA}</td>
              </tr>
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
