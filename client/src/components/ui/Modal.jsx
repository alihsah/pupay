import "../../styles/components/ui/Modal.css";

function Modal({ title, subtitle, children, onClose }) {
  return (
    <div className="modal-overlay">
      <div className="app-modal">
        <div className="modal-header">
          <div>
            <h2>{title}</h2>
            {subtitle && <p>{subtitle}</p>}
          </div>

          <button className="modal-close-btn" type="button" onClick={onClose}>
            ×
          </button>
        </div>

        {children}
      </div>
    </div>
  );
}

export default Modal;