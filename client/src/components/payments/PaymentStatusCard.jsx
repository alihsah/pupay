function PaymentStatusCard({ label, value }) {
  return (
    <article className="payment-status-card">
      <span>{label}</span>
      <strong>{value}</strong>
    </article>
  );
}

export default PaymentStatusCard;