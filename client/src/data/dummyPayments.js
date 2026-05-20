// ========================================
// FUTURE API
// GET /api/payments
// Returns all payment records
// ========================================

export const dummyPayments = [
  {
    id: 1,
    studentName: "Maria Santos",
    studentNumber: "2023-0001",
    collectionTitle: "Foundation Day Contribution",
    amount: 500,
    method: "PayMongo",
    status: "Paid",
    paymentDate: "2026-05-18",
  },
  {
    id: 2,
    studentName: "John Reyes",
    studentNumber: "2023-0002",
    collectionTitle: "Foundation Day Contribution",
    amount: 500,
    method: "Cash",
    status: "Pending",
    paymentDate: null,
  },
  {
    id: 3,
    studentName: "Ana Cruz",
    studentNumber: "2023-0003",
    collectionTitle: "Class Fund",
    amount: 100,
    method: "Cash",
    status: "Overdue",
    paymentDate: null,
  },
];