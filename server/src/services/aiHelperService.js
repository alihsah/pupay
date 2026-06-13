import { generateGeminiText } from "./geminiService.js";

const formatCurrency = (amount) => {
  return Number(amount || 0).toLocaleString("en-PH", {
    style: "currency",
    currency: "PHP",
  });
};

const formatDate = (date) => {
  if (!date) return "No due date provided";

  return new Date(date).toLocaleDateString("en-PH", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

const buildCollectionContext = (data = {}) => {
  const { collection, progress, stats } = data;

  return `
Collection Information:
- Title: ${collection?.title || "Untitled collection"}
- Description: ${collection?.description || "No description provided"}
- Due Date: ${formatDate(collection?.due_date)}
- Goal Amount: ${formatCurrency(collection?.goal_amount)}
- Student Contribution: ${formatCurrency(collection?.amount)}

Progress:
- Progress Percentage: ${progress?.progress ?? 0}%
- Total Collected: ${formatCurrency(
    progress?.totalCollected || stats?.totalCollected
  )}
- Goal Amount from Progress: ${formatCurrency(progress?.goalAmount)}
- Is Locked: ${progress?.isLocked ? "Yes, goal reached" : "No, still open"}

Payment Statistics:
- Total Students: ${stats?.totalStudents || 0}
- Paid Students: ${stats?.paidCount || 0}
- Pending Students: ${stats?.pendingCount || 0}
- Overdue Students: ${stats?.overdueCount || 0}
`;
};

const fallbackReminder = (data = {}) => {
  const { collection, stats, tone, reminderType } = data;

  const intro =
    tone === "formal"
      ? "Good day, students."
      : tone === "urgent"
      ? "Important reminder, students."
      : "Hello, students!";

  const reminderMessage = {
    pending:
      "If your payment is still pending, please settle it before the deadline.",
    overdue:
      "If your payment is already overdue, please settle it as soon as possible.",
    final:
      "This is a final reminder to settle your payment before the collection closes.",
    general:
      "Kindly settle your payment before the deadline.",
  };

  return `${intro} This is a reminder regarding the collection "${
    collection?.title || "Untitled collection"
  }" due on ${formatDate(collection?.due_date)}. Currently, ${
    stats?.paidCount || 0
  } out of ${stats?.totalStudents || 0} students have paid, while ${
    stats?.pendingCount || 0
  } are still pending and ${
    stats?.overdueCount || 0
  } are overdue. ${
    reminderMessage[reminderType] || reminderMessage.general
  } Thank you.`;
};

const fallbackSummary = (data = {}) => {
  const { collection, progress, stats } = data;

  return `The collection "${
    collection?.title || "Untitled collection"
  }" is currently ${progress?.progress || 0}% complete. A total of ${
    stats?.paidCount || 0
  } out of ${stats?.totalStudents || 0} students have paid, with ${
    stats?.pendingCount || 0
  } pending and ${
    stats?.overdueCount || 0
  } overdue. The admin should monitor unpaid students and send a payment reminder if needed.`;
};

const fallbackAnnouncement = (data = {}) => {
  const { collection } = data;

  return `Good day, students. Please be reminded about the collection "${
    collection?.title || "Untitled collection"
  }" with a due date of ${formatDate(
    collection?.due_date
  )}. Kindly settle your payment before the deadline. Thank you.`;
};

export const generateAIReminder = async (data = {}) => {
  try {
    const context = buildCollectionContext(data);

    const prompt = `
You are an AI assistant inside PUPay, a university payment management system.

Task:
Generate a payment reminder message for students.

Tone:
${data.tone || "friendly"}

Reminder Type:
${data.reminderType || "general"}

${context}

Rules:
- Keep it related to student payment collection.
- Mention the collection title and due date.
- Mention payment status only if helpful.
- Do not sound threatening.
- Make it polite and clear.
- Keep it 2 to 5 sentences only.
- Do not use hashtags.
- Do not include markdown formatting.
`;

    const text = await generateGeminiText(prompt);

    return {
      text: text || fallbackReminder(data),
      source: text ? "gemini" : "fallback",
    };
  } catch (error) {
    console.error("AI reminder fallback used:", error.message);

    return {
      text: fallbackReminder(data),
      source: "fallback",
    };
  }
};

export const generateAICollectionSummary = async (data) => {
  try {
    const context = buildCollectionContext(data);

    const prompt = `
You are an AI assistant inside PUPay, a university payment management system.

Task:
Generate a short admin summary of the collection status.

${context}

Rules:
- Explain the current collection progress.
- Mention paid, pending, and overdue counts.
- Include one useful recommendation for the admin.
- Keep it concise and professional.
- Use 1 short paragraph only.
- Do not include markdown formatting.
`;

    const text = await generateGeminiText(prompt);

    return {
      text: text || fallbackSummary(data),
      source: text ? "gemini" : "fallback",
    };
  } catch (error) {
    console.error("AI summary fallback used:", error.message);

    return {
      text: fallbackSummary(data),
      source: "fallback",
    };
  }
};

export const generateAIAnnouncement = async (data) => {
  try {
    const context = buildCollectionContext(data);

    const prompt = `
You are an AI assistant inside PUPay, a university payment management system.

Task:
Generate a student announcement related to this collection.

Admin Instruction:
${data.instruction || "Remind students about the collection payment."}

${context}

Rules:
- Make it suitable for a school payment announcement.
- Keep it polite, clear, and student-friendly.
- Mention the collection title.
- Mention the due date if available.
- Keep it 2 to 4 sentences.
- Do not use hashtags.
- Do not include markdown formatting.
`;

    const text = await generateGeminiText(prompt);

    return {
      text: text || fallbackAnnouncement(data),
      source: text ? "gemini" : "fallback",
    };
  } catch (error) {
    console.error("AI announcement fallback used:", error.message);

    return {
      text: fallbackAnnouncement(data),
      source: "fallback",
    };
  }
};
