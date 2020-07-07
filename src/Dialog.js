import React from "react";
import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button";

function Dialog(props) {
  let table_rows = [],
    table_header,
    list = [], text = [];

  if (props.is_table === "true") {
    table_header = (
      <tr>
        <th style={{ fontSize: "1.1em", width: 250, textAlign: "center" }}>
          {props.table_header[0]}
        </th>
        <th style={{ fontSize: "1.1em", textAlign: "center" }}>
          {props.table_header[1]}
        </th>
      </tr>
    );

    props.table_rows.forEach((r) => {
      let row = (
        <tr key={r[0]}>
          <td style={{ textAlign: "center" }}>{r[0]}</td>
          <td style={{ fontWeight: "normal", textAlign: "center" }}>{r[1]}</td>
        </tr>
      );
      table_rows.push(row);
    });
  } else {
    props.text.list.forEach((l, i) => {
      list.push(<li key={i}>{l}</li>);
    });
    props.text.text.forEach((t, i) => {
      text.push(<p key={i}>{t}</p>);
    });
  }

  return (
    <Modal
      {...props}
      size="lg"
      aria-labelledby="contained-modal-title-vcenter"
      centered
    >
      <Modal.Header closeButton>
        <Modal.Title id="contained-modal-title-vcenter">
          {props.title}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {props.is_table === "true" ? (
          <table style={{ fontSize: "1.2em" }}>
            <thead>{table_header}</thead>
            <tbody>{table_rows}</tbody>
          </table>
        ) : (
          <div style={{ fontSize: "1.2em" }}>
            {text}
            <ul>{list}</ul>
          </div>
        )}
        {props.has_image === "true" && (
          <img src={props.text.image} alt='subregion_map' style={{width:'100%'}}/>
        )}
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={props.onHide}>
          Close
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

export default Dialog;
