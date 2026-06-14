import { Resend } from "resend";
import db from "../config/db.js";

const isEmailNotificationsEnabled = () =>
  process.env.EMAIL_NOTIFICATIONS_ENABLED === "true";

const formatAnnouncementType = (type = "general") =>
  type
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");

const escapeHtml = (value = "") =>
  String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

const normalizeAudienceValue = (value) => value || "ALL";

const formatFromName = (fromName) =>
  String(fromName || "PUPay")
    .replace(/[\r\n]/g, " ")
    .replace(/"/g, '\\"')
    .trim() || "PUPay";

const formatSenderAddress = ({ from, fromName }) => {
  const sanitizedFrom = String(from || "").replace(/[\r\n]/g, " ").trim();

  if (sanitizedFrom.includes("<")) {
    return sanitizedFrom;
  }

  return `"${formatFromName(fromName)}" <${sanitizedFrom}>`;
};

const getSafeErrorMessage = (error) => {
  const apiKey = process.env.RESEND_API_KEY;
  const message = error?.message || error?.name || "Unknown Resend error";

  if (!apiKey) {
    return message;
  }

  return String(message).replaceAll(apiKey, "[redacted]");
};

const getEmailConfig = () => {
  if (!isEmailNotificationsEnabled()) {
    return null;
  }

  const apiKey = process.env.RESEND_API_KEY?.trim();
  const from = process.env.RESEND_FROM?.trim();
  const fromName = process.env.EMAIL_FROM_NAME || "PUPay";

  if (!apiKey || !from) {
    console.warn(
      "Email notifications are enabled, but RESEND_API_KEY or RESEND_FROM is missing."
    );
    return null;
  }

  return {
    apiKey,
    from: formatSenderAddress({ from, fromName }),
  };
};

const getAnnouncementRecipients = async ({ course, year_level, section }) => {
  const targetCourse = normalizeAudienceValue(course);
  const targetYearLevel = normalizeAudienceValue(year_level);
  const targetSection = normalizeAudienceValue(section);

  const [students] = await db.query(
    `
    SELECT DISTINCT
      id,
      full_name,
      personal_email
    FROM students
    WHERE status = 'active'
      AND personal_email IS NOT NULL
      AND TRIM(personal_email) <> ''
      AND (? = 'ALL' OR course = ?)
      AND (? = 'ALL' OR year_level = ?)
      AND (? = 'ALL' OR section = ?)
    `,
    [
      targetCourse,
      targetCourse,
      targetYearLevel,
      targetYearLevel,
      targetSection,
      targetSection,
    ]
  );

  const seenEmails = new Set();

  return students
    .map((student) => ({
      id: student.id,
      fullName: student.full_name,
      email: String(student.personal_email || "").trim(),
    }))
    .filter((student) => {
      const normalizedEmail = student.email.toLowerCase();

      if (!normalizedEmail || seenEmails.has(normalizedEmail)) {
        return false;
      }

      seenEmails.add(normalizedEmail);
      return true;
    });
};

const buildAnnouncementEmail = (announcement) => {
  const typeLabel = formatAnnouncementType(announcement.type);
  const title = announcement.title || "PUPay Announcement";
  const message = announcement.message || "";

  const text = [
    title,
    "",
    `Type: ${typeLabel}`,
    "",
    message,
    "",
    "This notification was sent by PUPay.",
  ].join("\n");

  const html = `
    <div style="font-family: Arial, sans-serif; color: #1f2937; line-height: 1.6;">
      <p style="margin: 0 0 12px; color: #6b7280;">PUPay Announcement</p>
      <h2 style="margin: 0 0 12px; color: #c9184a;">${escapeHtml(title)}</h2>
      <p style="margin: 0 0 16px;"><strong>Type:</strong> ${escapeHtml(typeLabel)}</p>
      <div style="white-space: pre-line;">${escapeHtml(message)}</div>
      <hr style="border: 0; border-top: 1px solid #e5e7eb; margin: 24px 0 12px;" />
      <p style="margin: 0; color: #6b7280; font-size: 13px;">
        This notification was sent by PUPay.
      </p>
    </div>
  `;

  return { subject: `[PUPay] ${title}`, text, html };
};

export const sendAnnouncementEmailNotifications = async (announcement) => {
  if (!isEmailNotificationsEnabled()) {
    return { skipped: true, reason: "email_notifications_disabled" };
  }

  if (announcement.status !== "active") {
    return { skipped: true, reason: "announcement_not_active" };
  }

  const config = getEmailConfig();

  if (!config) {
    return { skipped: true, reason: "missing_email_config" };
  }

  const recipients = await getAnnouncementRecipients(announcement);

  if (recipients.length === 0) {
    return { skipped: true, reason: "no_matching_recipients" };
  }

  const resend = new Resend(config.apiKey);
  const email = buildAnnouncementEmail(announcement);

  const results = await Promise.allSettled(
    recipients.map((recipient) =>
      resend.emails.send({
        from: config.from,
        to: [recipient.email],
        subject: email.subject,
        text: email.text,
        html: email.html,
      })
    )
  );

  const failedResults = results.filter(
    (result) => result.status === "rejected" || result.value?.error
  );

  if (failedResults.length > 0) {
    const firstFailure = failedResults[0];
    const error =
      firstFailure.status === "rejected"
        ? firstFailure.reason
        : firstFailure.value.error;

    throw new Error(
      `Resend email notification failed for ${failedResults.length} of ${
        recipients.length
      } recipient(s): ${getSafeErrorMessage(error)}`
    );
  }

  return { sent: true, recipientCount: recipients.length };
};
