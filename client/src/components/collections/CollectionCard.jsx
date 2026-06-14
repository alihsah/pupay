function CollectionCard({
  collection,
  progress,
  onOpen,
  onEdit,
  onStatusChange,
  formatCurrency,
  formatDate,
  formatAudience,
}) {
  const progressValue = progress?.progress || 0;
  const isLocked =
    Boolean(progress?.isLocked) || Number(collection.is_locked || 0) === 1;
  const isArchived = collection.status === "archived";
  const isClosed = collection.status === "closed" || isLocked;
  const goalAmount = Number(progress?.goalAmount || collection.goal_amount || 0);
  const totalCollected = Number(progress?.totalCollected || 0);
  const isGoalReached = goalAmount > 0 && totalCollected >= goalAmount;
  const canReopen = isClosed && !isArchived && !isGoalReached;
  const statusLabel = isArchived ? "archived" : isLocked ? "locked" : collection.status;

  const handleActionClick = (event, action) => {
    event.stopPropagation();
    action();
  };

  return (
    <article className="admin-collection-card" onClick={onOpen}>
      <div className="admin-collection-card-header">
        <div>
          <h3>{collection.title}</h3>
          <p>{collection.description || "No description provided."}</p>
        </div>

        <span className={`status-pill ${statusLabel}`}>
          {statusLabel}
        </span>
      </div>

      <div className="admin-collection-card-meta">
        <div>
          <span>Goal Amount</span>
          <strong>
            {formatCurrency(collection.goal_amount || progress?.goalAmount || 0)}
          </strong>
        </div>

        <div>
          <span>Contribution</span>
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
        <div className="admin-collection-card-progress">
          <div className="admin-collection-card-progress-header">
            <span>
              {formatCurrency(progress.totalCollected)} collected out of{" "}
              {formatCurrency(progress.goalAmount)}
            </span>
            <strong>{progressValue}%</strong>
          </div>

          <div className="admin-collection-card-progress-bar">
            <div
              className="admin-collection-card-progress-fill"
              style={{ width: `${progressValue}%` }}
            />
          </div>

          <div className="admin-collection-card-counts">
            <span>{progress.paidCount} paid</span>
            <span>{progress.pendingCount} pending</span>
            <span>{progress.overdueCount} overdue</span>
          </div>
        </div>
      )}

      <div className="admin-collection-card-actions">
        <button
          type="button"
          onClick={(event) => handleActionClick(event, onEdit)}
        >
          Edit
        </button>

        {!isArchived && !isClosed && (
          <button
            type="button"
            onClick={(event) =>
              handleActionClick(event, () => onStatusChange(collection, "closed"))
            }
          >
            Close
          </button>
        )}

        {canReopen && (
          <button
            type="button"
            onClick={(event) =>
              handleActionClick(event, () => onStatusChange(collection, "active"))
            }
          >
            Reopen
          </button>
        )}

        {!isArchived && (
          <button
            type="button"
            onClick={(event) =>
              handleActionClick(event, () => onStatusChange(collection, "archived"))
            }
          >
            Archive
          </button>
        )}
      </div>
    </article>
  );
}

export default CollectionCard;
