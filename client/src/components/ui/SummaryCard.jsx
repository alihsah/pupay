import "../../styles/components/ui/SummaryCard.css";

function SummaryCard({ title, value, icon: Icon, note }) {
  return (
    <div className="summary-card">
      <div className="summary-card-header">
        <div>
          <p>{title}</p>
          <h3>{value}</h3>
        </div>

        {Icon && (
          <div className="summary-card-icon">
            <Icon size={22} />
          </div>
        )}
      </div>

      {note && <span>{note}</span>}
    </div>
  );
}

export default SummaryCard;