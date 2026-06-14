import nodemailer from "nodemailer";
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

const getEmailConfig = () => {
  if (!isEmailNotificationsEnabled()) {
    return null;
  }

  const user = process.env.GMAIL_USER;
  const pass = process.env.GMAIL_APP_PASSWORD;
  const fromName = process.env.EMAIL_FROM_NAME || "PUPay";

  if (!user || !pass) {
    console.warn(
      "Email notifications are enabled, but GMAIL_USER or GMAIL_APP_PASSWORD is missing."
    );
    return null;
  }

  return { user, pass, fromName };
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

   const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    family: 4,
    auth: {
      user: config.user,
      pass: config.pass,
    },
    connectionTimeout: 15000,
    greetingTimeout: 15000,
    socketTimeout: 20000,
  });

  const email = buildAnnouncementEmail(announcement);

  await transporter.sendMail({
    from: `"${formatFromName(config.fromName)}" <${config.user}>`,
    bcc: recipients.map((recipient) => recipient.email),
    subject: email.subject,
    text: email.text,
    html: email.html,
  });

  return { sent: true, recipientCount: recipients.length };
};
