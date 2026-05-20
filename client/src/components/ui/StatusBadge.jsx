import "../../styles/components/ui/StatusBadge.css";

function StatusBadge({ status }) {
  const formattedStatus = status?.toLowerCase() || "pending";

  return (
    <span className={`status-badge ${formattedStatus}`}>
      {status}
    </span>
  );
}

export default StatusBadge;