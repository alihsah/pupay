import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  WalletCards,
  Clock,
  CheckCircle,
  AlertTriangle,
  Megaphone,
} from "lucide-react";

import { getMyCollections } from "../../services/collectionService";
import { getStudentPayments } from "../../services/paymentService";
import { getMyAnnouncements } from "../../services/announcementService";
import { markNotificationRead } from "../../services/notificationService";
import { useCurrentUser } from "../../hooks/useCurrentUser";

import { AnnouncementDetailsModal } from "../../components/announcements";
import { SummaryCard, Toast } from "../../components/ui";

import "../../styles/pages/student/Dashboard.css";

function StudentDashboard() {
  const navigate = useNavigate();
  const { currentUser, loadingUser } = useCurrentUser();

  const [collections, setCollections] = useState([]);
  const [payments, setPayments] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [selectedAnnouncement, setSelectedAnnouncement] = useState(null);

  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");

  const loadDashboardData = async () => {
    if (!currentUser?.studentId) {
      setCollections([]);
      setPayments([]);
      setAnnouncements([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);

      const [collectionData, paymentData, announcementData] =
        await Promise.all([
          getMyCollections(),
          getStudentPayments(currentUser.studentId),
          getMyAnnouncements(),
        ]);

      setCollections(collectionData);
      setPayments(paymentData);
      setAnnouncements(announcementData);
    } catch (error) {
      setMessage(error.response?.data?.message || "Failed to load dashboard.");
      setMessageType("error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!loadingUser) {
      loadDashboardData();
    }
  }, [loadingUser, currentUser?.studentId]);

  const formatCurrency = (amount) => {
    return Number(amount || 0).toLocaleString("en-PH", {
      style: "currency",
      currency: "PHP",
    });
  };

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

  const markLocalAnnouncementRead = (announcementId) => {
    const readAt = new Date().toISOString();

    setAnnouncements((currentAnnouncements) =>
      currentAnnouncements.map((announcement) =>
        announcement.id === announcementId
          ? { ...announcement, is_read: true, read_at: announcement.read_at || readAt }
          : announcement
      )
    );

    setSelectedAnnouncement((currentAnnouncement) =>
      currentAnnouncement?.id === announcementId
        ? {
            ...currentAnnouncement,
            is_read: true,
            read_at: currentAnnouncement.read_at || readAt,
          }
        : currentAnnouncement
    );
  };

  const openAnnouncementDetails = async (announcement) => {
    setSelectedAnnouncement(announcement);

    if (announcement.is_read) return;

    try {
      await markNotificationRead(announcement.id);
      markLocalAnnouncementRead(announcement.id);
      window.dispatchEvent(new Event("pupay:notifications-updated"));
    } catch (error) {
      setMessage(
        error.response?.data?.message || "Failed to mark announcement as read."
      );
      setMessageType("error");
    }
  };

  const handleKeyboardAction = (event, action) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      action();
    }
  };

  const totalCollections = collections.length;
  const pendingPayments = payments.filter((payment) => payment.status === "pending").length;
  const paidPayments = payments.filter((payment) => payment.status === "paid").length;
  const overduePayments = payments.filter((payment) => payment.status === "overdue").length;

  const recentAnnouncements = announcements.slice(0, 4);
  const upcomingCollections = collections.slice(0, 4);

  if (loadingUser || loading) {
    return (
      <main className="student-dashboard-page">
        <p>Loading dashboard...</p>
      </main>
    );
  }

  return (
    <main className="student-dashboard-page">
      <Toast
        message={message}
        type={messageType}
        onClose={() => {
          setMessage("");
          setMessageType("");
        }}
      />

      <section className="student-dashboard-welcome">
        <div>
          <h2>Welcome back, {currentUser?.fullName || "Student"}</h2>
          <p>
            Track your assigned collections, payment status, and latest reminders.
          </p>
        </div>
      </section>

      <section className="student-dashboard-stat-grid">
        <SummaryCard
          title="My Collections"
          value={totalCollections}
          icon={WalletCards}
          note="Active assigned collections"
        />

        <SummaryCard
          title="Pending"
          value={pendingPayments}
          icon={Clock}
          note="Payments not yet settled"
        />

        <SummaryCard
          title="Paid"
          value={paidPayments}
          icon={CheckCircle}
          note="Completed payments"
        />

        <SummaryCard
          title="Overdue"
          value={overduePayments}
          icon={AlertTriangle}
          note="Needs attention"
        />

        <SummaryCard
          title="Announcements"
          value={announcements.length}
          icon={Megaphone}
          note="Active updates for you"
        />
      </section>

      <section className="student-dashboard-two-column">
        <div className="student-dashboard-panel">
          <div className="student-dashboard-panel-header">
            <div>
              <h3>Upcoming Collections</h3>
              <p>Collections currently assigned to your section.</p>
            </div>

            <button
              className="student-dashboard-view-all"
              type="button"
              onClick={() => navigate("/student/collections")}
            >
              View All
            </button>
          </div>

          <div className="student-dashboard-list">
            {upcomingCollections.map((collection) => (
              <article
                className="student-dashboard-list-item clickable"
                key={collection.id}
                role="button"
                tabIndex={0}
                onClick={() => navigate("/student/collections")}
                onKeyDown={(event) =>
                  handleKeyboardAction(event, () => navigate("/student/collections"))
                }
              >
                <div>
                  <strong>{collection.title}</strong>
                  <span>Due: {formatDate(collection.due_date)}</span>
                </div>

                <div className="student-dashboard-list-meta">
                  <strong>{formatCurrency(collection.amount)}</strong>
                  <span className={`status-pill ${collection.status}`}>
                    {collection.status}
                  </span>
                </div>
              </article>
            ))}

            {upcomingCollections.length === 0 && (
              <p className="student-dashboard-empty">
                No active collections assigned to you yet.
              </p>
            )}
          </div>
        </div>

        <div className="student-dashboard-panel">
          <div className="student-dashboard-panel-header">
            <div>
              <h3>Recent Announcements</h3>
              <p>Latest reminders and updates from the treasurer.</p>
            </div>

            <button
              className="student-dashboard-view-all"
              type="button"
              onClick={() => navigate("/student/announcements")}
            >
              View All
            </button>
          </div>

          <div className="student-dashboard-list">
            {recentAnnouncements.map((announcement) => (
              <article
                className={`student-dashboard-list-item clickable ${
                  announcement.is_read ? "" : "unread"
                }`}
                key={announcement.id}
                role="button"
                tabIndex={0}
                onClick={() => openAnnouncementDetails(announcement)}
                onKeyDown={(event) =>
                  handleKeyboardAction(event, () => openAnnouncementDetails(announcement))
                }
              >
                <div>
                  <strong>{announcement.title}</strong>
                  <span className="student-dashboard-preview">
                    {announcement.message}
                  </span>
                </div>

                <div className="student-dashboard-list-meta">
                  <span className={`announcement-type-pill ${announcement.type}`}>
                    {announcement.type.replace("_", " ")}
                  </span>
                </div>
              </article>
            ))}

            {recentAnnouncements.length === 0 && (
              <p className="student-dashboard-empty">
                No announcements available yet.
              </p>
            )}
          </div>
        </div>
      </section>

      <AnnouncementDetailsModal
        announcement={selectedAnnouncement}
        formatDate={formatDate}
        formatType={formatType}
        onClose={() => setSelectedAnnouncement(null)}
      />
    </main>
  );
}

export default StudentDashboard;
