export function formatDate(date) {
  if (!date) return "Not yet paid";

  return new Date(date).toLocaleDateString("en-PH", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}