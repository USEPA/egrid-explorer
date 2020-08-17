import React, { Component } from "react";
import * as d3 from "d3";
import * as d3_composite from "d3-composite-projections";
import UpdatedTable from "./Table";

class GGLChart extends Component {
  constructor(props) {
    super(props);
    this.tooltip = React.createRef();
    this.background = React.createRef();
    this.map = React.createRef();
    this.paths = React.createRef();
    this.labels = React.createRef();
    this.state = {
      width: this.props.width,
      map_width: this.props.map_width,
      height: this.props.height,
      scale: this.props.scale,
      mouseover_region: null
    };
  }

  initView() {
    const layer = this.props.layer, label_width = 120, label_height = 20;
    let projection = d3_composite
      .geoAlbersUsaTerritories()
      .scale(this.state.scale)
      .translate([this.state.map_width / 2, this.state.height / 2.5]);
    let path = d3.geoPath().projection(projection);
    const map_fill = this.props.map_fill;

    // add centroid to layer
    layer.features = layer.features.map((d) => {
      if (this.props.data.filter((e) => e.name === d.name)[0]) {
        let prop = this.props.data.filter((e) => e.name === d.name)[0];
        prop.centroid = path.centroid(d);
        d.properties = prop;
      } else {
        d.properties = {
          id: null,
          name: null,
          label: null,
          value: null,
          centroid: [null, null],
        };
      }
      return d;
    });

    // add fill scale
    let fill_scale = d3.scaleThreshold().range(map_fill);
    let domainArr = layer.features
      .map((e) => e.properties.value)
      .sort((a, b) => a - b);
    domainArr = domainArr.filter((d, i) => domainArr.indexOf(d) === i);
    let domain = d3.range(map_fill.length).map((d) => {
      return d3.quantile(domainArr, (d + 1) / map_fill.length);
    });
    domain = domain.filter((d, i) => domain.indexOf(d) === i);
    fill_scale.domain(domain);

    // add layers
    d3.select(this.map.current)
      .on("mouseenter", () => {
        d3.select(this.tooltip.current).style("display", null);
      })
      .on("mouseleave", () => {
        d3.select(this.tooltip.current).style("display", "none");
      });

    d3.select(this.paths.current).selectAll("path").remove();
    d3.select(this.paths.current)
      .selectAll("path")
      .data(layer.features)
      .enter()
      .append("path")
      .attr("d", path)
      .attr(
        "class",
        (d) => "map-path mouseover_target region_" + d.properties.id
      )
      .style("fill", this.props.ggl_fill_color)
      .style("stroke", "#000")
      .style("stroke-width", 0.5)
      .on("mouseover", (d) => {
        d3.select(this.tooltip.current)
          .transition()
          .duration(100)
          .style("opacity", 1);
      })
      .on("mousemove", (d) => {
        let html =
          "<span>The <b>" +
          this.props.title.slice(0, 1).toLowerCase() +
          this.props.title.slice(1).split(" (")[0] +
          "</b> for <b>" +
          d.properties.name +
          "</b> is <b>" +
          d.properties.value +
          "</b>.</span>";
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

        d3.selectAll(".region_" + d.properties.id + " rect")
          .classed("selected", true)
          .style("stroke", "#000")
          .style("stroke-width", 1)
          .style("opacity", 1);
        d3.selectAll(".region_" + d.properties.id + " text")
          .classed("selected", true)
          .style("font-weight", "bold")
          .style("opacity", 1);
        d3.selectAll("path.region_" + d.properties.id)
          .classed("selected", true)
          .style("stroke-width", 1)
          .style("opacity", 1);
          
        this.setState({mouseover_region: d.properties.name});
      })
      .on("mouseout", (d) => {
        d3.select(this.tooltip.current)
          .transition()
          .duration(500)
          .style("opacity", 0);

        d3.selectAll(".deemphasized")
          .classed("deemphasized", false)
          .style("opacity", 1)
          .style("transition", "opacity 0.5s");

        d3.selectAll(".region_" + d.properties.id + " rect")
          .classed("selected", true)
          .style("stroke", "none");
        d3.selectAll(".region_" + d.properties.id + " text")
          .classed("selected", true)
          .style("font-weight", "normal");
        d3.selectAll("path.region_" + d.properties.id)
          .classed("selected", true)
          .style("stroke-width", 0.5);
        
        this.setState({mouseover_region: null});
      });

    // add labels
    d3.select(this.labels.current).selectAll("g").remove();
    let labels = d3
      .select(this.labels.current)
      .selectAll("g")
      .data(layer.features)
      .enter()
      .append("g");

    labels
      .append("rect")
      .attr("x", (d) => d.properties.centroid[0] - label_width / 2)
      .attr("y", (d) => d.properties.centroid[1] - label_height * 0.5)
      .attr("width", label_width)
      .attr("height", label_height)
      .attr("rx", 4)
      .style("fill", "#fff")
      .style("stroke", "#000");

    labels
      .append("text")
      .attr("x", (d) => d.properties.centroid[0])
      .attr("y", (d) => d.properties.centroid[1] + label_height * 0.3)
      .style("text-anchor", "middle")
      .style("font-size", "0.8em")
      .style("font-weight", "bold")
      .text((d) => d.properties.label + ": " + d.properties.value)
      .on("mouseover", (d) => {
        d3.select(this.tooltip.current)
          .transition()
          .duration(100)
          .style("opacity", 1);
      })
      .on("mousemove", (d) => {
        let html =
          "<span>The <b>" +
          this.props.title.slice(0, 1).toLowerCase() +
          this.props.title.slice(1).split(" (")[0] +
          "</b> for <b>" +
          d.properties.name +
          "</b> is <b>" +
          d.properties.value +
          "</b>.</span>";
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

        d3.selectAll(".region_" + d.properties.id + " rect")
          .classed("selected", true)
          .style("stroke", "#000")
          .style("stroke-width", 1)
          .style("opacity", 1);
        d3.selectAll(".region_" + d.properties.id + " text")
          .classed("selected", true)
          .style("font-weight", "bold")
          .style("opacity", 1);
        d3.selectAll("path.region_" + d.properties.id)
          .classed("selected", true)
          .style("stroke-width", 1)
          .style("opacity", 1);
      })
      .on("mouseout", (d) => {
        d3.select(this.tooltip.current)
          .transition()
          .duration(500)
          .style("opacity", 0);

        d3.selectAll(".deemphasized")
          .classed("deemphasized", false)
          .style("opacity", 1)
          .style("transition", "opacity 0.5s");

        d3.selectAll(".region_" + d.properties.id + " rect")
          .classed("selected", false)
          .style("stroke", "none");
        d3.selectAll(".region_" + d.properties.id + " text")
          .classed("selected", false)
          .style("font-weight", "normal");
        d3.selectAll("path.region_" + d.properties.id)
          .classed("selected", false)
          .style("stroke-width", 0.5);
      });

    // background
    d3.select(this.background.current).selectAll("path").remove();
    d3.select(this.background.current)
      .selectAll("path")
      .data(this.props.background_layer.features)
      .enter()
      .append("path")
      .attr("d", path)
      .attr("class", "map-path");
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

  resize() {
    if (this.props.window_width > 1280) {
      this.setState(
        {
          width: 1280,
          map_width: 650,
          height: 550,
          scale: 812.5,
        },
        () => {
          this.initView();
        }
      );
    } else {
      this.setState(
        {
          width: this.props.window_width,
          height: 550,
          map_width: this.props.window_width,
          scale: this.props.window_width*0.78
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
        <p className="title">{this.props.title.replace(',', '\n')}</p>
      </div>
    ); 

    return (
      <div style={{ width: this.state.width }}>
        <div>
          {title}
          <svg
              ref={this.map}
              style={{
                width: this.state.map_width,
                height: this.state.height,
              }}
            >
              <g ref={this.background} />
              <g ref={this.paths} />
              <g ref={this.labels} />
            </svg>
            <div
              className="table-wrapper"
              style={{
                width: this.props.table_width,
                marginTop:
                this.state.width < 1280
                  ? this.props.margin_top
                  : "5%",
              }}
            >
              <UpdatedTable
                title={this.props.title}
                data={this.props.data}
                region={this.state.mouseover_region}
                highlight_color={this.props.table_highlight_color}
              />
            </div>
        </div>
        <div>
          <p ref={this.tooltip} className="tooltip"></p>
        </div>
      </div>
    );
  }
}

export default GGLChart;
