import { useEffect, useState } from "react";

import {
  WalletCards,
  Clock,
  CheckCircle,
  Users,
  Megaphone,
  AlertTriangle,
} from "lucide-react";

import { SummaryCard } from "../../components/ui";

import { getStudents } from "../../services/studentService";
import { getCollections } from "../../services/collectionService";
import { getPayments } from "../../services/paymentService";
import { getAnnouncements } from "../../services/announcementService";

import { Toast } from "../../components/ui";

import "../../styles/pages/admin/Dashboard.css";

function AdminDashboard() {
  const [students, setStudents] = useState([]);
  const [collections, setCollections] = useState([]);
  const [payments, setPayments] = useState([]);
  const [announcements, setAnnouncements] = useState([]);

  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");

  const loadDashboardData = async () => {
    try {
      setLoading(true);

      const [studentData, collectionData, paymentData, announcementData] =
        await Promise.all([
          getStudents(),
          getCollections(),
          getPayments(),
          getAnnouncements(),
        ]);

      setStudents(studentData);
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
    loadDashboardData();
  }, []);

  const formatCurrency = (amount) => {
    return Number(amount || 0).toLocaleString("en-PH", {
      style: "currency",
      currency: "PHP",
    });
  };

  const totalStudents = students.length;
  const activeStudents = students.filter((student) => student.status === "active").length;

  const activeCollections = collections.filter(
    (collection) => collection.status === "active"
  ).length;

  const pendingPayments = payments.filter((payment) => payment.status === "pending").length;
  const paidPayments = payments.filter((payment) => payment.status === "paid").length;
  const overduePayments = payments.filter((payment) => payment.status === "overdue").length;

  const totalCollected = payments
    .filter((payment) => payment.status === "paid")
    .reduce((sum, payment) => sum + Number(payment.amount_paid || 0), 0);

  const activeAnnouncements = announcements.filter(
    (announcement) => announcement.status === "active"
  ).length;

  const recentPayments = [...payments].slice(0, 5);
  const recentCollections = [...collections].slice(0, 5);

  if (loading) {
    return (
      <main className="admin-dashboard-page">
        <p>Loading dashboard...</p>
      </main>
    );
  }

  return (
    <main className="admin-dashboard-page">
      <Toast
        message={message}
        type={messageType}
        onClose={() => {
          setMessage("");
          setMessageType("");
        }}
      />

      <section className="dashboard-welcome-card">
        <div>
          <h2>Welcome back, Treasurer</h2>
          <p>
            Monitor student records, collections, payments, and announcements in one place.
          </p>
        </div>

        <strong>{formatCurrency(totalCollected)}</strong>
      </section>

      <section className="dashboard-stat-grid">
        <SummaryCard
          title="Total Students"
          value={totalStudents}
          icon={Users}
          note={`${activeStudents} active students`}
        />

        <SummaryCard
          title="Active Collections"
          value={activeCollections}
          icon={WalletCards}
          note={`${collections.length} total collections`}
        />

        <SummaryCard
          title="Paid Payments"
          value={paidPayments}
          icon={CheckCircle}
          note={`${formatCurrency(totalCollected)} collected`}
        />

        <SummaryCard
          title="Pending Payments"
          value={pendingPayments}
          icon={Clock}
          note="Needs student follow-up"
        />

        <SummaryCard
          title="Overdue"
          value={overduePayments}
          icon={AlertTriangle}
          note="Needs urgent attention"
        />

        <SummaryCard
          title="Announcements"
          value={activeAnnouncements}
          icon={Megaphone}
          note={`${announcements.length} total announcements`}
        />
      </section>
      
      <section className="dashboard-two-column">
        <div className="dashboard-panel">
          <div className="dashboard-panel-header">
            <h3>Recent Payments</h3>
            <p>Latest payment records created in the system.</p>
          </div>

          <div className="dashboard-list">
            {recentPayments.map((payment) => (
              <article className="dashboard-list-item" key={payment.id}>
                <div>
                  <strong>{payment.full_name}</strong>
                  <span>{payment.collection_title}</span>
                </div>

                <div className="dashboard-list-meta">
                  <strong>{formatCurrency(payment.amount_paid)}</strong>
                  <span className={`status-pill ${payment.status}`}>
                    {payment.status}
                  </span>
                </div>
              </article>
            ))}

            {recentPayments.length === 0 && (
              <p className="dashboard-empty">No payment records yet.</p>
            )}
          </div>
        </div>

        <div className="dashboard-panel">
          <div className="dashboard-panel-header">
            <h3>Recent Collections</h3>
            <p>Latest collections created by the treasurer.</p>
          </div>

          <div className="dashboard-list">
            {recentCollections.map((collection) => (
              <article className="dashboard-list-item" key={collection.id}>
                <div>
                  <strong>{collection.title}</strong>
                  <span>{collection.course} • {collection.year_level} • Section {collection.section}</span>
                </div>

                <div className="dashboard-list-meta">
                  <strong>{formatCurrency(collection.amount)}</strong>
                  <span className={`status-pill ${collection.status}`}>
                    {collection.status}
                  </span>
                </div>
              </article>
            ))}

            {recentCollections.length === 0 && (
              <p className="dashboard-empty">No collections yet.</p>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}

export default AdminDashboard;