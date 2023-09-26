import React, { Component } from "react";
import Dialog from "./Dialog.js";
import * as d3 from "d3";
import { forEach } from "underscore";
import { legendSymbol } from "d3-svg-legend";
import { line } from "d3";

class UpdatedTable extends Component {
  constructor(props) {
    super(props);
    this.trends = React.createRef();
    this.state = {
      show_modal: false,
    };
    let trend;
  }



  initView() {
    if (!this.props.title.startsWith("Grid gross loss")) {
      d3.selectAll(".trendSVGs").selectAll("text").remove();
      d3.selectAll(".trendSVGs").select("path").remove();

      let trendXScale,
        trendYScale,
        height = 20,
        width = 132;

      let data = Object.entries(this.props.trend_info).filter(key => key[0] !== "eGRID Subregion" && key[0] !== "Plant Name");

      let trends = d3.selectAll(".trendSVGs")
        .attr("width", width)
        .attr("height", height)

      let trendYScaleList = [],
        trendXScaleList = [],
        xArrayList = [],
        yArrayList = [],
        colorArrayList = [];

      if (this.props.title.startsWith("Resource Mix")) {
        data.forEach(d => {

          let valueArray, min, max, yearArray, fuel_color;
          if (d[1].value == undefined || d[1].year == undefined || d[1].type == undefined || d[1].value.length <= 1 || d[1].year.length <= 1) {
            valueArray = [undefined, undefined, undefined];
            max = d3.max(valueArray);
            min = d3.min(valueArray);
            yearArray = [undefined, undefined, undefined];
            fuel_color = "steelblue";
          } else {
            valueArray = d[1].value;
            max = d3.max(valueArray);
            min = d3.min(valueArray);
            yearArray = d[1].year;
            fuel_color = this.props.fuel_color[d[1].type];
          }
          let extent = d3.extent(yearArray);
          trendXScale = d3.scaleLinear().domain(extent).rangeRound([5, width - 5]);
          trendYScale = d3.scaleLinear().domain([min, max]).rangeRound([height - 5, 5]);
          trendYScaleList.push(trendYScale);
          trendXScaleList.push(trendXScale);
          xArrayList.push(yearArray);
          yArrayList.push(valueArray);
          colorArrayList.push(fuel_color);

        })
      } else {
        data.forEach((d, i) => {
          if (!d[1] || d[1] == undefined || typeof d[1][0] === "string" || d[1][0] == undefined || d[1][0].length <= 1) {
            return;
          } else {
            if (d[1][0].indexOf('2018') == -1) {
              d[1][0].push('2018');
              d[1][1].splice(2, 0, '-');
            } else if (d[1][0].indexOf('2019') == -1) {
              d[1][0].push('2019');
              d[1][1].splice(1, 0, '-');
            } else if (d[1][0].indexOf('2020') == -1) {
              d[1][0].push('2020');
              d[1][1].splice(0, 0, '-');
            } else if (d[1][0].indexOf('2021') == -1) {
              d[1][0].push('2021');
              d[1][1].splice(0, 0, '-');
            }

            let valueArray = d[1][1].map(g => g[0]),
              max = d3.max(valueArray.filter(d => typeof d == 'number')),
              min = d3.min(valueArray.filter(d => typeof d == 'number')),
              yearArray = d[1][0],
              yearArrayInt = yearArray.map(Number);
            yearArrayInt.sort(function (a, b) {
              return a - b;
            });
            let emptyValIdx = valueArray.indexOf('')
            if (emptyValIdx != -1) {
              valueArray.splice(emptyValIdx, 0, undefined);
            }

            let extent = d3.extent(yearArrayInt);
            trendXScale = d3.scaleLinear().domain(extent).rangeRound([5, width - 5]);
            trendYScale = d3.scaleLinear().domain([min, max]).rangeRound([height - 5, 5]);
            trendYScaleList.push(trendYScale);
            trendXScaleList.push(trendXScale);
            xArrayList.push(yearArrayInt);
            yArrayList.push(valueArray)
          }
        })
      }

      let line = function (x, y) {
        return d3.line()
          .x((d, i) => x[i])
          .y((d, i) => y[i])
          .defined((d, i) =>
            y[i] !== undefined
          )
          (Array(x.length));
      }

      let xArray, yArray;
      if (trendYScale && trendYScale) {
        yArray = yArrayList.map((p, i) => p.map(e => trendYScaleList[i](e)))
        xArray = xArrayList.map((p, i) => p.map(e => trendXScaleList[i](e)))
      }

      if (trendXScale && trendYScale && this.props.title.startsWith("Resource Mix")) {
        trends.append("path")
          .attr("d", (d, i) => yArray[i][1] === undefined || yArray[i][1] === NaN || typeof yArray[i][1] !== "number" ? '' : line(xArray[i], yArray[i]))
          .attr("fill", "none")
          .attr("stroke", (d, i) => colorArrayList[i])
          .attr("stroke-width", 1.5);
        // trends.append("text").text((d, i) => yArrayList[i]).attr("y", 0 + height - 5).attr("x", 5);
        trends.append("text").text((d, i) => yArray[i][1] === undefined || yArray[i][1] === NaN || typeof yArray[i][1] !== "number" ? "No trend data" : "").attr("y", 0 + height - 5).attr("x", 5);
      } else if (trendXScale && trendYScale && !this.props.title.startsWith("Resource Mix")) {
        trends.append("path")
          .attr("d", (d, i) => yArray[i][1] === undefined || yArray[i][1] === NaN || typeof yArray[i][1] !== "number" ? "" : line(xArray[i], yArray[i]))
          .attr("fill", "none")
          .attr("stroke", this.props.map_fill[3])
          .attr("stroke-width", 1.5);
        trends.append("text").text((d, i) => yArray[i][1] === undefined || yArray[i][1] === NaN || typeof yArray[i][1] !== "number" ? "No trend data" : "").attr("y", 0 + height - 5).attr("x", 5);
        // trends.append("text").text((d, i) => yArrayList[i]).attr("y", 0 + height - 5).attr("x", 5)
      } else {
        trends.append("text").text("-").attr("y", 0 + height - 5).attr("x", width - 5)
      }
    }
  }


