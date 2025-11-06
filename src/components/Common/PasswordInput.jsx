import React, { useState } from "react";

const PasswordInput = ({ value, onChange, placeholder, name, required = false, disabled = false }) => {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="password-wrapper">
      <input
        type={showPassword ? "text" : "password"}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="form-input"
        required={required}
        disabled={disabled}
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
