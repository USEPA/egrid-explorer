import React, { Component } from "react";
import * as d3 from "d3";
import * as _ from "underscore";
import * as d3_composite from "d3-composite-projections";
import ResourceMixAreaChart from "./ResourceMixAreaChart";
import Dialog from "./Dialog.js";
import UpdatedTable from "./Table";
// import UpdatedTrends from "./Trends";
import searchIcon from "./assets/img/search_solid.png";
import { forEach } from "underscore";

class ResourceMixChart extends Component {
  constructor(props) {
    super(props);
    this.wrapper = React.createRef();
    this.fuels = React.createRef();
    this.barchart = React.createRef();
    this.barchart_wrapper = React.createRef();
    this.axis_y = React.createRef();
    this.axis_x = React.createRef();
    this.micromap = React.createRef();
    this.state = {
      width: this.props.width,
      height: this.props.barchart_height,
      sort_fuel: null,
      mouseover_fuel: null,
      clicked_on_bar: false,
      selected_region: this.props.region,
      table_info: {},
      trend_info: {},
      area_info: [],
      show_modal: false,
      trendsData: this.props.trendsData,
      yearIdx: this.props.year === 2021 ? 3 : this.props.year === 2020 ? 2 : this.props.year === 2019 ? this.props.year === 2018 : 0,
    };
    this.sort_text = "Sort by Primary Fuel:";
    this.sort_reset_text = "Reset";
    this.micromap_width_pct = 0.15;
    this.fuels_filter_pct = 0.85;
    this.barchart_pct = 0.7;
    this.barchart_table_pct = 0.3;

  }

  componentDidMount() {
    this.initView();
    this.resize();
  }

  componentDidUpdate(prevProps, prevState) {
    if (this.props.field !== prevProps.field) {
      this.initView();
    } else {
      if (this.state.sort_fuel !== prevState.sort_fuel) {
        if (
          this.state.sort_fuel !== null
        ) {
          d3.select(this.fuels.current)
            .select(".reset")
            .on("click", () => {
              this.updateView(null);
            });

          this.updateView(this.state.sort_fuel);
        } else if (
          this.state.sort_fuel === null
        ) {
          this.updateView(null);
        }
      } else {
        let w_legend = d3.select(this.fuels.current).node().clientWidth,
          h_legend = this.props.filter_height;
        let nbox = this.props.fuels.length + 2;
        let boxlen = w_legend / nbox > 100 ? 100 : Math.max(w_legend / nbox, 75);
        let boxlen_reset = boxlen;

        if (this.state.clicked_on_bar) {
          d3.select(this.fuels.current)
            .select(".reset")
            .classed("reset-button", true)
            .select("text")
            .text(this.sort_reset_text)
            .attr("x", boxlen_reset / 2)
            .attr("y", h_legend / 2.2)
            .attr("dx", 0)
            .attr("dy", 0)
            .on("click", () => {
              this.updateView(null);
            });
        } else {
          if (this.state.sort_fuel === null) {
            d3.select(this.fuels.current)
              .select(".reset")
              .classed("reset-button", false)
              .on("mouseover", null)
              .on("mouseout", null)
              .select("text")
              .text(this.sort_text)
              .attr("x", boxlen_reset / 2)
              .attr("y", h_legend / 5)
              .attr("dx", 0)
              .attr("dy", 0)
              .call(this.props.wrap_long_labels, 88);
          }
        }
      }
    }

    if (this.props.window_width !== prevProps.window_width) {
      this.resize();
    }
  }

  resize() {
    if (this.props.window_width > 1280) {
      this.setState(
        {
          width: 1280,
        },
        () => {
          this.updateView(this.state.sort_fuel);
        }
      );
    } else {
      this.setState(
        {
          width: this.props.window_width,
        },
        () => {
          this.updateView(this.state.sort_fuel);
        }
      );
    }
  }

