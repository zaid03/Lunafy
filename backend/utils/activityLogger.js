const { db } = require('../config/db');

exports.logActivity = async ({
  action,
  actorType,
  actorId = null,
  message = null,
  meta = null
}) => {
  await db.query(
    `INSERT INTO activity_logs (action, actor_type, actor_id, message, meta)
     VALUES (?, ?, ?, ?, ?)`,
    [action, actorType, actorId, message, meta ? JSON.stringify(meta) : null]
  );
};