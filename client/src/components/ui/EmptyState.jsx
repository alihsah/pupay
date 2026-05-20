import { Inbox } from "lucide-react";
import "../../styles/components/ui/EmptyState.css";

function EmptyState({
  title = "No data found",
  message = "There is no information to display yet.",
  icon: Icon = Inbox,
}) {
  return (
    <div className="empty-state">
      <div className="empty-state-icon">
        <Icon size={26} />
      </div>

      <h3>{title}</h3>
      <p>{message}</p>
    </div>
  );
}

export default EmptyState;