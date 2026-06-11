function AnnouncementTable({
  announcements,
  onEdit,
  onArchive,
  onRestore,
  formatAudience,
  formatDate,
}) {
  return (
    <div className="announcements-table-wrap">
      <table className="announcements-table">
        <thead>
          <tr>
            <th>Announcement</th>
            <th>Type</th>
            <th>Audience</th>
            <th>Status</th>
            <th>Created</th>
            <th>Actions</th>
          </tr>
        </thead>

        <tbody>
          {announcements.map((announcement) => (
            <tr key={announcement.id}>
              <td>
                <span>{announcement.title}</span>
                <small>{announcement.message}</small>
              </td>

              <td>{announcement.type.replace("_", " ")}</td>

              <td>{formatAudience(announcement)}</td>

              <td>
                <span className={`status-pill ${announcement.status}`}>
                  {announcement.status}
                </span>
              </td>

              <td>{formatDate(announcement.created_at)}</td>

              <td>
                <div className="announcements-actions">
                  <button type="button" onClick={() => onEdit(announcement)}>
                    Edit
                  </button>

                  {announcement.status === "active" ? (
                    <button type="button" onClick={() => onArchive(announcement)}>
                      Archive
                    </button>
                  ) : (
                    <button type="button" onClick={() => onRestore(announcement)}>
                      Restore
                    </button>
                  )}
                </div>
              </td>
            </tr>
          ))}

          {announcements.length === 0 && (
            <tr>
              <td colSpan="6">No announcements found.</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

export default AnnouncementTable;