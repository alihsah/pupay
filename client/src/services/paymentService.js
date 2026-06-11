import api from "./api";

export const getPayments = async () => {
  const response = await api.get("/payments");
  return response.data;
};

export const getStudentPayments = async (studentId) => {
  const response = await api.get(`/payments/student/${studentId}`);
  return response.data;
};

export const getPaymentsByCollection = async (collectionId) => {
  const response = await api.get(`/payments/collection/${collectionId}`);
  return response.data;
};

export const createPayment = async (paymentData) => {
  const response = await api.post("/payments", paymentData);
  return response.data;
};

export const updatePaymentStatus = async (id, paymentData) => {
  const response = await api.patch(`/payments/${id}/status`, paymentData);
  return response.data;
};

export const createPayMongoCheckout = async (paymentId) => {
  const response = await api.post(`/payments/${paymentId}/paymongo-checkout`);
  return response.data;
};