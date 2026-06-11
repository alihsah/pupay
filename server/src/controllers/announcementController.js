import db from "../config/db.js";

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
        created_at,
        updated_at
      FROM announcements
      WHERE status = 'active'
        AND (course = ? OR course = 'ALL')
        AND (year_level = ? OR year_level = 'ALL')
        AND (section = ? OR section = 'ALL')
      ORDER BY created_at DESC
      `,
      [course, yearLevel, section]
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