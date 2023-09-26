import React, { Component } from "react";

import * as d3 from "d3";
import { forEach } from "underscore";
class OtherLevelBarchart extends Component {
  constructor(props) {
    super(props);
    this.barchart = React.createRef();
    this.bars = React.createRef();
    this.trends = React.createRef();
    this.axis_x = React.createRef();
    this.axis_y = React.createRef();
    this.axis_x_title = React.createRef();
    this.tooltip = React.createRef();
    this.state = {
      width: this.props.width,
      height: this.props.height,
      sort_by: "alphabet",
      selected_state: [],
      selected_state_id: undefined,
      isActive: false,
      trendPaddingOffset: 0,
    };
  }



  // tooltip
  formatNumber(d) {
    let num = Math.abs(d);
    if (num < 0.1) {
      return d === 0 ? d : d3.format(".4f")(d);
    } else if (num < 1) {
      return d3.format(".3f")(d);
    } else {
      return isNaN(d) ? "" : d3.format(",.2f")(d);
    }
  }

  // US number
  formatUSNumber(d) {
    let num = Math.abs(d);
    if (num < 1) {
      return d === 0 ? d : d3.format(".3f")(d);
    } else if (num < 1000) {
      return d3.format(".2f")(d);
    } else {
      return d3.format(",.0f")(d);
    }
  }

  // label
  formatLabel(d) {
    let num = Math.abs(d);
    if (num < 1) {
      return d === 0 ? d : d3.format(".3f")(d);
    } else if (num < 1000) {
      return d3.format(".2f")(d);
    } else if (num < 1000000) {
      return d3.format(",.0f")(d);
    } else {
      let num = d3.format(".3s")(d);
      let abbr = num.slice(-1);
      if (abbr === "G") {
        num = num.substring(0, num.length - 1) + "B";
      }
      let chars1 = num.slice(-3);
      let chars2 = chars1.substring(0, 2);
      if (chars2 === ".0") {
        num = num.slice(0, -3) + num.slice(-1);
        return num;
      }
      return num;
    }
  }

  // x axis
  formatXaxis(d) {
    let num = Math.abs(d);
    if (num < 1) {
      return d === 0 ? d : d3.format("~s")(d);
    } else if (num < 1000) {
      return d3.format("~s")(d);
    } else if (num < 1000000) {
      return d3.format("~s")(d);
    } else {
      let num = d3.format("~s")(d);
      let abbr = num.slice(-1);
      if (abbr === "G") {
        num = num.substring(0, num.length - 1) + "B";
      }
      let chars1 = num.slice(-3);
      let chars2 = chars1.substring(0, 2);
      if (chars2 === ".0") {
        num = num.slice(0, -3) + num.slice(-1);
        return num;
      }
      return num;
    }
    // let num = Math.abs(d);
    // if (num < 1000) {
    //   return d;
    // } else {
    //   let num = d3.format(".3s")(d);
    //   let abbr = num.slice(-1);
    //   if (abbr === "G") {
    //     num = num.substring(0, num.length - 1) + "B";
    //   }
    //   let chars1, chars2;

    //   // 2.00M => 2M
    //   chars1 = num.slice(-4);
    //   chars2 = chars1.substring(0, 3);
    //   if (chars2 === ".00") {
    //     num = num.slice(0, -4) + num.slice(-1);
    //     return num;
    //   }
    //   // 20.0M => 20M
    //   chars1 = num.slice(-3);
    //   chars2 = chars1.substring(0, 2);
    //   if (chars2 === ".0") {
    //     num = num.slice(0, -3) + num.slice(-1);
    //     return num;
    //   }
    //   // 1.50M => 1.5M
    //   chars1 = num.slice(-2);
    //   chars2 = chars1.substring(0, 1);
    //   if (chars2 === "0") {
    //     num = num.slice(0, -2) + num.slice(-1);
    //     return num;
    //   }
    //   return num;
    // }
  }

