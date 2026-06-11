import { Modal } from "../ui";

const actionLabels = {
  paid: "mark as paid",
  pending: "mark as pending",
  overdue: "mark as overdue",
};

function PaymentStatusConfirmModal({
  payment,
  nextStatus,
  confirmText,
  setConfirmText,
  isUpdating,
  onClose,
  onConfirm,
  formatCurrency,
}) {
  if (!payment || !nextStatus) return null;

  const expectedText = actionLabels[nextStatus];
  const isMatch = confirmText.trim().toLowerCase() === expectedText;

  return (
    <Modal
      title={`Confirm ${nextStatus} status`}
      subtitle="This action will update the student's payment record."
      onClose={onClose}
    >
      <div className="payment-confirm-content">
        <div className="payment-confirm-summary">
          <div>
            <span>Student</span>
            <strong>{payment.full_name}</strong>
          </div>

          <div>
            <span>Amount Due</span>
            <strong>{formatCurrency(payment.amount_due)}</strong>
          </div>

          <div>
            <span>Current Status</span>
            <strong className="capitalize-text">{payment.status}</strong>
          </div>

          <div>
            <span>New Status</span>
            <strong className="capitalize-text">{nextStatus}</strong>
          </div>
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
            {isUpdating ? "Updating..." : "Confirm Update"}
          </button>
        </div>
      </div>
    </Modal>
  );
}

export default PaymentStatusConfirmModal;