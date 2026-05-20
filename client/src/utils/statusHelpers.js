export function getStatusClass(status) {
  return status?.toLowerCase() || "pending";
}

export function isPaid(status) {
  return status === "Paid";
}

export function isPending(status) {
  return status === "Pending";
}

export function isOverdue(status) {
  return status === "Overdue";
}