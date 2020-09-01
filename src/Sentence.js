import React, { Component } from "react";

class SentenceDropdown extends Component {
  render() {
    const opts = [];
    let selected_option = this.props.selected_option,
      available_options = this.props.available_options;

    this.props.options.forEach((option) => {
      let opt = null;
      if (this.props.id === "tier1") {
        opt = (
          <option key={option[0]} value={option[0]} label={option[1]} disabled={false}>
            {option[1]}
          </option>
        );
      } else if (this.props.id === this.props.updated_tier) {
        opt = (
          <option key={option[0]} value={option[0]} label={option[1]} disabled={false}>
            {option[1]}
          </option>
        );
      } else if (available_options.indexOf(option[0]) !== -1) {
        opt = (
          <option key={option[0]} value={option[0]} label={option[1]} disabled={false}>
            {option[1]}
          </option>
        );
      }
      opts.push(opt);
    });

    return (
      <div className="select-wrapper">
        <select value={selected_option} onChange={this.props.change}>
          {opts}
        </select>
      </div>
    );
  }
}

class SentenceMiscellaneous extends Component {
  render() {
    return <span>{this.props.value}</span>;
  }
}

export { SentenceDropdown, SentenceMiscellaneous };
