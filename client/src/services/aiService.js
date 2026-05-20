// ========================================
// FUTURE API SERVICE
// Handles AI-related API requests
// ========================================

// POST /api/ai/generate-reminder
export async function generateReminder(promptData) {
  // const response = await fetch("/api/ai/generate-reminder", {
  //   method: "POST",
  //   headers: { "Content-Type": "application/json" },
  //   body: JSON.stringify(promptData),
  // });
  // return response.json();

  return {
    result:
      "Good day, students. This is a friendly reminder to settle your payment before the due date. Thank you.",
  };
}

// POST /api/ai/generate-summary
export async function generateSummary(collectionData) {
  // const response = await fetch("/api/ai/generate-summary", {
  //   method: "POST",
  //   headers: { "Content-Type": "application/json" },
  //   body: JSON.stringify(collectionData),
  // });
  // return response.json();

  return {
    result:
      "Most students have already paid, but there are still some pending payments that need follow-up.",
  };
}

// POST /api/ai/generate-insights
export async function generateInsights(paymentData) {
  // const response = await fetch("/api/ai/generate-insights", {
  //   method: "POST",
  //   headers: { "Content-Type": "application/json" },
  //   body: JSON.stringify(paymentData),
  // });
  // return response.json();

  return {
    result:
      "Consider sending a reminder because several students still have pending payments.",
  };
}

// POST /api/ai/generate-announcement
export async function generateAnnouncement(announcementData) {
  // const response = await fetch("/api/ai/generate-announcement", {
  //   method: "POST",
  //   headers: { "Content-Type": "application/json" },
  //   body: JSON.stringify(announcementData),
  // });
  // return response.json();

  return {
    result:
      "The payment collection is now open. Please settle your contribution before the deadline.",
  };
}