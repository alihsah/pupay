import { Modal } from "../ui";

function CollectionActionConfirmModal({
  collection,
  action,
  confirmText,
  setConfirmText,
  isUpdating,
  onClose,
  onConfirm,
}) {
  if (!collection || !action) return null;

  const expectedText = `${action} ${collection.title}`.toLowerCase();
  const isMatch = confirmText.trim().toLowerCase() === expectedText;

  const actionLabel = action === "archive" ? "Archive Collection" : "Close Collection";

  return (
    <Modal
      title={actionLabel}
      subtitle="This action will update the collection status."
      onClose={onClose}
    >
      <div className="collection-confirm-content">
        <div className="collection-confirm-warning">
          <strong>{collection.title}</strong>

          <p>
            {action === "archive"
              ? "Archiving this collection will move it out of active collection records."
              : "Closing this collection will stop it from being treated as an active collection."}
          </p>
        </div>

        <div className="form-group">
          <label>
            Type <strong>{expectedText}</strong> to confirm
          </label>

          <input
            value={confirmText}
            onChange={(event) => setConfirmText(event.target.value)}
            placeholder={expectedText}
            autoFocus
          />
        </div>

        <div className="modal-actions">
          <button
            className="secondary-btn"
            type="button"
            onClick={onClose}
            disabled={isUpdating}
          >
            Cancel
          </button>

          <button
            className="primary-btn"
            type="button"
            onClick={onConfirm}
            disabled={!isMatch || isUpdating}
          >
            {isUpdating ? "Updating..." : actionLabel}
          </button>
        </div>
      </div>
    </Modal>
  );
}

export default CollectionActionConfirmModal;