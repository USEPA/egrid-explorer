import React, { Component } from "react";

class UpdatedTable extends Component {
  render() {
    return (
      <div>
        {this.props.title.startsWith("Resource Mix") ? (
          <table style={{ maxWidth: 400, fontSize: "0.8em", borderRadius: "10px", borderCollapse: "separate", borderStyle: "hidden", boxShadow: "0 0 0 1px", margin: "0 auto"}}>
            <thead>
              <tr style={{ lineHeight: 1 }}>
                <th style={{padding: "0.8em", borderTopLeftRadius: "10px"}}>Generation by Fuel Type</th>
                <th style={{padding: "0.8em", textAlign: "right", }}>US<br/>Resource Mix (%)</th>                
                <th style={{padding: "0.8em", borderTopRightRadius: "10px", textAlign: "right", height: 95}}>
                  {this.props.region==="state"?"State":this.props.region}<br/>
                  {"Resource Mix (%)"}
                </th>
              </tr>
            </thead>
            {this.props.title === "Resource Mix by all fuel types" && (
              <tbody>
                  <tr
                    style={{
                      lineHeight: 1,
                      fontWeight:
                        this.props.type === "COAL" ? "bold" : "normal",
                    }}
                  >
                    <td style={{ padding: "0.8em" }}>Coal</td>
                    <td style={{ textAlign: "right", padding: "0.8em"}}>
                      {this.props.table_info.US_COAL}
                    </td>
                    <td style={{ textAlign: "right", padding: "0.8em" }}>
                      {this.props.table_info.COAL}
                    </td>
                  </tr>
                  <tr
                    style={{
                      lineHeight: 1,
                      fontWeight: this.props.type === "OIL" ? "bold" : "normal",
                    }}
                  >
                    <td style={{ padding: "0.8em" }}>Oil</td>
                    <td style={{ textAlign: "right", padding: "0.8em" }}>
                      {this.props.table_info.US_OIL}
                    </td>
                    <td style={{ textAlign: "right", padding: "0.8em" }}>
                      {this.props.table_info.OIL}
                    </td>
                  </tr>
                  <tr
                    style={{
                      lineHeight: 1,
                      fontWeight: this.props.type === "GAS" ? "bold" : "normal",
                    }}
                  >
                    <td style={{ padding: "0.8em" }}>Gas</td>
                    <td style={{ textAlign: "right", padding: "0.8em" }}>
                      {this.props.table_info.US_GAS}
                    </td>
                    <td style={{ textAlign: "right", padding: "0.8em" }}>
                      {this.props.table_info.GAS}
                    </td>
                  </tr>
                  <tr
                    style={{
                      lineHeight: 1,
                      fontWeight:
                        this.props.type === "NUCLEAR" ? "bold" : "normal",
                    }}
                  >
                    <td style={{ padding: "0.8em" }}>Nuclear</td>
                    <td style={{ textAlign: "right", padding: "0.8em" }}>
                      {this.props.table_info.US_NUCLEAR}
                    </td>
                    <td style={{ textAlign: "right", padding: "0.8em" }}>
                      {this.props.table_info.NUCLEAR}
                    </td>
                  </tr>
                  <tr
                    style={{
                      lineHeight: 1,
                      fontWeight:
                        this.props.type === "HYDRO" ? "bold" : "normal",
                    }}
                  >
                    <td style={{ padding: "0.8em" }}>Hydro</td>
                    <td style={{ textAlign: "right", padding: "0.8em" }}>
                      {this.props.table_info.US_HYDRO}
                    </td>
                    <td style={{ textAlign: "right", padding: "0.8em" }}>
                      {this.props.table_info.HYDRO}
                    </td>
                  </tr>
                  <tr
                    style={{
                      lineHeight: 1,
                      fontWeight:
                        this.props.type === "BIOMASS" ? "bold" : "normal",
                    }}
                  >
                    <td style={{ padding: "0.8em" }}>Biomass</td>
                    <td style={{ textAlign: "right", padding: "0.8em" }}>
                      {this.props.table_info.US_BIOMASS}
                    </td>
                    <td style={{ textAlign: "right", padding: "0.8em" }}>
                      {this.props.table_info.BIOMASS}
                    </td>
                  </tr>
                  <tr
                    style={{
                      lineHeight: 1,
                      fontWeight:
                        this.props.type === "WIND" ? "bold" : "normal",
                    }}
                  >
                    <td style={{ padding: "0.8em" }}>Wind</td>
                    <td style={{ textAlign: "right", padding: "0.8em" }}>
                      {this.props.table_info.US_WIND}
                    </td>
                    <td style={{ textAlign: "right", padding: "0.8em" }}>
                      {this.props.table_info.WIND}
                    </td>
                  </tr>
                  <tr
                    style={{
                      lineHeight: 1,
                      fontWeight:
                        this.props.type === "SOLAR" ? "bold" : "normal",
                    }}
                  >
                    <td style={{ padding: "0.8em" }}>Solar</td>
                    <td style={{ textAlign: "right", padding: "0.8em" }}>
                      {this.props.table_info.US_SOLAR}
                    </td>
                    <td style={{ textAlign: "right", padding: "0.8em" }}>
                      {this.props.table_info.SOLAR}
                    </td>
                  </tr>
                  <tr
                    style={{
                      lineHeight: 1,
                      fontWeight:
                        this.props.type === "GEOTHERMAL" ? "bold" : "normal",
                    }}
                  >
                    <td style={{ padding: "0.8em" }}>Geothermal</td>
                    <td style={{ textAlign: "right", padding: "0.8em" }}>
                      {this.props.table_info.US_GEOTHERMAL}
                    </td>
                    <td style={{ textAlign: "right", padding: "0.8em" }}>
                      {this.props.table_info.GEOTHERMAL}
                    </td>
                  </tr>
                  <tr
                    style={{
                      lineHeight: 1,
                      fontWeight:
                        this.props.type === "OFSL" ? "bold" : "normal",
                    }}
                  >
                    <td style={{ padding: "0.8em" }}>Other Fossil</td>
                    <td style={{ textAlign: "right", padding: "0.8em" }}>
                      {this.props.table_info.US_OFSL}
                    </td>
                    <td style={{ textAlign: "right", padding: "0.8em" }}>
                      {this.props.table_info.OFSL}
                    </td>
                  </tr>
                  <tr
                    style={{
                      lineHeight: 1,
                      fontWeight:
                        this.props.type === "OTHF" ? "bold" : "normal",
                    }}
                  >
                    <td style={{ padding: "0.8em", borderBottomLeftRadius: "10px"}}>Other Unknown or Purchased Fuel</td>
                    <td style={{ textAlign: "right", padding: "0.8em" }}>
                      {this.props.table_info.US_OTHF}
                    </td>
                    <td style={{ textAlign: "right", padding: "0.8em", borderBottomRightRadius: "10px"}}>
                      {this.props.table_info.OTHF}
                    </td>
                  </tr>
              </tbody>
            )}
            {this.props.title ===
              "Resource Mix by renewable vs. non-renewable fuels" && (
              <tbody>
                  <tr
                    style={{
                      lineHeight: 1,
                      fontWeight:
                        this.props.type === "HYDRO" ? "bold" : "normal",
                    }}
                  >
                    <td style={{ padding: "0.8em" }}>Hydro</td>
                    <td style={{ textAlign: "right", padding: "0.8em" }}>
                      {this.props.table_info.US_HYDRO}
                    </td>
                    <td style={{ textAlign: "right", padding: "0.8em" }}>
                      {this.props.table_info.HYDRO}
                    </td>
                  </tr>
                  <tr
                    style={{
                      lineHeight: 1,
                      fontWeight:
                        this.props.type === "TNPR" ? "bold" : "normal",
                    }}
                  >
                    <td style={{ padding: "0.8em"}}>Total Nonrenewables</td>
                    <td style={{ textAlign: "right", padding: "0.8em" }}>
                      {this.props.table_info.US_TNPR}
                    </td>
                    <td style={{ textAlign: "right", padding: "0.8em"}}>
                      {this.props.table_info.TNPR}
                    </td>
                  </tr>
                  <tr
                    style={{
                      lineHeight: 1,
                      fontWeight:
                        this.props.type === "THPR" ? "bold" : "normal",
                    }}
                  >
                    <td style={{ padding: "0.8em", borderBottomLeftRadius: "10px" }}>Total Nonhydro Renewables</td>
                    <td style={{ textAlign: "right", padding: "0.8em" }}>
                      {this.props.table_info.US_THPR}
                    </td>
                    <td style={{ textAlign: "right", padding: "0.8em" , borderBottomRightRadius: "10px" }}>
                      {this.props.table_info.THPR}
                    </td>
                  </tr>
              </tbody>
            )}
            {this.props.title ===
              "Resource Mix by combustible vs. non-combustible fuels" && (
              <tbody>
                  <tr
                    style={{
                      lineHeight: 1,
                      fontWeight:
                        this.props.type === "CYPR" ? "bold" : "normal",
                    }}
                  >
                    <td style={{ padding: "0.8em"}}>Total Combustion</td>
                    <td style={{ textAlign: "right", padding: "0.8em" }}>
                      {this.props.table_info.US_CYPR}
                    </td>
                    <td style={{ textAlign: "right", padding: "0.8em"}}>
                      {this.props.table_info.CYPR}
                    </td>
                  </tr>
                  <tr
                    style={{
                      lineHeight: 1,
                      fontWeight:
                        this.props.type === "CNPR" ? "bold" : "normal",
                    }}
                  >
                    <td style={{ padding: "0.8em", borderBottomLeftRadius: "10px" }}>Total Noncumbustion</td>
                    <td style={{ textAlign: "right", padding: "0.8em" }}>
                      {this.props.table_info.US_CNPR}
                    </td>
                    <td style={{ textAlign: "right", padding: "0.8em", borderBottomRightRadius: "10px" }}>
                      {this.props.table_info.CNPR}
                    </td>
                  </tr>
              </tbody>
            )}
          </table>
        ) : (
          <table style={{fontSize: "0.8em", borderRadius: "10px", borderCollapse: "separate", borderStyle: "hidden", boxShadow: "0 0 0 1px", margin: "0 auto"}}>
            <thead>
              <tr style={{ lineHeight: 1 }}>
                <th style={{ borderTopLeftRadius: "10px"}}>Plant Name</th>
                <th style={{ paddingRight: "0.5em", textAlign: "right", height: 50, borderTopRightRadius: "10px"}}>{this.props.table_info.PNAME}</th>
              </tr>
            </thead>
            <tbody>
              <tr style={{ lineHeight: 1 }}>
                <td style={{ padding: "0.5em", width: 315}}>Facility ID</td>
                <td style={{ paddingRight: "0.5em", width: 105, textAlign: "right"}}>{this.props.table_info.ORISPL}</td>
              </tr>
              <tr style={{ lineHeight: 1 }}>
                <td style={{ padding: "0.5em", width: 315 }}>Plant State</td>
                <td style={{ paddingRight: "0.5em", width: 105, textAlign: "right"}}>{this.props.table_info.PSTATABB}</td>
              </tr>
              <tr style={{ lineHeight: 1 }}>
                <td style={{ padding: "0.5em", width: 315 }}>eGRID Subregion</td>
                <td style={{ paddingRight: "0.5em", textAlign: "right", width: 105 }}>
                  <a href="https://www.epa.gov/sites/production/files/styles/large/public/2020-03/2018_egrid_subregions.png">
                    {this.props.table_info.SUBRGN}
                  </a>
                </td>
              </tr>
              <tr style={{ lineHeight: 1 }}>
                <td style={{ padding: "0.5em", width: 315 }}>Plant Primary Fuel</td>
                <td style={{ paddingRight: "0.5em", textAlign: "right", width: 105 }}>{this.props.table_info.PLPRMFL}</td>
              </tr>
              <tr style={{ lineHeight: 1 }}>
                <td style={{ padding: "0.5em", width: 315 }}>Plant Secondary Fuel</td>
                <td style={{ paddingRight: "0.5em", textAlign: "right", width: 105 }}>{this.props.table_info.SECFUEL}</td>
              </tr>
              <tr style={{ lineHeight: 1, fontWeight: this.props.field==="PLNAMEPCAP" ? "bold": "normal"}}>
                <td style={{ padding: "0.5em", width: 315,}}>Nameplate Capacity (MW)</td>
                <td style={{ paddingRight: "0.5em", textAlign: "right", width: 105 }}>{this.props.table_info.PLNAMEPCAP}</td>
              </tr>
              <tr style={{ lineHeight: 1 }}>
                <td style={{ padding: "0.5em", width: 315 }}>Plant Capacity Factor</td>
                <td style={{ paddingRight: "0.5em", textAlign: "right", width: 105 }}>{this.props.table_info.CAPFAC}</td>
              </tr>
              <tr style={{ lineHeight: 1, fontWeight: this.props.field==="PLNGENAN" ? "bold" : "normal"}}>
                <td style={{ padding: "0.5em", width: 315 }}>Generation (MWh)</td>
                <td style={{ paddingRight: "0.5em", textAlign: "right", width: 105 }}>{this.props.table_info.PLNGENAN}</td>
              </tr>
              <tr style={{ lineHeight: 1, fontWeight: this.props.field==="PLHTIANT" ? "bold" : "normal" }}>
                <td style={{ padding: "0.5em", width: 315 }}>Heat Input (MMBtu)</td>
                <td style={{ paddingRight: "0.5em", textAlign: "right", width: 105 }}>{this.props.table_info.PLHTIANT}</td>
              </tr>
              <tr style={{ lineHeight: 1, fontWeight: this.props.field==="PLNOXAN" ? "bold" : "normal" }}>
                <td style={{ padding: "0.5em", width: 315}}>NOₓ Annual Emissions (tons)</td>
                <td style={{ paddingRight: "0.5em", textAlign: "right", width: 105 }}>{this.props.table_info.PLNOXAN}</td>
              </tr>
              <tr style={{ lineHeight: 1, fontWeight: this.props.field==="PLNOXRTA" ? "bold" : "normal" }}>
                <td style={{ padding: "0.5em" , width: 315}}>NOₓ Annual Output Emission Rate (lb/MWh)</td>
                <td style={{ paddingRight: "0.5em", textAlign: "right", width: 105 }}>{this.props.table_info.PLNOXRTA}</td>
              </tr>
              <tr style={{ lineHeight: 1, fontWeight: this.props.field==="PLNOXOZ" ? "bold" : "normal" }}>
                <td style={{ padding: "0.5em" , width: 315 }}>NOₓ Ozone Season Emissions (tons)</td>
                <td style={{ paddingRight: "0.5em", textAlign: "right", width: 105 }}>{this.props.table_info.PLNOXOZ}</td>
              </tr>
              <tr style={{ lineHeight: 1, fontWeight: this.props.field==="PLNOXRTO" ? "bold" : "normal" }}>
                <td style={{ padding: "0.5em", width: 315 }}>NOₓ Ozone Season Output Emission Rate (lb/MWh)</td>
                <td style={{ paddingRight: "0.5em", textAlign: "right", width: 105 }}>{this.props.table_info.PLNOXRTO}</td>
              </tr>
              <tr style={{ lineHeight: 1, fontWeight: this.props.field==="PLSO2AN" ? "bold" : "normal" }}>
                <td style={{ padding: "0.5em", width: 315 }}>SO₂ Annual Emissions (tons)</td>
                <td style={{ paddingRight: "0.5em", textAlign: "right", width: 105 }}>{this.props.table_info.PLSO2AN}</td>
              </tr>
              <tr style={{ lineHeight: 1, fontWeight: this.props.field==="PLSO2RTA" ? "bold" : "normal" }}>
                <td style={{ padding: "0.5em", width: 315 }}>SO₂ Annual Output Emission Rate (lb/MWh)</td>
                <td style={{ paddingRight: "0.5em", textAlign: "right", width: 105 }}>{this.props.table_info.PLSO2RTA}</td>
              </tr>
              <tr style={{ lineHeight: 1, fontWeight: this.props.field==="PLCO2AN" ? "bold" : "normal" }}>
                <td style={{ padding: "0.5em", width: 315 }}>CO₂ Annual Emissions (tons)</td>
                <td style={{ paddingRight: "0.5em", textAlign: "right", width: 105 }}>{this.props.table_info.PLCO2AN}</td>
              </tr>
              <tr style={{ lineHeight: 1, fontWeight: this.props.field==="PLCO2RTA" ? "bold" : "normal" }}>
                <td style={{ padding: "0.5em", width: 315 }}>CO₂ Annual Output Emission Rate (lb/MWh)</td>
                <td style={{ paddingRight: "0.5em", textAlign: "right", width: 105 }}>{this.props.table_info.PLCO2RTA}</td>
              </tr>
              <tr style={{ lineHeight: 1, fontWeight: this.props.field==="PLCH4AN" ? "bold" : "normal" }}>
                <td style={{ padding: "0.5em", width: 315 }}>CH₄ Annual Emissions (lbs)</td>
                <td style={{ paddingRight: "0.5em", textAlign: "right", width: 105 }}>{this.props.table_info.PLCH4AN}</td>
              </tr>
              <tr style={{ lineHeight: 1, fontWeight: this.props.field==="PLCH4RTA" ? "bold" : "normal" }}>
                <td style={{ padding: "0.5em", width: 315 }}>CH₄ Annual Output Emission Rate (lb/MWh)</td>
                <td style={{ paddingRight: "0.5em", textAlign: "right", width: 105 }}>{this.props.table_info.PLCH4RTA}</td>
              </tr>
              <tr style={{ lineHeight: 1, fontWeight: this.props.field==="PLN2OAN" ? "bold" : "normal" }}>
                <td style={{ padding: "0.5em", width: 315 }}>N₂O Annual Emissions (lbs)</td>
                <td style={{ paddingRight: "0.5em", textAlign: "right", width: 105 }}>{this.props.table_info.PLN2OAN}</td>
              </tr>
              <tr style={{ lineHeight: 1, fontWeight: this.props.field==="PLN2ORTA" ? "bold" : "normal" }}>
                <td style={{ padding: "0.5em", width: 315 }}>N₂O Annual Output Emission Rate (lb/MWh)</td>
                <td style={{ paddingRight: "0.5em", textAlign: "right", width: 105 }}>{this.props.table_info.PLN2ORTA}</td>
              </tr>
              <tr style={{ lineHeight: 1, fontWeight: this.props.field==="PLCO2EQA" ? "bold" : "normal" }}>
                <td style={{ padding: "0.5em", width: 315 }}>CO₂ equivalent Annual Emissions (tons)</td>
                <td style={{ paddingRight: "0.5em", textAlign: "right", width: 105 }}>{this.props.table_info.PLCO2EQA}</td>
              </tr>
              <tr style={{ lineHeight: 1, fontWeight: this.props.field==="PLC2ERTA" ? "bold" : "normal"}}>
                <td style={{ padding: "0.5em", width: 315, borderBottomLeftRadius: "10px" }}>CO₂ equivalent Output Emission Rate (lb/MWh)</td>
                <td style={{ paddingRight: "0.5em", textAlign: "right", width: 105, borderBottomRightRadius: "10px"}}>{this.props.table_info.PLC2ERTA}</td>
              </tr>
            </tbody>
          </table>
        )}
      </div>
    );
  }
}

export default UpdatedTable;
