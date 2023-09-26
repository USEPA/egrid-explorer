import React, { Component } from "react";


import * as d3 from "d3";
import d3sB from "d3-scale-break";
import { forEach } from "underscore";
import { style } from "d3";
class OtherLevelTrends extends Component {
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

  // Y axis
  formatYaxis(d) {
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

    let data, yearLength;

    if (this.props.title.includes("Total generation")
      || this.props.title.includes("eat input")
      || this.props.title.includes("Nameplate capacity")
      || this.props.title.includes("total emissions")
      || this.props.layer_type === "plant"
      || this.props.layer_type === "balancing authority") {
      data = this.props.trendsData.concat(this.props.usTrendsData).reduce(function (filtered, option) {
        if (option.year != undefined && option.name !== 'US') {
          let filteredData = { name: option.name, year: option.year, value: option.value, unit: option.unit, id: option.id, label: option.label }
          filtered.push(filteredData);
        }
        return filtered;
      }, []);
    } else {
      data = this.props.trendsData.concat(this.props.usTrendsData).reduce(function (filtered, option) {
        if (option.year != undefined) {
          let filteredData = { name: option.name, year: option.year, value: option.value, unit: option.unit, id: option.id, label: option.label }
          filtered.push(filteredData);
        }
        return filtered;
      }, []);

    }



    let sumstat = d3.nest()
      .key(function (d) { return d.name })
      .entries(data);

    yearLength = sumstat[0].values.length;

    // Push us trends to the bottom of the chart

    function move(array, from, to) {
      if (to === from) return array;

      var target = array[from];
      var increment = to < from ? -1 : 1;

      for (var k = from; k != to; k += increment) {
        array[k] = array[k + increment];
      }
      array[to] = target;
      return array;
    }

    let USFromIndex = sumstat.findIndex(d => d.key === "US");

    if (USFromIndex !== -1) {
      move(sumstat, USFromIndex, 0)
    }




    let width = this.state.width - this.props.margin_left - this.props.margin_right,
      height = this.state.height - this.props.margin_top - this.props.margin_bottom,
      trendXScale = d3.scaleLinear().domain(d3.extent(data, d => d.year)).rangeRound([0, width]),
      breakValue,
      trendYScale,
      bisectDate = d3.bisector(d => d.year).left;

    if (d3.quantile(Array.from(data, d => d.value), .75) == 0) {
      breakValue = d3.quantile(Array.from(data, d => d.value), 1);
      trendYScale = d3sB.scaleLinear()
        .domain([[d3.min(data, d => d.value), breakValue], [breakValue, d3.max(data, d => d.value)]])
        .scope([[0, .65], [.65, 1]])
        .range([height, 0])
    } else {
      trendYScale = d3.scaleLinear().domain([0, d3.max(data, d => d.value)]).rangeRound([height, 0])
    }


    d3.select(this.trends.current).selectAll("svg").remove();


    let trends = d3
      .select(this.trends.current)
      .append("svg")
      .attr("width", width + this.props.margin_left + this.props.margin_right)
      .attr("height", height + this.props.margin_top + this.props.margin_bottom)
      .attr("overflow", "visible")
      .append("g")
      .attr("transform",
        "translate(" + this.props.margin_left + "," + this.props.margin_top + ")")


    trends
      .append("g")
      .attr("transform", "translate(0," + height + ")")
      .call(d3.axisBottom(trendXScale).ticks(yearLength - 1).tickFormat(d3.format("d")));

    if (this.props.layer_type === "plant") {
      trends
        .append("g")
        .call(d3sB.axisLeft(trendYScale).tickSizeOuter([0]).ticks([5, 3]).tickFormat(d => this.formatLabel(d)))


    } else {
      trends
        .append("g")
        .call(d3.axisLeft(trendYScale).ticks(8).tickFormat(d => this.formatYaxis(d)))
    }

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

    let g = trends.selectAll(".line")
      .data(sumstat).enter()
      .append("g")
      .attr(
        "class",
        (d, i) =>

          "all_trends trends_mouseover_target region_" + d.values[0].id
      ).classed("US_trend selected", d => d.key === "US" ? true : false)


    let lines = g.append("path")
      .attr("fill", "none")
      .attr("class", d => d.key === "US" ? "US_trend selected" : "")
      .attr("stroke", d => d.key === "US" ? "black" : this.props.map_fill[3])
      .attr("stroke-width", 1.5)
      .attr("d", function (d) {
        return d3.line()
          .x(function (d) { return trendXScale(d.year); })
          .y(function (d) { return trendYScale(d.value); })
          .defined(function (d) {
            return d.value !== ""
          })
          (d.values)
      })

    if (this.props.layer_type !== "balancing authority" && this.props.layer_type !== "plant") {
      g.append("rect")
        .attr("x", width + 4)
        .attr("y", function (d) {
          return trendYScale(d.values[d.values.length - 1].value) - 4
        })
        .attr("width", 20)
        .attr("height", 10)
        .attr("fill", "white")
    }

    if (this.props.layer_type !== "balancing authority" && this.props.layer_type !== "plant") {
      g.append("text").text(d => d.key)
        .attr("y", function (d) {
          return trendYScale(d.values[d.values.length - 1].value) + 5
        })
        .attr("class", d => d.key === "US" ? "US_trend selected" : "")
        .attr("x", width + 6)
        .attr("text-anchor", "start")
        .attr("font-family", "helvetica")
        .attr("font-weight", "normal")
        .attr("fill", d => d.key === "US" ? "black" : this.props.map_fill[3])
        .style(
          "font-size", "0.5em"
        )
    }


    let circles = g
      .selectAll("myCircles")
      .data(d => d.values).enter()
      .append("circle")
      .attr("class", d => d.name === "US" ? "US_trend selected" : "")
      .attr("fill", d => d.name === "US" ? "black" : this.props.map_fill[3])
      .attr("stroke", "none")
      .attr("cx", function (d) { return trendXScale(d.year) })
      .attr("cy", function (d) { return trendYScale(d.value) })
      .attr("r", 3)

    circles.on("mouseenter", (d, i) => {
      let html;
      let idx = sumstat.length;
      let thisVal = this.formatNumber(d.value);

      if (this.props.title.includes("Total generation")
        || this.props.title.includes("eat input")
        || this.props.title.includes("Nameplate capacity")
        || this.props.title.includes("total emissions")
        || this.props.layer_type === "plant"
        || this.props.layer_type === "balancing authority") {
        html = "<span>" + d.name + ": <span style='color:" + this.props.map_fill[3] + "'>" + thisVal + "</span>";
      }
      else {
        let USval = this.formatNumber(sumstat[0].values[i].value);
        if (d.name === "US") {
          html = "US avg: " + thisVal;
        } else {
          html = "<span>" + d.name + ": <span style='color:" + this.props.map_fill[3] + "'>" + thisVal + "</span> <br> US avg: " + USval + "</span>";
        }
      }

      d3.select(this.tooltip.current)
        .html(html)
        .transition()
        .duration(100)
        .style("opacity", 1)
        .style("display", null)
        .style("position", "absolute")
        .style("top", trendYScale(d.value) - height - this.props.margin_bottom + "px")
        .style("left", trendXScale(d.year) + "px")
    })

    d3.select(this.trends.current)
      .on("mouseleave", () => {
        d3.select(this.tooltip.current).style("display", "none");
      });


    // selected trend lines
    d3.selectAll(".all_trends .selected").attr("display", "block");
    d3.selectAll(".all_trends :not(.selected)").attr("display", "none");

    this.updateView(by);
  }

  updateView(by) {
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
          scale: this.props.window_width,
        },
        () => {
          this.initView();
        }
      );
    } else {
      this.setState(
        {
          width: 650,
          scale: 812.5,
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
        <p style={{ "margin": 0 }}>Trend, {this.props.title.replace(`${this.props.us_data[0].Year}`, `${this.props.usTrendsData[0].year}–${this.props.usTrendsData[this.props.usTrendsData.length - 1].year}`)}</p>
        <p style={{ "fontSize": 12, "margin": 0 }}>Select {this.props.layer_type === "eGRID subregion" ? "an" : "a"} {this.props.layer_type} in the map above {this.props.layer_type !== "plant" && this.props.layer_type !== "balancing authority" ? "or the graphs at the right" : ""} to see its trend here.</p>
      </div>
    );
    return (
      <div style={{ width: this.state.width }}>
        <div id="trends" style={{ position: "relative" }}>
          {title}
          <div ref={this.trends}></div>
          <div style={{ position: "relative" }}>
            <p className="tooltip trends-tooltip" ref={this.tooltip}></p>
          </div>
        </div>

      </div>
    );
  }
}

export default OtherLevelTrends;
