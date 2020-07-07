import React, { Component } from "react";
import Dialog from "./Dialog.js";
import SubregionMap from "./assets/img/2018_egrid_subregions.png";

class UpdatedTable extends Component {
  constructor(props) {
    super(props);
    this.state = {
      show_modal: false
    };
  }

  render() {
    let ggl_table = [];

    if (this.props.data !== undefined) {
      this.props.data.forEach((d,i)=>{
        let row;
        if (i<this.props.data.length-1) {
          row = (<tr key={i} style={{ lineHeight: 1 }}>
            <td style={{ padding: "0.1em", textAlign: "center"}}>{d.name}</td>
            <td style={{ padding: "0.1em", textAlign: "right"}}>{d.value}</td>
          </tr>);
        } else {
          row = (<tr key={i} style={{ lineHeight: 1 }}>
            <td style={{ padding: "0.1em", textAlign: "center", borderBottomLeftRadius: "10px"}}>{d.name}</td>
            <td style={{ padding: "0.1em", textAlign: "right", borderBottomRightRadius: "10px"}}>{d.value}</td>
          </tr>);
        }
        ggl_table.push(row);
      });
    }

    return (
      <div>
        {this.props.title.startsWith("Resource Mix") ? (
          <table style={{ maxWidth: 400, fontSize: "0.8em", borderRadius: "10px", borderCollapse: "separate", borderStyle: "hidden", boxShadow: "0 0 0 1px", margin: "0 auto"}}>
            <thead>
              <tr style={{ lineHeight: 1 }}>
                <th style={{padding: "0.6em", textAlign: "center", borderTopLeftRadius: "10px"}}>Generation by Fuel Type</th>
                <th style={{padding: "0.6em", textAlign: "right", }}>US<br/>Resource Mix (%)</th>                
                <th style={{padding: "0.6em", borderTopRightRadius: "10px", textAlign: "right", height: 95}}>
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
                      backgroundColor: this.props.type==="COAL"?"rgba(0, 113, 188, 0.1)":"rgb(256, 256, 256)",
                      fontWeight:
                        this.props.type === "COAL" ? "bold" : "normal",
                    }}
                  >
                    <td style={{ padding: "0.6em" , textAlign: "center"}}>Coal</td>
                    <td style={{ textAlign: "right", padding: "0.6em"}}>
                      {this.props.table_info.US_COAL}
                    </td>
                    <td style={{ textAlign: "right", padding: "0.6em" }}>
                      {this.props.table_info.COAL}
                    </td>
                  </tr>
                  <tr
                    style={{
                      lineHeight: 1,
                      backgroundColor: this.props.type === "OIL"?"rgba(0, 113, 188, 0.1)":"rgb(256, 256, 256)",
                      fontWeight: this.props.type === "OIL" ? "bold" : "normal",
                    }}
                  >
                    <td style={{ padding: "0.6em" , textAlign: "center"}}>Oil</td>
                    <td style={{ textAlign: "right", padding: "0.6em" }}>
                      {this.props.table_info.US_OIL}
                    </td>
                    <td style={{ textAlign: "right", padding: "0.6em" }}>
                      {this.props.table_info.OIL}
                    </td>
                  </tr>
                  <tr
                    style={{
                      lineHeight: 1,
                      backgroundColor: this.props.type === "GAS"?"rgba(0, 113, 188, 0.1)":"rgb(256, 256, 256)",
                      fontWeight: this.props.type === "GAS" ? "bold" : "normal",
                    }}
                  >
                    <td style={{ padding: "0.6em" , textAlign: "center"}}>Gas</td>
                    <td style={{ textAlign: "right", padding: "0.6em" }}>
                      {this.props.table_info.US_GAS}
                    </td>
                    <td style={{ textAlign: "right", padding: "0.6em" }}>
                      {this.props.table_info.GAS}
                    </td>
                  </tr>
                  <tr
                    style={{
                      lineHeight: 1,
                      backgroundColor: this.props.type === "NUCLEAR"?"rgba(0, 113, 188, 0.1)":"rgb(256, 256, 256)",
                      fontWeight:
                        this.props.type === "NUCLEAR" ? "bold" : "normal",
                    }}
                  >
                    <td style={{ padding: "0.6em" , textAlign: "center"}}>Nuclear</td>
                    <td style={{ textAlign: "right", padding: "0.6em" }}>
                      {this.props.table_info.US_NUCLEAR}
                    </td>
                    <td style={{ textAlign: "right", padding: "0.6em" }}>
                      {this.props.table_info.NUCLEAR}
                    </td>
                  </tr>
                  <tr
                    style={{
                      lineHeight: 1,
                      backgroundColor: this.props.type === "HYDRO"?"rgba(0, 113, 188, 0.1)":"rgb(256, 256, 256)",
                      fontWeight:
                        this.props.type === "HYDRO" ? "bold" : "normal",
                    }}
                  >
                    <td style={{ padding: "0.6em" , textAlign: "center"}}>Hydro</td>
                    <td style={{ textAlign: "right", padding: "0.6em" }}>
                      {this.props.table_info.US_HYDRO}
                    </td>
                    <td style={{ textAlign: "right", padding: "0.6em" }}>
                      {this.props.table_info.HYDRO}
                    </td>
                  </tr>
                  <tr
                    style={{
                      lineHeight: 1,
                      backgroundColor: this.props.type === "BIOMASS"?"rgba(0, 113, 188, 0.1)":"rgb(256, 256, 256)",
                      fontWeight:
                        this.props.type === "BIOMASS" ? "bold" : "normal",
                    }}
                  >
                    <td style={{ padding: "0.6em" , textAlign: "center" }}>Biomass</td>
                    <td style={{ textAlign: "right", padding: "0.6em" }}>
                      {this.props.table_info.US_BIOMASS}
                    </td>
                    <td style={{ textAlign: "right", padding: "0.6em" }}>
                      {this.props.table_info.BIOMASS}
                    </td>
                  </tr>
                  <tr
                    style={{
                      lineHeight: 1,
                      backgroundColor: this.props.type === "WIND"?"rgba(0, 113, 188, 0.1)":"rgb(256, 256, 256)",
                      fontWeight:
                        this.props.type === "WIND" ? "bold" : "normal",
                    }}
                  >
                    <td style={{ padding: "0.6em", textAlign: "center" }}>Wind</td>
                    <td style={{ textAlign: "right", padding: "0.6em" }}>
                      {this.props.table_info.US_WIND}
                    </td>
                    <td style={{ textAlign: "right", padding: "0.6em" }}>
                      {this.props.table_info.WIND}
                    </td>
                  </tr>
                  <tr
                    style={{
                      lineHeight: 1,
                      backgroundColor: this.props.type === "SOLAR"?"rgba(0, 113, 188, 0.1)":"rgb(256, 256, 256)",
                      fontWeight:
                        this.props.type === "SOLAR" ? "bold" : "normal",
                    }}
                  >
                    <td style={{ padding: "0.6em", textAlign: "center" }}>Solar</td>
                    <td style={{ textAlign: "right", padding: "0.6em" }}>
                      {this.props.table_info.US_SOLAR}
                    </td>
                    <td style={{ textAlign: "right", padding: "0.6em" }}>
                      {this.props.table_info.SOLAR}
                    </td>
                  </tr>
                  <tr
                    style={{
                      lineHeight: 1,
                      backgroundColor: this.props.type === "GEOTHERMAL"?"rgba(0, 113, 188, 0.1)":"rgb(256, 256, 256)",
                      fontWeight:
                        this.props.type === "GEOTHERMAL" ? "bold" : "normal",
                    }}
                  >
                    <td style={{ padding: "0.6em", textAlign: "center" }}>Geothermal</td>
                    <td style={{ textAlign: "right", padding: "0.6em" }}>
                      {this.props.table_info.US_GEOTHERMAL}
                    </td>
                    <td style={{ textAlign: "right", padding: "0.6em" }}>
                      {this.props.table_info.GEOTHERMAL}
                    </td>
                  </tr>
                  <tr
                    style={{
                      lineHeight: 1,
                      backgroundColor: this.props.type === "OFSL"?"rgba(0, 113, 188, 0.1)":"rgb(256, 256, 256)",
                      fontWeight:
                        this.props.type === "OFSL" ? "bold" : "normal",
                    }}
                  >
                    <td style={{ padding: "0.6em", textAlign: "center" }}>Other Fossil</td>
                    <td style={{ textAlign: "right", padding: "0.6em" }}>
                      {this.props.table_info.US_OFSL}
                    </td>
                    <td style={{ textAlign: "right", padding: "0.6em" }}>
                      {this.props.table_info.OFSL}
                    </td>
                  </tr>
                  <tr
                    style={{
                      lineHeight: 1,
                      backgroundColor: this.props.type === "OTHF"?"rgba(0, 113, 188, 0.1)":"rgb(256, 256, 256)",
                      fontWeight:
                        this.props.type === "OTHF" ? "bold" : "normal",
                    }}
                  >
                    <td style={{ padding: "0.6em", textAlign: "center", borderBottomLeftRadius: "10px"}}>Other Unknown or Purchased Fuel</td>
                    <td style={{ textAlign: "right", padding: "0.6em" }}>
                      {this.props.table_info.US_OTHF}
                    </td>
                    <td style={{ textAlign: "right", padding: "0.6em", borderBottomRightRadius: "10px"}}>
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
                      backgroundColor: this.props.type === "HYDRO"?"rgba(0, 113, 188, 0.1)":"rgb(256, 256, 256)",
                      fontWeight:
                        this.props.type === "HYDRO" ? "bold" : "normal",
                    }}
                  >
                    <td style={{ padding: "0.6em" }}>Hydro</td>
                    <td style={{ textAlign: "right", padding: "0.6em" }}>
                      {this.props.table_info.US_HYDRO}
                    </td>
                    <td style={{ textAlign: "right", padding: "0.6em" }}>
                      {this.props.table_info.HYDRO}
                    </td>
                  </tr>
                  <tr
                    style={{
                      lineHeight: 1,
                      backgroundColor: this.props.type === "TNPR"?"rgba(0, 113, 188, 0.1)":"rgb(256, 256, 256)",
                      fontWeight:
                        this.props.type === "TNPR" ? "bold" : "normal",
                    }}
                  >
                    <td style={{ padding: "0.6em"}}>Total Nonrenewables</td>
                    <td style={{ textAlign: "right", padding: "0.6em" }}>
                      {this.props.table_info.US_TNPR}
                    </td>
                    <td style={{ textAlign: "right", padding: "0.6em"}}>
                      {this.props.table_info.TNPR}
                    </td>
                  </tr>
                  <tr
                    style={{
                      lineHeight: 1,
                      backgroundColor: this.props.type === "THPR"?"rgba(0, 113, 188, 0.1)":"rgb(256, 256, 256)",
                      fontWeight:
                        this.props.type === "THPR" ? "bold" : "normal",
                    }}
                  >
                    <td style={{ padding: "0.6em", borderBottomLeftRadius: "10px" }}>Total Nonhydro Renewables</td>
                    <td style={{ textAlign: "right", padding: "0.6em" }}>
                      {this.props.table_info.US_THPR}
                    </td>
                    <td style={{ textAlign: "right", padding: "0.6em" , borderBottomRightRadius: "10px" }}>
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
                      backgroundColor: this.props.type === "CYPR"?"rgba(0, 113, 188, 0.1)":"rgb(256, 256, 256)",
                      fontWeight:
                        this.props.type === "CYPR" ? "bold" : "normal",
                    }}
                  >
                    <td style={{ padding: "0.6em"}}>Total Combustion</td>
                    <td style={{ textAlign: "right", padding: "0.6em" }}>
                      {this.props.table_info.US_CYPR}
                    </td>
                    <td style={{ textAlign: "right", padding: "0.6em"}}>
                      {this.props.table_info.CYPR}
                    </td>
                  </tr>
                  <tr
                    style={{
                      lineHeight: 1,
                      backgroundColor: this.props.type === "CNPR"?"rgba(0, 113, 188, 0.1)":"rgb(256, 256, 256)",
                      fontWeight:
                        this.props.type === "CNPR" ? "bold" : "normal",
                    }}
                  >
                    <td style={{ padding: "0.6em", borderBottomLeftRadius: "10px" }}>Total Noncumbustion</td>
                    <td style={{ textAlign: "right", padding: "0.6em" }}>
                      {this.props.table_info.US_CNPR}
                    </td>
                    <td style={{ textAlign: "right", padding: "0.6em", borderBottomRightRadius: "10px" }}>
                      {this.props.table_info.CNPR}
                    </td>
                  </tr>
              </tbody>
            )}
          </table>
        ) : (
          this.props.title.startsWith("Grid gross loss rates") ? (
        <table style={{fontSize: "0.8em", borderRadius: "10px", borderCollapse: "separate", borderStyle: "hidden", boxShadow: "0 0 0 1px", margin: "0 auto"}}>
          <thead>
            <tr style={{ lineHeight: 1 }}>
              <th style={{ padding: "0.5em", borderTopLeftRadius: "10px"}}>eGRID Subregion</th>
              <th style={{ padding: "0.5em", textAlign: "right", height: 50, borderTopRightRadius: "10px"}}>Grid Gross Loss Rates</th>
            </tr>
          </thead>
          <tbody>
            {ggl_table}
          </tbody>
        </table>) : (
            <table style={{fontSize: "0.8em", borderRadius: "10px", borderCollapse: "separate", borderStyle: "hidden", boxShadow: "0 0 0 1px"}}>
            <thead>
              <tr style={{ lineHeight: 1 }}>
                <th style={{ padding: "0.4em", textAlign: "center", width: 416, borderTopLeftRadius: "10px"}}>Plant Name</th>
                <th style={{ padding: "0.4em", textAlign: "right", width: 170, height: 50, borderTopRightRadius: "10px"}}>{this.props.table_info.PNAME}</th>
              </tr>
            </thead>
            <tbody>
              <tr style={{ lineHeight: 1 }}>
                <td style={{ padding: "0.4em", textAlign: "center", width: 416}}>Facility ID</td>
                <td style={{ padding: 0, paddingRight: "0.4em", width: 170, textAlign: "right"}}>{this.props.table_info.ORISPL}</td>
              </tr>
              <tr style={{ lineHeight: 1 }}>
                <td style={{ padding: "0.4em", textAlign: "center", width: 416 }}>Plant State</td>
                <td style={{ padding: 0, paddingRight: "0.4em", width: 170, textAlign: "right"}}>{this.props.table_info.PSTATABB}</td>
              </tr>
              <tr style={{ lineHeight: 1 }}>
                <td style={{ padding: "0.4em", textAlign: "center", width: 416 }}>eGRID Subregion</td>
                <td onClick={()=>{this.setState({ show_modal: true });}} style={{ cursor: "pointer", padding: 0, paddingRight: "0.4em", textAlign: "right", width: 170, color: "rgb(0, 113, 188)", fontWeight: "bold"}}>
                  {this.props.table_info.SUBRGN}
                </td>
              </tr>
              <tr style={{ lineHeight: 1 }}>
                <td style={{ padding: "0.4em", textAlign: "center", width: 416 }}>Plant Primary Fuel</td>
                <td style={{ padding: 0, paddingRight: "0.4em", textAlign: "right", width: 170 }}>{this.props.table_info.PLPRMFL}</td>
              </tr>
              <tr style={{ lineHeight: 1 }}>
                <td style={{ padding: "0.4em", textAlign: "center", width: 416 }}>Plant Secondary Fuel</td>
                <td style={{ padding: 0, paddingRight: "0.4em", textAlign: "right", width: 170 }}>{this.props.table_info.SECFUEL}</td>
              </tr>
              <tr style={{ lineHeight: 1, backgroundColor: this.props.field === "NUMUNT" ?"rgba(0, 113, 188, 0.1)":"rgb(256, 256, 256)", fontWeight: this.props.field==="NUMUNT" ? "bold" : "normal"}}>
                <td style={{ padding: "0.4em", textAlign: "center", width: 416 }}>Number of Units</td>
                <td style={{ padding: 0, paddingRight: "0.4em", textAlign: "right", width: 170}}>{this.props.table_info.NUMUNT}</td>
              </tr>
              <tr style={{ lineHeight: 1, backgroundColor: this.props.field === "NUMGEN" ?"rgba(0, 113, 188, 0.1)":"rgb(256, 256, 256)", fontWeight: this.props.field==="NUMGEN" ? "bold" : "normal"}}>
                <td style={{ padding: "0.4em", textAlign: "center", width: 416}}>Number of Generators</td>
                <td style={{ padding: 0, paddingRight: "0.4em", textAlign: "right", width: 170}}>{this.props.table_info.NUMGEN}</td>
              </tr>
              <tr style={{ lineHeight: 1, backgroundColor: this.props.field === "PLNAMEPCAP" ?"rgba(0, 113, 188, 0.1)":"rgb(256, 256, 256)", fontWeight: this.props.field==="PLNAMEPCAP" ? "bold": "normal"}}>
                <td style={{ padding: "0.4em", textAlign: "center", width: 416,}}>Nameplate Capacity (MW)</td>
                <td style={{ padding: 0, paddingRight: "0.4em", textAlign: "right", width: 170 }}>{this.props.table_info.PLNAMEPCAP}</td>
              </tr>
              <tr style={{ lineHeight: 1 }}>
                <td style={{ padding: "0.4em", textAlign: "center", width: 416 }}>Plant Capacity Factor</td>
                <td style={{ padding: 0, paddingRight: "0.4em", textAlign: "right", width: 170 }}>{this.props.table_info.CAPFAC}</td>
              </tr>
              <tr style={{ lineHeight: 1, backgroundColor: this.props.field === "PLNGENAN" ?"rgba(0, 113, 188, 0.1)":"rgb(256, 256, 256)", fontWeight: this.props.field==="PLNGENAN" ? "bold" : "normal"}}>
                <td style={{ padding: "0.4em", textAlign: "center", width: 416 }}>Plant Generation (MWh)</td>
                <td style={{ padding: 0, paddingRight: "0.4em", textAlign: "right", width: 170 }}>{this.props.table_info.PLNGENAN}</td>
              </tr>
              <tr style={{ lineHeight: 1, backgroundColor: this.props.field === "PLHTIANT" ?"rgba(0, 113, 188, 0.1)":"rgb(256, 256, 256)", fontWeight: this.props.field==="PLHTIANT" ? "bold" : "normal" }}>
                <td style={{ padding: "0.4em", textAlign: "center", width: 416 }}>Heat Input (MMBtu)</td>
                <td style={{ padding: 0, paddingRight: "0.4em", textAlign: "right", width: 170 }}>{this.props.table_info.PLHTIANT}</td>
              </tr>

              <tr style={{ lineHeight: 1, backgroundColor: this.props.field === "PLNOXAN" ?"rgba(0, 113, 188, 0.1)":"rgb(256, 256, 256)", fontWeight: this.props.field==="PLNOXAN" ? "bold" : "normal" }}>
                <td style={{ padding: "0.4em", textAlign: "center", width: 416}}>NOₓ Annual Emissions (tons)</td>
                <td style={{ padding: 0, paddingRight: "0.4em", textAlign: "right", width: 170 }}>{this.props.table_info.PLNOXAN}</td>
              </tr>
              <tr style={{ lineHeight: 1, backgroundColor: this.props.field === "PLNOXOZ" ?"rgba(0, 113, 188, 0.1)":"rgb(256, 256, 256)", fontWeight: this.props.field==="PLNOXOZ" ? "bold" : "normal" }}>
                <td style={{ padding: "0.4em" , textAlign: "center", width: 416 }}>NOₓ Ozone Season Emissions (tons)</td>
                <td style={{ padding: 0, paddingRight: "0.4em", textAlign: "right", width: 170 }}>{this.props.table_info.PLNOXOZ}</td>
              </tr>
              <tr style={{ lineHeight: 1, backgroundColor: this.props.field === "PLSO2AN" ?"rgba(0, 113, 188, 0.1)":"rgb(256, 256, 256)", fontWeight: this.props.field==="PLSO2AN" ? "bold" : "normal" }}>
                <td style={{ padding: "0.4em", textAlign: "center", width: 416 }}>SO₂ Annual Emissions (tons)</td>
                <td style={{ padding: 0, paddingRight: "0.4em", textAlign: "right", width: 170 }}>{this.props.table_info.PLSO2AN}</td>
              </tr>
              <tr style={{ lineHeight: 1, backgroundColor: this.props.field === "PLCO2AN" ?"rgba(0, 113, 188, 0.1)":"rgb(256, 256, 256)", fontWeight: this.props.field==="PLCO2AN" ? "bold" : "normal" }}>
                <td style={{ padding: "0.4em", textAlign: "center", width: 416 }}>CO₂ Annual Emissions (tons)</td>
                <td style={{ padding: 0, paddingRight: "0.4em", textAlign: "right", width: 170 }}>{this.props.table_info.PLCO2AN}</td>
              </tr>
              <tr style={{ lineHeight: 1, backgroundColor: this.props.field === "PLCH4AN" ?"rgba(0, 113, 188, 0.1)":"rgb(256, 256, 256)", fontWeight: this.props.field==="PLCH4AN" ? "bold" : "normal" }}>
                <td style={{ padding: "0.4em", textAlign: "center", width: 416 }}>CH₄ Annual Emissions (lbs)</td>
                <td style={{ padding: 0, paddingRight: "0.4em", textAlign: "right", width: 170 }}>{this.props.table_info.PLCH4AN}</td>
              </tr>
              <tr style={{ lineHeight: 1, backgroundColor: this.props.field === "PLN2OAN" ?"rgba(0, 113, 188, 0.1)":"rgb(256, 256, 256)", fontWeight: this.props.field==="PLN2OAN" ? "bold" : "normal" }}>
                <td style={{ padding: "0.4em", textAlign: "center", width: 416 }}>N₂O Annual Emissions (lbs)</td>
                <td style={{ padding: 0, paddingRight: "0.4em", textAlign: "right", width: 170 }}>{this.props.table_info.PLN2OAN}</td>
              </tr>
              <tr style={{ lineHeight: 1, backgroundColor: this.props.field === "PLCO2EQA" ?"rgba(0, 113, 188, 0.1)":"rgb(256, 256, 256)", fontWeight: this.props.field==="PLCO2EQA" ? "bold" : "normal" }}>
                <td style={{ padding: "0.4em", textAlign: "center", width: 416 }}>CO₂ equivalent Annual Emissions (tons)</td>
                <td style={{ padding: 0, paddingRight: "0.4em", textAlign: "right", width: 170 }}>{this.props.table_info.PLCO2EQA}</td>
              </tr>
              <tr style={{ lineHeight: 1, backgroundColor: this.props.field === "PLNOXRTA" ?"rgba(0, 113, 188, 0.1)":"rgb(256, 256, 256)", fontWeight: this.props.field==="PLNOXRTA" ? "bold" : "normal" }}>
                <td style={{ padding: "0.4em", textAlign: "center", width: 416}}>NOₓ Annual Output Emission Rate (lb/MWh)</td>
                <td style={{ padding: 0, paddingRight: "0.4em", textAlign: "right", width: 170 }}>{this.props.table_info.PLNOXRTA}</td>
              </tr>
              <tr style={{ lineHeight: 1, backgroundColor: this.props.field === "PLNOXRTO" ?"rgba(0, 113, 188, 0.1)":"rgb(256, 256, 256)", fontWeight: this.props.field==="PLNOXRTO" ? "bold" : "normal" }}>
                <td style={{ padding: "0.4em", textAlign: "center", width: 416 }}>NOₓ Ozone Season Output Emission Rate (lb/MWh)</td>
                <td style={{ padding: 0, paddingRight: "0.4em", textAlign: "right", width: 170 }}>{this.props.table_info.PLNOXRTO}</td>
              </tr>
              <tr style={{ lineHeight: 1, backgroundColor: this.props.field === "PLSO2RTA" ?"rgba(0, 113, 188, 0.1)":"rgb(256, 256, 256)", fontWeight: this.props.field==="PLSO2RTA" ? "bold" : "normal" }}>
                <td style={{ padding: "0.4em", textAlign: "center", width: 416 }}>SO₂ Annual Output Emission Rate (lb/MWh)</td>
                <td style={{ padding: 0, paddingRight: "0.4em", textAlign: "right", width: 170 }}>{this.props.table_info.PLSO2RTA}</td>
              </tr>
              <tr style={{ lineHeight: 1, backgroundColor: this.props.field === "PLCO2RTA" ?"rgba(0, 113, 188, 0.1)":"rgb(256, 256, 256)", fontWeight: this.props.field==="PLCO2RTA" ? "bold" : "normal" }}>
                <td style={{ padding: "0.4em", textAlign: "center", width: 416 }}>CO₂ Annual Output Emission Rate (lb/MWh)</td>
                <td style={{ padding: 0, paddingRight: "0.4em", textAlign: "right", width: 170 }}>{this.props.table_info.PLCO2RTA}</td>
              </tr>
              <tr style={{ lineHeight: 1, backgroundColor: this.props.field === "PLCH4RTA" ?"rgba(0, 113, 188, 0.1)":"rgb(256, 256, 256)", fontWeight: this.props.field==="PLCH4RTA" ? "bold" : "normal" }}>
                <td style={{ padding: "0.4em", textAlign: "center", width: 416 }}>CH₄ Annual Output Emission Rate (lb/MWh)</td>
                <td style={{ padding: 0, paddingRight: "0.4em", textAlign: "right", width: 170 }}>{this.props.table_info.PLCH4RTA}</td>
              </tr>
              <tr style={{ lineHeight: 1, backgroundColor: this.props.field === "PLN2ORTA" ?"rgba(0, 113, 188, 0.1)":"rgb(256, 256, 256)", fontWeight: this.props.field==="PLN2ORTA" ? "bold" : "normal" }}>
                <td style={{ padding: "0.4em", textAlign: "center", width: 416 }}>N₂O Annual Output Emission Rate (lb/MWh)</td>
                <td style={{ padding: 0, paddingRight: "0.4em", textAlign: "right", width: 170 }}>{this.props.table_info.PLN2ORTA}</td>
              </tr>
              <tr style={{ lineHeight: 1, backgroundColor: this.props.field === "PLC2ERTA" ?"rgba(0, 113, 188, 0.1)":"rgb(256, 256, 256)", fontWeight: this.props.field==="PLC2ERTA" ? "bold" : "normal"}}>
                <td style={{ padding: "0.4em", textAlign: "center", width: 416, borderBottomLeftRadius: "10px" }}>CO₂ equivalent Output Emission Rate (lb/MWh)</td>
                <td style={{ padding: 0, paddingRight: "0.4em", textAlign: "right", width: 170, borderBottomRightRadius: "10px"}}>{this.props.table_info.PLC2ERTA}</td>
              </tr>
            </tbody>
          </table>
          )
        )}
        <Dialog
          is_table="false"
          has_image="true"
          title="eGRID Subregion"
          text={{"text":[], "list":[], "image": SubregionMap}}
          show={this.state.show_modal}
          onHide={() => this.setState({ show_modal: false })}
        />
      </div>
    );
  }
}

export default UpdatedTable;