  initView(by) {

    // trends scale
    let trendsData = this.props.trendsData,
      trendXScale,
      trendYScale;



    let sumstat = d3.nest()
      .key(function (d) { return d.name })
      .entries(trendsData);

    sumstat.sort(function (a, b) {
      if (a.key < b.key) {
        return -1;
      }
      if (a.key > b.key) {
        return 1;
      }
      return 0;
    });

    let trendHeight = 25;
    let allTrendsHeight = trendHeight * sumstat.length;

    // bars scale
    let height = this.state.height - this.props.margin_top - this.props.margin_bottom,
      width = this.state.width - this.props.margin_left - this.props.margin_right,
      trendLabelWidth = this.props.layer_type === "state" ? 8 : 30,
      trendWidth = width - trendLabelWidth,
      parseTime = d3.timeParse("%Y");


    let barFillScale = d3.scaleThreshold().range(this.props.map_fill),
      barXScale = d3
        .scaleLinear()
        .range([
          0,
          width,
        ])
        .domain([Math.min(0, d3.min(this.props.data, (e) => e.value)), d3.max(this.props.data, (e) => e.value)]),
      barYScale = d3
        .scaleBand()
        .range([0, this.props.layer_type === "state" ? height : allTrendsHeight])
        .domain(this.props.data.map((d) => d.name))
        .paddingInner(0.1)
        .paddingOuter(0.2);

    // update scale domain
    let domainArr = this.props.data.map((e) => e.value).sort((a, b) => a - b);
    domainArr = domainArr.filter((d, i) => domainArr.indexOf(d) === i);
    let domain = d3.range(this.props.map_fill.length).map((d) => {
      return d3.quantile(domainArr, (d + 1) / this.props.map_fill.length);
    });
    domain = domain.filter((d, i) => domain.indexOf(d) === i);
    barFillScale.domain(domain);

    let allKeys = sumstat.map(function (d) { return d.key })

    d3.select(this.trends.current).selectAll("svg").remove();

    let trends = d3
      .select(this.trends.current)
      .selectAll("uniqueChart")
      .attr(
        "transform",
        "translate(" +
        this.props.margin_left +
        "," +
        this.props.margin_top +
        ")"
      )
      .data(sumstat)
      .enter()
      .append("svg")
      .attr("class", "trends mouseover_target")
      .attr("width", trendWidth)
      .attr("height", trendHeight)
      .style("border-bottom", "1px solid black")
      .append("g")
      .attr("class", (d, i) => "region_" + d.values[0].id)

    trendXScale = d3.scaleLinear().domain(d3.extent(trendsData, d => d.year)).rangeRound([trendLabelWidth + trendLabelWidth, trendWidth - 5]);
    trendYScale = d3.scaleLinear().domain([0, d3.max(trendsData, d => d.value)]).rangeRound([trendHeight - 5, 5]);

    trends.append("path")
      // .attr('id', d => 'data-path' + d.value)
      .attr("fill", "none")
      .attr("stroke", this.props.map_fill[3])
      .attr("stroke-width", 1.5)
      .attr("d", function (d) {
        return d3.line()
          .x(function (d) { return trendXScale(d.year); })
          .y(function (d) { return trendYScale(+d.value); })
          (d.values)

      });

    trends.append("text").text((d) => d.values.length < 2 ? "No data available" : "").attr("width", width).attr("y", (trendHeight / 2) + 5)
      .attr("x", trendLabelWidth * 2);

    // Add titles
    trends
      .append("text")
      .attr("width", trendLabelWidth)
      .attr("class", "labels")
      .attr("text-anchor", "start")
      .attr("y", (trendHeight / 2) + 5)
      .attr("x", 0)
      .text(function (d) { return (d.key) })
      .attr("font-family", "helvetica")
      .attr("font-weight", "normal")
      .style(
        "font-size",
        this.props.layer_type === "state"
          ? "0.4em"
          : this.props.layer_type === "NERC region"
            ? "0.8em"
            : "0.6em"
      );

    // bars
    d3.select(this.bars.current).selectAll("g").remove();
    let bars = d3
      .select(this.bars.current)
      .attr(
        "transform",
        "translate(" +
        this.props.margin_left +
        "," +
        this.props.margin_top +
        ")"
      )
      .append("g")
      .selectAll("g")
      .data(this.props.data)
      .enter()
      .append("g")
      .attr(
        "class",
        (d) =>
          "bars mouseover_target barchart_mouseover_target " + " region_" + d.id
      )
      .attr("transform", (d) => "translate(0," + barYScale(d.name) + ")");

    bars
      .append("rect")
      .attr("class", "rects")
      .attr("x", 0)
      .attr("y", 0)
      .attr("width", (d) => barXScale(d.value))
      .attr("height", barYScale.bandwidth())
      .style("fill", (d) => barFillScale(d.value));

    bars
      .append("text")
      .attr("class", "labels")
      .attr("x", (d) => barXScale(d.value))
      .attr("y", 0)
      .attr("dx", 5)
      .attr("dy", barYScale.bandwidth() / 2 + 5)
      .text((d) => this.formatLabel(d.value))
      .style(
        "font-size",
        this.props.layer_type === "state"
          ? "0.6em"
          : this.props.layer_type === "NERC region"
            ? "1em"
            : "0.8em"
      );

    // axis
    let axis_x =
      this.state.width / 2 < 160
        ? this.state.width / 2 < 100
          ? d3.axisTop(barXScale).ticks(1).tickFormat(this.formatXaxis)
          : d3.axisTop(barXScale).ticks(3).tickFormat(this.formatXaxis)
        : d3.axisTop(barXScale).ticks(4).tickFormat(this.formatXaxis);
    d3.select(this.axis_x.current).selectAll("g").remove();
    d3.select(this.axis_x.current)
      .attr("class", "axis_x")
      .attr("id", "axis_x")
      .attr(
        "transform",
        "translate(" +
        this.props.margin_left +
        "," +
        this.props.margin_top +
        ")"
      )
      .call(axis_x)
      .selectAll("text")
      .attr("transform", "rotate(-30)")
      .style("text-anchor", "start")
      .style("font-size", "1.2em");

    d3.select(this.axis_x_title.current)
      .attr(
        "transform",
        "translate(" +
        (this.state.width - this.props.margin_right + 5) +
        "," +
        this.props.margin_top +
        ")"
      )
      .style("fill", "#000")
      .style("text-anchor", "start")
      .style("stroke", "none")
      .style("font-size", "0.8em")
      .style("font-weight", "bold")
      .text(this.props.unit);

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
      .attr("class", "axis_y")
      .call(d3.axisLeft(barYScale))
      .selectAll(".tick")
      .attr(
        "class",
        (d) =>
          "tick mouseover_target  region_" +
          this.props.data.filter((e) => e.name === d).map((e) => e.id)[0]
      )
      .selectAll("text")
      .style(
        "font-size",
        this.props.layer_type === "state"
          ? "1.1em"
          : this.props.layer_type === "NERC region"
            ? "1.5em"
            : "1.2em"
      );

    d3.select(this.barchart.current, this.trends.current)
      .on("mouseenter", () => {
        if (!this.state.isActive) {
          d3.select(this.tooltip.current).style("display", null);
        }
      })
      .on("mouseleave", () => {
        d3.select(this.tooltip.current).style("display", "none");
      });

    let setStateTrue = (d) => {
      this.state.isActive = true;
      this.state.selected_state = d;
      if (d.key) {
        this.state.selected_state_id = d.values[0].id;
      } else {
        this.state.selected_state_id = d.id;
      }
      d3.selectAll(`.all_trends :not(.selected)`).attr("display", "none");
      d3.selectAll(`.region_${this.state.selected_state_id} .selected`).attr("display", "block");
    }

    let setStateFalse = () => {
      this.state.isActive = false;
      this.state.selected_state = [];
      this.state.selected_state_id = undefined;
      d3.select(this.tooltip.current)
        .transition()
        .duration(500)
        .style("opacity", 0);

      d3.selectAll(".deemphasized")
        .classed("deemphasized", false)
        .style("opacity", 1)
        .style("transition", "opacity 0.5s");

      d3.selectAll(".mouseover_target rect")
        .classed("selected", false)
        .style("stroke", "none");
      d3.selectAll(".mouseover_target text")
        .classed("selected", false)
        .style("font-weight", "normal");
      d3.selectAll("path.mouseover_target")
        .classed("selected", false)
        .style("stroke-width", 0.5);
      d3.selectAll(".mouseover_target path")
        .classed("selected", false)
        .style("stroke-width", 1.5);
      d3.selectAll(".mouseover_target circle")
        .classed("selected", false);
      d3.selectAll(".all_trends :not(.US_trend)")
        .classed("selected", false)
      d3.selectAll(`.all_trends :not(.selected)`).attr("display", "none");
      d3.selectAll(`.region_${this.state.selected_state_id} .selected`).attr("display", "block");

    }

    d3.selectAll(".mouseover_target")
      .on("click", (d) => {
        if (!this.state.isActive) {
          setStateTrue(d)
        } else {
          setStateFalse();
        }
      })

    // set selected state to false on outside click
    d3.select("body")
      .on("click", (d) => {
        let target = d3.event.target;
        if (target.classList.contains("mouseover_target") || target.parentNode.classList.contains("mouseover_target")) {
          return;
        } else {
          if (this.state.isActive) {
            setStateFalse();
          }
        }
      })


    d3.selectAll(".mouseover_target")
      .on("mouseover", (d) => {
        if (!this.state.isActive) {
          this.state.selected_state = d;
          if (d.key) {
            this.state.selected_state_id = d.values[0].id;
          } else {
            this.state.selected_state_id = d.id;
          }
          d3.select(this.tooltip.current)
            .transition()
            .duration(100)
            .style("opacity", 1);
          d3.selectAll(`.all_trends :not(.selected)`).attr("display", "none");
          d3.selectAll(`.region_${this.state.selected_state_id} .selected`).attr("display", "block");
        } else {

        }
      })
      .on("mousemove", (d) => {
        let html, id, value, unit;

        if (!this.state.isActive) {
          this.state.selected_state = d;
          if (typeof d === "object" && !d.key) {
            id = d.id;
            this.state.selected_state_id = d.id;
            value = d.value ? this.formatNumber(d.value) : this.formatNumber(d.properties.value);
            unit = d.unit ? d.unit : d.properties.unit;
            html =
              "<span><b>" +
              this.props.title.slice(0, 1) +
              this.props.title.slice(1).split(" (")[0] +
              "</b> for <b>" +
              d.name +
              "</b> is <b>" +
              value +
              " " +
              unit +
              "</b>.</span>";
          } else if (typeof d === "string" && !d.key) {
            id = this.props.data.filter((e) => e.name === d).map((e) => e.id)[0];
            this.state.selected_state_id = this.props.data.filter((e) => e.name === d).map((e) => e.id)[0];
            html =
              "<span><b>" +
              this.props.title.slice(0, 1) +
              this.props.title.slice(1).split(" (")[0] +
              "</b> for <b>" +
              d +
              "</b> is <b>" +
              this.props.data
                .filter((e) => e.name === d)
                .map((e) => this.formatNumber(e.value))[0] +
              " " +
              this.props.data.filter((e) => e.name === d).map((e) => e.unit)[0] +
              "</b>.</span>";
          } else if (d.key) {
            id = d.values[0].id;
            this.state.selected_state_id = d.values[0].id;
          }
          if (!d.key) {
            d3.select(this.tooltip.current)
              .html(html)
              .style("position", "absolute")
              .style("top", d3.event.pageY + 15 + "px")
              .style("left", d3.event.pageX + 15 + "px")
              .style("opacity", 1);
          }
          d3.selectAll(".mouseover_target rect")
            .classed("deemphasized", true)
            .style("opacity", 0.5)
            .style("transition", "opacity 0.5s");
          d3.selectAll(".mouseover_target path")
            .classed("deemphasized", true)
            .style("opacity", 0.5)
            .style("transition", "opacity 0.5s");
          d3.selectAll(".mouseover_target text")
            .classed("deemphasized", true)
            .style("opacity", 0.5)
            .style("transition", "opacity 0.5s");
          d3.selectAll(".mouseover_target circle")
            .classed("deemphasized", true)
            .style("opacity", 0.5)
            .style("transition", "opacity 0.5s");
          d3.selectAll("path.mouseover_target")
            .classed("deemphasized", true)
            .style("opacity", 0.5)
            .style("transition", "opacity 0.5s");

          d3.selectAll(".region_" + id + " .rects")
            .style("stroke", "#000")
            .style("stroke-width", 1)
          d3.selectAll(".region_" + id + " rect")
            .classed("selected", true)
            .style("opacity", 1);
          d3.selectAll(".region_" + id + " path")
            .classed("selected", true)
            .style("stroke-width", 2)
            .style("stroke-color", "red")
            .style("opacity", 1);
          d3.selectAll(".region_" + id + " text")
            .classed("selected", true)
            .style("font-weight", "bold")
            .style("opacity", 1);
          d3.selectAll(".region_" + id + " circle")
            .classed("selected", true)
            .style("opacity", 1);
          d3.selectAll("path.region_" + id)
            .classed("selected", true)
            .style("stroke-width", 1)
            .style("stroke-color", "blue")
            .style("opacity", 1);

          d3.selectAll(`.all_trends :not(.selected)`).attr("display", "none");
          d3.selectAll(`.region_${this.state.selected_state_id} .selected`).attr("display", "block");
        } else {

        }
      })
      .on("mouseout", (d) => {
        let id;

        if (!this.state.isActive) {
          this.state.selected_state = [];
          this.state.selected_state_id = undefined;
          if (typeof d === "object" && !d.key) {
            id = d.id;
          } else if (typeof d === "string" && !d.key) {
            id = this.props.data.filter((e) => e.name === d).map((e) => e.id)[0];
          } else if (d.key) {
            id = d.values[0].id;
          }
          d3.select(this.tooltip.current)
            .transition()
            .duration(500)
            .style("opacity", 0);

          d3.selectAll(".deemphasized")
            .classed("deemphasized", false)
            .style("opacity", 1)
            .style("transition", "opacity 0.5s");

          d3.selectAll(".region_" + id + " rect")
            .classed("selected", false)
            .style("stroke", "none");
          d3.selectAll(".region_" + id + " circle")
            .classed("selected", false);
          d3.selectAll(".region_" + id + " text")
            .classed("selected", false)
            .style("font-weight", "normal");
          d3.selectAll("path.region_" + id)
            .classed("selected", false)
            .style("stroke-width", 0.5);
          d3.selectAll(".region_" + id + " path")
            .classed("selected", false)
            .style("stroke-width", 1.5);
          d3.selectAll(`.all_trends :not(.selected)`).attr("display", "none");
          d3.selectAll(`.region_${this.state.selected_state_id} .selected`).attr("display", "block");
        } else {

        }

      });
    this.state.trendPaddingOffset = (document.getElementById("sort-buttons").getBoundingClientRect().height) + (document.getElementById("axis_x").getBoundingClientRect().height);
    this.updateView(by);
  }

