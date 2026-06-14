import db from "../config/db.js";
import { sendAnnouncementEmailNotifications } from "../services/emailService.js";
import {
  getCollectionLockState,
  syncCollectionLockStatus,
} from "../services/collectionLockService.js";

const formatCollectionDueDate = (dueDate) => {
  if (!dueDate) return null;

  const parsedDate = new Date(dueDate);

  if (Number.isNaN(parsedDate.getTime())) {
    return String(dueDate);
  }

  return parsedDate.toLocaleDateString("en-PH", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

const buildCollectionAnnouncementMessage = ({ title, due_date }) => {
  const dueDateText = formatCollectionDueDate(due_date);
  const dueDateSentence = dueDateText ? ` The due date is ${dueDateText}.` : "";

  return `A new collection named "${title}" has been assigned to you.${dueDateSentence} Please check My Collections to view your contribution amount, due date, and payment status.`;
};

const createCollectionAnnouncementNotification = async ({
  title,
  course,
  year_level,
  section,
  due_date,
  status,
  created_by,
}) => {
  if (status !== "active") {
    return;
  }

  const announcement = {
    title: `New Collection: ${title}`,
    message: buildCollectionAnnouncementMessage({ title, due_date }),
    type: "payment_reminder",
    course,
    year_level,
    section,
    status: "active",
    created_by,
  };

  const [existingAnnouncements] = await db.query(
    `
    SELECT id
    FROM announcements
    WHERE type = ?
      AND title = ?
      AND message = ?
      AND course = ?
      AND year_level = ?
      AND section = ?
      AND status = 'active'
      AND created_by <=> ?
      AND created_at >= DATE_SUB(NOW(), INTERVAL 10 MINUTE)
    LIMIT 1
    `,
    [
      announcement.type,
      announcement.title,
      announcement.message,
      announcement.course,
      announcement.year_level,
      announcement.section,
      announcement.created_by,
    ]
  );

  if (existingAnnouncements.length > 0) {
    return;
  }

  const [result] = await db.query(
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
      announcement.title,
      announcement.message,
      announcement.type,
      announcement.course,
      announcement.year_level,
      announcement.section,
      announcement.status,
      announcement.created_by,
    ]
  );

  await sendAnnouncementEmailNotifications({
    id: result.insertId,
    ...announcement,
  });
};

export const getAllCollections = async (req, res) => {
  try {
    const [collections] = await db.query(`
      SELECT
        id,
        title,
        description,
        goal_amount,
        amount,
        course,
        year_level,
        section,
        due_date,
        status,
        is_locked,
        locked_at,
        created_by,
        created_at,
        updated_at
      FROM collections
      ORDER BY created_at DESC
    `);

    res.status(200).json(collections);
  } catch (error) {
    console.error("Get collections error:", error);
    res.status(500).json({ message: "Failed to retrieve collections." });
  }
};

export const getCollectionById = async (req, res) => {
  try {
    const { id } = req.params;

    const [collections] = await db.query(
      `
      SELECT
        id,
        title,
        description,
        goal_amount,
        amount,
        course,
        year_level,
        section,
        due_date,
        status,
        is_locked,
        locked_at,
        created_by,
        created_at,
        updated_at
      FROM collections
      WHERE id = ?
      `,
      [id]
    );

    if (collections.length === 0) {
      return res.status(404).json({ message: "Collection not found." });
    }

    res.status(200).json(collections[0]);
  } catch (error) {
    console.error("Get collection error:", error);
    res.status(500).json({ message: "Failed to retrieve collection." });
  }
};

export const getCollectionProgress = async (req, res) => {
  try {
    const { id } = req.params;

    const [collections] = await db.query(
      `
      SELECT
        id,
        title,
        goal_amount,
        amount,
        status,
        is_locked,
        locked_at
      FROM collections
      WHERE id = ?
      `,
      [id]
    );

    if (collections.length === 0) {
      return res.status(404).json({
        message: "Collection not found.",
      });
    }

    const collection = collections[0];

    const [summary] = await db.query(
      `
      SELECT
        COUNT(*) AS total_students,
        SUM(CASE WHEN status = 'paid' THEN 1 ELSE 0 END) AS paid_count,
        SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) AS pending_count,
        SUM(CASE WHEN status = 'overdue' THEN 1 ELSE 0 END) AS overdue_count,
        COALESCE(SUM(amount_paid), 0) AS total_collected
      FROM payments
      WHERE collection_id = ?
      `,
      [id]
    );

    const totalCollected = Number(summary[0].total_collected || 0);
    const goalAmount = Number(collection.goal_amount || 0);

    const progress =
      goalAmount > 0
        ? Math.min(Math.round((totalCollected / goalAmount) * 100), 100)
        : 0;

    res.status(200).json({
      collectionId: collection.id,
      title: collection.title,
      goalAmount,
      studentContribution: Number(collection.amount || 0),
      totalCollected,
      progress,
      totalStudents: Number(summary[0].total_students || 0),
      paidCount: Number(summary[0].paid_count || 0),
      pendingCount: Number(summary[0].pending_count || 0),
      overdueCount: Number(summary[0].overdue_count || 0),
      status: collection.status,
      isLocked: Boolean(collection.is_locked),
      lockedAt: collection.locked_at,
    });
  } catch (error) {
    console.error("Get collection progress error:", error);
    res.status(500).json({
      message: "Failed to retrieve collection progress.",
    });
  }
};

export const createCollection = async (req, res) => {
  const connection = await db.getConnection();

  try {
    const {
      title,
      description,
      goal_amount,
      amount,
      course = "ALL",
      year_level = "ALL",
      section = "ALL",
      due_date,
      status = "active",
    } = req.body;

    if (!title || !due_date) {
      return res.status(400).json({
        message: "Title and due date are required.",
      });
    }

    if (!goal_amount && !amount) {
      return res.status(400).json({
        message: "Goal amount or student contribution amount is required.",
      });
    }

    await connection.beginTransaction();

    const studentFilters = [];
    const studentValues = [];

    studentFilters.push("status = 'active'");

    if (course !== "ALL") {
      studentFilters.push("course = ?");
      studentValues.push(course);
    }

    if (year_level !== "ALL") {
      studentFilters.push("year_level = ?");
      studentValues.push(year_level);
    }

    if (section !== "ALL") {
      studentFilters.push("section = ?");
      studentValues.push(section);
    }

    const [students] = await connection.query(
      `
      SELECT id
      FROM students
      WHERE ${studentFilters.join(" AND ")}
      `,
      studentValues
    );

    if (students.length === 0) {
      await connection.rollback();

      return res.status(400).json({
        message: "No active students match this collection target.",
      });
    }

    let finalGoalAmount;
    let studentContribution;

    if (goal_amount) {
      finalGoalAmount = Number(goal_amount);
      studentContribution = Number((finalGoalAmount / students.length).toFixed(2));
    } else {
      studentContribution = Number(amount);
      finalGoalAmount = Number((studentContribution * students.length).toFixed(2));
    }

    if (finalGoalAmount <= 0 || studentContribution <= 0) {
      await connection.rollback();

      return res.status(400).json({
        message: "Collection amount must be greater than zero.",
      });
    }

    const [collectionResult] = await connection.query(
      `
      INSERT INTO collections (
        title,
        description,
        goal_amount,
        amount,
        course,
        year_level,
        section,
        due_date,
        status,
        is_locked,
        locked_at,
        created_by
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
      [
        title,
        description || null,
        finalGoalAmount,
        studentContribution,
        course,
        year_level,
        section,
        due_date,
        status,
        false,
        null,
        req.user?.clerkUserId || null,
      ]
    );

    const collectionId = collectionResult.insertId;

    const paymentValues = students.map((student) => [
      student.id,
      collectionId,
      studentContribution,
      0,
      "pending",
      "cash",
    ]);

    await connection.query(
      `
      INSERT INTO payments (
        student_id,
        collection_id,
        amount_due,
        amount_paid,
        status,
        payment_method
      )
      VALUES ?
      `,
      [paymentValues]
    );

    await connection.commit();

    createCollectionAnnouncementNotification({
      title,
      course,
      year_level,
      section,
      due_date,
      status,
      created_by: req.user?.clerkUserId || null,
    }).catch((error) => {
      console.warn(
        "Automatic collection announcement notification failed:",
        error?.message || error
      );
    });

    res.status(201).json({
      message: "Collection created successfully.",
      collectionId,
      goalAmount: finalGoalAmount,
      studentContribution,
      assignedStudents: students.length,
      generatedPayments: students.length,
    });
  } catch (error) {
    await connection.rollback();

    console.error("Create collection error:", error);
    res.status(500).json({ message: "Failed to create collection." });
  } finally {
    connection.release();
  }
};

export const updateCollection = async (req, res) => {
  const connection = await db.getConnection();

  try {
    const { id } = req.params;

    const {
      title,
      description,
      goal_amount,
      course = "ALL",
      year_level = "ALL",
      section = "ALL",
      due_date,
      status = "active",
    } = req.body;

    if (!title || !goal_amount || !due_date) {
      return res.status(400).json({
        message: "Title, target amount, and due date are required.",
      });
    }

    const finalGoalAmount = Number(goal_amount);

    if (Number.isNaN(finalGoalAmount) || finalGoalAmount <= 0) {
      return res.status(400).json({
        message: "Target amount must be greater than zero.",
      });
    }

    await connection.beginTransaction();

    const [existingCollections] = await connection.query(
      `
      SELECT
        id,
        course,
        year_level,
        section
      FROM collections
      WHERE id = ?
      `,
      [id]
    );

    if (existingCollections.length === 0) {
      await connection.rollback();

      return res.status(404).json({
        message: "Collection not found.",
      });
    }

    const existingCollection = existingCollections[0];

    const [paidRows] = await connection.query(
      `
      SELECT COUNT(*) AS paid_count
      FROM payments
      WHERE collection_id = ?
        AND status = 'paid'
      `,
      [id]
    );

    const paidCount = Number(paidRows[0].paid_count || 0);

    const targetChanged =
      existingCollection.course !== course ||
      existingCollection.year_level !== year_level ||
      existingCollection.section !== section;

    if (paidCount > 0 && targetChanged) {
      await connection.rollback();

      return res.status(400).json({
        message:
          "You cannot change the target audience after students have already paid.",
      });
    }

    const studentFilters = ["status = 'active'"];
    const studentValues = [];

    if (course !== "ALL") {
      studentFilters.push("course = ?");
      studentValues.push(course);
    }

    if (year_level !== "ALL") {
      studentFilters.push("year_level = ?");
      studentValues.push(year_level);
    }

    if (section !== "ALL") {
      studentFilters.push("section = ?");
      studentValues.push(section);
    }

    const [students] = await connection.query(
      `
      SELECT id
      FROM students
      WHERE ${studentFilters.join(" AND ")}
      `,
      studentValues
    );

    if (students.length === 0) {
      await connection.rollback();

      return res.status(400).json({
        message: "No active students match this collection target.",
      });
    }

    const studentContribution = Number(
      (finalGoalAmount / students.length).toFixed(2)
    );

    await connection.query(
      `
      UPDATE collections
      SET
        title = ?,
        description = ?,
        goal_amount = ?,
        amount = ?,
        course = ?,
        year_level = ?,
        section = ?,
        due_date = ?,
        status = ?
      WHERE id = ?
      `,
      [
        title,
        description || null,
        finalGoalAmount,
        studentContribution,
        course,
        year_level,
        section,
        due_date,
        status,
        id,
      ]
    );

    if (paidCount === 0) {
      await connection.query(
        `
        DELETE FROM payments
        WHERE collection_id = ?
        `,
        [id]
      );

      const paymentValues = students.map((student) => [
        student.id,
        id,
        studentContribution,
        0,
        "pending",
        "cash",
      ]);

      await connection.query(
        `
        INSERT INTO payments (
          student_id,
          collection_id,
          amount_due,
          amount_paid,
          status,
          payment_method
        )
        VALUES ?
        `,
        [paymentValues]
      );
    } else {
      await connection.query(
        `
        UPDATE payments
        SET amount_due = ?
        WHERE collection_id = ?
          AND status IN ('pending', 'overdue')
        `,
        [studentContribution, id]
      );
    }

    await syncCollectionLockStatus(id, connection);

    await connection.commit();

    res.status(200).json({
      message: "Collection updated successfully.",
      goalAmount: finalGoalAmount,
      studentContribution,
      assignedStudents: students.length,
    });
  } catch (error) {
    await connection.rollback();

    console.error("Update collection error:", error);

    res.status(500).json({
      message: "Failed to update collection.",
    });
  } finally {
    connection.release();
  }
};

export const updateCollectionStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, restore = false } = req.body;

    if (!["active", "closed", "archived"].includes(status)) {
      return res.status(400).json({
        message: "Status must be active, closed, or archived.",
      });
    }

    if (status === "archived") {
      await db.query(
        `
        UPDATE collections
        SET
          is_locked = IF(status = 'closed', TRUE, is_locked),
          locked_at = IF(
            status = 'closed',
            COALESCE(locked_at, NOW()),
            locked_at
          ),
          status = 'archived'
        WHERE id = ?
        `,
        [id]
      );
    } else if (status === "closed") {
      await db.query(
        `
        UPDATE collections
        SET
          status = 'closed',
          is_locked = TRUE,
          locked_at = COALESCE(locked_at, NOW())
        WHERE id = ?
        `,
        [id]
      );
    } else if (restore) {
      await db.query(
        `
        UPDATE collections
        SET status = IF(is_locked = TRUE, 'closed', 'active')
        WHERE id = ?
        `,
        [id]
      );
    } else {
      const lockState = await getCollectionLockState(id);

      if (!lockState) {
        return res.status(404).json({ message: "Collection not found." });
      }

      if (lockState.shouldLock) {
        await syncCollectionLockStatus(id);

        return res.status(400).json({
          message:
            "This collection has reached its target goal and cannot be reopened.",
        });
      }

      await db.query(
        `
        UPDATE collections
        SET
          status = 'active',
          is_locked = FALSE,
          locked_at = NULL
        WHERE id = ?
        `,
        [id]
      );
    }

    res.status(200).json({ message: "Collection status updated successfully." });
  } catch (error) {
    console.error("Update collection status error:", error);
    res.status(500).json({ message: "Failed to update collection status." });
  }
};

export const getMyCollections = async (req, res) => {
  try {
    if (!req.user || req.user.role !== "student") {
      return res.status(403).json({
        message: "Only students can access their collections.",
      });
    }

    const { course, yearLevel, section } = req.user;

    const [collections] = await db.query(
      `
      SELECT
        id,
        title,
        description,
        amount,
        course,
        year_level,
        section,
        due_date,
        status,
        is_locked,
        locked_at,
        created_at,
        updated_at
      FROM collections
      WHERE status = 'active'
        AND (course = ? OR course = 'ALL')
        AND (year_level = ? OR year_level = 'ALL')
        AND (section = ? OR section = 'ALL')
      ORDER BY due_date ASC
      `,
      [course, yearLevel, section]
    );

    res.status(200).json(collections);
  } catch (error) {
    console.error("Get my collections error:", error);
    res.status(500).json({
      message: "Failed to retrieve your collections.",
    });
  }
};
