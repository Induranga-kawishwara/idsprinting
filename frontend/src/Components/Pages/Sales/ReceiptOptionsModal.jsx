// ReceiptOptionsModal.jsx
import React from "react";
import { Modal, Button } from "@mui/material";

const ReceiptOptionsModal = ({
  isOpen,
  onClose,
  downloadReceipt,
  printReceipt,
  shareReceipt,
}) => {
  return (
    <Modal open={isOpen} onClose={onClose}>
      <div className="modal-dialog modal-dialog-centered custom-modal-dialog">
        <div className="modal-content custom-modal-content">
          <div className="modal-header">
            <h5 className="modal-title">Receipt Options</h5>
            <Button
              type="button"
              className="btn-close"
              aria-label="Close"
              onClick={onClose}
            />
          </div>
          <div className="modal-body">
            <p>What would you like to do with the receipt?</p>
            <div className="d-flex justify-content-end">
              <Button
                variant="contained"
                onClick={downloadReceipt}
                className="download-btn me-2"
              >
                Download PDF
              </Button>
              <Button
                variant="contained"
                onClick={printReceipt}
                className="print-btn me-2"
              >
                Print Receipt
              </Button>
              <Button
                variant="contained"
                onClick={shareReceipt}
                className="share-btn me-2"
              >
                Share
              </Button>
              <Button
                variant="contained"
                onClick={onClose}
                className="close-btn"
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default ReceiptOptionsModal;
