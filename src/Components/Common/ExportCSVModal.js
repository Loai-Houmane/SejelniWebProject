import PropTypes from "prop-types";
import React from "react";
import { Modal, ModalBody, ModalHeader } from "reactstrap";
import CsvDownloader from "react-csv-downloader";

const ExportCSVModal = ({ show, onCloseClick, headers, data, filename }) => {
  return (
    <Modal isOpen={show} toggle={onCloseClick} centered={true}>
      <ModalHeader toggle={onCloseClick}></ModalHeader>
      <ModalBody className="py-3 px-5">
        <div className="mt-2 text-center">
          <lord-icon
            src="https://cdn.lordicon.com/nocovwne.json"
            trigger="loop"
            colors="primary:#0ab39c,secondary:#f06548"
            style={{ width: "100px", height: "100px" }}
          ></lord-icon>
          <div className="mt-4 pt-2 fs-15 mx-4 mx-sm-5">
            <h4>Êtes-vous sûr ?</h4>
            <p className="text-muted mx-4 mb-0">
            Êtes-vous sûr de vouloir exporter le fichier CSV ?
            </p>
          </div>
        </div>
        <div className="d-flex gap-2 justify-content-center mt-4 mb-2">
          <button
            type="button"
            className="btn w-sm btn-light"
            data-bs-dismiss="modal"
            onClick={onCloseClick}
          >
            Fermer  
          </button>
          <CsvDownloader
            onClick={onCloseClick}
            datas={data}
            filename={filename}
            extension=".csv"
            separator=";"
            columns={headers}
            text="TÉLÉCHARGER"
            className="btn w-sm btn-success "
            id="delete-record"
            type="button"
          />
        </div>
      </ModalBody>
    </Modal>
  );
};

ExportCSVModal.propTypes = {
  onCloseClick: PropTypes.func,
  data: PropTypes.any,
  show: PropTypes.any,
};

export default ExportCSVModal;
