import { useEffect, useState } from "react";

import {
  getMyCollections,
  getCollectionProgress,
} from "../../services/collectionService";
import {
  createPayMongoCheckout,
  getStudentPayments,
} from "../../services/paymentService";
import { useCurrentUser } from "../../hooks/useCurrentUser";

import { Toast } from "../../components/ui";

import "../../styles/pages/student/MyCollections.css";

function StudentCollections() {
  const { currentUser, loadingUser } = useCurrentUser();

  const [collections, setCollections] = useState([]);
  const [collectionProgress, setCollectionProgress] = useState({});
  const [paymentsByCollection, setPaymentsByCollection] = useState({});

  const [loading, setLoading] = useState(true);

  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");

  const [searchTerm, setSearchTerm] = useState("");
  const [sortOption, setSortOption] = useState("due-soon");
  const [statusFilter, setStatusFilter] = useState("all");

  const loadCollections = async () => {
    try {
      setLoading(true);

      const data = await getMyCollections();
      setCollections(data);

      const [progressResults, paymentData] = await Promise.all([
        Promise.all(
          data.map(async (collection) => {
            const progress = await getCollectionProgress(collection.id);
            return [collection.id, progress];
          })
        ),
        currentUser?.studentId
          ? getStudentPayments(currentUser.studentId)
          : Promise.resolve([]),
      ]);

      setCollectionProgress(Object.fromEntries(progressResults));
      setPaymentsByCollection(
        Object.fromEntries(
          paymentData.map((payment) => [payment.collection_id, payment])
        )
      );
    } catch (error) {
      setMessage(error.response?.data?.message || "Failed to load your collections.");
      setMessageType("error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!loadingUser) {
      loadCollections();
    }
  }, [loadingUser, currentUser?.studentId]);

  const handlePayOnline = async (payment) => {
    try {
      const result = await createPayMongoCheckout(payment.id);
      window.location.href = result.checkoutUrl;
    } catch (error) {
      setMessage(error.response?.data?.message || "Failed to start checkout.");
      setMessageType("error");
    }
  };

  const formatCurrency = (amount) => {
    return Number(amount || 0).toLocaleString("en-PH", {
      style: "currency",
      currency: "PHP",
    });
  };

  const formatDate = (date) => {
    if (!date) return "No due date";

    return new Date(date).toLocaleDateString("en-PH", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatAudience = (collection) => {
    if (
      collection.course === "ALL" &&
      collection.year_level === "ALL" &&
      collection.section === "ALL"
    ) {
      return "All Students";
    }

    const parts = [];

    if (collection.course !== "ALL") parts.push(collection.course);
    if (collection.year_level !== "ALL") parts.push(collection.year_level);
    if (collection.section !== "ALL") parts.push(`Section ${collection.section}`);

    const audienceLabel = parts.join(" - ");
    if (audienceLabel) return audienceLabel;

    return parts.join(" • ");
  };

  const formatStatusLabel = (status) => {
    if (!status) return "active";
    return status.replace("_", " ");
  };

  const getProgressValue = (progress) => {
    const rawValue = Number(progress?.progress || 0);

    if (!Number.isFinite(rawValue)) return 0;

    return Math.min(Math.max(rawValue, 0), 100);
  };

  const getProgressGoal = (collection, progress) => {
    return Number(progress?.goalAmount || collection.goal_amount || 0);
  };

  const getPaymentBalance = (payment, collection, progress) => {
    const amountDue = Number(
      payment?.amount_due ?? progress?.studentContribution ?? collection.amount ?? 0
    );
    const amountPaid = Number(payment?.amount_paid || 0);

    return Math.max(amountDue - amountPaid, 0);
  };

  const getCollectionDisplayStatus = (collection) => {
    const progress = collectionProgress[collection.id];
    const payment = paymentsByCollection[collection.id];
    const isLocked =
      Boolean(progress?.isLocked) || Number(collection.is_locked || 0) === 1;

    if (isLocked || collection.status === "closed") {
      return "locked";
    }

    return payment?.status || collection.status;
  };

  const filteredCollections = collections
  .filter((collection) => {
    const searchValue = searchTerm.toLowerCase();

    const matchesSearch =
      !searchValue ||
      collection.title?.toLowerCase().includes(searchValue) ||
      collection.description?.toLowerCase().includes(searchValue);

    const displayStatus = getCollectionDisplayStatus(collection);

    const matchesStatus =
      statusFilter === "all" || displayStatus === statusFilter;

    return matchesSearch && matchesStatus;
  })
  .sort((a, b) => {
    if (sortOption === "title-az") {
      return a.title.localeCompare(b.title);
    }

    if (sortOption === "title-za") {
      return b.title.localeCompare(a.title);
    }

    if (sortOption === "newest") {
      return new Date(b.created_at) - new Date(a.created_at);
    }

    return new Date(a.due_date) - new Date(b.due_date);
  });

  const totalCollections = collections.length;
  const upcomingCollections = collections.filter(
    (collection) => new Date(collection.due_date) >= new Date()
  ).length;

  const totalAmount = collections.reduce(
    (sum, collection) => sum + Number(collection.amount || 0),
    0
  );

  return (
    <main className="student-collections-page">
      <Toast
        message={message}
        type={messageType}
        onClose={() => {
          setMessage("");
          setMessageType("");
        }}
      />

      <section className="student-collection-summary-grid">
        <article className="student-collection-card">
          <span>Assigned Collections</span>
          <strong>{totalCollections}</strong>
        </article>

        <article className="student-collection-card">
          <span>Upcoming</span>
          <strong>{upcomingCollections}</strong>
        </article>

        <article className="student-collection-card">
          <span>Total Contribution</span>
          <strong>{formatCurrency(totalAmount)}</strong>
        </article>
      </section>

      <section className="student-collections-panel">
        <div className="student-collections-header">
          <div>
            <h2>My Collections</h2>
            <p>View active collections assigned to your course, year, and section.</p>
          </div>
        </div>

        <div className="student-collections-toolbar">
          <div className="filter-group search-group">
            <label>Search</label>
            <input
              type="text"
              placeholder="Search collections..."
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
              <option value="active">Active</option>
              <option value="locked">Locked</option>
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
              <option value="title-az">Title A-Z</option>
              <option value="title-za">Title Z-A</option>
            </select>
          </div>
        </div>

        {loadingUser || loading ? (
          <p>Loading collections...</p>
        ) : (
          <div className="student-collection-list">
            {filteredCollections.map((collection) => {
              const progress = collectionProgress[collection.id];
              const payment = paymentsByCollection[collection.id];
              const displayStatus = getCollectionDisplayStatus(collection);
              const progressValue = getProgressValue(progress);
              const progressGoal = getProgressGoal(collection, progress);
              const hasProgressGoal = progressGoal > 0;
              const totalCollected = Number(progress?.totalCollected || 0);
              const amountDue = Number(
                payment?.amount_due ?? progress?.studentContribution ?? collection.amount ?? 0
              );
              const amountPaid = Number(payment?.amount_paid || 0);
              const balance = getPaymentBalance(payment, collection, progress);
              const isCollectionClosed =
                collection.status !== "active" ||
                Boolean(progress?.isLocked) ||
                Number(collection.is_locked || 0) === 1;
              const canPayOnline =
                payment && payment.status !== "paid" && !isCollectionClosed;

              return (
                <article className="student-collection-item" key={collection.id}>
                  <div className="student-collection-main">
                    <div>
                      <h3>{collection.title}</h3>
                      <p>{collection.description || "No description provided."}</p>
                    </div>

                    <span
                      className={`status-pill ${displayStatus}`}
                    >
                      {formatStatusLabel(displayStatus)}
                    </span>
                  </div>

                  <div className="student-collection-card-body">
                    <div className="student-collection-meta-grid">
                      <div>
                        <span>Your Contribution</span>
                        <strong>{formatCurrency(amountDue)}</strong>
                      </div>

                      <div>
                        <span>Due Date</span>
                        <strong>{formatDate(collection.due_date)}</strong>
                      </div>

                      <div>
                        <span>Audience</span>
                        <strong>{formatAudience(collection)}</strong>
                      </div>

                      <div>
                        <span>Progress Goal</span>
                        <strong>
                          {hasProgressGoal
                            ? formatCurrency(progressGoal)
                            : "Goal not set"}
                        </strong>
                      </div>
                    </div>

                    <aside className="student-collection-payment-panel">
                      <span>Payment Status</span>
                      <strong>{formatStatusLabel(displayStatus)}</strong>
                      <small>
                        {payment?.status === "paid"
                          ? `Paid ${formatCurrency(amountPaid)}${
                              payment.paid_at ? ` on ${formatDate(payment.paid_at)}` : ""
                            }`
                          : `Balance: ${formatCurrency(balance)}`}
                      </small>

                      {canPayOnline && (
                        <button
                          className="student-pay-online-btn"
                          type="button"
                          onClick={() => handlePayOnline(payment)}
                        >
                          Pay Online
                        </button>
                      )}
                    </aside>
                  </div>

                  {progress && (
                    <div className="student-collection-progress">
                      <div className="student-collection-progress-header">
                        <div>
                          <span>
                            {hasProgressGoal
                              ? `${formatCurrency(totalCollected)} collected of ${formatCurrency(progressGoal)}`
                              : `${formatCurrency(totalCollected)} collected`}
                          </span>
                          {!hasProgressGoal && (
                            <small>Progress goal is not set for this collection.</small>
                          )}
                        </div>

                        <strong>{progressValue}%</strong>
                      </div>

                      <div className="student-collection-progress-bar">
                        <div
                          className="student-collection-progress-fill"
                          style={{ width: `${progressValue}%` }}
                        />
                      </div>

                      <div className="student-collection-counts">
                        <span>{progress.paidCount} paid</span>
                        <span>{progress.pendingCount} pending</span>
                        <span>{progress.overdueCount} overdue</span>
                      </div>
                    </div>
                  )}
                </article>
              );
            })}

            {filteredCollections.length === 0 && (
              <div className="student-collections-empty">
                <h3>No collections found</h3>
                <p>No active collections are currently assigned to you.</p>
              </div>
            )}
          </div>
        )}
      </section>
    </main>
  );
}

export default StudentCollections;
