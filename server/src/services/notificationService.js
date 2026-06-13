import db from "../config/db.js";

export const ensureAnnouncementReadsTable = async () => {
  await db.query(`
    CREATE TABLE IF NOT EXISTS announcement_reads (
      announcement_id INT NOT NULL,
      student_id INT NOT NULL,
      read_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (announcement_id, student_id),
      INDEX idx_announcement_reads_student (student_id),
      CONSTRAINT fk_announcement_reads_announcement
        FOREIGN KEY (announcement_id)
        REFERENCES announcements(id)
        ON DELETE CASCADE,
      CONSTRAINT fk_announcement_reads_student
        FOREIGN KEY (student_id)
        REFERENCES students(id)
        ON DELETE CASCADE
    )
  `);
};

export const getStudentAnnouncementTargetValues = (user) => {
  return [user.course, user.yearLevel, user.section];
};

export const getStudentUnreadAnnouncementCount = async (user) => {
  await ensureAnnouncementReadsTable();

  const [rows] = await db.query(
    `
    SELECT COUNT(*) AS unread_count
    FROM announcements
    LEFT JOIN announcement_reads
      ON announcement_reads.announcement_id = announcements.id
      AND announcement_reads.student_id = ?
    WHERE announcements.status = 'active'
      AND (announcements.course = ? OR announcements.course = 'ALL')
      AND (announcements.year_level = ? OR announcements.year_level = 'ALL')
      AND (announcements.section = ? OR announcements.section = 'ALL')
      AND announcement_reads.read_at IS NULL
    `,
    [user.studentId, ...getStudentAnnouncementTargetValues(user)]
  );

  return Number(rows[0]?.unread_count || 0);
};

export const markStudentAnnouncementRead = async (announcementId, user) => {
  await ensureAnnouncementReadsTable();

  const [announcements] = await db.query(
    `
    SELECT id
    FROM announcements
    WHERE id = ?
      AND status = 'active'
      AND (course = ? OR course = 'ALL')
      AND (year_level = ? OR year_level = 'ALL')
      AND (section = ? OR section = 'ALL')
    LIMIT 1
    `,
    [announcementId, ...getStudentAnnouncementTargetValues(user)]
  );

  if (announcements.length === 0) {
    return false;
  }

  await db.query(
    `
    INSERT INTO announcement_reads (
      announcement_id,
      student_id,
      read_at
    )
    VALUES (?, ?, NOW())
    ON DUPLICATE KEY UPDATE read_at = read_at
    `,
    [announcementId, user.studentId]
  );

  return true;
};
