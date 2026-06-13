import db from "../config/db.js";

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

    const [totals] = await connection.query(
      `
      SELECT COALESCE(SUM(amount_paid), 0) AS total_collected
      FROM payments
      WHERE collection_id = ?
      `,
      [id]
    );

    const totalCollected = Number(totals[0].total_collected || 0);

    if (totalCollected >= finalGoalAmount) {
      await connection.query(
        `
        UPDATE collections
        SET
          is_locked = TRUE,
          locked_at = COALESCE(locked_at, NOW()),
          status = IF(status = 'archived', 'archived', 'closed')
        WHERE id = ?
        `,
        [id]
      );
    } else {
      await connection.query(
        `
        UPDATE collections
        SET
          is_locked = FALSE,
          locked_at = NULL
        WHERE id = ?
        `,
        [id]
      );
    }

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
    const { status } = req.body;

    if (!["active", "closed", "archived"].includes(status)) {
      return res.status(400).json({
        message: "Status must be active, closed, or archived.",
      });
    }

    await db.query(
      `
      UPDATE collections
      SET status = ?
      WHERE id = ?
      `,
      [status, id]
    );

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