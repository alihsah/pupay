import { useEffect, useState } from "react";

import { getMyAnnouncements } from "../../services/announcementService";
import { Toast } from "../../components/ui";

import "../../styles/pages/student/Notifications.css";

function StudentNotifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");

  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [sortOption, setSortOption] = useState("newest");

  const loadNotifications = async (showPageLoading = true) => {
    try {
      if (showPageLoading) {
        setLoading(true);
      }

      const data = await getMyAnnouncements();
      setNotifications(data);
    } catch (error) {
      setMessage(
        error.response?.data?.message || "Failed to load notifications."
      );
      setMessageType("error");
    } finally {
      if (showPageLoading) {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    loadNotifications(true);
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
    if (!type) return "General";

    return type
      .replace("_", " ")
      .replace(/\b\w/g, (letter) => letter.toUpperCase());
  };

  const filteredNotifications = notifications
    .filter((notification) => {
      const searchValue = searchTerm.toLowerCase();

      const matchesSearch =
        notification.title?.toLowerCase().includes(searchValue) ||
        notification.message?.toLowerCase().includes(searchValue);

      const matchesType =
        typeFilter === "all" || notification.type === typeFilter;

      return matchesSearch && matchesType;
    })
    .sort((a, b) => {
      if (sortOption === "oldest") {
        return new Date(a.created_at) - new Date(b.created_at);
      }

      if (sortOption === "title-az") {
        return a.title.localeCompare(b.title);
      }

      return new Date(b.created_at) - new Date(a.created_at);
    });

  return (
    <main className="student-notifications-page">
      <Toast
        message={message}
        type={messageType}
        onClose={() => {
          setMessage("");
          setMessageType("");
        }}
      />

      <section className="student-notifications-panel">
        <div className="student-notifications-header">
          <div>
            <h2>Notifications</h2>
            <p>View payment reminders, collection updates, and school notices.</p>
          </div>
        </div>

        <div className="student-notifications-toolbar">
          <div className="filter-group search-group">
            <label>Search</label>
            <input
              type="text"
              placeholder="Search notifications..."
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
            />
          </div>

          <div className="student-notification-filters">
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
              </select>
            </div>
          </div>
        </div>

        {loading ? (
          <p>Loading notifications...</p>
        ) : (
          <div className="student-notification-list">
            {filteredNotifications.map((notification) => (
              <article className="student-notification-card" key={notification.id}>
                <div className="student-notification-card-main">
                  <div>
                    <h3>{notification.title}</h3>
                    <p>{notification.message}</p>
                  </div>

                  <span className={`notification-type-pill ${notification.type}`}>
                    {formatType(notification.type)}
                  </span>
                </div>

                <div className="student-notification-meta">
                  <span>Posted {formatDate(notification.created_at)}</span>
                </div>
              </article>
            ))}

            {filteredNotifications.length === 0 && (
              <div className="student-notifications-empty">
                <h3>No notifications found</h3>
                <p>You do not have matching notifications yet.</p>
              </div>
            )}
          </div>
        )}
      </section>
    </main>
  );
}

export default StudentNotifications;