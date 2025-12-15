import React from "react";
import "../../styles/loading.css";

export const LoadingButton = ({ isLoading, children, className = "", ...props }) => {
  return (
    <button
      {...props}
      className={`loading-button ${className}`}
      disabled={isLoading || props.disabled}
    >
      {children}
    </button>
  );
};

export const LoadingTable = () => (
  <div className="loading-table">
    <div className="loading-skeleton skeleton-row"></div>
    <div className="loading-skeleton skeleton-row"></div>
    <div className="loading-skeleton skeleton-row"></div>
    <div className="loading-skeleton skeleton-row"></div>
    <div className="loading-skeleton skeleton-row"></div>
  </div>
);