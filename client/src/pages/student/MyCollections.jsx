import { useEffect, useState } from "react";

import {
  getMyCollections,
  getCollectionProgress,
} from "../../services/collectionService";

import { Toast } from "../../components/ui";

import "../../styles/pages/student/MyCollections.css";

function StudentCollections() {
  const [collections, setCollections] = useState([]);
  const [collectionProgress, setCollectionProgress] = useState({});

  const [loading, setLoading] = useState(true);

  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");

  const [searchTerm, setSearchTerm] = useState("");
  const [sortOption, setSortOption] = useState("due-soon");

  const loadCollections = async () => {
    try {
      setLoading(true);

      const data = await getMyCollections();
      setCollections(data);

      const progressResults = await Promise.all(
        data.map(async (collection) => {
          const progress = await getCollectionProgress(collection.id);
          return [collection.id, progress];
        })
      );

      setCollectionProgress(Object.fromEntries(progressResults));
    } catch (error) {
      setMessage(error.response?.data?.message || "Failed to load your collections.");
      setMessageType("error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCollections();
  }, []);

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

    return parts.join(" • ");
  };

  const filteredCollections = collections
    .filter((collection) => {
      const searchValue = searchTerm.toLowerCase();

      return (
        collection.title?.toLowerCase().includes(searchValue) ||
        collection.description?.toLowerCase().includes(searchValue)
      );
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

        {loading ? (
          <p>Loading collections...</p>
        ) : (
          <div className="student-collection-list">
            {filteredCollections.map((collection) => {
              const progress = collectionProgress[collection.id];

              return (
                <article className="student-collection-item" key={collection.id}>
                  <div className="student-collection-main">
                    <div>
                      <h3>{collection.title}</h3>
                      <p>{collection.description || "No description provided."}</p>
                    </div>

                    <span
                      className={`status-pill ${
                        progress?.isLocked ? "locked" : collection.status
                      }`}
                    >
                      {progress?.isLocked ? "locked" : collection.status}
                    </span>
                  </div>

                  <div className="student-collection-meta-grid">
                    <div>
                      <span>Goal Amount</span>
                      <strong>{formatCurrency(collection.goal_amount)}</strong>
                    </div>

                    <div>
                      <span>Your Contribution</span>
                      <strong>{formatCurrency(collection.amount)}</strong>
                    </div>

                    <div>
                      <span>Due Date</span>
                      <strong>{formatDate(collection.due_date)}</strong>
                    </div>

                    <div>
                      <span>Audience</span>
                      <strong>{formatAudience(collection)}</strong>
                    </div>
                  </div>

                  {progress && (
                    <div className="student-collection-progress">
                      <div className="student-collection-progress-header">
                        <span>
                          {formatCurrency(progress.totalCollected)} collected out of{" "}
                          {formatCurrency(progress.goalAmount)}
                        </span>

                        <strong>{progress.progress}%</strong>
                      </div>

                      <div className="student-collection-progress-bar">
                        <div
                          className="student-collection-progress-fill"
                          style={{ width: `${progress.progress}%` }}
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