  updateView(by) {
    let trendsData = this.props.trendsData.sort(function (a, b) {
      if (a.key > b.key) {
        return 1;
      } else if (a.key < b.key) {
        return -1;
      }
    })

    let sumstat = d3.nest()
      .key(function (d) { return d.name })
      .entries(trendsData);

    sumstat.sort(function (a, b) {
      if (a.key < b.key) {
        return -1;
      }
      if (a.key > b.key) {
        return 1;
      }
      return 0;
    });


    let trendHeight = 25;
    let allTrendsHeight = trendHeight * sumstat.length;

    // update sort buttons
    let input_n = d3.select(".sort-buttons").selectAll("input").nodes();
    let selected_input =
      by === "alphabet"
        ? input_n.filter((e) => e.defaultValue === "Sort A to Z")[0]
        : input_n.filter((e) => e.defaultValue === "Sort by Amount")[0];
    let non_selected_input =
      by === "alphabet"
        ? input_n.filter((e) => e.defaultValue === "Sort by Amount")[0]
        : input_n.filter((e) => e.defaultValue === "Sort A to Z")[0];

    d3.selectAll(".selected-button").classed("selected-button", false);
    d3.selectAll(".not-selected-button").classed("not-selected-button", false);
    d3.select(selected_input).classed("selected-button", true).classed("btn-primary", true).classed("btn-primary-outline", false);
    d3.select(non_selected_input).classed("not-selected-button", true).classed("btn-primary-outline", true).classed("btn-primary", false);

    // update chart
    let barYScale = d3
      .scaleBand()
      .range([
        0,
        this.props.layer_type === "state" ? this.state.height - this.props.margin_top - this.props.margin_bottom : allTrendsHeight,
      ])
      .domain(
        this.props.data
          .sort((a, b) =>
            by === "amount"
              ? d3.descending(a.value, b.value)
              : d3.ascending(a.name, b.name)
          )
          .map((d) => d.name)
      )
      .paddingInner(0.1)
      .paddingOuter(0.2);

    // update barchart
    d3.select(this.bars.current)
      .selectAll(".bars")
      .transition()
      .duration(100)
      .attr("transform", (d) => "translate(0," + barYScale(d.name) + ")");

    // update y axis
    d3.select(this.axis_y.current)
      .transition()
      .duration(100)
      .call(d3.axisLeft(barYScale));

  }



