import React, { Component } from "react";
import Table from "react-bootstrap/Table";

class UpdatedTable extends Component {
  // constructor(props){
  //   super(props);
  // }

  render() {
    return (
      <div>
        <Table striped bordered hover responsive="sm">
          <thead>
          <tr>
            <th>Generation by Fuel Type</th>
            <th>{"Example Resource Mix (%)"}</th>
            <th>US Resource Mix (%)</th>
          </tr>
          </thead>
          <tbody>
            <tr>
              <td>Coal</td>
              <td></td>
              <td></td>
            </tr>
            <tr>
              <td>Oil</td>
              <td></td>
              <td></td>
            </tr>
            <tr>
              <td>Gas</td>
              <td></td>
              <td></td>
            </tr>
            <tr>
              <td>Nuclear</td>
              <td></td>
              <td></td>
            </tr>
            <tr>
              <td>Hydro</td>
              <td></td>
              <td></td>
            </tr>
            <tr>
              <td>Biomass</td>
              <td></td>
              <td></td>
            </tr>
            <tr>
              <td>Wind</td>
              <td></td>
              <td></td>
            </tr>
            <tr>
              <td>Solar</td>
              <td></td>
              <td></td>
            </tr>
            <tr>
              <td>Geothermal</td>
              <td></td>
              <td></td>
            </tr>
            <tr>
              <td>Other Fossil</td>
              <td></td>
              <td></td>
            </tr>
            <tr>
              <td>Other Unknown/Purchased Fuel</td>
              <td></td>
              <td></td>
            </tr>
            <tr>
              <td>Total Nonrenewables</td>
              <td></td>
              <td></td>
            </tr>
            <tr>
              <td>Total Nonhydro Renewables</td>
              <td></td>
              <td></td>
            </tr>
            <tr>
              <td>Total Combustion</td>
              <td></td>
              <td></td>
            </tr>
            <tr>
              <td>Total Noncumbustion</td>
              <td></td>
              <td></td>
            </tr>
          </tbody>
        </Table>
      </div>
    );
  }
}

export default UpdatedTable;
