function PaymentTable({ payments, onUpdateStatus, formatCurrency, formatDate }) {
  return (
    <div className="payments-table-wrap">
      <table className="payments-table">
        <thead>
          <tr>
            <th>Student</th>
            <th>Collection</th>
            <th>Amount</th>
            <th>Method</th>
            <th>Status</th>
            <th>Paid At</th>
            <th>Actions</th>
          </tr>
        </thead>

        <tbody>
          {payments.map((payment) => (
            <tr key={payment.id}>
              <td>
                <span>{payment.full_name}</span>
                <small>{payment.student_number}</small>
              </td>

              <td>
                <span>{payment.collection_title}</span>
                <small>{formatDate(payment.due_date)}</small>
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
                <div className="payments-actions">
                  {payment.status !== "paid" && (
                    <button
                      type="button"
                      onClick={() => onUpdateStatus(payment, "paid")}
                    >
                      Mark Paid
                    </button>
                  )}

                  {payment.status !== "pending" && (
                    <button
                      type="button"
                      onClick={() => onUpdateStatus(payment, "pending")}
                    >
                      Pending
                    </button>
                  )}

                  {payment.status !== "overdue" && (
                    <button
                      type="button"
                      onClick={() => onUpdateStatus(payment, "overdue")}
                    >
                      Overdue
                    </button>
                  )}
                </div>
              </td>
            </tr>
          ))}

          {payments.length === 0 && (
            <tr>
              <td colSpan="7">No payments found.</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

export default PaymentTable;