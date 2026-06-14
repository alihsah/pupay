import db from "../config/db.js";

const DEFAULT_PAYMENT_METHOD = "cash";

const calculateStudentContribution = (goalAmount, studentCount) =>
  Number((Number(goalAmount) / studentCount).toFixed(2));

const getAudienceParams = ({ course, year_level, section }) => [
  course,
  course,
  year_level,
  year_level,
  section,
  section,
];

const findMatchingActiveCollectionsForStudent = async (studentId) => {
  const [collections] = await db.query(
    `
    SELECT collections.id
    FROM students
    JOIN collections
      ON collections.status = 'active'
      AND COALESCE(collections.is_locked, 0) = 0
      AND (collections.course = students.course OR collections.course = 'ALL')
      AND (
        collections.year_level = students.year_level
        OR collections.year_level = 'ALL'
      )
      AND (
        collections.section = students.section
        OR collections.section = 'ALL'
      )
    WHERE students.id = ?
      AND students.status = 'active'
    `,
    [studentId]
  );

  return collections;
};

const countMatchingActiveStudents = async (collection, queryable) => {
  const [rows] = await queryable.query(
    `
    SELECT COUNT(*) AS total
    FROM students
    WHERE status = 'active'
      AND (? = 'ALL' OR course = ?)
      AND (? = 'ALL' OR year_level = ?)
      AND (? = 'ALL' OR section = ?)
    `,
    getAudienceParams(collection)
  );

  return Number(rows[0]?.total || 0);
};

const insertMissingPaymentRecords = async (collection, amountDue, queryable) => {
  const [result] = await queryable.query(
    `
    INSERT INTO payments (
      student_id,
      collection_id,
      amount_due,
      amount_paid,
      status,
      payment_method
    )
    SELECT
      students.id,
      ?,
      ?,
      0.00,
      CASE
        WHEN ? < CURDATE() THEN 'overdue'
        ELSE 'pending'
      END,
      ?
    FROM students
    LEFT JOIN payments
      ON payments.student_id = students.id
      AND payments.collection_id = ?
    WHERE students.status = 'active'
      AND (? = 'ALL' OR students.course = ?)
      AND (? = 'ALL' OR students.year_level = ?)
      AND (? = 'ALL' OR students.section = ?)
      AND payments.id IS NULL
    `,
    [
      collection.id,
      amountDue,
      collection.due_date,
      DEFAULT_PAYMENT_METHOD,
      collection.id,
      ...getAudienceParams(collection),
    ]
  );

  return Number(result.affectedRows || 0);
};

const updateUnpaidPaymentAmounts = async (collection, amountDue, queryable) => {
  const [result] = await queryable.query(
    `
    UPDATE payments
    JOIN students
      ON students.id = payments.student_id
    SET payments.amount_due = ?
    WHERE payments.collection_id = ?
      AND payments.status IN ('pending', 'overdue')
      AND (payments.amount_paid IS NULL OR payments.amount_paid = 0)
      AND payments.paid_at IS NULL
      AND students.status = 'active'
      AND (? = 'ALL' OR students.course = ?)
      AND (? = 'ALL' OR students.year_level = ?)
      AND (? = 'ALL' OR students.section = ?)
    `,
    [amountDue, collection.id, ...getAudienceParams(collection)]
  );

  return Number(result.affectedRows || 0);
};

export const syncCollectionPaymentsForAudience = async (collectionId) => {
  const connection = await db.getConnection();

  try {
    await connection.beginTransaction();

    const [collections] = await connection.query(
      `
      SELECT
        id,
        goal_amount,
        amount,
        course,
        year_level,
        section,
        due_date
      FROM collections
      WHERE id = ?
        AND status = 'active'
        AND COALESCE(is_locked, 0) = 0
      FOR UPDATE
      `,
      [collectionId]
    );

    if (collections.length === 0) {
      await connection.commit();

      return {
        collectionId,
        skipped: true,
        reason: "collection_not_active_or_locked",
      };
    }

    const collection = collections[0];
    const goalAmount = Number(collection.goal_amount || 0);
    let amountDue = Number(collection.amount || 0);
    let matchingActiveStudentCount = null;
    let recalculated = false;
    let updatedPaymentCount = 0;

    if (goalAmount > 0) {
      matchingActiveStudentCount = await countMatchingActiveStudents(
        collection,
        connection
      );

      if (matchingActiveStudentCount === 0) {
        await connection.commit();

        return {
          collectionId,
          skipped: true,
          reason: "no_matching_active_students",
        };
      }

      amountDue = calculateStudentContribution(
        goalAmount,
        matchingActiveStudentCount
      );

      await connection.query(
        `
        UPDATE collections
        SET amount = ?
        WHERE id = ?
        `,
        [amountDue, collectionId]
      );

      updatedPaymentCount = await updateUnpaidPaymentAmounts(
        collection,
        amountDue,
        connection
      );
      recalculated = true;
    }

    const createdPaymentCount = await insertMissingPaymentRecords(
      collection,
      amountDue,
      connection
    );

    await connection.commit();

    return {
      collectionId,
      recalculated,
      matchingActiveStudentCount,
      amountDue,
      createdPaymentCount,
      updatedPaymentCount,
    };
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};

export const assignStudentToMatchingActiveCollections = async (studentId) => {
  const collections = await findMatchingActiveCollectionsForStudent(studentId);
  const summary = {
    matchedCollectionCount: collections.length,
    recalculatedCollectionCount: 0,
    createdPaymentCount: 0,
    updatedPaymentCount: 0,
    skippedCollectionCount: 0,
    failedCollectionCount: 0,
  };

  for (const collection of collections) {
    try {
      const result = await syncCollectionPaymentsForAudience(collection.id);

      if (result.skipped) {
        summary.skippedCollectionCount++;
        continue;
      }

      if (result.recalculated) {
        summary.recalculatedCollectionCount++;
      }

      summary.createdPaymentCount += result.createdPaymentCount;
      summary.updatedPaymentCount += result.updatedPaymentCount;
    } catch (error) {
      summary.failedCollectionCount++;
      console.warn(
        `Student collection assignment sync failed for collection ${collection.id}:`,
        error?.message || error
      );
    }
  }

  return {
    assignedCount: summary.createdPaymentCount,
    ...summary,
  };
};
