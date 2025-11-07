import React, { useState } from "react";
import "../../styles/toggle.css";

const PasswordInput = ({ name, value, onChange, placeholder }) => {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="password-wrapper">
      <input
        type={showPassword ? "text" : "password"}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder || "••••••••"}
        className="form-input"
      />
      <span
        className={`toggle-icon ${showPassword ? "active" : ""}`}
        onClick={() => setShowPassword(!showPassword)}
      >
        👁
      </span>
    </div>
  );
};

export default PasswordInput;
