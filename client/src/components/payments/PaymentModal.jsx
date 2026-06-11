function PaymentModal({
  formData,
  students,
  collections,
  onChange,
  onSubmit,
  onClose,
}) {
  return (
    <div className="modal-overlay">
      <div className="app-modal">
        <div className="modal-header">
          <div>
            <h2>Create Payment Record</h2>
            <p>Add a manual cash payment or pending payment record.</p>
          </div>

          <button className="modal-close-btn" type="button" onClick={onClose}>
            ×
          </button>
        </div>

        <form className="payments-form modal-form" onSubmit={onSubmit}>
          <div className="form-group">
            <label>Student</label>
            <select
              name="student_id"
              value={formData.student_id}
              onChange={onChange}
              required
            >
              <option value="">Select student</option>
              {students.map((student) => (
                <option key={student.id} value={student.id}>
                  {student.full_name} — {student.student_number}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Collection</label>
            <select
              name="collection_id"
              value={formData.collection_id}
              onChange={onChange}
              required
            >
              <option value="">Select collection</option>
              {collections.map((collection) => (
                <option key={collection.id} value={collection.id}>
                  {collection.title} — ₱{collection.amount}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Amount Due</label>
            <input
              name="amount_due"
              value={formData.amount_due}
              onChange={onChange}
              type="number"
              min="1"
              required
            />
          </div>

          <div className="form-group">
            <label>Amount Paid</label>
            <input
              name="amount_paid"
              value={formData.amount_paid}
              onChange={onChange}
              type="number"
              min="0"
            />
          </div>

          <div className="form-group">
            <label>Status</label>
            <select name="status" value={formData.status} onChange={onChange}>
              <option value="pending">Pending</option>
              <option value="paid">Paid</option>
              <option value="overdue">Overdue</option>
            </select>
          </div>

          <div className="form-group">
            <label>Payment Method</label>
            <select
              name="payment_method"
              value={formData.payment_method}
              onChange={onChange}
            >
              <option value="cash">Cash</option>
              <option value="gcash">GCash</option>
              <option value="card">Card</option>
            </select>
          </div>

          <div className="form-group">
            <label>Reference Number</label>
            <input
              name="reference_number"
              value={formData.reference_number}
              onChange={onChange}
              placeholder="Example: CASH-001"
            />
          </div>

          <div className="form-group">
            <label>Remarks</label>
            <textarea
              name="remarks"
              value={formData.remarks}
              onChange={onChange}
              placeholder="Optional notes"
              rows="3"
            />
          </div>

          <div className="modal-actions">
            <button className="secondary-btn" type="button" onClick={onClose}>
              Cancel
            </button>

            <button className="primary-btn" type="submit">
              Save Payment
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default PaymentModal;