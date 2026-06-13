import { Modal } from "../ui";
import "../../styles/components/announcements/AnnouncementDetailsModal.css";

function AnnouncementDetailsModal({
  announcement,
  formatAudience,
  formatDate,
  formatType,
  onClose,
  showAudience = false,
  showStatus = false,
}) {
  if (!announcement) return null;

  const typeLabel =
    typeof formatType === "function"
      ? formatType(announcement.type)
      : announcement.type?.replace("_", " ") || "General";

  const audienceLabel =
    typeof formatAudience === "function" ? formatAudience(announcement) : "";

  return (
    <Modal
      title={announcement.title}
      subtitle={`Posted ${formatDate(announcement.created_at)}`}
      onClose={onClose}
    >
      <div className="announcement-details-modal">
        <div className="announcement-details-meta">
          <span className={`announcement-type-pill ${announcement.type}`}>
            {typeLabel}
          </span>

          {showStatus && announcement.status && (
            <span className={`announcement-status-pill ${announcement.status}`}>
              {announcement.status}
            </span>
          )}
        </div>

        {(showAudience || announcement.created_at || announcement.read_at) && (
          <div className="announcement-details-grid">
            {showAudience && audienceLabel && (
              <div className="announcement-detail-item">
                <span>Audience</span>
                <strong>{audienceLabel}</strong>
              </div>
            )}

            <div className="announcement-detail-item">
              <span>Created</span>
              <strong>{formatDate(announcement.created_at)}</strong>
            </div>

            {announcement.read_at && (
              <div className="announcement-detail-item">
                <span>Read</span>
                <strong>{formatDate(announcement.read_at)}</strong>
              </div>
            )}
          </div>
        )}

        <p>{announcement.message}</p>
      </div>
    </Modal>
  );
}

export default AnnouncementDetailsModal;