  initView() {
    this.setState({ clicked_on_bar: false }, () => {
      let w = d3.select(this.barchart_wrapper.current).node().clientWidth,
        h = this.props.barchart_height;

      let fuel_names = this.props.fuels,
        avail_fuels = [],
        fuel_colors = Object.values(this.props.fuel_name_lookup).map(
          (d) => this.props.fuel_color_lookup[d]
        );
      let barFillScale = d3
        .scaleOrdinal()
        .domain(fuel_names)
        .range(fuel_colors);

      let data = [];
      let trendsData = [];
      let table_info = {};
      let trend_info = {};
      let area_info = [];


      _.flatten([this.props.us_data, this.props.trendsData]).forEach((d) => {
        let cumsum = 0;
        let totalValue = 0;
        let tempTotalValueArray = [];
        fuel_names.forEach((f) => {
          // if (d.Year === this.props.year) {
          data.push({
            name: this.props.region === "balancing authority" ? d.BACODE : d.name,
            id: d.id,
            unit: this.props.unit,
            type: this.props.fuel_name_lookup[f],
            value: d[f],
            cumsum: cumsum,
            totalValue: totalValue,
            year: d.Year
          });
          // }
          tempTotalValueArray.push({
            totalValue: totalValue,
            name: this.props.region === "balancing authority" ? d.BACODE : d.name,
            value: d[f]
          });


          cumsum = cumsum + d[f];


          if (d[f] > 0) avail_fuels.push(this.props.fuel_name_lookup[f]);
        });



        totalValue = tempTotalValueArray.reduce((items, item) => {
          const { name, value } = item;
          const itemIndex = items.findIndex(item => item.name === name)
          if (itemIndex === -1) {
            items.push(item);
          } else {
            items[itemIndex].value += value;
          }

          return items;
        }, []);


        data.forEach(function (d) {
          totalValue.forEach(v => {
            if (v.name === d.name) {
              d.totalValue = v.value;
            }
          })
          if (d.name === undefined) {
            d.name = "US"
          }
          if (d.id === undefined) {
            d.id = d.name
          }
        });
        data.sort((a, b) => a.name.localeCompare(b.name));
        trendsData = d3.nest()
          .key(function (d) { return d.year })
          .entries(data);
      });

      for (var i = data.length - 1; i >= 0; i--) {
        if (data[i].year === this.props.year) {
          if (data[i].totalValue == 0) {
            data.splice(i, 1);
          }
        }
      }
      avail_fuels = _.uniq(avail_fuels);
      data
        .filter((e) => e.name === "US")
        .forEach((e) => {
          let name = this.props.fuel_label_lookup[e.type];
          table_info[name] = {};
          table_info[name].type = e.type;
          table_info[name]["US_" + e.type] = d3.format(".2f")(e.value);
          table_info[name][e.type] = "-";
        });

      trendsData
        .forEach((e, i) => {
          e.values.filter((g) => g.name === "US")
            .forEach((g, idx) => {
              name = this.props.fuel_label_lookup[g.type];
              trend_info[name] = {};
              trend_info[name].type = g.type;
              trend_info[name]["US_" + g.type] = d3.format(".2f")(g.value);
              trend_info[name][e.type] = "-";
              trend_info[name].year = "-";
              trend_info[name].value = "-";
            })
        });


      let name = _.uniq(data.filter((d) => d.year === this.props.year).map((d) => d.name));

      let barXScale = d3
        .scaleLinear()
        .domain([0, 100])
        .range([0, w - this.props.margin_left - this.props.margin_right]);
      let barYScale = d3
        .scaleBand()
        .domain(name)
        .range([0, h - this.props.margin_top])
        .paddingInner(0.1)
        .paddingOuter(0.2);

      // micromap
      d3.select(this.micromap.current).selectAll("path").remove();
      let w_micro = d3.select(this.micromap.current).node().clientWidth,
        h_micro = this.props.filter_height * 0.85;
      let projection = d3_composite
        .geoAlbersUsaTerritories()
        .scale(Math.min(w_micro * 0.8, h_micro * 2))
        .translate([w_micro / 2, h_micro / 2]);
      let path = d3.geoPath().projection(projection);
      d3.select(this.micromap.current)
        .append("g")
        .selectAll("path")
        .data(this.props.layer.features)
        .enter()
        .append("path")
        .attr("d", path)
        .attr("class", (d) => "map-path mouseover_target region_" + d.id)
        .style("fill", "transparent")
        .style("stroke", "#000")
        .style("stroke-width", 0.5);

      d3.select(this.micromap.current)
        .append("image")
        .attr("id", "micromap-magnifying-glass")
        .attr("class", "no-export-to-pdf")
        .attr("xlink:href", searchIcon)
        .attr("width", 20)
        .attr("height", 20)
        .attr("transform", "translate(" + (w_micro - 30) + "," + (h_micro - 25) + ")")
        .style("cursor", "pointer")
        .on("click", () => { this.setState({ show_modal: true }); });


      let barchartData = data.filter((d) => d.year === this.props.year);

      // barchart
      d3.select(this.barchart.current).selectAll("g").remove();
      d3.select(this.barchart.current)
        .attr(
          "transform",
          "translate(" +
          this.props.margin_left +
          "," +
          this.props.margin_top +
          ")"
        )
        .append("g")
        .selectAll("rect")
        .data(barchartData)
        .enter()
        .append("rect")
        .each((d) => {
          d.cumsum = data.filter((e) => (e.name === d.name && e.type === d.type) && e.year === this.props.year).map((e) => e.cumsum)[0];
        })
        .attr("class", (d) => "bars_" + d.id + " bars_" + d.id + "_" + d.type)
        .attr("x", (d) => barXScale(d.cumsum))
        .attr("y", (d) => barYScale(d.name))
        .attr("rx", 4)
        .attr("ry", 4)
        .attr("width", (d) => barXScale(d.value))
        .attr("height", barYScale.bandwidth())
        .style("cursor", "pointer")
        .style("fill", (d) => barFillScale(d.type))


        // Change this back to mousemove
        .on("mouseenter", (d) => {
          if (!this.state.clicked_on_bar) {
            let table_info = {};
            let trend_info = {};
            let area_info = [];
            data
              .filter((e) => (e.name === d.name || e.name === "US") && e.year === this.props.year)
              .forEach((e) => {
                let name = this.props.fuel_label_lookup[e.type];
                if (Object.keys(table_info).indexOf(name) === -1) {
                  table_info[name] = {};
                }
                table_info[name].type = e.type;
                if (e.name === "US") {
                  table_info[name][e.name + "_" + e.type] = d3.format(".2f")(e.value);
                  if (d.name === "US") table_info[name][e.type] = "-";
                } else {
                  table_info[name][e.type] = d3.format(".2f")(e.value);
                }
              });

            let name, a, b, c;

            // trendsData
            //   .forEach((e, i) => {
            //     e.values.forEach(g => {
            //       if (g.id === d.id) {
            //         console.log(g)
            //       }
            //     })
            //     // if (e.id === d.id) {
            //     //   console.log(e)
            //     // }
            //   })
            // console.log(trendsData)

            trendsData
              .forEach((e, i) => {
                area_info.push({ year: e.key, Coal: 0, Oil: 0, Gas: 0, Nuclear: 0, Hydro: 0, Biomass: 0, Wind: 0, Solar: 0, 'Geo Thermal': 0, 'Other Fossil': 0, 'Other Unknown': 0, 'All Non-Hydro Renewables': 0, 'All Non Renewables': 0, 'All Combustion': 0, 'All Non Combustion': 0 })
                e.values.forEach(g => {
                  name = this.props.fuel_label_lookup[g.type];
                  if (g.name === d.name) {
                    if (typeof g.value === "number") {
                      area_info[i][name] = +d3.format(".2f")(g.value);
                    }
                    else {
                      area_info[i][name] = 0;
                    }
                  }
                })
                e.values.filter((g) => g.name === d.name || g.name === "US")
                  .forEach((g, idx) => {
                    name = this.props.fuel_label_lookup[g.type];
                    if (Object.keys(trend_info).indexOf(name) === -1) {
                      trend_info[name] = {};
                    }
                    if (g.type) {
                      trend_info[name].type = g.type;
                    }
                    if (g.name === "US") {
                      trend_info[name][g.name + "_" + g.type] = [d3.format(".2f")(g.value)];
                      if (d.name === "US") {
                        trend_info[name][g.type] = "-";
                        trend_info[name].year = [];
                        trend_info[name].value = [];
                        if (trendsData[0].values.filter((g) => g.name === d.name)[idx] != undefined) {
                          a = trendsData[0].values.filter((g) => g.name === d.name)[idx].value;
                        } else {
                          a = 0
                        }
                        if (trendsData[1].values.filter((g) => g.name === d.name)[idx] != undefined) {
                          b = trendsData[1].values.filter((g) => g.name === d.name)[idx].value;
                        } else {
                          b = 0
                        }
                        if (trendsData[2].values.filter((g) => g.name === d.name)[idx] != undefined) {
                          c = trendsData[2].values.filter((g) => g.name === d.name)[idx].value;
                        } else {
                          c = 0
                        }
                        if (trendsData[3].values.filter((g) => g.name === d.name)[idx] != undefined) {
                          e = trendsData[3].values.filter((g) => g.name === d.name)[idx].value;
                        } else {
                          e = 0
                        }
                        trend_info[name].year.push(2018, 2019, 2020, 2021);
                        trend_info[name].value.push(+d3.format(".2f")(a), +d3.format(".2f")(b), +d3.format(".2f")(c), +d3.format(".2f")(e));
                      }
                    } else {
                      trend_info[name].year = [];
                      trend_info[name].value = [];
                      if (trendsData[0].values.filter((g) => g.name === d.name)[idx] != undefined) {
                        a = trendsData[0].values.filter((g) => g.name === d.name)[idx].value;
                      } else {
                        a = 0
                      }
                      if (trendsData[1].values.filter((g) => g.name === d.name)[idx] != undefined) {
                        b = trendsData[1].values.filter((g) => g.name === d.name)[idx].value;
                      } else {
                        b = 0
                      }
                      if (trendsData[2].values.filter((g) => g.name === d.name)[idx] != undefined) {
                        c = trendsData[2].values.filter((g) => g.name === d.name)[idx].value;
                      } else {
                        c = 0
                      }
                      if (trendsData[3].values.filter((g) => g.name === d.name)[idx] != undefined) {
                        e = trendsData[3].values.filter((g) => g.name === d.name)[idx].value;
                      } else {
                        e = 0
                      }
                      trend_info[name].year.push(2018, 2019, 2020, 2021);
                      trend_info[name].value.push(+d3.format(".2f")(a), +d3.format(".2f")(b), +d3.format(".2f")(c), +d3.format(".2f")(e));
                    }
                  })
              });

            d3.selectAll("path.region_" + d.id).style("fill", this.props.resourcemix_micromap_highlight_color);
            d3.selectAll(".region_" + d.id + " text").style(
              "font-weight",
              "bold"
            );

            d3.select(this.wrapper.current)
              .select("rect.bars_" + d.id + "_" + d.type)
              .classed("selected", true)
              .style("stroke", "#000")
              .style("stroke-width", 1);

            this.setState({
              table_info: table_info,
              selected_region: d.name === "US" ? this.props.region : d.name,
              mouseover_fuel: d.type,
              trend_info: trend_info,
              area_info: area_info,
            });
          }
        })
        .on("mouseout", (d) => {
          if (!this.state.clicked_on_bar) {
            d3.selectAll("rect.selected")
              .classed("selected", false)
              .style("stroke", "none");

            d3.selectAll(".map-path").style("fill", "none");
            d3.selectAll(".tick text").style("font-weight", "normal");

            this.setState({
              table_info: table_info,
              selected_region: this.props.region,
              mouseover_fuel: null,
              trend_info: trend_info,
              area_info: [],
            });
          }
        })
        .on("click", (d) => {
          if (
            d3
              .select(this.wrapper.current)
              .select("rect.bars_" + d.id + "_" + d.type)
              .classed("highlighted")
          ) {
            d3.selectAll("rect.highlighted")
              .classed("highlighted", false)
              .style("stroke", "none");
            d3.selectAll("rect").style("opacity", 1);

            d3.selectAll(".map-path").style("fill", "none");
            d3.selectAll(".tick text").style("font-weight", "normal");

            this.setState({
              clicked_on_bar: false,
              table_info: table_info,
              trend_info: trend_info,
              area_info: [],
              selected_region: this.props.region,
              mouseover_fuel: null,
            });
          } else {
            let table_info = {};
            let trend_info = {};
            let area_info = [];
            data
              .filter((e) => (e.name === d.name || e.name === "US"))
              .forEach((e) => {
                let name = this.props.fuel_label_lookup[e.type];
                if (Object.keys(table_info).indexOf(name) === -1) {
                  table_info[name] = {};
                }
                table_info[name].type = e.type;
                if (e.name === "US") {
                  table_info[name][e.name + "_" + e.type] = d3.format(".2f")(e.value);
                  if (d.name === "US") table_info[name][e.type] = "-";
                } else {
                  table_info[name][e.type] = d3.format(".2f")(e.value);
                }
              });
            let a, b, c;
            trendsData
              .forEach((e, i) => {
                area_info.push({ year: e.key, Coal: 0, Oil: 0, Gas: 0, Nuclear: 0, Hydro: 0, Biomass: 0, Wind: 0, Solar: 0, 'Geo thermal': 0, 'Other Fossil': 0, 'Other Unknown': 0, 'All Non-Hydro Renewables': 0, 'All Non Renewables': 0, 'All Combustion': 0, 'All Non Combustion': 0 })
                e.values.forEach(g => {
                  name = this.props.fuel_label_lookup[g.type];
                  if (g.name === d.name) {
                    if (typeof g.value === "number") {
                      area_info[i][name] = +d3.format(".2f")(g.value);
                    }
                    else {
                      area_info[i][name] = 0;
                    }
                  }
                })
                e.values.filter((g) => g.name === d.name || g.name === "US")
                  .forEach((g, idx) => {
                    name = this.props.fuel_label_lookup[g.type];
                    if (Object.keys(trend_info).indexOf(name) === -1) {
                      trend_info[name] = {};
                    }
                    if (g.type) {
                      trend_info[name].type = g.type;
                    }

                    if (g.name === "US") {
                      trend_info[name][g.name + "_" + g.type] = [d3.format(".2f")(g.value)];
                      if (d.name === "US") {
                        trend_info[name][g.type] = "-";
                        trend_info[name].year = [];
                        trend_info[name].value = [];
                        if (trendsData[0].values.filter((g) => g.name === d.name)[idx] != undefined) {
                          a = trendsData[0].values.filter((g) => g.name === d.name)[idx].value;
                        } else {
                          a = 0
                        }
                        if (trendsData[1].values.filter((g) => g.name === d.name)[idx] != undefined) {
                          b = trendsData[1].values.filter((g) => g.name === d.name)[idx].value;
                        } else {
                          b = 0
                        }
                        if (trendsData[2].values.filter((g) => g.name === d.name)[idx] != undefined) {
                          c = trendsData[2].values.filter((g) => g.name === d.name)[idx].value;
                        } else {
                          c = 0
                        }
                        if (trendsData[3].values.filter((g) => g.name === d.name)[idx] != undefined) {
                          e = trendsData[3].values.filter((g) => g.name === d.name)[idx].value;
                        } else {
                          e = 0
                        }
                        trend_info[name].year.push(2018, 2019, 2020, 2021);
                        trend_info[name].value.push(+d3.format(".2f")(a), +d3.format(".2f")(b), +d3.format(".2f")(c), +d3.format(".2f")(e));
                      }
                    } else {
                      trend_info[name].year = [];
                      trend_info[name].value = [];
                      if (trendsData[0].values.filter((g) => g.name === d.name)[idx] != undefined) {
                        a = trendsData[0].values.filter((g) => g.name === d.name)[idx].value;
                      } else {
                        a = 0
                      }
                      if (trendsData[1].values.filter((g) => g.name === d.name)[idx] != undefined) {
                        b = trendsData[1].values.filter((g) => g.name === d.name)[idx].value;
                      } else {
                        b = 0
                      }
                      if (trendsData[2].values.filter((g) => g.name === d.name)[idx] != undefined) {
                        c = trendsData[2].values.filter((g) => g.name === d.name)[idx].value;
                      } else {
                        c = 0
                      }
                      if (trendsData[3].values.filter((g) => g.name === d.name)[idx] != undefined) {
                        e = trendsData[3].values.filter((g) => g.name === d.name)[idx].value;
                      } else {
                        e = 0
                      }
                      trend_info[name].year.push(2018, 2019, 2020, 2021);
                      trend_info[name].value.push(+d3.format(".2f")(a), +d3.format(".2f")(b), +d3.format(".2f")(c), +d3.format(".2f")(e));
                    }

                  })
              });

            d3.selectAll(".map-path").style("fill", "none");
            d3.selectAll(".tick text").style("font-weight", "normal");
            d3.selectAll("path.region_" + d.id).style("fill", this.props.resourcemix_micromap_highlight_color);
            d3.selectAll(".region_" + d.id + " text").style(
              "font-weight",
              "bold"
            );

            d3.selectAll("rect.highlighted")
              .classed("highlighted", false)
              .style("stroke", "none");

            d3.selectAll("rect.selected")
              .classed("selected", false)
              .style("stroke", "none");

            d3.selectAll("rect").style("opacity", 0.3);

            d3.select(this.wrapper.current)
              .selectAll("rect.bars_" + "-1")
              .style("opacity", 1);

            d3.select(this.wrapper.current)
              .selectAll("rect.bars_" + d.id)
              .style("opacity", 1);

            d3.select(this.wrapper.current)
              .select("rect.bars_" + "-1" + "_" + d.type)
              .classed("highlighted", true)
              .style("stroke", "#000")
              .style("stroke-width", 1);

            d3.select(this.wrapper.current)
              .select("rect.bars_" + d.id + "_" + d.type)
              .classed("highlighted", true)
              .style("stroke", "#000")
              .style("stroke-width", 1);

            this.setState({
              clicked_on_bar: true,
              table_info: table_info,
              trend_info: trend_info,
              area_info: area_info,
              selected_region: d.name === "US" ? this.props.region : d.name,
              mouseover_fuel: d.type,
            });
          }
        });

      // axis
      d3.select(this.axis_y.current).selectAll("g").remove();
      d3.select(this.axis_y.current)
        .attr(
          "transform",
          "translate(" +
          this.props.margin_left +
          "," +
          this.props.margin_top +
          ")"
        )
        .call(d3.axisLeft(barYScale))
        .selectAll(".tick")
        .attr(
          "class",
          (d) =>
            "tick mouseover_target region_" +
            data.filter((e) => e.name === d).map((e) => e.id)[0]
        )
        .selectAll("text")
        .style("font-size", (d) => (this.props.layer_type === "balancing authority" ? ".9em" : this.props.layer_type === "state" ? "1.1em" : (this.props.layer_type === "NERC region" ? "1.5em" : "1.2em")))
        .style("font-weight", (d) => (d === "US" ? "bold" : "normal"));

      d3.select(this.axis_x.current).selectAll("g").remove();
      d3.select(this.axis_x.current)
        .attr(
          "transform",
          "translate(" +
          this.props.margin_left +
          "," +
          this.props.margin_top +
          ")"
        )
        .call(d3.axisTop(barXScale))
        .selectAll("text")
        .attr("transform", "rotate()")
        .style("font-size", (d) => (d === "US" ? "1.5em" : "1.2em"))
        .style("font-weight", (d) => (d === "US" ? "bold" : "normal"));

      // filter
      let w_legend = d3.select(this.fuels.current).node().clientWidth,
        h_legend = this.props.filter_height;
      let nbox = fuel_names.length + 2;
      let boxlen = w_legend / nbox > 100 ? 100 : Math.max(w_legend / nbox, 75);
      let boxlen_filter = boxlen, boxlen_reset = boxlen;

      d3.select(this.fuels.current).selectAll("div").remove();
      let fuels = d3
        .select(this.fuels.current)
        .append("div")
        .attr("class", "fuels")
        .selectAll("div")
        .data(fuel_names.map((d) => this.props.fuel_name_lookup[d]))
        .enter()
        .append("div")
        .attr("class", "fuel");

      let fuels_svg = fuels
        .append("svg")
        .attr("width", boxlen_filter)
        .attr("height", h_legend);

      fuels_svg
        .append("circle")
        .attr("r", Math.min(boxlen_filter, h_legend * 0.5) / 4)
        .attr("fill", (d) => this.props.fuel_color_lookup[d])
        .attr("cx", boxlen_filter / 2)
        .attr("cy", Math.min(boxlen_filter, h_legend * 0.5) / 2);

      fuels_svg
        .append("text")
        .attr("x", boxlen_filter / 2)
        .attr("y", Math.min(boxlen_filter, h_legend * 0.5) * 1.2)
        .attr("dx", 0)
        .attr("dy", 0)
        .text((d) => this.props.fuel_label_lookup[d])
        .call(this.props.wrap_long_labels, boxlen_filter * 0.9);

      let reset_div = d3
        .select(".fuels")
        .insert("div", ".fuel")
        .style("display", "inline-flex")
        .attr("class", "reset no-export-to-pdf");

      reset_div.append("svg")
        .attr("width", boxlen_reset)
        .attr("height", h_legend)
        .on("click", (d) => {
          this.setState({
            clicked_on_bar: false,
            sort_fuel: null,
            selected_region: this.props.region,
            mouseover_fuel: null,
            table_info: table_info,
            trend_info: trend_info,
            area_info: area_info,
          });
        })
        .append("text")
        .attr("x", boxlen_reset / 2)
        .attr("y", h_legend / 5)
        .attr("dx", 0)
        .attr("dy", 0)
        .text(this.sort_text)
        .call(this.props.wrap_long_labels, 88);

      d3.selectAll(".fuel")
        .on("click", (d) => {
          let n = d3
            .select(this.fuels.current)
            .selectAll(".fuel")
            .filter((e) => e === d)
          if (!n.classed("selected")) {
            this.setState({ sort_fuel: d });
          }
        })
        .on("mouseover", (d) => {
          let n = d3
            .select(this.fuels.current)
            .selectAll(".fuel")
            .filter((e) => e === d);
          if (!n.classed("selected")) {
            n.style("background", this.props.fuel_background_highlight_color);
          }
        })
        .on("mouseout", (d) => {
          let n = d3
            .select(this.fuels.current)
            .selectAll(".fuel")
            .filter((e) => e === d);
          if (!n.classed("selected")) {
            n.style("background", "none");
          } else {
            n.style("background", this.props.fuel_background_select_color);
          }
        });

      d3.selectAll(".fuel")
        .filter((d) => avail_fuels.indexOf(d) === -1)
        .style("opacity", 0.3)
        .style("pointer-events", "none");

      // set state
      this.setState({
        sort_fuel: null,
        selected_region: this.props.region,
        table_info: table_info,
        trend_info: trend_info,
        area_info: [],
      });
    });
  }


