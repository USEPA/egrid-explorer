import React from "react";
import Modal from "react-bootstrap/Modal";

function Dialog(props) {
  let table_rows = [],
    table_header,
    list = [],
    text = [];

  if (props.is_table === "true") {
    table_header = (
      <tr>
        <th>{props.table_header[0]}</th>
        <th>{props.table_header[1]}</th>
      </tr>
    );

    props.table_rows.forEach((r, i) => {
      let row;
      if (i != props.table_rows.length - 1) {
        row = (
          <tr key={r[0]}>
            <td>{r[0]}</td>
            <td>{r[1]}</td>
          </tr>
        );
      } else {
        row = (
          <tr key={r[0]}>
            <td>{r[0]}</td>
            <td>{r[1]}</td>
          </tr>
        );
      }

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
        {props.title !== "" && (
          <Modal.Title id="contained-modal-title-vcenter">
            {props.title}
          </Modal.Title>
        )}
      </Modal.Header>
      <Modal.Body>
        {props.is_table === "true" ? (
          <table>
            <thead>{table_header}</thead>
            <tbody>{table_rows}</tbody>
          </table>
        ) : (
          <div>
            {text}
            <ul>{list}</ul>
          </div>
        )}
        {props.has_image === "true" && (
          <img src={props.text.image} alt="subregion_map" />
        )}
      </Modal.Body>
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
