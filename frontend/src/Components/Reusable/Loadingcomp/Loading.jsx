import React from "react";
import CircularProgress from "@mui/material/CircularProgress";
import "./Loading.scss"; // Optional: if you want to add custom styles

const Loading = () => {
  return (
    <div className="loading-container">
      <CircularProgress />
      <p>Loading, please wait...</p>
    </div>
  );
};

export default Loading;
