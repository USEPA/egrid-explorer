import React, { Component } from "react";
import Table from "react-bootstrap/Table";

class UpdatedTable extends Component {
  render() {
    return (
      <div>
        {this.props.title.startsWith("Resource Mix") ? (
          <Table striped bordered hover responsive="sm">
            <thead>
              <tr style={{lineHeight: 1}}>
                <th>Generation by Fuel Type</th>
                {this.props.region !== "US" && (
                  <th>
                    {this.props.region}
                    {" Resource Mix (%)"}
                  </th>
                )}
                <th>US Resource Mix (%)</th>
              </tr>
            </thead>
            {this.props.title === "Resource Mix by all fuel types" && (
              <tbody>
                {+this.props.table_info.COAL !== 0 && (
                  <tr style={{lineHeight: 1, fontWeight: this.props.type === "COAL" ? "bold" : "normal"}}>
                    <td>Coal</td>
                    {this.props.region !== "US" && (
                      <td>{this.props.table_info.COAL}</td>
                    )}
                    <td>{this.props.table_info.US_COAL}</td>
                  </tr>
                )}
                {+this.props.table_info.OIL !== 0 && (
                  <tr style={{lineHeight: 1, fontWeight: this.props.type === "OIL" ? "bold" : "normal"}}>
                    <td>Oil</td>
                    {this.props.region !== "US" && (
                      <td>{this.props.table_info.OIL}</td>
                    )}
                    <td>{this.props.table_info.US_OIL}</td>
                  </tr>
                )}
                {+this.props.table_info.GAS !== 0 && (
                  <tr style={{lineHeight: 1, fontWeight: this.props.type === "GAS" ? "bold" : "normal"}}>
                    <td>Gas</td>
                    {this.props.region !== "US" && (
                      <td>{this.props.table_info.GAS}</td>
                    )}
                    <td>{this.props.table_info.US_GAS}</td>
                  </tr>
                )}
                {+this.props.table_info.NUCLEAR !== 0 && (
                  <tr style={{lineHeight: 1, fontWeight: this.props.type === "NUCLEAR" ? "bold" : "normal"}}
                  >
                    <td>Nuclear</td>
                    {this.props.region !== "US" && (
                      <td>{this.props.table_info.NUCLEAR}</td>
                    )}
                    <td>{this.props.table_info.US_NUCLEAR}</td>
                  </tr>
                )}
                {+this.props.table_info.HYDRO !== 0 && (
                  <tr style={{lineHeight: 1, fontWeight: this.props.type === "HYDRO" ? "bold" : "normal"}}>
                    <td>Hydro</td>
                    {this.props.region !== "US" && (
                      <td>{this.props.table_info.HYDRO}</td>
                    )}
                    <td>{this.props.table_info.US_HYDRO}</td>
                  </tr>
                )}

                {+this.props.table_info.BIOMASS !== 0 && (
                  <tr style={{lineHeight: 1, fontWeight: this.props.type === "BIOMASS" ? "bold" : "normal"}}
                  >
                    <td>Biomass</td>
                    {this.props.region !== "US" && (
                      <td>{this.props.table_info.BIOMASS}</td>
                    )}
                    <td>{this.props.table_info.US_BIOMASS}</td>
                  </tr>
                )}
                {+this.props.table_info.WIND !== 0 && (
                  <tr style={{lineHeight: 1, fontWeight: this.props.type === "WIND" ? "bold" : "normal"}}>
                    <td>Wind</td>
                    {this.props.region !== "US" && (
                      <td>{this.props.table_info.WIND}</td>
                    )}
                    <td>{this.props.table_info.US_WIND}</td>
                  </tr>
                )}
                {+this.props.table_info.SOLAR !== 0 && (
                  <tr style={{lineHeight: 1, fontWeight: this.props.type === "SOLAR" ? "bold" : "normal"}}>
                    <td>Solar</td>
                    {this.props.region !== "US" && (
                      <td>{this.props.table_info.SOLAR}</td>
                    )}
                    <td>{this.props.table_info.US_SOLAR}</td>
                  </tr>
                )}
                {+this.props.table_info.GEOTHERMAL !== 0 && (
                  <tr style={{lineHeight: 1, fontWeight: this.props.type === "GEOTHERMAL" ? "bold" : "normal"}}>
                    <td>Geothermal</td>
                    {this.props.region !== "US" && (
                      <td>{this.props.table_info.GEOTHERMAL}</td>
                    )}
                    <td>{this.props.table_info.US_GEOTHERMAL}</td>
                  </tr>
                )}
                {+this.props.table_info.OFSL !== 0 && (
                  <tr style={{lineHeight: 1, fontWeight: this.props.type === "OFSL" ? "bold" : "normal"}}>
                    <td>Other Fossil</td>
                    {this.props.region !== "US" && (
                      <td>{this.props.table_info.OFSL}</td>
                    )}
                    <td>{this.props.table_info.US_OFSL}</td>
                  </tr>
                )}
                {+this.props.table_info.OTHF !== 0 && (
                  <tr style={{lineHeight: 1, fontWeight: this.props.type === "OTHF" ? "bold" : "normal"}}>
                    <td>Other Unknown/Purchased Fuel</td>
                    {this.props.region !== "US" && (
                      <td>{this.props.table_info.OTHF}</td>
                    )}
                    <td>{this.props.table_info.US_OTHF}</td>
                  </tr>
                )}
              </tbody>
            )}
            {this.props.title ===
              "Resource Mix by renewable vs. non-renewable fuels" && (
              <tbody>
                {+this.props.table_info.HYDRO !== 0 && (
                  <tr style={{lineHeight: 1, fontWeight: this.props.type === "HYDRO" ? "bold" : "normal"}}>
                    <td>Hydro</td>
                    {this.props.region !== "US" && (
                      <td>{this.props.table_info.HYDRO}</td>
                    )}
                    <td>{this.props.table_info.US_HYDRO}</td>
                  </tr>
                )}
                {+this.props.table_info.TNPR !== 0 && (
                  <tr style={{lineHeight: 1, fontWeight: this.props.type === "TNPR" ? "bold" : "normal"}}>
                    <td>Total Nonrenewables</td>
                    {this.props.region !== "US" && (
                      <td>{this.props.table_info.TNPR}</td>
                    )}
                    <td>{this.props.table_info.US_TNPR}</td>
                  </tr>
                )}
                {+this.props.table_info.THPR !== 0 && (
                  <tr style={{lineHeight: 1, fontWeight: this.props.type === "THPR" ? "bold" : "normal"}}>
                    <td>Total Nonhydro Renewables</td>
                    {this.props.region !== "US" && (
                      <td>{this.props.table_info.THPR}</td>
                    )}
                    <td>{this.props.table_info.US_THPR}</td>
                  </tr>
                )}
              </tbody>
            )}
            {this.props.title ===
              "Resource Mix by combustible vs. non-combustible fuels" && (
              <tbody>
                {+this.props.table_info.CYPR !== 0 && (
                  <tr style={{lineHeight: 1, fontWeight: this.props.type === "CYPR" ? "bold" : "normal"}}>
                    <td>Total Combustion</td>
                    {this.props.region !== "US" && (
                      <td>{this.props.table_info.CYPR}</td>
                    )}
                    <td>{this.props.table_info.US_CYPR}</td>
                  </tr>
                )}
                {+this.props.table_info.CNPR !== 0 && (
                  <tr style={{lineHeight: 1, fontWeight: this.props.type === "CNPR" ? "bold" : "normal"}}>
                    <td>Total Noncumbustion</td>
                    {this.props.region !== "US" && (
                      <td>{this.props.table_info.CNPR}</td>
                    )}
                    <td>{this.props.table_info.US_CNPR}</td>
                  </tr>
                )}
              </tbody>
            )}
          </Table>
        ) : (
          <Table striped bordered hover responsive="sm">
            <thead>
              <tr style={{lineHeight: 1}}>
                <th>Plant Name</th>
                <th>{this.props.table_info.PNAME}</th>
              </tr>
            </thead>
            <tbody>
              <tr style={{lineHeight: 1}}>
                <td>Facility ID</td>
                <td>{this.props.table_info.ORISPL}</td>
              </tr>
              <tr style={{lineHeight: 1}}>
                <td>Plant State</td>
                <td>{this.props.table_info.PSTATABB}</td>
              </tr>
              <tr style={{lineHeight: 1}}>
                <td>eGRID Subregion</td>
                <td>
                  <a href="https://www.epa.gov/sites/production/files/styles/large/public/2020-03/2018_egrid_subregions.png">
                    {this.props.table_info.SUBRGN}
                  </a>
                </td>
              </tr>
              <tr style={{lineHeight: 1}}>
                <td>Plant Primary Fuel</td>
                <td>{this.props.table_info.PLPRMFL}</td>
              </tr>
              <tr style={{lineHeight: 1}}>
                <td>Nameplate Capacity (MW)</td>
                <td>{this.props.table_info.NAMEPCAP}</td>
              </tr>
              <tr style={{lineHeight: 1}}>
                <td>Plant Capacity Factor</td>
                <td>{this.props.table_info.CAPFAC}</td>
              </tr>
              <tr style={{lineHeight: 1}}>
                <td>Generation (MWh)</td>
                <td>{this.props.table_info.PLNGENAN}</td>
              </tr>
              <tr style={{lineHeight: 1}}>
                <td>Heat Input (MMBtu)</td>
                <td>{this.props.table_info.PLHTIANT}</td>
              </tr>
              <tr style={{lineHeight: 1}}>
                <td>NOₓ Annual Emissions (tons)</td>
                <td>{this.props.table_info.PLNOXAN}</td>
              </tr>
              <tr style={{lineHeight: 1}}>
                <td>NOₓ Annual Output Emission Rate (lb/MWh)</td>
                <td>{this.props.table_info.PLNOXRTA}</td>
              </tr>
              <tr style={{lineHeight: 1}}>
                <td>NOₓ Ozone Season Emissions (tons)</td>
                <td>{this.props.table_info.PLNOXOZ}</td>
              </tr>
              <tr style={{lineHeight: 1}}>
                <td>NOₓ Ozone Season Output Emission Rate (lb/MWh)</td>
                <td>{this.props.table_info.PLNOXRTO}</td>
              </tr>
              <tr style={{lineHeight: 1}}>
                <td>SO₂ Annual Emissions (tons)</td>
                <td>{this.props.table_info.PLSO2AN}</td>
              </tr>
              <tr style={{lineHeight: 1}}>
                <td>SO₂ Annual Output Emission Rate (lb/MWh)</td>
                <td>{this.props.table_info.PLSO2RTA}</td>
              </tr>
              <tr style={{lineHeight: 1}}>
                <td>CO₂ Annual Emissions (tons)</td>
                <td>{this.props.table_info.PLCO2AN}</td>
              </tr>
              <tr style={{lineHeight: 1}}>
                <td>CO₂ Annual Output Emission Rate (lb/MWh)</td>
                <td>{this.props.table_info.PLCO2RTA}</td>
              </tr>
              <tr style={{lineHeight: 1}}>
                <td>CH₄ Annual Emissions (lbs)</td>
                <td>{this.props.table_info.PLCH4AN}</td>
              </tr>
              <tr style={{lineHeight: 1}}>
                <td>CH₄ Annual Output Emission Rate (lb/MWh)</td>
                <td>{this.props.table_info.PLCH4RTA}</td>
              </tr>
              <tr style={{lineHeight: 1}}>
                <td>N₂O Annual Emissions (lbs)</td>
                <td>{this.props.table_info.PLN2OAN}</td>
              </tr>
              <tr style={{lineHeight: 1}}>
                <td>N₂O Annual Output Emission Rate (lb/MWh)</td>
                <td>{this.props.table_info.PLN2ORTA}</td>
              </tr>
              <tr style={{lineHeight: 1}}>
                <td>CO₂ equivalent Annual Emissions (tons)</td>
                <td>{this.props.table_info.PLCO2EQA}</td>
              </tr>
              <tr style={{lineHeight: 1}}>
                <td>CO₂ equivalent Output Emission Rate (lb/MWh)</td>
                <td>{this.props.table_info.PLC2ERTA}</td>
              </tr>
            </tbody>
          </Table>
        )}
      </div>
    );
  }
}

export default UpdatedTable;
