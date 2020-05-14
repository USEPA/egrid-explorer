import React, { Component } from "react";
import * as _ from "underscore";

import lookup from "./assets/data/json/eGRID lookup.json";

import { SentenceDropdown, SentenceMiscellaneous } from "./Sentence";
import UpdatedVisualization from "./Visualization";

class Main extends Component {
  constructor(props) {
    super(props);
    const init_options = this.props.options[0];
    this.state = {
      tier1: init_options.tier1,
      tier2: init_options.tier2,
      tier4: init_options.tier4,
      tier5: init_options.tier5,
      field: init_options["Final field name in eGRID"],
      unit: init_options.Units,
      name: init_options["Full Name"],
      data: [],
      all_options: this.props.options.filter(
        (d) => d.tier1 === init_options.tier1
      ),
      tier1_available_options: _.uniq(this.props.options.map((d) => d.tier1)),
      tier2_available_options: _.uniq(
        this.props.options
          .filter((d) => d.tier1 === init_options.tier1)
          .map((d) => d.tier2)
      ),
      tier4_available_options: _.uniq(
        this.props.options
          .filter(
            (d) =>
              d.tier1 === init_options.tier1 &&
              d.tier2 === init_options.tier2
          )
          .map((d) => d.tier4)
      ),
      tier5_available_options: _.uniq(
        this.props.options
          .filter(
            (d) =>
              d.tier1 === init_options.tier1 &&
              d.tier2 === init_options.tier2 &&
              d.tier4 === init_options.tier4
          )
          .map((d) => d.tier5)
      ),
    };

    this.handleChange1 = this.handleChange1.bind(this);
    this.handleChange2 = this.handleChange2.bind(this);
    this.handleChange4 = this.handleChange4.bind(this);
    this.handleChange5 = this.handleChange5.bind(this);
  }

  handleChange1(event) {
    let val = event.target.value;
    this.setState(
      {
        tier1: val,
        all_options: this.props.options.filter((d) => d.tier1 === val),
        updated_tier: "tier1",
      },
      () => {
        let t2_avail = this.props.options.filter((d) => d.tier1 === val);
        let t2_val =
          t2_avail.map((d) => d.tier2).indexOf(this.state.tier2) === -1
            ? _.uniq(t2_avail.map((d) => d.tier2))[0]
            : this.state.tier2;
        this.setState({ tier2: t2_val }, () => {
          let t4_avail = this.props.options.filter(
            (d) =>
              d.tier1 === val &&
              d.tier2 === this.state.tier2
          );
          let t4_val =
            t4_avail.map((d) => d.tier4).indexOf(this.state.tier4) === -1
              ? _.uniq(t4_avail.map((d) => d.tier4))[0]
              : this.state.tier4;
          this.setState({ tier4: t4_val }, () => {
            let t5_avail = this.props.options.filter(
              (d) =>
                d.tier1 === val &&
                d.tier2 === this.state.tier2 &&
                d.tier4 === this.state.tier4
            );
            let t5_val =
              t5_avail.map((d) => d.tier5).indexOf(this.state.tier5) === -1
                ? _.uniq(t5_avail.map((d) => d.tier5))[0]
                : this.state.tier5;
            this.setState({ tier5: t5_val }, () => {
              let opt = this.state.all_options.filter(
                (d) =>
                  d.tier1 === this.state.tier1 &&
                  d.tier2 === this.state.tier2 &&
                  d.tier4 === this.state.tier4 &&
                  d.tier5 === this.state.tier5
              )[0];
              this.setState({
                tier2_available_options: _.uniq(
                  this.state.all_options.map((d) => d.tier2)
                ),
                tier4_available_options: _.uniq(
                  this.state.all_options
                    .filter(
                      (d) =>
                        d.tier2 === this.state.tier2
                    )
                    .map((d) => d.tier4)
                ),
                tier5_available_options: _.uniq(
                  this.state.all_options
                    .filter(
                      (d) =>
                        d.tier2 === this.state.tier2 &&
                        d.tier4 === this.state.tier4
                    )
                    .map((d) => d.tier5)
                ),
              });
              this.setState({
                field: opt["Final field name in eGRID"],
                unit: opt.Units,
                name: opt["Full Name"],
              }, ()=>{
                console.log(this.state);
              });
              
            });
          });
        });
      }
    );
  }

