import { useEffect, useState } from "react";

import { createPayMongoCheckout, getStudentPayments } from "../../services/paymentService";
import { useCurrentUser } from "../../hooks/useCurrentUser";
import { Modal, Toast } from "../../components/ui";

import "../../styles/pages/student/MyPayments.css";

function StudentPayments() {
  const { currentUser, loadingUser } = useCurrentUser();

  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortOption, setSortOption] = useState("due-soon");
  const [receiptPayment, setReceiptPayment] = useState(null);
  const [receiptGeneratedAt, setReceiptGeneratedAt] = useState(null);

  const loadPayments = async () => {
    if (!currentUser?.studentId) {
      setPayments([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);

      const data = await getStudentPayments(currentUser.studentId);
      setPayments(data);
    } catch (error) {
      setMessage(error.response?.data?.message || "Failed to load your payments.");
      setMessageType("error");
    } finally {
      setLoading(false);
    }
  };

  const handlePayOnline = async (payment) => {
    try {
      const result = await createPayMongoCheckout(payment.id);
      window.location.href = result.checkoutUrl;
    } catch (error) {
      setMessage(error.response?.data?.message || "Failed to start checkout.");
      setMessageType("error");
    }
  };

  const openReceipt = (payment) => {
    setReceiptPayment(payment);
    setReceiptGeneratedAt(new Date());
  };

  const closeReceipt = () => {
    setReceiptPayment(null);
    setReceiptGeneratedAt(null);
  };

  const handlePrintReceipt = () => {
    window.print();
  };

  useEffect(() => {
    if (!loadingUser) {
      loadPayments();
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

  const hasReceiptValue = (value) =>
    value !== undefined && value !== null && value !== "";

  const formatReceiptText = (value) =>
    hasReceiptValue(value) ? String(value) : "N/A";

  const formatReceiptCurrency = (amount) =>
    hasReceiptValue(amount) ? formatCurrency(amount) : "N/A";

  const formatPaymentMethod = (method) => {
    if (!hasReceiptValue(method)) return "N/A";

    const methodLabels = {
      cash: "Cash",
      gcash: "GCash",
      card: "Card",
    };

    return methodLabels[method] || String(method);
  };

  const formatStatus = (status) => {
    if (!hasReceiptValue(status)) return "N/A";

    return String(status).charAt(0).toUpperCase() + String(status).slice(1);
  };

  const filteredPayments = payments
    .filter((payment) => {
      const searchValue = searchTerm.toLowerCase();
      const matchesSearch =
        !searchValue ||
        payment.collection_title?.toLowerCase().includes(searchValue) ||
        payment.collection_description?.toLowerCase().includes(searchValue);

      const matchesStatus =
        statusFilter === "all" || payment.status === statusFilter;

      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      if (sortOption === "due-soon") {
        return new Date(a.due_date) - new Date(b.due_date);
      }

      if (sortOption === "newest") {
        return new Date(b.created_at) - new Date(a.created_at);
      }

      if (sortOption === "oldest") {
        return new Date(a.created_at) - new Date(b.created_at);
      }

      return 0;
    });

  const totalPayments = payments.length;
  const paidPayments = payments.filter((payment) => payment.status === "paid").length;
  const pendingPayments = payments.filter((payment) => payment.status === "pending").length;
  const overduePayments = payments.filter((payment) => payment.status === "overdue").length;

  if (loadingUser || loading) {
    return (
      <main className="student-payments-page">
        <p>Loading your payments...</p>
      </main>
    );
  }

  return (
    <main className="student-payments-page">
      <Toast
        message={message}
        type={messageType}
        onClose={() => {
          setMessage("");
          setMessageType("");
        }}
      />

      <section className="student-payment-summary-grid">
        <article className="student-payment-card">
          <span>Total Payments</span>
          <strong>{totalPayments}</strong>
        </article>

        <article className="student-payment-card">
          <span>Paid</span>
          <strong>{paidPayments}</strong>
        </article>

        <article className="student-payment-card">
          <span>Pending</span>
          <strong>{pendingPayments}</strong>
        </article>

        <article className="student-payment-card">
          <span>Overdue</span>
          <strong>{overduePayments}</strong>
        </article>
      </section>

      <section className="student-payments-panel">
        <div className="student-payments-header">
          <div>
            <h2>Payment History</h2>
            <p>Review your payment records, status, and transaction history.</p>
          </div>
        </div>

        <div className="student-payments-toolbar">
          <div className="filter-group search-group">
            <label>Search</label>
            <input
              type="text"
              placeholder="Search payments..."
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
              <option value="due-soon">Due Date Soonest</option>
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
            </select>
          </div>
        </div>

        <div className="student-payment-list">
          {filteredPayments.map((payment) => {
            const isCollectionClosed =
              payment.collection_status !== "active" ||
              Number(payment.collection_is_locked || 0) === 1;

            return (
            <article className="student-payment-item" key={payment.id}>
              <div className="student-payment-main">
                <h3>{payment.collection_title}</h3>
                <p>{payment.collection_description || "No description provided."}</p>
              </div>

              <div className="student-payment-meta">
                <div>
                  <span>Due Date</span>
                  <strong>{formatDate(payment.due_date)}</strong>
                </div>

                <div>
                  <span>Amount Due</span>
                  <strong>{formatCurrency(payment.amount_due)}</strong>
                </div>

                <div>
                  <span>Amount Paid</span>
                  <strong>{formatCurrency(payment.amount_paid)}</strong>
                </div>
              </div>

              <div className="student-payment-footer">
                <span className={`status-pill ${payment.status}`}>
                  {payment.status}
                </span>

                <small>
                  {payment.paid_at
                    ? `Paid on ${formatDate(payment.paid_at)}`
                    : "Not yet paid"}
                </small>

                {payment.status !== "paid" && !isCollectionClosed && (
                  <button
                    className="student-pay-online-btn"
                    type="button"
                    onClick={() => handlePayOnline(payment)}
                  >
                    Pay Online
                  </button>
                )}

                {payment.status === "paid" && (
                  <button
                    className="student-view-receipt-btn"
                    type="button"
                    onClick={() => openReceipt(payment)}
                  >
                    View Receipt
                  </button>
                )}
              </div>
            </article>
            );
          })}

          {filteredPayments.length === 0 && (
            <div className="student-payments-empty">
              <h3>No payments found</h3>
              <p>You do not have payment records matching this filter yet.</p>
            </div>
          )}
        </div>
      </section>

      {receiptPayment && (
        <Modal
          title="Payment Receipt"
          subtitle="Review this paid payment record before printing."
          onClose={closeReceipt}
        >
          <section className="student-receipt-print-area">
            <div className="student-receipt-header">
              <div>
                <p className="student-receipt-brand">PUPay</p>
                <h3>Official Payment Receipt</h3>
              </div>

              <span className={`status-pill ${receiptPayment.status}`}>
                {formatStatus(receiptPayment.status)}
              </span>
            </div>

            <div className="student-receipt-grid">
              <div>
                <span>Student Name</span>
                <strong>{formatReceiptText(currentUser?.fullName)}</strong>
              </div>

              <div>
                <span>Student Number</span>
                <strong>{formatReceiptText(currentUser?.studentNumber)}</strong>
              </div>

              <div>
                <span>Collection Title</span>
                <strong>{formatReceiptText(receiptPayment.collection_title)}</strong>
              </div>

              <div>
                <span>Collection Description</span>
                <strong>
                  {formatReceiptText(receiptPayment.collection_description)}
                </strong>
              </div>

              <div>
                <span>Amount Due</span>
                <strong>{formatReceiptCurrency(receiptPayment.amount_due)}</strong>
              </div>

              <div>
                <span>Amount Paid</span>
                <strong>{formatReceiptCurrency(receiptPayment.amount_paid)}</strong>
              </div>

              <div>
                <span>Payment Method</span>
                <strong>{formatPaymentMethod(receiptPayment.payment_method)}</strong>
              </div>

              <div>
                <span>Reference Number</span>
                <strong>{formatReceiptText(receiptPayment.reference_number)}</strong>
              </div>

              <div>
                <span>Payment Status</span>
                <strong>{formatStatus(receiptPayment.status)}</strong>
              </div>

              <div>
                <span>Paid Date</span>
                <strong>{formatDate(receiptPayment.paid_at)}</strong>
              </div>

              <div>
                <span>Receipt Generated Date</span>
                <strong>{formatDate(receiptGeneratedAt)}</strong>
              </div>
            </div>

            <p className="student-receipt-note">
              This receipt is generated from the payment record available in
              PUPay Payment History.
            </p>
          </section>

          <div className="student-receipt-actions">
            <button
              className="student-receipt-secondary-btn"
              type="button"
              onClick={closeReceipt}
            >
              Close
            </button>

            <button
              className="student-receipt-print-btn"
              type="button"
              onClick={handlePrintReceipt}
            >
              Print Receipt
            </button>
          </div>
        </Modal>
      )}
    </main>
  );
}

export default StudentPayments;
