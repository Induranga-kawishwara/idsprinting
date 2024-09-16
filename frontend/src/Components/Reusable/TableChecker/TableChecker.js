import React from "react";
import SyncLoader from "react-spinners/SyncLoader";
import "./TableChecker.scss";

const TableChecker = ({ loading, error, hasData }) => {
  if (loading) {
    return (
      <div className="message-container">
        <SyncLoader />
      </div>
    );
  }

  if (error) {
    return (
      <div className="message-container">
        <p className="error-message">Error loading data: {error.message}</p>
      </div>
    );
  }

  if (!hasData) {
    return (
      <div className="message-container">
        <p className="no-data-message">Don't Have Data to Show</p>
      </div>
    );
  }

  return null;
};

export default TableChecker;
