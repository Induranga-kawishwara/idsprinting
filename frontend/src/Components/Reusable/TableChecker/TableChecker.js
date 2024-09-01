import React from "react";
import SyncLoader from "react-spinners/SyncLoader";
import _ from "lodash";
import "./TableChecker.scss";

const TableChecker = ({ loading, error, data }) => {
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

  if (_.isEmpty(data)) {
    return (
      <div className="message-container">
        <p className="no-data-message">Don't Have Data to Show</p>
      </div>
    );
  }

  return null;
};

export default TableChecker;
