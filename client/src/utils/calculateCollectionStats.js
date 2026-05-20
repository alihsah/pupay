export function calculateCollectionStats(collections, payments) {
  const totalCollections = collections.length;

  const totalExpected = collections.reduce((total, collection) => {
    return total + collection.amount * collection.totalStudents;
  }, 0);

  const totalCollected = payments
    .filter((payment) => payment.status === "Paid")
    .reduce((total, payment) => total + payment.amount, 0);

  const pendingPayments = payments.filter(
    (payment) => payment.status === "Pending"
  ).length;

  const overduePayments = payments.filter(
    (payment) => payment.status === "Overdue"
  ).length;

  const paidPayments = payments.filter(
    (payment) => payment.status === "Paid"
  ).length;

  return {
    totalCollections,
    totalExpected,
    totalCollected,
    pendingPayments,
    overduePayments,
    paidPayments,
  };
}