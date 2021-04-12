import React, { Component } from "react";
import Spinner from "react-bootstrap/Spinner";
import * as _ from "underscore";

import lookup from "./assets/data/json/eGRID lookup.json";

import { SentenceDropdown, SentenceMiscellaneous } from "./Sentence";
import UpdatedVisualization from "./Visualization";

class Main extends Component {
  constructor(props) {
    super(props);
    const latest_year = this.props.options.map(d=>+lookup[d.tier5]).sort((a,b)=>b-a)[0];
    const init_options = this.props.options.filter(d=>+lookup[d.tier5]===latest_year)[0];
    this.state = {
      dropdown_changing: false,
      tier1: init_options.tier1,
      tier2: init_options.tier2,
      tier3: init_options.tier3,
      tier4: init_options.tier4,
      tier5: init_options.tier5,
      field: init_options["Final field name in eGRID"],
      unit: init_options.Units,
      name: init_options.Title,
      all_options: this.props.options.filter(
        (d) => d.tier1 === init_options.tier1
      ),
      tier1_available_options: _.uniq(this.props.options.map((d) => d.tier1)),
      tier2_available_options: _.uniq(
        this.props.options
          .filter((d) => d.tier1 === init_options.tier1)
          .map((d) => d.tier2)
      ),
      tier3_available_options: _.uniq(
        this.props.options
          .filter(
            (d) =>
              d.tier1 === init_options.tier1 && d.tier2 === init_options.tier2
          )
          .map((d) => d.tier3)
      ),
      tier4_available_options: _.uniq(
        this.props.options
          .filter(
            (d) =>
              d.tier1 === init_options.tier1 &&
              d.tier2 === init_options.tier2 &&
              d.tier3 === init_options.tier3
          )
          .map((d) => d.tier4)
      ),
      tier5_available_options: _.uniq(
        this.props.options
          .filter(
            (d) =>
              d.tier1 === init_options.tier1 &&
              d.tier2 === init_options.tier2 &&
              d.tier3 === init_options.tier3 &&
              d.tier4 === init_options.tier4
          )
          .map((d) => d.tier5)
      )
    };

    this.handleChange1 = this.handleChange1.bind(this);
    this.handleChange2 = this.handleChange2.bind(this);
    this.handleChange3 = this.handleChange3.bind(this);
    this.handleChange4 = this.handleChange4.bind(this);
    this.handleChange5 = this.handleChange5.bind(this);
  }