  componentDidMount() {
    this.initView();
  }

  componentDidUpdate() {
    this.initView();
  }



  render() {

    let ggl_table = [],
      plant_table = [],
      ba_table = [],
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
            <td>{d.Subregion}</td>
            <td>{d.value}</td>
          </tr>
        );
        ggl_table.push(row);
      });
    } else if (this.props.title.startsWith("Resource Mix")) {
      Object.keys(this.props.table_info).forEach((r, i) => {
        let row, info = this.props.table_info[r];
        this.trend = this.props.trend_info[r];
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
            key={i}
          >
            <td>{r}</td>
            <td>
              {this.props.table_info[r]["US_" + this.props.table_info[r].type]}
            </td>
            <td style={{ width: this.props.region_level === "state" ? 175 : 120 }}>{this.props.table_info[r][this.props.table_info[r].type]}</td>
            <td>
              <svg className="trendSVGs" ref={this.trends.current}>
              </svg>
            </td>
          </tr>
        );
        resourcemix_table.push(row);
      });
    } else if (this.props.title.includes("by plant")) {
      Object.keys(this.props.table_info).forEach((r, i) => {
        let row, info = this.props.table_info[r];
        this.trend = this.props.trend_info[r];
        if (r !== "eGRID Subregion" && r !== "Plant Name" && r !== "Facility ID" && r !== "Plant State" && r !== "Plant Primary Fuel" && r !== "Plant Secondary Fuel") {
          if ((r === "Number of Units" || r === "Number of Generators") && info !== "-") info = d3.format(".0f")(+info);
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
              <td>{info}</td>
              <td>
                <svg className="trendSVGs" ref={this.trends.current}>
                </svg>
              </td>
            </tr>
          );
        } else if (r === "eGRID Subregion" || r === "Plant Name") {
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
              <td>-</td>

            </tr>
          );
        } else if (r === "Facility ID" || r === "Plant State" || r === "Plant Primary Fuel" || r === "Plant Secondary Fuel") {
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
              <td>{info}</td>
              <td>-</td>
            </tr>
          );
        }
        plant_table.push(row);
      });
    } else {
      Object.keys(this.props.table_info).forEach((r, i) => {
        let row, info = this.props.table_info[r];
        this.trend = this.props.trend_info[r];
        if (r !== "eGRID Subregion" && r !== "Balancing Authority Name" && r !== "Balancing Authority Code") {
          if ((r === "Number of Units" || r === "Number of Generators") && info !== "-") info = d3.format(".0f")(+info);
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
              <td>{info}</td>
              <td>
                <svg className="trendSVGs" ref={this.trends.current}>
                </svg>
              </td>
            </tr>
          );
        } else if (r === "Balancing Authority Name") {
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
              <td>-</td>

            </tr>
          );
        } else if (r === "Balancing Authority Code") {
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
              <td>{info}</td>
              <td>-</td>
            </tr>
          );
        }
        ba_table.push(row);
      });
    }

    return (
      <div>
        {this.props.title.startsWith("Resource Mix") ? (
          <table id="resourcemix-table">
            <thead>
              <tr style={{ height: 100 }}>
                <th>Generation by Fuel Type</th>
                <th>
                  US
                  <br />
                  Resource Mix (%)
                </th>
                <th style={{ width: this.props.region_level === "state" ? 175 : 120 }}>
                  {this.props.region === "balancing authority" ? "Balancing Authority" : this.props.region === "state" ? "State" : this.props.region}
                  <br />
                  {"Resource Mix (%)"}
                </th>
                <th>Trend <br></br> {this.props.trendsData.length > 0 ? `(${this.props.trendsData[0].Year} – ${this.props.trendsData[this.props.trendsData.length - 1].Year})` : ""}</th>
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
        ) : this.props.title.includes("by plant") ? (
          <table id="plant-table">
            <thead>
              <tr>
                <th>Plant Name</th>
                <th>{this.props.table_info["Plant Name"]}</th>
                <th>Trend <br></br> ({this.props.trendsData[0].year} – {this.props.trendsData[this.props.trendsData.length - 1].year})</th>
              </tr>
            </thead>
            <tbody>
              {plant_table}
            </tbody>
          </table>
        ) : this.props.title.includes("by balancing authority") ? (
          <table id="ba-table">
            <thead>
              <tr>
                <th>Balancing Authority Name</th>
                <th>{this.props.table_info["Balancing Authority Name"]}</th>
                <th>Trend <br></br> ({this.props.trendsData[0].year} – {this.props.trendsData[this.props.trendsData.length - 1].year})</th>
              </tr>
            </thead>
            <tbody>
              {ba_table}
            </tbody>
          </table>
        ) : null}
        <Dialog
          id="subregion-map"
          title=""
          name="eGRID Subregion"
          show={this.state.show_modal}
          onHide={() => this.setState({ show_modal: false })}
        />
      </div>
    );
  }
}

export default UpdatedTable;
