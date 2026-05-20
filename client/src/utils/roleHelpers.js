export function isAdminRole(role) {
  return role === "admin" || role === "treasurer";
}

export function isStudentRole(role) {
  return role === "student";
}

export function getDefaultRouteByRole(role) {
  if (isAdminRole(role)) return "/admin/dashboard";
  if (isStudentRole(role)) return "/student/dashboard";

  return "/unauthorized";
}