import React, { Component } from "react";
import * as d3 from "d3";
import * as _ from "underscore";
import * as d3_composite from "d3-composite-projections";
import Dialog from "./Dialog.js";
import UpdatedTable from "./Table";
import SubregionMap from "./assets/img/2018_egrid_subregions.png";

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
      show_modal: false
    };
    this.sort_text = "Reset";
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
        if (this.state.clicked_on_bar) {
          d3.select(this.fuels.current)
            .select(".reset")
            .style("opacity", 1)
            .style("cursor", "pointer")
            .on("mouseover", () => {
              d3.select(".reset").style("opacity", 0.7);
            })
            .on("mouseout", () => {
              d3.select(".reset").style("opacity", 1);
            })
            .select("text")
            .text(this.sort_reset_text)
            .on("click", () => {
              this.updateView(null);
            });
        } else {
          if (this.state.sort_fuel === null) {
            d3.select(this.fuels.current)
            .select(".reset")
            .on("mouseover", null)
            .on("mouseout", null)
            .style("opacity", 0.5)
            .style("cursor", "not-allowed")
            .select("text")
            .text(this.sort_text);
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
      let table_info = {};
      _.flatten([this.props.us_data, this.props.data]).forEach((d) => {
        let cumsum = 0;
        fuel_names.forEach((f) => {
          data.push({
            name: d.name,
            id: d.id,
            unit: this.props.unit,
            type: this.props.fuel_name_lookup[f],
            value: d[f],
            cumsum: cumsum,
          });
          cumsum = cumsum + d[f];
          if (d[f] > 0) avail_fuels.push(this.props.fuel_name_lookup[f]);
        });
      });
      avail_fuels = _.uniq(avail_fuels);
      data
        .filter((e) => e.name === "US")
        .forEach((e) => {
          table_info[e.name + "_" + e.type] = d3.format(".2f")(e.value);
          table_info[e.type] = "-";
        });
      let name = _.uniq(data.map((d) => d.name));

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
        .scale(Math.min(w_micro*0.8, h_micro * 2))
        .translate([w_micro / 2, h_micro / 2]);
      let path = d3.geoPath().projection(projection);
      d3.select(this.micromap.current)
        .append("g")
        .selectAll("path")
        .data(this.props.layer.features)
        .enter()
        .append("path")
        .attr("d", path)
        .attr("class", (d) => "paths mouseover_target region_" + d.id)
        .style("fill", "transparent")
        .style("stroke", "#000")
        .style("stroke-width", 0.5);
      
      d3.select(this.micromap.current)
        .style("cursor", "pointer")
        .on("click", ()=>{ this.setState({ show_modal: true });});

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
        .data(data)
        .enter()
        .append("rect")
        .attr("class", (d) => "bars_" + d.id + " bars_" + d.id + "_" + d.type)
        .attr("x", (d) => barXScale(d.cumsum))
        .attr("y", (d) => barYScale(d.name))
        .attr("rx", 4)
        .attr("ry", 4)
        .attr("width", (d) => barXScale(d.value))
        .attr("height", barYScale.bandwidth())
        .style("cursor", "pointer")
        .style("fill", (d) => barFillScale(d.type))
        .on("mousemove", (d) => {
          if (!this.state.clicked_on_bar) {
            let table_info = {};
            data
              .filter((e) => e.name === d.name || e.name === "US")
              .forEach((e) => {
                if (e.name === "US") {
                  table_info[e.name + "_" + e.type] = d3.format(".2f")(e.value);
                } else {
                  table_info[e.type] = d3.format(".2f")(e.value);
                }
              });

            d3.selectAll("path.region_" + d.id).style("fill", "#aaa");
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
              selected_region: d.name,
              mouseover_fuel: d.type,
            });
          }
        })
        .on("mouseout", (d) => {
          if (!this.state.clicked_on_bar) {
            d3.selectAll("rect.selected")
              .classed("selected", false)
              .style("stroke", "none");

            d3.selectAll(".paths").style("fill", "none");
            d3.selectAll(".tick text").style("font-weight", "normal");

            this.setState({
              table_info: table_info,
              selected_region: this.props.region,
              mouseover_fuel: null,
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

            d3.selectAll(".paths").style("fill", "none");
            d3.selectAll(".tick text").style("font-weight", "normal");

            this.setState({
              clicked_on_bar: false,
              table_info: table_info,
              selected_region: this.props.region,
              mouseover_fuel: null,
            });
          } else {
            let table_info = {};
            data
              .filter((e) => e.name === d.name || e.name === "US")
              .forEach((e) => {
                if (e.name === "US") {
                  table_info[e.name + "_" + e.type] = d3.format(".2f")(e.value);
                } else {
                  table_info[e.type] = d3.format(".2f")(e.value);
                }
              });

            d3.selectAll(".paths").style("fill", "none");
            d3.selectAll(".tick text").style("font-weight", "normal");
            d3.selectAll("path.region_" + d.id).style("fill", "#aaa");
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
              selected_region: d.name,
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
        .style("cursor", "pointer")
        .selectAll("text")
        .style("font-size", (d) => (d === "US" ? "1.5em" : (this.props.layer_type==="state"?"1.1em":(this.props.layer_type==="NERC region"?"1.5em":"1.2em"))))
        .style("font-weight", (d) => (d === "US" ? "bold" : "normal"));
        
      d3.selectAll(".tick.mouseover_target")
        .on("mouseover", (d) => {
          if (!this.state.clicked_on_bar) {
            let id = data.filter((e) => e.name === d).map((e) => e.id)[0];
            let table_info = {};
            data
              .filter((e) => e.name === d || e.name === "US")
              .forEach((e) => {
                if (e.name === "US") {
                  table_info[e.name + "_" + e.type] = d3.format(".2f")(e.value);
                } else {
                  table_info[e.type] = d3.format(".2f")(e.value);
                }
              });

            d3.selectAll("path.region_" + id).style("fill", "#aaa");
            d3.selectAll(".region_" + id + " text").style(
              "font-weight",
              "bold"
            );

            d3.select(this.wrapper.current)
              .selectAll("rect.bars_" + id)
              .classed("selected", true)
              .style("stroke", "#000")
              .style("stroke-width", 1);

            this.setState({
              table_info: table_info,
              selected_region: d,
              mouseover_fuel: null,
            });
          }
        })
        .on("mouseout", (d) => {
          if (!this.state.clicked_on_bar) {
            d3.selectAll("rect.selected")
              .classed("selected", false)
              .style("stroke", "none");

            d3.selectAll(".paths").style("fill", "none");
            d3.selectAll(".tick text").style("font-weight", "normal");

            this.setState({
              table_info: table_info,
              selected_region: this.props.region,
              mouseover_fuel: null,
            });
          }
        })
        .on("click", (d) => {
          let id = data.filter((e) => e.name === d).map((e) => e.id)[0];
          if (
            d3
              .select(this.wrapper.current)
              .select("rect.bars_" + id)
              .classed("highlighted")
          ) {
            d3.selectAll("rect.highlighted")
              .classed("highlighted", false)
              .style("stroke", "none");
            d3.selectAll("rect").style("opacity", 1);

            d3.selectAll(".paths").style("fill", "none");
            d3.selectAll(".tick text").style("font-weight", "normal");

            this.setState({
              clicked_on_bar: false,
              table_info: table_info,
              selected_region: this.props.region,
              mouseover_fuel: null,
            });
          } else {
            let table_info = {};
            data
              .filter((e) => e.name === d || e.name === "US")
              .forEach((e) => {
                if (e.name === "US") {
                  table_info[e.name + "_" + e.type] = d3.format(".2f")(e.value);
                } else {
                  table_info[e.type] = d3.format(".2f")(e.value);
                }
              });

            d3.selectAll(".paths").style("fill", "none");
            d3.selectAll(".tick text").style("font-weight", "normal");
            d3.selectAll("path.region_" + id).style("fill", "#aaa");
            d3.selectAll(".region_" + id + " text").style(
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
              .classed("highlighted", true)
              .style("opacity", 1)
              .style("stroke", "#000")
              .style("stroke-width", 1);

            d3.select(this.wrapper.current)
              .selectAll("rect.bars_" + id)
              .classed("highlighted", true)
              .style("opacity", 1)
              .style("stroke", "#000")
              .style("stroke-width", 1);

            this.setState({
              clicked_on_bar: true,
              table_info: table_info,
              selected_region: d,
              mouseover_fuel: null,
            });
          }
        });

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
        .attr("transform", "rotate(-30)")
        .style("font-size", (d) => (d === "US" ? "1.5em" : "1.2em"))
        .style("font-weight", (d) => (d === "US" ? "bold" : "normal"));

      // filter
      let w_legend = d3.select(this.fuels.current).node().clientWidth,
        h_legend = this.props.filter_height;
      let nbox = fuel_names.length + 2;
      let boxlen = w_legend / nbox > 100 ? 100 : Math.max(w_legend / nbox, 75);
      let boxlen_filter = boxlen,
        boxlen_reset = boxlen;

      d3.select(this.fuels.current).selectAll("div").remove();
      let fuels = d3
        .select(this.fuels.current)
        .append("div")
        .attr("class", "fuels")
        .style("text-align", "left")
        .selectAll("div")
        .data(fuel_names.map((d) => this.props.fuel_name_lookup[d]))
        .enter()
        .append("div")
        .attr("class", "fuel")
        .style("display", "inline-flex")
        .style("cursor", "pointer")
        .style("margin", 0)
        .style("border-radius", "5px")
        .style("vertical-align", "bottom");

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
        .style("text-anchor", "middle")
        .style("font-size", "0.9em")
        .call(this.props.wrap_long_labels, boxlen_filter * 0.9);

      let reset = d3
        .select(".fuels")
        .insert("div", ".fuel")
        .style("display", "inline-flex")
        .style("vertical-align", "bottom")
        .attr("class", "reset")
        .style("opacity", 0.5)
        .style("cursor", "not-allowed")
        .append("svg")
        .attr("width", boxlen_reset)
        .attr("height", h_legend)
        .on("click", (d) => {
          this.setState({ sort_fuel: null, clicked_on_bar: false });
        });

      reset
        .append("text")
        .attr("x", boxlen_reset / 2)
        .attr("y", h_legend / 2)
        .attr("dx", 0)
        .attr("dy", 0)
        .text(this.sort_text)
        .style("text-anchor", "middle")
        .style("font-size", "0.9em")
        .style("font-weight", "bold")
        .call(this.props.wrap_long_labels, boxlen_reset);

      d3.selectAll(".fuel")
        .on("click", (d) => {
          let n = d3
            .select(this.fuels.current)
            .selectAll(".fuel")
            .filter((e) => e === d);
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
            n.style("background", "#eee");
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
            n.style("background", "#ddd");
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
      .style("background", "#ddd");

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

    if (fuel === null) {
      // micromap
      d3.selectAll(".paths").style("fill", "none");

      // remove highlight
      d3.selectAll("rect.highlighted").classed("highlighted", false).style("stroke", "none");
      d3.selectAll("rect").style("opacity", 1);
      d3.selectAll(".tick text").style("font-weight", "normal");

      // reset
      d3.select(this.fuels.current)
        .select(".reset")
        .on("mouseover", null)
        .on("mouseout", null)
        .style("opacity", 0.5)
        .style("cursor", "not-allowed")
        .select("text")
        .text(this.sort_text)
        .attr("x", boxlen_reset / 2)
        .attr("y", h_legend / 2)
        .attr("dx", 0)
        .attr("dy", 0)
        .call(this.props.wrap_long_labels, boxlen_reset);

      let data = [];
      _.flatten([this.props.us_data, this.props.data]).forEach((d) => {
        let cumsum = 0;
        fuel_names.forEach((f) => {
          data.push({
            name: d.name,
            id: d.id,
            unit: this.props.unit,
            type: this.props.fuel_name_lookup[f],
            value: d[f],
            cumsum: cumsum,
          });
          cumsum = cumsum + d[f];
        });
      });
      let name = _.uniq(data.map((d) => d.name));
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
          d.cumsum = data.filter((e) => e.name === d.name && e.type === d.type).map((e) => e.cumsum)[0];
        })
        .attr("x", (d) => barXScale(d.cumsum))
        .attr("width", (d) => barXScale(d.value))
        .transition()
        .duration(400)
        .attr("y", (d) => barYScale(d.name));
    } else {
      d3.select(this.fuels.current)
        .select(".reset")
        .style("opacity", 1)
        .style("cursor", "pointer")
        .on("mouseover", () => {
          d3.select(".reset").style("opacity", 0.7);
        })
        .on("mouseout", () => {
          d3.select(".reset").style("opacity", 1);
        })
        .select("text")
        .text(this.sort_reset_text)
        .attr("x", boxlen_reset / 2)
        .attr("y", h_legend / 2)
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
      _.flatten([this.props.us_data, this.props.data]).forEach((d) => {
        let cumsum = 0;
        fuel_names.forEach((f) => {
          data.push({
            name: d.name,
            id: d.id,
            unit: this.props.unit,
            type: this.props.fuel_name_lookup[f],
            value: d[f],
            cumsum: cumsum,
          });
          cumsum = cumsum + d[f];
        });
      });

      let name = data
        .filter((d) => d.type === fuel)
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
          d.cumsum = data.filter((e) => e.name === d.name && e.type === d.type).map((e) => e.cumsum)[0];
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
      <p
        style={{
          fontSize: "1.2em",
          fontWeight: "bold",
          fill: "#000",
          className: "title",
          textAnchor: "middle",
        }}
      >
        {this.props.title + ", by " + this.props.layer_type}
      </p>
    );

    return (
      <div id="resource-mix-chart" ref={this.wrapper} style={{width: this.state.width, height: "100%", margin: "0 auto"}}>
        {title}
        <div>
          <svg
            style={{
              width:
                this.state.width < this.props.ipad_width
                  ? this.state.width * 0.9
                  : this.state.width * this.micromap_width_pct,
              height: this.props.filter_height,
              display: "inline-block",
              verticalAlign: "top",
            }}
            ref={this.micromap}
            id="resource-mix-micromap"
          ></svg>
          <div
            className="fuels-selection"
            style={{
              width:
                this.state.width < this.props.ipad_width
                  ? this.state.width * 0.9
                  : this.state.width * this.fuels_filter_pct,
              display: "inline-block",
              verticalAlign: "top",
            }}
            ref={this.fuels}
          ></div>
        </div>
        <div>
          <svg
            style={{
              width:
                this.state.width < this.props.ipad_width
                  ? this.state.width * 0.9
                  : this.state.width * 0.95 - this.props.table_width,
              height: this.props.barchart_height,
              display: "inline-block",
              verticalAlign: "bottom",
            }}
            ref={this.barchart_wrapper}
          >
            <g ref={this.barchart}></g>
            <g ref={this.axis_y} className={"axis axis_y"}></g>
            <g ref={this.axis_x} className={"axis axis_x"}></g>
          </svg>
          <div
            id="resource-mix-table"
            style={{
              width:
                this.state.width < this.props.ipad_width
                  ? this.state.width
                  : this.props.table_width,
              height: this.props.barchart_height - this.props.margin_top,
              marginTop:
                this.state.width < this.props.ipad_width
                  ? this.props.margin_top
                  : 5,
              marginLeft: 0,
              display: "inline-block",
              verticalAlign: "bottom",
            }}
          >
            <UpdatedTable
              title={this.props.title}
              region={this.state.selected_region}
              type={this.state.mouseover_fuel}
              table_info={this.state.table_info}
            />
          </div>
        </div>
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

export default ResourceMixChart;
