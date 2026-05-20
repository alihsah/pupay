import "../../styles/components/ui/Input.css";

function Input({ label, error, className = "", id, ...props }) {
  return (
    <div className="input-group">
      {label && <label htmlFor={id}>{label}</label>}

      <input
        id={id}
        className={`input-field ${error ? "input-error" : ""} ${className}`}
        {...props}
      />

      {error && <small className="input-error-message">{error}</small>}
    </div>
  );
}

export default Input;