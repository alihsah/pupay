// ========================================
// FUTURE API SERVICE
// Clerk handles most login/register logic.
// Backend mainly verifies current user.
// ========================================

// GET /api/auth/me
export async function getCurrentUser() {
  // const response = await fetch("/api/auth/me");
  // return response.json();

  return {
    id: 1,
    name: "Demo User",
    role: "admin",
  };
}