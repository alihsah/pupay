// ========================================
// FUTURE API SERVICE
// Handles payment-related API requests
// ========================================

// GET /api/payments
export async function getPayments() {
  // const response = await fetch("/api/payments");
  // return response.json();

  return [];
}

// GET /api/payments/:id
export async function getPaymentById(id) {
  // const response = await fetch(`/api/payments/${id}`);
  // return response.json();

  return null;
}

// GET /api/payments/student/:studentId
export async function getPaymentsByStudent(studentId) {
  // const response = await fetch(`/api/payments/student/${studentId}`);
  // return response.json();

  return [];
}

// POST /api/payments
export async function createCashPayment(paymentData) {
  // const response = await fetch("/api/payments", {
  //   method: "POST",
  //   headers: { "Content-Type": "application/json" },
  //   body: JSON.stringify(paymentData),
  // });
  // return response.json();

  return paymentData;
}

// POST /api/payments/paymongo/create-checkout
export async function createPayMongoCheckout(paymentData) {
  // const response = await fetch("/api/payments/paymongo/create-checkout", {
  //   method: "POST",
  //   headers: { "Content-Type": "application/json" },
  //   body: JSON.stringify(paymentData),
  // });
  // return response.json();

  return {
    checkoutUrl: "#",
    ...paymentData,
  };
}