  updateView(fuel) {

    let w = d3.select(this.barchart_wrapper.current).node().clientWidth,
      h = this.props.barchart_height;

    // filter
    let fuel_names = this.props.fuels;
    let w_legend = d3.select(this.fuels.current).node().clientWidth,
      h_legend = this.props.filter_height;
    let nbox = fuel_names.length + 2;
    let boxlen = w_legend / nbox > 100 ? 100 : Math.max(w_legend / nbox, 75);
    let boxlen_filter = boxlen, boxlen_reset = boxlen;

    let fuels = d3.select(this.fuels.current).selectAll(".fuel");
    fuels
      .classed("selected", false)
      .style("background", "none")
      .filter((e) => e === fuel)
      .classed("selected", true)
      .style("background", this.props.fuel_background_select_color);

    let fuel_svg = fuels
      .select("svg")
      .attr("width", boxlen_filter)
      .attr("height", h_legend);
    fuel_svg
      .select("circle")
      .attr("r", Math.min(boxlen_filter, h_legend * 0.5) / 4)
      .attr("cx", boxlen_filter / 2)
      .attr("cy", Math.min(boxlen_filter, h_legend * 0.5) / 2);

    fuel_svg
      .select("text")
      .attr("x", boxlen_filter / 2)
      .attr("y", Math.min(boxlen_filter, h_legend * 0.5) * 1.2)
      .attr("dx", 0)
      .attr("dy", 0)
      .text((d) => this.props.fuel_label_lookup[d])
      .style("text-anchor", "middle")
      .call(this.props.wrap_long_labels, boxlen_filter);

    let reset_svg = d3
      .select(this.fuels.current)
      .select(".reset")
      .attr("width", boxlen_reset)
      .attr("height", h_legend);

    reset_svg
      .select("image")
      .attr("x", boxlen_reset / 4)
      .attr("y", h_legend / 16)
      .attr("width", boxlen_reset / 2)
      .attr("height", h_legend / 4);

    // micromap
    let w_micro = d3.select(this.micromap.current).node().clientWidth,
      h_micro = this.props.filter_height;
    let projection = d3_composite
      .geoAlbersUsaTerritories()
      .scale(Math.min(w_micro / 0.85, h_micro * 2))
      .translate([w_micro / 2, h_micro / 2]);
    let path = d3.geoPath().projection(projection);
    d3.select(this.micromap.current).selectAll("path").attr("d", path);
    d3.select(this.micromap.current)
      .select("#micromap-magnifying-glass")
      .attr("transform", "translate(" + (w_micro - 30) + "," + (h_micro - 25) + ")");

    if (fuel === null) {
      // micromap
      d3.selectAll(".map-path").style("fill", "none");

      // remove highlight
      d3.selectAll("rect.highlighted").classed("highlighted", false).style("stroke", "none");
      d3.selectAll("rect").style("opacity", 1);
      d3.selectAll(".tick text").style("font-weight", "normal");

      // reset
      d3.select(this.fuels.current)
        .select(".reset")
        .classed("reset-button", false)
        .on("mouseover", null)
        .on("mouseout", null)
        .select("text")
        .text(this.sort_text)
        .attr("x", boxlen_reset / 2)
        .attr("y", h_legend / 5)
        .attr("dx", 0)
        .attr("dy", 0)
        .call(this.props.wrap_long_labels, boxlen_reset);

      let data = [];
      let trendsData = [];

      _.flatten([this.props.us_data, this.props.trendsData]).forEach((d) => {
        let cumsum = 0;
        let totalValue = 0;
        let tempTotalValueArray = [];
        fuel_names.forEach((f) => {
          data.push({
            name: this.props.region === "balancing authority" ? d.BACODE : d.name,
            id: d.id,
            unit: this.props.unit,
            type: this.props.fuel_name_lookup[f],
            value: d[f],
            cumsum: cumsum,
            totalValue: totalValue,
            year: d.Year
          });
          tempTotalValueArray.push({
            totalValue: totalValue,
            name: this.props.region === "balancing authority" ? d.BACODE : d.name,
            value: d[f]
          })
          cumsum = cumsum + d[f];

        });
        totalValue = tempTotalValueArray.reduce((items, item) => {
          const { name, value } = item;
          const itemIndex = items.findIndex(item => item.name === name)
          if (itemIndex === -1) {
            items.push(item);
          } else {
            items[itemIndex].value += value;
          }

          return items;
        }, []);
        data.filter((d) => d.year === this.props.year).forEach(function (d, i) {
          totalValue.forEach(v => {
            if (v.name === d.name) {
              d.totalValue = v.value;
            }
          })
          if (d.name === undefined) {
            d.name = "US"
          }
          if (d.id === undefined) {
            d.id = d.name
          }
        });


      });
      // data.sort((a, b) => a.name.localeCompare(b.name));
      trendsData = d3.nest()
        .key(function (d) { return d.year })
        .entries(data);

      for (var i = data.length - 1; i >= 0; i--) {
        if (data[i].year === this.props.year) {
          if (data[i].totalValue == 0) {
            data.splice(i, 1);
          }
        }
      }

      let name = _.uniq(data.filter((d) => d.year === this.props.year).map((d) => d.name));
      name = _.flatten([["US"], name.filter((d) => d !== "US")]);

      let barXScale = d3
        .scaleLinear()
        .domain([0, 100])
        .range([0, w - this.props.margin_left - this.props.margin_right]);
      let barYScale = d3
        .scaleBand()
        .domain(name)
        .range([0, h - this.props.margin_top])
        .paddingInner(0.1)
        .paddingOuter(0.2);

      // axis
      d3.select(this.axis_y.current)
        .transition()
        .duration(100)
        .call(d3.axisLeft(barYScale));
      d3.select(this.axis_x.current).call(d3.axisTop(barXScale));

      // barchart
      d3.select(this.barchart.current)
        .selectAll("rect")
        .each((d) => {
          d.cumsum = data.filter((e) => (e.name === d.name && e.type === d.type) && e.year === this.props.year).map((e) => e.cumsum)[0];
        })
        .attr("x", (d) => barXScale(d.cumsum))
        .attr("width", (d) => barXScale(d.value))
        .transition()
        .duration(400)
        .attr("y", (d) => barYScale(d.name));
    }
    else {
      d3.select(this.fuels.current)
        .select(".reset")
        .classed("reset-button", true)
        .select("text")
        .text(this.sort_reset_text)
        .attr("x", boxlen_reset / 2)
        .attr("y", h_legend / 2.2)
        .attr("dx", 0)
        .attr("dy", 0)
        .call(this.props.wrap_long_labels, boxlen_reset);

      fuel_names = _.flatten([
        [_.invert(this.props.fuel_name_lookup)[fuel]],
        this.props.fuels.filter(
          (d) => d !== _.invert(this.props.fuel_name_lookup)[fuel]
        ),
      ]);

      let data = [];
      let trendsData = [];

      let tempTotalValueArray = [];
      _.flatten([this.props.us_data, this.props.trendsData]).forEach((d) => {
        let cumsum = 0;
        let totalValue = 0;
        fuel_names.forEach((f) => {
          data.push({
            name: this.props.region === "balancing authority" ? d.BACODE : d.name,
            id: d.id,
            unit: this.props.unit,
            type: this.props.fuel_name_lookup[f],
            value: d[f],
            cumsum: cumsum,
            totalValue: totalValue,
            year: d.Year
          })
          tempTotalValueArray.push({
            totalValue: totalValue,
            name: this.props.region === "balancing authority" ? d.BACODE : d.name,
            value: d[f]
          })

          // if (d.Year === this.props.year) {
          cumsum = cumsum + d[f];
          // }
        });
        totalValue = tempTotalValueArray.reduce((items, item) => {
          const { name, value } = item;
          const itemIndex = items.findIndex(item => item.name === name);
          if (itemIndex === -1) {
            items.push(item);
          }
          else {
            items[itemIndex].value += value;
          }

          return items;
        }, []);

        data.forEach(function (d, i) {
          totalValue.forEach(v => {
            if (v.name === d.name) {
              d.totalValue = v.value;
            }
          })
          if (d.name === undefined) {
            d.name = "US"
          }
          if (d.id === undefined) {
            d.id = d.name
          }
        });
        data.sort((a, b) => a.name.localeCompare(b.name));
        trendsData = d3.nest()
          .key(function (d) { return d.year })
          .entries(data);
      });

      for (var i = data.length - 1; i >= 0; i--) {
        if (data[i].year === this.props.year) {
          if (data[i].totalValue == 0) {
            data.splice(i, 1);
          }
        }
      }


      let name = data
        .filter((d) => (d.type === fuel) && d.year === this.props.year)
        .sort((a, b) => b.value - a.value)
        .map((d) => d.name);
      name = _.flatten([["US"], name.filter((d) => d !== "US")]);

      let barXScale = d3
        .scaleLinear()
        .domain([0, 100])
        .range([0, w - this.props.margin_left - this.props.margin_right]);

      let barYScale = d3
        .scaleBand()
        .domain(name)
        .range([0, h - this.props.margin_top])
        .paddingInner(0.1)
        .paddingOuter(0.2);

      d3.select(this.axis_y.current)
        .transition()
        .duration(100)
        .call(d3.axisLeft(barYScale));

      d3.select(this.axis_x.current).call(d3.axisTop(barXScale));

      d3.select(this.barchart.current)
        .selectAll("rect")
        .each((d) => {
          d.cumsum = data.filter((e) => (e.name === d.name && e.type === d.type) && e.year === this.props.year).map((e) => e.cumsum)[0];
        })
        .attr("x", (d) => barXScale(d.cumsum))
        .attr("width", (d) => barXScale(d.value))
        .transition()
        .duration(350)
        .attr("y", (d) => barYScale(d.name));
    }
  }

