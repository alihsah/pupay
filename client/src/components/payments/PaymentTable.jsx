function PaymentTable({ payments, onUpdateStatus, formatCurrency, formatDate }) {
  const handleStatusSelect = (event, payment) => {
    const nextStatus = event.target.value;

    if (!nextStatus) return;

    onUpdateStatus(payment, nextStatus);

    event.target.value = "";
  };

  return (
    <div className="payments-table-wrap">
      <table className="payments-table">
        <thead>
          <tr>
            <th>Student</th>
            <th>Collection</th>
            <th>Program</th>
            <th>Amount</th>
            <th>Method</th>
            <th>Status</th>
            <th>Paid At</th>
            <th>Action</th>
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
                <small>Reference: {payment.reference_number || "N/A"}</small>
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

              <td>{payment.payment_method || "cash"}</td>

              <td>
                <span className={`status-pill ${payment.status}`}>
                  {payment.status}
                </span>
              </td>

              <td>
                {payment.paid_at ? formatDate(payment.paid_at) : "Not paid"}
              </td>

              <td>
                <select
                  className="payment-status-select"
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

          {payments.length === 0 && (
            <tr>
              <td colSpan="8">No payment records found.</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

export default PaymentTable;