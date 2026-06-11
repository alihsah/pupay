import { useEffect, useState } from "react";
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
import { useCurrentUser } from "../../hooks/useCurrentUser";

import { SummaryCard, Toast } from "../../components/ui";

import "../../styles/pages/student/Dashboard.css";

function StudentDashboard() {
  const { currentUser, loading: userLoading } = useCurrentUser();

  const [collections, setCollections] = useState([]);
  const [payments, setPayments] = useState([]);
  const [announcements, setAnnouncements] = useState([]);

  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");

  const loadDashboardData = async () => {
    if (!currentUser?.studentId) return;

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
    if (!userLoading && currentUser?.studentId) {
      loadDashboardData();
    }
  }, [userLoading, currentUser?.studentId]);

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

  const totalCollections = collections.length;
  const pendingPayments = payments.filter((payment) => payment.status === "pending").length;
  const paidPayments = payments.filter((payment) => payment.status === "paid").length;
  const overduePayments = payments.filter((payment) => payment.status === "overdue").length;

  const recentAnnouncements = announcements.slice(0, 4);
  const upcomingCollections = collections.slice(0, 4);

  if (userLoading || loading) {
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
            <h3>Upcoming Collections</h3>
            <p>Collections currently assigned to your section.</p>
          </div>

          <div className="student-dashboard-list">
            {upcomingCollections.map((collection) => (
              <article className="student-dashboard-list-item" key={collection.id}>
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
            <h3>Recent Announcements</h3>
            <p>Latest reminders and updates from the treasurer.</p>
          </div>

          <div className="student-dashboard-list">
            {recentAnnouncements.map((announcement) => (
              <article className="student-dashboard-list-item" key={announcement.id}>
                <div>
                  <strong>{announcement.title}</strong>
                  <span>{announcement.message}</span>
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
    </main>
  );
}

export default StudentDashboard;