  handleChange1(event) {
    let val = event.target.value;
    this.setState(
      {
        dropdown_changing: true,
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
          let t3_avail = this.props.options.filter(
            (d) => d.tier1 === val && d.tier2 === this.state.tier2
          );
          let t3_val =
            t3_avail.map((d) => d.tier3).indexOf(this.state.tier3) === -1
              ? _.uniq(t3_avail.map((d) => d.tier3))[0]
              : this.state.tier3;
          this.setState({ tier3: t3_val }, () => {
            let t4_avail = this.props.options.filter(
              (d) =>
                d.tier1 === val &&
                d.tier2 === this.state.tier2 &&
                d.tier3 === this.state.tier3
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
                  d.tier3 === this.state.tier3 &&
                  d.tier4 === this.state.tier4
              );
              let t5_val =
                t5_avail.map((d) => d.tier5).indexOf(this.state.tier5) === -1
                  ? _.uniq(t5_avail.map((d) => d.tier5))[0]
                  : this.state.tier5;
              this.setState({ tier5: t5_val}, () => {
                let opt = this.state.all_options.filter(
                  (d) =>
                    d.tier1 === val &&
                    d.tier2 === this.state.tier2 &&
                    d.tier3 === this.state.tier3 &&
                    d.tier4 === this.state.tier4 &&
                    d.tier5 === this.state.tier5
                )[0];
                this.setState({
                  tier2_available_options: _.uniq(
                    this.state.all_options.map((d) => d.tier2)
                  ),
                  tier3_available_options: _.uniq(
                    this.state.all_options
                      .filter((d) => d.tier2 === this.state.tier2)
                      .map((d) => d.tier3)
                  ),
                  tier4_available_options: _.uniq(
                    this.state.all_options
                      .filter(
                        (d) =>
                          d.tier2 === this.state.tier2 &&
                          d.tier3 === this.state.tier3
                      )
                      .map((d) => d.tier4)
                  ),
                  tier5_available_options: _.uniq(
                    this.state.all_options
                      .filter(
                        (d) =>
                          d.tier2 === this.state.tier2 &&
                          d.tier3 === this.state.tier3 &&
                          d.tier4 === this.state.tier4
                      )
                      .map((d) => d.tier5)
                  ),
                });
                this.setState(
                  {
                    field: opt["Final field name in eGRID"],
                    unit: opt.Units,
                    name: opt.Title,
                    dropdown_changing: false,
                  },
                  () => {
                  }
                );
              });
            });
          });
        });
      }
    );
  }

  handleChange2(event) {
    let val = event.target.value;
    this.setState(
      { tier2: val, updated_tier: "tier2", dropdown_changing: true },
      () => {
        let t3_avail = this.props.options.filter(
          (d) => d.tier1 === this.state.tier1 && d.tier2 === val
        );
        let t3_val =
          t3_avail.map((d) => d.tier3).indexOf(this.state.tier3) === -1
            ? _.uniq(t3_avail.map((d) => d.tier3))[0]
            : this.state.tier3;
        this.setState({ tier3: t3_val }, () => {
          let t4_avail = this.props.options.filter(
            (d) =>
              d.tier1 === this.state.tier1 &&
              d.tier2 === val &&
              d.tier3 === this.state.tier3
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
                d.tier3 === this.state.tier3 &&
                d.tier4 === this.state.tier4
            );
            let t5_val =
              t5_avail.map((d) => d.tier5).indexOf(this.state.tier5) === -1
                ? _.uniq(t5_avail.map((d) => d.tier5))[0]
                : this.state.tier5;            
            this.setState({tier5: t5_val}, () => {
              let opt = this.state.all_options.filter(
                (d) =>
                  d.tier1 === this.state.tier1 &&
                  d.tier2 === val &&
                  d.tier3 === this.state.tier3 &&
                  d.tier4 === this.state.tier4 &&
                  d.tier5 === this.state.tier5
              )[0];
              this.setState({
                tier2_available_options: _.uniq(
                  this.state.all_options.map((d) => d.tier2)
                ),
                tier3_available_options: _.uniq(
                  this.state.all_options
                    .filter((d) => d.tier2 === this.state.tier2)
                    .map((d) => d.tier3)
                ),
                tier4_available_options: _.uniq(
                  this.state.all_options
                    .filter(
                      (d) =>
                        d.tier2 === this.state.tier2 &&
                        d.tier3 === this.state.tier3
                    )
                    .map((d) => d.tier4)
                ),
                tier5_available_options: _.uniq(
                  this.state.all_options
                    .filter(
                      (d) =>
                        d.tier2 === this.state.tier2 &&
                        d.tier3 === this.state.tier3 &&
                        d.tier4 === this.state.tier4
                    )
                    .map((d) => d.tier5)
                ),
              });
              this.setState(
                {
                  field: opt["Final field name in eGRID"],
                  unit: opt.Units,
                  name: opt.Title,
                  dropdown_changing: false,
                },
                () => {
                }
              );
            });
          });
        });
      }
    );
  }

  handleChange3(event) {
    let val = event.target.value;
    this.setState(
      { tier3: val, updated_tier: "tier3", dropdown_changing: true },
      () => {
        let t2_avail = this.props.options.filter(
          (d) => d.tier1 === this.state.tier1 && d.tier3 === val
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
              d.tier3 === val
          );
          let t4_val =
            t4_avail.map((d) => d.tier4).indexOf(this.state.tier4) === -1
              ? _.uniq(t4_avail.map((d) => d.tier4))[0]
              : this.state.tier4;
          this.setState({ tier4: t4_val }, () => {
            let t5_avail = this.props.options.filter(
              (d) =>
                d.tier1 === this.state.tier1 &&
                d.tier2 === this.state.tier2 &&
                d.tier3 === val &&
                d.tier4 === this.state.tier4
            );
            let t5_val =
              t5_avail.map((d) => d.tier5).indexOf(this.state.tier5) === -1
                ? _.uniq(t5_avail.map((d) => d.tier5))[0]
                : this.state.tier5;
            this.setState({ tier5: t5_val}, ()=>{
              let opt = this.state.all_options.filter(
                (d) =>
                  d.tier1 === this.state.tier1 &&
                  d.tier2 === this.state.tier2 &&
                  d.tier3 === val &&
                  d.tier4 === this.state.tier4 &&
                  d.tier5 === this.state.tier5
              )[0];
              this.setState({
                tier2_available_options: _.uniq(
                  this.state.all_options.map((d) => d.tier2)
                ),
                tier3_available_options: _.uniq(
                  this.state.all_options.map((d) => d.tier3)
                ),
                tier4_available_options: _.uniq(
                  this.state.all_options
                    .filter(
                      (d) =>
                        d.tier2 === this.state.tier2 &&
                        d.tier3 === this.state.tier3
                    )
                    .map((d) => d.tier4)
                ),
                tier5_available_options: _.uniq(
                  this.state.all_options
                    .filter(
                      (d) =>
                        d.tier2 === this.state.tier2 &&
                        d.tier3 === this.state.tier3 &&
                        d.tier4 === this.state.tier4
                    )
                    .map((d) => d.tier5)
                ),
              });
              this.setState(
                {
                  field: opt["Final field name in eGRID"],
                  unit: opt.Units,
                  name: opt.Title,
                  dropdown_changing: false,
                },
                () => {
                }
              );
            });
          });
        });
      }
    );
  }

  handleChange4(event) {
    let val = event.target.value;
    this.setState(
      { tier4: val, updated_tier: "tier4", dropdown_changing: true },
      () => {
        let t2_avail = this.props.options.filter(
          (d) => d.tier1 === this.state.tier1 && d.tier4 === val
        );
        let t2_val =
          t2_avail.map((d) => d.tier2).indexOf(this.state.tier2) === -1
            ? _.uniq(t2_avail.map((d) => d.tier2))[0]
            : this.state.tier2;
        this.setState({ tier2: t2_val }, () => {
          let t3_avail = this.props.options.filter(
            (d) =>
              d.tier1 === this.state.tier1 &&
              d.tier2 === this.state.tier2 &&
              d.tier4 === val
          );
          let t3_val =
            t3_avail.map((d) => d.tier3).indexOf(this.state.tier3) === -1
              ? _.uniq(t3_avail.map((d) => d.tier3))[0]
              : this.state.tier3;
          this.setState({ tier3: t3_val }, () => {
            let t5_avail = this.props.options.filter(
              (d) =>
                d.tier1 === this.state.tier1 &&
                d.tier2 === this.state.tier2 &&
                d.tier3 === this.state.tier3 &&
                d.tier4 === val
            );
            let t5_val =
              t5_avail.map((d) => d.tier5).indexOf(this.state.tier5) === -1
                ? _.uniq(t3_avail.map((d) => d.tier5))[0]
                : this.state.tier5;
            this.setState({tier5: t5_val}, () => {
              let opt = this.state.all_options.filter(
                (d) =>
                  d.tier1 === this.state.tier1 &&
                  d.tier2 === this.state.tier2 &&
                  d.tier3 === this.state.tier3 &&
                  d.tier4 === val &&
                  d.tier5 === this.state.tier5
              )[0];
              this.setState({
                tier2_available_options: _.uniq(
                  this.state.all_options.map((d) => d.tier2)
                ),
                tier3_available_options: _.uniq(
                  this.state.all_options.map((d) => d.tier3)
                ),
                tier4_available_options: _.uniq(
                  this.state.all_options.map((d) => d.tier4)
                ),
                tier5_available_options: _.uniq(
                  this.state.all_options
                    .filter(
                      (d) =>
                        d.tier2 === this.state.tier2 &&
                        d.tier3 === this.state.tier3 &&
                        d.tier4 === this.state.tier4
                    )
                    .map((d) => d.tier5)
                ),
              });
              this.setState(
                {
                  field: opt["Final field name in eGRID"],
                  unit: opt.Units,
                  name: opt.Title,
                  dropdown_changing: false,
                },
                () => {
                }
              );
            });
          });
        });
      }
    );
  }

  handleChange5(event) {
    let val = event.target.value;
    this.setState(
      { tier5: val, updated_tier: "tier5", dropdown_changing: true },
      () => {
        let t2_avail = this.props.options.filter(
          (d) => d.tier1 === this.state.tier1 && d.tier5 === val
        );
        let t2_val =
          t2_avail.map((d) => d.tier2).indexOf(this.state.tier2) === -1
            ? _.uniq(t2_avail.map((d) => d.tier2))[0]
            : this.state.tier2;
        this.setState({ tier2: t2_val }, () => {
          let t3_avail = this.props.options.filter(
            (d) =>
              d.tier1 === this.state.tier1 &&
              d.tier2 === this.state.tier2 &&
              d.tier5 === val
          );
          let t3_val =
            t3_avail.map((d) => d.tier3).indexOf(this.state.tier3) === -1
              ? _.uniq(t3_avail.map((d) => d.tier3))[0]
              : this.state.tier3;
          this.setState({ tier3: t3_val }, () => {
            let t4_avail = this.props.options.filter(
              (d) =>
              d.tier1 === this.state.tier1 &&
              d.tier2 === this.state.tier2 &&
              d.tier3 === this.state.tier3 &&
              d.tier5 === val
            );
            let t4_val = 
              t4_avail.map((d) => d.tier4).indexOf(this.state.tier4) === -1
                ? _.uniq(t4_avail.map((d) => d.tier4))[0]
                : this.state.tier4;
            this.setState({tier4: t4_val}, () => {
              let opt = this.state.all_options.filter(
                (d) =>
                  d.tier1 === this.state.tier1 &&
                  d.tier2 === this.state.tier2 &&
                  d.tier3 === this.state.tier3 &&
                  d.tier4 === this.state.tier4 &&
                  d.tier5 === val
              )[0];
              this.setState({
                tier2_available_options: _.uniq(
                  this.state.all_options.map((d) => d.tier2)
                ),
                tier3_available_options: _.uniq(
                  this.state.all_options.map((d) => d.tier3)
                ),
                tier4_available_options: _.uniq(
                  this.state.all_options.map((d) => d.tier4)
                ),
                tier5_available_options: _.uniq(
                  this.state.all_options.map((d) => d.tier5)
                ),
              });
              this.setState(
                {
                  field: opt["Final field name in eGRID"],
                  unit: opt.Units,
                  name: opt.Title,
                  dropdown_changing: false,
                },
                () => {
                }
              );
            });
          });
        });
      }
    );
  }

  render() {
    let all_options = this.state.all_options;
    let tier2_options = _.uniq(all_options.map((op) => lookup[op.tier2])),
      tier3_options = _.uniq(all_options.map((op) => lookup[op.tier3])),
      tier4_options = _.uniq(all_options.map((op) => lookup[op.tier4])),
      tier5_options = _.uniq(all_options.map((op) => lookup[op.tier5]));
    
    return (
      <div>
        <div className="no-export-to-pdf" id="sentence">
          I want to explore
          <span> </span>
          <SentenceDropdown
            id="tier1"
            lookup={lookup}
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
            value={
              this.props.conjunction["tier1_" + this.state.tier1].conjunct1
            }
          />
          <span> </span>
          {tier2_options.length > 1 ? (
            <SentenceDropdown
              id="tier2"
              lookup={lookup}
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
            value={
              this.props.conjunction["tier1_" + this.state.tier1].conjunct2
            }
          />
          <span> </span>
          {tier3_options.length > 1 ? (
            <SentenceDropdown
              id="tier3"
              lookup={lookup}
              change={this.handleChange3}
              updated_tier={this.state.updated_tier}
              selected_option={this.state.tier3}
              available_options={this.state.tier3_available_options}
              options={_.uniq(
                this.state.all_options.map((op) => [
                  op.tier3,
                  lookup[op.tier3],
                ]),
                (d) => d[0]
              )}
            />
          ) : tier3_options.length === 1 && tier3_options[0] !== "" ? (
            <SentenceMiscellaneous value={lookup[this.state.tier3]} />
          ) : (
            <span></span>
          )}
          <span> </span>
          <SentenceMiscellaneous
            value={
              this.props.conjunction["tier1_" + this.state.tier1].conjunct3
            }
          />
          <span> </span>
          {tier4_options.length > 1 ? (
            <SentenceDropdown
              id="tier4"
              lookup={lookup}
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
            value={
              this.props.conjunction["tier1_" + this.state.tier1].conjunct4
            }
          />
          <span> for </span>
          {tier5_options.length > 1 ? (
            <SentenceDropdown
              id="tier5"
              lookup={lookup}
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
          <span>. </span>
        </div>
        {this.props.plant_data.length === 0 || this.state.dropdown_changing ? (
          <div className="loading">
            <Spinner animation="grow" variant="success" />
          </div>
        ) : (
          <div id="visualization">
            <UpdatedVisualization
              options={this.props.options}
              choropleth_map_fill={this.props.choropleth_map_fill}
              plant_fuels={this.props.plant_fuels}
              plant_dist={this.props.plant_dist}
              fuel_label_lookup={this.props.fuel_label_lookup}
              fuel_color_lookup={this.props.fuel_color_lookup}
              table_highlight_color={this.props.table_highlight_color}
              resourcemix_micromap_highlight_color={this.props.resourcemix_micromap_highlight_color}
              fuel_background_highlight_color={this.props.fuel_background_highlight_color}
              fuel_background_select_color={this.props.fuel_background_select_color}
              ggl_fill_color={this.props.ggl_fill_color}
              fuel_sentence_code_lookup={this.props.fuel_sentence_code_lookup}
              plant_table_rows={this.props.plant_table_rows}
              wrap_long_labels={this.props.wrap_long_labels}
              field={this.state.field}
              title={this.state.title}
              name={this.state.name}
              unit={this.state.unit}
              tier1={this.state.tier1}
              tier2={this.state.tier2}
              tier3={this.state.tier3}
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
              nerc2018_layer={this.props.nerc2018_layer}
              nerc2019_layer={this.props.nerc2019_layer}
              ggl_layer={this.props.ggl_layer}
            ></UpdatedVisualization>
          </div>
        )}
      </div>
    );
  }
}

export default Main;
