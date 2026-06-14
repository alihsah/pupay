import db from "../config/db.js";

export const getCollectionLockState = async (collectionId, queryable = db) => {
  const [collections] = await queryable.query(
    `
    SELECT
      id,
      goal_amount,
      status,
      is_locked,
      locked_at
    FROM collections
    WHERE id = ?
    `,
    [collectionId]
  );

  if (collections.length === 0) {
    return null;
  }

  const [totals] = await queryable.query(
    `
    SELECT COALESCE(SUM(amount_paid), 0) AS total_collected
    FROM payments
    WHERE collection_id = ?
    `,
    [collectionId]
  );

  const collection = collections[0];
  const goalAmount = Number(collection.goal_amount || 0);
  const totalCollected = Number(totals[0]?.total_collected || 0);

  return {
    collection,
    goalAmount,
    totalCollected,
    shouldLock: goalAmount > 0 && totalCollected >= goalAmount,
  };
};

export const syncCollectionLockStatus = async (collectionId, queryable = db) => {
  const lockState = await getCollectionLockState(collectionId, queryable);

  if (!lockState) {
    return null;
  }

  if (lockState.shouldLock) {
    await queryable.query(
      `
      UPDATE collections
      SET
        is_locked = TRUE,
        locked_at = COALESCE(locked_at, NOW()),
        status = IF(status = 'archived', 'archived', 'closed')
      WHERE id = ?
      `,
      [collectionId]
    );
  } else {
    await queryable.query(
      `
      UPDATE collections
      SET
        is_locked = FALSE,
        locked_at = NULL
      WHERE id = ?
      `,
      [collectionId]
    );
  }

  return lockState;
};
