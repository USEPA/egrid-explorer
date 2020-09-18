import React from "react";
import Modal from "react-bootstrap/Modal";

import instruction_sentence from "./assets/img/instruction_sentence.png";
import instruction_resourcemix from "./assets/img/instruction_resourcemix.png";
import instruction_zoomable_map from "./assets/img/instruction_zoomable_map.png";

import SubregionMap from "./assets/img/2018_egrid_subregions.png";

function Dialog(props) {
  let table_rows = [],
    table_header,
    modal_body,
    id = props.id;

  if (id === "glossary") {
    table_header = (
      <tr>
        <th>{props.table_header[0]}</th>
        <th>{props.table_header[1]}</th>
      </tr>
    );

    props.table_rows.forEach((r, i) => {
      let row;
      if (i !== props.table_rows.length - 1) {
        row = (
          <tr key={r[0]}>
            <td>{r[0]}</td>
            <td style={{ textAlign: "left" }}>{r[1]}</td>
          </tr>
        );
      } else {
        row = (
          <tr key={r[0]}>
            <td>{r[0]}</td>
            <td style={{ textAlign: "left" }}>{r[1]}</td>
          </tr>
        );
      }

      table_rows.push(row);
    });
  }

  if (id === "instruction") {
    modal_body = (
      <div>
        <p>
          The Emissions &amp; Generation Resource Integrated Database (eGRID)
          contains average annual values of emissions, generation, heat input,
          and emission rates, as well as facility attribute data and a wealth of
          other information for virtually every power plant in the U.S. This
          data is presented in a{" "}
          <a
            href="https://www.epa.gov/egrid/download-data"
            target="_blank"
            rel="noopener noreferrer"
          >
            spreadsheet
          </a>{" "}
          and in this Data Explorer.&nbsp; The queried data are selected with a
          series of dropdown buttons, which are incorporated into a sentence and
          displayed in a responsive map and bar chart. Four dropdowns comprise
          the query sentence: 1) an environmental characteristic, 2) a
          pollutant, 3) a fuel type, and 4) a geographic level.
        </p>
        <img src={instruction_sentence} alt="query sentence" />
        <p>
          To explore the data, change the wording of the query sentence by
          selecting different options from the dropdowns. The map and bar chart
          will immediately change according to the selected variables.
        </p>
        <p>
          <strong>
            <u>Plant-specific data</u>
          </strong>
          <strong>: </strong>To explore data at the plant level, select the
          &ldquo;<u className="select">plant</u>&rdquo; option in the last
          dropdown. Power plants will be displayed by fuel type.&nbsp; Select a
          specific plant to see more information displayed in the accompanying
          table, or filter by one or more fuels by clicking on the fuel types
          immediately above the map.
        </p>
        <img src={instruction_zoomable_map} alt="plant level map" />
        <p>
          <strong>
            <u>Resource Mix</u>
          </strong>
          <strong>:</strong> If viewing the &ldquo;
          <u className="select">Resource mix</u>
          &rdquo; (from the first dropdown), sort the bar graph by clicking the
          fuel types, and select an individual bar to display more information
          in the accompanying table. To view a labeled map of the eGrid
          Subregions, click on the magnifying glass next to the map above the
          bar graph.
        </p>
        <img src={instruction_resourcemix} alt="resource mix" />
      </div>
    );
  } else if (id === "glossary") {
    modal_body = (
      <table>
        <thead>{table_header}</thead>
        <tbody>{table_rows}</tbody>
      </table>
    );
  } else if (id === "no-selected-plant-alert") {
    modal_body = (
      <div>
        <p>Select a plant before downloading table.</p>
      </div>
    );
  } else if (id === "subregion-map") {
    modal_body = (
      <div>
        <img src={SubregionMap} alt="subregion_map" />
      </div>
    );
  }

  return (
    <Modal
      {...props}
      size="lg"
      aria-labelledby="contained-modal-title-vcenter"
      centered
    >
      <Modal.Header closeButton>
        {props.name !== "" && (
          <Modal.Title id="contained-modal-title-vcenter">
            {props.name}
          </Modal.Title>
        )}
      </Modal.Header>
      <Modal.Body>{modal_body}</Modal.Body>
      <Modal.Footer>
        <input
          type="button"
          onClick={props.onHide}
          value="Close"
          className="btn-tertiary"
        />
      </Modal.Footer>
    </Modal>
  );
}

export default Dialog;
