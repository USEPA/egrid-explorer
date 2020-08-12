import React, { Component } from "react";
import * as d3 from "d3";
import * as d3_legend from "d3-svg-legend";

class OtherLevelMapLegend extends Component {
  constructor(props) {
    super(props);
    this.legend = React.createRef();
    this.legend_title = React.createRef();
    this.state = {
      width: this.props.width,
      height: this.props.height,
    };
  }

  formatLegendLabel(d) {
    let num = Math.abs(d);
    if (num < 1) {
      return d===0? d : d3.format(".3f")(d);
    } else if (num >= 1000) {
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
    } else {
      return d3.format('.3')(d);
    }
  }

  componentDidMount() {
    this.initView();
    this.resize();
  }

  componentDidUpdate(prevProps) {
    if (this.props.field !== prevProps.field) {
      this.initView();
    }

    if (this.props.window_width !== prevProps.window_width) {
      this.resize();
    }
  }

  resize(){
    if (this.props.window_width < this.props.ipad_width) {
      this.setState(
        {
          width: this.props.window_width*0.8,
        },
        () => {
          this.initView();
        }
      );
    } else {
      this.setState(
        {
          width: 600,
        },
        () => {
          this.initView();
        }
      );
    }
  }

  initView() {
    let map_fill = this.props.map_fill;
    let fill_scale = d3.scaleThreshold().range(map_fill);
    let domainArr = this.props.data.map((e) => e.value).sort((a, b) => a - b);
    domainArr = domainArr.filter((d,i)=>domainArr.indexOf(d)===i);
    let domain = d3.range(map_fill.length)
    .map((d) => {
      return d3.quantile(domainArr, (d+1) / map_fill.length);
    });
    fill_scale.domain(domain);

    let w = d3.select(this.legend.current).node().clientWidth,
      h = d3.select(this.legend.current).node().clientHeight;

    let legend = d3_legend
      .legendColor()
      .scale(fill_scale)
      .shape("rect")
      .shapeWidth(w / fill_scale.domain().length)
      .shapeHeight(10)
      .shapePadding(0)
      .labelOffset(10)
      .orient("horizontal")
      .scale(fill_scale)
      .labelFormat(d3.format(".3f"))
      .labelAlign("start")
      .labels((d) => {
        if (d.i===0) {
          return Math.min(0,d3.min(domainArr));
        } else {
          let label_str = d.generatedLabels[d.i].split(" ");
          return label_str[0];
        }
      });

    d3.select(this.legend.current).selectAll("svg").remove();
    d3.select(this.legend.current)
      .append("svg")
      .attr("width", w)
      .attr("height", h)
      .call(legend)
      .selectAll(".cell text")
      .text(this.formatLegendLabel);

    d3.select(this.legend_title.current).selectAll("span").remove();
    d3.select(this.legend_title.current)
      .append("span")
      .html(this.props.unit);
  }

  render() {
    return (
      <div
        id="map-legend-wrapper"
        style={{
          width: this.state.width,
          height: this.state.height,
        }}
      >
        <div>
          <div
            id="map-legend"
            ref={this.legend}
            style={{
              height: this.state.height
            }}
          />
          <div
            id="map-legend-title"
            ref={this.legend_title}
            style={{
              height: this.state.height
            }}
          />
        </div>
      </div>
    );
  }
}

export default OtherLevelMapLegend;
