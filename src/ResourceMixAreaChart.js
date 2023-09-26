import React, { Component } from "react";


import * as d3 from "d3";
import { forEach } from "underscore";
import { style } from "d3";
class ResourceMixAreaChart extends Component {
  constructor(props) {
    super(props);
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
  formatYaxis(d) {
    let num = Math.abs(d);
    if (num < 1000) {
      return d;
    } else {
      let num = d3.format(".3s")(d);
      let abbr = num.slice(-1);
      if (abbr === "G") {
        num = num.substring(0, num.length - 1) + "B";
      }
      let chars1, chars2;

      // 2.00M => 2M
      chars1 = num.slice(-4);
      chars2 = chars1.substring(0, 3);
      if (chars2 === ".00") {
        num = num.slice(0, -4) + num.slice(-1);
        return num;
      }
      // 20.0M => 20M
      chars1 = num.slice(-3);
      chars2 = chars1.substring(0, 2);
      if (chars2 === ".0") {
        num = num.slice(0, -3) + num.slice(-1);
        return num;
      }
      // 1.50M => 1.5M
      chars1 = num.slice(-2);
      chars2 = chars1.substring(0, 1);
      if (chars2 === "0") {
        num = num.slice(0, -2) + num.slice(-1);
        return num;
      }
      return num;
    }
  }

  initView(by) {

    let data = this.props.data,
      stackedData, html;

    let selectedType = this.props.type;
    let selectedUnits = this.props.unit;
    let tooltip = this.tooltip.current;

    //case sensitive
    let myGroup = ['Coal', 'Oil', 'Gas', 'Nuclear', 'Hydro', 'Biomass', 'Wind', 'Solar', 'Geo thermal', 'Other Fossil', 'Other Unknown', 'All Non-Hydro Renewables', 'All Non Renewables', 'All Combustion', 'All Non Combustion'];

    if (data.length > 0) {
      stackedData = d3.stack()
        .keys(myGroup)
        (data)
    }


    var color = d3.scaleOrdinal()
      .domain(myGroup)
      .range(['rgb(135,135,135)', 'rgb(253,191,111)', 'rgb(255,127,0)', 'rgb(106,61,154)', 'rgb(31,120,180)', 'rgb(51,160,44)', 'rgb(178,223,138)', 'rgb(227,26,28)', 'rgb(251,154,153)', 'rgb(202,178,214)', 'rgb(140,81,10)', 'rgb(255, 187, 120)', 'rgb(255, 127, 14)', 'rgb(31, 119, 180)', 'rgb(255, 187, 120)'])


    let width = this.state.width - this.props.margin_left - this.props.margin_right,
      height = this.state.height - this.props.margin_top - this.props.margin_bottom,
      trendXScale = d3.scaleLinear().domain([2018, 2021]).range([0, width]),
      trendYScale = d3.scaleLinear().domain([0, 100]).range([height, 0]);

    d3.select(this.trends.current).selectAll("svg").remove();

    let trends = d3
      .select(this.trends.current)
      .append("svg")
      .attr("width", width + this.props.margin_left + this.props.margin_right)
      .attr("height", height + this.props.margin_top + this.props.margin_bottom)
      .append("g")
      .attr("transform",
        "translate(" + this.props.margin_left + "," + this.props.margin_top + ")")


    trends
      .append("g")
      .attr("transform", "translate(0," + height + ")")
      .call(d3.axisBottom(trendXScale).ticks(3).tickFormat(d3.format("d")));

    trends
      .append("g")
      .call(d3.axisLeft(trendYScale).ticks(8).tickFormat(d => this.formatYaxis(d)))

    trends
      .append("text")
      .attr("y", 0 - this.props.margin_left + 8)
      .attr("x", 0 - (height / 2))
      .attr("dy", "1em")
      .style("text-anchor", "middle")

      .attr("transform", "rotate(-90)")
      .style(
        "font-size", "0.5em"
      )
      .attr("font-weight", "bold")
      .attr("font-family", "helvetica")
      .text(this.props.unit);

    if (data.length > 0) {
      trends
        .selectAll("mylayers")
        .data(stackedData)
        .enter()
        .append("path")
        .style("fill", function (d) { return color(d.key); })
        // .style("opacity", d => d.key === this.props.type ? 1 : .5)
        .attr("stroke", "black")
        .attr("stroke-width", d => d.key === selectedType ? 1 : 0)
        .attr("d", d3.area()
          .x(function (d, i) { return trendXScale(d.data.year); })
          .y0(function (d) { return trendYScale(d[0]); })
          .y1(function (d) { return trendYScale(d[1]); })
        )

    }

    let paths = trends.selectAll("path")
      .on("mousemove", handleMouseMove)
      .on('mouseout', handleMouseOut);

    // Add gradient defs to svg
    const defs = trends.append("defs");

    const gradient = defs.append("linearGradient").attr("id", "svgGradient");
    const gradientResetPercentage = "50%";

    gradient
      .append("stop")
      .attr("class", "start prevColor")
      .attr("offset", gradientResetPercentage);

    gradient
      .append("stop")
      .attr("class", "start")
      .attr("offset", gradientResetPercentage)
      .attr("stop-color", "darkblue");

    gradient
      .append("stop")
      .attr("class", "end")
      .attr("offset", gradientResetPercentage)
      .attr("stop-color", "darkblue")
      .attr("stop-opacity", 1);

    gradient
      .append("stop")
      .attr("class", "end prevColor")
      .attr("offset", gradientResetPercentage)

    const bisectDate = d3.bisector(dataPoint => dataPoint.data.year).left;
    // const bisectValue = d3.bisector(dataPoint => dataPoint.data[]).left;

    function handleMouseMove(data) {
      const currentXPosition = d3.mouse(this)[0];
      const currentYPosition = d3.mouse(this)[1];
      // Get the x value of the current X position
      const xValue = trendXScale.invert(currentXPosition);
      // Get the y value of the current Y position
      const yValue = trendYScale.invert(currentYPosition);


      // // Get the index of the xValue relative to the dataSet
      const dataIndex = bisectDate(data, xValue, 1);

      const leftData = data[dataIndex - 1];
      const rightData = data[dataIndex];
      // // Update gradient
      const x1Percentage = trendXScale(leftData.data.year) / width * 100;
      const x2Percentage = trendXScale(rightData.data.year) / width * 100;
      d3.selectAll(".start").attr("offset", `${x1Percentage}%`);
      d3.selectAll(".end").attr("offset", `${x2Percentage}%`);
      d3.select(this).style("fill", "url(#svgGradient)");
      let prevColor = color(data.key);
      d3.selectAll(".prevColor").attr("stop-color", prevColor);

      html = `<p><b>${data.key}</b></p><p><span>${leftData.data.year}: ${leftData.data[data.key]}${selectedUnits} | ${rightData.data.year}: ${rightData.data[data.key]}${selectedUnits}</span></p>`

      d3.select(tooltip)
        .html(html)
        .transition()
        .duration(10)
        .style("opacity", 1)
        .style("display", "block")
        .style("position", "absolute")
        .style("top", 100 - yValue + "px")
        .style("left", x1Percentage + "%")

    }



    d3.select(this.trends.current)
      .on("mouseleave", () => {
        d3.select(tooltip).style("display", "none");
      });

    function handleMouseOut() {
      d3.selectAll(".start").attr("offset", gradientResetPercentage);
      d3.selectAll(".end").attr("offset", gradientResetPercentage);
      d3.select(this).style("fill", function (d) { return color(d.key); })
    }

    this.updateView(by);
  }

  updateView(by) {
  }

  componentDidMount() {
    this.initView(this.state.sort_by);
    this.resize();
  }


  componentDidUpdate(prevProps, prevState) {
    this.initView(this.state.sort_by);
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
          scale: this.props.window_width,
        },
        () => {
          this.initView();
        }
      );
    } else {
      this.setState(
        {
          width: this.props.window_width * 0.8,
          scale: this.props.window_width,
        },
        () => {
          this.initView();
        }
      );
    }
  }

  render() {
    let title = (
      <div>
        <p style={{ "margin": 0 }}>Trend, {this.props.us_data.length > 0 ? this.props.title.replace(this.props.year, `${this.props.us_data[0].Year}–${this.props.us_data[this.props.us_data.length - 1].Year}`) : ''}</p>
        <p style={{ "fontSize": 12, "margin": 0 }}>Select a {this.props.region_level === "eGRID subregion" ? 'subregion' : this.props.region_level === "state" ? 'state' : this.props.region_level === "balancing authority" ? 'balancing authority' : 'region'} and resource type in the graph above to see its trend here.</p>
      </div>
    );
    return (
      <div style={{ width: this.state.width }}>
        <div id="trends" style={{ position: "relative" }}>
          {title}
          <div ref={this.trends}>
            <div>
              <p className="tooltip resource-mix-tooltip" ref={this.tooltip}></p>
            </div>
          </div>

        </div>

      </div>
    );
  }
}

export default ResourceMixAreaChart;
