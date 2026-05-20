// ========================================
// FUTURE API
// POST /api/ai/generate-reminder
// POST /api/ai/generate-summary
// POST /api/ai/generate-insights
// POST /api/ai/generate-announcement
// Returns AI-generated text responses
// ========================================

export const dummyAIResponses = {
  reminder:
    "Good day, BSIT 3-2 students. This is a reminder to settle your Foundation Day contribution of ₱500 on or before May 25, 2026. Thank you.",

  summary:
    "42 out of 60 students have already paid for the Foundation Day Contribution. There are 18 students remaining with pending or overdue payments.",

  insight:
    "A reminder is recommended because 30% of students have not yet completed their payment and the due date is approaching.",

  announcement:
    "The Foundation Day Contribution collection is now open. Please settle your payment as early as possible to avoid delays.",
};