  handleChange2(event) {
    let val = event.target.value;
    this.setState({ tier2: val, updated_tier: "tier2" }, () => {

      let t4_avail = this.props.options.filter(
        (d) =>
          d.tier1 === this.state.tier1 &&
          d.tier2 === val
      );
      let t4_val =
        t4_avail.map((d) => d.tier4).indexOf(this.state.tier4) === -1
          ? _.uniq(t4_avail.map((d) => d.tier4))[0]
          : this.state.tier4;
      this.setState({ tier4: t4_val }, () => {
        let t5_avail = this.props.options.filter(
          (d) =>
            d.tier1 === this.state.tier1 &&
            d.tier2 === val &&
            d.tier4 === this.state.tier4
        );
        let t5_val =
          t5_avail.map((d) => d.tier5).indexOf(this.state.tier5) === -1
            ? _.uniq(t5_avail.map((d) => d.tier5))[0]
            : this.state.tier5;
        this.setState({ tier5: t5_val }, () => {
          let opt = this.state.all_options.filter(
            (d) =>
              d.tier1 === this.state.tier1 &&
              d.tier2 === this.state.tier2 &&
              d.tier4 === this.state.tier4 &&
              d.tier5 === this.state.tier5
          )[0];
          this.setState({
            tier2_available_options: _.uniq(
              this.state.all_options.map((d) => d.tier2)
            ),
            tier4_available_options: _.uniq(
              this.state.all_options
                .filter(
                  (d) =>
                    d.tier2 === this.state.tier2
                )
                .map((d) => d.tier4)
            ),
            tier5_available_options: _.uniq(
              this.state.all_options
                .filter(
                  (d) =>
                    d.tier2 === this.state.tier2 &&
                    d.tier4 === this.state.tier4
                )
                .map((d) => d.tier5)
            ),
          });
          this.setState({
            field: opt["Final field name in eGRID"],
            unit: opt.Units,
            name: opt["Full Name"],
          }, ()=>{
            console.log(this.state);
          });
        });
      });
    });
  }

  handleChange4(event) {
    let val = event.target.value;
    this.setState({ tier4: val, updated_tier: "tier4" }, () => {
      let t2_avail = this.props.options.filter(
        (d) => d.tier1 === this.state.tier1 && d.tier4 === val
      );
      let t2_val =
        t2_avail.map((d) => d.tier2).indexOf(this.state.tier2) === -1
          ? _.uniq(t2_avail.map((d) => d.tier2))[0]
          : this.state.tier2;
      this.setState({ tier2: t2_val }, () => {
        let t5_avail = this.props.options.filter(
          (d) =>
            d.tier1 === this.state.tier1 &&
            d.tier2 === this.state.tier2 &&
            d.tier4 === val
        );
        let t5_val =
          t5_avail.map((d) => d.tier5).indexOf(this.state.tier5) === -1
            ? _.uniq(t5_avail.map((d) => d.tier5))[0]
            : this.state.tier5;
        this.setState({ tier5: t5_val }, () => {
          let opt = this.state.all_options.filter(
            (d) =>
              d.tier1 === this.state.tier1 &&
              d.tier2 === this.state.tier2 &&
              d.tier4 === this.state.tier4 &&
              d.tier5 === this.state.tier5
          )[0];
          this.setState({
            tier2_available_options: _.uniq(
              this.state.all_options.map((d) => d.tier2)
            ),
            tier4_available_options: _.uniq(
              this.state.all_options.map((d) => d.tier4)
            ),
            tier5_available_options: _.uniq(
              this.state.all_options
                .filter(
                  (d) =>
                    d.tier2 === this.state.tier2 &&
                    d.tier4 === this.state.tier4
                )
                .map((d) => d.tier5)
            ),
          });
          this.setState({
            field: opt["Final field name in eGRID"],
            unit: opt.Units,
            name: opt["Full Name"],
          }, ()=>{
            console.log(this.state);
          });
        });
      });
    });
  }

  handleChange5(event) {
    let val = event.target.value;
    this.setState({ tier5: val, updated_tier: "tier5" }, () => {
      let t2_avail = this.props.options.filter(
        (d) => d.tier1 === this.state.tier1 && d.tier5 === val
      );
      let t2_val =
        t2_avail.map((d) => d.tier2).indexOf(this.state.tier2) === -1
          ? _.uniq(t2_avail.map((d) => d.tier2))[0]
          : this.state.tier2;
      this.setState({ tier2: t2_val }, () => {
        let t4_avail = this.props.options.filter(
          (d) =>
            d.tier1 === this.state.tier1 &&
            d.tier2 === this.state.tier2 &&
            d.tier5 === val
        );
        let t4_val =
          t4_avail.map((d) => d.tier4).indexOf(this.state.tier4) === -1
            ? _.uniq(t4_avail.map((d) => d.tier4))[0]
            : this.state.tier4;
        this.setState({ tier4: t4_val }, () => {
          let opt = this.state.all_options.filter(
            (d) =>
              d.tier1 === this.state.tier1 &&
              d.tier2 === this.state.tier2 &&
              d.tier4 === this.state.tier4 &&
              d.tier5 === this.state.tier5
          )[0];
          this.setState({
            tier2_available_options: _.uniq(
              this.state.all_options.map((d) => d.tier2)
            ),
            tier4_available_options: _.uniq(
              this.state.all_options.map((d) => d.tier4)
            ),
            tier5_available_options: _.uniq(
              this.state.all_options.map((d) => d.tier5)
            ),
          });
          this.setState({
            field: opt["Final field name in eGRID"],
            unit: opt.Units,
            name: opt["Full Name"],
          }, ()=>{
            console.log(this.state);
          });
        });
      });
    });
  }

