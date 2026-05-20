// ========================================
// FUTURE API SERVICE
// Handles announcement-related API requests
// ========================================

// GET /api/announcements
export async function getAnnouncements() {
  // const response = await fetch("/api/announcements");
  // return response.json();

  return [];
}

// POST /api/announcements
export async function createAnnouncement(announcementData) {
  // const response = await fetch("/api/announcements", {
  //   method: "POST",
  //   headers: { "Content-Type": "application/json" },
  //   body: JSON.stringify(announcementData),
  // });
  // return response.json();

  return announcementData;
}

// PUT /api/announcements/:id
export async function updateAnnouncement(id, announcementData) {
  // const response = await fetch(`/api/announcements/${id}`, {
  //   method: "PUT",
  //   headers: { "Content-Type": "application/json" },
  //   body: JSON.stringify(announcementData),
  // });
  // return response.json();

  return { id, ...announcementData };
}

// DELETE /api/announcements/:id
export async function deleteAnnouncement(id) {
  // await fetch(`/api/announcements/${id}`, {
  //   method: "DELETE",
  // });

  return id;
}