import "../../styles/components/ui/SummaryCard.css";

function SummaryCard({ title, value, icon: Icon, note }) {
  return (
    <article className="summary-card">
      <div className="summary-card-header">
        <div>
          <span>{title}</span>
          <strong>{value}</strong>
        </div>

        {Icon && (
          <div className="summary-card-icon">
            <Icon size={22} />
          </div>
        )}
      </div>

      {note && <small>{note}</small>}
    </article>
  );
}

export default SummaryCard;