  render() {
    let all_options = this.state.all_options;
    let tier2_options = _.uniq(all_options.map((op) => lookup[op.tier2])),
      tier4_options = _.uniq(all_options.map((op) => lookup[op.tier4])),
      tier5_options = _.uniq(all_options.map((op) => lookup[op.tier5]));
    return (
      <div>
        <p className="main">
          I want to explore
          <SentenceDropdown
            id="tier1"
            change={this.handleChange1}
            updated_tier={this.state.updated_tier}
            selected_option={this.state.tier1}
            available_options={this.state.tier1_available_options}
            options={_.uniq(
              this.props.options.map((op) => [op.tier1, lookup[op.tier1]]),
              (d) => d[0]
            )}
          />
          <span> </span>
          <SentenceMiscellaneous
            value={this.props.conjunction["tier1_" + this.state.tier1].conjunct1}
          />
          <span> </span>
          {tier2_options.length > 1 ? (
            <SentenceDropdown
              id="tier2"
              change={this.handleChange2}
              updated_tier={this.state.updated_tier}
              selected_option={this.state.tier2}
              available_options={this.state.tier2_available_options}
              options={_.uniq(
                this.state.all_options.map((op) => [
                  op.tier2,
                  lookup[op.tier2],
                ]),
                (d) => d[0]
              )}
            />
          ) : tier2_options.length === 1 && tier2_options[0] !== "" ? (
            <SentenceMiscellaneous value={lookup[this.state.tier2]} />
          ) : (
            <span></span>
          )}
          <span> </span>
          <SentenceMiscellaneous
            value={this.props.conjunction["tier1_" + this.state.tier1].conjunct2}
          />
          <span> </span>
          {tier4_options.length > 1 ? (
            <SentenceDropdown
              id="tier4"
              change={this.handleChange4}
              updated_tier={this.state.updated_tier}
              selected_option={this.state.tier4}
              available_options={this.state.tier4_available_options}
              options={_.uniq(
                this.state.all_options.map((op) => [
                  op.tier4,
                  lookup[op.tier4],
                ]),
                (d) => d[0]
              )}
            />
          ) : tier4_options.length === 1 && tier4_options[0] !== "" ? (
            <SentenceMiscellaneous value={lookup[this.state.tier4]} />
          ) : (
            <span></span>
          )}
          <span> </span>
          <SentenceMiscellaneous
            value={this.props.conjunction["tier1_" + this.state.tier1].conjunct3}
          />
          <span> </span>
          {tier5_options.length > 1 ? (
            <SentenceDropdown
              id="tier5"
              change={this.handleChange5}
              updated_tier={this.state.updated_tier}
              selected_option={this.state.tier5}
              available_options={this.state.tier5_available_options}
              options={_.uniq(
                this.state.all_options.map((op) => [
                  op.tier5,
                  lookup[op.tier5],
                ]),
                (d) => d[0]
              )}
            />
          ) : tier5_options.length === 1 && tier5_options[0] !== "" ? (
            <SentenceMiscellaneous value={lookup[this.state.tier5]} />
          ) : (
            <span></span>
          )}
          <span> </span>
          <SentenceMiscellaneous
            value={this.props.conjunction["tier1_" + this.state.tier1].conjunct4}
          />
          <span> for </span>
          <SentenceMiscellaneous value={this.props.year} />.
        </p>
        <UpdatedVisualization
          className="main"
          choropleth_map_fill={this.props.choropleth_map_fill}
          plant_fuels={this.props.plant_fuels}
          plant_outlier={this.props.plant_outlier}
          fuel_label_lookup={this.props.fuel_label_lookup}
          fuel_color_lookup={this.props.fuel_color_lookup}
          wrap_long_labels={this.props.wrap_long_labels}
          field={this.state.field}
          name={this.state.name}
          unit={this.state.unit}
          tier1={this.state.tier1}
          tier2={this.state.tier2}
          tier4={this.state.tier4}
          tier5={this.state.tier5}
          plant_data={this.props.plant_data}
          state_data={this.props.state_data}
          subrgn_data={this.props.subrgn_data}
          nerc_data={this.props.nerc_data}
          ggl_data={this.props.ggl_data}
          us_data={this.props.us_data}
          state_layer={this.props.state_layer}
          subrgn_layer={this.props.subrgn_layer}
          nerc_layer={this.props.nerc_layer}
          ggl_layer={this.props.ggl_layer}
        ></UpdatedVisualization>
      </div>
    );
  }
}

export default Main;