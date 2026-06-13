import { Modal } from "../ui";
import "../../styles/components/announcements/AnnouncementDetailsModal.css";

function AnnouncementDetailsModal({ announcement, formatDate, formatType, onClose }) {
  if (!announcement) return null;

  return (
    <Modal
      title={announcement.title}
      subtitle={`Posted ${formatDate(announcement.created_at)}`}
      onClose={onClose}
    >
      <div className="announcement-details-modal">
        <div className="announcement-details-meta">
          <span className={`announcement-type-pill ${announcement.type}`}>
            {formatType(announcement.type)}
          </span>

          {announcement.read_at && (
            <span className="announcement-read-label">
              Read {formatDate(announcement.read_at)}
            </span>
          )}
        </div>

        <p>{announcement.message}</p>
      </div>
    </Modal>
  );
}

export default AnnouncementDetailsModal;
