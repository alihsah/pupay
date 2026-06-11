import { useEffect, useState } from "react";

import { getMyAnnouncements } from "../../services/announcementService";
import { Toast } from "../../components/ui";

import "../../styles/pages/student/Announcements.css";

function StudentAnnouncements() {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);

  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");

  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [sortOption, setSortOption] = useState("newest");

  const loadAnnouncements = async () => {
    try {
      setLoading(true);
      const data = await getMyAnnouncements();
      setAnnouncements(data);
    } catch (error) {
      setMessage(error.response?.data?.message || "Failed to load announcements.");
      setMessageType("error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAnnouncements();
  }, []);

  const formatDate = (date) => {
    if (!date) return "N/A";

    return new Date(date).toLocaleDateString("en-PH", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatType = (type) => {
    if (type === "payment_reminder") return "Payment Reminder";
    if (type === "deadline") return "Deadline";
    return "General";
  };

  const filteredAnnouncements = announcements
    .filter((announcement) => {
      const searchValue = searchTerm.toLowerCase();

      const matchesSearch =
        announcement.title?.toLowerCase().includes(searchValue) ||
        announcement.message?.toLowerCase().includes(searchValue);

      const matchesType =
        typeFilter === "all" || announcement.type === typeFilter;

      return matchesSearch && matchesType;
    })
    .sort((a, b) => {
      if (sortOption === "oldest") {
        return new Date(a.created_at) - new Date(b.created_at);
      }

      if (sortOption === "title-az") {
        return a.title.localeCompare(b.title);
      }

      if (sortOption === "title-za") {
        return b.title.localeCompare(a.title);
      }

      return new Date(b.created_at) - new Date(a.created_at);
    });

  const totalAnnouncements = announcements.length;
  const reminders = announcements.filter(
    (announcement) => announcement.type === "payment_reminder"
  ).length;
  const deadlines = announcements.filter(
    (announcement) => announcement.type === "deadline"
  ).length;

  return (
    <main className="student-announcements-page">
      <Toast
        message={message}
        type={messageType}
        onClose={() => {
          setMessage("");
          setMessageType("");
        }}
      />

      <section className="student-announcement-summary-grid">
        <article className="student-announcement-card">
          <span>Total Announcements</span>
          <strong>{totalAnnouncements}</strong>
        </article>

        <article className="student-announcement-card">
          <span>Payment Reminders</span>
          <strong>{reminders}</strong>
        </article>

        <article className="student-announcement-card">
          <span>Deadlines</span>
          <strong>{deadlines}</strong>
        </article>
      </section>

      <section className="student-announcements-panel">
        <div className="student-announcements-header">
          <div>
            <h2>Announcements</h2>
            <p>View payment reminders, deadlines, and school updates assigned to you.</p>
          </div>
        </div>

        <div className="student-announcements-toolbar">
          <div className="filter-group search-group">
            <label>Search</label>
            <input
              type="text"
              placeholder="Search announcements..."
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
            />
          </div>

          <div className="filter-group">
            <label>Type</label>
            <select
              value={typeFilter}
              onChange={(event) => setTypeFilter(event.target.value)}
            >
              <option value="all">All Types</option>
              <option value="general">General</option>
              <option value="payment_reminder">Payment Reminder</option>
              <option value="deadline">Deadline</option>
            </select>
          </div>

          <div className="filter-group">
            <label>Sort By</label>
            <select
              value={sortOption}
              onChange={(event) => setSortOption(event.target.value)}
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="title-az">Title A-Z</option>
              <option value="title-za">Title Z-A</option>
            </select>
          </div>
        </div>

        {loading ? (
          <p>Loading announcements...</p>
        ) : (
          <div className="student-announcement-list">
            {filteredAnnouncements.map((announcement) => (
              <article className="student-announcement-item" key={announcement.id}>
                <div className="student-announcement-main">
                  <div className="student-announcement-title-row">
                    <h3>{announcement.title}</h3>

                    <span className={`announcement-type-pill ${announcement.type}`}>
                      {formatType(announcement.type)}
                    </span>
                  </div>

                  <p>{announcement.message}</p>
                </div>

                <div className="student-announcement-footer">
                  <span>Posted {formatDate(announcement.created_at)}</span>
                  <span className={`status-pill ${announcement.status}`}>
                    {announcement.status}
                  </span>
                </div>
              </article>
            ))}

            {filteredAnnouncements.length === 0 && (
              <div className="student-announcements-empty">
                <h3>No announcements found</h3>
                <p>No active announcements match your current filter.</p>
              </div>
            )}
          </div>
        )}
      </section>
    </main>
  );
}

export default StudentAnnouncements;