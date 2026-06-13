import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, CheckCircle, Clock, AlertTriangle, WalletCards } from "lucide-react";

import { getCollectionById, getCollectionProgress, } from "../../services/collectionService";
import {
  getPaymentsByCollection,
  updatePaymentStatus,
} from "../../services/paymentService";

import { Modal, SummaryCard, Toast } from "../../components/ui";
import { PaymentStatusConfirmModal } from "../../components/payments";

import "../../styles/pages/admin/CollectionDetails.css";

function AdminCollectionDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [collection, setCollection] = useState(null);
  const [payments, setPayments] = useState([]);

  const [progress, setProgress] = useState(null);

  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortOption, setSortOption] = useState("name-az");

  const [selectedPayment, setSelectedPayment] = useState(null);
  const [nextPaymentStatus, setNextPaymentStatus] = useState("");
  const [confirmText, setConfirmText] = useState("");
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportGeneratedAt, setReportGeneratedAt] = useState(null);

  const loadCollectionDetails = async (showPageLoading = true) => {
    try {
      if (showPageLoading) {
        setLoading(true);
      }

      const [collectionData, paymentData, progressData] = await Promise.all([
        getCollectionById(id),
        getPaymentsByCollection(id),
        getCollectionProgress(id),
      ]);

      setCollection(collectionData);
      setPayments(paymentData);
      setProgress(progressData);
    } catch (error) {
      setMessage(
        error.response?.data?.message || "Failed to load collection details."
      );
      setMessageType("error");
    } finally {
      if (showPageLoading) {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    loadCollectionDetails(true);
  }, [id]);

  const openStatusConfirmModal = (payment, nextStatus) => {
    setSelectedPayment(payment);
    setNextPaymentStatus(nextStatus);
    setConfirmText("");
  };

  const closeStatusConfirmModal = () => {
    setSelectedPayment(null);
    setNextPaymentStatus("");
    setConfirmText("");
    setIsUpdatingStatus(false);
  };

  const handleUpdateStatus = async () => {
    if (!selectedPayment || !nextPaymentStatus) return;

    try {
      setIsUpdatingStatus(true);

      const amountPaid =
        nextPaymentStatus === "paid" ? selectedPayment.amount_due : 0;

      await updatePaymentStatus(selectedPayment.id, {
        status: nextPaymentStatus,
        amount_paid: Number(amountPaid),
        payment_method: selectedPayment.payment_method || "cash",
        reference_number: selectedPayment.reference_number || "",
        remarks: selectedPayment.remarks || "",
      });

      setMessage(`Payment marked as ${nextPaymentStatus}.`);
      setMessageType("success");

      closeStatusConfirmModal();
      loadCollectionDetails(false);
    } catch (error) {
      setMessage(error.response?.data?.message || "Failed to update payment.");
      setMessageType("error");
      setIsUpdatingStatus(false);
    }
  };

  const handleStatusSelect = (event, payment) => {
    const nextStatus = event.target.value;

    if (!nextStatus) return;

    openStatusConfirmModal(payment, nextStatus);

    event.target.value = "";
  };

  const openReportModal = () => {
    setReportGeneratedAt(new Date());
    setShowReportModal(true);
  };

  const closeReportModal = () => {
    setShowReportModal(false);
    setReportGeneratedAt(null);
  };

  const handlePrintReport = () => {
    window.print();
  };

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

  const hasReportValue = (value) =>
    value !== undefined && value !== null && value !== "";

  const formatReportText = (value) =>
    hasReportValue(value) ? String(value) : "N/A";

  const formatReportCurrency = (amount) =>
    hasReportValue(amount) ? formatCurrency(amount) : "N/A";

  const formatReportDate = (date) => {
    if (!hasReportValue(date)) return "N/A";

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) return "N/A";

    return formatDate(parsedDate);
  };

  const formatReportStatus = (status) => {
    if (!hasReportValue(status)) return "N/A";

    return String(status).charAt(0).toUpperCase() + String(status).slice(1);
  };

  const formatPaymentMethod = (method) => {
    if (!hasReportValue(method)) return "N/A";

    const methodLabels = {
      cash: "Cash",
      gcash: "GCash",
      card: "Card",
    };

    return methodLabels[method] || String(method);
  };

  const formatAudience = (item) => {
    if (!item) return "N/A";

    if (
      item.course === "ALL" &&
      item.year_level === "ALL" &&
      item.section === "ALL"
    ) {
      return "All Students";
    }

    const parts = [];

    if (item.course !== "ALL") parts.push(item.course);
    if (item.year_level !== "ALL") parts.push(item.year_level);
    if (item.section !== "ALL") parts.push(`Section ${item.section}`);

    return parts.join(" • ");
  };

  const formatReportAudience = (item) => {
    if (!item) return "N/A";

    if (
      item.course === "ALL" &&
      item.year_level === "ALL" &&
      item.section === "ALL"
    ) {
      return "All Students";
    }

    const parts = [];

    if (item.course !== "ALL") parts.push(item.course);
    if (item.year_level !== "ALL") parts.push(item.year_level);
    if (item.section !== "ALL") parts.push(`Section ${item.section}`);

    return parts.length > 0 ? parts.join(" / ") : "N/A";
  };

  const filteredPayments = payments
    .filter((payment) => {
      const searchValue = searchTerm.toLowerCase();

      const matchesSearch =
        payment.full_name?.toLowerCase().includes(searchValue) ||
        payment.student_number?.toLowerCase().includes(searchValue) ||
        payment.personal_email?.toLowerCase().includes(searchValue);

      const matchesStatus =
        statusFilter === "all" || payment.status === statusFilter;

      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      if (sortOption === "name-za") {
        return b.full_name.localeCompare(a.full_name);
      }

      if (sortOption === "paid-high") {
        return Number(b.amount_paid || 0) - Number(a.amount_paid || 0);
      }

      if (sortOption === "paid-low") {
        return Number(a.amount_paid || 0) - Number(b.amount_paid || 0);
      }

      return a.full_name.localeCompare(b.full_name);
    });

  const totalStudents = payments.length;
  const paidCount = payments.filter((payment) => payment.status === "paid").length;
  const pendingCount = payments.filter((payment) => payment.status === "pending").length;
  const overdueCount = payments.filter((payment) => payment.status === "overdue").length;

  const totalCollected = payments
    .filter((payment) => payment.status === "paid")
    .reduce((sum, payment) => sum + Number(payment.amount_paid || 0), 0);

  if (loading) {
    return (
      <main className="collection-details-page">
        <p>Loading collection details...</p>
      </main>
    );
  }

  if (!collection) {
    return (
      <main className="collection-details-page">
        <p>Collection not found.</p>
      </main>
    );
  }

  return (
    <main className="collection-details-page">
      <Toast
        message={message}
        type={messageType}
        onClose={() => {
          setMessage("");
          setMessageType("");
        }}
      />

      <button
        className="collection-back-btn"
        type="button"
        onClick={() => navigate("/admin/collections")}
      >
        <ArrowLeft size={18} />
        Back to Collections
      </button>

      <section className="collection-details-hero">
        <div>
          <h2>{collection.title}</h2>
          <p>{collection.description || "No description provided."}</p>

          <div className="collection-details-meta">
            <span>Goal: {formatCurrency(collection.goal_amount)}</span>
            <span>Contribution: {formatCurrency(collection.amount)}</span>
            <span>Due: {formatDate(collection.due_date)}</span>
            <span>Audience: {formatAudience(collection)}</span>
          </div>
        </div>

        <div className="collection-details-actions">
          <span className={`status-pill ${collection.is_locked ? "locked" : collection.status}`}>
            {collection.is_locked ? "locked" : collection.status}
          </span>

          <button
            className="collection-print-report-btn"
            type="button"
            onClick={openReportModal}
          >
            Print Report
          </button>
        </div>
      </section>

      {progress && (
        <section className="collection-progress-panel">
          <div className="collection-progress-header">
            <div>
              <h3>Collection Progress</h3>
              <p>
                {formatCurrency(progress.totalCollected)} collected out of{" "}
                {formatCurrency(progress.goalAmount)}
              </p>
            </div>

            <strong>{progress.progress}%</strong>
          </div>

          <div className="collection-progress-bar">
            <div
              className="collection-progress-fill"
              style={{ width: `${progress.progress}%` }}
            />
          </div>

          <div className="collection-progress-details">
            <span>Student Contribution: {formatCurrency(progress.studentContribution)}</span>
            <span>Assigned Students: {progress.totalStudents}</span>
            <span>
              Status:{" "}
              {progress.isLocked ? "Locked / Goal reached" : "Open for payments"}
            </span>
          </div>
        </section>
      )}

      <section className="collection-details-summary-grid">
        <SummaryCard
          title="Assigned Students"
          value={totalStudents}
          icon={WalletCards}
          note="Payment records generated"
        />

        <SummaryCard
          title="Paid"
          value={paidCount}
          icon={CheckCircle}
          note={`${formatCurrency(progress?.totalCollected || totalCollected)} collected`}
        />

        <SummaryCard
          title="Pending"
          value={pendingCount}
          icon={Clock}
          note="Not yet settled"
        />

        <SummaryCard
          title="Overdue"
          value={overdueCount}
          icon={AlertTriangle}
          note="Needs follow-up"
        />
      </section>

      <section className="collection-payments-panel">
        <div className="collection-payments-header">
          <div>
            <h3>Student Payment Records</h3>
            <p>Manage payments generated for this collection.</p>
          </div>
        </div>

        <div className="collection-payments-toolbar">
          <div className="filter-group search-group">
            <label>Search</label>
            <input
              type="text"
              placeholder="Search student name, number, or email..."
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
            />
          </div>

          <div className="filter-group">
            <label>Status</label>
            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="paid">Paid</option>
              <option value="overdue">Overdue</option>
            </select>
          </div>

          <div className="filter-group">
            <label>Sort By</label>
            <select
              value={sortOption}
              onChange={(event) => setSortOption(event.target.value)}
            >
              <option value="name-az">Name A-Z</option>
              <option value="name-za">Name Z-A</option>
              <option value="paid-high">Amount Paid High-Low</option>
              <option value="paid-low">Amount Paid Low-High</option>
            </select>
          </div>
        </div>

        <div className="collection-payments-table-wrap">
          <table className="collection-payments-table">
            <thead>
              <tr>
                <th>Student</th>
                <th>Program</th>
                <th>Amount</th>
                <th>Method</th>
                <th>Status</th>
                <th>Paid At</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {filteredPayments.map((payment) => (
                <tr key={payment.id}>
                  <td>
                    <span>{payment.full_name}</span>
                    <small>{payment.student_number}</small>
                  </td>

                  <td>
                    <span>{payment.course}</span>
                    <small>
                      {payment.year_level} • Section {payment.section}
                    </small>
                  </td>

                  <td>
                    <span>{formatCurrency(payment.amount_paid)}</span>
                    <small>Due: {formatCurrency(payment.amount_due)}</small>
                  </td>

                  <td>{payment.payment_method}</td>

                  <td>
                    <span className={`status-pill ${payment.status}`}>
                      {payment.status}
                    </span>
                  </td>

                  <td>{payment.paid_at ? formatDate(payment.paid_at) : "Not paid"}</td>

                  <td>
                    <select
                      className="collection-payment-status-select"
                      defaultValue=""
                      onChange={(event) => handleStatusSelect(event, payment)}
                    >
                      <option value="" disabled>
                        Update Status
                      </option>

                      {payment.status !== "paid" && (
                        <option value="paid">Mark as Paid</option>
                      )}

                      {payment.status !== "pending" && (
                        <option value="pending">Mark as Pending</option>
                      )}

                      {payment.status !== "overdue" && (
                        <option value="overdue">Mark as Overdue</option>
                      )}
                    </select>
                  </td>
                </tr>
              ))}

              {filteredPayments.length === 0 && (
                <tr>
                  <td colSpan="7">No payment records found for this collection.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
      <PaymentStatusConfirmModal
        payment={selectedPayment}
        nextStatus={nextPaymentStatus}
        confirmText={confirmText}
        setConfirmText={setConfirmText}
        isUpdating={isUpdatingStatus}
        onClose={closeStatusConfirmModal}
        onConfirm={handleUpdateStatus}
        formatCurrency={formatCurrency}
      />

      {showReportModal && (
        <Modal
          title="Collection Payment Report"
          subtitle="Review this collection report before printing."
          onClose={closeReportModal}
        >
          <section className="collection-report-print-area">
            <div className="collection-report-header">
              <div>
                <p className="collection-report-brand">PUPay</p>
                <h3>Collection Payment Report</h3>
              </div>

              <span className={`status-pill ${collection.is_locked ? "locked" : collection.status}`}>
                {collection.is_locked ? "Locked" : formatReportStatus(collection.status)}
              </span>
            </div>

            <div className="collection-report-summary">
              <div>
                <span>Collection Title</span>
                <strong>{formatReportText(collection.title)}</strong>
              </div>

              <div>
                <span>Collection Description</span>
                <strong>{formatReportText(collection.description)}</strong>
              </div>

              <div>
                <span>Target Audience</span>
                <strong>{formatReportAudience(collection)}</strong>
              </div>

              <div>
                <span>Due Date</span>
                <strong>{formatReportDate(collection.due_date)}</strong>
              </div>

              <div>
                <span>Goal Amount</span>
                <strong>{formatReportCurrency(collection.goal_amount)}</strong>
              </div>

              <div>
                <span>Student Contribution</span>
                <strong>{formatReportCurrency(collection.amount)}</strong>
              </div>

              <div>
                <span>Total Collected</span>
                <strong>
                  {formatReportCurrency(progress?.totalCollected ?? totalCollected)}
                </strong>
              </div>

              <div>
                <span>Progress</span>
                <strong>
                  {hasReportValue(progress?.progress) ? `${progress.progress}%` : "N/A"}
                </strong>
              </div>

              <div>
                <span>Paid Count</span>
                <strong>{paidCount}</strong>
              </div>

              <div>
                <span>Pending Count</span>
                <strong>{pendingCount}</strong>
              </div>

              <div>
                <span>Overdue Count</span>
                <strong>{overdueCount}</strong>
              </div>

              <div>
                <span>Generated Date</span>
                <strong>{formatReportDate(reportGeneratedAt)}</strong>
              </div>
            </div>

            <div className="collection-report-table-wrap">
              <table className="collection-report-table">
                <thead>
                  <tr>
                    <th>Student Name</th>
                    <th>Student Number</th>
                    <th>Amount Due</th>
                    <th>Amount Paid</th>
                    <th>Status</th>
                    <th>Payment Method</th>
                    <th>Reference Number</th>
                    <th>Paid Date</th>
                  </tr>
                </thead>

                <tbody>
                  {payments.map((payment) => (
                    <tr key={payment.id}>
                      <td>{formatReportText(payment.full_name)}</td>
                      <td>{formatReportText(payment.student_number)}</td>
                      <td>{formatReportCurrency(payment.amount_due)}</td>
                      <td>{formatReportCurrency(payment.amount_paid)}</td>
                      <td>{formatReportStatus(payment.status)}</td>
                      <td>{formatPaymentMethod(payment.payment_method)}</td>
                      <td>{formatReportText(payment.reference_number)}</td>
                      <td>{formatReportDate(payment.paid_at)}</td>
                    </tr>
                  ))}

                  {payments.length === 0 && (
                    <tr>
                      <td colSpan="8">No payment records available.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>

          <div className="collection-report-actions">
            <button
              className="collection-report-secondary-btn"
              type="button"
              onClick={closeReportModal}
            >
              Close
            </button>

            <button
              className="collection-report-print-btn"
              type="button"
              onClick={handlePrintReport}
            >
              Print Report
            </button>
          </div>
        </Modal>
      )}
    </main>
  );
}

export default AdminCollectionDetails;