  render() {
    let title = (
      <p className="title">
        {this.props.title.replace(',', '\n')}
      </p>
    );

    return (
      <div id="resourcemix-wrapper" ref={this.wrapper} style={{ width: this.state.width }}>
        {title}
        <div>
          <svg
            style={{
              width:
                this.state.width < this.props.ipad_width
                  ? this.state.width * 0.4
                  : this.state.width * this.micromap_width_pct,
              height: this.props.filter_height,
            }}
            ref={this.micromap}
            id="resourcemix-micromap"
          ></svg>
          <div
            className="fuels-selection"
            style={{
              width:
                this.state.width < this.props.ipad_width
                  ? this.state.width * 0.9
                  : this.state.width * this.fuels_filter_pct,
              verticalAlign: "top",
              height: "100%",
              textAlign: "left"
            }}
            ref={this.fuels}
          ></div>
        </div>
        <div>

          <div id="resourcemix-chart">
            <div>
              <svg
                style={{
                  width:
                    this.state.width < this.props.ipad_width
                      ? this.state.width * 0.9
                      : this.state.width * 0.95 - this.props.table_width,
                  height: this.props.barchart_height,
                  marginTop:
                    this.state.width < this.props.ipad_width
                      ? this.props.margin_top
                      : 0,
                }}
                ref={this.barchart_wrapper}
              >
                <g ref={this.barchart}></g>
                <g ref={this.axis_y} className={"axis axis_y"}></g>
                <g ref={this.axis_x} className={"axis axis_x"}></g>
              </svg>
              {/* <UpdatedTrends
                title={this.props.title}
                region_level={this.props.region}
                region={this.state.selected_region}
                type={this.state.mouseover_fuel}
                table_info={this.state.table_info}
                trend_info={this.state.trend_info}
                highlight_color={this.props.table_highlight_color}
                trendsData={this.props.trendsData}
                year={this.props.year}
                fuel_color={this.props.fuel_color_lookup}
              /> */}
            </div>
            <div
              className="table-wrapper"
            // style={{
            //   width:
            //     this.state.width < this.props.ipad_width
            //       ? this.state.width
            //       : this.props.table_width,
            //   height: this.props.barchart_height - this.props.margin_top,
            //   marginTop:
            //     this.state.width < this.props.ipad_width
            //       ? this.props.margin_top
            //       : 0,
            //   marginLeft: 0,
            // }}
            >
            </div>
            <UpdatedTable
              title={this.props.title}
              region_level={this.props.region}
              region={this.state.selected_region}
              type={this.state.mouseover_fuel}
              table_info={this.state.table_info}
              trend_info={this.state.trend_info}
              highlight_color={this.props.table_highlight_color}
              trendsData={this.props.trendsData}
              year={this.props.year}
              fuel_color={this.props.fuel_color_lookup}
            />

          </div>
          <ResourceMixAreaChart
            title={this.props.title}
            region_level={this.props.region}
            region={this.state.selected_region}
            type={this.props.fuel_label_lookup[this.state.mouseover_fuel]}
            data={this.state.area_info}
            highlight_color={this.props.table_highlight_color}
            year={this.props.year}
            fuel_color={this.props.fuel_color_lookup}
            window_width={this.props.window_width}
            window_height={this.props.window_height}
            width={
              this.init_window_width < 800
                ? this.init_window_width * 0.8
                : 650
            }
            barchart_sort={this.props.barchart_sort}
            height={200}
            margin_top={10}
            margin_bottom={30}
            margin_right={30}
            margin_left={60}
            field={this.props.field}
            us_data={this.props.us_data}
            usTrendsData={this.props.usTrendsData}
            unit={this.props.unit}
          />
        </div>
        <Dialog
          id="subregion-map"
          name="eGRID Subregion"
          title=""
          show={this.state.show_modal}
          onHide={() => this.setState({ show_modal: false })}
        />
      </div>
    );
  }
}

export default ResourceMixChart;
