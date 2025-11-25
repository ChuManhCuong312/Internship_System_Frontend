import React from "react";
import "../../styles/loading.css";

export const LoadingSpinner = ({ size = "medium", fullScreen = false }) => {
  const sizeClass = `spinner-${size}`;
  
  if (fullScreen) {
    return (
      <div className="loading-overlay">
        <div className={`spinner ${sizeClass}`}></div>
      </div>
    );
  }

  return <div className={`spinner ${sizeClass}`}></div>;
};

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