import db from "../config/db.js";
import { ensureAnnouncementReadsTable } from "../services/notificationService.js";

export const getAllAnnouncements = async (req, res) => {
  try {
    const [announcements] = await db.query(`
      SELECT
        id,
        title,
        message,
        type,
        course,
        year_level,
        section,
        status,
        created_by,
        created_at,
        updated_at
      FROM announcements
      ORDER BY created_at DESC
    `);

    res.status(200).json(announcements);
  } catch (error) {
    console.error("Get announcements error:", error);
    res.status(500).json({ message: "Failed to retrieve announcements." });
  }
};

export const getMyAnnouncements = async (req, res) => {
  try {
    if (!req.user || req.user.role !== "student") {
      return res.status(403).json({
        message: "Only students can access their announcements.",
      });
    }

    const { course, yearLevel, section } = req.user;
    const studentId = req.user.studentId;

    await ensureAnnouncementReadsTable();

    const [announcements] = await db.query(
      `
      SELECT
        announcements.id,
        announcements.title,
        announcements.message,
        announcements.type,
        announcements.course,
        announcements.year_level,
        announcements.section,
        announcements.status,
        announcements.created_at,
        announcements.updated_at,
        CASE
          WHEN announcement_reads.read_at IS NULL THEN FALSE
          ELSE TRUE
        END AS is_read,
        announcement_reads.read_at
      FROM announcements
      LEFT JOIN announcement_reads
        ON announcement_reads.announcement_id = announcements.id
        AND announcement_reads.student_id = ?
      WHERE status = 'active'
        AND (announcements.course = ? OR announcements.course = 'ALL')
        AND (announcements.year_level = ? OR announcements.year_level = 'ALL')
        AND (announcements.section = ? OR announcements.section = 'ALL')
      ORDER BY announcements.created_at DESC
      `,
      [studentId, course, yearLevel, section]
    );

    res.status(200).json(announcements);
  } catch (error) {
    console.error("Get student announcements error:", error);
    res.status(500).json({
      message: "Failed to retrieve your announcements.",
    });
  }
};

export const getAnnouncementById = async (req, res) => {
  try {
    const { id } = req.params;

    const [announcements] = await db.query(
      `
      SELECT
        id,
        title,
        message,
        type,
        course,
        year_level,
        section,
        status,
        created_by,
        created_at,
        updated_at
      FROM announcements
      WHERE id = ?
      `,
      [id]
    );

    if (announcements.length === 0) {
      return res.status(404).json({ message: "Announcement not found." });
    }

    res.status(200).json(announcements[0]);
  } catch (error) {
    console.error("Get announcement error:", error);
    res.status(500).json({ message: "Failed to retrieve announcement." });
  }
};

export const createAnnouncement = async (req, res) => {
  try {
    const {
      title,
      message,
      type = "general",
      course = "ALL",
      year_level = "ALL",
      section = "ALL",
      status = "active",
    } = req.body;

    if (!title || !message) {
      return res.status(400).json({
        message: "Title and message are required.",
      });
    }

    if (!["general", "payment_reminder", "deadline"].includes(type)) {
      return res.status(400).json({
        message: "Type must be general, payment_reminder, or deadline.",
      });
    }

    if (!["active", "archived"].includes(status)) {
      return res.status(400).json({
        message: "Status must be active or archived.",
      });
    }

    await db.query(
      `
      INSERT INTO announcements (
        title,
        message,
        type,
        course,
        year_level,
        section,
        status,
        created_by
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `,
      [
        title,
        message,
        type,
        course,
        year_level,
        section,
        status,
        req.user?.clerkUserId || null,
      ]
    );

    res.status(201).json({ message: "Announcement created successfully." });
  } catch (error) {
    console.error("Create announcement error:", error);
    res.status(500).json({ message: "Failed to create announcement." });
  }
};

export const updateAnnouncement = async (req, res) => {
  try {
    const { id } = req.params;

    const {
      title,
      message,
      type,
      course,
      year_level,
      section,
      status,
    } = req.body;

    if (!title || !message) {
      return res.status(400).json({
        message: "Title and message are required.",
      });
    }

    await db.query(
      `
      UPDATE announcements
      SET
        title = ?,
        message = ?,
        type = ?,
        course = ?,
        year_level = ?,
        section = ?,
        status = ?
      WHERE id = ?
      `,
      [
        title,
        message,
        type,
        course,
        year_level,
        section,
        status,
        id,
      ]
    );

    res.status(200).json({ message: "Announcement updated successfully." });
  } catch (error) {
    console.error("Update announcement error:", error);
    res.status(500).json({ message: "Failed to update announcement." });
  }
};

export const updateAnnouncementStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!["active", "archived"].includes(status)) {
      return res.status(400).json({
        message: "Status must be active or archived.",
      });
    }

    await db.query(
      `
      UPDATE announcements
      SET status = ?
      WHERE id = ?
      `,
      [status, id]
    );

    res.status(200).json({
      message: "Announcement status updated successfully.",
    });
  } catch (error) {
    console.error("Update announcement status error:", error);
    res.status(500).json({
      message: "Failed to update announcement status.",
    });
  }
};