  componentDidMount() {
    this.initView(this.state.sort_by);
    this.resize();
  }

  componentDidUpdate(prevProps, prevState) {
    if (this.props.field !== prevProps.field) {
      this.initView(this.state.sort_by);
    } else {
      if (this.state.sort_by !== prevState.sort_by) {
        this.updateView(this.state.sort_by);
      }
    }

    if (this.props.window_width !== prevProps.window_width) {
      this.resize();
    }
  }

  resize() {
    if (this.props.window_width < 786) {
      this.setState(
        {
          width: this.props.window_width,
        },
        () => {
          this.initView(this.state.sort_by);
        }
      );
    }
    else if (this.props.window_width < 1150) {
      this.setState(
        {
          width: this.props.window_width * 0.5,
        },
        () => {
          this.initView(this.state.sort_by);
        }
      );
    } else {
      this.setState(
        {
          width: this.props.window_width * 0.25,
        },
        () => {
          this.initView(this.state.sort_by);
        }
      );
    }
  }

  render() {
    return (
      <div id="barchart-wrapper" style={{ width: '100%' }}>
        <div style={{ display: 'flex', flexFlow: 'row wrap' }}>
          <div id="barchart" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
            <div className="sort-buttons no-export-to-pdf blue-segmented-buttongroup" id="sort-buttons">
              <input
                style={{
                  fontSize: this.state.width / 2 < 160 ? "0.7em" : "1em",
                }}
                type="button"
                value={this.state.width / 2 < 100 ? "Alphabet" : "Sort A to Z"}
                onClick={(e) => this.setState({ sort_by: "alphabet" })}
              />
              <input
                style={{
                  fontSize: this.state.width / 2 < 160 ? "0.7em" : "1em",
                }}
                type="button"
                value={this.state.width / 2 < 100 ? "Amount" : "Sort by Amount"}
                onClick={(e) => this.setState({ sort_by: "amount" })}
              />
            </div>
            <p
              style={{
                fontSize: this.state.width / 2 < 100 ? "0.8em" : "1em",
              }}
            >
              {"US: " +
                this.formatUSNumber(this.props.us_data[0][this.props.field]) +
                " (" +
                this.props.unit +
                ")"}
            </p>
            <svg
              ref={this.barchart}
              width={this.state.width}
              height={this.state.height}
            >
              <g className={"axis"}>
                <g ref={this.axis_x}></g>
                <text ref={this.axis_x_title}></text>
                <g ref={this.axis_y}></g>
              </g>

              <g ref={this.bars}></g>
            </svg>
          </div>
          {
            this.props.layer_type !== "state" && this.props.layer_type !== "NERC region" && this.props.layer_type !== "eGRID subregion" ?
              <div id="trends">
                <div
                  style={{ width: this.state.width, height: this.state.height, display: 'flex', flexDirection: 'column', flexWrap: 'wrap', alignItems: 'center', paddingTop: this.state.trendPaddingOffset }}
                  ref={this.trends}
                >
                  <p
                    style={{
                      fontSize: this.state.width / 2 < 100 ? "0.8em" : "1em", margin: '0px',
                    }}
                  >
                    {"Trend"}
                  </p>
                  <p style={{
                    fontSize: this.state.width / 2 < 100 ? "0.8em" : "1em", margin: '0px',
                  }}>{"(" + this.props.usTrendsData[0].year + "–" + this.props.usTrendsData[this.props.usTrendsData.length - 1].year + ")"}</p>
                  {/* <g ref={this.trends}></g> */}
                </div>
              </div>
              : ""
          }
        </div>
        <div>
          <p className="tooltip" ref={this.tooltip}></p>
        </div>
      </div>
    );
  }
}

export default OtherLevelBarchart;
