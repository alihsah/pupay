import "../../styles/components/ui/Select.css";

function Select({ label, id, error, children, className = "", ...props }) {
  return (
    <div className="select-group">
      {label && <label htmlFor={id}>{label}</label>}

      <select
        id={id}
        className={`select-field ${error ? "select-error" : ""} ${className}`}
        {...props}
      >
        {children}
      </select>

      {error && <small className="select-error-message">{error}</small>}
    </div>
  );
}

export default Select;