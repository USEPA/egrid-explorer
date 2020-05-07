import React from "react";
import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button";

function Dialog(props) {
  return (
    <Modal
      {...props}
      size="lg"
      aria-labelledby="contained-modal-title-vcenter"
      centered
    >
      <Modal.Header closeButton>
        <Modal.Title id="contained-modal-title-vcenter">
          Use Instruction
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <p>
          Use the drop down arrows to query the data you would like to view. You
          can change the main data displayed (emission rates, generation, etc.),
          the pollutant type (CO2, NOx, etc.), the fuel type (coal, gas, etc.),
          and the geographic representation (state, eGRID subregion, plant,
          etc.), where applicable. Note that non-baseload emission rates and
          non-baseload generation are not available at the plant level.
        </p>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={props.onHide}>Close</Button>
      </Modal.Footer>
    </Modal>
  );
}

export default Dialog;
