import { useEffect, useState } from "react";
import "../../styles/components/ui/Toast.css";

function Toast({ message, type = "success", onClose, duration = 5000 }) {
  const [isLeaving, setIsLeaving] = useState(false);

  useEffect(() => {
    if (!message) return;

    setIsLeaving(false);

    const leaveTimer = setTimeout(() => {
      setIsLeaving(true);
    }, duration - 350);

    const closeTimer = setTimeout(() => {
      onClose();
    }, duration);

    return () => {
      clearTimeout(leaveTimer);
      clearTimeout(closeTimer);
    };
  }, [message, duration, onClose]);

  if (!message) return null;

  return (
    <div className={`toast toast-${type} ${isLeaving ? "toast-leaving" : ""}`}>
      <span>{message}</span>

      <button type="button" onClick={onClose}>
        ×
      </button>
    </div>
  );
}

export default Toast;