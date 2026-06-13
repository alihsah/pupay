import { useEffect, useState } from "react";

import { createPayMongoCheckout, getStudentPayments } from "../../services/paymentService";
import { useCurrentUser } from "../../hooks/useCurrentUser";
import { Toast } from "../../components/ui";

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
          {filteredPayments.map((payment) => (
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

                {payment.status !== "paid" && (
                  <button
                    className="student-pay-online-btn"
                    type="button"
                    onClick={() => handlePayOnline(payment)}
                  >
                    Pay Online
                  </button>
                )}
              </div>
            </article>
          ))}

          {filteredPayments.length === 0 && (
            <div className="student-payments-empty">
              <h3>No payments found</h3>
              <p>You do not have payment records matching this filter yet.</p>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}

export default StudentPayments;
