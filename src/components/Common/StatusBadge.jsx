import React from "react";
import "../../styles/badges.css";

const StatusBadge = ({ status }) => {
  const className = `status-badge status-${status.replace(/\s/g, "-").toLowerCase()}`;
  return <span className={className}>{status}</span>;
};

export default StatusBadge;
