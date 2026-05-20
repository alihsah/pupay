// ========================================
// FUTURE API SERVICE
// Handles student-related API requests
// ========================================

// GET /api/students
export async function getStudents() {
  // const response = await fetch("/api/students");
  // return response.json();

  return [];
}

// GET /api/students/:id
export async function getStudentById(id) {
  // const response = await fetch(`/api/students/${id}`);
  // return response.json();

  return null;
}

// GET /api/students/:id/payments
export async function getStudentPayments(id) {
  // const response = await fetch(`/api/students/${id}/payments`);
  // return response.json();

  return [];
}

// GET /api/students/:id/collections
export async function getStudentCollections(id) {
  // const response = await fetch(`/api/students/${id}/collections`);
  // return response.json();

  return [];
}