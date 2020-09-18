import React, { Component } from "react";

import * as d3 from "d3";
class OtherLevelBarchart extends Component {
  constructor(props) {
    super(props);
    this.barchart = React.createRef();
    this.bars = React.createRef();
    this.axis_x = React.createRef();
    this.axis_y = React.createRef();
    this.axis_x_title = React.createRef();
    this.tooltip = React.createRef();
    this.state = {
      width: this.props.width,
      height: this.props.height,
      sort_by: "alphabet",
    };
  }

  // tooltip
  formatNumber(d) {
    let num = Math.abs(d);
    if (num < 0.1) {
      return d===0? d : d3.format(".4f")(d);
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
      return d===0? d : d3.format(".3f")(d);
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
      return d===0? d : d3.format(".3f")(d);
    } else if (num < 1000) {
      return d3.format(".2f")(d);
    } else {
      return d3.format(",.0f")(d);
    }
  }

  // x axis
  formatXaxis(d) {
    let num = Math.abs(d);
    if (num < 10) {
      return d;
    } else if (num >= 10) {
      let num = d3.format(".0s")(d);
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

  initView(by) {
    // scale
    let barFillScale = d3.scaleThreshold().range(this.props.map_fill),
      barXScale = d3
        .scaleLinear()
        .range([
          0,
          this.state.width - this.props.margin_left - this.props.margin_right,
        ])
        .domain([Math.min(0,d3.min(this.props.data, (e) => e.value)), d3.max(this.props.data, (e) => e.value)]),
      barYScale = d3
        .scaleBand()
        .range([
          0,
          this.state.height - this.props.margin_top - this.props.margin_bottom,
        ])
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
          "bars mouseover_target barchart_mouseover_target" + " region_" + d.id
      )
      .attr("transform", (d) => "translate(0," + barYScale(d.name) + ")");

    bars
      .append("rect")
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
    console.log(barXScale.domain());
    let axis_x =
      this.state.width / 2 < 160
        ? this.state.width / 2 < 100
          ? d3.axisTop(barXScale).ticks(1).tickFormat(this.formatXaxis)
          : d3.axisTop(barXScale).ticks(3).tickFormat(this.formatXaxis)
        : d3.axisTop(barXScale).ticks(4).tickFormat(this.formatXaxis);
    d3.select(this.axis_x.current).selectAll("g").remove();
    d3.select(this.axis_x.current)
      .attr("class", "axis_x")
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
          "tick mouseover_target barchart_mouseover_target region_" +
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

    d3.select(this.barchart.current)
      .on("mouseenter", () => {
        d3.select(this.tooltip.current).style("display", null);
      })
      .on("mouseleave", () => {
        d3.select(this.tooltip.current).style("display", "none");
      });

    d3.selectAll(".barchart_mouseover_target")
      .on("mouseover", (d) => {
        d3.select(this.tooltip.current)
          .transition()
          .duration(100)
          .style("opacity", 1);
      })
      .on("mousemove", (d) => {
        let html, id;
        if (typeof d === "object") {
          id = d.id;
          html =
            "<span><b>" +
            this.props.title.slice(0, 1) +
            this.props.title.slice(1).split(" (")[0] +
            "</b> for <b>" +
            d.name +
            "</b> is <b>" +
            this.formatNumber(d.value) +
            " " +
            d.unit +
            "</b>.</span>";
        } else if (typeof d === "string") {
          id = this.props.data.filter((e) => e.name === d).map((e) => e.id)[0];
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
        }

        d3.select(this.tooltip.current)
          .html(html)
          .style("position", "absolute")
          .style("top", d3.event.pageY - 270 + 15 + "px")
          .style("left", d3.event.pageX + 15 + "px")
          .style("opacity", 1);

        d3.selectAll(".mouseover_target rect")
          .classed("deemphasized", true)
          .style("opacity", 0.5)
          .style("transition", "opacity 0.5s");
        d3.selectAll(".mouseover_target text")
          .classed("deemphasized", true)
          .style("opacity", 0.5)
          .style("transition", "opacity 0.5s");
        d3.selectAll("path.mouseover_target")
          .classed("deemphasized", true)
          .style("opacity", 0.5)
          .style("transition", "opacity 0.5s");

        d3.selectAll(".region_" + id + " rect")
          .classed("selected", true)
          .style("stroke", "#000")
          .style("stroke-width", 1)
          .style("opacity", 1);
        d3.selectAll(".region_" + id + " text")
          .classed("selected", true)
          .style("font-weight", "bold")
          .style("opacity", 1);
        d3.selectAll("path.region_" + id)
          .classed("selected", true)
          .style("stroke-width", 1)
          .style("opacity", 1);
      })
      .on("mouseout", (d) => {
        let id;
        if (typeof d === "object") {
          id = d.id;
        } else if (typeof d === "string") {
          id = this.props.data.filter((e) => e.name === d).map((e) => e.id)[0];
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
        d3.selectAll(".region_" + id + " text")
          .classed("selected", false)
          .style("font-weight", "normal");
        d3.selectAll("path.region_" + id)
          .classed("selected", false)
          .style("stroke-width", 0.5);
      });

    this.updateView(by);
  }

  updateView(by) {
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
        this.state.height - this.props.margin_top - this.props.margin_bottom,
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
    if (this.props.window_width < this.props.ipad_width) {
      this.setState(
        {
          width: this.props.window_width * 0.8,
        },
        () => {
          this.initView(this.state.sort_by);
        }
      );
    } else {
      this.setState(
        {
          width: 400,
        },
        () => {
          this.initView(this.state.sort_by);
        }
      );
    }
  }

  render() {
    return (
      <div id="barchart-wrapper" style={{ width: this.state.width,height:this.state.height+77}}>
        <div className="sort-buttons no-export-to-pdf blue-segmented-buttongroup">
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
        <div id="barchart">
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
        <div>
          <p className="tooltip" ref={this.tooltip}></p>
        </div>
      </div>
    );
  }
}

export default OtherLevelBarchart;
